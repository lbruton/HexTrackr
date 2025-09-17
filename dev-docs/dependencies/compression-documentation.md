# Compression Middleware Documentation

*Version: 1.7.4 - As used in HexTrackr*

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Basic Usage](#basic-usage)
3. [Configuration Options](#configuration-options)
4. [Compression Algorithms](#compression-algorithms)
5. [Filter Functions](#filter-functions)
6. [Performance Tuning](#performance-tuning)
7. [Integration Patterns](#integration-patterns)
8. [Best Practices](#best-practices)

## Installation & Setup

### Installation
```bash
npm install compression
```

### Basic Setup with Express
```javascript
const compression = require('compression');
const express = require('express');
const app = express();

// Use compression middleware
app.use(compression());

app.listen(3000);
```

## Basic Usage

### Simple Implementation
```javascript
const compression = require('compression');
const express = require('express');
const app = express();

// Enable compression for all responses
app.use(compression());

// Your routes
app.get('/data', (req, res) => {
  // Large JSON response will be compressed
  res.json({
    data: Array(1000).fill({
      id: Math.random(),
      value: 'Some repetitive data'
    })
  });
});
```

### Middleware Order Matters
```javascript
const app = express();

// Compression should be one of the first middleware
app.use(compression());

// Other middleware comes after
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api', apiRoutes);
```

## Configuration Options

### All Available Options
```javascript
app.use(compression({
  // Compression level (0-9)
  level: 6,                    // Default: 6

  // Minimum response size to compress (bytes)
  threshold: 1024,             // Default: 1kb

  // Memory level (1-9)
  memLevel: 8,                 // Default: 8

  // Strategy for compression
  strategy: zlib.Z_DEFAULT_STRATEGY,

  // Window bits
  windowBits: 15,              // Default: 15

  // Chunk size
  chunkSize: 16 * 1024,        // Default: 16kb

  // Custom filter function
  filter: shouldCompress,

  // Brotli options (Node.js 11.7.0+)
  brotli: {
    enabled: true,
    params: {
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
      [zlib.constants.BROTLI_PARAM_QUALITY]: 4
    }
  }
}));
```

### Common Configuration Examples
```javascript
// High compression for APIs
const apiCompression = compression({
  level: 9,           // Maximum compression
  threshold: 0,       // Compress everything
  memLevel: 9         // More memory for better compression
});

// Balanced compression for general use
const balancedCompression = compression({
  level: 6,           // Default level
  threshold: 1024,    // Skip small responses
  memLevel: 8         // Default memory
});

// Fast compression for real-time
const fastCompression = compression({
  level: 1,           // Fastest compression
  threshold: 10240,   // Only compress larger files
  memLevel: 1         // Minimal memory usage
});
```

## Compression Algorithms

### Supported Encodings
```javascript
// Compression automatically negotiates the best encoding
// based on Accept-Encoding header

// Priority order:
// 1. br (Brotli) - if available and supported
// 2. gzip - most common
// 3. deflate - fallback
// 4. identity - no compression

app.use(compression({
  // Disable specific encodings
  filter: function(req, res) {
    // Check Accept-Encoding header
    const acceptEncoding = req.headers['accept-encoding'] || '';

    // Only use gzip
    if (!acceptEncoding.includes('gzip')) {
      return false;
    }

    return compression.filter(req, res);
  }
}));
```

### Brotli Configuration (Node.js 11.7.0+)
```javascript
const zlib = require('zlib');

app.use(compression({
  brotli: {
    enabled: true,
    params: {
      // Brotli mode
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,

      // Quality (0-11, higher = better compression, slower)
      [zlib.constants.BROTLI_PARAM_QUALITY]: 4,

      // Window size
      [zlib.constants.BROTLI_PARAM_LGWIN]: 22
    }
  }
}));
```

## Filter Functions

### Default Filter Extension
```javascript
function shouldCompress(req, res) {
  // Don't compress for specific header
  if (req.headers['x-no-compression']) {
    return false;
  }

  // Fallback to default filter
  return compression.filter(req, res);
}

app.use(compression({ filter: shouldCompress }));
```

### Custom Filter Examples
```javascript
// Compress only specific content types
function compressOnlyJSON(req, res) {
  const contentType = res.getHeader('Content-Type');

  if (contentType && contentType.includes('application/json')) {
    return true;
  }

  return false;
}

// Compress based on response size
function compressLargeResponses(req, res) {
  const contentLength = res.getHeader('Content-Length');

  // Only compress if larger than 10KB
  if (contentLength && parseInt(contentLength) > 10240) {
    return true;
  }

  return compression.filter(req, res);
}

// Compress based on route
function compressAPIRoutes(req, res) {
  // Only compress API routes
  if (req.path.startsWith('/api/')) {
    return compression.filter(req, res);
  }

  return false;
}
```

### Content-Type Based Filtering
```javascript
const compressionFilter = (req, res) => {
  // Get content type
  const contentType = res.getHeader('Content-Type') || '';

  // Always compress these types
  const compressTypes = [
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/json',
    'application/xml',
    'text/xml',
    'image/svg+xml'
  ];

  // Check if should compress
  const shouldCompress = compressTypes.some(type =>
    contentType.includes(type)
  );

  if (shouldCompress) {
    return true;
  }

  // Don't compress images, videos, or already compressed files
  const skipTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/',
    'application/zip',
    'application/gzip'
  ];

  const shouldSkip = skipTypes.some(type =>
    contentType.includes(type)
  );

  return !shouldSkip;
};

app.use(compression({ filter: compressionFilter }));
```

## Performance Tuning

### Memory vs CPU Trade-offs
```javascript
// High performance (less CPU, more memory)
const highPerformance = compression({
  level: 1,        // Fast compression
  memLevel: 9,     // More memory
  strategy: zlib.Z_HUFFMAN_ONLY,
  chunkSize: 32 * 1024
});

// High compression (more CPU, less memory)
const highCompression = compression({
  level: 9,        // Best compression
  memLevel: 1,     // Less memory
  strategy: zlib.Z_DEFAULT_STRATEGY,
  chunkSize: 8 * 1024
});

// Balanced (default)
const balanced = compression({
  level: 6,
  memLevel: 8,
  strategy: zlib.Z_DEFAULT_STRATEGY,
  chunkSize: 16 * 1024
});
```

### Dynamic Compression Levels
```javascript
function getDynamicCompression() {
  return compression({
    level: (req, res) => {
      // Use different levels based on content
      const contentType = res.getHeader('Content-Type') || '';

      if (contentType.includes('application/json')) {
        // High compression for JSON
        return 9;
      } else if (contentType.includes('text/html')) {
        // Medium compression for HTML
        return 6;
      } else {
        // Low compression for others
        return 3;
      }
    }
  });
}

app.use(getDynamicCompression());
```

### Response Flushing
```javascript
// Compression adds res.flush() method
app.get('/stream', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });

  res.write('<html><body>');
  res.flush(); // Force flush compressed data

  // Simulate slow data
  setTimeout(() => {
    res.write('<h1>Delayed content</h1>');
    res.flush();
  }, 1000);

  setTimeout(() => {
    res.end('</body></html>');
  }, 2000);
});
```

## Integration Patterns

### With Static Files
```javascript
const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();

// Compress all responses
app.use(compression());

// Serve static files (will be compressed)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true
}));
```

### With API Responses
```javascript
// API-specific compression
const apiCompression = compression({
  filter: (req, res) => {
    // Only compress JSON responses
    return /json/.test(res.getHeader('Content-Type'));
  },
  level: 9 // Maximum compression for API data
});

// Apply to API routes
app.use('/api', apiCompression, apiRouter);
```

### Conditional Compression
```javascript
// Skip compression for certain conditions
app.use(compression({
  filter: (req, res) => {
    // Skip if client doesn't support
    if (!req.headers['accept-encoding']) {
      return false;
    }

    // Skip for localhost during development
    if (process.env.NODE_ENV === 'development' &&
        req.hostname === 'localhost') {
      return false;
    }

    // Skip for already compressed responses
    if (res.getHeader('Content-Encoding')) {
      return false;
    }

    return compression.filter(req, res);
  }
}));
```

### With WebSockets
```javascript
const compression = require('compression');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Compression for HTTP responses only
// WebSocket has its own compression (per-message deflate)
app.use(compression());

io.on('connection', (socket) => {
  // WebSocket connections handle compression separately
  socket.on('data', (data) => {
    // Handle uncompressed WebSocket data
  });
});
```

## Best Practices

### 1. Placement in Middleware Stack
```javascript
const app = express();

// CORRECT: Compression first
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// WRONG: Compression after other middleware
// Some responses might not get compressed
```

### 2. Environment-Specific Configuration
```javascript
const compressionConfig = {
  development: {
    level: 0,          // No compression in dev
    threshold: 0
  },
  staging: {
    level: 6,          // Balanced compression
    threshold: 1024
  },
  production: {
    level: 9,          // Maximum compression
    threshold: 0,      // Compress everything
    brotli: {
      enabled: true,
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 4
      }
    }
  }
};

const config = compressionConfig[process.env.NODE_ENV || 'development'];
app.use(compression(config));
```

### 3. Cache-Aware Compression
```javascript
app.use(compression({
  filter: (req, res) => {
    // Don't compress if response is cached
    const cacheControl = res.getHeader('Cache-Control');
    if (cacheControl && cacheControl.includes('no-transform')) {
      return false;
    }

    return compression.filter(req, res);
  }
}));
```

### 4. Monitoring Compression
```javascript
app.use(compression({
  filter: (req, res) => {
    // Add monitoring
    const startSize = res.getHeader('Content-Length');

    res.on('finish', () => {
      const encoding = res.getHeader('Content-Encoding');
      if (encoding) {
        console.log(`Compressed: ${req.path} with ${encoding}`);
        // Log compression ratio if needed
      }
    });

    return compression.filter(req, res);
  }
}));
```

### 5. Error Handling
```javascript
const compressionMiddleware = compression();

app.use((req, res, next) => {
  compressionMiddleware(req, res, (err) => {
    if (err) {
      console.error('Compression error:', err);
      // Continue without compression
      next();
    } else {
      next();
    }
  });
});
```

## HexTrackr-Specific Patterns

### Large CSV Response Compression
```javascript
// Optimize for large vulnerability data exports
app.use('/api/vulnerabilities/export', compression({
  level: 9,              // Maximum compression for CSVs
  threshold: 0,          // Compress all sizes
  memLevel: 9,           // More memory for better compression
  chunkSize: 32 * 1024,  // Larger chunks for efficiency
  filter: (req, res) => {
    // Always compress CSV exports
    const contentType = res.getHeader('Content-Type');
    return contentType && contentType.includes('text/csv');
  }
}));
```

### API Response Optimization
```javascript
// HexTrackr API compression settings
const apiCompression = compression({
  level: 7,              // Good compression without too much CPU
  threshold: 512,        // Skip very small responses
  filter: (req, res) => {
    // Compress JSON and CSV responses
    const contentType = res.getHeader('Content-Type') || '';
    const shouldCompress =
      contentType.includes('application/json') ||
      contentType.includes('text/csv');

    if (shouldCompress) {
      // Add header to indicate compression
      res.setHeader('X-Compression-Used', 'true');
    }

    return shouldCompress;
  }
});

app.use('/api', apiCompression);
```

### Static Asset Compression
```javascript
// Separate compression for static files
app.use('/public', compression({
  level: 9,              // Maximum compression for static files
  threshold: 1024,       // Skip tiny files
  filter: (req, res) => {
    const ext = path.extname(req.path).toLowerCase();
    const compressibleExts = ['.js', '.css', '.html', '.svg', '.json'];
    return compressibleExts.includes(ext);
  }
}), express.static('public'));
```

---

*This documentation covers the compression middleware patterns used in HexTrackr for optimizing response sizes and improving performance.*