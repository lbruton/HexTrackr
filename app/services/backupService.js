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
                    try {
                        const dbPath = path.join(__dirname, "..", "data", "hextrackr.db");
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
            console.log("🔄 Starting comprehensive database backup...");

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

            console.log(`✅ Backup complete: ${totalVulnRecords} vulnerability records, ${totalTicketRecords} ticket/template records`);

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
            console.error("❌ Complete backup failed:", error.message);
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
                const clearPromises = [
                    new Promise((res, rej) => this.db.run("DELETE FROM cisco_advisories", err => err ? rej(err) : res())),
                    new Promise((res, rej) => this.db.run("DELETE FROM palo_alto_advisories", err => err ? rej(err) : res())),
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
                        message: "All data cleared successfully (authentication preserved)",
                        clearedCount: "all"
                    }))
                    .catch(err => reject(new Error("Failed to clear all data: " + err.message)));

            } else if (type === "vulnerabilities") {
                // Clear vulnerability tables in dependency order (cascade deletes)
                this.db.run("DELETE FROM cisco_advisories", (ciscoErr) => {
                    if (ciscoErr) {
                        return reject(new Error("Failed to clear Cisco advisories"));
                    }

                    this.db.run("DELETE FROM palo_alto_advisories", (paloErr) => {
                        if (paloErr) {
                            return reject(new Error("Failed to clear Palo Alto advisories"));
                        }

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
                                                    message: "Vulnerability data cleared successfully (including advisories)",
                                                    clearedCount: "vulnerabilities"
                                                });
                                            });
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

                        // Insert tickets data
                        const ticketValues = ticketsArray.map(ticket => [
                            ticket.xt_number || "",
                            ticket.date_submitted || "",
                            ticket.date_due || "",
                            ticket.hexagon_ticket || "",
                            ticket.service_now_ticket || "",
                            ticket.location || "",
                            ticket.devices || "",
                            ticket.supervisor || "",
                            ticket.tech || "",
                            ticket.status || "",
                            ticket.notes || "",
                            ticket.created_at || new Date().toISOString(),
                            ticket.updated_at || new Date().toISOString()
                        ]);

                        for (const values of ticketValues) {
                            await this._executeQuery(`
                                INSERT INTO tickets
                                (xt_number, date_submitted, date_due, hexagon_ticket, service_now_ticket,
                                location, devices, supervisor, tech, status, notes, created_at, updated_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                console.warn("Could not clean up uploaded file:", unlinkError.message);
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
                console.warn("Could not clean up uploaded file after error:", unlinkError.message);
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
            console.log("🔄 Creating comprehensive ZIP backup...");

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

            console.log(`✅ ZIP backup created: ${(zipBuffer.length / 1024 / 1024).toFixed(1)}MB`);

            return zipBuffer;

        } catch (error) {
            console.error("❌ ZIP backup creation failed:", error.message);
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
            console.log("🔄 Creating vulnerabilities ZIP backup...");

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
                        console.log(`📦 Splitting ${key} into ${numChunks} chunks (${recordCount} records)`);

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
            console.log(`✅ Vulnerabilities ZIP created: ${(zipBuffer.length / 1024 / 1024).toFixed(1)}MB`);

            return zipBuffer;

        } catch (error) {
            console.error("❌ Vulnerabilities ZIP backup failed:", error.message);
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
            console.log("🔄 Creating tickets ZIP backup...");

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
            console.log(`✅ Tickets ZIP created: ${(zipBuffer.length / 1024 / 1024).toFixed(1)}MB`);

            return zipBuffer;

        } catch (error) {
            console.error("❌ Tickets ZIP backup failed:", error.message);
            throw new Error(`Tickets ZIP backup failed: ${error.message}`);
        }
    }
}

module.exports = BackupService;