/**
 * Backup and Restore Routes
 * Extracted from server.js lines: 2701, 3274-3798
 *
 * Routes:
 * - DELETE /api/backup/clear/:type - Clear data (line 2701)
 * - GET /api/backup/stats - Get backup statistics (line 3274)
 * - GET /api/backup/vulnerabilities - Export vulnerabilities (line 3304)
 * - GET /api/backup/tickets - Export tickets (line 3606)
 * - GET /api/backup/all - Export complete backup (line 3623)
 * - POST /api/restore - Restore from backup file (line 3654)
 */

const express = require("express");
const multer = require("multer");
const BackupController = require("../controllers/backupController");

const router = express.Router();

// Configure multer for file uploads (used by restore endpoint)
const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["application/json", "application/zip", "text/plain"];
        if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith(".json")) {
            cb(null, true);
        } else {
            cb(new Error("Only JSON and ZIP files are allowed for backup restore"));
        }
    }
});

// Backup statistics endpoint
router.get("/stats", BackupController.getBackupStats);

// Export endpoints (JSON)
router.get("/vulnerabilities", BackupController.exportVulnerabilities);
router.get("/tickets", BackupController.exportTickets);
router.get("/all", BackupController.exportAll);

// Export endpoints (ZIP)
router.get("/export/vulnerabilities", BackupController.exportVulnerabilitiesAsZip);
router.get("/export/tickets", BackupController.exportTicketsAsZip);
router.get("/export/all", BackupController.exportAllAsZip);

// Data management endpoints
router.delete("/clear/:type", BackupController.clearData);

// Restore endpoint
router.post("/restore", upload.single("file"), BackupController.restoreBackup);


module.exports = router;