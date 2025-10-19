/**
 * Cisco Advisory Helper
 *
 * Centralized service for fetching and caching Cisco PSIRT advisory data.
 * Used by device cards and device modal to display fixed software versions.
 *
 * Features:
 * - In-memory caching to prevent redundant API calls
 * - Vendor filtering (only queries Cisco advisories for Cisco devices)
 * - Graceful degradation on API errors
 * - Parallel advisory fetching for multiple CVEs
 * - OS family-aware queries for multi-OS-family CVEs (HEX-287)
 *
 * @version 1.0.79
 * @date 2025-10-18
 */

class CiscoAdvisoryHelper {
    constructor() {
        /**
         * Advisory cache: CVE ID -> { fixedVersion, timestamp }
         * @type {Map<string, Object>}
         */
        this.advisoryCache = new Map();

        /**
         * Cache TTL: 5 minutes (advisories don't change frequently)
         * @type {number}
         */
        this.cacheTTL = 5 * 60 * 1000;
    }

    /**
     * Parse OS type from version string
     *
     * Cisco OS Detection Rules:
     * - IOS XE: Explicitly stated OR 16.x/17.x/3.x format
     * - IOS XR: Explicitly stated OR 6.x/7.x with simple format
     * - NX-OS: Explicitly stated OR 9.x format
     * - IOS: Train notation with parentheses like 15.2(8)E8
     *
     * @param {string} versionString - Version string (e.g., "CISCO IOS XE 16.9.2", "15.2(8)E8")
     * @returns {string} OS type identifier
     */
    parseOSType(versionString) {
        if (!versionString) {return "Unknown";}

        const versionUpper = versionString.toUpperCase();

        // Explicit OS type mentions
        if (versionUpper.includes("IOS XE")) {return "IOS XE";}
        if (versionUpper.includes("IOS-XE")) {return "IOS XE";}
        if (versionUpper.includes("IOSXE")) {return "IOS XE";}

        if (versionUpper.includes("IOS XR")) {return "IOS XR";}
        if (versionUpper.includes("IOS-XR")) {return "IOS XR";}
        if (versionUpper.includes("IOSXR")) {return "IOS XR";}

        if (versionUpper.includes("NX-OS")) {return "NX-OS";}
        if (versionUpper.includes("NXOS")) {return "NX-OS";}

        // Pattern-based detection (when OS not explicitly stated)

        // IOS: Train notation with parentheses like 15.2(8)E8 (check BEFORE IOS XE patterns)
        if (/\d+\.\d+\([^\)]+\)[a-zA-Z]*\d*/.test(versionString)) {return "IOS";}

        // IOS: Train releases with capital letter suffix like 3.13.10S, 12.2.55SE
        if (/\d+\.\d+\.\d+[A-Z]+\d*/.test(versionString)) {return "IOS";}

        // IOS XE: Clean 16.x, 17.x, or 3.x format WITHOUT train letters
        if (/\b(16|17|3)\.\d+\.\d+$/.test(versionString)) {return "IOS XE";}
        if (/\b(16|17|3)\.\d+\.\d+[a-z]$/.test(versionString)) {return "IOS XE";} // lowercase letter ok (like 16.3.1a)

        // IOS XR: 6.x or 7.x with simple format
        if (/\b[67]\.\d+\.\d+/.test(versionString)) {return "IOS XR";}

        // NX-OS: 9.x format
        if (/\b9\.\d+\(\d+\)/.test(versionString)) {return "NX-OS";}

        return "Unknown";
    }

    /**
     * Map OS type to API format (HEX-287)
     *
     * Converts UI-friendly OS type strings to database format
     * for querying the normalized cisco_fixed_versions table
     *
     * @param {string} osType - OS type from parseOSType (e.g., "IOS XE", "IOS", "IOS XR")
     * @returns {string|null} API format OS family (e.g., "iosxe", "ios", "iosxr") or null
     */
    mapOSToAPIFormat(osType) {
        const osMap = {
            "IOS XE": "iosxe",
            "IOS": "ios",
            "IOS XR": "iosxr",
            "NX-OS": "nxos",
            "ASA": "asa",
            "FTD": "ftd",
            "FX-OS": "fxos"
        };

        return osMap[osType] || null;
    }

    /**
     * Compare two Cisco IOS version strings for sorting (descending order)
     * Returns highest/most recent version first
     *
     * @param {string} a - First version string (e.g., "16.9(4)")
     * @param {string} b - Second version string (e.g., "15.2(7)E")
     * @returns {number} - Negative if a > b, positive if a < b, 0 if equal
     */
    compareVersions(a, b) {
        // Extract version components
        // IOS format: major.minor(maintenance[letter])TRAIN[subrelease] (e.g., 15.2(7)E3)
        // IOS XE format: major.minor.patch[letter] (e.g., 17.12.6, 17.12.4a)
        const parseVersion = (ver) => {
            // Try IOS format first: major.minor(maint[letter])TRAIN[subrelease]
            let match = ver.match(/^(\d+)\.(\d+)\((\d+)([a-z]?)\)([A-Z]*)(.*)$/);
            if (match) {
                return {
                    major: parseInt(match[1], 10),
                    minor: parseInt(match[2], 10),
                    maint: parseInt(match[3], 10),
                    maintLetter: match[4] || "",
                    train: match[5] || "",
                    subrelease: match[6] || ""
                };
            }

            // Try IOS XE format: major.minor.patch[letter]
            match = ver.match(/^(\d+)\.(\d+)\.(\d+)([a-z]?)(.*)$/);
            if (match) {
                return {
                    major: parseInt(match[1], 10),
                    minor: parseInt(match[2], 10),
                    maint: parseInt(match[3], 10),
                    maintLetter: match[4] || "",
                    train: "",
                    subrelease: match[5] || ""
                };
            }

            // Couldn't parse - return zeros
            return { major: 0, minor: 0, maint: 0, maintLetter: "", train: "", subrelease: "" };
        };

        const vA = parseVersion(a);
        const vB = parseVersion(b);

        // Compare major, minor, maintenance in order
        if (vA.major !== vB.major) {return vB.major - vA.major;}
        if (vA.minor !== vB.minor) {return vB.minor - vA.minor;}
        if (vA.maint !== vB.maint) {return vB.maint - vA.maint;}

        // Compare maintenance letter (e.g., 7b vs 7)
        if (vA.maintLetter !== vB.maintLetter) {
            return vB.maintLetter.localeCompare(vA.maintLetter);
        }

        // Train identifiers compared alphabetically (descending)
        if (vA.train !== vB.train) {
            return vB.train.localeCompare(vA.train);
        }

        // Compare subrelease (e.g., E3 vs E)
        // Extract numeric portion of subrelease if present
        const subA = parseInt(vA.subrelease, 10) || 0;
        const subB = parseInt(vB.subrelease, 10) || 0;
        return subB - subA;
    }

    /**
     * Extract train designation from Cisco version string
     *
     * @param {string} versionString - Version string (e.g., "15.2(8)E8", "15.9(3)M11")
     * @returns {string|null} Train letter (E, M, S, etc.) or null
     */
    extractTrain(versionString) {
        if (!versionString) {return null;}

        // Match train letter: 15.2(8)E8 → "E", 15.9(3)M11 → "M"
        const match = versionString.match(/\d+\.\d+\([^)]+\)([A-Z]+)/);
        return match ? match[1] : null;
    }

    /**
     * Normalize train designation to base family (HEX-287)
     *
     * Cisco has multiple train variants within same product family:
     * - E, EA, ED, SE, SG → All Enterprise family (compatible)
     * - M, MA → All Mainline family (compatible)
     * - S, SA (not SE/SG) → Service Provider family (compatible)
     *
     * @param {string} train - Train designation (E, EA, ED, SE, SG, M, MA, S, SA, etc.)
     * @returns {string} Normalized train family (E, M, S, etc.)
     */
    normalizeTrainFamily(train) {
        if (!train) {return null;}

        // Enterprise family variants (check specific patterns first)
        // SE = Switching Enterprise (Catalyst switches)
        // SG = Security Gateway
        // EA = Early Adoption
        // ED = Extended Delivery
        if (train === "SE" || train === "SG" || train === "E" || train.startsWith("EA") || train.startsWith("ED")) {
            return "E";
        }

        // Mainline family: M, MA
        if (train.startsWith("M")) {return "M";}

        // Service Provider family: S, SA (but NOT SE/SG which are Enterprise)
        if (train === "S" || train === "SA") {return "S";}

        // Others: T (Throttle), etc. - return as-is
        return train;
    }

    /**
     * Match fixed version from array based on installed train (HEX-287)
     *
     * Filters by normalized train family extracted from installed version.
     * Uses train family normalization to handle variants:
     * - E family: E, EA, ED, SE, SG (Enterprise/Switching Enterprise)
     * - M family: M, MA (Mainline)
     * - S family: S, SA (Service Provider, NOT SE/SG)
     *
     * @param {string} installedVersion - Installed version (e.g., "CISCO IOS 15.2(2)E8")
     * @param {Array<string>} fixedVersionsArray - Array of fixed versions (already OS-filtered and sorted)
     * @returns {string|null} Best matching fixed version or null
     */
    matchFixedVersion(installedVersion, fixedVersionsArray) {
        if (!fixedVersionsArray || fixedVersionsArray.length === 0) {
            return null;
        }

        // Extract train from installed version: "15.2(4)E8" → "E", "15.2(4)SE5" → "SE"
        const installedTrain = this.extractTrain(installedVersion);

        if (!installedTrain) {
            // No train in installed version - return highest version
            return fixedVersionsArray[0];
        }

        // Normalize installed train to base family: SE → E, EA → E, M → M, etc.
        const installedFamily = this.normalizeTrainFamily(installedTrain);

        // Filter to versions with matching train family
        const trainMatches = fixedVersionsArray.filter(v => {
            const fixTrain = this.extractTrain(v);
            if (!fixTrain) {return false;}

            // Normalize fixed version train to base family
            const fixFamily = this.normalizeTrainFamily(fixTrain);

            // Match normalized families: E matches E/EA/ED/SE/SG, M matches M/MA
            return fixFamily === installedFamily;
        });

        if (trainMatches.length > 0) {
            // Return first match (already sorted highest first)
            return trainMatches[0];
        }

        // No train match - return highest version as fallback
        logger.debug("ui", `No ${installedFamily}-family match for ${installedVersion} (train: ${installedTrain}), using highest version`);
        return fixedVersionsArray[0];
    }

    /**
     * Get fixed version for a specific CVE from Cisco advisory (HEX-287)
     *
     * Uses normalized cisco_fixed_versions table with OS family filtering
     * to correctly handle multi-OS-family CVEs (e.g., IOS + IOS XE)
     *
     * @param {string} cveId - CVE identifier (e.g., "CVE-2017-3881")
     * @param {string} vendor - Vendor name for filtering
     * @param {string} installedVersion - Installed OS version for smart matching
     * @returns {Promise<string|null>} Fixed version string or null if not available
     */
    async getFixedVersion(cveId, vendor, installedVersion = null) {
        // Only query Cisco advisories for Cisco devices
        if (!vendor || !vendor.toLowerCase().includes("cisco")) {
            return null;
        }

        // Validate CVE ID
        if (!cveId || !cveId.startsWith("CVE-")) {
            logger.warn("ui", `Invalid CVE ID: ${cveId}`);
            return null;
        }

        // Parse OS type from installed version
        let osFamily = null;
        if (installedVersion) {
            const osType = this.parseOSType(installedVersion);
            osFamily = this.mapOSToAPIFormat(osType);
        }

        // Build cache key with OS family for normalized lookups
        const cacheKey = osFamily ? `${cveId}:${osFamily}` : cveId;

        // Check cache first
        const cached = this.advisoryCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
            // Apply train matching if installed version provided (HEX-287)
            if (installedVersion && cached.fixedVersionsArray && cached.fixedVersionsArray.length > 0) {
                return this.matchFixedVersion(installedVersion, cached.fixedVersionsArray);
            }
            // Fallback to first version or null
            return cached.fixedVersionsArray && cached.fixedVersionsArray.length > 0
                ? cached.fixedVersionsArray[0]
                : null;
        }

        // Fetch from API (HEX-287: Use normalized endpoint)
        try {
            // Build API URL with optional OS family filter
            let apiUrl = `/api/cisco/fixed-versions/${cveId}`;
            if (osFamily) {
                apiUrl += `?os_family=${osFamily}`;
            }

            const response = await fetch(apiUrl);

            // Check for HTTP errors
            if (!response.ok) {
                logger.warn("ui", `API error for ${cveId}: ${response.status} ${response.statusText}`);
                // Cache empty result to prevent repeated failures
                this.advisoryCache.set(cacheKey, {
                    fixedVersionsArray: [],
                    timestamp: Date.now()
                });
                return null;
            }

            const versions = await response.json();

            // Handle empty array (no fixes for this CVE/OS family)
            if (!versions || versions.length === 0) {
                this.advisoryCache.set(cacheKey, {
                    fixedVersionsArray: [],
                    timestamp: Date.now()
                });
                return null;
            }

            // Extract fixed_version strings from normalized table rows
            // Each row: { id, cve_id, os_family, fixed_version, affected_version, last_synced }
            const fixedVersionStrings = versions.map(v => v.fixed_version);

            // Sort versions semantically (descending - newest first)
            // Backend uses ASCII sort which doesn't handle Cisco versions correctly
            fixedVersionStrings.sort((a, b) => this.compareVersions(a, b));

            // Cache the sorted version strings
            this.advisoryCache.set(cacheKey, {
                fixedVersionsArray: fixedVersionStrings,
                timestamp: Date.now()
            });

            // Filter by train if we have installed version (HEX-287)
            if (installedVersion && fixedVersionStrings.length > 1) {
                return this.matchFixedVersion(installedVersion, fixedVersionStrings);
            }

            // Return first version (highest/newest version after sorting)
            return fixedVersionStrings.length > 0 ? fixedVersionStrings[0] : null;

        } catch (error) {
            logger.warn("ui", `Failed to fetch fixed versions for ${cveId}:`, error.message);

            // Cache empty result to prevent repeated failures
            this.advisoryCache.set(cacheKey, {
                fixedVersionsArray: [],
                timestamp: Date.now()
            });

            return null;
        }
    }

    /**
     * Get fixed version for a device (checks all CVEs affecting the device) - HEX-287
     *
     * Strategy:
     * - Fetches advisories for all unique CVEs on the device (parallel)
     * - Filters by OS family (no train filtering - too many edge cases)
     * - Returns highest version for quick "go/no-go" comparison
     *
     * @param {Object} device - Device object with vendor and vulnerabilities array
     * @returns {Promise<string|null>} Highest fixed version or null
     */
    async getDeviceFixedVersion(device) {
        if (!device || !device.vulnerabilities) {
            return null;
        }

        // Get unique CVEs for this device
        const cves = [...new Set(device.vulnerabilities.map(v => v.cve))];

        if (cves.length === 0) {
            return null;
        }

        // Fetch advisories for all CVEs in parallel
        // Pass device.operating_system for OS-aware matching
        const advisories = await Promise.all(
            cves.map(cve => this.getFixedVersion(cve, device.vendor, device.operating_system))
        );

        // Filter out nulls and deduplicate
        const validVersions = [...new Set(advisories.filter(v => v !== null))];

        if (validVersions.length === 0) {
            return null;
        }

        // Sort versions (highest first) and return top version
        validVersions.sort((a, b) => this.compareVersions(a, b));

        // Return highest version for quick comparison to gold images
        return validVersions[0];
    }

    /**
     * Clear the advisory cache (useful for testing or manual refresh)
     */
    clearCache() {
        this.advisoryCache.clear();
        logger.debug("ui", "Cisco advisory cache cleared");
    }

    /**
     * Get cache statistics (useful for debugging)
     *
     * @returns {Object} Cache stats
     */
    getCacheStats() {
        return {
            size: this.advisoryCache.size,
            entries: Array.from(this.advisoryCache.keys())
        };
    }
}

// Global instance - accessible from all vulnerability pages
window.ciscoAdvisoryHelper = new CiscoAdvisoryHelper();

logger.debug("ui", "Cisco Advisory Helper initialized");
