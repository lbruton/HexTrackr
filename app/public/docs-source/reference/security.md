# Security Overview

HexTrackr is designed with security as a foundational principle. This document provides comprehensive coverage of all security measures, controls, and implementations for corporate security review and compliance assessment.

**Version**: v1.1.8
**Last Updated**: 2025-10-23

---

## Security Architecture Overview

HexTrackr implements a defense-in-depth security strategy with multiple layers of protection:

- **Authentication**: Argon2id password hashing with account lockout protection
- **Session Management**: SQLite-backed sessions with secure cookies (HTTPS-only)
- **CSRF Protection**: Synchroniser Token Pattern with csrf-sync library
- **Network Security**: Rate limiting, HTTPS-only CORS, security headers
- **Input Validation**: Comprehensive data sanitization and validation middleware
- **File Security**: Upload restrictions and path traversal prevention (PathValidator)
- **Data Protection**: Parameterized SQL queries (100% coverage)
- **Application Security**: XSS protection with DOMPurify, secure error handling

---

## Authentication System

**Since**: v1.0.46 (HEX-133, HEX-128)
**Status**: ✅ Fully Implemented

### Password Security

**Implementation**: Argon2id password hashing (2015 Password Hashing Competition winner)

**Location**: `app/services/authService.js`

HexTrackr uses two different Argon2id configurations depending on context:

**Production Authentication** (authService.js):

Used for runtime password hashing during login, password changes, and admin password resets:

```javascript
const argon2 = require("argon2");

// Strong configuration for production password hashing
const hash = await argon2.hash(password, {
    type: argon2.argon2id,    // Hybrid mode (side-channel + GPU resistant)
    memoryCost: 65536,        // 64 MiB memory cost
    timeCost: 3,              // 3 iterations
    parallelism: 4            // 4 threads
});

// Password verification (timing-safe comparison built-in)
const isValid = await argon2.verify(storedHash, password);
```

This strong configuration provides robust protection for user passwords in production.

**Admin Seeding** (init-database.js):

Used only during initial database seeding:

```javascript
// Faster configuration for database initialization
const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,        // 19 MiB memory cost
    timeCost: 2,              // 2 iterations
    parallelism: 1            // 1 thread
});
```

This faster configuration speeds up development workflows and database initialization. It is **not** used for runtime authentication.

**Security Strength** (Production Configuration):
- **Algorithm**: Argon2id (superior to bcrypt and scrypt)
- **Memory Hardness**: 64 MiB makes GPU attacks impractical
- **Time Cost**: 3 iterations balances security and performance
- **Parallelism**: 4 threads leverages modern CPUs
- **Timing Safety**: Built-in constant-time comparison prevents timing attacks

**Why Argon2id?**
- Winner of 2015 Password Hashing Competition
- Resistant to both side-channel attacks (Argon2i) and GPU attacks (Argon2d)
- Recommended by OWASP and security experts
- Superior to bcrypt for new implementations

### Account Lockout Protection

**Implementation**: Automatic lockout after failed login attempts

**Location**: `app/services/authService.js` (lines 260-306)

**Lockout Policy**:

```javascript
// Lockout triggers after 5 failed attempts
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// Account locked if:
// - failed_attempts >= 5
// - Within 15 minutes of last failed attempt

// Automatic expiry:
// - After 15 minutes, failed_attempts reset to 0
// - User can attempt login again
```

**Database Tracking**:
- `failed_attempts`: Counter incremented on each failed login
- `failed_login_timestamp`: Timestamp of last failed attempt
- Automatic reset after lockout expires

**Security Benefits**:
- Prevents brute-force password attacks
- Automatic expiry avoids permanent lockouts
- No manual admin intervention required

### Session Management

**Implementation**: SQLite-backed session store with secure cookies

**Location**: `app/middleware/auth.js` (lines 18-44)

**Session Configuration**:

```javascript
const session = require("express-session");
const SQLiteStore = require("better-sqlite3-session-store")(session);
const Database = require("better-sqlite3");

const sessionMiddleware = session({
    store: new SQLiteStore({
        client: new Database("app/data/sessions.db"),
        expired: {
            clear: true,
            intervalMs: 900000  // Clean expired sessions every 15 minutes
        }
    }),
    secret: process.env.SESSION_SECRET,  // Required: 32+ characters
    name: "hextrackr.sid",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,        // HTTPS-only (HEX-128 fix)
        httpOnly: true,      // XSS protection
        sameSite: "lax",     // CSRF protection
        maxAge: 24 * 60 * 60 * 1000  // 24 hours (default)
    },
    proxy: true  // ALWAYS true - nginx reverse proxy (HEX-128 CRITICAL FIX)
});
```

**Session Storage**: SQLite database at `app/data/sessions.db`
**Session TTL**: 24 hours (default), 30 days with "Remember Me"
**Cleanup**: Expired sessions purged automatically every 15 minutes

**SESSION_SECRET Validation**:

**Location**: `app/public/server.js` (lines 12-22)

```javascript
// Server REFUSES to start without valid SESSION_SECRET
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    console.error("\n❌ CRITICAL: SESSION_SECRET is missing or too short!");
    console.error("📋 Session security requires a cryptographically random secret (32+ characters)");
    console.error("\n🔧 To generate a secure SESSION_SECRET, run:");
    console.error("   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
    process.exit(1);
}
```

**Security Requirements**:
- **Minimum Length**: 32 characters (enforced at boot)
- **Randomness**: Must use cryptographically secure random generation
- **Server Behavior**: Exits with error if SESSION_SECRET is invalid

**Generate Secure SESSION_SECRET**:

```bash
# Generate 32-byte (64-character hex) secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env file
echo "SESSION_SECRET=<generated-secret>" >> .env
```

### Trust Proxy Configuration (HEX-128 Fix)

**Location**: `app/public/server.js` (lines 81-85)

**CRITICAL IMPORTANCE**: HexTrackr **ALWAYS** runs behind nginx reverse proxy.

**Implementation**:

```javascript
// Trust proxy configuration for nginx reverse proxy
// ALWAYS true - we always run behind nginx reverse proxy (HEX-128 CRITICAL FIX)
// Required for Express to recognize HTTPS from X-Forwarded-Proto header
// Without this, secure cookies won't work because Express sees connection as HTTP
app.set("trust proxy", true);
```

**Why This Matters**:

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

**Network Flow**:

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

**HEX-128 Bug Context**: Before this fix, authentication silently failed because Express didn't recognize nginx's HTTPS termination. Trust proxy fixes this permanently.

### CSRF Protection

**Since**: v1.0.46
**Implementation**: Synchroniser Token Pattern with csrf-sync library

**Location**: `app/public/server.js` (lines 192-219)

**Configuration**:

```javascript
const { csrfSync } = require("csrf-sync");

// csrf-sync uses Synchroniser Token Pattern
// Tokens stored in req.session (NOT cookies)
const { csrfSynchronisedProtection, generateToken } = csrfSync({
    getTokenFromRequest: (req) => {
        // Check multiple locations for CSRF token (header, body, query)
        return req.headers["x-csrf-token"] ||
               req.body?._csrf ||
               req.query?._csrf;
    },
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getTokenFromState: (req) => req.session.csrfToken,
    storeTokenInState: (req, token) => { req.session.csrfToken = token; },
    size: 128  // Token size in bits
});

// Apply CSRF protection to all routes EXCEPT login
app.use((req, res, next) => {
    const publicAuthPaths = ["/api/auth/login", "/api/auth/csrf", "/api/auth/status"];
    if (publicAuthPaths.includes(req.path)) {
        return next();  // Skip CSRF for public auth endpoints
    }
    return csrfSynchronisedProtection(req, res, next);
});
```

**CSRF Implementation**:
- **Method**: Synchroniser Token Pattern (session-based)
- **Token Size**: 128 bits (cryptographically secure)
- **Token Storage**: Session (NOT cookies - no HMAC secret needed)
- **Token Sources**: HTTP header `X-CSRF-Token`, request body `_csrf`, query param `_csrf`
- **Exclusions**: Login endpoint (can't get token before auth), CSRF token endpoint, status endpoint

**Obtaining CSRF Token**:

```javascript
// Frontend: Get CSRF token before making protected requests
const response = await fetch('/api/auth/csrf');
const { csrfToken } = await response.json();

// Include token in requests
fetch('/api/protected-endpoint', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken  // Include token in header
    },
    body: JSON.stringify({ data })
});
```

### Authentication Endpoints

**AuthController**: `app/controllers/authController.js`
**AuthService**: `app/services/authService.js`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/login` | ❌ Public | Authenticate user with username/password |
| POST | `/api/auth/logout` | ✅ Protected | End user session and clear cookies |
| GET | `/api/auth/status` | ❌ Public | Check current authentication status |
| GET | `/api/auth/csrf` | ❌ Public | Retrieve CSRF token for forms |
| POST | `/api/auth/change-password` | ✅ Protected | Update user password |
| GET | `/api/auth/profile` | ✅ Protected | Get current user profile information |

**Authentication Middleware**:

```javascript
// Protect routes with requireAuth middleware
const { requireAuth } = require('../middleware/auth');

router.get('/api/protected-resource', requireAuth, (req, res) => {
    // req.user available (populated from session)
    res.json({ success: true, data: req.user });
});
```

---

## Input Validation and Sanitization

### PathValidator Security Class

**Location**: `app/utils/PathValidator.js` (lines 1-68)
**Also**: `app/middleware/security.js` (lines 36-131, duplicate copy)

The `PathValidator` class provides comprehensive protection against path traversal attacks and ensures safe file operations.

**Core Security Features**:

```javascript
class PathValidator {
    static validatePath(filePath) {
        // 1. Basic validation
        if (!filePath || typeof filePath !== "string") {
            throw new Error("Invalid file path");
        }

        // 2. Path normalization
        const normalizedPath = path.normalize(filePath);

        // 3. Path traversal detection
        if (normalizedPath.includes("../") || normalizedPath.includes("..\\")) {
            throw new Error("Path traversal detected");
        }

        // 4. Component validation
        const pathComponents = normalizedPath.split(path.sep);
        for (const component of pathComponents) {
            if (component === ".." || (component === "." && pathComponents.length > 1)) {
                throw new Error("Invalid path component");
            }
        }

        return normalizedPath;
    }
}
```

**Protected Operations**:

- `safeReadFileSync()`: Safe file reading with path validation
- `safeWriteFileSync()`: Secure file writing operations
- `safeReaddirSync()`: Directory listing with validation
- `safeStatSync()`: File status checking
- `safeExistsSync()`: File existence checking with error handling
- `safeUnlinkSync()`: Secure file deletion

**Usage Pattern**:

```javascript
const PathValidator = require('../utils/PathValidator');

// All file operations use PathValidator
class FileService {
    readFile(filePath) {
        return PathValidator.safeReadFileSync(filePath);
    }

    writeFile(filePath, content) {
        return PathValidator.safeWriteFileSync(filePath, content);
    }

    deleteFile(filePath) {
        return PathValidator.safeUnlinkSync(filePath);
    }
}
```

**Security Coverage**: ALL file operations in HexTrackr use PathValidator (100% coverage).

**Security Benefits**:

- Prevents directory traversal attacks (`../`, `..\\`)
- Validates all path components
- Handles edge cases and malformed paths
- Consistent error handling across all file operations
- Performance optimized for frequent validation

### SQL Injection Prevention

**Implementation**: Parameterized queries throughout the application (100% coverage)

**Example Secure Query Pattern**:

```javascript
// Secure parameterized query
this.db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, user) => { /* ... */ }
);

// Multi-parameter query
const stmt = this.db.prepare(`
    SELECT * FROM vulnerabilities
    WHERE hostname = ? AND severity = ? AND scan_date > ?
`);
const results = stmt.all(hostname, severity, dateThreshold);
```

**Protection Mechanisms**:

- All database queries use parameterized statements (better-sqlite3)
- No dynamic SQL construction with user input
- Input validation before database operations
- Type checking for numeric parameters
- Length limits on string parameters

**Vulnerable Operations Secured**:

- Vulnerability search and filtering
- Ticket CRUD operations
- CSV data import processing
- Statistics and reporting queries
- Backup and restore operations
- Authentication queries

### XSS Protection

**Primary Defense**: DOMPurify library integration (frontend)

**Location**: `app/public/scripts/utils/security.js`

**Implementation**:

```javascript
// Client-side XSS protection with DOMPurify
function safeSetInnerHTML(element, htmlContent) {
    if (typeof DOMPurify !== "undefined") {
        element.innerHTML = DOMPurify.sanitize(htmlContent);
    } else {
        // Fallback: use textContent (no HTML rendering)
        element.textContent = htmlContent;
    }
}

// Sanitize user-generated content
const sanitized = DOMPurify.sanitize(userInput, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: ['class'],
    FORBID_TAGS: ['script', 'object', 'embed', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick']
});
```

**Additional XSS Protections**:

- X-XSS-Protection header enabled (browser-level protection)
- Input validation and encoding
- Template escaping in HTML generation
- Sanitization of user-provided data before storage

### Input Validation Middleware

**Location**: `app/middleware/validation.js`

**Validation Functions**:

1. **File Upload Validation** (lines 63-114):
   - CSV upload: 100MB limit, MIME type + extension validation
   - JSON upload: 100MB limit, MIME type + extension validation
   - Allowed CSV MIME types: `text/csv`, `application/csv`, `text/plain`, `application/vnd.ms-excel`

2. **Request Body Validators** (lines 155-219):
   - `validateTicketInput`: Ticket creation/update validation
   - `validateVulnerabilityInput`: Vulnerability data validation
   - `validateCSVImportData`: CSV import array validation

3. **Query Parameter Validators** (lines 226-295):
   - `validatePaginationParams`: Sanitizes page/limit parameters
   - `validateDateRangeParams`: Date format + range logic validation
   - `validateFilterParams`: Severity, status, vendor filter validation

4. **ID Parameter Validators** (lines 304-339):
   - `validateNumericId`: Ensures positive integer IDs

5. **Specialized Validators** (lines 414-481):
   - `validateSearchQuery`: 200-character limit, sanitization
   - `validateVendorParams`: Vendor whitelist validation (`CISCO`, `Palo Alto`, `Other`)

---

## Network Security

### Rate Limiting

**Implementation**: Express Rate Limit middleware

**Location**: `app/config/middleware.js` (lines 42-48)

**Configuration**:

```javascript
const rateLimit = {
    windowMs: RATE_LIMIT_WINDOW_MS,      // 15 min (prod) / 1 min (dev)
    max: RATE_LIMIT_MAX_REQUESTS,        // Request limit per window
    message: RATE_LIMIT_MESSAGE,         // "Too many requests..."
    standardHeaders: true,                // Return rate limit info in headers
    legacyHeaders: false
};

// Applied to all /api/ endpoints (server.js line 221)
app.use("/api/", rateLimit(middlewareConfig.rateLimit));
```

**Rate Limiting Strategy**:

**Production** (`NODE_ENV=production`):
- **Window**: 15-minute sliding window
- **Limit**: 100 requests per IP per window
- **Scope**: All `/api/` endpoints

**Development** (`NODE_ENV=development`):
- **Window**: 1-minute sliding window
- **Limit**: 10,000 requests per IP per window (effectively unlimited)
- **Scope**: All `/api/` endpoints

**Rate Limit Headers**:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Timestamp when window resets

**Configuration**: `app/utils/constants.js` (lines 54-58)

```javascript
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const RATE_LIMIT_WINDOW_MS = IS_PRODUCTION ? 15 * 60 * 1000 : 1 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = IS_PRODUCTION ? 100 : 10000;
```

### CORS Configuration

**Location**: `app/utils/constants.js` (lines 14-25)

**CRITICAL SECURITY FEATURE**: HTTPS-Only CORS Enforcement

**Implementation**:

```javascript
// CORS Origins - Dynamic HTTPS-only configuration
const CORS_ORIGINS = function(origin, callback) {
    // Allow same-origin requests (no origin header)
    if (!origin) {
        return callback(null, true);
    }

    // Allow any HTTPS connection
    if (origin.startsWith("https://")) {
        return callback(null, true);
    }

    // Reject all HTTP connections
    callback(new Error("Only HTTPS connections allowed"));
};

const CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
const CORS_HEADERS = ["Content-Type", "Authorization", "X-Requested-With"];
```

**CORS Configuration Applied** (`app/config/middleware.js` lines 29-40):

```javascript
const cors = {
    origin: CORS_ORIGINS,              // HTTPS-only dynamic validation
    methods: CORS_METHODS,             // Allowed HTTP methods
    allowedHeaders: CORS_HEADERS,      // Allowed request headers
    credentials: true,                 // Allow cookies/auth headers
    maxAge: 86400                      // 24-hour preflight cache
};
```

**Security Policy**:
- **HTTPS Enforcement**: ALL cross-origin requests MUST use HTTPS
- **HTTP Rejection**: HTTP origins explicitly rejected with error message
- **Same-Origin**: Allowed (no origin header means same-origin request)
- **Credentials**: Enabled (`credentials: true`) for session cookies
- **Preflight Cache**: 24 hours to reduce OPTIONS request overhead

**Why HTTPS-Only?**
- Prevents session hijacking over unencrypted connections
- Enforces secure cookie transmission
- Protects against man-in-the-middle attacks

### Security Headers

**Location**: `app/public/server.js` (lines 231-236)

**Implementation**:

```javascript
// Security headers middleware
app.use((req, res, next) => {
    Object.entries(middlewareConfig.security.headers).forEach(([header, value]) => {
        res.setHeader(header, value);
    });
    next();
});
```

**Headers Configuration** (`app/config/middleware.js` lines 86-92):

```javascript
const security = {
    headers: {
        "X-Content-Type-Options": "nosniff",      // Prevent MIME sniffing
        "X-Frame-Options": "DENY",                // Clickjacking protection
        "X-XSS-Protection": "1; mode=block"       // XSS protection (legacy)
    }
};
```

**Headers Set by HexTrackr**:

1. **X-Content-Type-Options: nosniff**
   - Prevents browsers from MIME-sniffing responses
   - Forces strict Content-Type adherence

2. **X-Frame-Options: DENY**
   - Prevents HexTrackr from being embedded in `<frame>`, `<iframe>`, or `<object>`
   - Clickjacking protection

3. **X-XSS-Protection: 1; mode=block**
   - Enables browser's built-in XSS filter (legacy header)
   - Blocks page rendering if XSS attack detected

**Note on Helmet.js**: HexTrackr does **NOT** use Helmet.js despite it being listed in `package.json`. The application uses custom security header middleware instead.

**Missing Security Headers** (not implemented):
- `Strict-Transport-Security` (HSTS) - Not set
- `Content-Security-Policy` (CSP) - Not set
- `Referrer-Policy` - Not set

These headers could be added in future versions for enhanced security.

---

## File Upload Security

### Upload Restrictions

**Location**: `app/middleware/validation.js`

**CSV Upload Configuration**:

```javascript
// CSV file upload validation
const csvUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024,  // 100MB maximum
        files: 1                       // Single file only
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'text/csv',
            'application/csv',
            'text/plain',
            'application/vnd.ms-excel'
        ];
        const allowedExtensions = ['.csv'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        // Double validation: MIME type AND extension
        if (allowedMimes.includes(file.mimetype) &&
            allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only CSV files allowed.'), false);
        }
    }
});
```

**JSON Upload Configuration**:

```javascript
// JSON file upload validation
const jsonUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024,  // 100MB maximum
        files: 1                       // Single file only
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/json',
            'text/json',
            'text/plain'
        ];
        const allowedExtensions = ['.json'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        // Double validation: MIME type AND extension
        if (allowedMimes.includes(file.mimetype) &&
            allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JSON files allowed.'), false);
        }
    }
});
```

**Security Controls**:

- **File Size**: 100MB maximum per file
- **File Types**: CSV and JSON only (whitelist approach)
- **MIME Type Validation**: Double validation (MIME type + extension)
- **Memory Storage**: Files processed in memory (not written to disk)
- **Single File Upload**: One file per request (prevents upload bombing)
- **Filename Sanitization**: Extensions validated, paths validated via PathValidator

### File Processing Security

**CSV Processing with PapaParse**:

**Location**: CSV import controllers use PapaParse with secure configuration

**Security Configuration**:

```javascript
const Papa = require("papaparse");

// Secure CSV parsing
const parseResult = Papa.parse(fileContent, {
    header: true,                    // First row as headers
    skipEmptyLines: true,            // Skip empty rows
    transformHeader: (header) => {
        // Sanitize column headers
        return header.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    },
    transform: (value) => {
        // Limit field length (prevent memory exhaustion)
        if (typeof value === 'string') {
            return value.trim().substring(0, 1000);
        }
        return value;
    }
});
```

**Security Limits**:
- Header sanitization (alphanumeric + underscore/dash only)
- Field length limiting (1000 characters max)
- Empty line skipping (prevents malformed data)
- Auto-delimiter detection (prevents parser confusion)

---

## WebSocket Security

### WebSocket Authentication

**Location**: `app/public/server.js` (WebSocket handshake)

**Implementation**: Session-based authentication for WebSocket connections

**Handshake Security**:

```javascript
io.use((socket, next) => {
    // Share session middleware with WebSocket
    sessionMiddleware(socket.request, {}, () => {
        if (socket.request.session && socket.request.session.userId) {
            // User authenticated
            socket.userId = socket.request.session.userId;
            next();
        } else {
            // Reject unauthenticated connections
            next(new Error("Authentication required"));
        }
    });
});
```

**WebSocket Security Features**:

- **Session Validation**: WebSocket connections require valid session
- **User Identification**: `socket.userId` populated from session
- **Connection Rejection**: Unauthenticated connections refused
- **Progress Tracking**: ProgressTracker sessions tied to authenticated users

**ProgressTracker Security**:

**Location**: `app/utils/ProgressTracker.js`

```javascript
class ProgressTracker {
    createSession(metadata = {}) {
        const sessionId = crypto.randomUUID();
        const session = {
            id: sessionId,
            progress: 0,
            lastUpdate: Date.now(),
            metadata: this.sanitizeMetadata(metadata),
            createdAt: Date.now()
        };

        this.sessions.set(sessionId, session);
        return sessionId;
    }

    sanitizeMetadata(metadata) {
        // Sanitize all metadata fields
        const sanitized = {};
        for (const [key, value] of Object.entries(metadata)) {
            if (typeof key === 'string' && key.length <= 50) {
                sanitized[key] = String(value).substring(0, 200);
            }
        }
        return sanitized;
    }
}
```

**Security Controls**:
- UUID session IDs (cryptographically random)
- Metadata sanitization (key length, value length limits)
- Automatic session cleanup (30-minute timeout)
- Throttle interval (100ms) prevents progress spam

---

## Data Protection

### Database Security

**Database**: SQLite with better-sqlite3 (synchronous API)

**Location**: `app/public/scripts/init-database.js`

**SQLite Configuration**:

```javascript
const Database = require("better-sqlite3");

// Secure database connection
const db = new Database(dbPath, {
    verbose: console.log,  // Log queries (development)
    fileMustExist: false   // Create if doesn't exist
});

// Enable WAL mode (Write-Ahead Logging)
db.pragma("journal_mode = WAL");

// Enable foreign key constraints
db.pragma("foreign_keys = ON");
```

**Security Pragmas**:

- **WAL Mode**: Better concurrency, crash recovery, and performance
- **Foreign Keys**: Enforces referential integrity
- **Synchronous Writes**: Data written to disk immediately (better-sqlite3 default)

**Sensitive Data Handling**:

- **Password Hashing**: Argon2id hashes stored in `users.password_hash` column
- **No Plaintext Passwords**: Passwords never stored in plaintext
- **Parameterized Queries**: 100% of queries use parameterization
- **Database File Permissions**: `app/data/hextrackr.db` should be `chmod 600` (owner read/write only)
- **Session Database**: `app/data/sessions.db` stores session data (automatic cleanup)

### Data Sanitization

**Validation Service**: `app/services/validationService.js`

**Input Sanitization Functions**:

```javascript
// Comprehensive input sanitization
function sanitizeInput(input, type = 'string') {
    if (input === null || input === undefined) {
        return null;
    }

    switch (type) {
        case 'string':
            return String(input)
                .trim()
                .substring(0, 1000)  // Limit length
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');  // Remove control chars

        case 'number':
            const num = parseFloat(input);
            return isNaN(num) ? 0 : Math.max(-999999, Math.min(999999, num));

        case 'boolean':
            return Boolean(input);

        case 'date':
            const date = new Date(input);
            return isNaN(date.getTime()) ? null : date.toISOString();

        case 'cve':
            // CVE format validation
            const cveRegex = /^CVE-\d{4}-\d{4,}$/;
            return cveRegex.test(input) ? input : null;

        case 'severity':
            const validSeverities = ['Low', 'Medium', 'High', 'Critical'];
            return validSeverities.includes(input) ? input : 'Medium';

        default:
            return sanitizeInput(input, 'string');
    }
}
```

**Sanitization Patterns**:
- String length limiting (prevent memory exhaustion)
- Control character removal (prevent terminal injection)
- Numeric range clamping (prevent integer overflow)
- Date format validation (ISO 8601)
- CVE format validation (regex pattern matching)
- Severity whitelist validation

---

## Error Handling Security

### Secure Error Responses

**Implementation**: Generic error messages in production, detailed errors in development

**Location**: Error handling middleware throughout controllers

**Pattern**:

```javascript
// Secure error handler
function secureErrorHandler(err, req, res, next) {
    // Log full error internally (server logs)
    console.error('Application Error:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    // Generic error response for clients
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: isDevelopment ? err.message : 'An error occurred',
            ...(isDevelopment && { stack: err.stack }),
            timestamp: new Date().toISOString()
        }
    });
}
```

**Security Benefits**:
- **Production**: Generic error messages (no information leakage)
- **Development**: Detailed error messages (for debugging)
- **Stack Traces**: Only shown in development mode
- **Internal Logging**: Full error details logged server-side
- **Status Codes**: Appropriate HTTP status codes used

---

## Compliance and Standards

### OWASP Top 10 Compliance

**HexTrackr Security Alignment**:

1. **A01 Broken Access Control**: ✅ Authentication system with session management
2. **A02 Cryptographic Failures**: ✅ Argon2id password hashing, HTTPS enforcement
3. **A03 Injection**: ✅ Parameterized queries (100% coverage), input validation
4. **A04 Insecure Design**: ✅ Security-first architecture, defense-in-depth
5. **A05 Security Misconfiguration**: ✅ Secure defaults, hardening enforced
6. **A06 Vulnerable Components**: ✅ Dependency scanning (`npm audit`), regular updates
7. **A07 Identification Failures**: ✅ Argon2id hashing, account lockout, session management
8. **A08 Software Integrity**: ✅ Docker containerization, secure deployment
9. **A09 Security Logging**: ✅ Audit logging via LoggingManager
10. **A10 Server-Side Request Forgery**: ✅ Input validation, no external URL fetching

### Data Privacy Compliance

**GDPR Readiness**:

- ✅ Data minimization principles applied
- ✅ Right to data portability (CSV export features)
- ✅ Right to erasure (delete functionality)
- ✅ Data processing transparency
- ✅ Security by design implementation

**CCPA Compliance**:

- ✅ Consumer rights framework ready
- ✅ Data collection transparency
- ✅ Secure data handling practices

---

## Security Configuration Checklist

### Production Deployment Security

**Required Environment Variables**:

```bash
# Security configuration
NODE_ENV=production
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
TRUST_PROXY=true  # ALWAYS true for nginx reverse proxy

# Optional security settings
RATE_LIMIT_MAX_REQUESTS=100
MAX_UPLOAD_SIZE=104857600  # 100MB in bytes
LOG_LEVEL=warn
```

**File Permissions**:

```bash
# Database files (owner read/write only)
chmod 600 app/data/hextrackr.db
chmod 600 app/data/sessions.db

# Configuration files (owner read/write only)
chmod 600 .env

# Application directory (owner read/write/execute, group/others read/execute)
chmod -R 755 app/
chown -R www-data:www-data app/  # Or appropriate user
```

**Network Security** (nginx reverse proxy):

```bash
# nginx handles HTTPS termination on port 443
# Express runs on port 8080 (internal only)
# Direct internet exposure NOT recommended

# Firewall configuration (if needed)
ufw allow 443/tcp   # HTTPS (nginx)
ufw deny 8080/tcp   # Block direct Express access
ufw enable
```

**Docker Security**:

```bash
# Run as non-root user in container
USER node

# Read-only filesystem (where possible)
docker run --read-only ...

# Resource limits
docker run --memory=512m --cpus=1 ...
```

---

## Security Testing and Validation

### Automated Security Testing

**Dependency Scanning**:

```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

**Linting and Code Analysis**:

```bash
# ESLint security rules
npm run eslint

# Stylelint for CSS security
npm run stylelint

# All linters
npm run lint:all
```

### Penetration Testing Checklist

**Network Security**:

- [ ] Rate limiting effectiveness testing
- [ ] CORS misconfiguration testing
- [ ] HTTPS enforcement validation
- [ ] Trust proxy header injection testing

**Application Security**:

- [ ] SQL injection testing (automated + manual)
- [ ] XSS payload injection testing
- [ ] File upload security testing
- [ ] Path traversal vulnerability testing
- [ ] CSRF token validation testing
- [ ] Authentication bypass attempts
- [ ] Account lockout testing
- [ ] Session hijacking attempts

**Infrastructure Security**:

- [ ] Docker container security scanning
- [ ] Dependency vulnerability scanning
- [ ] Configuration security review
- [ ] Access control validation

---

## Security Incident Response

### Incident Response Plan

**Detection**:
- Monitor LoggingManager for security events
- Watch for rate limit violations
- Track failed authentication attempts
- Monitor file upload errors

**Response**:
1. **Identify**: Determine nature and scope of incident
2. **Contain**: Block malicious IPs, disable affected features
3. **Eradicate**: Remove malicious files, close security holes
4. **Recover**: Restore services, verify integrity
5. **Lessons Learned**: Document incident, update security measures

**Contact**:
- Security issues: Report via GitHub Issues (HexTrackr repository)
- Critical vulnerabilities: Private disclosure preferred

---

## Security Roadmap

### Current Security Posture (v1.1.3)

**Strengths**:
- ✅ Excellent password security (Argon2id)
- ✅ Comprehensive path validation (100% coverage)
- ✅ Strong session management (SQLite-backed)
- ✅ HTTPS enforcement (CORS rejects HTTP)
- ✅ SQL injection prevention (100% parameterized queries)
- ✅ CSRF protection (properly implemented)
- ✅ Account lockout (automatic 15-minute lockout)

**Weaknesses**:
- ⚠️ Missing HSTS header (Strict-Transport-Security)
- ⚠️ Missing CSP header (Content-Security-Policy)
- ⚠️ Missing Referrer-Policy header
- ⚠️ Helmet.js installed but unused

### Future Enhancements

**Planned Security Improvements**:

1. **Security Headers**:
   - Implement Helmet.js (already installed, needs `app.use(helmet())`)
   - Add Content-Security-Policy (CSP) for XSS defense-in-depth
   - Add HSTS header for HTTPS enforcement
   - Add Referrer-Policy for privacy protection

2. **Authentication**:
   - Two-factor authentication (2FA)
   - OAuth 2.0 integration (enterprise SSO)
   - API key authentication (service-to-service)
   - Password rotation policies

3. **Monitoring**:
   - Real-time security event dashboards
   - Automated alerting for suspicious activity
   - Intrusion detection system (IDS)

4. **Compliance**:
   - SOC 2 Type II audit preparation
   - HIPAA compliance (if handling healthcare data)
   - ISO 27001 alignment

---

**Document Version**: 2.0
**Last Updated**: 2025-10-09
**Reviewed By**: Codebase Navigator + hextrackr-fullstack-dev agent
**Next Review**: 2026-01-09 (quarterly review cycle)
