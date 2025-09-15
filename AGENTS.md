# Repository Guidelines

## Project Structure & Module Organization

- `app/public/` — Express server (`server.js`), client scripts (`scripts/`), styles, docs, and assets.
- `scripts/` — tooling and utilities (e.g., `fix-markdown.js`, release helpers).
- `data/` — SQLite data and persisted artifacts (mounted in Docker).
- `dev-docs/` — internal documentation and references.
- `__tests__/` — place tests under `unit/`, `integration`, `shared`, `pages` (see Jest config). E2E lives under `__tests__/tests` (Playwright).

## Build, Test, and Development Commands

- `npm install` — install dependencies.
- `npm run dev` — start server with autoreload (nodemon) on port 8080.
- `npm start` — start server in Node.
- `npm run init-db` — seed/init local database.
- `npm run lint:all` / `npm run fix:all` — run or auto-fix markdown, JS, and CSS.
- `npx jest --coverage` — run unit/integration/jsdom tests, write to `__tests__/coverage/`.
- `npx playwright test` — run E2E tests (if present).
- `docker-compose up -d` — run in Docker (exposes `8989 -> 8080`).

## Coding Style & Naming Conventions

- JavaScript: 2-space indent, double quotes, semicolons; prefer `const`, use strict equality. Enforced by ESLint (`eslint.config.mjs`).
- CSS: Stylelint standard config (`.stylelintrc.json`).
- Markdown: markdownlint with project rules.
- Filenames: kebab-case for JS modules (e.g., `vulnerability-grid.js`); PascalCase for classes; camelCase for functions/vars.
- Install Git hooks once: `npm run hooks:install` (pre-commit runs selective auto-fix + validation).

## Testing Guidelines

- Frameworks: Jest (unit/integration/jsdom) and Playwright (E2E).
- Locations: `__tests__/unit`, `__tests__/integration`, `__tests__/shared`, `__tests__/pages`, `__tests__/tests` (E2E).
- Naming: `*.test.js` or `*.spec.js`.
- Coverage: enabled by default; keep meaningful coverage for changed code (`npx jest --coverage`).

## Commit & Pull Request Guidelines

- Use Conventional Commits where possible: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `security:`.
  - Example: `fix: resolve rate limiter config for uploads`.
- Before PR: run `npm run fix:all` and ensure pre-commit hooks pass; include description, linked issues, and screenshots for UI changes.
- Keep PRs focused; prefer small, reviewable changes.

## Security & Configuration Tips

- Use `.env` for local secrets; do not commit credentials. Relevant envs: `NODE_ENV`, `HEXTRACKR_VERSION`.
- File uploads and DB files live under `app/public/uploads/` and `data/`; avoid committing large/generated artifacts.
