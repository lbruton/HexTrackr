// eslint-disable-file
/* eslint-env browser, es6 */
/* global window */

// Import ES6 modules - converted to global references for browser compatibility
// import { VulnerabilityCoreOrchestrator } from '../shared/vulnerability-core.js'; // Changed to global reference
 

/**
 * @fileoverview
 * ModernVulnManager - Minimal bootstrap wrapper for HexTrackr vulnerability management
 * This class now serves as a thin initialization layer that coordinates the modular architecture.
 * All major functionality has been extracted into specialized modules:
 * - VulnerabilityDataManager: Data fetching, processing, caching
 * - VulnerabilityStatisticsManager: Metric calculations, trend analysis
 * - VulnerabilityChartManager: ApexCharts visualization
 * - VulnerabilitySearchManager: Search, filtering, CVE lookups
 * - VulnerabilityGridManager: AG Grid operations
 * - VulnerabilityCardsManager: Card-based views with pagination
 * - VulnerabilityCoreOrchestrator: Inter-module coordination
 *
 * @version 2.0.0 - Modularized Architecture
 * @author HexTrackr Team
 * @date 2025-09-08
 *
 * @note ES6 Module Dependency: This file uses export class syntax for proper module
 * functionality. ESLint configuration (eslint.config.mjs) has been updated to handle
 * ES6 modules with sourceType: "module" for vulnerability management files.
 */

/**
 * Modern Vulnerability Management System - Bootstrap Wrapper
 * Initializes and coordinates all extracted modules via the core orchestrator
 */
export class ModernVulnManager {
    constructor() {
        this.initializeModules();
    }

    /**
     * Initialize all modules via the orchestrator (single initialization point)
     */
    async initializeModules() {
        // Initialize core orchestrator - it will create and coordinate all modules
        this.coreOrchestrator = new window.VulnerabilityCoreOrchestrator();
        
        // Let orchestrator handle all module creation and wiring
        await this.coreOrchestrator.initializeAllModules(this);
        
        // Get references to modules from orchestrator for delegation
        this.dataManager = this.coreOrchestrator.dataManager;
        this.statisticsManager = this.coreOrchestrator.statisticsManager;
        this.chartManager = this.coreOrchestrator.chartManager;
        this.searchManager = this.coreOrchestrator.searchManager;
        this.gridManager = this.coreOrchestrator.gridManager;
        this.cardsManager = this.coreOrchestrator.cardsManager;

        // Expose gridOptions for debugging and theme validation
        this.gridOptions = this.gridManager ? this.gridManager.gridOptions : null;

        logger.info("ui", "ModernVulnManager: All modules initialized via orchestrator");
    }

    // Delegate all public methods to the orchestrator
    switchView(view) {
        return this.coreOrchestrator.switchView(view);
    }

    async loadData(bustCache = false, options = {}) {
        return this.coreOrchestrator.loadData(bustCache, options);
    }

    viewDeviceDetails(hostname) {
        return this.coreOrchestrator.viewDeviceDetails(hostname);
    }

    viewVulnerabilityDetails(vulnDataId) {
        return this.coreOrchestrator.viewVulnerabilityDetails(vulnDataId);
    }

    async lookupVulnerability(vulnId, pluginName = null) {
        return this.coreOrchestrator.lookupVulnerability(vulnId, pluginName);
    }

    showVulnerabilityDetailsByCVE(cveId) {
        return this.coreOrchestrator.showVulnerabilityDetailsByCVE(cveId);
    }

    exportVulnerabilityReport() {
        return this.coreOrchestrator.exportVulnerabilityReport();
    }

    generateDevicePDF(hostname) {
        return this.coreOrchestrator.generateDevicePDF(hostname);
    }

    generateVulnerabilityPDF() {
        return this.coreOrchestrator.generateVulnerabilityPDF();
    }

    createTicketFromDevice(hostname, options = null) {
        return this.coreOrchestrator.createTicketFromDevice(hostname, options);
    }

    showToast(message, type) {
        return this.coreOrchestrator.showToast(message, type);
    }

    flipStatCards() {
        return this.coreOrchestrator.flipStatCards();
    }
}

// Page-specific refresh function for Settings modal and Progress modal integration
window.refreshPageData = function(type, bustCache = false) {
    if (type === "vulnerabilities" && bustCache === false) {
        bustCache = true;
    }
    if (type === "vulnerabilities" && window.modernVulnManager) {
        logger.info("ui", "Refreshing vulnerability data after import completion");
        window.modernVulnManager.loadData(bustCache);
    }
};

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    window.modernVulnManager = new ModernVulnManager();
    // Create global alias for HTML onclick handlers
    window.vulnManager = window.modernVulnManager;
    
    // Handle URL search parameter (e.g., ?search=LOCATION from tickets page)
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get("search");
    if (searchTerm) {
        // Wait for search box to be available, then fill and trigger search
        setTimeout(() => {
            const searchBox = document.getElementById("searchInput");
            if (searchBox) {
                searchBox.value = searchTerm;
                // Trigger input event to activate search
                searchBox.dispatchEvent(new Event("input", { bubbles: true }));
                // Clean up URL without page reload
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }, 500);
    }
});

/**
 * Get currently selected vendor from radio buttons
 * @returns {string} Current vendor ("", "CISCO", "Palo Alto", or "Other")
 */
function getCurrentVendor() {
    const checkedRadio = document.querySelector("input[name=\"vendor-filter\"]:checked");
    if (!checkedRadio) {return "";} // Default to "All Vendors"

    const label = document.querySelector(`label[for="${checkedRadio.id}"]`);
    return label ? (label.dataset.vendor || "") : "";
}

// Add event listener for chart metric toggle
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("input[name=\"chart-metric\"]").forEach(radio => {
        radio.addEventListener("change", () => {
            if (window.modernVulnManager && window.modernVulnManager.chartManager) {
                // Get current vendor selection and pass it to chart update
                const vendor = getCurrentVendor();
                window.modernVulnManager.chartManager.update(false, vendor);
            }
        });
    });
});

/**
 * Setup vendor toggle event listeners
 * HEX-310: Radio buttons now control ALL vendor filtering (charts + workspace)
 * Vendor dropdown removed - radio buttons are the single source of truth
 */
function setupVendorToggle() {
    const vendorRadios = document.querySelectorAll("input[name=\"vendor-filter\"]");

    vendorRadios.forEach(radio => {
        radio.addEventListener("change", async (e) => {
            if (!e.target.checked) {return;}

            const label = document.querySelector(`label[for="${e.target.id}"]`);
            const vendor = label.dataset.vendor; // "" = All, "CISCO", "Palo Alto", "Other"

            logger.debug("ui", `Vendor filter changed to: ${vendor || "All Vendors"}`);

            try {
                // Update stats cards
                await window.modernVulnManager.statisticsManager.updateStatisticsDisplay(vendor);

                // Update chart
                await window.modernVulnManager.chartManager.update(false, vendor);

                // Workspace filtering (grid, cards) handled by VulnerabilitySearchManager
                // which listens to global vendor state and updates automatically

            } catch (error) {
                logger.error("ui", "Failed to update vendor filter:", { error: error.message });
            }
        });
    });
}

// Wire up vendor toggle on page load
// HEX-310: Vendor dropdown removed - radio buttons are now the sole vendor filter control
document.addEventListener("DOMContentLoaded", () => {
    setupVendorToggle();
});

// Handle browser back/forward cache (bfcache) restoration
// When users navigate back, browsers may restore from cache without firing DOMContentLoaded
window.addEventListener("pageshow", (event) => {
    if (event.persisted && window.modernVulnManager && window.modernVulnManager.chartManager) {
        // Page was restored from bfcache, reload charts with current vendor selection
        logger.debug("ui", "Page restored from bfcache, reloading charts");
        const vendor = getCurrentVendor();
        window.modernVulnManager.chartManager.update(false, vendor);
    }
});
