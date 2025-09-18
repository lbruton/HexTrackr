# Utilities Reference

> Core utility classes and helper functions for HexTrackr

## Overview

HexTrackr's utility layer provides essential helper functions, security validators, and progress tracking capabilities used throughout the application.

---

## Core Utilities {#utilities}

### PathValidator

**Location:** `app/utils/PathValidator.js`

Critical security utility for validating and sanitizing file paths to prevent directory traversal attacks.

**Key Features:**

- Path normalization and resolution
- Directory traversal prevention
- Symlink validation
- Whitelist/blacklist support
- Cross-platform compatibility

**Main Methods:**

| Method | Purpose | Returns |
|--------|---------|---------|
| `validatePath(inputPath, options)` | Validates and sanitizes a file path | Safe path or throws error |
| `isPathSafe(inputPath)` | Checks if path is safe without throwing | Boolean |
| `normalizeP ath(inputPath)` | Normalizes path separators | Normalized path string |
| `isWithinBase(path, basePath)` | Checks if path is within base directory | Boolean |
| `checkSymlinks(path)` | Validates symlink safety | Boolean |

**Usage Example:**

```javascript
const PathValidator = require('./utils/PathValidator');

// Validate user-provided file path
try {
    const safePath = PathValidator.validatePath(userInput, {
        basePath: '/app/uploads',
        allowSymlinks: false,
        blacklist: ['../secrets', '/etc']
    });
    // Safe to use safePath
} catch (error) {
    console.error('Invalid path:', error.message);
}
```

**Security Patterns Blocked:**

- `../../../etc/passwd` - Directory traversal
- `/etc/shadow` - Absolute path escape
- `uploads/../../../` - Relative path escape
- Symlink attacks
- Null byte injection

### ProgressTracker

**Location:** `app/utils/ProgressTracker.js`

Manages progress tracking for long-running operations with WebSocket integration.

**Features:**

- Multi-operation tracking
- Real-time progress updates
- ETA calculations
- WebSocket event emission
- Memory-efficient circular buffer

**Main Methods:**

| Method | Purpose | Returns |
|--------|---------|---------|
| `createOperation(id, total)` | Start tracking new operation | Operation object |
| `updateProgress(id, current)` | Update operation progress | Progress percentage |
| `completeOperation(id)` | Mark operation as complete | Final stats |
| `getProgress(id)` | Get current progress | Progress object |
| `calculateETA(id)` | Estimate time remaining | ETA in seconds |

**Progress Object Structure:**

```javascript
{
    id: 'import-123',
    total: 1000,
    current: 450,
    percentage: 45,
    startTime: Date.now(),
    eta: 65, // seconds
    status: 'processing',
    message: 'Processing row 450 of 1000'
}
```

**Usage with WebSocket:**

```javascript
const progressTracker = new ProgressTracker(io);

// Start operation
const op = progressTracker.createOperation('import-123', totalRows);

// Update progress
for (let i = 0; i < totalRows; i++) {
    await processRow(data[i]);
    progressTracker.updateProgress('import-123', i + 1);
    // Automatically emits WebSocket event
}

// Complete
progressTracker.completeOperation('import-123');
```

### DataHelpers

**Location:** `app/utils/helpers.js`

Collection of data manipulation and formatting utilities.

**Key Functions:**

| Function | Purpose | Example |
|----------|---------|---------|
| `formatBytes(bytes)` | Human-readable file sizes | `1024` → `"1 KB"` |
| `formatDate(date)` | Consistent date formatting | ISO → `"Jan 15, 2024"` |
| `truncateText(text, length)` | Smart text truncation | Adds ellipsis |
| `parseCSV(text)` | CSV parsing wrapper | Returns array of objects |
| `escapeHtml(text)` | XSS prevention | Escapes HTML entities |
| `generateId()` | Unique ID generation | Returns UUID |
| `deepClone(obj)` | Deep object cloning | Handles circular refs |
| `debounce(fn, delay)` | Function debouncing | Delays execution |
| `throttle(fn, limit)` | Function throttling | Limits execution rate |

**Formatting Examples:**

```javascript
const helpers = require('./utils/helpers');

// File size formatting
helpers.formatBytes(1536); // "1.5 KB"
helpers.formatBytes(1048576); // "1 MB"

// Date formatting
helpers.formatDate(new Date()); // "Jan 15, 2024 10:30 AM"
helpers.formatDate('2024-01-15T10:30:00Z'); // "Jan 15, 2024"

// Text truncation
helpers.truncateText('Long text here...', 10); // "Long te..."
```

### CryptoHelpers

**Location:** `app/utils/crypto.js`

Cryptographic utilities for hashing and encryption.

**Functions:**

| Function | Purpose | Algorithm |
|----------|---------|-----------|
| `hashPassword(password)` | Password hashing | bcrypt with salt |
| `verifyPassword(password, hash)` | Password verification | bcrypt compare |
| `generateToken()` | Secure token generation | crypto.randomBytes |
| `hashFile(filePath)` | File integrity hashing | SHA-256 |
| `encrypt(data, key)` | Data encryption | AES-256-GCM |
| `decrypt(encrypted, key)` | Data decryption | AES-256-GCM |

**Security Example:**

```javascript
const crypto = require('./utils/crypto');

// Password hashing
const hash = await crypto.hashPassword('user_password');
const isValid = await crypto.verifyPassword('user_password', hash);

// Token generation
const token = crypto.generateToken(); // 32-byte hex string

// File integrity
const fileHash = await crypto.hashFile('/path/to/file.csv');
```

### ValidationHelpers

**Location:** `app/utils/validation.js`

Input validation utilities for common data types.

**Validators:**

| Function | Purpose | Returns |
|----------|---------|---------|
| `isEmail(email)` | Email format validation | Boolean |
| `isURL(url)` | URL format validation | Boolean |
| `isIPAddress(ip)` | IP address validation | Boolean |
| `isCVE(cve)` | CVE ID format | Boolean |
| `isPort(port)` | Port number validation | Boolean |
| `isMACAddress(mac)` | MAC address format | Boolean |
| `isUUID(uuid)` | UUID validation | Boolean |
| `sanitizeInput(input)` | General input sanitization | Clean string |

**Validation Patterns:**

```javascript
const validators = require('./utils/validation');

// Email validation
validators.isEmail('user@example.com'); // true
validators.isEmail('invalid.email'); // false

// CVE validation
validators.isCVE('CVE-2024-12345'); // true
validators.isCVE('CVE-24-123'); // false

// IP validation (supports IPv4 and IPv6)
validators.isIPAddress('192.168.1.1'); // true
validators.isIPAddress('2001:db8::1'); // true
```

### FileHelpers

**Location:** `app/utils/file-helpers.js`

File system operation utilities.

**Functions:**

| Function | Purpose | Returns |
|----------|---------|---------|
| `ensureDir(path)` | Create directory if not exists | Promise |
| `cleanTempFiles(dir, age)` | Remove old temp files | Files deleted count |
| `getFileExtension(filename)` | Extract file extension | Extension string |
| `getMimeType(filename)` | Determine MIME type | MIME string |
| `isFileTypeAllowed(filename, types)` | Check allowed file types | Boolean |
| `readJSONFile(path)` | Safe JSON file reading | Parsed object |
| `writeJSONFile(path, data)` | Safe JSON file writing | Promise |

**File Operations Example:**

```javascript
const fileHelpers = require('./utils/file-helpers');

// Ensure directory exists
await fileHelpers.ensureDir('/app/uploads/temp');

// Clean old temp files (older than 1 hour)
const cleaned = await fileHelpers.cleanTempFiles('/tmp', 3600000);

// Check file type
if (fileHelpers.isFileTypeAllowed('data.csv', ['csv', 'json'])) {
    // Process file
}
```

### DatabaseHelpers

**Location:** `app/utils/db-helpers.js`

Database operation utilities for SQLite.

**Functions:**

| Function | Purpose | Returns |
|----------|---------|---------|
| `runMigration(db, sql)` | Execute migration safely | Promise |
| `createIndex(db, table, column)` | Create database index | Promise |
| `tableExists(db, table)` | Check if table exists | Boolean |
| `getTableSchema(db, table)` | Get table structure | Schema object |
| `vacuum(db)` | Optimize database | Promise |
| `backup(db, path)` | Create database backup | Promise |

**Database Operations:**

```javascript
const dbHelpers = require('./utils/db-helpers');

// Check table existence
if (await dbHelpers.tableExists(db, 'vulnerabilities')) {
    // Table operations
}

// Create index for performance
await dbHelpers.createIndex(db, 'vulnerabilities', 'scan_date');

// Optimize database
await dbHelpers.vacuum(db);
```

---

## Error Handling Utilities {#error-handling}

### CustomErrors

**Location:** `app/utils/errors.js`

Custom error classes for better error handling.

**Error Classes:**

| Class | Purpose | Status Code |
|-------|---------|-------------|
| `ValidationError` | Input validation failures | 400 |
| `AuthenticationError` | Auth failures | 401 |
| `AuthorizationError` | Permission denied | 403 |
| `NotFoundError` | Resource not found | 404 |
| `ConflictError` | Resource conflicts | 409 |
| `RateLimitError` | Too many requests | 429 |
| `ServerError` | Internal errors | 500 |

**Usage:**

```javascript
const { ValidationError, NotFoundError } = require('./utils/errors');

// Throw custom error
if (!isValid) {
    throw new ValidationError('Invalid input format');
}

// Handle in middleware
app.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
        res.status(err.statusCode).json({
            error: err.message,
            field: err.field
        });
    }
});
```

---

## Performance Utilities {#performance}

### CacheManager

**Location:** `app/utils/cache.js`

In-memory caching with TTL support.

**Features:**

- TTL-based expiration
- LRU eviction policy
- Size limits
- Hit/miss statistics

**Methods:**

```javascript
const cache = new CacheManager({
    maxSize: 100,
    defaultTTL: 300000 // 5 minutes
});

// Set with TTL
cache.set('key', value, 60000); // 1 minute TTL

// Get value
const value = cache.get('key');

// Check existence
if (cache.has('key')) {
    // Use cached value
}

// Clear cache
cache.clear();
```

### RateLimiter

**Location:** `app/utils/rate-limiter.js`

Custom rate limiting implementation.

**Configuration:**

```javascript
const limiter = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req) => req.ip
});

// Check limit
if (limiter.isLimited(key)) {
    throw new RateLimitError('Too many requests');
}

// Track request
limiter.track(key);
```

---

## Logging Utilities {#logging}

### Logger

**Location:** `app/utils/logger.js`

Structured logging with multiple transports.

**Log Levels:**

- `error` - Error conditions
- `warn` - Warning conditions
- `info` - Informational messages
- `debug` - Debug messages
- `verbose` - Verbose debug info

**Usage:**

```javascript
const logger = require('./utils/logger');

// Log with metadata
logger.info('Operation completed', {
    operation: 'import',
    duration: 1523,
    records: 1000
});

// Log errors with stack
logger.error('Operation failed', {
    error: err.message,
    stack: err.stack,
    context: { userId, operation }
});
```

---

## Testing Utilities {#testing}

### TestHelpers

**Location:** `app/utils/test-helpers.js`

Utilities for testing.

**Functions:**

- `createTestDatabase()` - In-memory test DB
- `seedTestData(db)` - Populate test data
- `cleanupTest()` - Clean test artifacts
- `mockWebSocket()` - WebSocket mock
- `generateTestCSV()` - Test CSV generation

---

## Constants {#constants}

### ApplicationConstants

**Location:** `app/utils/constants.js`

Application-wide constants.

```javascript
module.exports = {
    // File limits
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_EXTENSIONS: ['.csv', '.json', '.xml'],

    // Pagination
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 1000,

    // Timeouts
    REQUEST_TIMEOUT: 30000, // 30 seconds
    IMPORT_TIMEOUT: 600000, // 10 minutes

    // Security
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 900000, // 15 minutes

    // Cache
    CACHE_TTL: 300000, // 5 minutes
    MAX_CACHE_SIZE: 100
};
```
