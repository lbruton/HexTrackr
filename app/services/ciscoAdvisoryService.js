/**
 * @fileoverview Cisco PSIRT Advisory Service
 * @module ciscoAdvisoryService
 * @description Service for syncing and managing Cisco PSIRT advisory data with fixed software versions
 * @since v1.0.63
 * @see {@link https://developer.cisco.com/docs/psirt/ Cisco PSIRT API Documentation}
 */

/**
 * Defensive logging helpers
 * Safely log to LoggingService with fallback for initialization
 */
function _log(level, message, data = {}) {
    if (global.logger && global.logger.integration && typeof global.logger.integration[level] === "function") {
        global.logger.integration[level](message, data);
    } else {
        // Fallback to console for debugging HEX-272
        console.log(`[cisco-advisory:${level}]`, message, data);
    }
}

function _audit(category, message, data = {}) {
    if (global.logger && typeof global.logger.audit === "function") {
        global.logger.audit(category, message, data, null, null);
    }
}

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

        // Cisco PSIRT API endpoints (API Console v2)
        this.ciscoTokenUrl = "https://id.cisco.com/oauth2/default/v1/token";
        this.ciscoPsirtBaseUrl = "https://apix.cisco.com/security/advisories/v2";

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
            _log("info", "Cisco advisory database tables initialized");
        } catch (error) {
            _log("error", "Failed to initialize Cisco advisory tables:", error);
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
            _log("info", `OAuth2 request to ${this.ciscoTokenUrl}`);
            _log("info", `Client ID: ${clientId.substring(0, 8)}...`);

            const tokenResponse = await this.fetch(this.ciscoTokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
                },
                body: "grant_type=client_credentials"
            });

            if (!tokenResponse.ok) {
                // Try to get error details from response
                let errorDetails = `status ${tokenResponse.status}`;
                try {
                    const errorBody = await tokenResponse.text();
                    _log("error", `Cisco OAuth2 error response: ${errorBody}`);
                    errorDetails = `${errorDetails}: ${errorBody}`;
                } catch (e) {
                    // Ignore JSON parse errors
                }
                throw new Error(`Cisco OAuth2 failed with ${errorDetails}`);
            }

            const tokenData = await tokenResponse.json();
            _log("info", "OAuth2 token acquired successfully");
            return tokenData.access_token;
        } catch (error) {
            _log("error", "Failed to get Cisco access token:", error);
            throw new Error(`OAuth2 authentication failed: ${error.message}`);
        }
    }

    /**
     * Fetch Cisco API credentials from preferences
     * @async
     * @param {number} userId - User ID from session
     * @returns {Promise<{clientId: string, clientSecret: string}>} Credentials object
     * @throws {Error} If credentials not found
     */
    async getCiscoCredentials(userId) {
        if (!this.preferencesService) {
            throw new Error("PreferencesService not available");
        }

        const result = await this.preferencesService.getPreference(userId, "cisco_api_key");

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
     * Get unique (CVE, OS version) pairs from vulnerabilities table for Software Checker queries
     * Uses installed OS versions from our devices, not vulnerable versions from advisories
     * Excludes CVEs with fresh advisory data (synced within TTL window)
     * @async
     * @param {number} ttlDays - Time-to-live in days (default: 30)
     * @returns {Promise<Array<{cve: string, operating_system: string}>>} Array of CVE+version pairs
     */
    async getDeviceCveVersionPairs(ttlDays = 30) {
        return await new Promise((resolve, reject) => {
            this.db.all(`
                SELECT DISTINCT
                    vc.cve,
                    vc.operating_system
                FROM vulnerabilities_current vc
                LEFT JOIN cisco_advisories ca ON vc.cve = ca.cve_id
                WHERE vc.cve IS NOT NULL
                  AND vc.cve LIKE 'CVE-%'
                  AND vc.vendor LIKE '%Cisco%'
                  AND vc.operating_system IS NOT NULL
                  AND vc.lifecycle_state IN ('active', 'reopened')
                  AND (
                      ca.cve_id IS NULL  -- Never synced
                      OR julianday('now') - julianday(ca.last_synced) > ?  -- Stale (>TTL days)
                  )
            `, [ttlDays], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get unique OS versions from device inventory that need advisory sync
     * Returns distinct operating_system values for Cisco devices with CVEs
     * This enables batch querying - one Software Checker call per version returns ALL CVEs
     *
     * @async
     * @param {number} ttlDays - Time-to-live in days (default: 30)
     * @returns {Promise<Array<string>>} Array of unique OS version strings
     */
    async getUniqueDeviceVersions(ttlDays = 30) {
        return await new Promise((resolve, reject) => {
            this.db.all(`
                SELECT DISTINCT
                    vc.operating_system
                FROM vulnerabilities_current vc
                WHERE vc.cve IS NOT NULL
                  AND vc.cve LIKE 'CVE-%'
                  AND vc.vendor LIKE '%Cisco%'
                  AND vc.operating_system IS NOT NULL
                  AND vc.lifecycle_state IN ('active', 'reopened')
            `, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => row.operating_system));
                }
            });
        });
    }

    /**
     * Get all CVE IDs present in vulnerabilities_current for a specific vendor
     * Used to filter Software Checker results - only save advisories for CVEs we actually have
     *
     * @async
     * @returns {Promise<Set<string>>} Set of CVE IDs in our database
     */
    async getAllCiscoCveIds() {
        return await new Promise((resolve, reject) => {
            this.db.all(`
                SELECT DISTINCT cve
                FROM vulnerabilities_current
                WHERE cve IS NOT NULL
                  AND cve LIKE 'CVE-%'
                  AND vendor LIKE '%Cisco%'
                  AND lifecycle_state IN ('active', 'reopened')
            `, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(new Set(rows.map(row => row.cve)));
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
                LEFT JOIN cisco_advisories ca ON vc.cve = ca.cve_id
                WHERE vc.cve IS NOT NULL
                  AND vc.cve LIKE 'CVE-%'
                  AND vc.lifecycle_state IN ('active', 'reopened')
                  AND (
                      ca.cve_id IS NULL  -- Never synced
                      OR julianday('now') - julianday(ca.last_synced) > ?  -- Stale (>TTL days)
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
     * Fetch Cisco advisory data for a single CVE
     * @async
     * @param {string} cveId - CVE identifier
     * @param {string} accessToken - Cisco API access token
     * @returns {Promise<Object|null>} Advisory data or null if not found
     */
    async fetchCiscoAdvisoryForCve(cveId, accessToken) {
        try {
            const response = await this.fetch(`${this.ciscoPsirtBaseUrl}/cve/${cveId}.json`, {
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
            _log("error", ` Failed to fetch advisory for ${cveId}:`, error.message);
            return null;
        }
    }

    /**
     * Parse Cisco advisory response and extract relevant fields
     * @param {Object} advisoryData - Raw advisory data from Cisco API
     * @param {string} queriedCveId - The CVE ID we queried for
     * @returns {Object} Parsed advisory object for the specific CVE
     */
    parseAdvisoryData(advisoryData, queriedCveId) {
        if (!advisoryData || !advisoryData.advisories || advisoryData.advisories.length === 0) {
            _log("info", ` No advisories found in response for ${queriedCveId}`);
            return null;
        }

        const advisory = advisoryData.advisories[0]; // Use first advisory

        _log("info", ` Processing advisory: ${advisory.advisoryId} for CVE ${queriedCveId}`);
        _log("info", ` CVEs in advisory: ${advisory.cves ? advisory.cves.join(", ") : "none"}`);
        _log("info", ` CSAF URL: ${advisory.csafUrl || "none"}`);
        _log("info", ` Publication URL: ${advisory.publicationUrl || "none"}`);

        // NOTE: Cisco PSIRT API v2 does not include fixed version data in the lightweight CVE endpoint.
        // Fixed versions are in the CSAF JSON (advisory.csafUrl), which can be parsed if needed.
        // For now, if Cisco has an advisory, we mark is_fix_available=1 and link to publicationUrl.

        // Extract product count for metadata
        const productCount = (advisory.productNames && Array.isArray(advisory.productNames))
            ? advisory.productNames.length
            : 0;
        _log("info", ` Affected products: ${productCount}`);

        return {
            cve_id: queriedCveId, // Use the CVE we queried for, not advisory.cveId
            advisory_id: advisory.advisoryId || null,
            advisory_title: advisory.advisoryTitle || null,
            severity: advisory.sir || null, // Security Impact Rating
            cvss_score: advisory.cvssBaseScore || null,
            first_fixed: JSON.stringify([]), // Empty - use csafUrl or publicationUrl for fix details
            affected_releases: JSON.stringify(advisory.iosRelease || []), // JSON array
            product_names: JSON.stringify(advisory.productNames || []), // Array of strings
            publication_url: advisory.publicationUrl || advisory.csafUrl || null // Link to full advisory
        };
    }

    /**
     * Parse OS type from Cisco product names array
     * @param {Array<string>} productNames - Array of product version strings
     * @returns {Object|null} { osType, version } or null if cannot parse
     */
    parseOSTypeFromProducts(productNames) {
        if (!productNames || !Array.isArray(productNames) || productNames.length === 0) {
            return null;
        }

        // Try to extract OS type and version from first product name
        // Examples:
        // "Cisco IOS 15.2(4)M11" → { osType: "ios", version: "15.2(4)M11" }
        // "Cisco IOS XE Software 17.3.1" → { osType: "iosxe", version: "17.3.1" }
        // "Cisco NX-OS Software 9.3(5)" → { osType: "nxos", version: "9.3(5)" }
        // "Cisco ASA Software 9.16.1" → { osType: "asa", version: "9.16.1" }

        const osTypePatterns = [
            { pattern: /Cisco IOS XE(?:\s+Software)?\s+([\d.()]+\S*)/i, osType: "iosxe" },
            { pattern: /Cisco IOS(?:\s+Software)?\s+([\d.()]+\S*)/i, osType: "ios" },
            { pattern: /Cisco NX-OS(?:\s+Software)?\s+([\d.()]+\S*)/i, osType: "nxos" },
            { pattern: /Cisco ASA(?:\s+Software)?\s+([\d.()]+\S*)/i, osType: "asa" },
            { pattern: /Cisco FTD(?:\s+Software)?\s+([\d.()]+\S*)/i, osType: "ftd" },
            { pattern: /Cisco FXOS(?:\s+Software)?\s+([\d.()]+\S*)/i, osType: "fxos" }
        ];

        for (const productName of productNames) {
            for (const { pattern, osType } of osTypePatterns) {
                const match = productName.match(pattern);
                if (match) {
                    return {
                        osType,
                        version: match[1]
                    };
                }
            }
        }

        _log("info", ` Could not parse OS type from products: ${productNames.slice(0, 3).join(", ")}...`);
        return null;
    }

    /**
     * Parse installed OS version string to extract OS type and version for Software Checker
     * @param {string} installedVersion - Installed OS version (e.g., "CISCO IOS XE 16.9.2", "Cisco IOS 15.2(4)E")
     * @returns {Object|null} { osType, version } or null if cannot parse
     */
    parseInstalledVersion(installedVersion) {
        if (!installedVersion || typeof installedVersion !== "string") {
            return null;
        }

        const versionUpper = installedVersion.toUpperCase();

        // Pattern matching for OS type and version extraction
        const patterns = [
            { pattern: /IOS\s+XE\s+(?:SOFTWARE\s+)?([\d.()]+\S*)/i, osType: "iosxe" },
            { pattern: /IOS-XE\s+([\d.()]+\S*)/i, osType: "iosxe" },
            { pattern: /IOSXE\s+([\d.()]+\S*)/i, osType: "iosxe" },
            { pattern: /IOS\s+XR\s+(?:SOFTWARE\s+)?([\d.()]+\S*)/i, osType: "iosxr" },
            { pattern: /IOS-XR\s+([\d.()]+\S*)/i, osType: "iosxr" },
            { pattern: /NX-OS\s+(?:SOFTWARE\s+)?([\d.()]+\S*)/i, osType: "nxos" },
            { pattern: /NXOS\s+([\d.()]+\S*)/i, osType: "nxos" },
            { pattern: /ASA\s+(?:SOFTWARE\s+)?([\d.()]+\S*)/i, osType: "asa" },
            { pattern: /FTD\s+(?:SOFTWARE\s+)?([\d.()]+\S*)/i, osType: "ftd" },
            { pattern: /FXOS\s+(?:SOFTWARE\s+)?([\d.()]+\S*)/i, osType: "fxos" },
            // Generic IOS (must come after IOS XE/XR checks)
            { pattern: /IOS\s+(?:SOFTWARE\s+)?([\d.()]+\S*)/i, osType: "ios" }
        ];

        for (const { pattern, osType } of patterns) {
            const match = installedVersion.match(pattern);
            if (match) {
                return {
                    osType,
                    version: match[1]
                };
            }
        }

        _log("info", ` Could not parse installed version: ${installedVersion}`);
        return null;
    }

    /**
     * Fetch fixed versions from Cisco Software Checker endpoint
     * @async
     * @param {string} osType - OS type (ios, iosxe, nxos, etc.)
     * @param {string} version - Software version
     * @param {string} accessToken - OAuth2 access token
     * @returns {Promise<Array<string>>} Array of fixed versions
     */
    async fetchFixedVersions(osType, version, accessToken) {
        try {
            const url = `${this.ciscoPsirtBaseUrl}/OSType/${osType}?version=${encodeURIComponent(version)}`;
            _log("info", ` Querying Software Checker: ${osType} ${version}`);

            const response = await this.fetch(url, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                _log("info", ` Software Checker returned ${response.status} for ${osType} ${version}`);
                return [];
            }

            const data = await response.json();

            // Response format: { advisories: [{ firstFixed: ["17.3.1", "17.3.2"], ... }] }
            if (data.advisories && Array.isArray(data.advisories) && data.advisories.length > 0) {
                const allFixedVersions = new Set();

                for (const advisory of data.advisories) {
                    if (advisory.firstFixed && Array.isArray(advisory.firstFixed)) {
                        advisory.firstFixed.forEach(version => {
                            if (version) {
                                allFixedVersions.add(version);
                            }
                        });
                    }
                }

                const fixedArray = Array.from(allFixedVersions);
                _log("info", ` Found ${fixedArray.length} fixed versions: ${fixedArray.slice(0, 3).join(", ")}${fixedArray.length > 3 ? "..." : ""}`);
                return fixedArray;
            }

            return [];
        } catch (error) {
            _log("error", ` Failed to fetch fixed versions for ${osType} ${version}:`, error.message);
            return [];
        }
    }

    /**
     * Sync Cisco PSIRT advisory data for all CVEs in database
     * @async
     * @param {number} userId - User ID from session for credential fetch
     * @returns {Promise<Object>} Sync result with statistics
     * @throws {Error} If sync fails
     */
    async syncCiscoAdvisories(userId) {
        if (this.syncInProgress) {
            throw new Error("Sync already in progress");
        }

        this.syncInProgress = true;
        _log("info", "Starting Cisco PSIRT advisory data sync");

        try {
            // Get credentials from preferences
            const { clientId, clientSecret } = await this.getCiscoCredentials(userId);

            // Get OAuth2 access token
            _log("info", "Authenticating with Cisco Identity Services...");
            const accessToken = await this.getCiscoAccessToken(clientId, clientSecret);

            // Get unique OS versions from our device inventory (batch optimization)
            const uniqueVersions = await this.getUniqueDeviceVersions();
            _log("info", ` Found ${uniqueVersions.length} unique OS versions to query (batch mode)`);

            // Get all Cisco CVE IDs in our database (for filtering responses)
            const allCiscoCveIds = await this.getAllCiscoCveIds();
            _log("info", ` Database contains ${allCiscoCveIds.size} unique Cisco CVEs`);

            // No transaction wrapper - each advisory commits individually for resilience
            let advisoryCount = 0;
            let matchedCount = 0;
            let queriesExecuted = 0;
            const delayBetweenVersions = 10000; // 10 seconds between OS version queries to respect Cisco API rate limits (HEX-272: prevent 429 errors)

            // Process unique versions sequentially with delays to honor Cisco rate limits
            for (let i = 0; i < uniqueVersions.length; i++) {
                const installedVersion = uniqueVersions[i];
                queriesExecuted++;

                _log("info", ` [${i + 1}/${uniqueVersions.length}] Querying version: ${installedVersion}`);

                // Parse installed version to get OS type and version for Software Checker
                const osInfo = this.parseInstalledVersion(installedVersion);

                if (!osInfo) {
                    _log("info", ` Could not parse installed version: ${installedVersion}`);
                    continue;
                }

                // Query Software Checker - returns ALL CVEs affecting this version
                _log("info", ` Software Checker: ${osInfo.osType} ${osInfo.version}`);
                const response = await this.fetch(
                    `${this.ciscoPsirtBaseUrl}/OSType/${osInfo.osType}?version=${encodeURIComponent(osInfo.version)}`,
                    {
                        headers: {
                            "Accept": "application/json",
                            "Authorization": `Bearer ${accessToken}`
                        }
                    }
                );

                if (!response.ok) {
                    _log("info", ` Software Checker returned ${response.status}`);
                    continue;
                }

                const data = await response.json();
                const advisories = data.advisories || [];
                _log("info", ` Received ${advisories.length} advisories for this version`);

                // Process ALL advisories from this response (batch optimization!)
                let cvesProcessedFromThisVersion = 0;
                for (const advisory of advisories) {
                    if (!advisory.cves || advisory.cves.length === 0) {
                        continue;
                    }

                    // Process each CVE in this advisory
                    for (const cveId of advisory.cves) {
                        // Only process CVEs that exist in our database
                        if (!allCiscoCveIds.has(cveId)) {
                            continue;
                        }

                        // HEX-272: Build advisory object directly from Software Checker batch response
                        // This eliminates the need for individual fetchCiscoAdvisoryForCve() calls,
                        // preventing API rate limiting (HTTP 429 errors)
                        const parsed = {
                            cve_id: cveId,
                            advisory_id: advisory.advisoryId || null,
                            advisory_title: advisory.advisoryTitle || null,
                            severity: advisory.sir || null, // Security Impact Rating
                            cvss_score: advisory.cvssBaseScore || null,
                            first_fixed: JSON.stringify(advisory.firstFixed || []),
                            affected_releases: JSON.stringify(advisory.iosRelease || []),
                            product_names: JSON.stringify(advisory.productNames || []),
                            publication_url: advisory.publicationUrl || advisory.csafUrl || null
                        };

                        if (parsed) {
                            // HEX-287: Normalized schema - separate advisory metadata from fixed versions

                            // 1. Insert/update advisory metadata (one row per CVE)
                            await new Promise((resolve, reject) => {
                                this.db.run(`
                                    INSERT INTO cisco_advisories (
                                        cve_id, advisory_id, advisory_title, severity, cvss_score,
                                        first_fixed, affected_releases, product_names, publication_url, last_synced
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                                    ON CONFLICT(cve_id) DO UPDATE SET
                                        advisory_id = COALESCE(excluded.advisory_id, cisco_advisories.advisory_id),
                                        advisory_title = COALESCE(excluded.advisory_title, cisco_advisories.advisory_title),
                                        severity = COALESCE(excluded.severity, cisco_advisories.severity),
                                        cvss_score = COALESCE(excluded.cvss_score, cisco_advisories.cvss_score),
                                        publication_url = COALESCE(excluded.publication_url, cisco_advisories.publication_url),
                                        last_synced = CURRENT_TIMESTAMP
                                `, [
                                    parsed.cve_id,
                                    parsed.advisory_id,
                                    parsed.advisory_title,
                                    parsed.severity,
                                    parsed.cvss_score,
                                    parsed.first_fixed,  // Keep for backward compatibility (will remove in Migration 008)
                                    parsed.affected_releases,
                                    parsed.product_names,
                                    parsed.publication_url
                                ], (err) => {
                                    if (err) {
                                        _log("error", ` Advisory insert failed for ${cveId}:`, err);
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            });

                            // 2. Insert fixed versions (one row per OS family + version)
                            const fixedVersionsArray = advisory.firstFixed || [];
                            for (const version of fixedVersionsArray) {
                                await new Promise((resolve, reject) => {
                                    this.db.run(`
                                        INSERT INTO cisco_fixed_versions (
                                            cve_id, os_family, fixed_version, affected_version, last_synced
                                        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                                        ON CONFLICT(cve_id, os_family, fixed_version) DO UPDATE SET
                                            last_synced = CURRENT_TIMESTAMP
                                    `, [cveId, osInfo.osType, version, osInfo.version], (err) => {
                                        if (err) {
                                            _log("error", ` Fixed version insert failed for ${cveId} ${osInfo.osType} ${version}:`, err);
                                            reject(err);
                                        } else {
                                            resolve();
                                        }
                                    });
                                });
                            }

                            // 3. Update vulnerabilities_current with vendor-neutral fix flag
                            const hasFixAvailable = fixedVersionsArray.length > 0 ? 1 : 0;
                            await new Promise((resolve, reject) => {
                                this.db.run(`
                                    UPDATE vulnerabilities_current
                                    SET is_fix_available = ?
                                    WHERE cve = ?
                                `, [hasFixAvailable, cveId], (err) => {
                                    if (err) {
                                        _log("error", ` Update failed for ${cveId}:`, err);
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            });

                            advisoryCount++;
                            matchedCount++;
                            cvesProcessedFromThisVersion++;
                        }
                    }
                }

                _log("info", ` Processed ${cvesProcessedFromThisVersion} CVEs from this version (total matched: ${matchedCount})`);

                // Rate limiting: wait between each query to honor Cisco API limits
                if (i < uniqueVersions.length - 1) {
                    const remainingVersions = uniqueVersions.length - i - 1;
                    const estimatedMinutesRemaining = Math.ceil((remainingVersions * delayBetweenVersions) / 60000);
                    _log("info", ` Rate limiting: waiting 10 seconds before next version query (${remainingVersions} versions remaining, ~${estimatedMinutesRemaining} min)`);
                    await new Promise(resolve => setTimeout(resolve, delayBetweenVersions));
                }
            }

            // Update sync metadata (using counter for progress tracking)
            this.lastSyncTime = new Date().toISOString();
            await this.updateSyncMetadata(advisoryCount);

            // Get ACTUAL database count (not the counter - same CVE may be processed multiple times)
            const actualDbCount = await new Promise((resolve, reject) => {
                this.db.get("SELECT COUNT(*) as count FROM cisco_advisories", (err, row) => {
                    if (err) {reject(err);}
                    else {resolve(row?.count || 0);}
                });
            });

            _log("info", ` Cisco advisory sync completed: ${queriesExecuted} versions queried, ${advisoryCount} advisories processed (${actualDbCount} unique CVEs in DB), ${matchedCount} CVEs matched`);

            // HEX-272: Force WAL checkpoint to flush all changes to disk
            // This ensures data survives Docker restarts immediately after sync
            _log("info", "Flushing WAL to disk (checkpoint)...");
            await new Promise((resolve, reject) => {
                this.db.run("PRAGMA wal_checkpoint(FULL)", (err) => {
                    if (err) {
                        _log("error", "WAL checkpoint failed:", err);
                        // Don't fail the sync, just log the error
                        resolve();
                    } else {
                        _log("info", "WAL checkpoint completed - all advisory data persisted to disk");
                        resolve();
                    }
                });
            });

            this.syncInProgress = false;

            return {
                success: true,
                totalAdvisories: actualDbCount,  // Return actual DB count, not counter
                matchedCount: matchedCount,
                totalCvesChecked: allCiscoCveIds.size,
                versionsQueried: queriesExecuted,
                advisoriesProcessed: advisoryCount,  // Keep counter for metrics
                lastSync: this.lastSyncTime
            };

        } catch (error) {
            _log("error", "Cisco advisory sync failed:", error);
            this.syncInProgress = false;
            throw error;
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
     * Get fixed versions for a specific CVE and OS family (HEX-287)
     * @async
     * @param {string} cveId - CVE identifier
     * @param {string} osFamily - OS family filter (optional): "ios", "iosxe", "iosxr", "nxos", etc.
     * @returns {Promise<Array>} Array of fixed version objects
     */
    async getFixedVersions(cveId, osFamily = null) {
        if (!cveId) {
            return [];
        }

        return await new Promise((resolve, reject) => {
            let query = "SELECT * FROM cisco_fixed_versions WHERE cve_id = ?";
            const params = [cveId];

            if (osFamily) {
                query += " AND os_family = ?";
                params.push(osFamily);
            }

            query += " ORDER BY fixed_version ASC";

            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
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
                FROM cisco_advisories
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

        // Get total Cisco CVEs count from vulnerabilities table
        const totalCiscoCvesResult = await new Promise((resolve, reject) => {
            this.db.get(`
                SELECT COUNT(DISTINCT cve) as count
                FROM vulnerabilities_current
                WHERE vendor LIKE '%Cisco%'
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
            this.db.get("SELECT * FROM sync_metadata WHERE sync_type = 'cisco' ORDER BY sync_time DESC LIMIT 1", (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        return {
            totalCiscoCves: totalCiscoCvesResult?.count || 0,
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
        _log("info", ` Updating sync metadata: ${this.lastSyncTime}, ${recordCount} records`);
        try {
            await new Promise((resolve, reject) => {
                this.db.run(`
                    INSERT INTO sync_metadata (sync_type, sync_time, version, record_count)
                    VALUES ('cisco', ?, NULL, ?)
                `, [this.lastSyncTime, recordCount], (err) => {
                    if (err) {
                        _log("error", " Sync metadata update FAILED:", err);
                        reject(err);
                    } else {
                        _log("info", " Sync metadata updated successfully");
                        resolve();
                    }
                });
            });
        } catch (error) {
            _log("error", " Exception in updateSyncMetadata:", error);
            throw error;
        }
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
