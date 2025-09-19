/**
 * Backup Controller
 * Extracted from server.js lines: 2701, 3274-3798
 *
 * Handles HTTP requests for backup and restore operations.
 * Delegates business logic to backupService.
 */

const BackupService = require("../services/backupService");

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
}

module.exports = BackupController;