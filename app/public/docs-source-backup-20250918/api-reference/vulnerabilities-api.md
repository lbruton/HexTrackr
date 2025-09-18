# Vulnerabilities API

HexTrackr exposes a set of REST endpoints for reporting, trending, and importing vulnerability data. The API operates on the rollover pipeline described in [Database Architecture](../architecture/database.md) and surfaces both the deduplicated current state (`vulnerabilities_current`) and supporting metadata.

**Related reading**: [Data Model](../architecture/data-model.md) for table layouts and column notes.

---

## Endpoints

### GET /api/vulnerabilities

- **Description**: Returns active and reopened vulnerabilities ordered by VPR score. Resolved rows are excluded automatically (`lifecycle_state IN ('active','reopened')`).
- **Query Parameters**:
  - `page` (number, default `1`)
  - `limit` (number, default `50`)
  - `search` (string): case-insensitive substring match against hostname, CVE, or plugin name
  - `severity` (string): one of `Critical`, `High`, `Medium`, `Low`
- **Response**: `200 OK`

```json
{
  "data": [
    {
      "id": 42,
      "import_id": 9,
      "scan_date": "2025-08-20",
      "hostname": "core-switch-01",
      "ip_address": "10.0.10.5",
      "cve": "CVE-2024-0001",
      "severity": "High",
      "vpr_score": 8.6,
      "cvss_score": 9.0,
      "plugin_id": "12345",
      "plugin_name": "Example Vulnerability Name",
      "description": "Example Vulnerability Name (CVE-2024-0001)",
      "solution": "Update firmware to version 18.5",
      "state": "ACTIVE",
      "lifecycle_state": "active",
      "first_seen": "2025-08-10",
      "last_seen": "2025-08-20"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 312,
    "pages": 7
  }
}
```

### GET /api/vulnerabilities/stats

- **Description**: Aggregated metrics derived from `vulnerabilities_current` grouped by severity.
- **Response**: `200 OK`

```json
[
  {
    "severity": "Critical",
    "count": 12,
    "total_vpr": 100.1,
    "avg_vpr": 8.34,
    "earliest": "2025-08-01",
    "latest": "2025-08-20"
  }
]
```

### GET /api/vulnerabilities/recent-trends

- **Description**: Compares the most recent daily totals with the previous day to highlight deltas. Uses `vulnerability_daily_totals`.
- **Response**: `200 OK`

```json
{
  "Critical": {
    "current": { "count": 12, "total_vpr": 115.8 },
    "trend": { "count_change": 2, "vpr_change": 10.2 }
  },
  "High": {
    "current": { "count": 40, "total_vpr": 320.1 },
    "trend": { "count_change": -5, "vpr_change": -34.5 }
  }
}
```

### GET /api/vulnerabilities/trends

- **Description**: Historical trend series for each severity with optional start/end date filters. Defaults to the last 14 days.
- **Query Parameters**: `startDate`, `endDate` (`YYYY-MM-DD`)
- **Response**: `200 OK`

```json
[
  {
    "date": "2025-08-20",
    "Critical": { "count": 12, "total_vpr": 115.8 },
    "High": { "count": 85, "total_vpr": 722.5 },
    "Medium": { "count": 210, "total_vpr": 1050.0 },
    "Low": { "count": 50, "total_vpr": 50.0 }
  }
]
```

### GET /api/vulnerabilities/resolved

- **Description**: Paginated access to resolved vulnerabilities (`lifecycle_state = 'resolved'`). Useful for audits and verification workflows.
- **Response**: `200 OK`

```json
{
  "data": [
    {
      "id": 15,
      "hostname": "server-01",
      "cve": "CVE-2023-1234",
      "severity": "High",
      "lifecycle_state": "resolved",
      "resolved_date": "2025-08-15",
      "last_seen": "2025-08-10",
      "resolution_reason": "No longer detected in latest scan"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 45, "pages": 1 }
}
```

### GET /api/imports

- **Description**: Returns import history from `vulnerability_imports` with derived vulnerability counts.
- **Response**: `200 OK`

```json
[
  {
    "id": 12,
    "filename": "cisco_scan_2025-08-20.csv",
    "import_date": "2025-08-20T15:04:00.000Z",
    "row_count": 9850,
    "vendor": "cisco",
    "file_size": 1048576,
    "processing_time": 2340,
    "raw_headers": "[\"asset.name\",\"definition.cve\"]",
    "created_at": "2025-08-20T15:04:00.000Z",
    "vulnerability_count": 9850
  }
]
```

### DELETE /api/vulnerabilities/clear

- **Description**: Removes all rollover data (current, snapshots, daily totals, staging, import history). Also clears many-to-many ticket links.
- **Warning**: Irreversible destructive operation.
- **Response**: `200 OK`

```json
{
  "success": true,
  "message": "All vulnerability data cleared from rollover architecture"
}
```

---

## System Management

### GET /health

- **Description**: Lightweight health probe that reports application version, database availability, and uptime.
- **Response**: `200 OK`

```json
{
  "status": "ok",
  "version": "1.2.0",
  "db": true,
  "uptime": 8645.32
}
```

### GET /api/sites

- **Description**: Lists known sites used for ticket context.
- **Response**: `200 OK`

```json
[
  {
    "id": 1,
    "code": "HQ",
    "name": "Main Campus",
    "description": "Primary operations center",
    "created_at": "2025-08-01T10:00:00.000Z",
    "updated_at": "2025-08-01T10:00:00.000Z"
  }
]
```

### GET /api/locations

- **Description**: Lists normalized locations associated with tickets.
- **Response**: `200 OK`

```json
[
  {
    "id": 3,
    "code": "HQ-WEST",
    "name": "Building A",
    "description": "West wing",
    "created_at": "2025-08-01T10:00:00.000Z",
    "updated_at": "2025-08-01T10:00:00.000Z"
  }
]
```

---

## Data Import & History

HexTrackr supports three ingestion paths. All flows normalise hostname/IP data, split multi-CVE rows, and update lifecycle states automatically.

### POST /api/vulnerabilities/import

- **Use case**: Standard CSV uploads from the dashboard.
- **Form fields**: `csvFile` (required), optional `vendor`, `scanDate`.
- **Processing**: Parses CSV via PapaParse, maps rows, updates rollover tables sequentially, and recalculates daily totals.
- **Response**: `200 OK`

```json
{
  "success": true,
  "importId": 12,
  "filename": "export.csv",
  "rowsProcessed": 250,
  "recordsCreated": 250,
  "inserted": 200,
  "updated": 30,
  "reopened": 20,
  "resolvedCount": 10,
  "scanDate": "2025-08-20",
  "rolloverComplete": true,
  "enhancedLifecycle": true,
  "performanceMetrics": {
    "totalImportTimeMs": 2340,
    "rowsPerSecond": 106.8,
    "memoryDeltaMB": 12,
    "dbOperations": {
      "total": 1800,
      "snapshotInserts": 250,
      "currentChecks": 250,
      "currentUpdates": 200,
      "currentInserts": 50,
      "avgTimeMs": 1.5
    },
    "avgRowTimeMs": 0.9
  }
}
```

### POST /api/vulnerabilities/import-staging

- **Use case**: High-volume CSV uploads that need progress feedback.
- **Form fields**: `csvFile` (required), optional `vendor`, `scanDate`, `sessionId`.
- **Behavior**:
  - Immediately returns `{ success, sessionId }`.
  - Streams Socket.io events (`progress-update`, `progress-error`, `progress-complete`) in the room `progress-{sessionId}` managed by `ProgressTracker`.
  - Bulk loads data into `vulnerability_staging` before promoting to final tables.

```json
{
  "success": true,
  "sessionId": "1f4bba9b-3f8c-4d13-8cb8-4dedc1b7a9a2",
  "message": "CSV import started",
  "filename": "scan.csv",
  "vendor": "cisco",
  "scanDate": "2025-08-20"
}
```

### POST /api/import/vulnerabilities

- **Use case**: Automated integrations that pre-parse CSV to JSON.
- **Request Body**: `{ "data": VulnerabilityRow[] }`
- **Response**: `200 OK`

```json
{
  "success": true,
  "imported": 1,
  "total": 1,
  "errors": []
}
```

- **Supported fields**: `hostname`, `ip_address`, `cve`, `severity`, `vpr_score`, `cvss_score`, `plugin_id`, `plugin_name`, `description`, `solution`, `vendor`, `state`.

---

## Error Handling

Typical error formats follow Express conventions:

```json
{
  "error": "CSV parsing failed: Unexpected column count"
}
```

- `400 Bad Request`: invalid payloads or missing files
- `409 Conflict`: conflicts raised during import mode checks
- `500 Internal Server Error`: database or file-processing failures
