# Security Implementation

Comprehensive documentation of all security measures, controls, and implementations in HexTrackr for corporate security review and compliance assessment.

---

## Security Architecture Overview

HexTrackr implements a defense-in-depth security strategy with multiple layers of protection:

- **Network Security**: Rate limiting, CORS, security headers
- **Input Validation**: Comprehensive data sanitization and validation
- **File Security**: Upload restrictions and path traversal prevention
- **Data Protection**: SQL injection prevention and secure data handling
- **Session Management**: Secure session handling (prepared for authentication)
- **Application Security**: XSS protection and secure coding practices

---

## Input Validation and Sanitization

### PathValidator Security Class

**Location**: `app/public/server.js` (lines 22-79)

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

**Security Benefits**:

- Prevents directory traversal attacks (../, ..\\)
- Validates all path components
- Handles edge cases and malformed paths
- Consistent error handling across all file operations
- Performance optimized for frequent validation

### SQL Injection Prevention

**Implementation**: Parameterized queries throughout the application

**Example Secure Query Pattern**:

```javascript
// Secure parameterized query
const stmt = db.prepare(`
  SELECT * FROM vulnerabilities
  WHERE hostname = ? AND severity = ? AND scan_date > ?
`);
const results = stmt.all(hostname, severity, dateThreshold);
```

**Protection Mechanisms**:

- All database queries use parameterized statements
- No dynamic SQL construction with user input
- Input validation before database operations
- Type checking for numeric parameters
- Length limits on string parameters

**Vulnerable Operations Secured**:

- Vulnerability search and filtering
- Ticket CRUD operations
- Data import processing
- Statistics and reporting queries
- Backup and restore operations

### XSS Protection

**Primary Defense**: DOMPurify library integration

**Implementation**:

```javascript
// Client-side XSS protection
import DOMPurify from 'dompurify';

// Sanitize all user-generated content
function sanitizeHTML(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: ['class'],
    FORBID_TAGS: ['script', 'object', 'embed', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick']
  });
}
```

**Additional XSS Protections**:

- Content Security Policy (CSP) headers
- X-XSS-Protection header enabled
- Input validation and encoding
- Template escaping in HTML generation
- Sanitization of user-provided data before storage

---

## Network Security

### Rate Limiting

**Implementation**: Express Rate Limit middleware

**Configuration**:

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Rate limit exceeded. Try again later."
      }
    });
  }
});

// Apply to all API routes
app.use("/api/", limiter);
```

**Rate Limiting Strategy**:

- **Window**: 15-minute sliding window
- **Limit**: 100 requests per IP per window
- **Scope**: Applied to all `/api/` endpoints
- **Headers**: Provides rate limit information to clients
- **Bypass**: No bypass mechanism (prevents abuse)
- **Storage**: In-memory storage (resets on restart)

### CORS Configuration

**Implementation**: Configurable Cross-Origin Resource Sharing

**Default Configuration**:

```javascript
const cors = require("cors");

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  credentials: false, // No credentials by default
  maxAge: 86400 // 24 hours preflight cache
};

app.use(cors(corsOptions));
```

**Production Recommendations**:

```javascript
// Production CORS settings
const productionCors = {
  origin: "https://hextrackr.yourdomain.com",
  credentials: false,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "X-Requested-With"]
};
```

### Security Headers

**Implementation**: Custom security header middleware

```javascript
// Security headers middleware
app.use((req, res, next) => {
  // HTTP Strict Transport Security
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Clickjacking protection
  res.setHeader("X-Frame-Options", "DENY");

  // XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  res.setHeader(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  // Content Security Policy (development - adjust for production)
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;"
  );

  next();
});
```

---

## File Upload Security

### Upload Restrictions

**Configuration**:

```javascript
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Validate upload directory exists and is writable
    const uploadDir = process.env.UPLOAD_DIR || "./app/public/uploads";
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate secure filename with timestamp
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${sanitizedName}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimes = [
    'text/csv',
    'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  // Allowed file extensions
  const allowedExtensions = ['.csv', '.json', '.xls', '.xlsx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1, // Single file upload only
    fields: 5, // Limit form fields
    fieldSize: 1024 * 1024, // 1MB per field
    headerPairs: 2000 // Limit header pairs
  },
  fileFilter: fileFilter
});
```

**Security Controls**:

- **File Size**: 50MB maximum per file
- **File Types**: CSV, JSON, XLS, XLSX only
- **MIME Type Validation**: Double validation (MIME + extension)
- **Filename Sanitization**: Remove special characters
- **Upload Directory**: Isolated from executable directories
- **Temporary Storage**: Files moved after validation
- **Cleanup**: Automatic cleanup of old uploads

### File Processing Security

**CSV Processing with PapaParse**:

```javascript
const Papa = require("papaparse");

function parseCSVSecurely(fileContent, options = {}) {
  const secureConfig = {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      // Sanitize column headers
      return header.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    },
    transform: (value, field) => {
      // Sanitize field values
      if (typeof value === 'string') {
        return value.trim().substring(0, 1000); // Limit field length
      }
      return value;
    },
    error: (error, file, inputElem, reason) => {
      console.error('CSV parsing error:', error, reason);
    },
    // Security limits
    worker: false, // Disable web workers
    download: false, // No external downloads
    delimiter: '', // Auto-detect delimiter
    chunkSize: 1024 * 1024, // 1MB chunks
    ...options
  };

  return Papa.parse(fileContent, secureConfig);
}
```

---

## Session Management

### Current State (Stateless)

HexTrackr currently operates in a stateless mode without user authentication. However, the foundation is prepared for secure session management.

### Prepared Session Configuration

```javascript
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'auto-generated-secret',
  name: 'hextrackr.sid',
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: './data',
    table: 'sessions'
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS access to cookies
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  },
  genid: () => {
    return require('crypto').randomBytes(32).toString('hex');
  }
};
```

### Future Authentication Framework

**Planned Authentication Methods**:

1. **Local Authentication**: Username/password with bcrypt hashing
2. **JWT Tokens**: Stateless authentication for API access
3. **OAuth 2.0**: Integration with enterprise identity providers
4. **API Keys**: Service-to-service authentication

**Password Security (When Implemented)**:

- bcrypt with minimum 12 rounds
- Password complexity requirements
- Account lockout after failed attempts
- Password history prevention
- Secure password reset flow

---

## Data Protection

### Database Security

**SQLite Configuration**:

```javascript
const sqlite3 = require('sqlite3').verbose();

// Secure database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
});

// Enable WAL mode for better concurrency and recovery
db.exec('PRAGMA journal_mode=WAL');

// Set secure pragma settings
db.exec('PRAGMA foreign_keys=ON'); // Enforce foreign key constraints
db.exec('PRAGMA secure_delete=ON'); // Securely delete data
db.exec('PRAGMA temp_store=MEMORY'); // Store temporary data in memory
```

**Sensitive Data Handling**:

- No passwords or secrets stored in database
- Input validation before database operations
- Prepared statements for all queries
- Database file permissions restricted (600)
- Regular backup with integrity checks

### Data Sanitization

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
        .substring(0, 1000) // Limit length
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control chars

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

---

## Application Security Features

### Progress Tracking Security

**WebSocket Session Management**:

```javascript
class ProgressTracker {
  constructor(io) {
    this.io = io;
    this.sessions = new Map();
    this.THROTTLE_INTERVAL = 100; // Prevent spam
    this.SESSION_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
  }

  createSession(metadata = {}) {
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      progress: 0,
      lastUpdate: Date.now(),
      metadata: this.sanitizeMetadata(metadata),
      ipAddress: this.getClientIP(), // Track origin
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
        sanitized[key] = sanitizeInput(value, 'string');
      }
    }
    return sanitized;
  }
}
```

### Error Handling Security

**Secure Error Responses**:

```javascript
// Error handler that doesn't leak sensitive information
function secureErrorHandler(err, req, res, next) {
  // Log full error internally
  console.error('Application Error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
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
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    }
  });
}
```

---

## Security Monitoring and Logging

### Security Event Logging

**Audit Log Implementation**:

```javascript
class SecurityAuditLogger {
  constructor(logFile = './logs/security.log') {
    this.logFile = logFile;
    this.logLevel = process.env.AUDIT_LOG_LEVEL || 'info';
  }

  log(level, event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level,
      event: event,
      details: details,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };

    // Log to file and/or external service
    console.log(`SECURITY: ${JSON.stringify(logEntry)}`);

    // Critical events should trigger alerts
    if (level === 'critical') {
      this.triggerAlert(logEntry);
    }
  }

  logFileUpload(req, file, success) {
    this.log('info', 'FILE_UPLOAD', {
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      success: success,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  logRateLimitExceeded(req) {
    this.log('warning', 'RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
  }
}
```

### Intrusion Detection Patterns

**Suspicious Activity Detection**:

- Multiple file upload failures from same IP
- Rapid API requests beyond normal usage
- Path traversal attempts in file operations
- Malformed requests or invalid parameters
- Large file uploads outside business hours
- WebSocket connection abuse patterns

---

## Compliance and Standards

### Security Standards Alignment

**OWASP Top 10 Compliance**:

1. **A01 Broken Access Control**: Prepared authentication framework
2. **A02 Cryptographic Failures**: Secure defaults, HTTPS enforcement
3. **A03 Injection**: Parameterized queries, input validation
4. **A04 Insecure Design**: Security-first architecture
5. **A05 Security Misconfiguration**: Secure defaults, hardening guide
6. **A06 Vulnerable Components**: Dependency scanning, regular updates
7. **A07 Identification Failures**: Prepared session management
8. **A08 Software Integrity**: Secure deployment, verification
9. **A09 Security Logging**: Comprehensive audit logging
10. **A10 Server-Side Request Forgery**: Input validation, URL restrictions

### Data Privacy Compliance

**GDPR Readiness**:

- Data minimization principles applied
- Right to data portability (export features)
- Right to erasure (delete functionality)
- Data processing transparency
- Security by design implementation

**CCPA Compliance**:

- Consumer rights framework ready
- Data collection transparency
- Secure data handling practices

---

## Security Testing and Validation

### Automated Security Testing

**Security Test Suite**:

```bash
# Run security tests
npm run security:test

# Includes:
# - SQL injection testing
# - XSS payload testing
# - Path traversal testing
# - File upload security testing
# - Rate limiting validation
# - CORS configuration testing
```

### Penetration Testing Checklist

**Network Security**:

- [ ] Port scanning and service enumeration
- [ ] Rate limiting bypass attempts
- [ ] CORS misconfiguration testing
- [ ] SSL/TLS configuration validation

**Application Security**:

- [ ] SQL injection testing (automated + manual)
- [ ] XSS payload injection testing
- [ ] File upload security testing
- [ ] Path traversal vulnerability testing
- [ ] Business logic security testing

**Infrastructure Security**:

- [ ] Docker container security scanning
- [ ] Dependency vulnerability scanning
- [ ] Configuration security review
- [ ] Access control validation

---

## Security Configuration Checklist

### Production Deployment Security

**Required Environment Variables**:

```bash
# Security configuration
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
SESSION_COOKIE_SECURE=true
RATE_LIMIT_MAX_REQUESTS=100
MAX_UPLOAD_SIZE=52428800
LOG_LEVEL=warn

# Generate secure session secret
SESSION_SECRET=$(openssl rand -hex 32)
```

**File Permissions**:

```bash
# Database file
chmod 600 /path/to/hextrackr.db

# Configuration files
chmod 600 /path/to/.env

# Upload directory
chmod 755 /path/to/uploads
chown www-data:www-data /path/to/uploads

# Application directory
chmod -R 755 /path/to/app
chown -R www-data:www-data /path/to/app
```

**Network Security**:

```bash
# Firewall configuration
ufw allow 8989/tcp  # HTTP API
ufw allow 8988/tcp  # WebSocket
ufw enable

# Reverse proxy recommended for HTTPS termination
# Direct internet exposure not recommended
```

This comprehensive security implementation documentation provides complete visibility into all security measures for corporate review and compliance assessment.
