/**
 * WCAG Contrast Validation Utility - T043
 * 
 * Provides functions to validate color contrast ratios against WCAG AA/AAA standards
 * Implements luminance calculation and contrast ratio algorithms per WCAG 2.1 specification
 * 
 * @version 1.0.0
 * @spec 005-dark-mode-theme-system
 * @task T043 - WCAG AA contrast ratio validation for all dark mode elements
 */

// WCAG 2.1 Contrast Standards
export const WCAG_STANDARDS = {
  AA: {
    NORMAL_TEXT: 4.5,    // 4.5:1 for normal text
    LARGE_TEXT: 3.0,     // 3.0:1 for large text (18pt+ or 14pt+ bold)
    UI_ELEMENTS: 3.0     // 3.0:1 for UI components and graphical objects
  },
  AAA: {
    NORMAL_TEXT: 7.0,    // 7.0:1 for normal text
    LARGE_TEXT: 4.5,     // 4.5:1 for large text
    UI_ELEMENTS: 4.5     // 4.5:1 for UI components
  }
};

/**
 * Convert hex color to RGB values
 * Handles both 3-digit and 6-digit hex codes with or without #
 * 
 * @param {string} hex - Hex color code
 * @returns {Object} RGB values {r, g, b} or null if invalid
 */
export function hexToRgb(hex) {
  try {
    // Remove # if present and validate format
    hex = hex.replace("#", "");
    
    // Expand 3-digit hex to 6-digit
    if (hex.length === 3) {
      hex = hex.split("").map(char => char + char).join("");
    }
    
    if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
      console.warn("Invalid hex color format:", hex);
      return null;
    }
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return { r, g, b };
  } catch (error) {
    console.error("Error converting hex to RGB:", error);
    return null;
  }
}

/**
 * Calculate relative luminance of a color per WCAG 2.1 formula
 * 
 * @param {Object} rgb - RGB color values {r, g, b}
 * @returns {number} Relative luminance (0-1)
 */
export function calculateLuminance(rgb) {
  try {
    if (!rgb || typeof rgb.r === "undefined" || typeof rgb.g === "undefined" || typeof rgb.b === "undefined") {
      throw new Error("Invalid RGB object");
    }
    
    // Convert RGB values to sRGB (0-1 range)
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;
    
    // Apply gamma correction per WCAG formula
    const gamma = (component) => {
      return component <= 0.03928 
        ? component / 12.92 
        : Math.pow((component + 0.055) / 1.055, 2.4);
    };
    
    const rLinear = gamma(rsRGB);
    const gLinear = gamma(gsRGB);
    const bLinear = gamma(bsRGB);
    
    // Calculate relative luminance using WCAG coefficients
    const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    
    return luminance;
  } catch (error) {
    console.error("Error calculating luminance:", error);
    return 0;
  }
}

/**
 * Calculate contrast ratio between two colors per WCAG 2.1
 * 
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} Contrast ratio (1-21)
 */
export function calculateContrastRatio(color1, color2) {
  try {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) {
      throw new Error("Invalid color format");
    }
    
    const luminance1 = calculateLuminance(rgb1);
    const luminance2 = calculateLuminance(rgb2);
    
    // WCAG formula: (L1 + 0.05) / (L2 + 0.05) where L1 is lighter
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    const contrastRatio = (lighter + 0.05) / (darker + 0.05);
    
    return Math.round(contrastRatio * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error("Error calculating contrast ratio:", error);
    return 1; // Worst possible contrast
  }
}

/**
 * Validate if contrast ratio meets WCAG standards
 * 
 * @param {number} ratio - Contrast ratio to validate
 * @param {string} level - WCAG level ('AA' or 'AAA')
 * @param {string} textSize - Text size ('normal' or 'large')
 * @returns {Object} Validation result
 */
export function validateWCAGCompliance(ratio, level = "AA", textSize = "normal") {
  try {
    const standards = WCAG_STANDARDS[level];
    if (!standards) {
      throw new Error("Invalid WCAG level");
    }
    
    const requiredRatio = textSize === "large" 
      ? standards.LARGE_TEXT 
      : standards.NORMAL_TEXT;
    
    const passes = ratio >= requiredRatio;
    const grade = passes ? "PASS" : "FAIL";
    
    return {
      passes,
      grade,
      ratio,
      required: requiredRatio,
      level,
      textSize,
      message: `${grade}: ${ratio}:1 (requires ${requiredRatio}:1 for WCAG ${level} ${textSize} text)`
    };
  } catch (error) {
    console.error("Error validating WCAG compliance:", error);
    return {
      passes: false,
      grade: "ERROR",
      ratio: 0,
      required: 0,
      level,
      textSize,
      message: `Error validating compliance: ${error.message}`
    };
  }
}

/**
 * Comprehensive contrast validation for a color combination
 * 
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {Object} options - Validation options
 * @returns {Object} Complete validation results
 */
export function validateColorCombination(foreground, background, options = {}) {
  const {
    level = "AA",
    includeAAA = false,
    textSizes = ["normal", "large"],
    label = "Color combination"
  } = options;
  
  try {
    const ratio = calculateContrastRatio(foreground, background);
    const results = {
      foreground: foreground,
      background: background,
      ratio: ratio,
      label: label,
      validations: {},
      overallPass: false
    };
    
    // Test specified WCAG level
    textSizes.forEach(textSize => {
      const key = `${level}_${textSize}`;
      results.validations[key] = validateWCAGCompliance(ratio, level, textSize);
    });
    
    // Test AAA if requested
    if (includeAAA) {
      textSizes.forEach(textSize => {
        const key = `AAA_${textSize}`;
        results.validations[key] = validateWCAGCompliance(ratio, "AAA", textSize);
      });
    }
    
    // Determine overall pass status (must pass at least normal text for specified level)
    const primaryValidation = results.validations[`${level}_normal`];
    results.overallPass = primaryValidation ? primaryValidation.passes : false;
    
    return results;
  } catch (error) {
    console.error("Error validating color combination:", error);
    return {
      foreground,
      background,
      ratio: 0,
      label,
      validations: {},
      overallPass: false,
      error: error.message
    };
  }
}

/**
 * Batch validate multiple color combinations
 * 
 * @param {Array} combinations - Array of {fg, bg, label} objects
 * @param {Object} options - Validation options
 * @returns {Array} Array of validation results
 */
export function batchValidateColors(combinations, options = {}) {
  try {
    return combinations.map(combo => {
      if (!combo.fg || !combo.bg) {
        console.warn("Invalid color combination:", combo);
        return null;
      }
      
      return validateColorCombination(combo.fg, combo.bg, {
        ...options,
        label: combo.label || `${combo.fg} on ${combo.bg}`
      });
    }).filter(result => result !== null);
  } catch (error) {
    console.error("Error in batch validation:", error);
    return [];
  }
}

/**
 * Generate accessibility report for theme colors
 * 
 * @param {Object} themeColors - Theme color definitions
 * @param {string} level - WCAG level to validate against
 * @returns {Object} Accessibility report
 */
export function generateAccessibilityReport(themeColors, level = "AA") {
  try {
    const report = {
      level: level,
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        passRate: 0
      },
      results: [],
      violations: [],
      recommendations: []
    };
    
    // Common text/background combinations to test
    const testCombinations = [
      { fg: themeColors["--bs-body-color"], bg: themeColors["--bs-body-bg"], label: "Body text" },
      { fg: themeColors["--bs-emphasis-color"], bg: themeColors["--bs-body-bg"], label: "Emphasis text" },
      { fg: themeColors["--bs-secondary-color"], bg: themeColors["--bs-body-bg"], label: "Secondary text" },
      { fg: themeColors["--bs-tertiary-color"], bg: themeColors["--bs-body-bg"], label: "Tertiary text" },
      { fg: "#ffffff", bg: themeColors["--vpr-critical"], label: "Critical VPR badge" },
      { fg: "#ffffff", bg: themeColors["--vpr-high"], label: "High VPR badge" },
      { fg: themeColors["--bs-body-color"], bg: themeColors["--vpr-medium"], label: "Medium VPR badge" },
      { fg: "#ffffff", bg: themeColors["--vpr-low"], label: "Low VPR badge" },
      { fg: "#ffffff", bg: themeColors["--vpr-info"], label: "Info VPR badge" }
    ].filter(combo => combo.fg && combo.bg);
    
    // Validate all combinations
    report.results = batchValidateColors(testCombinations, { level });
    
    // Calculate summary statistics
    report.summary.total = report.results.length;
    report.summary.passed = report.results.filter(result => result.overallPass).length;
    report.summary.failed = report.summary.total - report.summary.passed;
    report.summary.passRate = Math.round((report.summary.passed / report.summary.total) * 100);
    
    // Extract violations
    report.violations = report.results
      .filter(result => !result.overallPass)
      .map(result => ({
        combination: result.label,
        foreground: result.foreground,
        background: result.background,
        ratio: result.ratio,
        required: WCAG_STANDARDS[level].NORMAL_TEXT,
        deficit: Math.round((WCAG_STANDARDS[level].NORMAL_TEXT - result.ratio) * 100) / 100
      }));
    
    return report;
  } catch (error) {
    console.error("Error generating accessibility report:", error);
    return {
      level,
      timestamp: new Date().toISOString(),
      summary: { total: 0, passed: 0, failed: 0, passRate: 0 },
      results: [],
      violations: [],
      recommendations: [],
      error: error.message
    };
  }
}

/**
 * Suggest improved colors for failing combinations
 * 
 * @param {string} foreground - Current foreground color
 * @param {string} background - Current background color
 * @param {number} targetRatio - Target contrast ratio
 * @returns {Object} Color suggestions
 */
export function suggestImprovedColors(foreground, background, targetRatio = 4.5) {
  try {
    // This is a simplified suggestion algorithm
    // In a full implementation, you would use HSL color space manipulation
    // to maintain hue while adjusting lightness
    
    const currentRatio = calculateContrastRatio(foreground, background);
    
    if (currentRatio >= targetRatio) {
      return {
        current: { foreground, background, ratio: currentRatio },
        suggestions: [],
        message: "Current colors already meet target ratio"
      };
    }
    
    return {
      current: { foreground, background, ratio: currentRatio },
      suggestions: [
        {
          type: "manual_adjustment",
          message: `Current ratio ${currentRatio}:1 needs improvement to ${targetRatio}:1`,
          recommendation: "Manually adjust color lightness to meet target ratio"
        }
      ],
      message: "Automatic color adjustment requires HSL implementation"
    };
    
  } catch (error) {
    console.error("Error suggesting improved colors:", error);
    return {
      current: { foreground, background, ratio: 0 },
      suggestions: [],
      message: `Error: ${error.message}`
    };
  }
}