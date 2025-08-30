# HexTrackr Agents Playbook v2.0 (Smart Memory Edition)

This playbook defines how engineering agents operate within the HexTrackr project with intelligent memory persistence to eliminate context loss.

## 7-Step Turn Loop (Memory-Optimized)

Always execute these steps in order:

### 1. **observe**

- Gather current repo status, open PRs, recent changes, and workspace context.
- Read impacted files and constraints (security, quality gates, protocols).
- Call `memory.search` with tags including `project:${workspaceFolderBasename}` and the observations.

   **✅ COMPLETE WHEN:** Git status checked, memory search returns relevant context, constraint files read

### 2. **plan**

- Produce a short actionable checklist tied to requirements.
- Identify files to change and expected outputs.
- **SMART MEMORY:** Only commit decisions that affect multiple sessions or change project direction

   **✅ COMPLETE WHEN:** Clear checklist exists, files identified, impacts understood

### 3. **safeguards**

- Ensure git status is clean OR create a feature branch.
- Make a pre-flight commit to snapshot baseline.
- Note roll-back strategy.
- **SMART MEMORY:** Commit baseline state and rollback plan for complex changes only

   **✅ COMPLETE WHEN:** Git clean/branched, commit made (if needed), rollback documented

### 4. **execute**

- Apply the smallest changes needed.
- After each file edit, run Codacy CLI analysis for the edited file.
- Prefer incremental, verifiable steps.
- **SMART MEMORY:** Commit only unexpected discoveries or architectural insights

   **✅ COMPLETE WHEN:** Changes applied, Codacy analysis passed, no blockers

### 5. **verify**

- Run linters and tests.
- Perform a small smoke test where applicable.
- Fix issues before proceeding.
- **SMART MEMORY:** Commit only if critical issues found that affect future work

   **✅ COMPLETE WHEN:** All linters pass, tests green, smoke test successful

### 6. **map-update**

- **ALWAYS COMMIT:** Final outcomes, architectural decisions, discovered patterns
- Tag records with `project:${workspaceFolderBasename}` + context-specific tags
- Record ADRs for architectural decisions under `docs/adr/`

   **✅ COMPLETE WHEN:** Memory updated with session outcomes, ADRs created if needed

### 7. **log**

- Append a row to `docs/ops/AGENTS_LOG.md` describing the actions, artifacts, and next steps.

   **✅ COMPLETE WHEN:** Log entry added with clear next steps

## Smart Memory Rules

### 🧠 ALWAYS REMEMBER (Auto-commit)

- **Session Context**: Current branch, active files, user goals
- **Architectural Decisions**: Code structure changes, new patterns
- **Blockers & Solutions**: What didn't work, what did work, why
- **Discovery Patterns**: Unexpected findings, useful connections
- **Progress State**: Where we left off, what's next
- **Tool Configurations**: Working setups, failed attempts

### 🗑️ NEVER REMEMBER (Skip)

- **Routine Actions**: Standard git commands, basic file reads
- **Expected Outcomes**: Linting passes, normal Codacy results
- **Temporary States**: Loading messages, intermediate steps
- **Repeated Information**: Already known project structure

### 🎯 CONTEXT RECONSTRUCTION TAGS

Use these tags for better searchability:

- `project:HexTrackr` + `session:${currentDate}` + `goal:${userObjective}`
- `file:${filename}` for file-specific discoveries
- `error:resolved` or `error:blocking` for problem tracking
- `pattern:${patternName}` for reusable solutions
- `next:${nextAction}` for continuation points

## Error Recovery Protocol

### When Steps Fail

- **Minor failure**: Document in memory with `error:resolved`, continue
- **Major failure**: Document with `error:blocking`, log to AGENTS_LOG.md, request guidance
- **MCP unavailable**: Use local fallback in AGENTS_LOG.md, create `task:restore-mcp`

### Context Loss Prevention

Before any long-running operation, commit:

```
Current context: [branch] [files] [user goal] [progress state]
Next planned action: [specific next step]
Rollback plan: [how to undo if needed]
```

## Tool Selection Logic

### Decision Matrix

- **Simple tasks** (1-2 files, clear scope): Skip Sequential Thinking
- **Complex planning** (>3 files, unclear scope): REQUIRED Sequential Thinking  
- **UI changes** (any HTML/CSS/JS affecting display): Always use Playwright
- **Any code change**: Mandatory Codacy analysis
- **Architecture changes**: Always create ADR

### Time Management

- **Simple tasks**: 5-10 minutes max
- **Complex tasks**: 30 minutes max, then break into subtasks
- **If blocked**: Document blocker in memory, request guidance

## Scope Boundaries

### ✅ ACCEPT

- Code changes within HexTrackr repository
- Documentation updates and improvements  
- Analysis and debugging within project scope
- Configuration changes for development tools

### ❌ DECLINE  

- Infrastructure changes outside Docker Compose
- External service integrations requiring new accounts
- Destructive operations without explicit confirmation
- Changes requiring production environment access

### 🤝 ESCALATE

- Security policy changes
- Database schema migrations in production
- Architectural decisions affecting system design
- Integration with external systems

## Project Architecture

**HexTrackr** = dual-purpose cybersecurity management system:

1. **Ticket Management** (`tickets.html` + `scripts/pages/tickets.js`)
2. **Vulnerability Management** (`vulnerabilities.html` + `scripts/pages/vulnerabilities.js`)

- **Deployment**: Docker-only (Docker Compose)
- **Backend**: Node.js/Express + SQLite (`data/hextrackr.db`)
- **Frontend**: Tabler.io CSS framework
- **Data Model**: Time-series vulnerability tracking (CSV imports as UPSERTs)
- **Port**: `localhost:8080`

## Protocols

- **One JS per HTML page**
  - `tickets.html` → `scripts/pages/tickets.js`
  - `vulnerabilities.html` → `scripts/pages/vulnerabilities.js`

- **ModernVulnManager migration is incremental**
  - Prefer shims/adapters to avoid big-bang rewrites.

- **Architectural decisions**
  - Every decision becomes an ADR under `docs/adr/` and a memory record with tag `project:${workspaceFolderBasename}`.

## Memory Backend

- **Primary memory backend**: `memento-mcp` via VS Code Chat MCP
- **Route aliases**:
  - `memory.write` → `memento.write`
  - `memory.search` → `memento.search`
  - `memory.tag` → `memento.tag`

If the MCP server is unavailable, use a local fallback note in `docs/ops/AGENTS_LOG.md` and open a task to restore MCP.

## MCP Server Compliance (Development Tools)

**Mandatory tools for every turn** (development assistance only):

- **Memento Memory** → Persistent project memory and decision tracking
- **Sequential Thinking** → REQUIRED for complex planning (multi-step tasks)
- **Playwright** → Run on any UI-affecting changes
- **Codacy** → Run after every code change (quality/security analysis)

## File Structure (Enforced)

- `server.js` (Express API)
- `tickets.html` + `scripts/pages/tickets.js`
- `vulnerabilities.html` + `scripts/pages/vulnerabilities.js`
- `styles/`, `scripts/`
- `docker-compose.yml`, `Dockerfile`
- `docs/adr/` (Architecture Decision Records)
- `docs/ops/AGENTS_LOG.md` (Operations log)

## Session Handoff Protocol

When starting a new session, agents should:

1. **Search memory**: `project:HexTrackr session:recent next:*`
2. **Reconstruct context**: What was the last goal? What files were being worked on?
3. **Check git status**: Any uncommitted changes? Which branch?
4. **Review recent log**: Last few entries in AGENTS_LOG.md
5. **Confirm direction**: Ask user if continuing previous work or starting new task

This eliminates the "restart every 20 minutes" problem by making context persistence automatic and intelligent.
