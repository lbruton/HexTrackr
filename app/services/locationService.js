/**
 * LocationService - Location-based vulnerability aggregation and analytics
 *
 * Aggregates vulnerabilities by physical location (extracted from hostnames) to provide
 * site-level security visibility and geographic risk prioritization.
 *
 * Key Features:
 * - Multi-vendor aggregation (CISCO, Palo Alto, Other)
 * - Hostname parsing using hostnameParserService (config-driven patterns)
 * - VPR score calculations and severity breakdowns
 * - Ticket correlation by location
 * - KEV (Known Exploited Vulnerability) detection
 * - Vendor distribution with device counts
 *
 * Related Issues:
 * - HEX-288: Location Cards View (parent)
 * - HEX-292: Implementation Phase 1 MVP
 *
 * @module services/locationService
 * @since 1.0.80
 */

const { getHostnameParserService } = require("./hostnameParserService");

class LocationService {
    constructor() {
        this.db = null;
        this.hostnameParser = getHostnameParserService();
    }

    /**
     * Initialize service with database connection
     * @param {sqlite3.Database} database - Database connection
     */
    initialize(database) {
        this.db = database;
    }

    /**
     * Get location-based vulnerability statistics with multi-vendor aggregation
     *
     * Returns aggregated vulnerability data grouped by location with:
     * - Device count (unique hostnames per location)
     * - Vendor breakdown (CISCO, Palo Alto, Other)
     * - VPR score totals and severity distributions
     * - KEV presence indicators
     * - Open ticket correlation
     *
     * @returns {Promise<{success: boolean, data: Array<Object>, error: string|null}>}
     *
     * @example
     * const result = await locationService.getLocationStats();
     * // Returns:
     * // {
     * //   success: true,
     * //   data: [
     * //     {
     * //       location: "wtulsa",
     * //       location_display: "WTULSA",
     * //       device_count: 42,
     * //       primary_vendor: "CISCO",
     * //       vendor_breakdown: { CISCO: 35, "Palo Alto": 5, Other: 2 },
     * //       total_vpr: 1847.3,
     * //       severity_breakdown: {
     * //         Critical: { count: 12, vpr: 456.2 },
     * //         High: { count: 28, vpr: 892.1 },
     * //         Medium: { count: 15, vpr: 398.0 },
     * //         Low: { count: 8, vpr: 101.0 }
     * //       },
     * //       kev_count: 3,
     * //       open_tickets: 2,
     * //       confidence: 0.85
     * //     }
     * //   ],
     * //   error: null
     * // }
     */
    async getLocationStats() {
        try {
            // Query all current vulnerabilities with hostname and vendor info
            const query = `
                SELECT
                    hostname,
                    vendor,
                    severity,
                    vpr_score,
                    cve,
                    isKev
                FROM vulnerabilities_current
                WHERE hostname IS NOT NULL
                  AND hostname != ''
                ORDER BY hostname
            `;

            const vulnerabilities = await this._queryDatabase(query);

            if (!vulnerabilities || vulnerabilities.length === 0) {
                return {
                    success: true,
                    data: [],
                    error: null
                };
            }

            // Group vulnerabilities by location
            const locationMap = new Map();

            for (const vuln of vulnerabilities) {
                // Parse hostname to extract location
                const parsed = this.hostnameParser.parseHostname(vuln.hostname);

                if (!parsed.location || parsed.confidence < 0.5) {
                    // Skip low-confidence parses
                    continue;
                }

                const location = parsed.location.toLowerCase();
                const vendor = this._normalizeVendor(vuln.vendor);

                // Initialize location entry if needed
                if (!locationMap.has(location)) {
                    locationMap.set(location, {
                        location: location,
                        location_display: location.toUpperCase(),
                        hostnames: new Set(),
                        vendor_devices: {
                            CISCO: new Set(),
                            "Palo Alto": new Set(),
                            Other: new Set()
                        },
                        total_vpr: 0,
                        severity_breakdown: {
                            Critical: { count: 0, vpr: 0 },
                            High: { count: 0, vpr: 0 },
                            Medium: { count: 0, vpr: 0 },
                            Low: { count: 0, vpr: 0 }
                        },
                        kev_cves: new Set(),
                        confidence_sum: 0,
                        confidence_count: 0
                    });
                }

                const locationData = locationMap.get(location);

                // Track unique hostnames (for device count)
                locationData.hostnames.add(vuln.hostname);

                // Track vendor-specific device counts
                locationData.vendor_devices[vendor].add(vuln.hostname);

                // Aggregate VPR scores
                const vprScore = parseFloat(vuln.vpr_score) || 0;
                locationData.total_vpr += vprScore;

                // Aggregate severity breakdown
                const severity = vuln.severity || "Low";
                if (locationData.severity_breakdown[severity]) {
                    locationData.severity_breakdown[severity].count++;
                    locationData.severity_breakdown[severity].vpr += vprScore;
                }

                // Track KEV vulnerabilities
                if (vuln.isKev === "Yes" && vuln.cve) {
                    locationData.kev_cves.add(vuln.cve);
                }

                // Accumulate confidence scores for averaging
                locationData.confidence_sum += parsed.confidence;
                locationData.confidence_count++;
            }

            // Query ticket counts by location
            const ticketCounts = await this._getTicketCountsByLocation();

            // Transform map to array and finalize metrics
            const locations = Array.from(locationMap.values()).map(loc => {
                // Calculate vendor breakdown (counts only)
                const vendor_breakdown = {
                    CISCO: loc.vendor_devices.CISCO.size,
                    "Palo Alto": loc.vendor_devices["Palo Alto"].size,
                    Other: loc.vendor_devices.Other.size
                };

                // Determine primary vendor (most devices)
                const primary_vendor = this._determinePrimaryVendor(vendor_breakdown);

                // Calculate average parsing confidence
                const avg_confidence = loc.confidence_count > 0
                    ? loc.confidence_sum / loc.confidence_count
                    : 0.5;

                return {
                    location: loc.location,
                    location_display: loc.location_display,
                    device_count: loc.hostnames.size,
                    primary_vendor: primary_vendor,
                    vendor_breakdown: vendor_breakdown,
                    total_vpr: Math.round(loc.total_vpr * 10) / 10, // Round to 1 decimal
                    severity_breakdown: loc.severity_breakdown,
                    kev_count: loc.kev_cves.size,
                    open_tickets: ticketCounts.get(loc.location) || 0,
                    confidence: Math.round(avg_confidence * 100) / 100 // Round to 2 decimals
                };
            });

            // Sort by total VPR descending (highest risk first)
            locations.sort((a, b) => b.total_vpr - a.total_vpr);

            return {
                success: true,
                data: locations,
                error: null
            };

        } catch (error) {
            console.error("[LocationService] Error getting location stats:", error);
            return {
                success: false,
                data: [],
                error: error.message
            };
        }
    }

    /**
     * Get count of open tickets by location
     *
     * @private
     * @returns {Promise<Map<string, number>>} Map of location -> ticket count
     */
    async _getTicketCountsByLocation() {
        try {
            const query = `
                SELECT
                    LOWER(location) as location,
                    COUNT(*) as ticket_count
                FROM tickets
                WHERE state IN ('Open', 'In Progress', 'Pending')
                  AND location IS NOT NULL
                  AND location != ''
                GROUP BY LOWER(location)
            `;

            const results = await this._queryDatabase(query);

            const ticketMap = new Map();
            for (const row of results) {
                ticketMap.set(row.location, row.ticket_count);
            }

            return ticketMap;

        } catch (error) {
            console.error("[LocationService] Error getting ticket counts:", error);
            return new Map(); // Return empty map on error
        }
    }

    /**
     * Normalize vendor names to standard categories
     *
     * @private
     * @param {string} vendor - Raw vendor name from database
     * @returns {string} Normalized vendor: "CISCO", "Palo Alto", or "Other"
     */
    _normalizeVendor(vendor) {
        if (!vendor) {return "Other";}

        const vendorLower = vendor.toLowerCase();

        if (vendorLower.includes("cisco")) {
            return "CISCO";
        } else if (vendorLower.includes("palo") || vendorLower.includes("pan")) {
            return "Palo Alto";
        } else {
            return "Other";
        }
    }

    /**
     * Determine primary vendor based on device count breakdown
     *
     * @private
     * @param {Object} vendor_breakdown - { CISCO: 35, "Palo Alto": 5, Other: 2 }
     * @returns {string} Primary vendor name
     */
    _determinePrimaryVendor(vendor_breakdown) {
        let maxCount = 0;
        let primaryVendor = "Other";

        for (const [vendor, count] of Object.entries(vendor_breakdown)) {
            if (count > maxCount) {
                maxCount = count;
                primaryVendor = vendor;
            }
        }

        return primaryVendor;
    }

    /**
     * Execute database query and return promise
     *
     * @private
     * @param {string} query - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<Array>}
     */
    _queryDatabase(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }
}

// Singleton instance
let instance = null;

/**
 * Get singleton instance of LocationService
 * @returns {LocationService}
 */
function getLocationService() {
    if (!instance) {
        instance = new LocationService();
    }
    return instance;
}

module.exports = {
    LocationService,
    getLocationService
};
