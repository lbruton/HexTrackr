# Security Middleware Configuration Guide for HexTrackr

## Table of Contents

- [Overview](#overview)
- [Helmet.js Security Headers](#helmetjs-security-headers)
- [CORS Configuration](#cors-configuration)
- [express-rate-limit Implementation](#express-rate-limit-implementation)
- [Comprehensive Security Stack](#comprehensive-security-stack)
- [Production Security Checklist](#production-security-checklist)
- [Security Monitoring](#security-monitoring)
- [HexTrackr-Specific Security](#hextrackr-specific-security)

## Overview

This guide provides comprehensive security middleware configuration for HexTrackr, focusing on protecting against common web vulnerabilities including CSRF, XSS, clickjacking, and various injection attacks.

## Helmet.js Security Headers

### Basic Helmet Configuration

```javascript
const helmet = require('helmet')

// Basic Helmet setup with secure defaults
app.use(helmet({
  // Content Security Policy - prevents XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some inline scripts (minimize usage)
        "cdn.jsdelivr.net", // For Bootstrap and libraries
        "cdnjs.cloudflare.com",
        "unpkg.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for dynamic styles
        "cdn.jsdelivr.net",
        "cdnjs.cloudflare.com",
        "fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:", // For base64 encoded images
        "*.gravatar.com", // If using Gravatar
        "via.placeholder.com" // For placeholder images
      ],
      fontSrc: [
        "'self'",
        "fonts.googleapis.com",
        "fonts.gstatic.com",
        "cdn.jsdelivr.net"
      ],
      connectSrc: [
        "'self'",
        "wss:", // WebSocket connections for Socket.IO
        "ws:", // WebSocket connections
        "https:" // HTTPS API calls
      ],
      objectSrc: ["'none'"], // Prevent object/embed elements
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"], // Prevent iframe embedding
      childSrc: ["'none'"], // Prevent child contexts
      workerSrc: ["'self'"], // Web workers
      manifestSrc: ["'self'"], // Web app manifest
      upgradeInsecureRequests: [] // Force HTTPS
    },
    reportOnly: false // Set to true for testing
  },

  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: {
    policy: "require-corp"
  },

  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: {
    policy: "same-origin"
  },

  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: {
    policy: "same-origin"
  },

  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false
  },

  // Frame Options - Prevent clickjacking
  frameguard: {
    action: 'deny' // Completely prevent framing
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },

  // IE No Open - Prevent IE from executing downloads
  ieNoOpen: true,

  // Don't sniff MIME types
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: {
    permittedPolicies: "none"
  },

  // Referrer Policy
  referrerPolicy: {
    policy: "no-referrer-when-downgrade"
  },

  // X-XSS-Protection (disabled as modern browsers use CSP)
  xssFilter: false
}))
```

### Environment-Specific Configuration

```javascript
// Different configurations for different environments
const getHelmetConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'

  const baseConfig = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      }
    },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    noSniff: true,
    xssFilter: false
  }

  if (isProduction) {
    return {
      ...baseConfig,
      hsts: {
        maxAge: 63072000, // 2 years
        includeSubDomains: true,
        preload: true
      },
      contentSecurityPolicy: {
        ...baseConfig.contentSecurityPolicy,
        directives: {
          ...baseConfig.contentSecurityPolicy.directives,
          upgradeInsecureRequests: []
        }
      }
    }
  }

  if (isDevelopment) {
    return {
      ...baseConfig,
      // More permissive CSP for development
      contentSecurityPolicy: {
        directives: {
          ...baseConfig.contentSecurityPolicy.directives,
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'", // For development tools
            "localhost:*",
            "127.0.0.1:*"
          ],
          connectSrc: [
            "'self'",
            "ws:",
            "wss:",
            "localhost:*",
            "127.0.0.1:*"
          ]
        }
      },
      // No HSTS in development
      hsts: false
    }
  }

  return baseConfig
}

app.use(helmet(getHelmetConfig()))
```

### CSP Nonce Implementation

```javascript
const crypto = require('crypto')

// Middleware to generate CSP nonces
app.use((req, res, next) => {
  // Generate unique nonce for each request
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64')
  next()
})

// Enhanced CSP with nonces
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        (req, res) => `'nonce-${res.locals.cspNonce}'`
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'" // Still needed for some third-party styles
      ]
    }
  }
}))

// In your templates, use the nonce:
// <script nonce="<%= cspNonce %>">...</script>
```

### CSP Reporting

```javascript
// CSP violation reporting endpoint
app.post('/csp-violation-report', express.json(), (req, res) => {
  const report = req.body

  // Log the violation
  console.error('CSP Violation:', JSON.stringify(report, null, 2))

  // In production, you might want to send this to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
    // Example: sendToMonitoring(report)
  }

  res.status(204).end()
})

// Configure CSP with reporting
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      // ... your directives
      reportUri: '/csp-violation-report'
    },
    reportOnly: false // Set to true for testing
  }
}))
```

## CORS Configuration

### Basic CORS Setup

```javascript
const cors = require('cors')

// Basic CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://hextrackr.yourdomain.com',
      'https://app.hextrackr.com'
    ]

    if (process.env.NODE_ENV === 'development') {
      // More permissive in development
      allowedOrigins.push('http://localhost:*')
      allowedOrigins.push('http://127.0.0.1:*')
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-API-Key'
  ],
  credentials: true, // Enable cookies and authorization headers
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  maxAge: 86400 // Cache preflight response for 24 hours
}

app.use(cors(corsOptions))
```

### Dynamic CORS Configuration

```javascript
// Dynamic CORS based on request
const dynamicCors = (req, callback) => {
  let corsOptions

  // Different CORS policies for different endpoints
  if (req.path.startsWith('/api/public/')) {
    // Public API - more restrictive
    corsOptions = {
      origin: true, // Allow all origins for public data
      methods: ['GET'],
      credentials: false
    }
  } else if (req.path.startsWith('/api/admin/')) {
    // Admin API - very restrictive
    corsOptions = {
      origin: [
        'https://admin.hextrackr.com',
        'https://hextrackr.yourdomain.com'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  } else if (req.path.startsWith('/api/auth/')) {
    // Auth endpoints
    corsOptions = {
      origin: function(origin, cb) {
        // Allow same-origin and specific trusted origins
        const trustedOrigins = [
          'https://hextrackr.yourdomain.com',
          'https://app.hextrackr.com'
        ]
        cb(null, !origin || trustedOrigins.includes(origin))
      },
      credentials: true,
      methods: ['POST']
    }
  } else {
    // Default CORS policy
    corsOptions = {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  }

  callback(null, corsOptions)
}

app.use(cors(dynamicCors))
```

### CORS Error Handling

```javascript
// Global CORS error handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    console.warn('CORS violation:', {
      origin: req.get('Origin'),
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString()
    })

    return res.status(403).json({
      error: 'CORS Policy Violation',
      message: 'Origin not allowed'
    })
  }

  next(err)
})
```

## express-rate-limit Implementation

### Tiered Rate Limiting

```javascript
const rateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')
const Redis = require('redis')

// Redis client for distributed rate limiting
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

// Create different rate limiters for different endpoints
const createRateLimit = (options) => {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'hextrackr_rl:'
    }),
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
    handler: (req, res) => {
      console.warn('Rate limit exceeded:', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      })

      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.round(options.windowMs / 1000)
      })
    }
  })
}

// General API rate limiter
const generalLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  skip: (req) => {
    // Skip rate limiting for certain IPs or conditions
    const trustedIPs = ['127.0.0.1', '::1']
    return trustedIPs.includes(req.ip)
  }
})

// Strict limiter for authentication endpoints
const authLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 auth attempts per window
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req) => {
    // Rate limit by IP and username combination
    const username = req.body.username || req.body.email || 'anonymous'
    return `${req.ip}:${username}`
  }
})

// Import endpoint limiter
const importLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Only 10 imports per hour
  skipSuccessfulRequests: false
})

// Export limiter (more restrictive)
const exportLimiter = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Only 3 exports per 5 minutes
  skipSuccessfulRequests: false
})

// Apply rate limiting
app.use('/api/', generalLimiter)
app.use('/api/auth/', authLimiter)
app.use('/api/vulnerabilities/import', importLimiter)
app.use('/api/vulnerabilities/export', exportLimiter)
app.use('/api/backup/', exportLimiter) // Backup operations are resource-intensive
```

### Advanced Rate Limiting Features

```javascript
// User-based rate limiting
const userBasedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: async (req) => {
    // Dynamic limits based on user role
    const userRole = req.user?.role || 'anonymous'

    const limits = {
      admin: 1000,
      user: 100,
      readonly: 50,
      anonymous: 10
    }

    return limits[userRole] || limits.anonymous
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip
  },
  skip: (req) => {
    // Skip for system users or specific conditions
    return req.user?.isSystem || req.path.startsWith('/health')
  }
})

// Progressive rate limiting
const progressiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  onLimitReached: (req, res, options) => {
    // Log rate limit events
    console.warn('Rate limit reached:', {
      ip: req.ip,
      userId: req.user?.id,
      path: req.path,
      timestamp: new Date().toISOString()
    })

    // Optionally implement progressive delays
    const violations = getViolationCount(req.ip)
    if (violations > 3) {
      // Increase window time for repeat offenders
      options.windowMs *= 2
    }
  }
})

// Rate limiting bypass for trusted sources
const createTrustedBypass = () => {
  const trustedTokens = new Set(process.env.TRUSTED_API_TOKENS?.split(',') || [])
  const trustedIPs = new Set(['127.0.0.1', '::1'])

  return (req, res, next) => {
    const apiToken = req.headers['x-api-key']
    const isTrustedIP = trustedIPs.has(req.ip)
    const isTrustedToken = apiToken && trustedTokens.has(apiToken)

    if (isTrustedIP || isTrustedToken) {
      req.rateLimitBypass = true
    }

    next()
  }
}

app.use(createTrustedBypass())
```

## Comprehensive Security Stack

### Complete Security Middleware Setup

```javascript
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const compression = require('compression')
const morgan = require('morgan')

class SecurityMiddlewareStack {
  constructor(app, options = {}) {
    this.app = app
    this.options = {
      environment: process.env.NODE_ENV || 'development',
      corsOrigin: process.env.CORS_ORIGIN,
      rateLimitEnabled: true,
      helmetEnabled: true,
      ...options
    }
  }

  setup() {
    // 1. Request logging (should be first)
    this.setupLogging()

    // 2. Security headers
    if (this.options.helmetEnabled) {
      this.setupHelmet()
    }

    // 3. CORS
    this.setupCORS()

    // 4. Rate limiting
    if (this.options.rateLimitEnabled) {
      this.setupRateLimiting()
    }

    // 5. Compression
    this.setupCompression()

    // 6. Body parsing with limits
    this.setupBodyParsing()

    // 7. Security monitoring
    this.setupSecurityMonitoring()

    console.log('Security middleware stack initialized')
  }

  setupLogging() {
    const logFormat = this.options.environment === 'production'
      ? 'combined'
      : 'dev'

    this.app.use(morgan(logFormat, {
      skip: (req) => req.path.startsWith('/health')
    }))
  }

  setupHelmet() {
    const helmetConfig = this.getHelmetConfig()
    this.app.use(helmet(helmetConfig))
  }

  setupCORS() {
    const corsConfig = this.getCORSConfig()
    this.app.use(cors(corsConfig))

    // Handle preflight requests
    this.app.options('*', cors(corsConfig))
  }

  setupRateLimiting() {
    // Multiple rate limiters for different endpoints
    const limiters = this.createRateLimiters()

    Object.entries(limiters).forEach(([path, limiter]) => {
      this.app.use(path, limiter)
    })
  }

  setupCompression() {
    this.app.use(compression({
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false
        }
        return compression.filter(req, res)
      }
    }))
  }

  setupBodyParsing() {
    // JSON body parser with size limits
    this.app.use(express.json({
      limit: '10mb',
      verify: (req, res, buf) => {
        // Store raw body for webhook verification if needed
        req.rawBody = buf
      }
    }))

    // URL-encoded body parser
    this.app.use(express.urlencoded({
      extended: true,
      limit: '10mb'
    }))
  }

  setupSecurityMonitoring() {
    // Security event monitoring
    this.app.use((req, res, next) => {
      // Log suspicious patterns
      this.checkSuspiciousActivity(req)
      next()
    })
  }

  getHelmetConfig() {
    return {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'", "wss:", "ws:"],
          fontSrc: ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      hsts: this.options.environment === 'production' ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      } : false
    }
  }

  getCORSConfig() {
    return {
      origin: this.options.corsOrigin || true,
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin', 'X-Requested-With', 'Content-Type',
        'Accept', 'Authorization', 'X-API-Key'
      ]
    }
  }

  createRateLimiters() {
    return {
      '/api/': rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100
      }),
      '/api/auth/': rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        skipSuccessfulRequests: true
      }),
      '/api/vulnerabilities/import': rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 10
      })
    }
  }

  checkSuspiciousActivity(req) {
    const suspiciousPatterns = [
      /\.\./,  // Path traversal
      /<script/i, // XSS attempt
      /union.*select/i, // SQL injection
      /javascript:/i, // JavaScript protocol
      /data:.*base64/i // Data URI with base64
    ]

    const checkString = `${req.url} ${JSON.stringify(req.body)} ${JSON.stringify(req.query)}`

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(checkString)) {
        console.warn('Suspicious activity detected:', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          pattern: pattern.source,
          timestamp: new Date().toISOString()
        })
      }
    })
  }
}

// Usage
const securityStack = new SecurityMiddlewareStack(app, {
  corsOrigin: process.env.CORS_ORIGIN,
  environment: process.env.NODE_ENV
})

securityStack.setup()
```

## Production Security Checklist

### Environment Configuration

```javascript
// Environment variables validation
class SecurityConfig {
  static validate() {
    const required = [
      'NODE_ENV',
      'SESSION_SECRET',
      'CORS_ORIGIN',
      'DB_ENCRYPTION_KEY' // If using SQLCipher
    ]

    const missing = required.filter(key => !process.env[key])

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }

    // Validate secret lengths
    if (process.env.SESSION_SECRET.length < 32) {
      throw new Error('SESSION_SECRET must be at least 32 characters')
    }

    if (process.env.NODE_ENV === 'production') {
      // Additional production checks
      if (!process.env.SSL_KEY_PATH || !process.env.SSL_CERT_PATH) {
        console.warn('SSL certificates not configured for production')
      }

      if (process.env.CORS_ORIGIN === '*') {
        throw new Error('CORS_ORIGIN cannot be wildcard in production')
      }
    }

    console.log('Security configuration validated')
  }
}

SecurityConfig.validate()
```

### Security Headers Validation

```javascript
// Middleware to validate security headers are set
const validateSecurityHeaders = (req, res, next) => {
  const originalSend = res.send

  res.send = function(data) {
    // Check that important security headers are set
    const requiredHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'content-security-policy',
      'strict-transport-security' // Only in production with HTTPS
    ]

    const missingHeaders = requiredHeaders.filter(header =>
      !res.get(header) &&
      !(header === 'strict-transport-security' && process.env.NODE_ENV !== 'production')
    )

    if (missingHeaders.length > 0) {
      console.warn('Missing security headers:', missingHeaders)
    }

    originalSend.call(this, data)
  }

  next()
}

if (process.env.NODE_ENV === 'development') {
  app.use(validateSecurityHeaders)
}
```

## Security Monitoring

### Security Event Logging

```javascript
const winston = require('winston')

class SecurityLogger {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({
          filename: 'security-events.log',
          level: 'warn'
        })
      ]
    })

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }))
    }
  }

  logSecurityEvent(event, details) {
    this.logger.warn('Security Event', {
      event,
      ...details,
      timestamp: new Date().toISOString()
    })
  }

  logSuspiciousActivity(req, reason) {
    this.logSecurityEvent('suspicious_activity', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      reason,
      headers: this.sanitizeHeaders(req.headers)
    })
  }

  logRateLimitViolation(req, limit) {
    this.logSecurityEvent('rate_limit_violation', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      limit,
      userId: req.user?.id
    })
  }

  logAuthAttempt(req, success, reason = null) {
    this.logSecurityEvent('auth_attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success,
      reason,
      username: req.body?.username || req.body?.email
    })
  }

  sanitizeHeaders(headers) {
    const sensitive = ['authorization', 'cookie', 'x-api-key']
    const sanitized = { ...headers }

    sensitive.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]'
      }
    })

    return sanitized
  }
}

const securityLogger = new SecurityLogger()

// Use in middleware
app.use((req, res, next) => {
  res.securityLogger = securityLogger
  next()
})
```

### Intrusion Detection

```javascript
class IntrusionDetectionSystem {
  constructor() {
    this.suspiciousIPs = new Map() // IP -> { count, firstSeen, lastSeen }
    this.blockedIPs = new Set()
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 60 * 1000) // Cleanup every hour
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.ip

      // Check if IP is blocked
      if (this.blockedIPs.has(ip)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Your IP has been blocked due to suspicious activity'
        })
      }

      // Check for suspicious patterns
      if (this.isSuspicious(req)) {
        this.recordSuspiciousActivity(ip)

        // Block IP if too many suspicious activities
        const record = this.suspiciousIPs.get(ip)
        if (record && record.count > 10) {
          this.blockedIPs.add(ip)
          console.warn(`IP ${ip} has been blocked due to repeated suspicious activity`)
        }
      }

      next()
    }
  }

  isSuspicious(req) {
    const checks = [
      () => this.checkPathTraversal(req),
      () => this.checkSQLInjection(req),
      () => this.checkXSS(req),
      () => this.checkExcessiveRequests(req)
    ]

    return checks.some(check => check())
  }

  checkPathTraversal(req) {
    const pathTraversalPattern = /\.\.(\/|\\)/
    return pathTraversalPattern.test(req.url)
  }

  checkSQLInjection(req) {
    const sqlInjectionPatterns = [
      /(\bor\b|\band\b).*=.*=/i,
      /union.*select/i,
      /select.*from/i,
      /insert.*into/i,
      /delete.*from/i,
      /update.*set/i
    ]

    const testString = JSON.stringify(req.body) + req.url + JSON.stringify(req.query)
    return sqlInjectionPatterns.some(pattern => pattern.test(testString))
  }

  checkXSS(req) {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /onerror\s*=/i,
      /onload\s*=/i
    ]

    const testString = JSON.stringify(req.body) + req.url + JSON.stringify(req.query)
    return xssPatterns.some(pattern => pattern.test(testString))
  }

  checkExcessiveRequests(req) {
    // This would integrate with rate limiting data
    return false // Placeholder
  }

  recordSuspiciousActivity(ip) {
    const now = Date.now()

    if (this.suspiciousIPs.has(ip)) {
      const record = this.suspiciousIPs.get(ip)
      record.count++
      record.lastSeen = now
    } else {
      this.suspiciousIPs.set(ip, {
        count: 1,
        firstSeen: now,
        lastSeen: now
      })
    }
  }

  cleanup() {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    // Clean up old suspicious IP records
    for (const [ip, record] of this.suspiciousIPs.entries()) {
      if (now - record.lastSeen > maxAge) {
        this.suspiciousIPs.delete(ip)
      }
    }

    // Clean up blocked IPs after extended period
    // In production, you might want persistent storage for this
    console.log(`Cleaned up old suspicious IP records`)
  }

  getStats() {
    return {
      suspiciousIPs: this.suspiciousIPs.size,
      blockedIPs: this.blockedIPs.size
    }
  }
}

const ids = new IntrusionDetectionSystem()
app.use(ids.middleware())
```

## HexTrackr-Specific Security

### API Endpoint Protection

```javascript
// Vulnerability-specific security measures
const vulnerabilitySecurityMiddleware = (req, res, next) => {
  // Check for potentially malicious vulnerability data
  if (req.body && typeof req.body === 'object') {
    const suspiciousFields = ['title', 'description', 'solution']

    suspiciousFields.forEach(field => {
      if (req.body[field]) {
        // Check for script injection in vulnerability descriptions
        if (/<script|javascript:|data:/.test(req.body[field])) {
          return res.status(400).json({
            error: 'Invalid Content',
            message: 'Potentially malicious content detected'
          })
        }

        // Limit field lengths
        const maxLengths = { title: 1000, description: 5000, solution: 5000 }
        if (req.body[field].length > maxLengths[field]) {
          req.body[field] = req.body[field].substring(0, maxLengths[field])
        }
      }
    })
  }

  next()
}

app.use('/api/vulnerabilities', vulnerabilitySecurityMiddleware)
```

### File Upload Security (for imports)

```javascript
// Secure file upload configuration
const multer = require('multer')
const path = require('path')

const secureFileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Ensure upload directory exists and is secure
      const uploadDir = path.join(__dirname, 'uploads')
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      // Generate secure filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, `import-${uniqueSuffix}.csv`)
    }
  }),
  fileFilter: (req, file, cb) => {
    // Only allow CSV files
    const allowedTypes = ['.csv', '.txt']
    const ext = path.extname(file.originalname).toLowerCase()

    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed'))
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 1 // Only one file at a time
  }
})

app.post('/api/vulnerabilities/import', secureFileUpload.single('file'), (req, res) => {
  // File upload security handled by multer configuration
  // Additional validation can be added here
})
```

### Database Query Security

```javascript
// Secure database query wrapper
class SecureQueryBuilder {
  static buildWhereClause(filters, allowedFields) {
    const conditions = []
    const params = []

    Object.keys(filters).forEach(key => {
      if (!allowedFields.includes(key)) {
        throw new Error(`Field '${key}' not allowed in query`)
      }

      if (filters[key] !== null && filters[key] !== undefined) {
        conditions.push(`${key} = ?`)
        params.push(filters[key])
      }
    })

    return {
      whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      params
    }
  }

  static validateSortField(field, allowedFields) {
    if (!allowedFields.includes(field)) {
      throw new Error(`Sort field '${field}' not allowed`)
    }
    return field
  }
}

// Usage in vulnerability routes
app.get('/api/vulnerabilities', (req, res) => {
  const allowedFields = ['severity', 'status', 'vpr_score', 'scan_date']
  const allowedSortFields = ['scan_date', 'vpr_score', 'severity', 'created_at']

  try {
    const { whereClause, params } = SecureQueryBuilder.buildWhereClause(
      req.query,
      allowedFields
    )

    const sortField = req.query.sort
      ? SecureQueryBuilder.validateSortField(req.query.sort, allowedSortFields)
      : 'scan_date'

    const query = `
      SELECT * FROM vulnerabilities_current
      ${whereClause}
      ORDER BY ${sortField} DESC
      LIMIT ?
    `

    params.push(parseInt(req.query.limit) || 100)

    // Execute secure query...
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})
```

## Best Practices Summary

1. **Layer Security**: Implement defense in depth with multiple security layers
2. **Validate Everything**: Never trust user input, validate and sanitize all data
3. **Use HTTPS**: Always use HTTPS in production environments
4. **Rate Limiting**: Implement appropriate rate limiting for all endpoints
5. **Security Headers**: Use Helmet.js with proper CSP configuration
6. **CORS Policy**: Implement strict CORS policies, avoid wildcards in production
7. **Monitor & Log**: Implement comprehensive security logging and monitoring
8. **Regular Updates**: Keep all dependencies updated and monitor security advisories
9. **Environment Secrets**: Use environment variables for all sensitive configuration
10. **Security Testing**: Regularly test security configurations and practices

## Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)