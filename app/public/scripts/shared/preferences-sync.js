/**
 * @fileoverview Preferences Synchronization Bridge for HexTrackr
 * @description Bridges localStorage (fast synchronous cache) with database (persistent cross-device storage).
 * Maintains backward compatibility while adding server-backed persistence.
 *
 * @module PreferencesSync
 * @version 1.0.0
 * @since 2025-10-07
 * @author HexTrackr Development Team
 *
 * @example
 * // Initialize sync on app load
 * await preferencesSync.initialize();
 *
 * // Theme system continues using localStorage (fast)
 * localStorage.setItem('theme', 'dark');
 *
 * // Sync automatically updates database in background
 * preferencesSync.syncTheme('dark');
 *
 * Related: HEX-138 - Browser Storage → Database Migration (Hybrid Approach)
 */

/* eslint-env browser */
/* global console, localStorage, window */

"use strict";

/**
 * Preferences Synchronization Bridge Class
 *
 * Provides bidirectional sync between localStorage (cache) and database (persistence).
 * Maintains fast synchronous operations while adding cross-device sync capability.
 *
 * @class PreferencesSync
 */
class PreferencesSync {
    /**
     * Create a PreferencesSync instance
     *
     * @constructor
     */
    constructor() {
        /**
         * Reference to preferences service
         * @type {PreferencesService|null}
         * @private
         */
        this.prefsService = null;

        /**
         * Initialization status
         * @type {boolean}
         * @private
         */
        this.initialized = false;

        /**
         * Sync queue for batching database writes
         * @type {Map<string, {value: *, timestamp: number}>}
         * @private
         */
        this.syncQueue = new Map();

        /**
         * Sync debounce timeout
         * @type {number|null}
         * @private
         */
        this.syncTimeout = null;

        /**
         * Sync delay in milliseconds
         * @type {number}
         * @private
         */
        this.SYNC_DELAY = 1000; // 1 second debounce

        console.log("PreferencesSync initialized");
    }

    /**
     * Initialize preferences sync system
     * Loads preferences from database and syncs to localStorage
     *
     * @async
     * @returns {Promise<boolean>} True if initialization successful
     *
     * @example
     * await preferencesSync.initialize();
     */
    async initialize() {
        try {
            // Check if preferences service is available
            if (!window.preferencesService) {
                console.warn("PreferencesService not available, sync disabled");
                return false;
            }

            this.prefsService = window.preferencesService;

            // Load all preferences from database
            const result = await this.prefsService.getAllPreferences();

            if (!result.success) {
                console.warn("Failed to load preferences from database:", result.error);
                // Continue with localStorage-only mode
                this.initialized = true;
                return false;
            }

            // Sync database preferences to localStorage cache
            if (result.data && result.data.preferences) {
                let themePreference = null;

                result.data.preferences.forEach(pref => {
                    // CRITICAL FIX: Check if localStorage has a fresher value before overwriting
                    // This prevents stale database values from overwriting fresh user changes
                    const storageKey = this.getStorageKey(pref.key);
                    const existingValue = localStorage.getItem(storageKey);

                    let shouldUpdate = true;
                    let cachedTheme = null; // Store parsed theme for reuse (backward compatibility)

                    if (existingValue && pref.key === "theme") {
                        // Theme preferences have timestamps - preserve if VERY fresh (< 500ms old)
                        // This prevents race conditions while allowing cross-browser sync
                        // FIX (HEX-140): Reduced from 5000ms to 500ms to enable cross-browser sync
                        try {
                            const cached = JSON.parse(existingValue);
                            if (cached && cached.timestamp) {
                                const age = Date.now() - cached.timestamp;
                                if (age < 500) {
                                    // localStorage value is very fresh, preserve it (prevents race condition)
                                    console.log(`🔒 Preserving fresh localStorage theme (${age}ms old): ${cached.theme}`);
                                    shouldUpdate = false;
                                } else {
                                    // localStorage value is stale, use database value for cross-device sync
                                    console.log(` Updating stale localStorage theme (${age}ms old) with database value`);
                                }
                            }
                            // Store theme for reuse (handles both old and new JSON formats)
                            cachedTheme = cached?.theme || cached;
                        } catch (_e) {
                            // BACKWARD COMPATIBILITY FIX: Legacy format stored plain strings like "dark" or "light"
                            // Don't throw error - just use the plain string value directly
                            cachedTheme = existingValue;
                            console.log(` Migrating legacy theme format: "${existingValue}" → JSON`);
                        }
                    }

                    if (shouldUpdate) {
                        this.updateLocalStorageCache(pref.key, pref.value);
                    }

                    // Track theme preference for application after sync
                    // CRITICAL FIX: Reuse already-parsed value instead of calling JSON.parse again
                    // This prevents SyntaxError when legacy users have plain string themes
                    if (pref.key === "theme") {
                        themePreference = shouldUpdate ? pref.value : (cachedTheme || pref.value);
                    }
                });

                console.log(` Synced ${result.data.count} preferences from database to localStorage`);

                // Apply theme immediately if loaded from database (prevents FOUC in new browsers)
                if (themePreference) {
                    // Apply theme attribute directly to prevent white flash
                    document.documentElement.setAttribute("data-bs-theme", themePreference);

                    // Dispatch themeInitialized event for charts and other components
                    document.dispatchEvent(new CustomEvent("themeInitialized", {
                        detail: { theme: themePreference, source: "database" }
                    }));

                    // Also dispatch preferencesLoaded for other listeners
                    window.dispatchEvent(new CustomEvent("preferencesLoaded", {
                        detail: { theme: themePreference, source: "database" }
                    }));

                    console.log(` Applied theme from database: ${themePreference}`);
                }
            }

            this.initialized = true;
            return true;

        } catch (error) {
            console.error("Error initializing preferences sync:", error);
            this.initialized = true; // Still mark as initialized to allow localStorage-only mode
            return false;
        }
    }

    /**
     * Update localStorage cache with preference value
     *
     * @private
     * @param {string} key - Preference key
     * @param {*} value - Preference value
     */
    updateLocalStorageCache(key, value) {
        try {
            // Convert preference keys to localStorage format
            const storageKey = this.getStorageKey(key);

            // CRITICAL FIX (HEX-140): Theme requires JSON format for FOUC prevention
            // Database stores simple string "dark"/"light", but themeController expects
            // JSON object {"theme":"dark","timestamp":...,"source":"database","version":"1.0.0"}
            if (key === "theme") {
                // Wrap theme in themeController's expected JSON format
                const themeData = {
                    theme: value,
                    timestamp: Date.now(),
                    source: "database",
                    version: "1.0.0"
                };
                localStorage.setItem(storageKey, JSON.stringify(themeData));
            } else if (typeof value === "object") {
                localStorage.setItem(storageKey, JSON.stringify(value));
            } else {
                localStorage.setItem(storageKey, String(value));
            }

        } catch (error) {
            console.warn(`Failed to update localStorage cache for '${key}':`, error);
        }
    }

    /**
     * Convert preference key to localStorage key format
     *
     * @private
     * @param {string} prefKey - Preference key
     * @returns {string} localStorage key
     */
    getStorageKey(prefKey) {
        // Map common preference keys to their localStorage equivalents
        const keyMap = {
            "theme": "hextrackr-theme",
            "markdown_template_ticket": "hextrackr-markdown-ticket",
            "markdown_template_vulnerability": "hextrackr-markdown-vulnerability",
            "pagination_enabled": "hextrackr_enablePagination",
            "kev_auto_refresh": "kevAutoSyncEnabled",
            "cisco_api_key": "hextrackr-cisco-key"
        };

        return keyMap[prefKey] || `hextrackr-${prefKey}`;
    }

    /**
     * Sync theme preference to database
     * Called when theme changes in the UI
     *
     * CRITICAL: Theme sync is IMMEDIATE (not debounced) because users expect
     * theme to persist instantly when navigating between pages.
     *
     * @async
     * @param {string} theme - Theme value ('light' or 'dark')
     * @returns {Promise<void>}
     *
     * @example
     * // After theme change
     * await preferencesSync.syncTheme('dark');
     */
    async syncTheme(theme) {
        if (!this.initialized || !this.prefsService) {
            return;
        }

        try {
            // CRITICAL: Sync theme immediately (bypass debounce queue)
            // Theme is high-priority UX - users expect instant cross-page persistence
            const result = await this.prefsService.setPreference("theme", theme);

            if (result.success) {
                // Update localStorage cache
                this.updateLocalStorageCache("theme", theme);
                console.log(` Theme synced to database immediately: ${theme}`);
            } else {
                console.warn("Failed to sync theme to database:", result.error);
            }

        } catch (error) {
            console.error("Error syncing theme to database:", error);
        }
    }

    /**
     * Sync markdown template to database
     *
     * @async
     * @param {string} type - Template type ('ticket' or 'vulnerability')
     * @param {string} template - Template content
     * @returns {Promise<void>}
     */
    async syncMarkdownTemplate(type, template) {
        if (!this.initialized || !this.prefsService) {
            return;
        }

        try {
            const key = `markdown_template_${type}`;
            this.queueSync(key, template);

        } catch (error) {
            console.error(`Error syncing ${type} template to database:`, error);
        }
    }

    /**
     * Sync pagination enabled/disabled to database
     *
     * @async
     * @param {boolean} enabled - Pagination enabled
     * @returns {Promise<void>}
     */
    async syncPaginationEnabled(enabled) {
        if (!this.initialized || !this.prefsService) {
            return;
        }

        try {
            this.queueSync("pagination_enabled", enabled);

        } catch (error) {
            console.error("Error syncing pagination enabled to database:", error);
        }
    }

    /**
     * Sync KEV auto-refresh setting to database
     *
     * @async
     * @param {boolean} enabled - Auto-refresh enabled
     * @returns {Promise<void>}
     */
    async syncKevAutoRefresh(enabled) {
        if (!this.initialized || !this.prefsService) {
            return;
        }

        try {
            this.queueSync("kev_auto_refresh", enabled);

        } catch (error) {
            console.error("Error syncing KEV auto-refresh to database:", error);
        }
    }

    /**
     * Sync Cisco API credentials to database (SECURITY PRIORITY)
     *
     * @async
     * @param {string} apiKey - Cisco API key
     * @returns {Promise<void>}
     */
    async syncCiscoCredentials(apiKey) {
        if (!this.initialized || !this.prefsService) {
            return;
        }

        try {
            // SECURITY: Sync immediately, don't debounce credentials
            const result = await this.prefsService.setPreference("cisco_api_key", apiKey);

            if (result.success) {
                console.log("🔒 Cisco API credentials synced to secure database storage");

                // Remove from localStorage after successful database save
                try {
                    localStorage.removeItem("hextrackr-cisco-key");
                    console.log("Removed Cisco credentials from localStorage");
                } catch (removeError) {
                    console.warn("Could not remove Cisco credentials from localStorage:", removeError);
                }
            }

        } catch (error) {
            console.error("Error syncing Cisco credentials to database:", error);
        }
    }

    /**
     * Queue a preference for database sync with debouncing
     *
     * @private
     * @param {string} key - Preference key
     * @param {*} value - Preference value
     */
    queueSync(key, value) {
        // Add to sync queue
        this.syncQueue.set(key, {
            value: value,
            timestamp: Date.now()
        });

        // Clear existing timeout
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }

        // Set new debounce timeout
        this.syncTimeout = setTimeout(() => {
            this.flushSyncQueue();
        }, this.SYNC_DELAY);
    }

    /**
     * Flush sync queue to database
     *
     * @private
     * @async
     */
    async flushSyncQueue() {
        if (this.syncQueue.size === 0) {
            return;
        }

        try {
            // Build preferences object for bulk sync
            const preferences = {};
            this.syncQueue.forEach((item, key) => {
                preferences[key] = item.value;
            });

            // Sync to database
            const result = await this.prefsService.setMultiplePreferences(preferences);

            if (result.success) {
                console.log(` Synced ${this.syncQueue.size} preferences to database`);
                this.syncQueue.clear();
            } else {
                console.warn("Failed to sync preferences to database:", result.error);
                // Keep in queue for retry
            }

        } catch (error) {
            console.error("Error flushing sync queue:", error);
        }

        this.syncTimeout = null;
    }

    /**
     * Force immediate sync of all queued preferences
     *
     * @async
     * @returns {Promise<void>}
     *
     * @example
     * // Before page unload
     * await preferencesSync.syncNow();
     */
    async syncNow() {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
            this.syncTimeout = null;
        }

        await this.flushSyncQueue();
    }

    /**
     * Migrate specific localStorage key to database
     *
     * @async
     * @param {string} localStorageKey - localStorage key to migrate
     * @param {string} preferenceKey - Database preference key
     * @returns {Promise<boolean>} True if migrated successfully
     *
     * @example
     * // Migrate legacy key
     * await preferencesSync.migrateLegacyKey('old-theme-key', 'theme');
     */
    async migrateLegacyKey(localStorageKey, preferenceKey) {
        try {
            const value = localStorage.getItem(localStorageKey);

            if (value === null) {
                return false; // No value to migrate
            }

            // Try to parse as JSON
            let parsedValue;
            try {
                parsedValue = JSON.parse(value);
            } catch (_e) {
                parsedValue = value; // Use as string
            }

            // Save to database
            const result = await this.prefsService.setPreference(preferenceKey, parsedValue);

            if (result.success) {
                console.log(` Migrated '${localStorageKey}' → '${preferenceKey}'`);
                return true;
            }

            return false;

        } catch (error) {
            console.error(`Error migrating '${localStorageKey}':`, error);
            return false;
        }
    }

    /**
     * Get sync queue status for debugging
     *
     * @returns {Object} Sync queue information
     */
    getStatus() {
        return {
            initialized: this.initialized,
            serviceAvailable: !!this.prefsService,
            queueSize: this.syncQueue.size,
            pendingSync: !!this.syncTimeout,
            queuedKeys: Array.from(this.syncQueue.keys())
        };
    }
}

// Create global instance
const preferencesSync = new PreferencesSync();

// Auto-initialize when DOM is ready and user is authenticated
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async () => {
        // Wait for auth state to initialize
        if (window.authState) {
            const isAuth = await window.authState.init();
            if (isAuth) {
                await preferencesSync.initialize();
            }
        }
    });
} else {
    // DOM already loaded
    if (window.authState) {
        window.authState.init().then(isAuth => {
            if (isAuth) {
                preferencesSync.initialize();
            }
        });
    }
}

// Sync on page unload
window.addEventListener("beforeunload", () => {
    if (preferencesSync.syncQueue.size > 0) {
        // Use synchronous XHR as last resort (navigator.sendBeacon would be better but requires different API)
        preferencesSync.syncNow();
    }
});

// Expose globally
window.preferencesSync = preferencesSync;
