# Research: AG-Grid Table Container Overflow Fix

**Generated**: 2025-01-11  
**Spec**: 004-ag-grid-table-overflow-fix

## Research Tasks from Technical Context

### 1. Performance Goals - Resize Animation Duration

**Decision**: 200ms transition duration for height changes  
**Rationale**: Provides smooth visual feedback without feeling sluggish. Industry standard for UI transitions.  
**Alternatives considered**:

- Instant (0ms): Too jarring for users
- 500ms: Feels slow and unresponsive
- CSS spring animations: Over-engineered for simple height change

### 2. Padding Values (FR-007)

**Decision**: 16px (1rem) consistent padding on all sides  
**Rationale**: Aligns with Tabler.io's default spacing scale, maintains visual consistency  
**Alternatives considered**:

- 8px: Too tight, reduces readability
- 24px: Wastes valuable screen space
- Variable padding: Adds complexity without benefit

### 3. Column Width Behavior (FR-008)

**Decision**: Text truncation with ellipsis for overflow content  
**Rationale**: Maintains table structure, tooltips can show full content on hover  
**Alternatives considered**:

- Word wrap: Breaks table row height consistency
- Horizontal scroll per cell: Poor UX, difficult to navigate
- Dynamic column width: Can cause layout thrashing

### 4. Browser Breakpoints (FR-009)

**Decision**: Support viewport widths from 1024px to 4K (3840px)  
**Rationale**: Covers standard desktop/laptop displays used by security professionals  
**Alternatives considered**:

- Mobile-first (320px+): Not needed for enterprise security tool
- Fixed 1920px: Excludes ultrawide monitors
- Fully responsive: Over-engineering for known use case

## AG-Grid Specific Research

### Container Height Management

**Finding**: AG-Grid requires explicit height or flex container for proper rendering  
**Solution**: Use CSS Grid or Flexbox with `flex-grow` for dynamic height  
**Reference**: AG-Grid docs - "Grid Size" section

### Overflow Handling

**Finding**: AG-Grid's default `overflow: hidden` can conflict with container styles  
**Solution**: Apply overflow rules to wrapper div, not AG-Grid container directly  
**Reference**: AG-Grid CSS containment best practices

### Dynamic Row Count

**Finding**: `domLayout: 'autoHeight'` allows grid to size based on row count  
**Solution**: Combine with max-height constraint to prevent infinite growth  
**Reference**: AG-Grid domLayout options

## Tabler.io Integration

### Card Component Constraints

**Finding**: Tabler cards use `overflow: hidden` by default  
**Solution**: Override with `.overflow-visible` utility class where needed  
**Reference**: Tabler utilities documentation

### Responsive Tables

**Finding**: Tabler's `.table-responsive` wrapper conflicts with AG-Grid  
**Solution**: Use AG-Grid's native responsive features instead  
**Reference**: Tabler table documentation warnings

## Browser Compatibility

### CSS Grid/Flexbox Support

**Decision**: Use Flexbox (better AG-Grid compatibility)  
**Browser Support**: All modern browsers (Chrome 60+, Firefox 60+, Safari 11+, Edge 79+)  
**Fallback**: Not needed for target audience

### CSS Custom Properties

**Decision**: Use for maintainable padding/spacing values  
**Browser Support**: All target browsers support CSS variables  
**Polyfill**: Not required

## Performance Considerations

### Reflow Prevention

**Strategy**: Use `transform` for animations where possible, `will-change` for height  
**Measurement**: Chrome DevTools Performance panel to verify <16ms frame time  
**Target**: 60fps during resize transitions

### Virtual Scrolling

**Finding**: AG-Grid virtual scrolling must remain enabled for large datasets  
**Impact**: Container sizing must account for virtual viewport  
**Solution**: Let AG-Grid manage internal scroll, container handles overall height

## Implementation Approach

### CSS-First Solution

**Priority**: Solve with CSS before adding JavaScript  
**Rationale**: Better performance, maintainability, and browser handling  
**Fallback**: Minimal JS only for height calculation if pure CSS insufficient

### Testing Strategy

**E2E Focus**: Visual regression tests for different item counts  
**Tools**: Playwright with screenshot comparison  
**Scenarios**: 10, 25, 50, 100 items with various content lengths

## Resolved Clarifications

All [NEEDS CLARIFICATION] items from spec.md have been resolved:

- FR-007: Padding = 16px (1rem)
- FR-008: Overflow = truncate with ellipsis
- FR-009: Breakpoints = 1024px to 3840px
- FR-010: Performance = 200ms transitions

## Next Steps

Ready for Phase 1: Design & Contracts

- Create data-model.md (minimal - display component only)
- Create quickstart.md with test scenarios
- No API contracts needed (display-only fix)
