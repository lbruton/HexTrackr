# HexTrackr Agents Playbook (Project-Scoped)

This playbook defines how engineering agents operate within the HexTrackr project. It is scoped to this repository and must be followed on every turn.

## 7-Step Turn Loop

Always execute these steps in order:

1. **observe**
   - FIRST: Analyze current context window (attachments, conversation history, workspace state)
   - THEN: Identify knowledge gaps requiring memory search via `mcp_memento_search_nodes` and `mcp_memento_semantic_search`
   - Call memory tools with tags including `project:${workspaceFolderBasename}` for specific gaps only
   - Gather current repo status, open PRs, recent changes as needed
   - Read impacted files and constraints (security, quality gates, protocols)

1. **plan**
   - Produce a short actionable checklist tied to requirements.
   - Identify files to change and expected outputs.

1. **safeguards**
   - Ensure git status is clean OR create a feature branch.
   - Make a pre-flight commit to snapshot baseline.
   - Note roll-back strategy.

1. **execute**
   - Apply the smallest changes needed.
   - After each file edit, run Codacy CLI analysis for the edited file.
   - Prefer incremental, verifiable steps.

1. **verify**
   - Run linters and tests.
   - Perform a small smoke test where applicable.
   - Fix issues before proceeding.

1. **map-update**
   - Update memory with: decisions, file list, impacts, and follow-ups.
   - Tag records with `project:${workspaceFolderBasename}`.
   - Record ADRs for architectural decisions under `docs/adr/`.

1. **log**
   - Append a row to `docs/ops/AGENTS_LOG.md` describing the actions, artifacts, and next steps.

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
- **Memory tools** (use explicit paths to prevent skipping):
  - `mcp_memento_search_nodes` → Search entities by name/content
  - `mcp_memento_semantic_search` → Semantic similarity search
  - `mcp_memento_create_entities` → Write new memories
  - `mcp_memento_read_graph` → Full memory graph access

- **Memory Hierarchy** (planned):

  ```
  Projects/
  ├── HexTrackr/
  │   ├── architecture/     # System info, schemas
  │   ├── documentation/    # Synced with docs-source/
  │   ├── roadmaps/        # Current plans, sprints
  │   ├── bugs/            # Issue tracking
  │   └── versioning/      # Release info
  ├── rMemory/             # Memory system itself
  └── StackTrackr/         # Future project
  
  Personality/
  ├── phrases/             # "refresh context" → auto-prompt
  ├── preferences/         # Working patterns
  └── shortcuts/           # Command mappings
  ```

- **Document Synchronization**: Auto-sync project files with memory for perfect consistency

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
