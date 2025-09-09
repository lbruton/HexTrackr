# WebSocket Progress Tracking - API Reference

## Overview

This document provides comprehensive API reference for the WebSocket Progress Tracking system in HexTrackr.

## Server-Side APIs

### ProgressTracker Class

The core class for managing import session progress and WebSocket events.

#### Constructor

```javascript
const progressTracker = new ProgressTracker();
```

Creates a new ProgressTracker instance with empty session and timing maps.

#### Methods

##### `createSession(sessionId: string): void`

Creates a new import session with the specified session ID.

## Parameters

- `sessionId` (string): Unique identifier for the import session (UUID recommended)

## Example

```javascript
const sessionId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
progressTracker.createSession(sessionId);
```

## Session Object Structure

```javascript
{
  id: string,           // Session identifier
  startTime: number,    // Unix timestamp of session start
  progress: number,     // Current progress (0-100)
  status: string,       // 'active', 'completed', 'failed'
  totalRows: number,    // Total rows to process
  processedRows: number // Rows processed so far
}
```

##### `emitProgress(sessionId, type, progress, message, additionalData?): void`

Emits a progress event to all clients in the session room.

## Parameters: (2)

- `sessionId` (string): Session identifier
- `type` (string): Event type - 'parsing', 'loading', 'processing', 'finalizing', 'complete', 'error'
- `progress` (number): Progress percentage (0-100)
- `message` (string): Human-readable status message
- `additionalData` (object, optional): Additional event-specific data

## Example: (2)

```javascript
progressTracker.emitProgress(
  sessionId, 
  'loading', 
  45, 
  'Processing batch 2 of 4...',
  { batchNumber: 2, totalBatches: 4 }
);
```

## Event Throttling

- Maximum 2 events per second per session
- Events with progress < 100% are throttled
- Completion and error events are never throttled

##### `calculateETA(session, currentProgress): number | null`

Calculates estimated time of arrival based on current progress and elapsed time.

## Parameters: (3)

- `session` (object): Session object from sessions Map
- `currentProgress` (number): Current progress percentage (0-100)

## Returns

- `number`: Estimated seconds remaining
- `null`: If progress is 0 or calculation not possible

## Algorithm

```javascript
calculateETA(session, currentProgress) {
  if (currentProgress <= 0) return null;
  
  const elapsed = Date.now() - session.startTime;
  const totalTime = (elapsed / currentProgress) * 100;
  const remaining = totalTime - elapsed;
  
  return remaining > 0 ? Math.round(remaining / 1000) : 0;
}
```

**Time Complexity:** O(1)
**Space Complexity:** O(1)

##### `completeSession(sessionId, success?): void`

Marks a session as completed and schedules cleanup.

## Parameters: (4)

- `sessionId` (string): Session identifier
- `success` (boolean, optional): Whether import completed successfully (default: true)

## Example: (3)

```javascript
// Successful completion
progressTracker.completeSession(sessionId, true);

// Failed completion
progressTracker.completeSession(sessionId, false);
```

## Cleanup Behavior

- Session marked as 'completed' or 'failed'
- Automatic cleanup after 5 minutes
- Memory released for sessions and timing maps

### WebSocket Server Events

#### Connection Handling

```javascript
io.on('connection', (socket) => {
  // Client connected
  console.log(`Client connected: ${socket.id}`);
});
```

#### Event Listeners

##### `joinSession`

Client requests to join a specific import session room.

## Client Request

```javascript
socket.emit('joinSession', sessionId);
```

## Server Handler

```javascript
socket.on('joinSession', (sessionId) => {
  socket.join(sessionId);
  console.log(`Client ${socket.id} joined session ${sessionId}`);
});
```

##### `cancelImport`

Client requests to cancel an active import operation.

## Client Request: (2)

```javascript
socket.emit('cancelImport', sessionId);
```

## Server Handler: (2)

```javascript
socket.on('cancelImport', (sessionId) => {
  const session = progressTracker.sessions.get(sessionId);
  if (session) {
    session.cancelled = true;
    io.to(sessionId).emit('importCancelled', { sessionId });
  }
});
```

##### `disconnect`

Client disconnects from WebSocket server.

## Server Handler: (3)

```javascript
socket.on('disconnect', () => {
  console.log(`Client disconnected: ${socket.id}`);
});
```

#### Event Emissions

##### `importProgress`

Server emits progress updates to session room.

## Event Data

```javascript
{
  sessionId: string,      // Session identifier
  type: string,          // Event type
  progress: number,      // Progress percentage (0-100)
  message: string,       // Status message
  timestamp: number,     // Unix timestamp
  eta: number | null,    // Estimated seconds remaining
  ...additionalData      // Optional extra data
}
```

## Example: (4)

```javascript
io.to(sessionId).emit('importProgress', {
  sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  type: 'loading',
  progress: 45,
  message: 'Loading batch 2 of 4...',
  timestamp: 1694876543210,
  eta: 120,
  batchNumber: 2,
  totalBatches: 4
});
```

##### `importCancelled`

Server confirms import cancellation to session room.

## Event Data: (2)

```javascript
{
  sessionId: string     // Session identifier
}
```

## Client-Side APIs

### WebSocketClient Class

Manages WebSocket connection lifecycle and event handling.

#### Constructor (2)

```javascript
const client = new WebSocketClient();
```

## Properties

```javascript
{
  socket: Socket | null,           // Socket.io client instance
  connectionState: string,         // 'connected', 'disconnected'
  reconnectAttempts: number,       // Current reconnection attempts
  maxReconnectAttempts: number,    // Maximum reconnection attempts (5)
  reconnectDelay: number          // Base reconnection delay in ms (1000)
}
```

#### Methods (2)

##### `connect(): boolean`

Establishes WebSocket connection to server.

## Returns: (2)

- `true`: Connection initiated successfully
- `false`: Socket.io not available, fallback to polling

## Example: (5)

```javascript
if (WebSocketClient.connect()) {
  console.log('WebSocket connection initiated');
} else {
  console.log('Falling back to HTTP polling');
}
```

## Event Handlers

- `connect`: Sets state to 'connected', resets reconnect attempts
- `disconnect`: Sets state to 'disconnected', triggers reconnection
- `importProgress`: Routes to ProgressModal.updateProgress()
- `importCancelled`: Routes to ProgressModal.showCancelled()

##### `joinSession(sessionId: string): void`

Joins a specific import session room.

## Parameters: (5)

- `sessionId` (string): Session identifier

## Example: (6)

```javascript
const sessionId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
WebSocketClient.joinSession(sessionId);
```

## Preconditions

- WebSocket connection must be active
- Valid session ID required

##### `cancelImport(sessionId: string): void`

Requests cancellation of an active import.

## Parameters: (6)

- `sessionId` (string): Session identifier to cancel

## Example: (7)

```javascript
WebSocketClient.cancelImport(sessionId);
```

##### `attemptReconnect(): void`

Initiates reconnection with exponential backoff.

## Reconnection Strategy

- Maximum 5 attempts
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Automatic retry on connection failure

## Example: (8)

```javascript
// Called automatically on disconnect
WebSocketClient.attemptReconnect();
```

### ProgressModal Component

Provides UI for progress visualization and user interaction.

#### Properties (2)

```javascript
window.ProgressModal = {
  currentSessionId: string | null,    // Active session ID
  modal: Bootstrap.Modal | null       // Bootstrap modal instance
};
```

#### Methods (3)

##### `show(title: string, sessionId: string): void`

Displays progress modal with specified title and session.

## Parameters: (7)

- `title` (string): Modal title text
- `sessionId` (string): Session identifier

## Example: (9)

```javascript
ProgressModal.show('Importing Vulnerabilities', sessionId);
```

## Modal Structure

```html
<div class="modal fade" id="progressModal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Importing Vulnerabilities</h5>
      </div>
      <div class="modal-body">
        <div class="progress">
          <div class="progress-bar"></div>
        </div>
        <div class="status-message">Initializing...</div>
        <div class="eta-display">ETA: 2m 30s</div>
      </div>
      <div class="modal-footer">
        <button onclick="ProgressModal.cancel()">Cancel Import</button>
      </div>
    </div>
  </div>
</div>
```

##### `updateProgress(data: ProgressEvent): void`

Updates modal UI with progress event data.

## Parameters: (8)

- `data` (object): Progress event object from WebSocket

## Event Data Structure

```javascript
{
  sessionId: string,
  type: string,
  progress: number,
  message: string,
  eta?: number,
  timestamp: number
}
```

## UI Updates

- Progress bar width and text
- Status message display
- ETA calculation and display
- Success/error state styling

## Example: (10)

```javascript
ProgressModal.updateProgress({
  sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  type: 'loading',
  progress: 65,
  message: 'Processing vulnerabilities...',
  eta: 90,
  timestamp: 1694876543210
});
```

##### `showError(errorMessage: string): void`

Displays error state in progress modal.

## Parameters: (9)

- `errorMessage` (string): Error description

## UI Changes

- Progress bar changes to red (bg-danger)
- Animation stops
- Error message displayed
- Modal remains open for user acknowledgment

##### `cancel(): void`

Cancels active import and hides modal.

## Behavior

- Calls WebSocketClient.cancelImport() if session active
- Hides modal immediately
- Resets session state

##### `hide(): void`

Closes and removes progress modal from DOM.

## Cleanup

- Hides Bootstrap modal
- Removes modal element after animation
- Resets currentSessionId to null
- Cleans up event listeners

##### `formatETA(seconds: number): string`

Formats ETA seconds into human-readable string.

## Parameters: (10)

- `seconds` (number): Estimated seconds remaining

## Returns: (3)

- `string`: Formatted time string

## Examples

```javascript
formatETA(45);    // "45s"
formatETA(90);    // "1m 30s"
formatETA(3665);  // "61m 5s"
```

## Event Schemas

### Progress Event Schema

```typescript
interface ProgressEvent {
  sessionId: string;                    // UUID session identifier
  type: 'parsing' | 'loading' | 'processing' | 'finalizing' | 'complete' | 'error';
  progress: number;                     // 0-100 integer percentage
  message: string;                      // Human-readable status
  timestamp: number;                    // Unix timestamp in milliseconds
  eta?: number;                        // Estimated seconds remaining
  [key: string]: any;                  // Additional event-specific data
}
```

### Session Management Schema

```typescript
interface ImportSession {
  id: string;                          // UUID session identifier
  startTime: number;                   // Session start timestamp
  progress: number;                    // Current progress (0-100)
  status: 'active' | 'completed' | 'failed';
  totalRows: number;                   // Total rows to process
  processedRows: number;               // Rows processed so far
  cancelled?: boolean;                 // Cancellation flag
  endTime?: number;                   // Session end timestamp
}
```

### WebSocket Message Schema

```typescript
// Client to Server
interface ClientMessage {
  event: 'joinSession' | 'cancelImport';
  sessionId: string;
}

// Server to Client
interface ServerMessage {
  event: 'importProgress' | 'importCancelled';
  data: ProgressEvent | { sessionId: string };
}
```

## Error Handling

### Connection Errors

```javascript
// Handle connection failure
socket.on('connect_error', (error) => {
  console.error('WebSocket connection failed:', error);
  // Fallback to HTTP polling for progress updates
});
```

### Session Errors

```javascript
// Handle invalid session
if (!progressTracker.sessions.has(sessionId)) {
  throw new Error(`Session ${sessionId} not found`);
}
```

### Import Errors

```javascript
// Emit error event
progressTracker.emitProgress(
  sessionId, 
  'error', 
  0, 
  'Database connection failed'
);
```

## Configuration Options

### Server Configuration

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});
```

### Client Configuration

```javascript
const socket = io({
  transports: ['websocket', 'polling'],
  timeout: 20000,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

### Progress Throttling

```javascript
// Configurable throttling parameters
const THROTTLE_INTERVAL = 500;  // 500ms = 2 events/second
const MIN_PROGRESS_DELTA = 1;   // Minimum 1% change required
```

## Performance Considerations

### Memory Usage

- **Sessions Map**: ~1KB per active session
- **Timing Map**: ~100 bytes per session
- **Event Overhead**: ~500 bytes per progress event

### Network Overhead

- **Connection**: ~2KB initial handshake
- **Progress Events**: ~200-500 bytes per event
- **Throttling**: Maximum 2 events/second per session

### CPU Usage

- **ETA Calculation**: O(1) time complexity
- **Event Emission**: O(n) where n = clients in session room
- **Session Cleanup**: O(1) with setTimeout

---

*API Reference Version: 1.0.0*
*Generated: September 6, 2025*
*Compatibility: Socket.io 4.7+, Bootstrap 5+*
