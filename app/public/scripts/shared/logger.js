/**
 * Centralized Logging Utility for HexTrackr
 *
 * Controls console logging based on environment, debug flags, and categories.
 * In production, console.log calls are silently dropped (zero CPU cost).
 * Supports encrypted audit logging to backend.
 *
 * Usage:
 *   import { logger } from './logger.js';
 *   logger.debug('vulnerability', 'User clicked button');    // Category-aware debug
 *   logger.info('ui', 'Data loaded');                        // Category-aware info
 *   logger.warn('websocket', 'Connection lost');             // Category-aware warn
 *   logger.error('api', 'API failed', error);                // Category-aware error
 *   logger.audit('user.login', 'User logged in', { userId }); // Encrypted audit log
 *
 * Enable debug mode:
 *   localStorage.setItem('hextrackr_debug', 'true');
 *   location.reload();
 */

class Logger {
    constructor() {
        // Check if debug mode is enabled
        this.debugMode = this._isDebugMode();

        // Check if we're in development environment
        this.isDevelopment = window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname === 'dev.hextrackr.com';

        // Configuration cache
        this.config = null;
        this.configLoaded = false;

        // Load configuration asynchronously (non-blocking)
        this.loadConfig().catch(err => {
            console.warn('Failed to load logging config, using defaults:', err.message);
        });

        // Log initialization (only once)
        if (this.debugMode) {
            console.log('🐛 Debug mode enabled - verbose logging active');
        } else if (!this.isDevelopment) {
            console.log('📊 HexTrackr production mode - debug logs disabled');
        }
    }

    /**
     * Load logging configuration from server
     * @returns {Promise<void>}
     */
    async loadConfig() {
        try {
            const response = await fetch('/config/logging.config.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            this.config = await response.json();
            this.configLoaded = true;
        } catch (error) {
            // Use default config if fetch fails
            this.config = this._getDefaultConfig();
            this.configLoaded = true;
        }
    }

    /**
     * Get default configuration (fallback)
     * @private
     * @returns {Object} Default config
     */
    _getDefaultConfig() {
        return {
            global: { enabled: true, emojis: true, timestamps: true, auditEnabled: true },
            frontend: {
                categories: {
                    auth: { enabled: true },
                    ui: { enabled: true },
                    vulnerability: { enabled: true },
                    ticket: { enabled: true },
                    websocket: { enabled: true },
                    import: { enabled: true },
                    database: { enabled: true }
                }
            },
            emojis: { debug: '🐛', info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅' }
        };
    }

    /**
     * Check if debug mode is enabled
     * @private
     * @returns {boolean}
     */
    _isDebugMode() {
        try {
            return localStorage.getItem('hextrackr_debug') === 'true' ||
                   sessionStorage.getItem('hextrackr_debug') === 'true';
        } catch (e) {
            return false;
        }
    }

    /**
     * Check if logging should occur for given level and category
     * @private
     * @param {string} level - Log level (debug, info, warn, error)
     * @param {string} category - Log category (auth, ui, vulnerability, etc.)
     * @returns {boolean} Whether to log
     */
    _shouldLog(level, category) {
        // If config not loaded yet, allow all logs
        if (!this.configLoaded) {
            return true;
        }

        // Check global enabled flag
        if (!this.config?.global?.enabled) {
            return false;
        }

        // Check category-specific toggle
        if (category && this.config?.frontend?.categories?.[category]) {
            return this.config.frontend.categories[category].enabled !== false;
        }

        // Default: allow if no category specified or category not found
        return true;
    }

    /**
     * Debug log - only shown in debug mode or development
     * Use for verbose debugging, performance traces, state dumps
     * @param {string} category - Log category (auth, ui, vulnerability, etc.)
     * @param {...any} args - Arguments to log
     */
    log(category, ...args) {
        // Support legacy usage without category
        if (typeof category !== 'string' || !this._shouldLog('debug', category)) {
            if (typeof category !== 'string') {
                args.unshift(category);
                category = null;
            } else {
                return; // Category disabled
            }
        }

        if (this.debugMode || this.isDevelopment) {
            console.log(...args);
        }
    }

    /**
     * Debug log - category-aware
     * @param {string} category - Log category (auth, ui, vulnerability, etc.)
     * @param {...any} args - Arguments to log
     */
    debug(category, ...args) {
        // Support legacy usage without category
        if (typeof category !== 'string' || !this._shouldLog('debug', category)) {
            if (typeof category !== 'string') {
                args.unshift(category);
                category = null;
            } else {
                return; // Category disabled
            }
        }

        if (this.debugMode || this.isDevelopment) {
            console.log(...args);
        }
    }

    /**
     * Info log - category-aware, always shown (important operational messages)
     * Use for: User actions, feature milestones, cache hits/misses
     * @param {string} category - Log category (auth, ui, vulnerability, etc.)
     * @param {...any} args - Arguments to log
     */
    info(category, ...args) {
        // Support legacy usage without category
        if (typeof category !== 'string' || !this._shouldLog('info', category)) {
            if (typeof category !== 'string') {
                args.unshift(category);
                category = null;
            } else {
                return; // Category disabled
            }
        }

        console.info(...args);
    }

    /**
     * Warning log - category-aware, always shown
     * Use for: Deprecations, fallbacks, non-critical errors
     * @param {string} category - Log category (auth, ui, vulnerability, etc.)
     * @param {...any} args - Arguments to log
     */
    warn(category, ...args) {
        // Support legacy usage without category
        if (typeof category !== 'string' || !this._shouldLog('warn', category)) {
            if (typeof category !== 'string') {
                args.unshift(category);
                category = null;
            } else {
                return; // Category disabled
            }
        }

        console.warn(...args);
    }

    /**
     * Error log - category-aware, always shown
     * Use for: Exceptions, failed API calls, critical issues
     * @param {string} category - Log category (auth, ui, vulnerability, etc.)
     * @param {...any} args - Arguments to log
     */
    error(category, ...args) {
        // Support legacy usage without category
        if (typeof category !== 'string' || !this._shouldLog('error', category)) {
            if (typeof category !== 'string') {
                args.unshift(category);
                category = null;
            } else {
                return; // Category disabled
            }
        }

        console.error(...args);
    }

    /**
     * Audit log - sends encrypted log to backend
     * @param {string} category - Audit category (user.login, ticket.delete, etc.)
     * @param {string} message - Audit message
     * @param {Object} [data] - Additional data to log
     * @returns {Promise<void>}
     */
    async audit(category, message, data = null) {
        try {
            // Check if audit logging is enabled
            if (!this.config?.global?.auditEnabled) {
                return;
            }

            // Send to backend audit endpoint
            const response = await fetch('/api/audit-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category,
                    message,
                    data
                })
            });

            if (!response.ok) {
                console.warn('Failed to write audit log:', response.statusText);
            }
        } catch (error) {
            console.warn('Audit log failed:', error.message);
        }
    }

    /**
     * Group start - only shown in debug mode
     * @param {string} label - Group label
     */
    group(label) {
        if (this.debugMode || this.isDevelopment) {
            console.group(label);
        }
    }

    /**
     * Group end - only shown in debug mode
     */
    groupEnd() {
        if (this.debugMode || this.isDevelopment) {
            console.groupEnd();
        }
    }

    /**
     * Table log - only shown in debug mode
     * @param {*} data - Data to display in table
     */
    table(data) {
        if (this.debugMode || this.isDevelopment) {
            console.table(data);
        }
    }

    /**
     * Time start - only shown in debug mode
     * @param {string} label - Timer label
     */
    time(label) {
        if (this.debugMode || this.isDevelopment) {
            console.time(label);
        }
    }

    /**
     * Time end - only shown in debug mode
     * @param {string} label - Timer label
     */
    timeEnd(label) {
        if (this.debugMode || this.isDevelopment) {
            console.timeEnd(label);
        }
    }

    /**
     * Enable debug mode programmatically
     */
    enableDebug() {
        try {
            localStorage.setItem('hextrackr_debug', 'true');
            this.debugMode = true;
            console.log('🐛 Debug mode enabled');
        } catch (e) {
            console.warn('Could not enable debug mode:', e);
        }
    }

    /**
     * Disable debug mode programmatically
     */
    disableDebug() {
        try {
            localStorage.removeItem('hextrackr_debug');
            sessionStorage.removeItem('hextrackr_debug');
            this.debugMode = false;
            console.log('📊 Debug mode disabled');
        } catch (e) {
            console.warn('Could not disable debug mode:', e);
        }
    }
}

// Create singleton instance
const logger = new Logger();

// Export for ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { logger };
}

// Global access for non-module scripts
if (typeof window !== 'undefined') {
    window.logger = logger;
}
