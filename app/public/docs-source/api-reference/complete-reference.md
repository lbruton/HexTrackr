# Complete API Reference

This document provides a high-level map of HexTrackr's REST surface area. Detailed per-domain docs are available here:

- [Tickets API](tickets-api.md)
- [Vulnerabilities API](vulnerabilities-api.md)
- [WebSocket API](websocket-api.md)
- [Backup API](backup-api.md)

Use this page to understand global behaviour (base URLs, security, health probes, and shared utilities).

---

## API Overview

| Property | Value |
| -------- | ----- |
| **Base URL** | `http://localhost:8989` |
| **Content-Type** | `application/json` unless otherwise noted |
| **Rate Limiting** | 100 requests per 15-minute window per IP (`express-rate-limit`) |
| **WebSocket** | `ws://localhost:8989` (Socket.io) |
| **Database** | SQLite (`data/hextrackr.db`) |

---

## Global Endpoints

### GET /health

Lightweight readiness probe.

```http
GET /health HTTP/1.1
Host: localhost:8989
```

```json
{
  "status": "ok",
  "version": "1.2.0",
  "db": true,
  "uptime": 8645.32
}
```

### GET /api/docs/stats

Returns documentation metadata used to build the static docs portal.

```json
{
  "apiEndpoints": 42,
  "jsFunctions": 128,
  "cssFiles": 35,
  "routes": ["/api/tickets", "/api/vulnerabilities"],
  "generatedAt": "2025-08-20T15:05:04.123Z"
}
```

### GET /api/backup/all

Exports the complete dataset (tickets + legacy vulnerabilities) for backup purposes. See [Backup API](backup-api.md) for payload details and download formats.

### DELETE /api/vulnerabilities/clear

Clears rollover tables (`vulnerabilities_current`, `vulnerability_snapshots`, `vulnerability_daily_totals`, staging tables, and imports). Use with caution; the response is:

```json
{
  "success": true,
  "message": "All vulnerability data cleared from rollover architecture"
}
```

### DELETE /api/tickets/clear

Removes all ticket rows. Used primarily in local development.

---

## Import Summary

HexTrackr exposes a consistent import workflow across domains:

| Domain | JSON Endpoint | CSV Endpoint | Staging Endpoint | Notes |
| ------ | ------------- | ------------ | ---------------- | ----- |
| Tickets | `POST /api/import/tickets` | `POST /api/import` (type = `tickets`) | n/a | CSV is parsed client-side with PapaParse; modes `append`/`replace` map to migration behaviours. |
| Vulnerabilities | `POST /api/import/vulnerabilities` | `POST /api/vulnerabilities/import` | `POST /api/vulnerabilities/import-staging` | Staging endpoint streams WebSocket progress events. |

All importers normalise devices, split multi-CVE rows, and update lifecycle states. Refer to the specific API docs above for schema examples.

---

## WebSocket Overview

HexTrackr shares the HTTP server for Socket.io. See [WebSocket API](websocket-api.md) and [WebSocket Reference](../references/websocket-reference.md) for payloads. Key points:

- Rooms follow the pattern `progress-{sessionId}`.
- Events: `progress-status`, `progress-update`, `progress-complete`, `progress-error`.
- Debug logging can be toggled with `localStorage.hextrackr_debug = "true"` on the client.

---

## Security Profile

| Concern | Implementation |
| ------- | -------------- |
| Rate limiting | `express-rate-limit` (100 req / 15 min / IP) |
| Upload limits | `multer` (100 MB) |
| Path traversal | `PathValidator` guard wraps all file access |
| CORS | `cors()` allowing `http://localhost:8080` and `http://127.0.0.1:8080` by default |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` |

Authentication is not implemented; deploy behind a trusted network or add a proxy/gateway as required.

---

## Error Model

Errors follow a simple structure:

```json
{
  "error": "CSV parsing failed: Unexpected column count"
}
```

- `400` for malformed requests or missing files
- `409` for mode conflicts (e.g., attempting to replace data without confirmation)
- `500` for internal server/database errors

Consult individual API docs for domain-specific error semantics.

---

## Related Documentation

- [Architecture / Backend](../architecture/backend.md)
- [Architecture / Database](../architecture/database.md)
- [Technical Reference / Modules](../technical-reference/modules-catalog.md)
- [Security Overview](../security/overview.md)
