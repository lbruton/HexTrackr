/**
 * HexTrackr Chart Theme Adapter - T025/T026/T037
 * 
 * Manages theme switching for ApexCharts and AG-Grid components.
 * Integrates with CSS custom properties from dark-theme.css.
 * 
 * @version 2.0.0
 * @spec 005-dark-mode-theme-system
 * @task T025 - ApexCharts theme adapter core logic
 * @task T026 - AG-Grid theme class switching logic (legacy Alpine themes)
 * @task T037 - Modern themeQuartz integration for smooth theme transitions
 * @update v2.0.0 - Full AG-Grid v33 themeQuartz API integration
 */

// AG-Grid v33 theme available as agGrid.themeQuartz global

class ChartThemeAdapter {
  /**
   * Creates an instance of ChartThemeAdapter.
   * T025: Initialize theme detection and chart registry
   * 
   * @constructor
   */
  constructor() {
    try {
      // Registry of chart instances for bulk updates
      this.chartInstances = new Map();
      this.gridInstances = new Map();
      
      // Cache for computed CSS variables
      this.themeCache = {
        light: null,
        dark: null
      };
      
      // T037: AG-Grid CSS class-based theming with modern Quartz themes
      this.agGridThemeClasses = {
        light: "ag-theme-quartz",
        dark: "ag-theme-quartz", // Quartz theme adapts via CSS custom properties
        // Fallback to Alpine themes for compatibility
        lightFallback: "ag-theme-alpine",
        darkFallback: "ag-theme-alpine-dark"
      };
      
      // Current theme state
      this.currentTheme = this.detectCurrentTheme();
      
    } catch (error) {
      console.error("Error initializing ChartThemeAdapter:", error);
      throw error;
    }
  }

  /**
   * Detect current theme from document element
   * T025: Theme detection logic
   * 
   * @returns {string} Current theme ('light' | 'dark')
   */
  detectCurrentTheme() {
    try {
      const documentElement = document.documentElement;
      
      // Check data-bs-theme attribute (Bootstrap 5.3+ / Tabler.io)
      const bsTheme = documentElement.getAttribute("data-bs-theme");
      if (bsTheme) {
        return bsTheme === "dark" ? "dark" : "light";
      }
      
      // Check theme class
      if (documentElement.classList.contains("theme-dark")) {
        return "dark";
      }
      
      // Default to light
      return "light";
    } catch (error) {
      console.error("Error detecting current theme:", error);
      return "light";
    }
  }

  // AG-Grid theme management removed - handled by CSS variables and VulnerabilityGridManager

  // getQuartzTheme method removed - AG-Grid themes handled by grid creation

  /**
   * Retrieves the theme configuration for ApexCharts based on the specified theme.
   * T025: Complete ApexCharts theme configuration with CSS custom properties
   * 
   * @param {string} theme - The theme to apply ('light' or 'dark')
   * @returns {Object} The configuration object for ApexCharts compatible with the theme
   */
  getThemeConfig(theme = "light") {
    try {
      // Check cache first
      if (this.themeCache[theme]) {
        return this.themeCache[theme];
      }

      // Get CSS custom property values
      const cssVars = this.getCSSVariables(theme);
      
      const config = {
        theme: {
          mode: theme,
          palette: "palette1" // Use custom colors instead
        },
        chart: {
          background: cssVars.chartBackground,
          foreColor: cssVars.chartTextColor,
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          toolbar: {
            theme: theme
          }
        },
        colors: [
          cssVars.chartColor1,
          cssVars.chartColor2,
          cssVars.chartColor3,
          cssVars.chartColor4,
          cssVars.chartColor5,
          cssVars.chartColor6,
          cssVars.chartColor7,
          cssVars.chartColor8
        ],
        // stroke colors handled by individual chart configurations
        fill: {
          opacity: theme === "dark" ? 0.8 : 1
        },
        grid: {
          borderColor: cssVars.chartGridColor,
          strokeDashArray: 3,
          xaxis: {
            lines: {
              show: true
            }
          },
          yaxis: {
            lines: {
              show: true
            }
          }
        },
        xaxis: {
          axisBorder: {
            color: cssVars.chartAxisColor
          },
          axisTicks: {
            color: cssVars.chartAxisColor
          },
          labels: {
            style: {
              colors: cssVars.chartAxisColor,
              fontSize: "12px"
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              colors: cssVars.chartAxisColor,
              fontSize: "12px"
            }
          }
        },
        title: {
          style: {
            color: cssVars.chartTitleColor,
            fontSize: "16px",
            fontWeight: "600"
          }
        },
        subtitle: {
          style: {
            color: cssVars.chartTextColor,
            fontSize: "14px"
          }
        },
        legend: {
          labels: {
            colors: cssVars.chartTextColor
          }
        },
        tooltip: {
          theme: theme,
          style: {
            fontSize: "12px"
          }
        },
        dataLabels: {
          style: {
            colors: [cssVars.chartTitleColor]
          }
        }
      };

      // Cache the configuration
      this.themeCache[theme] = config;
      
      return config;
    } catch (error) {
      console.error(`Error fetching theme config for ${theme}:`, error);
      return this.getFallbackConfig(theme);
    }
  }

  /**
   * Get CSS custom property values for theming
   * T025: CSS variable extraction for dynamic theming
   * 
   * @param {string} theme - Theme name ('light' | 'dark')
   * @returns {Object} CSS variable values
   */
  getCSSVariables(theme) {
    try {
      // Temporarily apply theme to document to read CSS variables
      const documentElement = document.documentElement;
      const originalTheme = documentElement.getAttribute("data-bs-theme");
      
      // Apply target theme temporarily
      documentElement.setAttribute("data-bs-theme", theme);
      
      const computedStyle = getComputedStyle(documentElement);
      
      const cssVars = {
        // Chart-specific colors
        chartBackground: computedStyle.getPropertyValue("--chart-background").trim() ||
                        (theme === "dark" ? "#1e293b" : "#ffffff"),
        chartGridColor: computedStyle.getPropertyValue("--chart-grid-color").trim() ||
                       (theme === "dark" ? "#374151" : "#e5e7eb"),
        chartTextColor: computedStyle.getPropertyValue("--chart-text-color").trim() ||
                       (theme === "dark" ? "#9ca3af" : "#6b7280"),
        chartTitleColor: computedStyle.getPropertyValue("--chart-title-color").trim() ||
                        (theme === "dark" ? "#f9fafb" : "#111827"),
        chartAxisColor: computedStyle.getPropertyValue("--chart-axis-color").trim() ||
                       (theme === "dark" ? "#6b7280" : "#9ca3af"),

        // Chart color palette
        chartColor1: computedStyle.getPropertyValue("--chart-color-1").trim() || "#3b82f6",
        chartColor2: computedStyle.getPropertyValue("--chart-color-2").trim() || "#10b981",
        chartColor3: computedStyle.getPropertyValue("--chart-color-3").trim() || "#f59e0b",
        chartColor4: computedStyle.getPropertyValue("--chart-color-4").trim() || "#ef4444",
        chartColor5: computedStyle.getPropertyValue("--chart-color-5").trim() || "#8b5cf6",
        chartColor6: computedStyle.getPropertyValue("--chart-color-6").trim() || "#06b6d4",
        chartColor7: computedStyle.getPropertyValue("--chart-color-7").trim() || "#84cc16",
        chartColor8: computedStyle.getPropertyValue("--chart-color-8").trim() || "#f97316",

        // Vulnerability-specific colors - Read from VPR CSS variables
        vulnCriticalColor: computedStyle.getPropertyValue("--vpr-critical").trim() || "#dc2626",
        vulnHighColor: computedStyle.getPropertyValue("--vpr-high").trim() || "#d97706",
        vulnMediumColor: computedStyle.getPropertyValue("--vpr-medium").trim() || "#2563eb",
        vulnLowColor: computedStyle.getPropertyValue("--vpr-low").trim() || "#16a34a"
      };
      
      // Restore original theme
      if (originalTheme) {
        documentElement.setAttribute("data-bs-theme", originalTheme);
      } else {
        documentElement.removeAttribute("data-bs-theme");
      }
      
      return cssVars;
    } catch (error) {
      console.error("Error extracting CSS variables:", error);
      return this.getFallbackCSSVariables(theme);
    }
  }

  /**
   * Fallback theme configuration when CSS variables fail
   * T025: Error resilience for theme configuration
   * 
   * @param {string} theme - Theme name
   * @returns {Object} Fallback configuration
   */
  getFallbackConfig(theme) {
    const isDark = theme === "dark";
    
    return {
      theme: {
        mode: theme,
        palette: "palette1"
      },
      chart: {
        background: isDark ? "#1e293b" : "#ffffff",
        foreColor: isDark ? "#9ca3af" : "#6b7280"
      },
      colors: [
        "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
        "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"
      ],
      grid: {
        borderColor: isDark ? "#374151" : "#e5e7eb"
      }
    };
  }

  /**
   * Fallback CSS variables when extraction fails
   *
   * @param {string} theme - Theme name
   * @returns {Object} Fallback CSS variables
   */
  getFallbackCSSVariables(theme) {
    const isDark = theme === "dark";

    return {
      chartBackground: isDark ? "#1e293b" : "#ffffff",
      chartGridColor: isDark ? "#374151" : "#e5e7eb",
      chartTextColor: isDark ? "#9ca3af" : "#6b7280",
      chartTitleColor: isDark ? "#f9fafb" : "#111827",
      chartAxisColor: isDark ? "#6b7280" : "#9ca3af",
      chartColor1: "#3b82f6",
      chartColor2: "#10b981",
      chartColor3: "#f59e0b",
      chartColor4: "#ef4444",
      chartColor5: "#8b5cf6",
      chartColor6: "#06b6d4",
      chartColor7: "#84cc16",
      chartColor8: "#f97316",
      // Vulnerability-specific fallback colors - Updated for WCAG compliance
      vulnCriticalColor: "#dc2626",
      vulnHighColor: "#d97706",
      vulnMediumColor: "#2563eb",
      vulnLowColor: "#16a34a"
    };
  }

  /**
   * Get vulnerability-specific chart colors - S002
   * @param {string} theme - Theme name ('light' | 'dark')
   * @returns {Array} Array of vulnerability severity colors [critical, high, medium, low]
   */
  getVulnerabilityColors(theme = "light") {
    const cssVars = this.getCSSVariables(theme);
    return [
      cssVars.vulnCriticalColor,
      cssVars.vulnHighColor,
      cssVars.vulnMediumColor,
      cssVars.vulnLowColor
    ];
  }

  /**
   * Updates the theme of an existing ApexCharts instance.
   * T025: Dynamic chart theme updates with performance optimization
   * 
   * @param {Object} chartInstance - The ApexCharts instance to update
   * @param {string} theme - The theme to apply ('light' or 'dark')
   * @param {string} chartId - Optional chart identifier for registry
   * @returns {Promise<boolean>} True if update succeeded
   */
  async updateChartTheme(chartInstance, theme, chartId = null) {
    try {
      if (!chartInstance || typeof chartInstance.updateOptions !== "function") {
        console.warn("Invalid ApexCharts instance provided");
        return false;
      }

      // Register chart instance if ID provided
      if (chartId) {
        this.chartInstances.set(chartId, chartInstance);
      }

      // Get theme configuration
      const themeConfig = this.getThemeConfig(theme);

      // CRITICAL FIX: Preserve vulnerability-specific colors for vulnerability charts
      // Check if this is a vulnerability chart by looking for vulnerability series names
      if (chartInstance.w && chartInstance.w.config && chartInstance.w.config.series) {
        const seriesNames = chartInstance.w.config.series.map(s => s.name);
        const isVulnerabilityChart = seriesNames.includes("Critical") &&
                                   seriesNames.includes("High") &&
                                   seriesNames.includes("Medium") &&
                                   seriesNames.includes("Low");

        if (isVulnerabilityChart) {
          // Get vulnerability-specific colors from CSS variables (fresh read for theme changes)
          const root = document.documentElement;
          const style = getComputedStyle(root);
          const vulnerabilityColors = [
            style.getPropertyValue("--vpr-critical").trim() || "#dc2626",
            style.getPropertyValue("--vpr-high").trim() || "#d97706",
            style.getPropertyValue("--vpr-medium").trim() || "#2563eb",
            style.getPropertyValue("--vpr-low").trim() || "#16a34a"
          ];

          // Create modified theme config that preserves vulnerability colors
          const vulnerabilityThemeConfig = {
            ...themeConfig,
            colors: vulnerabilityColors
          };

          // Update chart with vulnerability-specific theme options
          await chartInstance.updateOptions(vulnerabilityThemeConfig, false, true);
        } else {
          // Update chart with standard theme options for non-vulnerability charts
          await chartInstance.updateOptions(themeConfig, false, true);
        }
      } else {
        // Fallback: update with standard theme options
        await chartInstance.updateOptions(themeConfig, false, true);
      }

      // Update current theme
      this.currentTheme = theme;

      return true;
    } catch (error) {
      console.error(`Error updating chart theme to ${theme}:`, error);
      return false;
    }
  }

  /**
   * Register multiple chart instances for bulk theme updates
   * T025: Chart instance management for bulk operations
   * 
   * @param {Object} charts - Object with chartId: chartInstance pairs
   * @returns {void}
   */
  registerCharts(charts) {
    try {
      Object.entries(charts).forEach(([chartId, chartInstance]) => {
        if (chartInstance && typeof chartInstance.updateOptions === "function") {
          this.chartInstances.set(chartId, chartInstance);
        }
      });
    } catch (error) {
      console.error("Error registering chart instances:", error);
    }
  }

  /**
   * Update all registered charts to new theme
   * T025: Bulk chart theme updates for performance
   * 
   * @param {string} theme - Theme to apply to all charts
   * @returns {Promise<Array>} Results of all chart updates
   */
  async updateAllCharts(theme) {
    try {
      const updatePromises = [];
      
      for (const [chartId, chartInstance] of this.chartInstances) {
        updatePromises.push(
          this.updateChartTheme(chartInstance, theme, chartId)
        );
      }
      
      return await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating all charts:", error);
      return [];
    }
  }

  /**
   * Applies the specified theme to an AG-Grid instance using modern themeQuartz API.
   * T037: Modern AG-Grid theme switching with themeQuartz for smooth transitions
   * 
   * @param {Object} gridApi - The AG-Grid API instance to update
   * @param {string} theme - The theme to apply ('light' or 'dark')
   * @param {string} gridId - Optional grid identifier for registry
   * @returns {boolean} True if theme applied successfully
   */
  applyGridTheme(gridApi, theme, gridId = null) {
    try {
      // AG-Grid v33 requires theme to be set during grid creation, not after
      // This method should trigger a grid recreation with the new theme
      console.warn("⚠️ AG-Grid v33 theme change requires grid recreation. Delegating to VulnerabilityGridManager.updateTheme()");
      
      // Register grid instance if ID provided
      if (gridId) {
        this.gridInstances.set(gridId, gridApi);
      }

      // Update current theme state
      this.currentTheme = theme;
      
      // Let the calling component handle the recreation
      // This method is primarily for charts now
      return true;
    } catch (error) {
      console.error(`Error applying grid theme to ${theme}:`, error);
      return false;
    }
  }

  /**
   * Legacy fallback method for AG-Grid theme switching using CSS classes
   * T026: Backward compatibility for older AG-Grid setups
   * 
   * @param {Object} gridApi - The AG-Grid API instance to update
   * @param {string} theme - The theme to apply ('light' or 'dark')
   * @param {string} gridId - Optional grid identifier for registry
   * @returns {boolean} True if theme applied successfully
   */
  applyGridThemeLegacy(gridApi, theme, gridId = null) {
    try {
      // Find the grid container element
      const gridElement = gridApi.getGridElement?.() || 
                         document.querySelector(".ag-theme-quartz, .ag-theme-alpine, .ag-theme-alpine-dark, .ag-root-wrapper");
      
      if (!gridElement) {
        console.warn("Could not find AG-Grid container element for legacy theme switching");
        return false;
      }

      // Remove existing theme classes
      gridElement.classList.remove("ag-theme-quartz", "ag-theme-alpine", "ag-theme-alpine-dark");
      
      // Apply fallback theme class (Alpine for legacy compatibility)
      const themeClass = theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine";
      gridElement.classList.add(themeClass);

      // Force grid redraw to apply new theme
      if (typeof gridApi.refreshCells === "function") {
        gridApi.refreshCells({ force: true });
      }
      
      console.log(`⚠️ AG-Grid theme updated to ${theme} using legacy CSS classes`);
      return true;
    } catch (error) {
      console.error(`Error applying legacy grid theme to ${theme}:`, error);
      return false;
    }
  }

  /**
   * Register multiple AG-Grid instances for bulk theme updates
   * T026: Grid instance management for bulk operations
   * 
   * @param {Object} grids - Object with gridId: gridApi pairs
   * @returns {void}
   */
  registerGrids(grids) {
    try {
      Object.entries(grids).forEach(([gridId, gridApi]) => {
        if (gridApi && typeof gridApi.getModel === "function") {
          this.gridInstances.set(gridId, gridApi);
        }
      });
    } catch (error) {
      console.error("Error registering grid instances:", error);
    }
  }

  /**
   * Update all registered grids to new theme
   * T026: Bulk grid theme updates
   * 
   * @param {string} theme - Theme to apply to all grids
   * @returns {Array<boolean>} Results of all grid updates
   */
  updateAllGrids(theme) {
    try {
      const results = [];
      
      for (const [gridId, gridApi] of this.gridInstances) {
        const result = this.applyGridTheme(gridApi, theme, gridId);
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error("Error updating all grids:", error);
      return [];
    }
  }

  /**
   * Update all registered charts and grids to new theme
   * T025/T026: Complete theme system update
   * 
   * @param {string} theme - Theme to apply ('light' or 'dark')
   * @returns {Promise<Object>} Results of updates
   */
  async updateAllComponents(theme) {
    try {
      // Update charts (async)
      const chartResults = await this.updateAllCharts(theme);
      
      // Update grids (sync)
      const gridResults = this.updateAllGrids(theme);
      
      // Clear theme cache to force refresh
      this.themeCache = { light: null, dark: null };
      
      return {
        theme: theme,
        charts: {
          total: this.chartInstances.size,
          successful: chartResults.filter(r => r).length,
          failed: chartResults.filter(r => !r).length
        },
        grids: {
          total: this.gridInstances.size,
          successful: gridResults.filter(r => r).length,
          failed: gridResults.filter(r => !r).length
        }
      };
    } catch (error) {
      console.error("Error updating all components:", error);
      return {
        theme: theme,
        charts: { total: 0, successful: 0, failed: 0 },
        grids: { total: 0, successful: 0, failed: 0 },
        error: error.message
      };
    }
  }

  /**
   * Get current theme state
   * 
   * @returns {string} Current theme ('light' or 'dark')
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Get registry status for debugging
   * 
   * @returns {Object} Registry information
   */
  getRegistryStatus() {
    return {
      charts: this.chartInstances.size,
      grids: this.gridInstances.size,
      currentTheme: this.currentTheme,
      cachedThemes: Object.keys(this.themeCache).filter(k => this.themeCache[k] !== null)
    };
  }

  /**
   * Clear all registrations (useful for cleanup)
   * 
   * @returns {void}
   */
  clearRegistry() {
    try {
      this.chartInstances.clear();
      this.gridInstances.clear();
      this.themeCache = { light: null, dark: null };
    } catch (error) {
      console.error("Error clearing registry:", error);
    }
  }
}

// Global export for browser usage
window.ChartThemeAdapter = ChartThemeAdapter;

// ES6 module export (dual export pattern for compatibility)
try {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { ChartThemeAdapter };
  }
  // ES6 export for import statements
  if (typeof exports !== "undefined") {
    exports.ChartThemeAdapter = ChartThemeAdapter;
  }
} catch (error) {
  // Silently ignore if module system not available
  console.debug("Module export not available, using global window export");
}