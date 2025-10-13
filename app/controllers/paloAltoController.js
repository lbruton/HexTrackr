/**
 * @fileoverview Palo Alto Security Advisory Controller
 * @module paloAltoController
 * @description Controller for Palo Alto Security Advisory operations
 * @since v1.0.63
 */

const PaloAltoService = require("../services/paloAltoService");
const CacheService = require("../services/cacheService");

// Get singleton instance explicitly (prevents race conditions)
const cacheService = CacheService.getInstance();

/**
 * Palo Alto Advisory Controller
 * @class PaloAltoController
 * @description Handles HTTP requests for Palo Alto Security Advisory operations
 */
class PaloAltoController {
    /**
     * Creates an instance of PaloAltoController
     * @param {Object} db - Database instance
     * @param {Object} preferencesService - PreferencesService instance
     */
    constructor(db, preferencesService) {
        this.paloAdvisoryService = new PaloAltoService(db, preferencesService);
    }

    /**
     * Sync Palo Alto Security Advisory data
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async syncPaloAdvisories(req, res) {
        try {
            console.log("🔥 Palo Alto advisory sync requested via API");

            // Check if sync is already in progress
            const status = await this.paloAdvisoryService.getSyncStatus();
            if (status.syncInProgress) {
                return res.status(409).json({
                    error: "Sync already in progress",
                    status: status
                });
            }

            // Perform sync (pass userId from session for consistency, not used for Palo Alto)
            const result = await this.paloAdvisoryService.syncPaloAdvisories(req.session.userId);

            console.log(`✅ Palo Alto advisory sync completed: ${result.totalAdvisories} advisories, ${result.matchedCount} matched`);

            // Clear all caches after sync (vulnerabilities may have new fix data)
            cacheService.clearAll();

            res.json({
                success: true,
                message: "Palo Alto advisory data synchronized successfully",
                totalAdvisories: result.totalAdvisories,
                matchedCount: result.matchedCount,
                totalCvesChecked: result.totalCvesChecked,
                lastSync: result.lastSync
            });

        } catch (error) {
            console.error("❌ Palo Alto advisory sync failed:", error);
            res.status(500).json({
                error: "Failed to sync Palo Alto advisory data",
                message: error.message
            });
        }
    }

    /**
     * Get Palo Alto advisory sync status
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getPaloStatus(req, res) {
        try {
            const status = await this.paloAdvisoryService.getSyncStatus();
            res.json(status);
        } catch (error) {
            console.error("❌ Failed to get Palo Alto advisory status:", error);
            res.status(500).json({
                error: "Failed to get Palo Alto advisory status",
                message: error.message
            });
        }
    }

    /**
     * Get Palo Alto advisory data for a specific CVE
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getPaloAdvisoryByCve(req, res) {
        try {
            const { cveId } = req.params;

            if (!cveId) {
                return res.status(400).json({
                    error: "CVE ID is required"
                });
            }

            // Use caching for advisory lookups (5 minute server TTL, 1 minute browser TTL)
            // Advisory data is static (syncs every 24 hours), so 5-minute cache is conservative
            // Note: 404s (null responses) are also cached to reduce database load
            const cacheKey = `palo-advisory:${cveId}`;
            await cacheService.withCaching(res, "stats", cacheKey, 300, async () => {
                const advisoryData = await this.paloAdvisoryService.getPaloAdvisory(cveId);

                // Return null for 404s (frontend handles this gracefully)
                // Both null and valid data are cached for 5 minutes
                return advisoryData || null;
            }, 60);

        } catch (error) {
            console.error(`❌ Failed to get Palo Alto advisory for CVE ${req.params.cveId}:`, error);
            res.status(500).json({
                error: "Failed to get Palo Alto advisory data",
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
            const needed = await this.paloAdvisoryService.isAutoSyncNeeded(hoursThreshold);

            res.json({
                autoSyncNeeded: needed,
                hoursThreshold: hoursThreshold
            });

        } catch (error) {
            console.error("❌ Failed to check Palo Alto auto-sync status:", error);
            res.status(500).json({
                error: "Failed to check auto-sync status",
                message: error.message
            });
        }
    }
}

module.exports = PaloAltoController;
