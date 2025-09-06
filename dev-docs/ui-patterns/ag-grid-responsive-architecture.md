# AG Grid Responsive Architecture - HexTrackr v1.0.4

## Overview

HexTrackr implements a sophisticated responsive AG Grid configuration that adapts to different screen sizes and provides optimal user experience across desktop, tablet, and mobile devices. This document details the responsive patterns, performance optimizations, and architectural decisions.

## Responsive Breakpoint Strategy

### Breakpoint Definitions

```javascript
const breakpoints = {
  mobile: 768,   // < 768px
  tablet: 1200,  // 768px - 1199px  
  desktop: 1200  // >= 1200px
};
```

### Column Visibility Matrix

| Column | Mobile (<768px) | Tablet (768-1199px) | Desktop (>=1200px) |
|--------|-----------------|---------------------|-------------------|
| **Last Seen** | ❌ Hidden | ✅ Visible | ✅ Visible |
| **Severity** | ✅ Visible | ✅ Visible | ✅ Visible |
| **VPR Score** | ✅ Visible | ✅ Visible | ✅ Visible |
| **Hostname** | ✅ Visible | ✅ Visible | ✅ Visible |
| **IP Address** | ❌ Hidden | ✅ Visible | ✅ Visible |
| **Vendor** | ❌ Hidden | ❌ Hidden | ✅ Visible |
| **CVE/Vulnerability** | ❌ Hidden | ✅ Visible | ✅ Visible |
| **Description** | ✅ Visible | ✅ Visible | ✅ Visible |

## Architecture Components

### 1. Configuration Factory Pattern

```javascript
// scripts/shared/ag-grid-responsive-config.js
function createVulnerabilityGridOptions(componentContext) {
  const isDesktop = window.innerWidth >= 1200;
  const isMobile = window.innerWidth < 768;
  
  return {
    columnDefs: buildResponsiveColumns(isDesktop, isMobile),
    // ... grid options
  };
}
```

## Benefits:

- **Centralized Configuration**: Single source of truth for grid setup
- **Context Injection**: Access to parent component methods via `componentContext`
- **Dynamic Column Management**: Real-time responsive adjustments

### 2. Debounced Resize Handling

```javascript
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Applied to resize events
window.addEventListener("resize", debounce(() => {
  if (componentContext.gridApi) {
    updateColumnVisibility(params.api);
  }
}, 200));
```

## Performance Impact:

- **Event Throttling**: Limits resize calculations to every 200ms
- **CPU Optimization**: Prevents excessive DOM manipulation
- **Smooth UX**: Maintains responsive feel without stuttering

### 3. Dynamic Column Visibility System

```javascript
function updateColumnVisibility(api) {
  const gridWidth = window.innerWidth;
  const breakpoints = { small: 768, large: 1200 };
  
  const columnsToShow = [];
  const columnsToHide = [];

  allColumns.forEach(column => {
    const colId = column.getColId();
    switch (colId) {
      case "last_seen":
        gridWidth < breakpoints.small ? columnsToHide.push(colId) : columnsToShow.push(colId);
        break;
      case "vendor":
        gridWidth < breakpoints.large ? columnsToHide.push(colId) : columnsToShow.push(colId);
        break;
      // ... other columns
    }
  });

  api.setColumnsVisible(columnsToShow, true);
  api.setColumnsVisible(columnsToHide, false);
}
```

## Column Configuration Patterns

### 1. Severity Badge Rendering

```javascript
{
  headerName: "Severity",
  field: "severity",
  width: 110,
  cellRenderer: (params) => {
    const severity = params.value || "Low";
    const className = `severity-${severity.toLowerCase()}`;
    return `<span class="severity-badge ${className}">${severity}</span>`;
  }
}
```

## Features:

- **Visual Hierarchy**: Color-coded severity levels
- **Consistent Styling**: Bootstrap-based badge system
- **Accessibility**: High contrast color scheme

### 2. VPR Score with Dynamic Styling

```javascript
{
  headerName: "VPR",
  field: "vpr_score",
  cellRenderer: (params) => {
    const score = parseFloat(params.value) || 0;
    let className = "severity-low";
    if (score >= 9.0) className = "severity-critical";
    else if (score >= 7.0) className = "severity-high";
    else if (score >= 4.0) className = "severity-medium";
    
    return `<span class="severity-badge ${className}">${score.toFixed(1)}</span>`;
  }
}
```

## Thresholds:

- **Critical**: >= 9.0 (Red)
- **High**: >= 7.0 (Orange)
- **Medium**: >= 4.0 (Yellow)
- **Low**: < 4.0 (Green)

### 3. Interactive Hostname Links

```javascript
{
  headerName: "Hostname",
  field: "hostname",
  cellRenderer: (params) => {
    const hostname = params.value || "-";
    return `<a href="#" class="fw-bold text-primary text-decoration-none" 
             onclick="vulnManager.viewDeviceDetails('${hostname}')">${hostname}</a>`;
  }
}
```

### 4. Smart CVE/Cisco SA Detection

```javascript
{
  headerName: "Vulnerability",
  field: "cve",
  cellRenderer: (params) => {
    const cve = params.value;
    const pluginName = params.data.plugin_name;
    
    // Priority 1: Standard CVE
    if (cve && cve.startsWith("CVE-")) {
      return `<a href="#" onclick="vulnManager.lookupVulnerability('${cve}')">${cve}</a>`;
    }
    
    // Priority 2: Cisco Security Advisory
    if (pluginName && typeof pluginName === "string") {
      const ciscoSaMatch = pluginName.match(/cisco-sa-([a-zA-Z0-9-]+)/i);
      if (ciscoSaMatch) {
        const ciscoId = `cisco-sa-${ciscoSaMatch[1]}`;
        return `<a href="#" class="text-warning" onclick="vulnManager.lookupVulnerability('${ciscoId}')">${ciscoId}</a>`;
      }
    }
    
    // Fallback: Plugin ID
    return params.data.plugin_id ? `<span class="text-muted">Plugin ${params.data.plugin_id}</span>` : "-";
  }
}
```

## Detection Logic:

1. **CVE Format**: `CVE-YYYY-NNNNN` pattern matching
2. **Cisco SA**: `cisco-sa-*` extraction from plugin_name
3. **Plugin Fallback**: Display plugin_id when no CVE/SA found

### 5. Modal Integration Pattern

```javascript
{
  headerName: "Vulnerability Description",
  field: "plugin_name",
  cellRenderer: (params) => {
    const value = params.value || "-";
    
    if (value !== "-") {
      // Generate unique ID for modal data storage
      const vulnDataId = `vuln_${params.data.hostname}_${params.data.cve || params.data.plugin_id}_${Date.now()}`;
      
      // Store data in global modal registry
      if (!window.vulnModalData) window.vulnModalData = {};
      window.vulnModalData[vulnDataId] = params.data;
      
      return `<a href="#" onclick="vulnManager.viewVulnerabilityDetails('${vulnDataId}')" 
               title="${value}">${value}</a>`;
    }
    return value;
  }
}
```

## Modal Data Flow:

1. **Unique ID Generation**: Timestamp-based unique identifiers
2. **Global Storage**: `window.vulnModalData` registry
3. **Context Passing**: Full row data available to modal
4. **Memory Management**: Automatic cleanup on modal close

## Performance Optimizations

### 1. Pagination Configuration

```javascript
{
  pagination: true,
  paginationPageSize: 10,
  paginationPageSizeSelector: [10, 25, 50, 100, 200],
  domLayout: "autoHeight",
  suppressScrollOnNewData: true
}
```

## Benefits: (2)

- **Reduced DOM**: Only renders visible rows
- **Memory Efficiency**: Smaller page sizes for mobile
- **User Control**: Flexible page size selection

### 2. Column Virtualization

```javascript
{
  suppressColumnVirtualisation: false,
  suppressHorizontalScroll: false,
  alwaysShowHorizontalScroll: false
}
```

## Impact:

- **Mobile Optimization**: Horizontal scroll when needed
- **Performance**: Only renders visible columns
- **Responsive**: Adapts to container width changes

### 3. Event Handler Optimization

```javascript
onGridReady: (params) => {
  // Debounced resize handling
  window.addEventListener("resize", debounce(() => {
    updateColumnVisibility(params.api);
  }, 200));
  
  // Initial column visibility
  setTimeout(() => updateColumnVisibility(params.api), 100);
},

onGridSizeChanged: (params) => {
  updateColumnVisibility(params.api);
}
```

## Responsive UX Patterns

### 1. Mobile-First Column Priority

## Essential Columns (Always Visible):

- Severity (visual priority)
- Hostname (primary identifier)  
- Description (context)

## Secondary Columns (Tablet+):

- Last Seen (temporal context)
- IP Address (technical detail)
- CVE/Vulnerability ID (reference)

## Tertiary Columns (Desktop Only):

- Vendor (organizational context)

### 2. Progressive Enhancement

```javascript
// Base configuration
const baseConfig = {
  rowHeight: 42,
  animateRows: true,
  rowSelection: "multiple"
};

// Enhanced features for larger screens
if (window.innerWidth >= 1200) {
  config.enableRangeSelection = true;
  config.enableRangeHandle = true;
  config.enableFillHandle = true;
}
```

### 3. Touch-Friendly Interactions

```javascript
// Larger touch targets on mobile
const mobileOptimizations = {
  rowHeight: isMobile ? 48 : 42,  // Increased for touch
  headerHeight: isMobile ? 40 : 32,
  suppressRowClickSelection: true  // Prevents accidental selection
};
```

## Integration with ModernVulnManager

### Context Injection Pattern

```javascript
// In ModernVulnManager constructor
const gridOptions = createVulnerabilityGridOptions(this);

// Provides access to:
// - this.gridApi
// - this.viewDeviceDetails()
// - this.viewVulnerabilityDetails() 
// - this.lookupVulnerability()
```

### Event Bridge System

```javascript
onPaginationChanged: (params) => {
  if (componentContext && typeof componentContext.updatePaginationInfo === "function") {
    const totalRows = params.api.getDisplayedRowCount();
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    componentContext.updatePaginationInfo(totalRows, currentPage, pageSize);
  }
}
```

## Testing Patterns

### Responsive Breakpoint Testing

```javascript
// Playwright test pattern
await page.setViewportSize({ width: 375, height: 667 });  // Mobile
await page.setViewportSize({ width: 768, height: 1024 }); // Tablet  
await page.setViewportSize({ width: 1200, height: 800 }); // Desktop
```

### Column Visibility Validation

```javascript
// Check mobile columns are hidden
const hiddenColumns = ['last_seen', 'ip_address', 'vendor', 'cve'];
for (const colId of hiddenColumns) {
  await expect(page.locator(`[col-id="${colId}"]`)).toBeHidden();
}
```

### Performance Assertions

```javascript
// Grid load time validation  
const startTime = Date.now();
await page.waitForSelector('.ag-grid-wrapper', { timeout: 10000 });
const loadTime = Date.now() - startTime;
expect(loadTime).toBeLessThan(2000); // < 2 second load requirement
```

## Best Practices

### 1. Column Width Management

- **Minimum Widths**: Prevent text truncation
- **Maximum Widths**: Maintain visual balance
- **Flexible Sizing**: Relative width adjustments

### 2. Content Overflow Handling

- **Text Ellipsis**: `text-overflow: ellipsis` for long content
- **Tooltips**: `title` attributes for full text
- **Modal Links**: Detailed view for complex data

### 3. Accessibility Considerations

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Semantic HTML in cell renderers
- **Color Contrast**: WCAG 2.1 AA compliance for severity badges

### 4. Performance Guidelines

- **Debounce Resize**: 200ms delay for smooth performance
- **Lazy Initialization**: Delay non-critical setup
- **Memory Management**: Cleanup event listeners and modal data

## Future Enhancements

### Planned Features

- **Custom Breakpoints**: User-configurable responsive breakpoints  
- **Column Profiles**: Save/restore custom column configurations
- **Advanced Filtering**: Mobile-optimized filter interface
- **Gesture Support**: Swipe gestures for mobile navigation

### Performance Targets

- **Initial Load**: < 2 seconds for 10,000 rows
- **Resize Response**: < 100ms column visibility updates
- **Memory Usage**: < 50MB for large datasets
- **Mobile Performance**: 60fps scrolling on modern devices
