/**
 * @fileoverview CISA Known Exploited Vulnerabilities (KEV) Service
 * @module kevService
 * @description Service for syncing and managing CISA KEV data
 * @since v1.0.21
 */

/**
 * Defensive logging helpers
 * Safely log to LoggingService with fallback for initialization
 */
function _log(level, message, data = {}) {
    if (global.logger && global.logger.kev && typeof global.logger.kev[level] === "function") {
        global.logger.kev[level](message, data);
    }
}

function _audit(category, message, data = {}) {
    if (global.logger && typeof global.logger.audit === "function") {
        global.logger.audit(category, message, data, null, null);
    }
}

/**
 * CISA KEV Service
 * @class KevService
 * @description Handles synchronization with CISA KEV API and database operations
 */
class KevService {
    /**
     * Creates an instance of KevService
     * @param {Object} db - Database instance
     */
    constructor(db) {
        this.db = db;
        this.kevApiUrl = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
        this.lastSyncTime = null;
        this.syncInProgress = false;

        // Initialize fetch - use global fetch (Node 18+) or require https module
        this.fetch = global.fetch || this._initHttpsClient();

        // Initialize database tables if they don't exist
        this.initializeTables();
    }

    /**
     * Initialize KEV database tables
     * @async
     */
    async initializeTables() {
        try {
            // Create KEV status table
            await this.db.run(`
                CREATE TABLE IF NOT EXISTS kev_status (
                    cve_id TEXT PRIMARY KEY,
                    date_added DATE NOT NULL,
                    vulnerability_name TEXT,
                    vendor_project TEXT,
                    product TEXT,
                    required_action TEXT,
                    due_date DATE,
                    known_ransomware_use BOOLEAN DEFAULT 0,
                    notes TEXT,
                    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create indexes
            await this.db.run("CREATE INDEX IF NOT EXISTS idx_kev_status_cve_id ON kev_status(cve_id)");
            await this.db.run("CREATE INDEX IF NOT EXISTS idx_kev_status_due_date ON kev_status(due_date)");
            await this.db.run("CREATE INDEX IF NOT EXISTS idx_kev_status_date_added ON kev_status(date_added)");
            await this.db.run("CREATE INDEX IF NOT EXISTS idx_kev_status_ransomware ON kev_status(known_ransomware_use) WHERE known_ransomware_use = 1");

            // Create sync metadata table
            await this.db.run(`
                CREATE TABLE IF NOT EXISTS sync_metadata (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sync_type TEXT NOT NULL,
                    sync_time TIMESTAMP NOT NULL,
                    next_sync_time TIMESTAMP,
                    version TEXT,
                    record_count INTEGER,
                    status TEXT DEFAULT 'completed',
                    error_message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await this.db.run("CREATE INDEX IF NOT EXISTS idx_sync_metadata_type_time ON sync_metadata(sync_type, sync_time DESC)");

            _log("info", "KEV database tables initialized (HEX-279: next_sync_time column included)");
        } catch (error) {
            _log("error", "Failed to initialize KEV tables:", error);
        }
    }

    /**
     * Fallback HTTPS client for environments without global fetch
     * @private
     */
    _initHttpsClient() {
        const https = require("https");

        return (url) => {
            return new Promise((resolve, reject) => {
                const request = https.get(url, (response) => {
                    let data = "";

                    response.on("data", (chunk) => {
                        data += chunk;
                    });

                    response.on("end", () => {
                        resolve({
                            ok: response.statusCode >= 200 && response.statusCode < 300,
                            status: response.statusCode,
                            statusText: response.statusMessage,
                            json: () => Promise.resolve(JSON.parse(data))
                        });
                    });
                });

                request.on("error", reject);
            });
        };
    }

    /**
     * Sync KEV data from CISA API
     * @async
     * @returns {Promise<Object>} Sync result with statistics
     * @throws {Error} If sync fails
     */
    async syncKevData() {
        if (this.syncInProgress) {
            throw new Error("Sync already in progress");
        }

        this.syncInProgress = true;
        _log("info", "Starting CISA KEV data sync");

        try {
            // Fetch KEV data from CISA
            const response = await this.fetch(this.kevApiUrl);
            if (!response.ok) {
                throw new Error(`CISA API returned status ${response.status}`);
            }

            const kevData = await response.json();
            _log("info", ` Fetched ${kevData.vulnerabilities.length} KEV entries from CISA`);

            // Use promise-based database operations
            await new Promise((resolve, reject) => {
                this.db.run("BEGIN TRANSACTION", (err) => {
                    if (err) {reject(err);}
                    else {resolve();}
                });
            });

            try {
                // Simple refresh strategy: truncate and reload
                await new Promise((resolve, reject) => {
                    this.db.run("DELETE FROM kev_status", (err) => {
                        if (err) {reject(err);}
                        else {resolve();}
                    });
                });
                _log("info", "Cleared existing KEV data");

                // Prepare insert statement
                const insertStmt = await new Promise((resolve, reject) => {
                    const stmt = this.db.prepare(`
                        INSERT INTO kev_status (
                            cve_id, date_added, vulnerability_name, vendor_project,
                            product, required_action, due_date, known_ransomware_use, notes
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, (err) => {
                        if (err) {reject(err);}
                        else {resolve(stmt);}
                    });
                });

                // Bulk insert KEV data
                let insertCount = 0;
                for (const kev of kevData.vulnerabilities) {
                    await new Promise((resolve, reject) => {
                        insertStmt.run(
                            kev.cveID,
                            kev.dateAdded,
                            kev.vulnerabilityName,
                            kev.vendorProject,
                            kev.product,
                            kev.requiredAction,
                            kev.dueDate,
                            kev.knownRansomwareCampaignUse === "Known" ? 1 : 0,
                            kev.notes || null,
                            (err) => {
                                if (err) {
                                    _log("error", ` Insert failed for ${kev.cveID}:`, err);
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            }
                        );
                    });
                    insertCount++;
                }

                await new Promise((resolve, reject) => {
                    insertStmt.finalize((err) => {
                        if (err) {reject(err);}
                        else {resolve();}
                    });
                });

                await new Promise((resolve, reject) => {
                    this.db.run("COMMIT", (err) => {
                        if (err) {reject(err);}
                        else {resolve();}
                    });
                });

                // Update sync metadata
                this.lastSyncTime = new Date().toISOString();
                await this.updateSyncMetadata(kevData.catalogVersion, insertCount);

                // Get match statistics
                const matchedCount = await this.getMatchedVulnerabilitiesCount();

                _log("info", ` KEV sync completed: ${insertCount} KEVs imported, ${matchedCount} matched`);

                return {
                    success: true,
                    totalKevs: insertCount,
                    matchedCount: matchedCount,
                    lastSync: this.lastSyncTime,
                    catalogVersion: kevData.catalogVersion
                };

            } catch (dbError) {
                await new Promise((resolve, reject) => {
                    this.db.run("ROLLBACK", (err) => {
                        if (err) {reject(err);}
                        else {resolve();}
                    });
                });
                throw dbError;
            }

        } catch (error) {
            _log("error", "KEV sync failed:", error);
            throw error;
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Check if a CVE is in the KEV catalog
     * @async
     * @param {string} cveId - CVE identifier
     * @returns {Promise<boolean>} True if CVE is in KEV catalog
     */
    async isKevVulnerability(cveId) {
        if (!cveId) {return false;}

        const result = await new Promise((resolve, reject) => {
            this.db.get("SELECT 1 FROM kev_status WHERE cve_id = ?", [cveId], (err, row) => {
                if (err) {reject(err);}
                else {resolve(row);}
            });
        });

        return !!result;
    }

    /**
     * Get KEV metadata for a specific CVE
     * @async
     * @param {string} cveId - CVE identifier
     * @returns {Promise<Object|null>} KEV metadata or null if not found
     */
    async getKevMetadata(cveId) {
        if (!cveId) {return null;}

        return await new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM kev_status WHERE cve_id = ?", [cveId], (err, row) => {
                if (err) {reject(err);}
                else {resolve(row);}
            });
        });
    }

    /**
     * Get all KEV vulnerabilities
     * @async
     * @returns {Promise<Array>} Array of all KEV entries
     */
    async getAllKevs() {
        return await new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM kev_status ORDER BY date_added DESC", (err, rows) => {
                if (err) {reject(err);}
                else {resolve(rows);}
            });
        });
    }

    /**
     * Get count of matched vulnerabilities in environment
     * @async
     * @returns {Promise<number>} Count of matched vulnerabilities
     */
    async getMatchedVulnerabilitiesCount() {
        const result = await new Promise((resolve, reject) => {
            this.db.get(`
                SELECT COUNT(DISTINCT v.cve) as count
                FROM vulnerabilities_current v
                INNER JOIN kev_status k ON v.cve = k.cve_id
                WHERE v.state IN ('ACTIVE', 'NEW', 'RESURFACED')
            `, (err, row) => {
                if (err) {reject(err);}
                else {resolve(row);}
            });
        });

        return result?.count || 0;
    }

    /**
     * Get matched KEV vulnerabilities with details
     * @async
     * @param {number} limit - Maximum number of results
     * @returns {Promise<Array>} Array of matched vulnerabilities
     */
    async getMatchedVulnerabilities(limit = 100) {
        return await new Promise((resolve, reject) => {
            this.db.all(`
                SELECT
                    v.*,
                    k.date_added as kev_date_added,
                    k.vulnerability_name as kev_name,
                    k.vendor_project,
                    k.product,
                    k.required_action,
                    k.due_date,
                    k.known_ransomware_use
                FROM vulnerabilities_current v
                INNER JOIN kev_status k ON v.cve = k.cve_id
                WHERE v.state IN ('ACTIVE', 'NEW', 'RESURFACED')
                ORDER BY k.due_date ASC, v.cvss_score DESC
                LIMIT ?
            `, [limit], (err, rows) => {
                if (err) {reject(err);}
                else {resolve(rows);}
            });
        });
    }

    /**
     * Get KEV sync status
     * @async
     * @returns {Promise<Object>} Sync status information
     */
    async getSyncStatus() {
        // Get total KEV count
        const kevCountResult = await new Promise((resolve, reject) => {
            this.db.get("SELECT COUNT(*) as count FROM kev_status", (err, row) => {
                if (err) {reject(err);}
                else {resolve(row);}
            });
        });

        // Get matched count
        const matchedCount = await this.getMatchedVulnerabilitiesCount();

        // Get sync metadata
        const metadata = await new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM sync_metadata WHERE sync_type = 'kev' ORDER BY sync_time DESC LIMIT 1", (err, row) => {
                if (err) {reject(err);}
                else {resolve(row);}
            });
        });

        return {
            totalKevs: kevCountResult?.count || 0,
            matchedCount: matchedCount,
            lastSync: metadata?.sync_time || null,
            nextSync: metadata?.next_sync_time || null,
            catalogVersion: metadata?.version || null,
            syncInProgress: this.syncInProgress
        };
    }

    /**
     * Update sync metadata in database
     * @async
     * @param {string} version - Catalog version
     * @param {number} recordCount - Number of records synced
     * @returns {Promise<void>}
     */
    async updateSyncMetadata(version, recordCount) {
        // Calculate next sync time (24 hours from now)
        const nextSyncTime = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString();

        await new Promise((resolve, reject) => {
            this.db.run(`
                INSERT INTO sync_metadata (sync_type, sync_time, next_sync_time, version, record_count)
                VALUES ('kev', ?, ?, ?, ?)
            `, [this.lastSyncTime, nextSyncTime, version, recordCount], (err) => {
                if (err) {reject(err);}
                else {resolve();}
            });
        });
    }

    /**
     * Check if auto-sync is needed
     * @async
     * @param {number} hoursThreshold - Hours since last sync (default: 24)
     * @returns {Promise<boolean>} True if sync is needed
     */
    async isAutoSyncNeeded(hoursThreshold = 24) {
        const metadata = await new Promise((resolve, reject) => {
            this.db.get("SELECT sync_time FROM sync_metadata WHERE sync_type = 'kev' ORDER BY sync_time DESC LIMIT 1", (err, row) => {
                if (err) {reject(err);}
                else {resolve(row);}
            });
        });

        if (!metadata?.sync_time) {
            return true; // Never synced
        }

        const lastSync = new Date(metadata.sync_time);
        const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);

        return hoursSinceSync >= hoursThreshold;
    }

    /**
     * Get KEV statistics for dashboard
     * @async
     * @returns {Promise<Object>} Dashboard statistics
     */
    async getDashboardStats() {
        const stats = await new Promise((resolve, reject) => {
            this.db.get(`
                SELECT
                    (SELECT COUNT(*) FROM kev_status) as total_kevs,
                    (SELECT COUNT(*) FROM kev_status WHERE known_ransomware_use = 1) as ransomware_kevs,
                    (SELECT COUNT(DISTINCT v.cve)
                     FROM vulnerabilities_current v
                     INNER JOIN kev_status k ON v.cve = k.cve_id
                     WHERE v.state IN ('ACTIVE', 'NEW', 'RESURFACED')) as matched_kevs,
                    (SELECT COUNT(DISTINCT v.cve)
                     FROM vulnerabilities_current v
                     INNER JOIN kev_status k ON v.cve = k.cve_id
                     WHERE v.state IN ('ACTIVE', 'NEW', 'RESURFACED') AND k.due_date < date('now')) as overdue_kevs
            `, (err, row) => {
                if (err) {reject(err);}
                else {resolve(row);}
            });
        });

        return stats || {
            total_kevs: 0,
            ransomware_kevs: 0,
            matched_kevs: 0,
            overdue_kevs: 0
        };
    }
}

module.exports = KevService;