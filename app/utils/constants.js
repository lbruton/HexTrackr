/**
 * HexTrackr Constants Configuration
 * Centralized constants for the HexTrackr vulnerability management system
 */

// ================================
// Network Configuration
// ================================

const PORT = process.env.PORT || 8080;
const WEBSOCKET_PORT = 8988; // Planned WebSocket port

// CORS Origins - Dynamic HTTPS-only configuration
const CORS_ORIGINS = function(origin, callback) {
    // Allow same-origin requests (no origin header)
    if (!origin) return callback(null, true);

    // Allow any HTTPS connection
    if (origin.startsWith("https://")) {
        return callback(null, true);
    }

    // Reject all HTTP connections
    callback(new Error("Only HTTPS connections allowed"));
};
const CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
const CORS_HEADERS = ["Content-Type", "Authorization", "X-Requested-With"];

// WebSocket Configuration
const WEBSOCKET_PING_TIMEOUT = 60000; // 60 seconds
const WEBSOCKET_PING_INTERVAL = 25000; // 25 seconds

// ================================
// File System Configuration
// ================================

const UPLOADS_DIRECTORY = "uploads/";
const DATA_DIRECTORY = "data";
const BACKUPS_DIRECTORY = "backups/";
const DATABASE_FILENAME = "hextrackr.db";

// ================================
// File Size Limits
// ================================

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
const EXPRESS_JSON_LIMIT = "100mb";
const EXPRESS_URLENCODED_LIMIT = "100mb";

// ================================
// Rate Limiting Configuration
// ================================

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window
const RATE_LIMIT_MESSAGE = "Too many requests from this IP, please try again later.";

// ================================
// Security Headers
// ================================

const SECURITY_HEADERS = {
    X_CONTENT_TYPE_OPTIONS: "nosniff",
    X_FRAME_OPTIONS: "DENY",
    X_XSS_PROTECTION: "1; mode=block"
};

// ================================
// Progress Tracking Configuration
// ================================

const PROGRESS_THROTTLE_INTERVAL = 100; // milliseconds between progress events
const SESSION_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
const STALE_SESSION_THRESHOLD = 60 * 60 * 1000; // 1 hour
const ERROR_SESSION_RETENTION = 10000; // Keep error sessions for 10 seconds

// ================================
// Database Processing Configuration
// ================================

const BATCH_SIZE = 1000; // Rows to process at a time
const PROGRESS_UPDATE_INTERVAL = 100; // Update progress every N records
const DESCRIPTION_TRUNCATE_LENGTH = 100; // Characters to truncate for uniqueness
const DATABASE_EXPORT_LIMIT = 10000; // Max records to export
const BACKUP_STATS_LIMIT = 100; // Limit for backup statistics queries

// ================================
// Performance Monitoring
// ================================

const PERFORMANCE_LOG_INTERVAL = 100; // Log performance every N rows
const MIGRATION_DELAY = 1000; // Delay for migration operations (milliseconds)

// ================================
// API Endpoints
// ================================

const API_ENDPOINTS = {
    // Base paths
    API_BASE: "/api/",
    HEALTH: "/health",
    ROOT: "/",

    // Vulnerability endpoints
    VULNERABILITIES_STATS: "/api/vulnerabilities/stats",
    VULNERABILITIES_RECENT_TRENDS: "/api/vulnerabilities/recent-trends",
    VULNERABILITIES_TRENDS: "/api/vulnerabilities/trends",
    VULNERABILITIES: "/api/vulnerabilities",
    VULNERABILITIES_RESOLVED: "/api/vulnerabilities/resolved",
    VULNERABILITIES_IMPORT: "/api/vulnerabilities/import",
    VULNERABILITIES_IMPORT_STAGING: "/api/vulnerabilities/import-staging",
    VULNERABILITIES_CLEAR: "/api/vulnerabilities/clear",

    // Import endpoints
    IMPORTS: "/api/imports",
    IMPORT_TICKETS: "/api/import/tickets",
    IMPORT_VULNERABILITIES: "/api/import/vulnerabilities",

    // Documentation endpoints
    DOCS_STATS: "/api/docs/stats",

    // Backup endpoints
    BACKUP_CLEAR: "/api/backup/clear/:type",
    BACKUP_STATS: "/api/backup/stats",
    BACKUP_VULNERABILITIES: "/api/backup/vulnerabilities",
    BACKUP_TICKETS: "/api/backup/tickets",
    BACKUP_ALL: "/api/backup/all",

    // Ticket endpoints
    TICKETS: "/api/tickets",
    TICKETS_ID: "/api/tickets/:id",
    TICKETS_MIGRATE: "/api/tickets/migrate",

    // Utility endpoints
    SITES: "/api/sites",
    LOCATIONS: "/api/locations",
    RESTORE: "/api/restore"
};

// ================================
// Database Query Limits
// ================================

const DATABASE_LIMITS = {
    RECENT_TRENDS_LIMIT: 2,
    BACKUP_QUERY_LIMIT: 100,
    VULNERABILITY_EXPORT_LIMIT: 10000,
    TICKET_EXPORT_LIMIT: 10000
};

// ================================
// Time Intervals
// ================================

const TIME_INTERVALS = {
    FIFTEEN_MINUTES: 15 * 60 * 1000,
    THIRTY_MINUTES: 30 * 60 * 1000,
    ONE_HOUR: 60 * 60 * 1000,
    ONE_SECOND: 1000,
    TEN_SECONDS: 10000
};

// ================================
// File Processing Configuration
// ================================

const FILE_PROCESSING = {
    CSV_IMPORT_OPERATION: "csv-import",
    WEB_UPLOAD_FILENAME: "web-upload.csv",
    WEB_IMPORT_SOURCE: "web-import",
    PERCENTAGE_PRECISION: 100 // For Math.round calculations (e.g., VPR * 100 / 100)
};

// ================================
// Documentation Sections
// ================================

const DOCUMENTATION_SECTIONS = [
    "architecture/index",
    "architecture/backend",
    "architecture/database",
    "architecture/deployment"
];

// Export all constants
module.exports = {
    // Network
    PORT,
    WEBSOCKET_PORT,
    CORS_ORIGINS,
    CORS_METHODS,
    CORS_HEADERS,
    WEBSOCKET_PING_TIMEOUT,
    WEBSOCKET_PING_INTERVAL,

    // File System
    UPLOADS_DIRECTORY,
    DATA_DIRECTORY,
    BACKUPS_DIRECTORY,
    DATABASE_FILENAME,

    // Limits
    MAX_FILE_SIZE,
    EXPRESS_JSON_LIMIT,
    EXPRESS_URLENCODED_LIMIT,

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_MESSAGE,

    // Security
    SECURITY_HEADERS,

    // Progress Tracking
    PROGRESS_THROTTLE_INTERVAL,
    SESSION_CLEANUP_INTERVAL,
    STALE_SESSION_THRESHOLD,
    ERROR_SESSION_RETENTION,

    // Database Processing
    BATCH_SIZE,
    PROGRESS_UPDATE_INTERVAL,
    DESCRIPTION_TRUNCATE_LENGTH,
    DATABASE_EXPORT_LIMIT,
    BACKUP_STATS_LIMIT,

    // Performance
    PERFORMANCE_LOG_INTERVAL,
    MIGRATION_DELAY,

    // API Endpoints
    API_ENDPOINTS,

    // Database Limits
    DATABASE_LIMITS,

    // Time Intervals
    TIME_INTERVALS,

    // File Processing
    FILE_PROCESSING,

    // Documentation
    DOCUMENTATION_SECTIONS
};