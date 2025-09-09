# WebSocket Progress Tracking - Technical Architecture

## Overview

The WebSocket Progress Tracking system provides real-time progress updates for CSV import operations in HexTrackr, replacing basic toast notifications with detailed progress visualization and user control capabilities.

## System Architecture

### High-Level Design

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   Frontend UI   │◄──────────────►│  Express Server │
│                 │    Events       │                 │
│ ┌─────────────┐ │                 │ ┌─────────────┐ │
│ │Progress     │ │                 │ │ Progress    │ │
│ │Modal        │ │                 │ │ Tracker     │ │
│ └─────────────┘ │                 │ └─────────────┘ │
│                 │                 │                 │
│ ┌─────────────┐ │                 │ ┌─────────────┐ │
│ │WebSocket    │ │                 │ │Socket.io    │ │
│ │Client       │ │                 │ │Server       │ │
│ └─────────────┘ │                 │ └─────────────┘ │
└─────────────────┘                 └─────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  Import System  │
                                    │                 │
                                    │ ┌─────────────┐ │
                                    │ │Staging      │ │
                                    │ │Table        │ │
                                    │ └─────────────┘ │
                                    │                 │
                                    │ ┌─────────────┐ │
                                    │ │Deduplication│ │
                                    │ │System       │ │
                                    │ └─────────────┘ │
                                    └─────────────────┘
```

### Core Components

#### 1. Backend Components

## Socket.io Server Integration

- Integrates with Express HTTP server
- Manages WebSocket connections and rooms
- Handles client connection lifecycle
- Provides CORS configuration for cross-origin support

## ProgressTracker Class

- Manages import session state and progress calculation
- Implements event throttling (max 2 events/second)
- Calculates ETA based on elapsed time and progress
- Handles session cleanup and memory management

## Import Integration Points

- `bulkLoadToStagingTable()`: Progress tracking for CSV parsing and staging
- `processStagingToFinalTables()`: Progress tracking for deduplication and finalization
- Error event emission for import failures
- Cancel mechanism for interrupted imports

#### 2. Frontend Components

## WebSocketClient Module

- Manages connection state and auto-reconnection
- Implements exponential backoff for reconnection attempts
- Handles WebSocket event routing to UI components
- Provides graceful degradation when WebSocket unavailable

## ProgressModal Component

- Responsive Bootstrap modal with progress visualization
- Real-time progress bar with percentage display
- ETA calculation and status messaging
- Cancel button with import termination capability

#### 3. Integration Layer

## Session Management

- UUID-based session identification
- Session isolation for concurrent imports
- Room-based event distribution via Socket.io
- Automatic session cleanup after completion

## Technical Specifications

### WebSocket Event Schema

#### Progress Events

```javascript
{
  sessionId: "uuid-v4-string",
  type: "parsing" | "loading" | "processing" | "finalizing" | "complete" | "error",
  progress: 0-100,           // Integer percentage
  message: "string",         // Human-readable status
  timestamp: 1694876543210,  // Unix timestamp
  eta: 60,                   // Estimated seconds remaining (optional)
  data: {}                   // Additional event-specific data (optional)
}
```

#### Control Events

```javascript
// Client to Server
{
  event: "joinSession",
  sessionId: "uuid-v4-string"
}

{
  event: "cancelImport", 
  sessionId: "uuid-v4-string"
}

// Server to Client
{
  event: "importCancelled",
  sessionId: "uuid-v4-string"
}
```

### Progress Calculation Algorithm

The progress tracking system divides import operations into weighted phases:

1. **Parsing Phase (0-5%)**: CSV file parsing and validation
2. **Loading Phase (5-70%)**: Bulk loading to staging table
3. **Processing Phase (70-95%)**: Deduplication and lifecycle management
4. **Finalizing Phase (95-100%)**: Cleanup and completion

#### ETA Calculation

```javascript
// Complexity: O(1) - Constant time calculation
calculateETA(session, currentProgress) {
  if (currentProgress <= 0) return null;
  
  const elapsed = Date.now() - session.startTime;
  const totalTime = (elapsed / currentProgress) * 100;
  const remaining = totalTime - elapsed;
  
  return remaining > 0 ? Math.round(remaining / 1000) : 0;
}
```

**Time Complexity**: O(1) - Constant time operation
**Space Complexity**: O(1) - No additional memory allocation

### Performance Considerations

#### Event Throttling

To prevent UI overwhelming and maintain performance:

```javascript
// Throttle emissions to maximum 2 events per second
if (now - lastEmission < 500 && progress < 100) {
  return; // Skip emission
}
```

**Benefits**:

- Reduces network overhead
- Prevents UI flickering
- Maintains smooth progress animations
- Preserves server resources

#### Memory Management

- Session data automatically cleaned up after 5 minutes
- WebSocket connections properly closed on client disconnect
- Progress event data not persisted beyond session lifetime
- Exponential backoff prevents connection spam

### Error Handling and Resilience

#### Connection Resilience

```javascript
// Auto-reconnection with exponential backoff
attemptReconnect() {
  if (this.reconnectAttempts < this.maxReconnectAttempts) {
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }
}
```

**Retry Strategy**:

- Maximum 5 reconnection attempts
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Graceful degradation to basic notifications

#### Import Error Handling

- Database connection failures emit error events
- Malformed CSV files trigger error state in UI
- Import cancellation cleans up partial data
- Error messages provide actionable feedback

## API Reference

### Server-Side API

#### ProgressTracker Class (2)

```javascript
class ProgressTracker {
  constructor()
  createSession(sessionId: string): void
  emitProgress(sessionId: string, type: string, progress: number, message: string, data?: object): void
  calculateETA(session: object, currentProgress: number): number | null
  completeSession(sessionId: string, success: boolean): void
}
```

#### WebSocket Server Events

```javascript
// Connection handling
io.on('connection', (socket) => {
  socket.on('joinSession', (sessionId) => {...})
  socket.on('cancelImport', (sessionId) => {...})
  socket.on('disconnect', () => {...})
})
```

### Client-Side API

#### WebSocketClient Class

```javascript
class WebSocketClient {
  constructor()
  connect(): boolean
  joinSession(sessionId: string): void
  cancelImport(sessionId: string): void
  attemptReconnect(): void
}
```

#### ProgressModal Component (2)

```javascript
window.ProgressModal = {
  show(title: string, sessionId: string): void
  updateProgress(data: ProgressEvent): void
  showError(errorMessage: string): void
  cancel(): void
  hide(): void
  formatETA(seconds: number): string
}
```

## Deployment Configuration

### Dependencies

```json
{
  "socket.io": "^4.7.2",
  "uuid": "^9.0.0"
}
```

### Docker Configuration

The WebSocket server integrates with the existing Docker setup:

```javascript
// server.js modifications
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST']
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebSocket support`);
});
```

### Environment Variables

- `NODE_ENV`: Controls CORS policy (production vs development)
- `PORT`: Server port (default: 8080)

## Usage Examples

### Basic Import with Progress Tracking

```javascript
// Frontend usage
const sessionId = crypto.randomUUID();
ProgressModal.show('Importing Vulnerabilities', sessionId);
WebSocketClient.connect();

// Backend integration
async function importWithProgress(csvData) {
  const sessionId = generateSessionId();
  
  try {
    await bulkLoadToStagingTable(csvData, sessionId);
    await processStagingToFinalTables(sessionId);
  } catch (error) {
    progressTracker.emitProgress(sessionId, 'error', 0, error.message);
  }
}
```

### Cancel Import Operation

```javascript
// User clicks cancel button
ProgressModal.cancel(); // Calls WebSocketClient.cancelImport()

// Server handles cancellation
socket.on('cancelImport', (sessionId) => {
  const session = progressTracker.sessions.get(sessionId);
  if (session) {
    session.cancelled = true;
    io.to(sessionId).emit('importCancelled', { sessionId });
  }
});
```

## Performance Metrics

### Expected Performance Impact

- **Import Speed Impact**: < 5% overhead
- **Network Overhead**: ~2 events/second during import
- **Memory Usage**: ~1KB per active session
- **Connection Latency**: < 500ms for progress updates

### Monitoring and Observability

- Connection count logging
- Session lifecycle tracking
- Error rate monitoring
- Performance impact measurement

## Security Considerations

### CORS Configuration

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST']
  }
});
```

### Session Isolation

- UUID-based session identification prevents session hijacking
- Room-based event distribution ensures event isolation
- No persistent session storage reduces attack surface

### Input Validation

- Session ID validation before processing
- Progress value bounds checking (0-100)
- Message content sanitization for UI display

## Troubleshooting

### Common Issues

## WebSocket Connection Fails

- Check CORS configuration
- Verify Socket.io client library loaded
- Confirm server port accessibility

## Progress Events Not Received

- Verify client joined session room
- Check network connectivity
- Confirm session ID matches

## Import Cancellation Not Working

- Verify WebSocket connection active
- Check server-side cancellation logic
- Confirm session exists in ProgressTracker

### Debug Tools

```javascript
// Enable Socket.io debug logging
localStorage.debug = 'socket.io-client:socket';

// Check WebSocket connection state
console.log(window.WebSocketClient.connectionState);

// Monitor active sessions
console.log(progressTracker.sessions);
```

## Future Enhancements

### Planned Improvements

1. **Progress Persistence**: Store progress state for recovery after disconnection
2. **Batch Import Queue**: Support for queued import operations
3. **Progress History**: Maintain import history for audit purposes
4. **Advanced Analytics**: Detailed performance metrics and reporting
5. **Mobile Optimization**: Enhanced mobile UI experience

### Extension Points

- Custom progress event types
- Pluggable ETA calculation algorithms
- Configurable throttling parameters
- Custom UI themes and layouts

---

*Generated: September 6, 2025*
*Version: 1.0.0*
*Status: Implementation Ready*
