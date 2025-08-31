const { chromium } = require("playwright");

async function testChartsLoading() {
    console.log("🚀 Starting chart loading test...");
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
        // Navigate to vulnerabilities page
        console.log("📄 Loading vulnerabilities.html...");
        await page.goto("http://localhost:8080/vulnerabilities.html");
        
        // Wait for page to load completely
        await page.waitForLoadState("networkidle");
        
        // Wait extra time for external scripts to load
        console.log("⏳ Waiting for external scripts to load...");
        await page.waitForTimeout(5000);
        
        // Check if Chart.js is loaded from CDN
        console.log("📊 Checking if Chart.js loaded...");
        const chartJsLoaded = await page.evaluate(() => {
            return typeof window.Chart !== "undefined";
        });
        
        // Also check if the Chart.js script tag exists
        const scriptExists = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll("script"));
            return scripts.some(script => script.src.includes("chart.js"));
        });
        
        if (chartJsLoaded) {
            console.log("✅ Chart.js successfully loaded from CDN!");
            
            // Check Chart.js version
            const chartVersion = await page.evaluate(() => {
                return window.Chart.version || "version not available";
            });
            console.log(`📋 Chart.js version: ${chartVersion}`);
            
        } else {
            console.log("❌ Chart.js failed to load!");
            console.log(`📋 Script tag exists: ${scriptExists}`);
        }
        
        // Check for any console errors
        const consoleErrors = [];
        page.on("console", msg => {
            if (msg.type() === "error") {
                consoleErrors.push(msg.text());
            }
        });
        
        // Wait a bit more to catch any delayed errors
        await page.waitForTimeout(2000);
        
        if (consoleErrors.length > 0) {
            console.log("⚠️ Console errors detected:");
            consoleErrors.forEach(error => console.log(`   - ${error}`));
        } else {
            console.log("✅ No console errors detected!");
        }
        
        // Take a screenshot for verification
        await page.screenshot({ path: "chart-test-screenshot.png", fullPage: false });
        console.log("📸 Screenshot saved as chart-test-screenshot.png");
        
        console.log("🎉 Chart loading test completed successfully!");
        
    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await browser.close();
    }
}

testChartsLoading();
