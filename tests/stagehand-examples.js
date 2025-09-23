/**
 * Stagehand Examples for HexTrackr
 * AI-powered browser automation tests using natural language
 *
 * Usage: npm run test:stagehand
 * Requirements: Docker container running on localhost:8080
 */

const { Stagehand } = require("@browserbasehq/stagehand");
const { z } = require("zod");

/**
 * Test ticket creation workflow
 */
async function testTicketCreation() {
    console.log("🎫 Testing ticket creation workflow...");

    const stagehand = new Stagehand({
        env: "LOCAL",
        headless: false // Set to true for headless mode
    });

    try {
        const page = stagehand.page;

        // Navigate to HexTrackr
        await page.goto("http://localhost:8080");

        // Navigate to tickets page
        await page.act("click on the tickets navigation link");

        // Create a new ticket
        await page.act("click the create new ticket button");
        await page.act("fill in the title field with 'Stagehand Test Ticket'");
        await page.act("fill in the description with 'This ticket was created by AI automation'");
        await page.act("select High from the priority dropdown");
        await page.act("click the submit or save button");

        // Extract ticket details to verify creation
        const ticketData = await page.extract({
            instruction: "get the details of the newly created ticket",
            schema: z.object({
                title: z.string().describe("The ticket title"),
                priority: z.string().describe("The priority level"),
                status: z.string().describe("The current status")
            })
        });

        console.log("✅ Ticket created successfully:", ticketData);
        return ticketData;

    } catch (error) {
        console.error("❌ Ticket creation test failed:", error.message);
        throw error;
    } finally {
        await stagehand.close();
    }
}

/**
 * Test vulnerability import workflow
 */
async function testVulnerabilityImport() {
    console.log("🔍 Testing vulnerability import workflow...");

    const stagehand = new Stagehand({
        env: "LOCAL",
        headless: false
    });

    try {
        const page = stagehand.page;

        // Navigate to HexTrackr
        await page.goto("http://localhost:8080");

        // Navigate to vulnerabilities page
        await page.act("click on the vulnerabilities navigation link");

        // Check current vulnerability count
        const beforeImport = await page.extract({
            instruction: "count the number of vulnerabilities currently displayed",
            schema: z.object({
                count: z.number().describe("Number of vulnerabilities shown")
            })
        });

        console.log("📊 Vulnerabilities before import:", beforeImport.count);

        // Test manual KEV refresh (if available)
        await page.act("look for and click any refresh or import KEV button");

        // Wait for import to complete
        await page.observe("wait for any loading indicators to disappear");

        console.log("✅ Vulnerability import test completed");

    } catch (error) {
        console.error("❌ Vulnerability import test failed:", error.message);
        throw error;
    } finally {
        await stagehand.close();
    }
}

/**
 * Test settings modal functionality
 */
async function testSettingsModal() {
    console.log("⚙️ Testing settings modal...");

    const stagehand = new Stagehand({
        env: "LOCAL",
        headless: false
    });

    try {
        const page = stagehand.page;

        // Navigate to HexTrackr
        await page.goto("http://localhost:8080");

        // Open settings modal
        await page.act("click on the settings button or gear icon");

        // Verify modal is open
        await page.observe("wait for the settings modal to appear");

        // Extract current settings
        const settings = await page.extract({
            instruction: "get the current settings values from the modal",
            schema: z.object({
                kevApiEnabled: z.boolean().describe("Whether KEV API is enabled"),
                maxFileSize: z.string().describe("Maximum file size setting"),
                autoRefresh: z.boolean().optional().describe("Auto refresh setting if visible")
            })
        });

        console.log("📋 Current settings:", settings);

        // Close modal
        await page.act("close the settings modal");

        console.log("✅ Settings modal test completed");
        return settings;

    } catch (error) {
        console.error("❌ Settings modal test failed:", error.message);
        throw error;
    } finally {
        await stagehand.close();
    }
}

/**
 * Test navigation and responsive design
 */
async function testNavigation() {
    console.log("🧭 Testing navigation workflow...");

    const stagehand = new Stagehand({
        env: "LOCAL",
        headless: false
    });

    try {
        const page = stagehand.page;

        // Navigate to HexTrackr
        await page.goto("http://localhost:8080");

        // Test each main navigation item
        const navItems = ["Dashboard", "Tickets", "Vulnerabilities"];

        for (const item of navItems) {
            await page.act(`click on the ${item} navigation link`);
            await page.observe("wait for the page to load completely");

            // Extract page title to verify navigation
            const pageInfo = await page.extract({
                instruction: `get the current page title and main heading for ${item}`,
                schema: z.object({
                    pageTitle: z.string().describe("The browser page title"),
                    heading: z.string().describe("The main page heading")
                })
            });

            console.log(`📄 ${item} page:`, pageInfo);
        }

        console.log("✅ Navigation test completed");

    } catch (error) {
        console.error("❌ Navigation test failed:", error.message);
        throw error;
    } finally {
        await stagehand.close();
    }
}

/**
 * Run all Stagehand tests
 */
async function runAllTests() {
    console.log("🚀 Starting HexTrackr Stagehand Tests");
    console.log("=====================================");

    const tests = [
        { name: "Navigation", fn: testNavigation },
        { name: "Settings Modal", fn: testSettingsModal },
        { name: "Vulnerability Import", fn: testVulnerabilityImport },
        { name: "Ticket Creation", fn: testTicketCreation }
    ];

    const results = [];

    for (const test of tests) {
        try {
            console.log(`\n📋 Running ${test.name} test...`);
            const result = await test.fn();
            results.push({ name: test.name, status: "PASSED", result });
            console.log(`✅ ${test.name} test PASSED`);
        } catch (error) {
            results.push({ name: test.name, status: "FAILED", error: error.message });
            console.log(`❌ ${test.name} test FAILED: ${error.message}`);
        }
    }

    // Summary
    console.log("\n📊 Test Results Summary");
    console.log("=======================");
    results.forEach(result => {
        const icon = result.status === "PASSED" ? "✅" : "❌";
        console.log(`${icon} ${result.name}: ${result.status}`);
    });

    const passed = results.filter(r => r.status === "PASSED").length;
    const total = results.length;
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);

    return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests()
        .then(() => {
            console.log("\n🏁 All tests completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n💥 Test runner failed:", error);
            process.exit(1);
        });
}

module.exports = {
    testTicketCreation,
    testVulnerabilityImport,
    testSettingsModal,
    testNavigation,
    runAllTests
};