# Vulnerabilities API

This API provides endpoints for managing and analyzing vulnerability data. It features a [rollover architecture](../architecture/rollover-mechanism.md) for historical trend analysis.

**Data Model**: For detailed information on the vulnerability-related tables, see the [Data Model documentation](../architecture/data-model.md).

---

## Endpoints

### GET /api/vulnerabilities

- **Description**: Retrieves a paginated list of active vulnerabilities. Automatically filters by lifecycle_state IN ('active', 'reopened') to exclude resolved vulnerabilities.
- **Query Parameters**:
  - `page` (number, optional, default: 1): The page number to retrieve.
  - `limit` (number, optional, default: 50): The number of items per page.
  - `search` (string, optional): A search term to filter by hostname, CVE, or plugin name.
  - `severity` (string, optional): Filter by severity (`Critical`, `High`, `Medium`, `Low`).
- **Note**: This endpoint only returns active and reopened vulnerabilities. Use `/api/vulnerabilities/resolved` for resolved vulnerabilities.
- **Response**: `200 OK`

    ```json
    {
      "data": [
        {
          "id": 10,
          "import_id": 3,
          "hostname": "host-1",
          "cve": "CVE-2024-0001",
          "severity": "High",
          "vpr_score": 8.6,
          "last_seen": "2025-08-20",
          "plugin_id": "12345",
          "plugin_name": "Example Vulnerability Name"
        }
      ],
      "pagination": { "page": 1, "limit": 50, "total": 1234, "pages": 25 }
    }
    ```

### GET /api/vulnerabilities/stats

- **Description**: Retrieves aggregated statistics for current vulnerabilities, grouped by severity.
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

- **Description**: Retrieves statistics for the most recent scan date and compares them with the previous day to show trends.
- **Response**: `200 OK`

    ```json
    {
      "Critical": {
        "current": { "count": 12, "total_vpr": 115.8 },
        "trend": { "count_change": 2, "vpr_change": 10.2 }
      }
    }
    ```

### GET /api/vulnerabilities/trends

- **Description**: Provides historical data on vulnerability counts and VPR scores, aggregated by day and severity.
- **Query Parameters**:
  - `startDate` (string, optional): Start date in `YYYY-MM-DD` format.
  - `endDate` (string, optional): End date in `YYYY-MM-DD` format.
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

- **Description**: Retrieves a paginated list of resolved vulnerabilities (lifecycle_state = 'resolved').
- **Query Parameters**:
  - `page` (number, optional, default: 1): The page number to retrieve.
  - `limit` (number, optional, default: 50): The number of items per page.
  - `search` (string, optional): A search term to filter by hostname, CVE, or plugin name.
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
          "last_seen": "2025-08-10"
        }
      ],
      "pagination": { "page": 1, "limit": 50, "total": 45, "pages": 1 }
    }
    ```

---

## System Management

### GET /health

- **Description**: Health check endpoint that provides system status information including version, database availability, and uptime.
- **Response**: `200 OK`

    ```json
    {
      "status": "ok",
      "version": "1.0.0",
      "db": true,
      "uptime": 3600.5
    }
    ```

### GET /api/sites

- **Description**: Retrieves all sites from the database, ordered alphabetically by name.
- **Response**: `200 OK`

    ```json
    [
      {
        "id": 1,
        "name": "Main Office",
        "created_at": "2025-08-01T10:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Branch Office",
        "created_at": "2025-08-02T14:30:00.000Z"
      }
    ]
    ```

### GET /api/locations

- **Description**: Retrieves all locations from the database, ordered alphabetically by name.
- **Response**: `200 OK`

    ```json
    [
      {
        "id": 1,
        "name": "Building A",
        "created_at": "2025-08-01T10:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Building B",
        "created_at": "2025-08-02T14:30:00.000Z"
      }
    ]
    ```

---

## Data Import & History

HexTrackr provides three distinct methods for importing vulnerability data:

1. **CSV File Upload** (`/api/vulnerabilities/import`): Server-side CSV parsing - upload raw CSV files and let the server handle all parsing logic.
2. **Staging Import** (`/api/vulnerabilities/import-staging`): Server-side staged import with enhanced performance for large datasets.
3. **JSON Payload** (`/api/import/vulnerabilities`): Client-side CSV parsing - parse CSV into JSON on the frontend before sending to server.

**Key Differences:**

- **Server-side parsing** (`/import`): Upload CSV directly, server handles format detection and parsing
- **Client-side parsing** (`/api/import/vulnerabilities`): Frontend parses CSV to JSON, then sends structured data

The appropriate method depends on your integration needs and client-side capabilities.

### POST /api/vulnerabilities/import

- **Description**: Imports vulnerabilities from an uploaded CSV file. This is the primary endpoint for server-side processing of vulnerability scans.
- **Enhanced Features**:
  - **Multi-format Support**: Automatically detects and processes various CSV export formats
  - **Cisco SA Support**: Extracts and processes Cisco Security Advisory identifiers (`cisco-sa-*` patterns)
  - **CVE Extraction**: Multi-tier CVE identification from various column sources
  - **Intelligent Parsing**: Handles both direct CVE columns and embedded CVE patterns in vulnerability names
- **Request Body**: `multipart/form-data`
  - `csvFile` (file, required): The CSV file to import.
  - `vendor` (string, optional): The source of the data (e.g., "cisco").
  - `scanDate` (string, optional): The date of the scan in `YYYY-MM-DD` format. Defaults to the current date.
- **Response**: `200 OK`

```json
{
  "success": true,
  "importId": 7,
  "rowsProcessed": 250,
  "filename": "export.csv",
  "insertCount": 200,
  "updateCount": 50,
  "removedStale": 10
}
```

### POST /api/vulnerabilities/import-staging

- **Description**: Enhanced staging import endpoint for vulnerability data with performance optimizations and advanced processing features.
- **Request Body**: `multipart/form-data`
  - `csvFile` (file, required): The CSV file to import.
  - `vendor` (string, optional): The source of the data (e.g., "cisco", "tenable").
  - `scanDate` (string, optional): The date of the scan in `YYYY-MM-DD` format. Auto-extracted from filename if not provided.
- **Enhanced Features**:
  - **Staging Table Processing**: Uses temporary staging table for improved performance on large datasets
  - **Filename Date Extraction**: Automatically extracts scan dates from common filename patterns
  - **Enhanced Performance Monitoring**: Detailed timing and processing statistics
- **Response**: `200 OK`

```json
{
  "success": true,
  "importId": 12,
  "stagingRowsProcessed": 10000,
  "finalRowsInserted": 9850,
  "filename": "cisco_scan_2025-08-20.csv",
  "processingTime": 2340,
  "performance": {
    "stagingTime": 1200,
    "processingTime": 1140
  }
}
```

### POST /api/import/vulnerabilities

- **Description**: Imports vulnerabilities from a JSON array. This endpoint is intended for use when a CSV file is parsed on the frontend before being sent to the server.
- **Request Body**: `application/json`

```json
    {
      "data": [
        { "hostname": "host-1", "cve": "CVE-2024-0001", "severity": "High" }
      ]
    }
    ```

-   **Response**: `200 OK`

    ```json
    {
      "success": true,
      "imported": 1,
      "total": 1,
      "importId": 8
    }
    ```

### GET /api/imports

-   **Description**: Retrieves the history of all vulnerability import events from the `vulnerability_imports` table.
-   **Note**: The `vulnerability_count` field is a calculated value representing the number of vulnerabilities associated with each import.
-   **Response**: `200 OK`

    ```json
    [
      {
        "id": 7,
        "filename": "export.csv",
        "import_date": "2025-08-20T10:30:00.000Z",
        "rows_processed": 250,
        "status": "completed"
      },
      {
        "id": 6,
        "filename": "cisco_scan_2025-08-19.csv",
        "import_date": "2025-08-19T14:15:00.000Z",
        "rows_processed": 1200,
        "status": "completed"
      }
    ]
    ```

---

## Data Deletion

### DELETE /api/vulnerabilities/clear

-   **Description**: Deletes all vulnerability-related data from the database. This includes the current state, historical snapshots, daily totals, import history, and links between tickets and vulnerabilities.
-   **Warning**: This is a destructive operation and cannot be undone.
-   **Response**: `200 OK`

    ```json
    {
      "success": true,
      "message": "All vulnerability data cleared from rollover architecture"
    }
    ```
