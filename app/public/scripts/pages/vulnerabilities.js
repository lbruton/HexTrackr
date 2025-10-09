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

        console.log("ModernVulnManager: All modules initialized via orchestrator");
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

    createTicketFromDevice(hostname) {
        return this.coreOrchestrator.createTicketFromDevice(hostname);
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
        console.log("Refreshing vulnerability data after import completion");
        window.modernVulnManager.loadData(bustCache);
    }
};

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    window.modernVulnManager = new ModernVulnManager();
    // Create global alias for HTML onclick handlers
    window.vulnManager = window.modernVulnManager;
});

// Add event listener for chart metric toggle
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("input[name=\"chart-metric\"]").forEach(radio => {
        radio.addEventListener("change", () => {
            if (window.modernVulnManager && window.modernVulnManager.chartManager) {
                window.modernVulnManager.chartManager.update();
            }
        });
    });
});

/**
 * Setup vendor toggle event listeners
 * Updates dashboard stats cards and chart when vendor filter changes
 */
function setupVendorToggle() {
    const vendorRadios = document.querySelectorAll("input[name=\"vendor-filter\"]");

    vendorRadios.forEach(radio => {
        radio.addEventListener("change", async (e) => {
            if (!e.target.checked) {return;}

            const label = document.querySelector(`label[for="${e.target.id}"]`);
            const vendor = label.dataset.vendor; // "" = All, "CISCO", "Palo Alto", "Other"

            console.log(`Vendor filter changed to: ${vendor || "All Vendors"}`);

            try {
                // Update stats cards
                await window.modernVulnManager.statisticsManager.updateStatisticsDisplay(vendor);

                // Update chart
                await window.modernVulnManager.chartManager.update(false, vendor);

            } catch (error) {
                console.error("Failed to update vendor filter:", error);
                // Error handling enhancement (loading states, toast) comes in Task 3.2
            }
        });
    });
}

// Wire up vendor toggle on page load
document.addEventListener("DOMContentLoaded", () => {
    setupVendorToggle();
});

// Handle browser back/forward cache (bfcache) restoration
// When users navigate back, browsers may restore from cache without firing DOMContentLoaded
window.addEventListener("pageshow", (event) => {
    if (event.persisted && window.modernVulnManager && window.modernVulnManager.chartManager) {
        // Page was restored from bfcache, reload charts
        console.log("Page restored from bfcache, reloading charts");
        window.modernVulnManager.chartManager.update();
    }
});
