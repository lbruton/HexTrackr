# AGENTS.md

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

# RPI (Research → Plan → Implement) — Lightweight Workflow

**Tool**: The Linear MCP is the primary source of truth for the project planning. We use a 3 phase approach called RPI+, or (Research, Plan, Implement+Test)

**Templates**: Linear MCP does not support templates via API. When creating issues, you MUST read and apply the template content programmatically:
- **RESEARCH**: `/docs/TEMPLATE_RESEARCH.md`
- **PLAN**: `/docs/TEMPLATE_PLAN.md`
- **IMPLEMENT**: `/docs/TEMPLATE_IMPLEMENT.md`

**Goal**: Make every change safe, explainable, and repeatable across tools (Claude Code, Codex CLI, Gemini CLI) using structured Linear issues.

## Issue Creation Workflow

**CRITICAL**: Always read the appropriate template file and use its content as the issue description.

### Creating RESEARCH Issue (Parent):
1. Read `/docs/TEMPLATE_RESEARCH.md`
2. Replace placeholder values:
   - `HEX-XXX` → actual issue ID (after creation)
   - `<short name>` → descriptive name
   - `<your name>` → assignee
   - Date fields → current date
3. Create issue with:
   - Title: `RESEARCH: <short name>`
   - Description: Template content with frontmatter + all sections
   - Team: `HexTrackr-Dev`

### Creating PLAN Issue (Child of Research):
1. Read `/docs/TEMPLATE_PLAN.md`
2. Replace placeholder values:
   - `HEX-YYY` → new issue ID
   - `HEX-XXX` → parent research issue ID
   - `<same short name>` → same as research
3. Create issue with:
   - Title: `PLAN: <same short name>`
   - Description: Template content
   - Team: `HexTrackr-Dev`
   - ParentId: Research issue ID

### Creating IMPLEMENT Issue (Child of Plan):
1. Read `/docs/TEMPLATE_IMPLEMENT.md`
2. Replace placeholder values:
   - `HEX-ZZZ` → new issue ID
   - `HEX-YYY` → parent plan issue ID
   - Branch name, dates, etc.
3. Create issue with:
   - Title: `IMPLEMENT: <same short name>`
   - Description: Template content
   - Team: `HexTrackr-Dev`
   - ParentId: Plan issue ID

## Issue Structure (Linear)
- **Parent**: `RESEARCH: <short name>` → e.g. `HEX-123`
- **Children**: 
  - `PLAN: <same short name>` (child of research) → e.g. `HEX-124`
  - `IMPLEMENT: <same short name>` (child of plan) → e.g. `HEX-125`

*Note: The Linear MCP auto-assigns HEX-XXX numbers to each issue*

## Guardrails
1. **Never edit code before a git checkpoint** (clean worktree; commit with a snapshot message).
2. **Research Readiness Gate must be ✅** before creating/starting the Plan.
3. **Plan Preflight must be ✅** before starting Implement.
4. Commit every **1–5 tasks** (as defined in Plan) with clear messages and references to task IDs.
5. If anything feels ambiguous: **pause, ask, and revise the doc** (don’t guess).

## Tooling Hints
- **Linear MCP**: sync status/links; read template files from `/docs/TEMPLATE_*.md` and apply programmatically; keep titles prefixed (`RESEARCH:`, `PLAN:`, `IMPLEMENT:`).
- **Memento MCP (Neo4j)**: pull past related work, decisions, and code notes for context.
- **Claude-Context**: enumerate impacted files, surfaces, and public APIs.
- **Context7**: snapshot current framework/library standards relevant to this change.

---

**Definition of Done (DoD) for a change**
- Research: Readiness Gate ✅ with risks, rollback, test/validation notes.
- Plan: Step-by-step tasks (1–2h chunks), explicit before/after code blocks, validation & backout.
- Implement: All plan tasks checked ✅, tests pass, PR checklist completed, Linear issues updated.

**See `/docs/RPI_PROCESS.md` for complete RPI workflow.**

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
