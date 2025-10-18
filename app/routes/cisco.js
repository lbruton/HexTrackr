/**
 * @fileoverview Cisco PSIRT Advisory Routes
 * @module routes/cisco
 * @description Express routes for Cisco PSIRT advisory operations
 * @since v1.0.63
 */

const express = require("express");
const CiscoController = require("../controllers/ciscoController");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/auth");

/**
 * Create Cisco router
 * @param {Object} db - Database instance
 * @param {Object} preferencesService - PreferencesService instance
 * @returns {Object} Express router
 */
function createCiscoRouter(db, preferencesService) {
    const router = express.Router();
    const ciscoController = new CiscoController(db, preferencesService);

    // Rate limiting for sync operations
    const syncLimiter = rateLimit({
        windowMs: 10 * 60 * 1000, // 10 minutes
        max: 10, // Max 10 sync requests per 10 minutes per IP (increased for testing)
        message: {
            error: "Too many sync requests",
            message: "Please wait before requesting another Cisco advisory sync"
        },
        standardHeaders: true,
        legacyHeaders: false,
        // Trust proxy configuration for nginx reverse proxy
        // Uses leftmost IP from X-Forwarded-For header (our nginx config)
        validate: { trustProxy: false } // Disable trust proxy validation (we know our setup is secure)
    });

    // API Routes

    /**
     * POST /api/cisco/sync
     * @description Trigger manual Cisco PSIRT advisory sync
     * @returns {Object} Sync result with statistics
     */
    router.post("/sync", requireAuth, syncLimiter, async (req, res) => {
        await ciscoController.syncCiscoAdvisories(req, res);
    });

    /**
     * GET /api/cisco/status
     * @description Get current Cisco advisory sync status and statistics
     * @returns {Object} Status information
     */
    router.get("/status", requireAuth, async (req, res) => {
        await ciscoController.getCiscoStatus(req, res);
    });

    /**
     * GET /api/cisco/check-autosync
     * @description Check if auto-sync is needed
     * @query {number} hours - Hours threshold (default: 24)
     * @returns {Object} Auto-sync status
     */
    router.get("/check-autosync", requireAuth, async (req, res) => {
        await ciscoController.checkAutoSync(req, res);
    });

    /**
     * GET /api/cisco/advisory/:cveId
     * @description Get Cisco advisory data for specific CVE
     * @param {string} cveId - CVE identifier
     * @returns {Object} Cisco advisory metadata
     */
    router.get("/advisory/:cveId", requireAuth, async (req, res) => {
        await ciscoController.getCiscoAdvisoryByCve(req, res);
    });

    /**
     * GET /api/cisco/fixed-versions/:cveId
     * @description Get fixed versions for specific CVE (HEX-287)
     * @param {string} cveId - CVE identifier
     * @query {string} os_family - Optional OS family filter (ios, iosxe, iosxr, nxos)
     * @returns {Array} Array of fixed version objects
     */
    router.get("/fixed-versions/:cveId", requireAuth, async (req, res) => {
        await ciscoController.getFixedVersions(req, res);
    });

    return router;
}

module.exports = createCiscoRouter;
