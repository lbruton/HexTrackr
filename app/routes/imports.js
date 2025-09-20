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
        // Accept CSV files with various MIME types
        const allowedMimes = ["text/csv", "application/csv", "text/plain", "application/vnd.ms-excel"];
        const allowedExtensions = [".csv"];

        const hasAllowedMime = allowedMimes.includes(file.mimetype);
        const hasAllowedExt = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));

        if (hasAllowedMime || hasAllowedExt) {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files allowed"));
        }
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
// GENERIC IMPORT ROUTE (for Settings Modal)
// ===============================

/**
 * POST /api/import
 * Generic import handler that routes based on 'type' parameter
 * Used by Settings Modal for CSV imports
 */
router.post("/import", upload.single("file"), async (req, res) => {
    const { type } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        // Route to appropriate handler based on type
        if (type === "tickets") {
            // For tickets, we need to use the CSV parser from tickets.js
            // Read the CSV file and parse it
            const fs = require("fs");
            const csvContent = fs.readFileSync(file.path, "utf-8");

            // Import the ticket service to handle the import
            const TicketService = require("../services/ticketService");
            const ticketService = new TicketService();
            ticketService.initialize(global.db);

            // Parse CSV and import tickets
            const Papa = require("papaparse");
            const parseResult = Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true
            });

            if (parseResult.errors.length > 0) {
                throw new Error(`CSV parsing errors: ${parseResult.errors.map(e => e.message).join(", ")}`);
            }

            // Import tickets using CSV import method
            const result = await ticketService.importTicketsFromCSV(parseResult.data, "replace");

            // Clean up uploaded file
            fs.unlinkSync(file.path);

            return res.json({
                success: true,
                message: `Successfully imported ${result.imported} tickets`,
                imported: result.imported
            });
        } else if (type === "vulnerabilities") {
            // Forward to existing vulnerability import handler
            req.body.csvFile = file;
            return ImportController.importVulnerabilities(req, res);
        } else {
            throw new Error(`Unsupported import type: ${type}`);
        }
    } catch (error) {
        // Clean up uploaded file on error
        if (file && file.path) {
            const fs = require("fs");
            try {
                fs.unlinkSync(file.path);
            } catch (e) {
                console.error("Error deleting uploaded file:", e);
            }
        }

        return res.status(500).json({
            error: error.message || "Import failed",
            message: error.message || "Import failed"
        });
    }
});

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
router.get("/imports", ImportController.getImportHistory);

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
