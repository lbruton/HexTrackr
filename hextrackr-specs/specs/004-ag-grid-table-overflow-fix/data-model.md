# Data Model: AG-Grid Table Container Overflow Fix

**Generated**: 2025-01-11  
**Type**: Display Component Configuration

## Overview

This is a display-only fix that requires no database changes or new data entities. The data model consists of display configuration and CSS properties.

## Display Components

### 1. VulnerabilityTableContainer

**Purpose**: Wrapper element that enforces boundaries for the AG-Grid table

**Properties**:

- `padding`: 16px (1rem) on all sides
- `overflow`: visible (allows proper AG-Grid shadow rendering)
- `display`: flex
- `flex-direction`: column
- `min-height`: Calculated based on item count
- `max-height`: 80vh (prevents full-screen takeover)

**State**:

- `itemCount`: 10 | 25 | 50 | 100 (user-selected)
- `isResizing`: boolean (during transitions)

### 2. AGGridWrapper

**Purpose**: Direct parent of AG-Grid instance

**Properties**:

- `flex-grow`: 1
- `position`: relative
- `overflow`: hidden (managed by AG-Grid)
- `transition`: height 200ms ease-in-out

**Constraints**:

- Must maintain AG-Grid's required structure
- Cannot interfere with virtual scrolling

### 3. ItemCountSelector

**Purpose**: Existing dropdown control (no changes needed)

**Current Values**:

- 10 items (default)
- 25 items
- 50 items  
- 100 items

**Events**:

- `onItemCountChange`: Triggers container resize

## CSS Custom Properties

```css
:root {
  --table-container-padding: 1rem;
  --table-transition-duration: 200ms;
  --table-max-height: 80vh;
  --table-min-row-height: 48px;
}
```

## Height Calculation Logic

```
containerHeight = (itemCount * rowHeight) + headerHeight + padding + scrollbarAllowance

Where:
- rowHeight = 48px (AG-Grid default)
- headerHeight = 56px (with filters)
- padding = 32px (top + bottom)
- scrollbarAllowance = 17px (horizontal scrollbar)
```

## Responsive Breakpoints

### Desktop (1024px - 1920px)

- Standard layout
- Full feature set

### Wide Desktop (1920px - 3840px)

- Same as desktop
- May show more columns without scroll

### Ultra-wide (3840px+)

- Same as wide desktop
- Maximum column width constraints apply

## AG-Grid Configuration Updates

```javascript
gridOptions = {
  // Existing options maintained
  domLayout: 'normal', // Not 'autoHeight' - we manage container
  suppressHorizontalScroll: false, // Allow when needed
  alwaysShowHorizontalScroll: false, // Only when needed
  rowHeight: 48, // Explicit for calculations
  headerHeight: 56, // Explicit for calculations
}
```

## Text Overflow Handling

### Column-Specific Rules

**CVE Column**:

- Max-width: 200px
- Overflow: ellipsis
- Tooltip: Full CVE on hover

**Description Column**:

- Max-width: 400px
- Overflow: ellipsis
- Tooltip: Full description on hover

**Hostname/IP Columns**:

- Max-width: 150px
- Overflow: ellipsis
- Tooltip: Full value on hover

## Animation States

### State Transitions

1. **IDLE**: Default state, no animations
2. **RESIZING**: Height transition active (200ms)
3. **SETTLED**: Post-resize, animations complete

### Performance Targets

- Frame rate: 60fps during transitions
- Paint time: <16ms per frame
- Reflow: Minimized via transform where possible

## Integration Points

### Existing Files to Modify

1. **app/public/vulnerabilities.html**
   - Table container structure
   - CSS class applications

2. **app/public/css/vulnerability-table.css** (new file)
   - All containment styles
   - Custom properties
   - Responsive rules

3. **app/public/scripts/shared/ag-grid-config.js**
   - Grid options updates
   - Height calculation logic

## Validation Rules

1. Container padding must be uniform (all sides equal)
2. Transition duration must be between 100-300ms
3. Max height must not exceed 80% viewport
4. Min height must accommodate at least 10 rows
5. Horizontal scroll must never affect page body

## Browser Compatibility Matrix

| Feature | Chrome 90+ | Firefox 88+ | Safari 14+ | Edge 90+ |
|---------|------------|-------------|------------|----------|
| Flexbox | ✓ | ✓ | ✓ | ✓ |
| CSS Variables | ✓ | ✓ | ✓ | ✓ |
| Transition | ✓ | ✓ | ✓ | ✓ |
| Calc() | ✓ | ✓ | ✓ | ✓ |

## No Database Impact

This fix requires no changes to:

- SQLite schema
- Data import/export
- API endpoints
- Backend services

All changes are frontend display only.
