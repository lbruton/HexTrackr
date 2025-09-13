/**
 * T016: Print Theme Override E2E Tests
 * 
 * Creative TDD testing for print media query behavior in HexTrackr theme system
 * CRITICAL: These tests MUST FAIL initially since print CSS overrides aren't implemented yet!
 * 
 * Tests cover:
 * - @media print forces light theme regardless of user preference
 * - Dark mode elements become print-friendly
 * - Chart/grid print styling adaptation
 * - Creative edge cases: print preview vs actual printing, high contrast mode
 * - CSS print-color-adjust: exact for chart colors
 * - Page break behavior with themed content
 * - Memory management during print preparation
 * 
 * @version 1.0.0
 * @author Curly (Creative Problem Solver)
 * @date 2025-09-12
 */

const { test, expect } = require("@playwright/test");

test.describe("T016: Print Theme Override", () => {
  let page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate to vulnerabilities page (has charts and grids to test print styling)
    await page.goto("/vulnerabilities.html");
    await page.waitForLoadState("networkidle");
    
    // Inject print media query testing helper
    await page.addStyleTag({
      content: `
        /* Test helper to simulate print media for E2E testing */
        .print-test-mode {
          /* Force print styles for testing purposes */
          color-scheme: light !important;
        }
      `
    });
  });

  test("T016.1: Print media query forces light theme override", async () => {
    // Soitenly need to test that print always uses light theme!
    
    // Set dark theme first
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      document.documentElement.classList.add("dark-theme");
    });
    
    // Verify dark theme is active in normal view
    const isDarkModeActive = await page.evaluate(() => {
      return document.documentElement.getAttribute("data-bs-theme") === "dark";
    });
    expect(isDarkModeActive).toBe(true);
    
    // Simulate print media query by emulating print media
    await page.emulateMedia({ media: "print" });
    
    // EXPECTED FAILURE: Print CSS override not implemented yet (T050)
    // Print styles should force light theme colors regardless of current theme
    const printStyles = await page.evaluate(() => {
      const testElement = document.querySelector("body");
      const computedStyles = window.getComputedStyle(testElement);
      
      return {
        backgroundColor: computedStyles.backgroundColor,
        color: computedStyles.color,
        colorScheme: computedStyles.colorScheme
      };
    });
    
    // This will FAIL until T050 implements print CSS overrides
    expect(printStyles.colorScheme).toBe("light");
    expect(printStyles.backgroundColor).toMatch(/(white|rgb\(255,\s*255,\s*255\))/);
    expect(printStyles.color).toMatch(/(black|rgb\(0,\s*0,\s*0\))/);
  });

  test("T016.2: Creative Edge Case - Dark mode elements become print-friendly", async () => {
    // Nyuk-nyuk-nyuk! Let's test those dark mode elements in print!
    
    // Set dark theme and create test elements
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      
      // Create typical dark mode elements
      const testContainer = document.createElement("div");
      testContainer.innerHTML = `
        <div class="card bg-dark text-light">
          <div class="card-header bg-secondary">Test Card Header</div>
          <div class="card-body">
            <p class="text-muted">Dark mode content</p>
            <div class="alert alert-dark">Dark alert</div>
            <button class="btn btn-dark">Dark Button</button>
          </div>
        </div>
      `;
      document.body.appendChild(testContainer);
    });
    
    // Switch to print media
    await page.emulateMedia({ media: "print" });
    
    // EXPECTED FAILURE: Print-friendly overrides not implemented
    const printFriendlyElements = await page.evaluate(() => {
      const elements = {
        card: document.querySelector(".card.bg-dark"),
        header: document.querySelector(".card-header.bg-secondary"),
        mutedText: document.querySelector(".text-muted"),
        darkAlert: document.querySelector(".alert.alert-dark"),
        darkButton: document.querySelector(".btn.btn-dark")
      };
      
      const styles = {};
      Object.keys(elements).forEach(key => {
        if (elements[key]) {
          const computed = window.getComputedStyle(elements[key]);
          styles[key] = {
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            borderColor: computed.borderColor
          };
        }
      });
      
      return styles;
    });
    
    // These will FAIL until print CSS overrides are implemented
    expect(printFriendlyElements.card.backgroundColor).toMatch(/(white|transparent)/);
    expect(printFriendlyElements.card.color).toMatch(/(black|rgb\(0,\s*0,\s*0\))/);
    expect(printFriendlyElements.mutedText.color).not.toBe("rgb(108, 117, 125)"); // Should not be light gray
  });

  test("T016.3: Chart print styling with color-adjust exact", async () => {
    // Woo-woo-woo! Charts need special print treatment!
    
    // Create a mock chart element
    await page.evaluate(() => {
      const chartContainer = document.createElement("div");
      chartContainer.id = "vulnerability-chart";
      chartContainer.style.width = "400px";
      chartContainer.style.height = "300px";
      chartContainer.innerHTML = `
        <div class="chart-content" style="background-color: #1a1a1a; color: #ffffff;">
          <svg width="400" height="300" style="background-color: #2d2d2d;">
            <circle cx="100" cy="100" r="50" fill="#ff6b6b" />
            <circle cx="200" cy="100" r="50" fill="#4ecdc4" />
            <circle cx="300" cy="100" r="50" fill="#45b7d1" />
            <text x="200" y="200" fill="#ffffff" text-anchor="middle">Chart Data</text>
          </svg>
        </div>
      `;
      document.body.appendChild(chartContainer);
    });
    
    // Set dark theme first
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-bs-theme", "dark");
    });
    
    // Switch to print media
    await page.emulateMedia({ media: "print" });
    
    // EXPECTED FAILURE: print-color-adjust and chart print styles not implemented
    const chartPrintStyles = await page.evaluate(() => {
      const chartContainer = document.getElementById("vulnerability-chart");
      const chartContent = chartContainer?.querySelector(".chart-content");
      const svg = chartContainer?.querySelector("svg");
      const text = svg?.querySelector("text");
      
      if (!chartContainer) {return null;}
      
      const containerStyles = window.getComputedStyle(chartContainer);
      const contentStyles = chartContent ? window.getComputedStyle(chartContent) : null;
      const svgStyles = svg ? window.getComputedStyle(svg) : null;
      const textStyles = text ? window.getComputedStyle(text) : null;
      
      return {
        container: {
          printColorAdjust: containerStyles.printColorAdjust || containerStyles.webkitPrintColorAdjust,
          colorScheme: containerStyles.colorScheme
        },
        content: contentStyles ? {
          backgroundColor: contentStyles.backgroundColor,
          color: contentStyles.color
        } : null,
        svg: svgStyles ? {
          backgroundColor: svgStyles.backgroundColor
        } : null,
        text: textStyles ? {
          fill: textStyles.fill || text.getAttribute("fill")
        } : null
      };
    });
    
    // These will FAIL until chart print CSS is implemented
    expect(chartPrintStyles.container.printColorAdjust).toBe("exact");
    expect(chartPrintStyles.content.backgroundColor).toMatch(/(white|rgb\(255,\s*255,\s*255\))/);
    expect(chartPrintStyles.text.fill).toMatch(/(black|rgb\(0,\s*0,\s*0\))/);
  });

  test("T016.4: Creative Edge Case - Print preview vs actual printing behavior", async () => {
    // Soitenly a creative scenario - different behavior for preview vs print!
    
    // Set up themed content
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      
      const testContent = document.createElement("div");
      testContent.innerHTML = `
        <div class="print-sensitive" style="background: #2d2d2d; color: #ffffff;">
          <h2>This should be print-friendly</h2>
          <div class="chart-container" style="background: #1a1a1a;">
            <p>Chart content here</p>
          </div>
          <div class="data-grid" style="background: #333333; color: #cccccc;">
            <table>
              <tr><th>Column 1</th><th>Column 2</th></tr>
              <tr><td>Data 1</td><td>Data 2</td></tr>
            </table>
          </div>
        </div>
      `;
      document.body.appendChild(testContent);
    });
    
    // Test 1: Simulate print preview (media query change)
    await page.emulateMedia({ media: "print" });
    
    const printPreviewStyles = await page.evaluate(() => {
      const elements = {
        container: document.querySelector(".print-sensitive"),
        chartContainer: document.querySelector(".chart-container"),
        dataGrid: document.querySelector(".data-grid")
      };
      
      const styles = {};
      Object.keys(elements).forEach(key => {
        if (elements[key]) {
          const computed = window.getComputedStyle(elements[key]);
          styles[key] = {
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            display: computed.display,
            visibility: computed.visibility
          };
        }
      });
      
      return { type: "preview", styles };
    });
    
    // Reset to screen media
    await page.emulateMedia({ media: "screen" });
    
    // Test 2: Simulate actual print preparation (window.print() call)
    const actualPrintStyles = await page.evaluate(() => {
      // Simulate print event
      const beforePrintEvent = new Event("beforeprint");
      window.dispatchEvent(beforePrintEvent);
      
      // Check if any special print preparation happened
      const elements = {
        container: document.querySelector(".print-sensitive"),
        chartContainer: document.querySelector(".chart-container"),
        dataGrid: document.querySelector(".data-grid")
      };
      
      const styles = {};
      Object.keys(elements).forEach(key => {
        if (elements[key]) {
          const computed = window.getComputedStyle(elements[key]);
          styles[key] = {
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            display: computed.display,
            visibility: computed.visibility
          };
        }
      });
      
      return { type: "actual", styles };
    });
    
    // EXPECTED FAILURE: Print event handling not implemented
    // Should have different behavior for preview vs actual print
    expect(printPreviewStyles.styles.container.backgroundColor).not.toBe(actualPrintStyles.styles.container.backgroundColor);
  });

  test("T016.5: Page break behavior with themed content", async () => {
    // Nyuk-nyuk-nyuk! Test page breaks don't mess up the theme!
    
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      
      // Create long content that would span multiple pages
      const longContent = document.createElement("div");
      longContent.innerHTML = `
        <div class="page-section" style="background: #2d2d2d; color: #ffffff; height: 500px;">
          <h1>Section 1</h1>
          <div class="chart-section" style="background: #1a1a1a; height: 200px; page-break-inside: avoid;">
            Chart content - no page break inside
          </div>
        </div>
        <div class="page-break-before" style="page-break-before: always; background: #2d2d2d; color: #ffffff;">
          <h1>Section 2 - New Page</h1>
          <table style="background: #333333; color: #cccccc;">
            <tr><th>Header 1</th><th>Header 2</th></tr>
            <tr><td>Data 1</td><td>Data 2</td></tr>
          </table>
        </div>
        <div class="avoid-break" style="page-break-inside: avoid; background: #2d2d2d; color: #ffffff; height: 300px;">
          <h1>Section 3 - Avoid Breaking</h1>
          <p>This section should not be split across pages</p>
        </div>
      `;
      document.body.appendChild(longContent);
    });
    
    // Switch to print media
    await page.emulateMedia({ media: "print" });
    
    const pageBreakStyles = await page.evaluate(() => {
      const elements = {
        section1: document.querySelector(".page-section"),
        chartSection: document.querySelector(".chart-section"),
        pageBreakBefore: document.querySelector(".page-break-before"),
        avoidBreak: document.querySelector(".avoid-break"),
        table: document.querySelector("table")
      };
      
      const styles = {};
      Object.keys(elements).forEach(key => {
        if (elements[key]) {
          const computed = window.getComputedStyle(elements[key]);
          styles[key] = {
            pageBreakBefore: computed.pageBreakBefore,
            pageBreakAfter: computed.pageBreakAfter,
            pageBreakInside: computed.pageBreakInside,
            backgroundColor: computed.backgroundColor,
            color: computed.color
          };
        }
      });
      
      return styles;
    });
    
    // EXPECTED FAILURE: Print page break styles not implemented
    // All sections should have light theme colors for print
    expect(pageBreakStyles.section1.backgroundColor).toMatch(/(white|rgb\(255,\s*255,\s*255\))/);
    expect(pageBreakStyles.chartSection.backgroundColor).toMatch(/(white|rgb\(255,\s*255,\s*255\))/);
    expect(pageBreakStyles.pageBreakBefore.backgroundColor).toMatch(/(white|rgb\(255,\s*255,\s*255\))/);
    expect(pageBreakStyles.table.backgroundColor).toMatch(/(white|rgb\(255,\s*255,\s*255\))/);
    
    // Page break properties should be preserved
    expect(pageBreakStyles.pageBreakBefore.pageBreakBefore).toBe("always");
    expect(pageBreakStyles.avoidBreak.pageBreakInside).toBe("avoid");
  });

  test("T016.6: Creative Edge Case - High contrast mode interaction with print", async () => {
    // Woo-woo-woo! What happens when high contrast meets print mode?
    
    // Simulate high contrast mode
    await page.evaluate(() => {
      // Force high contrast mode styles
      document.documentElement.style.setProperty("forced-colors", "active");
      document.documentElement.setAttribute("data-bs-theme", "dark");
      
      const testContent = document.createElement("div");
      testContent.innerHTML = `
        <div class="high-contrast-test" style="background: #000000; color: #ffffff; border: 1px solid #ffffff;">
          <h2 style="color: #00ff00;">High Contrast Header</h2>
          <button style="background: #ffffff; color: #000000;">High Contrast Button</button>
          <div class="chart-area" style="background: #333333; color: #ffff00;">
            Chart in High Contrast
          </div>
        </div>
      `;
      document.body.appendChild(testContent);
    });
    
    // Switch to print media while in high contrast
    await page.emulateMedia({ media: "print" });
    
    const highContrastPrintStyles = await page.evaluate(() => {
      const container = document.querySelector(".high-contrast-test");
      const header = document.querySelector(".high-contrast-test h2");
      const button = document.querySelector(".high-contrast-test button");
      const chartArea = document.querySelector(".chart-area");
      
      const getElementStyles = (element) => {
        if (!element) {return null;}
        const computed = window.getComputedStyle(element);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          borderColor: computed.borderColor,
          forcedColors: computed.forcedColors || "none"
        };
      };
      
      return {
        container: getElementStyles(container),
        header: getElementStyles(header),
        button: getElementStyles(button),
        chartArea: getElementStyles(chartArea),
        documentForcedColors: document.documentElement.style.getPropertyValue("forced-colors")
      };
    });
    
    // EXPECTED FAILURE: High contrast + print interaction not handled
    // Print should override high contrast for readability
    expect(highContrastPrintStyles.container.backgroundColor).toMatch(/(white|rgb\(255,\s*255,\s*255\))/);
    expect(highContrastPrintStyles.container.color).toMatch(/(black|rgb\(0,\s*0,\s*0\))/);
    expect(highContrastPrintStyles.button.backgroundColor).toMatch(/(white|rgb\(255,\s*255,\s*255\))/);
    expect(highContrastPrintStyles.chartArea.color).toMatch(/(black|rgb\(0,\s*0,\s*0\))/);
  });

  test("T016.7: Memory management during print preparation", async () => {
    // Soitenly need to check memory doesn't leak during print prep!
    
    const initialMemory = await page.evaluate(() => {
      if ("memory" in performance) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        };
      }
      return null;
    });
    
    // Create large themed content
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      
      for (let i = 0; i < 100; i++) {
        const element = document.createElement("div");
        element.className = "memory-test-element";
        element.style.cssText = "background: #2d2d2d; color: #ffffff; height: 100px; margin: 5px;";
        element.innerHTML = `
          <div class="chart-mockup" style="background: #1a1a1a; height: 50px;">
            Chart ${i}
          </div>
          <div class="data-mockup" style="background: #333333; height: 50px;">
            Data ${i}
          </div>
        `;
        document.body.appendChild(element);
      }
    });
    
    // Simulate multiple print preparations (theme switching back and forth)
    for (let cycle = 0; cycle < 5; cycle++) {
      await page.emulateMedia({ media: "print" });
      await page.waitForTimeout(100);
      await page.emulateMedia({ media: "screen" });
      await page.waitForTimeout(100);
    }
    
    // Force garbage collection if possible
    await page.evaluate(() => {
      if ("gc" in window) {
        window.gc();
      }
    });
    
    const finalMemory = await page.evaluate(() => {
      if ("memory" in performance) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        };
      }
      return null;
    });
    
    // Clean up test elements
    await page.evaluate(() => {
      document.querySelectorAll(".memory-test-element").forEach(el => el.remove());
    });
    
    // EXPECTED FAILURE: Memory management not optimized for print preparation
    if (initialMemory && finalMemory) {
      const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
      const memoryGrowthMB = memoryGrowth / (1024 * 1024);
      
      // Should not have significant memory growth from print cycles
      expect(memoryGrowthMB).toBeLessThan(10); // Less than 10MB growth
    }
  });

  test.afterEach(async () => {
    // Reset media emulation
    await page.emulateMedia({ media: "screen" });
    
    // Clean up any test elements
    await page.evaluate(() => {
      document.querySelectorAll("[class*=\"test\"], [id*=\"test\"]").forEach(el => {
        if (!el.id.includes("playwright")) { // Don't remove Playwright's own elements
          el.remove();
        }
      });
      
      // Reset theme
      document.documentElement.removeAttribute("data-bs-theme");
      document.documentElement.classList.remove("dark-theme");
      document.documentElement.style.removeProperty("forced-colors");
    });
  });
});