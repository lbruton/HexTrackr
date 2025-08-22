# Deprecated Services - HexTrackr v2.3.0

This folder contains database and API services that have been deprecated in favor of the PostgreSQL backend implementation.

## Moved Files

### SQLite Services
- `sqlite-service.js` - Client-side SQLite database service
  - **Reason for deprecation**: Replaced by PostgreSQL backend with streaming CSV processing
  - **Issues**: Caused conflicts with new PostgreSQL implementation, had broken functions like `bulkInsertIndexedDBOptimized`

### Turso Cloud Database Services
- `turso-service.js` - Turso cloud SQLite database service
- `turso-config.js` - Turso configuration management
- `turso-demo.js` - Turso demonstration scripts
  - **Reason for deprecation**: Moving to PostgreSQL for better performance and reliability with large CSV files
  - **Issues**: Added complexity with multiple database backends causing conflicts

## Current Architecture

**Active Database**: PostgreSQL (via `database-service.js`)
- Streaming CSV processing for large files
- Server-side processing via `/api/import/upload-csv` endpoint
- Better performance for 60MB+ files

## Future Considerations

These services may be revisited in the future for:
- Optional cloud backup functionality
- Client-side processing for very small files
- Alternative deployment scenarios

## Date Deprecated
August 21, 2025 - During HexTrackr v2.3.0 debugging session

## Context
Moved during troubleshooting session to isolate PostgreSQL CSV import functionality. Multiple database backends were causing conflicts where frontend would attempt SQLite processing even after PostgreSQL conversion.
