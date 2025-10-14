# CLAUDE.md

This file provides core guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Comprehensive Documentation**: See `/docs/` folder for detailed reference material:
- **Environment & Architecture**: `/docs/ENVIRONMENT_ARCHITECTURE.md`
- **Deployment Workflow**: `/docs/DEPLOYMENT_WORKFLOW.md`
- **Development Patterns**: `/docs/DEVELOPMENT_PATTERNS.md`
- **MCP Tools**: `/docs/MCP_TOOLS.md`
- **SRPI Process**: `/docs/SRPI_PROCESS.md`

---

## MANDATORY RULES

These rules are mandatory and must be followed every session:

1. ALWAYS use **Sequential Thinking** if enabled
2. ALWAYS use **Claude Context** to search the codebase - single source of truth for code
3. ALWAYS ensure **Claude Context** index is fresh (check at session start)
4. NEVER make assumptions - always check **Claude Context** and verify against files
5. DO NOT waste time searching files until you have first searched **Claude Context**

---

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

---

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

**If tool is disabled**: Remind user "I need you to enable [tool-name] MCP to continue. Type @ in chat to enable/disable MCPs."

---

## Project Overview

**HexTrackr** is an enterprise vulnerability management system built with Node.js/Express backend and vanilla JavaScript frontend. The application tracks security vulnerabilities, maintenance tickets, and CISA KEV (Known Exploited Vulnerabilities) data with real-time WebSocket updates.

**Current Version**: See root `package.json` (auto-synced to 5 files via `npm run release`)

### Quick Reference

**Testing URLs**:
- ✅ **Development**: `https://dev.hextrackr.com` (Mac M4 Docker on 127.0.0.1:8989)
- ✅ **Test Production**: `https://hextrackr.com` (Ubuntu server 192.168.1.80:8443)
- ❌ **NEVER use HTTP**: `http://localhost` returns empty API responses

**Architecture**: Modular MVC (controllers → services → database)
- Backend: Node.js/Express with better-sqlite3
- Frontend: Vanilla JavaScript with AG-Grid, ApexCharts, Socket.io
- Auth: Session-based with Argon2id password hashing
- Database: SQLite with optimized pragmas (v1.0.66)

**See**: `/docs/ENVIRONMENT_ARCHITECTURE.md` for complete details

---

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
2. Conduct exploratory discussion (can span multiple sessions)
3. Update markdown throughout conversations
4. Create Linear issue: `BRAINSTORM: <Feature Name>`
5. Create Memento memory with brainstorm tags
6. Decide next steps: Complex → SRPI, Medium → Sprint file, Simple → Direct implementation

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

---

## MCP Tools - Quick Reference

**Tool Management**: MCPs can be enabled/disabled in Claude Code settings.

**Token Efficiency Mandate**: Always use indexed search tools before reading files - saves 80-95% tokens.

### 1. claude-context (MANDATORY Code Search)

**Rule**: ALL code searches MUST use claude-context - never grep/find/manual file reading.

**Session Start Workflow** (every session):
```javascript
// Step 1: Check index status
mcp__claude-context__get_indexing_status({
  path: "/Volumes/DATA/GitHub/HexTrackr"
})

// Step 2: Re-index if stale (>1 hour)
mcp__claude-context__index_codebase({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  splitter: "ast",
  force: false
})

// Step 3: Search semantically
mcp__claude-context__search_code({
  path: "/Volumes/DATA/GitHub/HexTrackr",
  query: "express session middleware authentication configuration",
  limit: 10,
  extensionFilter: [".js"]
})
```

### 2. memento (Project Memory & Knowledge Graph)

**Backend**: Neo4j Enterprise at 192.168.1.80 (shared across all Claude instances)
**Taxonomy**: See `TAXONOMY.md` (authority: Linear DOCS-14)

**Entity Naming**: PROJECT:DOMAIN:TYPE
- **Projects**: HEXTRACKR, SYSTEM, MEMENTO, SPEC-KIT
- **Domains**: DEVELOPMENT, ARCHITECTURE, SECURITY, FRONTEND, BACKEND, DATABASE, DOCUMENTATION
- **Types**: SESSION, HANDOFF, INSIGHT, PATTERN, ANALYSIS, DECISION, BREAKTHROUGH

**Search Strategy**:
```javascript
// Exact matches
mcp__memento__search_nodes({
  query: "SESSION_ID: HEXTRACKR-AUTH-20251001-143045"
})

// Concepts
mcp__memento__semantic_search({
  query: "authentication middleware session security patterns",
  limit: 10,
  entity_types: ["HEXTRACKR:DEVELOPMENT:SESSION"]
})
```

**NEVER use `read_graph`** (fails with 200K+ tokens).

### 3. linear-server (Issue Tracking - Source of Truth)

**Teams**:
- `HexTrackr-Dev` (HEX-XX) - Development work
- `HexTrackr-Prod` (HEXP-XX) - Production deployment
- `HexTrackr-Docs` (DOCS-XX) - Documentation
- `Prime Logs` (PRIME-XX) - Prime intelligence reports

**Finding Active Work**:
```javascript
// RECOMMENDED: Temporal filter (last 7 days)
mcp__linear-server__list_issues({
  team: "HexTrackr-Dev",
  updatedAt: "-P7D",
  limit: 20,
  orderBy: "updatedAt"
})

// My assigned issues
mcp__linear-server__list_issues({
  team: "HexTrackr-Dev",
  assignee: "me"
})
```

**Update Descriptions, NOT Comments**: Comments create chronological noise. Update issue description (authoritative source).

### 4. sequential-thinking (Complex Problem Analysis)

**Use for**:
- Breaking down complex architectural decisions
- Debugging multi-layer issues
- Planning with uncertain scope

**See**: `/docs/MCP_TOOLS.md` for complete documentation

---

## Codacy Integration

**Current Status**: ✅ Fully integrated via Codacy MCP + GitHub webhook

### Quick Commands

**Analyze File**:
```javascript
mcp__codacy__codacy_cli_analyze({
  rootPath: "/Volumes/DATA/GitHub/HexTrackr",
  file: "app/services/cacheService.js",
  provider: "gh",
  organization: "Lonnie-Bruton",
  repository: "HexTrackr-Dev"
})
```

**Security Scan**:
```javascript
mcp__codacy__codacy_cli_analyze({
  rootPath: "/Volumes/DATA/GitHub/HexTrackr",
  tool: "trivy",
  provider: "gh",
  organization: "Lonnie-Bruton",
  repository: "HexTrackr-Dev"
})
```

**Dashboard**: https://app.codacy.com/gh/Lonnie-Bruton/HexTrackr-Dev/dashboard

**Known Issues**:
- Pylint false positives for `.js` files (expected - ignore "syntax-error")
- ESLint config must be synced: `cp eslint.config.mjs .codacy/tools-configs/`

**See**: `.github/CODACY_GUIDELINES.md` for detailed workflow

---

## End-of-Session Ritual

After completing work:

1. **Update Linear** issue descriptions (not comments)
2. **Create Memento entity** with proper taxonomy
3. **If we discovered a pattern** → create `/docs/patterns/` file
4. **Run `/save-insights`** slash command (user trigger) or I can run as tool
5. **Update CLAUDE.md** if workflow changed

**Partnership Agreement**:
- **I (Claude)**: Proactively gather context (claude-context → Linear → Memento at session start)
- **You (Lonnie)**: Run `/save-insights` or `/save-conversation` when we make breakthroughs

---

## Additional Documentation

**Core Reference**:
- Environment & Architecture: `/docs/ENVIRONMENT_ARCHITECTURE.md`
- Deployment Workflow: `/docs/DEPLOYMENT_WORKFLOW.md`
- Development Patterns: `/docs/DEVELOPMENT_PATTERNS.md`
- MCP Tools Guide: `/docs/MCP_TOOLS.md`

**Workflow Guides**:
- SRPI Process: `/docs/SRPI_PROCESS.md`
- Brainstorm Template: `/docs/brainstorming/BRAINSTORM-TEMPLATE.md`

**Project Management**:
- Taxonomy: `TAXONOMY.md` (Memento entity naming)
- Codacy Guidelines: `.github/CODACY_GUIDELINES.md`

**All markdown files** are indexed by claude-context - search them semantically when needed.

---

**Last Updated**: 2025-10-14
**Version**: 1.0.66 (Performance Optimization Release)
