# Repository Guidelines

## Project Structure & Module Organization
- `app/` houses the Express server. Controllers orchestrate business logic, routes expose REST endpoints, services wrap SQLite access, and middleware centralizes auth/logging. Front-end assets live in `app/public/`, including `scripts/pages` for page controllers and `scripts/shared` for cross-page utilities.
- Reusable helpers live under `app/config/` and `app/utils/`; extend these before introducing new directories. Seed CSVs and backup assets reside in `data/`, while runtime logs are written to `logs/` during container runs.

## Build, Test, and Development Commands
- `npm run dev` — hot-reloading server on port 8080; pair with `docker-compose up -d` to mirror production on 8989.
- `npm start` — serve the production bundle.
- `npm run init-db` — seed or refresh the SQLite database at `app/public/data/hextrackr.db`.
- `npm run lint:all`, `npm run fix:all`, `npm run docs:all` — required before any PR; keep lint clean locally.
- `npm run test:stagehand` — execute automated smoke tests used in CI.

## Coding Style & Naming Conventions
- JavaScript: four-space indentation, double-quoted strings, mandatory semicolons, strict equality. Prefer `const` over `let`; avoid `var`.
- Every function under `app/` requires JSDoc (`@description`, `@param`, `@returns`).
- Use CommonJS `require` for modules (ESM reserved for `vulnerability-*.js`). Name files and functions in camelCase; classes use PascalCase.

## Testing Guidelines
- Co-locate tests beside their modules (e.g., `app/modules/example/__tests__/example.test.js`). Name suites after the route or service they cover.
- Always verify inside Docker: `docker-compose up -d`, then hit port 8989 for smoke checks.
- Ensure new coverage integrates with `npm run test:stagehand`; document gaps in PRs.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`). Reference Linear IDs when available.
- PRs must describe intent, list impacted endpoints or scripts, note config/database updates, and attach Docker verification steps or UI screenshots when applicable.
- Confirm Codacy status, lint/test command results, and documentation updates before requesting review.

## Security & Configuration Tips
- Clone `.env.example` to `.env`; never commit secrets. API keys now come from Keychain-backed wrappers—do not revert to plaintext env vars.
- Sanitize user input with existing utilities, reuse centralized rate limiting, and extend `app/config/middleware.js` for new integrations rather than bypassing shared guards.
