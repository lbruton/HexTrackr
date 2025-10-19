# HexTrackr Style Audit
Generated on 2025-10-19

## Scope & Approach
- Reviewed every `.js` and `.html` asset under `app/` (including partials, documentation bundles, and vendor dependencies).
- Searched for embedded `<style>` blocks, inline `style="..."` attributes, JS-driven `element.style[...]` mutations, and dynamically injected `<style>` tags.
- Focused on identifying CSS that bypasses the centralized theming layer (`app/public/styles/**` + `theme-controller.js`) or duplicates Tabler defaults.
- Highlighted why each inline rule likely exists and how to migrate it into shared styles without breaking current visuals.

## High-Level Findings
- **Inline HTML styling persists** on key entry points (`index.html`, `login.html`, `tickets.html`, `vulnerabilities.html`) and QA harness pages. Most of these can become page-scoped classes in `styles/pages/**` or utility tokens.
- **Reusable partials** (`header.html`, `footer.html`, `settings-modal.html`) still ship inline styles on avatars, badge images, and modal containers; they should rely on shared utility classes so downstream pages do not reintroduce ad‑hoc CSS.
- **JS modules** (especially in `app/public/scripts/shared/`) toggle presentation with direct `element.style` calls. Many simply show/hide content or set colors already represented by CSS variables—ideal candidates for swapping to `.classList` toggles or CSS custom properties.
- **Documentation bundle** (`app/public/docs-html/**`) mixes rich inline styling—for CTA buttons, ERD chrome, badge sizing, and navigation hover states. These should move into the documentation theme so authors do not copy/paste inline CSS across new pages.
- **Tabler CSS precedence**: we currently load `tabler.min.css` before our light/dark overrides. Because Tabler’s dark palette remains active, numerous overrides rely on `!important` or JS fallbacks. Shipping a trimmed Tabler build (light-only) or neutral base plus our variable set would eliminate most fights with vendor defaults.
- **Guidance gaps**: none of the pages that still use inline CSS carry comments reminding contributors to push styling into `styles/` or the theme engine, which enables the regressions you noted. Add short “use centralized theme” banners in templates after the `<head>` block to set expectations.

## Theme Loading & Conflict Notes
- **Order** (`vulnerabilities.html`/`tickets.html`): `tabler.min.css` → AG Grid CSS → shared base/layout → `light-theme.css`, `dark-theme.css`, `css-variables.css`. This is correct for override priority, but Tabler still declares dark styles that we override via `!important`. Consider:
  - Building a custom Tabler bundle with dark palette removed, or
  - Overriding Tabler’s `[data-bs-theme="dark"]` block once in `styles/shared/dark-theme.css` without per-component `!important`s (right now severity badges, cards, modals need inline assistance).
- **Login page** (`app/public/login.html`) imports Tabler from CDN but never pulls our shared theme files, so we compensate with inline gradients/backgrounds. Import `styles/shared/{base,light-theme,dark-theme}.css` and retire custom inline blocks.
- **Docs portal** uses `docs-portal-v2.js` to inject a `<style>` tag into `document.head`. That makes debugging cascade order awkward and can conflict with the SPA’s own stylesheet. Prefer a static stylesheet (`docs-html/css/nav-custom.css`) and let JS toggle classes/states.

## Static Inline CSS (HTML Templates)

### Core application pages
- `app/public/index.html:31-74` — Full-screen loading layout, gradients, spinner animation kept inline. Purpose: quick splash while auth state resolves. Move to `styles/pages/index.css` and reuse spinner utility classes already defined for modals.
- `app/public/login.html:32-76` — Inline theme styling for backgrounds, buttons, shake animation, theme toggle positioning. Inline alert/spinner visibility at lines 95 & 162. Reason: login predates shared theme. Action: import shared theme files, extract layout to `styles/pages/login.css`, replace `style="display: none"` with `.is-hidden` utility.
- `app/public/vulnerabilities.html:140/175/210/245/391/694/720/1081` — Severity avatars force color via `style="background-color: var(--vpr-*) !important;"`; grid containers hard-code width/height; modal hidden via `display:none`; KEV link writer injects inline colors. Replace with utility classes (`.avatar--vpr-critical`, `.ag-grid-full-width`, `.is-hidden`) and extend KEV formatter to add classes rather than inline strings.
- `app/public/tickets.html:72-176` — Large `<style>` block managing AG Grid wrappers and dark-mode overrides; numerous `style="display: none"` gates (lines 420-1157) plus `style` for drag handle cursor/background. Move structural rules to `styles/pages/tickets.css`. Provide `.is-hidden`, `.flex-column-secondary`, `.cursor-grab` helper classes so JS can toggle classes instead of inline attributes.
- `app/public/test-websocket-auth.html:7-37`, `app/public/test-logger-session3.html:7-19` — Debug harnesses bundle monospace palettes via inline `<style>`. Create `styles/pages/test-tools.css` or reuse developer docs theme to avoid duplication.
- `app/public/test-auth-state.html:32` — `style="background: #f7f7f7; padding: 1rem; border-radius: 4px;"` on results `<pre>`. Convert to `.panel` class or reuse `card` styles.

### Shared partials and modals
- `app/public/scripts/shared/header.html:24` — Avatar uses `style="background-image: url(...)"`. Reason: placeholder initials. Recommendation: create CSS class that accepts `data-avatar-bg` or rely on inline `style` generated server-side? At minimum, move to CSS custom property (`--avatar-bg`) so we can theme.
- `app/public/scripts/shared/footer.html:10-43` — Badge images fix height with inline styles. Convert to `.badge-pill img` rule in shared footer stylesheet; keep retina scaling consistent.
- `app/public/scripts/shared/settings-modal.html:3/29/324/456` — Modal dialog width and several content sections rely on inline `style="display: none"`. Add `.modal-xl-wide` class for width and `.is-hidden` helper for toggling sections.

### Documentation bundle
- `app/public/docs-html/index.html`, `content/index.html`, `content/overview.html`, `content/changelog/index.html` (lines 14-19, 6-10) — Shield.io badges sized via `style="height: 24px"`. Provide `.badge-img-sm` class in docs stylesheet.
- `app/public/docs-html/content/architecture/database.html:33-37` — CTA button gradient, inline block display, and supporting paragraph spacing. Extract to docs CSS (`docs-html/css/architecture.css`) with variables referencing centralized palette.
- `app/public/docs-html/content/guides/kev-integration.html:66-71` — Table badges styled with background/rounded corners inline. Define `.badge-kev-yes`/`.badge-kev-no` referencing shared warning palette.
- `app/public/docs-html/content/changelog/versions/1.0.4.html:59` & `1.0.56.html:65` — Inline regex string in rendered HTML (escaped). Safe to ignore; it’s documentation of code, not live styling.
- `app/public/docs-html/database-erd-full.html:7-158` — Extensive inline `<style>` controlling dark/light variables, layout, buttons, backgrounds. Should live in `docs-html/css/erd.css` with reliance on existing CSS variable system for colors.
- `app/public/docs-html/database-erd-full.html:260/284/285` — Inline flex alignment, margins, typography for legend. Fold into same ERD stylesheet.

## Dynamic Style Manipulation (JavaScript)

### Application shared scripts
- `app/public/scripts/shared/auth-state.js:725-774` — Sets `style.display` on alerts. Replace with `.classList.toggle("is-hidden")`.
- `app/public/scripts/shared/header.js:176-181` — Toggles theme icons with `style.display`. Swap to `.d-none` or `.is-hidden`.
- `app/public/scripts/shared/footer-loader.js:76-151` — Forces `style.height = "20px"` on badges when injecting footer. Apply a class to generated `<img>` elements instead.
- `app/public/scripts/shared/progress-modal.js:291-1180` — Controls `display`, spinner visibility, and progress bar width inline. `width` updates are fine (animation), but convert visibility toggles to utility classes and rely on CSS transitions for spinner/cancel states.
- `app/public/scripts/shared/vulnerability-core.js:85-1235` — Hides table buttons, toggles container visibility, sets link visibility. Introduce CSS classes `.hidden`, `.visually-hidden` to reduce inline state flips.
- `app/public/scripts/shared/vulnerability-statistics.js:499-504` — Flips cards with inline `display`. Replace with `.is-hidden` or `.is-active` classes to enable CSS animations later.
- `app/public/scripts/shared/vulnerability-details-modal.js:581-835` — Adjusts modal header layout flex properties inline. Convert to modifier classes (`.modal-header--flex`) and rely on CSS.
- `app/public/scripts/shared/device-security-modal.js:267-408` — Uses inline flexbox adjustments and hover states for cards. Move hover/selection styles to CSS classes so theme engine can recolor cards.
- `app/public/scripts/shared/vulnerability-search.js:494` — Shows saved search modal with `display = "block"`. Switch to Bootstrap modal API or toggling classes.
- `app/public/scripts/shared/settings-modal.js:209-2328` — Multiple `style.display` manipulations when switching sections and enabling config inputs. Replace with `.is-hidden` plus CSS to handle block display.
- `app/public/scripts/shared/template-editor.js`, `ticket-markdown-editor.js`, `vulnerability-markdown-editor.js`: same edit/view toggles via inline `display`. Adopt shared helper.
- `app/public/scripts/shared/progress-modal.js`, `toast-manager.js:42-382` — Inline `z-index`, `maxHeight`, `overflow`, progress-bar animation. Define `.toast-container` CSS rule; only animate width via JS.
- `app/public/scripts/shared/theme-config.js:386` — Directly sets CSS custom properties on arbitrary elements. This is intentional (applies centralized theme). Document clearly in code comments to prevent accidental removal.
- `app/public/scripts/shared/theme-controller.js:990-1042` — Legacy fallback applies inline background/border colors to many elements. Because this path is for non-CSS-variable browsers, keep it but ensure it runs behind feature detection. Add comment reminding contributors not to mirror this approach elsewhere.

### Documentation scripts
- `app/public/docs-html/js/docs-portal-v2.js:761-803` — Injects `<style>` tag defining hover/active states; also highlights doc anchors with inline background/transition (lines 1384-1387). Extract to physical CSS file and toggle classes (`.doc-link--hover`, `.doc-anchor--highlight`).
- `app/public/docs-html/js/table-converter.js:60-236` — Sets grid container dimensions and hides original table via inline `display`. Create `.docs-grid` class that handles sizing; keep JS to adjust height via CSS variables if needed.
- `app/public/docs-html/js/roadmap-table-sorter.js:58-103` — Adds sort indicators via inline cursor/spacing/opacity. Provide `.sortable-header` styles in docs CSS and let JS add/remove classes.
- `app/public/docs-html/html-content-updater.js:110-130` — Renders shields with inline height attributes; same action as docs pages—supply class names instead.

### Vendor bundles (leave as-is)
- `app/public/vendor/tabler/js/tabler.min.js`, `app/public/vendor/ag-grid/ag-grid-community.min.js`, `app/public/vendor/apexcharts/apexcharts.min.js` embed CSS or manipulate inline styles internally. Treat as third-party; do not edit directly. Use provided configuration hooks (e.g., AG Grid theme classes, ApexCharts theme options) instead of patching vendor code.

## Areas Verified With No Inline CSS
- `app/controllers/**`, `app/services/**`, `app/routes/**`, `app/utils/**`, `app/config/**`, `app/middleware/**`, and `app/public/server.js` contain no CSS declarations—no action required.

## Recommendations & Next Steps
1. **Define shared visibility utilities** (`.is-hidden`, `.is-inline-block`, `.is-flex`) and refactor JS toggles to classList operations. This removes most `style.display` usage and keeps a single source of truth.
2. **Create page-scoped stylesheets** for `index`, `login`, `tickets`, and QA tools; import centralized theme files on every page to prevent inline gradients/backgrounds.
3. **Extend the centralized theme** with severity avatar variants, AG Grid wrappers, badge sizing, and doc CTA classes so inline colors (`var(--vpr-*) !important`) move into CSS modules.
4. **Rationalize Tabler imports**: build a light-only Tabler bundle or neutral base, then let `styles/shared/dark-theme.css` define all dark colors. This will eliminate the need for inline `!important` overrides and JS fallback color assignments.
5. **Document expectations in templates**: add short HTML comments (e.g., `<!-- Styling lives in app/public/styles/... -->`) immediately after `<head>` in templates that previously relied on inline CSS. This addresses the abuse pattern you described.
6. **Docs theming cleanup**: add `app/public/docs-html/css/` overrides for navigation, ERD viewer, badges, and buttons; update generation scripts (`html-content-updater.js`) to emit class names instead of inline `style` attributes.
7. **QA harness alignment**: either retire or re-theme the QA HTML pages using shared utility classes. Their inline CSS currently diverges from production styling and encourages copy/paste mistakes.

With these changes, contributors have a clear path to reuse the theme engine, and the remaining inline styles (legacy fallback for CSS variables) stay isolated to compatibility code paths.

