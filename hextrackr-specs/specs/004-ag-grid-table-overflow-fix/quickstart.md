# Quickstart: AG-Grid Table Container Overflow Fix

**Feature**: Table container overflow fix  
**Spec**: 004-ag-grid-table-overflow-fix

## Prerequisites

1. Docker container running: `docker-compose up -d`
2. HexTrackr accessible at: <http://localhost:8989>
3. Test data loaded with at least 100 vulnerability records
4. Playwright installed: `npm install -D @playwright/test`

## Test Scenarios

### Scenario 1: Default View Container Boundaries

**Steps**:

1. Navigate to <http://localhost:8989/vulnerabilities.html>
2. Ensure table view is selected (not cards)
3. Verify default shows 10 items

**Expected**:

- Table stays within container boundaries
- 16px (1rem) padding visible on all sides
- No horizontal scrollbar on page body
- Table content doesn't overlap with header or footer

**Validation Command**:

```javascript
// In browser console
const container = document.querySelector('.ag-grid-container');
const rect = container.getBoundingClientRect();
console.assert(rect.left >= 16, 'Left padding missing');
console.assert(document.body.scrollWidth <= window.innerWidth, 'Horizontal overflow detected');
```

### Scenario 2: Item Count Changes (10 → 100)

**Steps**:

1. Start with 10 items displayed
2. Change dropdown to 100 items
3. Observe container resize

**Expected**:

- Container height increases smoothly (200ms transition)
- Padding maintained during and after transition
- No content jumps or flashes
- Vertical scrollbar appears if needed
- No horizontal page scroll introduced

**Validation**:

```javascript
// Measure before and after heights
const getHeight = () => document.querySelector('.ag-grid-container').offsetHeight;
const before = getHeight();
// Change to 100 items
// After change:
const after = getHeight();
console.assert(after > before, 'Container should grow');
```

### Scenario 3: Long Content Handling

**Test Data Setup**:

```javascript
// Create test record with long description
const longDesc = 'A'.repeat(500); // 500 character description
const longCVE = 'CVE-2024-12345-EXTRA-LONG-IDENTIFIER';
```

**Steps**:

1. Import CSV with long content
2. View in table mode
3. Check column rendering

**Expected**:

- Long text truncated with ellipsis
- Tooltips show full content on hover
- No column bleeding outside container
- No broken table layout

### Scenario 4: Rapid Item Count Switching

**Steps**:

1. Rapidly switch between item counts:
   - 10 → 100 → 25 → 50 → 10
2. Complete switches within 2 seconds

**Expected**:

- No layout breaking
- Transitions queue properly
- Final state is correct
- No JavaScript errors in console

**Automation**:

```javascript
async function rapidSwitch() {
  const counts = [10, 100, 25, 50, 10];
  for (const count of counts) {
    document.querySelector(`[data-count="${count}"]`).click();
    await new Promise(r => setTimeout(r, 400));
  }
}
```

### Scenario 5: Browser Window Resize

**Steps**:

1. Display 100 items
2. Resize browser window:
   - Start at 1920px wide
   - Shrink to 1024px
   - Expand to 2560px

**Expected**:

- Table maintains containment at all widths
- Responsive behavior smooth
- Padding consistent
- No overflow at any width

### Scenario 6: Sorting and Filtering Preservation

**Steps**:

1. Apply sort to Severity column (descending)
2. Filter by vendor "CISCO"
3. Change from 10 to 50 items
4. Verify sort and filter remain

**Expected**:

- Sort order maintained
- Filter still applied
- Container resizes properly
- AG-Grid features unaffected

## E2E Test Implementation

### Test File: `__tests__/tests/ag-grid-overflow-fix.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('AG-Grid Container Overflow Fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8989/vulnerabilities.html');
    await page.waitForSelector('.ag-grid');
  });

  test('maintains container boundaries at all item counts', async ({ page }) => {
    const counts = [10, 25, 50, 100];
    
    for (const count of counts) {
      await page.selectOption('#itemCount', String(count));
      await page.waitForTimeout(300); // Wait for transition
      
      const container = await page.$('.ag-grid-container');
      const box = await container.boundingBox();
      const viewport = await page.viewportSize();
      
      expect(box.x).toBeGreaterThanOrEqual(16);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - 16);
    }
  });

  test('handles overflow content correctly', async ({ page }) => {
    const cells = await page.$$('.ag-cell');
    
    for (const cell of cells.slice(0, 5)) {
      const isOverflowing = await cell.evaluate(el => 
        el.scrollWidth > el.clientWidth
      );
      
      if (isOverflowing) {
        const hasEllipsis = await cell.evaluate(el => 
          window.getComputedStyle(el).textOverflow === 'ellipsis'
        );
        expect(hasEllipsis).toBe(true);
      }
    }
  });
});
```

## Manual Testing Checklist

- [ ] 10 items: No overflow, proper padding
- [ ] 25 items: Smooth resize, boundaries maintained
- [ ] 50 items: Container grows appropriately
- [ ] 100 items: Max height constraint works
- [ ] Long content: Ellipsis truncation working
- [ ] Rapid switching: No layout breaks
- [ ] Window resize: Responsive behavior correct
- [ ] Sort/filter: Features preserved during resize
- [ ] Browser compatibility: Test in Chrome, Firefox, Safari, Edge
- [ ] Performance: Transitions smooth at 60fps

## Success Criteria

✅ All test scenarios pass  
✅ No horizontal page overflow at any point  
✅ Transitions complete within 200ms  
✅ Padding consistent (16px) in all states  
✅ AG-Grid features remain functional  
✅ No console errors during any test  

## Run All Tests

```bash
# E2E tests
npm run test:e2e -- ag-grid-overflow-fix.spec.js

# Visual regression
npm run test:visual -- --update-snapshots

# Performance
npm run lighthouse http://localhost:8989/vulnerabilities.html
```

## Rollback Plan

If issues occur:

1. Revert CSS changes in vulnerability-table.css
2. Restore original container HTML structure
3. Remove height calculation JavaScript
4. Clear browser cache
5. Restart Docker container
