/* eslint-env browser */
/* global console, localStorage, document, window, fetch, alert, confirm, setTimeout, bootstrap */

/**
 * HexTrackr - Vulnerabilities Management JavaScript
 * 
 * 🎯 INCREMENTAL MIGRATION TARGET
 * 
 * This file contains vulnerabilities-specific JavaScript functionality.
 * Following the modular architecture pattern established for CSS:
 * 
 * scripts/
 * ├── shared/           # Shared components (Settings modal, navigation, etc.)
 * ├── pages/           # Page-specific functionality  
 * └── utils/           # Utility functions
 * 
 * MIGRATION STRATEGY:
 * - All NEW vulnerabilities JavaScript goes directly in this file
 * - When modifying existing embedded JS, comment out in HTML and move here
 * - Migrate code organically as we work through features over time
 * - No rush - system works perfectly with embedded JS
 * 
 * Current State (2025-08-26):
 * - ~1788 lines of JavaScript embedded in vulnerabilities.html (lines 1380-3166)
 * - ModernVulnManager class and all functions currently in HTML <script> section
 * - This file now uses shared Settings modal component
 * 
 * @file vulnerabilities.js
 * @description Vulnerabilities page-specific functionality (incremental migration target)
 * @version 2.0.0
 * @author HexTrackr Development Team
 * @since 2025-08-25
 * @updated 2025-08-26 - Refactored to use shared Settings modal component
 * 
 * Dependencies (loaded via HTML):
 * - Tabler.io CSS Framework
 * - AG Grid Community Edition  
 * - ApexCharts for trending visualization
 * - PapaParse for CSV processing
 * - SortableJS for drag-and-drop
 * - Bootstrap 5 for modals and components
 * - scripts/shared/settings-modal.js (shared Settings modal component)
 * 
 * @example
 * // This file will incrementally receive migrated code:
 * // - ModernVulnManager class
 * // - All vulnerability management functions
 * // - CSV import/export functionality
 * // - Device management functions
 * // - Chart and grid initialization
 * 
 * @todo Incrementally migrate JavaScript from vulnerabilities.html
 * @todo Add proper JSDoc documentation for all migrated functions
 * @todo Maintain backward compatibility during migration
 */

// 🚧 MIGRATION IN PROGRESS
// This file is now properly loaded by vulnerabilities.html and ready for incremental migration
// All new vulnerabilities features should be added directly to this file

console.log("✅ vulnerabilities.js loaded successfully - ready for incremental migration");

// 📋 INCREMENTAL MIGRATION AREAS:
// □ ModernVulnManager class (~1788 lines in HTML)
// □ Event listeners setup  
// □ AG Grid initialization
// □ ApexCharts configuration
// □ CSV import/export functions
// □ Device management functions
// □ Modal handlers
// □ API communication functions
// □ Utility functions

// 🎯 PAGE-SPECIFIC INTEGRATION FOR SHARED SETTINGS MODAL

/**
 * Page-specific refresh function for Settings modal integration
 * Called by shared Settings modal when data operations complete
 * @param {string} type - Type of data refreshed ('vulnerabilities', 'tickets', 'all')
 */
window.refreshPageData = function(type) {
    if (type === "vulnerabilities" && window.gridApi) {
        // Refresh AG Grid when vulnerability data changes
        console.log("Refreshing vulnerabilities grid after data operation");
        // TODO: Implement proper grid refresh when migration is complete
        // window.gridApi.refreshServerSideStore();
    }
};

/**
 * Page-specific toast integration for Settings modal
 * @param {string} message - Message to display
 * @param {string} type - Toast type ('success', 'warning', 'danger', 'info')
 */
window.showToast = function(message, type) {
    // This will use the existing toast system from embedded HTML for now
    // TODO: Implement proper toast system during migration
    console.log(`Toast (${type}): ${message}`);
    alert(`${type.toUpperCase()}: ${message}`);
};

// 🎯 READY FOR INCREMENTAL MIGRATION
// This file is now properly loaded by vulnerabilities.html with Settings modal support

console.log("✅ vulnerabilities.js loaded successfully");
// New vulnerabilities functionality should be added here as we migrate from embedded HTML
// All JavaScript code from HTML will be migrated here incrementally as we work on features
