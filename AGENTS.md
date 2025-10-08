# HexTrackr Agent Guidelines

## Commands
**Dev:** `npm run dev` (port 8989) | **Lint:** `npm run lint:all` or `npm run fix:all` | **Test:** `npm run test:stagehand` (requires dev server) | **DB:** `npm run init-db` | **Hooks:** `npm run hooks:install`

## Code Style
**JS:** CommonJS (server) / script mode (browser), 4-space indent, double quotes, semicolons required, `const` by default, strict equality (`===`), no `var`. **Naming:** `PascalCase` classes, `camelCase` functions/vars, `UPPER_SNAKE_CASE` constants. **CSS:** hyphen-case selectors, scoped namespace classes. **Imports:** Server uses `require()`, client uses `<script>` tags, vulnerability modules use ES6 `import/export`.

## Architecture
**Server:** `app/controllers/` → `app/services/` → `app/routes/` pattern. Controllers handle HTTP, services contain business logic. **Client:** `app/public/scripts/` with `pages/`, `shared/`, `utils/`. Static assets in `app/public/`. **Errors:** Use Promise-based error handling (`reject(new Error("msg"))`), return `{success: false, error: "msg"}` in controllers.

## Module Specifics
**Auth:** Argon2id hashing, 5 failed attempts → 15min lockout. Sessions in SQLite via `better-sqlite3-session-store`. **Vulnerabilities:** AG-Grid for tables, ApexCharts for graphs, Socket.io for real-time updates. **KEV:** CISA API integration, cache with 24hr TTL.

## Testing & Quality
Run `npm run lint:all` before commits. Stagehand tests go in `tests/<feature>/`. Reset DB with `npm run init-db` for idempotent tests. Never hardcode UUIDs. Document manual verification in PRs.

## Git & PRs
**Commits:** `type(scope): message (HEX-###)` format. **Scopes:** `ui`, `auth`, `kev`, `api`, `docs`. **PRs:** Include summary, ticket link, screenshots (for UI), lint/test checklist.

## Security
Never commit `secrets/`, `certs/`, or `.env` files. Generate `SESSION_SECRET` via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Use `scripts/setup-ssl.sh` for TLS certs.

## Codacy Integration (from .cursor/rules/codacy.mdc)
**CRITICAL:** After ANY file edit, immediately run `codacy_cli_analyze` tool with `rootPath` and `file` parameters. After package installs, run with `tool: "trivy"` for security scanning. Fix issues before continuing. **Repo:** provider=gh, org=Lonnie-Bruton, repo=HexTrackr-Dev.
