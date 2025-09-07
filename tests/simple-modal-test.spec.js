const { test, expect: _expect } = require("@playwright/test");

test.describe("Simple Modal Test", () => {
    test("should open vulnerability modal from HTML table", async ({ page }) => {
        // Navigate to page
        await page.goto("http://localhost:8080/vulnerabilities.html");
        await page.waitForLoadState("networkidle");
        
        // Wait for table to load
        await page.waitForSelector("table tbody tr", { timeout: 10000 });
        
        // Take a screenshot to see current state
        await page.screenshot({ path: "test-results/before-modal-click.png", fullPage: true });
        
        // Count rows
        const rows = page.locator("table tbody tr");
        const rowCount = await rows.count();
        console.log(`Found ${rowCount} table rows`);
        
        // Look for clickable description links
        const descCells = page.locator("table tbody tr td:last-child a");
        const descCount = await descCells.count();
        console.log(`Found ${descCount} description links`);
        
        if (descCount > 0) {
            // Click on first description link
            console.log("Clicking on first description link...");
            await descCells.first().click();
            
            // Wait a moment
            await page.waitForTimeout(1000);
            
            // Check if modal opened
            const modal = page.locator("#vulnDetailsModal");
            const isVisible = await modal.isVisible();
            console.log(`Modal visible: ${isVisible}`);
            
            if (isVisible) {
                // Take screenshot of modal
                await page.screenshot({ path: "test-results/modal-opened.png", fullPage: true });
                
                // Check Plugin Name field
                const pluginName = await page.locator("#vulnInfo").getByText("Plugin Name:").locator("..").locator(".fw-bold").textContent();
                console.log(`Plugin Name: "${pluginName}"`);
                
                // Check affected assets
                const assetGrid = page.locator("#vuln-affected-assets-grid");
                const hasGrid = await assetGrid.isVisible();
                console.log(`Asset grid visible: ${hasGrid}`);
                
                if (hasGrid) {
                    const assetRows = assetGrid.locator(".ag-row, tr");
                    const assetCount = await assetRows.count();
                    console.log(`Asset rows: ${assetCount}`);
                }
            }
        }
        
        expect(descCount).toBeGreaterThan(0);
    });
});