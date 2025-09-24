# AGENTS.md - HexTrackr Quick Guide
## Build, Lint & Test
- `npm start`: Production server on 8080.
- `npm run dev`: Nodemon dev loop.
- `npm run init-db`: Initialize schema.
- `npm run lint:all`: Markdown, ESLint, Stylelint.
- `npm run eslint` / `npm run stylelint`: Target linters.
- `npm run lint:md`: Markdownlint only.
- `npm test:stagehand`: Run a single Stagehand test file.
- `docker-compose up -d`: Integration sandbox on 8989.
## Code Style Expectations
- Double quotes, required semicolons, formatter rules via ESLint.
- Prefer `const`, allow `let`, ban `var`.
- CommonJS `require` on backend; ES modules in browser scripts.
- CamelCase functions/vars, PascalCase classes, SCREAMING_CASE constants.
- JSDoc (`@description`, `@param`, `@returns`, `@throws`) for every `/app/` function.
- Wrap risky logic in try/catch, rethrow typed errors, never swallow.
- Enforce parameterized SQL, DOMPurify sanitization, validation service checks.
- Controllers singleton, services stateless, transactions `begin`→`commit`/`rollback`; regenerate docs post-feature and keep Codacy/linters green.
- Respect existing security middleware and never bypass validation hooks.