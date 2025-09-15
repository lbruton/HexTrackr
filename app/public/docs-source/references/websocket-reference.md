# WebSocket Reference

Complete reference for HexTrackr's real-time WebSocket communication system, including session management, event types, and client integration patterns.

---

## Connection Overview

**Server**: `ws://localhost:8988`
**Protocol**: Socket.io v4+
**Transport**: WebSocket with polling fallback
**Session Management**: UUID-based with automatic cleanup
**Throttling**: 100ms minimum interval between progress events

---

## Server Architecture (ProgressTracker)

### Class Definition

```javascript
class ProgressTracker {
    constructor(io) {
        this.io = io;                           // Socket.io server instance
        this.sessions = new Map();              // sessionId -> session data
        this.eventThrottle = new Map();         // sessionId -> lastEmitTime
        this.THROTTLE_INTERVAL = 100;          // ms between progress events
        this.SESSION_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
    }
}
```

### Session Data Structure

```javascript
const session = {
    id: "uuid-v4-string",
    progress: 0.0,                    // 0.0 to 1.0
    lastUpdate: Date.now(),           // timestamp
    metadata: {
        operation: "vulnerability_import",
        filename: "scan_data.csv",
        totalRows: 1500,
        processedRows: 750,
        startTime: "2025-01-12T10:30:00Z",
        estimatedCompletion: "2025-01-12T10:35:00Z"
    },
    status: "processing",             // processing, completed, error, cancelled
    result: null                      // final result when completed
};
```

---

## Server-Side API

### Session Management

#### createSession(metadata?)

```javascript
createSession(metadata = {})
```

**Purpose**: Create new progress tracking session
**Parameters**: `metadata` - Optional session metadata object
**Returns**: Session UUID string
**Side Effects**: Emits `session_created` event to all clients

#### createSessionWithId(sessionId, metadata?)

```javascript
createSessionWithId(sessionId, metadata = {})
```

**Purpose**: Create session with specific ID (for deterministic testing)
**Parameters**: `sessionId` - Specific UUID, `metadata` - Session metadata
**Returns**: Session object

#### updateProgress(sessionId, progress, metadata?)

```javascript
updateProgress(sessionId, progress, metadata = {})
```

**Purpose**: Update session progress with throttling
**Parameters**:

- `sessionId` - Session UUID
- `progress` - Progress value (0.0 to 1.0)
- `metadata` - Additional progress metadata
**Throttling**: Enforces 100ms minimum interval between events
**Side Effects**: Emits `import_progress` event if not throttled

#### completeSession(sessionId, result?)

```javascript
completeSession(sessionId, result = {})
```

**Purpose**: Mark session as completed
**Parameters**: `sessionId` - Session UUID, `result` - Final result data
**Side Effects**: Emits `import_complete` event, schedules cleanup

#### errorSession(sessionId, error)

```javascript
errorSession(sessionId, error)
```

**Purpose**: Mark session as failed
**Parameters**: `sessionId` - Session UUID, `error` - Error details
**Side Effects**: Emits `import_error` event, schedules cleanup

#### cancelSession(sessionId)

```javascript
cancelSession(sessionId, reason?)
```

**Purpose**: Cancel active session
**Parameters**: `sessionId` - Session UUID, `reason` - Optional cancellation reason
**Side Effects**: Emits `import_cancelled` event, immediate cleanup

### Cleanup Operations

#### cleanupStaleSessions()

```javascript
cleanupStaleSessions()
```

**Purpose**: Remove sessions older than cleanup interval
**Frequency**: Automatic every 30 minutes
**Criteria**: Sessions with lastUpdate > 30 minutes ago

#### cleanup(sessionId)

```javascript
cleanup(sessionId)
```

**Purpose**: Remove specific session and its throttle data
**Parameters**: `sessionId` - Session UUID to remove

---

## Event Types

### 1. session_created

**Trigger**: New session creation
**Payload**:

```javascript
{
    sessionId: "uuid-string",
    metadata: {
        operation: "vulnerability_import",
        filename: "data.csv",
        // ... other metadata
    },
    timestamp: "2025-01-12T10:30:00.123Z"
}
```

### 2. import_progress

**Trigger**: Progress updates (throttled to 100ms intervals)
**Payload**:

```javascript
{
    sessionId: "uuid-string",
    operation: "vulnerability_import",
    progress: 0.65,                    // 0.0 to 1.0
    current_step: "Processing CSV data",
    processed_rows: 975,
    total_rows: 1500,
    eta_seconds: 45,
    status: "processing",
    metadata: {
        filename: "vulnerability_scan.csv",
        vendor: "tenable",
        scan_date: "2025-01-12",
        processing_speed: "65 rows/sec"
    },
    timestamp: "2025-01-12T10:32:15.456Z"
}
```

### 3. import_complete

**Trigger**: Session completion
**Payload**:

```javascript
{
    sessionId: "uuid-string",
    operation: "vulnerability_import",
    success: true,
    import_id: 47,
    total_processed: 1500,
    processing_time_ms: 4250,
    summary: {
        new_vulnerabilities: 78,
        updated_vulnerabilities: 234,
        resolved_vulnerabilities: 45,
        skipped_duplicates: 12,
        validation_errors: 0
    },
    performance: {
        rows_per_second: 353,
        peak_memory_mb: 156,
        database_operations: 2847
    },
    timestamp: "2025-01-12T10:34:15.789Z"
}
```

### 4. import_error

**Trigger**: Session failure or critical error
**Payload**:

```javascript
{
    sessionId: "uuid-string",
    operation: "vulnerability_import",
    success: false,
    error: {
        code: "CSV_PARSING_ERROR",
        message: "Invalid CSV format detected",
        details: {
            line_number: 157,
            column: "severity",
            received_value: "SUPER_CRITICAL",
            expected_values: ["Critical", "High", "Medium", "Low"]
        },
        recovery_suggestions: [
            "Check CSV format against template",
            "Validate severity values",
            "Try importing smaller batches"
        ]
    },
    partial_results: {
        processed_rows: 156,
        successful_imports: 145,
        failed_rows: 11
    },
    timestamp: "2025-01-12T10:32:45.321Z"
}
```

### 5. import_cancelled

**Trigger**: Session cancellation (user or system initiated)
**Payload**:

```javascript
{
    sessionId: "uuid-string",
    operation: "vulnerability_import",
    cancelled: true,
    reason: "user_requested",
    partial_results: {
        processed_rows: 523,
        completion_percentage: 0.349
    },
    cleanup_performed: true,
    timestamp: "2025-01-12T10:33:30.654Z"
}
```

### 6. data_updated

**Trigger**: Significant data changes that affect multiple clients
**Payload**:

```javascript
{
    type: "vulnerabilities",
    action: "bulk_update",           // created, updated, deleted, bulk_update
    count: 78,
    affected_entities: {
        hosts: ["web-server-01", "db-server-02", "app-server-03"],
        severity_changes: {
            new_critical: 5,
            resolved_high: 12
        }
    },
    source: {
        import_id: 47,
        operation: "csv_import"
    },
    timestamp: "2025-01-12T10:34:16.000Z"
}
```

### 7. system_alert

**Trigger**: System-wide notifications and alerts
**Payload**:

```javascript
{
    level: "warning",               // info, warning, error, critical
    category: "maintenance",        // maintenance, security, performance, system
    message: "Database backup recommended - last backup was 7 days ago",
    action_required: false,
    action_details: {
        description: "Run backup operation",
        endpoint: "/api/backup/all",
        estimated_time: "2-3 minutes"
    },
    auto_dismiss: 30000,           // auto-dismiss after 30 seconds
    priority: "medium",
    timestamp: "2025-01-12T10:35:00.000Z"
}
```

### 8. heartbeat

**Trigger**: Regular connection health checks
**Frequency**: Every 30 seconds
**Payload**:

```javascript
{
    server_time: "2025-01-12T10:35:00.000Z",
    active_sessions: 3,
    server_uptime: "2d 4h 15m 32s",
    memory_usage: {
        used_mb: 156,
        available_mb: 356
    }
}
```

---

## Client-Side Integration

### WebSocketClient Class

```javascript
class WebSocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.heartbeatInterval = null;
        this.eventCallbacks = new Map();

        this.config = {
            host: window.location.hostname || "localhost",
            port: "8988",
            autoReconnect: true,
            heartbeatInterval: 30000,
            progressThrottle: 100
        };
    }
}
```

### Connection Management

#### connect()

```javascript
async connect(): Promise<boolean>
```

**Purpose**: Establish WebSocket connection with retry logic
**Returns**: Promise resolving to connection success
**Features**:

- 10-second connection timeout
- Transport fallback (WebSocket → polling)
- Automatic event listener setup
- Error handling and recovery

**Example**:

```javascript
const wsClient = new WebSocketClient();
try {
    await wsClient.connect();
    console.log('WebSocket connected successfully');
} catch (error) {
    console.error('Connection failed:', error);
}
```

#### disconnect()

```javascript
disconnect(): void
```

**Purpose**: Gracefully close WebSocket connection
**Features**: Cleanup event listeners and stop heartbeat

### Event Subscription

#### subscribe(eventType, callback)

```javascript
subscribe(eventType: string, callback: Function): void
```

**Purpose**: Subscribe to specific event types
**Parameters**: `eventType` - Event name, `callback` - Handler function

**Example**:

```javascript
wsClient.subscribe('import_progress', (data) => {
    updateProgressBar(data.progress);
    updateStatus(data.current_step);
    updateETA(data.eta_seconds);
});
```

#### unsubscribe(eventType, callback?)

```javascript
unsubscribe(eventType: string, callback?: Function): void
```

**Purpose**: Remove event subscriptions
**Parameters**: `eventType` - Event name, `callback` - Specific handler (optional)

### Progress Tracking Integration

#### trackImportProgress(sessionId)

```javascript
trackImportProgress(sessionId: string): void
```

**Purpose**: Set up progress tracking for specific session
**Features**: Automatic UI updates and error handling

**Example**:

```javascript
// Start import and track progress
const response = await fetch('/api/vulnerabilities/import', {
    method: 'POST',
    body: formData
});

const result = await response.json();
if (result.sessionId) {
    wsClient.trackImportProgress(result.sessionId);
}
```

### Reconnection Logic

#### attemptReconnection()

```javascript
attemptReconnection(): void
```

**Purpose**: Handle automatic reconnection with exponential backoff
**Strategy**:

1. Wait `reconnectDelay` milliseconds
2. Attempt connection
3. On failure, double delay (max 30 seconds)
4. Retry up to `maxReconnectAttempts` times

### Client-Side Throttling

#### handleProgressUpdate(data)

```javascript
handleProgressUpdate(data: ProgressData): void
```

**Purpose**: Additional client-side throttling for UI updates
**Features**: Prevents UI overload during rapid progress updates

---

## Integration Patterns

### CSV Import with Progress Tracking

```javascript
// Complete CSV import workflow with WebSocket progress
async function importCSVWithProgress(file, options = {}) {
    // 1. Connect to WebSocket
    await wsClient.connect();

    // 2. Set up progress handlers
    wsClient.subscribe('import_progress', handleProgressUpdate);
    wsClient.subscribe('import_complete', handleImportComplete);
    wsClient.subscribe('import_error', handleImportError);

    // 3. Start import
    const formData = new FormData();
    formData.append('csvFile', file);
    formData.append('vendor', options.vendor || 'generic');

    const response = await fetch('/api/vulnerabilities/import', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    return result;
}

function handleProgressUpdate(data) {
    const percentage = Math.round(data.progress * 100);
    updateProgressBar(percentage);
    updateStatusText(data.current_step);

    if (data.eta_seconds) {
        updateETA(data.eta_seconds);
    }
}

function handleImportComplete(data) {
    showSuccessMessage('Import completed successfully!');
    updateDataGrid(); // Refresh UI with new data
    wsClient.unsubscribe('import_progress', handleProgressUpdate);
}

function handleImportError(data) {
    showErrorMessage(data.error.message);
    if (data.error.recovery_suggestions) {
        showRecoverySuggestions(data.error.recovery_suggestions);
    }
}
```

### Real-time Data Updates

```javascript
// Monitor data changes across the application
wsClient.subscribe('data_updated', (data) => {
    switch (data.type) {
        case 'vulnerabilities':
            if (data.action === 'bulk_update') {
                // Refresh vulnerability dashboard
                refreshVulnerabilityCharts();
                updateStatistics();
            }
            break;

        case 'tickets':
            // Update ticket counts
            updateTicketSummary();
            break;
    }
});
```

### System Monitoring

```javascript
// Handle system alerts and maintenance notifications
wsClient.subscribe('system_alert', (alert) => {
    const toast = createToast(alert.level, alert.message);

    if (alert.action_required) {
        toast.addAction('Take Action', () => {
            // Handle required action
            performMaintenanceAction(alert.action_details);
        });
    }

    if (alert.auto_dismiss) {
        setTimeout(() => toast.dismiss(), alert.auto_dismiss);
    }

    showToast(toast);
});
```

---

## Error Handling & Recovery

### Connection Errors

| Error Type | Recovery Strategy |
|------------|------------------|
| **Connection Timeout** | Automatic retry with exponential backoff |
| **Transport Failure** | Fallback to polling transport |
| **Authentication Error** | Refresh credentials and reconnect |
| **Server Unavailable** | Queue events for replay after reconnection |

### Session Errors

| Error Code | Description | Recovery |
|------------|-------------|----------|
| `SESSION_NOT_FOUND` | Session expired or invalid | Create new session |
| `SESSION_CANCELLED` | Session was cancelled | Display cancellation message |
| `RATE_LIMIT_EXCEEDED` | Too many progress updates | Client-side throttling |
| `SERVER_OVERLOAD` | Server under heavy load | Implement backoff strategy |

### Graceful Degradation

When WebSocket connection fails:

1. **Polling Fallback**: Switch to HTTP polling for critical updates
2. **Local State Management**: Maintain UI state without real-time updates
3. **Manual Refresh**: Provide manual refresh options
4. **Status Indicators**: Clear connection status display

---

## Performance Considerations

### Server-Side Optimizations

- **Session Throttling**: 100ms minimum between progress events
- **Memory Management**: Automatic cleanup of stale sessions
- **Connection Pooling**: Efficient Socket.io connection handling
- **Event Batching**: Combine related events when possible

### Client-Side Optimizations

- **UI Throttling**: Additional throttling for DOM updates
- **Event Deduplication**: Ignore duplicate progress events
- **Memory Cleanup**: Proper event listener cleanup
- **Selective Updates**: Update only changed UI elements

### Monitoring Metrics

Track these metrics for performance optimization:

- Active session count
- Event emission rate
- Connection success rate
- Reconnection frequency
- Memory usage trends

---

## Security Considerations

### Connection Security

- **Origin Validation**: Verify client origins in production
- **Rate Limiting**: Prevent WebSocket abuse
- **Authentication**: Implement session-based auth for sensitive operations
- **Input Validation**: Validate all client-sent data

### Session Security

- **UUID Generation**: Cryptographically secure session IDs
- **Session Expiration**: Automatic cleanup prevents accumulation
- **Data Sanitization**: Clean all user-provided metadata
- **Access Control**: Validate client permissions for operations

---

This WebSocket reference provides complete integration guidance for HexTrackr's real-time communication system, enabling robust progress tracking and system monitoring.
