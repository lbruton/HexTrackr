# Socket.io Documentation

*Version: 4.8.1 - As used in HexTrackr*

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Server Configuration](#server-configuration)
3. [Connection Handling](#connection-handling)
4. [Event Emission & Listening](#event-emission--listening)
5. [Namespaces](#namespaces)
6. [Rooms](#rooms)
7. [Broadcasting](#broadcasting)
8. [Middleware](#middleware)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

## Installation & Setup

### Installation
```bash
npm install socket.io
```

### Basic Server Setup with Express
```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Standalone Server
```javascript
const io = require('socket.io')(3000);

io.on('connection', (socket) => {
  console.log('Client connected');
});
```

## Server Configuration

### Configuration Options
```javascript
const io = new Server(server, {
  // WebSocket engine configuration
  pingInterval: 25000,        // How often to send ping packets (ms)
  pingTimeout: 60000,         // How long to wait for pong (ms)
  maxPayload: 1000000,       // Maximum payload size in bytes

  // Connection options
  connectTimeout: 45000,      // Connection timeout (ms)
  transports: ['polling', 'websocket'],  // Available transports

  // CORS configuration
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },

  // Path where socket.io is served
  path: '/socket.io/',

  // Adapter for scaling
  adapter: myAdapter
});
```

### Common Configuration Patterns
```javascript
// Development configuration
const io = new Server(server, {
  cors: {
    origin: "*",  // Allow all origins in development
    methods: ["GET", "POST"]
  }
});

// Production configuration
const io = new Server(server, {
  cors: {
    origin: ["https://myapp.com", "https://www.myapp.com"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});
```

## Connection Handling

### Basic Connection Events
```javascript
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Access connection info
  console.log('Client address:', socket.handshake.address);
  console.log('Auth data:', socket.handshake.auth);
  console.log('Query params:', socket.handshake.query);

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});
```

### Disconnect Reasons
```javascript
socket.on('disconnect', (reason) => {
  // Possible reasons:
  // 'io server disconnect' - Server forced disconnection
  // 'io client disconnect' - Client called socket.disconnect()
  // 'ping timeout' - Client didn't respond to ping
  // 'transport close' - Connection was closed
  // 'transport error' - Connection encountered error
});
```

## Event Emission & Listening

### Server-Side Events
```javascript
io.on('connection', (socket) => {
  // Emit to specific socket
  socket.emit('welcome', { message: 'Welcome!' });

  // Emit to all connected clients
  io.emit('broadcast', { message: 'New user joined' });

  // Emit to all except sender
  socket.broadcast.emit('user-joined', { userId: socket.id });

  // Listen for events from client
  socket.on('chat-message', (data) => {
    console.log('Received:', data);
  });

  // With acknowledgment callback
  socket.on('request-data', (query, callback) => {
    const result = processQuery(query);
    callback({ success: true, data: result });
  });
});
```

### Event Acknowledgments
```javascript
// Server expects acknowledgment
socket.emit('question', 'Do you accept?', (answer) => {
  console.log('Client responded:', answer);
});

// Server provides acknowledgment
socket.on('update-profile', (data, ack) => {
  try {
    updateProfile(data);
    ack({ success: true });
  } catch (error) {
    ack({ success: false, error: error.message });
  }
});
```

### Timeout for Acknowledgments
```javascript
// With timeout (server-side)
socket.timeout(5000).emit('request-with-timeout', (err, response) => {
  if (err) {
    console.error('Request timed out');
  } else {
    console.log('Response:', response);
  }
});
```

## Namespaces

### Creating and Using Namespaces
```javascript
// Create namespace
const adminNamespace = io.of('/admin');
const chatNamespace = io.of('/chat');

// Handle connections to namespace
adminNamespace.on('connection', (socket) => {
  console.log('Admin connected');

  socket.on('admin-action', (data) => {
    // Handle admin-specific events
  });
});

chatNamespace.on('connection', (socket) => {
  console.log('User joined chat');

  socket.on('message', (msg) => {
    chatNamespace.emit('new-message', msg);
  });
});
```

### Dynamic Namespaces
```javascript
// Match namespace pattern with regex
io.of(/^\/dynamic-\d+$/).on('connection', (socket) => {
  const namespace = socket.nsp;
  console.log('Connected to dynamic namespace:', namespace.name);
});

// Clean up empty namespaces
const io = new Server(server, {
  cleanupEmptyChildNamespaces: true
});
```

## Rooms

### Joining and Leaving Rooms
```javascript
io.on('connection', (socket) => {
  // Join a room
  socket.join('room-123');

  // Join multiple rooms
  socket.join(['room-1', 'room-2', 'room-3']);

  // Leave a room
  socket.leave('room-123');

  // Get rooms socket is in
  const rooms = socket.rooms; // Set containing socket.id and room names
});
```

### Broadcasting to Rooms
```javascript
// Emit to all clients in a room
io.to('room-123').emit('room-message', { text: 'Hello room!' });

// Emit to multiple rooms
io.to('room-1').to('room-2').emit('announcement', 'Important!');

// Emit to room except sender
socket.to('room-123').emit('user-action', { userId: socket.id });

// Get all clients in a room
const clientsInRoom = await io.in('room-123').allSockets();
```

### Room Management
```javascript
// Get all rooms
const rooms = io.of('/').adapter.rooms;

// Check if room exists
if (io.of('/').adapter.rooms.has('room-123')) {
  console.log('Room exists');
}

// Disconnect all clients in a room
io.in('room-123').disconnectSockets(true);
```

## Broadcasting

### Broadcasting Patterns
```javascript
io.on('connection', (socket) => {
  // To all connected clients
  io.emit('global-event', data);

  // To all except sender
  socket.broadcast.emit('others-only', data);

  // To specific room
  io.to('room-1').emit('room-event', data);

  // To specific socket
  io.to(socketId).emit('private-message', data);

  // Chaining rooms
  io.to('room-1').to('room-2').except('room-3').emit('filtered', data);

  // Local flag (doesn't use adapter, same server only)
  socket.local.emit('local-only', data);
});
```

### Volatile Events
```javascript
// Events that can be dropped if client not ready
socket.volatile.emit('non-critical', data);

// Volatile to room
io.to('room-1').volatile.emit('optional-update', data);
```

## Middleware

### Socket Middleware
```javascript
// Global middleware
io.use((socket, next) => {
  // Authentication check
  if (isValid(socket.handshake.auth)) {
    next();
  } else {
    next(new Error('Authentication failed'));
  }
});

// Namespace middleware
const adminNsp = io.of('/admin');
adminNsp.use((socket, next) => {
  // Check admin privileges
  if (socket.handshake.auth.role === 'admin') {
    next();
  } else {
    next(new Error('Admin access required'));
  }
});
```

### Engine.IO Middleware
```javascript
// Integrate Express middleware at Engine.IO level
io.engine.use((req, res, next) => {
  // Runs for every HTTP request
  console.log('Engine.IO request:', req.url);
  next();
});

// Use Express session
const session = require('express-session');
io.engine.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Security headers
const helmet = require('helmet');
io.engine.use(helmet());
```

## Error Handling

### Connection Error Handling
```javascript
io.use((socket, next) => {
  try {
    // Validation logic
    validateConnection(socket);
    next();
  } catch (err) {
    console.error('Connection validation failed:', err);
    next(new Error('Connection refused'));
  }
});
```

### Event Error Handling
```javascript
socket.on('risky-operation', async (data) => {
  try {
    const result = await performOperation(data);
    socket.emit('operation-success', result);
  } catch (error) {
    console.error('Operation failed:', error);
    socket.emit('operation-error', {
      message: error.message,
      code: error.code
    });
  }
});
```

### Global Error Handler
```javascript
io.on('connection', (socket) => {
  // Catch all errors for this socket
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    // Log, notify, or handle as needed
  });

  // Handle specific error events
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
  });
});
```

## Best Practices

### 1. Connection Management
```javascript
class ConnectionManager {
  constructor(io) {
    this.io = io;
    this.connections = new Map();
  }

  handleConnection(socket) {
    this.connections.set(socket.id, {
      socket,
      userId: socket.handshake.auth.userId,
      connectedAt: new Date()
    });

    socket.on('disconnect', () => {
      this.connections.delete(socket.id);
    });
  }

  getConnectionByUserId(userId) {
    for (const [id, conn] of this.connections) {
      if (conn.userId === userId) return conn;
    }
    return null;
  }
}
```

### 2. Event Validation
```javascript
const Joi = require('joi');

const messageSchema = Joi.object({
  text: Joi.string().required().max(1000),
  roomId: Joi.string().required()
});

socket.on('send-message', (data, callback) => {
  const { error, value } = messageSchema.validate(data);

  if (error) {
    return callback({
      success: false,
      error: error.details[0].message
    });
  }

  // Process valid message
  processMessage(value);
  callback({ success: true });
});
```

### 3. Rate Limiting
```javascript
const rateLimiter = new Map();

function rateLimit(socket, event, limit = 10, window = 60000) {
  const key = `${socket.id}:${event}`;
  const now = Date.now();

  if (!rateLimiter.has(key)) {
    rateLimiter.set(key, { count: 1, resetTime: now + window });
    return true;
  }

  const limit = rateLimiter.get(key);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + window;
    return true;
  }

  if (limit.count >= limit) {
    return false;
  }

  limit.count++;
  return true;
}

socket.on('chat-message', (data) => {
  if (!rateLimit(socket, 'chat-message', 10, 60000)) {
    socket.emit('error', 'Rate limit exceeded');
    return;
  }
  // Process message
});
```

### 4. Graceful Shutdown
```javascript
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');

  // Notify all clients
  io.emit('server-shutting-down', {
    message: 'Server maintenance',
    reconnectIn: 30000
  });

  // Close all connections
  const sockets = await io.fetchSockets();
  for (const socket of sockets) {
    socket.disconnect(true);
  }

  // Close server
  io.close(() => {
    console.log('Socket.IO server closed');
    process.exit(0);
  });
});
```

### 5. Scaling with Adapters
```javascript
// Redis adapter for multiple servers
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ host: 'localhost', port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

## HexTrackr-Specific Patterns

### Progress Tracking
```javascript
class ProgressTracker {
  constructor(io) {
    this.io = io;
  }

  startOperation(operationId, totalSteps) {
    this.io.emit('operation-started', {
      operationId,
      totalSteps,
      timestamp: Date.now()
    });
  }

  updateProgress(operationId, currentStep, message) {
    this.io.emit('operation-progress', {
      operationId,
      currentStep,
      message,
      timestamp: Date.now()
    });
  }

  completeOperation(operationId, result) {
    this.io.emit('operation-complete', {
      operationId,
      result,
      timestamp: Date.now()
    });
  }
}
```

### File Upload Progress
```javascript
io.on('connection', (socket) => {
  socket.on('start-upload', async (data) => {
    const uploadId = generateId();

    socket.join(`upload-${uploadId}`);

    // Process file with progress updates
    processFileWithProgress(data.file, (progress) => {
      io.to(`upload-${uploadId}`).emit('upload-progress', {
        uploadId,
        progress,
        message: `Processing: ${progress}%`
      });
    });

    socket.leave(`upload-${uploadId}`);
  });
});
```

### Real-time Data Sync
```javascript
// Notify all clients of data changes
function notifyDataChange(type, data) {
  io.emit('data-changed', {
    type,      // 'ticket', 'vulnerability', etc.
    action,    // 'created', 'updated', 'deleted'
    data,      // The actual data
    timestamp: Date.now()
  });
}

// Usage in Express routes
app.post('/api/tickets', async (req, res) => {
  const ticket = await createTicket(req.body);
  notifyDataChange('ticket', { action: 'created', ticket });
  res.json({ success: true, data: ticket });
});
```

---

*This documentation covers the essential Socket.io patterns and features used in HexTrackr's real-time communication layer.*