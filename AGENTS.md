# Repository Guidelines

## Project Structure & Module Organization
`public/server.js` bootstraps the Express instance, wiring routers, sockets, and middleware from `app/`. Feature logic lives under `app/modules`, while `app/services` exposes reusable domain helpers. HTTP controllers reside in `app/controllers`, and route mounting is centralized in `app/routes`. Shared utilities, such as progress tracking, are in `app/utils`. SQLite assets live in `data/` (including `hextrackr.db` and schema files); handle them with care and validate migrations before replacing anything.

## Build, Test, and Development Commands
- `npm run dev`: Starts the API with nodemon hot reload for local development.
- `npm start`: Launches the production Express server without file watching.
- `npm run init-db`: Seeds the SQLite database using `app/public/scripts/init-database.js`.
- `npm run docs:all`: Regenerates API and architecture docs in `docs/` and `app/dev-docs-html/` whenever backend contracts shift.

## Coding Style & Naming Conventions
JavaScript follows ESLint with `@stylistic`: double quotes, semicolons, and 4-space indentation (see `app/public/server.js`). Prefer `const`/`let`, keep files under ~300 lines, and remove stray logs before merging. Feature folders use kebab-case (e.g., `app/modules/ticket-tracker`), exported classes use PascalCase, helpers camelCase. CSS must satisfy `npm run stylelint`; Markdown should pass `npm run lint:md`.

## Testing Guidelines
Jest drives both server and browser tests. Place specs in `tests/` with the `*.test.js` suffix. Run `npm test` before a push, and lean on `npm run test:unit`, `npm run test:integration`, or `npm run test:coverage` for focused runs and reporting. Highlight any intentional coverage gaps in your PR description.

## Commit & Pull Request Guidelines
Use Conventional Commits (`feat:`, `fix:`, `docs:`) with subjects under ~70 characters. Each PR should summarize the change, link relevant issues, include test and lint results (e.g., `npm test`), and attach screenshots for UI updates. Rebase onto `main` before requesting review and resolve lint/test failures locally instead of relying on CI.

## Security & Configuration Tips
Copy `.env` from the secure store and avoid committing secrets or local DB files. Rate limiting and socket rooms depend on `app/config/`; review those modules before altering middleware or WebSocket behavior. When adjusting database logic, attach schema diffs or migration notes so others can replay your steps safely.
