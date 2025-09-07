const { test, expect: _expect } = require("@playwright/test");

test("Debug console messages from modal", async ({ page }) => {
    // Log all console messages
    page.on("console", msg => {
        console.log(`📺 ${msg.type().toUpperCase()}: ${msg.text()}`);
    });
    
    // Navigate to page
    await page.goto("http://localhost:8080/vulnerabilities.html");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    
    // Wait for data
    await page.waitForSelector(".ag-row", { timeout: 10000 });
    
    // Click on vulnerability description link
    const vulnLinks = page.locator("a").filter({ hasText: /Cisco IOS/ });
    await vulnLinks.first().click();
    
    // Wait for modal
    await page.waitForSelector("#vulnDetailsModal", { state: "visible", timeout: 5000 });
    
    // Wait for grid to load
    await page.waitForTimeout(2000);
    
    console.log("✅ Test completed - check console output above");
});