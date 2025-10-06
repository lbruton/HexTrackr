/**
 * @fileoverview KEV Routes
 * @module routes/kev
 * @description Express routes for CISA Known Exploited Vulnerabilities operations
 * @since v1.0.21
 */

const express = require("express");
const KevController = require("../controllers/kevController");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/auth");

/**
 * Create KEV router
 * @param {Object} db - Database instance
 * @returns {Object} Express router
 */
function createKevRouter(db) {
    const router = express.Router();
    const kevController = new KevController(db);

    // Rate limiting for sync operations
    const syncLimiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 3, // Max 3 sync requests per 5 minutes per IP
        message: {
            error: "Too many sync requests",
            message: "Please wait before requesting another sync"
        },
        standardHeaders: true,
        legacyHeaders: false
    });

    // API Routes

    /**
     * POST /api/kev/sync
     * @description Trigger manual KEV data sync
     * @returns {Object} Sync result with statistics
     */
    router.post("/sync", requireAuth, syncLimiter, async (req, res) => {
        await kevController.syncKevData(req, res);
    });

    /**
     * GET /api/kev/status
     * @description Get current KEV sync status and statistics
     * @returns {Object} Status information
     */
    router.get("/status", requireAuth, async (req, res) => {
        await kevController.getKevStatus(req, res);
    });

    /**
     * GET /api/kev/check-autosync
     * @description Check if auto-sync is needed
     * @query {number} hours - Hours threshold (default: 24)
     * @returns {Object} Auto-sync status
     */
    router.get("/check-autosync", requireAuth, async (req, res) => {
        await kevController.checkAutoSync(req, res);
    });

    /**
     * GET /api/kev/stats
     * @description Get KEV dashboard statistics
     * @returns {Object} Dashboard statistics
     */
    router.get("/stats", requireAuth, async (req, res) => {
        await kevController.getKevStats(req, res);
    });

    /**
     * GET /api/kev/all
     * @description Get all KEV vulnerabilities
     * @returns {Object} All KEV entries
     */
    router.get("/all", requireAuth, async (req, res) => {
        await kevController.getAllKevs(req, res);
    });

    /**
     * GET /api/kev/matched
     * @description Get KEV vulnerabilities matched in environment
     * @query {number} limit - Maximum results (default: 100)
     * @returns {Object} Matched vulnerabilities
     */
    router.get("/matched", requireAuth, async (req, res) => {
        await kevController.getMatchedKevs(req, res);
    });

    /**
     * GET /api/kev/:cveId
     * @description Get KEV metadata for specific CVE
     * @param {string} cveId - CVE identifier
     * @returns {Object} KEV metadata
     */
    router.get("/:cveId", requireAuth, async (req, res) => {
        await kevController.getKevByCve(req, res);
    });

    return router;
}

module.exports = createKevRouter;