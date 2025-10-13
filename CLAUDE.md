# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MANDATORY RULES

These rules are mandatory and must be followed every session

1. ALWAYS use **Sequential Thinking** if enabled
2. ALWAYS use **Claude Context** to search the codebase, this is our single source of truth when it comes to the code.
3. ALWAYS ensure **Claude Context** index is fresh
4. NEVER make assumptions, always check **Claude Context** and verify against the files
5. DO NOT waste time searching the files until you have first searched **Claude Context**

## MANDATORY INVESTIGATION WORKFLOW

**CRITICAL**: Before building ANY new feature, endpoint, or fix, you MUST complete this investigation workflow. No exceptions.

### Step 1: Check Index Status (30 seconds)

```javascript
// ALWAYS start here - ensure fresh index
mcp__claude-context__get_indexing_status({
  path: "/Volumes/DATA/GitHub/HexTrackr"
})

// If stale (>1 hour), re-index before searching
mcp__claude-context__index_codebase({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  splitter: "ast",
  force: false
})
```

### Step 2: Search Existing Endpoints (1-2 minutes)

```javascript
// Search for existing endpoints that might already solve the problem
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "API endpoint [describe what you need] controller method",
  limit: 15,
  extensionFilter: [".js"]
})
```

**Example**: Need affected devices? Search "GET /api/vulnerabilities filter search CVE" - don't create new endpoint.

### Step 3: Check Memento for Patterns (1-2 minutes)

```javascript
// Search for architectural patterns and similar work
mcp__memento__semantic_search({
  query: "[describe feature/problem] architecture pattern existing implementation",
  limit: 10,
  min_similarity: 0.5,
  entity_types: ["HEXTRACKR:DEVELOPMENT:SESSION", "HEXTRACKR:ARCHITECTURE:PATTERN"]
})
```

### Step 4: Read Route Files (1 minute)

```javascript
// Check what endpoints exist in relevant route files
Read({file_path: "/Volumes/DATA/GitHub/HexTrackr/app/routes/[relevant].js"})
```

### Step 5: Understand Data Flow (2-3 minutes)

- Where does the data come from? (Database, memory, API)
- Is it already loaded somewhere? (dataManager, cache, in-memory)
- What fields exist? (Read service files)
- What's missing? (Compare to what you need)

### Step 6: Identify Simplest Fix

**Ask yourself**:
- Can existing endpoint + query params solve this? ✅ USE IT
- Is data already in memory but not mapped? ✅ FIX MAPPING
- Do I need to transform existing data? ✅ ADD HELPER FUNCTION
- Is this truly a new capability? ⚠️ THEN build new endpoint

### ANTI-PATTERNS TO AVOID

❌ **Creating database endpoints for data mapping problems**
- Symptom: "Let me create GET /api/[resource]/:id/[related]"
- Reality: Data often already in memory, just missing fields
- Example: HEX-204 - needed vendor/cve fields, not new endpoint

❌ **Building before investigating**
- Symptom: Immediately writing code after user describes problem
- Reality: Similar feature usually exists, just needs discovery
- Fix: Complete investigation workflow FIRST

❌ **Asking user about architecture**
- Symptom: "What endpoint should I use?" "Does this exist?"
- Reality: claude-context and memento have the answers
- Fix: Search tools first, only ask if truly ambiguous

❌ **Trusting memory over search**
- Symptom: "I remember there's a method that..."
- Reality: Code changes, memory is stale
- Fix: Always verify with claude-context

### CORRECT PATTERNS TO USE

✅ **Frontend data already loaded**
- Check: dataManager.currentData, cached data, in-memory arrays
- Fix: Add missing fields to data mapping/aggregation
- Example: Modal using getAffectedAssets() - just needed vendor/cve fields

✅ **Existing endpoint + query params**
- Check: Does /api/[resource] support search/filter params?
- Fix: Use existing endpoint with proper parameters
- Example: GET /api/vulnerabilities?search=[CVE] instead of new endpoint

✅ **Service method exists**
- Check: Service layer already has the logic
- Fix: Call existing service method from controller
- Example: vulnerabilityService.getVulnerabilities() with filters

✅ **Helper function for transformation**
- Check: Need to transform/aggregate existing data?
- Fix: Create pure helper function, don't add backend complexity
- Example: cisco-advisory-helper for version matching

## Working Principles

**You are a world-class JavaScript and full-stack developer AI partnered with Lonnie (network engineer).**

Core approach:
- **Diligent and careful**: Always explore at least 3 solutions to every problem
- **Token efficient**: ALWAYS use MCP tools (claude-context, memento) before manual file operations
- **Agent delegation**: Use `general-purpose` subagent for token-heavy tasks (prompt engineering matters!)
- **Never assume - always verify**:
  - **claude-context with fresh index = 100% source of truth for code** (semantic search can be stale)
  - **Memento timestamped data**: Latest entries supersede older ones (query by date DESC)
  - **Never trust memory, docs, or assumptions** - verify everything with indexed search
  - **Before building**: Search claude-context → verify file:line locations → then code

### MCP Enablement

**Default ON** (always available):
- `memento` - Knowledge graph
- `linear-server` - Issue tracking
- `claude-context` - Code search
- `sequential-thinking` - Complex reasoning

**Enable on demand** (disabled by default):
- `playwright` - Browser automation
- `chrome-devtools` - Browser testing
- `context7` - Framework docs
- `brave-search` - Web research

**NOT Available in Claude Code** (see Codacy Integration section):
- `codacy` - Code quality (GitHub-integrated only, available in Cursor IDE)

**If tool is disabled**: Remind user "I need you to enable [tool-name] MCP to continue. Type @ in chat to enable/disable MCPs."

## Project Overview

**HexTrackr** is an enterprise vulnerability management system built with Node.js/Express backend and vanilla JavaScript frontend. The application tracks security vulnerabilities, maintenance tickets, and CISA KEV (Known Exploited Vulnerabilities) data with real-time WebSocket updates.

**Current Version**: See root `package.json` (auto-synced to 5 files via `npm run release`)

## Architecture

### Backend: Modular MVC Pattern

The backend was refactored from a monolithic 3,800-line `server.js` into a modular architecture:

```
app/
├── public/server.js              # Express app entry point (~200 lines)
├── controllers/                  # Request handlers (singleton pattern)
│   └── *Controller.js           # initialize(db, progressTracker)
├── services/                     # Business logic
│   └── *Service.js              # Return {success, data, error}
├── routes/                       # Express route definitions
│   └── *.js                     # Route modules
├── middleware/                   # Express middleware
│   └── auth.js                  # Session + authentication
└── config/                       # Configuration files
```

**Key Patterns**:
- **Controllers**: Singleton classes with `initialize(db, progressTracker)` method
- **Services**: Return standardized `{success: boolean, data: any, error: string}` objects
- **Database**: better-sqlite3 synchronous API (CommonJS modules)
- **Authentication**: Session-based with Argon2id password hashing
- **Error Handling**: Services handle errors, controllers propagate to Express

### Frontend: Component-Based Vanilla JS

```
app/public/
├── *.html                        # Page templates
├── scripts/
│   ├── pages/                   # Page-specific modules
│   │   ├── vulnerabilities.js
│   │   └── tickets-aggrid.js
│   ├── shared/                  # Reusable components
│   │   ├── auth-state.js        # Authentication state management
│   │   ├── websocket-client.js  # Socket.io real-time updates
│   │   ├── vulnerability-grid.js # AG-Grid integration
│   │   ├── toast-manager.js     # User notifications
│   │   └── preferences-service.js # User settings sync
│   ├── init-database.js         # Schema initialization (DESTRUCTIVE)
│   └── migrations/              # Incremental SQL migrations
└── docs-html/
    └── html-content-updater.js  # Version sync + docs generator
```

**UI Libraries**:
- **AG-Grid Community**: Data tables with sorting/filtering
- **ApexCharts**: Analytics visualizations
- **Socket.io**: Real-time progress tracking
- **Marked + DOMPurify**: Safe markdown rendering

### CSS Architecture & Theme System

**CRITICAL**: Always check CSS cascade and specificity before making changes. The Tabler framework CSS can override custom styles.

#### CSS Load Order (Highest to Lowest Priority)

```
app/public/
├── vendor/tabler/css/tabler.min.css    # ⚠️ BASE FRAMEWORK (loaded first)
├── styles/
│   ├── css-variables.css               # Theme variables (light/dark)
│   ├── shared/
│   │   ├── base.css                    # Base element styles
│   │   ├── cards.css                   # Card component styles
│   │   ├── badges.css                  # Badge styles
│   │   ├── tables.css                  # Table styles
│   │   ├── modals.css                  # Modal dialogs
│   │   ├── animations.css              # Transitions/animations
│   │   ├── header.css                  # Navigation header
│   │   ├── layouts.css                 # Grid layouts
│   │   ├── light-theme.css             # Light theme overrides
│   │   └── dark-theme.css              # Dark theme overrides
│   ├── pages/
│   │   ├── vulnerabilities.css         # Vulnerabilities page specific
│   │   └── tickets.css                 # Tickets page specific
│   ├── utils/
│   │   └── responsive.css              # Media queries
│   └── ag-grid-overrides.css           # AG-Grid customization
```

#### Tabler Framework Conflicts

**Common Override Patterns:**

```css
/* ❌ WRONG - Tabler will override */
.card-actions {
    margin-left: 0;
}

/* ✅ RIGHT - Higher specificity or !important */
.device-card .card-actions {
    margin-left: 0 !important;
}
```

**Known Tabler Rules That Need Overriding:**
- `.card-actions` has `margin: -0.5rem -0.5rem -0.5rem auto` (pushes content right)
- `.card-actions` has `padding-left: 0.5rem` (adds unwanted spacing)
- `.card-actions .btn` has `width: 100%` (makes buttons full-width)

#### Theme System

**Variable Structure:**
```css
/* css-variables.css defines base colors */
:root {
    --hextrackr-primary: #0066cc;
    --hextrackr-danger: #dc3545;
    /* ... */
}

/* light-theme.css overrides for light mode */
[data-bs-theme="light"] {
    --hextrackr-surface-base: #ffffff;
    --hextrackr-text-primary: #1e293b;
}

/* dark-theme.css overrides for dark mode */
[data-bs-theme="dark"] {
    --hextrackr-surface-base: #1e293b;
    --hextrackr-text-primary: #f8fafc;
}
```

**Theme Toggle:**
- User preference stored in `preferences` database table
- Applied via `data-bs-theme` attribute on `<html>` element
- JavaScript: `preferences-service.js` manages theme switching
- All components should use CSS variables, never hardcoded colors

#### CSS Debugging Workflow

**ALWAYS follow this pattern when CSS changes aren't working:**

1. **Use Chrome DevTools to inspect computed styles:**
   ```javascript
   // Get all CSS rules for a selector
   const allRules = [];
   for (let sheet of document.styleSheets) {
       for (let rule of sheet.cssRules) {
           if (rule.selectorText && rule.selectorText.includes('card-actions')) {
               allRules.push({
                   selector: rule.selectorText,
                   cssText: rule.style.cssText,
                   href: sheet.href || 'inline'
               });
           }
       }
   }
   ```

2. **Check cascade order:**
   - Identify which stylesheet is applying each property
   - Note the file path and specificity
   - If Tabler CSS is winning, use higher specificity or `!important`

3. **Verify cache is cleared:**
   - Docker restart: `docker-compose restart`
   - Browser hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
   - Check DevTools Network tab to confirm CSS reload (status 200, not 304)

4. **Test with inline styles first:**
   - Add `style="property: value !important"` directly to element
   - If inline works, problem is CSS specificity
   - If inline fails, problem is JavaScript or DOM structure

#### Component-Specific CSS Notes

**Device Cards** (cards.css):
- Use `.device-card` prefix for device-specific overrides
- Card actions need `margin-left: 0 !important` to override Tabler
- Hostname has `margin-bottom: 0.25rem` (reduced from 1rem in HEX-204)

**Badges** (badges.css):
- KEV badge: `.kev-badge` (red, animated pulse)
- Vendor badges: `.badge.bg-primary` (Cisco=blue), `.badge.bg-warning` (Palo Alto=orange)
- Status badges: `.status-pending`, `.status-open`, `.status-completed`

**VPR Mini Cards** (cards.css):
- Severity colors: `.text-red`, `.text-orange`, `.text-yellow`, `.text-green`
- Always use these classes, never hardcode severity colors

### Database Schema

SQLite database with tables:
- `vulnerabilities`: CVE tracking with VPR scores, deduplication, lifecycle states
- `tickets`: Maintenance tickets with AG-Grid integration
- `kev`: CISA Known Exploited Vulnerabilities
- `templates`: Reusable response templates
- `daily_totals`: Rollup statistics for performance
- `users`: Argon2id hashed passwords
- `preferences`: User-specific settings (theme, display options)

**Schema Management**:
- **Fresh Install**: `npm run init-db` (creates all tables)
- **Existing Database**: Use `app/public/scripts/migrations/*.sql` files
- **CRITICAL**: Git hooks prevent `init-db` on existing databases (data loss risk)

## Essential Commands

### Development

```bash
# Start production server
npm start                         # Port 8080 (behind nginx)

# Development with auto-reload
npm run dev                       # Uses nodemon

# Initialize database (DESTRUCTIVE - only for fresh installs)
npm run init-db

# Version management (2-step process)
# 1. Manual: Edit package.json version + create changelog
vim package.json                  # Change version
vim app/public/docs-source/changelog/versions/X.X.X.md

# 2. Automated: Sync version + generate docs
npm run release                   # Syncs to 5 files + generates 79 HTML docs
```

### Docker (Required for Testing)

```bash
# Management scripts
./docker-start.sh                 # Start containers
./docker-stop.sh                  # Stop containers
./docker-rebuild.sh               # Rebuild and restart
./docker-logs.sh                  # Follow logs

# Raw docker-compose
docker-compose up -d              # Start detached
docker-compose logs -f            # Follow logs
docker-compose restart            # Restart after code changes
```

**Container Architecture**:
- `hextrackr-app`: Node.js application (8989:8080)
- `hextrackr-nginx`: Reverse proxy with SSL termination (80:80, 443:443)

### Code Quality

```bash
# Linting
npm run lint:all                  # All linters (markdown, ESLint, stylelint)
npm run fix:all                   # Auto-fix all issues

# Individual linters
npm run lint:md                   # Markdown
npm run eslint                    # JavaScript
npm run stylelint                 # CSS

# Documentation
npm run docs:generate             # Generate HTML docs from markdown
npm run docs:dev                  # Generate JSDoc API reference
npm run docs:all                  # Generate both
```

### Git Hooks

Hooks are auto-installed via `.githooks/`:

```bash
# Install hooks
npm run hooks:install             # Sets core.hooksPath to .githooks

# Pre-commit behavior
# ✅ Auto-fixes: Markdown, CSS (safe formatting only)
# ⚠️  Warns: ESLint issues (requires manual review)
# 🛡️  Blocks: init-database.js commits (data loss prevention)

# Bypass hooks (emergency only)
git commit --no-verify -m "emergency: critical hotfix"
```

## Critical Configuration

### Trust Proxy (ALWAYS Enabled)

```javascript
// app/public/server.js
app.set("trust proxy", true);  // REQUIRED for nginx reverse proxy
```

**Why**: nginx terminates SSL, Express needs `X-Forwarded-Proto` header to recognize HTTPS for secure cookies. Without this, authentication fails.

### Session Management

- **SESSION_SECRET**: REQUIRED environment variable (32+ characters)
- **Generation**: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **Storage**: SQLite session store in `app/data/sessions.db`
- **Cookies**: `secure: true` (HTTPS required), `httpOnly: true`, `sameSite: "lax"`

**Server refuses to start without valid SESSION_SECRET**.

### Testing URLs

- ✅ **Development**: `https://dev.hextrackr.com` (Mac M4 Docker on 127.0.0.1:8989)
- ✅ **Production**: `https://hextrackr.com` (Ubuntu server 192.168.1.80:8443)
- ✅ **Legacy Localhost**: `https://localhost` (same as dev)
- ❌ **NEVER use HTTP**: `http://localhost` returns empty API responses

## Version Automation

**Source of Truth**: Root `package.json` version field

**Auto-Synced Files** (via `npm run release`):
1. `app/public/package.json`
2. `app/public/scripts/shared/footer.html`
3. `README.md`
4. `docker-compose.yml` (HEXTRACKR_VERSION env var)
5. `app/public/server.js` (reads from env var)

**NEVER manually edit version in these files** - always edit root `package.json` and run `npm run release`.

## Database Operations

### Safe Migration Pattern

```bash
# 1. Create migration file
echo "ALTER TABLE vulnerabilities ADD COLUMN new_field TEXT;" > \
  app/public/scripts/migrations/004-add-new-field.sql

# 2. Apply manually
sqlite3 app/data/hextrackr.db < \
  app/public/scripts/migrations/004-add-new-field.sql

# 3. Update init-database.js schema for fresh installs
vim app/public/scripts/init-database.js
```

### NEVER Run on Existing Database

```bash
# ❌ DESTROYS ALL DATA
npm run init-db

# Git hooks will block commits that change init-database.js
# to prevent accidental data loss
```

## Security Patterns

### Authentication Flow

1. **Login**: POST `/api/auth/login` with username/password
2. **Session**: Server creates session, returns cookie (`hextrackr.sid`)
3. **Protected Routes**: Use `requireAuth` middleware
4. **WebSocket Auth**: Handshake verifies session before upgrade

### Input Validation

- **Path Traversal**: `PathValidator` class for all file operations
- **SQL Injection**: Parameterized queries only (better-sqlite3)
- **CSV Injection**: `safeCSV()` function prefixes formula characters
- **XSS**: DOMPurify for markdown rendering
- **CSRF**: csrf-sync middleware on state-changing routes

### Security Headers (Helmet.js)

```javascript
// Applied via middlewareConfig
helmet({
  contentSecurityPolicy: false,  // Disabled for inline scripts
  crossOriginEmbedderPolicy: false
})
```

## Code Style

- **Module System**: CommonJS (`require`/`module.exports`)
- **JSDoc**: Required on all functions
- **Async Patterns**: Promises with async/await
- **Error Messages**: User-friendly with actionable guidance
- **Logging**: Console with emoji indicators (🔍, ✅, ❌, ⚠️)

## Common Pitfalls

1. **HTTP vs HTTPS**: Always use HTTPS URLs for testing (auth cookies require secure flag)
2. **Trust Proxy**: Never disable `app.set("trust proxy", true)` - breaks authentication
3. **init-database.js**: Only for fresh installs, not migrations (git hooks enforce)
4. **Version Sync**: Always use `npm run release` after changing version in root `package.json`
5. **Controller Initialization**: Must call `controller.initialize(db, progressTracker)` before use
6. **Service Returns**: Always destructure `{success, data, error}` from service methods

## Development Workflow

1. **Start Docker**: `./docker-start.sh`
2. **Access App**: `https://dev.hextrackr.com` or `https://localhost`
3. **Make Changes**: Edit files (auto-reload with nodemon in dev mode)
4. **Test**: Verify in browser
5. **Lint**: `npm run fix:all` (auto-fixes safe issues)
6. **Commit**: Git hooks run safe auto-fixes, warn on JS issues
7. **Restart**: `docker-compose restart` if needed

## Documentation

- **User Docs**: `app/public/docs-source/` (markdown) → `app/public/docs-html/` (generated HTML)
- **API Reference**: JSDoc → `app/public/jsdoc/` (generated)
- **Changelog**: `app/public/docs-source/changelog/versions/X.X.X.md`
- **Access**: `https://localhost/docs-html/` after installation

## Workflow Selection

**Choose the right process based on task scope:**

### Phase 0: Brainstorming (Optional Exploratory Phase)
**Use for**: Feature ideas needing exploration, unclear requirements, multi-session planning
- **When**: User presents idea without clear requirements, or needs help exploring options
- **Output**: Brainstorm markdown file + Linear issue
- **Location**: `/docs/brainstorming/BRAINSTORM-<feature-name>.md`
- **Template**: `/docs/brainstorming/BRAINSTORM-TEMPLATE.md`

**Workflow:**
1. Create brainstorm markdown file with YAML frontmatter
2. Conduct exploratory discussion (can span multiple sessions):
   - Problem statement and goals
   - Approach options (compare trade-offs)
   - UI/UX considerations
   - Technical feasibility
   - Edge cases and constraints
3. Update markdown throughout conversations
4. Create Linear issue: `BRAINSTORM: <Feature Name>`
5. Update markdown frontmatter with Linear issue link
6. Create Memento memory with brainstorm tags
7. Decide next steps:
   - Complex → SRPI workflow
   - Medium → Sprint file + Linear
   - Simple → Direct implementation

**Key Benefits:**
- Searchable via claude-context (markdown files are indexed)
- Context persistence across multiple sessions
- Prevents premature commitment to approach

**Examples:**
- Palo Alto Advisory Integration (HEX-205): 1,736-line brainstorm exploring API integration, architecture, UI changes
- Settings Modal Redesign (HEX-206): 2,020-line brainstorm comparing UI patterns, migration strategies

---

### SRPI (Specification → Research → Plan → Implement)
**Use for**: New features, user-facing enhancements, cross-system changes
- Start with SPECIFICATION (the WHY) - user requirements and business value
- 4 Linear issues with parent/child relationships
- Templates: `/docs/TEMPLATE_SPECIFICATION.md`, `TEMPLATE_RESEARCH.md`, `TEMPLATE_PLAN.md`, `TEMPLATE_IMPLEMENT.md`
- Full guide: `/docs/SRPI_PROCESS.md`

### RPI (Research → Plan → Implement)
**Use for**: Bug fixes, technical debt, small refinements
- Start with RESEARCH (the WHAT) - existing code analysis
- 3 Linear issues with parent/child relationships
- Skip specification phase (requirements already clear)

### Sprint File Pattern (Small Tasks)
**Use for**: Quick fixes, minor enhancements, single-file changes
- Create Linear issue for tracking
- Create sprint markdown file in project root: `SPRINT-HEX-XXX.md`
- Update Linear description when complete
- Delete sprint file after Linear is updated

**Decision Tree**:
- Feature idea needs exploration → **Phase 0: Brainstorm** → then choose below
- New feature with clear requirements → **SRPI**
- Bug fix or refactor → **RPI**
- Quick fix (<1 hour) → **Sprint File**

## MCP Tools - Core Workflows

**Reference Documentation**: `/docs/MCP_TOOLS.md` contains exhaustive documentation for all MCPs (consult only when needed).

**Tool Management**: MCPs can be enabled/disabled in Claude Code settings.

**Token Efficiency Mandate**: Always use indexed search tools before reading files - saves 80-95% tokens.

### Critical MCPs (Use Every Session)

The following three MCPs are your primary operational tools. Learn these patterns by heart.

---

### 1. claude-context (MANDATORY Code Search)

**Rule**: ALL code searches MUST use claude-context - never grep/find/manual file reading.

**Session Start Workflow** (every session):
```javascript
// Step 1: Check index status
mcp__claude-context__get_indexing_status({
  path: "/Volumes/DATA/GitHub/HexTrackr"
})

// Step 2: Re-index if stale (>1 hour) or first time
mcp__claude-context__index_codebase({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  splitter: "ast",  // Syntax-aware with auto-fallback
  force: false      // Only true if user explicitly confirms
})

// Step 3: Wait for indexing to complete (check status until done)

// Step 4: Search semantically
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "express session middleware authentication configuration",
  limit: 10,
  extensionFilter: [".js"]  // Optional: narrow by file type
})
```

**Why Mandatory**: Prevents stale context, wrong line numbers, missed dependencies, and architectural misunderstanding.

---

### 2. memento (Project Memory & Knowledge Graph)

**Backend**: Neo4j Enterprise at 192.168.1.80 (shared across all Claude instances)
**Taxonomy**: See `TAXONOMY.md` (authority: Linear DOCS-14)

#### Entity Naming: PROJECT:DOMAIN:TYPE

**Projects**: HEXTRACKR, SYSTEM, MEMENTO, SPEC-KIT
**Domains**: DEVELOPMENT, ARCHITECTURE, SECURITY, FRONTEND, BACKEND, DATABASE, DOCUMENTATION
**Types**: SESSION, HANDOFF, INSIGHT, PATTERN, ANALYSIS, DECISION, BREAKTHROUGH

#### Required Observations (Every Entity)

```javascript
mcp__memento__create_entities([{
  name: "Session: HEXTRACKR-FEATURE-20251011-120000",
  entityType: "HEXTRACKR:DEVELOPMENT:SESSION",
  observations: [
    "TIMESTAMP: 2025-10-11T12:00:00.000Z",        // ISO 8601
    "ABSTRACT: Brief one-line summary",
    "SUMMARY: Detailed multi-paragraph context...",
    "SESSION_ID: HEXTRACKR-FEATURE-20251011-120000"  // Unique ID
  ]
}]);
```

#### Mandatory Tagging Pattern

**Tags added via `add_observations` with "TAG: " prefix** (NEVER use separate add_tags):

```javascript
mcp__memento__add_observations({
  observations: [{
    entityName: "Session: HEXTRACKR-FEATURE-20251011-120000",
    contents: [
      // REQUIRED TAGS (every entity)
      "TAG: project:hextrackr",         // Project tag
      "TAG: backend",                   // Category tag
      "TAG: week-41-2025",              // Temporal tag

      // WORKFLOW TAGS
      "TAG: completed",                 // Status: completed, in-progress, blocked
      "TAG: linear:HEX-171",            // Link to Linear issue

      // LEARNING TAGS (if applicable)
      "TAG: breakthrough",              // lesson-learned, pattern, anti-pattern
      "TAG: reusable",                  // Cross-project applicable

      // QUALITY TAGS (optional)
      "TAG: verified",                  // Quality: verified, experimental
      "TAG: v1.0.62"                    // Version tag
    ]
  }]
});
```

#### Search Strategy

**Use `search_nodes` for exact matches**:
```javascript
// Exact ID lookup
mcp__memento__search_nodes({
  query: "SESSION_ID: HEXTRACKR-AUTH-20251001-143045"
})

// Specific tags
mcp__memento__search_nodes({
  query: "linear:HEX-171 completed"
})
```

**Use `semantic_search` for concepts**:
```javascript
// Natural language queries
mcp__memento__semantic_search({
  query: "authentication middleware session security patterns",
  limit: 10,
  min_similarity: 0.6,
  entity_types: ["HEXTRACKR:DEVELOPMENT:SESSION", "HEXTRACKR:ARCHITECTURE:PATTERN"]
})
```

**NEVER use `read_graph`** (fails with 200K+ tokens).

---

### 3. linear-server (Issue Tracking - Source of Truth)

**Teams**:
- `HexTrackr-Dev` (HEX-XX) - Development work
- `HexTrackr-Prod` (HEXP-XX) - Production deployment
- `HexTrackr-Docs` (DOCS-XX) - Documentation
- `Prime Logs` (PRIME-XX) - Prime intelligence reports

#### Efficient Team Navigation

```javascript
// Get team ID (do once per session)
mcp__linear-server__list_teams()
// → Returns: [{id: "abc123", key: "HEX", name: "HexTrackr-Dev"}, ...]

// List issues for specific team
mcp__linear-server__list_issues({
  teamId: "abc123",  // From list_teams above
  filter: {
    state: { name: { in: ["In Progress", "Todo"] }},
    labels: { some: { name: { eq: "backend" }}}
  }
})

// Get specific issue
mcp__linear-server__get_issue({
  id: "HEX-171"  // Use issue key, not UUID
})
```

#### Update Descriptions, NOT Comments

**Anti-pattern**: Adding comments creates chronological noise
**Correct pattern**: Update issue description (authoritative source)

```javascript
// ❌ WRONG - Don't use comments for findings
mcp__linear-server__create_comment({
  issueId: "HEX-171",
  body: "Found code at line 245"
})

// ✅ RIGHT - Update description with verified findings
mcp__linear-server__update_issue({
  id: "HEX-171",
  description: updatedDescription  // Replace template placeholders with facts
})
```

#### SRPI Integration

**Large Tasks** (use SRPI: Specification → Research → Plan → Implement):
1. Create `SPECIFICATION:` issue using `/docs/TEMPLATE_SPECIFICATION.md`
2. Create child `RESEARCH:` issue using `/docs/TEMPLATE_RESEARCH.md`
3. Create child `PLAN:` issue using `/docs/TEMPLATE_PLAN.md`
4. Create child `IMPLEMENT:` issue using `/docs/TEMPLATE_IMPLEMENT.md`
5. Use Task tool with `general-purpose` agent to execute implementation

**Small Tasks** (simplified workflow):
1. Create single Linear issue with task breakdown
2. Create sprint markdown file in project root (e.g., `SPRINT_HEX-171.md`)
3. Work through tasks, updating sprint file as you go
4. Update Linear description when complete

---

### 4. sequential-thinking (Complex Problem Analysis)

**Purpose**: Multi-step reasoning with revision capability

**When to Use**:
- Breaking down complex architectural decisions
- Debugging multi-layer issues
- Planning with uncertain scope
- Problems requiring course correction

```javascript
mcp__sequential-thinking__sequentialthinking({
  thought: "Initial analysis step or revision of previous thought",
  thoughtNumber: 1,
  totalThoughts: 5,  // Estimate (can adjust up/down)
  nextThoughtNeeded: true,
  isRevision: false,  // Set true if reconsidering previous thought
  revisesThought: null,  // If isRevision=true, which thought # to revise
  needsMoreThoughts: false  // Set true if need to extend beyond totalThoughts
})
```

**Key Features**:
- Adjust `totalThoughts` estimate as you progress
- Mark `isRevision: true` to question/revise previous thinking
- Continue beyond initial estimate with `needsMoreThoughts: true`
- Express uncertainty and explore alternatives

---

### Secondary MCPs (Enable on Demand)

**context7** - Up-to-date framework docs (two-step: resolve-library-id → get-library-docs)
**chrome-devtools** - Browser automation and UI testing (dev: https://dev.hextrackr.com, prod: https://hextrackr.com)
**playwright** - Modern browser automation (file uploads, form filling, dialog handling, tab management)
**brave-search** - Web research and AI summarization

**Disabled by default** - If needed, remind user to enable via @ in chat.

See `/docs/MCP_TOOLS.md` for complete documentation.

## Codacy Integration

**Current Status**: ✅ Fully integrated via Codacy MCP + GitHub webhook

### Configuration
- **Repository**: `gh/Lonnie-Bruton/HexTrackr-Dev`
- **Token**: Stored in macOS Keychain (`security find-generic-password -s HexTrackr -a CODACY_ACCOUNT_TOKEN -w`)
- **Config Files**:
  - `.codacy/codacy.yaml` - Exclusions, tools, duplication settings
  - `.codacy/tools-configs/eslint.config.mjs` - ESLint configuration
  - `eslint.config.mjs` - Root ESLint config (sync to Codacy)
- **Dashboard**: https://app.codacy.com/gh/Lonnie-Bruton/HexTrackr-Dev/dashboard

### How Codacy Works
1. **GitHub Webhook**: Automatic analysis on every push (1-5 minutes)
2. **Local Analysis**: Use Codacy MCP tools for pre-commit checks
3. **Tools Enabled**: ESLint 9.32.0, Trivy 0.66.0, Pylint 3.3.7, Lizard 1.17.31

### Common Codacy MCP Commands

**Get Repository Status:**
```javascript
mcp__codacy__codacy_get_repository_with_analysis({
  provider: "gh",
  organization: "Lonnie-Bruton",
  repository: "HexTrackr-Dev"
})
// Returns: Grade, issues count, duplication %, coverage %, metrics
```

**Analyze Specific File:**
```javascript
mcp__codacy__codacy_cli_analyze({
  rootPath: "/Volumes/DATA/GitHub/HexTrackr",
  file: "app/public/scripts/shared/vulnerability-cards.js",
  provider: "gh",
  organization: "Lonnie-Bruton",
  repository: "HexTrackr-Dev"
})
// Runs: ESLint, Trivy (security scan), Pylint (false positives expected for JS)
```

**Analyze Entire Project:**
```javascript
mcp__codacy__codacy_cli_analyze({
  rootPath: "/Volumes/DATA/GitHub/HexTrackr",
  provider: "gh",
  organization: "Lonnie-Bruton",
  repository: "HexTrackr-Dev"
})
// Scans all files according to .codacy/codacy.yaml exclusions
```

**Run Security Scan Only:**
```javascript
mcp__codacy__codacy_cli_analyze({
  rootPath: "/Volumes/DATA/GitHub/HexTrackr",
  tool: "trivy",  // Only run Trivy vulnerability scanner
  provider: "gh",
  organization: "Lonnie-Bruton",
  repository: "HexTrackr-Dev"
})
```

**Search for Code Issues:**
```javascript
mcp__codacy__codacy_list_repository_issues({
  provider: "gh",
  organization: "Lonnie-Bruton",
  repository: "HexTrackr-Dev",
  options: {
    levels: ["Error", "Warning"],  // Severity filter
    categories: ["security", "errorprone"],  // Category filter
    branchName: "dev"  // Branch to analyze
  }
})
```

**Search for Security Items:**
```javascript
mcp__codacy__codacy_search_repository_srm_items({
  provider: "gh",
  organization: "Lonnie-Bruton",
  repository: "HexTrackr-Dev",
  options: {
    scanTypes: ["SAST", "Secrets", "SCA"],  // Security scan types
    priorities: ["Critical", "High"],  // Severity filter
    statuses: ["OnTrack", "DueSoon", "Overdue"]  // Open issues only
  }
})
```

### Workflow Integration

**After File Edits:**
```javascript
// 1. Edit code files
Edit({file_path: "app/public/scripts/shared/example.js", ...})

// 2. Run Codacy analysis on edited file
mcp__codacy__codacy_cli_analyze({
  rootPath: "/Volumes/DATA/GitHub/HexTrackr",
  file: "app/public/scripts/shared/example.js",
  provider: "gh",
  organization: "Lonnie-Bruton",
  repository: "HexTrackr-Dev"
})

// 3. Fix any issues found
// 4. Commit and push (triggers full GitHub webhook scan)
```

**After Dependency Changes:**
```javascript
// 1. Install new packages
Bash({command: "npm install new-package"})

// 2. Run security scan
mcp__codacy__codacy_cli_analyze({
  rootPath: "/Volumes/DATA/GitHub/HexTrackr",
  tool: "trivy",  // Security vulnerability scanner
  provider: "gh",
  organization: "Lonnie-Bruton",
  repository: "HexTrackr-Dev"
})

// 3. Review security findings before committing
```

### Cursor IDE Integration
`.cursor/rules/codacy.mdc` enables additional Codacy automation in Cursor IDE:
- **Auto-analyze**: After file edits, automatically run `codacy_cli_analyze`
- **Security**: After dependency changes, automatically run Trivy scan
- **Guidelines**: See `.github/CODACY_GUIDELINES.md` for false positive handling

### Known Issues

**Pylint False Positives:**
- Pylint tries to parse JavaScript as Python (expected behavior)
- Ignore Pylint "syntax-error" findings for `.js` files
- Example: "leading zeros in decimal integer literals" is JavaScript-specific syntax

**ESLint Configuration:**
- Codacy CLI uses `.codacy/tools-configs/eslint.config.mjs`
- Must sync root `eslint.config.mjs` to Codacy config when globals change
- Pattern: `cp eslint.config.mjs .codacy/tools-configs/eslint.config.mjs`

**Excluded Paths:**
- Documentation files excluded via `.codacy/codacy.yaml`
- Vendor libraries excluded
- If docs show in results, check `exclude_paths` configuration
