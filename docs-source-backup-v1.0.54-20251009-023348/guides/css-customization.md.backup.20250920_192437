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

## Related Documentation

- [Theme Architecture](../architecture/theme-architecture.md) - Technical theme system details
- [Frontend Architecture](../architecture/frontend.md) - Component integration patterns
- [Performance Reference](../reference/performance.md) - CSS performance guidelines

---

*Last Updated: 2025-09-20 | Centralized Theme System v2.0*
