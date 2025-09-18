const { test, expect } = require("@playwright/test");

test.describe("Documentation Portal Diagnostic", () => {
    test("Check console errors and navigation", async ({ page }) => {
        // Listen for console messages
        const consoleMessages = [];
        page.on("console", msg => {
            consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
        });

        // Navigate to documentation portal
        await page.goto("http://localhost:8989/docs-html/index.html", {
            waitUntil: "domcontentloaded",
            timeout: 30000
        });

        // Wait for JavaScript to initialize
        await page.waitForTimeout(2000);

        console.log("\n=== Console Messages ===");
        consoleMessages.forEach(msg => console.log(msg));

        // Check if navigation is populated
        const navItems = await page.locator("#docsNavigation a[data-section]").count();
        console.log(`\n=== Navigation Items Found: ${navItems} ===`);

        // Get all navigation items
        const navElements = await page.locator("#docsNavigation a[data-section]").all();
        for (const element of navElements) {
            const section = await element.getAttribute("data-section");
            const text = await element.textContent();
            console.log(`  - ${text.trim()}: data-section="${section}"`);
        }

        // Try to click Overview
        console.log("\n=== Attempting to click Overview ===");
        const overviewLink = page.locator('a[data-section="overview"]').first();
        const overviewExists = await overviewLink.count();
        console.log(`Overview link exists: ${overviewExists > 0}`);

        if (overviewExists > 0) {
            // Click and wait for content to change
            await overviewLink.click();
            await page.waitForTimeout(2000);

            // Check console for new errors
            console.log("\n=== Console Messages After Click ===");
            consoleMessages.forEach(msg => console.log(msg));

            // Check current content
            const contentArea = page.locator("#contentArea");
            const contentText = await contentArea.textContent();
            console.log(`\n=== Content Area (first 200 chars) ===`);
            console.log(contentText.substring(0, 200));

            // Check for h1 title
            const h1Elements = await page.locator("h1").all();
            console.log(`\n=== H1 Elements Found: ${h1Elements.length} ===`);
            for (const h1 of h1Elements) {
                const text = await h1.textContent();
                console.log(`  H1: "${text.trim()}"`);
            }
        } else {
            console.log("⚠️ Overview link not found!");
        }

        // Check current URL
        const currentUrl = page.url();
        console.log(`\n=== Current URL: ${currentUrl} ===`);
    });
});