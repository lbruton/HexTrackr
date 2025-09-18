/**
 * Backup Controller
 * Extracted from server.js lines: 2701, 3274-3798
 *
 * Handles HTTP requests for backup and restore operations.
 * Delegates business logic to backupService.
 */

const BackupService = require("../services/backupService");

/**
 * BackupController - Singleton controller for backup and restore operations
 *
 * Handles HTTP requests for data backup, export, and restore functionality.
 * Uses singleton pattern for consistent state management across the application.
 * Delegates all business logic to BackupService.
 *
 * @class BackupController
 * @since 1.0.0
 */
class BackupController {
    /**
     * Private constructor for singleton pattern
     * @private
     */
    constructor() {
        this.backupService = new BackupService();
    }

    /**
     * Initialize controller with database connection (singleton pattern)
     * Called from server.js during application startup
     *
     * @static
     * @param {Object} database - SQLite database connection instance
     * @returns {BackupController} The singleton controller instance
     * @throws {Error} If database connection is invalid
     * @example
     * // In server.js during startup
     * const backupController = BackupController.initialize(db);
     */
    static initialize(database) {
        if (!BackupController.instance) {
            BackupController.instance = new BackupController();
        }
        BackupController.instance.backupService.initialize(database);
        return BackupController.instance;
    }

    /**
     * Get singleton instance for use in route handlers
     *
     * @static
     * @returns {BackupController} The initialized controller instance
     * @throws {Error} If controller hasn't been initialized via initialize() first
     * @example
     * // In route handler
     * const controller = BackupController.getInstance();
     * const stats = await controller.backupService.getBackupStats();
     */
    static getInstance() {
        if (!BackupController.instance) {
            throw new Error("BackupController not initialized. Call initialize() first.");
        }
        return BackupController.instance;
    }
    /**
     * Get backup statistics including table counts and data sizes
     * Route: GET /api/backup/stats
     * Extracted from server.js line 3274
     *
     * @static
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Resolves when response is sent
     * @throws {Error} If database query fails or controller not initialized
     *
     * @example
     * // Response format:
     * {
     *   vulnerabilities: { count: 1500, size: "2.3MB" },
     *   tickets: { count: 85, size: "156KB" },
     *   totalSize: "2.5MB"
     * }
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
     * Export vulnerabilities data as downloadable JSON
     * Route: GET /api/backup/export/vulnerabilities
     * Extracted from server.js line 3304
     *
     * @static
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Resolves when export data is sent
     * @throws {Error} If database export fails or controller not initialized
     *
     * @example
     * // Response format:
     * {
     *   success: true,
     *   data: [...], // vulnerability objects array
     *   count: 1500,
     *   exportedAt: "2024-01-15T10:30:00.000Z",
     *   type: "vulnerabilities"
     * }
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
     * Export tickets data as downloadable JSON
     * Route: GET /api/backup/export/tickets
     * Extracted from server.js line 3606
     *
     * @static
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Resolves when export data is sent
     * @throws {Error} If database export fails or controller not initialized
     *
     * @example
     * // Response format:
     * {
     *   success: true,
     *   data: [...], // ticket objects array
     *   count: 85,
     *   exportedAt: "2024-01-15T10:30:00.000Z",
     *   type: "tickets"
     * }
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
     * Export complete backup containing both vulnerabilities and tickets
     * Route: GET /api/backup/export/all
     * Extracted from server.js line 3623
     *
     * @static
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Resolves when complete backup data is sent
     * @throws {Error} If database export fails or controller not initialized
     *
     * @example
     * // Response format:
     * {
     *   success: true,
     *   vulnerabilities: { data: [...], count: 1500 },
     *   tickets: { data: [...], count: 85 },
     *   exportedAt: "2024-01-15T10:30:00.000Z",
     *   type: "complete_backup"
     * }
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
     * Clear data by type (all, vulnerabilities, or tickets)
     * Route: DELETE /api/backup/clear/:type
     * Extracted from server.js line 2701
     *
     * @static
     * @param {Object} req - Express request object
     * @param {string} req.params.type - Data type to clear: "all", "vulnerabilities", or "tickets"
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Resolves when data is cleared and response sent
     * @throws {Error} If invalid type parameter or database operation fails
     *
     * @example
     * // Clear all vulnerabilities: DELETE /api/backup/clear/vulnerabilities
     * // Response format:
     * {
     *   success: true,
     *   message: "Cleared 1500 vulnerability records",
     *   clearedCount: 1500
     * }
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
     * Restore data from uploaded backup file
     * Route: POST /api/backup/restore
     * Extracted from server.js line 3654
     *
     * @static
     * @param {Object} req - Express request object
     * @param {Object} req.file - Multer uploaded file object
     * @param {string} req.body.type - Data type to restore: "tickets", "vulnerabilities", or "all"
     * @param {string} req.body.clearExisting - "true" to clear existing data before restore
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Resolves when restore is complete and response sent
     * @throws {Error} If no file uploaded, invalid type, or restore operation fails
     *
     * @example
     * // POST /api/backup/restore with multipart form data:
     * // file: backup.json, type: "vulnerabilities", clearExisting: "true"
     * // Response format:
     * {
     *   success: true,
     *   message: "Restored 1500 vulnerability records",
     *   count: 1500,
     *   details: { cleared: 1200, inserted: 1500 }
     * }
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