/**
 * Theme Contrast Testing Utility - T043
 *
 * Tests HexTrackr dark theme colors against WCAG AA standards
 * Uses the WCAG contrast validator to identify compliance issues
 *
 * @version 1.0.0
 * @spec 005-dark-mode-theme-system
 * @task T043 - WCAG AA contrast ratio validation for all dark mode elements
 */

import {
  validateColorCombination,
  batchValidateColors,
  WCAG_STANDARDS
} from "./wcag-contrast-validator.js";

/**
 * HexTrackr Dark Theme Color Definitions
 * Extracted from dark-theme.css for testing
 */
const DARK_THEME_COLORS = {
  // Core colors
  bodyBg: "#0f172a",           // --bs-body-bg
  bodyColor: "#e2e8f0",        // --bs-body-color
  bodyBgSecondary: "#1e293b",  // --bs-body-bg-secondary
  emphasisColor: "#f8fafc",    // --bs-emphasis-color
  secondaryColor: "#64748b",   // --bs-secondary-color
  tertiaryColor: "#475569",    // --bs-tertiary-color
  
  // Component colors
  cardBg: "#1e293b",           // --bs-card-bg
  cardBorder: "#334155",       // --bs-card-border-color
  navbarBg: "#0f172a",         // --bs-navbar-bg
  navbarBrand: "#f8fafc",      // --bs-navbar-brand-color
  navbarLink: "#cbd5e1",       // --bs-navbar-nav-link-color
  navbarLinkHover: "#f8fafc",  // --bs-navbar-nav-link-hover-color
  
  // Form controls
  formControlBg: "#1e293b",    // --bs-form-control-bg
  formControlColor: "#e2e8f0", // --bs-form-control-color
  formControlBorder: "#475569", // --bs-form-control-border-color
  
  // Semantic colors
  primary: "#3b82f6",          // --bs-primary
  success: "#10b981",          // --bs-success
  warning: "#f59e0b",          // --bs-warning
  danger: "#ef4444",           // --bs-danger
  info: "#0ea5e9",             // --bs-info
  
  // VPR badges
  vprCritical: "#dc2626",      // --vpr-critical
  vprHigh: "#ea580c",          // --vpr-high
  vprMedium: "#d97706",        // --vpr-medium
  vprLow: "#16a34a",           // --vpr-low
  vprInfo: "#0891b2",          // --vpr-info
  
  // Chart colors
  chartBackground: "#1e293b",  // --chart-background
  chartText: "#9ca3af",        // --chart-text-color
  chartTitle: "#f9fafb",       // --chart-title-color
  
  // AG-Grid colors
  agBackground: "#1e293b",     // --ag-background-color
  agForeground: "#e2e8f0",     // --ag-foreground-color
  agHeaderBg: "#0f172a",       // --ag-header-background-color
  agHeaderFg: "#f8fafc",       // --ag-header-foreground-color
};

/**
 * Critical text/background combinations to test
 * These represent the most important UI elements for accessibility
 */
const CRITICAL_COMBINATIONS = [
  // Body text combinations
  { fg: DARK_THEME_COLORS.bodyColor, bg: DARK_THEME_COLORS.bodyBg, label: "Body text on page background", critical: true },
  { fg: DARK_THEME_COLORS.emphasisColor, bg: DARK_THEME_COLORS.bodyBg, label: "Emphasis text on page background", critical: true },
  { fg: DARK_THEME_COLORS.secondaryColor, bg: DARK_THEME_COLORS.bodyBg, label: "Secondary text on page background", critical: false },
  { fg: DARK_THEME_COLORS.tertiaryColor, bg: DARK_THEME_COLORS.bodyBg, label: "Tertiary text on page background", critical: false },
  
  // Card combinations
  { fg: DARK_THEME_COLORS.bodyColor, bg: DARK_THEME_COLORS.cardBg, label: "Body text on card background", critical: true },
  { fg: DARK_THEME_COLORS.emphasisColor, bg: DARK_THEME_COLORS.cardBg, label: "Emphasis text on card background", critical: true },
  
  // Navigation combinations
  { fg: DARK_THEME_COLORS.navbarBrand, bg: DARK_THEME_COLORS.navbarBg, label: "Brand text in navigation", critical: true },
  { fg: DARK_THEME_COLORS.navbarLink, bg: DARK_THEME_COLORS.navbarBg, label: "Navigation links", critical: true },
  { fg: DARK_THEME_COLORS.navbarLinkHover, bg: DARK_THEME_COLORS.navbarBg, label: "Navigation links hover", critical: true },
  
  // Form combinations
  { fg: DARK_THEME_COLORS.formControlColor, bg: DARK_THEME_COLORS.formControlBg, label: "Form input text", critical: true },
  
  // VPR Badge combinations (white text on colored backgrounds)
  { fg: "#ffffff", bg: DARK_THEME_COLORS.vprCritical, label: "Critical VPR badge text", critical: true },
  { fg: "#ffffff", bg: DARK_THEME_COLORS.vprHigh, label: "High VPR badge text", critical: true },
  { fg: "#ffffff", bg: DARK_THEME_COLORS.vprMedium, label: "Medium VPR badge text", critical: true },
  { fg: "#ffffff", bg: DARK_THEME_COLORS.vprLow, label: "Low VPR badge text", critical: true },
  { fg: "#ffffff", bg: DARK_THEME_COLORS.vprInfo, label: "Info VPR badge text", critical: true },
  
  // Semantic color combinations (white text on colored backgrounds)
  { fg: "#ffffff", bg: DARK_THEME_COLORS.primary, label: "Primary button text", critical: true },
  { fg: "#ffffff", bg: DARK_THEME_COLORS.success, label: "Success button text", critical: true },
  { fg: "#ffffff", bg: DARK_THEME_COLORS.warning, label: "Warning button text", critical: true },
  { fg: "#ffffff", bg: DARK_THEME_COLORS.danger, label: "Danger button text", critical: true },
  { fg: "#ffffff", bg: DARK_THEME_COLORS.info, label: "Info button text", critical: true },
  
  // Chart combinations
  { fg: DARK_THEME_COLORS.chartText, bg: DARK_THEME_COLORS.chartBackground, label: "Chart text", critical: true },
  { fg: DARK_THEME_COLORS.chartTitle, bg: DARK_THEME_COLORS.chartBackground, label: "Chart titles", critical: true },
  
  // Grid combinations
  { fg: DARK_THEME_COLORS.agForeground, bg: DARK_THEME_COLORS.agBackground, label: "Grid text", critical: true },
  { fg: DARK_THEME_COLORS.agHeaderFg, bg: DARK_THEME_COLORS.agHeaderBg, label: "Grid header text", critical: true },
];

/**
 * Run WCAG AA compliance test on all critical color combinations
 * 
 * @param {boolean} verbose - Include detailed results in output
 * @returns {Object} Test results with summary and violations
 */
export function testDarkThemeCompliance(verbose = false) {
  console.log("🔍 Testing HexTrackr Dark Theme WCAG AA Compliance...\n");
  
  try {
    // Test all combinations
    const results = batchValidateColors(CRITICAL_COMBINATIONS, {
      level: "AA",
      includeAAA: true,
      textSizes: ["normal", "large"]
    });
    
    // Separate critical vs non-critical failures
    const criticalFailures = [];
    const nonCriticalFailures = [];
    const passes = [];
    
    results.forEach(result => {
      const combo = CRITICAL_COMBINATIONS.find(c => c.label === result.label);
      
      if (result.overallPass) {
        passes.push(result);
      } else {
        if (combo && combo.critical) {
          criticalFailures.push(result);
        } else {
          nonCriticalFailures.push(result);
        }
      }
    });
    
    // Generate summary
    const summary = {
      total: results.length,
      passed: passes.length,
      failed: criticalFailures.length + nonCriticalFailures.length,
      criticalFailures: criticalFailures.length,
      nonCriticalFailures: nonCriticalFailures.length,
      passRate: Math.round((passes.length / results.length) * 100)
    };
    
    // Display results
    console.log("📊 WCAG AA Compliance Summary:");
    console.log(`   Total combinations tested: ${summary.total}`);
    console.log(`   ✅ Passed: ${summary.passed} (${summary.passRate}%)`);
    console.log(`   ❌ Failed: ${summary.failed}`);
    console.log(`      🚨 Critical failures: ${summary.criticalFailures}`);
    console.log(`      ⚠️  Non-critical failures: ${summary.nonCriticalFailures}`);
    console.log("");
    
    // Report critical failures
    if (criticalFailures.length > 0) {
      console.log("🚨 CRITICAL ACCESSIBILITY VIOLATIONS:");
      criticalFailures.forEach((result, index) => {
        const validation = result.validations["AA_normal"];
        console.log(`   ${index + 1}. ${result.label}`);
        console.log(`      Ratio: ${result.ratio}:1 (requires ${validation.required}:1)`);
        console.log(`      Colors: ${result.foreground} on ${result.background}`);
        console.log(`      Deficit: ${Math.round((validation.required - result.ratio) * 100) / 100}:1`);
        console.log("");
      });
    }
    
    // Report non-critical failures
    if (nonCriticalFailures.length > 0) {
      console.log("⚠️  NON-CRITICAL ACCESSIBILITY ISSUES:");
      nonCriticalFailures.forEach((result, index) => {
        const validation = result.validations["AA_normal"];
        console.log(`   ${index + 1}. ${result.label}`);
        console.log(`      Ratio: ${result.ratio}:1 (requires ${validation.required}:1)`);
        console.log(`      Colors: ${result.foreground} on ${result.background}`);
        console.log("");
      });
    }
    
    // Show successful combinations if verbose
    if (verbose && passes.length > 0) {
      console.log("✅ PASSED COMBINATIONS:");
      passes.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.label} (${result.ratio}:1)`);
      });
      console.log("");
    }
    
    // Return structured results
    return {
      summary,
      criticalFailures,
      nonCriticalFailures,
      passes,
      allResults: results,
      recommendations: generateRecommendations(criticalFailures, nonCriticalFailures)
    };
    
  } catch (error) {
    console.error("❌ Error testing theme compliance:", error);
    return {
      summary: { total: 0, passed: 0, failed: 0, criticalFailures: 0, nonCriticalFailures: 0, passRate: 0 },
      criticalFailures: [],
      nonCriticalFailures: [],
      passes: [],
      allResults: [],
      recommendations: [],
      error: error.message
    };
  }
}

/**
 * Generate actionable recommendations for fixing accessibility issues
 * 
 * @param {Array} criticalFailures - Critical accessibility violations
 * @param {Array} nonCriticalFailures - Non-critical accessibility issues
 * @returns {Array} List of actionable recommendations
 */
function generateRecommendations(criticalFailures, nonCriticalFailures) {
  const recommendations = [];
  
  // Critical recommendations
  if (criticalFailures.length > 0) {
    recommendations.push({
      priority: "CRITICAL",
      action: "Fix critical accessibility violations immediately",
      items: criticalFailures.map(failure => ({
        element: failure.label,
        currentRatio: failure.ratio,
        requiredRatio: WCAG_STANDARDS.AA.NORMAL_TEXT,
        suggestion: `Adjust color lightness to achieve ${WCAG_STANDARDS.AA.NORMAL_TEXT}:1 ratio`
      }))
    });
  }
  
  // Non-critical recommendations
  if (nonCriticalFailures.length > 0) {
    recommendations.push({
      priority: "MEDIUM",
      action: "Address non-critical accessibility issues when possible",
      items: nonCriticalFailures.map(failure => ({
        element: failure.label,
        currentRatio: failure.ratio,
        requiredRatio: WCAG_STANDARDS.AA.NORMAL_TEXT,
        suggestion: "Consider improving for better accessibility"
      }))
    });
  }
  
  // General recommendations
  if (criticalFailures.length === 0 && nonCriticalFailures.length === 0) {
    recommendations.push({
      priority: "SUCCESS",
      action: "All color combinations meet WCAG AA standards",
      items: [{
        suggestion: "Consider testing against WCAG AAA for enhanced accessibility"
      }]
    });
  }
  
  return recommendations;
}

/**
 * Test specific color combination
 * 
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {string} label - Description of the combination
 * @returns {Object} Detailed test result
 */
export function testColorCombination(foreground, background, label = "Custom combination") {
  return validateColorCombination(foreground, background, {
    level: "AA",
    includeAAA: true,
    textSizes: ["normal", "large"],
    label: label
  });
}

/**
 * Export theme colors for external use
 */
export { DARK_THEME_COLORS };

/**
 * Export critical combinations for external testing
 */
export { CRITICAL_COMBINATIONS };