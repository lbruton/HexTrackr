# Repository Guidelines

## Project Structure & Module Organization
HexTrackr server code lives in `app/` with `controllers/`, `routes/`, `services/`, `middleware/`, and shared utilities under `utils/`. The browser UI and static assets are in `app/public/` (`scripts/`, `styles/`, `docs-html/`, and sample data). Documentation sources reside in `app/public/docs-source/` and developer notes in `docs/`. Automation and helper scripts sit in `scripts/`, while deployment helpers (`docker-*.sh`, `nginx.conf`) are at the repo root. Place integration and Stagehand scenarios under `tests/`, mirroring the feature area (`tests/auth/...`).

## Build, Test, and Development Commands
- `npm install` — install server and client dependencies; rerun after `package.json` changes.
- `npm run dev` — start the Express server with nodemon for hot reload on port 8989.
- `npm run start` — production entry point matching Docker containers.
- `npm run init-db` — seed the SQLite database in `app/data/`; run before local auth tests.
- `npm run lint:all` / `npm run fix:all` — enforce or auto-fix JS, CSS, and Markdown quality gates.
- `npm run docs:dev` — regenerate JSDoc output in `app/public/docs-html/`.
- `npm run test:stagehand` — execute Stagehand UI flows; ensure the dev server is running first.
- `./docker-start.sh` / `./docker-stop.sh` — bootstrap or tear down the full container stack.

## Coding Style & Naming Conventions
JavaScript is linted with ESLint (`eslint.config.mjs`), targeting CommonJS on the server and browser globals on the client. Use 4-space indentation, double quotes, trailing semicolons, `const` by default, and guard against loose equality. Export classes with `PascalCase`, functions with `camelCase`, and constants as `UPPER_SNAKE_CASE`. SCSS/CSS in `app/public/styles/` is Stylelinted; prefer hyphen-case selectors and keep component-specific rules scoped via namespace classes. Install the repo hooks once with `npm run hooks:install` to mirror CI checks.

## Testing Guidelines
Author Stagehand journeys in `tests/<feature>/` and name files after the user path (`session-login.stagehand.js`). Keep scenarios idempotent: reset fixtures with `npm run init-db` and avoid hard-coding UUIDs. When adding new data mutations, include assertions that cover both the API response and the UI update. Run `npm run lint:all` before `npm run test:stagehand`; both must pass before requesting review. Document any manual verification steps in the PR if automated coverage is not feasible.

## Commit & Pull Request Guidelines
Follow the observed Conventional Commit style: `type(scope): short message (HEX-###)`. Align `scope` with the touched module (`ui`, `kev`, `auth`, etc.) and reference the relevant HexTrackr work item. PRs should include: 1) a concise summary, 2) linked HEX issue or ticket, 3) screenshots or GIFs for UI changes, and 4) a checklist of `lint`/`test` results. Mention any environment setup needed for reviewers and flag migrations or scripts that must run post-merge.

## Security & Configuration Tips
Never commit secrets from `secrets/` or generated certs in `certs/`. The server enforces a strong `SESSION_SECRET`; generate one via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and store it in `.env`. When touching HTTPS or socket layers, update `app/config/server.js` and `app/config/websocket.js` together. Use `scripts/setup-ssl.sh` to refresh local TLS artifacts instead of manually editing keys.
