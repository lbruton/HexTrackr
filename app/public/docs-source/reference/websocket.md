# WebSocket Reference

**Version**: v1.1.8
**Last Updated**: 2025-10-09

This reference documents the WebSocket protocol, including low-level classes and events used inside HexTrackr.

**Implementation Locations**:
- **Backend**: `app/public/server.js` (Socket.io setup and handshake)
- **Backend**: `app/utils/ProgressTracker.js` (progress session management)
- **Frontend**: `app/public/scripts/shared/websocket-client.js` (client wrapper)

---

## WebSocket Security & Authentication

### Session-Based Authentication

**Since**: v1.0.46 (authentication system)

**Critical Requirement**: All WebSocket connections MUST have a valid session to connect.

**Handshake Implementation** (`server.js:108-130`):

```javascript
// Secure WebSocket connections with session-based authentication
// Only authenticate on handshake (when sid is undefined), not on subsequent polling requests
io.engine.use((req, res, next) => {
    const isHandshake = req._query.sid === undefined;
    if (!isHandshake) {
        return next();
    }

    // Apply session middleware during handshake
    sessionMiddleware(req, res, (err) => {
        if (err) {
            console.error("Socket session error:", err);
            return next(err);
        }

        // Check if user is authenticated
        if (!req.session || !req.session.userId) {
            console.log("Unauthenticated WebSocket connection attempt");
            return next(new Error("Authentication required"));
        }

        console.log(` Authenticated WebSocket handshake: ${req.session.username}`);
        next();
    });
});
```

**Security Features**:
- **Session Validation**: WebSocket connections require valid session cookie
- **Handshake-Only Authentication**: Only validates during initial handshake (when `sid === undefined`), not on polling requests
- **User Identification**: Session accessible via `socket.request.session` in connection handler
- **Connection Rejection**: Unauthenticated connections refused during handshake
- **Progress Session Isolation**: ProgressTracker sessions tied to authenticated users

**Key Implementation Details**:
- Uses `io.engine.use()` instead of `io.use()` to access raw Socket.io Engine requests
- Checks `req._query.sid === undefined` to identify handshake vs subsequent polling
- Uses `req` and `res` parameters instead of `socket` during handshake
- Logs authentication status with username from session

### HTTPS Requirement

**WebSocket URL**: ALWAYS use `wss://` (WebSocket Secure), never `ws://`

**Connection URLs**:

```text
✅ wss://dev.hextrackr.com      # Development
✅ wss://hextrackr.com          # Production
✅ wss://localhost              # Local development
❌ ws://localhost               # BROKEN - authentication requires HTTPS
```

**Why HTTPS is Required**:
- Session cookies have `secure: true` flag (HTTPS only)
- HTTP connections rejected by browser (no cookies sent)
- WebSocket inherits session from HTTPS connection
- nginx reverse proxy terminates TLS and forwards requests to Express backend

### Trust Proxy Dependency

**Critical**: WebSocket authentication depends on **trust proxy** configuration.

**Why**:
- nginx terminates SSL/TLS for incoming HTTPS requests
- nginx forwards requests to Express backend with `X-Forwarded-Proto: https` header
- Express needs `trust proxy: true` to recognize the connection as HTTPS from the header
- Session middleware checks `req.protocol === "https"` before setting secure cookies
- WebSocket connection uses same session middleware

**If trust proxy is disabled**: WebSocket connections will fail authentication even with valid credentials.

---

## ProgressTracker Class

**Location**: `app/utils/ProgressTracker.js`

The `ProgressTracker` class encapsulates session lifecycle management for long-running operations (CSV imports, backups, restores, bulk operations).

### Constructor

```javascript
const tracker = new ProgressTracker(io);
```

**Parameters**:
- `io`: Socket.io server instance

**Initialization**:
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
    lastUpdate: Date.now(),         // Timestamp of last progress update
    createdAt: Date.now()           // Session creation timestamp
}
```

### createSession(metadata?)

**Purpose**: Create a new progress session with auto-generated UUID

```javascript
const sessionId = tracker.createSession({
    operation: 'csv-import',
    filename: 'vulnerabilities.csv',
    totalRows: 5000
});
```

**Returns**: `sessionId` (UUID v4 string)

**Behavior**:
- Generates cryptographically random UUID v4
- Initializes session with `progress: 0`, `status: "active"`
- Stores metadata (sanitized, key length ≤ 50, value length ≤ 200)
- Does NOT emit events (client must `join-progress` to receive updates)

### createSessionWithId(sessionId, metadata?)

**Purpose**: Create progress session with caller-supplied ID

```javascript
// Frontend generates ID, backend uses it
const frontendId = crypto.randomUUID();
tracker.createSessionWithId(frontendId, {
    operation: 'csv-import'
});
```

**Use Case**: Staging importer forwards frontend-generated ID to backend

**Warning**: Overwrites any existing session with the same ID

### updateProgress(sessionId, progress, message?, metadata?)

**Purpose**: Update session progress and emit throttled update event

```javascript
tracker.updateProgress(
    sessionId,
    60,                             // Progress: 60%
    'Processing batch 3/10',        // Status message
    { currentStep: 3, batch: 10 }   // Additional metadata
);
```

**Parameters**:
- `sessionId`: Session identifier
- `progress`: Number (clamped to 0-100 range)
- `message`: Optional status message
- `metadata`: Optional metadata to merge into session

**Behavior**:
- Clamps `progress` to `0-100` range
- Merges `metadata` into stored session data
- Emits throttled `progress-update` event to room `progress-{sessionId}`
- Throttle: Max 1 update per 100ms (prevents WebSocket spam)

**Event Payload**:

```javascript
{
    sessionId: "uuid",
    progress: 60,
    message: "Processing batch 3/10",
    metadata: { currentStep: 3, batch: 10 },
    timestamp: Date.now()
}
```

### completeSession(sessionId, message?, metadata?)

**Purpose**: Mark session as completed successfully

```javascript
tracker.completeSession(
    sessionId,
    'Import completed successfully',
    { rowsProcessed: 5000, duplicatesRemoved: 42 }
);
```

**Behavior**:
- Sets `status: "completed"`
- Sets `progress: 100`
- Emits `progress-complete` immediately (NO throttling)
- Schedules session cleanup after 5 seconds

**Event Payload**:

```javascript
{
    sessionId: "uuid",
    message: "Import completed successfully",
    metadata: { rowsProcessed: 5000, duplicatesRemoved: 42 },
    duration: 45000  // Milliseconds since session created
}
```

### errorSession(sessionId, message, details?)

**Purpose**: Mark session as failed with error details

```javascript
tracker.errorSession(
    sessionId,
    'Failed to import CSV',
    {
        code: 'SQLITE_BUSY',
        sqliteError: 'database is locked',
        stack: error.stack
    }
);
```

**Behavior**:
- Sets `status: "error"`
- Stores error details in session metadata
- Emits `progress-error` immediately (NO throttling)
- Schedules session cleanup after 10 seconds (allows client to read error)

**Event Payload**:

```javascript
{
    sessionId: "uuid",
    message: "Failed to import CSV",
    metadata: { /* session metadata */ },
    error: {
        code: 'SQLITE_BUSY',
        sqliteError: 'database is locked',
        stack: '...'
    }
}
```

### getSession(sessionId)

**Purpose**: Retrieve current session state

```javascript
const session = tracker.getSession(sessionId);
if (session) {
    console.log(`Progress: ${session.progress}%`);
}
```

**Returns**: Session object or `null` if not found

**Use Case**:
- When new client joins room, emit `progress-status` with current state
- Debugging session state

### cleanupStaleSessions()

**Purpose**: Remove stale sessions (automatic background cleanup)

**Schedule**: Runs every 30 minutes (auto-started in constructor)

**Criteria**: Sessions where `lastUpdate` is older than 30 minutes

**Why 30 minutes**:
- Most imports complete in < 5 minutes
- 30 minutes handles very large imports (50k+ rows)
- Prevents memory leaks from abandoned sessions

---

## Socket.io Event Handlers

**Location**: `app/public/server.js`

### Connection Handler

```javascript
io.on('connection', (socket) => {
    console.log(`WebSocket client connected: ${socket.id}`);

    // Client authenticated via session (handshake check above)
    // socket.userId available from session

    socket.on('join-progress', (sessionId) => { /* ... */ });
    socket.on('leave-progress', (sessionId) => { /* ... */ });
    socket.on('disconnect', (reason) => { /* ... */ });
});
```

### join-progress Event

**Purpose**: Client joins a progress session room to receive updates

```javascript
// Client emits:
socket.emit('join-progress', sessionId);

// Server handles:
socket.on('join-progress', (sessionId) => {
    socket.join(`progress-${sessionId}`);

    // If session exists, emit current status immediately
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

**Use Case**:
- Client opens progress modal
- Client reconnects mid-operation (resumes progress tracking)

### leave-progress Event

**Purpose**: Client leaves progress session room (stops receiving updates)

```javascript
// Client emits:
socket.emit('leave-progress', sessionId);

// Server handles:
socket.on('leave-progress', (sessionId) => {
    socket.leave(`progress-${sessionId}`);
});
```

**Use Case**:
- Client closes progress modal
- Client navigates away from page

### disconnect Event

**Purpose**: Clean up when client disconnects

```javascript
socket.on('disconnect', (reason) => {
    console.log(`Client ${socket.id} disconnected: ${reason}`);
    // No cleanup required - session timer handles it
});
```

**Disconnect Reasons**:
- `transport close`: Client closed connection (browser tab closed)
- `transport error`: Network error
- `ping timeout`: Client didn't respond to ping
- `server namespace disconnect`: Server force-closed connection

---

## Event Payloads Reference

All events are sent to room `progress-{sessionId}` only (not broadcast globally).

### progress-status Event

**When**: Client joins a room with an existing session

**Payload**:

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

**Payload**:

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

**Payload**:

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

**Payload**:

```javascript
{
    sessionId: "uuid",
    message: "Failed to import CSV",
    metadata: {
        operation: "csv-import",
        rowsProcessed: 2500  // Partial progress before failure
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

// Connect (returns Promise)
await client.connect();

// Or with error handling:
try {
    await client.connect();
    console.log('WebSocket connected');
} catch (error) {
    console.error('WebSocket connection failed:', error);
    // Fallback to HTTP polling for progress
}
```

**Connection Behavior**:
- **Auto-detection**: Detects host/port from `window.location`
- **Protocol**: Uses WebSocket transport with polling fallback
- **Reconnection**: Retries up to 5 times with exponential backoff
- **URL Format**: `wss://${window.location.host}` (HTTPS only)

**Reconnection Strategy**:
1. Attempt 1: Immediate
2. Attempt 2: 1 second delay
3. Attempt 3: 2 seconds delay
4. Attempt 4: 4 seconds delay
5. Attempt 5: 8 seconds delay
6. After 5 failures: Emit `connectionFailed` event

### Debug Mode

Enable verbose console logging:

```javascript
// Enable debug mode
localStorage.setItem('hextrackr_debug', 'true');
location.reload();

// Disable debug mode
localStorage.removeItem('hextrackr_debug');
location.reload();
```

**Debug Output**:
- Connection attempts and failures
- Event payloads (progress, complete, error)
- Room join/leave operations
- Reconnection attempts
- Socket.io transport events

### Event Listeners

```javascript
const client = new WebSocketClient();
await client.connect();

// Progress updates (throttled to 100ms)
client.on('progress', (data) => {
    console.log(`Progress: ${data.progress}%`);
    updateProgressBar(data.progress);
    updateStatusMessage(data.message);
});

// Initial status when joining room
client.on('progressStatus', (data) => {
    console.log(`Joined session: ${data.sessionId}`);
    initializeProgressUI(data);
});

// Completion
client.on('progressComplete', (data) => {
    console.log(`Operation completed in ${data.duration}ms`);
    showSuccessMessage(data.message);
    closeProgressModal();
});

// Errors
client.on('progressError', (data) => {
    console.error(`Operation failed: ${data.message}`);
    showErrorMessage(data.error);
    closeProgressModal();
});

// Connection failures
client.on('connectionFailed', () => {
    console.warn('WebSocket connection failed, falling back to HTTP polling');
    enableManualProgressPolling();
});

// Disconnection
client.on('disconnect', (reason) => {
    console.log(`WebSocket disconnected: ${reason}`);
    showReconnectingIndicator();
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

**Automatic Management**: Progress Modal (`progress-modal.js`) automatically handles join/leave

**Manual Management**:

```javascript
// Join progress room
client.emit('join-progress', sessionId);

// Leave progress room
client.emit('leave-progress', sessionId);
```

**When to Use Manual Management**:
- Custom progress UI implementations
- Background progress tracking without modal
- Multi-session monitoring

### Manual Fallback Pattern

**Trigger**: `connectionFailed` event fires after 5 reconnection attempts

**Implementation**:

```javascript
let webSocketAvailable = true;
let pollingInterval = null;

client.on('connectionFailed', () => {
    webSocketAvailable = false;
    console.warn('WebSocket unavailable, starting HTTP polling');

    // Start polling progress endpoint
    pollingInterval = setInterval(async () => {
        const response = await fetch(`/api/progress/${sessionId}`);
        const data = await response.json();

        updateProgressUI(data);

        if (data.status === 'completed' || data.status === 'error') {
            clearInterval(pollingInterval);
        }
    }, 1000);  // Poll every 1 second
});

client.on('progressComplete', () => {
    if (pollingInterval) clearInterval(pollingInterval);
});

client.on('progressError', () => {
    if (pollingInterval) clearInterval(pollingInterval);
});
```

**Note**: Progress Modal implements this fallback behavior automatically - no manual intervention needed.

---

## Security Considerations

### Session Authentication

**Requirement**: Valid session cookie required for WebSocket connection

**Enforcement**:
- Handshake middleware validates session before connection
- `socket.userId` populated from session
- Unauthenticated connections rejected immediately

**Best Practice**: Always check authentication status before initiating WebSocket connection:

```javascript
// Check auth before connecting WebSocket
const authResponse = await fetch('/api/auth/status');
const { authenticated } = await authResponse.json();

if (authenticated) {
    await websocketClient.connect();
} else {
    // Redirect to login
    window.location.href = '/login.html';
}
```

### HTTPS Requirement

**Critical**: WebSocket connections ONLY work over HTTPS

**Why**:
- Session cookies have `secure: true` flag
- Browsers reject secure cookies over HTTP
- WebSocket inherits session from HTTPS connection

**Testing**:

```text
✅ wss://dev.hextrackr.com      → Works
❌ ws://dev.hextrackr.com       → Connection rejected (no cookies)
❌ ws://localhost               → Connection rejected (no cookies)
✅ wss://localhost              → Works (self-signed cert)
```

### Metadata Sanitization

**Purpose**: Prevent injection attacks via progress metadata

**Implementation** (`ProgressTracker.js`):

```javascript
sanitizeMetadata(metadata) {
    const sanitized = {};
    for (const [key, value] of Object.entries(metadata)) {
        // Key length limit: 50 characters
        if (typeof key === 'string' && key.length <= 50) {
            // Value length limit: 200 characters
            sanitized[key] = String(value).substring(0, 200);
        }
    }
    return sanitized;
}
```

**Limits**:
- Metadata keys: ≤ 50 characters
- Metadata values: ≤ 200 characters
- Type coercion: All values converted to strings

---

## Error Handling Best Practices

### Watch for progress-error Payloads

**Error Payload Structure**:

```javascript
{
    sessionId: "uuid",
    message: "User-friendly error message",
    error: {
        code: "ERROR_CODE",
        message: "Detailed error message",
        stack: "Error stack trace...",
        // Additional context (SQLite errors, validation errors, etc.)
    }
}
```

**Common Error Codes**:
- `SQLITE_BUSY`: Database locked
- `VALIDATION_FAILED`: Input validation error
- `FILE_TOO_LARGE`: Upload size exceeded
- `PARSE_ERROR`: CSV parsing failed
- `NETWORK_ERROR`: Network timeout

**Handling Example**:

```javascript
client.on('progressError', (data) => {
    console.error('Operation failed:', data);

    // Check error code for specific handling
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

**Scenario**: Client disconnects mid-import (network issue, browser tab suspended)

**Solution**: Call `join-progress` again after reconnection

```javascript
client.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    showReconnectingIndicator();
});

client.on('connect', () => {
    console.log('Reconnected');
    hideReconnectingIndicator();

    // Rejoin progress room if operation was in progress
    if (currentSessionId) {
        client.emit('join-progress', currentSessionId);
    }
});

client.on('progressStatus', (data) => {
    // Received current status after rejoining
    console.log(`Resumed tracking: ${data.progress}% complete`);
    updateProgressUI(data);
});
```

### Environments Without WebSocket Support

**Scenario**: Corporate firewall blocks WebSocket traffic

**Behavior**: Socket.io automatically falls back to HTTP long-polling

**Impact**:
- Importer still works correctly
- Real-time UX is degraded (polling instead of push)
- Slightly higher latency (100ms typical vs 500ms+ polling)

**Detection**:

```javascript
client.on('connect', () => {
    const transport = client.socket.io.engine.transport.name;
    console.log(`Connected via: ${transport}`);
    // "websocket" → Native WebSocket
    // "polling" → HTTP long-polling fallback
});
```

---

## Performance Characteristics

### Throttling

**Update Throttle**: 100ms (max 10 updates per second)

**Why**: Prevents WebSocket message spam during rapid progress updates

**Example**: Importing 10,000 rows at 1000 rows/second
- Without throttle: 1000 messages/second (overloads WebSocket)
- With throttle: 10 messages/second (smooth UX)

### Session Cleanup

**Stale Session Cleanup**: 30 minutes

**Why**:
- Typical import: < 5 minutes
- Large import (50k rows): 10-20 minutes
- 30 minutes handles edge cases while preventing memory leaks

**Memory Impact**:
- Each session: ~1KB (metadata + status)
- 1000 concurrent sessions: ~1MB
- Cleanup prevents unbounded growth

### Room Isolation

**Pattern**: Each progress session uses isolated room `progress-{sessionId}`

**Benefits**:
- No message broadcasting to all clients (only interested clients)
- Automatic cleanup when all clients leave room
- Scalable to many concurrent operations

**Performance**:
- Room join/leave: ~1ms
- Message to room with 10 clients: ~5ms
- Room isolation prevents O(n) broadcast overhead

---

## Troubleshooting

### WebSocket Connection Failed

**Symptoms**: `connectionFailed` event fires, no real-time updates

**Checklist**:

1. **Check HTTPS**: Verify using `wss://` URL (not `ws://`)
2. **Check authentication**: `/api/auth/status` should return `{ authenticated: true }`
3. **Check trust proxy**: `docker logs hextrackr-app | grep "trust proxy"`
4. **Check firewall**: Corporate firewalls may block WebSocket
5. **Check nginx**: `docker logs hextrackr-nginx` for proxy errors

**Debug Steps**:

```javascript
localStorage.setItem('hextrackr_debug', 'true');
location.reload();

// Watch console for:
// - Connection attempts
// - Authentication status
// - Transport type (websocket vs polling)
```

### Progress Updates Not Received

**Symptoms**: Connected but no `progress` events

**Checklist**:

1. **Joined room**: Did client emit `join-progress`?
2. **Session exists**: Does `getSession(sessionId)` return data?
3. **Updates sent**: Is server calling `updateProgress()`?

**Debug**:

```javascript
// Client-side
client.emit('join-progress', sessionId);
client.on('progressStatus', (data) => console.log('Status:', data));
client.on('progress', (data) => console.log('Update:', data));

// Server-side (check logs)
docker logs -f hextrackr-app | grep -i "progress"
```

### Session Cleanup Too Aggressive

**Symptoms**: Long-running operations cleaned up mid-operation

**Cause**: Session inactive for > 30 minutes

**Solution**: Call `updateProgress()` periodically during long operations

```javascript
// Keep session alive with periodic updates
async function longRunningImport(sessionId) {
    for (let i = 0; i < 100000; i++) {
        await processRow(i);

        // Update every 100 rows (keeps session alive)
        if (i % 100 === 0) {
            tracker.updateProgress(sessionId, (i / 100000) * 100);
        }
    }
}
```

---

**Document Version**: 2.0
**Last Updated**: 2025-10-09
**Reviewed By**: hextrackr-fullstack-dev agent
**Next Review**: 2026-01-09 (quarterly review cycle)
