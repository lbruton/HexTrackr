/**
 * Audit Log Controller
 * Handles encrypted audit log operations for HexTrackr
 *
 * Part of HEX-254: Unified Logging System
 * Session 3: Frontend audit log integration
 *
 * Endpoints:
 * - POST /api/audit-logs - Write encrypted audit log (frontend and backend)
 */

const LoggingService = require("../services/loggingService");

class AuditLogController {
    constructor() {
        // LoggingService is already initialized globally
        this.loggingService = LoggingService.getInstance();
    }

    /**
     * Initialize controller (for consistency with other controllers)
     * LoggingService is already initialized in server.js
     */
    static initialize() {
        if (!AuditLogController.instance) {
            AuditLogController.instance = new AuditLogController();
        }
        return AuditLogController.instance;
    }

    /**
     * Get singleton instance
     * @returns {AuditLogController} Controller instance
     */
    static getInstance() {
        if (!AuditLogController.instance) {
            throw new Error("AuditLogController not initialized. Call initialize() first.");
        }
        return AuditLogController.instance;
    }

    /**
     * Create audit log entry - POST /api/audit-logs
     * Accepts audit logs from frontend and writes encrypted entry to database
     *
     * @param {Object} req - Express request
     * @param {Object} req.body - Request body
     * @param {string} req.body.category - Audit category (user.login, ticket.delete, etc.)
     * @param {string} req.body.message - Audit message
     * @param {Object} [req.body.data] - Additional data to encrypt
     * @param {Object} res - Express response
     */
    static async createAuditLog(req, res) {
        try {
            const { category, message, data } = req.body;

            // Input validation
            if (!category || !message) {
                return res.status(400).json({
                    success: false,
                    error: "Category and message are required"
                });
            }

            // Get user info from session (if authenticated)
            const userId = req.session?.userId || null;
            const username = req.session?.username || "anonymous";

            // Get request metadata
            const ipAddress = req.ip || req.connection?.remoteAddress || null;
            const userAgent = req.get("user-agent") || null;

            const controller = AuditLogController.getInstance();

            // Write audit log via LoggingService
            await controller.loggingService.audit(
                category,
                message,
                data,
                userId,
                { username, ipAddress, userAgent }
            );

            res.json({
                success: true,
                message: "Audit log created"
            });

        } catch (error) {
            if (global.logger?.error) {
                global.logger.error("backend", "audit", "Error creating audit log", { error: error.message });
            } else {
                console.error("Error creating audit log:", error);
            }
            res.status(500).json({
                success: false,
                error: "Failed to create audit log",
                details: error.message
            });
        }
    }

    /**
     * Get audit log statistics - GET /api/audit-logs/stats (HEX-254 Session 13)
     * Returns summary statistics for audit logs (admin-only)
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    static async getAuditLogStats(req, res) {
        try {
            const controller = AuditLogController.getInstance();
            const stats = await controller.loggingService.getAuditLogStatistics();

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            if (global.logger?.error) {
                global.logger.error("backend", "audit", "Get audit log stats error", { error: error.message });
            } else {
                console.error("Get audit log stats error:", error);
            }
            res.status(500).json({
                success: false,
                error: "Failed to retrieve audit log statistics",
                details: error.message
            });
        }
    }

    /**
     * Get audit logs with filtering - GET /api/audit-logs (HEX-254 Session 13)
     * Returns paginated, filtered audit logs with decrypted messages (admin-only)
     *
     * @param {Object} req - Express request
     * @param {Object} req.query - Query parameters
     * @param {string} [req.query.startDate] - Filter by start date (ISO8601)
     * @param {string} [req.query.endDate] - Filter by end date (ISO8601)
     * @param {string} [req.query.category] - Filter by category
     * @param {string} [req.query.severity] - Filter by severity (debug|info|warn|error)
     * @param {string} [req.query.scope] - Filter by scope (backend|frontend)
     * @param {number} [req.query.page=1] - Page number
     * @param {number} [req.query.limit=100] - Items per page
     * @param {Object} res - Express response
     */
    static async getAuditLogs(req, res) {
        try {
            const filters = {
                startDate: req.query.startDate || null,
                endDate: req.query.endDate || null,
                category: req.query.category || null,
                severity: req.query.severity || null,
                scope: req.query.scope || null,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 100
            };

            const controller = AuditLogController.getInstance();
            const result = await controller.loggingService.queryAuditLogs(filters);

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            if (global.logger?.error) {
                global.logger.error("backend", "audit", "Get audit logs error", { error: error.message });
            } else {
                console.error("Get audit logs error:", error);
            }
            res.status(500).json({
                success: false,
                error: "Failed to retrieve audit logs",
                details: error.message
            });
        }
    }

    /**
     * Export audit logs - GET /api/audit-logs/export (HEX-254 Session 13)
     * Exports filtered audit logs as JSON or CSV (admin-only)
     *
     * @param {Object} req - Express request
     * @param {Object} req.query - Query parameters (same as getAuditLogs plus format)
     * @param {string} [req.query.format=json] - Export format (json|csv)
     * @param {Object} res - Express response
     */
    static async exportAuditLogs(req, res) {
        try {
            const format = req.query.format || "json";

            const filters = {
                startDate: req.query.startDate || null,
                endDate: req.query.endDate || null,
                category: req.query.category || null,
                page: 1,
                limit: parseInt(req.query.limit) || 10000 // Large limit for export
            };

            const controller = AuditLogController.getInstance();
            const result = await controller.loggingService.queryAuditLogs(filters);

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T");
            const dateStr = timestamp[0];
            const timeStr = timestamp[1].substring(0, 6); // HHMMSS

            if (format === "csv") {
                // Generate CSV
                const csv = controller._generateCSV(result.logs);
                const filename = `hextrackr_audit_logs_${dateStr}_${timeStr}.csv`;

                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
                res.send(csv);

            } else {
                // Generate JSON
                const exportData = {
                    exportedAt: new Date().toISOString(),
                    filters: {
                        startDate: filters.startDate,
                        endDate: filters.endDate,
                        category: filters.category
                    },
                    totalRecords: result.logs.length,
                    logs: result.logs
                };

                const filename = `hextrackr_audit_logs_${dateStr}_${timeStr}.json`;

                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
                res.send(JSON.stringify(exportData, null, 2));
            }

        } catch (error) {
            if (global.logger?.error) {
                global.logger.error("backend", "audit", "Export audit logs error", { error: error.message });
            } else {
                console.error("Export audit logs error:", error);
            }
            res.status(500).json({
                success: false,
                error: "Failed to export audit logs",
                details: error.message
            });
        }
    }

    /**
     * Generate CSV from audit logs (helper method)
     * @private
     * @param {Array} logs - Array of audit log objects
     * @returns {string} CSV content
     */
    _generateCSV(logs) {
        const headers = ["ID", "Timestamp", "Category", "Message", "User ID", "Username", "IP Address", "User Agent", "Request ID"];
        const rows = [headers.join(",")];

        logs.forEach(log => {
            // Handle message - could be object or string
            let messageStr = "";
            if (typeof log.message === "object" && log.message !== null) {
                messageStr = log.message.message || JSON.stringify(log.message);
            } else {
                messageStr = log.message || "";
            }

            const row = [
                log.id || "",
                log.timestamp || "",
                log.category || "",
                `"${messageStr.replace(/"/g, '""')}"`, // Escape quotes
                log.user_id || "",
                log.username || "",
                log.ip_address || "",
                `"${(log.user_agent || "").replace(/"/g, '""')}"`, // Escape quotes
                log.request_id || ""
            ];
            rows.push(row.join(","));
        });

        return rows.join("\n");
    }
}

module.exports = AuditLogController;
