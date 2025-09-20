# Data Model: Tickets Table AG-Grid Implementation

## Overview
This document defines the data structures and entities for the tickets table modernization using AG-Grid Community Edition.

## Core Entities

### 1. GridConfiguration
**Purpose**: Defines the AG-Grid configuration for the tickets table

```javascript
{
  gridOptions: {
    domLayout: 'normal',          // Standard scrolling layout
    rowHeight: 48,                // Single-line row height
    headerHeight: 40,             // Standard header height
    animateRows: true,            // Smooth row animations
    pagination: false,            // Virtual scrolling instead
    rowBuffer: 10,                // Buffer for smooth scrolling
    suppressRowClickSelection: true,  // Prevent row selection on click
    enableCellTextSelection: true,    // Allow text copying
    tooltipShowDelay: 300,        // Delay before showing tooltips
    defaultColDef: {
      sortable: true,
      resizable: true,
      filter: true,
      tooltipComponent: 'agTooltipComponent'
    }
  }
}
```

### 2. TicketRow
**Purpose**: Represents a single ticket in the grid

```javascript
{
  // Primary identifiers
  id: number,                    // Internal database ID
  ticketNumber: string,          // Display ticket number (clickable)

  // Dates
  submissionDate: string,        // ISO date string
  dueDate: string,              // ISO date string

  // References
  internalRef: string,          // Internal reference number
  externalRef: string,          // External reference number

  // Location
  site: string,                 // Site name
  location: string,             // Specific location within site

  // Multi-value fields
  devices: string[],            // Array parsed from JSON string in DB
  supervisors: string[],        // Array created from semicolon-delimited string

  // Status
  status: string,               // Current status (Active, Pending, etc.)
  isOverdue: boolean,           // Calculated field for styling

  // Actions (not displayed, used for operations)
  bundleId: string,            // For View Bundle action
  hasDownload: boolean         // For Download Bundle action
}
```

### 3. ColumnDefinition
**Purpose**: Defines individual column configuration

```javascript
{
  field: string,                // Data field name
  headerName: string,           // Display header text
  width: number,               // Initial column width
  minWidth: number,            // Minimum width for resizing
  maxWidth: number,            // Maximum width for resizing
  hide: boolean,               // Responsive visibility flag

  // Custom rendering
  cellRenderer: function,      // Custom cell renderer for multi-values
  cellClass: function,        // Dynamic CSS class based on data

  // Tooltips
  tooltipValueGetter: function,  // Custom tooltip content
  tooltipShowDelay: number,      // Override default delay

  // Responsive behavior
  lockVisible: boolean,        // Always visible regardless of viewport
  responsiveHide: {
    mobile: boolean,          // Hide on mobile (<768px)
    tablet: boolean,          // Hide on tablet (768-1199px)
    desktop: boolean          // Hide on desktop (≥1200px)
  }
}
```

### 4. MultiValueDisplay
**Purpose**: Configuration for displaying arrays in cells

```javascript
{
  displayCount: number,         // Number of items to show (default: 2)
  separator: string,           // Separator between items (default: ' ')
  overflowIndicator: string,   // Text format (default: '+{count} more')
  emptyText: string,           // Text when array is empty (default: 'None')
  badgeClass: string,          // CSS class for badge styling
  tooltipFormatter: function   // Format array for tooltip display
}
```

### 5. ThemeConfiguration
**Purpose**: Manages AG-Grid theme switching

```javascript
{
  currentTheme: string,         // 'light' or 'dark'
  lightClass: string,          // 'ag-theme-quartz'
  darkClass: string,           // 'ag-theme-quartz-dark'
  customStyles: {
    // Overdue row highlighting
    overdueLight: string,       // CSS for overdue in light theme
    overdueDark: string,        // CSS for overdue in dark theme

    // Multi-value badges
    badgeLight: string,         // Badge style in light theme
    badgeDark: string          // Badge style in dark theme
  }
}
```

### 6. GridState
**Purpose**: Maintains grid state for persistence

```javascript
{
  sortModel: [{
    colId: string,             // Column being sorted
    sort: string               // 'asc' or 'desc'
  }],
  filterModel: {
    [columnId]: {
      filterType: string,      // Filter type
      filter: any              // Filter value
    }
  },
  columnState: [{
    colId: string,
    width: number,
    hide: boolean,
    pinned: string            // 'left', 'right', or null
  }],
  scrollPosition: {
    top: number,              // Vertical scroll position
    left: number              // Horizontal scroll position
  }
}
```

## Data Transformation Patterns

### 1. API Response to Grid Data
```javascript
// Transform from API response to grid row format
// CRITICAL: devices come as JSON arrays, supervisors as semicolon-delimited
function transformTicketToRow(apiTicket) {
  // Parse devices - already an array from JSON.parse() in service
  const devices = Array.isArray(apiTicket.devices) ? apiTicket.devices : [];

  // Parse supervisors - semicolon-delimited "LAST, FIRST; LAST, FIRST"
  const supervisors = apiTicket.supervisor ?
    apiTicket.supervisor.split(';')
      .map(s => s.trim())
      .filter(s => s)
      .map(s => s.replace(/\\;/g, ';')) // Handle escaped semicolons
    : [];

  return {
    id: apiTicket.id,
    ticketNumber: apiTicket.xt_number || apiTicket.xtNumber,
    submissionDate: apiTicket.dateSubmitted,
    dueDate: apiTicket.dateDue,
    internalRef: apiTicket.hexagonTicket || '',
    externalRef: apiTicket.serviceNowTicket || '',
    site: apiTicket.site,
    location: apiTicket.location,
    devices: devices,
    supervisors: supervisors,
    status: apiTicket.status,
    isOverdue: new Date(apiTicket.dateDue) < new Date(),
    bundleId: apiTicket.id,
    hasDownload: apiTicket.attachments && apiTicket.attachments.length > 0
  };
}
```

### 2. Multi-Value Cell Formatting
```javascript
// Format array values for display
function formatMultiValue(values, config) {
  if (!values || values.length === 0) {
    return config.emptyText;
  }

  const visible = values.slice(0, config.displayCount);
  const overflow = values.length - config.displayCount;

  return {
    visible,
    overflow,
    overflowText: overflow > 0 ?
      config.overflowIndicator.replace('{count}', overflow) : null
  };
}
```

### 3. Tooltip Content Generation
```javascript
// Generate tooltip content for multi-value fields
function generateTooltipContent(values, formatter) {
  if (!values || values.length === 0) {
    return null;
  }

  if (formatter) {
    return formatter(values);
  }

  // Default: each value on new line
  return values.join('\n');
}
```

## Integration Points

### 1. Existing Ticket Service
- **Endpoint**: GET /api/tickets
- **Response**: Array of ticket objects
- **Transform**: Use transformTicketToRow() for each ticket

### 2. Theme Manager Integration
- **Subscribe**: Listen to theme change events
- **Update**: Apply new theme class to grid container
- **Persist**: Save theme preference to localStorage

### 3. Modal Integration
- **Click Handler**: Ticket number clicks trigger modal
- **Data Passing**: Pass full ticket data to modal
- **Delete Action**: Moved from grid to modal

## Performance Considerations

### 1. Virtual Scrolling
- Enabled by default in AG-Grid Community
- Renders only visible rows
- Handles 10,000+ rows efficiently

### 2. Data Updates
- Use grid API's updateRowData() for incremental updates
- Batch updates to reduce re-renders
- Maintain row references for efficient updates

### 3. Memory Management
- Limit in-memory cache to visible rows + buffer
- Clear unused event listeners on destroy
- Dispose of grid instance properly

## Validation Rules

### 1. Required Fields
- ticketNumber: Must be unique and non-empty
- submissionDate: Valid ISO date
- dueDate: Valid ISO date
- status: Must be from predefined list

### 2. Multi-Value Arrays
- Maximum 50 items per array
- Each item maximum 100 characters
- No duplicate values within array

### 3. Grid Configuration
- At least one column must be visible
- Column widths must be within min/max bounds
- Sort can only be applied to one column at a time

---