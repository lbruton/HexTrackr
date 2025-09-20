const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to vulnerabilities page...');
  await page.goto('http://localhost:8989/vulnerabilities.html');

  // Wait for the grid to load
  console.log('Waiting for AG-Grid to load...');
  await page.waitForSelector('#vulnGrid .ag-row', { timeout: 10000 });

  // Look for grimesnswan03
  console.log('Looking for grimesnswan03...');
  const hostnameLink = await page.locator('a:has-text("grimesnswan03")').first();

  if (await hostnameLink.count() > 0) {
    console.log('Found grimesnswan03, clicking...');

    // Take screenshot before click
    await page.screenshot({ path: 'before-click.png', fullPage: true });

    // Click the hostname link
    await hostnameLink.click();

    // Wait a moment to see what happens
    await page.waitForTimeout(2000);

    // Take screenshot after click
    await page.screenshot({ path: 'after-click.png', fullPage: true });

    // Check if modal opened
    const modal = await page.locator('#deviceModal.show');
    if (await modal.count() > 0) {
      console.log('✅ Modal opened successfully!');
    } else {
      console.log('❌ Modal did not open');

      // Check current URL
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);

      // Check for any console errors
      page.on('console', msg => console.log('Console:', msg.text()));
    }
  } else {
    console.log('Could not find grimesnswan03 in the grid');
  }

  // Keep browser open for manual inspection
  console.log('Test complete. Browser will close in 10 seconds...');
  await page.waitForTimeout(10000);

  await browser.close();
})();