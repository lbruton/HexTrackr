# Repository Guidelines

## Project Structure & Module Organization
`app/` contains the Express stack: controllers expose routes, services hold business rules, while `modules/` and `utils/` provide shared helpers. The server entry point and static assets live in `app/public/`; middleware and config live beside them under `app/middleware/` and `app/config/`. Test data and snapshots live in `data/` and `backups/`. Docs automation sits in `docs/` and `app/dev-docs-html/`, and operational scripts stay in `scripts/`. Jest code lives in `tests/{unit,integration,contract}/` with setup files in `tests/setup/`; Playwright legacy specs remain in `__tests__/`.

## Build, Test, and Development Commands
- `npm run dev` starts Nodemon for fast backend iteration.
- `docker-compose up -d` runs the full stack (app + SQLite volume).
- `npm run init-db` seeds a clean SQLite database.
- `npm run lint:all` aggregates markdownlint, ESLint, and Stylelint; `npm run fix:all` auto-corrects.
- `npm test`, `npm run test:integration`, and `npm run test:coverage` target the Jest projects and produce artifacts in `tests/coverage/`.

## Coding Style & Naming Conventions
ESLint (`eslint.config.mjs`) enforces 2-space indentation, double quotes, semicolons, `prefer-const`, and `eqeqeq`. Use module aliases such as `@services/ticket-service.js` instead of deep relatives. Name modules with camelCase; routers end in `*.router.js`. CSS in `app/public/styles/` must pass `npm run stylelint`; Markdown should clear `npm run lint:md`.

## Testing Guidelines
Global coverage should stay ≥70%, services ≥80%, controllers ≥75% (see `jest.config.js`). Generate reports with `npm run test:coverage` before merging feature branches. Name new specs `*.test.js`, store fixtures in `tests/fixtures/`, and clean transient files from `tests/temp/`. Browser flows rely on Playwright under `specs/` or `__tests__/`; document manual edge cases in PR notes.

## Commit & Pull Request Guidelines
Follow Conventional Commit prefixes (`feat:`, `fix:`, `docs:`, `chore:`) and reference tickets (`Refs HEX-142`) in the body. Keep messages descriptive—avoid "checkpoint" commits in shared branches. PRs need a short summary, verification steps (commands, screenshots for UI work), linked issues, and callouts for schema or script changes. Request reviewers who own the touched modules and attach lint/test results when CI is unavailable.

## Security & Configuration Tips
Load secrets via `.env`; never commit production credentials or generated SQLite files. For releases, run `npm run docs:analyze` to refresh architecture artifacts and confirm security controls (rate limits, sanitizers) are reflected.
