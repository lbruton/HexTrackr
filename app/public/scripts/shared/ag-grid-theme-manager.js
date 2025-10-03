/**
 * @fileoverview Centralized AG-Grid theme management singleton
 * @description Manages theme updates for all AG-Grid instances in HexTrackr
 * @version 1.0.0
 */

/**
 * Centralized theme manager for all AG-Grid instances
 * Singleton pattern to ensure single source of truth for theme management
 */
class AGGridThemeManager {
    constructor() {
        // Map of grid ID to grid info
        this.grids = new Map();
        this.currentTheme = "light";
        this.initialized = false;
    }

    /**
     * Initialize the theme manager
     */
    initialize() {
        if (this.initialized) {
            return;
        }

        // Detect initial theme
        this.currentTheme = this.detectCurrentTheme();

        // Setup global theme listener
        this.setupGlobalThemeListener();

        this.initialized = true;
        console.log("AGGridThemeManager initialized with theme:", this.currentTheme);
    }

    /**
     * Register a grid with the manager
     * @param {string} gridId - Unique identifier for the grid
     * @param {Object} gridApi - AG-Grid API instance (optional)
     * @param {HTMLElement|Object} gridElement - Grid container element or adapter
     */
    registerGrid(gridId, gridApi, gridElement) {
        if (this.grids.has(gridId)) {
            console.warn(`Grid ${gridId} already registered, updating registration`);
        }

        const gridInfo = {
            id: gridId,
            api: gridApi || null,
            element: gridElement || null,
            adapter: null
        };

        // Check if gridElement is actually a theme adapter
        if (gridElement && typeof gridElement.applyTheme === "function") {
            gridInfo.adapter = gridElement;
            gridInfo.element = document.getElementById(gridId);
        }

        this.grids.set(gridId, gridInfo);

        // Apply current theme to newly registered grid
        this.applyThemeToGrid(gridId, this.currentTheme === "dark");

        console.log(`Grid ${gridId} registered with AGGridThemeManager`);
    }

    /**
     * Unregister a grid from the manager
     * @param {string} gridId - Grid identifier to remove
     */
    unregisterGrid(gridId) {
        if (this.grids.has(gridId)) {
            this.grids.delete(gridId);
            console.log(`Grid ${gridId} unregistered from AGGridThemeManager`);
        }
    }

    /**
     * Update theme for all registered grids
     * @param {boolean} isDark - Whether to apply dark theme
     */
    updateTheme(isDark) {
        this.currentTheme = isDark ? "dark" : "light";

        // Update all registered grids
        for (const [gridId, _gridInfo] of this.grids) {
            this.applyThemeToGrid(gridId, isDark);
        }

        console.log(`AGGridThemeManager updated all grids to ${this.currentTheme} theme`);
    }

    /**
     * Get the current theme configuration for AG-Grid
     * @returns {Object} The configured AG-Grid theme object
     */
    getCurrentTheme() {
        const isDark = this.currentTheme === "dark";

        if (!window.agGrid || !window.agGrid.themeQuartz) {
            return null;
        }

        if (isDark) {
            // Return dark theme configuration
            return window.agGrid.themeQuartz.withParams({
                backgroundColor: "#0F1C31",
                foregroundColor: "#FFF",
                browserColorScheme: "dark",
                chromeBackgroundColor: "#202c3f",
                headerBackgroundColor: "#202c3f",
                headerTextColor: "#FFF",
                headerFontSize: 14,
                oddRowBackgroundColor: "rgba(255, 255, 255, 0.02)",
                rowBorder: false,
                headerRowBorder: false,
                columnBorder: false,
                borderColor: "#2a3f5f",
                selectedRowBackgroundColor: "#2563eb",
                rowHoverColor: "rgba(37, 99, 235, 0.15)",
                rangeSelectionBackgroundColor: "rgba(37, 99, 235, 0.2)"
            });
        } else {
            // Return light theme configuration
            return window.agGrid.themeQuartz.withParams({
                backgroundColor: "#ffffff",
                foregroundColor: "#2d3748",
                chromeBackgroundColor: "#f7fafc",
                headerBackgroundColor: "#edf2f7",
                headerTextColor: "#2d3748",
                oddRowBackgroundColor: "rgba(0, 0, 0, 0.02)",
                rowBorder: false,
                headerRowBorder: false,
                columnBorder: false,
                borderColor: "#e2e8f0",
                selectedRowBackgroundColor: "#3182ce",
                rowHoverColor: "rgba(49, 130, 206, 0.1)",
                rangeSelectionBackgroundColor: "rgba(49, 130, 206, 0.2)"
            });
        }
    }

    /**
     * Apply theme to specific grid
     * @param {string} gridId - Grid identifier
     * @param {boolean} isDark - Whether to apply dark theme
     */
    applyThemeToGrid(gridId, isDark) {
        const gridInfo = this.grids.get(gridId);
        if (!gridInfo) {
            console.warn(`Grid ${gridId} not found in registry`);
            return;
        }

        // If grid has a theme adapter, use it
        if (gridInfo.adapter && typeof gridInfo.adapter.applyTheme === "function") {
            gridInfo.adapter.applyTheme(isDark);
            return;
        }

        // Update the grid's theme object with custom Quartz parameters
        if (gridInfo.api && window.agGrid && window.agGrid.themeQuartz) {
            let quartzTheme = null;

            if (isDark) {
                // Apply custom navy dark theme with EXACT colors
                quartzTheme = window.agGrid.themeQuartz.withParams({
                    backgroundColor: "#0F1C31", // Dark navy background - EXACT
                    foregroundColor: "#FFF", // Pure white text for better contrast
                    browserColorScheme: "dark",
                    chromeBackgroundColor: "#202c3f", // EXACT header color (no mixing)
                    headerBackgroundColor: "#202c3f", // EXACT header color you specified
                    headerTextColor: "#FFF",
                    headerFontSize: 14,
                    oddRowBackgroundColor: "rgba(255, 255, 255, 0.02)",
                    rowBorder: false,
                    headerRowBorder: false,
                    columnBorder: false,
                    borderColor: "#2a3f5f", // Subtle navy border
                    selectedRowBackgroundColor: "#2563eb", // Bright blue for selection
                    rowHoverColor: "rgba(37, 99, 235, 0.15)", // Blue hover effect
                    rangeSelectionBackgroundColor: "rgba(37, 99, 235, 0.2)"
                });
            } else {
                // Light mode Quartz theme
                quartzTheme = window.agGrid.themeQuartz.withParams({
                    backgroundColor: "#ffffff",
                    foregroundColor: "#2d3748",
                    chromeBackgroundColor: "#f7fafc",
                    headerBackgroundColor: "#edf2f7",
                    headerTextColor: "#2d3748",
                    oddRowBackgroundColor: "rgba(0, 0, 0, 0.02)",
                    rowBorder: false,
                    headerRowBorder: false,
                    columnBorder: false,
                    borderColor: "#e2e8f0",
                    selectedRowBackgroundColor: "#3182ce",
                    rowHoverColor: "rgba(49, 130, 206, 0.1)",
                    rangeSelectionBackgroundColor: "rgba(49, 130, 206, 0.2)"
                });
            }

            // Apply the theme to the grid
            gridInfo.api.setGridOption("theme", quartzTheme);
        }

        // Also update element classes for CSS fallback
        const element = gridInfo.element || document.getElementById(gridId);
        if (element) {
            element.classList.remove("ag-theme-quartz", "ag-theme-quartz-dark");
            element.classList.add(isDark ? "ag-theme-quartz-dark" : "ag-theme-quartz");
        }

        // If grid API is available and has refresh method, refresh the grid
        if (gridInfo.api && typeof gridInfo.api.refreshCells === "function") {
            gridInfo.api.refreshCells({ force: true });
        }
    }

    /**
     * Detect current theme from document
     * @returns {string} Current theme ('light' or 'dark')
     */
    detectCurrentTheme() {
        // Check Bootstrap theme attribute
        const bsTheme = document.documentElement.getAttribute("data-bs-theme");
        if (bsTheme === "dark") {
            return "dark";
        }

        // Check localStorage for stored preference
        try {
            const storedTheme = localStorage.getItem("theme");
            if (storedTheme === "dark") {
                return "dark";
            }
        } catch (_e) {
            // localStorage might not be available
        }

        // Default to light
        return "light";
    }

    /**
     * Setup global theme change listener
     */
    setupGlobalThemeListener() {
        // Listen to HexTrackr's theme controller if available
        if (window.themeController) {
            window.themeController.addThemeChangeListener((newTheme, _source) => {
                this.updateTheme(newTheme === "dark");
            });
        }

        // Also observe Bootstrap theme attribute changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" &&
                    mutation.attributeName === "data-bs-theme") {
                    const isDark = document.documentElement.getAttribute("data-bs-theme") === "dark";
                    this.updateTheme(isDark);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-bs-theme"]
        });
    }

    /**
     * Get list of registered grids
     * @returns {Array} Array of grid IDs
     */
    getRegisteredGrids() {
        return Array.from(this.grids.keys());
    }

    /**
     * Cleanup and destroy manager
     */
    destroy() {
        this.grids.clear();
        this.initialized = false;
        console.log("AGGridThemeManager destroyed");
    }
}

// Create singleton instance
const agGridThemeManager = new AGGridThemeManager();

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        agGridThemeManager.initialize();
    });
} else {
    agGridThemeManager.initialize();
}

// Expose globally for other modules
window.agGridThemeManager = agGridThemeManager;