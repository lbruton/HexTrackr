# AGENTS.md - HexTrackr Agent Guide

## HexTrackr Overview
HexTrackr is a vulnerability management system for tracking security vulnerabilities, tickets, and Known Exploited Vulnerabilities (KEV). The system uses a modular Node.js/Express backend with SQLite database and vanilla JavaScript frontend.

## Build/Lint/Test Commands

### Development
```bash
npm start          # Production server (port 8080)
npm run dev        # Development with nodemon (port 8080)
npm run init-db    # Initialize database schema
docker-compose up -d # Use Docker for testing (port 8989)
```

### Testing & Quality
```bash
npm run lint:all     # Run all linters (markdown, eslint, stylelint)
npm run fix:all      # Auto-fix all linting issues
npm run eslint       # Run ESLint on all JS files
npm run eslint:fix   # Auto-fix ESLint issues
npm run stylelint    # Run Stylelint on all CSS files
npm run stylelint:fix # Auto-fix CSS issues
npm run lint:md      # Run Markdownlint
npm run lint:md:fix  # Auto-fix markdown issues
npm test:stagehand   # Run single test file
```

### Documentation
```bash
npm run docs:dev     # Generate JSDoc documentation
npm run docs:all     # Generate all documentation (JSDoc + HTML)
npm run docs:generate # Update HTML documentation
```

## Code Style Requirements
- **Quotes**: Double quotes only (`"string"`)
- **Semicolons**: Always required
- **Imports**: `require()` for Node.js, ES6 imports for browser modules
- **Variables**: `const` > `let`, never `var`
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **JSDoc**: Required for ALL `/app/` functions (@description, @param, @returns, @throws)
- **Error Handling**: Try-catch blocks with specific error types
- **Formatting**: No unused variables (prefix with `_`), curly braces always
- **Browser Scripts**: Use `window` object for globals, modular pattern in `/scripts/shared/`
- **Services**: Functional exports for stateless operations
- **Controllers**: Use singleton pattern for consistency
- **Transactions**: Use pattern: `beginTransaction()` → operations → `commit()`/`rollback()`

## Constitutional Requirements
- ALL code MUST pass Codacy, ESLint 9+, Markdownlint, Stylelint
- Docker container REQUIRED for testing (port 8989) - never run HTTP/HTTPS locally
- JSDoc coverage mandatory for all `/app/` functions
- Documentation regenerated after every feature completion
- Development from 'copilot' branch, use Pull Requests for protected branches
- Playwright testing before/after UI changes

## Context Management & MCP Servers Available
- **Claude-Context MCP**: Codebase indexing and semantic search (verify index is current)
- **Memento MCP**: Project knowledge graph with entity/relation storage (semantic search preferred)
- **Context7 MCP**: Framework documentation verification and library lookup
- **Brave Search MCP**: Web search (general, local, news, video, image), AI summarization
- **Sequential Thinking MCP**: Multi-step problem solving with reflective analysis
- **Playwright Browser MCP**: Web automation, testing, and browser interactions
- **Task MCP**: Specialized agent delegation for complex multi-step operations

## Security Requirements
- API endpoints use rate limiting (configurable in `config/middleware.js`)
- Input validation on all user inputs via `validationService.js`
- SQL injection prevention via parameterized queries
- XSS prevention through DOMPurify sanitization
- CORS configuration for cross-origin requests
- Environment variables for sensitive configuration (`.env` file)
- Path traversal protection in `fileService.js`

## Performance Targets
- Response time: <2s for all API endpoints
- Import processing: ~1000 records/minute (standard), ~10,000 records/minute (staging)
- Database queries optimized with indexes on frequently filtered columns
- Compression enabled for all responses
- Static file caching configured
- Staging tables for atomic imports
- Pre-aggregated daily totals for dashboard performance
- Database uses WAL mode for concurrent access

## Environment Configuration
Required `.env` variables:
```
PORT=8080
NODE_ENV=development|production
DB_PATH=./app/public/data/hextrackr.db
```
See `.env.example` for complete configuration options.

## OpenCode Custom Commands (Slash Commands)
OpenCode **DOES** support custom slash commands similar to Claude Code. Custom commands are stored as Markdown files in:

- **Project commands**: `.opencode/commands/` (shared with team, version controlled)
- **User commands**: `~/.config/opencode/commands/` (personal, not shared)
- **Global commands**: `~/.opencode/commands/` (alternative location)

### Command Structure
Each `.md` file becomes a `/command-name` that can be invoked. Commands support:
- **Named arguments**: `$NAME`, `$ISSUE_NUMBER`, `$AUTHOR_NAME` (uppercase, underscores allowed)
- **File inclusion**: `@ filename` to include file contents in prompt
- **Bash execution**: `RUN command` to execute shell commands before prompt
- **Frontmatter**: YAML metadata for command configuration

### Example Command
```markdown
---
description: "Analyze code for performance issues"
allowed-tools: ["bash", "read", "edit"]
---
# Performance Analysis
Analyze this code for performance issues and suggest optimizations:
$ARGUMENTS

RUN npm test -- --coverage
@ package.json
```

### Usage
- Type `/` in OpenCode to see available commands
- Project commands show "(project)" in help listing
- Commands are automatically discovered and available across sessions