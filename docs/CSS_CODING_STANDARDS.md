# CSS Coding Standards

**Version**: 1.0.0
**Date**: 2025-10-19
**Related**: [HEX-301 Theme Standardization](https://linear.app/hextrackr/issue/HEX-301), [HEX-302 Inline Style Migration](https://linear.app/hextrackr/issue/HEX-302)

## Purpose

This document establishes the official CSS coding standards for HexTrackr to prevent "wild west" style creation and ensure consistency across the codebase. **All Claude Code instances, developers, and contributors MUST follow these rules.**

## Core Principles

HexTrackr uses a **layered theme system** built on:

1. **Tabler/Bootstrap CSS Framework** - Provides all utility classes
2. **CSS Custom Properties** - HexTrackr's centralized theme variables (`--hextrackr-*`)
3. **Shared Theme Files** - Base, light, dark, and variable definitions
4. **Page-Specific Stylesheets** - Component and page-level styles

**Golden Rule**: Use existing patterns. Never create new utilities, never inline styles, never duplicate CSS.

---

## The 6 Commandments

### Rule 1: Never Create New Utility Classes

**WHY**: Tabler/Bootstrap already provides comprehensive utilities. Creating duplicates causes CSS specificity conflicts and maintenance nightmares.

**ALWAYS USE**: Tabler's existing utilities
**NEVER CREATE**: Custom utility classes (`.is-hidden`, `.justify-center`, `.w-100`, etc.)

#### Common Tabler Utilities Reference

| Need | Use This Tabler Class | NOT Custom Class |
|------|----------------------|------------------|
| Hide element | `.d-none` | ~~`.is-hidden`~~ |
| Show as block | `.d-block` | ~~`.is-block`~~ |
| Show as flex | `.d-flex` | ~~`.is-flex`~~ |
| Center text | `.text-center` | ~~`.text-center`~~ |
| Full width | `.w-100` | ~~`.w-100`~~ |
| Flexbox center | `.justify-content-center` | ~~`.justify-center`~~ |
| Align center | `.align-items-center` | ~~`.align-center`~~ |
| Margin spacing | `.m-0`, `.m-1`, `.m-2`, `.m-3`, `.m-4` | ~~`.no-margin`~~ |
| Padding spacing | `.p-0`, `.p-1`, `.p-2`, `.p-3`, `.p-4` | ~~`.no-padding`~~ |

**Documentation**: See [Tabler Utilities](https://tabler.io/docs/utilities.html) for complete reference.

#### ✅ CORRECT Example

```html
<!-- Use Tabler utilities directly -->
<div class="d-flex justify-content-center align-items-center">
  <span class="text-center w-100">Centered Content</span>
</div>
```

#### ❌ WRONG Example

```html
<!-- NEVER create custom utility classes -->
<div class="is-flex justify-center align-center">
  <span class="text-center w-100">Centered Content</span>
</div>
```

```css
/* NEVER create these in any CSS file */
.is-flex { display: flex !important; }
.justify-center { justify-content: center !important; }
.align-center { align-items: center !important; }
```

---

### Rule 2: Always Use CSS Variables for Colors

**WHY**: HexTrackr's theme engine is built on CSS custom properties. Hardcoded colors break dark mode and make theme changes impossible.

**ALWAYS USE**: `--hextrackr-*` CSS variables from `css-variables.css`
**NEVER USE**: Hardcoded hex codes, `rgb()`, or named colors in component CSS

#### Available CSS Variables

**Core Colors** (622 total variables - see `app/public/styles/css-variables.css`):

```css
/* Backgrounds */
--hextrackr-bg-primary        /* Main background (#ffffff light / #0F1C31 dark) */
--hextrackr-bg-secondary      /* Cards, panels */
--hextrackr-bg-surface        /* Elevated surfaces */

/* Text Colors */
--hextrackr-text              /* Primary text (#2d3748 light / #ffffff dark) */
--hextrackr-text-muted        /* Secondary text */
--hextrackr-text-subtle       /* Tertiary text */

/* Brand Colors */
--hextrackr-primary           /* Primary blue (#206bc4) */
--hextrackr-success           /* Success green */
--hextrackr-warning           /* Warning orange */
--hextrackr-danger            /* Danger red */

/* Borders & Dividers */
--hextrackr-border            /* Border color (#e2e8f0 light / #1e2a3b dark) */
--hextrackr-divider           /* Divider lines */

/* Component-Specific */
--hextrackr-card-bg           /* Card backgrounds */
--hextrackr-modal-bg          /* Modal backgrounds */
--hextrackr-input-bg          /* Form input backgrounds */
```

**Vendor Colors** (HEX-297 semantic tokens):

```css
--hextrackr-vendor-cisco      /* Cisco brand blue */
--hextrackr-vendor-paloalto   /* Palo Alto brand orange */
--hextrackr-vendor-fortinet   /* Fortinet brand red */
--hextrackr-vpr-critical      /* VPR Critical red */
--hextrackr-vpr-high          /* VPR High orange */
--hextrackr-vpr-medium        /* VPR Medium yellow */
--hextrackr-vpr-low           /* VPR Low blue */
```

#### ✅ CORRECT Example

```css
/* Use CSS variables for all colors */
.vulnerability-card {
  background-color: var(--hextrackr-card-bg);
  border: 1px solid var(--hextrackr-border);
  color: var(--hextrackr-text);
}

.severity-critical {
  background-color: var(--hextrackr-vpr-critical);
  color: var(--hextrackr-text);
}
```

#### ❌ WRONG Example

```css
/* NEVER hardcode colors */
.vulnerability-card {
  background-color: #ffffff;  /* ❌ Breaks dark mode */
  border: 1px solid #e2e8f0;  /* ❌ Not theme-aware */
  color: #2d3748;             /* ❌ Hardcoded text color */
}

.severity-critical {
  background-color: #dc3545;  /* ❌ Should use --hextrackr-vpr-critical */
  color: white;               /* ❌ Should use CSS variable */
}
```

---

### Rule 3: No Inline Styles in HTML

**WHY**: Inline `style=""` attributes have highest CSS specificity, break theme changes, and make maintenance impossible. They bypass the entire theme system.

**ALWAYS USE**: CSS classes from Tabler utilities OR page-specific stylesheets
**NEVER USE**: `<div style="">` inline attributes

#### ✅ CORRECT Example

```html
<!-- Use Tabler utilities -->
<div class="d-flex justify-content-between align-items-center p-3">
  <h3 class="text-primary mb-0">Dashboard</h3>
</div>

<!-- Or use custom classes from page stylesheet -->
<div class="dashboard-header">
  <h3 class="dashboard-title">Dashboard</h3>
</div>
```

```css
/* In app/public/styles/pages/dashboard.css */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.dashboard-title {
  color: var(--hextrackr-primary);
  margin-bottom: 0;
}
```

#### ❌ WRONG Example

```html
<!-- NEVER use inline styles -->
<div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
  <h3 style="color: #206bc4; margin-bottom: 0;">Dashboard</h3>
</div>
```

#### Exceptions (Rare - Requires Justification)

Inline styles are ONLY acceptable when:

1. **Dynamic values from JavaScript** - Progress bars, chart dimensions, drag-and-drop positioning
2. **Temporary debugging** - MUST be removed before commit

```html
<!-- ✅ Acceptable: Dynamic progress percentage -->
<div class="progress-bar" style="width: ${progressPercent}%;"></div>

<!-- ✅ Acceptable: AG-Grid dynamic height -->
<div id="myGrid" class="ag-theme-alpine" style="height: ${calculatedHeight}px;"></div>
```

---

### Rule 4: No element.style in JavaScript

**WHY**: JavaScript `element.style.property = value` creates inline styles that bypass the theme system and are invisible in CSS files.

**ALWAYS USE**: CSS class toggling with `classList.add/remove/toggle`
**NEVER USE**: `element.style.property =` assignments

#### ✅ CORRECT Example

```javascript
// Toggle visibility with CSS classes (Rule 1: use Tabler utilities)
function showModal() {
  const modal = document.getElementById("myModal");
  modal.classList.remove("d-none");  // Use Tabler's .d-none utility
}

function hideModal() {
  const modal = document.getElementById("myModal");
  modal.classList.add("d-none");
}

// Toggle loading state with CSS classes
function startLoading() {
  const button = document.getElementById("submitBtn");
  button.classList.add("is-loading");  // Defined in page CSS
  button.disabled = true;
}
```

```css
/* Define states in CSS, not JavaScript */
.is-loading {
  opacity: 0.6;
  cursor: not-allowed;
  position: relative;
}

.is-loading::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid var(--hextrackr-primary);
  border-radius: 50%;
  border-top-color: transparent;
  animation: spinner 0.6s linear infinite;
}
```

#### ❌ WRONG Example

```javascript
// NEVER manipulate element.style directly
function showModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "block";  // ❌ Creates inline style
}

function hideModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "none";  // ❌ Bypasses theme system
}

function startLoading() {
  const button = document.getElementById("submitBtn");
  button.style.opacity = "0.6";      // ❌ Hardcoded value
  button.style.cursor = "not-allowed"; // ❌ Not theme-aware
  button.disabled = true;
}
```

#### Exceptions (Rare - Requires Justification)

Direct style manipulation is ONLY acceptable when:

1. **Calculated dimensions** - Chart sizing, dynamic layouts
2. **Animation endpoints** - GSAP, Web Animations API
3. **Third-party library requirements** - AG-Grid column widths

```javascript
// ✅ Acceptable: Dynamic chart sizing
function resizeChart() {
  const chart = document.getElementById("myChart");
  const containerWidth = chart.parentElement.offsetWidth;
  chart.style.width = `${containerWidth}px`;  // Dynamic calculation
}

// ✅ Acceptable: AG-Grid API requirement
gridOptions.api.sizeColumnsToFit();  // Library-specific
```

---

### Rule 5: Page-Specific Styles Go in /styles/pages/

**WHY**: Centralizing page-specific CSS makes it discoverable, maintainable, and prevents global namespace pollution.

**DIRECTORY STRUCTURE**:

```
app/public/styles/
├── css-variables.css         # Theme variables (--hextrackr-*)
├── base.css                  # Global resets, HTML/body
├── light-theme.css           # Light mode overrides
├── dark-theme.css            # Dark mode overrides
├── modal.css                 # Shared modal styles
├── pages/
│   ├── login.css             # Login page only
│   ├── tickets.css           # Tickets page only
│   ├── vulnerabilities.css   # Vulnerabilities page only
│   ├── dashboard.css         # Dashboard page only
│   └── index.css             # Index/root page only
└── utils/
    └── (empty - no custom utilities allowed per Rule 1)
```

**ALWAYS**: Create page-specific stylesheet in `/styles/pages/`
**NEVER**: Put page-specific styles in global CSS files or inline `<style>` blocks

#### ✅ CORRECT Example

**File**: `app/public/login.html`

```html
<head>
  <!-- Tabler CSS -->
  <link href="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/css/tabler.min.css" rel="stylesheet">

  <!-- HexTrackr Shared Theme Files -->
  <link rel="stylesheet" href="styles/base.css">
  <link rel="stylesheet" href="styles/light-theme.css">
  <link rel="stylesheet" href="styles/dark-theme.css">
  <link rel="stylesheet" href="styles/css-variables.css">

  <!-- Page-Specific Styles -->
  <link rel="stylesheet" href="styles/pages/login.css">
</head>
```

**File**: `app/public/styles/pages/login.css`

```css
/* Login Page Specific Styles */

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hextrackr-bg-primary);
}

.login-card {
  max-width: 440px;
  width: 100%;
  background: var(--hextrackr-card-bg);
  border: 1px solid var(--hextrackr-border);
}

.brand-logo {
  font-size: 3rem;
  color: var(--hextrackr-primary);
}
```

#### ❌ WRONG Example

**File**: `app/public/login.html`

```html
<head>
  <!-- Tabler CSS -->
  <link href="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/css/tabler.min.css" rel="stylesheet">

  <!-- ❌ WRONG: Inline <style> block instead of separate file -->
  <style>
    body {
      background: #f7fafc;  /* ❌ Also violates Rule 2 */
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-card {
      max-width: 440px;
      width: 100%;
    }

    .brand-logo {
      font-size: 3rem;
      color: #2563eb;  /* ❌ Hardcoded color */
    }
  </style>
</head>
```

---

### Rule 6: Every Page Must Import Theme Files

**WHY**: Ensures consistent theming, FOUC prevention, and dark mode support across all pages.

**REQUIRED IMPORTS** (in this exact order):

1. **Tabler CSS** - Framework utilities and base styles
2. **Base CSS** - HexTrackr global resets
3. **Light Theme CSS** - Light mode defaults
4. **Dark Theme CSS** - Dark mode overrides
5. **CSS Variables** - Theme variable definitions
6. **Page-Specific CSS** - Component styles (optional)

#### ✅ CORRECT Example

**Every HTML page MUST have this structure**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - HexTrackr</title>

  <!-- Logger Utility (loaded first for zero-cost production logging) -->
  <script src="scripts/shared/logger.js"></script>

  <!-- FOUC Prevention: Apply theme before CSS loads -->
  <script>
  (function() {
    try {
      var theme = localStorage.getItem("hextrackr-theme");
      if (theme && (theme === "dark" || theme === "light")) {
        document.documentElement.setAttribute("data-bs-theme", theme);
      }
    } catch(e) {
      // Silent fail - defaults to light theme
    }
  })();
  </script>

  <!-- 1. Tabler Variable Overrides (MUST load BEFORE Tabler) -->
  <link rel="stylesheet" href="styles/tabler-overrides.css">

  <!-- 2. Tabler CSS Framework -->
  <link href="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/css/tabler.min.css" rel="stylesheet">

  <!-- 3. HexTrackr Shared Theme Files (REQUIRED ORDER) -->
  <link rel="stylesheet" href="styles/shared/base.css">
  <link rel="stylesheet" href="styles/shared/light-theme.css">
  <link rel="stylesheet" href="styles/shared/dark-theme.css">
  <link rel="stylesheet" href="styles/css-variables.css">

  <!-- 4. Page-Specific Styles (optional) -->
  <link rel="stylesheet" href="styles/pages/mypage.css">

  <!-- FontAwesome Icons (LOCAL HOSTED) -->
  <link rel="stylesheet" href="fonts/fontawesome.min.css">
</head>
<body>
  <!-- Page content -->
</body>
</html>
```

#### ❌ WRONG Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Title - HexTrackr</title>

  <!-- ❌ WRONG: Missing FOUC prevention script -->

  <!-- ❌ WRONG: Only importing Tabler, missing theme files -->
  <link href="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/css/tabler.min.css" rel="stylesheet">

  <!-- ❌ WRONG: Inline styles instead of theme imports -->
  <style>
    body {
      background: #f7fafc;
      color: #2d3748;
    }
  </style>
</head>
<body>
  <!-- Page content -->
</body>
</html>
```

#### Critical: FOUC Prevention

**What is FOUC?**: Flash of Unstyled Content - users see default browser styles or wrong theme for a split second before CSS loads.

**HexTrackr's Solution** (implemented in [HEX-65, v1.0.32](https://linear.app/hextrackr/issue/HEX-65)):

1. **Inline `<script>` in `<head>` BEFORE CSS** - Sets `data-bs-theme` attribute immediately
2. **localStorage key**: `hextrackr-theme` (NOT `theme` - login.html uses incorrect key)
3. **Synchronous execution** - Blocks rendering until theme is applied

**IMPORTANT**: If users report seeing "Tabler flash" or wrong colors on page load, this script is either:
- Missing from the page
- Using wrong localStorage key
- Executing after CSS loads (wrong placement)

---

## Common Anti-Patterns

### Anti-Pattern 1: Creating Utility Files

**DON'T DO THIS**:

```
app/public/styles/utils/helpers.css  ❌ WRONG
app/public/styles/utils/utilities.css  ❌ WRONG
app/public/styles/common/common.css  ❌ WRONG
```

**WHY**: Tabler already provides all utilities. Creating custom utilities causes:
- CSS specificity conflicts
- Duplicate code
- Maintenance burden
- Breaking existing layouts (like centered menus)

**DO THIS INSTEAD**: Use Tabler utilities directly in HTML.

---

### Anti-Pattern 2: Hardcoding Colors

**DON'T DO THIS**:

```css
.vulnerability-card {
  background: #ffffff;  /* ❌ Breaks dark mode */
  border: 1px solid #e2e8f0;  /* ❌ Not theme-aware */
}
```

**DO THIS INSTEAD**:

```css
.vulnerability-card {
  background: var(--hextrackr-card-bg);  /* ✅ Theme-aware */
  border: 1px solid var(--hextrackr-border);  /* ✅ Respects dark mode */
}
```

---

### Anti-Pattern 3: Inline Style Blocks

**DON'T DO THIS**:

```html
<head>
  <style>
    .my-component { ... }
  </style>
</head>
```

**DO THIS INSTEAD**: Extract to `app/public/styles/pages/mypage.css` and import it.

---

### Anti-Pattern 4: JavaScript Style Manipulation

**DON'T DO THIS**:

```javascript
element.style.display = "none";  // ❌ Creates inline style
element.style.backgroundColor = "#206bc4";  // ❌ Bypasses theme
```

**DO THIS INSTEAD**:

```javascript
element.classList.add("d-none");  // ✅ Use Tabler utility
element.classList.add("bg-primary");  // ✅ Theme-aware
```

---

## Migration Checklist

When migrating existing code to these standards:

- [ ] **Search for inline `style=""` attributes**
  - Replace with Tabler utilities OR extract to page CSS
  - Document exceptions (dynamic values only)

- [ ] **Search for `element.style.` in JavaScript**
  - Replace with `classList.add/remove/toggle`
  - Document exceptions (calculated dimensions only)

- [ ] **Search for hardcoded colors** (`#`, `rgb(`, `rgba(`)
  - Replace with `var(--hextrackr-*)` CSS variables
  - Check `css-variables.css` for available variables

- [ ] **Check theme file imports** in all HTML pages
  - Verify FOUC prevention script is present
  - Verify base.css, light-theme.css, dark-theme.css, css-variables.css imports
  - Verify correct `localStorage` key (`hextrackr-theme`)

- [ ] **Extract inline `<style>` blocks**
  - Move to `app/public/styles/pages/[page].css`
  - Import stylesheet in HTML `<head>`

- [ ] **Delete custom utility files** (if any exist)
  - Remove `app/public/styles/utils/helpers.css`
  - Remove imports from HTML files
  - Replace classes with Tabler equivalents

---

## Audit Recommendations Interpretation

**Reference**: [Theme Standardization Research](https://linear.app/hextrackr/issue/HEX-301)

| Audit Recommendation | What It Actually Means | What NOT To Do |
|---------------------|------------------------|----------------|
| "Define shared visibility utilities" | DOCUMENT using Tabler's `.d-none`, `.d-block`, `.d-flex` | ❌ Create new `.is-hidden`, `.is-flex` classes |
| "Create page-scoped stylesheets" | Extract inline `<style>` to `/styles/pages/` | ❌ Add more inline styles |
| "Rationalize Tabler imports" | Build light-only bundle OR rewrite overrides | ❌ Create duplicate utilities |
| "Document expectations in templates" | Add HTML comments explaining style locations | ❌ Ignore documentation |

---

## Examples: Before & After

### Example 1: Login Page (Audit Priority #1)

**BEFORE** (login.html - lines 32-76):

```html
<head>
  <link href="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/css/tabler.min.css" rel="stylesheet">

  <!-- ❌ WRONG: Inline styles, missing theme imports -->
  <style>
    body {
      background: #f7fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    body[data-bs-theme="dark"] {
      background: #0F1C31;
    }

    .login-card {
      max-width: 440px;
      width: 100%;
    }

    .brand-logo {
      font-size: 3rem;
      color: #2563eb;
    }
  </style>
</head>
```

**AFTER**:

```html
<head>
  <!-- FOUC Prevention -->
  <script>
  (function() {
    try {
      var theme = localStorage.getItem("hextrackr-theme");  /* ✅ Correct key */
      if (theme && (theme === "dark" || theme === "light")) {
        document.documentElement.setAttribute("data-bs-theme", theme);
      }
    } catch(e) {}
  })();
  </script>

  <!-- Tabler CSS -->
  <link href="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/css/tabler.min.css" rel="stylesheet">

  <!-- ✅ CORRECT: Import all theme files -->
  <link rel="stylesheet" href="styles/base.css">
  <link rel="stylesheet" href="styles/light-theme.css">
  <link rel="stylesheet" href="styles/dark-theme.css">
  <link rel="stylesheet" href="styles/css-variables.css">

  <!-- ✅ CORRECT: Page-specific styles in separate file -->
  <link rel="stylesheet" href="styles/pages/login.css">
</head>
```

**NEW FILE**: `app/public/styles/pages/login.css`

```css
/* Login Page Specific Styles */

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hextrackr-bg-primary);  /* ✅ Theme-aware */
}

.login-card {
  max-width: 440px;
  width: 100%;
}

.brand-logo {
  font-size: 3rem;
  color: var(--hextrackr-primary);  /* ✅ Uses CSS variable */
}
```

---

### Example 2: Modal Display Toggle

**BEFORE**:

```javascript
// ❌ WRONG: Direct style manipulation
function showSettingsModal() {
  const modal = document.getElementById("settingsModal");
  modal.style.display = "block";
  modal.style.opacity = "1";
}

function hideSettingsModal() {
  const modal = document.getElementById("settingsModal");
  modal.style.display = "none";
  modal.style.opacity = "0";
}
```

**AFTER**:

```javascript
// ✅ CORRECT: Class-based toggling
function showSettingsModal() {
  const modal = document.getElementById("settingsModal");
  modal.classList.remove("d-none");  // Use Tabler utility
  modal.classList.add("opacity-100");  // Use Tabler utility
}

function hideSettingsModal() {
  const modal = document.getElementById("settingsModal");
  modal.classList.add("d-none");
  modal.classList.remove("opacity-100");
}
```

---

### Example 3: Severity Badge Colors

**BEFORE**:

```css
/* ❌ WRONG: Hardcoded colors */
.severity-critical {
  background-color: #dc3545;
  color: white;
}

.severity-high {
  background-color: #fd7e14;
  color: white;
}

.severity-medium {
  background-color: #ffc107;
  color: #000;
}
```

**AFTER**:

```css
/* ✅ CORRECT: CSS variables */
.severity-critical {
  background-color: var(--hextrackr-vpr-critical);
  color: var(--hextrackr-text);
}

.severity-high {
  background-color: var(--hextrackr-vpr-high);
  color: var(--hextrackr-text);
}

.severity-medium {
  background-color: var(--hextrackr-vpr-medium);
  color: var(--hextrackr-text);
}
```

---

## Enforcement

**Pre-Commit Hook** (Recommended):

```bash
#!/bin/bash
# Detect inline styles in HTML files
if git diff --cached --name-only | grep -E '\.html$' | xargs grep -n 'style="' 2>/dev/null; then
  echo "❌ ERROR: Inline styles detected. Use CSS classes instead."
  echo "See docs/standards/CSS_CODING_STANDARDS.md Rule 3"
  exit 1
fi

# Detect hardcoded colors in CSS files
if git diff --cached --name-only | grep -E '\.css$' | xargs grep -nE '#[0-9a-fA-F]{3,6}|rgb\(|rgba\(' 2>/dev/null; then
  echo "⚠️  WARNING: Hardcoded colors detected. Use CSS variables instead."
  echo "See docs/standards/CSS_CODING_STANDARDS.md Rule 2"
  # Uncomment to block commits:
  # exit 1
fi
```

**Code Review Checklist**:

- [ ] No inline `style=""` attributes (Rule 3)
- [ ] No `element.style.property =` in JavaScript (Rule 4)
- [ ] No hardcoded colors - all use `var(--hextrackr-*)` (Rule 2)
- [ ] No new utility classes created (Rule 1)
- [ ] Page-specific styles in `/styles/pages/` (Rule 5)
- [ ] All HTML pages import theme files (Rule 6)
- [ ] FOUC prevention script present in `<head>` (Rule 6)

---

## FAQ

### Q: Can I use Tabler's color classes like `.text-primary`, `.bg-success`?

**A**: Yes! Tabler utilities are always allowed. They're theme-aware and follow Bootstrap conventions.

```html
<!-- ✅ CORRECT -->
<button class="btn btn-primary">Submit</button>
<div class="alert alert-success">Success!</div>
<span class="text-muted">Muted text</span>
```

---

### Q: What about responsive utilities like `.d-none .d-md-block`?

**A**: Absolutely! Use all Tabler/Bootstrap responsive utilities.

```html
<!-- ✅ CORRECT -->
<div class="d-none d-md-flex justify-content-between">
  <span class="d-none d-lg-inline">Desktop Only</span>
</div>
```

---

### Q: Can I use `!important` in my CSS?

**A**: Avoid it. If you need `!important`, it usually means:
1. You're fighting CSS specificity (check cascade order)
2. You're duplicating existing styles (use Tabler utilities instead)
3. Your selector isn't specific enough (improve selector)

**Rare exceptions**: Overriding third-party libraries (AG-Grid, Tabler) where necessary.

---

### Q: What about animations and transitions?

**A**: Define animations in page-specific CSS files, use CSS variables for colors.

```css
/* ✅ CORRECT: In styles/pages/dashboard.css */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dashboard-card {
  animation: fadeIn 0.3s ease-in;
  background: var(--hextrackr-card-bg);  /* Use variable */
}
```

---

### Q: How do I know if a CSS variable exists?

**A**: Check `app/public/styles/css-variables.css` (622 lines). If it doesn't exist, create it there (don't hardcode).

**Adding new variables**:

```css
/* In css-variables.css */
:root {
  --hextrackr-new-color: #206bc4;
}

[data-bs-theme="dark"] {
  --hextrackr-new-color: #3b82f6;  /* Dark mode value */
}
```

---

### Q: What about third-party library styles (AG-Grid, Chart.js)?

**A**: Third-party overrides go in `/styles/pages/[page].css` where the library is used.

```css
/* In styles/pages/tickets.css */

/* AG-Grid theme overrides */
.ag-theme-alpine {
  --ag-background-color: var(--hextrackr-bg-primary);
  --ag-foreground-color: var(--hextrackr-text);
  --ag-border-color: var(--hextrackr-border);
}
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-10-19 | Initial standards document created | Claude Code (HEX-302) |

---

## Related Documentation

- [HEX-301: Theme Standardization Initiative](https://linear.app/hextrackr/issue/HEX-301)
- [HEX-302: Inline Style Migration](https://linear.app/hextrackr/issue/HEX-302)
- [HEX-65: FOUC Prevention](https://linear.app/hextrackr/issue/HEX-65) (v1.0.32)
- [HEX-297: Vendor Color Semantic Tokens](https://linear.app/hextrackr/issue/HEX-297)
- [Tabler Utilities Documentation](https://tabler.io/docs/utilities.html)
- [Bootstrap Utilities Documentation](https://getbootstrap.com/docs/5.3/utilities/)

---

**Remember**: The goal is consistency, maintainability, and theme compliance. When in doubt, follow existing patterns in the codebase. If those patterns violate these standards, refactor them before creating new code that follows the old (wrong) patterns.
