const { test, expect: _expect } = require("@playwright/test");

test.describe("Modal Aggregation Tests", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the vulnerabilities page
        await page.goto("http://localhost:8080/vulnerabilities.html");
        await page.waitForLoadState("networkidle");
        
        // Wait for the grid to be ready and data to load
        await page.waitForSelector(".ag-grid-wrapper", { timeout: 10000 });
        await page.waitForSelector(".ag-row", { timeout: 15000 });
        
        // Wait a bit for statistics to load
        await page.waitForTimeout(2000);
    });

    test("vulnerability modal should show all affected devices for same vulnerability", async ({ page }) => {
        // Find the first vulnerability description cell and click it
        const descCell = page.locator("[col-id=\"plugin_name\"]").first();
        await expect(descCell).toBeVisible();
        
        // Get the text content to know what vulnerability we're testing
        const vulnerabilityText = await descCell.textContent();
        console.log("Testing vulnerability:", vulnerabilityText);
        
        // Click to open modal
        await descCell.click();
        
        // Wait for modal to open
        await page.waitForSelector("#vulnDetailsModal", { state: "visible", timeout: 10000 });
        
        // Verify modal title
        await expect(page.locator("#vulnDetailsModal h5")).toContainText("Vulnerability Details");
        
        // Check the affected assets grid
        const assetGrid = page.locator("#vuln-affected-assets-grid");
        await expect(assetGrid).toBeVisible();
        
        // Wait for the grid to load data
        await page.waitForSelector("#vuln-affected-assets-grid .ag-row", { timeout: 10000 });
        
        // Count the number of affected assets
        const assetRows = page.locator("#vuln-affected-assets-grid .ag-row");
        const rowCount = await assetRows.count();
        
        console.log(`Found ${rowCount} affected assets in modal`);
        
        // Check the device count in the header - it should show multiple devices
        const deviceCountText = await page.locator("#vulnDetailsModal").getByText(/\d+ devices affected/).textContent();
        console.log("Device count header:", deviceCountText);
        
        // For CVE-2017-3881 (Cisco vulnerability), we expect 24 devices
        if (vulnerabilityText.includes("Cisco IOS Cluster Management Protocol")) {
            expect(rowCount).toBe(24);
            expect(deviceCountText).toContain("24 devices affected");
        } else {
            // For any vulnerability, should have at least 1 device
            expect(rowCount).toBeGreaterThan(0);
        }
        
        // Verify we have different hostnames (aggregation working)
        const hostnames = [];
        for (let i = 0; i < Math.min(rowCount, 5); i++) {
            const row = assetRows.nth(i);
            const hostname = await row.locator("[col-id=\"hostname\"]").textContent();
            hostnames.push(hostname);
        }
        
        // Should have different hostnames if aggregation is working
        const uniqueHostnames = [...new Set(hostnames)];
        if (rowCount > 1) {
            expect(uniqueHostnames.length).toBeGreaterThan(1);
        }
        
        console.log("Sample hostnames:", hostnames);
        
        // Close modal
        const closeBtn = page.locator("#vulnDetailsModal .btn-close");
        await closeBtn.click();
        
        // Wait for modal to close
        await page.waitForSelector("#vulnDetailsModal", { state: "hidden" });
    });

    test("device modal should show all vulnerabilities for same device", async ({ page }) => {
        // Find the first hostname cell and click it
        const hostnameCell = page.locator("[col-id=\"hostname\"]").first();
        await expect(hostnameCell).toBeVisible();
        
        // Get the hostname we're testing
        const hostname = await hostnameCell.textContent();
        console.log("Testing device:", hostname);
        
        // Click to open device modal
        await hostnameCell.click();
        
        // Wait for modal to open
        await page.waitForSelector("#deviceSecurityModal", { state: "visible", timeout: 10000 });
        
        // Check the vulnerabilities grid
        const vulnGrid = page.locator("#device-vulnerabilities-grid");
        await expect(vulnGrid).toBeVisible();
        
        // Wait for the grid to load data
        await page.waitForSelector("#device-vulnerabilities-grid .ag-row", { timeout: 10000 });
        
        // Count the number of vulnerabilities
        const vulnRows = page.locator("#device-vulnerabilities-grid .ag-row");
        const vulnCount = await vulnRows.count();
        
        console.log(`Found ${vulnCount} vulnerabilities for device ${hostname}`);
        
        // Take screenshot
        await page.screenshot({ path: ".playwright-mcp/device-modal-test.png" });
        
        expect(vulnCount).toBeGreaterThan(0);
        
        // Close modal
        const closeBtn = page.locator("#deviceSecurityModal .btn-close");
        await closeBtn.click();
        
        // Wait for modal to close
        await page.waitForSelector("#deviceSecurityModal", { state: "hidden" });
    });

    test("verify data consistency between main table and modals", async ({ page }) => {
        // Get data from main table for comparison
        const mainTableRows = page.locator(".ag-row");
        const firstRowData = {
            hostname: await mainTableRows.first().locator("[col-id=\"hostname\"]").textContent(),
            vulnerability: await mainTableRows.first().locator("[col-id=\"plugin_name\"]").textContent(),
            severity: await mainTableRows.first().locator("[col-id=\"severity\"]").textContent()
        };
        
        console.log("Main table first row:", firstRowData);
        
        // Test vulnerability modal consistency
        const vulnCell = mainTableRows.first().locator("[col-id=\"plugin_name\"]");
        await vulnCell.click();
        
        await page.waitForSelector("#vulnDetailsModal", { state: "visible" });
        
        // Check if the same hostname appears in affected assets
        const _assetGrid = page.locator("#vuln-affected-assets-grid");
        await page.waitForSelector("#vuln-affected-assets-grid .ag-row");
        
        const assetRows = page.locator("#vuln-affected-assets-grid .ag-row");
        const assetHostnames = [];
        const rowCount = await assetRows.count();
        
        for (let i = 0; i < rowCount; i++) {
            const hostname = await assetRows.nth(i).locator("[col-id=\"hostname\"]").textContent();
            assetHostnames.push(hostname);
        }
        
        console.log("Hostnames in vulnerability modal:", assetHostnames);
        
        // The original hostname should be in the affected assets
        expect(assetHostnames).toContain(firstRowData.hostname);
        
        // Close modal
        await page.locator("#vulnDetailsModal .btn-close").click();
        await page.waitForSelector("#vulnDetailsModal", { state: "hidden" });
    });
});