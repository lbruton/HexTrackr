# Express.js Documentation Cache

**Source**: Context7 Library ID `/expressjs/express`  
**Trust Score**: 9.0/10  
**Code Snippets**: 668  
**Last Updated**: September 5, 2025

## Overview

Express.js is a fast, unopinionated, minimalist web framework for Node.js. It provides robust routing and focuses on high performance.

## Key Topics

- Middleware configuration and order
- Router overhaul in Express 4.x
- Error handling patterns
- Migration guides (2.x → 3.x → 4.x)
- API updates and best practices

## Code Examples

### Express Middleware Order in 4.x

Illustrates the correct order of middleware and route definitions in Express 4.x after the removal of `app.router`.

```javascript
app.use(cookieParser());
app.use(bodyParser());
/// .. other middleware .. doesn't matter what

app.get('/' ...);
app.post(...);

// more middleware (executes after routes)
app.use(function(req, res, next) {});
// error handling middleware
app.use(function(err, res, next) {});
```

### Working with Route Middleware

Demonstrates how to apply middleware to specific routes in Express.js. Middleware can be used for tasks like authentication, logging, or data validation before a route handler is executed.

```javascript
const express = require('express');
const app = express();
const port = 3000;

// Middleware function
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

// Apply middleware to a specific route
app.get('/protected', requestLogger, (req, res) => {
  res.send('This route is protected by middleware!');
});

// Apply middleware to multiple routes
const adminMiddleware = (req, res, next) => {
  console.log('Admin access check...');
  // In a real app, you'd check user roles here
  next();
};

app.get('/admin/dashboard', adminMiddleware, (req, res) => {
  res.send('Welcome to the admin dashboard!');
});

// Middleware applied globally
app.use(requestLogger);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(port, () => {
  console.log(`Route middleware example listening at http://localhost:${port}`);
});
```

### Express Route Method Chaining

Shows how to use the `app.route()` method to chain multiple HTTP verb handlers for a single path.

```javascript
app.route('/users')
.get(function(req, res, next) { /* ... */ })
.post(function(req, res, next) { /* ... */ });
```

### Express 4 Route Parameter Handling

Shows how `app.use` in Express 4.x can accept route parameters, making them available in `req.params`.

```javascript
app.use('/users/:user_id', function(req, res, next) {
  // req.params.user_id exists here
});
```

### Error Handling Middleware Setup

Illustrates the correct placement and structure of error-handling middleware in Express. It must be defined after all other middleware and have four arguments to catch errors passed via `next(err)`.

```javascript
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session());
app.use(app.router);

app.use(function(err, req, res, next){
  res.send(500, { error: 'Sorry something bad happened!' });
});
```

### Working with Route Parameters

Illustrates how to capture parameters from the URL in Express.js routes. This is useful for creating dynamic routes, such as fetching specific user data by ID.

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/users/:userId', (req, res) => {
  const userId = req.params.userId;
  res.send(`Fetching data for user ID: ${userId}`);
});

app.listen(port, () => {
  console.log(`Route parameter example listening at http://localhost:${port}`);
});
```

### Organizing Routes Per Each Resource

Illustrates a method for organizing Express.js routes by resource. Each resource (e.g., users, products) has its own set of routes, promoting better code organization.

```javascript
// server.js
const express = require('express');
const app = express();
const port = 3000;

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/users', userRoutes);
app.use('/products', productRoutes);

app.listen(port, () => {
  console.log(`Resource-based routing example listening at http://localhost:${port}`);
});

// routes/userRoutes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Get all users');
});

router.post('/', (req, res) => {
  res.send('Create a new user');
});

router.get('/:id', (req, res) => {
  res.send(`Get user with ID: ${req.params.id}`);
});

router.put('/:id', (req, res) => {
  res.send(`Update user with ID: ${req.params.id}`);
});

router.delete('/:id', (req, res) => {
  res.send(`Delete user with ID: ${req.params.id}`);
});

module.exports = router;
```

## Migration Notes

### Express 3.x to 4.0 Migration

- The middleware stack has been overhauled in Express 4, removing `app.router`
- Middleware and routes are now executed in the order they are added
- `bodyParser`, `cookieParser`, `favicon`, and `session` are no longer bundled with the `express` module
- They are now available as separate modules like `body-parser`, `cookie-parser`, `serve-favicon`, and `express-session`

### Router Overhaul

The Router has been overhauled and is now a full-fledged middleware router. It is useful for separating routes into files/modules while retaining features like parameter matching and middleware.

## Best Practices

1. **Middleware Order**: Place middleware in the correct order - authentication, logging, parsing, then routes
2. **Error Handling**: Always define error-handling middleware last with 4 parameters
3. **Route Organization**: Use Express Router to organize routes by resource
4. **Parameter Validation**: Use route parameters and middleware for input validation
5. **Security**: Implement proper error handling without information disclosure

## Common Patterns

- **Route Parameters**: Use `:param` syntax for dynamic routes
- **Middleware Chaining**: Chain multiple middleware functions for complex logic
- **Router Modules**: Separate route logic into dedicated modules
- **Error Propagation**: Use `next(err)` to pass errors to error handlers

## API Reference

### Router Methods

- `router.get(path, handler)` - GET route handler
- `router.post(path, handler)` - POST route handler
- `router.put(path, handler)` - PUT route handler
- `router.delete(path, handler)` - DELETE route handler
- `router.all(path, handler)` - Handler for all HTTP methods
- `router.use(path, middleware)` - Apply middleware to specific path

### Application Methods

- `app.route(path)` - Create chainable route handlers
- `app.param(name, handler)` - Register parameter middleware
- `app.use(path, router)` - Mount router on specific path
