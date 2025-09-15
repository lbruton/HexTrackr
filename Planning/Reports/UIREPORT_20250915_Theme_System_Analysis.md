# Theme System Analysis (Light/Dark) – Architecture & Behavior

This document explains how HexTrackr’s theming works end‑to‑end: CSS variables, Bootstrap/Tabler integration, runtime switching, and component alignment (AG‑Grid, ApexCharts, modals, header, etc.).

## Architecture Overview

- Root theme attribute: `data-bs-theme` on `documentElement` (‘light’ or ‘dark’).
- Light tokens: `:root { ... }` in `styles/shared/base.css`.
- Dark tokens + overrides: `[data-bs-theme="dark"] { ... }` in `styles/shared/dark-theme.css`.
- Runtime switching: `ThemeController` applies `data-bs-theme`, syncs classes, persists state, and notifies listeners.
- Visualization adapters: `ChartThemeAdapter` reads CSS variables → constructs ApexCharts config and coordinates AG‑Grid theme updates.

## Runtime Switching – `ThemeController`

- Applies theme to DOM:
  - `app/public/scripts/shared/theme-controller.js:866` sets `data-bs-theme` on `<html>`.
  - Adds a matching whitelist class `theme-light` or `theme-dark` to `<html>` and `<body>`: `:876`, `:882`.
- Accessibility:
  - Announces theme changes for screen readers via `accessibilityAnnouncer`.
- Robustness:
  - Storage health checks; graceful fallbacks when CSS custom properties unsupported (applies inline styles to typical components).
  - Cross‑tab synchronization using `storage` events.
- Integration:
  - Calls `chartThemeAdapter.updateAllComponents(sanitizedTheme)` after DOM updates to refresh charts and grids.

## CSS Variables – Tokens and Overrides

- Light mode (`styles/shared/base.css`)
  - Provides project tokens: brand colors, surface hierarchy, borders, shadows.
  - Reference: `app/public/styles/shared/base.css:10` (start of `:root` tokens).

- Dark mode (`styles/shared/dark-theme.css`)
  - Scoped by `[data-bs-theme="dark"]` for safe override in dark theme contexts.
  - Defines core Bootstrap variables: `--bs-body-bg`, `--bs-body-color`, `--bs-card-bg`, borders, navbar, buttons, forms, semantic colors.
  - Component overrides include: modal surfaces, dropdowns, tooltips, chart palette (`--chart-color-*`), AG‑Grid variables (foreground/background/borders/headers), and print/contrast modes.
  - Key refs: `app/public/styles/shared/dark-theme.css:24` (Quartz root), `:262` (Modal content), multiple `--bs-*` and `--chart-*` definitions.

## Vendor Integration

- Tabler/Bootstrap 5.3+
  - Works natively with `data-bs-theme`. Project variables override Bootstrap tokens; Tabler utility variables (`--tblr-*`) are consumed in inline and page CSS.

- AG‑Grid v33 (Quartz)
  - `ag-theme-quartz.css` provides baseline. The project creates a Quartz theme instance with parameters for each mode:
    - `app/public/scripts/shared/ag-grid-responsive-config.js:223` and `:247` (Quartz `.withParams(...)` for dark/light).
  - Grid containers use `class="ag-theme-quartz"` (e.g., `vulnerabilities.html:807, 888`).
  - `ChartThemeAdapter` notes that theme changing often requires grid recreation; a legacy CSS‑class fallback exists for Alpine themes.

- ApexCharts
  - `ChartThemeAdapter.getThemeConfig(theme)` builds a full ApexCharts options object from CSS variables, so chart colors/text/grid react to CSS variables.
  - Extracts variables by temporarily applying theme (`getCSSVariables`), then restores original.

## Page Integration Patterns

- `vulnerabilities.html`
  - Includes Tabler CSS, AG‑Grid CSS, then project CSS; uses `ag-theme-quartz` and a large inline `<style>` that mixes `--tblr-*` and `--hextrackr-*` variables with some hardcoded colors.

- `tickets.html`
  - Includes project CSS; inline `<style>` contains `.terminal-content` hardcoded to a dark scheme (not variable‑driven), which will appear dark in light mode too.

## Header and Settings Modal

- Header component (`scripts/shared/header.html`)
  - Contains `data-bs-theme="dark"` on `<header>` (line `app/public/scripts/shared/header.html:2`), forcing the header area to render dark regardless of the document theme.
  - Header theme toggles call into `ThemeController` via `HeaderThemeManager`.

- Settings modal (`scripts/shared/settings-modal.js`)
  - On `shown.bs.modal`, the modal receives current theme: see code that sets modal `data-bs-theme` to match document theme.

## Known Inconsistencies and Risks

- Component override in header
  - `data-bs-theme="dark"` on header enforces dark header in light mode, breaking global consistency.

- Terminal viewer styling in Tickets
  - `.terminal-content` uses fixed dark palette inline; not responsive to theme tokens.

- Inline styles in pages
  - Several hardcoded colors remain (e.g., gradients, shadows) in page `<style>` blocks; these should link to tokens for unified control.

## Conclusions

- The core architecture (Bootstrap/Tabler + data‑bs‑theme + CSS variables + ThemeController) is sound and ready for a unified theming layer.
- Aligning header and inline page styles with the token system, and consolidating variables/tokens, will produce a cohesive light/dark experience and pave the way for user‑defined themes.
