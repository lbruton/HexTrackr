# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts the Express server and domain logic; `public/server.js` is the entry point wiring routes, sockets, and middleware.
- `app/controllers`, `services`, and `modules` keep request handling, reusable business logic, and feature bundles isolated.
- `app/routes` defines mounted routers, while `app/utils` centralizes helpers such as progress tracking.
- `data/` stores the SQLite schema and local `hextrackr.db`; do not commit replacements without validating migrations.
- `docs/` and `app/dev-docs-html/` contain generated documentation; `planning/` and `memento/` capture roadmap material.

## Build, Test, and Development Commands
- `npm run dev` launches the Express server with nodemon for hot reloading.
- `npm start` runs the production server directly.
- `npm run init-db` seeds the SQLite database using `app/public/scripts/init-database.js`.
- `npm run docs:all` regenerates the architecture and API docs when backend contracts change.

## Coding Style & Naming Conventions
- JavaScript is linted by ESLint with `@stylistic`; use double quotes, semicolons, and 4-space indentation shown in `app/public/server.js`.
- Favor `const`/`let`, guard against unused variables, and keep controller/service files under 300 lines for readability.
- CSS changes should pass `npm run stylelint`; Markdown updates should survive `npm run lint:md`.
- Feature folders follow kebab-case (e.g., `modules/ticket-tracker`); exported classes use PascalCase, helpers camelCase.

## Testing Guidelines
- Jest is configured for Node and browser environments; colocate specs in `tests/` using `*.test.js` naming.
- Run `npm test` before pushing; use `npm run test:unit` or `npm run test:integration` when focusing on a subset.
- Ship new features with coverage from `npm run test:coverage`; highlight any intentional gaps in the PR description.

## Commit & Pull Request Guidelines
- Prefer Conventional Commits (`feat:`, `fix:`, `docs:`) as seen in recent history; keep the subject under ~70 characters.
- Each PR should include: summary of changes, testing output (`npm test`, lint results), linked issues, and screenshots for UI-affecting work.
- Rebase onto `main` before requesting review; resolve lint/test failures locally instead of relying on CI.
- For database changes, attach schema diffs or migration notes so reviewers can replay the steps.

## Environment & Security Notes
- Copy `.env` from the secure store when onboarding; avoid committing secrets or local DB files.
- Rate limiting and socket rooms rely on configuration in `app/config/`; review those modules before altering middleware or WebSocket behavior.
- Remove stray logs from controllers prior to merging to preserve observability signal-to-noise.
