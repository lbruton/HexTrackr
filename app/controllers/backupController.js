/**
 * Backup Controller
 * Extracted from server.js lines: 2701, 3274-3798
 *
 * Handles HTTP requests for backup and restore operations.
 * Delegates business logic to backupService.
 */

const BackupService = require("../services/backupService");
const CacheService = require("../services/cacheService");

const cacheService = CacheService.getInstance();

class BackupController {
    constructor() {
        this.backupService = new BackupService();
    }

    /**
     * Initialize controller with database connection
     * Called from server.js during setup
     */
    static initialize(database) {
        if (!BackupController.instance) {
            BackupController.instance = new BackupController();
        }
        BackupController.instance.backupService.initialize(database);
        return BackupController.instance;
    }

    /**
     * Get singleton instance (for use in routes)
     */
    static getInstance() {
        if (!BackupController.instance) {
            throw new Error("BackupController not initialized. Call initialize() first.");
        }
        return BackupController.instance;
    }
    /**
     * Get backup statistics
     * Extracted from server.js line 3274
     */
    static async getBackupStats(req, res) {
        try {
            const controller = BackupController.getInstance();
            const stats = await controller.backupService.getBackupStats();
            res.json(stats);
        } catch (error) {
            console.error("Error getting backup stats:", error);
            res.status(500).json({
                success: false,
                error: "Failed to get backup statistics",
                details: error.message
            });
        }
    }

    /**
     * Export vulnerabilities data
     * Extracted from server.js line 3304
     */
    static async exportVulnerabilities(req, res) {
        try {
            const controller = BackupController.getInstance();
            const exportData = await controller.backupService.exportVulnerabilities();
            res.json(exportData);
        } catch (error) {
            console.error("Error exporting vulnerabilities:", error);
            res.status(500).json({
                success: false,
                error: "Export failed",
                details: error.message
            });
        }
    }

    /**
     * Export tickets data
     * Extracted from server.js line 3606
     */
    static async exportTickets(req, res) {
        try {
            const controller = BackupController.getInstance();
            const exportData = await controller.backupService.exportTickets();
            res.json(exportData);
        } catch (error) {
            console.error("Error exporting tickets:", error);
            res.status(500).json({
                success: false,
                error: "Failed to export tickets",
                details: error.message
            });
        }
    }

    /**
     * Export complete backup (vulnerabilities + tickets)
     * Extracted from server.js line 3623
     */
    static async exportAll(req, res) {
        try {
            const controller = BackupController.getInstance();
            const exportData = await controller.backupService.exportAll();
            res.json(exportData);
        } catch (error) {
            console.error("Error exporting complete backup:", error);
            res.status(500).json({
                success: false,
                error: "Export failed",
                details: error.message
            });
        }
    }

    /**
     * Clear data by type
     * Extracted from server.js line 2701
     */
    static async clearData(req, res) {
        try {
            const { type } = req.params;

            // Validate type parameter
            const validTypes = ["all", "vulnerabilities", "tickets"];
            if (!validTypes.includes(type)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid type parameter",
                    validTypes: validTypes
                });
            }

            const controller = BackupController.getInstance();
            const result = await controller.backupService.clearData(type);

            // Ensure API caches are invalidated after destructive actions
            cacheService.clearAll();

            res.json({
                success: true,
                message: result.message,
                clearedCount: result.clearedCount
            });
        } catch (error) {
            console.error("Error clearing data:", error);
            res.status(500).json({
                success: false,
                error: "Failed to clear data",
                details: error.message
            });
        }
    }

    /**
     * Restore data from backup file
     * Extracted from server.js line 3654
     */
    static async restoreBackup(req, res) {
        try {
            // Validate file upload
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: "No file uploaded"
                });
            }

            // Validate type parameter
            const type = req.body.type;
            const validTypes = ["tickets", "vulnerabilities", "all"];
            if (!validTypes.includes(type)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid data type",
                    validTypes: validTypes
                });
            }

            // Extract options
            const options = {
                type: type,
                clearExisting: req.body.clearExisting === "true",
                filePath: req.file.path
            };

            const controller = BackupController.getInstance();
            const result = await controller.backupService.restoreBackup(options);

            res.json({
                success: true,
                message: result.message,
                count: result.restoredCount,
                details: result.details
            });

        } catch (error) {
            console.error("Error restoring backup:", error);
            res.status(500).json({
                success: false,
                error: "Failed to restore data",
                details: error.message
            });
        }
    }


    /**
     * Export complete backup as ZIP file
     * NEW: Enhanced ZIP backup with all tables
     */
    static async exportAllAsZip(req, res) {
        try {
            const controller = BackupController.getInstance();
            const zipBuffer = await controller.backupService.exportAllAsZip();

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filename = `hextrackr_complete_backup_${timestamp}.zip`;

            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Length", zipBuffer.length);

            res.send(zipBuffer);

        } catch (error) {
            console.error("Error creating ZIP backup:", error);
            res.status(500).json({
                success: false,
                error: "ZIP backup failed",
                details: error.message
            });
        }
    }

    /**
     * Export vulnerabilities as ZIP file (HEX-270: Now saves to disk too)
     * NEW: Vulnerability-focused ZIP backup
     */
    static async exportVulnerabilitiesAsZip(req, res) {
        try {
            const controller = BackupController.getInstance();
            const zipBuffer = await controller.backupService.exportVulnerabilitiesAsZip();

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] + "_" + new Date().toISOString().replace(/[:.]/g, "-").split("T")[1].substring(0, 8);
            const filename = `hextrackr_vulnerabilities_backup_${timestamp}_manual.zip`;

            // Send response to user first (prevents timeout on large files)
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Length", zipBuffer.length);
            res.send(zipBuffer);

            // HEX-270: Save to disk AFTER sending response (non-blocking)
            // Use setImmediate to avoid blocking the event loop
            setImmediate(() => {
                try {
                    const path = require("path");
                    const fs = require("fs").promises; // Use async version
                    const backupDir = path.join(process.cwd(), "backups");

                    fs.mkdir(backupDir, { recursive: true })
                        .then(() => fs.writeFile(path.join(backupDir, filename), zipBuffer))
                        .then(() => {
                            console.log(`[BACKUP] Vulnerabilities backup saved to disk: ${filename} (${(zipBuffer.length / 1024 / 1024).toFixed(2)}MB)`);
                        })
                        .catch(err => {
                            console.error("[BACKUP] Failed to save vulnerabilities backup to disk:", err);
                        });
                } catch (error) {
                    console.error("[BACKUP] Error in background save:", error);
                }
            });

        } catch (error) {
            console.error("Error creating vulnerabilities ZIP:", error);
            res.status(500).json({
                success: false,
                error: "Vulnerabilities ZIP backup failed",
                details: error.message
            });
        }
    }

    /**
     * Export tickets as ZIP file (HEX-270: Now saves to disk too)
     * NEW: Ticket-focused ZIP backup
     */
    static async exportTicketsAsZip(req, res) {
        try {
            const controller = BackupController.getInstance();
            const zipBuffer = await controller.backupService.exportTicketsAsZip();

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] + "_" + new Date().toISOString().replace(/[:.]/g, "-").split("T")[1].substring(0, 8);
            const filename = `hextrackr_tickets_backup_${timestamp}_manual.zip`;

            // Send response to user first (prevents timeout on large files)
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Length", zipBuffer.length);
            res.send(zipBuffer);

            // HEX-270: Save to disk AFTER sending response (non-blocking)
            setImmediate(() => {
                try {
                    const path = require("path");
                    const fs = require("fs").promises; // Use async version
                    const backupDir = path.join(process.cwd(), "backups");

                    fs.mkdir(backupDir, { recursive: true })
                        .then(() => fs.writeFile(path.join(backupDir, filename), zipBuffer))
                        .then(() => {
                            console.log(`[BACKUP] Tickets backup saved to disk: ${filename} (${(zipBuffer.length / 1024 / 1024).toFixed(2)}MB)`);
                        })
                        .catch(err => {
                            console.error("[BACKUP] Failed to save tickets backup to disk:", err);
                        });
                } catch (error) {
                    console.error("[BACKUP] Error in background save:", error);
                }
            });

        } catch (error) {
            console.error("Error creating tickets ZIP:", error);
            res.status(500).json({
                success: false,
                error: "Tickets ZIP backup failed",
                details: error.message
            });
        }
    }

    /**
     * HEX-270: Get backup history
     * Lists all available backups from disk
     */
    static async getBackupHistory(req, res) {
        try {
            const controller = BackupController.getInstance();
            const result = await controller.backupService.getBackupHistory();

            res.json(result);

        } catch (error) {
            console.error("Error retrieving backup history:", error);
            res.status(500).json({
                success: false,
                error: "Failed to retrieve backup history",
                details: error.message
            });
        }
    }

    /**
     * HEX-270: Download backup file from disk
     * Retrieves a specific backup file by filename
     */
    static async downloadBackupFile(req, res) {
        try {
            const { filename } = req.params;

            if (!filename) {
                return res.status(400).json({
                    success: false,
                    error: "Filename parameter required"
                });
            }

            const controller = BackupController.getInstance();
            const fileBuffer = await controller.backupService.downloadBackupFile(filename);

            // Determine content type based on extension
            const contentType = filename.endsWith(".db") ? "application/x-sqlite3" : "application/zip";

            res.setHeader("Content-Type", contentType);
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Length", fileBuffer.length);

            res.send(fileBuffer);

        } catch (error) {
            console.error("Error downloading backup file:", error);
            res.status(500).json({
                success: false,
                error: "Failed to download backup file",
                details: error.message
            });
        }
    }

    /**
     * HEX-270: Save backup to disk (manual trigger)
     * Creates backup and saves to disk + returns for download
     */
    static async saveBackupToDisk(req, res) {
        try {
            const { type } = req.query; // "all", "vulnerabilities", or "tickets"
            const backupType = type || "all";

            const controller = BackupController.getInstance();
            const result = await controller.backupService.saveBackupToDisk(backupType);

            // Also return the file for immediate download
            const fileBuffer = await controller.backupService.downloadBackupFile(result.filename);

            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
            res.setHeader("Content-Length", fileBuffer.length);
            res.setHeader("X-Backup-Saved", "true"); // Indicate backup was saved to disk

            res.send(fileBuffer);

        } catch (error) {
            console.error("Error saving backup to disk:", error);
            res.status(500).json({
                success: false,
                error: "Failed to save backup to disk",
                details: error.message
            });
        }
    }

    /**
     * HEX-270: Trigger manual scheduled backup
     * Creates both JSON ZIP and database backups (full scheduled backup)
     */
    static async triggerManualBackup(req, res) {
        try {
            const controller = BackupController.getInstance();
            const result = await controller.backupService.createScheduledBackup();

            res.json({
                success: true,
                message: "Manual backup completed successfully",
                backups: result.backups,
                total_size_mb: result.total_size_mb
            });

        } catch (error) {
            console.error("Error triggering manual backup:", error);
            res.status(500).json({
                success: false,
                error: "Failed to trigger manual backup",
                details: error.message
            });
        }
    }
}

module.exports = BackupController;
