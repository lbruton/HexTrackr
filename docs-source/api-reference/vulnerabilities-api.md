# Vulnerabilities API

This API provides endpoints for managing and analyzing vulnerability data. It features a [rollover architecture](../architecture/rollover-mechanism.md) for historical trend analysis.

**Data Model**: For detailed information on the vulnerability-related tables, see the [Data Model documentation](../architecture/data-model.md).

---

## Endpoints

### GET /api/vulnerabilities

- **Description**: Retrieves a paginated list of current vulnerabilities.
- **Query Parameters**:
  - `page` (number, optional, default: 1): The page number to retrieve.
  - `limit` (number, optional, default: 50): The number of items per page.
  - `search` (string, optional): A search term to filter by hostname, CVE, or plugin name.
  - `severity` (string, optional): Filter by severity (`Critical`, `High`, `Medium`, `Low`).
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

---

## Data Import & History

HexTrackr provides two distinct methods for importing vulnerability data:

1. **CSV File Upload** (`/api/vulnerabilities/import`): For direct upload of CSV files that are parsed on the server.
2. **JSON Payload** (`/api/import/vulnerabilities`): For pre-processed data that has already been parsed into JSON format on the client.

The appropriate method depends on your integration needs and client-side capabilities.

### POST /api/vulnerabilities/import

- **Description**: Imports vulnerabilities from an uploaded CSV file. This is the primary endpoint for server-side processing of vulnerability scans. **Fixed in v1.0.5**: Resolved critical bug where missing `apiBase` property caused 404 errors during CSV upload attempts.
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

-   **Description**: Retrieves the history of all vulnerability import events.
-   **Response**: `200 OK` - An array of import records.

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
