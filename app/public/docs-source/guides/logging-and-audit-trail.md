# Logging and Audit Trail

HexTrackr features a comprehensive logging system with encrypted audit trail capabilities, providing visibility into system operations while maintaining security and compliance requirements.

## Overview

The HexTrackr logging system consists of three core components:

1. **Frontend Logger** - Category-aware browser console logging with debug mode support
2. **Backend LoggingService** - Centralized server-side logging with environment-aware log levels
3. **Encrypted Audit Trail** - AES-256-GCM encrypted storage of security-critical operations

## Frontend Debug Mode

### Enabling Debug Mode

Debug mode shows verbose diagnostic information in the browser console, useful for troubleshooting and development.

**Enable debug mode:**
```javascript
localStorage.setItem('hextrackr_debug', 'true');
location.reload();
```

**Disable debug mode:**
```javascript
localStorage.removeItem('hextrackr_debug');
location.reload();
```

**Check if debug mode is active:**
```javascript
console.log(logger.debugMode); // true or false
```

### What Debug Mode Shows

When enabled, debug mode displays:
- Detailed API request/response logging
- UI event traces (button clicks, modal opens/closes)
- WebSocket connection status and messages
- Data loading and transformation steps
- Performance timing information
- Cache hit/miss statistics

### Frontend Log Categories

The frontend logger supports seven categories:

| Category | Purpose | Example Use Cases |
|----------|---------|-------------------|
| `auth` | Authentication operations | Login, logout, session validation |
| `ui` | User interface events | Modal opens, tab switches, button clicks |
| `vulnerability` | Vulnerability data operations | Loading CVE data, filtering, aggregation |
| `ticket` | Ticket operations | Creating/updating tickets, validation |
| `websocket` | Real-time updates | Connection status, message handling |
| `import` | CSV import operations | Upload progress, validation errors |
| `database` | IndexedDB operations | Cache reads/writes, quota checks |

### Using the Frontend Logger

```javascript
// Debug logging (only shown when debug mode enabled)
logger.debug('ui', 'User clicked export button');
logger.log('vulnerability', 'Loaded 1,234 CVEs from cache');

// Info logging (always shown)
logger.info('websocket', 'Connected to real-time updates');

// Warning logging (always shown)
logger.warn('import', 'CSV file missing vendor column');

// Error logging (always shown)
logger.error('api', 'Failed to fetch vulnerabilities:', error);
```

## Backend Logging

### Environment-Based Log Levels

The backend automatically adjusts log verbosity based on environment:

- **Production** (`NODE_ENV=production`): Only `warn` and `error` messages
- **Development** (`NODE_ENV=development`): All messages including `debug`
- **Test** (`NODE_ENV=test`): Only `error` messages

### Backend Log Categories

The backend logger supports eight categories:

| Category | Purpose | Example Use Cases |
|----------|---------|-------------------|
| `auth` | Authentication middleware | Session validation, token checks |
| `database` | Database operations | Queries, transactions, connections |
| `import` | CSV import processing | Vendor detection, data validation |
| `api` | API endpoint handlers | Request processing, response formatting |
| `worker` | Background jobs | Cisco/Palo Alto sync, KEV updates |
| `ticket` | Ticket service | CRUD operations, email notifications |
| `backup` | Backup/restore | Database snapshots, restoration |
| `vulnerability` | Vulnerability service | CVE lookups, data aggregation |

### Backend Log Format

Backend logs include:
- Emoji indicator (configurable)
- ISO 8601 timestamp
- Log level (DEBUG/INFO/WARN/ERROR)
- Scope and category (`[backend:auth]`)
- Message

Example:
```
✅ [2025-10-17T14:30:45.123Z] [INFO] [backend:auth] User authenticated: jsmith
```

## Encrypted Audit Trail

### Security Features

The audit trail provides tamper-evident logging of security-critical operations:

- **Encryption**: AES-256-GCM with randomly generated 256-bit key
- **Integrity**: 16-byte authentication tag verifies data hasn't been tampered with
- **Uniqueness**: 12-byte initialization vector (IV) unique to each log entry
- **Storage**: Key stored in database, never exposed to clients
- **Retention**: Automatic cleanup after 30 days (configurable)

### What Gets Audited

The following operations are automatically logged to the encrypted audit trail:

**User Authentication:**
- `user.login` - Successful login
- `user.logout` - User logout
- `user.failed_login` - Failed login attempt
- `user.password_change` - Password changed
- `user.account_locked` - Account locked due to failed attempts

**Ticket Operations:**
- `ticket.create` - New ticket created
- `ticket.update` - Ticket modified
- `ticket.delete` - Ticket deleted

**Data Import:**
- `import.start` - CSV import started
- `import.complete` - Import finished successfully
- `import.failed` - Import failed with errors

**System Operations:**
- `backup.create` - Database backup created
- `backup.restore` - Database restored from backup
- `settings.change` - System settings modified
- `database.vacuum` - Database optimization performed

**Vendor Synchronization:**
- `sync.kev` - CISA KEV sync completed
- `sync.cisco` - Cisco advisory sync completed
- `sync.palo_alto` - Palo Alto advisory sync completed

### Audit Log Structure

Each audit log entry contains:

**Indexed Fields** (searchable, unencrypted):
- Category (e.g., `user.login`)
- Timestamp (ISO 8601)
- User ID and username
- IP address
- User agent (browser/client)

**Encrypted Payload** (AES-256-GCM encrypted):
- Human-readable message
- Additional structured data (varies by category)

### Viewing Audit Logs (Admin Only)

> **Note**: Audit log viewing interface will be available in HEX-254 Session 13.

Administrators will be able to:
- Search audit logs by category, user, or date range
- Export logs for compliance reporting
- View decrypted log details (requires admin privileges)
- Monitor system activity patterns

### Data Retention

**Default retention period:** 30 days

Audit logs older than the retention period are automatically purged:
- Cleanup runs daily at 3 AM server time
- Purged log count is tracked in statistics
- Retention period configurable in `/app/config/logging.config.json`

To change retention period, edit `logging.config.json`:
```json
{
  "global": {
    "retentionDays": 90
  }
}
```

## Configuration

### Configuration File Location

`/app/config/logging.config.json`

### Global Settings

```json
{
  "global": {
    "enabled": true,           // Master toggle for all logging
    "emojis": true,            // Show emoji indicators
    "timestamps": true,        // Include timestamps in logs
    "auditEnabled": true,      // Enable encrypted audit trail
    "retentionDays": 30        // Audit log retention (days)
  }
}
```

### Disabling Logging

**Disable all logging:**
```json
{
  "global": {
    "enabled": false
  }
}
```

**Disable audit trail only:**
```json
{
  "global": {
    "auditEnabled": false
  }
}
```

**Disable specific category:**
```json
{
  "frontend": {
    "categories": {
      "websocket": {
        "enabled": false
      }
    }
  }
}
```

### Environment Variables

The logging system respects standard Node.js environment variables:

- `NODE_ENV=production` - Minimal logging (warn/error only)
- `NODE_ENV=development` - Verbose logging (all levels)
- `NODE_ENV=test` - Minimal logging (error only)

## Troubleshooting

### Debug Mode Not Working

1. Check localStorage is accessible (privacy mode may block):
   ```javascript
   try {
     localStorage.setItem('test', '1');
     console.log('localStorage available');
   } catch (e) {
     console.error('localStorage blocked:', e);
   }
   ```

2. Verify debug flag is set:
   ```javascript
   console.log(localStorage.getItem('hextrackr_debug'));
   ```

3. Ensure page was reloaded after setting flag

### Missing Audit Logs

If audit logs are not being created:

1. Check audit is enabled in config:
   ```bash
   cat /app/config/logging.config.json | grep auditEnabled
   ```

2. Verify category is in whitelist:
   ```bash
   cat /app/config/logging.config.json | grep -A 20 '"audit"'
   ```

3. Check database table exists:
   ```bash
   sqlite3 data/hextrackr.db "SELECT COUNT(*) FROM audit_logs;"
   ```

### Performance Impact

The logging system is designed for minimal performance impact:

- Frontend logs: Zero cost in production (unless debug mode enabled)
- Backend logs: Conditional checks short-circuit before formatting
- Audit logs: Asynchronous writes, non-blocking
- Encryption: Native Node.js crypto, optimized for performance

## Security Considerations

### Audit Log Encryption

- Encryption key never exposed to clients
- Key stored in database, accessible only to server process
- Each log entry uses unique IV (initialization vector)
- Authentication tag prevents tampering
- Future enhancement: Key rotation capability

### What NOT to Log

The audit system is designed to log operations, not sensitive data. Do not include:

- Passwords or password hashes
- Session tokens or API keys
- Credit card numbers or PII
- Raw database credentials
- Unencrypted sensitive user data

### Compliance Notes

The encrypted audit trail helps meet compliance requirements for:

- **GDPR**: User action tracking, data processing logs
- **SOC 2**: Access controls, change management
- **HIPAA**: Audit controls, activity monitoring
- **PCI DSS**: Audit trail requirements (if handling payment data)

> **Important**: Always consult your compliance officer to ensure logging meets your specific regulatory requirements.

## Developer Resources

For developers implementing new features that require audit logging:

- **Developer Guide**: `/docs/LOGGING_SYSTEM.md`
- **Configuration Schema**: `/app/config/logging.config.json`
- **Database Schema**: `/app/public/scripts/migrations/012-create-audit-logs.sql`
- **Backend Service**: `/app/services/loggingService.js`
- **Frontend Logger**: `/app/public/scripts/shared/logger.js`

## Related Documentation

- [System Architecture](../architecture/system-overview.md)
- [Security Best Practices](../security/best-practices.md)
- [Developer API Reference](../api/logging-api.md)
