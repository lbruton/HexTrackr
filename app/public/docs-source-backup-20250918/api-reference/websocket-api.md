# WebSocket API

HexTrackr uses Socket.io on the main Express server (default port `8989`) to stream long-running operation progress. WebSocket integration is optional—the UI falls back to manual polling when a socket connection is unavailable.

---

## Server Configuration

- **Port**: shares the Express HTTP server (`http://localhost:8989`)
- **Library**: `socket.io`
- **Transports**: `polling` upgradeable to `websocket`
- **Rooms**: per-session namespace `progress-{sessionId}`
- **Throttle**: minimum 100 ms between `progress-update` events

The server registers listeners in `server.js` and manages state through `ProgressTracker`.

### ProgressTracker Session Model

```json
{
  "id": "uuid",
  "progress": 45,
  "status": "processing",
  "startTime": 1724190482000,
  "lastUpdate": 1724190491000,
  "metadata": {
    "operation": "csv-import",
    "filename": "scan.csv",
    "scanDate": "2025-08-20",
    "totalSteps": 3,
    "currentStep": 2,
    "message": "Loading data to staging table..."
  }
}
```

Sessions are created via `ProgressTracker.createSession()` (or `createSessionWithId` when the client supplies its own UUID). They emit progress to the associated room and are cleaned up automatically after completion or after one hour of inactivity.

---

## Event Reference

| Event | Direction | Description |
| ----- | --------- | ----------- |
| `progress-update` | server → client | Throttled incremental updates. Includes `progress`, `message`, `status`, and `metadata`. |
| `progress-status` | server → client | Snapshot sent immediately after joining a room so reconnecting clients can resume display. |
| `progress-complete` | server → client | Signals successful completion. Contains final metadata and duration. |
| `progress-error` | server → client | Signals a fatal error with additional context under `error`. |
| `join-progress` | client → server | Subscribes the socket to a progress room (`progress-{sessionId}`). |
| `leave-progress` | client → server | Unsubscribes from a room when no longer needed. |

### Event Payloads

#### `progress-update`

```json
{
  "sessionId": "1f4bba9b-3f8c-4d13-8cb8-4dedc1b7a9a2",
  "progress": 60,
  "message": "Staging complete. Processing 9850 records to final tables...",
  "status": "processing",
  "timestamp": 1724190493000,
  "metadata": {
    "operation": "csv-import",
    "currentStep": 3,
    "insertedToStaging": 9850
  }
}
```

#### `progress-complete`

```json
{
  "sessionId": "1f4bba9b-3f8c-4d13-8cb8-4dedc1b7a9a2",
  "progress": 100,
  "message": "Import completed successfully",
  "status": "completed",
  "timestamp": 1724190525000,
  "metadata": {
    "operation": "csv-import",
    "duration": 42350,
    "recordsCreated": 9850
  }
}
```

#### `progress-error`

```json
{
  "sessionId": "1f4bba9b-3f8c-4d13-8cb8-4dedc1b7a9a2",
  "progress": 45,
  "message": "Failed to prepare for batch processing",
  "status": "error",
  "timestamp": 1724190508000,
  "metadata": {
    "operation": "csv-import",
    "currentStep": 3,
    "message": "Failed to prepare for batch processing"
  },
  "error": {
    "code": "SQLITE_BUSY",
    "detail": "database is locked"
  }
}
```

---

## Client Integration

`app/public/scripts/shared/websocket-client.js` wraps Socket.io and exposes a resilient API used by the Progress Modal.

### Connection Lifecycle

```javascript
import WebSocketClient from './scripts/shared/websocket-client.js';

const client = new WebSocketClient();
await client.connect();

client.on('progress', (payload) => updateProgressUI(payload));
client.on('progressComplete', (payload) => handleComplete(payload));
client.on('progressStatus', (payload) => hydrateFromSnapshot(payload));
client.on('progressError', (payload) => showError(payload));
client.on('connectionFailed', () => enableManualFallback());
```

#### Debug Logging

Set `localStorage.hextrackr_debug = "true"` to enable verbose console output inside the client wrapper. Logging automatically disables when the value is removed.

### Joining Rooms

```javascript
const sessionId = '1f4bba9b-3f8c-4d13-8cb8-4dedc1b7a9a2';
client.emit('join-progress', sessionId);
```

The Progress Modal automatically joins when the staging importer returns a session ID and calls `leave-progress` when the modal closes.

### Reconnection & Fallback

- Automatic retries use exponential backoff up to five attempts.
- The Progress Modal listens for the `connectionFailed` callback. When triggered, it displays a warning and continues with manual UI updates provided by HTTP responses.
- Heartbeats (`ping`/`pong`) run every 30 s to detect broken connections.

---

## Manual Mode (No WebSocket)

If Socket.io is unavailable the UI still works:

1. The `WebSocketClient` rejects the connection and emits `connectionFailed`.
2. `progress-modal.js` switches to manual mode and updates progress via standard UI callbacks.
3. Import workflows continue unaffected—the WebSocket stream only enhances user feedback.

---

## Security Considerations

- WebSocket access is limited to local development origins (`http://localhost:8080`, `http://127.0.0.1:8080`). Adjust the CORS list in `server.js` for other environments.
- Room names embed the session identifier; treat session IDs as opaque GUIDs.
- No authentication layer is implemented. Deploy behind a trusted network segment or add your own gateway.
