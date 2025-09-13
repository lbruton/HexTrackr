/**
 * T015 - VPR Badge Contrast Validation Test (E2E)
 * 
 * CRITICAL TDD REQUIREMENT: This test MUST FAIL when first run!
 * The VPR badge dark mode styling doesn't exist yet (T035 future task).
 * 
 * Tests VPR severity badge contrast ratios in dark mode:
 * - WCAG AA 4.5:1 minimum contrast requirement  
 * - Badge visibility across all severity levels (Critical/High/Medium/Low)
 * - XSS prevention through badge content validation
 * - Color-blind accessibility
 * 
 * Context: Phase 3.2 TDD Round 2 - component-level testing
 * Expected Failures: VPR dark mode colors not defined, contrast ratios fail WCAG
 * 
 * @fileoverview Frontend security focus on XSS-safe DOM manipulation and WCAG AA compliance
 */

import { test, expect } from '@playwright/test';

/**
 * WCAG AA Contrast Requirements
 * - Normal text: minimum 4.5:1 ratio
 * - Large text (18pt+): minimum 3:1 ratio
 * - Enhanced AAA: 7:1 normal, 4.5:1 large
 */
const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3.0;
const WCAG_AAA_NORMAL = 7.0;

/**
 * Expected VPR severity badge color mappings (currently light mode only)
 * These will fail in dark mode until T035 is implemented
 */
const VPR_SEVERITY_COLORS = {
  critical: { bg: '#dc3545', text: '#ffffff', name: 'Critical' }, // Red
  high: { bg: '#fd7e14', text: '#ffffff', name: 'High' },         // Orange  
  medium: { bg: '#ffc107', text: '#000000', name: 'Medium' },     // Yellow
  low: { bg: '#20c997', text: '#ffffff', name: 'Low' }            // Green
};

/**
 * Calculate luminance for WCAG contrast ratio
 * Formula from WCAG 2.1 specification
 */
function getLuminance(rgb) {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  const rsRGB = r / 255;
  const gsRGB = g / 255; 
  const bsRGB = b / 255;
  
  const R = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const G = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const B = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

test.describe('VPR Badge Contrast Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to vulnerabilities page
    await page.goto('http://localhost:8989/vulnerabilities.html');
    await page.waitForLoadState('networkidle');
    
    // Wait for vulnerability data to load
    await page.waitForTimeout(2000);
  });

  test('should meet WCAG AA contrast requirements in light mode', async ({ page }) => {
    console.log('Testing light mode VPR badge contrast (baseline - should pass)');
    
    // Ensure we're in light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-bs-theme');
    });
    
    // Test each severity level
    for (const [severity, colors] of Object.entries(VPR_SEVERITY_COLORS)) {
      // Look for severity badges in the grid
      const badges = await page.locator(`.severity-badge.severity-${severity}`);
      const badgeCount = await badges.count();
      
      if (badgeCount > 0) {
        console.log(`Found ${badgeCount} ${severity} badges to test`);
        
        // Test first badge of each severity
        const badge = badges.first();
        await badge.waitFor({ state: 'visible' });
        
        // Get computed styles
        const styles = await badge.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight
          };
        });
        
        console.log(`${severity.toUpperCase()} badge styles:`, styles);
        
        // Calculate contrast ratio
        const contrastRatio = getContrastRatio(styles.backgroundColor, styles.color);
        console.log(`${severity.toUpperCase()} contrast ratio: ${contrastRatio.toFixed(2)}:1`);
        
        // Validate WCAG AA compliance
        const fontSize = parseInt(styles.fontSize);
        const isLargeText = fontSize >= 18 || styles.fontWeight >= 700;
        const minRatio = isLargeText ? WCAG_AA_LARGE : WCAG_AA_NORMAL;
        
        expect(contrastRatio, `${severity} badge contrast ratio should meet WCAG AA (${minRatio}:1)`).toBeGreaterThanOrEqual(minRatio);
      } else {
        console.log(`No ${severity} badges found - skipping contrast test`);
      }
    }
  });

  test('should meet WCAG AA contrast requirements in dark mode', async ({ page }) => {
    console.log('Testing dark mode VPR badge contrast (EXPECTED TO FAIL - T035 not implemented)');
    
    // CRITICAL TDD: This test MUST FAIL because dark mode VPR styling doesn't exist yet
    // Switch to dark mode (this should trigger the theme controller)
    await page.evaluate(() => {
      // Manually apply dark mode attributes (ThemeController not implemented yet)
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    });
    
    await page.waitForTimeout(1000);
    
    // Test each severity level in dark mode
    for (const [severity, expectedColors] of Object.entries(VPR_SEVERITY_COLORS)) {
      const badges = await page.locator(`.severity-badge.severity-${severity}`);
      const badgeCount = await badges.count();
      
      if (badgeCount > 0) {
        console.log(`Testing ${badgeCount} ${severity} badges in dark mode`);
        
        const badge = badges.first();
        await badge.waitFor({ state: 'visible' });
        
        // Get dark mode computed styles
        const darkStyles = await badge.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight
          };
        });
        
        console.log(`${severity.toUpperCase()} dark mode styles:`, darkStyles);
        
        // Calculate contrast ratio in dark mode
        const darkContrastRatio = getContrastRatio(darkStyles.backgroundColor, darkStyles.color);
        console.log(`${severity.toUpperCase()} dark mode contrast ratio: ${darkContrastRatio.toFixed(2)}:1`);
        
        // EXPECTED FAILURE: Dark mode colors not implemented yet
        // This should fail until T035 implements proper dark mode VPR badge styling
        const fontSize = parseInt(darkStyles.fontSize);
        const isLargeText = fontSize >= 18 || darkStyles.fontWeight >= 700;
        const minRatio = isLargeText ? WCAG_AA_LARGE : WCAG_AA_NORMAL;
        
        expect(darkContrastRatio, 
          `${severity} badge dark mode contrast should meet WCAG AA (${minRatio}:1) - EXPECTED TO FAIL until T035`
        ).toBeGreaterThanOrEqual(minRatio);
        
        // Additional validation: ensure dark mode colors are different from light mode
        // This will also fail until dark mode VPR styling is implemented
        expect(darkStyles.backgroundColor, 
          `${severity} badge should have different background in dark mode`
        ).not.toBe(expectedColors.bg);
      }
    }
  });

  test('should prevent XSS through badge content validation', async ({ page }) => {
    console.log('Testing VPR badge XSS prevention');
    
    // Test XSS-safe badge content handling
    const maliciousContent = '<script>alert("XSS")</script>';
    const maliciousSeverity = 'high"><script>alert("XSS")</script><span class="';
    
    // Inject test badge with malicious content (simulating vulnerability data)
    await page.evaluate(({content, severity}) => {
      const testContainer = document.createElement('div');
      testContainer.innerHTML = `
        <span class="severity-badge severity-${severity}" data-testid="xss-test-badge">
          ${content}
        </span>
      `;
      document.body.appendChild(testContainer);
    }, {content: maliciousContent, severity: maliciousSeverity});
    
    // Wait for any potential script execution
    await page.waitForTimeout(1000);
    
    // Verify XSS content was sanitized/escaped
    const xssBadge = page.locator('[data-testid="xss-test-badge"]');
    const badgeText = await xssBadge.textContent();
    const badgeHTML = await xssBadge.innerHTML();
    
    // Badge should display escaped content, not execute script
    expect(badgeText).not.toBe('');
    expect(badgeHTML).not.toContain('<script>');
    expect(badgeText).toContain('&lt;script&gt;') || expect(badgeText).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
    
    console.log('XSS test - Badge content:', badgeText);
    console.log('XSS test - Badge HTML:', badgeHTML);
    
    // Verify no JavaScript alert was triggered (page shouldn't have dialog)
    page.on('dialog', async dialog => {
      // If this fires, XSS prevention failed
      expect(dialog.message(), 'XSS script should not execute').not.toBe('XSS');
      await dialog.dismiss();
    });
  });

  test('should maintain color-blind accessibility in both modes', async ({ page }) => {
    console.log('Testing color-blind accessibility for VPR badges');
    
    // Test both light and dark modes for color-blind accessibility
    const modes = [
      { name: 'light', setup: () => document.documentElement.removeAttribute('data-bs-theme') },
      { name: 'dark', setup: () => document.documentElement.setAttribute('data-bs-theme', 'dark') }
    ];
    
    for (const mode of modes) {
      console.log(`Testing color-blind accessibility in ${mode.name} mode`);
      
      await page.evaluate(mode.setup);
      await page.waitForTimeout(500);
      
      // Check that badges use distinguishing patterns beyond just color
      const badges = await page.locator('.severity-badge').all();
      
      for (const badge of badges) {
        const styles = await badge.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            fontWeight: computed.fontWeight,
            textTransform: computed.textTransform,
            border: computed.border,
            fontSize: computed.fontSize
          };
        });
        
        const text = await badge.textContent();
        
        // Verify badges use text labels (not just colors) for accessibility
        expect(text).toBeTruthy();
        expect(text.length).toBeGreaterThan(0);
        
        // Enhanced accessibility features (may fail until implemented)
        const hasFontWeight = parseInt(styles.fontWeight) >= 600;
        const hasTextLabel = text && text.length > 1;
        
        expect(hasFontWeight || hasTextLabel, 
          `Badge should use font weight or text labels for color-blind accessibility in ${mode.name} mode`
        ).toBeTruthy();
        
        console.log(`Badge "${text}" in ${mode.name} mode - Font weight: ${styles.fontWeight}, Accessible: ${hasFontWeight || hasTextLabel}`);
      }
    }
  });

  test('should validate VPR badge visibility across browser zoom levels', async ({ page }) => {
    console.log('Testing VPR badge visibility at different zoom levels');
    
    const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    
    for (const zoom of zoomLevels) {
      console.log(`Testing at ${zoom * 100}% zoom`);
      
      // Set zoom level
      await page.evaluate((zoomLevel) => {
        document.body.style.zoom = zoomLevel;
      }, zoom);
      
      await page.waitForTimeout(500);
      
      // Find VPR badges
      const badges = await page.locator('.severity-badge').all();
      
      if (badges.length > 0) {
        const firstBadge = badges[0];
        
        // Verify badge is still visible and readable
        await expect(firstBadge).toBeVisible();
        
        const boundingBox = await firstBadge.boundingBox();
        expect(boundingBox.width).toBeGreaterThan(0);
        expect(boundingBox.height).toBeGreaterThan(0);
        
        // Check text is still readable (minimum size requirements)
        const styles = await firstBadge.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            fontSize: computed.fontSize,
            padding: computed.padding
          };
        });
        
        const fontSize = parseInt(styles.fontSize);
        expect(fontSize).toBeGreaterThan(8); // Minimum readable size even at 50% zoom
        
        console.log(`Zoom ${zoom * 100}%: Badge size ${boundingBox.width}x${boundingBox.height}, fontSize: ${fontSize}px`);
      } else {
        console.log(`No badges found at ${zoom * 100}% zoom`);
      }
    }
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = 1.0;
    });
  });
});