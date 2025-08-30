# server.js - API Documentation

**Generated**: 2025-08-30T01:44:55.791Z  
**Source**: server.js  
**Documentation Generator**: Claude-4

# HexTrackr Server Documentation

## Purpose

HexTrackr Server is a Node.js/Express-based backend service that provides vulnerability management and ticket tracking capabilities for security operations. The server manages a SQLite database for storing vulnerability scan results, support tickets, and related metadata, offering RESTful APIs for data import, export, and management operations.

## Architecture Overview

The server implements a monolithic architecture with the following key components:

- **Express Web Server**: Handles HTTP requests and serves static files
- **SQLite Database**: Persistent storage for vulnerabilities and tickets
- **Path Validator**: Security utility for preventing path traversal attacks
- **CSV Import/Export**: Bulk data operations for vulnerability and ticket management
- **Documentation Portal**: Self-hosted documentation system

## API Reference

### Health Check

#### `GET /health`

Returns server health status and basic metrics.

## Response

```json
{
  "status": "ok",
  "version": "1.0.0",
  "db": true,
  "uptime": 12345.67
}
```

### Vulnerability Management APIs

#### `GET /api/vulnerabilities`

Retrieves paginated vulnerability records with optional filtering.

## Query Parameters

- `page` (integer): Page number (default: 1)
- `limit` (integer): Records per page (default: 50)
- `search` (string): Search term for hostname, CVE, or plugin name
- `severity` (string): Filter by severity level

## Response: (2)

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 500,
    "pages": 10
  }
}
```

#### `GET /api/vulnerabilities/stats`

Returns aggregated vulnerability statistics grouped by severity.

## Response: (3)

```json
[
  {
    "severity": "Critical",
    "count": 25,
    "total_vpr": 250.5,
    "avg_vpr": 10.02,
    "earliest": "2024-01-01",
    "latest": "2024-01-15"
  }
]
```

#### `GET /api/vulnerabilities/trends`

Provides 14-day historical trending data for vulnerability counts.

## Response: (4)

```json
[
  {
    "date": "2024-01-15",
    "Critical": 5,
    "High": 12,
    "Medium": 23,
    "Low": 45
  }
]
```

#### `POST /api/vulnerabilities/import`

Imports vulnerability data from CSV files.

## Request

- Content-Type: `multipart/form-data`
- Field: `csvFile` - CSV file containing vulnerability data
- Field: `vendor` - Vendor identifier (optional)

## Response: (5)

```json
{
  "success": true,
  "importId": 123,
  "filename": "scan_results.csv",
  "processingTime": 1500,
  "rowsProcessed": 250
}
```

#### `DELETE /api/vulnerabilities/clear`

Removes all vulnerability data from the database.

## Response: (6)

```json
{
  "success": true,
  "message": "All vulnerability data cleared"
}
```

### Ticket Management APIs

#### `GET /api/tickets`

Retrieves all tickets ordered by creation date.

## Response: (7)

```json
[
  {
    "id": "ticket_123",
    "xt_number": "XT001",
    "date_submitted": "2024-01-15",
    "status": "Open",
    "location": "Building A",
    "devices": "[\"Device1\", \"Device2\"]",
    "supervisor": "John Doe",
    "tech": "Jane Smith",
    "notes": "Initial assessment required"
  }
]
```

#### `POST /api/tickets`

Creates a new ticket.

## Request Body

```json
{
  "id": "ticket_123",
  "xt_number": "XT001",
  "dateSubmitted": "2024-01-15",
  "dateDue": "2024-01-20",
  "hexagonTicket": "HEX123",
  "serviceNowTicket": "SN456",
  "location": "Building A",
  "devices": ["Device1", "Device2"],
  "supervisor": "John Doe",
  "tech": "Jane Smith",
  "status": "Open",
  "notes": "Initial assessment"
}
```

#### `PUT /api/tickets/:id`

Updates an existing ticket.

## Parameters

- `id`: Ticket identifier

**Request Body:** Same as POST /api/tickets

#### `DELETE /api/tickets/:id`

Deletes a ticket.

## Parameters: (2)

- `id`: Ticket identifier

## Response: (8)

```json
{
  "success": true,
  "deleted": 1
}
```

### Import/Export APIs

#### `GET /api/imports`

Retrieves import history with vulnerability counts.

## Response: (9)

```json
[
  {
    "id": 1,
    "filename": "scan_results.csv",
    "import_date": "2024-01-15T10:30:00Z",
    "row_count": 250,
    "vulnerability_count": 248,
    "vendor": "tenable",
    "processing_time": 1500
  }
]
```

#### `POST /api/import/tickets`

Imports tickets from JSON-formatted CSV data.

## Request Body: (2)

```json
{
  "data": [
    {
      "xt_number": "XT001",
      "Date Submitted": "2024-01-15",
      "Status": "Open"
    }
  ]
}
```

#### `POST /api/import/vulnerabilities`

Imports vulnerabilities from JSON-formatted CSV data.

## Request Body: (3)

```json
{
  "data": [
    {
      "hostname": "server01",
      "CVE": "CVE-2024-0001",
      "Severity": "Critical"
    }
  ]
}
```

### Backup/Restore APIs

#### `GET /api/backup/stats`

Returns database statistics for backup purposes.

## Response: (10)

```json
{
  "vulnerabilities": 500,
  "tickets": 50,
  "total": 550,
  "dbSize": 1048576
}
```

#### `GET /api/backup/vulnerabilities`

Exports vulnerability data (limited to 10,000 records).

#### `GET /api/backup/tickets`

Exports all ticket data.

#### `GET /api/backup/all`

Exports complete database backup.

#### `POST /api/restore`

Restores data from a backup file.

## Request: (2)

- Content-Type: `multipart/form-data`
- Field: `file` - Backup ZIP file
- Field: `type` - "tickets", "vulnerabilities", or "all"
- Field: `clearExisting` - "true" to clear existing data

#### `DELETE /api/backup/clear/:type`

Clears specific data types.

## Parameters: (3)

- `type`: "vulnerabilities", "tickets", or "all"

### Documentation APIs

#### `GET /api/docs/stats`

Returns documentation statistics.

## Response: (11)

```json
{
  "apiEndpoints": 15,
  "jsFunctions": 250,
  "frameworks": 4,
  "computedAt": "2024-01-15T10:30:00Z"
}
```

## Usage Examples

### Importing Vulnerability Data

```javascript
// Using FormData for file upload
const formData = new FormData();
formData.append('csvFile', fileInput.files[0]);
formData.append('vendor', 'tenable');

fetch('/api/vulnerabilities/import', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log(`Imported ${data.rowsProcessed} vulnerabilities`);
});
```

### Fetching Paginated Vulnerabilities

```javascript
// Get page 2 of Critical vulnerabilities
fetch('/api/vulnerabilities?page=2&limit=25&severity=Critical')
  .then(response => response.json())
  .then(data => {
    console.log(`Found ${data.pagination.total} total vulnerabilities`);
    data.data.forEach(vuln => {
      console.log(`${vuln.hostname}: ${vuln.cve} (VPR: ${vuln.vpr_score})`);
    });
  });
```

### Creating a New Ticket

```javascript
const ticket = {
  id: `ticket_${Date.now()}`,
  xt_number: 'XT001',
  dateSubmitted: new Date().toISOString(),
  dateDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'Open',
  location: 'Building A',
  devices: ['Server01', 'Server02'],
  supervisor: 'John Doe',
  tech: 'Jane Smith',
  notes: 'Initial vulnerability assessment'
};

fetch('/api/tickets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(ticket)
})
.then(response => response.json())
.then(data => console.log('Ticket created:', data.id));
```

## Dependencies

### NPM Packages

- **express** (^4.x): Web application framework
- **cors**: Cross-origin resource sharing middleware
- **compression**: Response compression middleware
- **sqlite3** (^5.x): SQLite database driver
- **multer**: Multipart form data handling for file uploads
- **papaparse**: CSV parsing library
- **jszip**: ZIP file creation/extraction for backups

### Node.js Built-in Modules

- **fs**: File system operations
- **path**: Path manipulation utilities

## Integration

### Database Schema

The server expects the following SQLite tables:

```sql
-- Vulnerabilities table
CREATE TABLE vulnerabilities (
  id INTEGER PRIMARY KEY,
  import_id INTEGER,
  hostname TEXT,
  ip_address TEXT,
  cve TEXT,
  severity TEXT,
  vpr_score REAL,
  cvss_score REAL,
  first_seen TEXT,
  last_seen TEXT,
  plugin_id TEXT,
  plugin_name TEXT,
  description TEXT,
  solution TEXT,
  vendor TEXT,
  vulnerability_date TEXT,
  state TEXT DEFAULT 'open',
  import_date TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  xt_number TEXT,
  date_submitted TEXT,
  date_due TEXT,
  hexagon_ticket TEXT,
  service_now_ticket TEXT,
  location TEXT,
  devices TEXT,
  supervisor TEXT,
  tech TEXT,
  status TEXT,
  notes TEXT,
  attachments TEXT,
  site TEXT,
  site_id INTEGER,
  location_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Import tracking
CREATE TABLE vulnerability_imports (
  id INTEGER PRIMARY KEY,
  filename TEXT,
  import_date TEXT,
  row_count INTEGER,
  vendor TEXT,
  file_size INTEGER,
  processing_time INTEGER,
  raw_headers TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Static File Serving

The server serves static files from the application root directory, including:

- `tickets.html` - Ticket management interface
- `vulnerabilities-new.html` - Vulnerability dashboard
- `/docs-html/` - Documentation portal

## Configuration

### Environment Variables

- `PORT`: Server port (default: 8080)

### Server Configuration

```javascript
const PORT = process.env.PORT || 8080;
const dbPath = path.join(__dirname, "data", "hextrackr.db");
```

### Upload Limits

- Maximum file size: 100MB
- Request body limit: 100MB

### Security Headers

The server automatically sets

---
*This documentation was generated automatically by Claude-4. Please review and update as needed.*
