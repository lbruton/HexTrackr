/**
 * @fileoverview User Preferences Service for HexTrackr
 * @description Client-side service for managing user preferences with database persistence.
 * Replaces localStorage-based preferences with server-backed storage for cross-device sync.
 *
 * @module PreferencesService
 * @version 1.0.0
 * @since 2025-10-07
 * @author HexTrackr Development Team
 *
 * @example
 * // Initialize service
 * const prefsService = new PreferencesService();
 *
 * // Set a preference
 * await prefsService.setPreference('theme', 'dark');
 *
 * // Get a preference
 * const theme = await prefsService.getPreference('theme');
 *
 * // Bulk save preferences
 * await prefsService.setMultiplePreferences({
 *   theme: 'dark',
 *   pagination_limit: 50,
 *   kev_auto_refresh: true
 * });
 *
 * Related: HEX-138 - Browser Storage → Database Migration
 */

/* eslint-env browser */
/* global fetch, console */

"use strict";

/**
 * User Preferences Service Class
 *
 * Provides client-side API for managing user preferences with server-backed persistence.
 * All methods use authenticated fetch with automatic CSRF token management.
 *
 * @class PreferencesService
 */
class PreferencesService {
    /**
     * Create a PreferencesService instance
     *
     * @constructor
     */
    constructor() {
        /**
         * Base API endpoint for preferences
         * @type {string}
         * @private
         */
        this.baseUrl = "/api/preferences";

        console.log("PreferencesService initialized");
    }

    /**
     * Fetch CSRF token for state-changing requests
     *
     * @async
     * @private
     * @returns {Promise<string|null>} CSRF token or null if fetch fails
     */
    async fetchCsrfToken() {
        try {
            const response = await fetch("/api/auth/csrf", {
                credentials: "include"
            });
            const data = await response.json();
            return data.success ? data.csrfToken : null;
        } catch (error) {
            console.warn("Failed to fetch CSRF token:", error);
            return null;
        }
    }

    /**
     * Make authenticated fetch request with automatic CSRF token injection
     *
     * @async
     * @private
     * @param {string} url - API endpoint URL
     * @param {Object} options - Fetch options
     * @returns {Promise<Response>} Fetch response
     */
    async authenticatedFetch(url, options = {}) {
        const method = (options.method || "GET").toUpperCase();

        // Fetch CSRF token for state-changing requests
        if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
            const csrfToken = await this.fetchCsrfToken();
            if (csrfToken) {
                options.headers = {
                    ...options.headers,
                    "X-CSRF-Token": csrfToken
                };
            }
        }

        // Always include credentials for session management
        const fetchOptions = {
            ...options,
            credentials: "include"
        };

        return fetch(url, fetchOptions);
    }

    /**
     * Parse JSON response with error handling
     *
     * @async
     * @private
     * @param {Response} response - Fetch response
     * @returns {Promise<Object>} Parsed response object with {success, data?, error?}
     */
    async parseResponse(response) {
        try {
            const data = await response.json();

            // Handle 401 Unauthorized - redirect to login
            if (response.status === 401) {
                console.warn("Authentication required - redirecting to login");
                window.location.href = "/login.html";
                return { success: false, error: "Authentication required" };
            }

            // Return parsed response
            return data;
        } catch (error) {
            console.error("Response parse error:", error);
            return {
                success: false,
                error: "Failed to parse server response"
            };
        }
    }

    /**
     * Get a specific preference value
     *
     * @async
     * @param {string} key - Preference key
     * @returns {Promise<Object>} Result with {success, data?: {key, value, created_at, updated_at}, error?}
     *
     * @example
     * const result = await prefsService.getPreference('theme');
     * if (result.success) {
     *   console.log('Theme:', result.data.value);
     * }
     */
    async getPreference(key) {
        try {
            const response = await this.authenticatedFetch(`${this.baseUrl}/${encodeURIComponent(key)}`);
            return await this.parseResponse(response);
        } catch (error) {
            console.error(`Error fetching preference '${key}':`, error);
            return {
                success: false,
                error: error.message || "Network error"
            };
        }
    }

    /**
     * Get all preferences for current user
     *
     * @async
     * @returns {Promise<Object>} Result with {success, data?: {preferences: Array, count: number}, error?}
     *
     * @example
     * const result = await prefsService.getAllPreferences();
     * if (result.success) {
     *   result.data.preferences.forEach(pref => {
     *     console.log(`${pref.key}: ${pref.value}`);
     *   });
     * }
     */
    async getAllPreferences() {
        try {
            const response = await this.authenticatedFetch(this.baseUrl);
            return await this.parseResponse(response);
        } catch (error) {
            console.error("Error fetching all preferences:", error);
            return {
                success: false,
                error: error.message || "Network error"
            };
        }
    }

    /**
     * Set a preference value (creates or updates)
     *
     * @async
     * @param {string} key - Preference key
     * @param {*} value - Preference value (any JSON-serializable type)
     * @returns {Promise<Object>} Result with {success, data?: {message, key, value}, error?}
     *
     * @example
     * const result = await prefsService.setPreference('theme', 'dark');
     * if (result.success) {
     *   console.log('Preference saved:', result.data.message);
     * }
     */
    async setPreference(key, value) {
        try {
            const response = await this.authenticatedFetch(`${this.baseUrl}/${encodeURIComponent(key)}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ value })
            });
            return await this.parseResponse(response);
        } catch (error) {
            console.error(`Error setting preference '${key}':`, error);
            return {
                success: false,
                error: error.message || "Network error"
            };
        }
    }

    /**
     * Set multiple preferences in a single transaction
     *
     * @async
     * @param {Object} preferences - Object with key-value pairs to save
     * @returns {Promise<Object>} Result with {success, data?: {message, count}, error?}
     *
     * @example
     * const result = await prefsService.setMultiplePreferences({
     *   theme: 'dark',
     *   pagination_limit: 50,
     *   kev_auto_refresh: true
     * });
     * if (result.success) {
     *   console.log(`Saved ${result.data.count} preferences`);
     * }
     */
    async setMultiplePreferences(preferences) {
        try {
            const response = await this.authenticatedFetch(`${this.baseUrl}/bulk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ preferences })
            });
            return await this.parseResponse(response);
        } catch (error) {
            console.error("Error setting multiple preferences:", error);
            return {
                success: false,
                error: error.message || "Network error"
            };
        }
    }

    /**
     * Delete a specific preference
     *
     * @async
     * @param {string} key - Preference key to delete
     * @returns {Promise<Object>} Result with {success, data?: {message, key}, error?}
     *
     * @example
     * const result = await prefsService.deletePreference('old_setting');
     * if (result.success) {
     *   console.log('Preference deleted');
     * }
     */
    async deletePreference(key) {
        try {
            const response = await this.authenticatedFetch(`${this.baseUrl}/${encodeURIComponent(key)}`, {
                method: "DELETE"
            });
            return await this.parseResponse(response);
        } catch (error) {
            console.error(`Error deleting preference '${key}':`, error);
            return {
                success: false,
                error: error.message || "Network error"
            };
        }
    }

    /**
     * Delete all preferences for current user
     *
     * @async
     * @returns {Promise<Object>} Result with {success, data?: {message}, error?}
     *
     * @example
     * const result = await prefsService.deleteAllPreferences();
     * if (result.success) {
     *   console.log('All preferences cleared');
     * }
     */
    async deleteAllPreferences() {
        try {
            const response = await this.authenticatedFetch(this.baseUrl, {
                method: "DELETE"
            });
            return await this.parseResponse(response);
        } catch (error) {
            console.error("Error deleting all preferences:", error);
            return {
                success: false,
                error: error.message || "Network error"
            };
        }
    }

    /**
     * Check if a preference exists
     *
     * @async
     * @param {string} key - Preference key to check
     * @returns {Promise<boolean>} True if preference exists, false otherwise
     *
     * @example
     * const exists = await prefsService.hasPreference('theme');
     * if (exists) {
     *   console.log('Theme preference is set');
     * }
     */
    async hasPreference(key) {
        try {
            const response = await this.authenticatedFetch(`${this.baseUrl}/${encodeURIComponent(key)}`, {
                method: "HEAD"
            });
            return response.status === 200;
        } catch (error) {
            console.error(`Error checking preference '${key}':`, error);
            return false;
        }
    }

    /**
     * Get total preference count for current user
     *
     * @async
     * @returns {Promise<number>} Preference count (0 on error)
     *
     * @example
     * const count = await prefsService.getPreferenceCount();
     * console.log(`User has ${count} preferences`);
     */
    async getPreferenceCount() {
        try {
            const response = await this.authenticatedFetch(`${this.baseUrl}/count`);
            const data = await this.parseResponse(response);
            return data.success ? data.data.count : 0;
        } catch (error) {
            console.error("Error getting preference count:", error);
            return 0;
        }
    }
}

// Export for module systems or create global instance
if (typeof module !== "undefined" && module.exports) {
    module.exports = PreferencesService;
} else {
    // Create global instance for browser use
    window.preferencesService = new PreferencesService();
}
