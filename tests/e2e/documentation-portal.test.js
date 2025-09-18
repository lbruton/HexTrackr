const { test, expect } = require("@playwright/test");

test.describe("Documentation Portal Complete Test", () => {
    test.setTimeout(120000); // Increase timeout to 2 minutes

    test("Comprehensive documentation portal navigation test", async ({ page }) => {
        // Navigate to documentation portal
        await page.goto("http://localhost:8989/docs-html/", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(2000); // Give time for JavaScript to initialize

        console.log("\n=== Testing Documentation Portal ===\n");

        // Test 1: Overview Page
        console.log("1. Testing Overview Page...");
        await page.click('a[href="overview.html"]');
        await page.waitForLoadState("networkidle");

        // Check if Overview page loaded
        const overviewTitle = await page.locator("h1").first().textContent();
        expect(overviewTitle).toContain("Overview");
        console.log("   ✓ Overview page loaded successfully");

        // Get all links on Overview page
        const overviewLinks = await page.locator('main a').all();
        console.log(`   Found ${overviewLinks.length} links on Overview page`);

        for (const link of overviewLinks) {
            const href = await link.getAttribute("href");
            const text = await link.textContent();
            if (href && !href.startsWith("#") && !href.startsWith("http")) {
                console.log(`   Checking link: ${text} -> ${href}`);
                // Test if link resolves
                const response = await page.request.get(href);
                expect(response.status()).toBeLessThan(400);
            }
        }

        // Test 2: API Reference
        console.log("\n2. Testing API Reference Section...");

        // Click on API Reference dropdown
        await page.click('a[data-bs-toggle="collapse"][data-bs-target*="api-reference"]');
        await page.waitForTimeout(500); // Wait for animation

        // Check if dropdown expanded
        const apiDropdownExpanded = await page.locator('#collapse-api-reference').getAttribute("class");
        expect(apiDropdownExpanded).toContain("show");
        console.log("   ✓ API Reference dropdown opened");

        // Test API Reference index
        const apiIndexLink = await page.locator('a[data-section="api-reference/index"]').first();
        if (await apiIndexLink.count() > 0) {
            await apiIndexLink.click();
            await page.waitForLoadState("networkidle");
            const apiIndexTitle = await page.locator("h1").first().textContent();
            expect(apiIndexTitle).toContain("API");
            console.log("   ✓ API Reference index loaded");
        }

        // Test each API Reference sub-page
        const apiSubPages = [
            { name: "Backend API", file: "backend-api" },
            { name: "Frontend API", file: "frontend-api" },
            { name: "Middleware Config", file: "middleware-config" },
            { name: "Utilities", file: "utilities" }
        ];

        for (const subPage of apiSubPages) {
            console.log(`   Testing ${subPage.name}...`);

            // Navigate to sub-page
            const subPageLink = await page.locator(`a[data-section="api-reference/${subPage.file}"]`).first();
            if (await subPageLink.count() > 0) {
                await subPageLink.click();
                await page.waitForLoadState("networkidle");

                // Verify page loaded
                const pageTitle = await page.locator("h1").first().textContent();
                console.log(`     Page title: ${pageTitle}`);

                // Check for broken links on this page
                const links = await page.locator('main a[href^="#"]').all();
                console.log(`     Found ${links.length} internal links`);

                for (const link of links) {
                    const href = await link.getAttribute("href");
                    const text = await link.textContent();

                    // Check if target element exists
                    if (href && href !== "#") {
                        const targetId = href.substring(1);
                        const targetElement = await page.locator(`#${targetId}, [id="${targetId}"]`).count();
                        if (targetElement === 0) {
                            console.log(`     ⚠️ Broken link: "${text}" -> ${href}`);
                        }
                    }
                }

                console.log(`     ✓ ${subPage.name} tested`);
            }
        }

        // Test 3: Architecture Section
        console.log("\n3. Testing Architecture Section...");

        // Click on Architecture dropdown
        await page.click('a[data-bs-toggle="collapse"][data-bs-target*="architecture"]');
        await page.waitForTimeout(500);

        const archDropdownExpanded = await page.locator('#collapse-architecture').getAttribute("class");
        expect(archDropdownExpanded).toContain("show");
        console.log("   ✓ Architecture dropdown opened");

        const archSubPages = [
            "backend", "database", "frontend", "data-model", "technology-stack"
        ];

        for (const subPage of archSubPages) {
            const subPageLink = await page.locator(`a[data-section="architecture/${subPage}"]`).first();
            if (await subPageLink.count() > 0) {
                await subPageLink.click();
                await page.waitForLoadState("networkidle");
                console.log(`   ✓ Architecture/${subPage} loaded`);
            }
        }

        // Test 4: Guides Section
        console.log("\n4. Testing Guides Section...");

        await page.click('a[data-bs-toggle="collapse"][data-bs-target*="guides"]');
        await page.waitForTimeout(500);

        const guidesDropdownExpanded = await page.locator('#collapse-guides').getAttribute("class");
        expect(guidesDropdownExpanded).toContain("show");
        console.log("   ✓ Guides dropdown opened");

        const guideSubPages = ["getting-started", "user-guide"];

        for (const subPage of guideSubPages) {
            const subPageLink = await page.locator(`a[data-section="guides/${subPage}"]`).first();
            if (await subPageLink.count() > 0) {
                await subPageLink.click();
                await page.waitForLoadState("networkidle");

                // Special check for user guide TOC links
                if (subPage === "user-guide") {
                    console.log("   Checking User Guide TOC links...");
                    const tocLinks = await page.locator('a[href^="#"]').all();
                    for (const link of tocLinks) {
                        const href = await link.getAttribute("href");
                        const text = await link.textContent();
                        if (href && href !== "#") {
                            const targetId = href.substring(1);
                            const targetExists = await page.locator(`#${targetId}, [id="${targetId}"], h2:has-text("${text}")`).count();
                            if (targetExists === 0) {
                                console.log(`     ⚠️ Missing section: ${href} for "${text}"`);
                            }
                        }
                    }
                }

                console.log(`   ✓ Guides/${subPage} loaded`);
            }
        }

        // Test 5: Reference Section
        console.log("\n5. Testing Reference Section...");

        await page.click('a[data-bs-toggle="collapse"][data-bs-target*="reference"]');
        await page.waitForTimeout(500);

        const refDropdownExpanded = await page.locator('#collapse-reference').getAttribute("class");
        expect(refDropdownExpanded).toContain("show");
        console.log("   ✓ Reference dropdown opened");

        const refSubPages = ["performance", "security", "troubleshooting", "websocket"];

        for (const subPage of refSubPages) {
            const subPageLink = await page.locator(`a[data-section="reference/${subPage}"]`).first();
            if (await subPageLink.count() > 0) {
                await subPageLink.click();
                await page.waitForLoadState("networkidle");
                console.log(`   ✓ Reference/${subPage} loaded`);
            }
        }

        // Test 6: Dropdown Highlight Behavior
        console.log("\n6. Testing Dropdown Highlight Behavior...");

        // Click on a specific item
        await page.click('a[data-section="api-reference/backend-api"]');
        await page.waitForTimeout(500);

        // Check if item is highlighted (has active class)
        const activeItem = await page.locator('a[data-section="api-reference/backend-api"]').first();
        const activeClass = await activeItem.getAttribute("class");
        expect(activeClass).toContain("active");
        console.log("   ✓ Active item is highlighted");

        // Test 7: Dropdown Stay Open Behavior
        console.log("\n7. Testing Dropdown Stay Open Behavior...");

        // Click on API Reference dropdown to open it
        const apiDropdown = await page.locator('a[data-bs-toggle="collapse"][data-bs-target*="api-reference"]').first();
        await apiDropdown.click();
        await page.waitForTimeout(500);

        // Click on a child item
        await page.click('a[data-section="api-reference/frontend-api"]');
        await page.waitForTimeout(500);

        // Check if dropdown is still open
        const dropdownStillOpen = await page.locator('#collapse-api-reference').getAttribute("class");
        expect(dropdownStillOpen).toContain("show");
        console.log("   ✓ Dropdown stays open after clicking item");

        // Check if the clicked item is now active
        const newActiveItem = await page.locator('a[data-section="api-reference/frontend-api"]').first();
        const newActiveClass = await newActiveItem.getAttribute("class");
        expect(newActiveClass).toContain("active");
        console.log("   ✓ New item is highlighted after click");

        console.log("\n=== Documentation Portal Test Complete ===\n");
        console.log("Summary:");
        console.log("✓ Overview page and links working");
        console.log("✓ API Reference section navigation working");
        console.log("✓ Architecture section navigation working");
        console.log("✓ Guides section navigation working");
        console.log("✓ Reference section navigation working");
        console.log("✓ Dropdown highlight behavior working");
        console.log("✓ Dropdowns stay open when clicking items");
    });
});