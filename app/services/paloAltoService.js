/**
 * @fileoverview Palo Alto Security Advisory Service
 * @module paloAltoService
 * @description Service for syncing and managing Palo Alto Networks advisory data with fixed software versions
 * @since v1.0.63
 * @see {@link https://security.paloaltonetworks.com/ Palo Alto Security Advisories}
 */

/**
 * Palo Alto Security Advisory Service
 * @class PaloAltoService
 * @description Handles synchronization with Palo Alto Security Advisory API and database operations for advisory data
 *
 * Architecture Pattern: Mirrors Cisco service implementation
 * - Public API (no authentication required)
 * - Bulk sync operations with transaction safety
 * - Denormalized display columns for performance
 * - Vendor-neutral + vendor-specific column strategy
 */
class PaloAltoService {
    /**
     * Creates an instance of PaloAltoService
     * @param {Object} db - Database instance (better-sqlite3)
     * @param {Object} preferencesService - PreferencesService instance (not used for Palo Alto, kept for consistency)
     */
    constructor(db, preferencesService) {
        this.db = db;
        this.preferencesService = preferencesService;

        // Palo Alto Security Advisory API endpoint (public, no auth)
        this.paloApiBaseUrl = "https://security.paloaltonetworks.com/json";

        this.lastSyncTime = null;
        this.syncInProgress = false;

        // Initialize fetch - use global fetch (Node 18+) or require https module
        this.fetch = global.fetch || this._initHttpsClient();

        // Initialize database tables if they don't exist
        this.initializeTables();
    }

    /**
     * Initialize Palo Alto advisory database tables
     * @async
     */
    async initializeTables() {
        try {
            // Create palo_alto_advisories table
            await this.db.run(`
                CREATE TABLE IF NOT EXISTS palo_alto_advisories (
                    cve_id TEXT PRIMARY KEY,
                    advisory_id TEXT,
                    advisory_title TEXT,
                    severity TEXT,
                    cvss_score TEXT,
                    first_fixed TEXT,
                    affected_versions TEXT,
                    product_name TEXT,
                    publication_url TEXT,
                    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create indexes
            await this.db.run("CREATE INDEX IF NOT EXISTS idx_palo_advisories_cve ON palo_alto_advisories(cve_id)");
            await this.db.run("CREATE INDEX IF NOT EXISTS idx_palo_advisories_synced ON palo_alto_advisories(last_synced)");
            await this.db.run(`
                CREATE INDEX IF NOT EXISTS idx_vulnerabilities_is_fixed
                ON vulnerabilities(is_fixed)
                WHERE is_fixed = 1
            `);

            // Note: vulnerabilities table columns (is_fixed, fixed_palo_versions, etc.)
            // are created by migration 006-palo-alto-advisories.sql
            // No need to ALTER TABLE here - columns already exist from migration

            // sync_metadata table already exists from KEV/Cisco implementation
            console.log("Palo Alto advisory database tables initialized");
        } catch (error) {
            console.error("Failed to initialize Palo Alto advisory tables:", error);
        }
    }

    /**
     * Fallback HTTPS client for environments without global fetch
     * @private
     */
    _initHttpsClient() {
        const https = require("https");

        return (url, options = {}) => {
            return new Promise((resolve, reject) => {
                const urlObj = new URL(url);
                const requestOptions = {
                    hostname: urlObj.hostname,
                    port: urlObj.port || 443,
                    path: urlObj.pathname + urlObj.search,
                    method: options.method || "GET",
                    headers: options.headers || {}
                };

                if (options.body) {
                    requestOptions.headers["Content-Length"] = Buffer.byteLength(options.body);
                }

                const request = https.request(requestOptions, (response) => {
                    let data = "";

                    response.on("data", (chunk) => {
                        data += chunk;
                    });

                    response.on("end", () => {
                        resolve({
                            ok: response.statusCode >= 200 && response.statusCode < 300,
                            status: response.statusCode,
                            statusText: response.statusMessage,
                            json: () => Promise.resolve(JSON.parse(data)),
                            text: () => Promise.resolve(data)
                        });
                    });
                });

                request.on("error", reject);

                if (options.body) {
                    request.write(options.body);
                }

                request.end();
            });
        };
    }

    /**
     * Get all CVE IDs present in vulnerabilities_current for Palo Alto devices
     * Used to filter advisory API queries - only sync advisories for CVEs we actually have
     *
     * @async
     * @returns {Promise<Array<string>>} Array of CVE IDs in our database
     */
    async getAllPaloCveIds() {
        return await new Promise((resolve, reject) => {
            this.db.all(`
                SELECT DISTINCT cve
                FROM vulnerabilities_current
                WHERE cve IS NOT NULL
                  AND cve LIKE 'CVE-%'
                  AND vendor LIKE '%Palo Alto%'
                  AND lifecycle_state IN ('active', 'reopened')
            `, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => row.cve));
                }
            });
        });
    }

    /**
     * Fetch all CVE IDs from vulnerabilities_current table for advisory lookup
     * Only queries active and reopened vulnerabilities (not resolved)
     * Excludes CVEs with fresh advisory data (synced within TTL window)
     * Includes CVEs with stale data (>30 days old) for refresh
     * @async
     * @param {number} ttlDays - Time-to-live in days (default: 30)
     * @returns {Promise<Array<string>>} Array of CVE identifiers needing sync
     */
    async getAllCveIds(ttlDays = 30) {
        return await new Promise((resolve, reject) => {
            this.db.all(`
                SELECT DISTINCT vc.cve
                FROM vulnerabilities_current vc
                LEFT JOIN palo_alto_advisories pa ON vc.cve = pa.cve_id
                WHERE vc.cve IS NOT NULL
                  AND vc.cve LIKE 'CVE-%'
                  AND vc.vendor LIKE '%Palo Alto%'
                  AND vc.lifecycle_state IN ('active', 'reopened')
                  AND (
                      pa.cve_id IS NULL  -- Never synced
                      OR julianday('now') - julianday(pa.last_synced) > ?  -- Stale (>TTL days)
                  )
            `, [ttlDays], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => row.cve));
                }
            });
        });
    }

    /**
     * Fetch Palo Alto advisory data for a single CVE
     * @async
     * @param {string} cveId - CVE identifier
     * @returns {Promise<Object|null>} Advisory data or null if not found
     */
    async fetchPaloAdvisoryForCve(cveId) {
        try {
            const response = await this.fetch(`${this.paloApiBaseUrl}/${cveId}`, {
                headers: {
                    "Accept": "application/json"
                }
            });

            if (response.status === 404) {
                // CVE not found in Palo Alto advisories - not an error
                return null;
            }

            if (!response.ok) {
                throw new Error(`Palo Alto API returned status ${response.status} for ${cveId}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(` Failed to fetch advisory for ${cveId}:`, error.message);
            return null;
        }
    }

    /**
     * Parse Palo Alto advisory response (CVE 5.0 format) and extract relevant fields
     * @param {Object} advisoryData - Raw advisory data from Palo Alto API
     * @param {string} queriedCveId - The CVE ID we queried for
     * @returns {Object|null} Parsed advisory object for the specific CVE
     */
    parseAdvisoryData(advisoryData, queriedCveId) {
        if (!advisoryData || !advisoryData.cveMetadata) {
            console.log(` Invalid advisory data for ${queriedCveId}`);
            return null;
        }

        // CVE 5.0 format structure:
        // {
        //   cveMetadata: { cveId, state },
        //   containers: {
        //     cna: {
        //       title: "...",
        //       metrics: [{ cvssV4_0: { baseSeverity, baseScore } }],
        //       affected: [{
        //         vendor: "Palo Alto Networks",
        //         product: "PAN-OS",
        //         versions: [{
        //           version: "10.2",
        //           status: "affected",
        //           changes: [
        //             { at: "10.2.0-h3", status: "unaffected" },
        //             { at: "10.2.1-h2", status: "unaffected" }
        //           ]
        //         }]
        //       }],
        //       x_affectedList: ["PAN-OS 10.2.9", "PAN-OS 10.2.8-h3", ...]
        //     }
        //   }
        // }

        const cveId = advisoryData.cveMetadata.cveId;
        const cna = advisoryData.containers?.cna;

        if (!cna) {
            console.log(` No CNA container found for ${queriedCveId}`);
            return null;
        }

        console.log(` Processing advisory for CVE ${cveId}`);

        // Extract severity and CVSS score from metrics
        let severity = null;
        let cvssScore = null;
        if (cna.metrics && cna.metrics.length > 0) {
            const cvssV4 = cna.metrics[0].cvssV4_0;
            if (cvssV4) {
                severity = cvssV4.baseSeverity || null; // CRITICAL, HIGH, MEDIUM, LOW
                cvssScore = cvssV4.baseScore?.toString() || null;
            }
        }

        // Extract fixed versions from affected[].versions[].changes[]
        const fixedVersions = [];
        if (cna.affected && Array.isArray(cna.affected)) {
            for (const affectedProduct of cna.affected) {
                // Filter to PAN-OS only (v1 scope)
                if (affectedProduct.product !== "PAN-OS") {
                    continue;
                }

                if (affectedProduct.versions && Array.isArray(affectedProduct.versions)) {
                    for (const versionInfo of affectedProduct.versions) {
                        if (versionInfo.changes && Array.isArray(versionInfo.changes)) {
                            for (const change of versionInfo.changes) {
                                if (change.status === "unaffected" && change.at) {
                                    fixedVersions.push(change.at);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Extract affected versions from x_affectedList
        const affectedVersions = cna.x_affectedList || [];

        // Extract product name (should always be "PAN-OS" for v1)
        let productName = "PAN-OS";
        if (cna.affected && cna.affected.length > 0) {
            productName = cna.affected[0].product || "PAN-OS";
        }

        console.log(` Severity: ${severity || "unknown"}`);
        console.log(` CVSS Score: ${cvssScore || "unknown"}`);
        console.log(` Fixed versions: ${fixedVersions.length > 0 ? fixedVersions.slice(0, 3).join(", ") : "none"}${fixedVersions.length > 3 ? "..." : ""}`);
        console.log(` Affected versions: ${affectedVersions.length}`);

        return {
            cve_id: cveId,
            advisory_id: cveId, // Palo Alto uses CVE ID as advisory ID
            advisory_title: cna.title || null,
            severity: severity,
            cvss_score: cvssScore,
            first_fixed: JSON.stringify(fixedVersions), // JSON array
            affected_versions: JSON.stringify(affectedVersions), // JSON array
            product_name: productName,
            publication_url: `https://security.paloaltonetworks.com/${cveId}`
        };
    }

    /**
     * Sync Palo Alto advisory data for all CVEs in database
     * @async
     * @param {number} _userId - User ID from session (not used for Palo Alto, kept for consistency)
     * @returns {Promise<Object>} Sync result with statistics
     * @throws {Error} If sync fails
     */
    async syncPaloAdvisories(_userId) {
        if (this.syncInProgress) {
            throw new Error("Sync already in progress");
        }

        this.syncInProgress = true;
        console.log("Starting Palo Alto Security Advisory data sync");

        try {
            // Get all Palo Alto CVE IDs needing sync (stale or never synced)
            const cveIds = await this.getAllCveIds();
            console.log(` Found ${cveIds.length} CVEs needing Palo Alto advisory sync`);

            if (cveIds.length === 0) {
                console.log("No CVEs need syncing");
                this.syncInProgress = false;
                return {
                    success: true,
                    totalAdvisories: 0,
                    matchedCount: 0,
                    totalCvesChecked: 0,
                    lastSync: this.lastSyncTime
                };
            }

            let advisoryCount = 0;
            let matchedCount = 0;
            const delayBetweenCalls = 250; // 250ms between calls (API is fast, 0.17s response time)

            // Process CVEs sequentially with small delays
            for (let i = 0; i < cveIds.length; i++) {
                const cveId = cveIds[i];

                console.log(` [${i + 1}/${cveIds.length}] Fetching advisory for ${cveId}`);

                // Fetch advisory from Palo Alto API (no auth required)
                const advisoryData = await this.fetchPaloAdvisoryForCve(cveId);

                if (!advisoryData) {
                    console.log(` No advisory found for ${cveId}`);
                    // Rate limiting: small delay even for 404s
                    if (i < cveIds.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
                    }
                    continue;
                }

                const parsed = this.parseAdvisoryData(advisoryData, cveId);

                if (parsed) {
                    // Insert or replace advisory data
                    await new Promise((resolve, reject) => {
                        this.db.run(`
                            INSERT OR REPLACE INTO palo_alto_advisories (
                                cve_id, advisory_id, advisory_title, severity, cvss_score,
                                first_fixed, affected_versions, product_name, publication_url, last_synced
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                        `, [
                            parsed.cve_id,
                            parsed.advisory_id,
                            parsed.advisory_title,
                            parsed.severity,
                            parsed.cvss_score,
                            parsed.first_fixed,
                            parsed.affected_versions,
                            parsed.product_name,
                            parsed.publication_url
                        ], (err) => {
                            if (err) {
                                console.error(` Insert failed for ${cveId}:`, err);
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });

                    // Update vulnerabilities_current with vendor-neutral fix flag
                    const fixedVersionsArray = JSON.parse(parsed.first_fixed);
                    const hasFixAvailable = (fixedVersionsArray.length > 0) ? 1 : 0;
                    await new Promise((resolve, reject) => {
                        this.db.run(`
                            UPDATE vulnerabilities_current
                            SET is_fix_available = ?
                            WHERE cve = ?
                        `, [hasFixAvailable, cveId], (err) => {
                            if (err) {
                                console.error(` Update failed for ${cveId}:`, err);
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });

                    advisoryCount++;
                    if (hasFixAvailable) {
                        matchedCount++;
                    }

                    console.log(` Processed ${cveId} (${hasFixAvailable ? "fix available" : "no fix"})`);
                }

                // Rate limiting: wait between calls
                if (i < cveIds.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
                }
            }

            // Update sync metadata
            this.lastSyncTime = new Date().toISOString();
            await this.updateSyncMetadata(advisoryCount);

            // Get actual database count
            const actualDbCount = await new Promise((resolve, reject) => {
                this.db.get("SELECT COUNT(*) as count FROM palo_alto_advisories", (err, row) => {
                    if (err) {reject(err);}
                    else {resolve(row?.count || 0);}
                });
            });

            console.log(` Palo Alto advisory sync completed: ${advisoryCount} advisories processed (${actualDbCount} unique CVEs in DB), ${matchedCount} with fixes`);

            this.syncInProgress = false;

            return {
                success: true,
                totalAdvisories: actualDbCount,
                matchedCount: matchedCount,
                totalCvesChecked: cveIds.length,
                lastSync: this.lastSyncTime
            };

        } catch (error) {
            console.error("Palo Alto advisory sync failed:", error);
            this.syncInProgress = false;
            throw error;
        }
    }

    /**
     * Get Palo Alto advisory metadata for a specific CVE
     * @async
     * @param {string} cveId - CVE identifier
     * @returns {Promise<Object|null>} Advisory metadata or null if not found
     */
    async getPaloAdvisory(cveId) {
        if (!cveId) {
            return null;
        }

        return await new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM palo_alto_advisories WHERE cve_id = ?", [cveId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Get count of advisories with fixed versions available
     * @async
     * @returns {Promise<number>} Count of advisories with fixes
     */
    async getMatchedVulnerabilitiesCount() {
        const result = await new Promise((resolve, reject) => {
            this.db.get(`
                SELECT COUNT(*) as count
                FROM palo_alto_advisories
                WHERE first_fixed IS NOT NULL
                  AND first_fixed != '[]'
            `, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        return result?.count || 0;
    }

    /**
     * Get Palo Alto advisory sync status
     * @async
     * @returns {Promise<Object>} Sync status information
     */
    async getSyncStatus() {
        // Get total advisory count
        const advisoryCountResult = await new Promise((resolve, reject) => {
            this.db.get("SELECT COUNT(*) as count FROM palo_alto_advisories", (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        // Get matched count
        const matchedCount = await this.getMatchedVulnerabilitiesCount();

        // Get total Palo Alto CVEs count from vulnerabilities table
        const totalPaloCvesResult = await new Promise((resolve, reject) => {
            this.db.get(`
                SELECT COUNT(DISTINCT cve) as count
                FROM vulnerabilities_current
                WHERE vendor LIKE '%Palo Alto%'
                  AND lifecycle_state IN ('active', 'reopened')
            `, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        // Get sync metadata
        const metadata = await new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM sync_metadata WHERE sync_type = 'palo_alto' ORDER BY sync_time DESC LIMIT 1", (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        return {
            totalPaloCves: totalPaloCvesResult?.count || 0,
            totalAdvisories: advisoryCountResult?.count || 0,
            matchedCount: matchedCount,
            lastSync: metadata?.sync_time || null,
            recordCount: metadata?.record_count || 0,
            syncInProgress: this.syncInProgress
        };
    }

    /**
     * Update sync metadata in database
     * @async
     * @param {number} recordCount - Number of records synced
     * @returns {Promise<void>}
     */
    async updateSyncMetadata(recordCount) {
        await new Promise((resolve, reject) => {
            this.db.run(`
                INSERT INTO sync_metadata (sync_type, sync_time, version, record_count)
                VALUES ('palo_alto', ?, NULL, ?)
            `, [this.lastSyncTime, recordCount], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
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
            this.db.get("SELECT sync_time FROM sync_metadata WHERE sync_type = 'palo_alto' ORDER BY sync_time DESC LIMIT 1", (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        if (!metadata?.sync_time) {
            return true; // Never synced
        }

        const lastSync = new Date(metadata.sync_time);
        const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);

        return hoursSinceSync >= hoursThreshold;
    }
}

module.exports = PaloAltoService;
