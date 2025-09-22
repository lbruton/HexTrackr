# Repository Guidelines

## Project Structure & Module Organization
The Express backend lives in `app/`, with controllers exposing routes, services holding business logic, and shared helpers under `modules/` and `utils/`. Static assets, middleware, and configuration sit in `app/public/`, `app/middleware/`, and `app/config/` respectively. Tests reside in `tests/{unit,integration,contract}/`, with setup utilities in `tests/setup/`; legacy Playwright specs remain in `__tests__/`. Use `data/` and `backups/` for fixtures and snapshots, while docs automation sits in `docs/` and `app/dev-docs-html/`.

## Build, Test, and Development Commands
Run `npm run dev` for a hot-reloading API server, or `docker-compose up -d` to start the full stack with SQLite. Seed a clean database via `npm run init-db`. Lint everything with `npm run lint:all`; auto-fix where possible using `npm run fix:all`.

## Coding Style & Naming Conventions
ESLint (`eslint.config.mjs`) enforces 2-space indentation, double quotes, semicolons, `prefer-const`, and `eqeqeq`. Favor module aliases such as `@services/ticket-service.js` over deep relatives. Name routers `*.router.js`, keep modules camelCased, and ensure CSS under `app/public/styles/` passes `npm run stylelint`. Markdown changes must satisfy `npm run lint:md`.

## Testing Guidelines
Jest drives unit, integration, and contract suites; execute `npm test` or scope with `npm run test:integration`. Maintain coverage ≥70% globally, ≥80% for services, and ≥75% for controllers using `npm run test:coverage`. Name new specs `*.test.js`, store fixtures in `tests/fixtures/`, and purge temporary outputs from `tests/temp/`.

## Commit & Pull Request Guidelines
Use Conventional Commit prefixes (e.g., `feat:`) and reference tickets (`Refs HEX-142`) in bodies. PRs need a concise summary, verification steps, linked issues, and screenshots for UI-affecting work. Flag schema or script changes, tag module owners, and attach lint/test results when CI is unavailable.

## Security & Configuration Tips
Load secrets from `.env` and keep generated SQLite files out of version control. Before releases, run `npm run docs:analyze` to refresh architecture artifacts and confirm rate limits and sanitizers remain current.
