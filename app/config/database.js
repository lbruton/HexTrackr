/**
 * Database Configuration Module
 *
 * Extracted from server.js to centralize database configuration settings.
 * This module provides SQLite database configuration, connection options,
 * schema versioning, and environment-based settings for HexTrackr.
 *
 * @author HexTrackr Team
 * @version 1.0.0
 */

const path = require("path");

/**
 * Database configuration object containing all database-related settings
 * @type {Object}
 */
const databaseConfig = {
    /**
     * Database file path configuration
     * @type {Object}
     */
    path: {
        /**
         * Relative path to database file from server.js
         * @type {string}
         */
        relative: "data/hextrackr.db",

        /**
         * Absolute path to database file (calculated at runtime)
         * @type {string}
         */
        absolute: path.join(__dirname, "..", "public", "data", "hextrackr.db"),

        /**
         * Directory containing the database file
         * @type {string}
         */
        dataDirectory: "data"
    },

    /**
     * SQLite database connection options
     * @type {Object}
     */
    options: {
        /**
         * Enable verbose mode for detailed logging
         * @type {boolean}
         */
        verbose: true,

        /**
         * Database mode (OPEN_READWRITE | OPEN_CREATE)
         * @type {number}
         */
        mode: null, // Let sqlite3 use default mode

        /**
         * Connection timeout in milliseconds
         * @type {number}
         */
        timeout: 30000,

        /**
         * Enable foreign key constraints
         * @type {boolean}
         */
        foreignKeys: true,

        /**
         * WAL (Write-Ahead Logging) mode for better concurrency
         * @type {boolean}
         */
        walMode: true,

        /**
         * Synchronous mode setting
         * @type {string}
         */
        synchronous: "NORMAL",

        /**
         * Cache size in pages (negative value means KB)
         * @type {number}
         */
        cacheSize: -64000 // 64MB cache
    },

    /**
     * Connection pool settings (simulated for SQLite)
     * @type {Object}
     */
    pool: {
        /**
         * Maximum number of concurrent connections
         * Note: SQLite handles this internally, but useful for monitoring
         * @type {number}
         */
        max: 1,

        /**
         * Minimum number of connections to maintain
         * @type {number}
         */
        min: 1,

        /**
         * Connection idle timeout in milliseconds
         * @type {number}
         */
        idleTimeoutMillis: 300000, // 5 minutes

        /**
         * Maximum time to wait for connection in milliseconds
         * @type {number}
         */
        acquireTimeoutMillis: 60000 // 1 minute
    },

    /**
     * Schema version management and migration settings
     * @type {Object}
     */
    schema: {
        /**
         * Current schema version
         * @type {string}
         */
        version: "1.0.14",

        /**
         * Target schema version for migrations
         * @type {string}
         */
        targetVersion: "1.0.15",

        /**
         * Enable automatic schema migrations on startup
         * @type {boolean}
         */
        autoMigrate: true,

        /**
         * Backup database before schema changes
         * @type {boolean}
         */
        backupBeforeMigration: true,

        /**
         * Core tables that should exist
         * @type {Array<string>}
         */
        coreTables: [
            "tickets",
            "vulnerability_imports",
            "vulnerabilities",
            "ticket_vulnerabilities",
            "vulnerability_snapshots",
            "vulnerabilities_current",
            "vulnerability_daily_totals",
            "vulnerability_staging"
        ],

        /**
         * Performance indexes that should exist
         * @type {Array<string>}
         */
        performanceIndexes: [
            "idx_vulnerabilities_hostname",
            "idx_vulnerabilities_severity",
            "idx_vulnerabilities_cve",
            "idx_vulnerabilities_import",
            "idx_ticket_vulns_ticket",
            "idx_snapshots_scan_date",
            "idx_snapshots_hostname",
            "idx_snapshots_severity",
            "idx_current_unique_key",
            "idx_current_scan_date",
            "idx_current_enhanced_unique_key",
            "idx_current_lifecycle_scan",
            "idx_snapshots_enhanced_key",
            "idx_current_confidence_tier",
            "idx_current_active_severity",
            "idx_current_resolved_date",
            "idx_staging_import_id",
            "idx_staging_processed",
            "idx_staging_batch_id",
            "idx_staging_unprocessed_batch"
        ]
    },

    /**
     * Performance and optimization settings
     * @type {Object}
     */
    performance: {
        /**
         * Batch size for bulk insert operations
         * @type {number}
         */
        batchSize: 1000,

        /**
         * Maximum memory usage for import operations (MB)
         * @type {number}
         */
        maxMemoryUsageMB: 512,

        /**
         * Enable transaction wrapping for bulk operations
         * @type {boolean}
         */
        useTransactions: true,

        /**
         * Progress reporting interval for large operations
         * @type {number}
         */
        progressReportInterval: 1000,

        /**
         * Maximum number of rows to process in memory
         * @type {number}
         */
        maxRowsInMemory: 50000
    },

    /**
     * Environment-specific configuration
     * @type {Object}
     */
    environment: {
        /**
         * Development environment settings
         * @type {Object}
         */
        development: {
            verbose: true,
            enableQueryLogging: true,
            backupOnStartup: false,
            validateSchema: true
        },

        /**
         * Production environment settings
         * @type {Object}
         */
        production: {
            verbose: false,
            enableQueryLogging: false,
            backupOnStartup: true,
            validateSchema: true
        },

        /**
         * Test environment settings
         * @type {Object}
         */
        test: {
            verbose: false,
            enableQueryLogging: false,
            backupOnStartup: false,
            validateSchema: false,
            // Use in-memory database for tests
            useMemoryDatabase: true
        }
    },

    /**
     * Security and validation settings
     * @type {Object}
     */
    security: {
        /**
         * Enable path validation for all database file operations
         * @type {boolean}
         */
        enablePathValidation: true,

        /**
         * Maximum file size for CSV imports (bytes)
         * @type {number}
         */
        maxImportFileSize: 100 * 1024 * 1024, // 100MB

        /**
         * Allowed file extensions for imports
         * @type {Array<string>}
         */
        allowedImportExtensions: [".csv"],

        /**
         * Enable SQL injection protection
         * @type {boolean}
         */
        preventSqlInjection: true
    },

    /**
     * Backup and maintenance settings
     * @type {Object}
     */
    maintenance: {
        /**
         * Automatic backup schedule (hours between backups)
         * @type {number}
         */
        autoBackupIntervalHours: 24,

        /**
         * Number of backup files to retain
         * @type {number}
         */
        backupRetentionCount: 7,

        /**
         * Enable automatic VACUUM operation
         * @type {boolean}
         */
        enableAutoVacuum: true,

        /**
         * VACUUM operation schedule (days between operations)
         * @type {number}
         */
        vacuumIntervalDays: 7,

        /**
         * Analyze statistics schedule (days between operations)
         * @type {number}
         */
        analyzeIntervalDays: 1
    }
};

/**
 * Get environment-specific database configuration
 * @param {string} env - Environment name (development, production, test)
 * @returns {Object} Merged configuration for the specified environment
 */
function getEnvironmentConfig(env = process.env.NODE_ENV || "development") {
    const baseConfig = { ...databaseConfig };
    const envConfig = databaseConfig.environment[env] || databaseConfig.environment.development;

    // Merge environment-specific settings with base config
    return {
        ...baseConfig,
        options: {
            ...baseConfig.options,
            verbose: envConfig.verbose,
            enableQueryLogging: envConfig.enableQueryLogging
        },
        maintenance: {
            ...baseConfig.maintenance,
            backupOnStartup: envConfig.backupOnStartup
        },
        schema: {
            ...baseConfig.schema,
            validateSchema: envConfig.validateSchema
        },
        // Override database path for test environment
        path: envConfig.useMemoryDatabase ? {
            ...baseConfig.path,
            absolute: ":memory:",
            relative: ":memory:"
        } : baseConfig.path
    };
}

/**
 * Get PRAGMA statements for database optimization
 * @param {Object} config - Database configuration object
 * @returns {Array<string>} Array of PRAGMA statements
 */
function getPragmaStatements(config = databaseConfig) {
    const pragmas = [];

    if (config.options.foreignKeys) {
        pragmas.push("PRAGMA foreign_keys = ON");
    }

    if (config.options.walMode) {
        pragmas.push("PRAGMA journal_mode = WAL");
    }

    if (config.options.synchronous) {
        pragmas.push(`PRAGMA synchronous = ${config.options.synchronous}`);
    }

    if (config.options.cacheSize) {
        pragmas.push(`PRAGMA cache_size = ${config.options.cacheSize}`);
    }

    return pragmas;
}

/**
 * Validate database configuration
 * @param {Object} config - Configuration object to validate
 * @returns {Array<string>} Array of validation errors (empty if valid)
 */
function validateConfig(config = databaseConfig) {
    const errors = [];

    if (!config.path || !config.path.relative) {
        errors.push("Database path configuration is missing");
    }

    if (!config.schema || !config.schema.version) {
        errors.push("Schema version is required");
    }

    if (config.performance && config.performance.batchSize < 1) {
        errors.push("Batch size must be greater than 0");
    }

    if (config.security && config.security.maxImportFileSize < 1024) {
        errors.push("Maximum import file size is too small");
    }

    return errors;
}

module.exports = {
    // Export the main configuration object
    config: databaseConfig,

    // Export utility functions
    getEnvironmentConfig,
    getPragmaStatements,
    validateConfig,

    // Export commonly used values for convenience
    DATABASE_PATH: databaseConfig.path.relative,
    SCHEMA_VERSION: databaseConfig.schema.version,
    BATCH_SIZE: databaseConfig.performance.batchSize,
    MAX_IMPORT_SIZE: databaseConfig.security.maxImportFileSize
};