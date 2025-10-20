/**
 * PreferencesService - User preferences business logic and database operations
 * Handles cross-device user preference persistence (theme, templates, settings, etc.)
 *
 * Features:
 * - Preference storage with JSON value support for complex objects
 * - User-scoped CRUD operations with foreign key constraints
 * - Automatic timestamp management via database trigger
 * - Cascading delete on user removal
 *
 * Related: HEX-138 - Browser Storage → Database Migration
 */
class PreferencesService {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize service with database connection
     * @param {sqlite3.Database} database - Database connection from server.js
     */
    initialize(database) {
        this.db = database;
    }

    /**
     * Get a specific preference value for a user
     * @param {number} userId - User ID
     * @param {string} key - Preference key (e.g., "theme", "markdown_template_ticket")
     * @returns {Promise<Object>} Result object with {success, data, error}
     */
    async getPreference(userId, key) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT preference_key, preference_value, created_at, updated_at
                 FROM user_preferences
                 WHERE user_id = ? AND preference_key = ?`,
                [userId, key],
                (err, row) => {
                    if (err) {
                        return reject(new Error("Database error fetching preference: " + err.message));
                    }

                    if (!row) {
                        return resolve({ success: false, error: "Preference not found" });
                    }

                    // Parse JSON value if it's valid JSON
                    let parsedValue;
                    try {
                        parsedValue = JSON.parse(row.preference_value);
                    } catch (_parseError) {
                        // Not JSON - return as string
                        parsedValue = row.preference_value;
                    }

                    resolve({
                        success: true,
                        data: {
                            key: row.preference_key,
                            value: parsedValue,
                            created_at: row.created_at,
                            updated_at: row.updated_at
                        }
                    });
                }
            );
        });
    }

    /**
     * Get all preferences for a user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Result object with {success, data, error}
     */
    async getAllPreferences(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT preference_key, preference_value, created_at, updated_at
                 FROM user_preferences
                 WHERE user_id = ?
                 ORDER BY preference_key ASC`,
                [userId],
                (err, rows) => {
                    if (err) {
                        return reject(new Error("Database error fetching preferences: " + err.message));
                    }

                    // Parse JSON values for each preference
                    const preferences = rows.map(row => {
                        let parsedValue;
                        try {
                            parsedValue = JSON.parse(row.preference_value);
                        } catch (_parseError) {
                            parsedValue = row.preference_value;
                        }

                        return {
                            key: row.preference_key,
                            value: parsedValue,
                            created_at: row.created_at,
                            updated_at: row.updated_at
                        };
                    });

                    resolve({
                        success: true,
                        data: preferences
                    });
                }
            );
        });
    }

    /**
     * Set a preference value for a user (creates or updates)
     * Uses UPSERT pattern: INSERT with ON CONFLICT DO UPDATE
     * @param {number} userId - User ID
     * @param {string} key - Preference key
     * @param {*} value - Preference value (will be JSON stringified if object/array)
     * @returns {Promise<Object>} Result object with {success, message, error}
     */
    async setPreference(userId, key, value) {
        return new Promise((resolve, reject) => {
            // Stringify value if it's an object or array
            const stringValue = typeof value === "object"
                ? JSON.stringify(value)
                : String(value);

            // Use UPSERT: INSERT or UPDATE if exists
            this.db.run(
                `INSERT INTO user_preferences (user_id, preference_key, preference_value)
                 VALUES (?, ?, ?)
                 ON CONFLICT(user_id, preference_key)
                 DO UPDATE SET
                     preference_value = excluded.preference_value,
                     updated_at = CURRENT_TIMESTAMP`,
                [userId, key, stringValue],
                function(err) {
                    if (err) {
                        return reject(new Error("Database error setting preference: " + err.message));
                    }

                    resolve({
                        success: true,
                        message: "Preference saved successfully"
                    });
                }
            );
        });
    }

    /**
     * Set multiple preferences for a user in a single transaction
     * @param {number} userId - User ID
     * @param {Object} preferences - Object with key-value pairs to set
     * @returns {Promise<Object>} Result object with {success, message, error}
     */
    async setMultiplePreferences(userId, preferences) {
        return new Promise((resolve, reject) => {
            const keys = Object.keys(preferences);

            if (keys.length === 0) {
                return resolve({
                    success: true,
                    message: "No preferences to set"
                });
            }

            // Begin transaction
            this.db.run("BEGIN TRANSACTION", (beginErr) => {
                if (beginErr) {
                    return reject(new Error("Failed to begin transaction: " + beginErr.message));
                }

                // Prepare promises for each preference
                const promises = keys.map(key => {
                    return new Promise((resolveSet, rejectSet) => {
                        const value = preferences[key];
                        const stringValue = typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value);

                        this.db.run(
                            `INSERT INTO user_preferences (user_id, preference_key, preference_value)
                             VALUES (?, ?, ?)
                             ON CONFLICT(user_id, preference_key)
                             DO UPDATE SET
                                 preference_value = excluded.preference_value,
                                 updated_at = CURRENT_TIMESTAMP`,
                            [userId, key, stringValue],
                            function(err) {
                                if (err) {
                                    return rejectSet(err);
                                }
                                resolveSet();
                            }
                        );
                    });
                });

                // Execute all updates
                Promise.all(promises)
                    .then(() => {
                        this.db.run("COMMIT", (commitErr) => {
                            if (commitErr) {
                                return reject(new Error("Failed to commit transaction: " + commitErr.message));
                            }
                            resolve({
                                success: true,
                                message: `${keys.length} preferences saved successfully`
                            });
                        });
                    })
                    .catch((updateErr) => {
                        this.db.run("ROLLBACK", () => {
                            reject(new Error("Failed to set preferences: " + updateErr.message));
                        });
                    });
            });
        });
    }

    /**
     * Delete a specific preference for a user
     * @param {number} userId - User ID
     * @param {string} key - Preference key to delete
     * @returns {Promise<Object>} Result object with {success, message, error}
     */
    async deletePreference(userId, key) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `DELETE FROM user_preferences
                 WHERE user_id = ? AND preference_key = ?`,
                [userId, key],
                function(err) {
                    if (err) {
                        return reject(new Error("Database error deleting preference: " + err.message));
                    }

                    if (this.changes === 0) {
                        return resolve({
                            success: false,
                            error: "Preference not found"
                        });
                    }

                    resolve({
                        success: true,
                        message: "Preference deleted successfully"
                    });
                }
            );
        });
    }

    /**
     * Delete all preferences for a user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Result object with {success, message, error}
     */
    async deleteAllPreferences(userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "DELETE FROM user_preferences WHERE user_id = ?",
                [userId],
                function(err) {
                    if (err) {
                        return reject(new Error("Database error deleting preferences: " + err.message));
                    }

                    resolve({
                        success: true,
                        message: `${this.changes} preferences deleted successfully`
                    });
                }
            );
        });
    }

    /**
     * Check if a preference exists for a user
     * @param {number} userId - User ID
     * @param {string} key - Preference key to check
     * @returns {Promise<boolean>} True if preference exists, false otherwise
     */
    async hasPreference(userId, key) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT 1 FROM user_preferences
                 WHERE user_id = ? AND preference_key = ?`,
                [userId, key],
                (err, row) => {
                    if (err) {
                        return reject(new Error("Database error checking preference: " + err.message));
                    }
                    resolve(!!row);
                }
            );
        });
    }

    /**
     * Get count of preferences for a user
     * @param {number} userId - User ID
     * @returns {Promise<number>} Count of preferences
     */
    async getPreferenceCount(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT COUNT(*) as count FROM user_preferences WHERE user_id = ?",
                [userId],
                (err, row) => {
                    if (err) {
                        return reject(new Error("Database error counting preferences: " + err.message));
                    }
                    resolve(row.count);
                }
            );
        });
    }

    /**
     * Export user preferences (HEX-303)
     * Filters out sensitive preferences (API keys, credentials, passwords)
     * @param {number} userId - User ID
     * @param {string} username - Username for metadata
     * @returns {Promise<Object>} Export data with metadata and filtered preferences
     */
    async exportUserPreferences(userId, username) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT preference_key, preference_value, created_at, updated_at
                 FROM user_preferences
                 WHERE user_id = ?
                 ORDER BY preference_key ASC`,
                [userId],
                (err, rows) => {
                    if (err) {
                        return reject(new Error("Database error exporting preferences: " + err.message));
                    }

                    // Security filter patterns - exclude sensitive keys
                    const sensitivePatterns = [
                        /_api_key$/i,
                        /_credentials$/i,
                        /_password$/i,
                        /_secret$/i,
                        /_token$/i,
                        /^cisco_api_key$/i,
                        /^servicenow_password$/i,
                        /^servicenow_credentials$/i
                    ];

                    // Filter and parse preferences
                    const safePreferences = rows
                        .filter(row => {
                            // Exclude if matches any sensitive pattern
                            const isSensitive = sensitivePatterns.some(pattern =>
                                pattern.test(row.preference_key)
                            );
                            return !isSensitive;
                        })
                        .map(row => {
                            let parsedValue;
                            try {
                                parsedValue = JSON.parse(row.preference_value);
                            } catch (_parseError) {
                                parsedValue = row.preference_value;
                            }

                            return {
                                key: row.preference_key,
                                value: parsedValue,
                                created_at: row.created_at,
                                updated_at: row.updated_at
                            };
                        });

                    resolve({
                        export_type: "user_preferences",
                        export_version: "1.0",
                        exported_at: new Date().toISOString(),
                        user: {
                            username: username,
                            user_id: userId
                        },
                        metadata: {
                            total_preferences: rows.length,
                            exported_preferences: safePreferences.length,
                            filtered_out: rows.length - safePreferences.length
                        },
                        preferences: safePreferences
                    });
                }
            );
        });
    }

    /**
     * Import user preferences (HEX-303)
     * Validates structure and filters out sensitive keys during import
     * @param {number} userId - User ID
     * @param {Object} importData - Export data structure from exportUserPreferences
     * @returns {Promise<Object>} Result with success status and import counts
     */
    async importUserPreferences(userId, importData) {
        return new Promise((resolve, reject) => {
            // Validate import data structure
            if (!importData || !importData.preferences || !Array.isArray(importData.preferences)) {
                return reject(new Error("Invalid import data structure"));
            }

            if (importData.export_type !== "user_preferences") {
                return reject(new Error("Invalid export type - expected 'user_preferences'"));
            }

            // Security filter patterns - exclude sensitive keys during import
            const sensitivePatterns = [
                /_api_key$/i,
                /_credentials$/i,
                /_password$/i,
                /_secret$/i,
                /_token$/i,
                /^cisco_api_key$/i,
                /^servicenow_password$/i,
                /^servicenow_credentials$/i
            ];

            // Filter preferences
            const safePreferences = importData.preferences.filter(pref => {
                const isSensitive = sensitivePatterns.some(pattern =>
                    pattern.test(pref.key)
                );
                return !isSensitive && pref.key && pref.value !== undefined;
            });

            if (safePreferences.length === 0) {
                return resolve({
                    success: true,
                    message: "No safe preferences to import",
                    imported: 0,
                    skipped: importData.preferences.length
                });
            }

            // Begin transaction
            this.db.run("BEGIN TRANSACTION", (beginErr) => {
                if (beginErr) {
                    return reject(new Error("Failed to begin transaction: " + beginErr.message));
                }

                // Import each preference
                const promises = safePreferences.map(pref => {
                    return new Promise((resolveImport, rejectImport) => {
                        const stringValue = typeof pref.value === "object"
                            ? JSON.stringify(pref.value)
                            : String(pref.value);

                        this.db.run(
                            `INSERT INTO user_preferences (user_id, preference_key, preference_value)
                             VALUES (?, ?, ?)
                             ON CONFLICT(user_id, preference_key)
                             DO UPDATE SET
                                 preference_value = excluded.preference_value,
                                 updated_at = CURRENT_TIMESTAMP`,
                            [userId, pref.key, stringValue],
                            function(err) {
                                if (err) {
                                    return rejectImport(err);
                                }
                                resolveImport();
                            }
                        );
                    });
                });

                // Execute all imports
                Promise.all(promises)
                    .then(() => {
                        this.db.run("COMMIT", (commitErr) => {
                            if (commitErr) {
                                return reject(new Error("Failed to commit import: " + commitErr.message));
                            }
                            resolve({
                                success: true,
                                message: `Successfully imported ${safePreferences.length} preferences`,
                                imported: safePreferences.length,
                                skipped: importData.preferences.length - safePreferences.length
                            });
                        });
                    })
                    .catch((importErr) => {
                        this.db.run("ROLLBACK", () => {
                            reject(new Error("Failed to import preferences: " + importErr.message));
                        });
                    });
            });
        });
    }
}

module.exports = PreferencesService;
