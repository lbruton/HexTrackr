# Repository Guidelines

## Project Structure & Module Organization
HexTrackr follows a service-oriented Node.js layout under `app/`. Key folders include `controllers/` (singleton HTTP handlers), `services/` (business logic returning `{success, data, error}`), `routes/` (Express wiring), and `middleware/` (auth and CSRF guards). Client assets live in `public/` with AG-Grid and ApexCharts scripts in `public/scripts/`. SQLite schema helpers and migrations reside in `public/scripts/migrations/`, while configuration modules are in `config/`. All backend code uses CommonJS modules.

## Build, Test, and Development Commands
Use `npm run dev` for a hot-reload development server and `npm start` to mirror production defaults on port 8080. Initialize a fresh database only with `npm run init-db` (destructive). Quality gates are `npm run lint:all`, or run targeted checks via `npm run eslint` and `npm run eslint:fix`. Documentation builds are available through `npm run docs:dev` and `npm run docs:all`. For end-to-end verification, spin up nginx + app with `docker-compose up -d`.

## Coding Style & Naming Conventions
Prefer async/await, parameterized SQL, and Argon2id for credential flows. Every function requires complete JSDoc. Follow existing indentation (two spaces) and keep comments focused on intent. File names use kebab-case for scripts (`init-database.js`) and PascalCase for controllers. Maintain the `{success, data, error}` contract when adding service methods.

## Testing Guidelines
Run lint suites before pushing. Database migrations must be idempotent and paired with updates to `public/scripts/init-database.js`. When testing the UI, compare `https://dev.hextrackr.com` with production `https://hextrackr.com`; avoid plain HTTP endpoints. Docker-based smoke tests should pass without manual intervention.

## Commit & Pull Request Guidelines
Work from a git-clean `dev` branch: `git checkout dev && git pull origin main` before changes. Craft commits every 1–5 plan tasks with descriptive messages referencing Linear ticket IDs. Pull requests target `main`, include RPI status (Research → Plan → Implement), validation details, and screenshots for UI shifts. Confirm linters/tests in the PR description and note any rollback steps.

## Security & Configuration Tips
Always keep `app.set("trust proxy", true)` and supply a ≥32 character `SESSION_SECRET`. Generate secrets with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Interact with the API only via HTTPS; bypass self-signed warnings by typing `thisisunsafe` in Chrome when prompted.
