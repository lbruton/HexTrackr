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

// Get singleton instance explicitly (prevents race conditions)
const cacheService = CacheService.getInstance();

/**
 * Check if request should bypass cache
 * @param {object} req - Express request object
 * @returns {boolean} - True if cache should be bypassed
 */
function shouldBypassCache(req) {
    if (!req || !req.query) {
        return false;
    }

    // Support both explicit bustCache flag and timestamp query param
    if (Object.prototype.hasOwnProperty.call(req.query, "_t")) {
        return true;
    }

    if (typeof req.query.bustCache === "string") {
        return req.query.bustCache.toLowerCase() === "true";
    }

    return Boolean(req.query.bustCache);
}

/**
 * Send bypass response with no-cache headers
 * @param {object} res - Express response object
 * @param {object} payload - Response payload
 * @returns {object} - Express response
 */
function sendBypassResponse(res, payload) {
    res.setHeader("X-Cache", "BYPASS");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.json(payload);
}

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
     * GET /api/locations/stats
     *
     * Get aggregated vulnerability statistics grouped by location.
     * Returns array of locations with device counts, VPR totals, severity breakdowns,
     * KEV counts, vendor distributions, and ticket correlations.
     *
     * Caching: 5-minute server TTL, 60-second browser TTL
     * Cache invalidation: Triggered by CSV imports via cacheService.invalidate("stats")
     *
     * Query Parameters:
     * - bustCache: Set to "true" or append ?_t=[timestamp] to bypass cache
     *
     * Response format:
     * {
     *   success: true,
     *   data: [
     *     {
     *       location: "wtulsa",
     *       location_display: "WTULSA",
     *       device_count: 42,
     *       primary_vendor: "CISCO",
     *       vendor_breakdown: { CISCO: 35, "Palo Alto": 5, Other: 2 },
     *       total_vpr: 1847.3,
     *       severity_breakdown: {
     *         Critical: { count: 12, vpr: 456.2 },
     *         High: { count: 28, vpr: 892.1 },
     *         Medium: { count: 15, vpr: 398.0 },
     *         Low: { count: 8, vpr: 101.0 }
     *       },
     *       kev_count: 3,
     *       open_tickets: 2,
     *       confidence: 0.85
     *     }
     *   ],
     *   error: null
     * }
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
            console.error("Error fetching location stats:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch location statistics",
                details: error.message
            });
        }
    }
}

module.exports = LocationController;
