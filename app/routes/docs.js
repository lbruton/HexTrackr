const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");

const DocsController = require("../controllers/docsController");

// Documentation statistics endpoint (used by docs portal homepage)
// Computes API endpoints, JS function count, and framework statistics
// Original: server.js lines 2624-2680
router.get("/stats", requireAuth, async (req, res) => {
    try {
        // Will be delegated to DocsController.getStats in T029
        const stats = await DocsController.getStats();
        res.json(stats);
    } catch (error) {
        console.error("Failed to compute docs stats:", error);
        res.status(500).json({ error: "Failed to compute docs stats" });
    }
});

// Error handling middleware for docs API routes
router.use((error, req, res, _next) => {
    console.error("Documentation API route error:", error);
    res.status(500).json({
        success: false,
        error: "Documentation service error",
        details: error.message
    });
});

module.exports = router;

/*
 * DOCUMENTATION ROUTE EXTRACTION NOTES:
 *
 * The following routes were identified in server.js and will be handled differently:
 *
 * 1. Documentation portal routes (lines 2555-2618):
 *    - GET /docs-html (serves index.html)
 *    - GET /docs-html/[section].html (redirects to hash routing)
 *    These will remain as direct app routes since they handle static file serving
 *    and complex regex pattern matching that's better suited for app-level routing.
 *
 * 2. Static file middleware (lines 2683-2687):
 *    - app.use("/docs-html", express.static(...))
 *    This middleware serves static files and should remain in server.js
 *
 * 3. API routes extracted to this module:
 *    - GET /api/docs/stats (lines 2624-2680) → router.get("/stats", ...)
 *
 * Helper function findDocsSectionForFilename (lines 2560-2582):
 *    - This will be moved to docsController in T029
 *
 * The main app will mount this router as:
 *    app.use("/api/docs", docsRoutes);
 */