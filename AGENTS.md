# HexTrackr Copilot Instructions

## JavaScript Organization

- **Dedicated JS per page**:
  - `tickets.html` → `tickets.js` (✅ CORRECT)
  - `vulnerabilities.html` → `vulnerabilities.js` (📋 incremental migration)
  
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
- **Frontend**: Tabler.io 
- **Data Model**: Time-series vulnerability tracking (CSV imports as UPSERTs, no duplicates).
- **Port**: `localhost:8080`.

## File Structure (Enforced)

- `server.js` (Express API)
- `tickets.html` + `tickets.js` 
- `vulnerabilities.html` (embedded JS, migration target → `vulnerabilities.js`)
- `styles/`, `scripts/`
- `docker-compose.yml`, `Dockerfile`

## MCP Server Compliance (Development Tools)

**Mandatory tools for every turn** (development assistance only):
- **Server Memory** → Mirror plans, summaries, snapshots.
- **Sequential Thinking** → REQUIRED for complex planning (multi-step tasks).
- **Playwright** → Run on any UI-affecting changes.
- **Codacy** → Run after every code change (quality/security analysis)..

---

## Compliance Loop (Non-Negotiable)

## Every task must follow this operating loop

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
