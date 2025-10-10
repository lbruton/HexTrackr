# Middleware & Configuration Reference

> Complete documentation for HexTrackr's middleware pipeline and configuration modules

## Overview

HexTrackr's middleware layer provides authentication, security, logging, and request processing capabilities. The middleware stack enforces authentication on all protected routes, applies CSRF protection, implements rate limiting, and provides comprehensive error handling.

**Critical Architecture Note**: HexTrackr **ALWAYS** runs behind an nginx reverse proxy with SSL/TLS termination. The `trust proxy` setting is always enabled to support secure sessions and proper IP detection.

---

## Middleware Execution Order {#execution-order}

Understanding middleware order is critical - middleware executes top-to-bottom, and authentication/security depend on correct ordering.

**Complete Middleware Stack** (from `app/public/server.js`):

1. **Trust Proxy** - Enable Express to read nginx headers (`X-Forwarded-Proto`, `X-Forwarded-For`)
2. **CORS** - Cross-origin resource sharing for API access
3. **Session Management** - SQLite session store with secure cookies
4. **Body Parsing** - JSON and URL-encoded request bodies (50MB limit)
5. **CSRF Protection** - Double-submit cookie pattern (excludes login/status/csrf endpoints)
6. **Rate Limiting** - `/api/*` routes only (100 requests per 15 minutes)
7. **Compression** - Gzip/deflate (only if NOT behind nginx)
8. **Security Headers** - Custom headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
9. **Static File Serving** - Documentation portal, JSDoc, public assets (**blocks `/data` directory**)
10. **Route Handlers** - API endpoints with authentication middleware
11. **Global Error Handler** - Catches all unhandled errors

---

## Authentication & Security Middleware {#authentication}

### Session Management (`sessionMiddleware`)

**Location:** `app/middleware/auth.js` (lines 18-44)
**Since:** v1.0.46 (HEX-133, HEX-128)

SQLite-backed session management with secure cookies requiring HTTPS.

**Configuration:**

```javascript
const sessionMiddleware = session({
    store: new SqliteStore({
        client: db,              // better-sqlite3 connection
        tableName: "sessions",   // Session table name
        ttl: 86400000           // 24 hours in milliseconds
    }),
    secret: process.env.SESSION_SECRET,  // REQUIRED: 32+ characters
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,            // HTTPS REQUIRED (HEX-128)
        httpOnly: true,          // Prevents XSS access
        sameSite: "lax",         // CSRF protection
        maxAge: 24 * 60 * 60 * 1000  // 24 hours
    },
    name: "hextrackr.sid",
    proxy: true                  // ALWAYS true (nginx reverse proxy)
});
```

**Critical Requirements:**

1. **SESSION_SECRET** environment variable:
   - **Minimum length**: 32 characters (server validates on startup)
   - **Generation**: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - **Security**: Never commit to version control
   - **Server behavior**: Refuses to start if missing or too short

2. **HTTPS Requirement** (HEX-128 Fix):
   - `secure: true` means cookies ONLY sent over HTTPS
   - Sessions will NOT work over HTTP (browsers reject cookies)
   - Development access: `https://localhost` or `https://dev.hextrackr.com`
   - Production access: `https://hextrackr.com`
   - **Never use HTTP** - authentication will silently fail

3. **Trust Proxy** (always enabled):
   - `proxy: true` tells Express to trust nginx reverse proxy
   - Required for Express to read `X-Forwarded-Proto: https` header
   - Without this, Express thinks connection is HTTP (breaks secure cookies)
   - See [Trust Proxy Configuration](#trust-proxy) section

**Session Store:**

- **Database**: SQLite at `app/data/sessions.db`
- **Table**: `sessions` (auto-created)
- **Cleanup**: Every 15 minutes (900000ms)
- **Structure**: Session ID (primary key), data (JSON), expiry (timestamp)

### Authentication Protection (`requireAuth`)

**Location:** `app/middleware/auth.js` (lines 52-68)
**Since:** v1.0.46

Route protection middleware that enforces authentication on protected endpoints.

**Behavior:**

```javascript
const requireAuth = (req, res, next) => {
    // Check for active session
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            error: "Authentication required"
        });
    }

    // Attach user object to request
    req.user = {
        id: req.session.userId,
        username: req.session.username,
        role: req.session.role || "user"
    };

    next();
};
```

**Usage Pattern:**

```javascript
// Protect API routes with requireAuth
router.post("/logout", requireAuth, AuthController.logout);
router.post("/change-password", requireAuth, AuthController.changePassword);
router.get("/profile", requireAuth, AuthController.getProfile);
router.get("/preferences", requireAuth, PreferencesController.getAll);
```

**Protected Endpoint Categories:**

- All `/api/vulnerabilities/*` endpoints
- All `/api/tickets/*` endpoints
- All `/api/preferences/*` endpoints
- All `/api/templates/*` endpoints
- All `/api/backup/*` endpoints
- All `/api/kev/*` endpoints (sync, status)
- All `/api/devices/*` endpoints

**Public Endpoints** (no authentication required):

- `POST /api/auth/login` - User login
- `GET /api/auth/status` - Check authentication status
- `GET /api/auth/csrf` - Get CSRF token

### Extended Session ("Remember Me")

**Location:** `app/middleware/auth.js` (lines 75-79)
**Since:** v1.0.46

Extends session duration to 30 days when user checks "Remember Me" on login.

**Usage:**

```javascript
// In login controller after successful authentication
if (req.body.rememberMe) {
    extendSession(req);  // Sets maxAge to 30 days
}
```

---

## CSRF Protection {#csrf}

**Library:** `csrf-sync`
**Implementation:** `app/public/server.js` (lines 195-219)
**Since:** v1.0.46

Double-submit cookie pattern for CSRF protection on all state-changing requests.

**Configuration:**

```javascript
const { csrfSynchronisedProtection, generateToken } = csrfSync({
    getTokenFromRequest: (req) => {
        return req.headers["x-csrf-token"] ||
               req.body?._csrf ||
               req.query?._csrf;
    },
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getTokenFromState: (req) => req.session.csrfToken,
    storeTokenInState: (req, token) => {
        req.session.csrfToken = token;
    },
    size: 128  // Token size in bits
});
```

**Token Generation Endpoint:**

```javascript
// GET /api/auth/csrf
{
    "success": true,
    "csrfToken": "abc123..."  // 128-bit token
}
```

**Client Integration:**

**Step 1**: Get CSRF token before state-changing requests:

```javascript
const response = await fetch("/api/auth/csrf");
const { csrfToken } = await response.json();
```

**Step 2**: Include token in subsequent requests:

```javascript
// Option 1: HTTP Header (recommended)
await fetch("/api/vulnerabilities", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify(data)
});

// Option 2: Request body
await fetch("/api/vulnerabilities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, _csrf: csrfToken })
});

// Option 3: Query parameter
await fetch(`/api/vulnerabilities?_csrf=${csrfToken}`, {
    method: "POST",
    body: JSON.stringify(data)
});
```

**Exempted Endpoints** (no CSRF token required):

- `POST /api/auth/login` - Initial login (token retrieved after)
- `GET /api/auth/csrf` - Token generation endpoint
- `GET /api/auth/status` - Status check

**All other POST/PUT/DELETE requests require valid CSRF token.**

---

## Trust Proxy Configuration {#trust-proxy}

**Setting:** `app.set("trust proxy", true)`
**Location:** `app/public/server.js` (line 73)
**Since:** v1.0.46 (HEX-128 Fix)

**Critical Importance**: HexTrackr **ALWAYS** runs behind nginx reverse proxy. Trust proxy is **ALWAYS** enabled.

**Why This Matters:**

1. **HTTPS Detection**:
   - nginx terminates SSL/TLS on port 443
   - nginx forwards HTTP to Express on port 8080
   - nginx sets `X-Forwarded-Proto: https` header
   - Express needs `trust proxy: true` to read this header
   - Without this, Express thinks connection is HTTP → secure cookies fail

2. **Session Security** (HEX-128):
   - Session cookies have `secure: true` flag (HTTPS only)
   - If Express doesn't detect HTTPS, cookies aren't set
   - User appears logged in (frontend) but session doesn't work (backend)
   - **Result**: Silent authentication failure

3. **Rate Limiting**:
   - Rate limiting needs real client IP (not nginx IP)
   - nginx sets `X-Forwarded-For` header with client IP
   - Express needs `trust proxy: true` to read this header
   - Without this, all requests appear from nginx's IP → rate limit breaks

**Network Flow:**

```text
Client (192.168.1.100)
    ↓ HTTPS (443)
nginx (reverse proxy)
    ↓ Sets headers:
    ↓   X-Forwarded-Proto: https
    ↓   X-Forwarded-For: 192.168.1.100
    ↓ HTTP (8080)
Express (with trust proxy: true)
    ↓ Reads headers
    ↓ req.protocol = "https"
    ↓ req.ip = "192.168.1.100"
Session cookies work ✅
Rate limiting works ✅
```

**Related Settings:**

```javascript
// Session middleware (app/middleware/auth.js:43)
proxy: true  // Trust proxy for session security

// Rate limiting (app/middleware/security.js:161)
trust: () => true  // Trust proxy for IP detection
```

---

## Security Middleware {#security}

### PathValidator Class

**Location:** `app/middleware/security.js` (lines 36-131)
**Since:** v1.0.22

Prevents path traversal attacks in file operations.

**Safe File Operation Methods:**

```javascript
const { PathValidator } = require("../middleware/security");

// Safe file read (throws on path traversal)
try {
    const content = PathValidator.safeReadFileSync(userProvidedPath);
} catch (error) {
    // error.message: "Path traversal detected" or "Invalid file path"
}

// Other safe methods:
PathValidator.safeWriteFileSync(filePath, data, options)
PathValidator.safeReaddirSync(dirPath, options)
PathValidator.safeStatSync(filePath)
PathValidator.safeExistsSync(filePath)
PathValidator.safeUnlinkSync(filePath)
```

**Security Features:**

- Checks for `../` and `..\\` patterns
- Validates all path components
- Throws errors on path traversal attempts
- Normalizes paths before operations

### Security Headers Middleware

**Location:** `app/middleware/security.js` (lines 172-185)
**Applied:** All responses

**Headers Set:**

```javascript
{
    "X-Content-Type-Options": "nosniff",      // Prevent MIME sniffing
    "X-Frame-Options": "DENY",                // Prevent clickjacking
    "X-XSS-Protection": "1; mode=block"       // Legacy XSS protection
}
```

**Note**: HexTrackr does **NOT** use Helmet.js (custom headers instead).

### Rate Limiting

**Location:** `app/middleware/security.js` (lines 152-163)
**Applied:** `/api/*` routes only

**Configuration:**

```javascript
{
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,                  // 100 requests per window
    standardHeaders: true,      // Send rate limit info in headers
    legacyHeaders: false,
    trust: () => true          // Trust proxy for client IP
}
```

### CORS Middleware

**Location:** `app/middleware/security.js` (lines 138-145)
**Configuration Source:** `utils/constants.js`

**Settings:**

```javascript
{
    origin: CORS_ORIGINS,      // Allowed origins
    methods: CORS_METHODS,     // Allowed HTTP methods
    allowedHeaders: CORS_HEADERS,  // Allowed headers
    credentials: true          // Allow cookies
}
```

### Input Validation Middleware

**Location:** `app/middleware/security.js` (lines 282-304)

Validates query parameters for injection attacks.

**Checks:**

- SQL injection patterns: `['";<>]`
- XSS patterns: `<script|javascript:|vbscript:|onload=|onerror=`

---

## Validation Middleware {#validation}

**Location:** `app/middleware/validation.js`

### Generic Validation Factory

**Function:** `createValidationMiddleware(validatorFn, sourceProperty)`
**Lines:** 23-53

Creates custom validation middleware for any request property.

**Usage:**

```javascript
const { createValidationMiddleware } = require("../middleware/validation");

// Create custom validator
const validateCustomInput = createValidationMiddleware(
    (data) => {
        const errors = [];
        if (!data.field1) errors.push("field1 is required");
        return { success: errors.length === 0, errors };
    },
    "body"  // Validate req.body
);

// Use in route
router.post("/custom", validateCustomInput, customController);
```

### File Upload Middleware

**CSV Upload** (`csvUpload`):

```javascript
// Lines 63-87
{
    destination: "uploads/",
    fileSize: 100 * 1024 * 1024,  // 100MB
    allowedTypes: ["text/csv", "application/csv", "text/plain", "application/vnd.ms-excel"],
    allowedExtensions: [".csv", ".txt"]
}
```

**JSON Upload** (`jsonUpload`):

```javascript
// Lines 92-114
{
    destination: "uploads/",
    fileSize: 100 * 1024 * 1024,  // 100MB
    allowedTypes: ["application/json", "text/json", "text/plain"],
    allowedExtensions: [".json"]
}
```

### Request Body Validators

- **`validateTicketInput`** (lines 157-160) - Ticket creation/update
- **`validateVulnerabilityInput`** (lines 165-168) - Vulnerability creation/update
- **`validateCSVImportData(type)`** (lines 173-219) - CSV import validation

### Query Parameter Validators

- **`validatePaginationParams`** (lines 228-247) - Sanitizes `page` and `limit`
- **`validateDateRangeParams`** (lines 252-295) - Validates date ranges
- **`validateSearchQuery`** (lines 414-440) - Sanitizes search queries (200 char max)
- **`validateFilterParams`** (lines 445-481) - Validates severity/status/vendor filters
- **`validateVendorParam`** (lines 383-405) - Sanitizes vendor parameter

### ID Parameter Validators

- **`validateNumericId(paramName)`** (lines 304-339) - Validates positive integer IDs

---

## Error Handling Middleware {#error-handling}

**Location:** `app/middleware/errorHandler.js`

### Global Error Handler

**Function:** `globalErrorHandler(err, req, res, next)`
**Lines:** 14-78

Centralized error handler for all uncaught errors.

**Features:**

- Error context logging (method, URL, userAgent, timestamp, sessionId)
- Error type detection (ValidationError, CastError, SQLITE_ errors, path traversal)
- Environment-aware error details (verbose in development)
- Prevents double response if headers already sent

**Error Type Mapping:**

```javascript
ValidationError → 400 Bad Request
CastError → 400 Bad Request
SQLITE_CONSTRAINT → 400 Bad Request
SQLITE_BUSY → 503 Service Unavailable
SQLITE_CORRUPT → 500 Internal Server Error
Path traversal → 403 Forbidden
Custom err.statusCode → Uses provided code
Default → 500 Internal Server Error
```

### 404 Handler

**Function:** `notFoundHandler(req, res)`
**Lines:** 85-108

**Development Mode**: Includes list of available routes for debugging

### Error Formatters

**Database Errors** (`formatDatabaseError`):

```javascript
// Lines 115-135
SQLITE_CONSTRAINT → "Database constraint violation"
SQLITE_BUSY → "Database is busy"
SQLITE_LOCKED → "Database is locked"
SQLITE_CORRUPT → "Database corruption detected"
"no such table" → "Database may need initialization"
"no such column" → "Database may need migration"
```

**Validation Errors** (`formatValidationError`):
- Lines 142-160
- Supports multiple validation errors, Joi-style errors, single errors

### Specialized Error Handlers

- **`asyncErrorHandler(fn)`** (lines 167-171) - Wrapper for async route handlers
- **`handleDatabaseError(err, res, operation, context)`** (lines 181-202)
- **`handleFileError(err, res, operation)`** (lines 211-240)
- **`handleCSVError(err, res)`** (lines 247-263)
- **`handleValidationError(message, res, details)`** (lines 271-285)

**Async Error Handler Usage:**

```javascript
const { asyncErrorHandler } = require("../middleware/errorHandler");

router.get("/async-route", asyncErrorHandler(async (req, res) => {
    const data = await someAsyncOperation();
    res.json({ success: true, data });
    // Errors automatically caught and passed to global error handler
}));
```

---

## Logging Middleware {#logging}

**Location:** `app/middleware/logging.js`

### LoggingManager Class

**Lines:** 18-203

Structured logging with environment-aware log levels and performance monitoring.

**Log Levels:**

```javascript
ERROR (0): Always logged
WARN  (1): Production default
INFO  (2): Informational
DEBUG (3): Development default
```

**Core Methods:**

```javascript
// Basic logging
LoggingManager.error(message, data, requestId)
LoggingManager.warn(message, data, requestId)
LoggingManager.info(message, data, requestId)
LoggingManager.debug(message, data, requestId)

// Performance timing
const timerId = LoggingManager.startTimer("operation", requestId);
LoggingManager.endTimer(timerId, additionalData);  // Warns if >1000ms

// Database operation logging
LoggingManager.logDatabaseOperation(operation, query, duration, error, requestId);
// Warns if duration > 500ms

// Batch progress logging
LoggingManager.logBatchProgress(operation, current, total, stats, requestId);
// Logs every 10% or 1000 items

// Import/export logging
LoggingManager.logImportProgress(phase, stats, requestId);
LoggingManager.logImportCompletion(operation, finalStats, duration, requestId);

// Memory monitoring
LoggingManager.logMemoryUsage(operation, requestId);

// Performance summary
LoggingManager.logPerformanceSummary(operation, stats, requestId);
```

### Request Logging Middleware

**Function:** `requestLoggingMiddleware(req, res, next)`
**Lines:** 212-251

**Features:**

- Generates unique requestId (16-char hex)
- Logs incoming request with IP and User-Agent
- Logs response with statusCode, duration, contentLength
- Warns on 4xx/5xx responses or slow requests (>2000ms)

**Log Format:**

```text
[2025-10-09 15:15:00] INFO [abc123def4567890] GET /api/vulnerabilities 200 45ms 2048 bytes
[2025-10-09 15:15:01] WARN [fedcba0987654321] POST /api/import 500 1523ms - Error: File too large
```

### Error Logging Middleware

**Function:** `errorLoggingMiddleware(err, req, res, next)`
**Lines:** 257-276

Logs all errors with request context before passing to global error handler.

**Note**: HexTrackr does **NOT** use Morgan (custom LoggingManager instead).

---

## Configuration Modules {#configuration}

### Middleware Configuration

**Location:** `app/config/middleware.js`

**Exported Configurations:**

1. **`cors`** (lines 31-36) - CORS settings from constants
2. **`rateLimit`** (lines 42-48) - Rate limiting settings
3. **`bodyParser`** (lines 54-62) - JSON/URL-encoded parsing (50MB limit)
4. **`upload`** (lines 68-80) - Multer file upload settings
5. **`security`** (lines 86-92) - Security headers
6. **`compression`** (lines 98-104) - Gzip/deflate settings
7. **`websocket`** (lines 110-116) - Socket.io CORS

---

## Environment Variables {#environment}

### Required Variables

| Variable | Description | Validation |
|----------|-------------|------------|
| `SESSION_SECRET` | Session encryption key | **REQUIRED**: 32+ characters, server exits if missing |
| `PORT` | Server port | Default: `8080` |
| `DATABASE_PATH` | SQLite file path | Default: `app/data/hextrackr.db` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `TRUST_PROXY` | Trust proxy mode | `true` (ALWAYS in code) |
| `ALLOWED_ORIGINS` | CORS whitelist (comma-separated) | `http://localhost:8080` |
| `MAX_FILE_SIZE` | Upload size limit | `100MB` |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

---

## Session Management Details {#sessions}

**Store**: SQLite database (`app/data/sessions.db`)
**Table**: `sessions` (auto-created)
**Cleanup**: Every 15 minutes (900000ms)

**Session Object Structure:**

```javascript
{
    userId: 1,
    username: "admin",
    role: "user",
    csrfToken: "abc123...",  // CSRF token stored in session
    cookie: {
        originalMaxAge: 86400000,  // 24 hours (or 30 days if Remember Me)
        expires: "2025-10-10T15:15:00.000Z",
        secure: true,
        httpOnly: true,
        sameSite: "lax"
    }
}
```

**Note**: HexTrackr uses **SQLite session store only**. Redis is NOT supported.

---

## Security Best Practices {#security-practices}

### Input Validation

All user input validated using multiple layers:

1. **Type Checking**: Ensure correct data types
2. **Range Validation**: Check numeric ranges
3. **Pattern Matching**: Regex for formats (email, URL, CVE)
4. **Sanitization**: Remove/escape dangerous characters
5. **Length Limits**: Prevent buffer overflows

### SQL Injection Prevention

All database queries use parameterized statements:

```javascript
// ✅ Safe query
db.get("SELECT * FROM users WHERE id = ?", [userId]);

// ❌ DANGEROUS - never use string concatenation
// db.get("SELECT * FROM users WHERE id = " + userId);
```

### Path Traversal Prevention

```javascript
const { PathValidator } = require("../middleware/security");

// ✅ Always validate file paths
const safePath = PathValidator.validatePath(userInput);
const content = PathValidator.safeReadFileSync(safePath);
```

---

**Version**: 1.0.54
**Last Updated**: 2025-10-09
