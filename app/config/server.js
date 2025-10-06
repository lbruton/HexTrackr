/**
 * @fileoverview Server configuration module for HexTrackr
 *
 * Centralizes all server-related configuration settings including:
 * - Port and host binding
 * - Static file serving
 * - API routing
 * - Request limits and timeouts
 * - Environment-specific settings
 *
 * @author HexTrackr Development Team
 * @version 1.0.0
 */

/**
 * Server configuration object
 * @type {Object}
 */
module.exports = {
    /**
     * Server port configuration
     * Supports PORT environment variable with fallback to 8080
     * @type {number}
     */
    port: process.env.PORT || 8080,

    /**
     * Host bind address
     * Set to "0.0.0.0" to accept connections from any IP address
     * @type {string}
     */
    host: "0.0.0.0",

    /**
     * Environment configuration
     * @type {string}
     */
    environment: process.env.NODE_ENV || "development",

    /**
     * Static file serving configuration
     * @type {Object}
     */
    static: {
        /**
         * Main static file root directory
         * @type {string}
         */
        root: "app/public",

        /**
         * Static file serving options
         * @type {Object}
         */
        options: {
            maxAge: "1m", // Short cache for development
            etag: true,
            lastModified: true
        },

        /**
         * Documentation static files configuration
         * @type {Object}
         */
        docs: {
            /**
             * Documentation root path
             * @type {string}
             */
            path: "/docs-html",

            /**
             * Documentation directory
             * @type {string}
             */
            directory: "docs-html",

            /**
             * Documentation static options
             * @type {Object}
             */
            options: {
                maxAge: "1m",
                etag: true,
                lastModified: true
            }
        }
    },

    /**
     * API routing configuration
     * @type {Object}
     */
    api: {
        /**
         * Base API prefix for all API routes
         * @type {string}
         */
        prefix: "/api",

        /**
         * API version (for future versioning)
         * @type {string}
         */
        version: "v1"
    },

    /**
     * Request size limits
     * @type {Object}
     */
    limits: {
        /**
         * JSON request body size limit
         * @type {string}
         */
        json: "100mb",

        /**
         * URL-encoded request body size limit
         * @type {string}
         */
        urlencoded: "100mb",

        /**
         * File upload size limit in bytes
         * @type {number}
         */
        fileUpload: 100 * 1024 * 1024, // 100MB

        /**
         * Request rate limiting configuration
         * @type {Object}
         */
        rateLimit: {
            /**
             * Time window in milliseconds
             * @type {number}
             */
            windowMs: 15 * 60 * 1000, // 15 minutes

            /**
             * Maximum requests per window
             * @type {number}
             */
            max: 1000, // Increased from 100 - allows ~33 requests/min (reasonable for single user + API calls)

            /**
             * Rate limit message
             * @type {string}
             */
            message: "Too many requests from this IP, please try again later.",

            /**
             * Include standard headers
             * @type {boolean}
             */
            standardHeaders: true,

            /**
             * Disable legacy headers
             * @type {boolean}
             */
            legacyHeaders: false
        }
    },

    /**
     * CORS (Cross-Origin Resource Sharing) configuration
     * @type {Object}
     */
    cors: {
        /**
         * Allowed origins for CORS requests
         * @type {string[]}
         */
        origin: ["http://localhost:8080", "http://127.0.0.1:8080"],

        /**
         * Allowed HTTP methods
         * @type {string[]}
         */
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

        /**
         * Allowed request headers
         * @type {string[]}
         */
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],

        /**
         * Enable credentials in CORS requests
         * @type {boolean}
         */
        credentials: true
    },

    /**
     * Security headers configuration
     * @type {Object}
     */
    security: {
        /**
         * X-Content-Type-Options header
         * @type {string}
         */
        contentTypeOptions: "nosniff",

        /**
         * X-Frame-Options header
         * @type {string}
         */
        frameOptions: "DENY",

        /**
         * X-XSS-Protection header
         * @type {string}
         */
        xssProtection: "1; mode=block"
    },

    /**
     * File upload configuration
     * @type {Object}
     */
    upload: {
        /**
         * Upload destination directory
         * @type {string}
         */
        destination: "uploads/",

        /**
         * Upload limits
         * @type {Object}
         */
        limits: {
            /**
             * Maximum file size in bytes
             * @type {number}
             */
            fileSize: 100 * 1024 * 1024 // 100MB limit
        }
    },

    /**
     * Server timeouts and performance settings
     * @type {Object}
     */
    timeouts: {
        /**
         * Keep-alive timeout (not currently set in server.js)
         * @type {number}
         */
        keepAlive: 65000, // 65 seconds

        /**
         * Headers timeout (not currently set in server.js)
         * @type {number}
         */
        headersTimeout: 66000 // 66 seconds (should be > keepAlive)
    },

    /**
     * Database configuration
     * @type {Object}
     */
    database: {
        /**
         * Database file path relative to server root
         * @type {string}
         */
        path: "data/hextrackr.db"
    },

    /**
     * Compression middleware configuration
     * @type {Object}
     */
    compression: {
        /**
         * Enable compression
         * @type {boolean}
         */
        enabled: true
    },

    /**
     * Health check endpoint configuration
     * @type {Object}
     */
    health: {
        /**
         * Health check endpoint path
         * @type {string}
         */
        endpoint: "/health"
    }
};