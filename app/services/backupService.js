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
                        const dbPath = path.join(__dirname, "..", "public", "data", "hextrackr.db");
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
                    this._fetchData("SELECT * FROM vulnerability_imports"),
                    this._fetchData("SELECT * FROM vulnerability_templates"),
                    this._fetchData("SELECT * FROM kev_status"),
                    this._fetchData("SELECT * FROM ticket_vulnerabilities")
                ]);

                const [current, snapshots, dailyTotals, imports, templates, kevStatus, ticketVulns] = vulnerabilitiesData;

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

            // Get comprehensive data from both export functions
            const [vulnerabilityData, ticketData] = await Promise.all([
                this.exportVulnerabilities(),
                this.exportTickets()
            ]);

            // Calculate total record counts for logging
            const totalVulnRecords = Object.keys(vulnerabilityData)
                .filter(key => key !== 'type' && key !== 'exported_at')
                .reduce((sum, key) => sum + (vulnerabilityData[key]?.count || 0), 0);

            const totalTicketRecords = Object.keys(ticketData)
                .filter(key => key !== 'type' && key !== 'exported_at')
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
                // For 'all', clear all rollover vulnerability tables and tickets
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

                            this.db.run("DELETE FROM tickets", (ticketErr) => {
                                if (ticketErr) {
                                    return reject(new Error("Failed to clear tickets"));
                                }

                                resolve({
                                    message: "All data cleared successfully",
                                    clearedCount: "all"
                                });
                            });
                        });
                    });
                });

            } else if (type === "vulnerabilities") {
                // Clear only vulnerability tables
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

                            resolve({
                                message: "Vulnerability data cleared successfully",
                                clearedCount: "vulnerabilities"
                            });
                        });
                    });
                });

            } else if (type === "tickets") {
                // Clear only tickets
                this.db.run("DELETE FROM tickets", function(err) {
                    if (err) {
                        return reject(new Error("Failed to clear tickets"));
                    }

                    resolve({
                        message: "Tickets cleared successfully",
                        clearedCount: this.changes
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
            const fileData = PathValidator.safeReadFileSync(filePath);
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

                    if (ticketsData && ticketsData.data && Array.isArray(ticketsData.data)) {
                        // Clear existing tickets if requested
                        if (clearExisting) {
                            await this._executeQuery("DELETE FROM tickets");
                        }

                        // Insert tickets data
                        const ticketValues = ticketsData.data.map(ticket => [
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

                    if (vulnData && vulnData.data && Array.isArray(vulnData.data)) {
                        // Clear existing vulnerabilities if requested
                        if (clearExisting) {
                            await this._executeQuery("DELETE FROM vulnerability_snapshots");
                            await this._executeQuery("DELETE FROM vulnerabilities_current");
                            await this._executeQuery("DELETE FROM vulnerability_daily_totals");
                        }

                        // Insert vulnerability data
                        const vulnValues = vulnData.data.map(vuln => [
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

            // Add main backup data
            zip.file("complete_backup.json", JSON.stringify(backupData, null, 2));

            // Add individual table exports for easier restoration
            zip.file("vulnerabilities_current.json", JSON.stringify(backupData.vulnerability_data.vulnerabilities_current, null, 2));
            zip.file("vulnerability_snapshots.json", JSON.stringify(backupData.vulnerability_data.vulnerability_snapshots, null, 2));
            zip.file("vulnerability_daily_totals.json", JSON.stringify(backupData.vulnerability_data.vulnerability_daily_totals, null, 2));
            zip.file("vulnerability_imports.json", JSON.stringify(backupData.vulnerability_data.vulnerability_imports, null, 2));
            zip.file("tickets.json", JSON.stringify(backupData.ticket_data.tickets, null, 2));
            zip.file("ticket_templates.json", JSON.stringify(backupData.ticket_data.ticket_templates, null, 2));
            zip.file("email_templates.json", JSON.stringify(backupData.ticket_data.email_templates, null, 2));
            zip.file("kev_status.json", JSON.stringify(backupData.vulnerability_data.kev_status, null, 2));

            // Add metadata file
            const metadata = {
                backup_type: "complete_enhanced_zip",
                created_at: new Date().toISOString(),
                version: "2.0",
                tables_included: [
                    "vulnerabilities_current", "vulnerability_snapshots", "vulnerability_daily_totals",
                    "vulnerability_imports", "vulnerability_templates", "kev_status", "ticket_vulnerabilities",
                    "tickets", "ticket_templates", "email_templates", "sync_metadata"
                ],
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

            // Add vulnerability data
            zip.file("vulnerabilities.json", JSON.stringify(vulnData, null, 2));

            // Add individual tables
            Object.keys(vulnData).forEach(key => {
                if (key !== 'type' && key !== 'exported_at' && vulnData[key].data) {
                    zip.file(`${key}.json`, JSON.stringify(vulnData[key], null, 2));
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

            // Add ticket data
            zip.file("tickets.json", JSON.stringify(ticketData, null, 2));

            // Add individual tables
            Object.keys(ticketData).forEach(key => {
                if (key !== 'type' && key !== 'exported_at' && ticketData[key].data) {
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