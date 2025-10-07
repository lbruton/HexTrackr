/**
 * User Preferences Routes
 * Handles CRUD operations for cross-device user preference persistence
 *
 * All routes require authentication (protected with requireAuth middleware)
 *
 * Routes:
 * - GET    /api/preferences          - Get all preferences for current user
 * - GET    /api/preferences/count    - Get preference count for current user
 * - GET    /api/preferences/:key     - Get specific preference
 * - HEAD   /api/preferences/:key     - Check if preference exists
 * - PUT    /api/preferences/:key     - Set/update specific preference
 * - POST   /api/preferences/bulk     - Set multiple preferences in transaction
 * - DELETE /api/preferences/:key     - Delete specific preference
 * - DELETE /api/preferences          - Delete all preferences
 *
 * Related: HEX-138 - Browser Storage → Database Migration
 */

const express = require("express");
const PreferencesController = require("../controllers/preferencesController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// All preferences routes require authentication
router.use(requireAuth);

/**
 * GET /api/preferences/count - Get total preference count
 * Must be defined BEFORE /:key route to avoid matching "count" as a key
 */
router.get("/count", PreferencesController.getPreferenceCount);

/**
 * POST /api/preferences/bulk - Set multiple preferences in single transaction
 * Must be defined BEFORE /:key route to avoid matching "bulk" as a key
 */
router.post("/bulk", PreferencesController.setMultiplePreferences);

/**
 * GET /api/preferences - Get all preferences for current user
 */
router.get("/", PreferencesController.getAllPreferences);

/**
 * DELETE /api/preferences - Delete all preferences for current user
 */
router.delete("/", PreferencesController.deleteAllPreferences);

/**
 * GET /api/preferences/:key - Get specific preference
 */
router.get("/:key", PreferencesController.getPreference);

/**
 * HEAD /api/preferences/:key - Check if preference exists
 */
router.head("/:key", PreferencesController.hasPreference);

/**
 * PUT /api/preferences/:key - Set/update specific preference
 */
router.put("/:key", PreferencesController.setPreference);

/**
 * DELETE /api/preferences/:key - Delete specific preference
 */
router.delete("/:key", PreferencesController.deletePreference);

module.exports = router;
