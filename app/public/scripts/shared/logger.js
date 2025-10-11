/**
 * Centralized Logging Utility for HexTrackr
 *
 * Controls console logging based on environment and debug flags.
 * In production, console.log calls are silently dropped (zero CPU cost).
 *
 * Usage:
 *   import { logger } from './logger.js';
 *   logger.log('User clicked button');    // Only in debug mode
 *   logger.info('Data loaded');            // Always shown
 *   logger.warn('Cache miss');             // Always shown
 *   logger.error('API failed', error);     // Always shown
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

        // Log initialization (only once)
        if (this.debugMode) {
            console.log('🐛 Debug mode enabled - verbose logging active');
        } else if (!this.isDevelopment) {
            console.log('📊 HexTrackr production mode - debug logs disabled');
        }
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
     * Debug log - only shown in debug mode or development
     * Use for verbose debugging, performance traces, state dumps
     * @param {...any} args - Arguments to log
     */
    log(...args) {
        if (this.debugMode || this.isDevelopment) {
            console.log(...args);
        }
    }

    /**
     * Debug log - alias for log()
     * @param {...any} args - Arguments to log
     */
    debug(...args) {
        if (this.debugMode || this.isDevelopment) {
            console.log(...args);
        }
    }

    /**
     * Info log - always shown (important operational messages)
     * Use for: User actions, feature milestones, cache hits/misses
     * @param {...any} args - Arguments to log
     */
    info(...args) {
        console.info(...args);
    }

    /**
     * Warning log - always shown
     * Use for: Deprecations, fallbacks, non-critical errors
     * @param {...any} args - Arguments to log
     */
    warn(...args) {
        console.warn(...args);
    }

    /**
     * Error log - always shown
     * Use for: Exceptions, failed API calls, critical issues
     * @param {...any} args - Arguments to log
     */
    error(...args) {
        console.error(...args);
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
