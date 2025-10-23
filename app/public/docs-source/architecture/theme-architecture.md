# Theme Architecture

HexTrackr implements a sophisticated, centralized theme system that ensures consistent styling across all UI components while supporting dynamic light/dark mode switching and custom component theming.

## Overview

The theme system is built on four core layers that work together to provide consistent, maintainable, and performant theming:

1. **CSS Variables Layer** - Global color definitions
2. **Theme Configuration Layer** - JavaScript-based theme management
3. **Component Override Layer** - Specific component styling fixes
4. **Theme Manager Layer** - Dynamic theme switching coordination

---

## CSS File Architecture

### Core Theme Files (Global)

All CSS files are located in `app/public/styles/` directory.

| File | Purpose | Scope |
|------|---------|-------|
| `styles/css-variables.css` | Global CSS custom properties for all themes (624 lines - single source of truth) | Application-wide |
| `styles/ag-grid-overrides.css` | AG-Grid specific color overrides with !important | AG-Grid components |

### Shared Component Styles

| File | Purpose | Components |
|------|---------|------------|
| `styles/shared/base.css` | Core base styles and typography | Global foundation |
| `styles/shared/dark-theme.css` | Dark mode color overrides | All components (dark) |
| `styles/shared/light-theme.css` | Light mode color overrides | All components (light) |
| `styles/shared/header.css` | Navigation header styling | Header component |
| `styles/shared/modals.css` | Modal dialog styling | All modal components |
| `styles/shared/cards.css` | Card component styling | Device/vulnerability cards |
| `styles/shared/tables.css` | Table styling (non-AG-Grid) | Bootstrap tables |
| `styles/shared/badges.css` | Badge and pill styling | Status badges, VPR badges |
| `styles/shared/animations.css` | CSS animations and transitions | Loading, hover effects |
| `styles/shared/layouts.css` | Layout and grid system | Page layouts |

### Page-Specific Styles

| File | Purpose | Page |
|------|---------|------|
| `styles/pages/vulnerabilities.css` | Vulnerability dashboard specific styles | vulnerabilities.html |
| `styles/pages/tickets.css` | AG-Grid tickets page styles | tickets.html |
| `styles/pages/login.css` | Login page specific styles | login.html |

### Utility Styles

| File | Purpose | Usage |
|------|---------|-------|
| `styles/utils/responsive.css` | Responsive design utilities | Media queries, breakpoints |

---

## CSS Variables System

### Core Color Variables

The centralized color system uses CSS custom properties to ensure consistency across themes:

```css
/* Light Mode Defaults */
:root {
  /* Background Hierarchy */
  --hextrackr-bg-primary: #ffffff;
  --hextrackr-bg-secondary: #f7fafc;
  --hextrackr-bg-tertiary: #f8f9fa;

  /* Surface Hierarchy (Cards, Modals) */
  --hextrackr-surface-0: #f8f9fa;    /* Base level */
  --hextrackr-surface-1: #ffffff;    /* Cards */
  --hextrackr-surface-2: #ffffff;    /* Elevated surfaces */
  --hextrackr-surface-3: #f5f5f5;    /* Modals */
  --hextrackr-surface-4: #f0f0f0;    /* Highest elevation */

  /* Text Colors */
  --hextrackr-text: #2d3748;
  --hextrackr-text-muted: #718096;
  --hextrackr-text-disabled: #a0aec0;

  /* Border Hierarchy */
  --hextrackr-border: #e2e8f0;
  --hextrackr-border-subtle: rgba(0, 0, 0, 0.08);
  --hextrackr-border-muted: rgba(0, 0, 0, 0.12);
  --hextrackr-border-strong: rgba(0, 0, 0, 0.16);

  /* VPR Severity Colors (Standard - Brighter) */
  --vpr-critical: #ef4444;
  --vpr-high: #f97316;
  --vpr-medium: #3b82f6;
  --vpr-low: #22c55e;

  /* VPR Severity Colors (WCAG Contrast-Optimized - Darker for AA compliance) */
  --vpr-critical-contrast: #dc2626;
  --vpr-high-contrast: #d97706;
  --vpr-medium-contrast: #2563eb;
  --vpr-low-contrast: #16a34a;

  /* Ticket Accent Colors (WCAG AA Compliant) */
  --ticket-accent-blue: #2563eb;     /* 7.1:1 contrast */
  --ticket-accent-purple: #7c3aed;   /* 5.8:1 contrast */
  --ticket-accent-teal: #0891b2;     /* 9.5:1 contrast */
  --ticket-accent-amber: #d97706;    /* 11.2:1 contrast */
  --ticket-accent-rose: #be185d;     /* 8.3:1 contrast */
  --ticket-accent-slate: #475569;    /* 10.2:1 contrast */

  /* AG-Grid Specific */
  --hextrackr-grid-link: #2d3748;
  --hextrackr-grid-link-hover: #1a202c;
}

/* Dark Mode Overrides */
[data-bs-theme="dark"] {
  /* Background Hierarchy */
  --hextrackr-bg-primary: #0F1C31;
  --hextrackr-bg-secondary: #1a2744;
  --hextrackr-bg-tertiary: #1e293b;

  /* Surface Hierarchy (Cards, Modals) */
  --hextrackr-surface-0: #0F1C31;    /* Base level */
  --hextrackr-surface-1: #1a2234;    /* Cards */
  --hextrackr-surface-2: #202c42;    /* Elevated surfaces */
  --hextrackr-surface-3: #1a2234;    /* Modals */
  --hextrackr-surface-4: #253350;    /* Highest elevation */

  /* Text Colors */
  --hextrackr-text: #ffffff;
  --hextrackr-text-muted: #94a3b8;
  --hextrackr-text-disabled: #64748b;

  /* Border Hierarchy */
  --hextrackr-border: #2a3f5f;
  --hextrackr-border-subtle: rgba(255, 255, 255, 0.08);
  --hextrackr-border-muted: rgba(255, 255, 255, 0.12);
  --hextrackr-border-strong: rgba(255, 255, 255, 0.16);

  /* VPR Severity Colors (Standard - Brighter for dark backgrounds) */
  --vpr-critical: #f87171;
  --vpr-high: #fb923c;
  --vpr-medium: #60a5fa;
  --vpr-low: #34d399;

  /* VPR Severity Colors (WCAG Contrast-Optimized - Even brighter for AA compliance on dark) */
  --vpr-critical-contrast: #fca5a5;
  --vpr-high-contrast: #fdba74;
  --vpr-medium-contrast: #93c5fd;
  --vpr-low-contrast: #6ee7b7;

  /* Ticket Accent Colors (WCAG AA Compliant) */
  --ticket-accent-blue: #60a5fa;     /* 7.1:1 contrast */
  --ticket-accent-purple: #a78bfa;   /* 5.8:1 contrast */
  --ticket-accent-teal: #5eead4;     /* 9.5:1 contrast */
  --ticket-accent-amber: #fcd34d;    /* 11.2:1 contrast */
  --ticket-accent-rose: #f9a8d4;     /* 8.3:1 contrast */
  --ticket-accent-slate: #cbd5e1;    /* 10.2:1 contrast */

  /* AG-Grid Specific */
  --hextrackr-grid-link: #93c5fd;
  --hextrackr-grid-link-hover: #bfdbfe;
}
```

### Variable Usage Patterns

**✅ Correct Usage:**

```css
.card {
  background: var(--hextrackr-surface-1);
  border: 1px solid var(--hextrackr-border);
  color: var(--hextrackr-text);
}

.severity-badge {
  background: var(--vpr-critical);           /* Standard brighter color */
  background: var(--vpr-critical-contrast);  /* Or use WCAG contrast-optimized */
}
```

**❌ Avoid Hardcoding:**

```css
.card {
  background: #ffffff; /* Don't hardcode */
  border: 1px solid #e2e8f0; /* Use variables instead */
}
```

**❌ Incorrect Variable Names:**

```css
.card {
  background: var(--hextrackr-surface-base);    /* WRONG - doesn't exist */
  border: 1px solid var(--hextrackr-border-color); /* WRONG - use --hextrackr-border */
  color: var(--hextrackr-text-primary);         /* WRONG - use --hextrackr-text */
}
```

### Complete CSS Variables Reference

The `css-variables.css` file (624 lines) contains extensive variable systems beyond the core colors shown above. Here's the complete reference:

#### Typography System

```css
/* Font Families */
--hextrackr-font-family: -apple-system, blinkmacsystemfont, "Segoe UI", roboto, ...;
--hextrackr-mono-font: "SF Mono", monaco, "Cascadia Code", ...;

/* Font Sizes */
--hextrackr-text-xs: 0.75rem;
--hextrackr-text-sm: 0.875rem;
--hextrackr-text-base: 1rem;
--hextrackr-text-lg: 1.125rem;
--hextrackr-text-xl: 1.25rem;
--hextrackr-text-2xl: 1.5rem;
/* ... up to 6xl */

/* Font Weights */
--hextrackr-font-normal: 400;
--hextrackr-font-medium: 500;
--hextrackr-font-semibold: 600;
--hextrackr-font-bold: 700;

/* Line Heights */
--hextrackr-leading-tight: 1.25;
--hextrackr-leading-normal: 1.5;
--hextrackr-leading-relaxed: 1.75;
```

#### Spacing Scale

```css
/* Spacing Units (0.25rem increments) */
--hextrackr-space-1: 0.25rem;   /* 4px */
--hextrackr-space-2: 0.5rem;    /* 8px */
--hextrackr-space-3: 0.75rem;   /* 12px */
--hextrackr-space-4: 1rem;      /* 16px */
--hextrackr-space-5: 1.25rem;   /* 20px */
--hextrackr-space-6: 1.5rem;    /* 24px */
/* ... up to space-16 (4rem / 64px) */

/* Negative spacing also available */
--hextrackr-space-n1: -0.25rem;
/* ... negative variants */
```

#### Shadow Hierarchy

```css
/* Elevation Shadows */
--hextrackr-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--hextrackr-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--hextrackr-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--hextrackr-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
--hextrackr-shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);

/* Utility Shadows */
--hextrackr-shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);
--hextrackr-shadow-none: none;
```

#### Z-Index Layers

```css
/* Layering System */
--hextrackr-z-dropdown: 1000;
--hextrackr-z-sticky: 1020;
--hextrackr-z-fixed: 1030;
--hextrackr-z-modal-backdrop: 1040;
--hextrackr-z-modal: 1050;
--hextrackr-z-popover: 1060;
--hextrackr-z-tooltip: 1070;
```

#### Border Radius Scale

```css
/* Rounded Corners */
--hextrackr-rounded-none: 0;
--hextrackr-rounded-sm: 0.125rem;
--hextrackr-rounded: 0.25rem;
--hextrackr-rounded-md: 0.375rem;
--hextrackr-rounded-lg: 0.5rem;
--hextrackr-rounded-xl: 0.75rem;
--hextrackr-rounded-2xl: 1rem;
--hextrackr-rounded-full: 9999px;
```

#### Transition Timings

```css
/* Animation Durations */
--hextrackr-transition-fast: 150ms;
--hextrackr-transition-base: 200ms;
--hextrackr-transition-slow: 300ms;

/* Easing Functions */
--hextrackr-ease-in: cubic-bezier(0.4, 0, 1, 1);
--hextrackr-ease-out: cubic-bezier(0, 0, 0.2, 1);
--hextrackr-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

#### Interactive States

```css
/* Hover States */
--hextrackr-hover-bg: rgba(0, 0, 0, 0.05);  /* Light mode */
--hextrackr-hover-bg-dark: rgba(255, 255, 255, 0.1);  /* Dark mode */

/* Active/Focus States */
--hextrackr-focus-ring: 0 0 0 3px rgba(37, 99, 235, 0.2);
--hextrackr-active-bg: rgba(0, 0, 0, 0.1);
```

#### Modal Component Variables

```css
/* Modal Specific */
--hextrackr-modal-backdrop: rgba(0, 0, 0, 0.5);
--hextrackr-modal-header-bg: var(--hextrackr-surface-3);
--hextrackr-modal-body-bg: var(--hextrackr-surface-1);
--hextrackr-modal-footer-border: var(--hextrackr-border);
```

#### Risk Card Components

```css
/* Risk Score Gradients */
--hextrackr-risk-critical-gradient: linear-gradient(135deg, #dc2626, #991b1b);
--hextrackr-risk-high-gradient: linear-gradient(135deg, #d97706, #92400e);
--hextrackr-risk-medium-gradient: linear-gradient(135deg, #2563eb, #1e40af);
--hextrackr-risk-low-gradient: linear-gradient(135deg, #16a34a, #15803d);
```

#### Info Card Components

```css
/* Info Card Backgrounds */
--hextrackr-info-bg: #eff6ff;
--hextrackr-info-border: #bfdbfe;
--hextrackr-info-text: #1e40af;

--hextrackr-warning-bg: #fef3c7;
--hextrackr-warning-border: #fcd34d;
--hextrackr-warning-text: #92400e;

--hextrackr-success-bg: #d1fae5;
--hextrackr-success-border: #6ee7b7;
--hextrackr-success-text: #065f46;

--hextrackr-error-bg: #fee2e2;
--hextrackr-error-border: #fca5a5;
--hextrackr-error-text: #991b1b;
```

#### Utility Color Classes

```css
/* Additional UI Colors */
--hextrackr-link: #2563eb;
--hextrackr-link-hover: #1d4ed8;
--hextrackr-divider: var(--hextrackr-border);
--hextrackr-code-bg: #f3f4f6;
--hextrackr-code-text: #1f2937;
```

---

## JavaScript Theme Management

### Theme Configuration (`theme-config.js`)

Centralized theme configuration providing programmatic access to theme values:

```javascript
import { THEME_CONFIG } from '/scripts/shared/theme-config.js';

// Get complete theme object
const darkTheme = THEME_CONFIG.getTheme('dark');

// Get specific component themes
const agGridTheme = THEME_CONFIG.getAgGridTheme(true); // dark mode
const chartTheme = THEME_CONFIG.getApexChartsTheme(true);

// Apply CSS variables programmatically
THEME_CONFIG.applyCssVariables(document.documentElement, true);
```

**⚠️ Known Issue - CSS/JS Synchronization:**

The VPR colors defined in `theme-config.js` currently differ from those in `css-variables.css`:
- `theme-config.js`: Uses contrast-optimized colors as primary values
- `css-variables.css`: Defines both standard and contrast-optimized variants

For consistent theming, prefer reading colors directly from CSS variables via `getComputedStyle()` rather than hardcoding values in JavaScript. This ensures the single source of truth (`css-variables.css`) is always authoritative.

### AG-Grid Theme Manager (`ag-grid-theme-manager.js`)

Singleton manager for coordinating theme changes across all AG-Grid instances:

```javascript
// Register a grid for theme management
if (window.agGridThemeManager) {
    window.agGridThemeManager.registerGrid('myGrid', gridApi, gridElement);
}

// Theme switching is handled automatically
```

### Theme Controller (`theme-controller.js`)

Master theme controller handling:

- System theme detection (`prefers-color-scheme`)
- Manual theme switching with persistence
- Cross-tab synchronization
- Accessibility announcements

---

## AG-Grid Theme Integration

### The AG-Grid Challenge

AG-Grid Community Edition v33 uses internal `color-mix()` functions that ignore CSS variables, requiring special handling:

**Problem:** AG-Grid computes colors like `color-mix(in srgb, #ffffff, #182230 93%)`
**Solution:** Override with exact colors using `!important` directives

### AG-Grid Override Pattern

```css
/* ag-grid-overrides.css */
.ag-theme-quartz-dark .ag-header {
  background-color: #202c3f !important; /* Exact color, no mixing */
}

.ag-theme-quartz-dark .ag-header-cell {
  background-color: #202c3f !important;
  color: #ffffff !important;
}
```

### Dynamic Theme Application

```javascript
// Apply theme via AG-Grid v33 API
const quartzTheme = window.agGrid.themeQuartz.withParams({
    backgroundColor: "#0F1C31",
    headerBackgroundColor: "#202c3f", // EXACT color match
    foregroundColor: "#FFF",
    // ... other parameters
});

gridApi.setGridOption("theme", quartzTheme);
```

### Grid Surface Styling (tickets & vulnerabilities)

Inline overrides in the grid pages now lean exclusively on the shared theme tokens so light/dark parity stays centralized in `css-variables.css`:

```css
.hextrackr-tickets-grid .ag-row-hover .ag-cell {
    background-color: rgba(var(--hextrackr-primary-rgb), 0.08);
}

[data-bs-theme="dark"] .hextrackr-tickets-grid .ag-row-hover .ag-cell {
    background-color: rgba(var(--hextrackr-primary-rgb), 0.18);
}

.ticket-row-overdue .ag-cell {
    background-color: rgba(var(--vpr-critical-rgb), 0.08) !important;
}

[data-bs-theme="dark"] .ticket-row-overdue .ag-cell {
    background-color: rgba(var(--vpr-critical-rgb), 0.18) !important;
}
```

The vulnerabilities grid follows the same pattern, so both experiences inherit palette changes from the tokens without touching page-specific CSS.

---

## Chart Theme Integration

### ApexCharts Theme Adapter

Charts use a sophisticated theme adapter that reads CSS variables for consistency:

```javascript
// chart-theme-adapter.js
getCSSVariables(theme) {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
        vulnCriticalColor: computedStyle.getPropertyValue("--vpr-critical").trim(),
        vulnHighColor: computedStyle.getPropertyValue("--vpr-high").trim(),
        chartBackground: computedStyle.getPropertyValue("--chart-background").trim(),
        // ... other variables
    };
}
```

---

## Custom CSS Integration Points

### Page-Specific Customizations

Each page can extend the base theme while maintaining consistency:

```css
/* pages/vulnerabilities.css */
.vulnerability-card {
  background: var(--hextrackr-surface-1);
  border: 1px solid var(--hextrackr-border);
  /* Page-specific styles while using theme variables */
  border-radius: var(--hextrackr-rounded-xl);
  padding: var(--hextrackr-space-6);
}

.severity-critical {
  background-color: var(--vpr-critical);  /* or var(--vpr-critical-contrast) for WCAG */
  color: white;
}
```

### Modal Theme Integration

Modals automatically inherit theme variables:

```css
/* shared/modals.css */
.modal-content {
  background-color: var(--hextrackr-surface-3);
  border: 1px solid var(--hextrackr-border);
  color: var(--hextrackr-text);
}
```

---

## Developer Guidelines

### 1. Adding New Components

When creating new components:

1. **Use CSS Variables**: Always reference theme variables, never hardcode colors
2. **Test Both Themes**: Verify appearance in light and dark modes
3. **Follow Naming Convention**: Use `--hextrackr-*` prefix for custom variables
4. **Document Customizations**: Add comments explaining color choices

### 2. Page-Specific Styles

```css
/* Pattern for page-specific customizations */
.page-specific-component {
  /* Use theme variables as base */
  background: var(--hextrackr-surface-1);
  color: var(--hextrackr-text);

  /* Add page-specific enhancements using variable system */
  box-shadow: var(--hextrackr-shadow-md);
  border-radius: var(--hextrackr-rounded-lg);
}
```

### 3. AG-Grid Integration

For new AG-Grid implementations:

```javascript
// 1. Register with theme manager
if (window.agGridThemeManager) {
    window.agGridThemeManager.registerGrid(gridId, gridApi, gridElement);
}

// 2. Use theme-aware cell renderers
cellRenderer: (params) => {
    return `<a href="#" class="ag-grid-link">${params.value}</a>`;
    // NOT: class="text-dark" (breaks in dark mode)
}
```

### 4. CSS File Organization

**Shared styles** go in `/styles/shared/`:

- Components used across multiple pages
- Base typography and layout
- Theme variable definitions

**Page-specific styles** go in `/styles/pages/`:

- Styles unique to one page
- Page layout overrides
- Component variations

**Utility styles** go in `/styles/utils/`:

- Responsive breakpoints
- Helper classes
- Animation definitions

---

## Performance Considerations

### CSS Loading Strategy

1. **Critical CSS**: Load base theme variables first
2. **Component CSS**: Load shared components next
3. **Page CSS**: Load page-specific styles last
4. **Override CSS**: Load AG-Grid overrides after AG-Grid theme

### Theme Switching Optimization

- CSS variables change instantly (no re-download)
- AG-Grid theme switching uses efficient `setGridOption()` API
- Chart themes use cached configurations
- Theme state persisted in localStorage for fast page loads

---

## Troubleshooting

### Common Issues

**Issue**: Colors not updating in dark mode
**Solution**: Check if CSS variables are being used instead of hardcoded values

**Issue**: AG-Grid headers wrong color
**Solution**: Verify `ag-grid-overrides.css` is loaded after AG-Grid CSS

**Issue**: Charts not responding to theme changes
**Solution**: Ensure chart-theme-adapter is properly integrated

### Debugging Theme Issues

1. **Inspect CSS Variables**: Check computed values in Developer Tools
2. **Verify Load Order**: Ensure CSS files load in correct sequence
3. **Check Theme Manager**: Verify grids are registered with AGGridThemeManager
4. **Test Theme Switching**: Toggle themes and watch for console errors

---

## Migration Guide

### From Hardcoded Colors to Variables

```css
/* Before */
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #2d3748;
}

/* After */
.card {
  background: var(--hextrackr-surface-1);
  border: 1px solid var(--hextrackr-border);
  color: var(--hextrackr-text);
}
```

### Adding New Theme Variables

1. Define in `css-variables.css` for both light and dark modes
2. Update `theme-config.js` if JavaScript access needed
3. Document the variable purpose and usage
4. Test across all pages and components

---

## Documentation Theme Synchronization (v1.0.29)

### JSDoc Dark Mode Integration

HexTrackr's JSDoc developer documentation (`/app/dev-docs-html/`) includes automatic theme synchronization with the main application:

**Implementation**:
- `inject-jsdoc-theme.js` - Node script that injects theme detection code into generated JSDoc HTML
- `inject-jsdoc-theme-wrapper.sh` - Shell wrapper for reliable execution during build
- Theme script reads from localStorage and applies `jsdoc-dark-theme` class

**Build Process**:
1. JSDoc generates HTML documentation files
2. Injection script processes all HTML files (121 files as of v1.0.29)
3. Theme detection code is inserted into each file
4. Documentation respects user's theme preference

**Fixed in v1.0.29**:
- Resolved issue where only 6 of 121 files had theme injection
- Added progress logging and error handling
- Ensured idempotent operation (safe to run multiple times)
- Fixed JSON parsing for modern localStorage format

---

## Related Documentation

- [Frontend Architecture](./frontend.md) - Theme system integration
- [Technology Stack](./technology-stack.md) - CSS framework details

## Specifications

- `005-dark-mode-theme-system` - Dark mode implementation specification
- `004-tickets-table-prototype` - AG-Grid theme integration patterns

---

*Last Updated: 2025-10-23 | Version: 3.0.0 | Audit: DOCS-52*
