# RPI (Research → Plan → Implement) — Lightweight Workflow

**Goal:** Make every change safe, explainable, and repeatable across tools (Claude Code, Codex CLI, Gemini CLI) using three tiny Markdown files per change.

## Issue structure (Linear)
- **Parent**: `RESEARCH: <short name>` → e.g. `HEX-123`
- **Children**: 
  - `PLAN: <same short name>` (child of research) — e.g. `HEX-124`
  - `IMPLEMENT: <same short name>` (child of plan) — e.g. `HEX-125`

## File Naming (checked into repo alongside the feature branch)
```
/docs/rpi/HEX-123/
  HEX-123.RESEARCH.md
  HEX-124.PLAN.md
  HEX-125.IMPLEMENT.md
```

## Guardrails
1. **Never edit code before a git checkpoint** (clean worktree; commit with a snapshot message).
2. **Research Readiness Gate must be ✅** before creating/starting the Plan.
3. **Plan Preflight must be ✅** before starting Implement.
4. Commit every **1–5 tasks** (as defined in Plan) with clear messages and references to task IDs.
5. If anything feels ambiguous: **pause, ask, and revise the doc** (don’t guess).

## Starter prompt (paste to Claude/Codex/Gemini at the beginning of a session)
> You are executing an RPI workflow. Read `/docs/rpi/HEX-123/HEX-123.RESEARCH.md` first.
> Then follow the Readiness Gate. If ✅, proceed to `/docs/rpi/HEX-124.PLAN.md` Preflight.
> Work only on the single smallest task that is explicitly marked “NEXT” in the Plan.
> After each task, run tests/checks listed in the Plan, propose a git commit message, and stop for review.
> If anything is ambiguous, ask me exactly the questions in the Auto‑Quiz section. Do not proceed until clarified.
> Use available MCPs: Linear, Memento/Neo4j, Codebase Search/AST, Context7 docs fetcher.

## Tooling Hints
- **Linear MCP**: sync status/links; keep titles prefixed (`RESEARCH:`, `PLAN:`, `IMPLEMENT:`).
- **Memento MCP (Neo4j)**: pull past related work, decisions, and code notes for context.
- **Codebase MCP (semantic + AST)**: enumerate impacted files, surfaces, and public APIs.
- **Context7**: snapshot current framework/library standards relevant to this change.

---

**Definition of Done (DoD) for a change**
- Research: Readiness Gate ✅ with risks, rollback, test/validation notes.
- Plan: Step-by-step tasks (1–2h chunks), explicit before/after code blocks, validation & backout.
- Implement: All plan tasks checked ✅, tests pass, PR checklist completed, Linear issues updated.

*Version: 2025-10-08*
