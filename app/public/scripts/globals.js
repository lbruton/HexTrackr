/**
 * @fileoverview Global Variable Declarations for HexTrackr Application
 *
 * This file serves as a centralized location for declaring all global variables
 * used throughout the HexTrackr application. This is necessary for proper ESLint
 * configuration and to prevent "used before defined" errors in the browser environment.
 *
 * By declaring these globals in one place, we:
 * - Inform ESLint that these variables are available globally
 * - Document which third-party libraries are used across the application
 * - Provide a single source of truth for all external dependencies
 * - Enable proper linting without false "undefined variable" warnings
 *
 * @version 1.0.0
 * @author HexTrackr Development Team
 * @since 2025-08-24
 * @updated 2025-09-21 - Added comprehensive JSDoc documentation
 */

// ESLint Configuration
/* eslint-disable no-unused-vars */

/**
 * Core Browser API Globals
 * These are standard browser APIs available in all modern browsers
 * @namespace BrowserAPIs
 */
const BROWSER_GLOBALS = [
    "window",           // Browser window object - main application container
    "document",         // DOM manipulation and element access
    "localStorage",     // Persistent client-side storage
    "sessionStorage",   // Session-based client-side storage
    "fetch",           // Modern AJAX/fetch API for HTTP requests
    "console",         // Browser console for debugging and logging
    "setTimeout",      // Timer functions for delayed execution
    "clearTimeout",    // Clear delayed execution timers
    "setInterval",     // Interval timers for repeated execution
    "clearInterval",   // Clear interval timers
    "alert",           // Browser alert dialogs
    "confirm",         // Browser confirmation dialogs
    "prompt",          // Browser input prompts
    "btoa",            // Base64 encoding
    "atob",            // Base64 decoding
    "URL",             // URL manipulation utilities
    "Blob",            // Binary data objects
    "File",            // File objects for file uploads
    "FileReader",      // File reading utilities
    "FormData",        // Form data handling for HTTP requests
    "location",        // Browser location/URL information
    "history",         // Browser history manipulation
    "navigator",       // Browser and system information
    "XMLHttpRequest"   // Legacy AJAX API (for compatibility)
];

/**
 * Third-Party Library Globals
 * These are external libraries loaded via CDN or script tags
 * @namespace ThirdPartyLibs
 */
const LIBRARY_GLOBALS = [
    "bootstrap",       // Bootstrap 5 - UI components and utilities
    "Papa",           // Papa Parse - CSV parsing and generation
    "agGrid",         // AG Grid - Advanced data grid component
    "ApexCharts",     // ApexCharts - Chart and visualization library
    "DOMPurify",      // DOMPurify - HTML sanitization for XSS prevention
    "jsPDF",          // jsPDF - PDF generation library
    "html2canvas"     // html2canvas - HTML to canvas conversion
];

/**
 * Global Variable Declarations
 *
 * The following globals are declared to inform ESLint of their availability
 * in the browser environment. These variables are used throughout the HexTrackr
 * application for various purposes:
 *
 * Browser APIs:
 * - window: Main application container and global scope
 * - document: DOM manipulation and element queries
 * - localStorage/sessionStorage: Client-side data persistence
 * - fetch: HTTP requests to backend API
 * - console: Debugging and error logging
 * - Timer functions: setTimeout, setInterval for async operations
 * - Dialog functions: alert, confirm, prompt for user interaction
 * - Encoding utilities: btoa/atob for base64 operations
 * - File APIs: Blob, File, FileReader, FormData for file operations
 * - Navigation: location, history for URL and routing management
 *
 * Third-Party Libraries:
 * - bootstrap: UI components, modals, tooltips, etc.
 * - Papa: CSV import/export functionality
 * - agGrid: Advanced data tables and grids
 * - ApexCharts: Data visualization and charts
 * - DOMPurify: HTML sanitization for security
 * - jsPDF: PDF export functionality
 * - html2canvas: Screenshot and export features
 *
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API|MDN Web APIs}
 * @see {@link https://getbootstrap.com/|Bootstrap Documentation}
 * @see {@link https://www.papaparse.com/|Papa Parse Documentation}
 * @see {@link https://www.ag-grid.com/|AG Grid Documentation}
 * @see {@link https://apexcharts.com/|ApexCharts Documentation}
 * @see {@link https://github.com/cure53/DOMPurify|DOMPurify Documentation}
 */

// Declare all globals to ESLint
/* global window document localStorage sessionStorage fetch console setTimeout clearTimeout setInterval clearInterval alert confirm prompt btoa atob URL Blob File FileReader FormData location history navigator XMLHttpRequest */
/* global bootstrap Papa agGrid ApexCharts DOMPurify jsPDF html2canvas */

/**
 * Global Constants and Configuration
 * Additional global constants used throughout the application
 * @namespace GlobalConstants
 */
const GLOBAL_CONSTANTS = {
    // API Configuration
    API_BASE_URL: window.location.origin + "/api",

    // Application Configuration
    APP_NAME: "HexTrackr",
    APP_VERSION: "2.0.0",

    // UI Configuration
    THEME_STORAGE_KEY: "theme",
    PAGINATION_DEFAULT_SIZE: 12,

    // Security Configuration
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_FILE_TYPES: ["text/csv", "application/vnd.ms-excel"],

    // Timing Configuration
    DEBOUNCE_DELAY: 300, // milliseconds
    TOAST_DURATION: 5000, // milliseconds

    // Grid Configuration
    GRID_DEFAULT_PAGE_SIZE: 50,
    GRID_MAX_PAGE_SIZE: 1000
};

/**
 * Utility Functions Available Globally
 * Common utility functions that may be used across modules
 * @namespace GlobalUtils
 */
const GLOBAL_UTILS = {
    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Format file size for display
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size string
     */
    formatFileSize: function(bytes) {
        if (bytes === 0) {return "0 Bytes";}
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },

    /**
     * Generate a random ID string
     * @param {number} length - Length of the ID
     * @returns {string} Random ID string
     */
    generateId: function(length = 8) {
        return Math.random().toString(36).substring(2, length + 2);
    }
};
