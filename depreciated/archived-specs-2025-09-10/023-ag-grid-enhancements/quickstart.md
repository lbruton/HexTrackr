# Quickstart Testing Guide: Enhanced Vulnerability Table

**Date**: 2025-09-09  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)  
**Data Model**: [data-model.md](./data-model.md)

## Prerequisites

1. **Environment Setup**:

   ```bash
   docker-compose up -d  # Start HexTrackr application
   ```

2. **Test Data**: Ensure database has 500+ vulnerability records
   - If needed, import sample CSV data
   - Verify records have varying severities and hostnames

3. **Browser Setup**:
   - Use Chrome/Firefox with Developer Tools available
   - Clear local storage before testing: `localStorage.clear()`

## Manual Test Scenarios

### Test 1: Advanced Filtering (FR-001, FR-002)

**Objective**: Verify advanced filtering with visual header indicators

**Steps**:

1. Navigate to vulnerabilities page
2. Click on "Severity" column header filter icon
3. Select "Critical" from dropdown
4. **Expected**:
   - Table shows only Critical vulnerabilities
   - Severity column header is highlighted/styled differently
   - Status bar updates to show filtered count

**Validation**:

- [ ] Filter reduces visible records
- [ ] Column header shows active filter indicator
- [ ] Status bar shows "X filtered of Y total"
- [ ] Filter persists on page refresh (after implementation)

### Test 2: Column Management (FR-003, FR-004, FR-015)

**Objective**: Verify column resizing and tool panel functionality

**Steps**:

1. Open Columns Tool Panel (look for columns icon/button)
2. Uncheck "Port" column checkbox
3. **Expected**: Port column disappears from table
4. Check "Port" column checkbox again
5. **Expected**: Port column reappears
6. Drag column border to resize "Hostname" column
7. **Expected**: Column width changes smoothly

**Validation**:

- [ ] Columns Tool Panel displays all columns with checkboxes
- [ ] Unchecking column hides it from table
- [ ] Checking column shows it in table
- [ ] Column resize works by dragging borders
- [ ] Select all/none functionality works in tool panel

### Test 3: Pagination (FR-005)

**Objective**: Verify pagination with configurable page sizes

**Steps**:

1. Look for pagination controls at bottom of table
2. **Expected**: Shows "1 to 25 of X" and page navigation
3. Change page size to 50 rows
4. **Expected**: Display updates to show more rows
5. Navigate to page 2
6. **Expected**: Different set of records displayed

**Validation**:

- [ ] Pagination info shows correct format "1 to Y of Z"
- [ ] Page size dropdown has options: 10, 25, 50, 100
- [ ] Page navigation buttons work correctly
- [ ] Status bar updates with pagination changes

### Test 4: Row Grouping (FR-006, FR-012, FR-016)

**Objective**: Verify grouping by Vulnerability ID or Hostname

**Steps**:

1. Look for grouping controls (may be in right-click menu or toolbar)
2. Group by "CVE ID" or "Vulnerability ID"
3. **Expected**: Rows group under CVE headers with counts
4. Click to expand/collapse a group
5. **Expected**: Group expands to show child rows
6. Switch grouping to "Hostname"
7. **Expected**: Rows regroup by hostname

**Validation**:

- [ ] Grouping option available for CVE ID/Vulnerability ID
- [ ] Grouping option available for Hostname
- [ ] Group headers show count in parentheses (e.g., "CVE-2023-1234 (15)")
- [ ] Groups can be expanded/collapsed individually
- [ ] Switching group criteria regroups data correctly

### Test 5: Status Bar (FR-007, FR-013)

**Objective**: Verify status bar information and real-time updates

**Steps**:

1. Look at bottom of table for status information
2. **Expected**: Shows "Total Rows: X" or similar
3. Apply a filter to reduce visible records
4. **Expected**: Status bar updates immediately
5. Change pagination settings
6. **Expected**: Status bar reflects new pagination

**Validation**:

- [ ] Status bar shows total row count
- [ ] Status bar shows pagination information "1 to Y of Z"
- [ ] Status bar updates immediately when filters applied
- [ ] Status bar updates when pagination changes
- [ ] Status bar shows selection count (if rows selected)

### Test 6: Cell Selection and Keyboard Navigation (FR-010)

**Objective**: Verify cell selection and keyboard interaction

**Steps**:

1. Click on a cell in the table
2. **Expected**: Cell becomes selected/highlighted
3. Use arrow keys to navigate between cells
4. **Expected**: Selection moves with keyboard
5. Use Ctrl+Click to select multiple cells (if supported)
6. **Expected**: Multiple cells selected

**Validation**:

- [ ] Individual cells can be selected
- [ ] Keyboard navigation works (arrow keys)
- [ ] Multiple cell selection works (Ctrl+Click)
- [ ] Selection is visually indicated
- [ ] Tab key navigation works properly

### Test 7: Filter Builder (FR-017)

**Objective**: Verify visual filter query builder

**Steps**:

1. Look for "Builder" or "Advanced Filter" button
2. Click to open filter builder interface
3. **Expected**: Visual interface for creating complex filters
4. Create a multi-condition filter (e.g., Severity=Critical AND Status=Open)
5. Apply the filter
6. **Expected**: Table filters according to multiple conditions

**Validation**:

- [ ] Filter builder button is visible and accessible
- [ ] Builder provides visual interface for filter creation
- [ ] Multiple conditions can be added
- [ ] AND/OR logic options available
- [ ] Complex filters apply correctly to table data

### Test 8: Performance Testing (Performance Goals)

**Objective**: Verify performance meets specified targets

**Steps**:

1. Open browser Developer Tools → Performance tab
2. Refresh the vulnerabilities page and record load time
3. **Expected**: Initial load <500ms
4. Apply a complex filter and measure response time
5. **Expected**: Filter operation <200ms
6. Resize a column and measure response time
7. **Expected**: Column resize <100ms

**Validation**:

- [ ] Initial table load completes within 500ms
- [ ] Filter operations complete within 200ms
- [ ] Column resize operations complete within 100ms
- [ ] Smooth scrolling with 500+ records
- [ ] No memory leaks during extended usage

### Test 9: User Preference Persistence (FR-009)

**Objective**: Verify column preferences persist in local storage

**Steps**:

1. Resize several columns to custom widths
2. Hide 2-3 columns using the tool panel
3. Apply some filters
4. Refresh the browser page
5. **Expected**: Column widths, visibility, and filters restored

**Validation**:

- [ ] Column widths persist after page refresh
- [ ] Column visibility persists after page refresh
- [ ] Filter settings persist after page refresh
- [ ] Local storage contains preference data
- [ ] Preferences under 5MB size limit

### Test 10: Existing Functionality Preservation (FR-008)

**Objective**: Verify existing vulnerability table functionality still works

**Steps**:

1. Verify all original table features still function
2. Check that data loads correctly
3. Test any existing sorting functionality
4. Test any existing search functionality
5. **Expected**: No regression in existing features

**Validation**:

- [ ] Original table data displays correctly
- [ ] Existing search/filter functionality works
- [ ] Existing sort functionality works
- [ ] No broken existing features
- [ ] Performance not degraded for basic operations

## Error Scenarios

### Test E1: Invalid Filter Values

**Steps**:

1. Apply invalid filter values (e.g., text in numeric field)
2. **Expected**: Graceful error handling, clear error message

### Test E2: Local Storage Quota Exceeded

**Steps**:

1. Fill local storage to near quota limit
2. Try to save preferences
3. **Expected**: Graceful degradation, preferences cleared if needed

### Test E3: Large Dataset Performance

**Steps**:

1. Load page with 1000+ vulnerability records
2. **Expected**: Performance targets still met, no browser freeze

## Success Criteria

**All tests must pass with the following conditions**:

- ✅ All functional requirements verified
- ✅ Performance targets met
- ✅ No regression in existing functionality
- ✅ Error scenarios handled gracefully
- ✅ User preferences persist correctly
- ✅ Visual indicators work as expected

## Test Environment

**Browser Compatibility**:

- Chrome 90+ ✅
- Firefox 85+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**Test Data Requirements**:

- Minimum 500 vulnerability records
- Records with varying severities
- Records with different hostnames
- Records with different statuses

---

*Testing guide for spec 023-enhance-hextrackr-vulnerability*
