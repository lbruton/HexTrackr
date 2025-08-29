# Vulnerabilities API

Endpoints for listing, statistics, trends, CSV upload, JSON import, and clearing vulnerability data.

## Endpoints

### GET /api/vulnerabilities

- Description: List vulnerabilities with pagination, optional search and severity filter.
- Query params:
  - page: number (default 1)
  - limit: number (default 50)
  - search: string (matches hostname, cve, plugin_name)
  - severity: string (Critical|High|Medium|Low)
- Response: 200 OK

  <!-- markdownlint-disable MD013 -->
  ```json
  {
    "data": [
      {
        "id": 10,
        "import_id": 3,
        "hostname": "host-1",
        "ip_address": "10.0.0.1",
        "cve": "CVE-2024-0001",
        "severity": "High",
        "vpr_score": 8.6,
        "cvss_score": 7.5,
        "first_seen": "2025-08-10",
        "last_seen": "2025-08-20",
        "plugin_id": "100001",
        "plugin_name": "Vulnerability name",
        "description": "...",
        "solution": "...",
        "vendor": "Cisco",
        "vulnerability_date": "2025-08-05",
        "state": "open",
        "import_date": "2025-08-20",
        "created_at": "2025-08-20T12:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 50, "total": 1234, "pages": 25 }
  }
  ```
  <!-- markdownlint-enable MD013 -->

### GET /api/vulnerabilities/stats

- Description: Aggregated statistics by severity with VPR totals/averages and date range.
- Response: 200 OK Array

  <!-- markdownlint-disable MD013 -->
  ```json
  [
    { "severity": "Critical", "count": 12, "total_vpr": 100.1, "avg_vpr": 8.34, "earliest": "2025-08-01", "latest": "2025-08-20" }
  ]
  ```
  <!-- markdownlint-enable MD013 -->

### GET /api/vulnerabilities/trends

- Description: Historical counts by day and severity for the last 14 days.
- Response: 200 OK Array (one object per date)

  <!-- markdownlint-disable MD013 -->
  ```json
  [ { "date": "2025-08-20", "Critical": 1, "High": 5, "Medium": 3, "Low": 0 } ]
  ```
  <!-- markdownlint-enable MD013 -->

### POST /api/vulnerabilities/import

- Description: Upload a CSV file and import rows. Creates a record in vulnerability_imports and inserts normalized rows.
- Body: multipart/form-data
  - csvFile: file (required)
  - vendor: string (optional)
- Response: 200 OK

  <!-- markdownlint-disable MD013 -->
  ```json
  { "success": true, "importId": 7, "rowsProcessed": 250, "filename": "export.csv", "processingTime": 5234 }
  ```
  <!-- markdownlint-enable MD013 -->

### POST /api/import/vulnerabilities

- Description: Import vulnerabilities from a JSON array (frontend CSV to JSON). Also records an import in vulnerability_imports.
- Body: application/json

  <!-- markdownlint-disable MD013 -->
  ```json
  { "data": [ { "hostname": "host-1", "cve": "CVE-2024-0001", "severity": "High" } ] }
  ```
  <!-- markdownlint-enable MD013 -->

- Response: 200 OK

  <!-- markdownlint-disable MD013 -->
  ```json
  { "success": true, "imported": 1, "total": 1, "importId": 8 }
  ```
  <!-- markdownlint-enable MD013 -->

### GET /api/imports

- Description: List import history with counts of vulnerabilities per import.
- Response: 200 OK Array of import records.

### DELETE /api/vulnerabilities/clear

- Description: Clears ticket_vulnerabilities, vulnerabilities, and vulnerability_imports.
- Response: 200 OK

  <!-- markdownlint-disable MD013 -->
  ```json
  { "success": true, "message": "All vulnerability data cleared" }
  ```
  <!-- markdownlint-enable MD013 -->

## Error responses

- 400 Bad Request: Missing file or invalid body.
- 500 Internal Server Error: Database/CSV parsing errors.

## Notes

- Columns added at runtime via ALTER TABLE: vendor, vulnerability_date, state, import_date.
- CSV mappings support multiple vendor formats (Cisco/Tenable-like headers).
