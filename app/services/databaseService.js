/**
 * DatabaseService - Extracted from app/public/server.js lines 12, 1932-3280+
 *
 * This service encapsulates all SQLite database operations from the monolithic server.js,
 * providing connection pooling patterns, transaction management, and common query methods.
 *
 * Key extractions from server.js:
 * - Line 12: const sqlite3 = require("sqlite3").verbose();
 * - Line 1933: const dbPath = path.join(__dirname, "data", "hextrackr.db");
 * - Line 1934: const db = new sqlite3.Database(dbPath);
 * - Lines 2785-3280: Database initialization, schema creation, and operations
 * - Transaction patterns from lines 782-783, 1033-1034, etc.
 * - Error handling patterns throughout server.js database operations
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

class DatabaseService {
    constructor(dbPath) {
        this.dbPath = dbPath || path.join(__dirname, "..", "data", "hextrackr.db");
        this.db = null;
        this.isInitialized = false;
        this.activeTransactions = new Set();

        // Connection pooling simulation for SQLite (maintains single connection)
        this.connectionPool = {
            maxConnections: 1,
            currentConnections: 0,
            queue: []
        };
    }

    /**
     * Safely log to LoggingService if available
     * @param {string} level - Log level (info, warn, error, debug)
     * @param {string} message - Log message
     * @param {Object} data - Additional data to log
     */
    _log(level, message, data = {}) {
        if (global.logger && global.logger.database && typeof global.logger.database[level] === "function") {
            global.logger.database[level](message, data);
        }
    }

    /**
     * Safely create audit log if available
     * @param {string} category - Audit category
     * @param {string} message - Audit message
     * @param {Object} data - Audit data
     */
    _audit(category, message, data = {}) {
        if (global.logger && typeof global.logger.audit === "function") {
            global.logger.audit(category, message, data, null, null);
        }
    }

    /**
     * Initialize database connection and schema
     * Extracted from server.js lines 1934 + 2785-3280
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            try {
                // Ensure data directory exists
                const dataDir = path.dirname(this.dbPath);
                if (!fs.existsSync(dataDir)) {
                    fs.mkdirSync(dataDir, { recursive: true });
                }

                // Create database connection (from server.js line 1934)
                this.db = new sqlite3.Database(this.dbPath, (err) => {
                    if (err) {
                        this._log("error", "Failed to connect to database", {
                            error: err.message,
                            path: this.dbPath
                        });
                        reject(err);
                        return;
                    }

                    this._log("info", "Database connection established", {
                        path: this.dbPath,
                        journalMode: "WAL",  // HEX-280: WAL mode with named volume (not macOS bind mount)
                        cacheSize: "64MB"
                    });
                    this.connectionPool.currentConnections = 1;
                    this.isInitialized = true;

                    // Enable foreign keys and other pragmas (MUST be inside connection callback)
                    this.db.run("PRAGMA foreign_keys = ON");
                    // HEX-280: WAL mode with Docker named volume (isolated from macOS filesystem)
                    // Named volumes don't have fcntl locking issues, WAL allows concurrent reads during writes
                    this.db.run("PRAGMA journal_mode = WAL");
                    this.db.run("PRAGMA synchronous = NORMAL");  // NORMAL is safe with WAL mode
                    this.db.run("PRAGMA busy_timeout = 10000");  // Wait 10s for locks
                    this.db.run("PRAGMA wal_autocheckpoint = 1000");  // Checkpoint every 1000 pages

                    // Performance optimizations for large databases (858MB, 95K+ records)
                    // These pragmas dramatically improve query performance on production hardware
                    this.db.run("PRAGMA cache_size = -64000");      // 64MB cache (default ~2MB) - 32x improvement
                    this.db.run("PRAGMA mmap_size = 268435456");    // 256MB memory-mapped I/O - reduces syscalls
                    this.db.run("PRAGMA temp_store = MEMORY");      // Keep temp tables in RAM - faster aggregations
                    this.db.run("PRAGMA page_size = 4096");         // Optimal page size for most systems

                    // Initialize schema (from server.js initDb function lines 2785+)
                    this._initializeSchema()
                        .then(() => {
                            // HEX-272: Check database integrity on startup
                            return this.checkIntegrity();
                        })
                        .then(() => {
                            this._log("info", "Database initialized successfully with integrity verified");
                            resolve();
                        })
                        .catch(reject);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Initialize database schema
     * Extracted from server.js lines 2785-3280 (initDb function)
     * Enhanced with full table creation from init-database.js
     */
    async _initializeSchema() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                // Add new columns if they don't exist (from server.js lines 2794+)
                const alterStatements = [
                    "ALTER TABLE vulnerabilities ADD COLUMN vendor TEXT DEFAULT ''",
                    "ALTER TABLE vulnerabilities ADD COLUMN vulnerability_date TEXT DEFAULT ''",
                    "ALTER TABLE vulnerabilities ADD COLUMN state TEXT DEFAULT 'open'",
                    "ALTER TABLE vulnerabilities ADD COLUMN import_date TEXT DEFAULT ''",
                    "ALTER TABLE vulnerabilities_current ADD COLUMN lifecycle_state TEXT DEFAULT 'active'",
                    "ALTER TABLE vulnerabilities_current ADD COLUMN resolved_date TEXT",
                    "ALTER TABLE vulnerabilities_current ADD COLUMN resolution_reason TEXT",
                    "ALTER TABLE vulnerabilities_current ADD COLUMN confidence_score INTEGER DEFAULT 50",
                    "ALTER TABLE vulnerabilities_current ADD COLUMN dedup_tier INTEGER DEFAULT 4",
                    "ALTER TABLE vulnerabilities_current ADD COLUMN enhanced_unique_key TEXT",
                    "ALTER TABLE vulnerability_snapshots ADD COLUMN confidence_score INTEGER DEFAULT 50",
                    "ALTER TABLE vulnerability_snapshots ADD COLUMN dedup_tier INTEGER DEFAULT 4",
                    "ALTER TABLE vulnerability_snapshots ADD COLUMN enhanced_unique_key TEXT",
                    "ALTER TABLE vulnerability_daily_totals ADD COLUMN resolved_count INTEGER DEFAULT 0",
                    "ALTER TABLE vulnerability_daily_totals ADD COLUMN reopened_count INTEGER DEFAULT 0"
                ];

                alterStatements.forEach(sql => {
                    this.db.run(sql, (err) => {
                        if (err && !err.message.includes("duplicate column")) {
                            this._log("error", "Schema update failed", {
                                error: err.message,
                                sql: sql.substring(0, 100)
                            });
                        }
                    });
                });

                // Create tables (from server.js lines 2888+)
                this._createTables()
                    .then(() => this._createIndexes())
                    .then(() => resolve())
                    .catch(reject);
            });
        });
    }

    /**
     * Create database tables
     * Extracted from server.js lines 2888-3013
     */
    async _createTables() {
        const tables = [
            // Tickets table - core business entity (from init-database.js)
            `CREATE TABLE IF NOT EXISTS tickets (
                id TEXT PRIMARY KEY,
                xt_number TEXT UNIQUE,
                date_submitted TEXT,
                date_due TEXT,
                hexagon_ticket TEXT,
                service_now_ticket TEXT,
                location TEXT NOT NULL,
                devices TEXT,
                supervisor TEXT,
                tech TEXT,
                status TEXT DEFAULT 'Open',
                notes TEXT,
                attachments TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                site TEXT,
                site_id TEXT,
                location_id TEXT
            )`,

            // Vulnerability imports - tracking CSV imports
            `CREATE TABLE IF NOT EXISTS vulnerability_imports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                import_date TEXT NOT NULL,
                row_count INTEGER NOT NULL,
                vendor TEXT,
                file_size INTEGER,
                processing_time INTEGER,
                raw_headers TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Main vulnerabilities table
            `CREATE TABLE IF NOT EXISTS vulnerabilities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                import_id INTEGER,
                hostname TEXT,
                ip_address TEXT,
                cve TEXT,
                severity TEXT,
                vpr_score REAL,
                cvss_score REAL,
                first_seen TEXT,
                last_seen TEXT,
                plugin_id TEXT,
                plugin_name TEXT,
                description TEXT,
                solution TEXT,
                vendor_reference TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                vendor TEXT DEFAULT '',
                vulnerability_date TEXT DEFAULT '',
                state TEXT DEFAULT 'open',
                import_date TEXT DEFAULT '',
                FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
            )`,

            // Junction table for ticket-vulnerability relationships
            `CREATE TABLE IF NOT EXISTS ticket_vulnerabilities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id TEXT NOT NULL,
                vulnerability_id INTEGER NOT NULL,
                relationship_type TEXT DEFAULT 'remediation',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets (id),
                FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities (id)
            )`,

            // vulnerability_snapshots table (lines 2888-2915)
            `CREATE TABLE IF NOT EXISTS vulnerability_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                import_id INTEGER NOT NULL,
                scan_date TEXT NOT NULL,
                hostname TEXT,
                ip_address TEXT,
                cve TEXT,
                severity TEXT,
                vpr_score REAL,
                cvss_score REAL,
                first_seen TEXT,
                last_seen TEXT,
                plugin_id TEXT,
                plugin_name TEXT,
                description TEXT,
                solution TEXT,
                vendor_reference TEXT,
                vendor TEXT,
                vulnerability_date TEXT,
                state TEXT DEFAULT 'open',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                unique_key TEXT,
                confidence_score INTEGER DEFAULT 50,
                dedup_tier INTEGER DEFAULT 4,
                enhanced_unique_key TEXT,
                FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
            )`,

            // vulnerabilities_current table (lines 2917-2944)
            `CREATE TABLE IF NOT EXISTS vulnerabilities_current (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                import_id INTEGER NOT NULL,
                scan_date TEXT NOT NULL,
                hostname TEXT,
                ip_address TEXT,
                cve TEXT,
                severity TEXT,
                vpr_score REAL,
                cvss_score REAL,
                first_seen TEXT,
                last_seen TEXT,
                plugin_id TEXT,
                plugin_name TEXT,
                description TEXT,
                solution TEXT,
                vendor_reference TEXT,
                vendor TEXT,
                vulnerability_date TEXT,
                state TEXT DEFAULT 'open',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                unique_key TEXT UNIQUE,
                lifecycle_state TEXT DEFAULT 'active',
                resolved_date TEXT,
                resolution_reason TEXT,
                confidence_score INTEGER DEFAULT 50,
                dedup_tier INTEGER DEFAULT 4,
                enhanced_unique_key TEXT,
                FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
            )`,

            // vulnerability_daily_totals table (lines 2946-2964)
            `CREATE TABLE IF NOT EXISTS vulnerability_daily_totals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scan_date TEXT NOT NULL UNIQUE,
                critical_count INTEGER DEFAULT 0,
                critical_total_vpr REAL DEFAULT 0,
                high_count INTEGER DEFAULT 0,
                high_total_vpr REAL DEFAULT 0,
                medium_count INTEGER DEFAULT 0,
                medium_total_vpr REAL DEFAULT 0,
                low_count INTEGER DEFAULT 0,
                low_total_vpr REAL DEFAULT 0,
                total_vulnerabilities INTEGER DEFAULT 0,
                total_vpr REAL DEFAULT 0,
                resolved_count INTEGER DEFAULT 0,
                reopened_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // vendor_daily_totals table (Migration 008)
            // Permanent storage for vendor-specific trend data
            // Never cleaned up by db-snapshot-cleanup.js
            `CREATE TABLE IF NOT EXISTS vendor_daily_totals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scan_date TEXT NOT NULL,
                vendor TEXT NOT NULL,
                critical_count INTEGER DEFAULT 0,
                critical_total_vpr REAL DEFAULT 0,
                high_count INTEGER DEFAULT 0,
                high_total_vpr REAL DEFAULT 0,
                medium_count INTEGER DEFAULT 0,
                medium_total_vpr REAL DEFAULT 0,
                low_count INTEGER DEFAULT 0,
                low_total_vpr REAL DEFAULT 0,
                total_vulnerabilities INTEGER DEFAULT 0,
                total_vpr REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(scan_date, vendor)
            )`,

            // vulnerability_staging table (lines 2968-3013)
            `CREATE TABLE IF NOT EXISTS vulnerability_staging (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                import_id INTEGER NOT NULL,
                hostname TEXT,
                ip_address TEXT,
                cve TEXT,
                severity TEXT,
                vpr_score REAL,
                cvss_score REAL,
                plugin_id TEXT,
                plugin_name TEXT,
                description TEXT,
                solution TEXT,
                vendor_reference TEXT,
                vendor TEXT,
                vulnerability_date TEXT,
                state TEXT,
                enhanced_unique_key TEXT,
                confidence_score REAL,
                dedup_tier INTEGER,
                lifecycle_state TEXT DEFAULT 'staging',
                raw_csv_row JSON,
                processed BOOLEAN DEFAULT 0,
                batch_id INTEGER,
                processing_error TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                processed_at DATETIME,
                FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
            )`,

            // Email templates table - customizable email templates
            `CREATE TABLE IF NOT EXISTS email_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                template_content TEXT NOT NULL,
                default_content TEXT NOT NULL,
                variables TEXT NOT NULL,
                category TEXT DEFAULT 'email',
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Ticket templates table - customizable ticket markdown templates
            `CREATE TABLE IF NOT EXISTS ticket_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                template_content TEXT NOT NULL,
                default_content TEXT NOT NULL,
                variables TEXT NOT NULL,
                category TEXT DEFAULT 'ticket',
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Vulnerability templates table - customizable vulnerability report templates
            `CREATE TABLE IF NOT EXISTS vulnerability_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                template_content TEXT NOT NULL,
                default_content TEXT NOT NULL,
                variables TEXT NOT NULL,
                category TEXT DEFAULT 'vulnerability',
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        return Promise.all(tables.map(sql => this.run(sql)));
    }

    /**
     * Create database indexes
     * Extracted from server.js lines 3016-3106
     */
    async _createIndexes() {
        const indexes = [
            // Tickets indexes
            "CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status)",
            "CREATE INDEX IF NOT EXISTS idx_tickets_xt ON tickets (xt_number)",
            "CREATE INDEX IF NOT EXISTS idx_tickets_site ON tickets (site)",
            "CREATE INDEX IF NOT EXISTS idx_tickets_location ON tickets (location)",

            // Vulnerability indexes
            "CREATE INDEX IF NOT EXISTS idx_vulnerabilities_hostname ON vulnerabilities (hostname)",
            "CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities (severity)",
            "CREATE INDEX IF NOT EXISTS idx_vulnerabilities_cve ON vulnerabilities (cve)",
            "CREATE INDEX IF NOT EXISTS idx_vulnerabilities_import ON vulnerabilities (import_id)",
            "CREATE INDEX IF NOT EXISTS idx_ticket_vulns_ticket ON ticket_vulnerabilities (ticket_id)",
            "CREATE INDEX IF NOT EXISTS idx_ticket_vulns_vuln ON ticket_vulnerabilities (vulnerability_id)",

            // Vulnerability snapshots indexes
            "CREATE INDEX IF NOT EXISTS idx_snapshots_scan_date ON vulnerability_snapshots (scan_date)",
            "CREATE INDEX IF NOT EXISTS idx_snapshots_hostname ON vulnerability_snapshots (hostname)",
            "CREATE INDEX IF NOT EXISTS idx_snapshots_severity ON vulnerability_snapshots (severity)",
            "CREATE INDEX IF NOT EXISTS idx_current_unique_key ON vulnerabilities_current (unique_key)",
            "CREATE INDEX IF NOT EXISTS idx_current_scan_date ON vulnerabilities_current (scan_date)",
            "CREATE INDEX IF NOT EXISTS idx_current_enhanced_unique_key ON vulnerabilities_current (enhanced_unique_key)",
            "CREATE INDEX IF NOT EXISTS idx_current_lifecycle_scan ON vulnerabilities_current (lifecycle_state, scan_date)",
            "CREATE INDEX IF NOT EXISTS idx_snapshots_enhanced_key ON vulnerability_snapshots (enhanced_unique_key)",
            "CREATE INDEX IF NOT EXISTS idx_current_confidence_tier ON vulnerabilities_current (confidence_score, dedup_tier)",
            "CREATE INDEX IF NOT EXISTS idx_current_active_severity ON vulnerabilities_current (lifecycle_state, severity)",
            "CREATE INDEX IF NOT EXISTS idx_current_resolved_date ON vulnerabilities_current (resolved_date)",
            "CREATE INDEX IF NOT EXISTS idx_staging_import_id ON vulnerability_staging (import_id)",
            "CREATE INDEX IF NOT EXISTS idx_staging_processed ON vulnerability_staging (processed)",
            "CREATE INDEX IF NOT EXISTS idx_staging_batch_id ON vulnerability_staging (batch_id)",
            "CREATE INDEX IF NOT EXISTS idx_staging_unprocessed_batch ON vulnerability_staging (processed, batch_id)",

            // Vendor daily totals indexes (Migration 008)
            "CREATE INDEX IF NOT EXISTS idx_vendor_daily_scan_date ON vendor_daily_totals(scan_date)",
            "CREATE INDEX IF NOT EXISTS idx_vendor_daily_vendor ON vendor_daily_totals(vendor)",
            "CREATE INDEX IF NOT EXISTS idx_vendor_daily_composite ON vendor_daily_totals(vendor, scan_date)",

            // Email templates indexes
            "CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates (name)",
            "CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates (category)",
            "CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates (is_active)",

            // Ticket templates indexes
            "CREATE INDEX IF NOT EXISTS idx_ticket_templates_name ON ticket_templates (name)",
            "CREATE INDEX IF NOT EXISTS idx_ticket_templates_category ON ticket_templates (category)",
            "CREATE INDEX IF NOT EXISTS idx_ticket_templates_active ON ticket_templates (is_active)",

            // Vulnerability templates indexes
            "CREATE INDEX IF NOT EXISTS idx_vulnerability_templates_name ON vulnerability_templates (name)",
            "CREATE INDEX IF NOT EXISTS idx_vulnerability_templates_category ON vulnerability_templates (category)",
            "CREATE INDEX IF NOT EXISTS idx_vulnerability_templates_active ON vulnerability_templates (is_active)"
        ];

        return Promise.all(indexes.map(sql => this.run(sql)));
    }

    /**
     * Execute a query and return all results
     * Common pattern from server.js database operations
     */
    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized) {
                reject(new Error("Database not initialized"));
                return;
            }

            const startTime = Date.now();

            this.db.all(sql, params, (err, rows) => {
                const duration = Date.now() - startTime;

                if (err) {
                    this._log("error", "Database query error", {
                        error: err.message,
                        sql: sql.substring(0, 200),
                        params: params,
                        duration: `${duration}ms`
                    });
                    reject(err);
                } else {
                    // Log slow queries (>500ms)
                    if (duration > 500) {
                        this._log("warn", "Slow query detected", {
                            duration: `${duration}ms`,
                            sql: sql.substring(0, 200),
                            params: params,
                            rowCount: rows ? rows.length : 0
                        });
                    }
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Execute a query and return first result
     * Common pattern from server.js database operations
     */
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized) {
                reject(new Error("Database not initialized"));
                return;
            }

            const startTime = Date.now();

            this.db.get(sql, params, (err, row) => {
                const duration = Date.now() - startTime;

                if (err) {
                    this._log("error", "Database query error", {
                        error: err.message,
                        sql: sql.substring(0, 200),
                        params: params,
                        duration: `${duration}ms`
                    });
                    reject(err);
                } else {
                    // Log slow queries (>500ms)
                    if (duration > 500) {
                        this._log("warn", "Slow query detected", {
                            duration: `${duration}ms`,
                            sql: sql.substring(0, 200),
                            params: params
                        });
                    }
                    resolve(row);
                }
            });
        });
    }

    /**
     * Execute a statement (INSERT, UPDATE, DELETE)
     * Common pattern from server.js database operations
     */
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized) {
                reject(new Error("Database not initialized"));
                return;
            }

            const startTime = Date.now();

            this.db.run(sql, params, function(err) {
                const duration = Date.now() - startTime;

                if (err) {
                    this._log("error", "Database execution error", {
                        error: err.message,
                        sql: sql.substring(0, 200),
                        params: params,
                        duration: `${duration}ms`
                    });
                    reject(err);
                } else {
                    // Log slow operations (>500ms)
                    if (duration > 500) {
                        this._log("warn", "Slow database operation detected", {
                            duration: `${duration}ms`,
                            sql: sql.substring(0, 200),
                            params: params,
                            changes: this.changes
                        });
                    }
                    resolve({
                        lastID: this.lastID,
                        changes: this.changes
                    });
                }
            });
        });
    }

    /**
     * Generic query method for custom operations
     */
    async query(sql, params = [], method = "all") {
        switch (method) {
            case "all":
                return this.all(sql, params);
            case "get":
                return this.get(sql, params);
            case "run":
                return this.run(sql, params);
            default:
                throw new Error(`Unsupported query method: ${method}`);
        }
    }

    /**
     * Begin transaction
     * Pattern extracted from server.js lines 783, 1034
     */
    async beginTransaction() {
        const transactionId = Date.now().toString();
        this.activeTransactions.add(transactionId);

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run("BEGIN TRANSACTION", (err) => {
                    if (err) {
                        this.activeTransactions.delete(transactionId);
                        reject(err);
                    } else {
                        resolve(transactionId);
                    }
                });
            });
        });
    }

    /**
     * Commit transaction
     * Pattern extracted from server.js lines 880, 1162
     */
    async commit(transactionId) {
        return new Promise((resolve, reject) => {
            this.db.run("COMMIT", (err) => {
                if (transactionId) {
                    this.activeTransactions.delete(transactionId);
                }

                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Rollback transaction
     * Pattern extracted from server.js line 873
     */
    async rollback(transactionId) {
        return new Promise((resolve, reject) => {
            this.db.run("ROLLBACK", (err) => {
                if (transactionId) {
                    this.activeTransactions.delete(transactionId);
                }

                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Execute multiple operations in a transaction
     * Wrapper pattern commonly used in server.js
     */
    async transaction(operations) {
        const transactionId = await this.beginTransaction();

        try {
            const results = [];
            for (const operation of operations) {
                if (typeof operation === "function") {
                    const result = await operation(this);
                    results.push(result);
                } else if (operation.sql) {
                    const result = await this.run(operation.sql, operation.params || []);
                    results.push(result);
                }
            }

            await this.commit(transactionId);
            return results;
        } catch (error) {
            await this.rollback(transactionId);
            throw error;
        }
    }

    /**
     * Create prepared statement
     * Pattern used throughout server.js for batch operations
     */
    prepare(sql) {
        if (!this.isInitialized) {
            throw new Error("Database not initialized");
        }

        return this.db.prepare(sql);
    }

    /**
     * Serialize database operations
     * Pattern from server.js lines 782, 1033, 2518, 2793, 3739
     */
    serialize(callback) {
        if (!this.isInitialized) {
            throw new Error("Database not initialized");
        }

        this.db.serialize(callback);
    }

    /**
     * Force WAL checkpoint to flush all changes to main database file
     * HEX-272: Prevents data loss during Docker restarts
     * Call this after bulk operations or before graceful shutdown
     */
    async checkpoint() {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized) {
                reject(new Error("Database not initialized"));
                return;
            }

            this.db.run("PRAGMA wal_checkpoint(FULL)", (err) => {
                if (err) {
                    this._log("error", "WAL checkpoint failed", { error: err.message });
                    reject(err);
                } else {
                    this._log("info", "WAL checkpoint completed - all changes flushed to disk");
                    resolve();
                }
            });
        });
    }

    /**
     * Check database integrity
     * HEX-272: Run on startup to detect corruption early
     */
    async checkIntegrity() {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized) {
                reject(new Error("Database not initialized"));
                return;
            }

            this.db.get("PRAGMA integrity_check", (err, row) => {
                if (err) {
                    this._log("error", "Database integrity check failed", { error: err.message });
                    reject(err);
                } else if (row && row.integrity_check === "ok") {
                    this._log("info", "Database integrity check passed");
                    resolve(true);
                } else {
                    this._log("error", "Database integrity check failed", { result: row });
                    reject(new Error(`Database integrity check failed: ${JSON.stringify(row)}`));
                }
            });
        });
    }

    /**
     * Get database connection health status
     */
    getHealthStatus() {
        return {
            isInitialized: this.isInitialized,
            activeTransactions: this.activeTransactions.size,
            connectionPool: {
                ...this.connectionPool,
                activeConnections: this.connectionPool.currentConnections
            }
        };
    }

    /**
     * Check if VACUUM is needed based on last run time
     * Uses config from database.js:322-328
     */
    async shouldRunVacuum() {
        const { config } = require("../config/database");

        if (!config.maintenance.enableAutoVacuum) {
            return false;
        }

        try {
            const result = await this.get(
                "SELECT sync_time FROM sync_metadata WHERE sync_type = 'vacuum' ORDER BY sync_time DESC LIMIT 1"
            );

            if (!result) {
                // Never run before
                return true;
            }

            const lastVacuum = new Date(result.sync_time);
            const now = new Date();
            const daysSinceLastVacuum = (now - lastVacuum) / (1000 * 60 * 60 * 24);

            return daysSinceLastVacuum >= config.maintenance.vacuumIntervalDays;
        } catch (error) {
            this._log("warn", "Error checking VACUUM status", {
                error: error.message
            });
            return false;
        }
    }

    /**
     * Run VACUUM operation to reclaim disk space
     * Tracks execution in sync_metadata table
     */
    async runVacuum() {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            this._log("info", "Starting database VACUUM operation");

            this.db.run("VACUUM", async (vacuumErr) => {
                if (vacuumErr) {
                    this._log("error", "VACUUM operation failed", {
                        error: vacuumErr.message
                    });
                    reject(vacuumErr);
                    return;
                }

                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                this._log("info", "Database VACUUM completed successfully", {
                    duration: `${duration}s`
                });

                // Audit log for VACUUM operation
                this.this._audit("database.vacuum", "Database VACUUM operation completed", {
                    duration: `${duration}s`,
                    startTime: new Date(startTime).toISOString()
                }, null, null);

                // Record in sync_metadata
                try {
                    await this.run(
                        "INSERT INTO sync_metadata (sync_type, sync_time, record_count) VALUES ('vacuum', ?, ?)",
                        [new Date().toISOString(), duration]
                    );
                    resolve({ success: true, duration });
                } catch (metadataErr) {
                    this._log("warn", "Failed to record VACUUM in sync_metadata", {
                        error: metadataErr.message
                    });
                    resolve({ success: true, duration }); // VACUUM succeeded even if metadata failed
                }
            });
        });
    }

    /**
     * Start auto-VACUUM scheduler
     * Runs based on config.maintenance.vacuumIntervalDays
     */
    async startAutoVacuum() {
        const { config } = require("../config/database");

        if (!config.maintenance.enableAutoVacuum) {
            this._log("info", "Auto-VACUUM disabled in configuration");
            return;
        }

        this._log("info", "Auto-VACUUM scheduler started", {
            intervalDays: config.maintenance.vacuumIntervalDays
        });

        // Check immediately on startup
        try {
            const shouldRun = await this.shouldRunVacuum();
            if (shouldRun) {
                this._log("info", "Running startup VACUUM (overdue)");
                await this.runVacuum();
            }
        } catch (error) {
            this._log("error", "Startup VACUUM check failed", {
                error: error.message
            });
        }

        // Schedule periodic checks (daily at 2 AM)
        const checkInterval = 24 * 60 * 60 * 1000; // 24 hours
        setInterval(async () => {
            try {
                const now = new Date();
                if (now.getHours() === 2) { // Run at 2 AM
                    const shouldRun = await this.shouldRunVacuum();
                    if (shouldRun) {
                        this._log("info", "Running scheduled VACUUM");
                        await this.runVacuum();
                    }
                }
            } catch (error) {
                this._log("error", "Scheduled VACUUM check failed", {
                    error: error.message
                });
            }
        }, checkInterval);
    }

    /**
     * Close database connection
     */
    async close() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }

            // Wait for active transactions to complete
            if (this.activeTransactions.size > 0) {
                this._log("info", "Waiting for active transactions to complete", {
                    activeTransactions: this.activeTransactions.size
                });
                setTimeout(() => this.close().then(resolve).catch(reject), 1000);
                return;
            }

            this.db.close((err) => {
                if (err) {
                    this._log("error", "Error closing database connection", {
                        error: err.message
                    });
                    reject(err);
                } else {
                    this._log("info", "Database connection closed successfully");
                    this.isInitialized = false;
                    this.connectionPool.currentConnections = 0;
                    resolve();
                }
            });
        });
    }
}

module.exports = DatabaseService;