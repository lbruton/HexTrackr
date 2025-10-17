/**
 * Palo Alto Advisory Helper
 *
 * Centralized service for fetching and caching Palo Alto Networks Security advisory data.
 * Used by device cards and device modal to display fixed software versions.
 *
 * Features:
 * - In-memory caching to prevent redundant API calls
 * - Vendor filtering (only queries Palo Alto advisories for Palo Alto devices)
 * - Graceful degradation on API errors
 * - Version normalization (handles Azure marketplace format)
 * - Smart version matching based on major.minor family
 *
 * @version 1.0.65
 * @date 2025-10-12
 */

class PaloAdvisoryHelper {
    /**
     * Creates an instance of PaloAdvisoryHelper
     */
    constructor() {
        /**
         * Advisory cache: CVE ID -> { fixedVersionsArray, timestamp }
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
     * Normalize PAN-OS version string
     *
     * Handles Azure marketplace variant: 11.1.203 → 11.1.2-h3
     * Standard format passes through: 10.2.0-h3 → 10.2.0-h3
     *
     * @param {string} versionString - Version string to normalize
     * @returns {string} Normalized version string
     */
    normalizeVersion(versionString) {
        if (!versionString) return 'Unknown';

        // Azure marketplace format: 11.1.203 → 11.1.2-h3
        // Pattern: major.minor.patchHotfix (where last 2 digits are hotfix number)
        const azureMatch = versionString.match(/^(\d+)\.(\d+)\.(\d)(\d{2})$/);
        if (azureMatch) {
            const [, major, minor, patch, hotfix] = azureMatch;
            // Convert hotfix "03" → 3, "10" → 10
            const hotfixNum = parseInt(hotfix, 10);
            return `${major}.${minor}.${patch}-h${hotfixNum}`;
        }

        // Standard format - pass through unchanged
        return versionString;
    }

    /**
     * Compare two Palo Alto PAN-OS version strings for sorting (descending order)
     * Returns highest/most recent version first
     *
     * Format: major.minor.patch-hHotfix (e.g., "11.1.2-h5", "10.2.0-h3")
     *
     * @param {string} a - First version string (e.g., "11.1.2-h5")
     * @param {string} b - Second version string (e.g., "10.2.0-h3")
     * @returns {number} - Negative if a > b, positive if a < b, 0 if equal
     */
    compareVersions(a, b) {
        // Extract version components: major.minor.patch-hHotfix
        const parseVersion = (ver) => {
            const match = ver.match(/^(\d+)\.(\d+)\.(\d+)(?:-h(\d+))?/);
            if (!match) return { major: 0, minor: 0, patch: 0, hotfix: 0 };
            return {
                major: parseInt(match[1], 10),
                minor: parseInt(match[2], 10),
                patch: parseInt(match[3], 10),
                hotfix: match[4] ? parseInt(match[4], 10) : 0
            };
        };

        const vA = parseVersion(a);
        const vB = parseVersion(b);

        // Compare major, minor, patch, hotfix in order
        if (vA.major !== vB.major) return vB.major - vA.major;
        if (vA.minor !== vB.minor) return vB.minor - vA.minor;
        if (vA.patch !== vB.patch) return vB.patch - vA.patch;
        return vB.hotfix - vA.hotfix;
    }

    /**
     * Match fixed version from array based on installed version
     *
     * Logic:
     * - Normalize installed version (Azure → standard format)
     * - Extract major.minor from installed version
     * - Filter fixed versions matching same major.minor family
     * - Return minimum (first) matching version
     *
     * @param {string} installedVersion - Installed version (e.g., "10.2.0")
     * @param {Array<string>} fixedVersionsArray - Array of fixed versions from advisory
     * @returns {string|null} Best matching fixed version or null
     */
    matchFixedVersion(installedVersion, fixedVersionsArray) {
        if (!fixedVersionsArray || fixedVersionsArray.length === 0) {
            return null;
        }

        // Normalize installed version (handle Azure format)
        const normalized = this.normalizeVersion(installedVersion);

        // Extract major.minor from installed version
        const installedMatch = normalized.match(/^(\d+)\.(\d+)/);
        if (!installedMatch) {
            // Can't parse version (expected for non-standard formats like hotfixes)
            // Return first fixed version as safe fallback
            return fixedVersionsArray[0];
        }

        const [, installedMajor, installedMinor] = installedMatch;
        const installedKey = `${installedMajor}.${installedMinor}`;

        // Filter fixed versions matching the same major.minor family
        const matchingVersions = fixedVersionsArray.filter(v => {
            const fixedMatch = v.match(/^(\d+)\.(\d+)/);
            if (!fixedMatch) return false;
            const [, fixedMajor, fixedMinor] = fixedMatch;
            return `${fixedMajor}.${fixedMinor}` === installedKey;
        });

        if (matchingVersions.length > 0) {
            // Return first matching version (minimum fixed version for this family)
            return matchingVersions[0];
        }

        // No match found for this major.minor family
        console.warn(`No ${installedKey}.x fix found for ${installedVersion}. Available: ${fixedVersionsArray.join(', ')}`);
        return null;
    }

    /**
     * Get fixed version for a specific CVE from Palo Alto advisory
     *
     * @param {string} cveId - CVE identifier (e.g., "CVE-2024-3400")
     * @param {string} vendor - Vendor name for filtering
     * @param {string} installedVersion - Installed OS version for smart matching
     * @returns {Promise<string|null>} Fixed version string or null if not available
     */
    async getFixedVersion(cveId, vendor, installedVersion = null) {
        // Only query Palo Alto advisories for Palo Alto devices
        if (!vendor || !vendor.toLowerCase().includes('palo')) {
            return null;
        }

        // Validate CVE ID
        if (!cveId || !cveId.startsWith('CVE-')) {
            console.warn(`Invalid CVE ID: ${cveId}`);
            return null;
        }

        // Check cache first (5-minute TTL)
        const cached = this.advisoryCache.get(cveId);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
            // Apply version matching if installed version provided
            if (installedVersion && cached.fixedVersionsArray && cached.fixedVersionsArray.length > 0) {
                return this.matchFixedVersion(installedVersion, cached.fixedVersionsArray);
            }
            // Fallback to first version or null
            return cached.fixedVersionsArray && cached.fixedVersionsArray.length > 0
                ? cached.fixedVersionsArray[0]
                : null;
        }

        // Fetch from API on cache miss
        try {
            const response = await fetch(`/api/palo/advisory/${cveId}`);

            // Check for HTTP errors
            if (!response.ok) {
                console.warn(`API error for ${cveId}: ${response.status} ${response.statusText}`);
                // Cache empty result to prevent repeated failures
                this.advisoryCache.set(cveId, {
                    fixedVersionsArray: [],
                    timestamp: Date.now()
                });
                return null;
            }

            const advisory = await response.json();

            // Handle null responses (no advisory exists for this CVE)
            if (!advisory) {
                this.advisoryCache.set(cveId, {
                    fixedVersionsArray: [],
                    timestamp: Date.now()
                });
                return null;
            }

            // Parse first_fixed JSON array
            let firstFixed = [];
            if (advisory.first_fixed) {
                try {
                    firstFixed = JSON.parse(advisory.first_fixed);
                } catch (e) {
                    console.warn(`Failed to parse first_fixed for ${cveId}:`, e);
                }
            }

            // Cache the full array (not just first element)
            // We'll apply version matching at lookup time based on installed version
            this.advisoryCache.set(cveId, {
                fixedVersionsArray: firstFixed,
                timestamp: Date.now()
            });

            // Apply version matching if installed version provided
            let fixedVersion = null;
            if (installedVersion && firstFixed.length > 0) {
                fixedVersion = this.matchFixedVersion(installedVersion, firstFixed);
            } else if (firstFixed.length > 0) {
                // Fallback: return first version if no installed version provided
                fixedVersion = firstFixed[0];
            }

            return fixedVersion;

        } catch (error) {
            console.warn(`Failed to fetch advisory for ${cveId}:`, error.message);

            // Cache empty result to prevent repeated failures
            this.advisoryCache.set(cveId, {
                fixedVersionsArray: [],
                timestamp: Date.now()
            });

            return null;
        }
    }

    /**
     * Get fixed version for a device (checks all CVEs affecting the device)
     *
     * Strategy:
     * - Fetches advisories for all unique CVEs on the device (parallel)
     * - Returns first available fixed version found
     * - Future enhancement: Prioritize by VPR score or criticality
     *
     * @param {Object} device - Device object with vendor and vulnerabilities array
     * @returns {Promise<string|null>} Fixed version string or null
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
        // Pass device.operating_system for version matching
        const advisories = await Promise.all(
            cves.map(cve => this.getFixedVersion(cve, device.vendor, device.operating_system))
        );

        // Filter out nulls and deduplicate
        const validVersions = [...new Set(advisories.filter(v => v !== null))];

        if (validVersions.length === 0) {
            return null;
        }

        if (validVersions.length === 1) {
            return validVersions[0];
        }

        // Sort versions (highest/most recent first) - HEX-246
        validVersions.sort((a, b) => this.compareVersions(a, b));

        // Return highest version
        return validVersions[0];
    }

    /**
     * Clear the advisory cache (useful for testing or manual refresh)
     */
    clearCache() {
        this.advisoryCache.clear();
        console.log('Palo Alto advisory cache cleared');
    }

    /**
     * Get cache statistics (useful for debugging)
     *
     * @returns {Object} Cache stats with size and entries
     */
    getCacheStats() {
        return {
            size: this.advisoryCache.size,
            entries: Array.from(this.advisoryCache.keys())
        };
    }
}

// Global instance - accessible from all vulnerability pages
window.paloAdvisoryHelper = new PaloAdvisoryHelper();

console.log('Palo Alto Advisory Helper initialized');
