const { test, expect: _expect } = require("@playwright/test");

test("DOM inspection", async ({ page }) => {
    await page.goto("http://localhost:8080/vulnerabilities.html");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000); // Give extra time for data loading
    
    // Take full screenshot
    await page.screenshot({ path: "test-results/dom-inspection.png", fullPage: true });
    
    // Check what elements exist
    const elements = await page.evaluate(() => {
        return {
            tables: document.querySelectorAll("table").length,
            tableRows: document.querySelectorAll("table tbody tr").length,
            agGridWrappers: document.querySelectorAll(".ag-grid-wrapper").length,
            agRows: document.querySelectorAll(".ag-row").length,
            vulnDataWorkspace: document.querySelector("#vulnerability-data-workspace") ? "found" : "not found",
            vulnTable: document.querySelector("#vulnerabilities-table") ? "found" : "not found",
            vulnTableContainer: document.querySelector("#vulnerabilities-table-container") ? "found" : "not found",
            hasVulnManager: typeof window.vulnManager !== "undefined",
            dataLength: window.vulnManager && window.vulnManager.dataManager ? window.vulnManager.dataManager.vulnerabilities.length : 0
        };
    });
    
    console.log("DOM Elements found:", elements);
    
    // Check for vulnerability description links
    const vulnLinks = await page.evaluate(() => {
        const allLinks = document.querySelectorAll("a");
        const vulnLinks = [];
        allLinks.forEach((link, idx) => {
            if (link.textContent && link.textContent.includes("Cisco") || link.onclick) {
                vulnLinks.push({
                    index: idx,
                    text: link.textContent.substring(0, 50) + "...",
                    onclick: link.onclick ? link.onclick.toString().substring(0, 100) : "none",
                    href: link.href
                });
            }
        });
        return vulnLinks;
    });
    
    console.log("Found vulnerability links:", vulnLinks);
    
    expect(elements.hasVulnManager).toBe(true);
});