# HexTrackr Agent Instructions

## Build/Test Commands
```bash
npm start           # Production server (port 8080)
npm run dev         # Dev server with nodemon (port 8080)
npm run init-db     # Initialize SQLite database
npm run lint:all    # Run all linters (ESLint, Stylelint, Markdownlint)
npm run fix:all     # Auto-fix all linting issues
npm run docs:all    # Generate JSDoc + HTML documentation
docker-compose up -d # REQUIRED: Test via Docker on port 8989
```

## Code Style
- **Quotes**: Double quotes for strings `"string"`
- **Semicolons**: Always use semicolons
- **Braces**: All blocks require braces `if (x) { ... }`
- **Equality**: Strict equality `===` not `==`
- **Variables**: `const` preferred, `let` when needed, never `var`
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **JSDoc**: REQUIRED for all functions in `/app/` with @description, @param, @returns
- **Imports**: CommonJS (`require`) for Node.js, ES6 modules for vulnerability-*.js files
- **Error Handling**: Try-catch with specific error messages, log errors to console
- **Unused Vars**: Prefix with underscore `_unusedVar` to ignore linting
- **Testing**: ALWAYS test in Docker (port 8989), NEVER run HTTP/HTTPS locally

## Quality Requirements
- Must pass Codacy quality checks (run after every file edit)
- Must pass ESLint 9+ configuration
- Must pass Markdownlint and Stylelint
- Use Claude-Context MCP for codebase searching
- Use Memento MCP for project knowledge graph
- Track all work in Linear (no markdown planning files)