# Import API

The Import API provides endpoints for importing vulnerability and ticket data from various sources including CSV files and JSON payloads. It supports both standard and high-performance staging imports with progress tracking via WebSocket.

## Overview

The import system handles:
- CSV vulnerability imports from security scanners (Tenable, Qualys, etc.)
- JSON-based vulnerability and ticket imports
- High-performance staging imports for large datasets
- Real-time progress tracking
- Import history and metadata tracking

## Endpoints

### Import Vulnerabilities (Standard)

**POST** `/api/vulnerabilities/import`

Standard vulnerability CSV import with enhanced lifecycle management. Processes vulnerabilities row-by-row with immediate deduplication.

#### Request

**Headers:**
- `Content-Type: multipart/form-data`

**Body (multipart/form-data):**
- `csvFile` (file, required) - CSV file containing vulnerability data
- `vendor` (string, optional) - Vendor name (auto-extracted from filename if not provided)
- `scanDate` (string, optional) - Scan date in YYYY-MM-DD format (auto-extracted if not provided)

#### Response

```json
{
  "success": true,
  "importId": "imp_20240315_143022_abc123",
  "filename": "tenable_scan_2024-03-15.csv",
  "vendor": "Tenable",
  "scanDate": "2024-03-15",
  "totalRows": 5000,
  "imported": 4500,
  "skipped": 500,
  "duplicates": 450,
  "errors": 0,
  "processingTime": 15000
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Import failed",
  "details": "CSV parsing failed: Unexpected column count"
}
```

---

### Import Vulnerabilities (Staging)

**POST** `/api/vulnerabilities/import-staging`

High-performance vulnerability import using staging table for batch processing. Optimized for large CSV files (10,000+ rows).

#### Request

**Headers:**
- `Content-Type: multipart/form-data`

**Body (multipart/form-data):**
- `csvFile` (file, required) - CSV file containing vulnerability data
- `vendor` (string, optional) - Vendor name (auto-extracted from filename if not provided)
- `scanDate` (string, optional) - Scan date in YYYY-MM-DD format (auto-extracted if not provided)
- `sessionId` (string, optional) - Session ID for progress tracking (auto-generated if not provided)

#### Response

```json
{
  "success": true,
  "message": "Import completed successfully",
  "sessionId": "import-1710515422123-abc123",
  "filename": "large_scan_2024-03-15.csv",
  "vendor": "Qualys",
  "scanDate": "2024-03-15",
  "stats": {
    "totalRows": 50000,
    "imported": 48500,
    "duplicates": 1500,
    "newVulnerabilities": 48500,
    "updatedVulnerabilities": 0,
    "errors": 0
  },
  "processingTime": 45000,
  "performance": {
    "csvParsing": 5000,
    "stagingLoad": 10000,
    "processing": 30000,
    "rowsPerSecond": 1111
  }
}
```

#### Progress Tracking

Progress updates are sent via WebSocket to connected clients:

```json
{
  "sessionId": "import-1710515422123-abc123",
  "progress": 75,
  "message": "Processing batch 3 of 4",
  "currentStep": 2,
  "totalSteps": 3,
  "details": {
    "processedRows": 37500,
    "totalRows": 50000
  }
}
```

---

### Import Vulnerabilities (JSON)

**POST** `/api/import/vulnerabilities`

JSON-based vulnerability import for frontend data restoration and programmatic imports.

#### Request

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "vulnerabilities": [
    {
      "vulnerability_id": "VULN-001",
      "title": "Critical Security Update",
      "severity": "Critical",
      "cvss": 9.8,
      "cve_id": "CVE-2024-1234",
      "affected_hosts": "server01.example.com",
      "remediation": "Apply security patch",
      "vendor": "Microsoft",
      "scan_date": "2024-03-15"
    }
  ],
  "metadata": {
    "source": "backup_restore",
    "importDate": "2024-03-15T14:30:00Z"
  }
}
```

#### Response

```json
{
  "success": true,
  "message": "Vulnerabilities imported successfully",
  "count": 1,
  "imported": 1,
  "skipped": 0,
  "duplicates": 0
}
```

---

### Import Tickets (JSON)

**POST** `/api/import/tickets`

JSON-based ticket import for backup restoration and bulk ticket creation.

#### Request

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "tickets": [
    {
      "ticket_number": "INC0012345",
      "xt_number": "XT24-001",
      "title": "Network Maintenance",
      "description": "Scheduled maintenance window",
      "priority": "Medium",
      "status": "Open",
      "assignee": "John Doe",
      "devices": ["switch01", "router02"],
      "location": "Data Center A",
      "created_date": "2024-03-15T10:00:00Z"
    }
  ],
  "metadata": {
    "source": "servicenow_export",
    "importDate": "2024-03-15T14:30:00Z"
  }
}
```

#### Response

```json
{
  "success": true,
  "message": "Tickets imported successfully",
  "count": 1,
  "imported": 1,
  "skipped": 0,
  "errors": []
}
```

---

### Get Import History

**GET** `/api/imports`

Retrieve history of all imports with statistics and metadata.

#### Request

No parameters required.

#### Response

```json
{
  "imports": [
    {
      "import_id": "imp_20240315_143022_abc123",
      "filename": "tenable_scan_2024-03-15.csv",
      "import_date": "2024-03-15T14:30:22Z",
      "vendor": "Tenable",
      "scan_date": "2024-03-15",
      "total_rows": 5000,
      "imported_count": 4500,
      "vulnerability_count": 4500,
      "file_size": 2048576,
      "processing_time": 15000,
      "status": "completed"
    }
  ],
  "total": 25,
  "summary": {
    "totalImports": 25,
    "totalVulnerabilities": 112500,
    "lastImport": "2024-03-15T14:30:22Z"
  }
}
```

---

### Check Import Progress

**GET** `/api/import/progress/:sessionId`

Check the progress of an ongoing import operation.

#### Request

**Path Parameters:**
- `sessionId` (string, required) - Session ID from import response

#### Response

```json
{
  "sessionId": "import-1710515422123-abc123",
  "status": "processing",
  "progress": 75,
  "message": "Processing vulnerabilities",
  "currentStep": 2,
  "totalSteps": 3,
  "details": {
    "filename": "large_scan.csv",
    "processedRows": 37500,
    "totalRows": 50000,
    "estimatedTimeRemaining": 15000
  }
}
```

## File Size Limits

- Maximum file size: 100MB
- Recommended to use staging import for files > 10MB or > 10,000 rows

## Supported CSV Formats

The import system automatically detects and maps columns from various security scanner formats:

### Tenable/Nessus
- Required columns: `Plugin ID`, `Plugin Name`, `Severity`, `Host`, `Port`
- Optional: `CVE`, `CVSS`, `Solution`, `Synopsis`, `Description`

### Qualys
- Required columns: `QID`, `Title`, `Severity`, `IP`, `Port`
- Optional: `CVE ID`, `CVSS Score`, `Solution`, `Threat`, `Impact`

### Generic Format
- Required columns: `vulnerability_id`, `title`, `severity`, `host`
- Optional: `cve`, `cvss`, `port`, `remediation`, `description`

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "details": "Detailed error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `NO_FILE`: No file uploaded
- `INVALID_FORMAT`: File format not supported
- `PARSE_ERROR`: CSV parsing failed
- `DB_ERROR`: Database operation failed
- `VALIDATION_ERROR`: Data validation failed

## Performance Considerations

### Standard Import (`/api/vulnerabilities/import`)
- Best for: Small to medium files (< 10,000 rows)
- Processing: Row-by-row with immediate deduplication
- Memory usage: Moderate
- Speed: ~500-1000 rows/second

### Staging Import (`/api/vulnerabilities/import-staging`)
- Best for: Large files (> 10,000 rows)
- Processing: Batch processing via staging table
- Memory usage: Optimized for large datasets
- Speed: ~1000-2000 rows/second

## WebSocket Progress Updates

For real-time progress tracking, connect to the WebSocket endpoint:

```javascript
const ws = new WebSocket('ws://localhost:8989/ws');

ws.on('message', (data) => {
  const update = JSON.parse(data);
  if (update.type === 'import-progress') {
    console.log(`Import ${update.sessionId}: ${update.progress}%`);
  }
});
```

Progress updates include:
- Current progress percentage
- Processing step details
- Estimated time remaining
- Row processing statistics

## Rate Limiting

Import endpoints are subject to rate limiting:
- 10 imports per hour per IP address
- Maximum 3 concurrent imports

## Security

- All file uploads are validated for type and size
- File paths are validated using `PathValidator` to prevent directory traversal
- Uploaded files are automatically deleted after processing
- Input data is sanitized before database insertion
- CSV parsing uses safe parsing options to prevent injection attacks