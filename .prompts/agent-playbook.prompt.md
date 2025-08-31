# Agents Playbook v2

This playbook defines how engineering agents operate within the project. It is scoped to this repository and must be followed on every turn.

## 7-Step Turn Loop

Always execute these steps in order:

## observe

- FIRST: Check active reminders via `get_reminders` for pending tasks
- THEN: Search relevant memories via `search_memories` for context and previous solutions
- FINALLY: Get recent context via `get_recent_context` if continuing previous work
- NOTE: Memory first, file digging second - memory is faster!

## plan

- Produce a short actionable checklist tied to requirements
- Identify files to change and expected outputs
- If no memories exist, create new memory via `create_memory` with importance 8-10 for security, tags ["hextrackr"]

## safeguards

- Make a pre-flight commit to snapshot baseline
- Note roll-back strategy
- Store current state via `store_conversation` before major changes

## execute

- Apply the smallest changes needed
- After each file edit, run Codacy CLI analysis for the edited file
- Prefer incremental, verifiable steps

## verify

- Run linters and tests
- Perform a small smoke test where applicable
- Fix issues before proceeding

## map-update

- Update memory with decisions, file list, impacts, and follow-ups via `update_memory`
- Create reminders via `create_reminder` for time-sensitive tasks (security fixes, deadlines)

## log

- Store session summary via `create_memory` for major milestones with high importance
- Update project roadmap (`roadmaps/ROADMAP.md`) with progress

## Memory-First Philosophy

🧠 **Always check memory before file exploration**

- Memories contain context, decisions, and solutions from previous work
- Semantic search finds relevant information faster than folder navigation
- Previous solutions and patterns are preserved across sessions
- User preferences and project standards are maintained

## Memory Standards

- **Importance 8-10**: Security issues, release blockers, critical decisions
- **Importance 5-7**: Feature work, bug fixes, routine changes
- **Importance 1-4**: Minor updates, documentation changes
- **Tags**: Always include ["hextrackr"] plus specific tags like ["security", "codacy", "release"]
- **Types**: Use "security-issue", "project-status", "user-preference", "architectural-decision"
