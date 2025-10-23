/**
 * PreferencesController - HTTP request handlers for user preferences
 * Handles CRUD operations for cross-device user preference persistence
 *
 * Delegates business logic to PreferencesService
 * Returns standardized JSON responses: {success: boolean, data?: any, error?: string, details?: any}
 *
 * Related: HEX-138 - Browser Storage → Database Migration
 */

const PreferencesService = require("../services/preferencesService");

class PreferencesController {
    constructor() {
        this.preferencesService = new PreferencesService();
    }

    /**
     * Initialize controller with database connection
     * Called from server.js during setup
     * @param {sqlite3.Database} database - Database connection
     */
    static initialize(database) {
        if (!PreferencesController.instance) {
            PreferencesController.instance = new PreferencesController();
        }
        PreferencesController.instance.preferencesService.initialize(database);
        return PreferencesController.instance;
    }

    /**
     * Get singleton instance (for use in routes)
     * @returns {PreferencesController} Controller instance
     */
    static getInstance() {
        if (!PreferencesController.instance) {
            throw new Error("PreferencesController not initialized. Call initialize() first.");
        }
        return PreferencesController.instance;
    }

    /**
     * Get a specific preference - GET /api/preferences/:key
     * Returns preference value for current authenticated user
     * @param {Object} req - Express request
     * @param {Object} req.params - Route parameters
     * @param {string} req.params.key - Preference key to retrieve
     * @param {Object} req.user - User from requireAuth middleware
     * @param {Object} res - Express response
     */
    static async getPreference(req, res) {
        try {
            const { key } = req.params;
            const userId = req.user.id;

            // Input validation
            if (!key) {
                return res.status(400).json({
                    success: false,
                    error: "Preference key is required"
                });
            }

            const controller = PreferencesController.getInstance();
            const result = await controller.preferencesService.getPreference(userId, key);

            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    error: result.error
                });
            }

            res.json({
                success: true,
                data: result.data
            });

        } catch (error) {
            console.error("Get preference error:", error);
            res.status(500).json({
                success: false,
                error: "Failed to retrieve preference",
                details: error.message
            });
        }
    }

    /**
     * Get all preferences - GET /api/preferences
     * Returns all preferences for current authenticated user
     * @param {Object} req - Express request
     * @param {Object} req.user - User from requireAuth middleware
     * @param {Object} res - Express response
     */
    static async getAllPreferences(req, res) {
        try {
            const userId = req.user.id;

            const controller = PreferencesController.getInstance();
            const result = await controller.preferencesService.getAllPreferences(userId);

            res.json({
                success: true,
                data: {
                    preferences: result.data,
                    count: result.data.length
                }
            });

        } catch (error) {
            console.error("Get all preferences error:", error);
            res.status(500).json({
                success: false,
                error: "Failed to retrieve preferences",
                details: error.message
            });
        }
    }

    /**
     * Set a preference - PUT /api/preferences/:key
     * Creates or updates a preference for current authenticated user
     * @param {Object} req - Express request
     * @param {Object} req.params - Route parameters
     * @param {string} req.params.key - Preference key to set
     * @param {Object} req.body - Request body
     * @param {*} req.body.value - Preference value (any JSON-serializable type)
     * @param {Object} req.user - User from requireAuth middleware
     * @param {Object} res - Express response
     */
    static async setPreference(req, res) {
        try {
            const { key } = req.params;
            const { value } = req.body;
            const userId = req.user.id;

            // Input validation
            if (!key) {
                return res.status(400).json({
                    success: false,
                    error: "Preference key is required"
                });
            }

            if (value === undefined || value === null) {
                return res.status(400).json({
                    success: false,
                    error: "Preference value is required"
                });
            }

            const controller = PreferencesController.getInstance();
            const result = await controller.preferencesService.setPreference(userId, key, value);

            res.json({
                success: true,
                data: {
                    message: result.message,
                    key,
                    value
                }
            });

        } catch (error) {
            console.error("Set preference error:", error);
            res.status(500).json({
                success: false,
                error: "Failed to set preference",
                details: error.message
            });
        }
    }

    /**
     * Set multiple preferences - POST /api/preferences/bulk
     * Creates or updates multiple preferences in a single transaction
     * @param {Object} req - Express request
     * @param {Object} req.body - Request body
     * @param {Object} req.body.preferences - Object with key-value pairs to set
     * @param {Object} req.user - User from requireAuth middleware
     * @param {Object} res - Express response
     */
    static async setMultiplePreferences(req, res) {
        try {
            const { preferences } = req.body;
            const userId = req.user.id;

            // Input validation
            if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) {
                return res.status(400).json({
                    success: false,
                    error: "Preferences must be an object with key-value pairs"
                });
            }

            const keys = Object.keys(preferences);
            if (keys.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "At least one preference must be provided"
                });
            }

            const controller = PreferencesController.getInstance();
            const result = await controller.preferencesService.setMultiplePreferences(userId, preferences);

            res.json({
                success: true,
                data: {
                    message: result.message,
                    count: keys.length
                }
            });

        } catch (error) {
            console.error("Set multiple preferences error:", error);
            res.status(500).json({
                success: false,
                error: "Failed to set preferences",
                details: error.message
            });
        }
    }

    /**
     * Delete a preference - DELETE /api/preferences/:key
     * Deletes a specific preference for current authenticated user
     * @param {Object} req - Express request
     * @param {Object} req.params - Route parameters
     * @param {string} req.params.key - Preference key to delete
     * @param {Object} req.user - User from requireAuth middleware
     * @param {Object} res - Express response
     */
    static async deletePreference(req, res) {
        try {
            const { key } = req.params;
            const userId = req.user.id;

            // Input validation
            if (!key) {
                return res.status(400).json({
                    success: false,
                    error: "Preference key is required"
                });
            }

            const controller = PreferencesController.getInstance();
            const result = await controller.preferencesService.deletePreference(userId, key);

            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    error: result.error
                });
            }

            res.json({
                success: true,
                data: {
                    message: result.message,
                    key
                }
            });

        } catch (error) {
            console.error("Delete preference error:", error);
            res.status(500).json({
                success: false,
                error: "Failed to delete preference",
                details: error.message
            });
        }
    }

    /**
     * Delete all preferences - DELETE /api/preferences
     * Deletes all preferences for current authenticated user
     * @param {Object} req - Express request
     * @param {Object} req.user - User from requireAuth middleware
     * @param {Object} res - Express response
     */
    static async deleteAllPreferences(req, res) {
        try {
            const userId = req.user.id;

            const controller = PreferencesController.getInstance();
            const result = await controller.preferencesService.deleteAllPreferences(userId);

            res.json({
                success: true,
                data: {
                    message: result.message
                }
            });

        } catch (error) {
            console.error("Delete all preferences error:", error);
            res.status(500).json({
                success: false,
                error: "Failed to delete preferences",
                details: error.message
            });
        }
    }

    /**
     * Check if preference exists - HEAD /api/preferences/:key
     * Returns 200 if preference exists, 404 if not
     *
     * @async
     * @param {Object} req - Express request
     * @param {Object} req.params - Route parameters
     * @param {string} req.params.key - Preference key to check
     * @param {Object} req.user - User from requireAuth middleware
     * @param {number} req.user.id - User ID from authentication middleware
     * @param {Object} res - Express response
     * @returns {Promise<void>} Sends HTTP response:
     *   - 200: Preference exists (no body)
     *   - 400: Missing preference key (no body)
     *   - 404: Preference not found (no body)
     *   - 500: Server error (no body)
     * @throws {Error} Caught and returned as 500 response if PreferencesService.hasPreference fails
     * @route HEAD /api/preferences/:key
     * @example
     * // Check if dark mode preference exists
     * // HEAD /api/preferences/theme
     * // Returns: 200 (if exists) or 404 (if not)
     */
    static async hasPreference(req, res) {
        try {
            const { key } = req.params;
            const userId = req.user.id;

            // Input validation
            if (!key) {
                return res.status(400).end();
            }

            const controller = PreferencesController.getInstance();
            const exists = await controller.preferencesService.hasPreference(userId, key);

            if (exists) {
                res.status(200).end();
            } else {
                res.status(404).end();
            }

        } catch (error) {
            console.error("Has preference error:", error);
            res.status(500).end();
        }
    }

    /**
     * Get preference count - GET /api/preferences/count
     * Returns total number of preferences for current authenticated user
     *
     * @async
     * @param {Object} req - Express request object
     * @param {Object} req.user - User from requireAuth middleware
     * @param {number} req.user.id - User ID from authentication middleware
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response:
     *   - 200: {success: true, data: {count: number}}
     *   - 500: {success: false, error: "Failed to get preference count", details: string}
     * @throws {Error} Caught and returned as 500 response if PreferencesService.getPreferenceCount fails
     * @route GET /api/preferences/count
     * @example
     * // GET /api/preferences/count
     * // Returns: {success: true, data: {count: 42}}
     */
    static async getPreferenceCount(req, res) {
        try {
            const userId = req.user.id;

            const controller = PreferencesController.getInstance();
            const count = await controller.preferencesService.getPreferenceCount(userId);

            res.json({
                success: true,
                data: {
                    count
                }
            });

        } catch (error) {
            console.error("Get preference count error:", error);
            res.status(500).json({
                success: false,
                error: "Failed to get preference count",
                details: error.message
            });
        }
    }

    /**
     * Export user preferences (HEX-303) - GET /api/preferences/export
     * Exports all non-sensitive preferences for current authenticated user
     * Returns JSON file for download (no server-side storage)
     * @param {Object} req - Express request
     * @param {Object} req.user - User from requireAuth middleware
     * @param {Object} res - Express response
     */
    static async exportUserPreferences(req, res) {
        try {
            const userId = req.user.id;
            const username = req.user.username || "user";

            const controller = PreferencesController.getInstance();
            const exportData = await controller.preferencesService.exportUserPreferences(userId, username);

            // Set headers for JSON download
            const filename = `hextrackr_user_preferences_${username}_${new Date().toISOString().split("T")[0]}.json`;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Cache-Control", "no-cache");

            // Send as formatted JSON string
            res.send(JSON.stringify(exportData, null, 2));

        } catch (error) {
            console.error("Export user preferences error:", error);
            res.status(500).json({
                success: false,
                error: "Failed to export user preferences",
                details: error.message
            });
        }
    }

    /**
     * Import user preferences (HEX-303) - POST /api/preferences/import
     * Imports non-sensitive preferences from uploaded JSON file
     * @param {Object} req - Express request
     * @param {Object} req.body - Import data (from exportUserPreferences)
     * @param {Object} req.user - User from requireAuth middleware
     * @param {Object} res - Express response
     */
    static async importUserPreferences(req, res) {
        try {
            const userId = req.user.id;
            const importData = req.body;

            // Input validation
            if (!importData || typeof importData !== "object") {
                return res.status(400).json({
                    success: false,
                    error: "Invalid import data - must be valid JSON object"
                });
            }

            const controller = PreferencesController.getInstance();
            const result = await controller.preferencesService.importUserPreferences(userId, importData);

            res.json({
                success: result.success,
                data: {
                    message: result.message,
                    imported: result.imported,
                    skipped: result.skipped
                }
            });

        } catch (error) {
            console.error("Import user preferences error:", error);
            res.status(500).json({
                success: false,
                error: "Failed to import user preferences",
                details: error.message
            });
        }
    }
}

module.exports = PreferencesController;
