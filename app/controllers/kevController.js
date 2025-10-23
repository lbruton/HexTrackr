/**
 * @fileoverview KEV Controller
 * @module kevController
 * @description Controller for CISA Known Exploited Vulnerabilities operations
 * @since v1.0.21
 */

const KevService = require("../services/kevService");
const CacheService = require("../services/cacheService");

// Get singleton instance explicitly (prevents race conditions)
const cacheService = CacheService.getInstance();

/**
 * KEV Controller
 * @class KevController
 * @description Handles HTTP requests for KEV operations
 */
class KevController {
    /**
     * Creates an instance of KevController
     * @param {Object} db - Database instance
     */
    constructor(db) {
        this.kevService = new KevService(db);
    }

    /**
     * Sync KEV data from CISA API
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     * @throws {Error} Caught and returned as 500 response if:
     *   - KEV sync is already in progress (409 conflict)
     *   - CISA API is unreachable or returns invalid data
     *   - Database operations fail during sync
     *   - Cache clearing fails after successful sync
     */
    async syncKevData(req, res) {
        try {
            if (global.logger && global.logger.kev) {
                global.logger.kev.info("KEV sync requested via API", { source: "controller" });
            }

            // Check if sync is already in progress
            const status = await this.kevService.getSyncStatus();
            if (status.syncInProgress) {
                return res.status(409).json({
                    error: "Sync already in progress",
                    status: status
                });
            }

            // Perform sync
            const result = await this.kevService.syncKevData();

            if (global.logger && global.logger.kev) {
                global.logger.kev.info("KEV sync completed", {
                    totalKevs: result.totalKevs,
                    matchedCount: result.matchedCount,
                    source: "controller"
                });
            }

            // Clear all caches after KEV sync (vulnerabilities may have new KEV flags)
            cacheService.clearAll();

            res.json({
                success: true,
                message: "KEV data synchronized successfully",
                totalKevs: result.totalKevs,
                matchedCount: result.matchedCount,
                lastSync: result.lastSync,
                catalogVersion: result.catalogVersion
            });

        } catch (error) {
            if (global.logger && global.logger.kev) {
                global.logger.kev.error("KEV sync failed", {
                    error: error.message,
                    stack: error.stack,
                    source: "controller"
                });
            }
            res.status(500).json({
                error: "Failed to sync KEV data",
                message: error.message
            });
        }
    }

    /**
     * Get KEV sync status
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     * @throws {Error} Caught and returned as 500 response if:
     *   - Database query fails when retrieving sync status
     *   - KEV service metadata is corrupted or missing
     *   - Sync status retrieval encounters unexpected errors
     */
    async getKevStatus(req, res) {
        try {
            const status = await this.kevService.getSyncStatus();
            res.json(status);
        } catch (error) {
            if (global.logger && global.logger.kev) {
                global.logger.kev.error("Failed to get KEV status", {
                    error: error.message,
                    stack: error.stack,
                    source: "controller"
                });
            }
            res.status(500).json({
                error: "Failed to get KEV status",
                message: error.message
            });
        }
    }

    /**
     * Get KEV metadata for a specific CVE
     * @async
     * @param {Object} req - Express request object
     * @param {Object} req.params - URL parameters
     * @param {string} req.params.cveId - CVE identifier (e.g., "CVE-2024-1234")
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response:
     *   - 200: KEV metadata object for the specified CVE
     *   - 400: {error: "CVE ID is required"} if cveId parameter missing
     *   - 404: {error: "CVE not found in KEV catalog"} if CVE not in CISA catalog
     *   - 500: {error: "Failed to get KEV data", message: string}
     * @throws {Error} Caught and returned as 500 response if:
     *   - Database query fails when searching KEV catalog
     *   - KEV service encounters errors during metadata retrieval
     * @example
     * // GET /api/kev/CVE-2024-1234
     * // Returns: {cveId: "CVE-2024-1234", dateAdded: "2024-01-15", ...}
     */
    async getKevByCve(req, res) {
        try {
            const { cveId } = req.params;

            if (!cveId) {
                return res.status(400).json({
                    error: "CVE ID is required"
                });
            }

            const kevData = await this.kevService.getKevMetadata(cveId);

            if (!kevData) {
                return res.status(404).json({
                    error: "CVE not found in KEV catalog"
                });
            }

            res.json(kevData);

        } catch (error) {
            if (global.logger && global.logger.kev) {
                global.logger.kev.error("Failed to get KEV data for CVE", {
                    cveId: req.params.cveId,
                    error: error.message,
                    stack: error.stack,
                    source: "controller"
                });
            }
            res.status(500).json({
                error: "Failed to get KEV data",
                message: error.message
            });
        }
    }

    /**
     * Get all KEV vulnerabilities
     * @async
     * @param {Object} req - Express request object (no parameters required)
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response:
     *   - 200: {count: number, kevs: Array<Object>} - All KEVs in CISA catalog
     *   - 500: {error: "Failed to get KEV list", message: string}
     * @throws {Error} Caught and returned as 500 response if:
     *   - Database query fails when retrieving KEV catalog
     *   - KEV service encounters errors during retrieval
     * @example
     * // GET /api/kev/all
     * // Returns: {count: 1042, kevs: [{cveId: "CVE-2024-1234", ...}, ...]}
     */
    async getAllKevs(req, res) {
        try {
            const kevs = await this.kevService.getAllKevs();
            res.json({
                count: kevs.length,
                kevs: kevs
            });
        } catch (error) {
            if (global.logger && global.logger.kev) {
                global.logger.kev.error("Failed to get all KEVs", {
                    error: error.message,
                    stack: error.stack,
                    source: "controller"
                });
            }
            res.status(500).json({
                error: "Failed to get KEV list",
                message: error.message
            });
        }
    }

    /**
     * Get matched KEV vulnerabilities in environment - GET /api/kev/matched
     * Returns CISA Known Exploited Vulnerabilities that match vulnerabilities
     * currently tracked in the HexTrackr environment (cross-referenced by CVE ID)
     *
     * @async
     * @param {Object} req - Express request object
     * @param {Object} req.query - Query parameters
     * @param {number} [req.query.limit=100] - Maximum number of matched KEVs to return
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response:
     *   - 200: {count: number, limit: number, vulnerabilities: Array<Object>}
     *   - 500: {error: "Failed to get matched KEVs", message: string}
     * @throws {Error} Caught and returned as 500 response if KevService.getMatchedVulnerabilities fails
     * @route GET /api/kev/matched
     * @example
     * // GET /api/kev/matched?limit=50
     * // Returns: {count: 42, limit: 50, vulnerabilities: [{cveId: "CVE-2024-1234", ...}, ...]}
     */
    async getMatchedKevs(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const matched = await this.kevService.getMatchedVulnerabilities(limit);

            res.json({
                count: matched.length,
                limit: limit,
                vulnerabilities: matched
            });

        } catch (error) {
            if (global.logger && global.logger.kev) {
                global.logger.kev.error("Failed to get matched KEVs", {
                    error: error.message,
                    stack: error.stack,
                    source: "controller"
                });
            }
            res.status(500).json({
                error: "Failed to get matched KEVs",
                message: error.message
            });
        }
    }

    /**
     * Get KEV dashboard statistics - GET /api/kev/stats
     * Returns aggregated statistics about CISA Known Exploited Vulnerabilities
     * including total KEV count, matched vulnerabilities, and sync status
     *
     * @async
     * @param {Object} req - Express request object (no parameters required)
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response:
     *   - 200: {totalKevs: number, matchedCount: number, lastSync: string, catalogVersion: string}
     *   - 500: {error: "Failed to get KEV statistics", message: string}
     * @throws {Error} Caught and returned as 500 response if KevService.getDashboardStats fails
     * @route GET /api/kev/stats
     * @example
     * // GET /api/kev/stats
     * // Returns: {totalKevs: 1042, matchedCount: 87, lastSync: "2025-10-22T10:30:00Z", catalogVersion: "2025.10.22"}
     */
    async getKevStats(req, res) {
        try {
            const stats = await this.kevService.getDashboardStats();
            res.json(stats);
        } catch (error) {
            if (global.logger && global.logger.kev) {
                global.logger.kev.error("Failed to get KEV stats", {
                    error: error.message,
                    stack: error.stack,
                    source: "controller"
                });
            }
            res.status(500).json({
                error: "Failed to get KEV statistics",
                message: error.message
            });
        }
    }

    /**
     * Check if KEV auto-sync is needed - GET /api/kev/auto-sync/check
     * Determines if KEV catalog should be automatically refreshed based on time
     * elapsed since last sync. Used by background sync scheduler to decide
     * whether to trigger a CISA KEV catalog update.
     *
     * @async
     * @param {Object} req - Express request object
     * @param {Object} req.query - Query parameters
     * @param {number} [req.query.hours=24] - Hours threshold for auto-sync (default: 24)
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response:
     *   - 200: {autoSyncNeeded: boolean, hoursThreshold: number}
     *   - 500: {error: "Failed to check auto-sync status", message: string}
     * @throws {Error} Caught and returned as 500 response if KevService.isAutoSyncNeeded fails
     * @route GET /api/kev/auto-sync/check
     * @example
     * // Check if sync needed with default 24-hour threshold
     * // GET /api/kev/auto-sync/check
     * // Returns: {autoSyncNeeded: true, hoursThreshold: 24}
     *
     * @example
     * // Check with custom 12-hour threshold
     * // GET /api/kev/auto-sync/check?hours=12
     * // Returns: {autoSyncNeeded: false, hoursThreshold: 12}
     */
    async checkAutoSync(req, res) {
        try {
            const hoursThreshold = parseInt(req.query.hours) || 24;
            const needed = await this.kevService.isAutoSyncNeeded(hoursThreshold);

            res.json({
                autoSyncNeeded: needed,
                hoursThreshold: hoursThreshold
            });

        } catch (error) {
            if (global.logger && global.logger.kev) {
                global.logger.kev.error("Failed to check auto-sync status", {
                    error: error.message,
                    stack: error.stack,
                    source: "controller"
                });
            }
            res.status(500).json({
                error: "Failed to check auto-sync status",
                message: error.message
            });
        }
    }
}

module.exports = KevController;