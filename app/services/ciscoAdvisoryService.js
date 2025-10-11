/**
 * @fileoverview Cisco PSIRT Advisory Service
 * @module ciscoAdvisoryService
 * @description Service for syncing and managing Cisco PSIRT advisory data with fixed software versions
 * @since v1.0.63
 * @see {@link https://developer.cisco.com/docs/psirt/ Cisco PSIRT API Documentation}
 */

/**
 * Cisco PSIRT Advisory Service
 * @class CiscoAdvisoryService
 * @description Handles synchronization with Cisco PSIRT API and database operations for advisory data
 *
 * Architecture Pattern: Mirrors KEV service implementation
 * - OAuth2 token management with credential fetch from preferences
 * - Bulk sync operations with transaction safety
 * - Denormalized display columns for performance
 * - Vendor-neutral + vendor-specific column strategy
 */
class CiscoAdvisoryService {
    /**
     * Creates an instance of CiscoAdvisoryService
     * @param {Object} db - Database instance (better-sqlite3)
     * @param {Object} preferencesService - PreferencesService instance for credential fetch
     */
    constructor(db, preferencesService) {
        this.db = db;
        this.preferencesService = preferencesService;

        // Cisco PSIRT API endpoints
        this.ciscoTokenUrl = "https://id.cisco.com/oauth2/default/v1/token";
        this.ciscoPsirtBaseUrl = "https://api.cisco.com/security/advisories";

        this.lastSyncTime = null;
        this.syncInProgress = false;

        // Initialize fetch - use global fetch (Node 18+) or require https module
        this.fetch = global.fetch || this._initHttpsClient();

        // Initialize database tables if they don't exist
        this.initializeTables();
    }

    /**
     * Initialize Cisco advisory database tables
     * @async
     */
    async initializeTables() {
        try {
            // Create cisco_advisories table
            await this.db.run(`
                CREATE TABLE IF NOT EXISTS cisco_advisories (
                    cve_id TEXT PRIMARY KEY,
                    advisory_id TEXT,
                    advisory_title TEXT,
                    severity TEXT,
                    cvss_score TEXT,
                    first_fixed TEXT,
                    affected_releases TEXT,
                    product_names TEXT,
                    publication_url TEXT,
                    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create indexes
            await this.db.run("CREATE INDEX IF NOT EXISTS idx_cisco_advisories_cve ON cisco_advisories(cve_id)");
            await this.db.run("CREATE INDEX IF NOT EXISTS idx_cisco_advisories_synced ON cisco_advisories(last_synced)");
            await this.db.run(`
                CREATE INDEX IF NOT EXISTS idx_vulnerabilities_is_fixed
                ON vulnerabilities(is_fixed)
                WHERE is_fixed = 1
            `);

            // Note: vulnerabilities table columns (is_fixed, fixed_cisco_versions, etc.)
            // are created by migration 005-cisco-advisories.sql
            // No need to ALTER TABLE here - columns already exist from migration

            // sync_metadata table already exists from KEV implementation
            console.log("🗃️ Cisco advisory database tables initialized");
        } catch (error) {
            console.error("❌ Failed to initialize Cisco advisory tables:", error);
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
     * Get OAuth2 access token from Cisco Identity Services
     * @async
     * @param {string} clientId - Cisco API client ID
     * @param {string} clientSecret - Cisco API client secret
     * @returns {Promise<string>} Access token
     * @throws {Error} If token fetch fails
     */
    async getCiscoAccessToken(clientId, clientSecret) {
        try {
            const tokenResponse = await this.fetch(this.ciscoTokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
                },
                body: "grant_type=client_credentials"
            });

            if (!tokenResponse.ok) {
                throw new Error(`Cisco OAuth2 failed with status ${tokenResponse.status}`);
            }

            const tokenData = await tokenResponse.json();
            return tokenData.access_token;
        } catch (error) {
            console.error("❌ Failed to get Cisco access token:", error);
            throw new Error(`OAuth2 authentication failed: ${error.message}`);
        }
    }

    /**
     * Fetch Cisco API credentials from preferences
     * @async
     * @returns {Promise<{clientId: string, clientSecret: string}>} Credentials object
     * @throws {Error} If credentials not found
     */
    async getCiscoCredentials() {
        if (!this.preferencesService) {
            throw new Error("PreferencesService not available");
        }

        const result = await this.preferencesService.getPreference("cisco_api_key");

        if (!result.success || !result.data || !result.data.value) {
            throw new Error("Cisco API credentials not configured. Please add credentials in Settings.");
        }

        const [clientId, clientSecret] = result.data.value.split(":");

        if (!clientId || !clientSecret) {
            throw new Error("Invalid Cisco API credentials format");
        }

        return { clientId, clientSecret };
    }

    /**
     * Fetch all CVE IDs from vulnerabilities table for advisory lookup
     * @async
     * @returns {Promise<Array<string>>} Array of CVE identifiers
     */
    async getAllCveIds() {
        return await new Promise((resolve, reject) => {
            this.db.all("SELECT DISTINCT cve FROM vulnerabilities WHERE cve IS NOT NULL AND cve LIKE 'CVE-%'", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => row.cve));
                }
            });
        });
    }

    /**
     * Fetch Cisco advisory data for a single CVE
     * @async
     * @param {string} cveId - CVE identifier
     * @param {string} accessToken - Cisco API access token
     * @returns {Promise<Object|null>} Advisory data or null if not found
     */
    async fetchCiscoAdvisoryForCve(cveId, accessToken) {
        try {
            const response = await this.fetch(`${this.ciscoPsirtBaseUrl}/cve/${cveId}`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Accept": "application/json"
                }
            });

            if (response.status === 404) {
                // CVE not found in Cisco advisories - not an error
                return null;
            }

            if (!response.ok) {
                throw new Error(`Cisco API returned status ${response.status} for ${cveId}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`⚠️ Failed to fetch advisory for ${cveId}:`, error.message);
            return null;
        }
    }

    /**
     * Parse Cisco advisory response and extract relevant fields
     * @param {Object} advisoryData - Raw advisory data from Cisco API
     * @returns {Object} Parsed advisory object
     */
    parseAdvisoryData(advisoryData) {
        if (!advisoryData || !advisoryData.advisories || advisoryData.advisories.length === 0) {
            return null;
        }

        const advisory = advisoryData.advisories[0]; // Use first advisory

        // Extract first fixed versions from all products
        const firstFixedVersions = new Set();
        if (advisory.productNames && Array.isArray(advisory.productNames)) {
            advisory.productNames.forEach(product => {
                if (product.firstFixed && Array.isArray(product.firstFixed)) {
                    product.firstFixed.forEach(version => {
                        if (version) {
                            firstFixedVersions.add(version);
                        }
                    });
                }
            });
        }

        return {
            cve_id: advisory.cveId || null,
            advisory_id: advisory.advisoryId || null,
            advisory_title: advisory.advisoryTitle || null,
            severity: advisory.sir || null, // Security Impact Rating
            cvss_score: advisory.cvssBaseScore || null,
            first_fixed: JSON.stringify(Array.from(firstFixedVersions)), // JSON array
            affected_releases: JSON.stringify(advisory.iosRelease || []), // JSON array
            product_names: JSON.stringify((advisory.productNames || []).map(p => p.name || p)), // JSON array
            publication_url: advisory.publicationUrl || null
        };
    }

    /**
     * Sync Cisco PSIRT advisory data for all CVEs in database
     * @async
     * @returns {Promise<Object>} Sync result with statistics
     * @throws {Error} If sync fails
     */
    async syncCiscoAdvisories() {
        if (this.syncInProgress) {
            throw new Error("Sync already in progress");
        }

        this.syncInProgress = true;
        console.log("🔥 Starting Cisco PSIRT advisory data sync");

        try {
            // Get credentials from preferences
            const { clientId, clientSecret } = await this.getCiscoCredentials();

            // Get OAuth2 access token
            console.log("🔐 Authenticating with Cisco Identity Services...");
            const accessToken = await this.getCiscoAccessToken(clientId, clientSecret);

            // Get all CVE IDs from vulnerabilities table
            const cveIds = await this.getAllCveIds();
            console.log(`📊 Found ${cveIds.length} unique CVEs in database`);

            // Begin transaction
            await new Promise((resolve, reject) => {
                this.db.run("BEGIN TRANSACTION", (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            try {
                let advisoryCount = 0;
                let matchedCount = 0;
                const batchSize = 10;

                // Process CVEs in batches to avoid rate limiting
                for (let i = 0; i < cveIds.length; i += batchSize) {
                    const batch = cveIds.slice(i, i + batchSize);

                    await Promise.all(batch.map(async (cveId) => {
                        const advisoryData = await this.fetchCiscoAdvisoryForCve(cveId, accessToken);

                        if (advisoryData) {
                            const parsed = this.parseAdvisoryData(advisoryData);

                            if (parsed) {
                                // Insert or replace advisory data
                                await new Promise((resolve, reject) => {
                                    this.db.run(`
                                        INSERT OR REPLACE INTO cisco_advisories (
                                            cve_id, advisory_id, advisory_title, severity, cvss_score,
                                            first_fixed, affected_releases, product_names, publication_url, last_synced
                                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                                    `, [
                                        parsed.cve_id,
                                        parsed.advisory_id,
                                        parsed.advisory_title,
                                        parsed.severity,
                                        parsed.cvss_score,
                                        parsed.first_fixed,
                                        parsed.affected_releases,
                                        parsed.product_names,
                                        parsed.publication_url
                                    ], (err) => {
                                        if (err) {
                                            console.error(`❌ Insert failed for ${cveId}:`, err);
                                            reject(err);
                                        } else {
                                            resolve();
                                        }
                                    });
                                });

                                // Update vulnerabilities table with denormalized display columns
                                const firstFixedArray = JSON.parse(parsed.first_fixed);
                                const displayVersions = firstFixedArray.join(", ");

                                await new Promise((resolve, reject) => {
                                    this.db.run(`
                                        UPDATE vulnerabilities
                                        SET is_fixed = 1,
                                            fixed_cisco_versions = ?,
                                            fixed_cisco_url = ?,
                                            cisco_synced_at = CURRENT_TIMESTAMP
                                        WHERE cve = ?
                                    `, [displayVersions, parsed.publication_url, cveId], (err) => {
                                        if (err) {
                                            console.error(`❌ Update failed for ${cveId}:`, err);
                                            reject(err);
                                        } else {
                                            resolve();
                                        }
                                    });
                                });

                                advisoryCount++;
                                matchedCount++;
                            }
                        }
                    }));

                    // Progress logging every batch
                    if ((i + batchSize) % 50 === 0) {
                        console.log(`📊 Processed ${Math.min(i + batchSize, cveIds.length)} / ${cveIds.length} CVEs (${advisoryCount} advisories found)`);
                    }

                    // Rate limiting: wait 1 second between batches
                    if (i + batchSize < cveIds.length) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }

                // Commit transaction
                await new Promise((resolve, reject) => {
                    this.db.run("COMMIT", (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });

                // Update sync metadata
                this.lastSyncTime = new Date().toISOString();
                await this.updateSyncMetadata(advisoryCount);

                console.log(`✅ Cisco advisory sync completed: ${advisoryCount} advisories imported, ${matchedCount} CVEs matched`);

                return {
                    success: true,
                    totalAdvisories: advisoryCount,
                    matchedCount: matchedCount,
                    totalCvesChecked: cveIds.length,
                    lastSync: this.lastSyncTime
                };

            } catch (dbError) {
                // Rollback on error
                await new Promise((resolve, reject) => {
                    this.db.run("ROLLBACK", (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
                throw dbError;
            }

        } catch (error) {
            console.error("❌ Cisco advisory sync failed:", error);
            throw error;
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Get Cisco advisory metadata for a specific CVE
     * @async
     * @param {string} cveId - CVE identifier
     * @returns {Promise<Object|null>} Advisory metadata or null if not found
     */
    async getCiscoAdvisory(cveId) {
        if (!cveId) {
            return null;
        }

        return await new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM cisco_advisories WHERE cve_id = ?", [cveId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Get count of matched vulnerabilities with Cisco advisories
     * @async
     * @returns {Promise<number>} Count of matched vulnerabilities
     */
    async getMatchedVulnerabilitiesCount() {
        const result = await new Promise((resolve, reject) => {
            this.db.get(`
                SELECT COUNT(DISTINCT v.cve) as count
                FROM vulnerabilities v
                INNER JOIN cisco_advisories c ON v.cve = c.cve_id
                WHERE v.state IN ('ACTIVE', 'NEW', 'RESURFACED')
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
     * Get Cisco advisory sync status
     * @async
     * @returns {Promise<Object>} Sync status information
     */
    async getSyncStatus() {
        // Get total advisory count
        const advisoryCountResult = await new Promise((resolve, reject) => {
            this.db.get("SELECT COUNT(*) as count FROM cisco_advisories", (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        // Get matched count
        const matchedCount = await this.getMatchedVulnerabilitiesCount();

        // Get sync metadata
        const metadata = await new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM sync_metadata WHERE sync_type = 'cisco' ORDER BY sync_time DESC LIMIT 1", (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        return {
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
                VALUES ('cisco', ?, NULL, ?)
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
            this.db.get("SELECT sync_time FROM sync_metadata WHERE sync_type = 'cisco' ORDER BY sync_time DESC LIMIT 1", (err, row) => {
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

module.exports = CiscoAdvisoryService;
