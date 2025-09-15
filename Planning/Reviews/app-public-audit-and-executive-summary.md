# HexTrackr App Audit (app/public) — Executive Summary and Technical Findings

Date: 2025-09-15
Scope: Full audit of the code and configuration under `app/public/` including backend server, API endpoints, client scripts, static assets, and operational configuration.

## Executive Summary

- The application provides a combined backend (Express + SQLite) and frontend (Tabler/Bootstrap-based UI) collocated inside `app/public/` with real-time progress via Socket.io and CSV import flows.
- Overall engineering quality is solid in many areas (parameterized SQL, rate limiting on `/api`, progress tracking abstraction, and structured CSV staging). However, a few critical risks must be addressed before any production exposure.

Key risks and priorities:

- High — Backend source disclosure: `express.static(__dirname)` serves the entire `app/public` directory, exposing `server.js` and backend source code directly to the web. See `app/public/server.js:2690` and `app/public/server.js:2556`.
- High — No authentication/authorization: All API endpoints are publicly accessible. For internal-only dev this may be acceptable, but production must gate all state-changing routes with authentication and, ideally, role-based authorization.
- High — Client-side XSS risk: Multiple `innerHTML` template insertions use raw values without consistent sanitization (e.g., vulnerability descriptions). While DOMPurify is included, its use is not enforced across components. Example: `app/public/scripts/shared/vulnerability-cards.js` renders `description` directly.
- Medium — File upload hardening: CSV uploads have generous size limits (100MB) and no content/MIME validation. Parsing is in-memory; while staging mode improves performance, memory pressure and malformed input protections should be strengthened.
- Medium — Static and uploads coexistence: The server statically serves `app/public`. If runtime CWD ever changes and `multer` writes to `app/public/uploads/`, uploaded files may become publicly accessible. Pin upload dir safely outside the static root.
- Medium — Security headers and CSP: Custom headers exist, but `helmet` and a proper Content Security Policy are absent. CSP would reduce XSS exposure and lock down third-party scripts.
- Medium — CSRF: State-changing endpoints lack CSRF protection. If the app is ever hosted on a user-accessible domain, CSRF mitigations are recommended (tokens, SameSite cookies, or double-submit pattern).
- Low — CDN reliance and SRI: Several front-end dependencies load from CDNs without Subresource Integrity. Consider vendoring or adding SRI and a CSP `script-src` that aligns with operational constraints.

Recommended immediate actions (top 6):

1) Remove backend source from static scope. Serve only explicit asset folders; move `server.js` out of `app/public` or restrict static middleware.
2) Add authentication and authorization middleware for all `/api` routes and WebSocket joins.
3) Enforce DOMPurify (or equivalent) for all `innerHTML` insertions; replace template-string HTML with safe render helpers.
4) Harden uploads: validate MIME/type, cap rows, stream parse, and store uploads outside any static root.
5) Add `helmet` and a CSP (`default-src 'self'`; pin third-party origins or vendor locally; add SRI hashes for any CDNs kept).
6) Add CSRF protections for POST/PUT/DELETE routes if this will run in user-facing environments.

---

## Architecture Overview

- Backend: Express server with REST endpoints, CSV imports, SQLite data layer, Socket.io progress tracking.
  - Entrypoint: `app/public/server.js` (bound to `0.0.0.0:${PORT}`; default 8080).
  - Static middleware exposes `app/public` (includes `server.js`). See `app/public/server.js:2690`.
  - CORS: limited to localhost by default. See `app/public/server.js:1937`.
  - Rate limiting on `/api` only. See `app/public/server.js:1952`.
- Data: SQLite with rollover architecture, staging table for bulk import, daily totals, and lifecycle states.
  - Many queries use parameter binding; long-running operations wrapped in transactions.
- Frontend: Modular JS under `app/public/scripts`, Tabler + Font Awesome UI, AG Grid, ApexCharts, CSV/ZIP utilities.
- Realtime: Socket.io with per-session rooms for long-running imports.

---

## Security Posture

### Backend surface

- Static exposure of server code (High):
  - `express.static(__dirname)` serves the entire folder containing the backend source.
    - `app/public/server.js:2690`
    - Also `/docs-html` static root: `app/public/server.js:2683`
  - Result: `GET /server.js` returns backend source. Eliminating easy reconnaissance should be a priority.

- CORS: Development-focused, not environment-driven (Medium):
  - Allowed origins: `["http://localhost:8080", "http://127.0.0.1:8080"]`
  - `app/public/server.js:1937`
  - Recommendation: Make origin(s) configurable via env; default strict in prod.

- Security headers (Medium):
  - Custom headers set: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`.
    - `app/public/server.js:1965`
  - Recommendation: use `helmet` for a complete baseline (HSTS, `Referrer-Policy`, `Permissions-Policy`, etc.).

- Authentication and authorization (High):
  - No auth on any `/api` route or Socket.io namespace. Endpoints expose data writes, imports, and deletes.
  - Recommendation: introduce auth middleware (JWT, session + RBAC), secure WS joins, and restrict state-changing routes.

- CSRF (Medium):
  - State-changing requests lack CSRF mitigations. If app runs in user browsers on a domain, add CSRF tokens or leverage SameSite+secure cookies.

- Rate limiting and DoS (Medium):
  - `express-rate-limit` applied to `/api` (`app/public/server.js:1952`).
  - Consider specific limits for expensive endpoints (imports/backup), request body limits already set to 100MB (`app/public/server.js:1955`).

### File uploads

- Multer config and pathing (Medium):
  - Destination: `uploads/`, 100MB limit. `app/public/server.js:1959-1964`.
  - Ensure upload directory is outside any static root. Today it’s safe if process CWD is repo root; dangerous if CWD is `app/public`.
  - Add file-type/MIME validation and row-count caps; consider streaming CSV parsing.

- Cleanup:
  - CSV/ZIP files are cleaned up after processing. Examples: `app/public/server.js:741`, `app/public/server.js:904`, `app/public/server.js:1586`, `app/public/server.js:3786`.

### SQL safety

- Queries predominantly parameterized, including dynamic where-clauses built separately from bound values.
- Bulk import wrapped in transactions (good). Tables and schema management are explicit; handles dedup keys and lifecycle states.

### Frontend XSS

- DOMPurify included but not consistently enforced:
  - DOMPurify vendor: `app/public/vulnerabilities.html:1222`
  - Safe helpers exist: `app/public/scripts/utils/security.js:19` and `app/public/scripts/utils/security.js:52`.
  - However, several components update `innerHTML` with template strings that incorporate unescaped data (e.g., vulnerability descriptions).
    - Example: `app/public/scripts/shared/vulnerability-cards.js` inserts `description` directly into an HTML template.
  - `document.write` used in report generation: `app/public/scripts/shared/device-security-modal.js:449` — verify all injected values are sanitized.
  - Recommendation: centralize safe rendering, replace direct template insertions with `safeSetInnerHTML` or text nodes, and add a CSP.

### WebSocket security

- Socket.io configured with CORS to localhost. `app/public/server.js:1882-1895` and `app/public/server.js:1895-1927`.
- No auth on rooms; consider token-based join for progress sessions in production.

### Information disclosure

- Health endpoint reveals version and DB existence. `app/public/server.js:1973-1990`.
  - Acceptable for ops, but consider limiting detail or gating in production.
- Static serving of entire app directory compounds disclosure risk (primary issue).

---

## Operational & Resilience

- Server binds `0.0.0.0`, port from `PORT` or default 8080.
- Startup DB init/migrations run automatically. `app/public/server.js:2795+`.
- Logging includes debug info (sample row keys, import stats). Ensure logs do not leak sensitive data in prod.
- Consider SQLite WAL mode and busy-timeouts for better concurrency under load.

---

## Dependency & Supply Chain

- CDN-loaded libraries (e.g., PapaParse, JSZip, Font Awesome) without SRI on the vulnerabilities page.
  - `app/public/vulnerabilities.html:1216-1221`
- Tickets page appears to use a local copy of DOMPurify (`scripts/utils/purify.min.js`) but should standardize on vendor or pinned version.
- Recommendation: Prefer vendored assets or add SRI; define a CSP aligned with chosen sources.

---

## Detailed Recommendations

1) Remove server code from static scope (High)

- Move `server.js` out of `app/public/` (e.g., to `app/server/`) and set static roots narrowly:
  - Serve only `styles/`, `vendor/`, `docs-html/`, and specific HTML entrypoints.
  - Alternatively, add a guard in static middleware to deny serving `server.js` and any non-asset files, but relocation is cleaner.

2) Add authentication/authorization (High)

- Protect all `/api` routes and Socket.io joins.
- Introduce roles (viewer/importer/admin) for sensitive operations: imports, deletes, backup/restore.

3) Enforce XSS defenses (High)

- Replace all direct `innerHTML` templating with `safeSetInnerHTML` or text nodes.
- Validate and escape all user-controlled or CSV-derived fields before rendering.
- Add CSP (`default-src 'self'`; allowlist required vendor origins or vendor locally); avoid `unsafe-inline`.

4) Harden uploads (Medium)

- Validate content-type and sniff CSV structure; reject unexpected MIME types.
- Add row-count limits and stream parse for very large files.
- Pin upload directory outside any static roots; use absolute path (`path.join(__dirname, '..', '..', 'uploads')`) or `data/uploads`.

5) Standardize environment-driven security (Medium)

- CORS origins from env; strict defaults in production.
- Add `helmet` for comprehensive headers (HSTS, Referrer-Policy, Permissions-Policy, etc.).
- Consider CSRF protections for state-changing endpoints if cookies/sessions are used.

6) Operational hardening (Low/Medium)

- Enable SQLite WAL mode and set busy timeouts for concurrency.
- Add request-specific rate limits to heavy endpoints (import/backup) if exposed.
- Gate health/details in production or reduce its detail.

---

## Notable File References

- Static file serving (exposes server code): `app/public/server.js:2690`
- Docs static root: `app/public/server.js:2683`
- CORS config: `app/public/server.js:1937`
- Rate limit applied to `/api`: `app/public/server.js:1952`
- Body-size limits: `app/public/server.js:1955-1956`
- Multer upload dest: `app/public/server.js:1959-1964`
- Security headers: `app/public/server.js:1965`
- Health endpoint: `app/public/server.js:1973`
- WebSocket setup: `app/public/server.js:1882-1895`, `app/public/server.js:1895-1927`
- CSV cleanup examples: `app/public/server.js:741`, `app/public/server.js:904`, `app/public/server.js:1586`, `app/public/server.js:3786`
- DOMPurify helpers: `app/public/scripts/utils/security.js:19`, `app/public/scripts/utils/security.js:52`
- Vulnerability card HTML templating: `app/public/scripts/shared/vulnerability-cards.js`
- Report generation with `document.write`: `app/public/scripts/shared/device-security-modal.js:449`

---

## Closing Notes

The codebase demonstrates thoughtful engineering patterns (parameterized SQL, staging-import pipeline, progress sessions, and numerous guardrails). The most urgent fix is preventing backend code disclosure via static middleware and introducing proper auth. Once those are addressed, tightening HTML rendering, upload validation, and adding a CSP/helmet will significantly strengthen the security posture for any non-local deployment.
