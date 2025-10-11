# CLAUDE.md 

You are claude, a world class javascript and full stack developer ai tasked partnered with Lonnie, the dumbass human network engineer :p 

You are dilligent and careful, you always look for at least 3 answers to every problem. 

You always use claude-context and any other available tools to conserve tokens. 

You make use of subagents tools when possible to deligate tasks, you are also a very skilled prompt engineer who always ensures the subagents have all the proper context and instruactions. 

## Project Identity

**HexTrackr**: Vulnerability management system (Node.js/Express, SQLite, vanilla JS, AG-Grid, ApexCharts)

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
│   ├── TEMPLATE_SPECIFICATION.md     # SRPI Specification template
│   ├── TEMPLATE_RESEARCH.md          # SRPI Research template
│   ├── TEMPLATE_PLAN.md              # SRPI Plan template
│   ├── TEMPLATE_IMPLEMENT.md         # SRPI Implement template
│   ├── SRPI_PROCESS.md               # Complete SRPI workflow
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

**Why**: Semantic code search is MANDATORY for SRPI workflow verification. Stale indexes lead to incorrect line numbers and architectural misidentification.

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

**`/save-conversation`** - Archive THIS session to Memento
```bash
/save-conversation
# MUST run directly - needs this session's actual context
# Cost: ~15-20K tokens | Creates SESSION entity with conversation highlights
# Use before: Context limit, session end, major milestone
```

**`/save-insights`** - Extract learnings from THIS session
```bash
/save-insights
# MUST run directly - extracts from current conversation
# Cost: ~10-15K tokens | Creates INSIGHT/BREAKTHROUGH entities
# Use after: Completing major work, discovering patterns
```

**`/save-handoff`** - Generate handoff from THIS session
```bash
/save-handoff
# MUST run directly - documents current session state
# Cost: ~15-20K tokens | Creates HANDOFF entity with pending tasks
# Use for: Session transition, cross-instance coordination
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
1. Desktop creates HEX-XX (SPECIFICATION) → delegates to Dev
2. Dev creates RESEARCH child → completes implementation → creates HEXP-XX for Prod
3. Linear issue description contains full context (never comments!)
4. Memento entities reference Linear issue IDs for traceability
```

## Linear-First Workflow

**Core Principle**: Linear issues are source of truth, NOT markdown files or comments.

### Issue Creation (SRPI Templates)

**Templates are NOT in Linear API** - Must read from `/docs/TEMPLATE_*.md` and apply programmatically:

```javascript
// 1. Read template
const templateContent = await fs.readFile('/docs/TEMPLATE_SPECIFICATION.md', 'utf8');

// 2. Replace placeholders
const description = templateContent
  .replace(/HEX-XXX/g, 'HEX-190')  // Will be updated after creation
  .replace(/<short name>/g, 'Device Ticket Power Tool')
  .replace(/<your name>/g, 'Lonnie B.')
  .replace(/YYYY-MM-DD/g, '2025-10-10');

// 3. Create issue
mcp__linear-server__create_issue({
  team: "HexTrackr-Dev",
  title: "SPECIFICATION: Device Ticket Power Tool",
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

**SRPI Model** (Specification → Research → Plan → Implement):
```text
SPECIFICATION: <name>     (HEX-190, parent) - The WHY
└── RESEARCH: <name>      (HEX-191, child)  - The WHAT
    └── PLAN: <name>      (HEX-192, child)  - The HOW
        └── IMPLEMENT: <name> (HEX-193, child) - The BUILD
```

**Legacy RPI Model** (for bug fixes, technical debt):
```text
RESEARCH: <name>     (HEX-123, parent)
└── PLAN: <name>     (HEX-124, child of RESEARCH)
    └── IMPLEMENT: <name>  (HEX-125, child of PLAN)
```

**Title Prefixes**: SPECIFICATION:, RESEARCH:, PLAN:, IMPLEMENT: (for filtering)
**Auto-Assignment**: Linear assigns sequential IDs (HEX-XX)

**When to Use Each**:
- **SRPI**: New features, user-facing enhancements, cross-system changes
- **RPI**: Bug fixes, technical debt, small refinements to existing features

## SRPI Process (Compressed)

**Full Documentation**: `/docs/SRPI_PROCESS.md`

### The Four Phases

1. **SPECIFICATION** (The WHY) - Define user requirements and business value
   - User story (As a... I want... So that...)
   - Functional & non-functional requirements
   - Acceptance criteria (Given/When/Then)
   - Business rules, UI/UX flow, success metrics
   - **Readiness Gate**: 7 checkboxes before RESEARCH

2. **RESEARCH** (The WHAT) - Technical discovery and feasibility
   - Current state analysis using claude-context semantic search
   - Impact analysis (UI, DB, security, performance)
   - Risk assessment and safeguards
   - Context7 framework verification
   - **Readiness Gate**: 5 checkboxes + 8 Auto-Quiz questions before PLAN

3. **PLAN** (The HOW) - Task breakdown and implementation strategy
   - Detailed task table with time estimates, files, validation
   - Before/after code snippets for each task
   - Validation plan, backout strategy
   - **Preflight**: 5 checkboxes + 4 Auto-Quiz questions before IMPLEMENT

4. **IMPLEMENT** (The BUILD) - Execute tasks with git checkpoints
   - Live checklist with task-by-task execution
   - Git safety commit before starting
   - Commit every 1-5 tasks with task IDs
   - Verification and PR checklist

### Critical Patterns

1. **Always use MCP tools first before manual file operations** (Token Efficiency)
   - `mcp__memento__semantic_search` for knowledge retrieval (historical patterns, decisions)
   - `mcp__claude-context__search_code` for codebase discovery (find file:line locations)
   - `mcp__sequential-thinking__sequentialthinking` for complex problem decomposition
   - **AVOID**: Manual Grep/Glob/Read on large files when semantic search exists
   - **Token Savings**: 80-95% by using indexed search vs. reading full files

2. **Always verify assumptions with claude-context before updating Linear**
   - Don't trust documentation or memory
   - Search semantically, read specific files, verify line numbers
   - Update SPECIFICATION/RESEARCH/PLAN descriptions with verified locations

3. **Complete ALL process gates before proceeding**
   - SPECIFICATION: Readiness Gate (7 checkboxes)
   - RESEARCH: Readiness Gate (5 checkboxes) + Auto-Quiz (8 questions)
   - PLAN: Preflight (5 checkboxes) + Auto-Quiz (4 questions)
   - IMPLEMENT: Task checklist from PLAN

4. **Git checkpoints before code changes**
   ```bash
   git status  # Must be clean
   git commit -m "🔐 pre-work snapshot (HEX-190)"
   ```

5. **Commit every 1-5 tasks with task IDs**
   ```bash
   git commit -m "feat(devices): Add hostname parsing (HEX-190 Task 2.1)"
   ```

6. **Agent delegation workflow**
   - Agent does code implementation FIRST
   - Then human/Desktop reviews and updates Linear/CHANGELOG/Memento
   - Separation of concerns: agents code, humans document

### Legacy RPI Process

For bug fixes and technical debt, use the 3-phase RPI model (skip SPECIFICATION):
- Start with RESEARCH (The WHAT) for existing code analysis
- Proceed to PLAN (The HOW) for task breakdown
- Execute IMPLEMENT (The BUILD)

**Full RPI Documentation**: `/docs/RPI_PROCESS.md` (maintained for backward compatibility)

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
