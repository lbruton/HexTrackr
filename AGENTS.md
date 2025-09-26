# Repository Guidelines

This guide summarizes the expectations for contributors working on HexTrackr. Read alongside `README.md`, `CLAUDE.md`, and the Linear templates to capture the full delivery checklist.

## Project Structure & Module Organization
- `app/` holds the Express server: controllers orchestrate business logic, routes expose REST endpoints, services wrap SQLite access, middleware centralizes cross-cutting concerns, and `public/` serves the client bundle plus scripts.
- `app/config/` and `app/utils/` contain reusable configuration helpers; prefer extending existing modules before adding new directories.
- Root-level `data/` stores seed CSVs and backup assets, while `logs/` captures runtime output generated inside containers. Docker assets (`docker-compose.yml`, `Dockerfile.node`, `nginx.conf`) power the standard dev stack.

## Build, Test, and Development Commands
Use Node 18+ with npm. Key commands:
- `npm run dev` starts the hot-reloading server on port 8080; pair it with `docker-compose up -d` to mirror the production topology on 8989.
- `npm start` runs the production build, while `npm run init-db` seeds or refreshes the SQLite database.
- `npm run lint:all`, `npm run fix:all`, and `npm run docs:all` are mandatory before opening a PR; extend lint fixes locally until Codacy reports clean.

## Coding Style & Naming Conventions
Follow the repository ESLint and Stylelint rulesets: four-space indentation, double-quoted strings, mandatory semicolons, and strict equality. Prefer `const` over `let`, avoid `var`, and name files/functions in camelCase, with PascalCase reserved for classes. Every function under `app/` requires JSDoc (`@description`, `@param`, `@returns`). Use CommonJS `require` except for the `vulnerability-*.js` ES module utilities.

## Testing Guidelines
Always verify inside Docker: `docker-compose up -d` then run smoke checks against port 8989. Execute `npm run lint:all` and `npm run test:stagehand` for automated validation. When introducing new coverage, co-locate tests beside the module (e.g., `app/modules/example/__tests__/example.test.js`) and name suites after the route or service they exercise.

## Commit & Pull Request Guidelines
Commit messages follow Conventional Commits (`fix:`, `chore:`, `feat:`). Reference Linear issue IDs when available and keep changes focused. Pull requests must describe intent, list impacted endpoints or scripts, note database or config updates, and attach Docker verification steps or screenshots for UI-facing changes. Confirm Codacy status, lint results, and updated documentation before requesting review.

## Security & Configuration Tips
Copy `.env.example` to `.env` and never commit secrets. Sanitize user input with the provided utilities, reuse centralized rate limiting, and log errors through existing middleware. For new integrations, update `app/config/middleware.js` rather than bypassing shared guards.
