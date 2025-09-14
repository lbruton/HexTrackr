# Component Integration

This document describes how the different components of the HexTrackr system work together.

---

## API and WebSocket Integration

- The REST API provides the primary interface for interacting with the application.
- The WebSocket server provides real-time updates to clients for long-running processes such as data imports.

---

## Security Integration

- The `PathValidator` class is used to prevent directory traversal attacks.
- Rate limiting is applied to all API endpoints to prevent abuse.
- CORS is configured to restrict access to the API from unauthorized domains.
- Input validation and sanitization are used to prevent XSS and other injection attacks.

---

## Database Integration

- The application uses a SQLite database to store all data.
- The database is initialized automatically when the application starts for the first time.
- Database migrations are handled automatically by the application.
