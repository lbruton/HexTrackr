# Unified Theme System – Recommendations & Roadmap

This plan consolidates HexTrackr’s light/dark styles into a unified, token‑driven theme system with room for user‑customizable themes. It targets consistency (modals vs. pages), performance, and maintainability.

## Objectives

- One source of truth for design tokens (colors, surfaces, borders, shadows, typography hooks).
- Single mechanism to switch themes: `data-bs-theme` on `<html>` with CSS variables for light/dark.
- No component hardcoding theme locally (e.g., header & terminal viewer) – everything references tokens.
- Vendor alignment: AG‑Grid Quartz and ApexCharts pick up tokens via existing adapters.

## Immediate Fixes (Consistency)

- Remove forced dark header
  - `app/public/scripts/shared/header.html:2` has `data-bs-theme="dark"`. Remove this to let header inherit document theme.

- Make terminal viewer theme‑aware
  - In `tickets.html` (inline `<style>`), replace `.terminal-content` fixed colors with CSS variables (see Proposal below).

- Reduce inline hardcoded colors
  - Move inline color rules from `vulnerabilities.html`/`tickets.html` into page CSS, referencing tokens. Keep HTML minimal.

## Token Model (Proposal)

Introduce a small token layer that captures brand, semantic, and surface values for both modes. These can continue living in the existing files but grouped clearly:

- `styles/shared/base.css` (light)
  - `:root` tokens for brand, surfaces, borders, shadows.

- `styles/shared/dark-theme.css` (dark)
  - `[data-bs-theme="dark"]` section mirrors token names; keep component overrides that need dark‑specific adjustments.

Recommended token set (extend as needed):

- Brand: `--color-primary`, `--color-success`, `--color-warning`, `--color-danger`, `--color-info`.
- Text: `--text-emphasis`, `--text-body`, `--text-muted`.
- Surfaces: `--surface-0`…`--surface-4` matching current `--hextrackr-surface-*`.
- Borders: `--border-subtle`, `--border-muted`, `--border-strong`.
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`.
- Charts: `--chart-color-1..8`, `--chart-grid`, `--chart-bg`, `--chart-text`, `--chart-axis`, `--chart-title`.

Map these tokens to Bootstrap/Tabler variables where relevant (`--bs-*`, `--tblr-*`).

## Component Rules (Proposal)

- Modals (dark fixes exist in `dark-theme.css`)
  - Keep modal hierarchy tokens; ensure light mode has parallel structure in `base.css` (use `--surface-*`).

- Header
  - Inherit tokens from root; rely on `--bs-navbar-*` variables. No local `data-bs-theme` forced.

- AG‑Grid
  - Keep Quartz `.withParams(...)` in `ag-grid-responsive-config.js`, values aligned with tokens where possible.
  - Prefer Quartz + CSS variables over Alpine fallback; keep legacy method for compatibility only.

- ApexCharts
  - Continue using `ChartThemeAdapter.getThemeConfig` fed by CSS variables; ensure chart palette variables exist in both modes.

## Sample Replacements

- Header (remove forced theme)
  - Change `app/public/scripts/shared/header.html:2` from:
    - `<header class="navbar ..." data-bs-theme="dark">`
  - To:
    - `<header class="navbar navbar-expand-md d-print-none">` (no `data-bs-theme`).

- Terminal viewer (variable‑driven)
  - Replace `.terminal-content` with:
    - `background-color: var(--terminal-bg, var(--surface-3));`
    - `color: var(--terminal-fg, var(--text-emphasis));`
    - `border-color: var(--terminal-border, var(--border-muted));`
  - Define defaults in `base.css` and dark overrides in `dark-theme.css`:
    - Light: `--terminal-bg: #0f111a; --terminal-fg: #00a000; --terminal-border: #d0d7de;` (or align with brand palette as needed)
    - Dark: keep same or adjust for AA contrast; ensure they harmonize with other components.

## Performance & Maintainability

- Reduce duplication by centralizing tokens; reference them in page CSS (avoid inline `<style>` for permanent rules).
- Keep selectors simple; leverage Bootstrap/Tabler variables and utility classes.
- Use CSS containment (already used for charts/grids) to reduce style/layout thrash during theme switches.

## Migration Plan

1) Normalize ownership
   - Remove header `data-bs-theme` attribute and test in both modes.
   - Move inline color styles from `vulnerabilities.html`/`tickets.html` into CSS files.

2) Token consolidation
   - Document the current `--hextrackr-*`, `--bs-*`, `--tblr-*` usage; create a mapping table → unify naming where feasible.
   - Add any missing tokens (e.g., `--terminal-*`).

3) Component pass
   - Modals: verify light/dark parity across Settings, Device Security, Vulnerability Details.
   - Header: verify it picks up tokens (navbar bg/link colors) in both modes.
   - Pages: ensure badges, chips, gradients derive from tokens.

4) Visualization pass
   - Confirm ApexCharts pulls palette from CSS variables (via adapter).
   - Confirm AG‑Grid Quartz themes read correct params for both modes; update params to match tokens.

5) Optional: User‑defined themes
   - Introduce `data-theme="{slug}"` alongside `data-bs-theme` or load a user JSON of overrides → apply via CSS variables at runtime.
   - Validate via `ThemeController` extension: import/export theme presets; safe validation already exists.

## Test Checklist

- Toggle light/dark and verify:
  - Header colors align with page surfaces.
  - Modals visually match page style; no mismatched elevations.
  - Tickets terminal viewer respects mode tokens.
  - AG‑Grid and charts recolor without layout jank.
  - Print and high‑contrast modes function in both themes.

## Deliverables After Migration

- Unified token docs (this plan + mapping table).
- Updated CSS (base + dark) with minimized page inlines.
- Removed header local theme override.
- Optional: prototype user theme JSON and loader.
