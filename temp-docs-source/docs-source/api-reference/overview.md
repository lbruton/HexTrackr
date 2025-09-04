# API Overview

Welcome to the HexTrackr REST API. This API provides programmatic access to the core functionalities of the HexTrackr system, including ticket and vulnerability management.

## General Principles

- **RESTful Architecture**: The API follows REST principles. Resources are accessed via predictable URLs, and HTTP verbs are used to perform actions.
- **JSON Format**: All API responses, including errors, are returned in JSON format.
- **Stateless**: The API is stateless. Each request must contain all the information necessary to be understood by the server.
- **Standard HTTP Status Codes**: The API uses standard HTTP status codes to indicate the success or failure of a request.

---

## Authentication

**Currently, the API does not require authentication.** This is suitable for the current single-user, locally-hosted model.

Future versions will introduce a robust authentication and authorization system, likely using JWT (JSON Web Tokens), to support multi-user environments and role-based access control. When implemented, all requests will require an `Authorization` header.

---

## API Endpoints

The API is organized into several resource-based collections:

- **/api/tickets**: For managing tickets.
- **/api/vulnerabilities**: For managing vulnerabilities.
- **/api/backup**: For backup and restore operations.
- **/api/import**: For importing data from various sources.

For a detailed description of each endpoint, please refer to the specific API reference documents in this section.

---

## Common HTTP Status Codes

The API uses the following standard HTTP status codes:

| Code | Meaning | Description |
| --- | --- | --- |
| `200 OK` | The request was successful. | The response body will contain the requested data. |
| `201 Created` | The resource was successfully created. | Typically returned after a `POST` request. |
| `204 No Content` | The request was successful, but there is no content to return. | Often used for successful `DELETE` requests. |
| `400 Bad Request` | The server could not understand the request due to invalid syntax. | The request body may contain details about the error. |
| `401 Unauthorized` | Authentication is required and has failed or has not yet been provided. | *(To be implemented in future versions)* |
| `403 Forbidden` | The client does not have access rights to the content. | *(To be implemented in future versions)* |
| `404 Not Found` | The server cannot find the requested resource. | |
| `500 Internal Server Error` | The server has encountered a situation it doesn't know how to handle. | This indicates a bug on the server side. |

## Error Handling

When an error occurs, the API will respond with an appropriate 4xx or 5xx status code and a JSON body containing details about the error.

## Example Error Response

```json
{
  "error": "No file uploaded",
  "message": "A required file was not included in the request."
}
```

- **`error`**: A short, machine-readable string identifying the error.
- **`message`**: A human-readable description of the error.

Clients should check the HTTP status code to handle responses and can use the `error` and `message` fields for debugging or displaying to the user.
