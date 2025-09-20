# Research: Tickets Table AG-Grid Implementation

## Research Summary

This document consolidates research findings for implementing AG-Grid Community Edition for the tickets table prototype.

## AG-Grid Community Multi-Value Cell Strategies

### Decision: Custom Cell Renderers with Truncation
**Rationale**: Provides best balance between information density and readability
**Alternatives Considered**:
- Master/Detail rows: Requires Enterprise Edition
- Expand/collapse inline: Too complex for prototype phase
- Horizontal scrolling: Poor mobile experience

### Implementation Pattern
```javascript
// Custom cell renderer for multi-value arrays
cellRenderer: (params) => {
    const values = params.value || [];
    if (values.length === 0) return '<span class="text-muted">None</span>';

    const displayCount = 2; // Show first 2 items
    const visible = values.slice(0, displayCount);
    const overflow = values.length - displayCount;

    return `
        <div class="multi-value-cell">
            ${visible.map(v => `<span class="badge">${v}</span>`).join(' ')}
            ${overflow > 0 ? `<span class="badge bg-secondary">+${overflow} more</span>` : ''}
        </div>
    `;
}
```

## Tooltip Implementation for Arrays

### Decision: tooltipValueGetter with Full List Display
**Rationale**: Native AG-Grid feature, no external dependencies
**Alternatives Considered**:
- Custom tooltip component: Overcomplicated for requirements
- Title attribute: Limited formatting options

### Implementation Pattern
```javascript
tooltipValueGetter: (params) => {
    const values = params.value || [];
    if (values.length === 0) return null;
    return values.join('\n'); // Each item on new line
}
```

## Theme Switching with AG-Grid Quartz

### Decision: CSS Class Toggle on Grid Container
**Rationale**: Aligns with existing HexTrackr theme management
**Alternatives Considered**:
- Recreate grid on theme change: Performance overhead
- Custom CSS variables: More complex than needed

### Implementation Pattern
```javascript
// Theme adapter pattern from vulnerability-grid.js
class TicketGridThemeAdapter {
    applyTheme(isDark) {
        const gridDiv = document.getElementById('ticketGrid');
        if (isDark) {
            gridDiv.classList.remove('ag-theme-quartz');
            gridDiv.classList.add('ag-theme-quartz-dark');
        } else {
            gridDiv.classList.remove('ag-theme-quartz-dark');
            gridDiv.classList.add('ag-theme-quartz');
        }
    }
}
```

## Responsive Column Management

### Decision: Column Hiding Based on Viewport Width
**Rationale**: Standard AG-Grid pattern, maintains data integrity
**Alternatives Considered**:
- Column grouping: Requires Enterprise Edition
- Horizontal scroll: Poor UX on mobile

### Breakpoints
- Desktop (≥1200px): All columns visible
- Tablet (768-1199px): Hide supervisor, location columns
- Mobile (<768px): Show only ticket#, status, actions

### Implementation Pattern
```javascript
// From ag-grid-responsive-config.js pattern
const isDesktop = window.innerWidth >= 1200;
const isMobile = window.innerWidth < 768;

columnDefs.forEach(col => {
    if (col.field === 'supervisors') {
        col.hide = !isDesktop;
    }
});
```

## Existing Pattern Analysis

### VulnerabilityGridManager Pattern
- Uses createVulnerabilityGridOptions factory function
- **CRITICAL**: AGGridThemeManager does NOT exist - must be created
- Pattern exists in vulnerability-grid.js but no central manager class
- Uses agGrid.createGrid() for initialization (v33 requirement)

### Key Patterns to Reuse
1. Grid options factory function pattern
2. Theme manager registration
3. Responsive column configuration
4. Custom cell renderers for badges/chips
5. Grid API management for updates

## Performance Considerations

### Virtual Scrolling
- AG-Grid Community includes virtual scrolling by default
- Handles 10k+ rows efficiently
- Row buffer of 10 rows recommended

### Initial Load Optimization
- Lazy load AG-Grid library
- Initialize grid after DOM ready
- Use rowData async loading pattern

## Accessibility Requirements

### Keyboard Navigation
- AG-Grid provides built-in keyboard nav
- Tab through cells, Enter to edit
- Arrow keys for navigation

### Screen Reader Support
- Use ariaLabel in column definitions
- Ensure custom renderers include proper ARIA attributes
- Test with NVDA/JAWS

## Testing Strategy

### Unit Tests
- Test custom cell renderers in isolation
- Verify tooltip content generation
- Test theme switching logic

### Integration Tests
- Test grid initialization with mock data
- Verify column hiding at breakpoints
- Test click handlers for ticket editing

### E2E Tests (Playwright)
- Full user journey from load to edit
- Theme switching persistence
- Export functionality
- Mobile responsive behavior

## Dependencies

### Required Libraries
- ag-grid-community: ^31.2.0 (already in project)
- No additional dependencies needed

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

All browsers already supported by HexTrackr.

## Official Documentation Validation (Context7)

### AG-Grid Documentation Consulted
Used Context7 MCP to access official AG-Grid documentation (library ID: /ag-grid/ag-grid):
- Confirmed custom cell renderer pattern for complex cell content
- Validated component registration approach in gridOptions
- Verified column definition structure and properties
- Trust Score: 9.8 (highly authoritative source)

### Key Validations from Official Docs
1. **Custom Cell Renderer Pattern**: Confirmed as standard approach
   ```javascript
   columnDefs: [{
       field: 'devices',
       cellRenderer: CustomDeviceRenderer
   }]
   ```

2. **Component Registration**: Validated gridOptions structure
3. **Module Import**: Confirmed AllCommunityModule usage pattern

Note: While specific tooltipValueGetter documentation wasn't found in Context7 results, the custom cell renderer approach is officially supported and recommended for complex cell content display.

## AG-Grid v33 Critical Lessons (From Memento)

### CRITICAL REQUIREMENTS
Based on HexTrackr's previous AG-Grid v33 migration issues:

1. **Grid Creation Pattern (MANDATORY)**
   ```javascript
   // CORRECT - Use createGrid
   this.gridApi = agGrid.createGrid(gridDiv, gridOptions);

   // WRONG - Deprecated constructor
   new agGrid.Grid(gridDiv, gridOptions);  // DO NOT USE
   ```

2. **Theme Setting During Creation (MANDATORY)**
   ```javascript
   // CORRECT - Set theme during grid creation
   const gridOptions = {
     theme: isDarkMode ? themeQuartz.withParams({...}) : themeQuartz,
     // other options
   };

   // WRONG - Setting theme after creation causes errors
   gridApi.updateGridOptions({ theme: newTheme }); // CAUSES ERRORS
   ```

3. **Memory Leak Prevention (CRITICAL)**
   ```javascript
   // Must cleanup theme listeners
   destroy() {
     if (window.agGridThemeManager) {
       window.agGridThemeManager.unregisterGrid('ticketGrid');
     }
     if (this.gridApi) {
       this.gridApi.destroy();
     }
   }
   ```

### Edge Cases Discovered
- Escaped semicolons (\\;) in supervisor names need special handling
- Empty arrays can crash custom renderers without null checks
- XSS vulnerability in tooltip content requires DOMPurify
- Row virtualization must be enabled for 1000+ rows
- ARIA attributes required for accessibility compliance

### AGGridThemeManager Creation Requirements
Since this class doesn't exist, we must create it with:
- `registerGrid(id, adapter)` method
- `unregisterGrid(id)` method
- Theme change event broadcasting
- Memory-safe listener management

## Migration Path

### Phase 1: Prototype (tickets2.html)
- Implement all features in parallel page
- Allow side-by-side testing
- Gather user feedback

### Phase 2: Integration
- Port successful patterns back to tickets.html
- Gradual rollout with feature flag
- Maintain backward compatibility

### Phase 3: Deprecation
- Remove old table implementation
- Update documentation
- Archive tickets2.html prototype

---