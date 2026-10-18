---
tags:
  - backend
doc_type: architecture
project: hextrackr
source: manual
created: "2026-03-12"
updated: "2026-03-12"
sourceFiles:
  - app/public/docs-source/reference/websocket.md
---

# WebSocket Architecture

This reference documents the WebSocket protocol, including low-level classes and events used inside HexTrackr.

**Implementation Locations:**
- **Backend**: `app/public/server.js` (Socket.io setup and handshake)
- **Backend**: `app/utils/ProgressTracker.js` (progress session management)
- **Frontend**: `app/public/scripts/shared/websocket-client.js` (client wrapper)

---

## WebSocket Security & Authentication

### Session-Based Authentication

> [!warning]
> All WebSocket connections MUST have a valid session to connect.

**Handshake Implementation** (`server.js:108-130`):

```javascript
io.engine.use((req, res, next) => {
    const isHandshake = req._query.sid === undefined;
    if (!isHandshake) {
        return next();
    }

    sessionMiddleware(req, res, (err) => {
        if (err) {
            console.error("Socket session error:", err);
            return next(err);
        }

        if (!req.session || !req.session.userId) {
            console.log("Unauthenticated WebSocket connection attempt");
            return next(new Error("Authentication required"));
        }

        next();
    });
});
```

**Security Features:**
- **Session Validation**: WebSocket connections require valid session cookie
- **Handshake-Only Authentication**: Only validates during initial handshake (when `sid === undefined`), not on polling requests
- **User Identification**: Session accessible via `socket.request.session` in connection handler
- **Connection Rejection**: Unauthenticated connections refused during handshake
- **Progress Session Isolation**: ProgressTracker sessions tied to authenticated users

**Key Implementation Details:**
- Uses `io.engine.use()` instead of `io.use()` to access raw Socket.io Engine requests
- Checks `req._query.sid === undefined` to identify handshake vs subsequent polling
- Uses `req` and `res` parameters instead of `socket` during handshake
- Logs authentication status with username from session

### HTTPS Requirement

WebSocket URL must ALWAYS use `wss://` (WebSocket Secure), never `ws://`.

**Connection URLs:**

| URL | Status |
|-----|--------|
| `wss://dev.hextrackr.com` | Works (Development) |
| `wss://hextrackr.com` | Works (Production) |
| `wss://localhost` | Works (self-signed cert) |
| `ws://localhost` | BROKEN - authentication requires HTTPS |

**Why HTTPS is Required:**
- Session cookies have `secure: true` flag (HTTPS only)
- HTTP connections rejected by browser (no cookies sent)
- WebSocket inherits session from HTTPS connection
- nginx reverse proxy terminates TLS and forwards requests to Express backend

### Trust Proxy Dependency

> [!danger]
> WebSocket authentication depends on **trust proxy** configuration. If trust proxy is disabled, WebSocket connections will fail authentication even with valid credentials.

- nginx terminates SSL/TLS for incoming HTTPS requests
- nginx forwards requests with `X-Forwarded-Proto: https` header
- Express needs `trust proxy: true` to recognize the connection as HTTPS
- Session middleware checks `req.protocol === "https"` before setting secure cookies
- WebSocket connection uses same session middleware

---

## ProgressTracker Class

**Location**: `app/utils/ProgressTracker.js`

The `ProgressTracker` class encapsulates session lifecycle management for long-running operations (CSV imports, backups, restores, bulk operations).

### Constructor

```javascript
const tracker = new ProgressTracker(io);
```

**Parameters:**
- `io`: Socket.io server instance

**Initialization:**
- Throttling: `THROTTLE_INTERVAL = 100ms` (prevents progress update spam)
- Cleanup timer: 30-minute interval to remove stale sessions
- Session map: `Map<sessionId, Session>` for active sessions

### Session Data Structure

```javascript
{
    id: "uuid-v4-string",
    progress: 0,                    // 0-100
    status: "active",               // "active" | "completed" | "error"
    message: "Processing...",       // Optional status message
    metadata: {                     // Custom operation-specific data
        operation: "csv-import",
        totalRows: 1000,
        currentRow: 500
    },
    lastUpdate: Date.now(),
    createdAt: Date.now()
}
```

### createSession(metadata?)

Create a new progress session with auto-generated UUID.

```javascript
const sessionId = tracker.createSession({
    operation: 'csv-import',
    filename: 'vulnerabilities.csv',
    totalRows: 5000
});
```

**Returns:** `sessionId` (UUID v4 string)

**Behavior:**
- Generates cryptographically random UUID v4
- Initializes session with `progress: 0`, `status: "active"`
- Stores metadata (sanitized, key length <= 50, value length <= 200)
- Does NOT emit events (client must `join-progress` to receive updates)

### createSessionWithId(sessionId, metadata?)

Create progress session with caller-supplied ID.

```javascript
const frontendId = crypto.randomUUID();
tracker.createSessionWithId(frontendId, {
    operation: 'csv-import'
});
```

> [!warning]
> Overwrites any existing session with the same ID.

### updateProgress(sessionId, progress, message?, metadata?)

Update session progress and emit throttled update event.

```javascript
tracker.updateProgress(
    sessionId,
    60,                             // Progress: 60%
    'Processing batch 3/10',
    { currentStep: 3, batch: 10 }
);
```

**Behavior:**
- Clamps `progress` to `0-100` range
- Merges `metadata` into stored session data
- Emits throttled `progress-update` event to room `progress-{sessionId}`
- Throttle: Max 1 update per 100ms (prevents WebSocket spam)

### completeSession(sessionId, message?, metadata?)

Mark session as completed successfully.

```javascript
tracker.completeSession(
    sessionId,
    'Import completed successfully',
    { rowsProcessed: 5000, duplicatesRemoved: 42 }
);
```

**Behavior:**
- Sets `status: "completed"`, `progress: 100`
- Emits `progress-complete` immediately (NO throttling)
- Schedules session cleanup after 5 seconds

### errorSession(sessionId, message, details?)

Mark session as failed with error details.

```javascript
tracker.errorSession(
    sessionId,
    'Failed to import CSV',
    { code: 'SQLITE_BUSY', sqliteError: 'database is locked' }
);
```

**Behavior:**
- Sets `status: "error"`
- Emits `progress-error` immediately (NO throttling)
- Schedules session cleanup after 10 seconds (allows client to read error)

### getSession(sessionId)

Retrieve current session state. Returns session object or `null` if not found.

### cleanupStaleSessions()

Remove stale sessions (automatic background cleanup).

- **Schedule**: Runs every 30 minutes (auto-started in constructor)
- **Criteria**: Sessions where `lastUpdate` is older than 30 minutes
- **Rationale**: Most imports complete in < 5 minutes; 30 minutes handles very large imports (50k+ rows) while preventing memory leaks

---

## Socket.io Event Handlers

**Location**: `app/public/server.js`

### Connection Handler

```javascript
io.on('connection', (socket) => {
    socket.on('join-progress', (sessionId) => { /* ... */ });
    socket.on('leave-progress', (sessionId) => { /* ... */ });
    socket.on('disconnect', (reason) => { /* ... */ });
});
```

### join-progress Event

Client joins a progress session room to receive updates.

```javascript
// Client emits:
socket.emit('join-progress', sessionId);

// Server handles:
socket.on('join-progress', (sessionId) => {
    socket.join(`progress-${sessionId}`);

    const session = progressTracker.getSession(sessionId);
    if (session) {
        socket.emit('progress-status', {
            sessionId,
            progress: session.progress,
            status: session.status,
            message: session.message,
            metadata: session.metadata
        });
    }
});
```

**Use Case:** Client opens progress modal, or client reconnects mid-operation.

### leave-progress Event

Client leaves progress session room (stops receiving updates).

```javascript
socket.emit('leave-progress', sessionId);
```

**Use Case:** Client closes progress modal or navigates away from page.

### disconnect Event

**Disconnect Reasons:**
- `transport close`: Client closed connection (browser tab closed)
- `transport error`: Network error
- `ping timeout`: Client didn't respond to ping
- `server namespace disconnect`: Server force-closed connection

---

## Event Payloads Reference

All events are sent to room `progress-{sessionId}` only (not broadcast globally).

### progress-status Event

**When**: Client joins a room with an existing session

```javascript
{
    sessionId: "uuid",
    progress: 45,
    status: "active",
    message: "Processing batch 2/5",
    metadata: {
        operation: "csv-import",
        currentBatch: 2,
        totalBatches: 5
    }
}
```

### progress-update Event

**When**: Tracker receives `updateProgress()` call (throttled to 100ms)

```javascript
{
    sessionId: "uuid",
    progress: 60,
    message: "Processing batch 3/5",
    metadata: {
        operation: "csv-import",
        currentBatch: 3,
        totalBatches: 5,
        rowsProcessed: 3000
    },
    timestamp: 1638360000000
}
```

### progress-complete Event

**When**: Tracker finishes a session via `completeSession()`

```javascript
{
    sessionId: "uuid",
    message: "Import completed successfully",
    metadata: {
        operation: "csv-import",
        rowsProcessed: 5000,
        duplicatesRemoved: 42,
        newVulnerabilities: 4958
    },
    duration: 45000  // Milliseconds
}
```

### progress-error Event

**When**: Tracker marks session as failed via `errorSession()`

```javascript
{
    sessionId: "uuid",
    message: "Failed to import CSV",
    metadata: {
        operation: "csv-import",
        rowsProcessed: 2500
    },
    error: {
        code: "SQLITE_BUSY",
        message: "database is locked",
        stack: "Error: database is locked\n    at ..."
    }
}
```

---

## WebSocketClient (Frontend)

**Location**: `app/public/scripts/shared/websocket-client.js`

The `WebSocketClient` class wraps Socket.io and exposes an event emitter style API with automatic reconnection and error handling.

### Instantiation and Connection

```javascript
const client = new WebSocketClient();

try {
    await client.connect();
    console.log('WebSocket connected');
} catch (error) {
    console.error('WebSocket connection failed:', error);
}
```

**Connection Behavior:**
- **Auto-detection**: Detects host/port from `window.location`
- **Protocol**: Uses WebSocket transport with polling fallback
- **URL Format**: `wss://${window.location.host}` (HTTPS only)

**Reconnection Strategy:**
1. Attempt 1: Immediate
2. Attempt 2: 1 second delay
3. Attempt 3: 2 seconds delay
4. Attempt 4: 4 seconds delay
5. Attempt 5: 8 seconds delay
6. After 5 failures: Emit `connectionFailed` event

### Debug Mode

```javascript
// Enable debug mode
localStorage.setItem('hextrackr_debug', 'true');
location.reload();

// Disable debug mode
localStorage.removeItem('hextrackr_debug');
```

Debug output includes connection attempts/failures, event payloads, room join/leave operations, reconnection attempts, and Socket.io transport events.

### Event Listeners

```javascript
client.on('progress', (data) => {
    updateProgressBar(data.progress);
    updateStatusMessage(data.message);
});

client.on('progressStatus', (data) => {
    initializeProgressUI(data);
});

client.on('progressComplete', (data) => {
    showSuccessMessage(data.message);
    closeProgressModal();
});

client.on('progressError', (data) => {
    showErrorMessage(data.error);
    closeProgressModal();
});

client.on('connectionFailed', () => {
    enableManualProgressPolling();
});
```

### Events Exposed by WebSocketClient

| Event | Description | Payload |
|-------|-------------|---------|
| `progress` | Forwarded `progress-update` payloads (throttled) | `{ sessionId, progress, message, metadata, timestamp }` |
| `progressStatus` | Forwarded `progress-status` payloads | `{ sessionId, progress, status, message, metadata }` |
| `progressComplete` | Forwarded `progress-complete` payloads | `{ sessionId, message, metadata, duration }` |
| `progressError` | Forwarded `progress-error` payloads | `{ sessionId, message, metadata, error }` |
| `connectionFailed` | All reconnection attempts exhausted | `{}` |
| `disconnect` | Socket.io disconnects | `{ reason: string }` |

### Room Management Helpers

**Automatic Management**: Progress Modal (`progress-modal.js`) automatically handles join/leave.

**Manual Management:**

```javascript
client.emit('join-progress', sessionId);
client.emit('leave-progress', sessionId);
```

Use manual management for custom progress UI implementations, background progress tracking without modal, or multi-session monitoring.

### Manual Fallback Pattern

**Trigger**: `connectionFailed` event fires after 5 reconnection attempts.

```javascript
client.on('connectionFailed', () => {
    pollingInterval = setInterval(async () => {
        const response = await fetch(`/api/progress/${sessionId}`);
        const data = await response.json();
        updateProgressUI(data);
        if (data.status === 'completed' || data.status === 'error') {
            clearInterval(pollingInterval);
        }
    }, 1000);
});
```

> [!note]
> Progress Modal implements this fallback behavior automatically - no manual intervention needed.

---

## Security Considerations

### Session Authentication

- Valid session cookie required for WebSocket connection
- Handshake middleware validates session before connection
- `socket.userId` populated from session
- Unauthenticated connections rejected immediately

**Best Practice**: Always check authentication status before initiating WebSocket connection:

```javascript
const authResponse = await fetch('/api/auth/status');
const { authenticated } = await authResponse.json();

if (authenticated) {
    await websocketClient.connect();
} else {
    window.location.href = '/login.html';
}
```

### Metadata Sanitization

**Implementation** (`ProgressTracker.js`):

```javascript
sanitizeMetadata(metadata) {
    const sanitized = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (typeof key === 'string' && key.length <= 50) {
            sanitized[key] = String(value).substring(0, 200);
        }
    }
    return sanitized;
}
```

**Limits:**
- Metadata keys: <= 50 characters
- Metadata values: <= 200 characters
- Type coercion: All values converted to strings

---

## Error Handling Best Practices

### Watch for progress-error Payloads

**Common Error Codes:**
- `SQLITE_BUSY`: Database locked
- `VALIDATION_FAILED`: Input validation error
- `FILE_TOO_LARGE`: Upload size exceeded
- `PARSE_ERROR`: CSV parsing failed
- `NETWORK_ERROR`: Network timeout

**Handling Example:**

```javascript
client.on('progressError', (data) => {
    if (data.error.code === 'SQLITE_BUSY') {
        showRetryDialog('Database is busy, please retry in a moment');
    } else if (data.error.code === 'VALIDATION_FAILED') {
        showValidationErrors(data.error.details);
    } else {
        showGenericError(data.message);
    }
});
```

### Reconnection During Long Operations

Call `join-progress` again after reconnection:

```javascript
client.on('connect', () => {
    if (currentSessionId) {
        client.emit('join-progress', currentSessionId);
    }
});

client.on('progressStatus', (data) => {
    updateProgressUI(data);
});
```

### Environments Without WebSocket Support

Socket.io automatically falls back to HTTP long-polling when corporate firewalls block WebSocket traffic. Impact: slightly higher latency (100ms typical vs 500ms+ polling).

**Detection:**

```javascript
client.on('connect', () => {
    const transport = client.socket.io.engine.transport.name;
    // "websocket" -> Native WebSocket
    // "polling"   -> HTTP long-polling fallback
});
```

---

## Performance Characteristics

### Throttling

**Update Throttle**: 100ms (max 10 updates per second)

Example: Importing 10,000 rows at 1000 rows/second:
- Without throttle: 1000 messages/second (overloads WebSocket)
- With throttle: 10 messages/second (smooth UX)

### Session Cleanup

**Stale Session Cleanup**: 30 minutes

**Memory Impact:**
- Each session: ~1KB (metadata + status)
- 1000 concurrent sessions: ~1MB
- Cleanup prevents unbounded growth

### Room Isolation

Each progress session uses isolated room `progress-{sessionId}`.

**Benefits:**
- No message broadcasting to all clients (only interested clients)
- Automatic cleanup when all clients leave room
- Scalable to many concurrent operations

**Performance:**
- Room join/leave: ~1ms
- Message to room with 10 clients: ~5ms
- Room isolation prevents O(n) broadcast overhead

---

## Troubleshooting

### WebSocket Connection Failed

**Symptoms**: `connectionFailed` event fires, no real-time updates

**Checklist:**
1. Check HTTPS: Verify using `wss://` URL (not `ws://`)
2. Check authentication: `/api/auth/status` should return `{ authenticated: true }`
3. Check trust proxy: `docker logs hextrackr-app | grep "trust proxy"`
4. Check firewall: Corporate firewalls may block WebSocket
5. Check nginx: `docker logs hextrackr-nginx` for proxy errors

### Progress Updates Not Received

**Checklist:**
1. Joined room: Did client emit `join-progress`?
2. Session exists: Does `getSession(sessionId)` return data?
3. Updates sent: Is server calling `updateProgress()`?

### Session Cleanup Too Aggressive

**Symptoms**: Long-running operations cleaned up mid-operation

**Solution**: Call `updateProgress()` periodically during long operations to keep the session alive:

```javascript
async function longRunningImport(sessionId) {
    for (let i = 0; i < 100000; i++) {
        await processRow(i);
        if (i % 100 === 0) {
            tracker.updateProgress(sessionId, (i / 100000) * 100);
        }
    }
}
```

---

## Related

- [Security Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Security%20Architecture.md)
- [[API Reference]]
- [Backend Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Backend%20Architecture.md)
- [Middleware & Config](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Middleware%20&%20Config.md)
- [[Frontend API]]
