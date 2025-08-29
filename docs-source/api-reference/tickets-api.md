<!-- markdownlint-disable-next-line MD013 -->

# Tickets API

The Tickets API provides CRUD operations, basic reference data, and CSV-style JSON imports for tickets. Responses are JSON. Dates are ISO 8601 strings.

## Endpoints

### GET /api/tickets

- Description: List tickets ordered by created_at DESC. If a row has a null id, the backend will use xt_number as id in the response.
- Query: None
- Response: 200 OK

  <!-- markdownlint-disable MD013 -->
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
      "notes": "",
      "attachments": "[]",
      "created_at": "2025-08-20T12:00:00.000Z",
      "updated_at": "2025-08-20T12:00:00.000Z",
      "site": "HQ",
      "site_id": null,
      "location_id": null
    }
  ]
  ```
  <!-- markdownlint-enable MD013 -->

### POST /api/tickets

- Description: Create a new ticket.
- Body: application/json

  <!-- markdownlint-disable MD013 -->
  ```json
  {
    "id": "TICK-123",
    "dateSubmitted": "2025-08-20T12:00:00.000Z",
    "dateDue": "2025-08-30T12:00:00.000Z",
    "hexagonTicket": "HX-456",
    "serviceNowTicket": "INC0000123",
    "location": "HQ-1",
    "devices": ["Device 1", "Device 2"],
    "supervisor": "Jane Doe",
    "tech": "John Smith",
    "status": "Open",
    "notes": "",
    "attachments": [],
    "createdAt": "2025-08-20T12:00:00.000Z",
    "updatedAt": "2025-08-20T12:00:00.000Z",
    "site": "HQ",
    "xt_number": "XT001",
    "site_id": null,
    "location_id": null
  }
  ```
  <!-- markdownlint-enable MD013 -->

- Response: 200 OK

  ```json
  { "success": true, "id": "TICK-123", "message": "Ticket saved successfully" }
  ```

### PUT /api/tickets/:id

- Description: Update an existing ticket by id.
- Body: application/json (same shape as POST, without createdAt)
- Response: 200 OK

  <!-- markdownlint-disable MD013 -->
  ```json
  { "success": true, "id": "TICK-123", "message": "Ticket updated successfully" }
  ```
  <!-- markdownlint-enable MD013 -->

### DELETE /api/tickets/:id

- Description: Delete a ticket by id.
- Response: 200 OK

  <!-- markdownlint-disable MD013 -->
  ```json
  { "success": true, "deleted": 1 }
  ```
  <!-- markdownlint-enable MD013 -->

### POST /api/tickets/migrate

- Description: Bulk migrate tickets from legacy localStorage format. Performs INSERT OR REPLACE.
- Body: application/json

  <!-- markdownlint-disable MD013 -->
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
        "notes": "",
        "status": "Open",
        "priority": "Medium",
        "linked_cves": ["CVE-2024-0001"],
        "created_at": "2025-08-01T12:00:00.000Z",
        "updated_at": "2025-08-01T12:00:00.000Z",
        "display_site_code": "HQ",
        "ticket_number": "XT999",
        "site_id": 1,
        "location_id": 2
      }
    ]
  }
  ```
  <!-- markdownlint-enable MD013 -->

- Response: 200 OK

  <!-- markdownlint-disable MD013 -->
  ```json
  { "success": true, "message": "Migration completed: 1 tickets migrated, 0 errors" }
  ```
  <!-- markdownlint-enable MD013 -->

### GET /api/sites

- Description: List sites (if available in DB).
- Response: 200 OK Array of site records.

### GET /api/locations

- Description: List locations (if available in DB).
- Response: 200 OK Array of location records.

### POST /api/import/tickets

- Description: Import tickets using a JSON array derived from CSV (frontend uses PapaParse). Performs INSERT OR REPLACE.
- Body: application/json

  <!-- markdownlint-disable MD013 -->
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
        "notes": "...",
        "created_at": "2025-08-20T12:00:00.000Z"
      }
    ]
  }
  ```
  <!-- markdownlint-enable MD013 -->

- Response: 200 OK

  <!-- markdownlint-disable MD013 -->
  ```json
  { "success": true, "imported": 1, "total": 1 }
  ```
  <!-- markdownlint-enable MD013 -->

## Error responses

- 400 Bad Request: Invalid or missing body.
- 500 Internal Server Error: Database errors.

## Notes

- The tickets table schema is evolving; some fields may be null depending on import source. The API will include them when present.
