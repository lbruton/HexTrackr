# HexTrackr

Vulnerability management system for tracking security vulnerabilities, tickets, and Known Exploited Vulnerabilities (KEV). Modular Node.js/Express backend with SQLite database and vanilla JavaScript frontend.

## Tech Stack

- **Runtime**: Node.js 22.11.0 LTS
- **Backend**: Express.js, SQLite (better-sqlite3)
- **Frontend**: Vanilla JavaScript, AG-Grid Community, ApexCharts
- **Real-time**: Socket.io
- **Authentication**: Argon2id, express-session, CSRF protection
- **Security**: Helmet.js, rate limiting, CSP headers
- **Testing**: Docker nginx reverse proxy (localhost:80/443)
- **Linting**: ESLint 9+, Markdownlint, Stylelint
- **Documentation**: JSDoc

## Project Structure

```text
/Volumes/DATA/GitHub/HexTrackr/
├── app/                    # Main application
│   ├── public/             # Frontend assets
│   │   ├── js/             # Vanilla JavaScript modules
│   │   ├── css/            # Stylesheets
│   │   └── docs-source/    # Documentation (CHANGELOG, API docs)
│   ├── routes/             # Express route handlers
│   ├── services/           # Business logic layer
│   └── server.js           # Express server entry point
├── docs/                   # Modular documentation (see References below)
├── docker-compose.yml      # Development environment
├── CONSTITUTION.md         # Authoritative project requirements
├── TAXONOMY.md             # Memento knowledge graph schema
└── AGENTS.md               # This file (agents.md standard)
```

## Essential Commands

### Development

```bash
npm start          # Start production server (port 8080)
npm run dev        # Development server with nodemon
npm run init-db    # Initialize SQLite database schema (FRESH INSTALLS ONLY)
npm run migrate    # Apply database migrations (schema changes on existing DB)
```

### Testing & Quality

```bash
npm run lint:all     # Run all linters (markdown, eslint, stylelint)
npm run fix:all      # Auto-fix all linting issues
npm run eslint       # Run ESLint on JS files
npm run eslint:fix   # Auto-fix ESLint issues
```

### Docker (Development Environment)

```bash
docker-compose up -d    # Start nginx reverse proxy (localhost:80/443)
docker-compose logs -f  # Follow container logs
```

**⚠️ CRITICAL**: Always test via nginx reverse proxy (`https://localhost` or `https://dev.hextrackr.com`). Never use `http://localhost` (returns empty API responses).

## Code Style & Conventions

- **ES Modules**: Use `import/export` (not CommonJS)
- **JSDoc**: All functions MUST have complete JSDoc comments
- **Async/Await**: Prefer over callbacks and raw promises
- **Error Handling**: Service layer returns `{success, data, error}` objects
- **Security**: All user input validated, parameterized queries, CSRF protection
- **Testing**: Docker nginx reverse proxy required for all testing

## Database Schema Changes

**⚠️ CRITICAL: NEVER run `npm run init-db` on existing databases with data**

### The Safe Migration Pattern

1. **Create Migration File**: `app/public/scripts/migrations/XXX-description.sql`
   - Use incremental numbering (001, 002, 003...)
   - SQL-only files for schema changes
   - Test the migration on a backup first

2. **Apply Migration**: `npm run migrate`
   - Safely applies only new migrations
   - Never touches existing data
   - Tracks applied migrations in `schema_version` table

3. **Update init-database.js**: Include the change for future fresh installs
   - Ensures fresh installs have complete schema
   - Keeps init-database.js as single source of truth

4. **Test Fresh Install**: Verify `npm run init-db` still works on empty database

### Why This Matters

- `init-db` **DROPS ALL TABLES** and recreates from scratch
- **DATA LOSS** occurs if run on production or development databases
- Migrations are **ADDITIVE ONLY** - they never destroy data
- Hook system blocks accidental `init-db` execution

### Migration File Example

```sql
-- migrations/003-add-auth-tables.sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

## Development Workflow

**MANDATED PATTERN** (Required for all development work):

1. **Planning**: Create Linear issue (HEX-XX) with task breakdown
2. **Research** (if major feature): Launch specialized agents (the-brain, codebase-navigator, memento-oracle)
3. **Git Checkpoint**: `git commit -m "checkpoint: Before Task X.Y"`
4. **Implement**: One task at a time (NEVER batch tasks)
5. **Test**: Via Docker nginx reverse proxy (Chrome DevTools for UI)
6. **Update Linear**: Add comment with progress/results
7. **Update CHANGELOG**: `/app/public/docs-source/CHANGELOG.md`
8. **Create Memento Memory**: Save breakthrough patterns (if applicable)
9. **⏸️ PAUSE AND DISCUSS**: Wait for user approval before next task

**See** `/docs/WORKFLOWS.md` for complete workflow documentation.

## Git Workflow (Integration Branch Pattern)

**CRITICAL**: GitHub main is protected - use `dev` branch as working baseline.

```bash
# Daily work pattern
git checkout dev
git pull origin main              # Sync dev with GitHub main
# ... make changes, test, commit to dev ...
git push origin dev

# Create PR on GitHub: dev → main
# After PR merges: git pull origin main (to sync dev)
```

**See** `/docs/GIT_WORKFLOW.md` for complete git workflow documentation.

## Documentation Hierarchy

**CONSTITUTION.md**: Authoritative requirements and mandates (MUST follow - constitutional law)

**Linear DOCS-XX**: Shared knowledge accessible across all Claude instances

**Memento MCP**: Shared knowledge accessible across all Claude instances (refer to `/TAXONOMY.md`)

## Claude Instance Roles

HexTrackr uses three distinct Claude instances:

### 1. Claude Desktop (Project Management & Planning)

- High-level planning and architecture decisions
- Linear issue creation and task delegation
- Strategic workflow design

### 2. Claude-Dev (Primary Development) ← YOU ARE HERE

- Active feature development and coding
- Managing private GitHub repository
- Docker development environment (localhost:80/443)
- Testing and quality assurance

### 3. Claude-Prod (Production Management)

- Security fixes and hardening
- Production environment (192.168.1.80)
- Neo4j database administration (Memento backend)
- Clean public GitHub releases

**Communication**: All inter-instance communication flows through Linear issues and Memento memory.

## Linear Teams

- **HexTrackr-Dev** (HEX-XX): Development features, bug fixes (Claude-Dev primary focus)
- **HexTrackr-Prod** (HEXP-XX): Production deployment, security hardening
- **HexTrackr-Docs** (DOCS-XX): Shared project documentation
- **Prime Logs** (PRIME-XX): Session intelligence snapshots from `/prime` runs

## Quality Gates (CONSTITUTION.md Requirements)

- All code MUST pass Codacy quality checks
- All code MUST pass ESLint 9+ checks
- All markdown MUST pass Markdownlint
- All JavaScript functions MUST have complete JSDoc comments
- All testing via Docker nginx reverse proxy (localhost:80/443)
- Context7 verification REQUIRED for all framework code
- Chrome DevTools testing REQUIRED before/after UI changes

## Tool Usage Requirements

### ALWAYS Use (NOT Alternatives)

1. **Claude-Context MCP** for codebase lookups (NOT grep, NOT Read for searching)
2. **Memento MCP** for knowledge storage (follow `/TAXONOMY.md`)
3. **Chrome DevTools MCP** for UI testing (capture before/after screenshots)
4. **Context7** for framework verification (REQUIRED by CONSTITUTION.md)
5. **Linear MCP** as source of truth (NOT markdown planning files)

## Getting Started (New Session)

1. **Context Recovery**: Run `/prime` (full context) or `/quickprime` (fast recovery)
2. **Check Current Work**: Review Linear HEX-XX issues in "In Progress" status
3. **Understand Codebase**: Use `/search-code` or `mcp__claude-context__search_code`
4. **Launch Agents** (if needed):
   - `the-brain` - Expert research combining web + codebase
   - `codebase-navigator` - Architecture understanding
   - `memento-oracle` - Historical patterns and lessons learned
   - `linear-librarian` - Deep Linear issue research

## Testing Environments

- **Development**: `https://dev.hextrackr.com` (127.0.0.1 → Mac M4 local Docker)
- **Production**: `https://hextrackr.com` (192.168.1.80 → Ubuntu server)
- **Legacy Localhost**: `https://localhost` (same as dev)
- **SSL Bypass**: Type `thisisunsafe` on self-signed certificate warning

## Security Notes

- NEVER commit `.env` files or secrets
- All user input MUST be validated
- Use parameterized queries (no string concatenation)
- CSRF protection enabled on all state-changing endpoints
- Argon2id for password hashing (NOT bcrypt)
- Session secrets MUST be cryptographically random (32+ bytes)

## 📚 Documentation References

For detailed information, refer to these modular documentation files:

- **MCP Tools**: `/docs/MCP_TOOLS.md` - Complete MCP server reference
- **Agents**: `/docs/AGENTS_CATALOG.md` - Specialized agent descriptions
- **Workflows**: `/docs/WORKFLOWS.md` - Development workflow patterns
- **Slash Commands**: `/docs/SLASH_COMMANDS.md` - Command reference
- **Git Workflow**: `/docs/GIT_WORKFLOW.md` - Git and branch management
- **Constitution**: `/CONSTITUTION.md` - Authoritative project requirements
- **Taxonomy**: `/TAXONOMY.md` - Memento knowledge graph schema

---

**agents.md Standard**: This file follows the [agents.md](https://agents.md) open specification for AI coding agents.
