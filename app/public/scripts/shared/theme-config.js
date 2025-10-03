/**
 * @fileoverview Centralized Theme Configuration for HexTrackr
 * @description Single source of truth for all theme-related parameters across the application
 * @version 1.0.0
 * @since 2025-09-20
 *
 * This module provides centralized theme configuration to ensure consistency across:
 * - CSS custom properties
 * - AG-Grid Quartz themes
 * - ApexCharts themes
 * - Component-specific themes
 */

/**
 * Core color palette used throughout the application
 */
const COLOR_PALETTE = {
    // Primary brand colors
    primary: {
        light: "#206bc4",
        dark: "#2563eb"
    },

    // Navy theme colors for dark mode (from AG-Grid theme builder)
    navy: {
        background: "#0F1C31",      // Dark navy background
        backgroundAlt: "#1a2744",   // Slightly lighter navy
        surface1: "#1e293b",        // Cards and surfaces
        surface2: "#2a3f5f",        // Elevated surfaces
        border: "#2a3f5f",          // Subtle navy border
        text: "#FFFFFF",            // Pure white text
        textMuted: "#94a3b8"        // Muted text
    },

    // Light theme colors
    light: {
        background: "#ffffff",
        backgroundAlt: "#f7fafc",
        surface1: "#ffffff",
        surface2: "#f8f9fa",
        border: "#e2e8f0",
        text: "#2d3748",
        textMuted: "#718096"
    },

    // Semantic colors (same for both themes)
    semantic: {
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",
        info: "#2563eb"
    },

    // VPR severity colors
    vpr: {
        critical: "#dc2626",
        high: "#d97706",
        medium: "#2563eb",
        low: "#16a34a"
    },

    // Interactive states
    interactive: {
        hover: "rgba(37, 99, 235, 0.15)",
        selected: "#2563eb",
        focus: "rgba(37, 99, 235, 0.2)"
    }
};

/**
 * Typography configuration
 */
const TYPOGRAPHY = {
    fontFamily: {
        base: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace"
    },
    fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem"
    },
    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
    }
};

/**
 * Spacing scale
 */
const SPACING = {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
};

/**
 * Shadow definitions
 */
const SHADOWS = {
    light: {
        sm: "0 1px 3px rgba(0, 0, 0, 0.1)",
        md: "0 4px 12px rgba(0, 0, 0, 0.15)",
        lg: "0 8px 24px rgba(0, 0, 0, 0.2)",
        xl: "0 12px 48px rgba(0, 0, 0, 0.25)"
    },
    dark: {
        sm: "0 1px 3px rgba(0, 0, 0, 0.3)",
        md: "0 4px 12px rgba(0, 0, 0, 0.4)",
        lg: "0 8px 24px rgba(0, 0, 0, 0.5)",
        xl: "0 12px 48px rgba(0, 0, 0, 0.6)"
    }
};

/**
 * AG-Grid Quartz theme configuration
 */
const AG_GRID_THEMES = {
    light: {
        backgroundColor: "#ffffff",
        foregroundColor: "#2d3748",
        chromeBackgroundColor: "#f7fafc",
        headerBackgroundColor: "#edf2f7",
        headerTextColor: "#2d3748",
        headerFontSize: 14,
        oddRowBackgroundColor: "rgba(0, 0, 0, 0.02)",
        rowBorder: false,
        headerRowBorder: false,
        columnBorder: false,
        borderColor: "#e2e8f0",
        selectedRowBackgroundColor: "#3182ce",
        rowHoverColor: "rgba(49, 130, 206, 0.1)",
        rangeSelectionBackgroundColor: "rgba(49, 130, 206, 0.2)"
    },
    dark: {
        backgroundColor: "#0F1C31",              // Dark navy background - EXACT from theme builder
        foregroundColor: "#FFF",                 // Pure white text
        browserColorScheme: "dark",
        chromeBackgroundColor: "#202c3f",        // EXACT header color from theme builder (not using mix)
        headerBackgroundColor: "#202c3f",        // EXACT header color you specified
        headerTextColor: "#FFF",
        headerFontSize: 14,
        oddRowBackgroundColor: "rgba(255, 255, 255, 0.02)",
        rowBorder: false,
        headerRowBorder: false,
        columnBorder: false,
        borderColor: "#2a3f5f",                  // Subtle navy border
        selectedRowBackgroundColor: "#2563eb",   // Bright blue
        rowHoverColor: "rgba(37, 99, 235, 0.15)", // Blue hover
        rangeSelectionBackgroundColor: "rgba(37, 99, 235, 0.2)"
    }
};

/**
 * ApexCharts theme configuration
 */
const APEX_CHARTS_THEMES = {
    light: {
        mode: "light",
        palette: "palette1",
        monochrome: {
            enabled: false,
            color: "#206bc4",
            shadeTo: "light",
            shadeIntensity: 0.65
        },
        colors: ["#206bc4", "#16a34a", "#d97706", "#dc2626", "#2563eb", "#7c3aed"],
        background: "transparent",
        foreColor: "#2d3748",
        grid: {
            borderColor: "#e2e8f0"
        },
        stroke: {
            colors: ["#ffffff"]
        },
        dataLabels: {
            style: {
                colors: ["#2d3748"]
            }
        },
        tooltip: {
            theme: "light",
            style: {
                fontSize: "12px"
            }
        }
    },
    dark: {
        mode: "dark",
        palette: "palette1",
        monochrome: {
            enabled: false,
            color: "#2563eb",
            shadeTo: "dark",
            shadeIntensity: 0.65
        },
        colors: ["#2563eb", "#34d399", "#fb923c", "#f87171", "#60a5fa", "#a78bfa"],
        background: "transparent",
        foreColor: "#ffffff",
        grid: {
            borderColor: "#2a3f5f"
        },
        stroke: {
            colors: ["#0F1C31"]
        },
        dataLabels: {
            style: {
                colors: ["#ffffff"]
            }
        },
        tooltip: {
            theme: "dark",
            style: {
                fontSize: "12px"
            }
        }
    }
};

/**
 * CSS custom properties configuration
 * These will be applied to :root and [data-bs-theme="dark"]
 */
const CSS_VARIABLES = {
    light: {
        // Primary colors
        "--hextrackr-primary": COLOR_PALETTE.primary.light,
        "--hextrackr-secondary": "#6c757d",
        "--hextrackr-success": COLOR_PALETTE.semantic.success,
        "--hextrackr-warning": COLOR_PALETTE.semantic.warning,
        "--hextrackr-danger": COLOR_PALETTE.semantic.danger,
        "--hextrackr-info": COLOR_PALETTE.semantic.info,

        // Backgrounds
        "--hextrackr-bg-primary": COLOR_PALETTE.light.background,
        "--hextrackr-bg-secondary": COLOR_PALETTE.light.backgroundAlt,
        "--hextrackr-surface-1": COLOR_PALETTE.light.surface1,
        "--hextrackr-surface-2": COLOR_PALETTE.light.surface2,

        // Text
        "--hextrackr-text": COLOR_PALETTE.light.text,
        "--hextrackr-text-muted": COLOR_PALETTE.light.textMuted,

        // Borders
        "--hextrackr-border": COLOR_PALETTE.light.border,

        // Shadows
        "--hextrackr-shadow-sm": SHADOWS.light.sm,
        "--hextrackr-shadow-md": SHADOWS.light.md,
        "--hextrackr-shadow-lg": SHADOWS.light.lg,

        // VPR colors
        "--vpr-critical": COLOR_PALETTE.vpr.critical,
        "--vpr-high": COLOR_PALETTE.vpr.high,
        "--vpr-medium": COLOR_PALETTE.vpr.medium,
        "--vpr-low": COLOR_PALETTE.vpr.low
    },
    dark: {
        // Primary colors
        "--hextrackr-primary": COLOR_PALETTE.primary.dark,
        "--hextrackr-secondary": "#94a3b8",
        "--hextrackr-success": COLOR_PALETTE.semantic.success,
        "--hextrackr-warning": COLOR_PALETTE.semantic.warning,
        "--hextrackr-danger": COLOR_PALETTE.semantic.danger,
        "--hextrackr-info": COLOR_PALETTE.semantic.info,

        // Backgrounds
        "--hextrackr-bg-primary": COLOR_PALETTE.navy.background,
        "--hextrackr-bg-secondary": COLOR_PALETTE.navy.backgroundAlt,
        "--hextrackr-surface-1": COLOR_PALETTE.navy.surface1,
        "--hextrackr-surface-2": COLOR_PALETTE.navy.surface2,

        // Text
        "--hextrackr-text": COLOR_PALETTE.navy.text,
        "--hextrackr-text-muted": COLOR_PALETTE.navy.textMuted,

        // Borders
        "--hextrackr-border": COLOR_PALETTE.navy.border,

        // Shadows
        "--hextrackr-shadow-sm": SHADOWS.dark.sm,
        "--hextrackr-shadow-md": SHADOWS.dark.md,
        "--hextrackr-shadow-lg": SHADOWS.dark.lg,

        // VPR colors (same as light, just different opacity backgrounds)
        "--vpr-critical": COLOR_PALETTE.vpr.critical,
        "--vpr-high": COLOR_PALETTE.vpr.high,
        "--vpr-medium": COLOR_PALETTE.vpr.medium,
        "--vpr-low": COLOR_PALETTE.vpr.low
    }
};

/**
 * Main theme configuration export
 */
export const THEME_CONFIG = {
    version: "1.0.0",
    lastUpdated: "2025-09-20",

    // Color palette
    colors: COLOR_PALETTE,

    // Typography
    typography: TYPOGRAPHY,

    // Spacing
    spacing: SPACING,

    // Shadows
    shadows: SHADOWS,

    // Component-specific themes
    agGrid: AG_GRID_THEMES,
    apexCharts: APEX_CHARTS_THEMES,

    // CSS variables
    cssVariables: CSS_VARIABLES,

    /**
     * Get theme configuration by theme name
     * @param {string} theme - 'light' or 'dark'
     * @returns {Object} Complete theme configuration for the specified theme
     */
    getTheme(theme = "light") {
        const isDark = theme === "dark";
        return {
            name: theme,
            colors: isDark ? COLOR_PALETTE.navy : COLOR_PALETTE.light,
            semantic: COLOR_PALETTE.semantic,
            vpr: COLOR_PALETTE.vpr,
            typography: TYPOGRAPHY,
            spacing: SPACING,
            shadows: isDark ? SHADOWS.dark : SHADOWS.light,
            agGrid: isDark ? AG_GRID_THEMES.dark : AG_GRID_THEMES.light,
            apexCharts: isDark ? APEX_CHARTS_THEMES.dark : APEX_CHARTS_THEMES.light,
            cssVariables: isDark ? CSS_VARIABLES.dark : CSS_VARIABLES.light
        };
    },

    /**
     * Get AG-Grid Quartz theme parameters
     * @param {boolean} isDark - Whether to get dark theme
     * @returns {Object} AG-Grid Quartz theme parameters
     */
    getAgGridTheme(isDark = false) {
        return isDark ? AG_GRID_THEMES.dark : AG_GRID_THEMES.light;
    },

    /**
     * Get ApexCharts theme configuration
     * @param {boolean} isDark - Whether to get dark theme
     * @returns {Object} ApexCharts theme configuration
     */
    getApexChartsTheme(isDark = false) {
        return isDark ? APEX_CHARTS_THEMES.dark : APEX_CHARTS_THEMES.light;
    },

    /**
     * Get CSS variables for a theme
     * @param {boolean} isDark - Whether to get dark theme
     * @returns {Object} CSS variable definitions
     */
    getCssVariables(isDark = false) {
        return isDark ? CSS_VARIABLES.dark : CSS_VARIABLES.light;
    },

    /**
     * Apply CSS variables to an element (usually document root)
     * @param {HTMLElement} element - Element to apply variables to
     * @param {boolean} isDark - Whether to apply dark theme
     */
    applyCssVariables(element = document.documentElement, isDark = false) {
        const variables = this.getCssVariables(isDark);
        Object.entries(variables).forEach(([key, value]) => {
            element.style.setProperty(key, value);
        });
    }
};

// Export individual components for convenience
export const { colors, typography, spacing, shadows, agGrid, apexCharts, cssVariables } = THEME_CONFIG;

// Make available globally for non-module scripts
if (typeof window !== "undefined") {
    window.HexTrackrThemeConfig = THEME_CONFIG;
}