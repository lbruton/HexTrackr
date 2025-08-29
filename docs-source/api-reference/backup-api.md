# Backup and Restore API

The Backup and Restore API provides data export capabilities and system restoration functionality for HexTrackr data.

## Overview

- **Export**: Generate JSON backups of tickets, vulnerabilities, or complete system data
- **Statistics**: Get backup-related metrics and system information  
- **Clear**: Remove data by type (tickets, vulnerabilities, or all)
- **Restore**: Upload and restore from backup ZIP files

## Endpoints

### GET /api/backup/stats

- **Description**: Get backup statistics and system metrics
- **Query**: None
- **Response**: 200 OK

```json
{
  "tickets": {
    "count": 145,
    "lastUpdated": "2025-08-29T15:30:00.000Z"
  },
  "vulnerabilities": {
    "count": 2847,
    "lastUpdated": "2025-08-29T14:15:00.000Z"
  },
  "imports": {
    "count": 12,
    "lastImport": "2025-08-29T10:00:00.000Z"
  },
  "database": {
    "size": "45.2 MB",
    "lastModified": "2025-08-29T15:30:00.000Z"
  }
}
```

### GET /api/backup/tickets

- **Description**: Export all tickets as JSON array
- **Query**: None
- **Response**: 200 OK
- **Content-Type**: application/json

```json
[
  {
    "id": "TICK-123",
    "xt_number": "XT001",
    "date_submitted": "2025-08-20T12:00:00.000Z",
    "status": "Open",
    "created_at": "2025-08-20T12:00:00.000Z"
  }
]
```

### GET /api/backup/vulnerabilities

- **Description**: Export all vulnerabilities as JSON array
- **Query**: None  
- **Response**: 200 OK
- **Content-Type**: application/json

```json
[
  {
    "id": 1,
    "hostname": "server-01",
    "cve": "CVE-2024-0001", 
    "severity": "High",
    "import_date": "2025-08-20",
    "created_at": "2025-08-20T12:00:00.000Z"
  }
]
```

### GET /api/backup/all

- **Description**: Export complete system backup as ZIP file
- **Query**: None
- **Response**: 200 OK  
- **Content-Type**: application/zip
- **Filename**: `hextrackr-backup-YYYY-MM-DD.zip`

Contains:

- `tickets.json` - All ticket data
- `vulnerabilities.json` - All vulnerability data  
- `imports.json` - Import history
- `metadata.json` - Backup metadata and timestamps

### DELETE /api/backup/clear/:type

- **Description**: Clear data by type
- **Parameters**:
  - `type`: "tickets", "vulnerabilities", or "all"
- **Response**: 200 OK

```json
{
  "success": true,
  "message": "Tickets data cleared",
  "recordsDeleted": 145
}
```

### POST /api/restore

- **Description**: Restore system from backup ZIP file
- **Body**: multipart/form-data
  - `file`: ZIP file (required)
  - `type`: "tickets", "vulnerabilities", or "all" (optional, default: "all")  
  - `clearExisting`: boolean (optional, default: false)
- **Response**: 200 OK

```json
{
  "success": true,
  "restored": {
    "tickets": 145,
    "vulnerabilities": 2847,
    "imports": 12
  },
  "processingTime": 3456
}
```

## Error Responses

### 400 Bad Request

- Missing required file parameter
- Invalid type parameter
- Corrupted or invalid backup file

### 500 Internal Server Error

- Database operation failures
- File system errors during backup/restore

## Security Notes

- Backup files contain sensitive data and should be handled securely
- Clear operations are irreversible - use with caution
- Restore operations can overwrite existing data if `clearExisting` is true
- Large datasets may take significant time to backup or restore

## Usage Examples

## Examples

### Complete System Backup

```bash
curl -X GET http://localhost:3000/api/backup/all 
  -H "Accept: application/json" 
  > complete_backup.json
```

### Restore from Backup

```bash
curl -X POST http://localhost:3000/api/restore 
  -F "backupFile=@complete_backup.json" 
  -H "Content-Type: multipart/form-data"
```

### Clear All Data

```bash
curl -X DELETE http://localhost:3000/api/backup/clear/all
```
