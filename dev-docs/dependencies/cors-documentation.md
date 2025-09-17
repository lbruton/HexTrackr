# CORS Middleware Documentation

*Version: 2.8.5 - As used in HexTrackr*

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Basic Configuration](#basic-configuration)
3. [Origin Configuration](#origin-configuration)
4. [Advanced Options](#advanced-options)
5. [Dynamic CORS](#dynamic-cors)
6. [Preflight Handling](#preflight-handling)
7. [Security Best Practices](#security-best-practices)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

## Installation & Setup

### Installation
```bash
npm install cors
```

### Basic Setup with Express
```javascript
const cors = require('cors');
const express = require('express');
const app = express();

// Enable CORS for all origins (development only!)
app.use(cors());

app.listen(3000);
```

## Basic Configuration

### Simple CORS for All Origins
```javascript
const cors = require('cors');
const app = express();

// Enable CORS for all routes and origins
app.use(cors());

// This is equivalent to:
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
```

### Specific Origin Configuration
```javascript
const corsOptions = {
  origin: 'https://example.com',
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
```

### Multiple Origins
```javascript
const corsOptions = {
  origin: [
    'https://example.com',
    'https://app.example.com',
    'http://localhost:3000'
  ]
};

app.use(cors(corsOptions));
```

## Origin Configuration

### Boolean Origin
```javascript
const corsOptions = {
  // Reflect the request origin (dynamic)
  origin: true,  // Allows any origin

  // or disable CORS
  origin: false  // Disables CORS
};
```

### String Origin
```javascript
const corsOptions = {
  // Only allow specific origin
  origin: 'https://www.example.com'
};
```

### RegExp Origin
```javascript
const corsOptions = {
  // Allow any subdomain of example.com
  origin: /^https:\/\/.*\.example\.com$/
};
```

### Array of Origins
```javascript
const allowedOrigins = [
  'https://example.com',
  'https://app.example.com',
  'http://localhost:3000',
  'http://localhost:8080'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
```

### Dynamic Origin Function
```javascript
const corsOptions = {
  origin: async function (origin, callback) {
    try {
      // Load allowed origins from database
      const allowedOrigins = await db.getAllowedOrigins();

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } catch (error) {
      callback(error);
    }
  }
};
```

## Advanced Options

### Complete Configuration Options
```javascript
const corsOptions = {
  // Origin configuration
  origin: 'https://example.com',

  // HTTP methods to allow
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Headers to allow
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

  // Headers to expose to the browser
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'],

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Max age for preflight cache (in seconds)
  maxAge: 86400, // 24 hours

  // Pass preflight response to next handler
  preflightContinue: false,

  // Status code for successful OPTIONS requests
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
```

### Methods Configuration
```javascript
const corsOptions = {
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  // or as array
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};
```

### Headers Configuration
```javascript
const corsOptions = {
  // Allow specific headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Requested-With',
    'Accept',
    'Accept-Language',
    'Content-Language'
  ],

  // Expose headers to the browser
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Number',
    'X-Rate-Limit',
    'Content-Range'
  ]
};
```

### Credentials Support
```javascript
// IMPORTANT: When credentials is true, origin cannot be '*'
const corsOptions = {
  origin: 'https://app.example.com',
  credentials: true // Allow cookies and auth headers
};

app.use(cors(corsOptions));

// Client-side configuration needed:
// fetch(url, { credentials: 'include' })
// axios.defaults.withCredentials = true
```

## Dynamic CORS

### Environment-Based Configuration
```javascript
const isDevelopment = process.env.NODE_ENV === 'development';

const corsOptions = {
  origin: isDevelopment
    ? true  // Allow all origins in development
    : ['https://app.example.com', 'https://www.example.com'],

  credentials: true,

  maxAge: isDevelopment ? 0 : 86400  // No cache in dev
};

app.use(cors(corsOptions));
```

### Whitelist with Database
```javascript
class CORSManager {
  constructor() {
    this.allowedOrigins = new Set();
    this.loadOrigins();
  }

  async loadOrigins() {
    const origins = await db.query('SELECT domain FROM allowed_origins');
    this.allowedOrigins = new Set(origins.map(o => o.domain));
  }

  getCorsOptions() {
    return {
      origin: (origin, callback) => {
        // Allow requests with no origin
        if (!origin) return callback(null, true);

        if (this.allowedOrigins.has(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true
    };
  }
}

const corsManager = new CORSManager();
app.use(cors(corsManager.getCorsOptions()));
```

### Per-Route CORS
```javascript
const cors = require('cors');

// Default CORS for most routes
app.use(cors());

// Specific CORS for sensitive endpoint
const apiCorsOptions = {
  origin: 'https://trusted-app.com',
  methods: ['GET', 'POST'],
  credentials: true
};

app.use('/api/sensitive', cors(apiCorsOptions));

// Disable CORS for internal endpoints
app.use('/internal', cors({ origin: false }));
```

## Preflight Handling

### Understanding Preflight Requests
```javascript
// Browsers send OPTIONS requests for:
// - Custom headers
// - Methods other than GET/HEAD/POST
// - Content-Type other than form data

const corsOptions = {
  // Cache preflight response
  maxAge: 3600, // 1 hour

  // Continue to next middleware after preflight
  preflightContinue: false,

  // Response status for successful preflight
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### Custom Preflight Handler
```javascript
app.options('/api/*', cors()); // Enable preflight for all API routes

// Or handle manually
app.options('/api/data', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://example.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '3600');
  res.sendStatus(204);
});
```

### Conditional Preflight
```javascript
const corsOptionsDelegate = function (req, callback) {
  let corsOptions;

  if (req.path.startsWith('/api/public')) {
    // Public API - allow all origins
    corsOptions = { origin: true };
  } else if (req.path.startsWith('/api/private')) {
    // Private API - restricted origins
    corsOptions = {
      origin: ['https://app.example.com'],
      credentials: true
    };
  } else {
    // Default - no CORS
    corsOptions = { origin: false };
  }

  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));
```

## Security Best Practices

### 1. Never Use Wildcard with Credentials
```javascript
// ❌ WRONG - Security vulnerability
app.use(cors({
  origin: '*',
  credentials: true
}));

// ✅ CORRECT - Specific origins with credentials
app.use(cors({
  origin: ['https://app.example.com'],
  credentials: true
}));
```

### 2. Validate Origins Strictly
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://app.example.com',
      'https://www.example.com'
    ];

    // Reject if origin is not in whitelist
    if (origin && !allowedOrigins.includes(origin)) {
      return callback(new Error('CORS policy violation'), false);
    }

    // Allow requests with no origin (server-to-server)
    if (!origin && process.env.ALLOW_NO_ORIGIN === 'true') {
      return callback(null, true);
    }

    callback(null, true);
  }
};
```

### 3. Environment-Specific Configuration
```javascript
const getCorsOptions = () => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return {
        origin: true,
        credentials: true
      };

    case 'staging':
      return {
        origin: [
          'https://staging.example.com',
          'http://localhost:3000'
        ],
        credentials: true
      };

    case 'production':
      return {
        origin: [
          'https://app.example.com',
          'https://www.example.com'
        ],
        credentials: true,
        maxAge: 86400
      };

    default:
      return { origin: false };
  }
};

app.use(cors(getCorsOptions()));
```

### 4. Rate Limiting CORS Requests
```javascript
const rateLimit = require('express-rate-limit');

// Rate limit preflight requests
const preflightLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 preflight requests per window
  message: 'Too many preflight requests'
});

app.options('*', preflightLimiter, cors());
```

### 5. Logging and Monitoring
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Log CORS requests
    console.log(`CORS request from origin: ${origin}`);

    // Monitor suspicious patterns
    if (origin && isSuspiciousOrigin(origin)) {
      logSecurityEvent('Suspicious CORS attempt', { origin });
      return callback(new Error('Suspicious origin'), false);
    }

    // Normal validation
    validateOrigin(origin, callback);
  }
};
```

## Common Patterns

### API Gateway Pattern
```javascript
// Different CORS policies for different API versions
app.use('/api/v1', cors({
  origin: '*', // Public API
  methods: ['GET']
}));

app.use('/api/v2', cors({
  origin: ['https://app.example.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use('/admin', cors({
  origin: 'https://admin.example.com',
  credentials: true,
  methods: '*',
  allowedHeaders: '*'
}));
```

### Microservices Pattern
```javascript
const serviceCorsMap = {
  '/auth': {
    origin: ['https://app.example.com'],
    credentials: true
  },
  '/payments': {
    origin: 'https://secure.example.com',
    credentials: true,
    methods: ['POST']
  },
  '/public': {
    origin: '*',
    methods: ['GET']
  }
};

Object.entries(serviceCorsMap).forEach(([path, options]) => {
  app.use(path, cors(options));
});
```

### SPA (Single Page Application) Pattern
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://app.example.com',
      'http://localhost:3000', // Local development
      'http://localhost:8080'  // Alternative dev port
    ];

    // Allow same-origin requests
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));
```

## Troubleshooting

### Common CORS Errors and Solutions

#### 1. "No 'Access-Control-Allow-Origin' header"
```javascript
// Problem: CORS not configured
// Solution: Add CORS middleware
app.use(cors({
  origin: 'https://your-frontend.com'
}));
```

#### 2. "CORS header 'Access-Control-Allow-Origin' missing"
```javascript
// Problem: Origin not in whitelist
// Solution: Add origin to allowed list
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = ['https://example.com', origin]; // Add current origin
    callback(null, whitelist.includes(origin));
  }
};
```

#### 3. "Credentials flag is true but Access-Control-Allow-Credentials is not"
```javascript
// Problem: Credentials not properly configured
// Solution: Set credentials in CORS options
app.use(cors({
  origin: 'https://app.example.com',
  credentials: true  // Must be explicitly set
}));
```

#### 4. "Method not allowed by Access-Control-Allow-Methods"
```javascript
// Problem: HTTP method not in allowed list
// Solution: Add method to allowed methods
app.use(cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
```

### Debug Mode
```javascript
const debugCors = (req, res, next) => {
  console.log('CORS Debug:');
  console.log('  Origin:', req.headers.origin);
  console.log('  Method:', req.method);
  console.log('  Headers:', req.headers);
  next();
};

app.use(debugCors);
app.use(cors());
```

### Testing CORS Configuration
```javascript
// Test endpoint for CORS
app.get('/test-cors', cors(), (req, res) => {
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    method: req.method
  });
});
```

## HexTrackr-Specific Patterns

### HexTrackr CORS Configuration
```javascript
const cors = require('cors');

// HexTrackr CORS settings
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:8989',     // Docker mapped port
      'http://localhost:8080',     // Internal port
      'http://localhost:3000',     // Development
      'https://hextrackr.example.com'  // Production
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Session-ID'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Import-Progress',
    'Content-Disposition'
  ]
};

app.use(cors(corsOptions));
```

### API Route-Specific CORS
```javascript
// Public endpoints - relaxed CORS
app.use('/api/public', cors({
  origin: true,
  methods: ['GET']
}));

// Vulnerability import - strict CORS
app.use('/api/vulnerabilities/import', cors({
  origin: ['https://hextrackr.example.com'],
  credentials: true,
  methods: ['POST'],
  maxAge: 3600
}));

// WebSocket endpoint - specific configuration
app.use('/socket.io', cors({
  origin: ['http://localhost:8989'],
  credentials: true
}));
```

---

*This documentation covers the CORS middleware patterns used in HexTrackr for secure cross-origin resource sharing.*