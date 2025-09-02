# HexTrackr – Copilot Instructions

Purpose: Give AI coding agents the minimum, project‑specific context to be productive without guesswork.

## Critical rules

- Git checkpoints: create a commit before any file edits and another after applying changes (keep messages short; details live in chat/memory).
- Context first: use Memento + Persistent‑AI‑Memory with targeted 3–5 word semantic searches (limit 3–5). Avoid full graph reads unless explicitly necessary.
- Tooling: activate MCP tools (Memento + PAM) before memory ops; never use direct HTTP/curl for memory.
- Model neutrality: proceed with the user’s current provider; do not suggest switching models.

## Architecture essentials

- Runtime: Node.js (Express) + SQLite. Single server entrypoint: `server.js`.
- Data: SQLite DB at `data/hextrackr.db`. The schema is created by `scripts/init-database.js` and augmented on boot by `initDb()` in `server.js` (adds vulnerability columns). Don’t rely on `data/schema.sql` for truth.
- Frontend: Static HTML pages (`tickets.html`, `vulnerabilities.html`) with modular JS:
  - Shared components in `scripts/shared/` (e.g., `settings-modal.js`).
  - Page code in `scripts/pages/` (e.g., `tickets.js`, `vulnerabilities.js`).
  - Utilities in `scripts/utils/`.
- Docs portal: Markdown in `docs-source/` → generated HTML in `docs-html/` via `docs-html/html-content-updater.js`. SPA shell served at `/docs-html` with safe section redirects.
- Security: `PathValidator` guards file operations and docs generation; uploads use multer with size limits; basic security headers enabled.

## Key server routes (examples)

- Tickets: `GET /api/tickets`, `POST /api/tickets`, `PUT /api/tickets/:id`, `DELETE /api/tickets/:id`.
- Vulnerabilities: `GET /api/vulnerabilities` (pagination + filters), `POST /api/vulnerabilities/import` (CSV upload form field `csvFile`), `POST /api/import/vulnerabilities` (JSON rows). Stats at `/api/vulnerabilities/stats` and `/api/vulnerabilities/trends`.
- Backup/restore: `GET /api/backup/{tickets|vulnerabilities|all}`, `GET /api/backup/stats`, `DELETE /api/backup/clear/:type`, `POST /api/restore` (zip with `tickets.json` / `vulnerabilities.json`).
- Docs/health: `GET /docs-html`, `GET /api/docs/stats`, `GET /health`.

## Developer workflows

- Run locally
  - Install deps: `npm install`
  - Initialize DB: `node scripts/init-database.js`
  - Start server: `npm start` → <http://localhost:8080>
- Lint & formatting
  - `npm run lint:all` (markdownlint, ESLint, stylelint). ESLint: `eslint.config.mjs` (double quotes, semicolons, prefer‑const, no‑var, eqeqeq, strict no‑unused‑vars, browser/Node globals scoped by file globs).
- Docs
  - Generate docs HTML: `npm run docs:generate` (skips subfolder `index.md` pages intentionally).
- Codacy (required after edits)
  - Run Codacy CLI analysis for each edited file via the MCP tool. Fix critical/high issues before proceeding.
  - For this repo use: provider=gh, organization=Lonnie-Bruton, repository=HexTrackr.
  - After any dependency change, run security scan with tool=trivy before continuing.

## Project conventions

- Modular JS
  - Always load shared components before page scripts in HTML, e.g. `scripts/shared/settings-modal.js` then `scripts/pages/tickets.js`.
  - Pages expose hooks used by shared components:
    - `window.refreshPageData(type)` to refresh views after settings/data ops.
    - `window.showToast(message, type)` for notifications.
- Server‑side file IO
  - Use the `PathValidator` helpers in `server.js` for read/write/dir ops.
- CSV/JSON imports
  - Vulnerabilities CSV upload uses `csvFile`; mapping handled by `mapVulnerabilityRow`/`processVulnerabilityRows`.
  - JSON array imports accepted at `/api/import/{tickets|vulnerabilities}` under `body.data`.
- Schema notes
  - Tickets: schema in `scripts/init-database.js` (id text primary key; array-like fields (`devices`, `attachments`) are JSON‑stringified in DB; parse/stringify accordingly).
  - Vulnerabilities: additional columns may be added at boot (`vendor`, `vulnerability_date`, `state`, `import_date`).

## MCP tools & quality gates

- Memory/context: Use Memento + Persistent‑AI‑Memory MCPs for targeted semantic searches (3–5 word queries). Avoid full graph reads unless necessary.
- Codacy MCP: Run analysis immediately after any file edit; use trivy after package changes; stop to fix critical/high findings first.
- Quick smoke: `GET /health` and open `/docs-html` after changes touching server/docs.

## Docs portal & routing safety

- If adding new docs sections, also add the section slug to the whitelist in `server.js` (`validSections`) so `/docs-html/<section>.html` redirects don’t 404.
- File uploads: handled by multer to `uploads/` with 100MB limit; treat as temporary files and unlink after processing (see vulnerability imports).

## Safe changes and examples

- New page: create `scripts/pages/my-page.js`, include after shared scripts, implement the two window hooks.
- New API route: add under `/api/...` in `server.js`, use parameterized sqlite3 statements, keep compatibility with backup/import flows.
- Update docs: edit `docs-source/**/*.md`, then regenerate `docs-html/`.

## Agent workflow (local policy)

Observe → Context check → File check → Plan → Approval → Git checkpoint → Execute → Git checkpoint. Keep `AGENTS.md` and docs in sync.

If something is ambiguous (e.g., docker scripts vs compose files), prefer what exists in this repo today and call out mismatches rather than assuming missing pieces.

## Multi‑LLM neutrality

- Always proceed with the user’s current provider (Claude/GPT/Gemini). Do not ask the user to switch models.
- Keep the first steps (observe/context/files/plan) implicit; only ask clarifying questions when truly blocked.
- Use the same minimal context strategy for all providers: targeted semantic searches via MCP (Memento/PAM), not full graph reads.
- Normalize prompts and outputs (common schema, deterministic JSON for tool calls); if validation fails, retry once silently.
- On provider/tool limitations, degrade gracefully or fallback once; summarize constraints only at the end if they materially affect results.
