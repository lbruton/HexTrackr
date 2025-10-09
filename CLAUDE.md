# CLAUDE.md - Operational Memory

**Purpose**: This file is YOUR operational memory. It contains critical patterns, workflows, and checks to function efficiently. Not a reference manual for the user.

## Project Identity

**HexTrackr**: Vulnerability management system (Node.js/Express, SQLite, vanilla JS, AG-Grid, ApexCharts)

**Tech Stack**: Node.js 22.11.0 LTS, Express.js, better-sqlite3, Socket.io, Argon2id auth, Helmet.js, vanilla JavaScript, AG-Grid Community, ApexCharts

**Current Version**: v1.0.56 (automated via `npm run release`)

## File System Layout

```text
/Volumes/DATA/GitHub/HexTrackr/
├── app/
│   ├── public/
│   │   ├── *.html                    # Frontend pages
│   │   ├── scripts/
│   │   │   ├── init-database.js      # Schema (DESTRUCTIVE - git hooks block)
│   │   │   ├── migrations/           # SQL migrations (incremental)
│   │   │   ├── pages/                # Page-specific modules
│   │   │   └── shared/               # Shared utilities
│   │   ├── docs-html/                # Generated documentation
│   │   │   ├── html-content-updater.js  # Version automation + docs generator
│   │   │   └── content/              # Generated HTML
│   │   └── docs-source/              # Markdown sources
│   │       ├── changelog/versions/   # Version changelog files
│   │       └── guides/               # User guides
│   ├── config/                       # Server configuration
│   ├── middleware/                   # Express middleware (auth, CSRF)
│   ├── controllers/                  # Request handlers (singleton + initialize())
│   ├── services/                     # Business logic ({success, data, error})
│   └── routes/                       # Express route definitions
├── docs/
│   ├── TEMPLATE_RESEARCH.md          # RPI Research template
│   ├── TEMPLATE_PLAN.md              # RPI Plan template
│   ├── TEMPLATE_IMPLEMENT.md         # RPI Implement template
│   ├── RPI_PROCESS.md                # Complete RPI workflow
│   └── GIT_WORKFLOW.md               # Git branching strategy
├── CLAUDE.md                         # This file (operational memory)
├── package.json                      # Version source of truth
└── docker-compose.yml                # Docker deployment config
```

## Mandatory Startup Checks

**CRITICAL**: Before any code work, ALWAYS verify:

### 1. Claude-Context Index Status

```javascript
// Check if codebase is indexed
mcp__claude-context__get_indexing_status({
  path: "/Volumes/DATA/GitHub/HexTrackr"
})

// If unindexed or >1 hour old, re-index
mcp__claude-context__index_codebase({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  splitter: "ast",  // Syntax-aware with auto-fallback
  force: false      // Set true only if user confirms
})
```

**Why**: Semantic code search is MANDATORY for RPI workflow verification. Stale indexes lead to incorrect line numbers and architectural misidentification.

### 2. Git Status Check

```bash
git status  # Clean worktree before starting
git pull origin main  # Sync dev branch
```

### 3. Testing Environment URLs

- ✅ **Dev**: `https://dev.hextrackr.com` (Mac M4 Docker :8989)
- ✅ **Prod**: `https://hextrackr.com` (Ubuntu 192.168.1.80 :8443)
- ✅ **Legacy**: `https://localhost` (same as dev)
- ❌ **NEVER**: `http://localhost` (empty API responses)
- 🔒 **SSL Bypass**: Type `thisisunsafe` on cert warning

## SlashCommand Abstractions

**Purpose**: Efficient workflow shortcuts that wrap MCP tools with consistent parameters.

**CRITICAL Token Efficiency Pattern**:
- **Lightweight commands**: Run directly (small token cost)
- **Heavy commands**: Run via `general-purpose` Task tool (isolates token consumption)

### Lightweight Commands (Run Directly)

**`/status-code`** - Check claude-context indexing status
```bash
/status-code
# Cost: ~200 tokens | Returns: Index status, progress %, timestamp
```

**`/load-git`** - Get current git context
```bash
/load-git
# Cost: ~500 tokens | Returns: Time, last 3 commits, status, branch
```

**`/search-code [query]`** - Semantic codebase search
```bash
/search-code authentication middleware patterns
# Cost: ~2-5K tokens | Returns: Top 10 snippets with file:line references
```

**`/sec-scan`** - Security vulnerability scan
```bash
/sec-scan
# Cost: ~5-10K tokens | Uses: hextrackr-fullstack-dev agent
# Returns: Comprehensive security audit with severity ratings
```

### Heavy Commands (Use via Task Tool)

**Token Isolation Pattern**:
```javascript
// Instead of running /command directly, wrap in Task:
Task({
  subagent_type: "general-purpose",
  prompt: "/command-name [args]"
})
// Agent does heavy lifting, returns only final report
// Saves 15-30K tokens per command
```

**`/recall-insights`** - 7-day insights report from Memento
```javascript
Task({
  subagent_type: "general-purpose",
  prompt: "/recall-insights"
})
// Direct cost: ~20-30K tokens (Memento queries + semantic search)
// Via Task: ~2-3K tokens (final report only)
// Savings: 90%
```

**`/prime`** - Full context loading (comprehensive)
```javascript
Task({
  subagent_type: "general-purpose",
  prompt: "/prime"
})
// Phases: Git → Index → Linear → Memento → Codebase → Docs
// Direct cost: 40-60K tokens | Via Task: ~5K tokens
```

**`/quickprime`** - Fast context from Linear prime logs
```javascript
Task({
  subagent_type: "general-purpose",
  prompt: "/quickprime"
})
// Loads most recent prime log + git delta
// Direct cost: ~10-15K tokens | Via Task: ~2K tokens
```

**`/save-conversation`** - Archive session to Memento
```javascript
Task({
  subagent_type: "general-purpose",
  prompt: "/save-conversation"
})
// Extracts session highlights, creates Memento entities
// Direct cost: ~15-20K tokens | Via Task: ~1K tokens
```

**`/save-insights`** - Extract and save learnings to Memento
```javascript
Task({
  subagent_type: "general-purpose",
  prompt: "/save-insights"
})
// Creates breakthrough/lesson-learned entities
// Direct cost: ~10-15K tokens | Via Task: ~1K tokens
```

**`/save-handoff`** - Generate handoff document
```javascript
Task({
  subagent_type: "general-purpose",
  prompt: "/save-handoff"
})
// Compiles current state, pending tasks, critical context
// Direct cost: ~15-20K tokens | Via Task: ~2K tokens
```

**`/create-report`** - Full standup report
```javascript
Task({
  subagent_type: "general-purpose",
  prompt: "/create-report"
})
// Aggregates Linear + git + Memento
// Direct cost: ~20-25K tokens | Via Task: ~3K tokens
```

**`/compare-reports`** - Dev/Prod team comparison
```javascript
Task({
  subagent_type: "general-purpose",
  prompt: "/compare-reports"
})
// Analyzes multiple team standups
// Direct cost: ~25-30K tokens | Via Task: ~3K tokens
```

**`/why [question]`** - Five Whys root cause analysis
```javascript
Task({
  subagent_type: "general-purpose",
  prompt: "/why Why is the session cookie not being set?"
})
// Iterative analysis with sequential thinking
// Direct cost: ~5-10K tokens | Via Task: ~2K tokens
```

## Three-Agent Architecture

**Multi-Claude Instance Pattern** (Memento/Linear coordination):

### Claude Desktop (Planning/Coordination)
- **Role**: Issue creation, sprint planning, cross-team orchestration
- **Location**: Mac M4 (user's desktop)
- **Linear Access**: All teams (HexTrackr-Dev, HexTrackr-Prod, HexTrackr-Docs, Reports)
- **Focus**: Strategic planning, workflow coordination

### Claude-Dev (Development/Implementation)
- **Role**: Feature development, refactoring, code reviews
- **Location**: Mac M4 (local Docker, private repo)
- **Environment**: `https://dev.hextrackr.com` (127.0.0.1:8989)
- **Linear Team**: HexTrackr-Dev (HEX-XX issues)
- **Focus**: Code implementation, testing, documentation

### Claude-Prod (Deployment/Security)
- **Role**: Production deployment, security hardening, performance
- **Location**: Ubuntu server (192.168.1.80)
- **Environment**: `https://hextrackr.com` (public :8443)
- **Linear Team**: HexTrackr-Prod (HEXP-XX issues)
- **Focus**: Production releases, nginx optimization, security

### Shared Resources

- **Memento Knowledge Graph**: Neo4j at 192.168.1.80 (all instances write to same graph)
- **Linear Teams**: Issue-based coordination and handoffs
- **Claude-Context**: Codebase indexing (each instance maintains own index)

### Handoff Pattern

```text
1. Desktop creates HEX-XX (RESEARCH) → delegates to Dev
2. Dev completes implementation → creates HEXP-XX for Prod
3. Linear issue description contains full context (never comments!)
4. Memento entities reference Linear issue IDs for traceability
```

## Linear-First Workflow

**Core Principle**: Linear issues are source of truth, NOT markdown files or comments.

### Issue Creation (RPI Templates)

**Templates are NOT in Linear API** - Must read from `/docs/TEMPLATE_*.md` and apply programmatically:

```javascript
// 1. Read template
const templateContent = await fs.readFile('/docs/TEMPLATE_RESEARCH.md', 'utf8');

// 2. Replace placeholders
const description = templateContent
  .replace(/HEX-XXX/g, 'HEX-171')  // Will be updated after creation
  .replace(/<short name>/g, 'Version Automation')
  .replace(/<your name>/g, 'Lonnie B.')
  .replace(/YYYY-MM-DD/g, '2025-10-09');

// 3. Create issue
mcp__linear-server__create_issue({
  team: "HexTrackr-Dev",
  title: "RESEARCH: Version Automation",
  description: description  // Full template content
})
```

### Update Descriptions, NOT Comments

**ANTI-PATTERN**: Adding findings as Linear comments wastes context
**CORRECT PATTERN**: Update issue description (authoritative source)

```javascript
// ❌ Wrong - Comments create chronological noise
mcp__linear-server__create_comment({
  issueId: "HEX-171",
  body: "Found code at line 245"
})

// ✅ Right - Update description with verified findings
mcp__linear-server__update_issue({
  id: "HEX-171",
  description: updatedDescription  // Replace placeholders with claude-context verified locations
})
```

### Linear Issue Hierarchy

```text
RESEARCH: <name>     (HEX-123, parent)
└── PLAN: <name>     (HEX-124, child of RESEARCH)
    └── IMPLEMENT: <name>  (HEX-125, child of PLAN)
```

**Title Prefixes**: RESEARCH:, PLAN:, IMPLEMENT: (for filtering)
**Auto-Assignment**: Linear assigns sequential IDs (HEX-XX)

## RPI Process (Compressed)

**Full Documentation**: `/docs/RPI_PROCESS.md`

### Critical Patterns

1. **Always verify assumptions with claude-context before updating Linear**
   - Don't trust documentation or memory
   - Search semantically, read files, verify line numbers
   - Update RESEARCH/PLAN descriptions with verified locations

2. **Complete ALL process gates before proceeding**
   - RESEARCH: Readiness Gate (5 checkboxes) + Auto-Quiz (8 questions)
   - PLAN: Preflight (5 checkboxes) + Auto-Quiz (4 questions)
   - IMPLEMENT: Task checklist from PLAN

3. **Git checkpoints before code changes**
   ```bash
   git status  # Must be clean
   git commit -m "🔐 pre-work snapshot (HEX-171)"
   ```

4. **Commit every 1-5 tasks with task IDs**
   ```bash
   git commit -m "feat(automation): Add version sync (HEX-171 Task 2.1)"
   ```

5. **Agent delegation workflow**
   - Agent does code implementation FIRST
   - Then human/Desktop reviews and updates Linear/CHANGELOG/Memento
   - Separation of concerns: agents code, humans document

## Memento Taxonomy (Inline)

**Authority**: DOCS-14 (Memento Knowledge Graph Taxonomy v1.2.0)

### Entity Naming: PROJECT:DOMAIN:TYPE

**Projects**: HEXTRACKR, SYSTEM, PROJECT, MEMENTO, SPEC-KIT
**Domains**: DEVELOPMENT, ARCHITECTURE, SECURITY, FRONTEND, BACKEND, DATABASE, WORKFLOW, DOCUMENTATION
**Types**: SESSION, HANDOFF, INSIGHT, PATTERN, ANALYSIS, DECISION, ISSUE, BREAKTHROUGH

### Required Tags (Every Entity)

**Must Have**:
- Project tag: `project:hextrackr`, `project:system`
- Category tag: `frontend`, `backend`, `database`, `documentation`, `testing`
- Temporal tag: `week-XX-YYYY`, `vX.X.X`, `sprint-X`

**Spec Work**:
- Specification tag: `spec:001` through `spec:999`
- Workflow tag: `in-progress`, `completed`, `blocked`, `needs-review`

**Knowledge Capture**:
- Learning tag: `lesson-learned`, `pattern`, `breakthrough`, `anti-pattern`, `best-practice`
- Cross-project: `reusable` (if applicable to other projects)

### Search Strategy

**Use `mcp__memento__search_nodes` for**:
- Exact ID matching (SESSION_ID, HANDOFF_ID)
- Specific tag queries (spec:001, week-38-2025)
- Status checks (completed, in-progress, blocked)

**Use `mcp__memento__semantic_search` for**:
- Conceptual queries ("performance optimization techniques")
- Natural language ("WebSocket authentication best practices")
- Cross-cutting themes ("architectural decisions from last month")

**NEVER use `read_graph`** (will fail with 200K+ tokens)

### Tagging Pattern

```javascript
// 1. Create entity
mcp__memento__create_entities([{
  name: "Session: HEXTRACKR-VERSION-20251009-212600",
  entityType: "HEXTRACKR:DEVELOPMENT:SESSION",
  observations: [
    "TIMESTAMP: 2025-10-09T21:26:00.000Z",
    "ABSTRACT: Version automation system implementation",
    "SUMMARY: Implemented unified release workflow...",
    "SESSION_ID: HEXTRACKR-VERSION-20251009-212600"
  ]
}]);

// 2. Add tags using add_observations with "TAG: " prefix
mcp__memento__add_observations({
  observations: [{
    entityName: "Session: HEXTRACKR-VERSION-20251009-212600",
    contents: [
      "TAG: project:hextrackr",
      "TAG: linear:HEX-171",
      "TAG: backend",
      "TAG: frontend",
      "TAG: automation",
      "TAG: breakthrough",
      "TAG: completed",
      "TAG: week-41-2025",
      "TAG: v1.0.56",
      "TAG: reusable"
    ]
  }]
});
```

## Git Workflow

**Main Branch**: Protected on GitHub
**Working Branch**: `dev` (daily baseline)

```bash
# Daily pattern
git checkout dev
git pull origin main  # Sync with GitHub
# ... work on feature branches ...
git push origin dev

# Feature branches
git checkout -b feature/hex-171-version-automation
# ... commits ...
git push origin feature/hex-171-version-automation
# Create PR: feature → dev (review) → main (protected)
```

**Commit Messages**:
```bash
# Format: type(scope): description (Linear ID)
git commit -m "feat(automation): Unified release workflow (HEX-171)"
git commit -m "fix(auth): Trust proxy configuration (HEX-128)"
git commit -m "docs: Update CLAUDE.md with RPI patterns (HEX-171)"
```

## Version Management (Automated)

**Source of Truth**: Root `package.json`

**Workflow** (2 steps):
```bash
# 1. Manual: Update version + changelog
vim package.json  # Change "version": "1.0.56" → "1.0.57"
vim app/public/docs-source/changelog/versions/1.0.57.md

# 2. Automated: Run release command
npm run release
# ✅ Syncs version to 5 files
# ✅ Generates 79 HTML docs
# ✅ Generates JSDoc API reference
```

**Auto-Updated Files** (NEVER edit manually):
1. `app/public/package.json`
2. `app/public/scripts/shared/footer.html`
3. `README.md`
4. `docker-compose.yml`
5. `app/public/server.js` (reads env var)

## Critical Configurations

### Trust Proxy (ALWAYS Enabled)

```javascript
// app/public/server.js
app.set("trust proxy", true);  // Required for nginx reverse proxy
```

**Why**: nginx terminates SSL, Express needs `X-Forwarded-Proto` to detect HTTPS for secure cookies.

### Session Management

- `SESSION_SECRET` env var required (32+ characters)
- Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Server refuses to start without valid SESSION_SECRET

### Database Migrations

**NEVER run `npm run init-db` on existing database** (DESTROYS DATA, git hooks block)

**Migration Process**:
```bash
# 1. Create migration file
app/public/scripts/migrations/003-add-vendor-column.sql

# 2. Apply manually
sqlite3 app/data/hextrackr.db < app/public/scripts/migrations/003-add-vendor-column.sql

# 3. Update init-database.js (for fresh installs)
```

## Essential Commands

```bash
# Development
npm start                # Production server (:8080)
npm run dev              # Development with nodemon
npm run release          # Version sync + docs generation

# Linting
npm run lint:all         # All linters (md, eslint, stylelint)
npm run fix:all          # Auto-fix all issues

# Docker (REQUIRED for testing)
docker-compose up -d     # Start nginx + app
docker-compose logs -f   # Follow logs
docker-compose restart   # Restart after changes
```

## Code Patterns

- **Module System**: CommonJS (`require`/`module.exports`)
- **Controllers**: Singleton with `initialize(db, progressTracker)` method
- **Services**: Return `{success, data, error}` objects
- **Error Handling**: Services handle, controllers propagate to Express
- **Database**: better-sqlite3 synchronous API
- **JSDoc**: Required on all functions
- **Security**: Parameterized SQL, CSRF protection, Helmet.js headers

---

**Version**: 1.0.56
**Last Updated**: 2025-10-09
**Authority**: This file overrides defaults - always verify claude-context and Linear before coding
