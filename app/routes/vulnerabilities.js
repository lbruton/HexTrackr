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
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Configure multer for file uploads (used by import endpoints)
// Pattern from server.js lines 18-24
const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
        fieldSize: 50 * 1024 * 1024, // 50MB for JSON payloads
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/csv" || file.mimetype === "application/vnd.ms-excel") {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed"));
        }
    },
});

// Statistics and Analytics Endpoints
router.get("/stats", requireAuth, VulnerabilityController.getStats);
router.get("/recent-trends", requireAuth, VulnerabilityController.getRecentTrends);
router.get("/trends", requireAuth, VulnerabilityController.getTrends);
router.get("/last-import", requireAuth, VulnerabilityController.getLastImport); // HEX-240: Last CSV import date

// HEX-112 Phase 2: New endpoints for pagination migration
router.get("/count", requireAuth, VulnerabilityController.getCount); // Filtered counts
router.get("/kev-stats", requireAuth, VulnerabilityController.getKevStats); // KEV statistics
router.get("/vendor-stats", requireAuth, VulnerabilityController.getVendorStats); // Vendor distribution
router.get("/top-devices", requireAuth, VulnerabilityController.getTopDevices);
router.get("/cvss-distribution", requireAuth, VulnerabilityController.getCvssDistribution);
router.get("/severity-distribution", requireAuth, VulnerabilityController.getSeverityDistribution);
router.get("/recent", requireAuth, VulnerabilityController.getRecentVulnerabilities);
router.get("/export", requireAuth, VulnerabilityController.exportVulnerabilities); // Streaming export

// Core CRUD Operations
router.get("/", requireAuth, VulnerabilityController.getVulnerabilities); // Main listing with pagination/filters
router.get("/resolved", requireAuth, VulnerabilityController.getResolvedVulnerabilities);
router.get("/:id", requireAuth, VulnerabilityController.getVulnerabilityById); // Individual vulnerability fetch

// Import Operations - REMOVED: These are now handled in imports.js
router.post("/import", requireAuth, upload.single("csvFile"), VulnerabilityController.importCSV);
router.post("/import-staging", requireAuth, upload.single("csvFile"), VulnerabilityController.importCsvStaging);

// Data Management
router.delete("/clear", requireAuth, VulnerabilityController.clearAllData);
router.post("/bulk-delete", requireAuth, VulnerabilityController.bulkDelete); // HEX-112: Phase 2 bulk operations

module.exports = router;
