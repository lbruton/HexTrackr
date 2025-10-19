/**
 * Audit Log Routes
 * Routes for encrypted audit log operations
 *
 * Part of HEX-254: Unified Logging System
 * Session 3: Frontend audit log integration
 *
 * Integration Steps:
 * 1. Import in server.js: const auditLogRoutes = require('./app/routes/auditLogs');
 * 2. Initialize controller in server.js (after LoggingService): AuditLogController.initialize();
 * 3. Mount routes: app.use('/api/audit-logs', auditLogRoutes);
 */

const express = require("express");
const router = express.Router();
const AuditLogController = require("../controllers/auditLogController");

/**
 * POST /api/audit-logs
 * Create encrypted audit log entry
 * Body: { category, message, data }
 */
router.post("/", AuditLogController.createAuditLog);

module.exports = router;
