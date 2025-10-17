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
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Configure multer for file uploads (used by restore endpoint)
const upload = multer({
    dest: "/tmp/",
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/json",
            "application/zip",
            "application/x-zip-compressed",
            "application/octet-stream",
            "multipart/x-zip",
            "text/plain"
        ];
        const isAllowedExtension = file.originalname.endsWith(".json") ||
                                   file.originalname.endsWith(".zip");

        if (allowedTypes.includes(file.mimetype) || isAllowedExtension) {
            cb(null, true);
        } else {
            cb(new Error("Only JSON and ZIP files are allowed for backup restore"));
        }
    }
});

// Backup statistics endpoint
router.get("/stats", requireAuth, BackupController.getBackupStats);

// Export endpoints (JSON)
router.get("/vulnerabilities", requireAuth, BackupController.exportVulnerabilities);
router.get("/tickets", requireAuth, BackupController.exportTickets);
router.get("/all", requireAuth, BackupController.exportAll);

// Export endpoints (ZIP)
router.get("/export/vulnerabilities", requireAuth, BackupController.exportVulnerabilitiesAsZip);
router.get("/export/tickets", requireAuth, BackupController.exportTicketsAsZip);
router.get("/export/all", requireAuth, BackupController.exportAllAsZip);

// Data management endpoints
router.delete("/clear/:type", requireAuth, BackupController.clearData);

// Restore endpoint
router.post("/restore", requireAuth, upload.single("file"), BackupController.restoreBackup);

// HEX-270: Backup history and manual backup endpoints
router.get("/history", requireAuth, BackupController.getBackupHistory);
router.get("/download/:filename", requireAuth, BackupController.downloadBackupFile);
router.post("/save-to-disk", requireAuth, BackupController.saveBackupToDisk);
router.post("/trigger-manual", requireAuth, BackupController.triggerManualBackup);

module.exports = router;