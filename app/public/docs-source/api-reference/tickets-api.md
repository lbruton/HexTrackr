# Tickets API

The Tickets API provides CRUD operations for managing tickets. For general API information, see the [API Overview](../api-reference/overview.md).

**Data Model**: For detailed information on the `tickets` table schema, see the [Data Model documentation](../architecture/data-model.md).

---

## Endpoints

### GET /api/tickets

- **Description**: Retrieves a list of all tickets, ordered by creation date in descending order.
- **Query Parameters**: None
- **Response**: `200 OK`
  - **Note**: Devices are persisted as a semicolon-delimited string (preserving boot order). Attachments remain a JSON string that the frontend parses into objects.

    ```json
    [
      {
        "id": "TICK-123",
        "xt_number": "0103",
        "date_submitted": "2025-08-20",
        "date_due": "2025-08-30",
        "hexagon_ticket": "HX-456",
        "service_now_ticket": "INC0000123",
        "location": "HQ-1",
        "devices": "Device 1;Device 2",
        "supervisor": "Jane Doe",
        "tech": "John Smith",
        "status": "Open",
        "notes": "Initial ticket creation.",
        "attachments": "[]",
        "created_at": "2025-08-20T12:00:00.000Z",
        "updated_at": "2025-08-20T12:00:00.000Z",
        "site": "HQ"
      }
    ]
    ```

### POST /api/tickets

- **Description**: Creates a new ticket. The UI sends camelCase keys; the API also accepts legacy snake_case fields for backwards compatibility.
- **Request Body**: `application/json`

    ```json
    {
      "id": "TICK-124",
      "xtNumber": "0104",
      "dateSubmitted": "2025-08-21",
      "dateDue": "2025-08-31",
      "hexagonTicket": "HX-457",
      "serviceNowTicket": "INC0000124",
      "location": "HQ-2",
      "devices": "Device 3;Device 4",
      "supervisor": "John Doe",
      "tech": "Jane Smith",
      "status": "Open",
      "notes": "This is a new ticket.",
      "attachments": [],
      "createdAt": "2025-08-21T10:00:00.000Z",
      "updatedAt": "2025-08-21T10:00:00.000Z",
      "site": "HQ"
    }
    ```

- **Device Formats**: `devices` may be a semicolon string or an array. Arrays are joined into an ordered semicolon string to preserve the boot/reboot sequence.

- **Response**: `200 OK`

    ```json
    {
      "success": true,
      "id": "TICK-124",
      "message": "Ticket saved successfully"
    }
    ```

### PUT /api/tickets/:id

- **Description**: Updates an existing ticket by its `id`.
- **URL Parameters**:
  - `id` (string, required): The ID of the ticket to update.
- **Request Body**: `application/json` (Same shape as `POST /api/tickets`)
- **Response**: `200 OK`

    ```json
    {
      "success": true,
      "id": "TICK-123",
      "message": "Ticket updated successfully"
    }
    ```

### DELETE /api/tickets/:id

- **Description**: Deletes a ticket by its `id`.
- **URL Parameters**:
  - `id` (string, required): The ID of the ticket to delete.
- **Response**: `200 OK`

    ```json
    {
      "success": true,
      "deleted": 1
    }
    ```

---

## Data Import Endpoints

### POST /api/import/tickets

- **Description**: Imports a batch of tickets from a JSON array. The tickets UI uses PapaParse to convert CSV files into this structure before calling the endpoint. Rows are upserted (`INSERT OR REPLACE`).
- **Request Body**: `application/json`

    ```json
    {
      "data": [
        {
          "id": "ticket_1",
          "xt_number": "0105",
          "date_submitted": "2025-08-20",
          "date_due": "2025-08-30",
          "hexagon_ticket": "HX-456",
          "service_now_ticket": "INC0000123",
          "location": "HQ-1",
          "devices": "Device 1;Device 2",
          "supervisor": "Jane",
          "tech": "John",
          "status": "Open",
          "notes": "Notes from import.",
          "attachments": "[]"
        }
      ]
    }
    ```

- **Response**: `200 OK`

    ```json
    {
      "success": true,
      "imported": 1,
      "total": 1
    }
    ```

- **Device Compatibility**: The importer accepts semicolon strings, comma-separated strings, or JSON arrays. Commas and arrays are normalized server-side to Semicolon strings.

### POST /api/tickets/migrate

- **Description**: Bulk import endpoint used by the CSV workflow. Supports `append`, `replace`, and `check` (default) modes and mirrors the structure used by the UI.
- **Request Body**: `application/json`

    ```json
    {
      "mode": "append",
      "tickets": [
        {
          "id": "legacy-1",
          "xtNumber": "0106",
          "dateSubmitted": "2025-08-01",
          "dateDue": "2025-08-05",
          "hexagonTicket": "PR-1",
          "serviceNowTicket": "INC-1",
          "site": "HQ",
          "location": "HQ-WEST",
          "devices": ["DEV-1", "DEV-2"],
          "supervisor": "Tech Lead",
          "status": "Open"
        }
      ]
    }
    ```

- **Response**: `200 OK`

    ```json
    {
      "success": true,
      "message": "Migration completed: 1 tickets migrated, 0 errors"
    }
    ```

- **Mode Behavior**:
  - `append`: keeps existing records and upserts incoming tickets.
  - `replace`: clears the `tickets` table before inserting new rows.
  - `check`: validates payload without clearing existing data and upserts rows.

---

## Reference Data Endpoints

### GET /api/sites

- **Description**: Retrieves a list of unique sites from the database.
- **Response**: `200 OK` - An array of site records.

### GET /api/locations

- **Description**: Retrieves a list of unique locations from the database.
- **Response**: `200 OK` - An array of location records.

---

## Error Responses

- **`400 Bad Request`**: The request body is missing or contains invalid data.

    ```json
    {
      "error": "No data provided"
    }
    ```

- **`500 Internal Server Error`**: An error occurred during a database operation.

    ```json
    {
      "error": "Failed to save ticket"
    }
    ```
