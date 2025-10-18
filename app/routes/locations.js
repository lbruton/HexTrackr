/**
 * Location Routes
 * HEX-292: Location Cards Implementation - Task 2 (Backend API)
 *
 * Provides REST API endpoints for location-based vulnerability aggregation
 * showing vulnerabilities grouped by physical site/location.
 *
 * Routes:
 * - GET /api/locations/stats - Get aggregated statistics by location
 *
 * Integration:
 * 1. Controller initialized in server.js: LocationController.initialize(db);
 * 2. Route registered in server.js: app.use("/api/locations", locationRoutes);
 */

const express = require("express");
const LocationController = require("../controllers/locationController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/locations/stats
 *
 * Returns aggregated vulnerability statistics grouped by location.
 * Each location includes:
 * - Device count and vendor breakdown
 * - Total VPR score and severity distribution
 * - KEV count (Known Exploited Vulnerabilities)
 * - Open ticket count
 * - Parsing confidence score
 *
 * Authentication: Required
 * Caching: 5-minute server TTL, 60-second browser TTL
 *
 * Response format:
 * {
 *   success: true,
 *   data: [
 *     {
 *       location: "wtulsa",
 *       location_display: "WTULSA",
 *       device_count: 42,
 *       primary_vendor: "CISCO",
 *       vendor_breakdown: { CISCO: 35, "Palo Alto": 5, Other: 2 },
 *       total_vpr: 1847.3,
 *       severity_breakdown: {
 *         Critical: { count: 12, vpr: 456.2 },
 *         High: { count: 28, vpr: 892.1 },
 *         Medium: { count: 15, vpr: 398.0 },
 *         Low: { count: 8, vpr: 101.0 }
 *       },
 *       kev_count: 3,
 *       open_tickets: 2,
 *       confidence: 0.85
 *     }
 *   ],
 *   error: null
 * }
 */
router.get("/stats", requireAuth, LocationController.getLocationStats);

module.exports = router;
