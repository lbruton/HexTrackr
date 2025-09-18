# HexTrackr Theme Architecture Documentation

## Executive Summary

HexTrackr's theme system is currently fragmented across 7 CSS files with 200+ variables spanning 5 different color systems. This document provides a complete analysis of the current implementation and identifies paths toward a centralized, user-customizable theme engine.

## Current State Analysis

### File Distribution

```
app/public/styles/
├── shared/
│   ├── base.css           (37 variables - brand colors, surfaces)
│   ├── light-theme.css    (24 variables - light mode overrides)
│   ├── dark-theme.css     (255 variables - comprehensive dark mode)
│   └── header.css         (0 theme variables - uses inherited)
├── pages/
│   ├── vulnerabilities.css (21 VPR-specific variables)
│   └── tickets.css        (0 theme variables - uses inherited)
└── utils/
    └── responsive.css     (4 AG-Grid sizing variables)
```

### Color System Fragmentation

The application uses **5 separate color systems**, often with overlapping purposes:

1. **HexTrackr System** (`--hextrackr-*`)
   - Brand colors (primary, secondary, success, warning, danger, info)
   - Surface hierarchy (base, surface-1 through surface-4)
   - Borders (subtle, muted, strong)
   - Shadows (sm, md, lg)

2. **Bootstrap/Tabler System** (`--bs-*`, `--tblr-*`)
   - Complete Bootstrap variable set (100+ variables)
   - Overrides HexTrackr in many places
   - Required for Tabler.io components

3. **VPR Severity System** (`--vpr-*`)
   - Vulnerability-specific colors
   - Critical, High, Medium, Low
   - Both solid and background variants
   - RGB values for alpha transparency

4. **Chart System** (`--chart-*`)
   - ApexCharts colors (8-color palette)
   - Vulnerability chart specific colors
   - Grid and axis colors
   - Background and text colors

5. **AG-Grid System** (`--ag-*`)
   - Table-specific theming
   - Header, row, cell colors
   - Selection and hover states
   - Border and grid lines

## Complete Variable Inventory

### Brand & Semantic Colors (17 variables)

```css
/* Light Mode Defaults */
--hextrackr-primary: #206bc4;
--hextrackr-secondary: #6c757d;
--hextrackr-success: #2fb344;
--hextrackr-warning: #f76707;
--hextrackr-danger: #d63384;
--hextrackr-info: #0dcaf0;

/* Dark Mode Overrides */
--bs-primary: #2563eb;        /* WCAG AA compliant */
--bs-success: #047857;        /* 4.5:1 contrast ratio */
--bs-warning: #b45309;        /* Darkened for accessibility */
--bs-danger: #dc2626;         /* High contrast red */
--bs-secondary: #6b7280;
--bs-info: #0369a1;
```

### Surface Hierarchy System (10 levels)

```css
/* Light Mode */
--hextrackr-surface-base: #ffffff;    /* Level 0: Page background */
--hextrackr-surface-1: #ffffff;       /* Level 1: Cards */
--hextrackr-surface-2: #f8f9fa;       /* Level 2: Tables */
--hextrackr-surface-3: #f5f5f5;       /* Level 3: Modal sections */
--hextrackr-surface-4: #ffffff;       /* Level 4: Modal container */

/* Dark Mode */
--hextrackr-surface-base: #0f172a;    /* Level 0: Darkest */
--hextrackr-surface-1: #1a2332;       /* Level 1: +10% lightness */
--hextrackr-surface-2: #253241;       /* Level 2: +20% lightness */
--hextrackr-surface-3: #2f3f50;       /* Level 3: +30% lightness */
--hextrackr-surface-4: #526880;       /* Level 4: +40% lightness */
```

### VPR Severity Colors (16 variables)

```css
/* Base colors */
--vpr-critical: #dc2626;
--vpr-high: #d97706;      /* WCAG adjusted from #ea580c */
--vpr-medium: #2563eb;
--vpr-low: #16a34a;

/* RGB values for transparency */
--vpr-critical-rgb: 220, 38, 38;
--vpr-high-rgb: 217, 119, 6;
--vpr-medium-rgb: 37, 99, 235;
--vpr-low-rgb: 22, 163, 74;

/* Background variants */
--vpr-critical-bg: rgba(var(--vpr-critical-rgb), 0.1);
--vpr-high-bg: rgba(var(--vpr-high-rgb), 0.1);
--vpr-medium-bg: rgba(var(--vpr-medium-rgb), 0.1);
--vpr-low-bg: rgba(var(--vpr-low-rgb), 0.1);
```

## Component-to-Variable Mapping

### Page Structure

| Component | Light Mode Variable | Dark Mode Variable | Purpose |
|-----------|-------------------|-------------------|---------|
| Body Background | `--hextrackr-surface-base` | `#0f172a` | Main page background |
| Header | `--hextrackr-primary` gradient | `#0f172a` | Navigation bar |
| Footer | `--hextrackr-surface-2` | `--hextrackr-surface-2` | Page footer |

### Cards & Containers

| Component | Surface Level | Light Mode | Dark Mode |
|-----------|--------------|------------|-----------|
| Stat Cards | Level 1 | `#ffffff` | `#1a2332` |
| Content Cards | Level 1 | `#ffffff` | `#1a2332` |
| Card Headers | Level 0 | `#ffffff` | `#0f172a` |
| Card Borders | Border-subtle | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.15)` |

### Data Tables (AG-Grid)

| Element | Variable | Light Mode | Dark Mode |
|---------|----------|------------|-----------|
| Background | `--ag-background-color` | `#ffffff` | `#1a2332` |
| Header | `--ag-header-background-color` | `#f8f9fa` | `#253241` |
| Row Hover | `--ag-row-hover-color` | `#f1f3f5` | `rgba(59,130,246,0.1)` |
| Selected Row | `--ag-selected-row-background-color` | `#e9ecef` | `rgba(59,130,246,0.2)` |

### Modals

| Modal Part | Surface Level | Light Mode | Dark Mode |
|------------|--------------|------------|-----------|
| Backdrop | N/A | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.6)` |
| Container | Level 4 | `#ffffff` | `#526880` |
| Header | Level 3 | `#f5f5f5` | `#2f3f50` |
| Body | Level 4 | `#ffffff` | `#526880` |
| Footer | Level 3 | `#f5f5f5` | `#2f3f50` |
| Nested Cards | Level 2 | `#f8f9fa` | `#253241` |

### Charts (ApexCharts)

| Element | Variable | Purpose |
|---------|----------|---------|
| VPR Critical | `--chart-vuln-critical-color` | `#dc2626` |
| VPR High | `--chart-vuln-high-color` | `#ea580c` |
| VPR Medium | `--chart-vuln-medium-color` | `#2563eb` |
| VPR Low | `--chart-vuln-low-color` | `#16a34a` |
| Grid Lines | `--chart-grid-color` | Chart gridlines |
| Text | `--chart-text-color` | Axis labels |

## Theme Switching Mechanism

### Current Implementation

1. **Theme Controller** (`theme-controller.js`)
   - Manages theme state in localStorage
   - Applies `data-bs-theme` attribute to document
   - Handles system preference detection
   - Broadcasts theme changes to components

2. **CSS Variable Cascade**
   ```css
   :root { /* Base light theme */ }
   [data-bs-theme="dark"] { /* Dark overrides */ }
   ```

3. **Component Updates**
   - AG-Grid: Requires both CSS class change AND API call
   - ApexCharts: Uses `ChartThemeAdapter` for dynamic updates
   - Modals: CSS variables automatically cascade

## Problems Identified

### 1. Variable Duplication
- Same color defined in multiple places
- `--hextrackr-primary` vs `--bs-primary` confusion
- VPR colors defined in 3 different files

### 2. Naming Inconsistency
- Mix of naming conventions (hextrackr, bs, tblr, ag, chart, vpr)
- No clear hierarchy or organization
- Semantic vs. descriptive naming conflicts

### 3. Hard-Coded Colors
- JavaScript files contain hard-coded hex values
- Chart configurations bypass CSS variables
- Some components don't respect theme changes

### 4. Incomplete Coverage
- Light theme only defines 24 variables
- Dark theme defines 255 variables
- Asymmetric theme definitions cause issues

### 5. Override Complexity
- Bootstrap variables override HexTrackr
- Dark theme overrides both
- AG-Grid has its own override system
- Cascade order is fragile

## Ideal Architecture

### Proposed Structure

```
theme-engine/
├── core/
│   ├── tokens.json         # Design tokens
│   ├── palette.json        # Color palette
│   └── semantics.json      # Semantic mappings
├── themes/
│   ├── light.json          # Light theme
│   ├── dark.json           # Dark theme
│   ├── sepia.json          # Sepia theme
│   └── high-contrast.json  # Accessibility
├── components/
│   ├── cards.json          # Card-specific
│   ├── tables.json         # Table-specific
│   ├── charts.json         # Chart-specific
│   └── modals.json         # Modal-specific
└── engine.js               # Theme engine
```

### Centralized Variable System

```javascript
const ThemeEngine = {
  // Single source of truth
  tokens: {
    // Base palette
    colors: {
      blue: { 50: '#eff6ff', 500: '#3b82f6', 900: '#1e3a8a' },
      red: { 50: '#fef2f2', 500: '#ef4444', 900: '#7f1d1d' },
      // ... complete palette
    },

    // Semantic tokens
    semantic: {
      primary: 'colors.blue.500',
      danger: 'colors.red.500',
      surface: {
        0: 'colors.gray.50',
        1: 'colors.white',
        2: 'colors.gray.50',
        3: 'colors.gray.100',
        4: 'colors.gray.200'
      }
    },

    // Component tokens
    components: {
      card: {
        background: 'semantic.surface.1',
        border: 'semantic.border.subtle',
        shadow: 'shadows.md'
      }
    }
  }
};
```

## Migration Strategy

### Phase 1: Documentation (Current)
- ✅ Complete variable inventory
- ✅ Component mapping
- ✅ Problem identification

### Phase 2: Consolidation
- Create unified variable naming system
- Merge duplicate definitions
- Establish clear hierarchy

### Phase 3: Centralization
- Build theme engine
- Create theme editor UI
- Implement custom theme support

### Phase 4: User Customization
- Color picker interface
- Theme import/export
- Preset themes (sepia, high-contrast, color-blind modes)

## Next Steps

1. Review `THEME-MAP.md` for visual component layouts
2. Check `theme-variables.json` for structured data
3. Read `CUSTOM-THEME-STRATEGY.md` for implementation details

---

*Generated: 2025-09-17 | Version: 1.0.0*