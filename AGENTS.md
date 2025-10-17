# Repository Guidelines

## Project Structure & Module Organization
- `app/public/server.js` boots the Express server and wires controllers, routes, and WebSocket services.
- Request handling lives in `app/controllers`, while `app/routes` maps URL paths to those controllers; keep new APIs modular by following this pattern.
- Data access and integrations (SQLite, Cisco, Palo Alto, logging) live in `app/services`; reuse these instead of duplicating direct calls.
- Frontend assets are split between `app/public` (production bundle) and `app/dev-docs-html` (generated documentation). Shared utilities sit under `app/utils`.
- Configuration JSON lives in `/config`; keep environment-specific secrets in `.env` only and never commit them.

## Build, Test, and Development Commands
```bash
npm install                # Install workspace dependencies
npm start                  # Launch the Express server in production mode
npm run dev                # Hot-reload server via nodemon
npm run init-db            # Seed the SQLite database with baseline data
npm run lint:all           # Run markdownlint, ESLint, and stylelint
npm run test:stagehand     # Execute Stagehand end-to-end scenarios (ensure tests/ exists)
./docker-start.sh          # Spin up the full Dockerized stack
```

## Coding Style & Naming Conventions
- JavaScript: 4-space indentation, double quotes, required semicolons (`@stylistic/quotes` and `@stylistic/semi`). Prefer `const`/`let`; `no-var` is enforced.
- Lint errors block CI; run `npm run eslint:fix` and `npm run stylelint:fix` before committing CSS or JS-heavy changes.
- Folder naming mirrors feature areas (e.g., `controllers`, `services`); add new modules under the closest existing category for discoverability.

## Testing Guidelines
- Place automated flows in `tests/` (e.g., `tests/stagehand-<feature>.js`) so `npm run test:stagehand` picks them up.
- Mirror route or feature names in test filenames and export scenarios via Stagehand to maintain parity with production usage.
- For major data-path changes, capture a sanitized SQLite snapshot in `backups/` for reproducible regression checks.

## Commit & Pull Request Guidelines
- Follow the existing convention: `type(HEX-###): concise summary` (e.g., `feat(HEX-260): add audit log filters`). Include the tracker ID when available.
- PRs should describe motivation, outline key changes, and list validation steps (`npm run lint:all`, `npm run test:stagehand`, manual smoke checks).
- Attach screenshots or GIFs for UI-affecting changes (`app/public` assets) and link any relevant docs updates in `/docs` or `app/dev-docs-html`.

## Security & Configuration Tips
- Generate a strong `SESSION_SECRET` (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) and store cert paths when enabling HTTPS (`USE_HTTPS=true` with `./scripts/setup-ssl.sh`).
- Never commit files from `/secrets`, `/certs`, `hextrackr.db`, or any `.env`; add new sensitive paths to `.gitignore` where necessary.
