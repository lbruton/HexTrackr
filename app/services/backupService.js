/**
 * BackupService - Database backup and restore operations
 * Extracted from server.js lines: 2701, 3274-3798
 *
 * Handles:
 * - Database export to JSON format
 * - Backup file restoration from ZIP/JSON
 * - Data clearing operations
 * - Backup statistics and file management
 */

const DatabaseService = require("./databaseService");
const FileService = require("./fileService");
const PathValidator = require("../utils/PathValidator");
const JSZip = require("jszip");
const path = require("path");
const fs = require("fs");

/**
 * Defensive logging helpers
 * Safely log to LoggingService with fallback for initialization
 */
function _log(level, message, data = {}) {
    if (global.logger && global.logger.backup && typeof global.logger.backup[level] === 'function') {
        global.logger.backup[level](message, data);
    }
}

function _audit(category, message, data = {}) {
    if (global.logger && typeof global.logger.audit === 'function') {
        global.logger.audit(category, message, data, null, null);
    }
}

class BackupService {
    constructor() {
        // Use existing database service if available, otherwise create connection
        this.db = null;
        this.fileService = new FileService();
        this.backupDir = path.join(__dirname, "..", "..", "backups");
    }

    /**
     * Initialize service with database connection
     * @param {sqlite3.Database} database - Database connection from server.js
     */
    initialize(database) {
        this.db = database;
    }

    /**
     * Get backup statistics
     * Extracted from server.js line 3274-3302
     */
    async getBackupStats() {
        return new Promise((resolve, reject) => {
            // Use the new table structure: vulnerabilities_current instead of vulnerabilities
            this.db.get("SELECT COUNT(*) as vulnerabilities FROM vulnerabilities_current", (err, vulnRow) => {
                if (err) {
                    return reject(new Error("Database error: " + err.message));
                }

                this.db.get("SELECT COUNT(*) as tickets FROM tickets", (ticketErr, ticketRow) => {
                    if (ticketErr) {
                        return reject(new Error("Database error - tickets: " + ticketErr.message));
                    }

                    const vulnCount = vulnRow.vulnerabilities;
                    const ticketCount = ticketRow.tickets;

                    // Get database file size
                    // HEX-280: Use DATABASE_PATH environment variable (same pattern as server.js:169-171)
                    try {
                        const dbPath = process.env.DATABASE_PATH
                            ? path.resolve(process.env.DATABASE_PATH)
                            : path.join(__dirname, "..", "data", "hextrackr.db");
                        const dbSize = PathValidator.safeStatSync(dbPath).size;

                        resolve({
                            vulnerabilities: vulnCount,
                            tickets: ticketCount,
                            total: vulnCount + ticketCount,
                            dbSize: dbSize
                        });
                    } catch (statError) {
                        reject(new Error("Failed to get database file size: " + statError.message));
                    }
                });
            });
        });
    }

    /**
     * Export vulnerabilities data (FIXED: now exports active data)
     * Previously exported empty legacy table, now exports complete vulnerability ecosystem
     */
    async exportVulnerabilities() {
        return new Promise(async (resolve, reject) => {
            try {
                // Export all vulnerability-related tables
                const vulnerabilitiesData = await Promise.all([
                    this._fetchData("SELECT * FROM vulnerabilities_current"),
                    this._fetchData("SELECT * FROM vulnerability_snapshots"),
                    this._fetchData("SELECT * FROM vulnerability_daily_totals"),
                    this._fetchData("SELECT * FROM vendor_daily_totals"),
                    this._fetchData("SELECT * FROM vulnerability_imports"),
                    this._fetchData("SELECT * FROM vulnerability_templates"),
                    this._fetchData("SELECT * FROM kev_status"),
                    this._fetchData("SELECT * FROM ticket_vulnerabilities"),
                    this._fetchData("SELECT * FROM cisco_advisories"),
                    this._fetchData("SELECT * FROM palo_alto_advisories")
                ]);

                const [current, snapshots, dailyTotals, vendorDailyTotals, imports, templates, kevStatus, ticketVulns, ciscoAdvisories, paloAdvisories] = vulnerabilitiesData;

                resolve({
                    type: "vulnerabilities_complete",
                    vulnerabilities_current: {
                        count: current.length,
                        data: current
                    },
                    vulnerability_snapshots: {
                        count: snapshots.length,
                        data: snapshots
                    },
                    vulnerability_daily_totals: {
                        count: dailyTotals.length,
                        data: dailyTotals
                    },
                    vendor_daily_totals: {
                        count: vendorDailyTotals.length,
                        data: vendorDailyTotals
                    },
                    vulnerability_imports: {
                        count: imports.length,
                        data: imports
                    },
                    vulnerability_templates: {
                        count: templates.length,
                        data: templates
                    },
                    kev_status: {
                        count: kevStatus.length,
                        data: kevStatus
                    },
                    ticket_vulnerabilities: {
                        count: ticketVulns.length,
                        data: ticketVulns
                    },
                    cisco_advisories: {
                        count: ciscoAdvisories.length,
                        data: ciscoAdvisories
                    },
                    palo_alto_advisories: {
                        count: paloAdvisories.length,
                        data: paloAdvisories
                    },
                    exported_at: new Date().toISOString()
                });
            } catch (error) {
                reject(new Error("Vulnerability export failed: " + error.message));
            }
        });
    }

    /**
     * Export tickets data (ENHANCED: includes related tables)
     * Now exports complete ticket ecosystem including templates
     */
    async exportTickets() {
        return new Promise(async (resolve, reject) => {
            try {
                // Export all ticket-related tables
                const ticketData = await Promise.all([
                    this._fetchData("SELECT * FROM tickets ORDER BY created_at DESC"),
                    this._fetchData("SELECT * FROM ticket_templates"),
                    this._fetchData("SELECT * FROM email_templates"),
                    this._fetchData("SELECT * FROM ticket_vulnerabilities"),
                    this._fetchData("SELECT * FROM sync_metadata")
                ]);

                const [tickets, ticketTemplates, emailTemplates, ticketVulns, syncMeta] = ticketData;

                resolve({
                    type: "tickets_complete",
                    tickets: {
                        count: tickets.length,
                        data: tickets
                    },
                    ticket_templates: {
                        count: ticketTemplates.length,
                        data: ticketTemplates
                    },
                    email_templates: {
                        count: emailTemplates.length,
                        data: emailTemplates
                    },
                    ticket_vulnerabilities: {
                        count: ticketVulns.length,
                        data: ticketVulns
                    },
                    sync_metadata: {
                        count: syncMeta.length,
                        data: syncMeta
                    },
                    exported_at: new Date().toISOString()
                });
            } catch (error) {
                reject(new Error("Ticket export failed: " + error.message));
            }
        });
    }

    /**
     * Export complete backup (ALL tables + metadata)
     * COMPLETELY REWRITTEN: Now exports entire database ecosystem
     */
    async exportAll() {
        try {
            _log('info', "Starting comprehensive database backup...");

            // Get comprehensive data from both export functions plus user preferences
            const [vulnerabilityData, ticketData, preferencesData] = await Promise.all([
                this.exportVulnerabilities(),
                this.exportTickets(),
                this._fetchData("SELECT * FROM user_preferences")
            ]);

            // ✅ SECURITY: DO NOT export users table (contains Argon2id password hashes)
            // User preferences are safe to export (theme, display settings - no security risk)

            // Calculate total record counts for logging
            const totalVulnRecords = Object.keys(vulnerabilityData)
                .filter(key => key !== "type" && key !== "exported_at")
                .reduce((sum, key) => sum + (vulnerabilityData[key]?.count || 0), 0);

            const totalTicketRecords = Object.keys(ticketData)
                .filter(key => key !== "type" && key !== "exported_at")
                .reduce((sum, key) => sum + (ticketData[key]?.count || 0), 0);

            _log('info', `Backup complete: ${totalVulnRecords} vulnerability records, ${totalTicketRecords} ticket/template records`);

            return {
                type: "complete_backup_enhanced",
                backup_metadata: {
                    created_at: new Date().toISOString(),
                    total_vulnerability_records: totalVulnRecords,
                    total_ticket_records: totalTicketRecords,
                    database_version: "v1.0.24-enhanced",
                    backup_schema_version: "2.0"
                },
                vulnerability_data: vulnerabilityData,
                ticket_data: ticketData,
                user_preferences: {
                    count: preferencesData.length,
                    data: preferencesData
                },
                exported_at: new Date().toISOString()
            };

        } catch (error) {
            _log('error', "Complete backup failed:", error.message);
            throw new Error("Complete backup failed: " + error.message);
        }
    }

    /**
     * Clear data by type
     * Extracted from server.js line 2701-2771
     */
    async clearData(type) {
        return new Promise((resolve, reject) => {
            if (type === "all") {
                // Clear all tables in parallel (no foreign key dependencies between these groups)
                // SECURITY: Preserves users, user_preferences, sessions (authentication)
                // HEX-270: Preserves cisco_advisories, palo_alto_advisories (not in backups, managed by sync services)
                const clearPromises = [
                    new Promise((res, rej) => this.db.run("DELETE FROM vulnerability_imports", err => err ? rej(err) : res())),
                    new Promise((res, rej) => this.db.run("DELETE FROM kev_status", err => err ? rej(err) : res())),
                    new Promise((res, rej) => this.db.run("DELETE FROM ticket_templates", err => err ? rej(err) : res())),
                    new Promise((res, rej) => this.db.run("DELETE FROM email_templates", err => err ? rej(err) : res())),
                    new Promise((res, rej) => this.db.run("DELETE FROM ticket_vulnerabilities", err => err ? rej(err) : res())),
                    new Promise((res, rej) => this.db.run("DELETE FROM vulnerability_snapshots", err => err ? rej(err) : res())),
                    new Promise((res, rej) => this.db.run("DELETE FROM vulnerabilities_current", err => err ? rej(err) : res())),
                    new Promise((res, rej) => this.db.run("DELETE FROM vulnerability_daily_totals", err => err ? rej(err) : res())),
                    new Promise((res, rej) => this.db.run("DELETE FROM vendor_daily_totals", err => err ? rej(err) : res())),
                    new Promise((res, rej) => this.db.run("DELETE FROM tickets", err => err ? rej(err) : res()))
                ];

                Promise.all(clearPromises)
                    .then(() => resolve({
                        message: "All data cleared successfully (authentication and vendor advisories preserved)",
                        clearedCount: "all"
                    }))
                    .catch(err => reject(new Error("Failed to clear all data: " + err.message)));

            } else if (type === "vulnerabilities") {
                // Clear vulnerability tables in dependency order (cascade deletes)
                // HEX-270: Preserve cisco_advisories, palo_alto_advisories (not in backups, managed by sync services)
                this.db.run("DELETE FROM vulnerability_imports", (importErr) => {
                    if (importErr) {
                        return reject(new Error("Failed to clear vulnerability imports"));
                    }

                    this.db.run("DELETE FROM kev_status", (kevErr) => {
                        if (kevErr) {
                            return reject(new Error("Failed to clear KEV status"));
                        }

                        // Then clear core vulnerability tables
                        this.db.run("DELETE FROM vulnerability_snapshots", (snapErr) => {
                            if (snapErr) {
                                return reject(new Error("Failed to clear vulnerability snapshots"));
                            }

                            this.db.run("DELETE FROM vulnerabilities_current", (currentErr) => {
                                if (currentErr) {
                                    return reject(new Error("Failed to clear current vulnerabilities"));
                                }

                                this.db.run("DELETE FROM vulnerability_daily_totals", (dailyErr) => {
                                    if (dailyErr) {
                                        return reject(new Error("Failed to clear daily totals"));
                                    }

                                    this.db.run("DELETE FROM vendor_daily_totals", (vendorErr) => {
                                        if (vendorErr) {
                                            return reject(new Error("Failed to clear vendor daily totals"));
                                        }

                                        resolve({
                                            message: "Vulnerability data cleared successfully (vendor advisories preserved)",
                                            clearedCount: "vulnerabilities"
                                        });
                                    });
                                });
                            });
                        });
                    });
                });

            } else if (type === "tickets") {
                // Clear junction table first (foreign key dependency)
                this.db.run("DELETE FROM ticket_vulnerabilities", (junctionErr) => {
                    if (junctionErr) {
                        return reject(new Error("Failed to clear ticket-vulnerability relationships"));
                    }

                    // Then clear tickets
                    this.db.run("DELETE FROM tickets", function(err) {
                        if (err) {
                            return reject(new Error("Failed to clear tickets"));
                        }

                        resolve({
                            message: "Tickets cleared successfully (including relationships)",
                            clearedCount: this.changes
                        });
                    });
                });

            } else {
                reject(new Error("Invalid clear type. Must be: all, vulnerabilities, or tickets"));
            }
        });
    }

    /**
     * Restore data from backup file
     * Extracted from server.js line 3654-3798
     */
    async restoreBackup(options) {
        const { type, clearExisting, filePath } = options;

        try {
            const fileData = PathValidator.safeReadFileSync(filePath, null); // read as buffer
            let restoredCount = 0;
            const details = {};

            // Use JSZip to extract the backup
            const zip = new JSZip();
            const zipContent = await zip.loadAsync(fileData);

            // Process based on data type
            if (type === "tickets" || type === "all") {
                // Extract tickets.json if it exists
                if (zipContent.files["tickets.json"]) {
                    const ticketsJson = await zipContent.files["tickets.json"].async("string");
                    const ticketsData = JSON.parse(ticketsJson);

                    // Handle both old and new data formats
                    let ticketsArray = [];
                    if (ticketsData) {
                        if (ticketsData.data && Array.isArray(ticketsData.data)) {
                            // Old format: ticketsData.data
                            ticketsArray = ticketsData.data;
                        } else if (ticketsData.tickets && ticketsData.tickets.data &&
                                   Array.isArray(ticketsData.tickets.data)) {
                            // New format: ticketsData.tickets.data
                            ticketsArray = ticketsData.tickets.data;
                        } else if (Array.isArray(ticketsData)) {
                            // Direct array format
                            ticketsArray = ticketsData;
                        }
                    }

                    if (ticketsArray.length > 0) {
                        // Clear existing tickets if requested
                        if (clearExisting) {
                            await this._executeQuery("DELETE FROM tickets");
                        }

                        // Insert tickets data (HEX-270: preserve ALL columns including soft-delete metadata)
                        const ticketValues = ticketsArray.map(ticket => [
                            ticket.id || null,  // CRITICAL: Preserve ticket ID to prevent NULL corruption
                            ticket.xt_number || "",
                            ticket.date_submitted || "",
                            ticket.date_due || "",
                            ticket.hexagon_ticket || "",
                            ticket.service_now_ticket || "",
                            ticket.location || "",
                            ticket.devices || "",
                            ticket.supervisor || "",
                            ticket.tech || "",
                            ticket.status || "Open",
                            ticket.notes || "",
                            ticket.attachments || null,
                            ticket.created_at || new Date().toISOString(),
                            ticket.updated_at || new Date().toISOString(),
                            ticket.site || "",
                            ticket.site_id || "",
                            ticket.location_id || "",
                            ticket.deleted || 0,  // CRITICAL: Preserve soft-delete state
                            ticket.deleted_at || null,
                            ticket.job_type || "Upgrade",
                            ticket.tracking_number || "",
                            ticket.software_versions || "",
                            ticket.mitigation_details || "",
                            ticket.shipping_line1 || "",
                            ticket.shipping_line2 || "",
                            ticket.shipping_city || "",
                            ticket.shipping_state || "",
                            ticket.shipping_zip || "",
                            ticket.return_line1 || "",
                            ticket.return_line2 || "",
                            ticket.return_city || "",
                            ticket.return_state || "",
                            ticket.return_zip || "",
                            ticket.outbound_tracking || "",
                            ticket.return_tracking || "",
                            ticket.deletion_reason || "",
                            ticket.deleted_by || "",
                            ticket.site_address || "",
                            ticket.return_address || "",
                            ticket.installed_versions || "",
                            ticket.device_status || ""
                        ]);

                        for (const values of ticketValues) {
                            // Use INSERT OR IGNORE to skip duplicates (HEX-270)
                            await this._executeQuery(`
                                INSERT OR IGNORE INTO tickets
                                (id, xt_number, date_submitted, date_due, hexagon_ticket, service_now_ticket,
                                location, devices, supervisor, tech, status, notes, attachments, created_at, updated_at,
                                site, site_id, location_id, deleted, deleted_at, job_type, tracking_number,
                                software_versions, mitigation_details, shipping_line1, shipping_line2, shipping_city,
                                shipping_state, shipping_zip, return_line1, return_line2, return_city, return_state,
                                return_zip, outbound_tracking, return_tracking, deletion_reason, deleted_by,
                                site_address, return_address, installed_versions, device_status)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `, values);
                            restoredCount++;
                        }

                        details.tickets = ticketValues.length;
                    }
                }
            }

            if (type === "vulnerabilities" || type === "all") {
                // Extract vulnerabilities.json if it exists
                if (zipContent.files["vulnerabilities.json"]) {
                    const vulnJson = await zipContent.files["vulnerabilities.json"].async("string");
                    const vulnData = JSON.parse(vulnJson);

                    // Handle both old and new data formats
                    let vulnArray = [];
                    if (vulnData) {
                        if (vulnData.data && Array.isArray(vulnData.data)) {
                            // Old format: vulnData.data
                            vulnArray = vulnData.data;
                        } else if (vulnData.vulnerabilities && vulnData.vulnerabilities.data &&
                                   Array.isArray(vulnData.vulnerabilities.data)) {
                            // New format: vulnData.vulnerabilities.data
                            vulnArray = vulnData.vulnerabilities.data;
                        } else if (Array.isArray(vulnData)) {
                            // Direct array format
                            vulnArray = vulnData;
                        }
                    }

                    if (vulnArray.length > 0) {
                        // Clear existing vulnerabilities if requested
                        if (clearExisting) {
                            await this._executeQuery("DELETE FROM vulnerability_snapshots");
                            await this._executeQuery("DELETE FROM vulnerabilities_current");
                            await this._executeQuery("DELETE FROM vulnerability_daily_totals");
                        }

                        // Insert vulnerability data
                        const vulnValues = vulnArray.map(vuln => [
                            vuln.hostname || "",
                            vuln.ip_address || "",
                            vuln.cve || "",
                            vuln.severity || "",
                            vuln.vpr_score || 0,
                            vuln.cvss_score || 0,
                            vuln.first_seen || "",
                            vuln.last_seen || "",
                            vuln.plugin_name || "",
                            vuln.description || "",
                            vuln.solution || ""
                        ]);

                        for (const values of vulnValues) {
                            await this._executeQuery(`
                                INSERT INTO vulnerabilities
                                (hostname, ip_address, cve, severity, vpr_score, cvss_score,
                                first_seen, last_seen, plugin_name, description, solution)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `, values);
                            restoredCount++;
                        }

                        details.vulnerabilities = vulnValues.length;
                    }
                }
            }

            // Clean up the uploaded file
            try {
                PathValidator.safeUnlinkSync(filePath);
            } catch (unlinkError) {
                _log('warn', "Could not clean up uploaded file:", unlinkError.message);
            }

            return {
                message: `Successfully restored ${restoredCount} records`,
                restoredCount: restoredCount,
                details: details
            };

        } catch (error) {
            // Clean up on error
            try {
                PathValidator.safeUnlinkSync(filePath);
            } catch (unlinkError) {
                _log('warn', "Could not clean up uploaded file after error:", unlinkError.message);
            }

            throw new Error("Failed to restore data: " + error.message);
        }
    }

    /**
     * Helper method to execute database queries as promises
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise}
     */
    _executeQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });
    }

    /**
     * Helper method to fetch data as promises
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise}
     */
    _fetchData(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }






    /**
     * Export complete backup as ZIP file
     * Creates a comprehensive backup with all tables in ZIP format
     * @returns {Promise<Buffer>} ZIP file buffer
     */
    async exportAllAsZip() {
        try {
            _log('info', "Creating comprehensive ZIP backup...");

            // Get all data using the enhanced export
            const backupData = await this.exportAll();

            // Create ZIP file
            const zip = new JSZip();

            // Add individual table exports for easier restoration
            // NOTE: Skipping combined complete_backup.json to avoid JSON.stringify length limits
            // with 95K+ vulnerability records. Individual files provide same data without memory issues.
            zip.file("vulnerabilities_current.json", JSON.stringify(backupData.vulnerability_data.vulnerabilities_current, null, 2));
            zip.file("vulnerability_snapshots.json", JSON.stringify(backupData.vulnerability_data.vulnerability_snapshots, null, 2));
            zip.file("vulnerability_daily_totals.json", JSON.stringify(backupData.vulnerability_data.vulnerability_daily_totals, null, 2));
            zip.file("vendor_daily_totals.json", JSON.stringify(backupData.vulnerability_data.vendor_daily_totals, null, 2));
            zip.file("vulnerability_imports.json", JSON.stringify(backupData.vulnerability_data.vulnerability_imports, null, 2));
            zip.file("tickets.json", JSON.stringify(backupData.ticket_data.tickets, null, 2));
            zip.file("ticket_templates.json", JSON.stringify(backupData.ticket_data.ticket_templates, null, 2));
            zip.file("email_templates.json", JSON.stringify(backupData.ticket_data.email_templates, null, 2));
            zip.file("kev_status.json", JSON.stringify(backupData.vulnerability_data.kev_status, null, 2));
            zip.file("cisco_advisories.json", JSON.stringify(backupData.vulnerability_data.cisco_advisories, null, 2));
            zip.file("palo_alto_advisories.json", JSON.stringify(backupData.vulnerability_data.palo_alto_advisories, null, 2));
            zip.file("user_preferences.json", JSON.stringify(backupData.user_preferences, null, 2));

            // ✅ SECURITY: users.json NOT included (contains password hashes)

            // Add metadata file
            const metadata = {
                backup_type: "complete_enhanced_zip",
                created_at: new Date().toISOString(),
                version: "2.0",
                tables_included: [
                    "vulnerabilities_current", "vulnerability_snapshots", "vulnerability_daily_totals",
                    "vendor_daily_totals", "vulnerability_imports", "vulnerability_templates", "kev_status",
                    "ticket_vulnerabilities", "cisco_advisories", "palo_alto_advisories",
                    "tickets", "ticket_templates", "email_templates", "sync_metadata",
                    "user_preferences"
                ],
                security_note: "users table NOT included (password hashes excluded for security)",
                total_records: backupData.backup_metadata.total_vulnerability_records + backupData.backup_metadata.total_ticket_records,
                restore_instructions: "Use the comprehensive backup restore API with this ZIP file"
            };
            zip.file("backup_metadata.json", JSON.stringify(metadata, null, 2));

            // Generate ZIP buffer
            const zipBuffer = await zip.generateAsync({
                type: "nodebuffer",
                compression: "DEFLATE",
                compressionOptions: { level: 6 }
            });

            _log('info', `ZIP backup created: ${(zipBuffer.length / 1024 / 1024).toFixed(1)}MB`);

            return zipBuffer;

        } catch (error) {
            _log('error', "ZIP backup creation failed:", error.message);
            throw new Error(`ZIP backup failed: ${error.message}`);
        }
    }

    /**
     * Export vulnerabilities as ZIP file
     * Creates vulnerability-focused backup in ZIP format
     * @returns {Promise<Buffer>} ZIP file buffer
     */
    async exportVulnerabilitiesAsZip() {
        try {
            _log('info', "Creating vulnerabilities ZIP backup...");

            const vulnData = await this.exportVulnerabilities();
            const zip = new JSZip();

            // Add metadata (small, safe to stringify)
            const metadata = {
                type: vulnData.type,
                exported_at: vulnData.exported_at,
                tables: Object.keys(vulnData).filter(key => key !== "type" && key !== "exported_at")
            };
            zip.file("_metadata.json", JSON.stringify(metadata, null, 2));

            // Add individual tables with chunking for large datasets
            // JSON.stringify has ~500MB string length limit, so chunk large tables
            const CHUNK_SIZE = 10000; // 10K records per chunk
            Object.keys(vulnData).forEach(key => {
                if (key !== "type" && key !== "exported_at" && vulnData[key].data) {
                    const tableData = vulnData[key].data;
                    const recordCount = tableData.length;

                    if (recordCount > CHUNK_SIZE) {
                        // Split into chunks
                        const numChunks = Math.ceil(recordCount / CHUNK_SIZE);
                        _log('info', `Splitting ${key} into ${numChunks} chunks (${recordCount} records)`);

                        for (let i = 0; i < numChunks; i++) {
                            const start = i * CHUNK_SIZE;
                            const end = Math.min(start + CHUNK_SIZE, recordCount);
                            const chunk = tableData.slice(start, end);
                            const chunkData = { count: chunk.length, data: chunk };
                            zip.file(`${key}_chunk_${i + 1}_of_${numChunks}.json`, JSON.stringify(chunkData, null, 2));
                        }

                        // Add chunk index file
                        const chunkIndex = {
                            table_name: key,
                            total_records: recordCount,
                            chunk_size: CHUNK_SIZE,
                            num_chunks: numChunks,
                            chunks: Array.from({ length: numChunks }, (_, i) => `${key}_chunk_${i + 1}_of_${numChunks}.json`)
                        };
                        zip.file(`${key}_chunks_index.json`, JSON.stringify(chunkIndex, null, 2));
                    } else {
                        // Small table, add as single file
                        zip.file(`${key}.json`, JSON.stringify(vulnData[key], null, 2));
                    }
                }
            });

            const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
            _log('info', `Vulnerabilities ZIP created: ${(zipBuffer.length / 1024 / 1024).toFixed(1)}MB`);

            return zipBuffer;

        } catch (error) {
            _log('error', "Vulnerabilities ZIP backup failed:", error.message);
            throw new Error(`Vulnerabilities ZIP backup failed: ${error.message}`);
        }
    }

    /**
     * Export tickets as ZIP file
     * Creates ticket-focused backup in ZIP format
     * @returns {Promise<Buffer>} ZIP file buffer
     */
    async exportTicketsAsZip() {
        try {
            _log('info', "Creating tickets ZIP backup...");

            const ticketData = await this.exportTickets();
            const zip = new JSZip();

            // Add metadata (small, safe to stringify)
            const metadata = {
                type: ticketData.type,
                exported_at: ticketData.exported_at,
                tables: Object.keys(ticketData).filter(key => key !== "type" && key !== "exported_at")
            };
            zip.file("_metadata.json", JSON.stringify(metadata, null, 2));

            // Add individual tables only (avoids JSON.stringify length limits on huge combined object)
            Object.keys(ticketData).forEach(key => {
                if (key !== "type" && key !== "exported_at" && ticketData[key].data) {
                    zip.file(`${key}.json`, JSON.stringify(ticketData[key], null, 2));
                }
            });

            const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
            _log('info', `Tickets ZIP created: ${(zipBuffer.length / 1024 / 1024).toFixed(1)}MB`);

            return zipBuffer;

        } catch (error) {
            _log('error', "Tickets ZIP backup failed:", error.message);
            throw new Error(`Tickets ZIP backup failed: ${error.message}`);
        }
    }

    /**
     * HEX-270: Create scheduled backup (JSON ZIP + Database file)
     * Saves both backup types to /backups directory with timestamps
     * @returns {Promise<Object>} Backup result with file paths and sizes
     */
    async createScheduledBackup() {
        try {
            _log('info', "Starting scheduled backup...");

            // Ensure backup directory exists
            if (!fs.existsSync(this.backupDir)) {
                fs.mkdirSync(this.backupDir, { recursive: true });
                _log('info', "Created backup directory", { path: this.backupDir });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split(".")[0]; // YYYY-MM-DDTHH-MM-SS

            // 1. Create JSON ZIP backup
            _log('info', "Creating JSON ZIP backup...");
            const zipBuffer = await this.exportAllAsZip();
            const zipPath = path.join(this.backupDir, `hextrackr_data_${timestamp}.zip`);
            fs.writeFileSync(zipPath, zipBuffer);
            const zipSize = (zipBuffer.length / 1024 / 1024).toFixed(2);
            _log('info', `JSON ZIP backup saved: ${zipSize}MB`, { path: zipPath });

            // 2. Create database file backup using VACUUM INTO
            _log('info', "Creating database file backup...");
            const dbBackupPath = path.join(this.backupDir, `hextrackr_db_${timestamp}.db`);

            await new Promise((resolve, reject) => {
                // VACUUM INTO creates a clean, compacted copy of the database
                // Safe to use while database is in use (no locks required)
                this.db.run(`VACUUM INTO ?`, [dbBackupPath], (err) => {
                    if (err) {
                        _log('error', "Database backup failed", { error: err.message });
                        reject(new Error(`Database backup failed: ${err.message}`));
                    } else {
                        const dbStats = fs.statSync(dbBackupPath);
                        const dbSize = (dbStats.size / 1024 / 1024).toFixed(2);
                        _log('info', `Database backup saved: ${dbSize}MB`, { path: dbBackupPath });
                        resolve();
                    }
                });
            });

            // Get final statistics
            const zipStats = fs.statSync(zipPath);
            const dbStats = fs.statSync(dbBackupPath);

            const result = {
                success: true,
                timestamp: timestamp,
                backups: {
                    json_zip: {
                        path: zipPath,
                        size_mb: (zipStats.size / 1024 / 1024).toFixed(2)
                    },
                    database: {
                        path: dbBackupPath,
                        size_mb: (dbStats.size / 1024 / 1024).toFixed(2)
                    }
                },
                total_size_mb: ((zipStats.size + dbStats.size) / 1024 / 1024).toFixed(2)
            };

            _audit('backup.scheduled', "Scheduled backup completed", result);

            return result;

        } catch (error) {
            _log('error', "Scheduled backup failed", { error: error.message });
            throw new Error(`Scheduled backup failed: ${error.message}`);
        }
    }

    /**
     * HEX-270: Get backup history from disk
     * Lists all available backups (JSON ZIP and database files)
     * @returns {Promise<Object>} List of backups with metadata
     */
    async getBackupHistory() {
        try {
            _log('info', "Retrieving backup history...");

            if (!fs.existsSync(this.backupDir)) {
                return {
                    success: true,
                    backups: [],
                    message: "No backups directory found"
                };
            }

            const files = fs.readdirSync(this.backupDir);
            const backups = [];

            for (const file of files) {
                // Only process backup files (ZIP and DB)
                if (!file.startsWith("hextrackr_") || (!file.endsWith(".zip") && !file.endsWith(".db"))) {
                    continue;
                }

                const filePath = path.join(this.backupDir, file);
                const stats = fs.statSync(filePath);

                // Parse filename to extract timestamp and type
                // Supports multiple filename formats:
                // - hextrackr_data_YYYY-MM-DDTHH-MM-SS.zip (scheduled backups)
                // - hextrackr_db_YYYY-MM-DDTHH-MM-SS.db (database backups)
                // - hextrackr_tickets_backup_YYYY-MM-DD_HH-MM-SS_manual.zip (manual ticket backups)
                // - hextrackr_vulnerabilities_backup_YYYY-MM-DD_HH-MM-SS_manual.zip (manual vuln backups)
                // - hextrackr_pre-migration-XXX_YYYYMMDD-HHMMSS.db (pre-migration backups)

                let backupType, timestamp, isManual;

                // Try legacy format first: hextrackr_(data|db)_timestamp.(zip|db)
                let match = file.match(/^hextrackr_(data|db)_(.+)\.(zip|db)$/);
                if (match) {
                    const [, type, ts] = match;
                    backupType = type === "data" ? "JSON ZIP" : "Database";
                    timestamp = ts.replace("_manual", "");
                    isManual = ts.includes("_manual");
                }
                // Try new format: hextrackr_(tickets|vulnerabilities)_backup_timestamp_manual.zip
                else {
                    match = file.match(/^hextrackr_(tickets|vulnerabilities)_backup_(.+)\.(zip)$/);
                    if (match) {
                        const [, type, ts] = match;
                        backupType = type === "tickets" ? "Tickets" : "Vulnerabilities";
                        timestamp = ts.replace("_manual", "");
                        isManual = ts.includes("_manual");
                    }
                    // Try database backup format: hextrackr_pre-migration-XXX_timestamp.db
                    else {
                        match = file.match(/^hextrackr_pre-migration-[^_]+_(.+)\.db$/);
                        if (match) {
                            backupType = "Database";
                            timestamp = match[1];
                            isManual = false; // Pre-migration backups are automated
                        } else {
                            continue; // Skip files that don't match any pattern
                        }
                    }
                }

                backups.push({
                    filename: file,
                    type: backupType,
                    timestamp: timestamp,
                    size_bytes: stats.size,
                    size_mb: (stats.size / 1024 / 1024).toFixed(2),
                    created_at: stats.mtime,
                    age_days: ((Date.now() - stats.mtimeMs) / 86400000).toFixed(1),
                    is_manual: isManual,
                    is_automated: !isManual
                });
            }

            // Sort by creation time (newest first)
            backups.sort((a, b) => b.created_at - a.created_at);

            _log('info', `Found ${backups.length} backups in history`);

            return {
                success: true,
                backups: backups,
                total_count: backups.length,
                total_size_mb: backups.reduce((sum, b) => sum + parseFloat(b.size_mb), 0).toFixed(2)
            };

        } catch (error) {
            _log('error', "Failed to retrieve backup history", { error: error.message });
            throw new Error(`Failed to retrieve backup history: ${error.message}`);
        }
    }

    /**
     * HEX-270: Download specific backup file from disk
     * @param {string} filename - Backup filename
     * @returns {Promise<Buffer>} File buffer
     */
    async downloadBackupFile(filename) {
        try {
            // Security: Validate filename to prevent path traversal
            if (!filename.startsWith("hextrackr_") || (!filename.endsWith(".zip") && !filename.endsWith(".db"))) {
                throw new Error("Invalid backup filename");
            }

            if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
                throw new Error("Path traversal attempt detected");
            }

            const filePath = path.join(this.backupDir, filename);

            if (!fs.existsSync(filePath)) {
                throw new Error("Backup file not found");
            }

            _log('info', `Downloading backup file: ${filename}`);

            const fileBuffer = fs.readFileSync(filePath);

            _audit('backup.download', "Backup file downloaded", {
                filename: filename,
                size_mb: (fileBuffer.length / 1024 / 1024).toFixed(2)
            });

            return fileBuffer;

        } catch (error) {
            _log('error', "Backup download failed", { error: error.message, filename });
            throw new Error(`Backup download failed: ${error.message}`);
        }
    }

    /**
     * HEX-270: Save ZIP backup to disk (manual trigger)
     * Similar to createScheduledBackup but triggered manually from UI
     * @param {string} type - Backup type: "all", "vulnerabilities", or "tickets"
     * @returns {Promise<Object>} Backup result with file path and size
     */
    async saveBackupToDisk(type = "all") {
        try {
            _log('info', `Saving ${type} backup to disk (manual trigger)...`);

            // Ensure backup directory exists
            if (!fs.existsSync(this.backupDir)) {
                fs.mkdirSync(this.backupDir, { recursive: true });
                _log('info', "Created backup directory", { path: this.backupDir });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split(".")[0];
            const manualSuffix = "_manual"; // Distinguish manual from automated backups

            let zipBuffer;
            let filename;

            // Generate appropriate backup based on type
            switch (type) {
                case "all":
                    zipBuffer = await this.exportAllAsZip();
                    filename = `hextrackr_data_${timestamp}${manualSuffix}.zip`;
                    break;
                case "vulnerabilities":
                    zipBuffer = await this.exportVulnerabilitiesAsZip();
                    filename = `hextrackr_data_${timestamp}${manualSuffix}.zip`;
                    break;
                case "tickets":
                    zipBuffer = await this.exportTicketsAsZip();
                    filename = `hextrackr_data_${timestamp}${manualSuffix}.zip`;
                    break;
                default:
                    throw new Error(`Invalid backup type: ${type}`);
            }

            // Save to disk
            const filePath = path.join(this.backupDir, filename);
            fs.writeFileSync(filePath, zipBuffer);

            const result = {
                success: true,
                filename: filename,
                path: filePath,
                size_mb: (zipBuffer.length / 1024 / 1024).toFixed(2),
                type: type,
                timestamp: timestamp,
                is_manual: true
            };

            _audit('backup.manual', "Manual backup saved to disk", result);
            _log('info', `Manual backup saved: ${filename} (${result.size_mb}MB)`);

            // Run cleanup to maintain 7-day retention
            await this.cleanupOldBackups();

            return result;

        } catch (error) {
            _log('error', "Manual backup failed", { error: error.message, type });
            throw new Error(`Manual backup failed: ${error.message}`);
        }
    }

    /**
     * HEX-270: Clean up old backups (smart retention policy)
     * Retention policy per backup type:
     * - Keep 7 most recent automated backups
     * - Keep 3 most recent manual backups
     * - Total maximum: 10 backups per type
     * @returns {Promise<Object>} Cleanup result with deleted file count
     */
    async cleanupOldBackups() {
        try {
            _log('info', "Starting backup cleanup (7 automated + 3 manual per type)...");

            if (!fs.existsSync(this.backupDir)) {
                _log('info', "Backup directory does not exist, skipping cleanup");
                return { success: true, deleted: 0, message: "No backups to clean" };
            }

            const files = fs.readdirSync(this.backupDir);
            const backupsByType = {
                tickets: { manual: [], automated: [] },
                vulnerabilities: { manual: [], automated: [] },
                database: { manual: [], automated: [] }
            };

            // Categorize backups by type and source
            for (const file of files) {
                if (!file.startsWith("hextrackr_") || (!file.endsWith(".zip") && !file.endsWith(".db"))) {
                    continue;
                }

                const filePath = path.join(this.backupDir, file);
                const stats = fs.statSync(filePath);
                const isManual = file.includes("_manual");

                // Determine backup type
                let backupType = null;
                if (file.includes("tickets_backup")) {
                    backupType = "tickets";
                } else if (file.includes("vulnerabilities_backup")) {
                    backupType = "vulnerabilities";
                } else if (file.endsWith(".db")) {
                    backupType = "database";
                }

                if (backupType) {
                    const category = isManual ? "manual" : "automated";
                    backupsByType[backupType][category].push({
                        file,
                        filePath,
                        stats,
                        mtime: stats.mtimeMs
                    });
                }
            }

            let deletedCount = 0;
            let deletedSize = 0;

            // Apply retention policy to each type
            for (const [type, categories] of Object.entries(backupsByType)) {
                // Keep 7 most recent automated backups
                categories.automated.sort((a, b) => b.mtime - a.mtime);
                const automatedToDelete = categories.automated.slice(7);

                for (const backup of automatedToDelete) {
                    _log('info', `Deleting old automated ${type} backup: ${backup.file}`);
                    deletedSize += backup.stats.size;
                    fs.unlinkSync(backup.filePath);
                    deletedCount++;
                }

                // Keep 3 most recent manual backups
                categories.manual.sort((a, b) => b.mtime - a.mtime);
                const manualToDelete = categories.manual.slice(3);

                for (const backup of manualToDelete) {
                    _log('info', `Deleting old manual ${type} backup: ${backup.file}`);
                    deletedSize += backup.stats.size;
                    fs.unlinkSync(backup.filePath);
                    deletedCount++;
                }

                _log('info', `${type}: Keeping ${Math.min(categories.automated.length - automatedToDelete.length, 7)} automated + ${Math.min(categories.manual.length - manualToDelete.length, 3)} manual`);
            }

            const result = {
                success: true,
                deleted: deletedCount,
                freed_mb: (deletedSize / 1024 / 1024).toFixed(2),
                retention_policy: "7 automated + 3 manual per type"
            };

            if (deletedCount > 0) {
                _audit('backup.cleanup', "Old backups cleaned up", result);
                _log('info', `Cleanup complete: ${deletedCount} files deleted, ${result.freed_mb}MB freed`);
            } else {
                _log('info', "No old backups to delete");
            }

            return result;

        } catch (error) {
            _log('error', "Backup cleanup failed", { error: error.message });
            throw new Error(`Backup cleanup failed: ${error.message}`);
        }
    }
}

module.exports = BackupService;