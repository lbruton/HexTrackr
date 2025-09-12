# Repository Guidelines

## Project Structure & Module Organization

- `app/public/` — Express server (`server.js`), browser assets, docs helpers, and local scripts.
- `scripts/` — Node utilities (docs sync, versioning, misc tooling).
- `__tests__/` — Jest tests (`unit/`, `integration/`, `pages/`, `shared/`), fixtures, coverage.
- `tests/e2e/` — Playwright specs and artifacts (see `playwright-e2e.config.js`).
- `data/` — Local SQLite and persisted data. Do not commit secrets.
- Root configs — `eslint.config.mjs`, `.stylelintrc.json`, `jest.config.js`, `playwright*.config.js`, Docker files.

## Build, Test, and Development Commands

- Start server: `npm start` (runs `app/public/server.js`).
- Dev with reload: `npm run dev` (via nodemon).
- Initialize DB (local): `npm run init-db`.
- Unit/Integration tests: `npm test`, `npm run test:watch`, `npm run test:coverage`.
- Scoped tests: `npm run test:unit`, `npm run test:integration`.
- E2E tests: `npm run test:e2e` (expects app on `http://localhost:8989`).
- Lint all: `npm run lint:all` | Auto‑fix: `npm run fix:all`.
- Docs: `npm run docs:generate` (sync + rebuild HTML); changelog: `npm run docs:update-changelog`.
- Git hooks: `npm run hooks:install`.

## Coding Style & Naming Conventions

- JavaScript: CommonJS, ES2022. ESLint with `@stylistic` rules.
  - Double quotes, semicolons, `curly` for all blocks, `eqeqeq`, `prefer-const`, `no-var`.
- CSS: Stylelint (standard config). Prefer long hex, quoted font names.
- Markdown: markdownlint. Keep headings consistent and lines concise.
- Names: `kebab-case` files for assets, `camelCase` for vars/functions, `PascalCase` for classes. Tests end with `.test.js` or `.spec.js`.

## Testing Guidelines

- Frameworks: Jest (unit/integration, Node and jsdom projects) and Playwright (E2E).
- Locations: `__tests__/unit`, `__tests__/integration`, `__tests__/pages`, `__tests__/shared`, `tests/e2e/specs`.
- Coverage: auto‑collected; reports in `__tests__/coverage/`. Target meaningful coverage for changed code.
- E2E base URL: `http://localhost:8989` (Docker maps `8989:8080`). Ensure server/container is running before Playwright.

## Commit & Pull Request Guidelines

- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `feat(ui):`, `fix(spec-004):`.
  - Example: `feat: add pagination to vulnerability grid`.
- PRs must include: clear description, linked issues, test plan (commands + results), and screenshots for UI changes.
- Pre‑PR checklist: `npm run lint:all` and `npm run test:all` pass; update docs/changelog if relevant.

## Security & Configuration

- Copy `.env.example` to `.env`. Never commit secrets.
- Rate limiting and file upload limits are configurable via env. Review before exposing services.
- Prefer Docker for E2E/dev: `docker compose up -d` (service exposed at `http://localhost:8989`).
