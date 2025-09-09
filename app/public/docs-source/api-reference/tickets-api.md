# Tickets API

The Tickets API provides CRUD operations for managing tickets. For general API information, see the [API Overview](../api-reference/overview.md).

**Data Model**: For detailed information on the `tickets` table schema, see the [Data Model documentation](../architecture/data-model.md).

---

## Endpoints

### GET /api/tickets

- **Description**: Retrieves a list of all tickets, ordered by creation date in descending order.
- **Query Parameters**: None
- **Response**: `200 OK`
  - **Note**: The `devices` and `attachments` fields are returned as JSON strings.

    ```json
    [
      {
        "id": "TICK-123",
        "xt_number": "XT001",
        "date_submitted": "2025-08-20T12:00:00.000Z",
        "date_due": "2025-08-30T12:00:00.000Z",
        "hexagon_ticket": "HX-456",
        "service_now_ticket": "INC0000123",
        "location": "HQ-1",
        "devices": "[\"Device 1\",\"Device 2\"]",
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

- **Description**: Creates a new ticket. The server expects camelCase keys in the request body and maps them to snake_case for the database.
- **Request Body**: `application/json`

    ```json
    {
      "id": "TICK-124",
      "xt_number": "XT002",
      "dateSubmitted": "2025-08-21T10:00:00.000Z",
      "dateDue": "2025-08-31T10:00:00.000Z",
      "hexagonTicket": "HX-457",
      "serviceNowTicket": "INC0000124",
      "location": "HQ-2",
      "devices": ["Device 3", "Device 4"],
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

- **Description**: Imports a batch of tickets from a JSON array. This is typically used after parsing a CSV file on the frontend. The operation performs an `INSERT OR REPLACE` into the database.
- **Request Body**: `application/json`

    ```json
    {
      "data": [
        {
          "id": "ticket_1",
          "xt_number": "XT001",
          "date_submitted": "2025-08-20",
          "date_due": "2025-08-30",
          "hexagon_ticket": "HX-456",
          "service_now_ticket": "INC0000123",
          "location": "HQ-1",
          "devices": "[\"Device 1\"]",
          "supervisor": "Jane",
          "tech": "John",
          "status": "Open",
          "notes": "Notes from import."
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

### POST /api/tickets/migrate

- **Description**: A legacy endpoint to bulk migrate tickets from an old `localStorage` format. It performs an `INSERT OR REPLACE` operation.
- **Note**: The schema for this endpoint is different from the standard ticket format and should only be used for migrating legacy data.
- **Request Body**: `application/json`

    ```json
    {
      "tickets": [
        {
          "id": "legacy-1",
          "start_date": "2025-08-01",
          "end_date": "2025-08-05",
          "primary_number": "PR-1",
          "incident_number": "INC-1",
          "site_code": "HQ",
          "affected_devices": ["DEV-1"],
          "assignee": "Tech",
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
