const { test, expect: _expect } = require("@playwright/test");

test.describe("Working Modal Test", () => {
    test("should test modal aggregation with correct selectors", async ({ page }) => {
        // Navigate to page
        await page.goto("http://localhost:8080/vulnerabilities.html");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000); // Extra time for data loading
        
        // Wait for AG Grid rows to be present
        await page.waitForSelector(".ag-row", { timeout: 10000 });
        
        // Find vulnerability description links (the ones that should open the modal)
        const vulnDescLinks = page.locator("a").filter({ hasText: /Cisco IOS/ });
        const linkCount = await vulnDescLinks.count();
        console.log(`Found ${linkCount} vulnerability description links`);
        
        expect(linkCount).toBeGreaterThan(0);
        
        // Click on the first vulnerability description link
        console.log("Clicking on first vulnerability description link...");
        await vulnDescLinks.first().click();
        
        // Wait for modal to open
        await page.waitForSelector("#vulnDetailsModal", { state: "visible", timeout: 5000 });
        console.log("Modal opened successfully");
        
        // Take screenshot of modal
        await page.screenshot({ path: "test-results/modal-opened-working.png", fullPage: true });
        
        // Test 1: Check Plugin Name field format
        const pluginNameValue = page.locator("#vulnInfo").getByText("Plugin Name:").locator("..").locator(".fw-bold");
        const pluginText = await pluginNameValue.textContent();
        console.log(`Plugin Name: "${pluginText}"`);
        
        // Plugin Name should be CVE, Cisco ID, or Plugin ID (not full description)
        const isValidFormat = pluginText.startsWith("CVE-") || 
                             pluginText.startsWith("cisco-sa-") || 
                             pluginText.startsWith("Plugin ");
        expect(isValidFormat).toBe(true);
        
        // Test 2: Check affected assets aggregation
        const assetGrid = page.locator("#vuln-affected-assets-grid");
        await expect(assetGrid).toBeVisible();
        console.log("Asset grid is visible");
        
        // Wait for AG Grid in modal to initialize
        await page.waitForSelector("#vuln-affected-assets-grid .ag-row", { timeout: 5000 });
        
        const assetRows = assetGrid.locator(".ag-row");
        const assetCount = await assetRows.count();
        console.log(`Found ${assetCount} affected assets in modal`);
        
        expect(assetCount).toBeGreaterThan(0);
        
        // Test 3: Check device count consistency
        const deviceCountElement = page.locator(".card-body .h3").nth(1);
        const deviceCountText = await deviceCountElement.textContent();
        const deviceCount = parseInt(deviceCountText);
        console.log(`Device count card shows: ${deviceCount}`);
        console.log(`Asset grid shows: ${assetCount} rows`);
        
        // The counts should match
        expect(deviceCount).toBe(assetCount);
        
        // Test 4: Verify we're showing multiple devices for this shared vulnerability
        if (assetCount > 1) {
            console.log(`✅ SUCCESS: Modal shows ${assetCount} affected devices (aggregation working!)`);
            
            // Get device names
            const deviceNames = await assetRows.locator("[col-id=\"hostname\"], td:first-child").allTextContents();
            console.log(`Affected devices: ${deviceNames.join(", ")}`);
            
            // All device names should be different
            const uniqueDevices = new Set(deviceNames);
            expect(uniqueDevices.size).toBe(assetCount);
            
        } else {
            console.log(`ℹ️ INFO: This vulnerability affects only 1 device: ${assetCount}`);
        }
        
        // Test 5: Check that description field shows full text
        const descriptionValue = page.locator("#vulnInfo").getByText("Description:").locator("..").locator("small");
        const descText = await descriptionValue.textContent();
        console.log(`Description length: ${descText.length} characters`);
        
        // Description should be longer than Plugin Name (Plugin Name is now parsed ID)
        expect(descText.length).toBeGreaterThan(pluginText.length);
        
        console.log("✅ All modal tests passed!");
    });
});