# HexTrackr Copilot Instructions (v2.3)



---

## Project Overview
HexTrackr = dual-purpose cybersecurity management system:  
1. **Ticket Management** (`tickets.html` + `scripts/pages/tickets.js`)  
2. **Vulnerability Management** (`vulnerabilities.html` + `scripts/pages/vulnerabilities.js`)
3. **Shared Components** (`scripts/shared/` - Settings modal, future navigation, etc.)  

---

## Architecture
- **Deployment**: Docker-only (Docker Compose).  
- **Backend**: Node.js/Express + SQLite (`data/hextrackr.db`).  
- **Frontend**: Tabler.io (vulnerabilities) + Bootstrap 5 (tickets).  
- **Storage**: Database-first with localStorage fallback.  
- **Data Model**: Time-series vulnerability tracking (CSV imports as UPSERTs, no duplicates).  
- **Port**: `localhost:8080`.  

---

## Development Rules
1. **Always backup first**:  
   ```bash
   git add . && git commit -m "🔄 Pre-work backup"
   ```
2. **Update instructions first**:  
   - `.github/copilot-instructions.md` (AI workflow + tech details)  
   - `README.md` (human quick start)  
3. **Roadmap discipline**: use `/roadmaps/` files only (`ROADMAP.md`, `UI_UX_ROADMAP.md`, `CURRENT_STATUS.md`).  
   - ❌ Never create new roadmap files or duplicates.  
   - ✅ Update in place + commit immediately.  
4. **Docker-only**:  
   - ❌ Never run `node server.js` or `npm start` directly.  
   - ✅ Use only `docker-compose up -d`.  
   - Access app at `localhost:8080`.  
5. **Database ops**: API endpoints only.  
6. **No cross-contamination**: tickets & vulnerabilities remain separate.  
7. **JavaScript separation** enforced as above.  

---

## MCP Server Compliance (Development Tools)
**Mandatory tools for every turn** (development assistance only):  
- **Server Memory** → Mirror plans, summaries, snapshots.  
- **Sequential Thinking** → REQUIRED for complex planning (multi-step tasks).  
- **Context7 Map Server** → MANDATORY for library docs  
- **Playwright** → Run on any UI-affecting changes, do not use headless. 
- **Codacy** → Run after every code change (quality/security analysis).  
- **GitHub Tools** → Repo + issue mgmt.  
- **Firecrawl** → Security best-practice research.  
- **Knowledge Graph Tools** → Organize technical relationships.  
- **Others (MarkItDown, image processing, MS Docs, etc.)** → use as needed.  

---

## Compliance Loop (Non-Negotiable)
**Every task must follow this operating loop:**

1. **Observe**  
   - Record request + context with `memory_mcp.record(phase="observe")`.  
   - Mirror snapshot with `server_memory.save("observe/<ts>")`.  

2. **Plan**  
   - Use `seq.plan` for numbered steps.  
   - Save via `memory_mcp.record(phase="plan")`.  

3. **Pre-Write Safety**  
   - Git backup branch or stash patch.  
   - Record via `memory_mcp.record(phase="prewrite")`.  

4. **Execute**  
   - Record intent before action.  
   - Execute step.  
   - Record result via `memory_mcp.record(phase="execute")`.  

5. **Verify**  
   - Run `playwright.run("smoke"|"changed-only")` after risky edits.  
   - Record outcome (phase="verify").  

6. **Map Update**  
   - Update Context7 with changed files & decisions.  
   - Record (phase="map-update").  

7. **Finalize**  
   - Save compact summary to `server_memory.save("summary/<ts>")`.  
   - Respond with short summary + Tooling Ledger.  

**Compliance Gate:** If any phase is missing (observe, plan, prewrite, verify), STOP and fix before continuing.  

---

## Tooling Ledger (Every Turn)
Use this table format in responses:

| # | Phase | Tool | What | Status | Memory ID/Note |
|---|-------|------|------|--------|----------------|
| 1 | observe | memory_mcp.record | request/context | ok | mem:… |
| 2 | plan | seq.plan | steps 1–N | ok | mem:… |
| … | execute | <tool> | <action> | ok/err | mem:… |
| … | verify | playwright.run | smoke/changed-only | pass/fail | report:… |
| … | map-update | context7.map.update | graph updated | ok | mem:… |

---

## Guardrails
- **Tool drift watchdog**: If two turns miss a required tool, declare **COMPLIANCE BREAK**, repair loop, re-run.  
- **Fallbacks**: retry x2, then fallback + record failure.  
- **Never untracked edits**: Always backup branch or stash before file writes.  
- **No secrets**: Redact, alias in memory.  

---

## File Structure (Enforced)

## JavaScript Architecture (MODULAR PATTERN - 2025-08-26)
Following CSS modular pattern for maximum reusability and maintainability:

### Directory Structure
```
scripts/
├── shared/                 # Shared components across pages
│   ├── header.html         # 🔄 Shared navigation header (future)
│   ├── settings-modal.html # 🔄 Shared settings modal HTML (future)
│   ├── settings-modal.js   # ✅ Unified Settings modal (implemented)
│   ├── navigation.js       # 📋 Shared header/nav (future)
│   └── toast-notifications.js # 🔄 Notification system (future)
├── pages/                  # Page-specific functionality
│   ├── tickets.js         # ✅ Tickets page code (refactored)
│   └── vulnerabilities.js # ✅ Vuln page code (migration target)
└── utils/                  # 🔄 Utility functions (future)
    ├── api-client.js      # 🔄 API utilities
    └── data-formatters.js # 🔄 Formatting helpers
```

### HTML Loading Pattern
```html
<!-- Shared components loaded via JavaScript -->
<script src="scripts/shared/header-loader.js"></script>
<script src="scripts/shared/settings-modal.js"></script>
<!-- Page-specific code LAST -->
<script src="scripts/pages/tickets.js"></script>
```

### New Page Template
```html
<!DOCTYPE html>
<html>
<head>
    <title>HexTrackr - New Page</title>
    <!-- Bootstrap/CSS includes -->
</head>
<body>
    <!-- Header component auto-injected here -->
    <div id="headerContainer"></div>
    
    <!-- Page-specific content -->
    <main class="page-wrapper">
        <!-- Your page content here -->
    </main>
    
    <!-- Settings modal auto-injected here -->
    <div id="settingsModalContainer"></div>
    
    <!-- Load shared components -->
    <script src="scripts/shared/header-loader.js"></script>
    <script src="scripts/shared/settings-modal.js"></script>
    <!-- Page-specific code -->
    <script src="scripts/pages/your-page.js"></script>
</body>
</html>
```
```
scripts/
├── shared/                 # Shared components across pages
│   ├── settings-modal.js   # ✅ Unified Settings modal (implemented)
│   ├── navigation.js       # � Shared header/nav (future)
│   └── toast-notifications.js # 🔄 Notification system (future)
├── pages/                  # Page-specific functionality
│   ├── tickets.js         # ✅ Tickets page code (refactored)
│   └── vulnerabilities.js # ✅ Vuln page code (migration target)
└── utils/                  # 🔄 Utility functions (future)
    ├── api-client.js      # 🔄 API utilities
    └── data-formatters.js # 🔄 Formatting helpers
```

### HTML Loading Pattern
```html
<!-- Shared components FIRST -->
<script src="scripts/shared/settings-modal.js"></script>
<!-- Page-specific code SECOND -->
<script src="scripts/pages/tickets.js"></script>
```

### Integration Rules
- **Shared components** expose global functions and auto-initialize
- **Page files** provide integration hooks: `window.refreshPageData(type)`, `window.showToast(msg, type)`
- **Settings modal** works consistently across all pages via shared component
- **NEVER** duplicate Settings modal code in page files

### Development Rules
- **New shared functionality** → create in `scripts/shared/`
- **Page-specific code** → goes in `scripts/pages/`
- **Settings modal changes** → edit `scripts/shared/settings-modal.js` only
- **New pages** → follow modular pattern from day one


### Migration Strategy (Vulnerabilities)
- **Current**: ~1788 lines embedded in HTML
- **Approach**: Incremental migration to `scripts/pages/vulnerabilities.js`
- **Priority**: New features go in JS file, migrate existing as needed
- **Settings modal**: Already unified across both pages

---

## Documentation Discipline
- **AI Instructions** → `.github/copilot-instructions.md`  
- **Human Overview** → `README.md`  
- **Strategic Roadmap** → `/roadmaps/ROADMAP.md`  
- **Tactical Roadmap** → `/roadmaps/UI_UX_ROADMAP.md`  
- **Sprint Status** → `/roadmaps/CURRENT_STATUS.md`  
- **Project Presentation** → `presentation.html` (internal peer documentation)

**Update all of the above after ANY architectural or workflow change.**

---

## Presentation Maintenance (`presentation.html`)
**Purpose**: Internal documentation for peer review of HexTrackr capabilities and features.

**Update Requirements**:
- **Version Dating**: Update date stamp in header for each significant update
- **Feature Additions**: Add new functionality with screenshots as implemented
- **Metric Updates**: Refresh live data metrics and screenshots periodically
- **Tone**: Keep technical/informational for internal audience (avoid marketing language)

**Update Triggers**:
- Major feature completions (like Smart Timeline Extension)
- Significant architectural changes
- New module additions
- Quarterly metric refreshes

**Content Guidelines**:
- Use "Project Overview" not "Executive Summary"
- Use "Technical Impact" not "Business Impact" 
- Focus on capabilities and technical achievements
- Include version numbers and completion dates
- Maintain screenshot currency for visual features  
