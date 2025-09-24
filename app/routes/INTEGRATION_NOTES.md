# Backup Module Integration Notes

## Module Overview

The Backup/Restore Module has been successfully extracted from server.js into modular components:

- **Routes**: `/app/routes/backup.js` - Express router for backup endpoints
- **Controller**: `/app/controllers/backupController.js` - HTTP request handlers
- **Service**: `/app/services/backupService.js` - Business logic and database operations

## Extracted Server.js Lines

### Backup Endpoints (Lines Extracted)

- Line 2701: `DELETE /api/backup/clear/:type` - Clear data endpoint
- Line 3274-3302: `GET /api/backup/stats` - Backup statistics
- Line 3304-3317: `GET /api/backup/vulnerabilities` - Export vulnerabilities
- Line 3606-3621: `GET /api/backup/tickets` - Export tickets
- Line 3623-3651: `GET /api/backup/all` - Export complete backup
- Line 3654-3798: `POST /api/restore` - Restore from backup file

## Integration with server.js (T053)

When T053 is executed, the following changes will be made to `/app/public/server.js`:

### 1. Add Module Imports (around line 10-20)

```javascript
// Backup Module Integration (T053)
const backupRoutes = require("../routes/backup");
const BackupController = require("../controllers/backupController");
```

### 2. Initialize Backup Module (after database connection around line 1935)

```javascript
// Initialize backup module with database connection (T053)
BackupController.initialize(db);
```

### 3. Mount Backup Routes (around line 2690 with other routes)

```javascript
// Mount backup routes (T053)
app.use("/api/backup", backupRoutes);
```

### 4. Remove Original Backup Code (T053)

The following lines will be REMOVED from server.js:

- Lines 2701-2771: Clear data endpoint
- Lines 3274-3302: Backup stats endpoint
- Lines 3304-3317: Export vulnerabilities endpoint
- Lines 3606-3621: Export tickets endpoint
- Lines 3623-3651: Export complete backup endpoint
- Lines 3654-3798: Restore endpoint

## Module Dependencies

### Required NPM Packages (already in package.json)

- `express` - Web framework
- `multer` - File upload middleware
- `jszip` - ZIP file handling for backups
- `sqlite3` - Database operations

### Internal Dependencies

- `PathValidator` - Secure file operations (app/utils/PathValidator.js)
- `FileService` - File handling utilities (app/services/fileService.js)
- `DatabaseService` - Database abstractions (app/services/databaseService.js)

## API Endpoints Maintained

All original API endpoints are preserved with identical functionality:

```
DELETE /api/backup/clear/:type          - Clear data by type
GET    /api/backup/stats               - Get backup statistics
GET    /api/backup/vulnerabilities     - Export vulnerabilities
GET    /api/backup/tickets             - Export tickets
GET    /api/backup/all                 - Export complete backup
POST   /api/restore                    - Restore from backup file
```

## Testing Requirements

After T053 integration:

1. Restart Docker: `docker-compose restart`
2. Test all backup endpoints: `curl http://localhost:8989/api/backup/stats`
3. Run Playwright tests to verify functionality
4. Verify backup/restore operations work identically to original implementation

## Error Handling

The module maintains the same error handling patterns as the original server.js:

- Database errors return 500 status codes
- Validation errors return 400 status codes
- All errors include detailed error messages
- File cleanup on restore failures

## Security Considerations

All file operations use `PathValidator` to prevent:

- Directory traversal attacks
- Invalid file path access
- Unauthorized file operations

Upload restrictions maintain original security:

- 100MB file size limit
- JSON/ZIP file type validation
- Secure file cleanup after processing
