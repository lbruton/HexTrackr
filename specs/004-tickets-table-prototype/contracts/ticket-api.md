# API Contract: Ticket Endpoints

## Overview
This document defines the API contracts for ticket-related endpoints used by the AG-Grid implementation.

## Endpoints

### 1. GET /api/tickets
**Purpose**: Retrieve all tickets for grid display

#### Request
```http
GET /api/tickets
Accept: application/json
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status (active, pending, completed, overdue) |
| site | string | No | Filter by site name |
| from_date | string | No | Filter tickets from date (ISO 8601) |
| to_date | string | No | Filter tickets to date (ISO 8601) |

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "ticket_number": "TKT-2025-001",
      "submission_date": "2025-01-15T10:30:00Z",
      "due_date": "2025-01-30T17:00:00Z",
      "internal_ref": "INT-45678",
      "external_ref": "EXT-98765",
      "site_name": "Main Campus",
      "location_name": "Building A - Room 101",
      "devices": [
        "Router-01",
        "Switch-03",
        "Firewall-02"
      ],
      "supervisors": [
        "John Smith",
        "Jane Doe"
      ],
      "status": "active",
      "priority": "high",
      "bundle_id": "bundle_123abc",
      "has_bundle": true
    }
  ],
  "count": 150,
  "timestamp": "2025-01-19T14:30:00Z"
}
```

#### Error Responses
```json
{
  "success": false,
  "error": "Database connection failed",
  "code": "DB_ERROR",
  "timestamp": "2025-01-19T14:30:00Z"
}
```

### 2. GET /api/tickets/:id
**Purpose**: Retrieve single ticket details for editing

#### Request
```http
GET /api/tickets/12345
Accept: application/json
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "ticket_number": "TKT-2025-001",
    "submission_date": "2025-01-15T10:30:00Z",
    "due_date": "2025-01-30T17:00:00Z",
    "internal_ref": "INT-45678",
    "external_ref": "EXT-98765",
    "site_name": "Main Campus",
    "location_name": "Building A - Room 101",
    "devices": [
      "Router-01",
      "Switch-03",
      "Firewall-02"
    ],
    "supervisors": [
      "John Smith",
      "Jane Doe"
    ],
    "status": "active",
    "priority": "high",
    "description": "Network connectivity issues in Building A",
    "notes": "Multiple device failures reported",
    "bundle_id": "bundle_123abc",
    "has_bundle": true,
    "created_by": "admin",
    "updated_at": "2025-01-18T09:15:00Z"
  },
  "timestamp": "2025-01-19T14:30:00Z"
}
```

### 3. PUT /api/tickets/:id
**Purpose**: Update ticket information from edit modal

#### Request
```http
PUT /api/tickets/12345
Content-Type: application/json
```

```json
{
  "ticket_number": "TKT-2025-001",
  "due_date": "2025-02-05T17:00:00Z",
  "internal_ref": "INT-45678",
  "external_ref": "EXT-98765-MOD",
  "site_name": "Main Campus",
  "location_name": "Building A - Room 102",
  "devices": [
    "Router-01",
    "Switch-03",
    "Firewall-02",
    "AP-04"
  ],
  "supervisors": [
    "John Smith",
    "Jane Doe",
    "Bob Johnson"
  ],
  "status": "pending",
  "priority": "medium",
  "description": "Network connectivity issues in Building A - escalated",
  "notes": "Added new access point to affected devices"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "message": "Ticket updated successfully",
    "updated_fields": [
      "due_date",
      "external_ref",
      "location_name",
      "devices",
      "supervisors",
      "status",
      "priority",
      "description",
      "notes"
    ]
  },
  "timestamp": "2025-01-19T14:35:00Z"
}
```

### 4. DELETE /api/tickets/:id
**Purpose**: Delete ticket (called from edit modal)

#### Request
```http
DELETE /api/tickets/12345
Accept: application/json
```

#### Response
```json
{
  "success": true,
  "data": {
    "message": "Ticket deleted successfully",
    "deleted_id": 12345
  },
  "timestamp": "2025-01-19T14:40:00Z"
}
```

### 5. GET /api/tickets/:id/bundle
**Purpose**: Download ticket bundle

#### Request
```http
GET /api/tickets/12345/bundle
Accept: application/octet-stream
```

#### Response
- **Success**: Binary file stream with appropriate headers
- **Headers**:
  - Content-Type: application/zip
  - Content-Disposition: attachment; filename="TKT-2025-001-bundle.zip"
  - Content-Length: [file size in bytes]

### 6. POST /api/tickets/export
**Purpose**: Export tickets in various formats

#### Request
```http
POST /api/tickets/export
Content-Type: application/json
```

```json
{
  "format": "csv",
  "filters": {
    "status": ["active", "pending"],
    "from_date": "2025-01-01T00:00:00Z",
    "to_date": "2025-01-31T23:59:59Z"
  },
  "columns": [
    "ticket_number",
    "submission_date",
    "due_date",
    "site_name",
    "devices",
    "supervisors",
    "status"
  ]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "download_url": "/api/downloads/export_20250119_143500.csv",
    "expires_at": "2025-01-19T15:35:00Z",
    "file_size": 45678,
    "row_count": 150
  },
  "timestamp": "2025-01-19T14:35:00Z"
}
```

## WebSocket Events

### 1. Ticket Updates
**Event**: `ticket:updated`
```json
{
  "type": "ticket:updated",
  "data": {
    "id": 12345,
    "changes": {
      "status": "completed",
      "updated_at": "2025-01-19T14:45:00Z"
    }
  }
}
```

### 2. Ticket Deletion
**Event**: `ticket:deleted`
```json
{
  "type": "ticket:deleted",
  "data": {
    "id": 12345,
    "deleted_at": "2025-01-19T14:50:00Z"
  }
}
```

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| VALIDATION_ERROR | Invalid input data | 400 |
| NOT_FOUND | Ticket not found | 404 |
| UNAUTHORIZED | Not authorized to access | 401 |
| FORBIDDEN | Not allowed to perform action | 403 |
| DB_ERROR | Database operation failed | 500 |
| EXPORT_ERROR | Export generation failed | 500 |

## Rate Limiting

- **Endpoint**: All API endpoints
- **Limit**: 100 requests per minute per IP
- **Headers**:
  - X-RateLimit-Limit: 100
  - X-RateLimit-Remaining: 95
  - X-RateLimit-Reset: 1737301200

## Contract Tests

### Test Case 1: Get All Tickets
```javascript
describe('GET /api/tickets', () => {
  it('should return array of tickets', async () => {
    const response = await request('/api/tickets');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data[0]).toHaveProperty('ticket_number');
    expect(response.body.data[0]).toHaveProperty('devices');
    expect(Array.isArray(response.body.data[0].devices)).toBe(true);
  });
});
```

### Test Case 2: Update Ticket
```javascript
describe('PUT /api/tickets/:id', () => {
  it('should update ticket fields', async () => {
    const updates = {
      status: 'completed',
      notes: 'Resolved issue'
    };

    const response = await request('/api/tickets/12345')
      .put()
      .send(updates);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.updated_fields).toContain('status');
    expect(response.body.data.updated_fields).toContain('notes');
  });
});
```

### Test Case 3: Delete Ticket
```javascript
describe('DELETE /api/tickets/:id', () => {
  it('should delete ticket from modal', async () => {
    const response = await request('/api/tickets/12345').delete();

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.deleted_id).toBe(12345);
  });
});
```

---