# HexTrackr

Vulnerability management system for tracking security vulnerabilities, tickets, and Known Exploited Vulnerabilities (KEV). Modular Node.js/Express backend with SQLite database and vanilla JavaScript frontend.


# MCP Tools Reference

## Core MCP Servers

### memento (Knowledge Graph)

**Purpose**: Persistent project memory, cross-instance knowledge sharing
**Backend**: Neo4j Enterprise 5.13 at 192.168.1.80
**Taxonomy**: Linear DOCS-14 or `/TAXONOMY.md`
**Shared**: All Claude instances use same graph

**Key Tools**:

- `create_entities` - Create knowledge nodes
- `create_relations` - Link entities with relationships
- `add_observations` - Add facts to entities
- `search_nodes` - Keyword search
- `semantic_search` - Natural language search (preferred)
- `open_nodes` - Retrieve specific entities by name
- `read_graph` - Get entire graph structure

**Common Patterns**:

```javascript
// Find authentication patterns
mcp__memento__semantic_search({
  query: "authentication session middleware Argon2id",
  entity_types: ["HEXTRACKR:INTELLIGENCE:PRIME-CODEBASE"],
  min_similarity: 0.6
})

// Open specific prime intelligence
mcp__memento__open_nodes({
  names: ["Prime-Codebase-HEXTRACKR-2025-10-04-12-42-00"]
})
```

---

### claude-context (Codebase Search)

**Purpose**: Semantic code search across indexed files
**Index**: Re-indexes at session start if >1 hour old

**Key Tools**:

- `index_codebase` - Create/update semantic index
- `search_code` - Natural language code search
- `get_indexing_status` - Check index status
- `clear_index` - Remove index

**Usage**:

```javascript
// Find Express middleware patterns
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "express session middleware configuration",
  limit: 10
})
```

**Note**: Get current project info (file counts, architecture) via `/prime` or `/quickprime`, not from static documentation.

---

### linear-server (Issue Tracking)

**Purpose**: Task tracking, planning, progress updates, shared documentation
**Teams**: HexTrackr-Dev (HEX-XX), HexTrackr-Prod (HEXP-XX), HexTrackr-Docs (DOCS-XX), Prime Logs (PRIME-XX)

**Key Tools**:

- `list_issues` - Query issues with filters
- `get_issue` - Retrieve issue details
- `create_issue` - Create new issue
- `update_issue` - Modify existing issue
- `create_comment` - Add comment to issue
- `list_comments` - Get issue comments
- `list_teams` - Get all teams
- `get_team` - Team details

**Pattern**: Issues are source of truth, not markdown files

---

### context7 (Library Documentation)

**Purpose**: Up-to-date framework and library documentation
**Mandatory**: CONSTITUTION.md Article II Section II requires Context7 verification for all framework code

**Two-Step Process**:

```javascript
// Step 1: Resolve library ID
mcp__context7__resolve-library-id({ libraryName: "express" })
→ Returns: /expressjs/express

// Step 2: Get documentation
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/expressjs/express",
  topic: "middleware",
  tokens: 5000
})
```

**When to Use**:

- Before implementing features with Express, AG-Grid, ApexCharts, Socket.io
- Verifying API patterns and best practices
- Debugging framework-specific issues
- Before upgrading dependencies

**Trust Scores**: Prioritize libraries with scores 7-10 for production use

---

### chrome-devtools (Browser Testing)

**Purpose**: Browser automation, UI testing, performance profiling
**Mandatory**: CONSTITUTION.md Article II Section V requires testing before and after UI changes

**Testing Environments**:

- ✅ **Development**: `https://dev.hextrackr.com` (127.0.0.1 → Mac M4 local Docker)
- ✅ **Production**: `https://hextrackr.com` (192.168.1.80 → Ubuntu server)
- ✅ **Legacy Localhost**: `https://localhost` (also works, points to same dev Docker)
- ❌ **NEVER use HTTP**: `http://localhost` returns empty API responses
- 🔒 **SSL Bypass**: Type `thisisunsafe` on self-signed certificate warning

**UI Development Workflow**:

1. **Open Production Tab**: `navigate_page("https://hextrackr.com/vulnerabilities.html")`
   - See current production state (reference for UI consistency)
   - Capture "before" screenshots for documentation
2. **Open Development Tab**: `new_page("https://dev.hextrackr.com/vulnerabilities.html")`
   - Test your changes in dev environment
   - Capture "after" screenshots for documentation
3. **Side-by-Side Comparison**: Switch between tabs using `select_page(0)` and `select_page(1)`
   - Visual regression testing
   - Verify UI consistency between dev and prod
   - Document changes with before/after screenshots

**Key Tool Categories**:

- **Page Management**: `list_pages`, `new_page`, `navigate_page`, `select_page`
- **Interaction**: `click`, `fill`, `hover`, `drag`, `upload_file`
- **Inspection**: `take_snapshot`, `take_screenshot`, `list_console_messages`
- **Network**: `list_network_requests`, `get_network_request`
- **Performance**: `performance_start_trace`, `performance_stop_trace`

**Common Patterns**:

```javascript
// UI Change Documentation Pattern
// 1. Capture production state (before)
navigate_page("https://hextrackr.com/vulnerabilities.html")
Bash: sleep 3  // Wait for data load
take_screenshot({
  fullPage: true,
  filePath: "/path/to/screenshots/prod-before.png"
})

// 2. Capture development state (after)
new_page("https://dev.hextrackr.com/vulnerabilities.html")
Bash: sleep 3  // Wait for data load
take_screenshot({
  fullPage: true,
  filePath: "/path/to/screenshots/dev-after.png"
})

// 3. Compare side-by-side for regression testing
```

---

### brave-search (Web Research)

**Purpose**: Web, news, video, image, local search + AI summarization

**Key Tools**:

- `brave_web_search` - General web search
- `brave_news_search` - Recent news articles
- `brave_video_search` - Video content
- `brave_image_search` - Image search
- `brave_local_search` - Location-based businesses/places
- `brave_summarizer` - AI-generated summaries

**Usage**: Primarily accessed through `the-brain` agent for integrated research

---

### sequential-thinking

**Purpose**: Multi-step problem analysis with structured reasoning

**Tool**: `sequentialthinking` - Break down complex problems into thought steps

**Usage**: Accessed via `/think` command or `the-brain` agent




# Specialized Agents Catalog

## When to Use Agents vs Direct Tools

**Key Principle**: Agents burn 10-50k tokens internally, return 800-1.5k compressed. Use them for research, not simple lookups.

**Decision Tree**:

```text
Need expert research combining web + codebase? → the-brain
Need architecture understanding? → codebase-navigator
Need historical context? → memento-oracle
Need Linear deep dive? → linear-librarian
Need config file changes? → config-guardian
Need documentation audit? → docs-guardian
Need complex feature implementation? → hextrackr-fullstack-dev
Need Docker container restart? → docker-restart
Need UI testing/screenshots? → chrome-devtools MCP tools (direct)
Know exact file to read? → Read tool (direct)
Know exact search term? → Grep tool (direct)
Need quick Linear lookup? → mcp__linear-server__get_issue (direct)
```

---

## Agent Catalog

### the-brain

**Model**: Opus (maximum intelligence)
**Purpose**: Expert web research + codebase analysis + framework documentation verification
**Token Cost**: 30-50k internal → 1-2k compressed output

**4-Phase Research Methodology**:

1. **Context** - Sequential thinking to structure research plan
2. **Internal** - Claude-Context to analyze current codebase
3. **External** - Brave Search + Context7 for best practices and docs
4. **Synthesis** - Combine findings with Memento persistence

**When to Use**:

- Research implementation patterns or best practices
- Encountering errors requiring external solution research
- Verify framework/library compatibility
- Performance optimization research
- Security vulnerability analysis

**Returns**:

- Comprehensive intelligence report with executive summary
- Project-aware recommendations specific to architecture
- Integration strategies considering existing patterns
- Source citations (Brave Search, Context7, Claude-Context)
- Confidence levels
- Permanent research archive saved to Memento

---

### codebase-navigator

**Purpose**: Architecture analysis and code discovery
**Token Cost**: 10-20k internal → 800-1.2k compressed output

**When to Use**:

- Before refactoring (map dependencies)
- Before database migrations (find schema references)
- Architecture analysis (understand module structure)
- Integration planning (find connection points)
- File discovery (locate implementations)

**Returns**:

- File:line references for navigation
- Integration points (middleware, routes, services)
- Recent git changes with context
- Architecture overview with actual code structure

---

### memento-oracle

**Purpose**: Historical context and pattern discovery from knowledge graph
**Token Cost**: 10-15k internal → 800-1k compressed output

**When to Use**:

- Before architecture decisions (what have we learned?)
- Debugging recurring issues (has this happened before?)
- Pattern discovery (how did we solve similar problems?)
- Cross-instance coordination (what did Claude-Prod discover?)
- Performance optimization (what patterns worked?)

**Returns**:

- Past breakthroughs with entity IDs
- Anti-patterns and lessons learned
- Historical decisions with Linear references
- Cross-instance handoff context

---

### linear-librarian

**Purpose**: Deep Linear issue research and cross-team coordination
**Token Cost**: 15-20k internal → 1-1.5k compressed output

**When to Use**:

- Complex issue relationships (dependencies, blockers)
- Cross-team coordination (Dev/Prod handoffs)
- Planning context (what's in pipeline?)
- Sprint/cycle analysis (current workload)
- Issue history (complete context with comments)

**Returns**:

- Compressed activity summaries
- Issue details with all comments
- Cross-team dependencies
- Current cycle/sprint status
- Blocker analysis

---

### config-guardian

**Purpose**: Configuration file management with Linear tracking
**Token Cost**: 8-12k internal → 800-1k compressed output

**When to Use**:

- Before modifying linting/quality config files
- Adding new linting rules or configs
- Debugging "why is this warning appearing?"
- Project setup or config consolidation
- Monthly config drift audits
- Discovering config files without Linear docs

**Returns**:

- Linear DOCS-XX issue tracking for each config
- Timestamped comments documenting changes
- Configuration audit reports with drift detection
- Proper documentation preventing future confusion

---

### docs-guardian

**Purpose**: Documentation accuracy auditing
**Token Cost**: 10-15k internal → 1-1.5k compressed output

**When to Use**:

- After significant feature additions or refactoring
- Periodically (weekly/monthly) to detect drift
- Before major releases (ensure docs current)
- When users report documentation inconsistencies
- Identify missing documentation for new features
- Find orphaned documentation for deprecated features

**Returns**:

- Documentation accuracy audit report
- Linear DOCS issues for discrepancies
- Missing documentation identified
- Orphaned documentation flagged
- Prioritized recommendations for updates

---

### hextrackr-fullstack-dev

**Purpose**: Complex feature implementation across all layers
**Token Cost**: 20-40k internal → 1-2k compressed output

**When to Use**:

- Implementing complex features requiring deep architecture understanding
- Refactoring code across multiple files/layers
- Building new UI components with AG-Grid or Apex Charts
- Creating new API endpoints with service layer integration
- Transitioning from planning to implementation
- Long-form coding tasks requiring 30+ minutes

**Returns**:

- Complete feature implementation (routes, services, frontend)
- Code following HexTrackr patterns and conventions
- Proper error handling and validation
- JSDoc documentation for all functions
- Testing recommendations

---

### docker-restart

**Model**: Haiku (lightweight, cost-efficient)
**Purpose**: Docker container restart management
**Token Cost**: 2-5k internal → 300-500 compressed output

**When to Use**:

- After modifying JavaScript files requiring server restart
- After updating environment variables in `.env`
- After installing new npm dependencies
- After configuration changes requiring restart
- When development container becomes unresponsive

**Proactive Usage**: Invoke automatically after:

- Server-side JavaScript modifications
- Environment variable changes
- Dependency installations (npm install)
- Configuration file updates requiring restart

**Returns**:

- Container stop/restart confirmation
- Health check verification (nginx accessible)
- Startup log analysis for errors
- Ready-to-test confirmation

---

## Prime Intelligence Entities

When `/prime` runs, 4 specialized agents save FULL research to Memento:

**Entity Types Created**:

- `Prime-Linear-[PROJECT]-[Timestamp]` → Linear activity intelligence
- `Prime-Memento-[PROJECT]-[Timestamp]` → Historical patterns & breakthroughs
- `Prime-Codebase-[PROJECT]-[Timestamp]` → Architecture & integration points
- `Prime-Technical-[PROJECT]-[Timestamp]` → Technical baseline & environment

**Classification**: `PROJECT:INTELLIGENCE:PRIME-[TYPE]`

**Tags**: `project:[name]`, `prime-intelligence`, `agent:[type]`, `week-[num]-[year]`, `session:prime-[date]`

**Access**:

```javascript
// Query today's prime session
mcp__memento__search_nodes({ query: "TAG: session:prime-2025-10-04" })

// Semantic search
mcp__memento__semantic_search({
  query: "authentication implementation patterns",
  entity_types: ["HEXTRACKR:INTELLIGENCE:PRIME-CODEBASE"]
})
```


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
- **Git Workflow**: `/docs/GIT_WORKFLOW.md` - Git and branch management
- **Constitution**: `/CONSTITUTION.md` - Authoritative project requirements
- **Taxonomy**: `/TAXONOMY.md` - Memento knowledge graph schema

---

**agents.md Standard**: This file follows the [agents.md](https://agents.md) open specification for AI coding agents.
