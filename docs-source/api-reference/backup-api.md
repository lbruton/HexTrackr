# Backup and Restore API

This API provides endpoints for data export, backup, restore, and clearing operations.

---

## Endpoints

### GET /api/backup/stats

- **Description**: Retrieves statistics about the database, including record counts and file size.
- **Response**: `200 OK`

    ```json
    {
      "vulnerabilities": 100553,
      "tickets": 17,
      "total": 100570,
      "dbSize": 5468160
    }
    ```

### GET /api/backup/tickets

- **Description**: Exports all tickets as a JSON object.
- **Response**: `200 OK`

    ```json
    {
      "type": "tickets",
      "count": 17,
      "data": [
        { "id": "TICK-123", "xt_number": "XT001", ... }
      ],
      "exported_at": "2025-09-03T12:00:00.000Z"
    }
    ```

### GET /api/backup/vulnerabilities

- **Description**: Exports up to 10,000 vulnerabilities as a JSON object.
- **Response**: `200 OK`

```json
{
  "type": "vulnerabilities",
  "count": 10000,
  "data": [
    { "id": 1, "hostname": "server-01", ... }
  ],
```

### POST /api/restore

- **Description**: Restore system data from a backup ZIP file. The ZIP file should contain `tickets.json` and/or `vulnerabilities.json`.
- **Body**: `multipart/form-data`
  - `file`: The backup ZIP file (required).
  - `type`: The type of data to restore: "tickets", "vulnerabilities", or "all" (required).
  - `clearExisting`: If "true", deletes existing data of the specified type before restoring (optional, default: "false").
- **Response**: `200 OK`

```json
{
  "success": true,
  "message": "Successfully restored 3012 records",
  "count": 3012
}
```

      "exported_at": "2025-09-03T12:00:00.000Z"
    }
    ```

### GET /api/backup/all

- **Description**: Exports all tickets and up to 10,000 vulnerabilities as a single JSON object.
- **Response**: `200 OK`

    ```json
    {
      "type": "complete_backup",
      "vulnerabilities": {
        "count": 10000,
        "data": [ ... ]
      },
      "tickets": {
        "count": 17,
        "data": [ ... ]
      },
      "exported_at": "2025-09-03T12:00:00.000Z"
    }
    ```

### DELETE /api/backup/clear/:type

- **Description**: Deletes data of a specified type. This is a destructive operation.
- **URL Parameters**:
  - `type` (string, required): The type of data to clear. Can be `tickets`, `vulnerabilities`, or `all`.
- **Response**: `200 OK`

```json
{
  "message": "Tickets cleared successfully"
}
```

---

## Usage Examples

### Get All Data as a JSON Backup

```bash
curl -X GET http://localhost:8080/api/backup/all -o hextrackr_backup.json
```

### Restore Tickets from a Backup

This example restores tickets from `backup.zip` and clears existing tickets first.

```bash
curl -X POST http://localhost:8080/api/restore \
  -F "file=@/path/to/backup.zip" \
  -F "type=tickets" \
  -F "clearExisting=true"
```

### Clear All Vulnerability Data

```bash
curl -X DELETE http://localhost:8080/api/backup/clear/vulnerabilities
```
