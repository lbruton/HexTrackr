/**
 * HexTrackr Error Handling Middleware
 * Centralized error handling for consistent error responses and logging
 * Extracted from app/public/server.js patterns
 */

/**
 * Global error handler middleware (4 parameters required for Express error handler)
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function globalErrorHandler(err, req, res, next) {
    // Log error with context
    const errorContext = {
        method: req.method,
        url: req.url,
        userAgent: req.get("User-Agent"),
        timestamp: new Date().toISOString(),
        sessionId: req.sessionID || "unknown"
    };

    console.error("Global error handler caught:", {
        error: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        context: errorContext
    });

    // Don't send response if headers already sent
    if (res.headersSent) {
        return next(err);
    }

    // Determine error type and status code
    let statusCode = 500;
    let errorMessage = "Internal server error";
    let errorDetails = undefined;

    // Handle specific error types
    if (err.name === "ValidationError") {
        statusCode = 400;
        errorMessage = "Validation failed";
        errorDetails = formatValidationError(err);
    } else if (err.name === "CastError" || err.message.includes("SQLITE_")) {
        statusCode = 400;
        errorMessage = "Database operation failed";
        errorDetails = formatDatabaseError(err);
    } else if (err.message.includes("Path traversal") || err.message.includes("Invalid path")) {
        statusCode = 403;
        errorMessage = "File access denied";
        errorDetails = "Path validation failed";
    } else if (err.statusCode) {
        statusCode = err.statusCode;
        errorMessage = err.message;
    } else if (err.message) {
        errorMessage = err.message;
    }

    // Send consistent error response
    const errorResponse = {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
    };

    // Include details in development mode or if explicitly provided
    if (process.env.NODE_ENV === "development") {
        errorResponse.details = errorDetails || err.message;
        errorResponse.stack = err.stack;
        errorResponse.context = errorContext;
    } else if (errorDetails && statusCode !== 500) {
        // Only include safe details in production for non-server errors
        errorResponse.details = errorDetails;
    }

    res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler for unmatched routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function notFoundHandler(req, res) {
    console.warn(`404 Not Found: ${req.method} ${req.url} - User-Agent: ${req.get("User-Agent")}`);

    const errorResponse = {
        success: false,
        error: "Route not found",
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === "development") {
        errorResponse.details = `${req.method} ${req.url} is not a valid endpoint`;
        errorResponse.availableRoutes = [
            "GET /",
            "GET /tickets.html",
            "GET /vulnerabilities.html",
            "GET /health",
            "GET /api/vulnerabilities",
            "GET /api/tickets",
            "POST /api/vulnerabilities/import"
        ];
    }

    res.status(404).json(errorResponse);
}

/**
 * Database error formatter
 * @param {Error} err - Database error object
 * @returns {string} Formatted error message
 */
function formatDatabaseError(err) {
    const message = err.message || "Unknown database error";

    // Handle SQLite specific errors
    if (message.includes("SQLITE_CONSTRAINT")) {
        return "Database constraint violation - duplicate or invalid data";
    } else if (message.includes("SQLITE_BUSY")) {
        return "Database is busy - please try again";
    } else if (message.includes("SQLITE_LOCKED")) {
        return "Database is locked - operation in progress";
    } else if (message.includes("SQLITE_CORRUPT")) {
        return "Database corruption detected";
    } else if (message.includes("no such table")) {
        return "Database table not found - database may need initialization";
    } else if (message.includes("no such column")) {
        return "Database schema mismatch - database may need migration";
    }

    // Generic database error
    return process.env.NODE_ENV === "development" ? message : "Database operation failed";
}

/**
 * Validation error formatter
 * @param {Error} err - Validation error object
 * @returns {Object|string} Formatted validation errors
 */
function formatValidationError(err) {
    if (err.errors && typeof err.errors === "object") {
        // Multiple validation errors
        const formattedErrors = {};
        for (const [field, error] of Object.entries(err.errors)) {
            formattedErrors[field] = error.message || error;
        }
        return formattedErrors;
    } else if (err.details && Array.isArray(err.details)) {
        // Joi-style validation errors
        return err.details.map(detail => ({
            field: detail.path ? detail.path.join(".") : "unknown",
            message: detail.message
        }));
    }

    // Single validation error
    return err.message || "Validation failed";
}

/**
 * Async wrapper to catch errors from async route handler functions
 * Wraps async Express route handlers to catch rejected promises and pass them to Express error middleware.
 * Without this wrapper, unhandled promise rejections in async routes crash the server.
 *
 * @param {Function} fn - Async route handler function with signature (req, res, next) => Promise<void>
 * @returns {Function} Wrapped Express middleware function (req, res, next) => void
 * @throws {Error} Passes any caught errors to Express error handler via next(err)
 *
 * @example
 * // Wrap async route handlers to catch errors
 * const { asyncErrorHandler } = require('./middleware/errorHandler');
 *
 * router.get('/api/tickets', asyncErrorHandler(async (req, res) => {
 *     const tickets = await ticketService.getTickets();
 *     res.json({ success: true, data: tickets });
 * }));
 *
 * @example
 * // Without wrapper (WRONG - crashes on error):
 * router.get('/api/tickets', async (req, res) => {
 *     const tickets = await ticketService.getTickets(); // Unhandled rejection crashes server
 *     res.json({ success: true, data: tickets });
 * });
 *
 * @example
 * // With wrapper (CORRECT - errors caught):
 * router.get('/api/tickets', asyncErrorHandler(async (req, res) => {
 *     const tickets = await ticketService.getTickets(); // Errors passed to globalErrorHandler
 *     res.json({ success: true, data: tickets });
 * }));
 */
function asyncErrorHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Database operation error handler
 * Provides consistent error handling for database operations
 * @param {Error} err - Database error
 * @param {Object} res - Express response object
 * @param {string} operation - Description of the failed operation
 * @param {Object} additionalContext - Additional context for logging
 */
function handleDatabaseError(err, res, operation = "Database operation", additionalContext = {}) {
    console.error(`${operation} failed:`, {
        error: err.message,
        context: additionalContext,
        timestamp: new Date().toISOString()
    });

    const errorResponse = {
        success: false,
        error: `${operation} failed`,
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === "development") {
        errorResponse.details = err.message;
        errorResponse.context = additionalContext;
    } else {
        errorResponse.details = formatDatabaseError(err);
    }

    res.status(500).json(errorResponse);
}

/**
 * File operation error handler
 * Provides consistent error handling for file operations
 * @param {Error} err - File operation error
 * @param {Object} res - Express response object
 * @param {string} operation - Description of the failed operation
 */
function handleFileError(err, res, operation = "File operation") {
    console.error(`${operation} failed:`, err.message);

    let statusCode = 500;
    let errorMessage = `${operation} failed`;

    if (err.code === "ENOENT") {
        statusCode = 404;
        errorMessage = "File not found";
    } else if (err.code === "EACCES") {
        statusCode = 403;
        errorMessage = "File access denied";
    } else if (err.message.includes("Path traversal")) {
        statusCode = 403;
        errorMessage = "Invalid file path";
    }

    const errorResponse = {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === "development") {
        errorResponse.details = err.message;
        errorResponse.code = err.code;
    }

    res.status(statusCode).json(errorResponse);
}

/**
 * CSV parsing error handler
 * @param {Error} err - CSV parsing error
 * @param {Object} res - Express response object
 */
function handleCSVError(err, res) {
    console.error("CSV parsing failed:", err.message);

    const errorResponse = {
        success: false,
        error: "CSV parsing failed",
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === "development") {
        errorResponse.details = err.message;
    } else {
        errorResponse.details = "Invalid CSV format or corrupted file";
    }

    res.status(400).json(errorResponse);
}

/**
 * Request validation error handler
 * @param {string} message - Validation error message
 * @param {Object} res - Express response object
 * @param {Object} details - Additional validation details
 */
function handleValidationError(message, res, details = null) {
    console.warn("Validation error:", message, details || "");

    const errorResponse = {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    };

    if (details && (process.env.NODE_ENV === "development" || typeof details === "string")) {
        errorResponse.details = details;
    }

    res.status(400).json(errorResponse);
}

module.exports = {
    globalErrorHandler,
    notFoundHandler,
    formatDatabaseError,
    formatValidationError,
    asyncErrorHandler,
    handleDatabaseError,
    handleFileError,
    handleCSVError,
    handleValidationError
};