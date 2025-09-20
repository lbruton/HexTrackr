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
        for (const [gridId, gridInfo] of this.grids) {
            this.applyThemeToGrid(gridId, isDark);
        }

        console.log(`AGGridThemeManager updated all grids to ${this.currentTheme} theme`);
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

        // Otherwise, directly manipulate element classes
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
        } catch (e) {
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
            window.themeController.addThemeChangeListener((newTheme, source) => {
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