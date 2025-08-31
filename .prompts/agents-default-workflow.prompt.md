# Agents Playbook (Project-Scoped)

This playbook defines how engineering agents operate within the project. It is scoped to this repository and must be followed on every turn.

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
