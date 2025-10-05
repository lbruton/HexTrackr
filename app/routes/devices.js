/**
 * Device Routes
 * HEX-101 Blocking Issue #2: Server-side device aggregation
 *
 * This module provides device-centric endpoints that aggregate vulnerability data
 * by hostname, eliminating the need for client-side processing of 30k records.
 *
 * Routes:
 * - GET /api/devices/stats - Get aggregated device statistics with vulnerability counts
 *
 * @module routes/devices
 * @since v1.0.42
 */

const express = require("express");
const VulnerabilityController = require("../controllers/vulnerabilityController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/devices/stats
 *
 * Returns aggregated device statistics including:
 * - Total vulnerabilities per device
 * - Total VPR score per device
 * - Severity counts (Critical, High, Medium, Low)
 * - KEV presence indicator
 *
 * Response format:
 * {
 *   success: true,
 *   devices: [
 *     {
 *       hostname: "server01",
 *       totalVulnerabilities: 245,
 *       totalVpr: 1234.5,
 *       severityCounts: { Critical: 12, High: 45, Medium: 88, Low: 100 },
 *       hasKev: true
 *     },
 *     ...
 *   ],
 *   count: 42
 * }
 *
 * Caching:
 * - Server cache: 5 minutes (300s)
 * - Browser cache: 60 seconds
 */
router.get("/stats", requireAuth, VulnerabilityController.getDeviceStatistics);

module.exports = router;
