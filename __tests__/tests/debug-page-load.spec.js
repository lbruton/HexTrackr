const { test, expect: _expect } = require("@playwright/test");

test.describe("Debug Page Loading", () => {
    test("should debug page loading and data presence", async ({ page }) => {
        console.log("Starting page navigation...");
        
        // Navigate to the vulnerabilities page
        await page.goto("http://localhost:8080/vulnerabilities.html");
        console.log("Page navigation complete");
        
        // Wait for basic page load
        await page.waitForLoadState("networkidle");
        console.log("Network idle state reached");
        
        // Take a screenshot to see what's on the page
        await page.screenshot({ path: "test-results/page-debug.png", fullPage: true });
        console.log("Screenshot taken");
        
        // Check if the table container exists
        const tableContainer = page.locator("#vulnerabilities-table-container");
        console.log("Table container exists:", await tableContainer.count());
        
        // Check if AG Grid wrapper exists
        const agGridWrapper = page.locator(".ag-grid-wrapper");
        console.log("AG Grid wrapper count:", await agGridWrapper.count());
        
        // Check if any data is visible
        const agRows = page.locator(".ag-row");
        console.log("AG rows count:", await agRows.count());
        
        // Check for loading indicators
        const loadingSpinner = page.locator(".spinner-border, .loading");
        console.log("Loading indicators count:", await loadingSpinner.count());
        
        // Check if vulnerabilities data is loaded by inspecting global data
        const dataStatus = await page.evaluate(() => {
            return {
                vulnManagerExists: typeof window.vulnManager !== "undefined",
                dataManagerExists: window.vulnManager && typeof window.vulnManager.dataManager !== "undefined",
                hasData: window.vulnManager && window.vulnManager.dataManager && window.vulnManager.dataManager.vulnerabilities && window.vulnManager.dataManager.vulnerabilities.length > 0,
                dataLength: window.vulnManager && window.vulnManager.dataManager && window.vulnManager.dataManager.vulnerabilities ? window.vulnManager.dataManager.vulnerabilities.length : 0
            };
        });
        
        console.log("Data status:", dataStatus);
    });
});