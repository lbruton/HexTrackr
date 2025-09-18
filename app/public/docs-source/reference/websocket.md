# WebSocket Reference

This reference documents the WebSocket protocol, including low-level classes and events used inside HexTrackr. The implementation lives in `server.js` (backend) and `app/public/scripts/shared/websocket-client.js` (frontend).

---

## ProgressTracker (server.js)

The `ProgressTracker` class encapsulates session lifecycle management for long-running operations (CSV imports, backups, restores).

### Constructor

```javascript
const tracker = new ProgressTracker(io);
```

- `io`: Socket.io server instance.
- Initialises throttling (`THROTTLE_INTERVAL = 100 ms`) and a hourly cleanup timer.

### createSession(metadata?)

```javascript
const sessionId = tracker.createSession({ operation: 'csv-import' });
```

- Generates a UUID v4 and stores `{ progress, status, metadata }`.
- Returns the `sessionId` string.
- Emits nothing immediately-the client joins via `join-progress` to receive state.

### createSessionWithId(sessionId, metadata?)

```javascript
tracker.createSessionWithId(frontendId, { operation: 'csv-import' });
```

- Uses a caller-supplied identifier (the staging importer forwards the ID returned by the frontend).
- Overwrites any existing state with the same ID.

### updateProgress(sessionId, progress, message?, metadata?)

```javascript
tracker.updateProgress(sessionId, 60, 'Processing batch 3/10', { currentStep: 3 });
```

- Clamps `progress` to the `0-100` range.
- Merges `metadata` into the stored session data.
- Emits a throttled `progress-update` event to room `progress-{sessionId}`.

### completeSession(sessionId, message?, metadata?)

```javascript
tracker.completeSession(sessionId, 'Import completed successfully');
```

- Sets status to `completed` and progress to `100`.
- Emits `progress-complete` (no throttling) to the room.
- Schedules cleanup five seconds later.

### errorSession(sessionId, message, details?)

```javascript
tracker.errorSession(sessionId, 'Failed to prepare for batch processing', { code: 'SQLITE_BUSY' });
```

- Sets status to `error` and stores the supplied details.
- Emits `progress-error` immediately.
- Schedules cleanup ten seconds later.

### getSession(sessionId)

Returns the current session object or `null` if not found. Used when new connections join a room to emit `progress-status`.

### cleanupStaleSessions()

Runs hourly to remove sessions where `lastUpdate` is older than one hour.

---

## Socket Handlers (server.js)

```javascript
io.on('connection', (socket) => {
  socket.on('join-progress', (sessionId) => { ... });
  socket.on('leave-progress', (sessionId) => { ... });
  socket.on('disconnect', (reason) => { ... });
});
```

- **join-progress**: adds the socket to `progress-{sessionId}` and emits `progress-status` if a session already exists.
- **leave-progress**: removes the socket from the room.
- **disconnect**: debug logs only (no cleanup required-the session timer handles it).

---

## Event Payloads

See the API document for canonical payload examples. For convenience:

| Event | When Emitted | Key Fields |
|-------|--------------|------------|
| `progress-status` | Client joins a room with an existing session | `sessionId`, `progress`, `status`, `metadata` |
| `progress-update` | Tracker receives `updateProgress` (throttled) | `sessionId`, `progress`, `message`, `metadata`, `timestamp` |
| `progress-complete` | Tracker finishes a session | `sessionId`, `message`, `metadata`, `duration` |
| `progress-error` | Tracker marks a session as failed | `sessionId`, `message`, `metadata`, `error` |

All events are sent to room `progress-{sessionId}` only.

---

## WebSocketClient (frontend)

`scripts/shared/websocket-client.js` wraps Socket.io and exposes an event emitter style API.

### Instantiation

```javascript
const client = new WebSocketClient();
await client.connect();
```

- Auto-detects host/port from `window.location`.
- Attempts WebSocket first with polling fallback.
- Retries up to five times with exponential backoff.

### Debugging

Enable verbose console output with:

```javascript
localStorage.setItem('hextrackr_debug', 'true');
```

Remove the key to disable logging.

### Events Exposed by WebSocketClient

| Event | Description |
|-------|-------------|
| `progress` | Forwarded `progress-update` payloads. |
| `progressStatus` | Forwarded `progress-status` payloads. |
| `progressComplete` | Forwarded `progress-complete` payloads. |
| `progressError` | Forwarded `progress-error` payloads. |
| `connectionFailed` | Fired after all reconnection attempts fail. |
| `disconnect` | Fired when Socket.io disconnects (reason included). |

### Room Management Helpers

The client automatically emits `join-progress` when the Progress Modal opens and `leave-progress` when it closes. Custom integrations can call:

```javascript
client.emit('join-progress', sessionId);
client.emit('leave-progress', sessionId);
```

### Manual Fallback

When `connectionFailed` fires, consumers should revert to manual updates. The Progress Modal already implements this behaviour by hiding live status indicators and relying on HTTP responses to advance progress.

---

## Error Handling Tips

- Watch for `progress-error` payloads - they include the underlying SQLite or validation error details.
- If a client reconnects mid-import, call `join-progress` again to receive the last known snapshot via `progress-status`.
- When running in environments without WebSocket support, the importer still works: only the real-time UX is affected.
