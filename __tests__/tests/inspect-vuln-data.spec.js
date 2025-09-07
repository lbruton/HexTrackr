const { test, expect: _expect } = require("@playwright/test");

test("Inspect vulnerability data structure", async ({ page }) => {
    await page.goto("http://localhost:8080/vulnerabilities.html");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    
    // Wait for data to load
    await page.waitForSelector(".ag-row", { timeout: 10000 });
    
    // Inspect the actual vulnerability data structure
    const vulnDataStructure = await page.evaluate(() => {
        if (!window.vulnManager || !window.vulnManager.dataManager) {
            return { error: "No vulnerability manager" };
        }
        
        const vulns = window.vulnManager.dataManager.vulnerabilities || [];
        const sampleVuln = vulns[0];
        
        return {
            totalVulns: vulns.length,
            sampleVulnKeys: Object.keys(sampleVuln || {}),
            sampleVuln: sampleVuln,
            cveExample: vulns.find(v => v.cve === "CVE-2017-3881"),
        };
    });
    
    console.log("Vulnerability Data Structure:", JSON.stringify(vulnDataStructure, null, 2));
    
    // Also check what's stored in vulnModalData after clicking
    const vulnLinks = page.locator("a").filter({ hasText: /Cisco IOS/ });
    await vulnLinks.first().click();
    
    // Check vulnModalData contents
    const modalDataContents = await page.evaluate(() => {
        const modalData = window.vulnModalData || {};
        const keys = Object.keys(modalData);
        const firstKey = keys[0];
        const firstData = modalData[firstKey];
        
        return {
            totalKeys: keys.length,
            firstKey: firstKey,
            firstDataKeys: firstData ? Object.keys(firstData) : [],
            firstData: firstData
        };
    });
    
    console.log("vulnModalData Contents:", JSON.stringify(modalDataContents, null, 2));
});