# CSS Customization Guide

This guide provides comprehensive information on customizing the HexTrackr interface while maintaining theme consistency and avoiding conflicts with the centralized theme system.

## Understanding the CSS Architecture

HexTrackr uses a **4-layer CSS architecture** designed for maintainability and theme consistency:

1. **Foundation Layer**: CSS variables and base styles
2. **Shared Layer**: Reusable component styles
3. **Page Layer**: Page-specific customizations
4. **Override Layer**: Component-specific fixes (AG-Grid, third-party)

---

## CSS File Organization

### 📁 `/styles/` Directory Structure

```
styles/
├── css-variables.css          # Global CSS variables (theme colors)
├── ag-grid-overrides.css      # AG-Grid theme fixes
├── shared/                    # Reusable component styles
│   ├── base.css              # Core typography and base styles
│   ├── dark-theme.css        # Dark mode color overrides
│   ├── light-theme.css       # Light mode color overrides
│   ├── header.css            # Navigation header
│   ├── modals.css            # Modal dialogs
│   ├── cards.css             # Card components
│   ├── tables.css            # Bootstrap tables
│   ├── badges.css            # Status badges and pills
│   ├── animations.css        # CSS animations
│   └── layouts.css           # Layout and grid system
├── pages/                     # Page-specific styles
│   ├── vulnerabilities.css   # Vulnerability dashboard
│   ├── tickets.css           # Original tickets page
│   └── tickets2.css          # AG-Grid tickets prototype
└── utils/                     # Utility styles
    └── responsive.css         # Media queries and breakpoints
```

---

## Customization Patterns

### ✅ Recommended Approach: CSS Variables First

Always start with CSS variables for consistent theming:

```css
/* ✅ GOOD: Use theme variables */
.custom-component {
  background: var(--hextrackr-surface-base);
  color: var(--hextrackr-text-primary);
  border: 1px solid var(--hextrackr-border-color);
}

/* ❌ AVOID: Hardcoded colors break theme switching */
.custom-component {
  background: #ffffff;
  color: #2d3748;
  border: 1px solid #e2e8f0;
}
```

### Available CSS Variables

#### Core Theme Variables

```css
/* Background Colors */
--hextrackr-bg-primary        /* Main page background */
--hextrackr-bg-secondary      /* Secondary background */
--hextrackr-surface-base      /* Card/modal background */

/* Text Colors */
--hextrackr-text-primary      /* Main text color */
--hextrackr-text-secondary    /* Secondary text */
--hextrackr-text-muted        /* Muted/disabled text */

/* Border Colors */
--hextrackr-border-color      /* Standard border color */
--hextrackr-border-light      /* Light border variant */

/* Interactive Colors */
--hextrackr-link-color        /* Standard link color */
--hextrackr-grid-link         /* AG-Grid link color */
```

#### VPR Severity Variables

```css
--vpr-critical                /* Critical vulnerability color */
--vpr-high                    /* High severity color */
--vpr-medium                  /* Medium severity color */
--vpr-low                     /* Low severity color */
--vpr-info                    /* Informational color */
```

#### AG-Grid Specific Variables

```css
--hextrackr-grid-header       /* AG-Grid header background */
--hextrackr-grid-chrome       /* AG-Grid chrome areas */
--hextrackr-grid-selection    /* Selected row background */
```

---

## Page-Specific Customizations

### Adding Custom Styles to Existing Pages

**1. Create page-specific CSS file:**

```css
/* styles/pages/my-custom-page.css */
.my-custom-component {
  background: var(--hextrackr-surface-base);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.my-custom-card {
  background: var(--hextrackr-surface-base);
  border: 1px solid var(--hextrackr-border-color);
  transition: box-shadow 0.2s ease;
}

.my-custom-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

**2. Include in HTML file:**

```html
<link rel="stylesheet" href="styles/pages/my-custom-page.css">
```

### Extending Existing Pages

**Vulnerabilities page customization:**

```css
/* styles/pages/vulnerabilities.css - Add to existing file */
.vulnerability-dashboard .custom-section {
  background: var(--hextrackr-surface-base);
  border-left: 4px solid var(--vpr-high);
  padding: 1rem;
  margin: 1rem 0;
}

.custom-severity-indicator {
  background: var(--vpr-critical);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}
```

---

## Component Customization

### Creating Theme-Aware Components

**Basic Card Component:**

```css
.custom-info-card {
  background: var(--hextrackr-surface-base);
  border: 1px solid var(--hextrackr-border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.custom-info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.custom-info-card .title {
  color: var(--hextrackr-text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.custom-info-card .description {
  color: var(--hextrackr-text-secondary);
  line-height: 1.5;
}
```

**Status Badge Component:**

```css
.custom-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.custom-status-badge.success {
  background: var(--vpr-low);
  color: white;
}

.custom-status-badge.warning {
  background: var(--vpr-high);
  color: white;
}

.custom-status-badge.danger {
  background: var(--vpr-critical);
  color: white;
}
```

---

## AG-Grid Customizations

### Custom Cell Renderers

When creating custom cell renderers, always use theme-aware classes:

```javascript
// ✅ GOOD: Theme-aware cell renderer
cellRenderer: (params) => {
  const severity = params.value.toLowerCase();
  return `<span class="badge severity-${severity}">${params.value}</span>`;
}

// CSS for the badge
.severity-critical {
  background: var(--vpr-critical);
  color: white;
}
```

### Custom AG-Grid Column Styling

```css
/* Custom column header styling */
.ag-theme-quartz .ag-header-cell[col-id="custom-column"] {
  background: var(--hextrackr-grid-header) !important;
  font-weight: 600;
}

/* Custom cell styling */
.ag-theme-quartz .ag-cell[col-id="status"] {
  padding: 0.5rem;
}

.ag-theme-quartz .ag-cell[col-id="status"] .status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.5rem;
}
```

---

## Dark Mode Considerations

### Ensuring Dark Mode Compatibility

**1. Always test in both themes:**

```css
/* This works in both light and dark modes */
.custom-component {
  background: var(--hextrackr-surface-base);
  color: var(--hextrackr-text-primary);
}

/* Avoid theme-specific styling unless necessary */
[data-bs-theme="dark"] .custom-component {
  /* Only add if the component needs dark-mode specific tweaks */
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.05);
}
```

**2. Handle transparency carefully:**

```css
.custom-overlay {
  background: rgba(0, 0, 0, 0.5); /* Works in light mode */
}

[data-bs-theme="dark"] .custom-overlay {
  background: rgba(0, 0, 0, 0.7); /* Adjust for dark mode visibility */
}
```

**3. Use semantic color variables:**

```css
.success-message {
  background: var(--vpr-low);   /* Auto-adjusts for theme */
  color: white;                 /* Safe in both themes */
}
```

---

## Animation and Interaction

### CSS Animations

**Loading Animations:**

```css
@keyframes customPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.custom-loading {
  animation: customPulse 2s infinite;
  background: var(--hextrackr-surface-base);
}
```

**Hover Effects:**

```css
.custom-interactive {
  transition: all 0.2s ease;
  background: var(--hextrackr-surface-base);
  border: 1px solid var(--hextrackr-border-color);
}

.custom-interactive:hover {
  background: var(--hextrackr-bg-secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

---

## Responsive Design

### Mobile-First Approach

```css
/* Mobile-first base styles */
.custom-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .custom-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .custom-grid {
    grid-template-columns: repeat(3, 1fr);
    padding: 2rem;
  }
}
```

### Responsive Typography

```css
.custom-title {
  font-size: 1.25rem;
  color: var(--hextrackr-text-primary);
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .custom-title {
    font-size: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .custom-title {
    font-size: 1.75rem;
  }
}
```

---

## Common Customization Patterns

### 1. Custom Dashboard Widgets

```css
.dashboard-widget {
  background: var(--hextrackr-surface-base);
  border: 1px solid var(--hextrackr-border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.dashboard-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--vpr-low), var(--vpr-high));
}

.widget-title {
  color: var(--hextrackr-text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.widget-content {
  color: var(--hextrackr-text-secondary);
}
```

### 2. Custom Form Styling

```css
.custom-form-group {
  margin-bottom: 1.5rem;
}

.custom-label {
  display: block;
  color: var(--hextrackr-text-primary);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.custom-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--hextrackr-border-color);
  background: var(--hextrackr-surface-base);
  color: var(--hextrackr-text-primary);
  border-radius: 0.375rem;
  transition: border-color 0.2s ease;
}

.custom-input:focus {
  outline: none;
  border-color: var(--hextrackr-link-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### 3. Custom Navigation Elements

```css
.custom-nav-item {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: var(--hextrackr-text-secondary);
  text-decoration: none;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.custom-nav-item:hover {
  background: var(--hextrackr-bg-secondary);
  color: var(--hextrackr-text-primary);
}

.custom-nav-item.active {
  background: var(--hextrackr-link-color);
  color: white;
}
```

---

## Performance Best Practices

### 1. CSS Loading Strategy

**Optimal loading order:**

```html
<!-- 1. Critical CSS first -->
<link rel="stylesheet" href="styles/css-variables.css">
<link rel="stylesheet" href="styles/shared/base.css">

<!-- 2. Theme CSS -->
<link rel="stylesheet" href="styles/shared/light-theme.css">
<link rel="stylesheet" href="styles/shared/dark-theme.css">

<!-- 3. Component CSS -->
<link rel="stylesheet" href="styles/shared/cards.css">
<link rel="stylesheet" href="styles/shared/modals.css">

<!-- 4. Page-specific CSS -->
<link rel="stylesheet" href="styles/pages/vulnerabilities.css">

<!-- 5. Override CSS last -->
<link rel="stylesheet" href="styles/ag-grid-overrides.css">
```

### 2. Minimize CSS Specificity

```css
/* ✅ GOOD: Low specificity */
.card { background: var(--hextrackr-surface-base); }

/* ❌ AVOID: High specificity */
.page .section .card.custom { background: var(--hextrackr-surface-base); }
```

### 3. Use CSS Custom Properties for Dynamic Styles

```css
.dynamic-component {
  --custom-accent: var(--vpr-medium);
  border-left: 4px solid var(--custom-accent);
}

.dynamic-component.critical {
  --custom-accent: var(--vpr-critical);
}
```

---

## Troubleshooting

### Common Issues and Solutions

**Issue**: Styles not applying in dark mode

```css
/* ❌ Problem: Hardcoded colors */
.component { background: #ffffff; }

/* ✅ Solution: Use CSS variables */
.component { background: var(--hextrackr-surface-base); }
```

**Issue**: AG-Grid cells not styled correctly

```css
/* ✅ Use theme-aware classes in cell renderers */
cellRenderer: (params) => {
  return `<span class="ag-grid-link">${params.value}</span>`;
  // NOT: class="text-dark"
}
```

**Issue**: Custom components break theme switching

```css
/* ✅ Ensure all colors use CSS variables */
.custom-component {
  background: var(--hextrackr-surface-base);
  color: var(--hextrackr-text-primary);
  /* Never hardcode: background: #fff; color: #000; */
}
```

**Issue**: Modal components not inheriting theme properly

```css
/* ❌ Problem: Modal not using theme-aware selectors */
.modal-content { background: #ffffff; border: 1px solid #e2e8f0; }

/* ✅ Solution: Use data-bs-theme selector and CSS variables */
[data-bs-theme="dark"] .modal-content {
  background: var(--hextrackr-modal-bg);
  border: 1px solid var(--hextrackr-border);
}
```

**Issue**: Card borders inconsistent between light and dark themes

```css
/* ❌ Problem: Hard-coded border values */
.device-card { border: 1px solid #e2e8f0; }

/* ✅ Solution: Use theme-responsive border hierarchy */
.device-card {
  border: 1px solid var(--hextrackr-border-subtle);
  /* Automatically adapts: rgba(0,0,0,0.08) light, rgba(255,255,255,0.08) dark */
}
```

**Issue**: VPR score colors not readable in dark mode

```css
/* ❌ Problem: Light mode colors used in dark theme */
.vpr-critical { color: #dc2626; } /* Too dark for dark backgrounds */

/* ✅ Solution: Use VPR variables that adapt per theme */
.vpr-critical {
  color: var(--vpr-critical);
  /* #dc2626 in light mode, #f87171 in dark mode */
}
```

**Issue**: Ticket accent colors have poor contrast

```css
/* ❌ Problem: Same colors used for light and dark backgrounds */
.ticket-blue { color: #3b82f6; } /* Poor contrast on dark backgrounds */

/* ✅ Solution: Use theme-specific ticket accent variables */
.ticket-blue {
  color: var(--ticket-accent-blue);
  /* #2563eb (light), #60a5fa (dark) - both WCAG AA compliant */
}
```

**Issue**: CSS transitions causing performance issues

```css
/* ❌ Problem: Transitioning all properties */
.card { transition: all 250ms ease; }

/* ✅ Solution: Only transition properties that change */
.card {
  transition: background-color var(--hextrackr-transition-fast) var(--hextrackr-ease-out),
              border-color var(--hextrackr-transition-fast) var(--hextrackr-ease-out);
}
```

**Issue**: AG-Grid theme not switching properly

```javascript
// ❌ Problem: Not registering grid with theme manager
const gridApi = createGrid(gridDiv, gridOptions);

// ✅ Solution: Register with AGGridThemeManager
const gridApi = createGrid(gridDiv, gridOptions);
if (window.agGridThemeManager) {
  window.agGridThemeManager.registerGrid('myGrid', gridApi, gridDiv);
}
```

---

## Tools and Validation

### CSS Variable Inspector

Use browser Developer Tools to inspect CSS variables:

```javascript
// Console command to check current theme variables
const style = getComputedStyle(document.documentElement);
console.log('Primary background:', style.getPropertyValue('--hextrackr-bg-primary'));
console.log('Text color:', style.getPropertyValue('--hextrackr-text-primary'));
```

### Theme Testing Checklist

- [ ] Component looks correct in light mode
- [ ] Component looks correct in dark mode
- [ ] No hardcoded colors used
- [ ] Hover states work in both themes
- [ ] Text remains readable in both themes
- [ ] Animations don't conflict with theme switching

---

## Performance Optimization

### CSS Performance Best Practices

#### 1. CSS Variable Optimization

```css
/* ✅ GOOD: Use CSS custom properties for efficient theme switching */
.component {
  background: var(--hextrackr-surface-base);
  color: var(--hextrackr-text-primary);
  /* Browser can optimize variable lookups */
}

/* ❌ AVOID: Excessive calculations in CSS variables */
.component {
  /* Avoid complex calc() expressions that run on every paint */
  width: calc(var(--hextrackr-space-4) * 3.5 + var(--hextrackr-space-2) / 2);
}
```

#### 2. Selector Performance

```css
/* ✅ GOOD: Low specificity, efficient selectors */
.device-card { }
.vpr-mini-card { }

/* ❌ AVOID: Complex selectors that impact performance */
.page .container .row .col .card .device-card .vpr-mini-card { }
```

#### 3. CSS Containment

```css
/* ✅ GOOD: Use CSS containment for large card grids */
.device-cards-container {
  contain: layout style paint;
  /* Isolates layout changes within container */
}

.vulnerability-cards-container {
  contain: layout style;
  /* Prevents style recalculation cascading */
}
```

#### 4. Theme Switching Performance

```css
/* ✅ GOOD: Efficient theme transitions */
.card {
  background: var(--hextrackr-surface-base);
  transition: background-color var(--hextrackr-transition-fast) var(--hextrackr-ease-out);
  /* Only animate properties that change between themes */
}

/* ❌ AVOID: Transition all properties */
.card {
  transition: all 250ms ease; /* Can cause layout thrashing */
}
```

### Performance Monitoring

#### CSS Variable Inspector

Use browser Developer Tools to monitor CSS variable performance:

```javascript
// Console command to check CSS variable usage
const getAllCSSVariables = () => {
  const style = getComputedStyle(document.documentElement);
  const variables = {};

  // Check HexTrackr variables
  ['--hextrackr-primary', '--hextrackr-surface-base', '--vpr-critical'].forEach(prop => {
    variables[prop] = style.getPropertyValue(prop);
  });

  return variables;
};

console.table(getAllCSSVariables());
```

#### Performance Checklist

- [ ] **CSS containment** applied to card containers
- [ ] **Transition properties** limited to changing values only
- [ ] **Selector specificity** kept under 3 levels deep
- [ ] **Variable calculations** minimized in frequently updated components
- [ ] **Theme switching** completes under 16ms for 60fps
- [ ] **Large lists** (50+ items) use `contain: layout style paint`

### CSS Containment Strategies

#### Layout Containment

```css
/* Isolate layout changes within card grids */
.ag-grid-theme-container {
  contain: layout;
  /* Prevents AG-Grid layout changes from affecting parent */
}

.modal-content {
  contain: layout style;
  /* Isolates modal content for better scrolling performance */
}
```

#### Paint Containment

```css
/* Optimize rendering for frequently updated components */
.vpr-score-indicator {
  contain: paint;
  /* Changes to VPR scores don't repaint surrounding elements */
}

.sortable-ghost {
  contain: layout paint;
  /* Dragging animations stay contained */
}
```

#### Style Containment

```css
/* Prevent style recalculation cascading */
.device-security-modal .card {
  contain: style;
  /* Modal-specific styling doesn't affect page styles */
}
```

### Memory Optimization

#### CSS Custom Property Cleanup

```javascript
// Remove unused CSS variables on page unload
window.addEventListener('beforeunload', () => {
  // Clear any dynamically created CSS variables
  if (window.vulnModalData) {
    delete window.vulnModalData;
  }
});
```

#### Theme Asset Loading

```css
/* Preload critical theme assets */
@media (prefers-color-scheme: dark) {
  /* Dark theme assets are only loaded when needed */
  .ag-theme-quartz-dark {
    /* Dark theme styles */
  }
}
```

---

## Related Documentation

- [Theme Architecture](../architecture/theme-architecture.md) - Technical theme system details
- [Frontend Architecture](../architecture/frontend.md) - Component integration patterns
- [Performance Reference](../reference/performance.md) - CSS performance guidelines

---

*Last Updated: 2025-09-20 | Centralized Theme System v2.0*
