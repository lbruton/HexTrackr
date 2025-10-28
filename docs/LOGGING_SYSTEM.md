# HexTrackr Logging System - Developer Documentation

**Issue**: HEX-254
**Version**: 1.0.0
**Status**: ✅ COMPLETE - All 14 Sessions Finished (Foundation + Migration + Admin UI + Documentation)
**Last Updated**: 2025-10-27

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [LoggingService API Reference](#loggingservice-api-reference)
3. [Frontend Logger API Reference](#frontend-logger-api-reference)
4. [Configuration System](#configuration-system)
5. [Database Schema](#database-schema)
6. [Adding Audit Logging to Features](#adding-audit-logging-to-features)
7. [Category System](#category-system)
8. [Encryption Implementation](#encryption-implementation)
9. [Migration Guide](#migration-guide)
10. [Testing Guide](#testing-guide)
11. [Performance Considerations](#performance-considerations)

---

## Architecture Overview

### Three-Tier Logging Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  logger.js (Browser Console + Audit API Client)       │ │
│  │  - Category-aware logging (7 categories)              │ │
│  │  - Debug mode via localStorage                        │ │
│  │  - Async audit log submission                         │ │
│  └────────────┬───────────────────────────────────────────┘ │
└───────────────┼─────────────────────────────────────────────┘
                │ POST /api/audit-logs
                │
┌───────────────▼─────────────────────────────────────────────┐
│                    Backend Express Server                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AuditLogController (REST endpoint handler)           │ │
│  └────────────┬───────────────────────────────────────────┘ │
│               │                                              │
│  ┌────────────▼───────────────────────────────────────────┐ │
│  │  LoggingService (Singleton)                           │ │
│  │  - Category filtering (15 categories total)           │ │
│  │  - Environment-aware log levels                       │ │
│  │  - AES-256-GCM encryption                             │ │
│  │  - Automatic cleanup scheduler                        │ │
│  └────────────┬───────────────────────────────────────────┘ │
└───────────────┼─────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────┐
│                    SQLite Database                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  audit_logs table (encrypted message + IV + metadata) │ │
│  │  audit_log_config table (encryption key + stats)      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Configuration-Driven**: All logging behavior controlled via `logging.config.json`
2. **Zero-Cost in Production**: Frontend logs silently dropped unless debug mode enabled
3. **Security-First**: Audit logs encrypted at rest with AES-256-GCM
4. **Performance-Optimized**: Async writes, short-circuit checks, in-memory caching
5. **Backward Compatible**: Legacy logger methods still work without categories

---

## LoggingService API Reference

### Singleton Access

```javascript
const LoggingService = require('../services/loggingService');

// Get existing instance
const logger = LoggingService.getInstance();

// Initialize with database (only once in server.js)
await LoggingService.initialize(db);
```

### Standard Logging Methods

#### `debug(scope, category, message, data = null)`

Log at DEBUG level (only shown in development environment).

```javascript
logger.debug('backend', 'auth', 'Session validated for user', { userId: 123 });
```

**Parameters:**
- `scope` (string): `'frontend'` or `'backend'`
- `category` (string): Category name (must exist in config)
- `message` (string): Human-readable log message
- `data` (any, optional): Additional data to log (will be stringified)

**Environment Filtering:**
- Production: Not shown
- Development: Shown
- Test: Not shown

#### `info(scope, category, message, data = null)`

Log at INFO level (shown in all environments except production).

```javascript
logger.info('backend', 'database', 'Database connection established');
```

**Environment Filtering:**
- Production: Not shown
- Development: Shown
- Test: Not shown

#### `warn(scope, category, message, data = null)`

Log at WARN level (shown in all environments).

```javascript
logger.warn('backend', 'import', 'CSV missing vendor column, using fallback detection');
```

**Environment Filtering:**
- Production: Shown
- Development: Shown
- Test: Not shown

#### `error(scope, category, message, data = null)`

Log at ERROR level (shown in all environments).

```javascript
logger.error('backend', 'api', 'Failed to fetch vulnerabilities', error);
```

**Environment Filtering:**
- Production: Shown
- Development: Shown
- Test: Shown

### Encrypted Audit Logging

#### `audit(category, message, data = null, userId = null, req = null)`

Write encrypted audit log entry. Always encrypted, always stored (if audit enabled).

```javascript
// From Express route handler
await logger.audit('user.login', 'User logged in successfully',
  { method: 'password' },
  user.id,
  req
);

// From service method (without Express req object)
await logger.audit('ticket.delete', 'Ticket permanently deleted',
  { ticketId: 'TIX-001', reason: 'duplicate' },
  userId,
  { username: 'jsmith', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0...' }
);
```

**Parameters:**
- `category` (string): Audit category (must be in whitelist)
- `message` (string): Human-readable audit message
- `data` (object, optional): Structured data to encrypt with message
- `userId` (string, optional): User identifier
- `req` (Express Request | Object, optional):
  - Express Request object: Automatically extracts IP, user agent, session user
  - Plain object: `{ username, ipAddress, userAgent }`

**Behavior:**
- Silently returns if `global.auditEnabled = false`
- Silently returns if category not in `audit.whitelist`
- Combines message + data into encrypted payload
- Generates unique 12-byte IV for each entry
- Stores encrypted payload + IV + metadata in database
- Non-blocking (uses async writes)

**Error Handling:**
- Logs error to console but doesn't throw
- Failed audit logs don't break application flow

### Encryption Methods

#### `encrypt(data)`

Encrypt data using AES-256-GCM.

```javascript
const { encrypted, iv } = logger.encrypt({ secret: 'data' });
// encrypted: Buffer (ciphertext + 16-byte auth tag)
// iv: Buffer (12-byte initialization vector)
```

**Parameters:**
- `data` (string | Object): Data to encrypt (objects are JSON-stringified)

**Returns:**
- `encrypted` (Buffer): Encrypted data with authentication tag appended
- `iv` (Buffer): Initialization vector (12 bytes)

**Throws:**
- Error if encryption key not initialized

#### `decrypt(encryptedData, iv)`

Decrypt data using AES-256-GCM.

```javascript
const decrypted = logger.decrypt(encryptedBuffer, ivBuffer);
// Returns: Object (if valid JSON) or string
```

**Parameters:**
- `encryptedData` (Buffer): Encrypted data with auth tag
- `iv` (Buffer): Initialization vector (12 bytes)

**Returns:**
- Parsed JSON object (if data was JSON)
- String (if data was plain text)

**Throws:**
- Error if encryption key not initialized
- Error if authentication tag verification fails (tampering detected)
- Error if decryption fails

### Internal Methods

#### `_shouldLog(scope, category, level)`

Check if logging should occur based on config and environment.

```javascript
if (logger._shouldLog('backend', 'auth', 'debug')) {
  // Log the message
}
```

**Parameters:**
- `scope` (string): `'frontend'` or `'backend'`
- `category` (string): Category name
- `level` (string): Log level (`'debug'`, `'info'`, `'warn'`, `'error'`)

**Returns:**
- `true` if logging should occur
- `false` if logging should be suppressed

**Caching:**
- Results cached in `categoryCache` Map
- Cache key: `${scope}:${category}:${level}`

---

## Frontend Logger API Reference

### Accessing the Logger

```javascript
// Global access (all pages)
window.logger

// ES6 module import
import { logger } from '/scripts/shared/logger.js';
```

### Standard Logging Methods

#### `debug(category, ...args)`

Debug logging (only shown when debug mode enabled).

```javascript
logger.debug('ui', 'User clicked export button');
logger.debug('vulnerability', 'Loaded data:', { count: 1234, cached: true });
```

**When Shown:**
- Debug mode enabled (`localStorage.getItem('hextrackr_debug') === 'true'`)
- OR development environment (localhost, dev.hextrackr.com)

**Parameters:**
- `category` (string): Log category (optional for backward compatibility)
- `...args` (any): Arguments to log

#### `info(category, ...args)`

Info logging (always shown).

```javascript
logger.info('websocket', 'Connected to real-time updates');
```

**When Shown:**
- Always (unless category explicitly disabled in config)

#### `warn(category, ...args)`

Warning logging (always shown).

```javascript
logger.warn('import', 'CSV file missing vendor column');
```

**When Shown:**
- Always (unless category explicitly disabled in config)

#### `error(category, ...args)`

Error logging (always shown).

```javascript
logger.error('api', 'Failed to fetch vulnerabilities:', error);
```

**When Shown:**
- Always (unless category explicitly disabled in config)

### Audit Logging

#### `audit(category, message, data = null)`

Send encrypted audit log to backend.

```javascript
await logger.audit('ticket.create', 'User created ticket', {
  ticketId: 'TIX-123',
  assignedTo: 'jsmith'
});
```

**Parameters:**
- `category` (string): Audit category (must be in whitelist)
- `message` (string): Human-readable audit message
- `data` (object, optional): Additional structured data

**Behavior:**
- Silently returns if `global.auditEnabled = false` in config
- Sends POST request to `/api/audit-logs`
- Non-blocking (async)
- Logs warning to console if request fails (doesn't throw)

**Backend Processing:**
- AuditLogController extracts user session, IP, user agent
- LoggingService encrypts payload with AES-256-GCM
- Stores encrypted entry in database

### Debug Mode Control

#### `enableDebug()`

Enable debug mode programmatically.

```javascript
logger.enableDebug();
// Sets localStorage.hextrackr_debug = 'true'
// Logs: "🐛 Debug mode enabled"
```

#### `disableDebug()`

Disable debug mode programmatically.

```javascript
logger.disableDebug();
// Removes localStorage.hextrackr_debug
// Logs: "📊 Debug mode disabled"
```

### Console Group Methods

#### `group(label)` / `groupEnd()`

Console groups (only shown in debug mode).

```javascript
logger.group('Vulnerability Processing');
logger.debug('vulnerability', 'Step 1: Fetch data');
logger.debug('vulnerability', 'Step 2: Transform data');
logger.groupEnd();
```

#### `table(data)`

Console table (only shown in debug mode).

```javascript
logger.table([
  { cve: 'CVE-2023-1234', severity: 'High' },
  { cve: 'CVE-2023-5678', severity: 'Critical' }
]);
```

#### `time(label)` / `timeEnd(label)`

Performance timing (only shown in debug mode).

```javascript
logger.time('API Request');
await fetch('/api/vulnerabilities');
logger.timeEnd('API Request');
// Logs: "API Request: 234.56ms"
```

### Configuration Loading

The logger automatically loads configuration from `/config/logging.config.json` on initialization. Configuration is cached in `logger.config` property.

**Check if config loaded:**
```javascript
if (logger.configLoaded) {
  console.log('Config loaded:', logger.config);
}
```

---

## Configuration System

### File Location

`/app/config/logging.config.json`

### Full Configuration Schema

```json
{
  "version": "1.0.0",
  "description": "Centralized logging configuration for HexTrackr",

  "global": {
    "enabled": true,           // Master toggle
    "emojis": true,            // Show emoji indicators
    "timestamps": true,        // Include timestamps
    "auditEnabled": true,      // Enable audit trail
    "retentionDays": 30        // Audit retention (days)
  },

  "levels": {
    "production": "warn",      // Min level for NODE_ENV=production
    "development": "debug",    // Min level for NODE_ENV=development
    "test": "error"            // Min level for NODE_ENV=test
  },

  "frontend": {
    "categories": {
      "auth": { "enabled": true, "description": "..." },
      "ui": { "enabled": true, "description": "..." },
      "vulnerability": { "enabled": true, "description": "..." },
      "ticket": { "enabled": true, "description": "..." },
      "websocket": { "enabled": true, "description": "..." },
      "import": { "enabled": true, "description": "..." },
      "database": { "enabled": true, "description": "..." }
    }
  },

  "backend": {
    "categories": {
      "auth": { "enabled": true, "description": "..." },
      "database": { "enabled": true, "description": "..." },
      "import": { "enabled": true, "description": "..." },
      "api": { "enabled": true, "description": "..." },
      "worker": { "enabled": true, "description": "..." },
      "ticket": { "enabled": true, "description": "..." },
      "backup": { "enabled": true, "description": "..." },
      "vulnerability": { "enabled": true, "description": "..." }
    }
  },

  "audit": {
    "description": "Events that trigger encrypted audit log entries",
    "whitelist": [
      "user.login",
      "user.logout",
      "user.failed_login",
      "user.password_change",
      "user.account_locked",
      "ticket.create",
      "ticket.update",
      "ticket.delete",
      "import.start",
      "import.complete",
      "import.failed",
      "backup.create",
      "backup.restore",
      "settings.change",
      "database.vacuum",
      "sync.kev",
      "sync.cisco",
      "sync.palo_alto"
    ]
  },

  "emojis": {
    "debug": "🐛",
    "info": "ℹ️",
    "warn": "⚠️",
    "error": "❌",
    "success": "✅"
  },

  "performance": {
    "slowQueryThreshold": 500,    // ms
    "slowRequestThreshold": 2000, // ms
    "logMemoryUsage": false
  }
}
```

### Configuration Changes

**Hot Reload:**
- Frontend: Reload page to fetch new config
- Backend: Restart server to reload config
- Future enhancement: Watch file for changes, reload automatically

---

## Database Schema

### Migration File

`/app/public/scripts/migrations/012-create-audit-logs.sql`

### Table: `audit_logs`

Stores encrypted audit trail entries.

```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Event Classification (indexed)
    category TEXT NOT NULL,                 -- e.g., 'user.login'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- User Context (may be NULL for system events)
    user_id TEXT,
    username TEXT,

    -- Request Context
    ip_address TEXT,
    user_agent TEXT,
    request_id TEXT,                        -- Future: correlation ID

    -- Encrypted Payload
    encrypted_message BLOB NOT NULL,        -- Ciphertext + 16-byte auth tag
    encrypted_data BLOB,                    -- Legacy column (NULL)
    encryption_iv BLOB NOT NULL,            -- 12-byte IV

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
```sql
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_username ON audit_logs(username);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_category_timestamp ON audit_logs(category, timestamp);
```

### Table: `audit_log_config`

Singleton table (1 row) storing encryption key and statistics.

```sql
CREATE TABLE audit_log_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),  -- Singleton enforcement

    -- Encryption Key
    encryption_key BLOB NOT NULL,           -- AES-256 key (32 bytes)
    key_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    key_rotated_at DATETIME,                -- Future: key rotation

    -- Retention Policy
    retention_days INTEGER DEFAULT 30,
    last_cleanup_at DATETIME,

    -- Statistics
    total_logs_written INTEGER DEFAULT 0,
    total_logs_purged INTEGER DEFAULT 0,

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initialize with defaults
INSERT OR IGNORE INTO audit_log_config (id, retention_days)
VALUES (1, 30);
```

### Query Examples

**Count audit logs by category:**
```sql
SELECT category, COUNT(*) as count
FROM audit_logs
GROUP BY category
ORDER BY count DESC;
```

**Find logs for specific user in date range:**
```sql
SELECT id, category, timestamp, username, ip_address
FROM audit_logs
WHERE username = 'jsmith'
  AND timestamp BETWEEN '2025-10-01' AND '2025-10-31'
ORDER BY timestamp DESC;
```

**Get audit statistics:**
```sql
SELECT
  total_logs_written,
  total_logs_purged,
  last_cleanup_at,
  datetime('now', '-' || retention_days || ' days') as purge_cutoff
FROM audit_log_config
WHERE id = 1;
```

**Decrypt audit log entry:**
```javascript
// Node.js example
const row = db.get('SELECT encrypted_message, encryption_iv FROM audit_logs WHERE id = ?', [123]);
const decrypted = logger.decrypt(row.encrypted_message, row.encryption_iv);
console.log(decrypted); // { message: "User logged in", data: { method: "password" } }
```

---

## Adding Audit Logging to Features

### Step-by-Step Guide

#### 1. Choose Audit Category

**For existing operations**, use predefined category:
- `user.*` - User authentication operations
- `ticket.*` - Ticket CRUD operations
- `import.*` - CSV import operations
- `backup.*` - Backup/restore operations
- `settings.*` - Configuration changes
- `sync.*` - Vendor data synchronization

**For new operations**, add to `audit.whitelist` in config:

```json
{
  "audit": {
    "whitelist": [
      "existing.category",
      "new.feature.action"
    ]
  }
}
```

#### 2. Add Audit Call to Backend

**From Express route handler:**

```javascript
const LoggingService = require('../services/loggingService');
const logger = LoggingService.getInstance();

router.post('/api/tickets', async (req, res) => {
  try {
    const ticket = await ticketService.createTicket(req.body);

    // Audit log AFTER successful operation
    await logger.audit(
      'ticket.create',
      `User created ticket ${ticket.id}`,
      {
        ticketId: ticket.id,
        priority: ticket.priority,
        assignedTo: ticket.assigned_to
      },
      req.session.userId,
      req  // Express request (auto-extracts metadata)
    );

    res.json({ success: true, ticket });
  } catch (error) {
    logger.error('backend', 'ticket', 'Failed to create ticket', error);
    res.status(500).json({ error: error.message });
  }
});
```

**From service method (no Express req):**

```javascript
class TicketService {
  async deleteTicket(ticketId, userId, metadata) {
    // Perform deletion
    await this.db.run('DELETE FROM tickets WHERE id = ?', [ticketId]);

    // Audit log with manual metadata
    const logger = LoggingService.getInstance();
    await logger.audit(
      'ticket.delete',
      `Ticket ${ticketId} permanently deleted`,
      { ticketId, reason: 'user_request' },
      userId,
      {
        username: metadata.username,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      }
    );
  }
}
```

#### 3. Add Audit Call to Frontend (Optional)

For client-side actions that don't go through backend:

```javascript
// In client-side JavaScript
async function exportData() {
  const data = await fetchData();
  downloadFile(data, 'export.csv');

  // Audit the export
  await logger.audit('data.export', 'User exported vulnerability data', {
    format: 'csv',
    recordCount: data.length
  });
}
```

#### 4. Test Audit Logging

**Verify audit entry created:**

```bash
sqlite3 data/hextrackr.db "SELECT category, username, created_at FROM audit_logs ORDER BY id DESC LIMIT 1;"
```

**Verify encryption:**

```bash
sqlite3 data/hextrackr.db "SELECT length(encrypted_message), length(encryption_iv) FROM audit_logs ORDER BY id DESC LIMIT 1;"
# Should show: encrypted_message length > 0, encryption_iv = 12 bytes
```

**Test decryption** (backend only):

```javascript
const LoggingService = require('./app/services/loggingService');
const db = require('./app/database/connection');

(async () => {
  const logger = await LoggingService.initialize(db);
  const row = db.get('SELECT * FROM audit_logs WHERE id = ?', [1]);
  const decrypted = logger.decrypt(row.encrypted_message, row.encryption_iv);
  console.log('Decrypted:', decrypted);
})();
```

### Audit Logging Best Practices

**DO:**
- Log AFTER successful operation (don't log failed attempts as audit entries)
- Include structured data (IDs, timestamps, relevant details)
- Use descriptive messages ("User jsmith deleted ticket TIX-001")
- Pass Express `req` object when available (auto-extracts metadata)
- Log high-value operations (create, update, delete, export, import)

**DON'T:**
- Log sensitive data (passwords, tokens, API keys)
- Log before operation completes (may create false audit trail)
- Throw errors on audit failure (silent failure is okay)
- Block application flow waiting for audit logs
- Over-audit (don't log every GET request)

---

## Category System

### Frontend Categories (7)

| Category | Use Cases | Example Logs |
|----------|-----------|--------------|
| `auth` | Login, logout, session | "Session expired, redirecting to login" |
| `ui` | Modals, tabs, interactions | "Opened vulnerability details modal" |
| `vulnerability` | CVE data operations | "Loaded 1,234 vulnerabilities from cache" |
| `ticket` | Ticket CRUD | "Created ticket TIX-001" |
| `websocket` | Real-time updates | "WebSocket connected, subscribing to updates" |
| `import` | CSV uploads | "Imported 500 rows, 2 validation errors" |
| `database` | IndexedDB operations | "IndexedDB quota: 4.2 GB used of 10 GB" |

### Backend Categories (8)

| Category | Use Cases | Example Logs |
|----------|-----------|--------------|
| `auth` | Session middleware | "User authenticated: jsmith" |
| `database` | SQLite operations | "Database connection pool initialized" |
| `import` | CSV processing | "Detected vendor: Cisco (filename match)" |
| `api` | Endpoint handlers | "GET /api/vulnerabilities: 1,234 results, 45ms" |
| `worker` | Background jobs | "Cisco advisory sync: 12 new advisories" |
| `ticket` | Ticket service | "Email notification sent for TIX-001" |
| `backup` | Backup/restore | "Database backup created: 45.2 MB" |
| `vulnerability` | Vuln service | "CVE lookup: CVE-2023-1234 found" |

### Audit Categories (18)

Audit categories are separate from logging categories. They trigger encrypted audit trail entries.

**User Authentication (5):**
- `user.login`
- `user.logout`
- `user.failed_login`
- `user.password_change`
- `user.account_locked`

**Ticket Operations (3):**
- `ticket.create`
- `ticket.update`
- `ticket.delete`

**Data Import (3):**
- `import.start`
- `import.complete`
- `import.failed`

**System Operations (4):**
- `backup.create`
- `backup.restore`
- `settings.change`
- `database.vacuum`

**Vendor Sync (3):**
- `sync.kev`
- `sync.cisco`
- `sync.palo_alto`

---

## Encryption Implementation

### Algorithm: AES-256-GCM

**Why GCM Mode?**
- Provides both confidentiality (encryption) and authenticity (authentication tag)
- Detects tampering via 16-byte authentication tag
- Recommended by NIST for authenticated encryption
- Fast hardware acceleration available on most platforms

### Encryption Flow

```
Plaintext → JSON.stringify (if object) → UTF-8 encoding
    ↓
Generate 12-byte IV (random, unique per message)
    ↓
Create cipher: AES-256-GCM with 256-bit key + IV
    ↓
Encrypt: cipher.update() + cipher.final()
    ↓
Get auth tag: cipher.getAuthTag() (16 bytes)
    ↓
Combine: [ciphertext] + [authTag]
    ↓
Store: encrypted_message (BLOB), encryption_iv (BLOB)
```

### Decryption Flow

```
Read: encrypted_message, encryption_iv from database
    ↓
Split: ciphertext = encrypted[0:-16], authTag = encrypted[-16:]
    ↓
Create decipher: AES-256-GCM with key + IV
    ↓
Set auth tag: decipher.setAuthTag(authTag)
    ↓
Decrypt: decipher.update() + decipher.final()
    ↓
UTF-8 decode → JSON.parse (if valid JSON)
    ↓
Return: Object or String
```

### Key Management

**Key Generation:**
```javascript
// First initialization (no key exists)
this.encryptionKey = crypto.randomBytes(32); // 256 bits
db.run('UPDATE audit_log_config SET encryption_key = ? WHERE id = 1', [this.encryptionKey]);
```

**Key Retrieval:**
```javascript
// Subsequent initializations (key exists)
const row = db.get('SELECT encryption_key FROM audit_log_config WHERE id = 1');
this.encryptionKey = row.encryption_key; // Buffer
```

**Key Rotation (Future Enhancement):**
- Generate new key
- Re-encrypt all logs with new key
- Update `key_rotated_at` timestamp
- Keep old key for 30 days (decrypt legacy logs)

### Security Considerations

**Key Storage:**
- Key stored in database (not in config file)
- Accessible only to Node.js process (not exposed to clients)
- Recommend filesystem encryption (dm-crypt, BitLocker) for database file

**IV Uniqueness:**
- New IV generated for every log entry (`crypto.randomBytes(12)`)
- Never reuse IV with same key (breaks GCM security)
- 12 bytes provides 2^96 unique IVs (collision probability negligible)

**Authentication Tag:**
- 16-byte tag prevents tampering
- Decryption fails if ciphertext or metadata modified
- Provides integrity guarantee (detect if logs altered)

**Threat Model:**
- Protects against: Disk theft, unauthorized database access, SQL injection
- Does NOT protect against: Memory dumps, root access, compromised Node.js process
- Mitigation: Use HSM/KMS for key storage in high-security deployments

---

## Migration Guide

### Overview

HEX-254 is a 14-session migration project to replace ad-hoc logging with unified system.

**Foundation (Complete):**
- Session 1: Configuration + database schema
- Session 2: LoggingService implementation
- Session 3: Frontend logger + audit API

**Migration (In Progress):**
- Sessions 4-14: Migrate existing code to use new logger

### Migration Checklist

For each file being migrated:

**1. Import Logger**

**Before:**
```javascript
// No logger, or ad-hoc console.log
```

**After:**
```javascript
const LoggingService = require('./services/loggingService');
const logger = LoggingService.getInstance();
```

**2. Replace Console Calls**

**Before:**
```javascript
console.log('User authenticated:', username);
console.error('Database query failed:', error);
```

**After:**
```javascript
logger.info('backend', 'auth', `User authenticated: ${username}`);
logger.error('backend', 'database', 'Database query failed', error);
```

**3. Add Audit Logging**

**Before:**
```javascript
await db.run('DELETE FROM tickets WHERE id = ?', [ticketId]);
res.json({ success: true });
```

**After:**
```javascript
await db.run('DELETE FROM tickets WHERE id = ?', [ticketId]);

// Add audit log
await logger.audit('ticket.delete', `Ticket ${ticketId} deleted`,
  { ticketId },
  req.session.userId,
  req
);

res.json({ success: true });
```

**4. Choose Appropriate Log Level**

| Old Pattern | New Pattern |
|-------------|-------------|
| `console.log('Debug info')` | `logger.debug('backend', 'category', 'Debug info')` |
| `console.log('User action')` | `logger.info('backend', 'category', 'User action')` |
| `console.warn('Deprecation')` | `logger.warn('backend', 'category', 'Deprecation')` |
| `console.error('Exception')` | `logger.error('backend', 'category', 'Exception', error)` |

**5. Test Migration**

```bash
# Check logs appear in console
npm run dev

# Verify audit logs created
sqlite3 data/hextrackr.db "SELECT COUNT(*) FROM audit_logs;"

# Verify no console.log/error remaining
grep -r "console\." app/ --exclude-dir=node_modules
```

### Migration Sessions (HEX-256 to HEX-266)

| Session | Target Files | Focus Area |
|---------|--------------|------------|
| 4 | Auth controllers | User authentication operations |
| 5 | Ticket controllers | Ticket CRUD operations |
| 6 | Import controllers | CSV import processing |
| 7 | Backup controllers | Backup/restore operations |
| 8 | Worker scripts | Cisco/Palo Alto/KEV sync |
| 9 | Vulnerability service | CVE data operations |
| 10 | Database layer | Query logging, connection management |
| 11 | API middleware | Request/response logging |
| 12 | Error handlers | Global error logging |
| 13 | Admin UI | Audit log viewer interface |
| 14 | Cleanup | Remove old logging code, verify coverage |

---

## Testing Guide

### Unit Tests

**Test LoggingService encryption:**

```javascript
// test/loggingService.test.js
const assert = require('assert');
const LoggingService = require('../app/services/loggingService');

describe('LoggingService Encryption', () => {
  it('should encrypt and decrypt data correctly', async () => {
    const logger = LoggingService.getInstance();
    await logger.initialize(db);

    const original = { message: 'test', data: { id: 123 } };
    const { encrypted, iv } = logger.encrypt(original);
    const decrypted = logger.decrypt(encrypted, iv);

    assert.deepEqual(decrypted, original);
  });

  it('should fail decryption with wrong key', async () => {
    const logger = LoggingService.getInstance();
    const { encrypted, iv } = logger.encrypt('test');

    // Tamper with encrypted data
    encrypted[0] = encrypted[0] ^ 0xFF;

    assert.throws(() => {
      logger.decrypt(encrypted, iv);
    }, /Decryption failed/);
  });
});
```

### Integration Tests

**Test audit log API endpoint:**

```javascript
// test/auditLog.test.js
const request = require('supertest');
const app = require('../server');

describe('POST /api/audit-logs', () => {
  it('should create encrypted audit log', async () => {
    const res = await request(app)
      .post('/api/audit-logs')
      .send({
        category: 'user.login',
        message: 'Test login',
        data: { testId: 123 }
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify database entry
    const row = db.get('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 1');
    assert.equal(row.category, 'user.login');
    assert(row.encrypted_message.length > 0);
    assert(row.encryption_iv.length === 12);
  });
});
```

### Manual Testing

**Test frontend debug mode:**

```javascript
// Browser console
localStorage.setItem('hextrackr_debug', 'true');
location.reload();

// Should see debug logs in console
logger.debug('ui', 'Test debug log');
```

**Test audit logging:**

```javascript
// Browser console
await logger.audit('test.session', 'Manual test audit', { timestamp: Date.now() });

// Verify in backend
sqlite3 data/hextrackr.db "SELECT * FROM audit_logs WHERE category = 'test.session';"
```

**Test encryption/decryption:**

```javascript
// Node.js REPL
const LoggingService = require('./app/services/loggingService');
const db = require('./app/database/connection');

(async () => {
  const logger = await LoggingService.initialize(db);

  // Encrypt test data
  const { encrypted, iv } = logger.encrypt({ test: 'data' });
  console.log('Encrypted length:', encrypted.length);
  console.log('IV length:', iv.length);

  // Decrypt
  const decrypted = logger.decrypt(encrypted, iv);
  console.log('Decrypted:', decrypted);
})();
```

---

## Performance Considerations

### Frontend Performance

**Zero Cost in Production:**
- Debug logs short-circuit before formatting
- No CPU cost if debug mode disabled
- No network calls unless audit logging

**Audit Log Overhead:**
- Single POST request per audit log
- Non-blocking (async/await)
- No UI delay (fire-and-forget)

**Config Loading:**
- Single fetch on page load (cached)
- 1-2 KB JSON payload
- Non-blocking async load

### Backend Performance

**Short-Circuit Checks:**
```javascript
// Fast path: Check cache first
if (this.categoryCache.has(cacheKey)) {
  return this.categoryCache.get(cacheKey);
}

// If disabled, return immediately (no formatting)
if (!this.config.global.enabled) {
  return false;
}
```

**Async Writes:**
- Audit logs written asynchronously
- Non-blocking (application doesn't wait)
- Error handling doesn't throw (silent failure)

**Memory Usage:**
- Config cached in memory (5-10 KB)
- Category cache: Map with ~50 entries (~1 KB)
- Encryption key: 32 bytes in memory
- No log message caching (stream to database)

### Database Performance

**Indexed Queries:**
- `category` + `timestamp` composite index
- Fast range queries (last 30 days, specific category)
- User lookup indexed on `username` and `user_id`

**Cleanup Strategy:**
- Runs daily at 3 AM (low traffic)
- Uses DELETE with date filter (indexed)
- VACUUM runs separately (not during cleanup)

**Write Performance:**
- Single INSERT per audit log
- No transactions (each log independent)
- SQLite WAL mode recommended (concurrent reads)

### Optimization Tips

**Reduce Frontend Bundle Size:**
```javascript
// Conditional import (only in debug builds)
if (DEBUG) {
  const logger = await import('./logger.js');
}
```

**Batch Audit Logs** (future enhancement):
```javascript
// Queue logs, flush every 5 seconds
logger.auditBatch([
  { category: 'ticket.update', message: '...', data: {...} },
  { category: 'ticket.update', message: '...', data: {...} },
  { category: 'ticket.update', message: '...', data: {...} }
]);
```

**Reduce Encryption Overhead:**
- Use smaller IV (12 bytes optimal for GCM)
- Don't encrypt non-sensitive fields (category, timestamp)
- Batch encrypt before database write

---

## Troubleshooting

### Common Issues

**Issue: "Encryption key not initialized"**

**Cause:** LoggingService.initialize() not called, or database not ready

**Fix:**
```javascript
// Ensure initialize called in server.js
await LoggingService.initialize(db);
```

**Issue: Audit logs not created**

**Cause:** Category not in whitelist, or audit disabled

**Fix:**
```bash
# Check config
cat app/config/logging.config.json | grep -A 20 '"audit"'

# Verify category in whitelist
cat app/config/logging.config.json | grep "your.category"
```

**Issue: Frontend logs not showing**

**Cause:** Debug mode disabled, or category disabled in config

**Fix:**
```javascript
// Enable debug mode
localStorage.setItem('hextrackr_debug', 'true');
location.reload();

// Check category enabled
fetch('/config/logging.config.json')
  .then(r => r.json())
  .then(c => console.log(c.frontend.categories));
```

**Issue: High disk usage from audit logs**

**Cause:** Retention period too long, or cleanup not running

**Fix:**
```sql
-- Check log count
SELECT COUNT(*), MIN(created_at), MAX(created_at) FROM audit_logs;

-- Check cleanup status
SELECT last_cleanup_at, retention_days FROM audit_log_config;

-- Manual cleanup (remove logs older than 30 days)
DELETE FROM audit_logs WHERE timestamp < datetime('now', '-30 days');
```

---

## Related Files

**Core Implementation:**
- `/app/services/loggingService.js` - Backend service (535 lines)
- `/app/public/scripts/shared/logger.js` - Frontend logger (358 lines)
- `/app/controllers/auditLogController.js` - REST endpoint handler (101 lines)
- `/app/routes/auditLogs.js` - Express routes (26 lines)

**Configuration:**
- `/app/config/logging.config.json` - Logging configuration (136 lines)

**Database:**
- `/app/public/scripts/migrations/012-create-audit-logs.sql` - Schema (101 lines)

**Documentation:**
- `/app/public/docs-source/guides/logging-and-audit-trail.md` - User guide
- `/docs/LOGGING_SYSTEM.md` - This file (developer guide)

**Testing:**
- `/app/public/test-logger-session3.html` - Frontend integration test

---

## Appendix: Code Examples

### Example: Complete Feature with Audit Logging

```javascript
// routes/tickets.js
const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/ticketController');
const LoggingService = require('../services/loggingService');
const logger = LoggingService.getInstance();

router.post('/api/tickets', async (req, res) => {
  try {
    // Validate input
    if (!req.body.title || !req.body.priority) {
      logger.warn('backend', 'ticket', 'Invalid ticket creation request', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create ticket
    logger.debug('backend', 'ticket', 'Creating ticket', req.body);
    const ticket = await TicketController.createTicket(req.body);
    logger.info('backend', 'ticket', `Ticket created: ${ticket.id}`);

    // Audit log
    await logger.audit(
      'ticket.create',
      `User created ticket ${ticket.id}`,
      {
        ticketId: ticket.id,
        title: ticket.title,
        priority: ticket.priority
      },
      req.session.userId,
      req
    );

    res.json({ success: true, ticket });

  } catch (error) {
    logger.error('backend', 'ticket', 'Failed to create ticket', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Example: Frontend with Audit Logging

```javascript
// tickets.js (frontend)
async function createTicket(ticketData) {
  try {
    logger.debug('ticket', 'Creating ticket', ticketData);

    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    logger.info('ticket', 'Ticket created successfully', result.ticket);

    // Frontend audit log (optional, backend already logs)
    await logger.audit('ticket.create', 'User submitted ticket form', {
      ticketId: result.ticket.id,
      formType: 'quick_create'
    });

    return result.ticket;

  } catch (error) {
    logger.error('ticket', 'Failed to create ticket', error);
    throw error;
  }
}
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-17
**Maintainer**: HexTrackr Development Team
**Related Issues**: HEX-254, HEX-256 through HEX-266
