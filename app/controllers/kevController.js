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
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
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
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
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
     * Get matched KEV vulnerabilities in environment
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
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
     * Get KEV dashboard statistics
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
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
     * Check if auto-sync is needed
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
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