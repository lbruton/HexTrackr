# WebSocket Progress Tracking - Implementation Guide

## Quick Start Implementation

This guide provides step-by-step instructions for implementing WebSocket progress tracking in HexTrackr.

## Prerequisites

- Node.js/Express server running
- Bootstrap 5 for UI components
- Basic understanding of WebSocket concepts

## Phase 1: Backend Setup

### Step 1: Install Dependencies

```bash
npm install socket.io uuid
```

### Step 2: Server Integration

Add to your `server.js` file:

```javascript
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// Replace Express app.listen with HTTP server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST']
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('joinSession', (sessionId) => {
    socket.join(sessionId);
    console.log(`Client ${socket.id} joined session ${sessionId}`);
  });
  
  socket.on('cancelImport', (sessionId) => {
    const session = progressTracker.sessions.get(sessionId);
    if (session) {
      session.cancelled = true;
      io.to(sessionId).emit('importCancelled', { sessionId });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebSocket support`);
});
```

### Step 3: Progress Tracker Implementation

Add the ProgressTracker class to `server.js`:

```javascript
class ProgressTracker {
  constructor() {
    this.sessions = new Map();
    this.lastEmissionTime = new Map();
  }

  createSession(sessionId) {
    this.sessions.set(sessionId, {
      id: sessionId,
      startTime: Date.now(),
      progress: 0,
      status: 'active',
      totalRows: 0,
      processedRows: 0
    });
  }

  emitProgress(sessionId, type, progress, message, additionalData = {}) {
    const now = Date.now();
    const lastEmission = this.lastEmissionTime.get(sessionId) || 0;
    
    // Throttle emissions to max 2 per second
    if (now - lastEmission < 500 && progress < 100) {
      return;
    }

    const session = this.sessions.get(sessionId);
    if (!session) return;

    const progressData = {
      sessionId,
      type,
      progress: Math.round(progress),
      message,
      timestamp: now,
      eta: this.calculateETA(session, progress),
      ...additionalData
    };

    io.to(sessionId).emit('importProgress', progressData);
    this.lastEmissionTime.set(sessionId, now);
    
    session.progress = progress;
    session.lastUpdate = now;
  }

  calculateETA(session, currentProgress) {
    if (currentProgress <= 0) return null;
    
    const elapsed = Date.now() - session.startTime;
    const totalTime = (elapsed / currentProgress) * 100;
    const remaining = totalTime - elapsed;
    
    return remaining > 0 ? Math.round(remaining / 1000) : 0;
  }

  completeSession(sessionId, success = true) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = success ? 'completed' : 'failed';
      session.endTime = Date.now();
      
      setTimeout(() => {
        this.sessions.delete(sessionId);
        this.lastEmissionTime.delete(sessionId);
      }, 5 * 60 * 1000);
    }
  }
}

const progressTracker = new ProgressTracker();
```

## Phase 2: Import Integration

### Step 4: Modify Import Functions

Update your CSV import functions to emit progress events:

```javascript
async function bulkLoadToStagingTable(csvData, sessionId = null) {
  if (sessionId) {
    progressTracker.createSession(sessionId);
    progressTracker.emitProgress(sessionId, 'parsing', 5, 'Preparing data for import...');
  }

  try {
    const BATCH_SIZE = 1000;
    const totalRows = csvData.length;
    let processedRows = 0;

    if (sessionId) {
      const session = progressTracker.sessions.get(sessionId);
      session.totalRows = totalRows;
      progressTracker.emitProgress(sessionId, 'loading', 10, `Loading ${totalRows} rows to staging table...`);
    }

    for (let i = 0; i < csvData.length; i += BATCH_SIZE) {
      const batch = csvData.slice(i, i + BATCH_SIZE);
      
      // Your existing batch processing logic here
      await processBatch(batch);

      processedRows += batch.length;
      
      if (sessionId) {
        const progress = 10 + (processedRows / totalRows) * 60;
        progressTracker.emitProgress(
          sessionId, 
          'loading', 
          progress, 
          `Loaded ${processedRows}/${totalRows} rows to staging table...`
        );
      }
    }

    if (sessionId) {
      progressTracker.emitProgress(sessionId, 'loading', 70, 'Staging table loading completed');
    }

    return processedRows;
  } catch (error) {
    if (sessionId) {
      progressTracker.emitProgress(sessionId, 'error', 0, `Error loading to staging: ${error.message}`);
    }
    throw error;
  }
}
```

### Step 5: Update Import Endpoints

Modify your import API endpoints:

```javascript
app.post('/api/vulnerabilities/import-staging', upload.single('csvFile'), async (req, res) => {
  const sessionId = req.body.sessionId || uuidv4();
  
  try {
    // Existing import logic with sessionId parameter
    const result = await bulkLoadToStagingTable(parsedData, sessionId);
    await processStagingToFinalTables(sessionId);
    
    res.json({ success: true, sessionId, rowsProcessed: result });
  } catch (error) {
    progressTracker.emitProgress(sessionId, 'error', 0, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Phase 3: Frontend Implementation

### Step 6: Include Socket.io Client

Add to your HTML pages:

```html
<script src="/socket.io/socket.io.js"></script>
<script src="/scripts/shared/websocket-client.js"></script>
<script src="/scripts/shared/progress-modal.js"></script>
```

### Step 7: WebSocket Client

Create `scripts/shared/websocket-client.js`:

```javascript
class WebSocketClient {
  constructor() {
    this.socket = null;
    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    if (typeof io === 'undefined') {
      console.warn('Socket.io not available, falling back to polling');
      return false;
    }

    this.socket = io();
    
    this.socket.on('connect', () => {
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      this.connectionState = 'disconnected';
      this.attemptReconnect();
    });

    this.socket.on('importProgress', (data) => {
      if (window.ProgressModal && window.ProgressModal.updateProgress) {
        window.ProgressModal.updateProgress(data);
      }
    });

    return true;
  }

  joinSession(sessionId) {
    if (this.socket && this.connectionState === 'connected') {
      this.socket.emit('joinSession', sessionId);
    }
  }

  cancelImport(sessionId) {
    if (this.socket && this.connectionState === 'connected') {
      this.socket.emit('cancelImport', sessionId);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }
}

window.WebSocketClient = new WebSocketClient();
```

### Step 8: Progress Modal Component

Create `scripts/shared/progress-modal.js`:

```javascript
window.ProgressModal = {
  currentSessionId: null,
  modal: null,

  show(title, sessionId) {
    this.currentSessionId = sessionId;
    
    const modalHtml = `
      <div class="modal fade" id="progressModal" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
            </div>
            <div class="modal-body">
              <div class="progress mb-3" style="height: 25px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" style="width: 0%">
                  <span class="progress-text">0%</span>
                </div>
              </div>
              <div class="progress-info">
                <div class="status-message">Initializing...</div>
                <div class="eta-display" style="display: none;">
                  <small class="text-muted">Estimated time remaining: <span class="eta-time">--</span></small>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger" onclick="ProgressModal.cancel()">
                Cancel Import
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const existingModal = document.getElementById('progressModal');
    if (existingModal) {
      existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    this.modal = new bootstrap.Modal(document.getElementById('progressModal'));
    this.modal.show();

    if (window.WebSocketClient) {
      window.WebSocketClient.joinSession(sessionId);
    }
  },

  updateProgress(data) {
    if (data.sessionId !== this.currentSessionId) return;

    const progressBar = document.querySelector('#progressModal .progress-bar');
    const progressText = document.querySelector('#progressModal .progress-text');
    const statusMessage = document.querySelector('#progressModal .status-message');
    const etaDisplay = document.querySelector('#progressModal .eta-display');
    const etaTime = document.querySelector('#progressModal .eta-time');

    if (progressBar && progressText && statusMessage) {
      progressBar.style.width = `${data.progress}%`;
      progressText.textContent = `${data.progress}%`;
      statusMessage.textContent = data.message;

      if (data.eta && data.eta > 0) {
        etaDisplay.style.display = 'block';
        etaTime.textContent = this.formatETA(data.eta);
      }

      if (data.type === 'complete') {
        progressBar.classList.remove('progress-bar-animated');
        progressBar.classList.add('bg-success');
        setTimeout(() => this.hide(), 2000);
      } else if (data.type === 'error') {
        this.showError(data.message);
      }
    }
  },

  cancel() {
    if (this.currentSessionId && window.WebSocketClient) {
      window.WebSocketClient.cancelImport(this.currentSessionId);
    }
    this.hide();
  },

  hide() {
    if (this.modal) {
      this.modal.hide();
      setTimeout(() => {
        const modalElement = document.getElementById('progressModal');
        if (modalElement) {
          modalElement.remove();
        }
      }, 300);
    }
    this.currentSessionId = null;
  },

  formatETA(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
};
```

## Phase 4: Integration Usage

### Step 9: Update Import UI

Modify your existing import forms:

```javascript
// In your vulnerability import handler
function handleCsvImport() {
  const sessionId = crypto.randomUUID();
  const formData = new FormData();
  formData.append('csvFile', fileInput.files[0]);
  formData.append('sessionId', sessionId);

  // Show progress modal
  ProgressModal.show('Importing Vulnerabilities', sessionId);
  
  // Connect WebSocket
  WebSocketClient.connect();

  // Submit form
  fetch('/api/vulnerabilities/import-staging', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (!data.success) {
      ProgressModal.showError(data.error);
    }
  })
  .catch(error => {
    ProgressModal.showError(error.message);
  });
}
```

### Step 10: Initialize WebSocket

Add to your page initialization:

```javascript
// Initialize WebSocket connection on page load
document.addEventListener('DOMContentLoaded', () => {
  if (window.WebSocketClient) {
    WebSocketClient.connect();
  }
});
```

## Testing and Validation

### Basic Testing

1. **Connection Test**: Check browser console for WebSocket connection messages
2. **Progress Test**: Upload a small CSV file and verify progress updates
3. **Cancel Test**: Start an import and test the cancel functionality
4. **Error Test**: Upload an invalid file and verify error handling

### Debug Tools

```javascript
// Enable Socket.io debug logging
localStorage.debug = 'socket.io-client:socket';

// Check connection state
console.log(window.WebSocketClient.connectionState);

// Monitor sessions
console.log(progressTracker.sessions);
```

## Common Issues and Solutions

### WebSocket Connection Fails

- Verify Socket.io client script is loaded
- Check CORS configuration
- Confirm server is running with WebSocket support

### Progress Not Updating

- Ensure client joined the session room
- Check sessionId matches between client and server
- Verify progress events are being emitted

### Performance Issues

- Monitor event frequency (should be throttled to 2/second)
- Check memory usage with multiple concurrent imports
- Validate cleanup of completed sessions

## Next Steps

After successful implementation:

1. Add comprehensive error logging
2. Implement progress persistence for reconnection
3. Add user preferences for progress notifications
4. Consider mobile-specific UI optimizations
5. Add analytics for import performance monitoring

---

*Implementation Guide Version: 1.0.0*
*Last Updated: September 6, 2025*
