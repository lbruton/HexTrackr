/**
 * HexTrackr Middleware Configuration
 * Centralized middleware configuration for the monolithic Express.js server
 *
 * This module extracts and organizes all middleware configurations from server.js
 * to provide a single source of truth for CORS, rate limiting, body parsing,
 * file uploads, security headers, and compression settings.
 *
 * @author HexTrackr Development Team
 * @version 1.0.0
 */

const {
    CORS_ORIGINS,
    CORS_METHODS,
    CORS_HEADERS,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_MESSAGE,
    EXPRESS_JSON_LIMIT,
    EXPRESS_URLENCODED_LIMIT,
    UPLOADS_DIRECTORY,
    MAX_FILE_SIZE,
    SECURITY_HEADERS
} = require("../utils/constants");

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * Configures which origins, methods, and headers are allowed for cross-origin requests
 */
const cors = {
    origin: CORS_ORIGINS,
    methods: CORS_METHODS,
    allowedHeaders: CORS_HEADERS,
    credentials: true
};

/**
 * Rate Limiting Configuration
 * DoS protection by limiting requests per IP address within a time window
 */
const rateLimit = {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUESTS,
    message: RATE_LIMIT_MESSAGE,
    standardHeaders: true,
    legacyHeaders: false
};

/**
 * Body Parser Configuration
 * Settings for parsing JSON and URL-encoded request bodies
 */
const bodyParser = {
    json: {
        limit: EXPRESS_JSON_LIMIT
    },
    urlencoded: {
        limit: EXPRESS_URLENCODED_LIMIT,
        extended: true
    }
};

/**
 * File Upload Configuration (Multer)
 * Settings for handling CSV file uploads and processing
 */
const upload = {
    dest: UPLOADS_DIRECTORY,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: (req, file, cb) => {
        // Only allow CSV files for vulnerability imports
        if (file.mimetype !== "text/csv") {
            return cb(new Error("Only CSV files are allowed"), false);
        }
        cb(null, true);
    }
};

/**
 * Security Headers Configuration
 * HTTP security headers to protect against common web vulnerabilities
 */
const security = {
    headers: {
        "X-Content-Type-Options": SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS,
        "X-Frame-Options": SECURITY_HEADERS.X_FRAME_OPTIONS,
        "X-XSS-Protection": SECURITY_HEADERS.X_XSS_PROTECTION
    }
};

/**
 * Compression Configuration
 * Settings for compressing HTTP responses to reduce bandwidth usage
 */
const compression = {
    // Use default compression settings
    // Can be expanded with specific options if needed:
    // threshold: 1024,    // Only compress responses larger than 1024 bytes
    // level: 6,           // Compression level (1-9, where 9 is most compressed)
    // chunkSize: 16 * 1024 // Chunk size for compression
};

/**
 * WebSocket Configuration
 * CORS settings for Socket.io WebSocket connections
 */
const websocket = {
    cors: {
        origin: CORS_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true
    }
};

/**
 * Export all middleware configurations
 * These configurations are used by the monolithic server.js to set up Express middleware
 */
module.exports = {
    cors,
    rateLimit,
    bodyParser,
    upload,
    security,
    compression,
    websocket
};