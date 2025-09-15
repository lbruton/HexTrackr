# UI Style & Theme Inventory (app/public)

This report inventories all style- and theme-related assets under `app/public/`, categorizing what lives in HTML, CSS, vendor styles, and the JavaScript theme engine. It establishes ownership and the data flow for light/dark modes to support a unified theming system.

## Summary

- Base framework: Tabler (Bootstrap 5.3+) + AG‑Grid Quartz theme + ApexCharts.
- Light mode tokens live in `styles/shared/base.css` via CSS variables.
- Dark mode is applied via `data-bs-theme="dark"` and `styles/shared/dark-theme.css` CSS variables and component overrides.
- Runtime switching is handled by `ThemeController` (JS) and `ChartThemeAdapter` (JS) for charts/grids.
- Some inline styles exist in page HTML files; a few use fixed colors not tied to variables.

## Theme Engine (JavaScript)

- `app/public/scripts/shared/theme-controller.js`
  - Applies theme to document: sets `data-bs-theme` and toggles `theme-light`/`theme-dark` classes.
  - File reference: `app/public/scripts/shared/theme-controller.js:866` sets the attribute.
  - Adds classes safely: `app/public/scripts/shared/theme-controller.js:876`, `:882`.
  - Cross‑tab sync via `storage` events, storage health checks, legacy fallback without CSS variables.
  - Announces changes for a11y via `accessibilityAnnouncer`.

- `app/public/scripts/utils/chart-theme-adapter.js`
  - Reads CSS variables to build ApexCharts theme config.
  - Integrates with AG‑Grid v33 Quartz theme; legacy Alpine fallback.
  - Registry to update all charts/grids on theme change.

- `app/public/scripts/shared/header.js`
  - Wires header toggle UI to `ThemeController` and updates toggle visibility.

- `app/public/scripts/shared/header-loader.js`
  - Injects header HTML and initializes the theme manager.

## Shared CSS (Project‑owned)

- `app/public/styles/shared/base.css`
  - Light‑mode base variables and surface hierarchy.
  - File references: `app/public/styles/shared/base.css:10` `:19` (variables start).

- `app/public/styles/shared/dark-theme.css`
  - Dark‑mode variables scoped by `[data-bs-theme="dark"]` and component overrides (modals, dropdowns, ag‑grid, charts).
  - AG‑Grid Quartz dark adjustments: `app/public/styles/shared/dark-theme.css:20`, `:24`.
  - Modal dark fixes: `app/public/styles/shared/dark-theme.css:262`.

- `app/public/styles/shared/header.css`
  - Header visual tweaks; uses project variables.

- `app/public/styles/utils/responsive.css`
  - Responsive utilities and print styles.

## Page‑level CSS (Project‑owned)

- `app/public/styles/pages/vulnerabilities.css`
  - Card surfaces, modal elevation variables, VPR badges, AG‑Grid tweaks, chart container containment.

- `app/public/styles/pages/tickets.css`
  - Table and chips styling; includes a fixed “terminal” viewer (dark, not variable‑driven).

## Vendor CSS

- `app/public/vendor/tabler/css/tabler.min.css` (Bootstrap 5.3‑based)
- `app/public/vendor/ag-grid/ag-theme-quartz.css`
- `app/public/vendor/ag-grid/ag-theme-alpine.css`
- `app/public/vendor/ag-grid/ag-theme-alpine-dark.css`

## HTML Inline Styles (Theme‑relevant)

- `app/public/vulnerabilities.html`
  - Large `<style>` block with layout + component styles. Many rules consume `--tblr-*` and `--hextrackr-*` variables, but some hardcoded colors remain.
  - AG‑Grid containers use `ag-theme-quartz` class, which adapts via CSS variables.

- `app/public/tickets.html`
  - Inline `<style>` includes a `.terminal-content` block that hardcodes dark colors (not theme variable driven).

## Theme Flow and Ownership Map

- HTML
  - Includes Tabler CSS first, then vendor themes (AG‑Grid), then project CSS.
  - Inline `<style>` present on both pages; some rules should migrate to project CSS and reference variables.

- CSS (Project)
  - Light tokens in `base.css` via `:root`.
  - Dark tokens and overrides in `dark-theme.css` via `[data-bs-theme="dark"]`.
  - Page CSS composes from shared variables; a few hardcoded colors remain.

- Vendor CSS
  - Tabler drives Bootstrap tokens/use of `data-bs-theme`.
  - AG‑Grid Quartz provides baseline; customized via JS theme params and CSS variables.

- JS Theme Engine
  - `ThemeController` applies `data-bs-theme` to `documentElement` and body class sync for Tabler.
  - `ChartThemeAdapter` updates ApexCharts and informs AG‑Grid managers to rebuild/apply the proper theme config.
