const { test, expect: _expect } = require("@playwright/test");

test.describe("Debug Aggregation Logic", () => {
    test("should debug aggregation logic with console output", async ({ page }) => {
        // Navigate to page
        await page.goto("http://localhost:8080/vulnerabilities.html");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);
        
        // Listen to console messages
        page.on("console", msg => {
            if (msg.text().includes("Found") || msg.text().includes("matching") || msg.text().includes("vulnerability")) {
                console.log(`🔍 CONSOLE: ${msg.text()}`);
            }
        });
        
        // Wait for AG Grid rows
        await page.waitForSelector(".ag-row", { timeout: 10000 });
        
        // Check what vulnerabilities we have in the data
        const vulnData = await page.evaluate(() => {
            if (!window.vulnManager || !window.vulnManager.dataManager) {
                return { error: "No vulnerability manager" };
            }
            
            const vulns = window.vulnManager.dataManager.vulnerabilities || [];
            const cveGroups = {};
            
            vulns.forEach(vuln => {
                const key = vuln.cve || vuln.description || vuln.plugin_name || "unknown";
                if (!cveGroups[key]) {
                    cveGroups[key] = [];
                }
                cveGroups[key].push(vuln.hostname);
            });
            
            // Find vulnerabilities that affect multiple devices
            const multiDeviceVulns = Object.entries(cveGroups).filter(([_key, hostnames]) => hostnames.length > 1);
            
            return {
                totalVulns: vulns.length,
                uniqueVulns: Object.keys(cveGroups).length,
                multiDeviceVulns: multiDeviceVulns.map(([key, hostnames]) => ({
                    key,
                    deviceCount: hostnames.length,
                    devices: [...new Set(hostnames)]
                }))
            };
        });
        
        console.log("📊 Vulnerability Analysis:", JSON.stringify(vulnData, null, 2));
        
        // If we have multi-device vulnerabilities, test one
        if (vulnData.multiDeviceVulns && vulnData.multiDeviceVulns.length > 0) {
            const testVuln = vulnData.multiDeviceVulns[0];
            console.log(`🎯 Testing vulnerability: ${testVuln.key} (should affect ${testVuln.deviceCount} devices)`);
            
            // Find a link for this vulnerability
            const vulnLinks = await page.locator("a").filter({ hasText: new RegExp(testVuln.key) }).all();
            if (vulnLinks.length > 0) {
                // Click on the first link for this multi-device vulnerability
                await vulnLinks[0].click();
                
                // Wait for modal
                await page.waitForSelector("#vulnDetailsModal", { state: "visible", timeout: 5000 });
                
                // Wait for asset grid to load
                await page.waitForSelector("#vuln-affected-assets-grid .ag-row", { timeout: 5000 });
                
                const assetRows = page.locator("#vuln-affected-assets-grid .ag-row");
                const actualCount = await assetRows.count();
                
                console.log(`📋 Expected devices: ${testVuln.deviceCount}, Modal shows: ${actualCount}`);
                console.log(`📋 Expected devices: ${testVuln.devices.join(", ")}`);
                
                // Get actual device names from modal
                const modalDevices = await assetRows.locator("[col-id=\"hostname\"]").allTextContents();
                console.log(`📋 Modal devices: ${modalDevices.join(", ")}`);
                
                // Check if aggregation is working
                if (actualCount === testVuln.deviceCount) {
                    console.log("✅ Aggregation working correctly!");
                } else {
                    console.log("❌ Aggregation not working - showing only single device");
                }
            }
        } else {
            console.log("ℹ️ No multi-device vulnerabilities found in current dataset");
        }
    });
});