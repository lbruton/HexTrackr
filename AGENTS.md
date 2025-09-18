# Repository Guidelines

## Project Structure & Module Organization

HexTrackr keeps all runtime code under `app/`, with configuration modules in `app/config`, request handlers in `app/controllers` and `app/routes`, shared services in `app/services`, and reusable helpers in `app/utils`. The bundled frontend lives in `app/public`, including styles, scripts, and documentation generators under `app/public/scripts`. Persistent assets such as seed data and uploads use the top-level `data/` and `uploads/` directories, while deeper architectural notes live in `dev-docs/` and product specs in `specs/`. Automated tests reside in `tests/` (unit, integration, contract) and legacy UI coverage in `__tests__/`.

## Build, Test, and Development Commands

Run `npm install` once, then `npm run dev` for hot-reloading backend development or `npm start` to serve the compiled build. Use `docker-compose up -d` from the repository root when you need the full stack with Nginx and SQLite bundled. Database fixtures are bootstrapped with `npm run init-db`. Quality gates are enforced through `npm run lint:all`, and the docs portal refreshes via `npm run docs:generate`.

## Coding Style & Naming Conventions

Project JavaScript sticks to CommonJS modules, two-space indentation, and double-quoted strings to match the existing codebase. Prefer directory-based imports that leverage the Jest/Webpack aliases (`@/`, `@config/`, `@services/`, etc.) defined in `jest.config.js`. Before opening a pull request, run `npm run eslint`, `npm run stylelint`, and `npm run lint:md`; auto-fixes are available with the paired `:fix` scripts. Avoid committing generated assets from `app/public/docs-html` or local artifacts in `logs/` and `uploads/`.

## Testing Guidelines

Jest powers the multi-project suite: unit tests in `tests/unit`, integration tests in `tests/integration`, contract tests in `tests/contract`, and legacy frontend smoke tests under `__tests__/`. Name files `*.test.js` or `*.spec.js` and place setup logic inside `tests/setup/` instead of reconfiguring per file. Run targeted suites with `npm run test:unit`, `npm run test:integration`, `npm run test:contract`, or use `npm run test:coverage` to enforce the global 70% coverage baseline (controllers/services target 75–80%). Capture regression fixtures in `tests/fixtures/` and clean utilities with `jest-mock-extended` when stubbing complex services.

## Commit & Pull Request Guidelines

Follow the Conventional Commits pattern already used (`feat:`, `fix:`, `refactor:`, etc.) and keep messages imperative, e.g., `feat: add socket heartbeat guard`. Each pull request should describe the change, list verification commands, link the relevant issue or spec, and attach UI screenshots when altering assets in `app/public`. Confirm `npm run lint:all` and the relevant Jest suites are green, update docs in `dev-docs/` or `README.md` when behavior shifts, and request review only after checking for leftover temporary files.

## Security & Configuration Tips

HexTrackr reads environment variables through `dotenv`; store secrets in a local `.env` and never commit it. Rate limiting, upload validation, and socket settings live in `app/config/`—touch these in coordinated changes and document toggles in `dev-docs/architecture`. When working with SQLite backups, keep exports inside `data/backups/` and purge them before publishing a branch.

### Memento Session Context (Memento MCP is our primary knowledge graph)
  - **THEN** search for strategic context using semantic search (5-10x faster, 80% less tokens)
  - Use natural language queries WITH DATES like "sessions from today 2025-09-16" or "latest work this week"
  - All saved entities have `TIMESTAMP` as their FIRST observation in ISO 8601 format
  - Recent sessions are saved with pattern: `Session: HEXTRACKR-[TOPIC]-[DATE]-001`
  - Check `ABSTRACT` and `SUMMARY` observations for quick context on previous work
  - **IMPORTANT**: Include today's date in your search queries for finding the most recent work
