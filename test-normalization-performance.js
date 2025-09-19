/**
 * Performance test for vulnerability chart normalization
 * Run with: node test-normalization-performance.js
 */

const puppeteer = require('puppeteer');

async function testNormalizationPerformance() {
    console.log('🚀 Starting Normalization Performance Test...\n');

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // Navigate to vulnerabilities page
        console.log('📍 Navigating to http://localhost:8989/vulnerabilities.html');
        await page.goto('http://localhost:8989/vulnerabilities.html', {
            waitUntil: 'networkidle2',
            timeout: 10000
        });

        // Wait for chart to load
        await page.waitForSelector('#vulnerability-chart', { timeout: 5000 });
        console.log('✅ Page loaded successfully\n');

        // Test 1: Button existence
        const buttonExists = await page.$('[data-toggle="normalize-chart"]') !== null;
        console.log(`Test 1 - Button Exists: ${buttonExists ? '✅ PASS' : '❌ FAIL'}`);

        if (!buttonExists) {
            throw new Error('Normalize button not found');
        }

        // Test 2: Toggle performance
        console.log('\nTest 2 - Toggle Performance:');
        const toggleTimes = [];

        for (let i = 0; i < 5; i++) {
            const startTime = Date.now();

            await page.click('[data-toggle="normalize-chart"]');
            await page.waitForTimeout(100); // Allow chart to update

            const endTime = Date.now();
            const duration = endTime - startTime;
            toggleTimes.push(duration);

            console.log(`  Toggle ${i + 1}: ${duration}ms ${duration < 500 ? '✅' : '❌'}`);
        }

        const avgTime = toggleTimes.reduce((a, b) => a + b, 0) / toggleTimes.length;
        console.log(`  Average: ${avgTime.toFixed(2)}ms ${avgTime < 500 ? '✅ PASS' : '❌ FAIL'}`);

        // Test 3: LocalStorage persistence
        console.log('\nTest 3 - LocalStorage Persistence:');

        // Set to normalized
        await page.evaluate(() => {
            const button = document.querySelector('[data-toggle="normalize-chart"]');
            if (button.getAttribute('aria-pressed') !== 'true') {
                button.click();
            }
        });

        // Get localStorage value
        const savedState = await page.evaluate(() => {
            return localStorage.getItem('hextrackr.chartViewState');
        });

        const hasLocalStorage = savedState !== null;
        console.log(`  LocalStorage saved: ${hasLocalStorage ? '✅ PASS' : '❌ FAIL'}`);

        if (hasLocalStorage) {
            const state = JSON.parse(savedState);
            console.log(`  Saved state: ${JSON.stringify(state, null, 2)}`);
        }

        // Test 4: Theme compatibility
        console.log('\nTest 4 - Theme Compatibility:');

        // Toggle theme
        const themeToggleExists = await page.$('[data-bs-toggle="theme"]') !== null;
        if (themeToggleExists) {
            await page.click('[data-bs-toggle="theme"]');
            await page.waitForTimeout(500);

            // Check if button is still visible
            const buttonVisibleInDarkMode = await page.$('[data-toggle="normalize-chart"]') !== null;
            console.log(`  Button visible in dark mode: ${buttonVisibleInDarkMode ? '✅ PASS' : '❌ FAIL'}`);
        } else {
            console.log('  Theme toggle not found - SKIP');
        }

        // Test 5: Chart update verification
        console.log('\nTest 5 - Chart Update Verification:');

        const chartUpdates = await page.evaluate(() => {
            const chart = document.querySelector('#vulnerability-chart');
            return chart && chart.hasAttribute('data-normalized');
        });

        console.log(`  Chart has data-normalized attribute: ${chartUpdates ? '✅ PASS' : '❌ FAIL'}`);

        console.log('\n✨ All tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run if called directly
if (require.main === module) {
    testNormalizationPerformance().catch(console.error);
}

module.exports = testNormalizationPerformance;