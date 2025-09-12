const { test, expect } = require('@playwright/test');

test.describe('Statistics Card Flip Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to vulnerabilities page before each test
    await page.goto('http://localhost:8989/vulnerabilities.html');
    
    // Wait for statistics cards to be fully loaded
    await page.waitForSelector('.stat-card-enhanced', { 
      timeout: 10000,
      state: 'visible' 
    });
    
    // Wait a bit for any animations or data loading
    await page.waitForTimeout(1000);
  });

  test('should flip Critical severity card when clicked', async ({ page }) => {
    // Find the Critical severity card
    const criticalCard = page.locator('.stat-card-enhanced').filter({ hasText: 'Critical' }).first();
    
    // Get the initial title text
    const initialTitle = await criticalCard.locator('.card-title, h3, .h3').first().textContent();
    
    // Click the card to flip it
    await criticalCard.click();
    
    // Wait for flip animation
    await page.waitForTimeout(500);
    
    // Get the flipped title text
    const flippedTitle = await criticalCard.locator('.card-title, h3, .h3').first().textContent();
    
    // Verify the content changed (flipped)
    expect(flippedTitle).not.toBe(initialTitle);
    
    // Click again to flip back
    await criticalCard.click();
    await page.waitForTimeout(500);
    
    // Verify it returned to original state
    const finalTitle = await criticalCard.locator('.card-title, h3, .h3').first().textContent();
    expect(finalTitle).toBe(initialTitle);
  });

  test('should flip High severity card when clicked', async ({ page }) => {
    // Find the High severity card
    const highCard = page.locator('.stat-card-enhanced').filter({ hasText: 'High' }).first();
    
    // Get the initial content
    const initialContent = await highCard.textContent();
    
    // Click to flip
    await highCard.click();
    await page.waitForTimeout(500);
    
    // Verify content changed
    const flippedContent = await highCard.textContent();
    expect(flippedContent).not.toBe(initialContent);
    
    // Flip back
    await highCard.click();
    await page.waitForTimeout(500);
    
    // Verify original state restored
    const finalContent = await highCard.textContent();
    expect(finalContent).toBe(initialContent);
  });

  test('should flip Medium severity card when clicked', async ({ page }) => {
    // Find the Medium severity card
    const mediumCard = page.locator('.stat-card-enhanced').filter({ hasText: 'Medium' }).first();
    
    // Store initial state
    const initialContent = await mediumCard.textContent();
    
    // Perform flip
    await mediumCard.click();
    await page.waitForTimeout(500);
    
    // Check that flip occurred
    const flippedContent = await mediumCard.textContent();
    expect(flippedContent).not.toBe(initialContent);
    
    // Restore original
    await mediumCard.click();
    await page.waitForTimeout(500);
    
    // Verify restoration
    const finalContent = await mediumCard.textContent();
    expect(finalContent).toBe(initialContent);
  });

  test('should flip Low severity card when clicked', async ({ page }) => {
    // Find the Low severity card
    const lowCard = page.locator('.stat-card-enhanced').filter({ hasText: 'Low' }).first();
    
    // Capture initial state
    const initialContent = await lowCard.textContent();
    
    // Execute flip
    await lowCard.click();
    await page.waitForTimeout(500);
    
    // Validate flip happened
    const flippedContent = await lowCard.textContent();
    expect(flippedContent).not.toBe(initialContent);
    
    // Return to original
    await lowCard.click();
    await page.waitForTimeout(500);
    
    // Confirm original state
    const finalContent = await lowCard.textContent();
    expect(finalContent).toBe(initialContent);
  });

  test('should maintain independent flip states for each card', async ({ page }) => {
    // Get all four cards
    const criticalCard = page.locator('.stat-card-enhanced').filter({ hasText: 'Critical' }).first();
    const highCard = page.locator('.stat-card-enhanced').filter({ hasText: 'High' }).first();
    
    // Store initial states
    const criticalInitial = await criticalCard.textContent();
    const highInitial = await highCard.textContent();
    
    // Flip only the Critical card
    await criticalCard.click();
    await page.waitForTimeout(500);
    
    // Verify Critical changed but High didn't
    const criticalFlipped = await criticalCard.textContent();
    const highUnchanged = await highCard.textContent();
    
    expect(criticalFlipped).not.toBe(criticalInitial);
    expect(highUnchanged).toBe(highInitial);
    
    // Now flip High card
    await highCard.click();
    await page.waitForTimeout(500);
    
    // Both should now be in flipped state
    const highFlipped = await highCard.textContent();
    expect(highFlipped).not.toBe(highInitial);
    
    // Critical should still be flipped
    const criticalStillFlipped = await criticalCard.textContent();
    expect(criticalStillFlipped).toBe(criticalFlipped);
  });

  test('should have pointer cursor on hover over cards', async ({ page }) => {
    // Check each card has pointer cursor
    const cards = page.locator('.stat-card-enhanced');
    const cardCount = await cards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      await card.hover();
      
      // Get computed style to check cursor
      const cursor = await card.evaluate(el => {
        return window.getComputedStyle(el).cursor;
      });
      
      // Should be pointer to indicate clickability
      expect(cursor).toBe('pointer');
    }
  });
});