# Express.js Best Practices for HexTrackr

## Table of Contents

- [Server Setup & Configuration](#server-setup--configuration)
- [Middleware Architecture](#middleware-architecture)
- [Security Best Practices](#security-best-practices)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Production Deployment](#production-deployment)
- [HexTrackr-Specific Recommendations](#hextrackr-specific-recommendations)

## Server Setup & Configuration

### Basic Express Server Setup

```javascript
import express from 'express'

const app = express()
const port = process.env.PORT || 3000

// Basic configuration
app.set('trust proxy', 1) // Important for rate limiting behind reverse proxy

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
```

### Environment Configuration

```javascript
// Use environment variables for configuration
const config = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  dbPath: process.env.DB_PATH || './app/public/data/hextrackr.db',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100
}
```

## Middleware Architecture

### Proper Middleware Order

The order of middleware is crucial for security and functionality:

```javascript
// 1. Security headers first
app.use(helmet())

// 2. CORS configuration
app.use(cors(corsOptions))

// 3. Rate limiting
app.use(rateLimit(rateLimitOptions))

// 4. Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 5. Static file serving
app.use(express.static('public'))

// 6. Session middleware (if needed)
app.use(session(sessionOptions))

// 7. Custom middleware
app.use(authMiddleware)
app.use(loggingMiddleware)

// 8. Routes
app.use('/api', apiRoutes)

// 9. Error handling (must be last)
app.use(errorHandler)
```

### Custom Middleware Examples

```javascript
// Logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`)
  })

  next()
}

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map(detail => detail.message)
      })
    }
    next()
  }
}

// API versioning middleware
const apiVersioning = (req, res, next) => {
  const version = req.headers['api-version'] || '1.0'
  req.apiVersion = version
  next()
}
```

## Security Best Practices

### Input Validation & Sanitization

```javascript
// Use express-validator for input validation
const { body, param, validationResult } = require('express-validator')

const validateVulnerability = [
  body('title').trim().isLength({ min: 1, max: 255 }).escape(),
  body('severity').isIn(['Critical', 'High', 'Medium', 'Low']),
  body('vprScore').isFloat({ min: 0, max: 10 }),
  body('ipAddress').isIP(),
  param('id').isInt({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]
```

### SQL Injection Prevention

```javascript
// Always use parameterized queries
const getVulnerabilityById = async (id) => {
  // CORRECT - Parameterized query
  const query = 'SELECT * FROM vulnerabilities WHERE id = ?'
  return db.get(query, [id])
}

// NEVER do this - String concatenation
// const query = `SELECT * FROM vulnerabilities WHERE id = ${id}` // VULNERABLE!
```

### XSS Prevention

```javascript
// Use DOMPurify for sanitizing HTML content
const DOMPurify = require('isomorphic-dompurify')

const sanitizeHTML = (htmlContent) => {
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  })
}

// Apply to user-generated content
app.post('/api/vulnerabilities', (req, res) => {
  if (req.body.description) {
    req.body.description = sanitizeHTML(req.body.description)
  }
  // Process the request...
})
```

### Path Traversal Prevention

```javascript
// Secure file operations
const path = require('path')

const validateFilePath = (filename) => {
  // Resolve the path and ensure it's within allowed directory
  const safePath = path.resolve('./uploads', filename)
  const uploadsDir = path.resolve('./uploads')

  if (!safePath.startsWith(uploadsDir)) {
    throw new Error('Invalid file path')
  }

  return safePath
}
```

## Error Handling

### Centralized Error Handling

```javascript
// Error handling middleware (should be last)
const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  })

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: err.status === 400 ? err.message : 'Something went wrong'
    })
  } else {
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack
    })
  }
}

// Custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
    this.status = 400
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
    this.status = 404
  }
}
```

### Async Error Handling

```javascript
// Wrapper for async route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Usage in routes
app.get('/api/vulnerabilities/:id', asyncHandler(async (req, res) => {
  const vulnerability = await getVulnerabilityById(req.params.id)
  if (!vulnerability) {
    throw new NotFoundError('Vulnerability not found')
  }
  res.json(vulnerability)
}))
```

## Performance Optimization

### Response Compression

```javascript
const compression = require('compression')

// Enable gzip compression
app.use(compression({
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress already-compressed responses
    if (res.getHeader('Content-Encoding')) {
      return false
    }
    return compression.filter(req, res)
  }
}))
```

### Caching Headers

```javascript
// Cache static assets
app.use('/static', express.static('public', {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true
}))

// API response caching middleware
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${duration}`)
    res.set('ETag', `"${Date.now()}"`)
    next()
  }
}

// Apply to cacheable endpoints
app.get('/api/vulnerabilities/stats', cacheMiddleware(600), getVulnerabilityStats)
```

### Connection Keep-Alive

```javascript
// Enable keep-alive for better performance
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

server.keepAliveTimeout = 65000 // Slightly higher than ALB idle timeout
server.headersTimeout = 66000 // Must be higher than keepAliveTimeout
```

## Production Deployment

### Process Management

```javascript
// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})
```

### Health Checks

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  }

  try {
    // Check database connectivity
    const dbCheck = db.prepare('SELECT 1').get()
    health.database = 'connected'
  } catch (error) {
    health.database = 'error'
    health.status = 'ERROR'
    return res.status(503).json(health)
  }

  res.json(health)
})
```

### Logging Configuration

```javascript
const winston = require('winston')

// Production logging setup
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}
```

## HexTrackr-Specific Recommendations

### Database Transaction Management

```javascript
// Wrap database operations in transactions
const createVulnerabilityWithTicket = async (vulnerabilityData, ticketData) => {
  const transaction = db.transaction(() => {
    // Create vulnerability
    const vulnerabilityId = createVulnerability(vulnerabilityData)

    // Create associated ticket
    const ticketId = createTicket({
      ...ticketData,
      vulnerabilityId
    })

    // Update vulnerability with ticket reference
    updateVulnerability(vulnerabilityId, { ticketId })

    return { vulnerabilityId, ticketId }
  })

  return transaction()
}
```

### WebSocket Connection Management

```javascript
// Proper WebSocket lifecycle management
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Join room for progress updates
  socket.on('join-import-room', (importId) => {
    socket.join(`import-${importId}`)
  })

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id} - ${reason}`)
  })

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error)
  })
})

// Broadcast progress updates with error handling
const broadcastProgress = (importId, progress) => {
  try {
    io.to(`import-${importId}`).emit('progress', progress)
  } catch (error) {
    console.error('Failed to broadcast progress:', error)
  }
}
```

### API Rate Limiting Strategy

```javascript
// Tiered rate limiting for different endpoints
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: Math.round(windowMs / 1000)
      })
    }
  })
}

// Apply different limits to different endpoints
app.use('/api/vulnerabilities/import', createRateLimit(60000, 5, 'Import limit exceeded'))
app.use('/api/vulnerabilities', createRateLimit(60000, 100, 'API limit exceeded'))
app.use('/api/auth', createRateLimit(900000, 10, 'Authentication limit exceeded'))
```

### Memory Management for Large Imports

```javascript
// Stream processing for large CSV imports
const processLargeImport = async (filePath, callback) => {
  const stream = fs.createReadStream(filePath)
  const parser = csv.parse({ headers: true })

  let processed = 0
  let batch = []
  const batchSize = 1000

  stream.pipe(parser)
    .on('data', async (row) => {
      batch.push(row)

      if (batch.length >= batchSize) {
        parser.pause()
        await processBatch(batch)
        batch = []
        processed += batchSize

        // Update progress and give other operations a chance
        callback({ processed, status: 'processing' })
        setImmediate(() => parser.resume())
      }
    })
    .on('end', async () => {
      if (batch.length > 0) {
        await processBatch(batch)
      }
      callback({ processed: processed + batch.length, status: 'completed' })
    })
    .on('error', (error) => {
      callback({ error: error.message, status: 'error' })
    })
}
```

## Common Pitfalls to Avoid

1. **Blocking the Event Loop**: Avoid synchronous operations in request handlers
2. **Memory Leaks**: Always clean up event listeners and close database connections
3. **Unhandled Promises**: Use proper error handling for async operations
4. **Improper Error Exposure**: Don't leak sensitive information in error messages
5. **Missing Input Validation**: Always validate and sanitize user input
6. **Incorrect Middleware Order**: Security middleware should come first
7. **Hard-coded Secrets**: Use environment variables for sensitive configuration

## Further Reading

- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)