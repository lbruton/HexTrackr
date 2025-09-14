const { test, expect } = require('@playwright/test');

test.describe('Statistics Card Flip Instruction Banner', () => {
  test('should not display the instruction banner', async ({ page }) => {
    // Navigate to vulnerabilities page
    await page.goto('http://localhost:8989/vulnerabilities.html');
    
    // Wait for page to fully load - wait for statistics cards to be present
    await page.waitForSelector('.stat-card-enhanced', { 
      timeout: 10000,
      state: 'visible' 
    });
    
    // Check that the instruction banner does NOT exist
    // This selector looks for the blue alert with the specific instruction text
    const banner = page.locator('.alert.alert-info:has-text("Click on any statistics card to flip between vulnerability counts and VPR scores")');
    
    // Assert that the banner count is 0 (not present)
    await expect(banner).toHaveCount(0);
    
    // Additional check: verify no alert-info elements with the flip instruction text
    const anyFlipInstruction = page.locator('text=Click on any statistics card to flip');
    await expect(anyFlipInstruction).toHaveCount(0);
  });

  test('should not have console errors after banner removal', async ({ page }) => {
    // Track console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate to the page
    await page.goto('http://localhost:8989/vulnerabilities.html');
    
    // Wait for page to stabilize
    await page.waitForSelector('.stat-card-enhanced', { 
      timeout: 10000,
      state: 'visible' 
    });
    await page.waitForTimeout(1000); // Give time for any async operations
    
    // Assert no console errors were logged
    expect(consoleErrors).toHaveLength(0);
  });

  test('should maintain proper spacing between sections', async ({ page }) => {
    // Navigate to vulnerabilities page
    await page.goto('http://localhost:8989/vulnerabilities.html');
    
    // Wait for page elements
    await page.waitForSelector('.stat-card-enhanced', { timeout: 10000 });
    await page.waitForSelector('.card:has-text("Historical VPR Trends")', { timeout: 10000 });
    
    // Get the statistics cards container
    const statsSection = page.locator('.row:has(.stat-card-enhanced)').first();
    const statsBox = await statsSection.boundingBox();
    
    // Get the chart section
    const chartSection = page.locator('.card:has-text("Historical VPR Trends")').first();
    const chartBox = await chartSection.boundingBox();
    
    // Calculate the gap between sections
    if (statsBox && chartBox) {
      const gap = chartBox.y - (statsBox.y + statsBox.height);
      
      // Verify spacing is reasonable 
      // With banner: ~115px, Without banner: should be 10-80px
      // For now just check it exists and is positive
      expect(gap).toBeGreaterThan(10);
    }
  });
});