/**
 * Vulnerability Routes
 * Extracted from server.js lines: 1996-2016, 2019-2092, 2095-2156, 2159-2218, 2221-2283, 2337-2399, 2403-2514, 2517-2531, 3304-3317, 3501-3565
 *
 * This is the largest and most complex module in HexTrackr, handling:
 * - Core vulnerability CRUD operations
 * - Statistics and analytics endpoints
 * - Import/export functionality (CSV imports, backup exports)
 * - Trend analysis and historical data
 * - Staging-based imports for performance
 * - Multi-vendor vulnerability data processing
 *
 * Routes:
 * - GET /api/vulnerabilities/stats - Statistics with VPR totals (lines 1996-2016)
 * - GET /api/vulnerabilities/recent-trends - Recent trends for dashboard cards (lines 2019-2092)
 * - GET /api/vulnerabilities/trends - Historical trending data (lines 2095-2156)
 * - GET /api/vulnerabilities - List vulnerabilities with pagination/filters (lines 2159-2218)
 * - GET /api/vulnerabilities/resolved - List resolved vulnerabilities (lines 2221-2283)
 * - POST /api/vulnerabilities/import - Standard CSV import (lines 2337-2399)
 * - POST /api/vulnerabilities/import-staging - High-performance staging import (lines 2403-2514)
 * - DELETE /api/vulnerabilities/clear - Clear all vulnerability data (lines 2517-2531)
 * - GET /api/backup/vulnerabilities - Export vulnerability data (lines 3304-3317) - NOTE: Conflicts with backup routes
 * - POST /api/import/vulnerabilities - Web-based import (lines 3501-3565) - NOTE: Part of import system
 */

const express = require("express");
const multer = require("multer");
const VulnerabilityController = require("../controllers/vulnerabilityController");

const router = express.Router();

// Configure multer for file uploads (used by import endpoints)
// Pattern from server.js lines 18-24
const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
        fieldSize: 50 * 1024 * 1024 // 50MB for JSON payloads
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/csv" || file.mimetype === "application/vnd.ms-excel") {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed"));
        }
    }
});

// Statistics and Analytics Endpoints
router.get("/stats", VulnerabilityController.getStats);
router.get("/recent-trends", VulnerabilityController.getRecentTrends);
router.get("/trends", VulnerabilityController.getTrends);

// Core CRUD Operations
router.get("/", VulnerabilityController.getVulnerabilities); // Main listing with pagination/filters
router.get("/resolved", VulnerabilityController.getResolvedVulnerabilities);

// Import Operations
router.post("/import", upload.single("csvFile"), VulnerabilityController.importCSV);
router.post("/import-staging", upload.single("csvFile"), VulnerabilityController.importCsvStaging);

// Data Management
router.delete("/clear", VulnerabilityController.clearAllData);

/**
 * T053 INTEGRATION NOTES:
 *
 * 1. Route conflicts that need special handling:
 *    a) GET /api/backup/vulnerabilities (line 3304) - Already exists in backup routes
 *       The backup routes should handle this, not duplicated here
 *    b) POST /api/import/vulnerabilities (line 3501) - Part of import system
 *       This should be handled in a separate import router, not vulnerability router
 *
 * 2. Controller initialization required in server.js:
 *    const VulnerabilityController = require("./app/controllers/VulnerabilityController");
 *    VulnerabilityController.initialize(db, progressTracker);
 *
 * 3. Route registration in server.js:
 *    const vulnerabilityRoutes = require("./app/routes/vulnerabilities");
 *    app.use("/api/vulnerabilities", vulnerabilityRoutes);
 *
 * 4. Lines to remove from server.js during T053:
 *    - Lines 1996-2016 (GET /api/vulnerabilities/stats)
 *    - Lines 2019-2092 (GET /api/vulnerabilities/recent-trends)
 *    - Lines 2095-2156 (GET /api/vulnerabilities/trends)
 *    - Lines 2159-2218 (GET /api/vulnerabilities)
 *    - Lines 2221-2283 (GET /api/vulnerabilities/resolved)
 *    - Lines 2337-2399 (POST /api/vulnerabilities/import)
 *    - Lines 2403-2514 (POST /api/vulnerabilities/import-staging)
 *    - Lines 2517-2531 (DELETE /api/vulnerabilities/clear)
 *
 * 5. Lines to keep in server.js (handled by other systems):
 *    - Lines 3304-3317 (GET /api/backup/vulnerabilities) - Part of backup system
 *    - Lines 3501-3565 (POST /api/import/vulnerabilities) - Part of import system
 *    - All utility functions (mapVulnerabilityRow, extractScanDateFromFilename, etc.)
 *
 * 6. Dependencies that need special access:
 *    - progressTracker: Used for staging import progress tracking
 *    - PathValidator: Used for secure file operations
 *    - Papa (PapaParse): Used for CSV parsing
 *    - multer: Configured above for file uploads
 *
 * 7. Business logic complexity:
 *    - This module handles the most complex business logic in HexTrackr
 *    - Two-service pattern: vulnerabilityService + vulnerabilityStatsService
 *    - Advanced lifecycle management (active, resolved, reopened states)
 *    - Multi-vendor data normalization
 *    - VPR and CVSS score processing
 *    - Deduplication using enhanced unique keys
 *    - Staging table processing for large imports
 *    - Daily totals rollup calculations
 */

module.exports = router;