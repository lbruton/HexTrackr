# Express.js Framework Documentation

*Version: 4.18.2 - As used in HexTrackr*

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [Application Setup](#application-setup)
3. [Routing](#routing)
4. [Middleware](#middleware)
5. [Error Handling](#error-handling)
6. [Request & Response](#request--response)
7. [Best Practices](#best-practices)

## Core Concepts

Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

### Key Features
- **Robust routing** - Define routes for different HTTP methods and URLs
- **Middleware support** - Execute code during request/response cycle
- **Template engines** - Integrate with view rendering engines
- **Error handling** - Centralized error management
- **Static file serving** - Serve CSS, images, JavaScript files

## Application Setup

### Basic Server Creation
```javascript
const express = require('express');
const app = express();
const port = 3000;

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
```

### With HTTP Server (for Socket.io)
```javascript
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);

server.listen(3000);
```

## Routing

### Basic Routes
```javascript
// GET request
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// POST request
app.post('/users', (req, res) => {
  res.json({ message: 'User created' });
});

// PUT request
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ message: `User ${userId} updated` });
});

// DELETE request
app.delete('/users/:id', (req, res) => {
  res.status(204).send();
});
```

### Route Parameters
```javascript
// Route parameters
app.get('/users/:userId', (req, res) => {
  const userId = req.params.userId;
  res.send(`User ID: ${userId}`);
});

// Query parameters
app.get('/search', (req, res) => {
  const query = req.query.q; // ?q=searchterm
  res.json({ searchTerm: query });
});
```

### Route Method Chaining
```javascript
app.route('/users')
  .get((req, res) => { /* GET handler */ })
  .post((req, res) => { /* POST handler */ })
  .put((req, res) => { /* PUT handler */ });
```

### Express Router
```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ users: [] });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'User created' });
});

module.exports = router;

// main app.js
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
```

## Middleware

### Built-in Middleware
```javascript
// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));
```

### Custom Middleware
```javascript
// Logger middleware
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // Pass control to next middleware
};

app.use(requestLogger);
```

### Route-specific Middleware
```javascript
const authenticate = (req, res, next) => {
  // Check authentication
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'Protected resource' });
});
```

### Middleware Order
```javascript
// Order matters! Middleware executes in sequence
app.use(cookieParser());
app.use(bodyParser());

app.get('/', handler);
app.post('/', handler);

// Error middleware comes last
app.use((err, req, res, next) => {
  res.status(500).send('Error occurred');
});
```

## Error Handling

### Error-Handling Middleware
```javascript
// Must have 4 arguments: err, req, res, next
app.use((err, req, res, next) => {
  console.error('Error caught:', err.message);
  console.error('Stack:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### Async Error Handling
```javascript
// Wrap async routes to catch errors
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/async-route', asyncHandler(async (req, res) => {
  const data = await someAsyncOperation();
  res.json(data);
}));
```

### Creating Custom Errors
```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Usage
app.get('/error-example', (req, res, next) => {
  next(new AppError('Resource not found', 404));
});
```

## Request & Response

### Request Object Properties
```javascript
app.get('/request-info', (req, res) => {
  console.log(req.method);      // GET, POST, etc.
  console.log(req.url);          // Full URL
  console.log(req.path);         // Path without query
  console.log(req.params);       // Route parameters
  console.log(req.query);        // Query string parameters
  console.log(req.body);         // Request body (needs body parser)
  console.log(req.headers);      // Request headers
  console.log(req.cookies);      // Cookies (needs cookie parser)
  console.log(req.ip);           // Client IP
  console.log(req.hostname);     // Hostname
  console.log(req.protocol);     // http or https
});
```

### Response Methods
```javascript
// Send responses
res.send('HTML or text');                    // Auto content-type
res.json({ key: 'value' });                  // JSON response
res.status(404).send('Not Found');           // Set status
res.sendFile('/absolute/path/to/file.html'); // Send file

// Headers
res.set('X-Custom-Header', 'value');
res.type('application/json');
res.header('Cache-Control', 'no-cache');

// Redirects
res.redirect('/new-location');
res.redirect(301, '/permanent-redirect');

// Downloads
res.download('/path/to/file.pdf');
res.download('/path/to/file.pdf', 'custom-name.pdf');

// Cookies
res.cookie('name', 'value', {
  maxAge: 900000,
  httpOnly: true,
  secure: true
});
res.clearCookie('name');
```

## Best Practices

### 1. Use Environment Variables
```javascript
require('dotenv').config();

const port = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';
```

### 2. Modular Route Organization
```javascript
// routes/index.js
app.use('/api/users', require('./users'));
app.use('/api/products', require('./products'));
app.use('/api/orders', require('./orders'));
```

### 3. Consistent Error Response Format
```javascript
const sendErrorResponse = (res, status, message, details = null) => {
  res.status(status).json({
    success: false,
    error: message,
    ...(details && { details })
  });
};
```

### 4. Request Validation
```javascript
const validateRequest = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password required'
    });
  }

  next();
};

app.post('/login', validateRequest, loginHandler);
```

### 5. Security Best Practices
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## HexTrackr-Specific Patterns

### Standard API Response Format
```javascript
// Success response
res.json({
  success: true,
  data: result
});

// Error response
res.status(500).json({
  success: false,
  error: 'Operation failed',
  details: error.message
});
```

### File Upload with Multer Integration
```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  // req.file contains file info
  res.json({
    success: true,
    filename: req.file.filename
  });
});
```

### WebSocket Integration Pattern
```javascript
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port);
```

---

*This documentation covers the essential Express.js patterns and features used in HexTrackr's server implementation.*