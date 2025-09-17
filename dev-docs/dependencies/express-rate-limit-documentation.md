# Express Rate Limit Documentation

*Version: 6.11.2 - As used in HexTrackr*

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Basic Configuration](#basic-configuration)
3. [Advanced Options](#advanced-options)
4. [Store Configuration](#store-configuration)
5. [Custom Handlers](#custom-handlers)
6. [Multiple Limiters](#multiple-limiters)
7. [Security Patterns](#security-patterns)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Installation & Setup

### Installation
```bash
npm install express-rate-limit
```

### Basic Setup with Express
```javascript
const rateLimit = require('express-rate-limit');
const express = require('express');
const app = express();

// Create rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});

// Apply to all requests
app.use(limiter);

app.listen(3000);
```

## Basic Configuration

### Simple Rate Limiter
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // Max requests per window
  message: 'Too many requests, please try again later.',
  statusCode: 429,            // Too Many Requests
  headers: true,              // Send rate limit headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

app.use(limiter);
```

### API Rate Limiter
```javascript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minute window
  max: 100,                   // Start blocking after 100 requests
  message: {
    status: 429,
    error: 'Too many requests',
    message: 'You have exceeded the 100 requests in 15 minutes limit!',
    retryAfter: 900000
  },
  standardHeaders: true,      // Return rate limit info in headers
  legacyHeaders: false        // Disable X-RateLimit headers
});

// Apply to API routes
app.use('/api/', apiLimiter);
```

## Advanced Options

### Complete Configuration Options
```javascript
const limiter = rateLimit({
  // Time window in milliseconds
  windowMs: 15 * 60 * 1000,

  // Max requests per window
  max: 100,

  // Return rate limit info in headers
  standardHeaders: true,      // `RateLimit-*` headers
  legacyHeaders: false,       // `X-RateLimit-*` headers

  // Store configuration
  store: new MemoryStore(),   // Default in-memory store

  // Message when rate limit exceeded
  message: 'Too many requests',

  // HTTP status code
  statusCode: 429,

  // Handler when rate limit exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: req.rateLimit.resetTime
    });
  },

  // Skip successful requests from rate limit
  skipSuccessfulRequests: false,

  // Skip failed requests from rate limit
  skipFailedRequests: false,

  // Key generator function
  keyGenerator: (req) => {
    return req.ip;  // Default: use IP address
  },

  // Skip function
  skip: (req) => {
    // Skip rate limiting for certain conditions
    return false;
  },

  // Request property name
  requestPropertyName: 'rateLimit'
});
```

### Dynamic Rate Limits
```javascript
const dynamicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    // Different limits based on user type
    if (req.user && req.user.isPremium) {
      return 1000;  // Premium users: 1000 requests
    }
    if (req.user) {
      return 200;   // Authenticated users: 200 requests
    }
    return 100;     // Anonymous users: 100 requests
  }
});
```

### Custom Key Generator
```javascript
const customKeyLimiter = rateLimit({
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated
    if (req.user) {
      return `user_${req.user.id}`;
    }
    // Otherwise by IP address
    return req.ip;
  },
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### Skip Conditions
```javascript
const conditionalLimiter = rateLimit({
  skip: (req) => {
    // Skip rate limiting for internal IPs
    const internalIPs = ['192.168.1.1', '10.0.0.1'];
    if (internalIPs.includes(req.ip)) {
      return true;
    }

    // Skip for admin users
    if (req.user && req.user.role === 'admin') {
      return true;
    }

    // Skip for health check endpoints
    if (req.path === '/health') {
      return true;
    }

    return false;
  },
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

## Store Configuration

### In-Memory Store (Default)
```javascript
const MemoryStore = require('express-rate-limit').MemoryStore;

const limiter = rateLimit({
  store: new MemoryStore({
    // Optional configuration
    checkPeriod: 60000  // How often to check for expired keys
  }),
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### Redis Store
```javascript
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redisClient = new Redis({
  host: 'localhost',
  port: 6379
});

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:',  // Key prefix in Redis
    sendCommand: (...args) => redisClient.call(...args)
  }),
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### MongoDB Store
```javascript
const MongoStore = require('rate-limit-mongo');

const limiter = rateLimit({
  store: new MongoStore({
    uri: 'mongodb://localhost:27017/ratelimit',
    collectionName: 'expressRateLimit',
    errorHandler: console.error.bind(null, 'rate-limit-mongo')
  }),
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### Custom Store Implementation
```javascript
class CustomStore {
  constructor() {
    this.hits = new Map();
    this.resetTimes = new Map();
  }

  async increment(key) {
    const now = Date.now();
    const resetTime = this.resetTimes.get(key);

    if (!resetTime || now > resetTime) {
      this.hits.set(key, 1);
      this.resetTimes.set(key, now + this.windowMs);
      return {
        totalHits: 1,
        resetTime: this.resetTimes.get(key)
      };
    }

    const hits = (this.hits.get(key) || 0) + 1;
    this.hits.set(key, hits);

    return {
      totalHits: hits,
      resetTime: resetTime
    };
  }

  async decrement(key) {
    const hits = this.hits.get(key) || 0;
    this.hits.set(key, Math.max(0, hits - 1));
  }

  async resetKey(key) {
    this.hits.delete(key);
    this.resetTimes.delete(key);
  }

  async resetAll() {
    this.hits.clear();
    this.resetTimes.clear();
  }
}

const limiter = rateLimit({
  store: new CustomStore(),
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

## Custom Handlers

### Custom Error Handler
```javascript
const limiter = rateLimit({
  handler: (req, res, next) => {
    // Log the rate limit violation
    console.log(`Rate limit exceeded for IP: ${req.ip}`);

    // Custom response
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        retryAfter: req.rateLimit.resetTime,
        limit: req.rateLimit.limit,
        current: req.rateLimit.current,
        remaining: req.rateLimit.remaining
      }
    });
  },
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### Custom Success/Failure Handlers
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,

  // Called when limit is reached but not exceeded
  onLimitReached: (req, res, options) => {
    console.log(`Warning: ${req.ip} approaching rate limit`);
  },

  // Custom request counting
  requestWasSuccessful: (req, res) => {
    return res.statusCode < 400;
  }
});
```

### Webhook on Rate Limit
```javascript
const axios = require('axios');

const limiter = rateLimit({
  handler: async (req, res) => {
    // Send webhook notification
    try {
      await axios.post('https://api.example.com/webhooks/rate-limit', {
        ip: req.ip,
        path: req.path,
        timestamp: new Date(),
        headers: req.headers
      });
    } catch (error) {
      console.error('Webhook failed:', error);
    }

    res.status(429).json({
      error: 'Rate limit exceeded'
    });
  },
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

## Multiple Limiters

### Different Limits for Different Routes
```javascript
// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 requests per window
  message: 'Too many authentication attempts'
});

// Moderate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // 100 requests per window
});

// Lenient limiter for static assets
const assetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 1000                   // 1000 requests per window
});

// Apply limiters to specific routes
app.use('/auth', authLimiter);
app.use('/api', apiLimiter);
app.use('/assets', assetLimiter);
```

### Cascading Rate Limiters
```javascript
// Global limiter (loose)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});

// Per-minute limiter (strict)
const minuteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20
});

// Apply both limiters
app.use(globalLimiter);
app.use('/api', minuteLimiter);
```

### Method-Specific Limits
```javascript
// Different limits for different HTTP methods
const createLimiter = (method, max) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: max,
    skip: (req) => req.method !== method,
    message: `Too many ${method} requests`
  });
};

app.use(createLimiter('POST', 50));
app.use(createLimiter('PUT', 50));
app.use(createLimiter('DELETE', 10));
app.use(createLimiter('GET', 200));
```

## Security Patterns

### Login Attempt Limiter
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req) => {
    // Key by username + IP
    return `${req.body.username}_${req.ip}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many failed login attempts',
      message: 'Your account has been temporarily locked',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

app.post('/login', loginLimiter, async (req, res) => {
  // Login logic
});
```

### API Key Rate Limiting
```javascript
const apiKeyLimiter = rateLimit({
  keyGenerator: (req) => {
    // Rate limit by API key
    return req.headers['x-api-key'] || req.ip;
  },
  max: (req) => {
    const apiKey = req.headers['x-api-key'];

    // Different limits based on API key tier
    if (apiKey && isPremiumKey(apiKey)) {
      return 10000;  // Premium: 10,000 requests
    }
    if (apiKey && isBasicKey(apiKey)) {
      return 1000;   // Basic: 1,000 requests
    }
    return 100;      // No key: 100 requests
  },
  windowMs: 60 * 60 * 1000  // 1 hour
});
```

### DDoS Protection
```javascript
// Aggressive rate limiting for DDoS protection
const ddosLimiter = rateLimit({
  windowMs: 1 * 1000,        // 1 second
  max: 10,                   // 10 requests per second
  standardHeaders: false,    // Don't send headers
  legacyHeaders: false,
  handler: (req, res) => {
    // Log potential DDoS attempt
    console.error(`Potential DDoS from IP: ${req.ip}`);

    // Block the request
    res.status(503).end();  // Service Unavailable
  }
});

// Apply to all routes
app.use(ddosLimiter);
```

### Distributed Rate Limiting
```javascript
const Redis = require('ioredis');
const RedisStore = require('rate-limit-redis');

// Redis cluster for distributed rate limiting
const redisCluster = new Redis.Cluster([
  { port: 6380, host: '127.0.0.1' },
  { port: 6381, host: '127.0.0.1' }
]);

const distributedLimiter = rateLimit({
  store: new RedisStore({
    client: redisCluster,
    prefix: 'distributed:rl:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

## Best Practices

### 1. Environment-Specific Configuration
```javascript
const getRateLimitConfig = () => {
  const env = process.env.NODE_ENV;

  const configs = {
    development: {
      windowMs: 15 * 60 * 1000,
      max: 1000,  // Lenient for development
      skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1'
    },
    staging: {
      windowMs: 15 * 60 * 1000,
      max: 500
    },
    production: {
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false
    }
  };

  return configs[env] || configs.production;
};

const limiter = rateLimit(getRateLimitConfig());
```

### 2. Monitoring and Alerting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    // Monitor rate limit violations
    metrics.increment('rate_limit.exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });

    // Alert on suspicious activity
    if (req.rateLimit.current > req.rateLimit.limit * 2) {
      alerting.send({
        severity: 'high',
        message: `Excessive requests from ${req.ip}`,
        details: req.rateLimit
      });
    }

    res.status(429).json({ error: 'Rate limit exceeded' });
  }
});
```

### 3. Graceful Degradation
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    // Provide alternative options
    res.status(429).json({
      error: 'Rate limit exceeded',
      alternatives: {
        message: 'Please try the following:',
        options: [
          'Wait 15 minutes before retrying',
          'Contact support for increased limits',
          'Use our batch API for bulk operations'
        ],
        supportUrl: 'https://example.com/support',
        upgradeUrl: 'https://example.com/pricing'
      }
    });
  }
});
```

### 4. Testing Rate Limits
```javascript
// Test helper for rate limiting
const testRateLimit = async () => {
  const requests = [];

  // Make requests up to the limit
  for (let i = 0; i < 101; i++) {
    requests.push(
      axios.get('http://localhost:3000/api/test')
        .then(res => ({ status: res.status, headers: res.headers }))
        .catch(err => ({ status: err.response.status, headers: err.response.headers }))
    );
  }

  const results = await Promise.all(requests);

  // Check that 101st request was rate limited
  console.assert(results[100].status === 429, 'Rate limit not enforced');
  console.log('Rate limit test passed');
};
```

## Troubleshooting

### Common Issues and Solutions

#### Rate Limit Not Working
```javascript
// Check middleware order - rate limiter should be early
app.use(limiter);  // ✅ Before routes
app.use('/api', apiRoutes);

// Not:
app.use('/api', apiRoutes);
app.use(limiter);  // ❌ Too late
```

#### Behind Proxy Issues
```javascript
// Trust proxy to get correct IP
app.set('trust proxy', 1);

const limiter = rateLimit({
  keyGenerator: (req) => {
    // Use forwarded IP if behind proxy
    return req.headers['x-forwarded-for'] || req.ip;
  },
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

#### Memory Leaks with Default Store
```javascript
// Clean up expired entries periodically
const MemoryStore = require('express-rate-limit').MemoryStore;

const store = new MemoryStore();

// Clean up every hour
setInterval(() => {
  store.resetAll();
}, 60 * 60 * 1000);

const limiter = rateLimit({
  store: store,
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

## HexTrackr-Specific Patterns

### HexTrackr API Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many API requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for imports
const importLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,                   // 10 imports per hour
  message: 'Import limit exceeded, please wait before importing again',
  keyGenerator: (req) => {
    // Rate limit by session or IP
    return req.session?.id || req.ip;
  }
});

// Apply limiters
app.use('/api', apiLimiter);
app.use('/api/vulnerabilities/import', importLimiter);
```

### Vulnerability Export Rate Limiting
```javascript
// Prevent export abuse
const exportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,   // 5 minutes
  max: 5,                    // 5 exports per window
  skipSuccessfulRequests: false,
  skipFailedRequests: true,  // Don't count failed exports
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Export rate limit exceeded',
      message: 'Please wait before exporting again',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

app.use('/api/vulnerabilities/export', exportLimiter);
app.use('/api/tickets/export', exportLimiter);
```

### WebSocket Connection Rate Limiting
```javascript
// Limit WebSocket connections
const wsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1 minute
  max: 5,                    // 5 connection attempts per minute
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many WebSocket connection attempts'
    });
  }
});

app.use('/socket.io', wsLimiter);
```

---

*This documentation covers the express-rate-limit patterns used in HexTrackr for API protection and request throttling.*