/**
 * HexTrackr Security Middleware
 * Centralized security middleware for the monolithic Express.js server
 *
 * This module extracts all security-related middleware from server.js including:
 * - CORS configuration and setup
 * - Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
 * - Rate limiting configuration for DoS protection
 * - PathValidator class for secure file operations
 * - Request sanitization and validation middleware
 *
 * @author HexTrackr Development Team
 * @version 1.0.0
 */

const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

// LoggingService is available via global.logger (initialized in server.js)

// Import security configuration from constants
const {
    CORS_ORIGINS,
    CORS_METHODS,
    CORS_HEADERS,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_MESSAGE,
    SECURITY_HEADERS
} = require("../utils/constants");

/**
 * PathValidator - Security utility for path validation
 * Prevents path traversal attacks and ensures safe file operations
 */
class PathValidator {
    /**
     * Validates and normalizes file paths to prevent path traversal
     * @param {string} filePath - The file path to validate
     * @returns {string} - The validated and normalized path
     * @throws {Error} - If path is invalid or contains traversal attempts
     */
    static validatePath(filePath) {
        if (!filePath || typeof filePath !== "string") {
            throw new Error("Invalid file path");
        }

        const normalizedPath = path.normalize(filePath);

        // Check for path traversal attempts
        if (normalizedPath.includes("../") || normalizedPath.includes("..\\")) {
            throw new Error("Path traversal detected");
        }

        // Validate path components
        const pathComponents = normalizedPath.split(path.sep);
        for (const component of pathComponents) {
            if (component === ".." || (component === "." && pathComponents.length > 1)) {
                throw new Error("Invalid path component");
            }
        }

        return normalizedPath;
    }

    /**
     * Safely reads a file with path validation - prevents path traversal attacks
     * Validates the file path using PathValidator.validatePath() to ensure no directory
     * traversal attempts (../ or ..\\) before delegating to fs.readFileSync().
     * Used throughout HexTrackr for secure file operations (DocsService, BackupService, etc.)
     *
     * @static
     * @param {string} filePath - Absolute or relative file path to read (will be validated and normalized)
     * @param {string|object} [options="utf8"] - File reading options:
     *   - string: Encoding name (e.g., "utf8", "base64", "hex")
     *   - object: Options object passed to fs.readFileSync (encoding, flag)
     * @returns {string|Buffer} File contents as string (if encoding specified) or Buffer (if no encoding)
     * @throws {Error} "Invalid file path" - If filePath is null, undefined, or not a string
     * @throws {Error} "Path traversal detected" - If filePath contains ../ or ..\\ sequences
     * @throws {Error} "Invalid path component" - If normalized path contains suspicious components
     * @throws {SystemError} ENOENT - If file does not exist (from fs.readFileSync)
     * @throws {SystemError} EACCES - If insufficient permissions to read file (from fs.readFileSync)
     * @throws {SystemError} EISDIR - If path is a directory, not a file (from fs.readFileSync)
     *
     * @example
     * // Read UTF-8 text file
     * const content = PathValidator.safeReadFileSync("/app/data/config.json", "utf8");
     *
     * @example
     * // Read binary file as Buffer
     * const buffer = PathValidator.safeReadFileSync("/app/data/image.png");
     *
     * @example
     * // Read with custom options
     * const content = PathValidator.safeReadFileSync("/app/logs/app.log", {
     *     encoding: "utf8",
     *     flag: "r"
     * });
     *
     * @example
     * // Path traversal attempt throws error
     * try {
     *     PathValidator.safeReadFileSync("../../../etc/passwd");
     * } catch (error) {
     *     console.error(error.message); // "Path traversal detected"
     * }
     */
    static safeReadFileSync(filePath, options = "utf8") {
        const validatedPath = this.validatePath(filePath);
        return fs.readFileSync(validatedPath, options);
    }

    /**
     * Safely writes a file with path validation
     * @param {string} filePath - The file path to write
     * @param {string|Buffer} data - Data to write
     * @param {string|object} options - Encoding or options object
     */
    static safeWriteFileSync(filePath, data, options = "utf8") {
        const validatedPath = this.validatePath(filePath);
        return fs.writeFileSync(validatedPath, data, options);
    }

    /**
     * Safely reads a directory with path validation
     * @param {string} dirPath - The directory path to read
     * @param {object} options - Options object
     * @returns {Array} - Directory contents
     */
    static safeReaddirSync(dirPath, options = {}) {
        const validatedPath = this.validatePath(dirPath);
        return fs.readdirSync(validatedPath, options);
    }

    /**
     * Safely gets file stats with path validation
     * @param {string} filePath - The file path to stat
     * @returns {fs.Stats} - File statistics
     */
    static safeStatSync(filePath) {
        const validatedPath = this.validatePath(filePath);
        return fs.statSync(validatedPath);
    }

    /**
     * Safely checks if file exists with path validation
     * @param {string} filePath - The file path to check
     * @returns {boolean} - True if file exists, false otherwise
     */
    static safeExistsSync(filePath) {
        try {
            const validatedPath = this.validatePath(filePath);
            return fs.existsSync(validatedPath);
        } catch {
            return false;
        }
    }

    /**
     * Safely deletes a file with path validation
     * @param {string} filePath - The file path to delete
     */
    static safeUnlinkSync(filePath) {
        const validatedPath = this.validatePath(filePath);
        return fs.unlinkSync(validatedPath);
    }
}

/**
 * CORS Middleware Configuration
 * Configures Cross-Origin Resource Sharing to allow frontend access
 * @returns {Function} - CORS middleware function
 */
function createCorsMiddleware() {
    return cors({
        origin: CORS_ORIGINS,
        methods: CORS_METHODS,
        allowedHeaders: CORS_HEADERS,
        credentials: true
    });
}

/**
 * Rate Limiting Middleware
 * DoS protection by limiting requests per IP address within a time window
 * Cache-aware: Cache HITs don't count toward rate limit (zero server load)
 * @returns {Function} - Rate limiting middleware function
 */
function createRateLimitMiddleware() {
    return rateLimit({
        windowMs: RATE_LIMIT_WINDOW_MS,
        max: RATE_LIMIT_MAX_REQUESTS,
        message: RATE_LIMIT_MESSAGE,
        standardHeaders: true,
        legacyHeaders: false,
        // Trust proxy configuration for nginx reverse proxy
        // Uses the rightmost IP from X-Forwarded-For header
        trust: () => true,
        // Custom rate limit handler with logging
        handler: (req, res) => {
            console.warn(` Rate limit exceeded: ${req.ip} → ${req.method} ${req.path}`);
            res.status(429).json({
                error: "Too many requests from this IP, please try again later",
                retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
            });
        },
        // Skip rate limiting for cache HITs (no server load, unlimited OK)
        skip: (req, res) => {
            // Check if response has X-Cache header indicating cache hit
            const cacheHeader = res.getHeader("X-Cache");
            if (cacheHeader && (cacheHeader.includes("HIT") || cacheHeader.includes("HIT-LARGE-QUERY"))) {
                return true;  // Don't count this request toward limit
            }
            return false;  // Count this request (cache MISS or uncached endpoint)
        }
    });
}

/**
 * Security Headers Middleware
 * Adds essential security headers to all responses
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
function securityHeadersMiddleware(req, res, next) {
    try {
        // Set security headers to protect against common web vulnerabilities
        res.setHeader("X-Content-Type-Options", SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS);
        res.setHeader("X-Frame-Options", SECURITY_HEADERS.X_FRAME_OPTIONS);
        res.setHeader("X-XSS-Protection", SECURITY_HEADERS.X_XSS_PROTECTION);

        next();
    } catch (error) {
        console.error("Security headers middleware error:", error);
        // Continue processing even if header setting fails
        next();
    }
}

/**
 * Request Sanitization Middleware
 * Basic sanitization and validation for incoming requests
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
function requestSanitizationMiddleware(req, res, next) {
    try {
        // Log suspicious activity
        if (req.url.includes("../") || req.url.includes("..\\")) {
            console.warn(`Path traversal attempt detected from IP ${req.ip}: ${req.url}`);
        }

        // Validate Content-Type for POST/PUT requests
        if (["POST", "PUT", "PATCH"].includes(req.method)) {
            const contentType = req.get("Content-Type");
            if (contentType && !contentType.match(/^(application\/json|multipart\/form-data|application\/x-www-form-urlencoded)/)) {
                console.warn(`Suspicious Content-Type from IP ${req.ip}: ${contentType}`);
            }
        }

        next();
    } catch (error) {
        console.error("Request sanitization middleware error:", error);
        next();
    }
}

/**
 * API Security Middleware
 * Additional security measures specifically for API endpoints
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
function apiSecurityMiddleware(req, res, next) {
    try {
        // Add additional API-specific security headers
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        // Log API access for monitoring
        if (req.url.startsWith("/api/") && global.logger) {
            global.logger.info("backend", "api", `API Access: ${req.method} ${req.url} from IP ${req.ip}`);
        }

        next();
    } catch (error) {
        console.error("API security middleware error:", error);
        next();
    }
}

/**
 * Error Handling Middleware for Security
 * Handles security-related errors without exposing sensitive information
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
function securityErrorHandler(err, req, res, next) {
    try {
        // Log security-related errors
        if (err.message.includes("Path traversal") ||
            err.message.includes("Invalid file path") ||
            err.message.includes("Invalid path component")) {
            console.error(`Security Error from IP ${req.ip}:`, err.message);
            return res.status(403).json({
                success: false,
                error: "Forbidden",
                details: "Invalid request"
            });
        }

        // Pass non-security errors to the next error handler
        next(err);
    } catch (handlerError) {
        console.error("Security error handler failed:", handlerError);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

/**
 * Input Validation Middleware
 * Validates common input parameters to prevent injection attacks
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
function inputValidationMiddleware(req, res, next) {
    try {
        // Validate query parameters
        for (const [key, value] of Object.entries(req.query)) {
            if (typeof value === "string") {
                // Check for SQL injection patterns
                if (value.match(/['";<>]/)) {
                    console.warn(`Potential SQL injection attempt from IP ${req.ip}: ${key}=${value}`);
                }

                // Check for XSS patterns
                if (value.match(/<script|javascript:|vbscript:|onload=|onerror=/i)) {
                    console.warn(`Potential XSS attempt from IP ${req.ip}: ${key}=${value}`);
                }
            }
        }

        next();
    } catch (error) {
        console.error("Input validation middleware error:", error);
        next();
    }
}

// Export all security middleware functions and utilities
module.exports = {
    // Security classes
    PathValidator,

    // Middleware creation functions
    createCorsMiddleware,
    createRateLimitMiddleware,

    // Direct middleware functions
    securityHeadersMiddleware,
    requestSanitizationMiddleware,
    apiSecurityMiddleware,
    inputValidationMiddleware,
    securityErrorHandler,

    // Convenience function to apply all security middleware
    applySecurityMiddleware: function(app) {
        // Apply CORS
        app.use(this.createCorsMiddleware());

        // Apply rate limiting to API routes only
        app.use("/api/", this.createRateLimitMiddleware());

        // Apply security headers
        app.use(this.securityHeadersMiddleware);

        // Apply request sanitization
        app.use(this.requestSanitizationMiddleware);

        // Apply API security
        app.use(this.apiSecurityMiddleware);

        // Apply input validation
        app.use(this.inputValidationMiddleware);

        return app;
    }
};