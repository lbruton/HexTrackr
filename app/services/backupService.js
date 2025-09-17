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
     * Export vulnerabilities data
     * Extracted from server.js line 3304-3317
     */
    async exportVulnerabilities() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM vulnerabilities LIMIT 10000", (err, rows) => {
                if (err) {
                    return reject(new Error("Export failed: " + err.message));
                }

                resolve({
                    type: "vulnerabilities",
                    count: rows.length,
                    data: rows,
                    exported_at: new Date().toISOString()
                });
            });
        });
    }

    /**
     * Export tickets data
     * Extracted from server.js line 3606-3621
     */
    async exportTickets() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM tickets ORDER BY created_at DESC", (err, rows) => {
                if (err) {
                    return reject(new Error("Failed to fetch tickets: " + err.message));
                }

                resolve({
                    type: "tickets",
                    count: rows.length,
                    data: rows,
                    exported_at: new Date().toISOString()
                });
            });
        });
    }

    /**
     * Export complete backup (vulnerabilities + tickets)
     * Extracted from server.js line 3623-3651
     */
    async exportAll() {
        return new Promise((resolve, reject) => {
            // Get vulnerabilities and tickets from database
            this.db.all("SELECT * FROM vulnerabilities LIMIT 10000", (err, vulnRows) => {
                if (err) {
                    return reject(new Error("Export failed: " + err.message));
                }

                this.db.all("SELECT * FROM tickets ORDER BY created_at DESC", (ticketErr, ticketRows) => {
                    if (ticketErr) {
                        return reject(new Error("Export failed - tickets error: " + ticketErr.message));
                    }

                    resolve({
                        type: "complete_backup",
                        vulnerabilities: {
                            count: vulnRows.length,
                            data: vulnRows
                        },
                        tickets: {
                            count: ticketRows.length,
                            data: ticketRows
                        },
                        exported_at: new Date().toISOString()
                    });
                });
            });
        });
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
}

module.exports = BackupService;