/**
 * @fileoverview Palo Alto Security Advisory Routes
 * @module routes/palo-alto
 * @description Express routes for Palo Alto Security Advisory operations
 * @since v1.0.63
 */

const express = require("express");
const PaloAltoController = require("../controllers/paloAltoController");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/auth");

/**
 * Create Palo Alto router
 * @param {Object} db - Database instance
 * @param {Object} preferencesService - PreferencesService instance
 * @returns {Object} Express router
 */
function createPaloRouter(db, preferencesService) {
    const router = express.Router();
    const paloController = new PaloAltoController(db, preferencesService);

    // Rate limiting for sync operations
    const syncLimiter = rateLimit({
        windowMs: 10 * 60 * 1000, // 10 minutes
        max: 10, // Max 10 sync requests per 10 minutes per IP (increased for testing)
        message: {
            error: "Too many sync requests",
            message: "Please wait before requesting another Palo Alto advisory sync"
        },
        standardHeaders: true,
        legacyHeaders: false,
        // Trust proxy configuration for nginx reverse proxy
        // Uses leftmost IP from X-Forwarded-For header (our nginx config)
        validate: { trustProxy: false } // Disable trust proxy validation (we know our setup is secure)
    });

    // API Routes

    /**
     * POST /api/palo/sync
     * @description Trigger manual Palo Alto Security Advisory sync
     * @returns {Object} Sync result with statistics
     */
    router.post("/sync", requireAuth, syncLimiter, async (req, res) => {
        await paloController.syncPaloAdvisories(req, res);
    });

    /**
     * GET /api/palo/status
     * @description Get current Palo Alto advisory sync status and statistics
     * @returns {Object} Status information
     */
    router.get("/status", requireAuth, async (req, res) => {
        await paloController.getPaloStatus(req, res);
    });

    /**
     * GET /api/palo/check-autosync
     * @description Check if auto-sync is needed
     * @query {number} hours - Hours threshold (default: 24)
     * @returns {Object} Auto-sync status
     */
    router.get("/check-autosync", requireAuth, async (req, res) => {
        await paloController.checkAutoSync(req, res);
    });

    /**
     * GET /api/palo/advisory/:cveId
     * @description Get Palo Alto advisory data for specific CVE
     * @param {string} cveId - CVE identifier
     * @returns {Object} Palo Alto advisory metadata
     */
    router.get("/advisory/:cveId", requireAuth, async (req, res) => {
        await paloController.getPaloAdvisoryByCve(req, res);
    });

    return router;
}

module.exports = createPaloRouter;
