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
    constructor() {
        this.currentLogLevel = this.determineLogLevel();
        this.requestStats = new Map();
    }

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

    shouldLog(level) {
        return level <= this.currentLogLevel;
    }

    formatTimestamp() {
        return new Date().toISOString();
    }

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

    error(message, data = null, requestId = null) {
        if (this.shouldLog(LOG_LEVELS.ERROR)) {
            console.error(this.formatMessage(LOG_LEVELS.ERROR, message, data, requestId));
        }
    }

    warn(message, data = null, requestId = null) {
        if (this.shouldLog(LOG_LEVELS.WARN)) {
            console.warn(this.formatMessage(LOG_LEVELS.WARN, message, data, requestId));
        }
    }

    info(message, data = null, requestId = null) {
        if (this.shouldLog(LOG_LEVELS.INFO)) {
            console.log(this.formatMessage(LOG_LEVELS.INFO, message, data, requestId));
        }
    }

    debug(message, data = null, requestId = null) {
        if (this.shouldLog(LOG_LEVELS.DEBUG)) {
            console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, data, requestId));
        }
    }

    // Performance timing utilities
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

    // Database operation logging
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

    // Batch operation progress logging
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

    // Import/Export operation logging
    logImportProgress(phase, stats, requestId = null) {
        const logData = {
            phase,
            ...stats
        };

        this.info(`Import progress: ${phase}`, logData, requestId);
    }

    logImportCompletion(operation, finalStats, duration, requestId = null) {
        const logData = {
            operation,
            totalDuration: `${duration}ms`,
            ...finalStats
        };

        this.info(`Import completed: ${operation}`, logData, requestId);
    }

    // Memory usage logging
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

    // Performance summary logging
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
function errorLoggingMiddleware(err, req, res, next) {
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