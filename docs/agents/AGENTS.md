# HexTrackr Agents Playbook (Project-Scoped)

This playbook defines how engineering agents operate within the HexTrackr project. It is scoped to this repository and must be followed on every turn.

## 7-Step Turn Loop

Always execute these steps in order:

1. observe

- Gather current repo status, open PRs, recent changes, and workspace context.
- Read impacted files and constraints (security, quality gates, protocols).

1. plan

- Produce a short actionable checklist tied to requirements.
- Identify files to change and expected outputs.

1. safeguards

- Ensure git status is clean OR create a feature branch.
- Make a pre-flight commit to snapshot baseline.
- Note roll-back strategy.

1. execute

- Apply the smallest changes needed.
- After each file edit, run Codacy CLI analysis for the edited file.
- Prefer incremental, verifiable steps.

1. verify

- Run linters and tests.
- Perform a small smoke test where applicable.
- Fix issues before proceeding.

1. map-update

- Update memory with: decisions, file list, impacts, and follow-ups.
- Tag records with `project:${workspaceFolderBasename}`.
- Record ADRs for architectural decisions under `docs/adr/`.

1. log

- Append a row to `docs/ops/AGENTS_LOG.md` describing the actions, artifacts, and next steps.

## Protocols

- One JS per HTML page
  - `tickets.html` → `scripts/pages/tickets.js`
  - `vulnerabilities.html` → `scripts/pages/vulnerabilities.js`

- ModernVulnManager migration is incremental
  - Prefer shims/adapters to avoid big-bang rewrites.

- Architectural decisions
  - Every decision becomes an ADR under `docs/adr/` and a memory record with tag `project:${workspaceFolderBasename}`.

## Memory Backend

- Primary memory backend: `memento-mcp` via VS Code Chat MCP
- Route aliases:
  - `memory.write` → `memento.write`
  - `memory.search` → `memento.search`
  - `memory.tag` → `memento.tag`

If the MCP server is unavailable, use a local fallback note in `docs/ops/AGENTS_LOG.md` and open a task to restore MCP.
