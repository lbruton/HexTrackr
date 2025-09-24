# Middleware & Configuration Reference

> Complete documentation for HexTrackr's middleware pipeline and configuration modules

## Overview

HexTrackr's middleware layer provides security, logging, and request processing capabilities. Configuration modules handle environment settings, database connections, and WebSocket setup.

---

## Middleware Components {#middleware}

### Security Middleware

**Location:** `app/middleware/security.js`

Comprehensive security middleware implementing defense-in-depth strategies.

**Features:**

- **Helmet.js Integration**: Sets security headers (CSP, HSTS, X-Frame-Options)
- **CORS Management**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Sanitization**: XSS and SQL injection protection
- **Path Validation**: Prevents directory traversal attacks

**Configuration:**

```javascript
const securityMiddleware = require('./middleware/security');

// Apply to Express app
app.use(securityMiddleware.helmet());
app.use(securityMiddleware.cors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
}));
app.use(securityMiddleware.rateLimiter({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100                    // limit each IP to 100 requests
}));
```

**Security Headers Applied:**
| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Prevents XSS attacks |
| `X-Frame-Options` | Prevents clickjacking |
| `X-Content-Type-Options` | Prevents MIME sniffing |
| `Strict-Transport-Security` | Forces HTTPS |
| `X-XSS-Protection` | Legacy XSS protection |

### Logging Middleware

**Location:** `app/middleware/logging.js`

Request/response logging with performance monitoring.

**Features:**

- **Morgan Integration**: HTTP request logging
- **Custom Formatters**: Structured log output
- **Performance Metrics**: Response time tracking
- **Error Logging**: Detailed error capture
- **Log Rotation**: Automatic file management

**Log Levels:**

```javascript
// Development
app.use(morgan('dev'));

// Production with custom format
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
    stream: logStream,
    skip: (req, res) => res.statusCode < 400  // Only log errors in production
}));
```

**Log Output Format:**

```text
[2024-01-15 10:30:45] INFO: GET /api/vulnerabilities 200 45ms - 2048
[2024-01-15 10:30:46] ERROR: POST /api/import 500 1523ms - Error: File too large
```

---

## Configuration Modules {#configuration}

### Database Configuration

**Location:** `app/config/database.js`

SQLite database initialization and connection management.

**Features:**

- **Connection Pooling**: Efficient connection reuse
- **Schema Migration**: Automatic database updates
- **Transaction Support**: ACID compliance
- **Backup Integration**: Scheduled backup support

**Initialization:**

```javascript
const dbConfig = require('./config/database');

// Initialize database
const db = await dbConfig.initialize({
    path: process.env.DATABASE_PATH || 'data/hextrackr.db',
    verbose: process.env.NODE_ENV === 'development'
});
```

**Schema Management:**

```javascript
// Automatic schema creation/update
await dbConfig.runMigrations(db);

// Manual schema operations
await dbConfig.createTable(db, 'table_name', schema);
await dbConfig.addIndex(db, 'table_name', 'column_name');
```

### Middleware Configuration

**Location:** `app/config/middleware.js`

Central middleware configuration and ordering.

**Middleware Stack (in order):**

1. **Compression**: gzip/deflate for responses
2. **Body Parsing**: JSON and URL-encoded
3. **Cookie Parser**: Session management
4. **Security Headers**: Helmet.js
5. **CORS**: Cross-origin configuration
6. **Rate Limiting**: Request throttling
7. **Logging**: Morgan integration
8. **Static Files**: Public directory serving
9. **Session**: Express-session
10. **Custom Middleware**: Application-specific

**Configuration Example:**

```javascript
const middlewareConfig = require('./config/middleware');

// Apply all middleware
middlewareConfig.setupMiddleware(app, {
    compression: true,
    bodyLimit: '50mb',
    sessionSecret: process.env.SESSION_SECRET,
    corsOrigins: ['http://localhost:8080'],
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 100
    }
});
```

### WebSocket Configuration

**Location:** `app/config/websocket.js`

Socket.io configuration for real-time features.

**Features:**

- **Connection Management**: Auto-reconnection
- **Room Support**: Channel-based messaging
- **Authentication**: Session-based auth
- **Event Namespacing**: Organized event structure

**Setup:**

```javascript
const websocketConfig = require('./config/websocket');

const io = websocketConfig.initialize(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(','),
        credentials: true
    }
});

// Event handlers
websocketConfig.setupEventHandlers(io);
```

**Event Structure:**

```javascript
// Namespaced events
io.of('/vulnerabilities').on('connection', socket => {
    socket.on('import-start', data => {...});
    socket.on('filter-change', data => {...});
});

io.of('/tickets').on('connection', socket => {
    socket.on('ticket-update', data => {...});
    socket.on('device-change', data => {...});
});
```

### Server Configuration

**Location:** `app/config/server.js`

Express server setup and initialization.

**Configuration Options:**

```javascript
{
    port: process.env.PORT || 8080,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'production',
    trustProxy: true,

    // Performance
    compression: {
        level: 6,
        threshold: 1024
    },

    // Security
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"]
            }
        }
    },

    // File handling
    upload: {
        maxFileSize: 100 * 1024 * 1024,  // 100MB
        allowedTypes: ['text/csv', 'application/json'],
        tempDir: 'uploads/temp'
    }
}
```

---

## Environment Variables {#environment}

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `HOST` | Bind address | `0.0.0.0` |
| `DATABASE_PATH` | SQLite file path | `data/hextrackr.db` |
| `SESSION_SECRET` | Session encryption key | (must be set) |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `ALLOWED_ORIGINS` | CORS whitelist (comma-separated) | `http://localhost:8080` |
| `LOG_LEVEL` | Logging verbosity | `info` |
| `MAX_FILE_SIZE` | Upload size limit | `100MB` |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `ENABLE_COMPRESSION` | Enable gzip | `true` |
| `ENABLE_WEBSOCKET` | Enable Socket.io | `true` |
| `BACKUP_DIR` | Backup storage path | `backups` |
| `UPLOAD_DIR` | Upload storage path | `uploads` |

---

## Request Pipeline {#pipeline}

### Request Flow

```text
Client Request
    ↓
[Compression Middleware]
    ↓
[Security Headers (Helmet)]
    ↓
[CORS Check]
    ↓
[Rate Limiting]
    ↓
[Request Logging]
    ↓
[Body Parsing]
    ↓
[Session Management]
    ↓
[Authentication Check]
    ↓
[Route Handler]
    ↓
[Business Logic]
    ↓
[Response Formatting]
    ↓
[Error Handling]
    ↓
Client Response
```

### Error Handling Pipeline

All errors flow through a centralized error handler:

```javascript
app.use((err, req, res, next) => {
    // Log error
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    // Determine status code
    const status = err.status || 500;

    // Send response
    res.status(status).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'An error occurred'
            : err.message,
        requestId: req.id
    });
});
```

---

## Multer Configuration {#multer}

### File Upload Settings

**Location:** Configured in middleware setup

**Configuration:**

```javascript
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/temp');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueName}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024  // 100MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['text/csv', 'application/json'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});
```

---

## Session Management {#sessions}

### Express-Session Configuration

**Features:**

- **Memory Store**: Development mode
- **Redis Store**: Production mode (optional)
- **Cookie Security**: httpOnly, secure, sameSite
- **Session Rotation**: Prevents fixation attacks

**Configuration:**

```javascript
const session = require('express-session');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,  // 24 hours
        sameSite: 'strict'
    },
    name: 'hextrackr.sid'
}));
```

---

## Performance Optimizations {#performance}

### Compression Settings

```javascript
const compression = require('compression');

app.use(compression({
    level: 6,  // Compression level (0-9)
    threshold: 1024,  // Only compress responses > 1KB
    filter: (req, res) => {
        // Don't compress EventSource responses
        if (res.getHeader('Content-Type') === 'text/event-stream') {
            return false;
        }
        return compression.filter(req, res);
    }
}));
```

### Caching Strategy

**Static Assets:**

```javascript
app.use(express.static('public', {
    maxAge: '1d',  // Cache static files for 1 day
    etag: true,
    lastModified: true
}));
```

**API Responses:**

```javascript
// Cache vulnerability stats for 5 minutes
res.set('Cache-Control', 'private, max-age=300');
```

---

## Security Best Practices {#security-practices}

### Input Validation

All user input is validated using multiple layers:

1. **Type Checking**: Ensure correct data types
2. **Range Validation**: Check numeric ranges
3. **Pattern Matching**: Regex for formats (email, URL, etc.)
4. **Sanitization**: Remove/escape dangerous characters
5. **Length Limits**: Prevent buffer overflows

### Path Traversal Prevention

```javascript
const path = require('path');
const PathValidator = require('../utils/PathValidator');

// Always validate file paths
const safePath = PathValidator.validatePath(userInput, {
    basePath: '/allowed/directory',
    allowSymlinks: false
});
```

### SQL Injection Prevention

All database queries use parameterized statements:

```javascript
// Safe query
db.get('SELECT * FROM users WHERE id = ?', [userId]);

// Never use string concatenation
// db.get('SELECT * FROM users WHERE id = ' + userId);  // DANGEROUS!
```
