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

---

**Last Updated**: 2025-10-16
