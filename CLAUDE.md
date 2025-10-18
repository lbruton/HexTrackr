# CLAUDE.md

This file provides core guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HexTrackr** is an enterprise vulnerability management system built with Node.js/Express backend and vanilla JavaScript frontend. The application tracks security vulnerabilities, maintenance tickets, and CISA KEV (Known Exploited Vulnerabilities) data with real-time WebSocket updates. Provides a Ticketing Bridge system to allow users to cordinate field operations between two independent teams.

**Current Version**: See root `package.json` (auto-synced to 5 files via `npm run release`)

### Quick Reference

**Testing URLs**:
- ✅ **Development**: `https://dev.hextrackr.com` 
- ✅ **Test Production**: `https://hextrackr.com` 
- ❌ **NEVER use HTTP**: `http://localhost` returns empty API responses

**Architecture**: Modular MVC (controllers → services → database)
- Backend: Node.js/Express with better-sqlite3
- Frontend: Vanilla JavaScript with Tabler.io, Bootstrap, AG-Grid, ApexCharts, Socket.io
- Auth: Session-based with Argon2id password hashing
- Database: SQLite with optimized pragmas (v1.0.66)

---

## MANDATORY RULES

These rules are mandatory and must be followed every session:

1. ALWAYS use **Sequential Thinking** if enabled
2. ALWAYS ensure **Claude Context** index is fresh (check at session start)
3. ALWAYS use **Claude Context** to search the codebase and markdown files
4. NEVER make assumptions - always check **Claude Context** and verify against files
5. DO NOT waste time searching files until you have first searched **Claude Context**

---

## ⚠️ CRITICAL: DATABASE CORRUPTION PREVENTION (HEX-280, HEX-282)

**NEVER BIND MOUNT THE DATABASE FROM macOS FILESYSTEM**

**The Problem:**
- macOS fcntl locking is incompatible with SQLite WAL mode
- Bind mounting `./app/data` from macOS WILL corrupt the database on every Docker restart
- This causes: data loss, Cisco advisory disappearance, ticket save failures, soft delete failures

**The Solution:**
- Database MUST live in Docker named volume: `hextrackr-database:/app/data`
- The bind mount `./app:/app/app` MUST exclude `/app/app/data` (line 17 of docker-compose.yml)
- DATABASE_PATH environment variable MUST be `/app/data/hextrackr.db` (absolute path inside container)
- server.js MUST use `process.env.DATABASE_PATH` NOT hardcoded paths (line 169)

**Docker Volume Configuration (docker-compose.yml):**
```yaml
volumes:
  - ./app:/app/app                    # App code (hot reload)
  - /app/node_modules                 # Exclude node_modules
  - /app/app/data                     # CRITICAL: Exclude database directory
  - hextrackr-database:/app/data      # Named volume for database (SAFE)
```

**Environment Variable (.env):**
```bash
DATABASE_PATH=/app/data/hextrackr.db  # Absolute path to named volume
```

**Server Initialization (server.js line 169):**
```javascript
const dbPath = process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : path.join(__dirname, "..", "data", "hextrackr.db");
```

**If You Break This Rule:**
- Database corruption on every Docker restart
- Cisco/Palo advisory data disappears
- Tickets fail to save/edit
- Soft deletes stop working
- WAL file corruption
- Users will be very angry

**Verification Commands:**
```bash
# Check database path is correct
docker-compose logs hextrackr | grep "DATABASE"
# Should show: [DATABASE] Using database path: /app/data/hextrackr.db

# Verify database is in named volume (NOT bind mount)
docker exec hextrackr-app ls -lah /app/data/
# Should show: hextrackr.db (owned by root/app user)

# Verify bind mount is excluded
docker exec hextrackr-app ls -lah /app/app/data/ 2>&1
# Should show: "No such file or directory" (GOOD - excluded from bind mount)
```

---

## Reference Conventions

**HEX-XXX Issue Numbers** (Internal Use Only):
- ✅ **Development**: Code comments, commit messages, Linear issues
- ✅ **Internal Docs**: `/docs/*.md` files, developer guides, architecture notes
- ✅ **Debugging**: Console logs during development (removed before release)

**Version Numbers** (Public/Production Use):
- ✅ **Public Documentation**: `/app/public/docs-source/**/*.md` user guides
- ✅ **Application Logging**: LoggingService, audit trails, error messages shown to users
- ✅ **Changelogs**: `CHANGELOG.md`, release notes, version history
- ✅ **User-Facing UI**: Error messages, notifications, help text

**Cleanup Strategy** (HEX-254 Session 4+):
- Remove `[HEX-XXX]` prefixes from console logs (use logger categories instead)
- Replace issue references with version numbers in user-facing docs
- Keep HEX references in git history, Linear, and internal documentation
- Use semantic versioning (v1.0.66) for public-facing references

**Example Conversions**:
- ❌ Console: `console.log('[HEX-241] Vendor detected:', vendor)`
- ✅ Logger: `logger.debug('vulnerability', 'Vendor detected:', { vendor })`
- ❌ User Doc: "Fixed in HEX-247"
- ✅ User Doc: "Fixed in v1.0.66"

---

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

### SRPI (Specification → Research → Plan → Implement)
**Use for**: New features, user-facing enhancements, cross-system changes
- Start with SPECIFICATION (the WHY) - user requirements and business value
- 4 Linear issues with parent/child relationships
- Templates: `/docs/TEMPLATE_SPECIFICATION.md`, `TEMPLATE_RESEARCH.md`, `TEMPLATE_PLAN.md`, `TEMPLATE_IMPLEMENT.md`
- Full guide: `/docs/SRPI_PROCESS.md`

---

## MCP Tools - Quick Reference

**Tool Management**: MCPs can be enabled/disabled in Claude Code settings.

**Token Efficiency Mandate**: Always use indexed search tools before reading files - saves 80-95% tokens.

### 1. claude-context (MANDATORY Code Search)

**Rule**: ALL code searches MUST use claude-context - never grep/find/manual file reading.

**Markdown Files**: All markdown files (`*.md`) in the repository are indexed by claude-context and can be searched semantically. This includes documentation in `/docs/`, `/app/public/docs-source/`, `CLAUDE.md`, `TAXONOMY.md`, `README.md`, and all guide/reference files.

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

## Additional Documentation

**Core Reference**:
- Environment & Architecture: `/docs/ENVIRONMENT_ARCHITECTURE.md`
- MCP Tools Guide: `/docs/MCP_TOOLS.md`
- Taxonomy: `TAXONOMY.md` (Memento entity naming)

**Workflow Guides**:
- SRPI Process: `/docs/SRPI_PROCESS.md`

**Logging & Audit Trail** (HEX-254):
- User Guide: `/app/public/docs-source/guides/logging-and-audit-trail.md`
- Developer Guide: `/docs/LOGGING_SYSTEM.md`
- Configuration: `/app/config/logging.config.json`
- Database Schema: `/app/public/scripts/migrations/012-create-audit-logs.sql`

**Changelogs**:
- Location: `/app/public/docs-source/changelog/versions/`
- Format: Each version gets its own file (e.g., `1.0.67.md`)
- Index: `/app/public/docs-source/changelog/index.md` (links to all versions)
- Template: `/docs/SRPI/TEMPLATE_CHANGELOG.md`
- **Version Strategy**: Each HEX-254 session gets a new patch version
  - Session 3 → v1.0.67
  - Session 4 → v1.0.68
  - Session 5 → v1.0.69 (etc.)

---

## Version Bump & Changelog Workflow

**Used for**: Checkpoint/rewind workflow sessions (HEX-254), feature releases, hotfixes

### Version Bump Procedure

**Step 1: Edit package.json**
```bash
# Manually update version in root package.json
# Example: "version": "1.0.71" → "version": "1.0.72"
```

**Step 2: Run release script**
```bash
npm run release
```

This automatically syncs version across 5 files:
- `package.json` (root)
- `app/public/package.json`
- `app/public/scripts/shared/footer.html`
- `README.md`
- `docker-compose.yml`
- `app/public/login.html`

**Step 3: Verify sync**
```bash
# Check all 5 files have matching version
grep -n "1.0.72" package.json app/public/package.json README.md docker-compose.yml app/public/login.html app/public/scripts/shared/footer.html
```

### Changelog Template Process

**Step 1: Create new version file**

**File**: `/app/public/docs-source/changelog/versions/[VERSION].md`

**Template Structure**:
```markdown
---
title: "Version [VERSION] - [Feature Name]: [Brief Description]"
date: "YYYY-MM-DD"
version: "[VERSION]"
status: "In Progress" | "Released"
category: "Enhancement" | "Bug Fix" | "Security" | "Performance" | "Documentation"
---

# Version [VERSION] - [Feature Name]: [Brief Description]

**Release Status**: 🚧 In Progress | ✅ Released
**Release Date**: TBD | YYYY-MM-DD
**Parent Issue**: [HEX-XXX](https://linear.app/hextrackr/issue/HEX-XXX)
**Implementation**: [HEX-XXX](https://linear.app/hextrackr/issue/HEX-XXX) Session N

## Overview

[1-2 sentence description of what this version accomplishes]

## Implementation Tasks

### Planned
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Completed
- [ ] TBD (updated during implementation)

## Technical Details

**Files Modified**:
- `path/to/file.js` - Description of changes
- `path/to/other.js` - Description of changes

**Migration Pattern** (if applicable):
```javascript
// BEFORE
console.log("Old pattern");

// AFTER
this._log('info', "New pattern", { context });
```

## Success Criteria

- [X] Version bumped to [VERSION] across 5 files
- [ ] Specific success criterion 1
- [ ] Specific success criterion 2
- [ ] Testing verified

## Related Issues

- Parent: [HEX-XXX](link) - Parent issue title
- Implementation: [HEX-XXX](link) - Implementation issue title
- Session: [HEX-XXX](link) - Session-specific issue (if applicable)

## Progress

**Sessions Complete**: N/Total (X%)
- ✅ Session 1: Description (vX.X.X)
- ✅ Session 2: Description (vX.X.X)
- 🚧 Session N: Current session (vX.X.X)
```

**Step 2: Update changelog index**

**File**: `/app/public/docs-source/changelog/index.md`

Update two sections:

1. **Current Version** (top of file):
```markdown
**Current Version**: [v1.0.72](#changelog/versions/1.0.72) 🚧 In Progress
```

2. **Latest Releases** (version list):
```markdown
- [**v1.0.72**](#changelog/versions/1.0.72) - 2025-10-17 - 🚧 Feature Name: Brief Description
- [**v1.0.71**](#changelog/versions/1.0.71) - 2025-10-17 - ✅ Previous Feature
```

**Step 3: Commit version bump**
```bash
git add -A
git commit -m "chore: Version bump to v[VERSION] for [HEX-XXX] Session N"
```

### Checkpoint/Rewind Integration

**When starting a new session** (after rewind):

1. **Create changelog template** (use template above)
2. **Bump version** (edit package.json + run `npm run release`)
3. **Update index** (add entry to changelog/index.md)
4. **Commit** (version bump commit before implementation)
5. **Implement** (actual code changes)
6. **Update changelog** (mark tasks complete, add details)
7. **Commit** (implementation commit)
8. **Create checkpoint** (for next session rewind)

### Version Numbering Strategy

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (e.g., 2.0.0)
- **MINOR**: New features, backwards compatible (e.g., 1.1.0)
- **PATCH**: Bug fixes, small enhancements (e.g., 1.0.72)

**HEX-254 Strategy** (Logging System):
- Each session increments PATCH version
- Session 7 → v1.0.71
- Session 8 → v1.0.72
- Session 9 → v1.0.73 (etc.)

**Feature Releases**:
- Significant features increment MINOR version
- Example: Palo Alto integration → v1.1.0

**Breaking Changes**:
- Database schema changes requiring migration → MAJOR version
- API changes breaking backwards compatibility → MAJOR version

---

**Last Updated**: 2025-10-17
