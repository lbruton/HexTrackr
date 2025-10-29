/**
 * Hostname Parser Helper - Frontend Implementation
 *
 * Provides client-side hostname parsing utilities that mirror the backend
 * HostnameParserService pattern-matching logic. Used for extracting location
 * codes from device hostnames across the frontend.
 *
 * Backend equivalent: app/services/hostnameParserService.js
 *
 * @fileoverview Frontend hostname parsing utilities
 * @author HexTrackr Development Team
 * @version 1.0.0
 * @since HEX-351 (v1.1.9)
 *
 * @example
 * // Extract location from hostname
 * const location = extractLocationFromHostname("stroudnswan01");
 * console.log(location); // "stroud"
 *
 * @example
 * // Handle various patterns
 * extractLocationFromHostname("tulsatowernswan01");  // "tulsatower"
 * extractLocationFromHostname("wtulsanrwan02");      // "wtulsa"
 * extractLocationFromHostname("elpasonmpan01");      // "elpaso"
 * extractLocationFromHostname("unknown-device");     // "unkno" (fallback)
 */

/* global window */

/**
 * Device type patterns to search for when extracting location
 * These patterns match the backend HostnameParserService configuration
 *
 * Pattern matching order matters - more specific patterns should come first
 * to prevent false matches (e.g., "nswitch" before "nswan")
 */
const DEVICE_TYPE_PATTERNS = [
    "nswan",      // Network switch (WAN) - most common
    "nrwan",      // Network router (WAN)
    "nfpan",      // Network firewall (PAN) - Palo Alto
    "nfwan",      // Network firewall (WAN) - generic
    "nswitch",    // Network switch - generic
    "nrouter",    // Network router - generic
    "nfirewall",  // Network firewall - generic
    "nmpan",      // Network management (PAN)
    "nwwbr",      // Network wireless bridge (specific)
    "wwbr",       // Wireless bridge (generic)
];

/**
 * Extract location code from hostname using device type pattern matching
 *
 * This function mirrors the backend HostnameParserService.extractViaPattern()
 * logic, searching for known device type patterns and extracting everything
 * before the pattern as the location code.
 *
 * @param {string} hostname - Device hostname (e.g., "stroudnswan01", "tulsatowernswan01")
 * @returns {string} Extracted location code in lowercase (e.g., "stroud", "tulsatower")
 *
 * @example
 * // Pattern-based extraction (high confidence)
 * extractLocationFromHostname("stroudnswan01");     // "stroud"
 * extractLocationFromHostname("tulsatowernswan01"); // "tulsatower"
 * extractLocationFromHostname("wtulsanrwan02");     // "wtulsa"
 *
 * @example
 * // Fallback extraction (low confidence)
 * extractLocationFromHostname("UNKN-RTR-01");  // "unkn-" (first 5 chars)
 * extractLocationFromHostname("device123");     // "devic" (first 5 chars)
 *
 * @see app/services/hostnameParserService.js - Backend equivalent
 */
function extractLocationFromHostname(hostname) {
    // Validate input
    if (!hostname || typeof hostname !== "string") {
        return "";
    }

    const lower = hostname.toLowerCase().trim();

    // Try pattern-based extraction (highest confidence)
    for (const pattern of DEVICE_TYPE_PATTERNS) {
        const index = lower.indexOf(pattern);
        if (index > 0) {
            // Found pattern! Location is everything before it
            return lower.substring(0, index);
        }
    }

    // Fallback: Use first 5 characters (same as backend fallback)
    // This matches backend HostnameParserService.extractViaSubstring()
    return lower.substring(0, 5);
}

/**
 * Extract site code from location using first 4 characters
 *
 * Simple extraction that takes the first 4 characters of the location
 * and converts to uppercase. This is a fallback when site code mappings
 * are not available.
 *
 * @param {string} location - Location code (e.g., "wtulsa", "stroud")
 * @returns {string} Site code in uppercase (e.g., "WTUL", "STRO")
 *
 * @example
 * extractSiteCode("wtulsa");    // "WTUL"
 * extractSiteCode("stroud");    // "STRO"
 * extractSiteCode("tulsatower"); // "TULS"
 *
 * @note This is a simplified version. Backend HostnameParserService
 * uses site code mappings from device-naming-patterns.json for more
 * accurate results.
 */
function extractSiteCode(location) {
    if (!location || typeof location !== "string") {
        return "";
    }
    return location.substring(0, 4).toUpperCase();
}

/**
 * Parse hostname and extract both location and site code
 *
 * Convenience function that extracts both location and site code
 * in a single call. Returns an object with both values.
 *
 * @param {string} hostname - Device hostname
 * @returns {{location: string, site: string}} Object with location and site codes
 *
 * @example
 * parseHostname("stroudnswan01");
 * // Returns: { location: "stroud", site: "STRO" }
 *
 * @example
 * parseHostname("tulsatowernswan01");
 * // Returns: { location: "tulsatower", site: "TULS" }
 */
function parseHostname(hostname) {
    const location = extractLocationFromHostname(hostname);
    const site = extractSiteCode(location);
    return { location, site };
}

// Export functions for use in other modules
if (typeof window !== "undefined") {
    window.hostnameParserHelper = {
        extractLocationFromHostname,
        extractSiteCode,
        parseHostname,
        DEVICE_TYPE_PATTERNS  // Export patterns for reference
    };
}

// ES6 module exports (if using module bundler)
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        extractLocationFromHostname,
        extractSiteCode,
        parseHostname,
        DEVICE_TYPE_PATTERNS
    };
}
