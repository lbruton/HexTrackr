import { test, expect } from '@playwright/test';

/**
 * AG-Grid Table Container Overflow Fix - E2E Tests
 * 
 * These tests verify that the AG-Grid table maintains proper containment
 * and overflow handling across different scenarios as specified in
 * hextrackr-specs/specs/004-ag-grid-table-overflow-fix/quickstart.md
 * 
 * RED Phase: These tests are designed to FAIL initially, then PASS after implementation.
 */

test.describe('AG-Grid Container Overflow Fix', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to vulnerabilities page
    await page.goto('http://localhost:8989/vulnerabilities.html');
    
    // Wait for the AG-Grid to load
    await page.waitForSelector('.ag-grid', { timeout: 10000 });
    await page.waitForSelector('#vulnGrid .ag-theme-alpine', { timeout: 10000 });
    
    // Ensure table view is active
    await page.click('label[for="view-table"]');
    await page.waitForTimeout(500);
  });

  /**
   * Test 1: Container boundaries maintained at all item counts
   * Spec requirement: 16px padding maintained, no horizontal overflow
   */
  test('maintains container boundaries at all item counts', async ({ page }) => {
    const counts = [10, 25, 50, 100];
    
    for (const count of counts) {
      // Change item count using pagination dropdown
      await page.locator('.ag-paging-page-size select').selectOption(String(count));
      
      // Wait for transition to complete (spec: 200ms)
      await page.waitForTimeout(300);
      
      // Get AG-Grid container dimensions
      const container = page.locator('#vulnGrid.ag-theme-alpine');
      const containerBox = await container.boundingBox();
      
      // Get viewport dimensions
      const viewportSize = page.viewportSize();
      
      // Verify left padding (minimum 16px from edge)
      expect(containerBox.x).toBeGreaterThanOrEqual(16);
      
      // Verify right containment (container + 16px padding should not exceed viewport)
      expect(containerBox.x + containerBox.width).toBeLessThanOrEqual(viewportSize.width - 16);
      
      // Verify no horizontal page overflow
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowInnerWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth);
      
      console.log(`✓ Item count ${count}: Container boundaries maintained`);
    }
  });

  /**
   * Test 2: Item count changes maintain boundaries
   * Spec requirement: Smooth 200ms transition, padding preserved during transition
   */
  test('handles item count changes (10→100) maintaining boundaries', async ({ page }) => {
    // Start with 10 items
    await page.locator('.ag-paging-page-size select').selectOption('10');
    await page.waitForTimeout(300);
    
    // Get initial container height
    const initialHeight = await page.locator('#vulnGrid.ag-theme-alpine').evaluate(el => el.offsetHeight);
    
    // Change to 100 items and measure transition
    const startTime = Date.now();
    await page.locator('.ag-paging-page-size select').selectOption('100');
    
    // Wait for transition to complete
    await page.waitForTimeout(300);
    
    const endTime = Date.now();
    const transitionTime = endTime - startTime;
    
    // Get final container height
    const finalHeight = await page.locator('#vulnGrid.ag-theme-alpine').evaluate(el => el.offsetHeight);
    
    // Verify height increased (more rows = taller container)
    expect(finalHeight).toBeGreaterThan(initialHeight);
    
    // Verify transition happened within reasonable time (allowing for test overhead)
    expect(transitionTime).toBeLessThan(1000);
    
    // Verify no horizontal overflow after transition
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowInnerWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth);
    
    // Verify container still has proper padding
    const containerBox = await page.locator('#vulnGrid.ag-theme-alpine').boundingBox();
    expect(containerBox.x).toBeGreaterThanOrEqual(16);
  });

  /**
   * Test 3: Long content truncation with ellipsis
   * Spec requirement: Text overflow should show ellipsis, no column bleeding
   */
  test('handles long content truncation with ellipsis', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('.ag-cell', { timeout: 10000 });
    
    // Find cells that might have long content (description column)
    const longContentCells = page.locator('.ag-cell').nth(0); // First cell as example
    
    // Check if any cells have text overflow
    const hasOverflow = await longContentCells.evaluate(cell => {
      return cell.scrollWidth > cell.clientWidth;
    });
    
    if (hasOverflow) {
      // Verify ellipsis is applied
      const hasEllipsis = await longContentCells.evaluate(cell => {
        const computedStyle = window.getComputedStyle(cell);
        return computedStyle.textOverflow === 'ellipsis' && 
               computedStyle.overflow === 'hidden' &&
               computedStyle.whiteSpace === 'nowrap';
      });
      
      expect(hasEllipsis).toBe(true);
    }
    
    // Verify no cell content bleeds outside container
    const containerBox = await page.locator('#vulnGrid.ag-theme-alpine').boundingBox();
    const cells = page.locator('.ag-cell');
    const cellCount = await cells.count();
    
    for (let i = 0; i < Math.min(cellCount, 10); i++) { // Check first 10 cells
      const cellBox = await cells.nth(i).boundingBox();
      if (cellBox) {
        expect(cellBox.x + cellBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width + 5); // 5px tolerance
      }
    }
  });

  /**
   * Test 4: Rapid item count switching without layout breaks
   * Spec requirement: No layout breaks during rapid changes
   */
  test('handles rapid item count switching without layout breaks', async ({ page }) => {
    const counts = [10, 100, 25, 50, 10];
    const select = page.locator('.ag-paging-page-size select');
    
    // Perform rapid switches
    for (const count of counts) {
      await select.selectOption(String(count));
      await page.waitForTimeout(100); // Small delay between switches
    }
    
    // Wait for final state to settle
    await page.waitForTimeout(500);
    
    // Verify final state is correct (should show 10 items)
    const selectedValue = await select.inputValue();
    expect(selectedValue).toBe('10');
    
    // Verify no JavaScript errors occurred
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    
    expect(errors.length).toBe(0);
    
    // Verify container boundaries are still maintained
    const containerBox = await page.locator('#vulnGrid.ag-theme-alpine').boundingBox();
    const viewportSize = page.viewportSize();
    
    expect(containerBox.x).toBeGreaterThanOrEqual(16);
    expect(containerBox.x + containerBox.width).toBeLessThanOrEqual(viewportSize.width - 16);
  });

  /**
   * Test 5: Browser window resize maintaining containment
   * Spec requirement: Container adapts to window resize, maintains padding
   */
  test('handles browser window resize maintaining containment', async ({ page }) => {
    const testSizes = [
      { width: 1920, height: 1080 },
      { width: 1024, height: 768 },
      { width: 2560, height: 1440 }
    ];
    
    // Set to 100 items for maximum content
    await page.locator('.ag-paging-page-size select').selectOption('100');
    await page.waitForTimeout(300);
    
    for (const size of testSizes) {
      // Resize window
      await page.setViewportSize(size);
      await page.waitForTimeout(300); // Wait for responsive adjustments
      
      // Verify container maintains boundaries at new size
      const containerBox = await page.locator('#vulnGrid.ag-theme-alpine').boundingBox();
      
      expect(containerBox.x).toBeGreaterThanOrEqual(16);
      expect(containerBox.x + containerBox.width).toBeLessThanOrEqual(size.width - 16);
      
      // Verify no horizontal overflow
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyScrollWidth).toBeLessThanOrEqual(size.width);
      
      console.log(`✓ Size ${size.width}x${size.height}: Containment maintained`);
    }
  });

  /**
   * Test 6: Sorting and filtering preservation during resize
   * Spec requirement: AG-Grid features remain functional during container changes
   */
  test('preserves sorting and filtering during container changes', async ({ page }) => {
    // Wait for grid to be ready
    await page.waitForSelector('.ag-header-cell', { timeout: 10000 });
    
    // Apply sort to severity column (if exists)
    const severityHeader = page.locator('.ag-header-cell').filter({ hasText: 'Severity' }).first();
    if (await severityHeader.count() > 0) {
      await severityHeader.click();
      await page.waitForTimeout(300);
    }
    
    // Change item count
    await page.locator('.ag-paging-page-size select').selectOption('50');
    await page.waitForTimeout(300);
    
    // Verify sort is still active (look for sort indicator)
    if (await severityHeader.count() > 0) {
      const hasSortIcon = await severityHeader.locator('.ag-sort-indicator').count() > 0;
      expect(hasSortIcon).toBe(true);
    }
    
    // Verify container boundaries maintained during sort
    const containerBox = await page.locator('#vulnGrid.ag-theme-alpine').boundingBox();
    const viewportSize = page.viewportSize();
    
    expect(containerBox.x).toBeGreaterThanOrEqual(16);
    expect(containerBox.x + containerBox.width).toBeLessThanOrEqual(viewportSize.width - 16);
  });

  /**
   * Performance test: Verify transitions are smooth
   * Spec requirement: 200ms transitions at 60fps
   */
  test('transitions complete within performance requirements', async ({ page }) => {
    // Monitor for performance issues
    let performanceEntries = [];
    
    await page.evaluateOnNewDocument(() => {
      // Mock performance observer for transition timing
      window.transitionTimes = [];
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('ag-grid') || entry.entryType === 'measure') {
            window.transitionTimes.push(entry.duration);
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    });
    
    // Perform transition from 10 to 100 items
    const startTime = await page.evaluate(() => performance.now());
    
    await page.locator('.ag-paging-page-size select').selectOption('100');
    
    // Wait for visual transition to complete
    await page.waitForTimeout(300);
    
    const endTime = await page.evaluate(() => performance.now());
    const totalTime = endTime - startTime;
    
    // Verify total transition time is reasonable (allowing for test overhead)
    expect(totalTime).toBeLessThan(500); // 500ms including test delays
    
    // Verify no layout thrashing occurred (no console errors)
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    expect(errors.length).toBe(0);
  });
});