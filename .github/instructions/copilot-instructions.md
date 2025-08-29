# HexTrackr Copilot Instructions (v2.0)

## JavaScript Organization

- **Dedicated JS per page**:
  - `tickets.html` → `tickets.js` (✅ CORRECT)
  - `vulnerabilities.html` → `vulnerabilities.js` (📋 incremental migration)
- **NEVER** load `app.js` in HTML pages.
- **Documentation**: All JS files require JSDoc headers (see `tickets.js` template).

---

## Project Overview

HexTrackr = dual-purpose cybersecurity management system:

1. **Ticket Management** (`tickets.html` + `tickets.js`)
2. **Vulnerability Management** (`vulnerabilities.html` / `vulnerabilities.js`) — time-series trend tracking w/ Tabler.io UI

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

1. **Update instructions first**:
   - `.github/copilot-instructions.md` (AI workflow + tech details)
   - `README.md` (human quick start)
1. **Roadmap discipline**: use `/roadmaps/` files only (`ROADMAP.md`, `UI_UX_ROADMAP.md`, `CURRENT_STATUS.md`).
2. **Docker-only**:
   - ❌ Never run `node server.js` or `npm start` directly.
   - ✅ Use only `docker-compose up -d`.
   - Access app at `localhost:8080`.
1. **Database ops**: API endpoints only.
2. **No cross-contamination**: tickets & vulnerabilities remain separate.
3. **JavaScript separation** enforced as above.

---

## MCP Server Compliance (Development Tools)

**Mandatory tools for every turn** (development assistance only):

- **Memory MCP** → CRITICAL. Persist before every action.
- **Server Memory** → Mirror plans, summaries, snapshots.
- **Sequential Thinking** → REQUIRED for complex planning (multi-step tasks).
- **Context7 Map Server** → MANDATORY for library docs, real-time examples, and project knowledge graph updates.
- **Playwright** → Run on any UI-affecting changes.
- **Codacy** → Run after every code change (quality/security analysis).
- **GitHub Tools** → Repo + issue mgmt.
- **Firecrawl** → Security best-practice research.
- **Knowledge Graph Tools** → Organize technical relationships.
- **Others (MarkItDown, image processing, MS Docs, etc.)** → use as needed.

---

## Compliance Loop (Non-Negotiable)

## Every task must follow this operating loop:

1. **Observe**
   - Record request + context with `memory_mcp.record(phase="observe")`.
   - Mirror snapshot with `server_memory.save("observe/<ts>")`.

1. **Plan**
   - Use `seq.plan` for numbered steps.
   - Save via `memory_mcp.record(phase="plan")`.

1. **Pre-Write Safety**
   - Git backup branch or stash patch.
   - Record via `memory_mcp.record(phase="prewrite")`.

1. **Execute**
   - Record intent before action.
   - Execute step.
   - Record result via `memory_mcp.record(phase="execute")`.

1. **Verify**
   - Run `playwright.run("smoke"|"changed-only")` after risky edits.
   - Record outcome (phase="verify").

1. **Map Update**
   - Update Context7 with changed files & decisions.
   - Record (phase="map-update").

1. **Finalize**
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

## Roadmap Enforcement

- Use only `/roadmaps/ROADMAP.md`,
- ❌ Never create new roadmap files or duplicates.
- ✅ Update in place + commit immediately.

---

## File Structure (Enforced)

- `server.js` (Express API)
- `tickets.html` + `tickets.js` ✅ organized
- `vulnerabilities.html` (embedded JS, migration target → `vulnerabilities.js`)
- `app.js` (legacy)
- `data/hextrackr.db`
- `styles/`, `scripts/`
- `docker-compose.yml`, `Dockerfile`

---

## Documentation Discipline

- **AI Instructions** → `.github/copilot-instructions.md`
- **Human Overview** → `README.md`
- **Strategic Roadmap** → `/roadmaps/ROADMAP.md`
- **Sprint Status** → `/roadmaps/sprint-YYYY-MM-DD.md`

**Update all of the above after ANY architectural or workflow change.**
