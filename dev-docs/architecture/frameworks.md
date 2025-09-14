# Frameworks

<!-- markdownlint-disable-next-line MD013 -->
This page documents the frameworks and libraries used across HexTrackr, what they’re used for, and where they’re referenced in the codebase.

> Scope: UI frameworks, data grid and charts, file/CSV/PDF tooling, documentation stack, and backend server libraries.

## UI & Styling

### Tabler.io (primary UI framework)

<!-- markdownlint-disable-next-line MD013 -->

- Purpose: Layout, components, and page structure for the dashboard, modals, buttons, and forms.
- Where:
  - `vulnerabilities.html` (primary UI), `tickets.html` (loaded, migration tracked in roadmap), `docs-html/index.html` (docs SPA)
  - CDN: `@tabler/core@1.0.0-beta17` CSS/JS
- Notes: Used with shared header/footer and settings modal.

### Bootstrap 5 (legacy on Tickets)

- Purpose: Legacy layout/components for `tickets.html` pending full migration to Tabler.
- Where: `tickets.html`
- Notes: Coexists with Tabler; roadmap includes unifying on Tabler.

### Font Awesome

- Purpose: Icons across UI and docs.
- Where: `tickets.html`, `vulnerabilities.html`, `docs-html/index.html`

### Accessibility Tools

- **WAVE**: Used for manual accessibility audits.
- **axe-core**: Integrated into the development workflow for automated accessibility testing.

## Data Grid & Charts

### AG Grid Community

- Purpose: Data table for Vulnerabilities and related device/asset grids.
- Where:
  - `vulnerabilities.html` (CSS/JS via CDN; grid creation with `agGrid.createGrid(...)`)
  - Config: `scripts/shared/ag-grid-responsive-config.js`
  - Styles: `styles/pages/vulnerabilities.css`, `styles/utils/responsive.css`

### ApexCharts

<!-- markdownlint-disable-next-line MD013 -->

- Purpose: Main trend/time-series charting in Vulnerabilities.
- Where:
  - `vulnerabilities.html` (CDN script), chart init in embedded script (`new ApexCharts(...)`)
  - References: `scripts/pages/vulnerabilities.js`, architecture docs

### Chart.js

- Purpose: Mini inline charts on cards.
- Note: Coexists with ApexCharts; future consolidation planned.
- Where:
  - `vulnerabilities.html` (`scripts/chart.min.js`)
  - File: `scripts/chart.min.js` (vendored, ignored by linters)

## Code Highlighting & Documentation

### PrismJS (runtime highlighting)

- Purpose: Client-side code syntax highlighting in docs portal.
- Where: `docs-html/index.html`, `docs-html/js/docs-tabler.js` (`Prism.highlightAllUnder(...)`)

### marked + highlight.js (build-time)

- Purpose: Markdown → HTML conversion for docs generation.
- Where: `docs-html/html-content-updater.js` (uses `marked` with `highlight.js`)

## File, CSV, PDF & Excel Tooling

### PapaParse

- Purpose: CSV parsing/unparsing for import/export.
- Where: `vulnerabilities.html`, `tickets.html`, `scripts/shared/settings-modal.js`, `server.js`

### JSZip

- Purpose: ZIP creation for backups/exports.
- Where: `tickets.html`, `vulnerabilities.html`, `scripts/shared/settings-modal.js`

### XLSX (SheetJS)

- Purpose: Excel export of tickets.
- Where: `tickets.html`, `scripts/pages/tickets.js` (`XLSX.writeFile(...)`)

### jsPDF + AutoTable

- Purpose: Client-side PDF generation.
- Where: `tickets.html`, `scripts/pages/tickets.js`

## Backend & Server

### Express

- Purpose: Web server, API endpoints, docs stats endpoint, static file serving.
- Where: `server.js`

### sqlite3

- Purpose: Database for server-backed features and future migrations.
- Where: `server.js`, `data/hextrackr.db`, `scripts/init-db-production.sql`

### multer, compression, cors

- Purpose: Upload handling, response compression, CORS headers.
- Where: `server.js` (respective imports and middleware usage)
- Note: `dotenv` is not currently used in the project

## Developer Tooling (not shipped to users)

### Playwright (E2E), ESLint, markdownlint

- Purpose: Automation and code quality.
- Where: Dev dependencies; configs under repo root (`eslint.config.js`, `.markdownlint.json`)

### Google Generative AI SDK (optional docs tooling)

- Purpose: Future/experimental documentation automation.
- Where: Referenced in `package.json`; used by docs tooling scripts.

## Versions (as referenced)

- Tabler: 1.0.0-beta17 (CDN)
- AG Grid Community: 31.x (CDN)
- ApexCharts: 3.44.x (CDN)
- Chart.js: 4.4.0 (local file)
- PrismJS: 1.29.x (CDN)
- marked: ^16.2.1, highlight.js: ^11.11.1
- PapaParse: 5.4.1 (CDN + npm), JSZip: 3.10.1 (CDN + npm)
- XLSX (SheetJS): 0.18.5 (CDN)
- jsPDF: 2.5.1 + AutoTable 3.5.31 (CDN)
- Express: ^4.18.2, sqlite3: ^5.1.6, multer: ^2.0.2, cors: ^2.8.5, compression: ^1.7.4

---

See also: Architecture → [Frontend](./frontend.html), [Backend](./backend.html), [Database](./database.html), [Deployment](./deployment.html).
