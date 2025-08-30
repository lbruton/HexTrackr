const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function testDashboard() {
    console.log("🎭 Starting Playwright Dashboard Testing...");
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // Slow down for visual inspection
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Enable console logging
    page.on("console", msg => console.log("Browser:", msg.text()));
    page.on("pageerror", error => console.error("Page Error:", error.message));
    
    try {
        // Load the dashboard
        const dashboardPath = path.resolve(__dirname, "../health-dashboard.html");
        await page.goto(`file://${dashboardPath}`);
        
        console.log("✅ Dashboard loaded successfully");
        
        // Wait for the page to fully render
        await page.waitForTimeout(2000);
        
        // Take initial screenshot
        await page.screenshot({ 
            path: "dashboard-initial.png", 
            fullPage: true 
        });
        
        // Test each tab
        const tabs = ["health-monitor", "tasks-roadmap", "workspace", "protocol-stack", "memory-system", "system-logs"];
        
        for (const tab of tabs) {
            console.log(`\n🔍 Testing ${tab} tab...`);
            
            // Click the tab
            await page.click(`[onclick="showTab('${tab}')"]`);
            await page.waitForTimeout(1000);
            
            // Check for CSS layout issues
            const tabContent = await page.$(`#${tab}`);
            if (tabContent) {
                const boundingBox = await tabContent.boundingBox();
                console.log(`Tab dimensions: ${boundingBox.width}x${boundingBox.height}`);
                
                // Take screenshot of this tab
                await page.screenshot({ 
                    path: `dashboard-${tab}.png`,
                    fullPage: true
                });
                
                // Check for misaligned elements
                const misalignedElements = await page.evaluate(() => {
                    const issues = [];
                    
                    // Check for elements with negative margins or positions
                    document.querySelectorAll("*").forEach((el, index) => {
                        const style = window.getComputedStyle(el);
                        const rect = el.getBoundingClientRect();
                        
                        if (rect.left < 0 || rect.top < 0) {
                            issues.push(`Element ${el.tagName} at index ${index} has negative position`);
                        }
                        
                        if (style.marginLeft && parseFloat(style.marginLeft) < 0) {
                            issues.push(`Element ${el.tagName} has negative margin-left: ${style.marginLeft}`);
                        }
                        
                        if (style.overflow === "hidden" && rect.width === 0) {
                            issues.push(`Element ${el.tagName} has hidden overflow with zero width`);
                        }
                    });
                    
                    return issues;
                });
                
                if (misalignedElements.length > 0) {
                    console.log(`❌ Found ${misalignedElements.length} alignment issues:`);
                    misalignedElements.forEach(issue => console.log(`  - ${issue}`));
                } else {
                    console.log("✅ No alignment issues found");
                }
                
                // Check for CSS errors
                const cssErrors = await page.evaluate(() => {
                    const errors = [];
                    const sheets = Array.from(document.styleSheets);
                    
                    sheets.forEach((sheet, sheetIndex) => {
                        try {
                            const rules = Array.from(sheet.cssRules || sheet.rules);
                            rules.forEach((rule, ruleIndex) => {
                                if (rule.style && rule.style.length === 0 && rule.cssText.includes(":")) {
                                    errors.push(`Empty rule in sheet ${sheetIndex}, rule ${ruleIndex}: ${rule.cssText}`);
                                }
                            });
                        } catch (e) {
                            errors.push(`Cannot access stylesheet ${sheetIndex}: ${e.message}`);
                        }
                    });
                    
                    return errors;
                });
                
                if (cssErrors.length > 0) {
                    console.log(`⚠️ Found ${cssErrors.length} CSS issues:`);
                    cssErrors.forEach(error => console.log(`  - ${error}`));
                }
            }
        }
        
        // Test Protocol Stack specifically (since it was mentioned as having issues)
        console.log("\n🔍 Testing Protocol Stack specific issues...");
        await page.click("[onclick=\"showTab('protocol-stack')\"]");
        await page.waitForTimeout(1000);
        
        // Test protocol tabs
        const protocolTabs = ["protocolStack", "protocolEditor", "protocolMemory"];
        for (const protocolTab of protocolTabs) {
            try {
                await page.click(`[onclick="switchProtocolTab('${protocolTab}')"]`);
                await page.waitForTimeout(500);
                console.log(`✅ Protocol tab ${protocolTab} working`);
            } catch (error) {
                console.log(`❌ Protocol tab ${protocolTab} error: ${error.message}`);
            }
        }
        
        // Test Strategic Brainstorming section alignment
        console.log("\n🔍 Testing Strategic Brainstorming alignment...");
        await page.click("[onclick=\"showTab('tasks-roadmap')\"]");
        await page.waitForTimeout(1000);
        
        const brainstormingCards = await page.$$(".brainstorming-card");
        console.log(`Found ${brainstormingCards.length} brainstorming cards`);
        
        for (let i = 0; i < brainstormingCards.length; i++) {
            const card = brainstormingCards[i];
            const boundingBox = await card.boundingBox();
            
            if (boundingBox.width < 100 || boundingBox.height < 50) {
                console.log(`❌ Card ${i} too small: ${boundingBox.width}x${boundingBox.height}`);
            }
            
            if (boundingBox.left < 0 || boundingBox.top < 0) {
                console.log(`❌ Card ${i} positioned outside viewport: ${boundingBox.left}, ${boundingBox.top}`);
            }
        }
        
        // Generate final report
        console.log("\n📊 Generating final validation report...");
        
        const finalReport = await page.evaluate(() => {
            const report = {
                totalElements: document.querySelectorAll("*").length,
                visibleElements: Array.from(document.querySelectorAll("*")).filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== "none" && style.visibility !== "hidden";
                }).length,
                errors: [],
                warnings: []
            };
            
            // Check for common CSS issues
            document.querySelectorAll("*").forEach((el, index) => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                
                // Check for elements extending outside viewport
                if (rect.right > window.innerWidth) {
                    report.warnings.push(`Element ${index} extends beyond viewport width`);
                }
                
                // Check for overlapping elements in grid layouts
                if (style.display === "grid" && el.children.length > 0) {
                    const children = Array.from(el.children);
                    children.forEach((child, childIndex) => {
                        const childRect = child.getBoundingClientRect();
                        if (childRect.width === 0 || childRect.height === 0) {
                            report.warnings.push(`Grid child ${childIndex} has zero dimensions`);
                        }
                    });
                }
            });
            
            return report;
        });
        
        console.log("\n📈 Final Report:");
        console.log(`Total elements: ${finalReport.totalElements}`);
        console.log(`Visible elements: ${finalReport.visibleElements}`);
        console.log(`Errors: ${finalReport.errors.length}`);
        console.log(`Warnings: ${finalReport.warnings.length}`);
        
        if (finalReport.errors.length > 0) {
            console.log("\n❌ Errors found:");
            finalReport.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        if (finalReport.warnings.length > 0) {
            console.log("\n⚠️ Warnings found:");
            finalReport.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
        
        // Save report to file
        fs.writeFileSync("dashboard-validation-report.json", JSON.stringify(finalReport, null, 2));
        
        console.log("\n✅ Playwright testing complete! Check screenshots and report files.");
        
        // Keep browser open for manual inspection
        console.log("Browser staying open for manual inspection. Press Ctrl+C to exit.");
        await page.waitForTimeout(60000); // Wait 1 minute
        
    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await browser.close();
    }
}

// Run the test
testDashboard().catch(console.error);
