# HexTrac## Key files

- `server.js`: al## Testing and qual## What to keep in mind when editing
- DB writes that iterate rows should be sequential (avoid `forEach` + callbacks) to prevent race conditions; see the sequential loop in `processVulnerabilityRowsWithRollover`.
- When adding docs sections, update the whitelist in `/docs-html` deep-link routing or they won't be reachable by direct URL.
- Schema changes must be idempotent ALTERs in `server.js` to support rolling updates.
- Always clean up temp files with `PathValidator.safeUnlinkSync()` after processing uploads.

## Releases and versioning

- Update `CHANGELOG.md` (Keep a Changelog format) and bump `package.json` version per SemVer.
- Create git tags `MAJOR.MINOR.PATCH` for releases.
- Commits: Use imperative mood, reference issues (`#123`).
- PRs: Include UI screenshots, describe schema/data impacts.- E2E tests: Playwright tests expect `http://localhost:8080` and clean container state.
- Always run `docker-compose restart` before executing tests to ensure clean state.
- Tests should be idempotent and handle existing data gracefully.
- Code quality: Run `npm run lint:all` and `npm run fix:all` before commits.
- Use markdownlint for docs: `npm run lint:md` and `npm run lint:md:fix`.

## Conventions and patterns

- Security: Always use the `PathValidator` helpers for any FS operations; don't bypass them. Uploads are in `uploads/`, 100MB max.
- Responses: On success, return JSON with either arrays/objects or `{ success: true, ... }`. Errors use status 400/500 with `{ error }`.
- Dates: Use ISO `YYYY-MM-DD` for scan dates; many columns allow null/empty to support schema evolution.
- Frontend contract: Shared components (e.g., `scripts/shared/settings-modal.js`) may call `window.refreshPageData(type)`; make sure page scripts define it.
- Module loading order: Always load `scripts/shared/*` before `scripts/pages/*` in HTML.
- Code style: 2-space indent, camelCase variables, kebab-case filenames, CommonJS in server code. routes, security headers, CSV parsing, rollover import (`processVulnerabilityRowsWithRollover`), docs portal routing.
- `scripts/init-database.js`: bootstrap DB if missing; `server.js` also evolves schema with idempotent ALTERs.
- `docs-html/*`: generated docs portal (served at `/docs-html`), with a whitelist of valid deep-link sections.
- `Dockerfile.node`: the correct Dockerfile for development (not the main Dockerfile).

## Run and develop

- **CRITICAL**: Use Docker only (don't run Node locally): `docker-compose up -d --build` (exposes <http://localhost:8080>).
- **CRITICAL**: Always restart container before running Playwright tests: `docker-compose restart`.
- Health check: GET `/health` returns `{ status, version, db, uptime }`.
- NPM scripts (run inside container): `npm start`, `npm run dev`, `npm run init-db`, `npm run lint:all`, `npm run fix:all`, `npm run docs:generate`, `npm run docs:analyze`.
- Code quality: Use `npm run lint:all` and `npm run fix:all` before commits; maintain 2-space indent, camelCase variables, kebab-case filenames.ot Instructions

Purpose: Give AI coding agents the minimum context to be productive in this repo. Keep edits aligned to these conventions and examples.

## Big picture

- Monolithic Node/Express app (`server.js`) serving static HTML + a JSON API; SQLite DB (`data/hextrackr.db`).
- Vulnerability data uses a rollover architecture: imports write historical snapshots and a deduplicated "current" table, plus daily totals for trends.
- Frontend is modular: `scripts/shared/*` (reusable UI/utilities) load before `scripts/pages/*` (page logic). Pages expose `window.refreshPageData(type)` for shared components to trigger refreshes.

## Key files

- `server.js`: all API routes, security headers, CSV parsing, rollover import (`processVulnerabilityRowsWithRollover`), docs portal routing.
- `scripts/init-database.js`: bootstrap DB if missing; `server.js` also evolves schema with idempotent ALTERs.
- `docs-html/*`: generated docs portal (served at `/docs-html`), with a whitelist of valid deep-link sections.

## Run and develop (2)

- Use Docker only (don’t run Node locally): `docker-compose up -d --build` (exposes <http://localhost:8080>).
- Health check: GET `/health` returns `{ status, version, db, uptime }`.
- NPM scripts (run inside container): `npm start`, `npm run dev`, `npm run init-db`, `npm run lint:all`, `npm run fix:all`, `npm run docs:generate`, `npm run docs:analyze`.
- Playwright e2e tests are supported; restart the container before running them.

## Data flows and APIs

- CSV import: `POST /api/vulnerabilities/import` (multipart, field `csvFile`, body `vendor`, `scanDate`).
  - Dedup key = `normalizeHostname(hostname)` + CVE (or plugin_id + description fallback).
  - Updates `vulnerabilities_current`, appends `vulnerability_snapshots`, recalculates `vulnerability_daily_totals`.
- JSON imports: `POST /api/import/vulnerabilities` and `POST /api/import/tickets` accept `{ data: [...] }` rows.
- Querying: `/api/vulnerabilities` (pagination + search + severity), `/api/vulnerabilities/stats`, `/api/vulnerabilities/recent-trends`, `/api/vulnerabilities/trends`.
- Backup/restore: `/api/backup/*`, `/api/restore` (ZIP of JSON parts via JSZip). Clearing data: `DELETE /api/backup/clear/:type`.

## Conventions and patterns (2)

- Security: Always use the `PathValidator` helpers for any FS operations; don’t bypass them. Uploads are in `uploads/`, 100MB max.
- Responses: On success, return JSON with either arrays/objects or `{ success: true, ... }`. Errors use status 400/500 with `{ error }`.
- Dates: Use ISO `YYYY-MM-DD` for scan dates; many columns allow null/empty to support schema evolution.
- Frontend contract: Shared components (e.g., `scripts/shared/settings-modal.js`) may call `window.refreshPageData(type)`; make sure page scripts define it.

## What to keep in mind when editing

- DB writes that iterate rows should be sequential (avoid `forEach` + callbacks) to prevent race conditions; see the sequential loop in `processVulnerabilityRowsWithRollover`.
- When adding docs sections, update the whitelist in `/docs-html` deep-link routing or they won’t be reachable by direct URL.
- Maintain 2-space indent, CommonJS in server code, and keep schema changes idempotent.

## Quick examples

- Health probe addition: add a new `app.get('/healthz')` similar to `/health` in `server.js`.
- New page JS: put code in `scripts/pages/newpage.js`, define `window.refreshPageData`, include shared loaders first in HTML, then your page script.
