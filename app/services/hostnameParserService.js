/**
 * Smart Hostname Parser Service
 * 
 * Parses device hostnames using configurable patterns to extract:
 * - Site code (4 chars for Hexagon EAM)
 * - Location code (variable length)
 * - Device type
 * 
 * @module services/hostnameParserService
 */

const fs = require("fs");
const path = require("path");

class HostnameParserService {
    constructor() {
        this.config = null;
        this.loadConfig();
    }

    /**
     * Load device naming patterns from configuration file
     */
    loadConfig() {
        try {
            const configPath = path.join(__dirname, "../../config/device-naming-patterns.json");
            const configData = fs.readFileSync(configPath, "utf8");
            this.config = JSON.parse(configData);
        } catch (error) {
            if (global.logger?.error) {
                global.logger.error("backend", "hostname", "Failed to load device naming patterns config", { error: error.message, configPath: "config/device-naming-patterns.json" });
            } else {
                console.error("Failed to load device naming patterns config:", error.message);
            }

            // Fallback to minimal config
            this.config = {
                deviceTypePatterns: [
                    { pattern: "nswan", type: "switch", precedence: 1 },
                    { pattern: "nrwan", type: "router", precedence: 2 },
                    { pattern: "nfpan", type: "firewall", precedence: 3 }
                ],
                fallbackRules: {
                    site_code_length: 4,
                    location_code_length: 5
                }
            };
        }
    }

    /**
     * Parse hostname and extract site/location information
     * 
     * @param {string} hostname - Device hostname (e.g., "tulsatowernswan01")
     * @returns {{
     *   hostname: string,
     *   location: string,
     *   site_code: string,
     *   device_type: string|null,
     *   parsing_method: string,
     *   confidence: number
     * }}
     * 
     * @example
     * parseHostname("tulsatowernswan01")
     * // Returns:
     * // {
     * //   hostname: "tulsatowernswan01",
     * //   location: "tulsatower",
     * //   site_code: "TULS",
     * //   device_type: "switch",
     * //   parsing_method: "regex_pattern",
     * //   confidence: 0.95
     * // }
     */
    parseHostname(hostname) {
        if (!hostname || typeof hostname !== "string") {
            return this.createEmptyResult(hostname);
        }

        const lower = hostname.toLowerCase().trim();

        // Try pattern-based extraction first (highest confidence)
        const patternResult = this.extractViaPattern(lower);
        if (patternResult) {
            return patternResult;
        }

        // Fallback to substring extraction (lower confidence)
        return this.extractViaSubstring(hostname);
    }

    /**
     * Extract location using device type patterns
     * Example: "tulsatowernswan01" → location: "tulsatower", type: "switch"
     */
    extractViaPattern(hostname) {
        // Sort patterns by precedence (try most specific first)
        const patterns = this.config.deviceTypePatterns
            .sort((a, b) => (a.precedence || 99) - (b.precedence || 99));

        for (const patternDef of patterns) {
            const pattern = patternDef.pattern.toLowerCase();
            let index = -1;
            let matchedPattern = null;

            // Try regex matching first (for patterns with special chars like \d+)
            if (pattern.includes("\\")) {
                try {
                    const regex = new RegExp(pattern, "i");
                    const match = hostname.match(regex);
                    if (match) {
                        index = match.index;
                        matchedPattern = match[0];
                    }
                } catch (e) {
                    // If regex fails, fall back to literal string matching
                    index = hostname.indexOf(pattern);
                    matchedPattern = pattern;
                }
            } else {
                // Simple literal string matching
                index = hostname.indexOf(pattern);
                matchedPattern = pattern;
            }

            if (index > 0) {
                // Found device type pattern!
                const location = hostname.substring(0, index);

                // Try to find site code mapping
                const siteCodeMapping = this.findSiteCodeForLocation(location);

                // Normalize location (wtuls → wtulsa, etc.)
                const normalizedLocation = this.normalizeLocation(location);

                return {
                    hostname: hostname,
                    location: normalizedLocation,  // Use normalized location
                    site_code: siteCodeMapping ? siteCodeMapping.site_code : this.deriveSiteCode(location),
                    device_type: patternDef.type || null,
                    parsing_method: "regex_pattern",
                    confidence: siteCodeMapping ? siteCodeMapping.confidence : 0.7
                };
            }
        }

        return null;
    }

    /**
     * Fallback: Extract using substring rules
     * Example: "STRO-RTR-01" → site: "STRO", location: "STRO-"
     */
    extractViaSubstring(hostname) {
        const siteLength = this.config.fallbackRules?.site_code_length || 4;
        const locationLength = this.config.fallbackRules?.location_code_length || 5;

        const site = hostname.substring(0, siteLength).toUpperCase();
        const location = hostname.substring(0, locationLength).toUpperCase();

        return {
            hostname: hostname,
            location: location,
            site_code: site,
            device_type: null,
            parsing_method: "substring_fallback",
            confidence: 0.5
        };
    }

    /**
     * Find site code mapping for a location string
     */
    findSiteCodeForLocation(location) {
        if (!this.config.siteCodeMappings?.mappings) {
            return null;
        }

        const lower = location.toLowerCase();

        // Exact match first
        for (const mapping of this.config.siteCodeMappings.mappings) {
            if (mapping.location.toLowerCase() === lower) {
                return mapping;
            }
        }

        // Alias match
        for (const mapping of this.config.siteCodeMappings.mappings) {
            if (mapping.aliases) {
                for (const alias of mapping.aliases) {
                    if (alias.toLowerCase() === lower) {
                        return {
                            ...mapping,
                            confidence: mapping.confidence * 0.9  // Slightly lower for alias match
                        };
                    }
                }
            }
        }

        return null;
    }

    /**
     * Derive a 4-character site code from location string
     * Example: "tulsatower" → "TULS"
     */
    deriveSiteCode(location) {
        // Simple heuristic: Take first 4 chars, uppercase
        return location.substring(0, 4).toUpperCase();
    }

    /**
     * Create empty result structure
     */
    createEmptyResult(hostname) {
        return {
            hostname: hostname || "",
            location: "",
            site_code: "",
            device_type: null,
            parsing_method: "failed",
            confidence: 0
        };
    }

    /**
     * Fuzzy search for site/location codes
     * Used when user types manually and we want to suggest matches
     * 
     * @param {string} query - User input (e.g., "tuls", "stro")
     * @param {number} maxResults - Maximum results to return
     * @returns {Array<{location: string, site_code: string, similarity: number}>}
     */
    fuzzySearch(query, maxResults = 5) {
        if (!this.config.siteCodeMappings?.mappings) {
            return [];
        }

        const lower = query.toLowerCase();
        const results = [];

        for (const mapping of this.config.siteCodeMappings.mappings) {
            // Check location
            let similarity = this.calculateSimilarity(lower, mapping.location.toLowerCase());
            if (similarity > 0) {
                results.push({
                    location: mapping.location,
                    site_code: mapping.site_code,
                    similarity: similarity,
                    match_type: "location"
                });
            }

            // Check site code
            similarity = this.calculateSimilarity(lower, mapping.site_code.toLowerCase());
            if (similarity > 0) {
                results.push({
                    location: mapping.location,
                    site_code: mapping.site_code,
                    similarity: similarity,
                    match_type: "site_code"
                });
            }

            // Check aliases
            if (mapping.aliases) {
                for (const alias of mapping.aliases) {
                    similarity = this.calculateSimilarity(lower, alias.toLowerCase());
                    if (similarity > 0) {
                        results.push({
                            location: mapping.location,
                            site_code: mapping.site_code,
                            similarity: similarity,
                            match_type: "alias"
                        });
                    }
                }
            }
        }

        // Sort by similarity (highest first), deduplicate, limit results
        const minSimilarity = this.config.fuzzyMatchSettings?.min_similarity || 0.6;
        const unique = new Map();
        
        results
            .filter(r => r.similarity >= minSimilarity)
            .sort((a, b) => b.similarity - a.similarity)
            .forEach(r => {
                const key = `${r.site_code}_${r.location}`;
                if (!unique.has(key) || unique.get(key).similarity < r.similarity) {
                    unique.set(key, r);
                }
            });

        return Array.from(unique.values()).slice(0, maxResults);
    }

    /**
     * Calculate string similarity (simple prefix + substring match)
     * Returns 0.0-1.0 score
     */
    calculateSimilarity(query, target) {
        // Exact match
        if (query === target) {return 1.0;}

        // Starts with query (high confidence)
        if (target.startsWith(query)) {return 0.9;}

        // Query starts with target (medium confidence)
        if (query.startsWith(target)) {return 0.8;}

        // Contains query (lower confidence)
        if (target.includes(query)) {return 0.7;}

        // Levenshtein distance for fuzzy match (basic)
        const distance = this.levenshteinDistance(query, target);
        const maxLength = Math.max(query.length, target.length);
        const similarity = 1 - (distance / maxLength);

        return similarity > 0.6 ? similarity : 0;
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    levenshteinDistance(a, b) {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    /**
     * Get all known device type patterns
     */
    getDeviceTypePatterns() {
        return this.config.deviceTypePatterns || [];
    }

    /**
     * Get all known site code mappings
     */
    getSiteCodeMappings() {
        return this.config.siteCodeMappings?.mappings || [];
    }

    /**
     * Normalize a location string to its canonical form
     *
     * Handles variations and aliases to return the standard location name.
     * Examples:
     * - "wtuls" → "wtulsa" (alias match)
     * - "wtulsa" → "wtulsa" (exact match)
     * - "strou" → "stroud" (alias match)
     *
     * @param {string} location - Raw location string extracted from hostname
     * @returns {string} - Normalized canonical location, or original if no mapping found
     */
    normalizeLocation(location) {
        if (!location || typeof location !== "string") {
            return location;
        }

        const lower = location.toLowerCase().trim();

        // Try to find a site code mapping for this location
        const mapping = this.findSiteCodeForLocation(lower);

        if (mapping && mapping.location) {
            // Return the canonical location from the mapping
            return mapping.location.toLowerCase();
        }

        // No mapping found - return original location as-is
        return lower;
    }

    /**
     * Reload configuration (for when config file changes)
     */
    reloadConfig() {
        this.loadConfig();
    }
}

// Singleton instance
let instance = null;

/**
 * Get singleton instance of HostnameParserService
 */
function getHostnameParserService() {
    if (!instance) {
        instance = new HostnameParserService();
    }
    return instance;
}

module.exports = {
    HostnameParserService,
    getHostnameParserService
};
