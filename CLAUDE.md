# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HexTrackr is a vulnerability management system for tracking security vulnerabilities, tickets, and Known Exploited Vulnerabilities (KEV). Built with Node.js/Express backend, SQLite database, and vanilla JavaScript frontend with AG-Grid and ApexCharts.

**Tech Stack**: Node.js 22.11.0 LTS, Express.js, better-sqlite3, Socket.io, Argon2id authentication, Helmet.js security, vanilla JavaScript, AG-Grid Community, ApexCharts

## Architecture

```text
app/
├── public/              # Frontend assets (HTML, CSS, JS modules)
│   └── scripts/         # Database initialization and utilities
├── config/              # Server configuration modules
├── middleware/          # Express middleware (auth, CSRF)
├── controllers/         # Request handlers (singleton pattern with initialize())
├── services/            # Business logic layer (returns {success, data, error})
└── routes/              # Express route definitions
```

**Key Patterns**:
- **Module System**: CommonJS (`require`/`module.exports`) throughout backend
- **Controllers**: Singleton pattern with `initialize(db, progressTracker)` method
- **Services**: Business logic returns `{success, data, error}` objects
- **Error Handling**: Service layer handles errors, controllers propagate to Express
- **Database**: better-sqlite3 synchronous API

## Essential Commands

```bash
# Development
npm start                # Production server (port 8080)
npm run dev              # Development with nodemon hot-reload

# Database (CRITICAL: init-db DESTROYS ALL DATA)
npm run init-db          # Initialize schema (FRESH INSTALLS ONLY - DESTRUCTIVE)

# Quality & Linting
npm run lint:all         # Run all linters (markdown, eslint, stylelint)
npm run fix:all          # Auto-fix all linting issues
npm run eslint           # ESLint only
npm run eslint:fix       # Auto-fix ESLint issues

# Documentation
npm run docs:dev         # Generate JSDoc documentation
npm run docs:generate    # Update HTML content from markdown
npm run docs:all         # Full documentation build

# Docker (Required for Testing)
docker-compose up -d     # Start nginx reverse proxy + app
docker-compose logs -f   # Follow container logs
docker-compose restart   # Restart after code changes
```

## Testing URLs

**CRITICAL**: Always test via HTTPS through nginx reverse proxy. HTTP endpoints return empty API responses.

- ✅ **Development**: `https://dev.hextrackr.com` (127.0.0.1 → Docker on Mac M4)
- ✅ **Production**: `https://hextrackr.com` (192.168.1.80 → Ubuntu server)
- ✅ **Legacy**: `https://localhost` (also valid for dev)
- ❌ **NEVER**: `http://localhost` (broken - returns empty responses)
- 🔒 **SSL Bypass**: Type `thisisunsafe` on certificate warning page

## Database Schema Changes

**⚠️ CRITICAL**: `npm run init-db` DROPS ALL TABLES and DESTROYS DATA. Git hooks block this to prevent accidents.

**Migration Process** (when schema changes are needed):

1. **Create SQL Migration File**: `app/public/scripts/migrations/XXX-description.sql`
   - Use incremental numbering (001, 002, 003...)
   - Pure SQL only (DDL statements)
   - Test on database backup first

2. **Apply Migration Manually**:
   ```bash
   sqlite3 app/data/hextrackr.db < app/public/scripts/migrations/XXX-description.sql
   ```

3. **Update init-database.js**: Add schema change to `app/public/scripts/init-database.js`
   - Keeps fresh installs in sync with migrations
   - Single source of truth for complete schema

**Why This Matters**: `init-db` destroys ALL data. Migrations are additive and preserve existing data.

## Code Style

- **JSDoc Required**: All functions must have complete JSDoc comments
- **Async/Await**: Preferred over callbacks or raw promises
- **Security**: All user input validated, parameterized SQL queries, CSRF protection enabled
- **Error Messages**: Descriptive error objects with context for debugging

## Development Workflow

**MANDATED PATTERN** - Required for all development work:

1. **Planning**: Create Linear issue (HEX-XX) with task breakdown
2. **Research** (major features): Use `the-brain`, `codebase-navigator`, `memento-oracle` agents
3. **Git Checkpoint**: `git commit -m "checkpoint: Before Task X.Y"`
4. **Implement**: ONE task at a time (never batch tasks)
5. **Test**: Via Docker nginx reverse proxy (`https://localhost`)
6. **Update Linear**: Add comment with progress/results
7. **Update CHANGELOG**: `/app/public/docs-source/CHANGELOG.md`
8. **Create Memento Memory**: Save breakthrough patterns (if applicable)
9. **⏸️ PAUSE**: Wait for user approval before next task

**See `/docs/WORKFLOWS.md` for complete workflow documentation.**

## Git Workflow

**CRITICAL**: GitHub `main` branch is protected. Use `dev` branch as working baseline.

```bash
# Daily pattern
git checkout dev
git pull origin main              # Sync dev with GitHub main
# ... make changes, test, commit to dev ...
git push origin dev

# Create PR on GitHub: dev → main
# After PR merge: git pull origin main (sync dev)
```

**See `/docs/GIT_WORKFLOW.md` for complete git workflow.**

## Server Configuration

**Trust Proxy**: ALWAYS enabled (`app.set("trust proxy", true)`)
- Required for nginx reverse proxy to pass HTTPS headers
- Enables secure cookies with `X-Forwarded-Proto` detection
- Critical for authentication system (HEX-128 fix)

**Session Management**:
- `SESSION_SECRET` environment variable required (32+ characters)
- Server refuses to start without valid SESSION_SECRET
- Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Testing Notes

- **Chrome DevTools MCP**: Not enabled by default - ask user to load config if needed
- **UI Testing Workflow**:
  1. Open production tab: `https://hextrackr.com/page.html`
  2. Open development tab: `https://dev.hextrackr.com/page.html`
  3. Compare side-by-side for visual regression testing
  4. Capture screenshots for documentation

## MCP Tools Available

- **memento**: Knowledge graph (Neo4j at 192.168.1.80) for persistent memory
- **claude-context**: Semantic codebase search (re-indexes if >1 hour old)
- **linear-server**: Issue tracking (HexTrackr-Dev, HexTrackr-Prod, HexTrackr-Docs teams)
- **context7**: Framework documentation (MANDATORY for Express, AG-Grid, ApexCharts)
- **brave-search**: Web research via `the-brain` agent
- **sequential-thinking**: Multi-step problem analysis

**See user's global CLAUDE.md for detailed MCP tool usage patterns.**

## Specialized Agents

- **the-brain**: Web research + codebase analysis + framework verification (Opus)
- **codebase-navigator**: Architecture analysis and code discovery
- **memento-oracle**: Historical context from knowledge graph
- **hextrackr-fullstack-dev**: Feature implementation across all layers
- **docker-restart**: Container restart automation (Haiku)

**See user's global CLAUDE.md for detailed agent invocation patterns.**
