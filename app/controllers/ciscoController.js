/**
 * @fileoverview Cisco PSIRT Advisory Controller
 * @module ciscoController
 * @description Controller for Cisco PSIRT advisory operations
 * @since v1.0.63
 */

const CiscoAdvisoryService = require("../services/ciscoAdvisoryService");
const CacheService = require("../services/cacheService");

// Get singleton instance explicitly (prevents race conditions)
const cacheService = CacheService.getInstance();

/**
 * Cisco Advisory Controller
 * @class CiscoController
 * @description Handles HTTP requests for Cisco PSIRT advisory operations
 */
class CiscoController {
    /**
     * Creates an instance of CiscoController
     * @param {Object} db - Database instance
     * @param {Object} preferencesService - PreferencesService instance
     */
    constructor(db, preferencesService) {
        this.ciscoAdvisoryService = new CiscoAdvisoryService(db, preferencesService);
    }

    /**
     * Sync Cisco PSIRT advisory data
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async syncCiscoAdvisories(req, res) {
        try {
            console.log("Cisco advisory sync requested via API");

            // Check if sync is already in progress
            const status = await this.ciscoAdvisoryService.getSyncStatus();
            if (status.syncInProgress) {
                return res.status(409).json({
                    error: "Sync already in progress",
                    status: status
                });
            }

            // Perform sync (pass userId from session for credential fetch)
            const result = await this.ciscoAdvisoryService.syncCiscoAdvisories(req.session.userId);

            console.log(` Cisco advisory sync completed: ${result.totalAdvisories} advisories, ${result.matchedCount} matched`);

            // Clear all caches after sync (vulnerabilities may have new fix data)
            cacheService.clearAll();

            res.json({
                success: true,
                message: "Cisco advisory data synchronized successfully",
                totalAdvisories: result.totalAdvisories,
                matchedCount: result.matchedCount,
                totalCvesChecked: result.totalCvesChecked,
                lastSync: result.lastSync
            });

        } catch (error) {
            console.error("Cisco advisory sync failed:", error);
            res.status(500).json({
                error: "Failed to sync Cisco advisory data",
                message: error.message
            });
        }
    }

    /**
     * Get Cisco advisory sync status
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getCiscoStatus(req, res) {
        try {
            const status = await this.ciscoAdvisoryService.getSyncStatus();
            res.json(status);
        } catch (error) {
            console.error("Failed to get Cisco advisory status:", error);
            res.status(500).json({
                error: "Failed to get Cisco advisory status",
                message: error.message
            });
        }
    }

    /**
     * Get Cisco advisory data for a specific CVE
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getCiscoAdvisoryByCve(req, res) {
        try {
            const { cveId } = req.params;

            if (!cveId) {
                return res.status(400).json({
                    error: "CVE ID is required"
                });
            }

            // HEX-282: Query database directly - no cache needed
            // Database IS the cache - advisory data is persisted from sync operations
            // Frontend has 5-minute cache (cisco-advisory-helper.js) to reduce requests
            const advisoryData = await this.ciscoAdvisoryService.getCiscoAdvisory(cveId);

            // Set browser cache header (60 seconds) for moderate caching
            // This allows updates to appear quickly after sync operations
            res.setHeader("Cache-Control", "public, max-age=60, must-revalidate");

            // Return null for 404s (frontend handles this gracefully)
            return res.json(advisoryData || null);

        } catch (error) {
            console.error(` Failed to get Cisco advisory for CVE ${req.params.cveId}:`, error);
            res.status(500).json({
                error: "Failed to get Cisco advisory data",
                message: error.message
            });
        }
    }

    /**
     * Check if auto-sync is needed
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async checkAutoSync(req, res) {
        try {
            const hoursThreshold = parseInt(req.query.hours) || 24;
            const needed = await this.ciscoAdvisoryService.isAutoSyncNeeded(hoursThreshold);

            res.json({
                autoSyncNeeded: needed,
                hoursThreshold: hoursThreshold
            });

        } catch (error) {
            console.error("Failed to check Cisco auto-sync status:", error);
            res.status(500).json({
                error: "Failed to check auto-sync status",
                message: error.message
            });
        }
    }
}

module.exports = CiscoController;
