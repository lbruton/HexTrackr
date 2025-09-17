/**
 * Import Routes - Vendor CSV Import Operations
 *
 * This module handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
 * not backup/restore operations. Those are handled by the backup module.
 *
 * Routes extracted from server.js lines: 2337-2399, 2403-2531, 3482-3604, 2534-2550
 *
 * INTEGRATION INSTRUCTIONS FOR T053:
 * ==================================
 * 1. In server.js, add: const importRoutes = require("./routes/imports");
 * 2. In server.js, add: importController.setProgressTracker(progressTracker);
 * 3. In server.js, add: app.use("/api", importRoutes);
 * 4. Remove the corresponding routes from server.js (lines documented above)
 * 5. Ensure multer upload configuration matches server.js exactly
 *
 * ROUTE MAPPING:
 * - /api/vulnerabilities/import -> router.post("/vulnerabilities/import")
 * - /api/vulnerabilities/import-staging -> router.post("/vulnerabilities/import-staging")
 * - /api/import/vulnerabilities -> router.post("/import/vulnerabilities")
 * - /api/import/tickets -> router.post("/import/tickets")
 * - /api/imports -> router.get("/imports")
 * - /api/import/progress/:sessionId -> router.get("/import/progress/:sessionId")
 */

const express = require("express");
const multer = require("multer");
const ImportController = require("../controllers/importController");

const router = express.Router();

// Configure multer for file uploads (from server.js configuration)
const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "text/csv") {
            return cb(new Error("Only CSV files allowed"));
        }
        cb(null, true);
    }
});

// ===============================
// VULNERABILITY IMPORT ROUTES
// ===============================

/**
 * POST /api/vulnerabilities/import
 * Standard vulnerability CSV import with enhanced lifecycle management
 * From server.js lines 2337-2399
 */
router.post("/vulnerabilities/import", upload.single("csvFile"), ImportController.importVulnerabilities);

/**
 * POST /api/vulnerabilities/import-staging
 * High-performance vulnerability import using staging table for batch processing
 * From server.js lines 2403-2531
 */
router.post("/vulnerabilities/import-staging", upload.single("csvFile"), ImportController.importVulnerabilitiesStaging);

/**
 * POST /api/import/vulnerabilities
 * JSON-based vulnerability import for frontend data upload
 * From server.js lines 3501-3604
 */
router.post("/import/vulnerabilities", ImportController.importVulnerabilitiesJSON);

// ===============================
// TICKET IMPORT ROUTES
// ===============================

/**
 * POST /api/import/tickets
 * JSON-based ticket import for frontend data upload
 * From server.js lines 3482-3499
 */
router.post("/import/tickets", ImportController.importTicketsJSON);

// ===============================
// IMPORT HISTORY & PROGRESS
// ===============================

/**
 * GET /api/imports
 * Get import history with vulnerability counts
 * From server.js lines 2534-2550
 */
router.get("/", ImportController.getImportHistory);

/**
 * GET /api/import/progress/:sessionId
 * Check import progress for a specific session
 * Progress tracking via WebSocket (ProgressTracker class)
 */
router.get("/import/progress/:sessionId", ImportController.checkImportProgress);

// ===============================
// SERVER.JS INTEGRATION SUMMARY
// ===============================
/**
 * EXACT LINES TO REMOVE FROM SERVER.JS IN T053:
 * ==============================================
 *
 * 1. Remove lines 2337-2399: app.post("/api/vulnerabilities/import", ...)
 * 2. Remove lines 2403-2531: app.post("/api/vulnerabilities/import-staging", ...)
 * 3. Remove lines 2534-2550: app.get("/api/imports", ...)
 * 4. Remove lines 3482-3499: app.post("/api/import/tickets", ...)
 * 5. Remove lines 3501-3604: app.post("/api/import/vulnerabilities", ...)
 *
 * FUNCTIONS TO REMOVE FROM SERVER.JS:
 * ===================================
 * - extractScanDateFromFilename() (lines 2291-2335)
 * - mapVulnerabilityRow() (lines 252-341) - ALREADY IN HELPERS.JS
 * - processVulnerabilityRowsWithEnhancedLifecycle() (lines 1306+)
 * - bulkLoadToStagingTable() (lines 767+)
 * - processStagingToFinalTables() (lines 927+)
 * - processTicketRows() (lines 1825+)
 *
 * VARIABLES TO KEEP IN SERVER.JS:
 * ===============================
 * - multer upload configuration (needed for other routes)
 * - progressTracker instance (needed for WebSocket)
 * - All database initialization code
 */

module.exports = router;