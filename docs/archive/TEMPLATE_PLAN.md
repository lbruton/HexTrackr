---
type: plan
issue_id: "HEX-YYY"                 # child of research
parent_issue: "HEX-XXX"             # research issue id
title: "PLAN: <same short name>"
status: draft                       # draft → ready
branching_strategy: "feature/<slug>"
sessions_1_to_2_hours: true
commit_every_n_tasks: 3
dod_ref: "/docs/rpi/definition_of_done.md"
created: "2025-10-08"
---

# Summary
Short summary of the approach, referencing the Research doc conclusions.

# Preflight (all must be ✅ before implementation)
- [ ] Branch strategy defined and created (no uncommitted changes)
- [ ] Feature flag / config toggle plan written
- [ ] Test/validation approach clear (unit/manual/telemetry)
- [ ] Backout plan validated and **tested in dev** if feasible
- [ ] Task sizes fit 1–2h windows

# Task Breakdown (authoritative source of truth)
| ID | Step (action verb) | Est (min) | Files/Modules | Validation | Risk/Notes | Recommended Agent |
|----|--------------------|-----------|---------------|------------|------------|-------------------|
| 1.1 | … | 60 | `path/to/file.js` | run `npm test -g <suite>` | low | Claude Code |
| 1.2 | … | 45 | … | manual check: … | low | Codex CLI |
| 1.3 | … | 75 | … | add metric: … | med | Gemini CLI |

> Mark **one** row as **NEXT** before you hand this to an agent.

# Code Changes (before/after for each task)
## Task 1.1 — <title>
**Before**
```<lang>
// paste snapshot of current code here
```
**After**
```<lang>
// the intended result
```
**Notes**: what changed & why. Link to Research sections if helpful.

## Task 1.2 — <title>
**Before**
```<lang>
```
**After**
```<lang>
```
**Notes**: …

# Validation Plan
- Unit tests to run: `…`
- Manual checks: `…`
- Telemetry to verify: logs/metrics/traces `…`
- UI walkthrough script (if UI): `…`

# Backout / Rollback
- Per‑task revert steps (git file list, commands)
- Global rollback: feature flag off, revert commit hash, restore backup

# Dependencies & Sequencing
- External services, keys, or migrations
- Ordering constraints (e.g., 1.1 must precede 1.3)

## Auto‑Quiz (Agent → ask me before starting NEXT task)
1. Confirm the **single** task marked **NEXT**.
2. Confirm **validation** steps for this task.
3. Confirm **commit message** template and scope (issue IDs, task ID).
4. Confirm **breakpoint** (after this task or a small batch).

*When Preflight is ✅, move to IMPLEMENT with only the NEXT task enabled.*
