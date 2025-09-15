# Complete API Reference

Comprehensive documentation of all HexTrackr API endpoints with detailed request/response examples, error handling, and integration guidelines.

---

## API Overview

**Base URL**: `http://localhost:8989`
**Content-Type**: `application/json` (unless specified otherwise)
**Rate Limiting**: 100 requests per 15-minute window per IP
**WebSocket**: `ws://localhost:8988` for real-time updates

---

## Authentication & Security

### Current State

- **Authentication**: Not implemented (open API)
- **Authorization**: Not implemented
- **Security Headers**: Enabled (HSTS, XSS Protection, Content-Type Options)
- **CORS**: Configurable (default: all origins)
- **Rate Limiting**: IP-based with configurable thresholds

### Planned Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- API key authentication for integrations
- OAuth 2.0 support

---

## Health & Status

### GET /health

System health check and status information.

**Request**:

```http
GET /health HTTP/1.1
Host: localhost:8989
```

**Response** `200 OK`:

```json
{
  "status": "healthy",
  "version": "1.0.13",
  "database": {
    "status": "connected",
    "tables": ["vulnerabilities", "tickets", "vulnerability_imports"],
    "lastBackup": "2025-01-12T10:30:00Z"
  },
  "websocket": {
    "status": "running",
    "port": 8988,
    "connections": 3
  },
  "uptime": "2d 4h 15m 32s",
  "memory": {
    "used": "156.2 MB",
    "total": "512 MB"
  },
  "disk": {
    "available": "15.2 GB",
    "database_size": "42.3 MB"
  }
}
```

---

## Vulnerability Management API

### GET /api/vulnerabilities

Retrieve paginated list of active vulnerabilities.

**Query Parameters**:

- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50, max: 200)
- `search` (string, optional): Search term for hostname, CVE, or plugin name
- `severity` (string, optional): Filter by severity (`Critical`, `High`, `Medium`, `Low`)
- `lifecycle_state` (string, optional): Filter by state (`active`, `reopened`, `resolved`)
- `host` (string, optional): Filter by specific hostname
- `date_range` (string, optional): Format "YYYY-MM-DD,YYYY-MM-DD"

**Request**:

```http
GET /api/vulnerabilities?page=1&limit=25&severity=Critical&search=SSH HTTP/1.1
Host: localhost:8989
```

**Response** `200 OK`:

```json
{
  "data": [
    {
      "id": 1245,
      "import_id": 42,
      "hostname": "web-server-01.corp.local",
      "ip_address": "10.0.1.15",
      "cve": "CVE-2024-0001",
      "severity": "Critical",
      "vpr_score": 9.2,
      "cvss_base_score": 9.8,
      "cvss_temporal_score": 8.7,
      "plugin_id": "12345",
      "plugin_name": "OpenSSH Remote Code Execution",
      "description": "Remote code execution vulnerability in OpenSSH server",
      "solution": "Update OpenSSH to version 9.6 or later",
      "first_seen": "2025-01-10T08:30:00Z",
      "last_seen": "2025-01-12T14:20:00Z",
      "lifecycle_state": "active",
      "scan_date": "2025-01-12T14:20:00Z",
      "vendor": "tenable",
      "port": 22,
      "protocol": "TCP",
      "exploit_available": true,
      "patch_publication_date": "2025-01-08T00:00:00Z",
      "vulnerability_publication_date": "2025-01-05T00:00:00Z",
      "tags": ["ssh", "rce", "critical-infrastructure"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 1847,
    "pages": 74,
    "has_next": true,
    "has_prev": false
  },
  "filters_applied": {
    "severity": "Critical",
    "search": "SSH",
    "active_filters_count": 2
  },
  "meta": {
    "query_time": "0.045s",
    "cache_hit": false,
    "total_without_filters": 5234
  }
}
```

### GET /api/vulnerabilities/stats

Aggregate vulnerability statistics and metrics.

**Request**:

```http
GET /api/vulnerabilities/stats HTTP/1.1
Host: localhost:8989
```

**Response** `200 OK`:

```json
{
  "by_severity": [
    {
      "severity": "Critical",
      "count": 89,
      "percentage": 4.2,
      "avg_vpr_score": 9.1,
      "avg_age_days": 12.5
    },
    {
      "severity": "High",
      "count": 342,
      "percentage": 16.3,
      "avg_vpr_score": 7.8,
      "avg_age_days": 28.3
    },
    {
      "severity": "Medium",
      "count": 1108,
      "percentage": 52.7,
      "avg_vpr_score": 5.2,
      "avg_age_days": 45.2
    },
    {
      "severity": "Low",
      "count": 563,
      "percentage": 26.8,
      "avg_vpr_score": 2.1,
      "avg_age_days": 67.8
    }
  ],
  "totals": {
    "active_vulnerabilities": 2102,
    "resolved_last_30_days": 456,
    "newly_discovered_last_7_days": 78,
    "unique_hosts": 245,
    "unique_cves": 1847
  },
  "trends": {
    "total_change_7_days": +23,
    "critical_change_7_days": +5,
    "resolution_rate_30_days": 0.178
  },
  "top_vulnerability_families": [
    {
      "family": "Web Application Vulnerabilities",
      "count": 423,
      "percentage": 20.1
    },
    {
      "family": "Operating System Vulnerabilities",
      "count": 389,
      "percentage": 18.5
    }
  ]
}
```

### GET /api/vulnerabilities/trends

Historical vulnerability trends and analytics.

**Query Parameters**:

- `period` (string, optional): Time period (`7d`, `30d`, `90d`, `1y`) (default: 30d)
- `granularity` (string, optional): Data granularity (`daily`, `weekly`, `monthly`) (default: daily)

**Request**:

```http
GET /api/vulnerabilities/trends?period=30d&granularity=daily HTTP/1.1
Host: localhost:8989
```

**Response** `200 OK`:

```json
{
  "period": "30d",
  "granularity": "daily",
  "data_points": 30,
  "trends": [
    {
      "date": "2025-01-12",
      "total_active": 2102,
      "new_discoveries": 12,
      "resolved": 8,
      "critical": 89,
      "high": 342,
      "medium": 1108,
      "low": 563,
      "net_change": +4
    }
  ],
  "summary": {
    "avg_daily_discoveries": 14.2,
    "avg_daily_resolutions": 11.8,
    "peak_vulnerabilities": {
      "date": "2025-01-03",
      "count": 2156
    },
    "best_resolution_day": {
      "date": "2025-01-08",
      "resolved": 34
    }
  }
}
```

### POST /api/vulnerabilities/import

Import vulnerability data from CSV file with rollover processing.

**Content-Type**: `multipart/form-data`

**Request**:

```http
POST /api/vulnerabilities/import HTTP/1.1
Host: localhost:8989
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="csvFile"; filename="vulnerabilities_2025-01-12.csv"
Content-Type: text/csv

hostname,cve,severity,vpr_score,plugin_id,plugin_name
web-server-01,CVE-2024-0001,Critical,9.2,12345,"OpenSSH RCE"
------WebKitFormBoundary
Content-Disposition: form-data; name="vendor"

tenable
------WebKitFormBoundary
Content-Disposition: form-data; name="scanDate"

2025-01-12T14:20:00Z
------WebKitFormBoundary--
```

**Success Response** `200 OK`:

```json
{
  "success": true,
  "import_id": 47,
  "processing_stats": {
    "total_rows_processed": 1847,
    "new_vulnerabilities": 78,
    "updated_vulnerabilities": 234,
    "resolved_vulnerabilities": 45,
    "skipped_duplicates": 12,
    "processing_time_ms": 3420
  },
  "scan_metadata": {
    "scan_date": "2025-01-12T14:20:00Z",
    "vendor": "tenable",
    "filename": "vulnerabilities_2025-01-12.csv",
    "file_size": 2048576
  },
  "data_quality": {
    "valid_cves": 1835,
    "invalid_cves": 12,
    "missing_fields": 0,
    "data_quality_score": 0.993
  },
  "rollover_results": {
    "snapshot_created": true,
    "current_table_updated": true,
    "daily_totals_updated": true,
    "stale_entries_removed": 23
  }
}
```

**Error Response** `400 Bad Request`:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CSV_FORMAT",
    "message": "CSV file contains invalid format or missing required columns",
    "details": {
      "required_columns": ["hostname", "cve", "severity"],
      "missing_columns": ["hostname"],
      "invalid_rows": [3, 7, 12],
      "line_errors": [
        {
          "line": 3,
          "error": "Missing hostname field"
        }
      ]
    }
  }
}
```

### DELETE /api/vulnerabilities/clear

Clear all vulnerability data (admin operation).

**Request**:

```http
DELETE /api/vulnerabilities/clear HTTP/1.1
Host: localhost:8989
Content-Type: application/json

{
  "confirm": true,
  "backup_before_clear": true
}
```

**Response** `200 OK`:

```json
{
  "success": true,
  "message": "All vulnerability data cleared successfully",
  "backup_created": {
    "backup_id": "backup_2025-01-12_10-30-45",
    "records_backed_up": 2102,
    "backup_size_bytes": 15728640
  },
  "cleared_tables": [
    "vulnerabilities",
    "vulnerability_snapshots",
    "vulnerabilities_current",
    "vulnerability_daily_totals"
  ]
}
```

---

## Ticket Management API

### GET /api/tickets

Retrieve tickets with filtering and pagination.

**Query Parameters**:

- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50)
- `status` (string, optional): Filter by status (`Open`, `In Progress`, `Resolved`, `Closed`)
- `urgency` (string, optional): Filter by urgency (`Low`, `Medium`, `High`, `Critical`)
- `assigned_to` (string, optional): Filter by assignee
- `location` (string, optional): Filter by location
- `created_after` (string, optional): ISO date string
- `created_before` (string, optional): ISO date string

**Request**:

```http
GET /api/tickets?status=Open&urgency=High&page=1&limit=25 HTTP/1.1
Host: localhost:8989
```

**Response** `200 OK`:

```json
{
  "data": [
    {
      "id": "TKT-2025-0234",
      "location": "Data Center 1 - Rack A3",
      "devices": [
        "web-server-01.corp.local",
        "db-server-02.corp.local"
      ],
      "description": "Critical SSH vulnerabilities requiring immediate patching",
      "urgency": "High",
      "category": "Security",
      "status": "Open",
      "assigned_to": "john.doe@company.com",
      "created_date": "2025-01-12T09:15:00Z",
      "updated_date": "2025-01-12T14:30:00Z",
      "notes": "Coordinated with security team. Maintenance window scheduled for tonight.",
      "related_vulnerabilities": [
        "CVE-2024-0001",
        "CVE-2024-0002"
      ],
      "estimated_resolution": "2025-01-13T02:00:00Z",
      "priority_score": 8.5,
      "tags": ["ssh", "critical", "infrastructure"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 127,
    "pages": 6,
    "has_next": true,
    "has_prev": false
  },
  "summary": {
    "total_open": 45,
    "total_in_progress": 23,
    "total_high_urgency": 12,
    "avg_resolution_time_hours": 18.5
  }
}
```

### POST /api/tickets

Create a new support ticket.

**Request**:

```http
POST /api/tickets HTTP/1.1
Host: localhost:8989
Content-Type: application/json

{
  "location": "Data Center 1 - Rack A3",
  "devices": [
    "web-server-01.corp.local",
    "db-server-02.corp.local"
  ],
  "description": "Critical SSH vulnerabilities requiring immediate patching",
  "urgency": "High",
  "category": "Security",
  "assigned_to": "john.doe@company.com",
  "related_vulnerabilities": [
    "CVE-2024-0001",
    "CVE-2024-0002"
  ],
  "estimated_resolution": "2025-01-13T02:00:00Z",
  "tags": ["ssh", "critical", "infrastructure"]
}
```

**Response** `201 Created`:

```json
{
  "success": true,
  "ticket": {
    "id": "TKT-2025-0235",
    "location": "Data Center 1 - Rack A3",
    "devices": [
      "web-server-01.corp.local",
      "db-server-02.corp.local"
    ],
    "description": "Critical SSH vulnerabilities requiring immediate patching",
    "urgency": "High",
    "category": "Security",
    "status": "Open",
    "assigned_to": "john.doe@company.com",
    "created_date": "2025-01-12T15:45:00Z",
    "updated_date": "2025-01-12T15:45:00Z",
    "notes": "",
    "related_vulnerabilities": [
      "CVE-2024-0001",
      "CVE-2024-0002"
    ],
    "estimated_resolution": "2025-01-13T02:00:00Z",
    "priority_score": 8.5,
    "tags": ["ssh", "critical", "infrastructure"]
  }
}
```

### PUT /api/tickets/:id

Update an existing ticket.

**Request**:

```http
PUT /api/tickets/TKT-2025-0234 HTTP/1.1
Host: localhost:8989
Content-Type: application/json

{
  "status": "In Progress",
  "notes": "Started patching process. Web-server-01 completed successfully.",
  "assigned_to": "jane.smith@company.com"
}
```

**Response** `200 OK`:

```json
{
  "success": true,
  "ticket": {
    "id": "TKT-2025-0234",
    "status": "In Progress",
    "notes": "Started patching process. Web-server-01 completed successfully.",
    "assigned_to": "jane.smith@company.com",
    "updated_date": "2025-01-12T16:20:00Z"
  }
}
```

### DELETE /api/tickets/:id

Delete a ticket (soft delete).

**Request**:

```http
DELETE /api/tickets/TKT-2025-0234 HTTP/1.1
Host: localhost:8989
```

**Response** `200 OK`:

```json
{
  "success": true,
  "message": "Ticket TKT-2025-0234 deleted successfully",
  "deleted_at": "2025-01-12T16:25:00Z"
}
```

---

## Backup & Restore API

### GET /api/backup/all

Export complete database backup.

**Query Parameters**:

- `format` (string, optional): Export format (`json`, `csv`) (default: json)
- `include_resolved` (boolean, optional): Include resolved vulnerabilities (default: false)
- `compress` (boolean, optional): Compress response (default: true)

**Request**:

```http
GET /api/backup/all?format=json&compress=true HTTP/1.1
Host: localhost:8989
```

**Response** `200 OK`:

```json
{
  "backup_metadata": {
    "backup_id": "backup_2025-01-12_16-30-00",
    "created_at": "2025-01-12T16:30:00Z",
    "version": "1.0.13",
    "format": "json",
    "compressed": true,
    "total_records": 2229
  },
  "data": {
    "vulnerabilities": [
      {
        "id": 1245,
        "hostname": "web-server-01.corp.local",
        "cve": "CVE-2024-0001"
      }
    ],
    "tickets": [
      {
        "id": "TKT-2025-0234",
        "location": "Data Center 1",
        "status": "Open"
      }
    ],
    "vulnerability_imports": [
      {
        "id": 47,
        "filename": "vulnerabilities_2025-01-12.csv",
        "import_date": "2025-01-12T14:20:00Z"
      }
    ]
  }
}
```

### POST /api/restore

Restore data from backup file.

**Content-Type**: `multipart/form-data`

**Request**:

```http
POST /api/restore HTTP/1.1
Host: localhost:8989
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="backup_2025-01-12.json"
Content-Type: application/json

{backup data}
------WebKitFormBoundary
Content-Disposition: form-data; name="options"

{
  "clear_existing": true,
  "validate_data": true,
  "create_backup_before_restore": true
}
------WebKitFormBoundary--
```

**Response** `200 OK`:

```json
{
  "success": true,
  "restore_id": "restore_2025-01-12_16-45-00",
  "backup_created": {
    "backup_id": "pre_restore_backup_2025-01-12_16-44-30",
    "records_backed_up": 2102
  },
  "restoration_stats": {
    "vulnerabilities_restored": 1847,
    "tickets_restored": 234,
    "imports_restored": 45,
    "total_records": 2126,
    "validation_errors": 0,
    "processing_time_ms": 5420
  },
  "warnings": []
}
```

---

## Reference Data API

### GET /api/sites

List all available sites/locations.

**Response** `200 OK`:

```json
{
  "sites": [
    {
      "id": "DC1",
      "name": "Data Center 1",
      "location": "New York, NY",
      "active_devices": 45,
      "total_vulnerabilities": 234
    },
    {
      "id": "DC2",
      "name": "Data Center 2",
      "location": "San Francisco, CA",
      "active_devices": 67,
      "total_vulnerabilities": 189
    }
  ]
}
```

### GET /api/locations

List all device locations within sites.

**Response** `200 OK`:

```json
{
  "locations": [
    {
      "site_id": "DC1",
      "location": "Rack A1",
      "device_count": 8,
      "vulnerability_count": 23
    },
    {
      "site_id": "DC1",
      "location": "Rack A2",
      "device_count": 6,
      "vulnerability_count": 31
    }
  ]
}
```

---

## WebSocket API

### Connection

Connect to WebSocket server for real-time updates.

**Connection**:

```javascript
const socket = io('ws://localhost:8988');
```

### Events

#### Progress Updates

Real-time progress for long-running operations.

**Event**: `import_progress`

```json
{
  "session_id": "session_12345",
  "operation": "vulnerability_import",
  "progress": 0.65,
  "current_step": "Processing CSV data",
  "processed_rows": 1200,
  "total_rows": 1847,
  "eta_seconds": 45,
  "status": "processing"
}
```

#### Import Complete

Notification when import operations finish.

**Event**: `import_complete`

```json
{
  "session_id": "session_12345",
  "operation": "vulnerability_import",
  "success": true,
  "import_id": 47,
  "total_processed": 1847,
  "processing_time_ms": 3420,
  "summary": {
    "new": 78,
    "updated": 234,
    "resolved": 45
  }
}
```

#### Data Updates

Broadcast when vulnerability or ticket data changes.

**Event**: `data_updated`

```json
{
  "type": "vulnerabilities",
  "action": "created",
  "count": 12,
  "affected_hosts": ["web-server-01", "db-server-02"],
  "timestamp": "2025-01-12T16:50:00Z"
}
```

#### System Alerts

Critical system notifications.

**Event**: `system_alert`

```json
{
  "level": "warning",
  "message": "Database backup recommended - last backup was 7 days ago",
  "category": "maintenance",
  "action_required": false,
  "timestamp": "2025-01-12T16:55:00Z"
}
```

---

## Error Handling

### Standard Error Format

All API endpoints return errors in consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "specific field that caused error",
      "received": "invalid_value",
      "expected": "valid_format"
    },
    "request_id": "req_12345",
    "timestamp": "2025-01-12T17:00:00Z"
  }
}
```

### Common Error Codes

#### 400 Bad Request

- `INVALID_REQUEST_FORMAT`: Request body format invalid
- `MISSING_REQUIRED_FIELD`: Required field missing
- `INVALID_FIELD_VALUE`: Field value doesn't meet validation requirements
- `INVALID_CSV_FORMAT`: CSV file format errors
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit

#### 429 Too Many Requests

- `RATE_LIMIT_EXCEEDED`: IP has exceeded rate limit

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 15 minutes.",
    "details": {
      "limit": 100,
      "window_minutes": 15,
      "reset_time": "2025-01-12T17:15:00Z"
    }
  }
}
```

#### 500 Internal Server Error

- `DATABASE_ERROR`: Database operation failed
- `PROCESSING_ERROR`: Data processing error
- `WEBSOCKET_ERROR`: WebSocket communication error

---

## Additional API Endpoints

### GET /api/vulnerabilities/resolved

Retrieve resolved vulnerabilities with pagination.

**Query Parameters**:

- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50)
- `resolved_after` (string, optional): ISO date string
- `resolved_before` (string, optional): ISO date string

**Request**:

```http
GET /api/vulnerabilities/resolved?page=1&limit=25 HTTP/1.1
Host: localhost:8989
```

**Response** `200 OK`:

```json
{
  "data": [
    {
      "id": 1156,
      "hostname": "web-server-03.corp.local",
      "cve": "CVE-2024-0003",
      "severity": "High",
      "lifecycle_state": "resolved",
      "resolved_date": "2025-01-10T14:30:00Z",
      "resolution_time_hours": 72.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 456,
    "pages": 19
  }
}
```

### GET /api/vulnerabilities/recent-trends

Get recent vulnerability trend analysis (current vs previous period).

**Response** `200 OK`:

```json
{
  "current_period": {
    "total": 2102,
    "critical": 89,
    "high": 342,
    "date_range": "2025-01-06 to 2025-01-12"
  },
  "previous_period": {
    "total": 2079,
    "critical": 84,
    "high": 339,
    "date_range": "2024-12-30 to 2025-01-05"
  },
  "changes": {
    "total_change": +23,
    "critical_change": +5,
    "high_change": +3,
    "trend": "increasing"
  }
}
```

### POST /api/vulnerabilities/import-staging

Import vulnerabilities to staging table for preview/validation.

**Content-Type**: `multipart/form-data`

**Response** `200 OK`:

```json
{
  "success": true,
  "staging_id": "staging_12345",
  "preview_stats": {
    "total_rows": 1847,
    "valid_rows": 1835,
    "invalid_rows": 12,
    "estimated_new": 78,
    "estimated_updates": 234
  }
}
```

### GET /api/imports

List import history with metadata.

**Query Parameters**:

- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20)
- `vendor` (string, optional): Filter by vendor

**Response** `200 OK`:

```json
{
  "imports": [
    {
      "id": 47,
      "filename": "vulnerabilities_2025-01-12.csv",
      "vendor": "tenable",
      "import_date": "2025-01-12T14:20:00Z",
      "row_count": 1847,
      "processing_time": 3420,
      "file_size": 2048576,
      "status": "completed"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 47
  }
}
```

### POST /api/tickets/migrate

Migrate tickets from external systems.

**Request**:

```http
POST /api/tickets/migrate HTTP/1.1
Host: localhost:8989
Content-Type: application/json

{
  "tickets": [
    {
      "external_id": "SN-12345",
      "system": "servicenow",
      "location": "Data Center 1",
      "status": "Open"
    }
  ],
  "migration_options": {
    "update_existing": true,
    "preserve_ids": false
  }
}
```

**Response** `200 OK`:

```json
{
  "success": true,
  "migration_stats": {
    "total_processed": 25,
    "created": 18,
    "updated": 7,
    "skipped": 0,
    "errors": 0
  }
}
```

### DELETE /api/backup/clear/:type

Clear specific data types (vulnerabilities, tickets, imports).

**Path Parameters**:

- `type` (string): Data type to clear (`vulnerabilities`, `tickets`, `imports`)

**Request**:

```http
DELETE /api/backup/clear/vulnerabilities HTTP/1.1
Host: localhost:8989
Content-Type: application/json

{
  "confirm": true,
  "backup_before_clear": true
}
```

**Response** `200 OK`:

```json
{
  "success": true,
  "type": "vulnerabilities",
  "records_cleared": 2102,
  "backup_created": "backup_2025-01-12_17-15-30"
}
```

### GET /api/backup/stats

Get backup and database statistics.

**Response** `200 OK`:

```json
{
  "database": {
    "vulnerabilities": 2102,
    "tickets": 234,
    "imports": 47,
    "total_size_mb": 42.3
  },
  "last_backup": {
    "date": "2025-01-12T10:30:00Z",
    "size_mb": 38.7,
    "type": "automatic"
  },
  "recommendations": [
    "Consider backup - last backup was 7 hours ago"
  ]
}
```

### GET /api/docs/stats

Documentation system statistics and health.

**Response** `200 OK`:

```json
{
  "documentation": {
    "total_files": 45,
    "total_size_kb": 1024,
    "last_updated": "2025-01-12T16:00:00Z",
    "api_endpoints_documented": 32,
    "coverage_percentage": 95.8
  },
  "health": {
    "broken_links": 0,
    "outdated_content": 2,
    "missing_examples": 1
  }
}
```

---

## Development and Testing Endpoints

### GET /docs-html

Serve documentation portal (HTML interface).

### GET /docs-html/:section.html

Serve specific documentation sections.

**Path Parameters**:

- `section` (string): Documentation section name

---

## File Upload Specifications

### CSV Import Format

**Supported Columns** (case-insensitive):

- `hostname` (required): Device hostname or FQDN
- `ip_address` (optional): Device IP address
- `cve` (optional): CVE identifier
- `severity` (required): Critical, High, Medium, Low
- `vpr_score` (optional): Vulnerability Priority Rating (0-10)
- `cvss_score` (optional): CVSS Base Score (0-10)
- `plugin_id` (optional): Scanner plugin identifier
- `plugin_name` (optional): Scanner plugin name
- `description` (optional): Vulnerability description
- `solution` (optional): Remediation guidance
- `first_seen` (optional): ISO date string
- `last_seen` (optional): ISO date string

**File Constraints**:

- Maximum file size: 50MB
- Supported formats: CSV, TXT
- Encoding: UTF-8
- Maximum rows: 100,000 per import

### Backup/Restore Format

**Supported Formats**:

- JSON: Complete structured export
- CSV: Individual table exports
- ZIP: Compressed multi-table exports

**Restore Options**:

- `clear_existing`: Remove existing data before restore
- `validate_data`: Validate data integrity during restore
- `create_backup_before_restore`: Safety backup before operation

---

This comprehensive API reference provides complete technical specifications for integrating with HexTrackr, suitable for security review and development planning.
