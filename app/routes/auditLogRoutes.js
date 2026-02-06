/**
 * Audit Log Routes (HEX-254 Session 13)
 * Admin-only routes for viewing and exporting encrypted audit logs
 *
 * All routes require authentication (requireAuth) and admin role (requireAdmin)
 */

const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");
const AuditLogController = require("../controllers/auditLogController");

/**
 * GET /api/audit-logs/stats
 * Get audit log statistics (total logs, date range, categories)
 * Admin-only
 */
router.get("/stats", requireAuth, requireAdmin, AuditLogController.getAuditLogStats);

/**
 * GET /api/audit-logs
 * Get filtered, paginated audit logs with decrypted messages
 * Admin-only
 * Query params: startDate, endDate, category, severity, scope, page, limit
 */
router.get("/", requireAuth, requireAdmin, AuditLogController.getAuditLogs);

/**
 * GET /api/audit-logs/export
 * Export filtered audit logs as JSON or CSV
 * Admin-only
 * Query params: same as GET / plus format (json|csv)
 */
router.get("/export", requireAuth, requireAdmin, AuditLogController.exportAuditLogs);

/**
 * POST /api/audit-logs
 * Create audit log entry (frontend logging endpoint)
 * Authenticated users only (not admin-only)
 * Body: {category, message, data}
 */
router.post("/", requireAuth, AuditLogController.createAuditLog);

module.exports = router;
