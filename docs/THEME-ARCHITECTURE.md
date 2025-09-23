# HexTrackr Theme Architecture

## Overview

HexTrackr implements a centralized, multi-layer theme system that ensures consistent styling across all UI components, with special focus on AG-Grid tables and Chart.js visualizations.

## Core Components

### 1. CSS Variables Layer (`/app/public/styles/css-variables.css`)

- **Purpose**: Define all theme colors as CSS custom properties
- **Scope**: Application-wide color definitions
- **Key Variables**:

  ```css
  --hextrackr-bg-primary: #0F1C31 (dark mode)
  --hextrackr-header-bg: #202c3f (dark mode)
  --hextrackr-link-color: #60a5fa
  --hextrackr-grid-link: #93c5fd
  ```

### 2. Theme Configuration (`/app/public/scripts/shared/theme-config.js`)

- **Purpose**: JavaScript-based theme configuration for AG-Grid
- **Pattern**: Centralized configuration object
- **Key Features**:
  - Exact color values (no mixing functions)
  - Light/dark mode configurations
  - Consistent with CSS variables

### 3. AG-Grid Overrides (`/app/public/styles/ag-grid-overrides.css`)

- **Purpose**: Force exact colors with !important directives
- **Reason**: Override AG-Grid's internal color-mix() functions
- **Critical Fix**: Ensures #202c3f header color in dark mode

### 4. AGGridThemeManager (`/app/public/scripts/shared/ag-grid-theme-manager.js`)

- **Purpose**: Dynamic theme switching for all AG-Grid instances
- **Pattern**: Singleton manager
- **Key Methods**:
  - `registerGrid()`: Register grid for theme management
  - `updateTheme()`: Apply theme to all registered grids
  - `setGridOption()`: Uses AG-Grid v33 API for theme updates

## Theme Application Flow

```
1. Page Load
   ├── CSS Variables loaded (css-variables.css)
   ├── AG-Grid overrides applied (ag-grid-overrides.css)
   └── AGGridThemeManager initializes

2. Grid Creation
   ├── Grid created without theme
   ├── Grid registered with AGGridThemeManager
   └── Manager applies current theme via setGridOption()

3. Theme Switch
   ├── ThemeController triggers change
   ├── AGGridThemeManager.updateTheme() called
   ├── All registered grids updated
   └── CSS variables automatically cascade
```

## Color Specifications

### Dark Mode (Navy Theme)

| Component | Color | Usage |
|-----------|-------|-------|
| Background | #0F1C31 | Main application background |
| Header | #202c3f | AG-Grid headers (EXACT - no mixing) |
| Chrome | #202c3f | AG-Grid chrome areas |
| Text | #FFFFFF | Primary text |
| Links | #93c5fd | Grid cell links |
| Selection | #2563eb | Selected rows |

### Light Mode

| Component | Color | Usage |
|-----------|-------|-------|
| Background | #FFFFFF | Main application background |
| Header | #edf2f7 | AG-Grid headers |
| Chrome | #f7fafc | AG-Grid chrome areas |
| Text | #2d3748 | Primary text |
| Links | #3b82f6 | Grid cell links |
| Selection | #3182ce | Selected rows |

## Known Issues & Solutions

### Issue 1: AG-Grid Color Mixing

**Problem**: AG-Grid applies `color-mix(in srgb, #ffffff, #182230 93%)` internally
**Solution**: Use CSS !important overrides in ag-grid-overrides.css

### Issue 2: Link Visibility in Dark Mode

**Problem**: Links using `text-dark` class become invisible
**Solution**: Use theme-aware classes (`ag-grid-link`) with CSS variables

### Issue 3: Theme Not Applied to New Pages

**Problem**: New pages missing theme files
**Solution**: Include all three CSS files and AGGridThemeManager script

## Implementation Checklist

For any new page with AG-Grid:

1. **Include CSS Files**:

   ```html
   <link rel="stylesheet" href="styles/css-variables.css">
   <link rel="stylesheet" href="styles/ag-grid-overrides.css">
   ```

2. **Include Theme Manager**:

   ```html
   <script src="scripts/shared/ag-grid-theme-manager.js"></script>
   ```

3. **Register Grid**:

   ```javascript
   if (window.agGridThemeManager) {
       window.agGridThemeManager.registerGrid(gridId, gridApi, gridDiv);
   }
   ```

4. **Use Theme-Aware Classes**:

   ```javascript
   // In cell renderers
   return `<a href="#" class="ag-grid-link">${value}</a>`;
   // NOT: class="text-dark"
   ```

## Files in Theme System

### Core Theme Files

- `/app/public/styles/css-variables.css` - CSS custom properties
- `/app/public/styles/ag-grid-overrides.css` - AG-Grid color overrides
- `/app/public/scripts/shared/theme-config.js` - JavaScript theme configuration
- `/app/public/scripts/shared/ag-grid-theme-manager.js` - Theme manager singleton

### Pages Using Theme System

- `/app/public/vulnerabilities.html` - Main vulnerability dashboard
- `/app/public/tickets2.html` - Tickets management (AG-Grid version)
- Various modal components (device-security, vulnerability-details)

### Grid Implementations

- `/app/public/scripts/shared/vulnerability-grid.js` - Uses AGGridThemeManager
- `/app/public/scripts/pages/tickets-aggrid.js` - Custom adapter with AGGridThemeManager
- `/app/public/scripts/shared/ag-grid-responsive-config.js` - Factory with theme support

## Developer Guidelines

1. **Never hardcode colors** - Use CSS variables or theme-config.js
2. **Always use exact colors** - Avoid color-mix() or rgba() modifications
3. **Register all grids** - Ensure AGGridThemeManager manages all AG-Grid instances
4. **Test in both themes** - Verify appearance in light and dark modes
5. **Use theme-aware classes** - For links and interactive elements

## Testing Theme Implementation

1. **Visual Verification**:
   - Dark mode header should be exactly #202c3f
   - Links should be visible in both themes
   - No gray/slate colors in dark mode

2. **Developer Tools Check**:
   - Inspect AG-Grid header elements
   - Verify computed background-color is #202c3f
   - Check CSS variable values are applied

3. **Dynamic Theme Switch**:
   - Toggle between light/dark modes
   - Verify all grids update immediately
   - Check no visual glitches or delays

## Version History

- **v2.0.0** (2025-09-20): Complete centralization with AGGridThemeManager
- **v1.5.0**: Added CSS overrides for exact colors
- **v1.0.0**: Initial theme system with CSS variables

## Related Specifications

- `005-dark-mode-theme-system` - Dark mode implementation spec
- `004-tickets-table-prototype` - AG-Grid integration patterns
