/**
 * Logging Middleware for HexTrackr
 *
 * Provides structured logging with request tracking, performance monitoring,
 * and environment-appropriate log levels.
 */

const crypto = require("crypto");

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

class LoggingManager {
    /**
     * Creates an instance of LoggingManager.
     */
    constructor() {
        this.currentLogLevel = this.determineLogLevel();
        this.requestStats = new Map();
    }

    /**
     * Determines the log level based on the current environment.
     * @returns {number} The log level.
     */
    determineLogLevel() {
        const env = process.env.NODE_ENV || "development";
        switch (env) {
            case "production":
                return LOG_LEVELS.WARN;
            case "test":
                return LOG_LEVELS.ERROR;
            default:
                return LOG_LEVELS.DEBUG;
        }
    }

    /**
     * Checks if a log level should be logged.
     * @param {number} level - The log level to check.
     * @returns {boolean} True if the log level should be logged, false otherwise.
     */
    shouldLog(level) {
        return level <= this.currentLogLevel;
    }

    /**
     * Formats the timestamp for a log message.
     * @returns {string} The formatted timestamp.
     */
    formatTimestamp() {
        return new Date().toISOString();
    }

    /**
     * Formats a log message.
     * @param {number} level - The log level.
     * @param {string} message - The log message.
     * @param {object} [data=null] - Additional data to log.
     * @param {string} [requestId=null] - The request ID.
     * @returns {string} The formatted log message.
     */
    formatMessage(level, message, data = null, requestId = null) {
        const timestamp = this.formatTimestamp();
        const levelName = Object.keys(LOG_LEVELS)[level];

        let formatted = `[${timestamp}] ${levelName}`;

        if (requestId) {
            formatted += ` [${requestId}]`;
        }

        formatted += `: ${message}`;

        if (data && this.shouldLog(LOG_LEVELS.DEBUG)) {
            formatted += ` ${JSON.stringify(data)}`;
        }

        return formatted;
    }

    /**
     * Logs an error message.
     * @param {string} message - The error message.
     * @param {object} [data=null] - Additional data to log.
     * @param {string} [requestId=null] - The request ID.
     */
    error(message, data = null, requestId = null) {
        if (this.shouldLog(LOG_LEVELS.ERROR)) {
            console.error(this.formatMessage(LOG_LEVELS.ERROR, message, data, requestId));
        }
    }

    /**
     * Logs a warning message.
     * @param {string} message - The warning message.
     * @param {object} [data=null] - Additional data to log.
     * @param {string} [requestId=null] - The request ID.
     */
    warn(message, data = null, requestId = null) {
        if (this.shouldLog(LOG_LEVELS.WARN)) {
            console.warn(this.formatMessage(LOG_LEVELS.WARN, message, data, requestId));
        }
    }

    /**
     * Logs an info message.
     * @param {string} message - The info message.
     * @param {object} [data=null] - Additional data to log.
     * @param {string} [requestId=null] - The request ID.
     */
    info(message, data = null, requestId = null) {
        if (this.shouldLog(LOG_LEVELS.INFO)) {
            console.log(this.formatMessage(LOG_LEVELS.INFO, message, data, requestId));
        }
    }

    /**
     * Logs a debug message.
     * @param {string} message - The debug message.
     * @param {object} [data=null] - Additional data to log.
     * @param {string} [requestId=null] - The request ID.
     */
    debug(message, data = null, requestId = null) {
        if (this.shouldLog(LOG_LEVELS.DEBUG)) {
            console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, data, requestId));
        }
    }

    /**
     * Starts a timer for performance monitoring.
     * @param {string} operation - The name of the operation to time.
     * @param {string} [requestId=null] - The request ID.
     * @returns {string} The timer ID.
     */
    startTimer(operation, requestId = null) {
        const timerId = `${operation}_${Date.now()}_${Math.random()}`;
        const timer = {
            operation,
            startTime: Date.now(),
            requestId
        };

        this.requestStats.set(timerId, timer);
        this.debug(`Started operation: ${operation}`, null, requestId);

        return timerId;
    }

    /**
     * Ends a timer and logs the duration.
     * @param {string} timerId - The ID of the timer to end.
     * @param {object} [additionalData=null] - Additional data to log.
     * @returns {number|null} The duration of the timer in milliseconds, or null if the timer was not found.
     */
    endTimer(timerId, additionalData = null) {
        const timer = this.requestStats.get(timerId);
        if (!timer) {
            this.warn(`Timer not found: ${timerId}`);
            return null;
        }

        const duration = Date.now() - timer.startTime;
        const logData = {
            operation: timer.operation,
            duration: `${duration}ms`,
            ...additionalData
        };

        this.requestStats.delete(timerId);

        if (duration > 1000) {
            this.warn(`Slow operation completed: ${timer.operation}`, logData, timer.requestId);
        } else {
            this.debug(`Operation completed: ${timer.operation}`, logData, timer.requestId);
        }

        return duration;
    }

    /**
     * Logs a database operation.
     * @param {string} operation - The name of the database operation.
     * @param {string} query - The SQL query.
     * @param {number} duration - The duration of the operation in milliseconds.
     * @param {Error} [error=null] - The error object if the operation failed.
     * @param {string} [requestId=null] - The request ID.
     */
    logDatabaseOperation(operation, query, duration, error = null, requestId = null) {
        const logData = {
            operation,
            duration: `${duration}ms`,
            query: query ? query.substring(0, 100) + (query.length > 100 ? "..." : "") : null
        };

        if (error) {
            this.error(`Database operation failed: ${operation}`, { ...logData, error: error.message }, requestId);
        } else if (duration > 500) {
            this.warn(`Slow database operation: ${operation}`, logData, requestId);
        } else {
            this.debug(`Database operation: ${operation}`, logData, requestId);
        }
    }

    /**
     * Logs the progress of a batch operation.
     * @param {string} operation - The name of the batch operation.
     * @param {number} current - The current number of items processed.
     * @param {number} total - The total number of items to process.
     * @param {object} [additionalStats=null] - Additional statistics to log.
     * @param {string} [requestId=null] - The request ID.
     */
    logBatchProgress(operation, current, total, additionalStats = null, requestId = null) {
        const percentage = Math.round((current / total) * 100);
        const logData = {
            operation,
            progress: `${current}/${total} (${percentage}%)`,
            ...additionalStats
        };

        // Log every 10% or every 1000 items for large batches
        const shouldLog = percentage % 10 === 0 || current % 1000 === 0 || current === total;

        if (shouldLog) {
            this.info(`Batch progress: ${operation}`, logData, requestId);
        }
    }

    /**
     * Logs the progress of an import operation.
     * @param {string} phase - The current phase of the import.
     * @param {object} stats - Statistics about the import.
     * @param {string} [requestId=null] - The request ID.
     */
    logImportProgress(phase, stats, requestId = null) {
        const logData = {
            phase,
            ...stats
        };

        this.info(`Import progress: ${phase}`, logData, requestId);
    }

    /**
     * Logs the completion of an import operation.
     * @param {string} operation - The name of the import operation.
     * @param {object} finalStats - The final statistics of the import.
     * @param {number} duration - The duration of the import in milliseconds.
     * @param {string} [requestId=null] - The request ID.
     */
    logImportCompletion(operation, finalStats, duration, requestId = null) {
        const logData = {
            operation,
            totalDuration: `${duration}ms`,
            ...finalStats
        };

        this.info(`Import completed: ${operation}`, logData, requestId);
    }

    /**
     * Logs the current memory usage.
     * @param {string} operation - The name of the operation.
     * @param {string} [requestId=null] - The request ID.
     */
    logMemoryUsage(operation, requestId = null) {
        const memUsage = process.memoryUsage();
        const logData = {
            operation,
            heap: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        };

        this.debug(`Memory usage: ${operation}`, logData, requestId);
    }

    /**
     * Logs a performance summary.
     * @param {string} operation - The name of the operation.
     * @param {object} stats - The performance statistics.
     * @param {string} [requestId=null] - The request ID.
     */
    logPerformanceSummary(operation, stats, requestId = null) {
        const summary = {
            operation,
            ...stats
        };

        this.info(`Performance summary: ${operation}`, summary, requestId);
    }
}

// Singleton instance
const logger = new LoggingManager();

/**
 * Request logging middleware
 * Logs incoming requests with unique ID and response times
 */
function requestLoggingMiddleware(req, res, next) {
    // Generate unique request ID
    const requestId = crypto.randomBytes(8).toString("hex");
    req.requestId = requestId;

    const startTime = Date.now();
    const method = req.method;
    const url = req.url;
    const userAgent = req.get("User-Agent") || "unknown";
    const ip = req.ip || req.connection.remoteAddress || "unknown";

    // Log incoming request
    logger.info(`${method} ${url}`, {
        ip,
        userAgent: userAgent.substring(0, 100)
    }, requestId);

    // Track response
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const contentLength = res.get("content-length") || 0;

        const responseData = {
            statusCode,
            duration: `${duration}ms`,
            contentLength: `${contentLength} bytes`
        };

        if (statusCode >= 400) {
            logger.warn(`${method} ${url} - ${statusCode}`, responseData, requestId);
        } else if (duration > 2000) {
            logger.warn(`Slow request: ${method} ${url}`, responseData, requestId);
        } else {
            logger.debug(`${method} ${url} - ${statusCode}`, responseData, requestId);
        }
    });

    next();
}

/**
 * Error logging middleware
 * Logs uncaught errors with request context
 */
function errorLoggingMiddleware(err, req, res, _next) {
    const requestId = req.requestId || "unknown";

    logger.error("Unhandled request error", {
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        method: req.method,
        url: req.url,
        body: process.env.NODE_ENV === "development" ? req.body : undefined
    }, requestId);

    // Don't call next() to prevent default Express error handler
    if (!res.headersSent) {
        res.status(500).json({
            success: false,
            error: "Internal server error",
            requestId
        });
    }
}

/**
 * API response logging wrapper
 * Standardizes API response logging
 */
function logApiResponse(req, res, operation, result, error = null) {
    const requestId = req.requestId || "unknown";

    if (error) {
        logger.error(`API operation failed: ${operation}`, {
            error: error.message,
            method: req.method,
            url: req.url
        }, requestId);
    } else {
        logger.debug(`API operation success: ${operation}`, {
            method: req.method,
            url: req.url,
            resultSize: typeof result === "object" ? Object.keys(result).length : "scalar"
        }, requestId);
    }
}

/**
 * Server startup logging
 */
function logServerStartup(port, features = []) {
    logger.info("🚀 HexTrackr server starting", {
        port,
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
        features
    });
}

/**
 * Server ready logging
 */
function logServerReady(port, endpoints = []) {
    logger.info("✅ HexTrackr server ready", {
        url: `http://localhost:${port}`,
        endpoints
    });
}

module.exports = {
    logger,
    requestLoggingMiddleware,
    errorLoggingMiddleware,
    logApiResponse,
    logServerStartup,
    logServerReady,
    LOG_LEVELS
};