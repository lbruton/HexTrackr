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
 *
 * @version 1.0.64
 * @date 2025-10-12
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
        if (!versionString) return 'Unknown';

        const versionUpper = versionString.toUpperCase();

        // Explicit OS type mentions
        if (versionUpper.includes('IOS XE')) return 'IOS XE';
        if (versionUpper.includes('IOS-XE')) return 'IOS XE';
        if (versionUpper.includes('IOSXE')) return 'IOS XE';

        if (versionUpper.includes('IOS XR')) return 'IOS XR';
        if (versionUpper.includes('IOS-XR')) return 'IOS XR';
        if (versionUpper.includes('IOSXR')) return 'IOS XR';

        if (versionUpper.includes('NX-OS')) return 'NX-OS';
        if (versionUpper.includes('NXOS')) return 'NX-OS';

        // Pattern-based detection (when OS not explicitly stated)

        // IOS: Train notation with parentheses like 15.2(8)E8 (check BEFORE IOS XE patterns)
        if (/\d+\.\d+\([^\)]+\)[a-zA-Z]*\d*/.test(versionString)) return 'IOS';

        // IOS: Train releases with capital letter suffix like 3.13.10S, 12.2.55SE
        if (/\d+\.\d+\.\d+[A-Z]+\d*/.test(versionString)) return 'IOS';

        // IOS XE: Clean 16.x, 17.x, or 3.x format WITHOUT train letters
        if (/\b(16|17|3)\.\d+\.\d+$/.test(versionString)) return 'IOS XE';
        if (/\b(16|17|3)\.\d+\.\d+[a-z]$/.test(versionString)) return 'IOS XE'; // lowercase letter ok (like 16.3.1a)

        // IOS XR: 6.x or 7.x with simple format
        if (/\b[67]\.\d+\.\d+/.test(versionString)) return 'IOS XR';

        // NX-OS: 9.x format
        if (/\b9\.\d+\(\d+\)/.test(versionString)) return 'NX-OS';

        return 'Unknown';
    }

    /**
     * Match fixed version from array based on installed OS type
     *
     * @param {string} installedVersion - Installed version (e.g., "CISCO IOS XE 16.9.2")
     * @param {Array<string>} fixedVersionsArray - Array of fixed versions from advisory
     * @returns {string|null} Best matching fixed version or null
     */
    matchFixedVersion(installedVersion, fixedVersionsArray) {
        if (!fixedVersionsArray || fixedVersionsArray.length === 0) {
            return null;
        }

        // Parse OS type from installed version
        const installedOS = this.parseOSType(installedVersion);

        if (installedOS === 'Unknown') {
            // Can't match - return first version as fallback
            console.warn(`Could not determine OS type from: ${installedVersion}`);
            return fixedVersionsArray[0];
        }

        // Filter fixed versions to match installed OS type
        const matchingVersions = fixedVersionsArray.filter(v =>
            this.parseOSType(v) === installedOS
        );

        if (matchingVersions.length > 0) {
            // Return first matching version (minimum fixed version)
            return matchingVersions[0];
        }

        // No match found - log warning and return null
        console.warn(`No ${installedOS} fix found for ${installedVersion}. Available: ${fixedVersionsArray.join(', ')}`);
        return null;
    }

    /**
     * Get fixed version for a specific CVE from Cisco advisory
     *
     * @param {string} cveId - CVE identifier (e.g., "CVE-2017-3881")
     * @param {string} vendor - Vendor name for filtering
     * @param {string} installedVersion - Installed OS version for smart matching
     * @returns {Promise<string|null>} Fixed version string or null if not available
     */
    async getFixedVersion(cveId, vendor, installedVersion = null) {
        // Only query Cisco advisories for Cisco devices
        if (!vendor || !vendor.toLowerCase().includes('cisco')) {
            return null;
        }

        // Validate CVE ID
        if (!cveId || !cveId.startsWith('CVE-')) {
            console.warn(`Invalid CVE ID: ${cveId}`);
            return null;
        }

        // Check cache first
        const cached = this.advisoryCache.get(cveId);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
            // Apply OS-aware matching if installed version provided
            if (installedVersion && cached.fixedVersionsArray && cached.fixedVersionsArray.length > 0) {
                return this.matchFixedVersion(installedVersion, cached.fixedVersionsArray);
            }
            // Fallback to first version or null
            return cached.fixedVersionsArray && cached.fixedVersionsArray.length > 0
                ? cached.fixedVersionsArray[0]
                : null;
        }

        // Fetch from API
        try {
            const response = await fetch(`/api/cisco/advisory/${cveId}`);

            // 404 means no advisory exists (not an error)
            if (response.status === 404) {
                this.advisoryCache.set(cveId, {
                    fixedVersionsArray: [],
                    timestamp: Date.now()
                });
                return null;
            }

            // Other errors
            if (!response.ok) {
                console.warn(`API error for ${cveId}: ${response.status} ${response.statusText}`);
                return null;
            }

            const advisory = await response.json();

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
            // We'll apply OS matching at lookup time based on installed version
            this.advisoryCache.set(cveId, {
                fixedVersionsArray: firstFixed,
                timestamp: Date.now()
            });

            // Apply OS-aware matching if installed version provided
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
        // Pass device.operating_system for OS-aware matching
        const advisories = await Promise.all(
            cves.map(cve => this.getFixedVersion(cve, device.vendor, device.operating_system))
        );

        // Return first non-null fixed version
        // TODO: Future enhancement - prioritize by VPR score or severity
        const fixedVersion = advisories.find(v => v !== null);

        return fixedVersion || null;
    }

    /**
     * Clear the advisory cache (useful for testing or manual refresh)
     */
    clearCache() {
        this.advisoryCache.clear();
        console.log('✅ Cisco advisory cache cleared');
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

console.log('✅ Cisco Advisory Helper initialized');
