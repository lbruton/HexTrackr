# Agents Playbook

This playbook defines how engineering agents operate within the project. It is scoped to this repository and must be followed on every turn.

## 7-Step Turn Loop

Always execute these steps in order:

**observe**
   - FIRST: Analyze current context window (attachments, conversation history, workspace state)
   - THEN: Identify knowledge gaps requiring memory search via `search_memories` and `get_recent_context`

**plan**
   - Produce a short actionable checklist tied to requirements.
   - Identify files to change and expected outputs.
   - If no memory exist, create a new memory with 'create_memory

**safeguards**
   - Make a pre-flight commit to snapshot baseline.
   - Note roll-back strategy.

**execute**
   - Apply the smallest changes needed.
   - After each file edit, run Codacy CLI analysis for the edited file.
   - Prefer incremental, verifiable steps.

**verify**
   - Run linters and tests.
   - Perform a small smoke test where applicable.
   - Fix issues before proceeding.

**map-update**
   - Update memory with: decisions, file list, impacts, and follow-ups. via 'update_memory'

**log**
   - Append a row to `docs/ops/AGENTS_LOG.md` describing the actions, artifacts, and next steps.
