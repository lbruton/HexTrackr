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
            console.error("Error creating audit log:", error);
            res.status(500).json({
                success: false,
                error: "Failed to create audit log",
                details: error.message
            });
        }
    }
}

module.exports = AuditLogController;
