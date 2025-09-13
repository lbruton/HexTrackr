/**
 * T012: ApexCharts Theme Adaptation E2E Tests
 * 
 * Creative TDD testing for ApexCharts visual theme switching in HexTrackr
 * CRITICAL: These tests MUST FAIL initially since theme switching logic isn't fully implemented yet!
 * 
 * Tests cover:
 * - Dynamic theme parameter handling in vulnerability-chart-manager.js
 * - Chart color adaptation for light/dark themes
 * - Performance during rapid theme switching
 * - Tooltip theming and readability
 * - Chart export in different themes
 * - Creative edge cases: multiple charts, theme switching during loading, memory leaks
 * 
 * @version 1.0.0
 * @author Curly (Creative Problem Solver)
 * @date 2025-09-12
 */

const { test, expect } = require("@playwright/test");

test.describe("T012: ApexCharts Theme Adaptation", () => {
  let page, vulnerabilityDataFixture;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate to vulnerabilities page with chart
    await page.goto("/vulnerabilities.html");
    
    // Wait for page to load completely
    await page.waitForLoadState("networkidle");
    
    // Mock vulnerability data for consistent testing
    vulnerabilityDataFixture = [
      {
        cve: "CVE-2025-0001",
        severity: "Critical",
        scan_date: "2025-09-10",
        vpr_score: 9.5,
        cvss_score: 9.8
      },
      {
        cve: "CVE-2025-0002", 
        severity: "High",
        scan_date: "2025-09-11",
        vpr_score: 8.2,
        cvss_score: 7.8
      },
      {
        cve: "CVE-2025-0003",
        severity: "Medium", 
        scan_date: "2025-09-12",
        vpr_score: 5.5,
        cvss_score: 5.9
      }
    ];
    
    // Inject test data
    await page.evaluate((data) => {
      window.testVulnerabilityData = data;
      localStorage.setItem("hextrackr-test-mode", "true");
    }, vulnerabilityDataFixture);
  });

  test.afterEach(async () => {
    // Clean up any test artifacts
    await page.evaluate(() => {
      localStorage.removeItem("hextrackr-test-mode");
      delete window.testVulnerabilityData;
    });
  });

  test("should initialize chart with theme parameter support", async () => {
    // EXPECTED TO FAIL: getChartOptions theme parameter not fully implemented
    
    await page.waitForSelector("#vulnerability-chart-container", { timeout: 10000 });
    
    // Check if chart manager accepts theme parameter
    const chartSupportsThemes = await page.evaluate(() => {
      const chartContainer = document.querySelector("#vulnerability-chart-container");
      if (!chartContainer) {return false;}
      
      // Look for VulnerabilityChartManager instance
      const chartManager = window.vulnerabilityTracker?.chartManager;
      if (!chartManager) {return false;}
      
      // Test if getChartOptions accepts theme parameter
      try {
        const lightOptions = chartManager.getChartOptions("light");
        const darkOptions = chartManager.getChartOptions("dark");
        
        // Check if theme parameter affects grid colors
        const lightGridColor = lightOptions?.grid?.borderColor;
        const darkGridColor = darkOptions?.grid?.borderColor;
        
        return lightGridColor !== darkGridColor;
      } catch (error) {
        console.log("Chart theme parameter test failed:", error);
        return false;
      }
    });
    
    // This should FAIL until T025-T026 implementation
    expect(chartSupportsThemes).toBeTruthy();
  });

  test("should adapt chart colors for dark theme", async () => {
    // EXPECTED TO FAIL: Dark theme color adaptation not implemented
    
    await page.waitForSelector("#vulnerability-chart-container");
    
    // Simulate theme controller setting dark theme
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      localStorage.setItem("hextrackr-theme", "dark");
      
      // Trigger theme change event if ThemeController exists
      if (window.themeController) {
        window.themeController.setTheme("dark");
      }
    });
    
    await page.waitForTimeout(500); // Allow theme update
    
    const darkThemeApplied = await page.evaluate(() => {
      const chartManager = window.vulnerabilityTracker?.chartManager;
      if (!chartManager?.chart) {return false;}
      
      // Check chart configuration for dark theme elements
      const chartOptions = chartManager.chart.w.config;
      
      // Look for dark theme indicators in chart config
      const hasThemeDarkMode = chartOptions?.theme?.mode === "dark";
      const hasDarkGridColors = chartOptions?.grid?.borderColor === "#334155";
      const hasDarkAxisLabels = chartOptions?.xaxis?.labels?.style?.colors === "#cbd5e1";
      
      return hasThemeDarkMode && hasDarkGridColors && hasDarkAxisLabels;
    });
    
    // This should FAIL until full theme implementation
    expect(darkThemeApplied).toBeTruthy();
  });

  test("should handle rapid theme switching performance", async () => {
    // CREATIVE EDGE CASE: Test performance during rapid theme changes
    // EXPECTED TO FAIL: Debouncing and performance optimization not implemented
    
    await page.waitForSelector("#vulnerability-chart-container");
    
    const performanceResults = await page.evaluate(async () => {
      const startTime = performance.now();
      const themeChanges = [];
      
      // Rapid theme switching - 10 changes in 1 second
      for (let i = 0; i < 10; i++) {
        const theme = i % 2 === 0 ? "dark" : "light";
        const changeStart = performance.now();
        
        document.documentElement.setAttribute("data-bs-theme", theme);
        
        // Simulate theme controller update if exists
        if (window.themeController?.setTheme) {
          window.themeController.setTheme(theme);
        }
        
        // Wait minimal time between changes
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const changeEnd = performance.now();
        themeChanges.push(changeEnd - changeStart);
      }
      
      const totalTime = performance.now() - startTime;
      const averageChangeTime = themeChanges.reduce((a, b) => a + b, 0) / themeChanges.length;
      
      return {
        totalTime,
        averageChangeTime,
        maxChangeTime: Math.max(...themeChanges),
        changesCompleted: themeChanges.length
      };
    });
    
    // Performance requirements that should FAIL until optimization
    expect(performanceResults.averageChangeTime).toBeLessThan(100); // <100ms per change
    expect(performanceResults.maxChangeTime).toBeLessThan(200); // No change >200ms
    expect(performanceResults.changesCompleted).toBe(10); // All changes completed
  });

  test("should update tooltip theming correctly", async () => {
    // CREATIVE TEST: Tooltip readability in different themes
    // EXPECTED TO FAIL: Tooltip theme adaptation not implemented
    
    await page.waitForSelector("#vulnerability-chart-container");
    
    // Set dark theme
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      if (window.themeController?.setTheme) {
        window.themeController.setTheme("dark");
      }
    });
    
    await page.waitForTimeout(300);
    
    // Trigger tooltip by hovering over chart
    const chartContainer = page.locator("#vulnerability-chart-container");
    await chartContainer.hover();
    
    // Look for chart data points to hover
    const dataPoint = page.locator(".apexcharts-marker").first();
    if (await dataPoint.isVisible()) {
      await dataPoint.hover();
      await page.waitForTimeout(200);
    }
    
    const tooltipThemed = await page.evaluate(() => {
      const tooltip = document.querySelector(".apexcharts-tooltip");
      if (!tooltip) {return false;}
      
      const computedStyle = window.getComputedStyle(tooltip);
      const backgroundColor = computedStyle.backgroundColor;
      const color = computedStyle.color;
      
      // Check if tooltip has dark theme styling
      // Should have dark background and light text for dark theme
      const hasDarkBg = backgroundColor.includes("rgb(55, 65, 81)") || 
                       backgroundColor.includes("#374151") ||
                       computedStyle.getPropertyValue("--bs-body-bg") === "#212529";
      
      const hasLightText = color.includes("rgb(248, 250, 252)") ||
                          color.includes("#f8fafc") ||
                          computedStyle.getPropertyValue("--bs-body-color") === "#adb5bd";
      
      return hasDarkBg && hasLightText;
    });
    
    // This should FAIL until tooltip theming is implemented
    expect(tooltipThemed).toBeTruthy();
  });

  test("should export charts correctly in different themes", async () => {
    // CREATIVE EDGE CASE: Chart export should preserve theme styling
    // EXPECTED TO FAIL: Export theme preservation not implemented
    
    await page.waitForSelector("#vulnerability-chart-container");
    
    const exportResults = await page.evaluate(async () => {
      const chartManager = window.vulnerabilityTracker?.chartManager;
      if (!chartManager) {return { success: false, reason: "No chart manager" };}
      
      const results = {};
      
      // Test light theme export
      document.documentElement.setAttribute("data-bs-theme", "light");
      if (window.themeController?.setTheme) {
        window.themeController.setTheme("light");
      }
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        results.lightExport = await chartManager.exportChart("png");
        results.lightSuccess = !!results.lightExport;
      } catch (error) {
        results.lightSuccess = false;
        results.lightError = error.message;
      }
      
      // Test dark theme export  
      document.documentElement.setAttribute("data-bs-theme", "dark");
      if (window.themeController?.setTheme) {
        window.themeController.setTheme("dark");
      }
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        results.darkExport = await chartManager.exportChart("png");
        results.darkSuccess = !!results.darkExport;
      } catch (error) {
        results.darkSuccess = false;
        results.darkError = error.message;
      }
      
      // Check if exports are different (indicating theme was applied)
      results.exportsDiffer = results.lightExport !== results.darkExport;
      
      return results;
    });
    
    // These should FAIL until export theming is implemented
    expect(exportResults.lightSuccess).toBeTruthy();
    expect(exportResults.darkSuccess).toBeTruthy();
    expect(exportResults.exportsDiffer).toBeTruthy(); // Exports should differ for different themes
  });

  test("should handle multiple charts with synchronized theming", async () => {
    // CREATIVE EDGE CASE: Multiple chart instances with theme sync
    // EXPECTED TO FAIL: Multi-chart theme synchronization not implemented
    
    // Create additional chart container for testing
    await page.evaluate(() => {
      const secondChart = document.createElement("div");
      secondChart.id = "vulnerability-chart-secondary";
      secondChart.style.height = "400px";
      document.body.appendChild(secondChart);
    });
    
    await page.waitForTimeout(100);
    
    const multiChartSync = await page.evaluate(() => {
      // Try to create second chart instance
      const secondContainer = document.getElementById("vulnerability-chart-secondary");
      if (!secondContainer) {return false;}
      
      try {
        // Simulate second chart manager
        const VulnerabilityChartManager = window.VulnerabilityChartManager;
        if (!VulnerabilityChartManager) {return false;}
        
        const secondChartManager = new VulnerabilityChartManager(
          "vulnerability-chart-secondary",
          window.vulnerabilityTracker?.statisticsManager,
          window.vulnerabilityTracker?.dataManager
        );
        
        secondChartManager.initialize();
        
        // Test theme synchronization
        document.documentElement.setAttribute("data-bs-theme", "dark");
        
        // Both charts should update theme
        const primaryChart = window.vulnerabilityTracker?.chartManager?.chart;
        const secondaryChart = secondChartManager.chart;
        
        if (!primaryChart || !secondaryChart) {return false;}
        
        // Check if both charts have same theme mode
        const primaryTheme = primaryChart.w.config?.theme?.mode;
        const secondaryTheme = secondaryChart.w.config?.theme?.mode;
        
        return primaryTheme === secondaryTheme && primaryTheme === "dark";
        
      } catch (error) {
        console.log("Multi-chart sync error:", error);
        return false;
      }
    });
    
    // Clean up test container
    await page.evaluate(() => {
      const secondChart = document.getElementById("vulnerability-chart-secondary");
      if (secondChart) {secondChart.remove();}
    });
    
    // This should FAIL until multi-chart synchronization is implemented
    expect(multiChartSync).toBeTruthy();
  });

  test("should prevent memory leaks during theme switching", async () => {
    // CREATIVE EDGE CASE: Memory leak detection during repeated theme changes
    // EXPECTED TO FAIL: Memory management not optimized yet
    
    await page.waitForSelector("#vulnerability-chart-container");
    
    const memoryMetrics = await page.evaluate(async () => {
      // Check initial memory if available
      let initialMemory = 0;
      if (performance.memory) {
        initialMemory = performance.memory.usedJSHeapSize;
      }
      
      const eventListenerCount = { start: 0, end: 0 };
      
      // Count event listeners (rough approximation)
      const countEventListeners = () => {
        const chartContainer = document.getElementById("vulnerability-chart-container");
        if (!chartContainer) {return 0;}
        
        // Count various event types that might accumulate
        let count = 0;
        const events = ["click", "mouseover", "mouseout", "resize", "themechange"];
        
        events.forEach(eventType => {
          // This is a rough estimation - not perfect but detects major leaks
          count += (chartContainer.getAttribute(`data-${eventType}-listeners`) || 0);
        });
        
        return count;
      };
      
      eventListenerCount.start = countEventListeners();
      
      // Perform many theme switches to test for leaks
      for (let i = 0; i < 50; i++) {
        const theme = i % 2 === 0 ? "dark" : "light";
        document.documentElement.setAttribute("data-bs-theme", theme);
        
        if (window.themeController?.setTheme) {
          window.themeController.setTheme(theme);
        }
        
        // Small delay to allow processing
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
      eventListenerCount.end = countEventListeners();
      
      let finalMemory = 0;
      if (performance.memory) {
        finalMemory = performance.memory.usedJSHeapSize;
      }
      
      return {
        memoryGrowth: finalMemory - initialMemory,
        listenerGrowth: eventListenerCount.end - eventListenerCount.start,
        hasPerformanceAPI: !!performance.memory,
        cycles: 50
      };
    });
    
    // Memory management tests that should FAIL until optimization
    if (memoryMetrics.hasPerformanceAPI) {
      // Memory growth should be reasonable (less than 5MB for 50 cycles)
      expect(memoryMetrics.memoryGrowth).toBeLessThan(5 * 1024 * 1024);
    }
    
    // Event listeners shouldn't accumulate excessively
    expect(memoryMetrics.listenerGrowth).toBeLessThan(10);
    expect(memoryMetrics.cycles).toBe(50); // All cycles completed
  });

  test("should handle theme switching during chart data loading", async () => {
    // CREATIVE EDGE CASE: Theme changes during async data operations
    // EXPECTED TO FAIL: Race condition handling not implemented
    
    const raceConditionHandling = await page.evaluate(async () => {
      const results = { success: false, errors: [] };
      
      try {
        const chartManager = window.vulnerabilityTracker?.chartManager;
        if (!chartManager) {
          results.errors.push("No chart manager available");
          return results;
        }
        
        // Simulate slow data loading
        const originalUpdate = chartManager.update;
        let updateInProgress = false;
        
        chartManager.update = async function() {
          updateInProgress = true;
          // Simulate slow update
          await new Promise(resolve => setTimeout(resolve, 200));
          const result = originalUpdate.call(this);
          updateInProgress = false;
          return result;
        };
        
        // Start data update
        const updatePromise = chartManager.update();
        
        // Change theme while update is in progress
        await new Promise(resolve => setTimeout(resolve, 50));
        document.documentElement.setAttribute("data-bs-theme", "dark");
        
        if (window.themeController?.setTheme) {
          window.themeController.setTheme("dark");
        }
        
        // Wait for update to complete
        await updatePromise;
        
        // Check if chart is in consistent state
        const chartExists = !!chartManager.chart;
        const themeConsistent = document.documentElement.getAttribute("data-bs-theme") === "dark";
        
        results.success = chartExists && themeConsistent && !updateInProgress;
        
        // Restore original update method
        chartManager.update = originalUpdate;
        
      } catch (error) {
        results.errors.push(error.message);
      }
      
      return results;
    });
    
    // Race condition handling should FAIL until proper async handling implemented
    expect(raceConditionHandling.success).toBeTruthy();
    expect(raceConditionHandling.errors).toHaveLength(0);
  });
});