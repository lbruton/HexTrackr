const { test, expect } = require("@playwright/test");

test.describe("Documentation Portal Navigation", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to documentation portal before each test
        await page.goto("http://localhost:8989/docs-html/index.html", {
            waitUntil: "domcontentloaded",
            timeout: 30000
        });
        await page.waitForTimeout(1000); // Let JS initialize
    });

    test("Overview page loads and links work", async ({ page }) => {
        console.log("\n1. Testing Overview page...");

        // Click on Overview link using data attribute
        await page.click('a[data-section="overview"]');
        await page.waitForTimeout(1000);

        // Verify page loaded - look for the documentation content H1, not the header H1
        const contentTitle = await page.locator("#contentArea h1").first().textContent();
        expect(contentTitle).toContain("HexTrackr Documentation");
        console.log("   ✓ Overview page loaded");

        // Check for main content
        const content = await page.locator("#contentArea").textContent();
        expect(content).toBeTruthy();
        console.log("   ✓ Overview content present");
    });

    test("API Reference dropdown and navigation", async ({ page }) => {
        console.log("\n2. Testing API Reference dropdown...");

        // Click on API Reference dropdown toggle
        const apiToggle = page.locator('a[data-bs-toggle="collapse"]:has-text("API Reference")');
        await apiToggle.click();
        await page.waitForTimeout(500);

        // Check if dropdown opened
        const apiDropdown = page.locator('#collapse-api-reference');
        await expect(apiDropdown).toBeVisible();
        console.log("   ✓ API Reference dropdown opened");

        // Click on Backend API
        await page.click('a[data-section="api-reference/backend-api"]');
        await page.waitForTimeout(1000);

        // Check if page loaded - look for the content area H1
        const title = await page.locator("#contentArea h1").first().textContent();
        expect(title).toContain("Backend API");
        console.log("   ✓ Backend API page loaded");

        // Verify dropdown is still open
        await expect(apiDropdown).toBeVisible();
        console.log("   ✓ Dropdown remains open after navigation");

        // Check if Backend API link is highlighted
        const backendLink = page.locator('a[data-section="api-reference/backend-api"]');
        const classes = await backendLink.getAttribute("class");
        expect(classes).toContain("active");
        console.log("   ✓ Backend API link is highlighted");
    });

    test("API sub-pages load correctly", async ({ page }) => {
        console.log("\n3. Testing API sub-pages...");

        // Open API Reference dropdown if not already open
        const apiDropdown = page.locator('#collapse-api-reference');
        const isOpen = await apiDropdown.evaluate(el => el.classList.contains('show'));
        if (!isOpen) {
            await page.click('a[data-bs-toggle="collapse"]:has-text("API Reference")');
            await page.waitForTimeout(500);
            await expect(apiDropdown).toBeVisible();
        }

        const subPages = [
            { section: "api-reference/backend-api", expectedTitle: "Backend API" },
            { section: "api-reference/frontend-api", expectedTitle: "Frontend API" },
            { section: "api-reference/middleware-config", expectedTitle: "Middleware" },
            { section: "api-reference/utilities", expectedTitle: "Utility" }
        ];

        for (const subPage of subPages) {
            console.log(`   Testing ${subPage.section}...`);

            await page.click(`a[data-section="${subPage.section}"]`);
            await page.waitForTimeout(1000);

            const title = await page.locator("#contentArea h1").first().textContent();
            expect(title).toContain(subPage.expectedTitle);
            console.log(`   ✓ ${subPage.section} loaded`);
        }
    });

    test("Architecture section navigation", async ({ page }) => {
        console.log("\n4. Testing Architecture section...");

        // Open Architecture dropdown
        await page.click('a[data-bs-toggle="collapse"]:has-text("Architecture")');
        await page.waitForTimeout(500);

        const archDropdown = page.locator('#collapse-architecture');
        await expect(archDropdown).toBeVisible();
        console.log("   ✓ Architecture dropdown opened");

        // Test Backend architecture page
        await page.click('a[data-section="architecture/backend"]');
        await page.waitForTimeout(1000);

        const title = await page.locator("#contentArea h1").first().textContent();
        expect(title).toContain("Backend Architecture");
        console.log("   ✓ Backend Architecture page loaded");
    });

    test("Guides section and User Guide TOC", async ({ page }) => {
        console.log("\n5. Testing Guides section...");

        // Open Guides dropdown
        await page.click('a[data-bs-toggle="collapse"]:has-text("Guides")');
        await page.waitForTimeout(500);

        const guidesDropdown = page.locator('#collapse-guides');
        await expect(guidesDropdown).toBeVisible();
        console.log("   ✓ Guides dropdown opened");

        // Navigate to User Guide
        await page.click('a[data-section="guides/user-guide"]');
        await page.waitForTimeout(1000);

        const title = await page.locator("#contentArea h1").first().textContent();
        expect(title).toContain("User Guide");
        console.log("   ✓ User Guide loaded");

        // Check TOC links
        const tocLinks = await page.locator('nav a[href^="#"], .toc a[href^="#"]').all();
        console.log(`   Found ${tocLinks.length} TOC links`);

        // Test a few key TOC links
        const testAnchors = ["#getting-started", "#vulnerability-management", "#ticket-management"];

        for (const anchor of testAnchors) {
            const link = page.locator(`a[href="${anchor}"]`).first();
            if (await link.count() > 0) {
                const targetId = anchor.substring(1);
                const targetElement = page.locator(`#${targetId}, h2:has-text("${targetId.replace(/-/g, " ")}")`);

                if (await targetElement.count() > 0) {
                    console.log(`   ✓ TOC link ${anchor} has valid target`);
                } else {
                    console.log(`   ⚠️ TOC link ${anchor} missing target`);
                }
            }
        }
    });

    test("Reference section navigation", async ({ page }) => {
        console.log("\n6. Testing Reference section...");

        // Open Reference dropdown - be more specific with the selector
        const refToggle = page.locator('a[data-bs-target="#collapse-reference"]').first();
        await refToggle.click();
        await page.waitForTimeout(1000); // Give more time for animation

        const refDropdown = page.locator('#collapse-reference');
        await expect(refDropdown).toBeVisible({ timeout: 5000 });
        console.log("   ✓ Reference dropdown opened");

        // Test Security page
        await page.click('a[data-section="reference/security"]');
        await page.waitForTimeout(1000);

        const title = await page.locator("#contentArea h1").first().textContent();
        expect(title).toContain("Security");
        console.log("   ✓ Security Reference page loaded");
    });

    test("Dropdown stays open and highlighting works", async ({ page }) => {
        console.log("\n7. Testing dropdown behavior...");

        // Open API Reference dropdown
        const apiToggle = page.locator('a[data-bs-toggle="collapse"]:has-text("API Reference")');
        await apiToggle.click();
        await page.waitForTimeout(500);

        // Click on Frontend API
        await page.click('a[data-section="api-reference/frontend-api"]');
        await page.waitForTimeout(1000);

        // Check dropdown is still visible
        const apiDropdown = page.locator('#collapse-api-reference');
        await expect(apiDropdown).toBeVisible();
        console.log("   ✓ Dropdown stays open after clicking item");

        // Check item is highlighted
        const frontendLink = page.locator('a[data-section="api-reference/frontend-api"]');
        const classes = await frontendLink.getAttribute("class");
        expect(classes).toContain("active");
        console.log("   ✓ Clicked item is highlighted");

        // Click another item (ensure dropdown is still open)
        const apiDropdownCheck = page.locator('#collapse-api-reference');
        await expect(apiDropdownCheck).toBeVisible();

        // Now click utilities
        await page.click('a[data-section="api-reference/utilities"]');
        await page.waitForTimeout(1000);

        // Check new item is highlighted
        const utilLink = page.locator('a[data-section="api-reference/utilities"]');
        const utilClasses = await utilLink.getAttribute("class");
        expect(utilClasses).toContain("active");
        console.log("   ✓ Highlight moves to newly clicked item");

        // Check previous item is not highlighted
        const frontendClasses = await frontendLink.getAttribute("class");
        expect(frontendClasses).not.toContain("active");
        console.log("   ✓ Previous item is no longer highlighted");
    });
});