/**
 * Location Controller
 * HEX-292: Location Cards Implementation - Task 2 (Backend API)
 *
 * Handles HTTP requests for location-based vulnerability aggregation.
 * Delegates business logic to locationService.
 *
 * INTEGRATION CHECKLIST:
 * 1. Import this controller in server.js: const LocationController = require("./app/controllers/locationController");
 * 2. Initialize after database connection: LocationController.initialize(db);
 * 3. Register routes: app.use("/api/locations", require("./app/routes/locations"));
 */

const { LocationService } = require("../services/locationService");
const CacheService = require("../services/cacheService");
const { shouldBypassCache, sendBypassResponse } = require("../utils/httpHelpers");

// Get singleton instance explicitly (prevents race conditions)
const cacheService = CacheService.getInstance();

// HEX-346: Cache-busting helpers moved to app/utils/httpHelpers.js
// - shouldBypassCache(req): Check if cache should be bypassed via query params (_t or bustCache)
// - sendBypassResponse(res, payload): Send JSON response with cache bypass headers

class LocationController {
    constructor() {
        this.locationService = new LocationService();
    }

    /**
     * Initialize controller with database connection
     * Called from server.js during setup
     */
    static initialize(database) {
        if (!LocationController.instance) {
            LocationController.instance = new LocationController();
        }
        LocationController.instance.locationService.initialize(database);
        return LocationController.instance;
    }

    /**
     * Get singleton instance (for use in routes)
     */
    static getInstance() {
        if (!LocationController.instance) {
            throw new Error("LocationController not initialized. Call initialize() first.");
        }
        return LocationController.instance;
    }

    /**
     * Get aggregated vulnerability statistics grouped by location
     * Handles GET /api/locations/stats endpoint with intelligent caching
     * Returns array of locations with device counts, VPR totals, severity breakdowns,
     * KEV counts, vendor distributions, and ticket correlations
     *
     * Caching Strategy:
     * - Server cache: 5-minute TTL (300s)
     * - Browser cache: 60-second TTL
     * - Cache key: "location-stats"
     * - Cache type: "stats" (invalidated on CSV imports)
     * - Cache bypass: Query param bustCache=true or ?_t=[timestamp]
     *
     * @async
     * @param {Object} req - Express request object
     * @param {Object} req.query - Query parameters
     * @param {string} [req.query.bustCache] - Set to "true" to bypass cache
     * @param {string} [req.query._t] - Timestamp param to bypass cache
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response:
     *   - 200: {success: true, data: Array<Object>, error: null}
     *     - data[].location: Normalized location code (e.g., "wtulsa")
     *     - data[].location_display: Display name (e.g., "WTULSA")
     *     - data[].device_count: Number of devices at location
     *     - data[].primary_vendor: Most common vendor at location
     *     - data[].vendor_breakdown: Object mapping vendors to device counts
     *     - data[].total_vpr: Aggregated VPR score across all devices
     *     - data[].severity_breakdown: Object with Critical/High/Medium/Low counts and VPR
     *     - data[].kev_count: Count of CISA Known Exploited Vulnerabilities
     *     - data[].open_tickets: Count of open tickets for location
     *     - data[].confidence: Data quality confidence score (0.0-1.0)
     *   - 500: {success: false, error: string, details: string}
     * @throws {Error} Caught and returned as 500 response if:
     *   - LocationService.getLocationStats() fails
     *   - Database query errors during aggregation
     *   - Cache service encounters errors
     * @route GET /api/locations/stats
     * @example
     * // Normal cached request
     * // GET /api/locations/stats
     * // Response: {success: true, data: [{location: "wtulsa", device_count: 42, ...}], error: null}
     *
     * @example
     * // Cache bypass request
     * // GET /api/locations/stats?bustCache=true
     * // Headers: X-Cache: BYPASS, Cache-Control: no-cache, no-store, must-revalidate
     * // Response: {success: true, data: [...], error: null}
     */
    static async getLocationStats(req, res) {
        try {
            const bypassCache = shouldBypassCache(req);
            const controller = LocationController.getInstance();

            // If cache bypass requested, fetch directly and return with no-cache headers
            if (bypassCache) {
                const result = await controller.locationService.getLocationStats();

                // Service returns {success, data, error} format
                if (!result.success) {
                    return res.status(500).json(result);
                }

                return sendBypassResponse(res, result);
            }

            // Use caching for normal requests
            // Server cache: 5min (300s), Browser cache: 60s
            // Cache key: "location-stats" (no vendor filtering in v1)
            await cacheService.withCaching(
                res,
                "stats",                    // Cache type (invalidated on CSV import)
                "location-stats",           // Cache key
                300,                        // Server TTL: 5 minutes
                async () => {
                    const result = await controller.locationService.getLocationStats();

                    // If service returns error, throw to trigger cache bypass
                    if (!result.success) {
                        throw new Error(result.error || "Failed to get location stats");
                    }

                    // Return the full {success, data, error} object
                    return result;
                },
                60                          // Browser TTL: 60 seconds
            );
        } catch (error) {
            if (global.logger?.error) {
                global.logger.error("backend", "location", "Error fetching location stats", { error: error.message });
            } else {
                console.error("Error fetching location stats:", error);
            }
            res.status(500).json({
                success: false,
                error: "Failed to fetch location statistics",
                details: error.message
            });
        }
    }
}

module.exports = LocationController;
