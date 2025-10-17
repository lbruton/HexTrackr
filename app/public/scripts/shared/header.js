/**
 * HexTrackr Header Theme Management - T023
 * 
 * Integrates theme toggle functionality with the shared header component.
 * Works with ThemeController to provide user-facing theme switching.
 * 
 * @version 1.0.0
 * @date 2025-09-12
 * @spec 005-dark-mode-theme-system
 * @task T023 - Theme toggle UI button in header navigation
 */

import { ThemeController } from "./theme-controller.js";

/**
 * Header Theme Manager - manages theme toggle UI in navigation header
 * 
 * @class HeaderThemeManager  
 */
export class HeaderThemeManager {
  /**
   * Initialize header theme management
   * 
   * @constructor
   */
  constructor() {
    this.themeController = new ThemeController();
    this.darkToggle = null;
    this.lightToggle = null;
    this.initialized = false;
    
    // Expose theme controller globally for cross-module access - T028
    window.themeController = this.themeController;

    // HEX-138: Add database sync listener for theme changes
    this.themeController.addThemeChangeListener((newTheme, source) => {
      // Sync to database in background (debounced)
      if (window.preferencesSync && source === "user") {
        window.preferencesSync.syncTheme(newTheme);
      }
    });
  }

  /**
   * Initialize theme toggles after DOM is loaded
   * T023: Theme toggle UI button integration
   * 
   * @returns {void}
   */
  init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.initializeToggles());
      } else {
        this.initializeToggles();
      }
    } catch (error) {
      logger.error("ui", "Error initializing header theme manager:", error);
    }
  }

  /**
   * Initialize theme toggle elements and event listeners
   * 
   * @returns {void}
   */
  initializeToggles() {
    try {
      // Find theme toggle elements in the header
      this.darkToggle = document.querySelector(".hide-theme-dark");
      this.lightToggle = document.querySelector(".hide-theme-light");

      if (!this.darkToggle || !this.lightToggle) {
        logger.warn("ui", "Theme toggle elements not found in header");
        return;
      }

      // Add click event listeners
      this.darkToggle.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleToDark();
      });

      this.lightToggle.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleToLight();
      });

      // Add theme change listener to update visibility
      this.themeController.addThemeChangeListener((newTheme, _source) => {
        this.updateToggleVisibility(newTheme);
        // Redraw the grid to apply theme changes
        if (window.modernVulnManager && window.modernVulnManager.gridManager) {
          window.modernVulnManager.gridManager.forceGridRedraw();
        }
        // Update the chart theme
        if (window.modernVulnManager && window.modernVulnManager.chartManager) {
          window.modernVulnManager.chartManager.updateTheme(newTheme);
        }
      });

      // Set initial theme and visibility
      this.applyInitialTheme();
      
      this.initialized = true;
    } catch (error) {
      logger.error("ui", "Error initializing theme toggles:", error);
    }
  }

  /**
   * Apply initial theme on page load
   * 
   * @returns {void}
   */
  applyInitialTheme() {
    try {
      const currentTheme = this.themeController.getTheme();
      
      // Apply theme and update visibility (no system preference resolution needed)
      this.themeController.setTheme(currentTheme, "initial");
      this.updateToggleVisibility(currentTheme);
    } catch (error) {
      logger.error("ui", "Error applying initial theme:", error);
    }
  }

  /**
   * Toggle to dark theme
   * 
   * @returns {void}
   */
  toggleToDark() {
    try {
      const success = this.themeController.setTheme("dark", "user");
      if (success) {
        this.updateToggleVisibility("dark");
      }
    } catch (error) {
      logger.error("ui", "Error toggling to dark theme:", error);
    }
  }

  /**
   * Toggle to light theme
   * 
   * @returns {void}
   */
  toggleToLight() {
    try {
      const success = this.themeController.setTheme("light", "user");
      if (success) {
        this.updateToggleVisibility("light");
      }
    } catch (error) {
      logger.error("ui", "Error toggling to light theme:", error);
    }
  }

  /**
   * Update theme toggle visibility based on current theme
   * T023: Show/hide appropriate toggle buttons
   * 
   * @param {string} currentTheme - Current active theme ('light' | 'dark')
   * @returns {void}
   */
  updateToggleVisibility(currentTheme) {
    try {
      if (!this.darkToggle || !this.lightToggle) {
        return;
      }

      if (currentTheme === "dark") {
        // In dark mode: hide dark toggle, show light toggle
        this.darkToggle.style.display = "none";
        this.lightToggle.style.display = "block";
      } else {
        // In light mode: show dark toggle, hide light toggle  
        this.darkToggle.style.display = "block";
        this.lightToggle.style.display = "none";
      }
    } catch (error) {
      logger.error("ui", "Error updating toggle visibility:", error);
    }
  }

  /**
   * Get current theme controller instance
   * 
   * @returns {ThemeController} The theme controller instance
   */
  getThemeController() {
    return this.themeController;
  }

  /**
   * Check if header theme manager is initialized
   * 
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return this.initialized;
  }
}

/**
 * Auto-initialize header theme management when module loads
 * This ensures theme toggles work on all pages that include this script
 */
const headerThemeManager = new HeaderThemeManager();
headerThemeManager.init();

// Export for manual access if needed
export default headerThemeManager;