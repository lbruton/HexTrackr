# Socket.IO Implementation Guide for HexTrackr

## Table of Contents

- [Overview](#overview)
- [Server-Side Implementation](#server-side-implementation)
- [Client-Side Implementation](#client-side-implementation)
- [Authentication & Security](#authentication--security)
- [Room Management](#room-management)
- [Event Handling Patterns](#event-handling-patterns)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Production Deployment](#production-deployment)
- [HexTrackr-Specific Use Cases](#hextrackr-specific-use-cases)

## Overview

Socket.IO enables real-time, bidirectional communication between clients and servers. In HexTrackr, it's primarily used for:

- Real-time import progress updates
- Live vulnerability data synchronization
- Collaborative editing notifications
- System status broadcasts

## Server-Side Implementation

### Basic Socket.IO Server Setup

```javascript
import { Server } from 'socket.io'
import { createServer } from 'http'
import express from 'express'

const app = express()
const httpServer = createServer(app)

// Configure Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: false // Disable Engine.IO v3 for security
})

httpServer.listen(8080, () => {
  console.log('Server with Socket.IO running on port 8080')
})
```

### Engine.IO Middleware Integration

```javascript
import session from 'express-session'
import passport from 'passport'

// Session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
})

// Apply middleware to Socket.IO handshakes only
function onlyForHandshake(middleware) {
  return (req, res, next) => {
    const isHandshake = req._query.sid === undefined
    if (isHandshake) {
      middleware(req, res, next)
    } else {
      next()
    }
  }
}

// Apply authentication middleware
io.engine.use(onlyForHandshake(sessionMiddleware))
io.engine.use(onlyForHandshake(passport.session()))
io.engine.use(onlyForHandshake((req, res, next) => {
  if (req.user) {
    next()
  } else {
    res.writeHead(401)
    res.end()
  }
}))
```

### Connection Management

```javascript
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Store user information
  const userId = socket.handshake.auth?.userId
  const userRole = socket.handshake.auth?.role || 'user'

  socket.userId = userId
  socket.userRole = userRole

  // Join user-specific room
  if (userId) {
    socket.join(`user-${userId}`)
  }

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id} - ${reason}`)
    handleClientDisconnection(socket)
  })

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error)
  })
})
```

## Client-Side Implementation

### Basic Client Setup

```javascript
import { io } from 'socket.io-client'

// Initialize socket connection with authentication
const socket = io('http://localhost:8080', {
  auth: {
    userId: getCurrentUserId(),
    role: getUserRole()
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000
})

// Connection event handlers
socket.on('connect', () => {
  console.log('Connected to server:', socket.id)
  showConnectionStatus('connected')
})

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server:', reason)
  showConnectionStatus('disconnected')
})

socket.on('connect_error', (error) => {
  console.error('Connection error:', error)
  showConnectionStatus('error')
})
```

### Connection State Recovery

```javascript
// Enable connection state recovery for resilient connections
const socket = io('http://localhost:8080', {
  auth: {
    userId: getCurrentUserId()
  },
  // Connection will attempt to recover state after temporary disconnection
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000 // 2 minutes
  }
})

socket.on('connect', () => {
  if (socket.recovered) {
    console.log('Connection state recovered successfully')
    // Handle recovered state (missed events were replayed)
  } else {
    console.log('New connection established')
    // Fetch current state from server
    refreshPageData()
  }
})
```

## Authentication & Security

### JWT-Based Authentication

```javascript
import jwt from 'jsonwebtoken'

// Server-side JWT validation middleware
io.engine.use((req, res, next) => {
  const isHandshake = req._query.sid === undefined

  if (isHandshake) {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.writeHead(401).end('No token provided')
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
      next()
    } catch (error) {
      res.writeHead(401).end('Invalid token')
    }
  } else {
    next()
  }
})

// Client-side token inclusion
const socket = io('http://localhost:8080', {
  extraHeaders: {
    authorization: `Bearer ${getAuthToken()}`
  }
})
```

### Namespace-Based Authorization

```javascript
// Create authorized namespaces
const adminNamespace = io.of('/admin')
const userNamespace = io.of('/users')

// Admin namespace authorization
adminNamespace.use((socket, next) => {
  if (socket.handshake.auth?.role === 'admin') {
    next()
  } else {
    next(new Error('Unauthorized'))
  }
})

// User namespace authorization
userNamespace.use((socket, next) => {
  if (socket.handshake.auth?.userId) {
    next()
  } else {
    next(new Error('Authentication required'))
  }
})
```

### Rate Limiting for Socket Events

```javascript
const EventEmitter = require('events')

class SocketRateLimiter extends EventEmitter {
  constructor(maxEvents = 100, windowMs = 60000) {
    super()
    this.maxEvents = maxEvents
    this.windowMs = windowMs
    this.clients = new Map()
  }

  isAllowed(clientId, eventType = 'general') {
    const now = Date.now()
    const key = `${clientId}:${eventType}`

    if (!this.clients.has(key)) {
      this.clients.set(key, [])
    }

    const events = this.clients.get(key)

    // Remove old events outside the window
    const validEvents = events.filter(time => now - time < this.windowMs)

    if (validEvents.length >= this.maxEvents) {
      return false
    }

    validEvents.push(now)
    this.clients.set(key, validEvents)
    return true
  }
}

const rateLimiter = new SocketRateLimiter(50, 60000) // 50 events per minute

io.on('connection', (socket) => {
  socket.use(([event, ...args], next) => {
    if (rateLimiter.isAllowed(socket.id, event)) {
      next()
    } else {
      next(new Error('Rate limit exceeded'))
    }
  })
})
```

## Room Management

### Dynamic Room Creation

```javascript
// Server-side room management
const activeImports = new Map()

socket.on('join-import-room', (importId, callback) => {
  try {
    // Validate import exists and user has access
    if (!validateImportAccess(importId, socket.userId)) {
      return callback({ error: 'Unauthorized access' })
    }

    // Join the import room
    socket.join(`import-${importId}`)

    // Track active imports
    if (!activeImports.has(importId)) {
      activeImports.set(importId, new Set())
    }
    activeImports.get(importId).add(socket.id)

    // Send current import status
    const importStatus = getImportStatus(importId)
    callback({ success: true, status: importStatus })

    console.log(`Socket ${socket.id} joined import room: ${importId}`)
  } catch (error) {
    callback({ error: error.message })
  }
})

socket.on('leave-import-room', (importId) => {
  socket.leave(`import-${importId}`)

  if (activeImports.has(importId)) {
    activeImports.get(importId).delete(socket.id)
    if (activeImports.get(importId).size === 0) {
      activeImports.delete(importId)
    }
  }
})
```

### Broadcasting to Rooms

```javascript
// Broadcast import progress to specific room
const broadcastImportProgress = (importId, progress) => {
  io.to(`import-${importId}`).emit('import-progress', {
    importId,
    progress: {
      processed: progress.processed,
      total: progress.total,
      percentage: Math.round((progress.processed / progress.total) * 100),
      status: progress.status,
      timestamp: Date.now()
    }
  })
}

// Broadcast to all authenticated users
const broadcastSystemNotification = (notification) => {
  io.emit('system-notification', {
    type: notification.type,
    message: notification.message,
    timestamp: Date.now()
  })
}

// Broadcast to specific user
const sendUserNotification = (userId, notification) => {
  io.to(`user-${userId}`).emit('user-notification', notification)
}
```

## Event Handling Patterns

### Request-Response Pattern with Acknowledgments

```javascript
// Client-side with acknowledgment
socket.emit('get-vulnerability-stats', { filters }, (response) => {
  if (response.error) {
    console.error('Error fetching stats:', response.error)
    return
  }

  updateDashboard(response.data)
})

// Server-side with acknowledgment
socket.on('get-vulnerability-stats', async (filters, callback) => {
  try {
    const stats = await getVulnerabilityStats(filters)
    callback({ success: true, data: stats })
  } catch (error) {
    callback({ error: error.message })
  }
})
```

### Event Broadcasting Pattern

```javascript
// Server-side: Broadcast when data changes
const notifyVulnerabilityUpdate = (vulnerabilityId, updateData) => {
  io.emit('vulnerability-updated', {
    id: vulnerabilityId,
    data: updateData,
    timestamp: Date.now()
  })
}

// Client-side: Listen for updates
socket.on('vulnerability-updated', (update) => {
  if (isCurrentlyViewing('vulnerability', update.id)) {
    updateVulnerabilityDisplay(update.data)
  }

  // Update counts in navigation/dashboard
  updateVulnerabilityCounts()
})
```

### Namespace-Specific Events

```javascript
// Admin namespace events
const adminNamespace = io.of('/admin')

adminNamespace.on('connection', (socket) => {
  socket.on('system-maintenance', (data, callback) => {
    try {
      enableMaintenanceMode(data.duration)

      // Notify all users about maintenance
      io.emit('maintenance-scheduled', {
        startTime: data.startTime,
        duration: data.duration
      })

      callback({ success: true })
    } catch (error) {
      callback({ error: error.message })
    }
  })

  socket.on('broadcast-announcement', (announcement) => {
    io.emit('system-announcement', {
      message: announcement.message,
      priority: announcement.priority,
      timestamp: Date.now()
    })
  })
})
```

## Error Handling

### Client-Side Error Handling

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message)

  // Handle specific error types
  switch (error.type) {
    case 'TransportError':
      showNotification('Connection failed. Please check your internet connection.', 'error')
      break
    case 'UnauthorizedError':
      redirectToLogin()
      break
    default:
      showNotification('Unable to connect to server. Retrying...', 'warning')
  }
})

socket.on('error', (error) => {
  console.error('Socket error:', error)
  showNotification('Communication error occurred', 'error')
})

// Handle custom application errors
socket.on('application-error', (error) => {
  console.error('Application error:', error)

  switch (error.code) {
    case 'IMPORT_FAILED':
      showImportError(error.details)
      break
    case 'VALIDATION_ERROR':
      showValidationErrors(error.fields)
      break
    default:
      showGenericError(error.message)
  }
})
```

### Server-Side Error Handling

```javascript
io.on('connection', (socket) => {
  // Middleware for error handling
  socket.use((packet, next) => {
    try {
      // Validate packet structure
      if (!packet || !Array.isArray(packet)) {
        throw new Error('Invalid packet format')
      }

      const [event, data] = packet

      // Validate event name
      if (typeof event !== 'string') {
        throw new Error('Invalid event name')
      }

      next()
    } catch (error) {
      next(error)
    }
  })

  // Handle middleware errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error)

    socket.emit('application-error', {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request format'
    })
  })

  // Wrap event handlers with error handling
  const safeEventHandler = (handler) => {
    return async (...args) => {
      try {
        await handler(...args)
      } catch (error) {
        console.error(`Error in event handler:`, error)

        // Send error to client if callback is provided
        const callback = args[args.length - 1]
        if (typeof callback === 'function') {
          callback({ error: error.message })
        } else {
          socket.emit('application-error', {
            code: 'HANDLER_ERROR',
            message: 'An error occurred processing your request'
          })
        }
      }
    }
  }

  // Use safe handlers for events
  socket.on('start-import', safeEventHandler(handleImportStart))
  socket.on('get-data', safeEventHandler(handleDataRequest))
})
```

## Performance Optimization

### Connection Pooling and Scaling

```javascript
// Redis adapter for multiple server instances
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

const pubClient = createClient({ url: process.env.REDIS_URL })
const subClient = pubClient.duplicate()

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient))
  console.log('Redis adapter configured')
})
```

### Efficient Event Broadcasting

```javascript
// Batch updates to reduce network traffic
class UpdateBatcher {
  constructor(batchInterval = 1000) {
    this.batches = new Map()
    this.batchInterval = batchInterval
  }

  addUpdate(roomId, updateType, data) {
    if (!this.batches.has(roomId)) {
      this.batches.set(roomId, {
        updates: {},
        timeout: setTimeout(() => {
          this.flushBatch(roomId)
        }, this.batchInterval)
      })
    }

    const batch = this.batches.get(roomId)
    if (!batch.updates[updateType]) {
      batch.updates[updateType] = []
    }
    batch.updates[updateType].push(data)
  }

  flushBatch(roomId) {
    const batch = this.batches.get(roomId)
    if (!batch) return

    clearTimeout(batch.timeout)

    io.to(roomId).emit('batch-updates', batch.updates)
    this.batches.delete(roomId)
  }
}

const updateBatcher = new UpdateBatcher(500) // 500ms batches
```

### Memory Management

```javascript
// Clean up inactive rooms and connections
const cleanupInactiveRooms = () => {
  const now = Date.now()
  const inactiveThreshold = 30 * 60 * 1000 // 30 minutes

  activeImports.forEach((sockets, importId) => {
    if (sockets.size === 0) {
      const lastActivity = getImportLastActivity(importId)
      if (now - lastActivity > inactiveThreshold) {
        activeImports.delete(importId)
        console.log(`Cleaned up inactive import room: ${importId}`)
      }
    }
  })
}

// Run cleanup every 10 minutes
setInterval(cleanupInactiveRooms, 10 * 60 * 1000)
```

## Production Deployment

### SSL/TLS Configuration

```javascript
import fs from 'fs'
import https from 'https'

// HTTPS server for production
const httpsServer = https.createServer({
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
}, app)

const io = new Server(httpsServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  },
  transports: ['websocket', 'polling'],
  secure: true
})
```

### Load Balancer Configuration

```javascript
// Sticky session support for load balancers
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  },
  // Enable sticky sessions
  cookie: {
    name: 'io',
    httpOnly: true,
    sameSite: 'strict'
  },
  transports: ['websocket', 'polling']
})

// Handle proxy headers
app.set('trust proxy', 1)
```

### Monitoring and Logging

```javascript
import winston from 'winston'

const socketLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'socket-events.log' })
  ]
})

io.on('connection', (socket) => {
  socketLogger.info('Client connected', {
    socketId: socket.id,
    userId: socket.userId,
    ip: socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent']
  })

  socket.onAny((eventName, ...args) => {
    socketLogger.info('Socket event', {
      socketId: socket.id,
      userId: socket.userId,
      event: eventName,
      timestamp: Date.now()
    })
  })
})

// Connection metrics
const connectionMetrics = {
  totalConnections: 0,
  activeConnections: 0,
  reconnections: 0,
  errors: 0
}

io.on('connection', (socket) => {
  connectionMetrics.totalConnections++
  connectionMetrics.activeConnections++

  socket.on('disconnect', () => {
    connectionMetrics.activeConnections--
  })

  socket.on('reconnect', () => {
    connectionMetrics.reconnections++
  })

  socket.on('error', () => {
    connectionMetrics.errors++
  })
})

// Expose metrics endpoint
app.get('/socket-metrics', (req, res) => {
  res.json(connectionMetrics)
})
```

## HexTrackr-Specific Use Cases

### Import Progress Tracking

```javascript
// Server-side import progress handler
class ImportProgressTracker {
  constructor(io) {
    this.io = io
    this.activeImports = new Map()
  }

  startImport(importId, totalRecords, userId) {
    const importData = {
      id: importId,
      totalRecords,
      processedRecords: 0,
      startTime: Date.now(),
      status: 'starting',
      userId
    }

    this.activeImports.set(importId, importData)

    // Notify user that import started
    this.io.to(`user-${userId}`).emit('import-started', {
      importId,
      totalRecords
    })
  }

  updateProgress(importId, processedRecords, status = 'processing') {
    const importData = this.activeImports.get(importId)
    if (!importData) return

    importData.processedRecords = processedRecords
    importData.status = status
    importData.lastUpdate = Date.now()

    const progress = {
      importId,
      processed: processedRecords,
      total: importData.totalRecords,
      percentage: Math.round((processedRecords / importData.totalRecords) * 100),
      status,
      elapsedTime: Date.now() - importData.startTime
    }

    // Broadcast to import room
    this.io.to(`import-${importId}`).emit('import-progress', progress)
  }

  completeImport(importId, results) {
    const importData = this.activeImports.get(importId)
    if (!importData) return

    const completionData = {
      importId,
      status: 'completed',
      totalProcessed: results.processed,
      errors: results.errors,
      duration: Date.now() - importData.startTime,
      summary: results.summary
    }

    this.io.to(`import-${importId}`).emit('import-completed', completionData)
    this.io.to(`user-${importData.userId}`).emit('import-finished', completionData)

    // Clean up after 1 hour
    setTimeout(() => {
      this.activeImports.delete(importId)
    }, 60 * 60 * 1000)
  }
}
```

### Real-time Vulnerability Updates

```javascript
// Vulnerability update broadcasting
const notifyVulnerabilityChanges = (changeType, vulnerabilityData, affectedUsers = []) => {
  const updatePayload = {
    type: changeType, // 'created', 'updated', 'deleted', 'status_changed'
    data: vulnerabilityData,
    timestamp: Date.now()
  }

  // Broadcast to all authenticated users
  io.emit('vulnerability-change', updatePayload)

  // Send specific notifications to affected users
  affectedUsers.forEach(userId => {
    io.to(`user-${userId}`).emit('vulnerability-notification', {
      ...updatePayload,
      personalized: true
    })
  })
}

// KEV synchronization updates
const notifyKEVSync = (syncStatus) => {
  io.emit('kev-sync-update', {
    status: syncStatus.status,
    processedCount: syncStatus.processed,
    newEntries: syncStatus.newEntries,
    timestamp: Date.now()
  })
}
```

### Collaborative Features

```javascript
// Multi-user editing awareness
const editingSessions = new Map()

socket.on('start-editing', (resourceType, resourceId, callback) => {
  const sessionKey = `${resourceType}:${resourceId}`

  if (!editingSessions.has(sessionKey)) {
    editingSessions.set(sessionKey, new Set())
  }

  const currentEditors = editingSessions.get(sessionKey)
  currentEditors.add({
    socketId: socket.id,
    userId: socket.userId,
    username: socket.username,
    startTime: Date.now()
  })

  // Notify other editors
  socket.broadcast.emit('user-started-editing', {
    resourceType,
    resourceId,
    user: {
      id: socket.userId,
      username: socket.username
    }
  })

  callback({
    success: true,
    currentEditors: Array.from(currentEditors)
  })
})

socket.on('stop-editing', (resourceType, resourceId) => {
  const sessionKey = `${resourceType}:${resourceId}`
  const currentEditors = editingSessions.get(sessionKey)

  if (currentEditors) {
    // Remove this editor
    for (let editor of currentEditors) {
      if (editor.socketId === socket.id) {
        currentEditors.delete(editor)
        break
      }
    }

    // Notify others
    socket.broadcast.emit('user-stopped-editing', {
      resourceType,
      resourceId,
      userId: socket.userId
    })

    // Clean up empty sessions
    if (currentEditors.size === 0) {
      editingSessions.delete(sessionKey)
    }
  }
})
```

## Best Practices Summary

1. **Always authenticate connections** - Never trust client-provided data
2. **Use rooms for targeted broadcasting** - Don't broadcast to all clients unnecessarily
3. **Implement proper error handling** - Both client and server side
4. **Rate limit socket events** - Prevent abuse and DoS attacks
5. **Clean up inactive connections** - Prevent memory leaks
6. **Use acknowledgments for critical events** - Ensure delivery confirmation
7. **Batch updates when possible** - Reduce network overhead
8. **Monitor connection metrics** - Track performance and issues
9. **Implement graceful degradation** - Handle disconnections gracefully
10. **Use SSL in production** - Secure all communications

## Further Reading

- [Socket.IO Official Documentation](https://socket.io/docs/v4/)
- [Socket.IO Security Best Practices](https://socket.io/docs/v4/security/)
- [Scaling Socket.IO Applications](https://socket.io/docs/v4/scaling-up/)
- [Socket.IO Performance Optimization](https://socket.io/docs/v4/performance/)