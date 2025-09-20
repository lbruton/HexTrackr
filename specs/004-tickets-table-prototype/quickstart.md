# Quickstart Guide: Tickets Table AG-Grid Prototype

## Overview
This guide provides step-by-step instructions for testing the tickets2.html AG-Grid prototype implementation.

## Prerequisites

Before starting, ensure you have:
- HexTrackr Docker container running on port 8989
- Browser with developer tools (Chrome/Firefox/Edge)
- Test data loaded in the database

## Quick Verification Steps

### 1. Initial Load Test (30 seconds)
```bash
# Start Docker if not running
docker-compose up -d

# Verify container is healthy
docker ps | grep hextrackr

# Open the prototype page
open http://localhost:8989/tickets2.html
```

**Expected Results**:
- ✅ Page loads within 2 seconds
- ✅ AG-Grid renders with ticket data
- ✅ Each ticket displays on a single line
- ✅ No console errors

### 2. Multi-Value Display Test (1 minute)

**Test Steps**:
1. Look for tickets with multiple devices (3+ devices)
2. Verify only first 2 devices show with "+X more" indicator
3. Hover over the truncated devices cell
4. Check tooltip displays complete list

**Expected Behavior**:
```
Cell Display: Router-01 Switch-03 +3 more
Tooltip: Router-01
         Switch-03
         Firewall-02
         AP-04
         Server-01
```

### 3. Theme Switching Test (30 seconds)

**Test Steps**:
1. Click theme toggle in navigation bar
2. Observe grid theme change
3. Switch back to original theme

**Verification Checklist**:
- [ ] Grid changes from light to dark theme
- [ ] All text remains readable
- [ ] Overdue tickets maintain highlighting
- [ ] No layout shifts occur

### 4. Responsive Behavior Test (1 minute)

**Test Steps**:
1. Open browser developer tools (F12)
2. Toggle device emulation
3. Test these viewport sizes:

| Device | Width | Expected Columns Visible |
|--------|-------|-------------------------|
| Desktop | 1920px | All columns |
| Laptop | 1200px | All columns |
| Tablet | 768px | Hide supervisors, location |
| Mobile | 375px | Only ticket#, status, actions |

### 5. Click-to-Edit Test (30 seconds)

**Test Steps**:
1. Click on any ticket number
2. Verify edit modal opens
3. Check all ticket data is populated
4. Locate delete button in modal (not in grid)
5. Close modal with ESC or X button

**Validation**:
- Modal shows complete ticket information
- Multi-value fields show all items
- Delete button is present in modal footer
- Changes can be saved or cancelled

### 6. Sorting Test (30 seconds)

**Test Steps**:
1. Click column header "Due Date"
2. Verify ascending sort (oldest first)
3. Click again for descending sort
4. Try sorting by "Status" column

**Expected**:
- Sort indicators appear in headers
- Data reorders smoothly
- Multi-column sort not available (Community Edition)

### 7. Export Functionality Test (30 seconds)

**Test Steps**:
1. Click "Export" button above grid
2. Select CSV format
3. Verify download starts
4. Open file and check data

**Validation**:
- All visible tickets are exported
- Multi-value fields are properly formatted
- Special characters are escaped
- File opens in Excel/Numbers

## Performance Testing

### Load Test with Mock Data
```javascript
// Run in browser console
async function loadTestGrid() {
  const startTime = performance.now();

  // Check initial render
  const gridApi = window.ticketGrid?.gridApi;
  if (!gridApi) {
    console.error('Grid not initialized');
    return;
  }

  // Get row count
  const rowCount = gridApi.getDisplayedRowCount();
  const renderTime = performance.now() - startTime;

  console.log(`Grid Performance:
    - Rows rendered: ${rowCount}
    - Initial render: ${renderTime.toFixed(2)}ms
    - Target: < 200ms
    - Status: ${renderTime < 200 ? '✅ PASS' : '❌ FAIL'}`);
}

loadTestGrid();
```

### Scroll Performance Test
```javascript
// Test virtual scrolling performance
function testScrollPerformance() {
  const gridDiv = document.querySelector('#ticketGrid');
  const scrollArea = gridDiv.querySelector('.ag-body-viewport');

  // Measure scroll FPS
  let frames = 0;
  let startTime = performance.now();

  function measureFrame() {
    frames++;
    if (performance.now() - startTime < 1000) {
      requestAnimationFrame(measureFrame);
    } else {
      console.log(`Scroll Performance:
        - FPS: ${frames}
        - Target: 60 FPS
        - Status: ${frames >= 55 ? '✅ PASS' : '❌ FAIL'}`);
    }
  }

  // Start measuring
  measureFrame();

  // Simulate scrolling
  scrollArea.scrollTop = 0;
  const scrollInterval = setInterval(() => {
    scrollArea.scrollTop += 50;
    if (scrollArea.scrollTop >= scrollArea.scrollHeight - scrollArea.clientHeight) {
      clearInterval(scrollInterval);
    }
  }, 16); // ~60fps
}

// Run test
testScrollPerformance();
```

## Accessibility Testing

### Keyboard Navigation
1. **Tab Navigation**:
   - Tab through grid controls
   - Verify focus indicators visible
   - Check skip links work

2. **Arrow Key Navigation**:
   - Use arrow keys to move between cells
   - Enter to activate cell
   - ESC to cancel edit

3. **Screen Reader Test**:
   - Enable screen reader (NVDA/JAWS)
   - Navigate to grid
   - Verify column headers are announced
   - Check cell content is readable

## Browser Compatibility Matrix

| Browser | Version | Status | Notes |
|---------|---------|---------|-------|
| Chrome | 90+ | ✅ Supported | Primary target |
| Firefox | 88+ | ✅ Supported | Full functionality |
| Safari | 14+ | ✅ Supported | Minor styling differences |
| Edge | 90+ | ✅ Supported | Chromium-based |

## Common Issues & Solutions

### Issue 1: Grid Not Loading
**Symptoms**: Empty grid or loading spinner stuck
**Solution**:
```bash
# Check API endpoint
curl http://localhost:8989/api/tickets

# Restart container if needed
docker-compose restart

# Clear browser cache
# Chrome: Ctrl+Shift+Del
```

### Issue 2: Tooltip Not Showing
**Symptoms**: Hovering doesn't show tooltip
**Solution**:
```javascript
// Check in console
console.log(window.ticketGrid.gridOptions.tooltipShowDelay);
// Should be 300ms, adjust if needed
```

### Issue 3: Theme Not Switching
**Symptoms**: Grid stays in same theme
**Solution**:
```javascript
// Manually trigger theme change
const gridDiv = document.getElementById('ticketGrid');
gridDiv.classList.toggle('ag-theme-quartz');
gridDiv.classList.toggle('ag-theme-quartz-dark');
```

## Automated Test Commands

```bash
# Run unit tests for grid configuration
npm run test:unit -- ticket-grid.test.js

# Run integration tests
npm run test:integration -- tickets-api.test.js

# Run E2E tests with Playwright
npx playwright test tickets2.test.js

# Full test suite
npm run test:tickets-prototype
```

## Reporting Issues

When reporting issues, include:

1. **Browser Details**:
```javascript
// Run in console
console.log(navigator.userAgent);
```

2. **Grid State**:
```javascript
// Capture grid state
const state = {
  rowCount: window.ticketGrid.gridApi.getDisplayedRowCount(),
  columns: window.ticketGrid.columnApi.getAllColumns().map(c => c.colId),
  theme: document.getElementById('ticketGrid').className
};
console.log(JSON.stringify(state, null, 2));
```

3. **Console Errors**:
- Open Developer Tools (F12)
- Check Console tab for red errors
- Copy full error message

4. **Steps to Reproduce**:
- List exact steps taken
- Include any data entered
- Note timing of actions

## Success Criteria

The prototype is considered successful if:

- [ ] All functional requirements (FR-001 to FR-015) pass
- [ ] Page loads in < 2 seconds
- [ ] Grid scrolling maintains 60 FPS
- [ ] Multi-value tooltips work correctly
- [ ] Theme switching is smooth
- [ ] Responsive breakpoints function
- [ ] No console errors during normal use
- [ ] Accessibility standards met
- [ ] Export functionality works
- [ ] Edit modal integration complete

## Next Steps

After successful testing:

1. **Gather Feedback**:
   - User acceptance testing
   - Performance metrics collection
   - Accessibility audit results

2. **Document Findings**:
   - Create issues for any bugs
   - Note enhancement suggestions
   - Record performance baselines

3. **Plan Migration**:
   - Schedule production rollout
   - Prepare user training materials
   - Plan feature flag implementation

---

**Support Contact**: For issues or questions, create an issue in the project repository or contact the development team.

---