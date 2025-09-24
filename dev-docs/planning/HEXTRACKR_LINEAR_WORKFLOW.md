# HexTrackr Linear Development Workflow

## Overview

This document defines the formal workflow for HexTrackr development using Linear for issue tracking and structured planning. The goal is to enable any Claude agent to pick up exactly where the previous session left off.

## Core Principle: Plan → Document → Implement

**NEVER implement without a plan. ALWAYS document before coding.**

## Workflow Structure

### 1. Issue Creation Phase (Planning Mode)

When identifying a new feature or bug:

1. **Create Linear Issue** with format:
   - Title: `v1.0.XX: [Feature Name]`
   - Description: Link to SESSION_PLAN.md
   - Labels: Type (Bug/Feature/Enhancement) + Priority (High/Medium/Low)

2. **Create Planning Folder**:
   ```
   /dev-docs/planning/v1.0.XX-[feature-name]/
   ├── SESSION_PLAN.md      # Main planning document
   ├── research/            # Research findings
   └── implementation/      # Code snippets and notes
   ```

3. **Research & Document** (Still in Planning Mode):
   - Use Claude-Context to search codebase
   - Use Context7 for framework best practices
   - Document all findings in SESSION_PLAN.md
   - Identify affected files and dependencies

### 2. Plan Review Phase

Before any implementation:

1. **Complete SESSION_PLAN.md** with:
   - Problem statement
   - Research findings
   - Implementation steps (as checkboxes)
   - Success criteria
   - Test plan

2. **Update Linear Issue**:
   - Add implementation checkboxes
   - Set to "Todo" status
   - Add estimated sessions

### 3. Implementation Phase (Build Mode)

Each coding session (2 hours):

1. **Session Start**:
   ```bash
   # Review the plan
   cat /dev-docs/planning/v1.0.XX-feature/SESSION_PLAN.md

   # Move Linear issue to "In Progress"
   # Pick up from last completed checkbox
   ```

2. **During Session**:
   - Work through checkboxes sequentially
   - Commit after each checkbox completion
   - Update SESSION_PLAN.md with notes

3. **Session End**:
   - Update SESSION_PLAN.md with session log
   - Check off completed items in Linear
   - Commit all changes with descriptive message
   - Create Memento entity for session summary

### 4. Testing & Completion Phase

1. **Testing**:
   - Run all tests defined in plan
   - Docker testing on port 8989
   - Update documentation

2. **Completion**:
   - Move Linear issue to "Done"
   - Archive planning folder to `/completed/`
   - Update CHANGELOG.md

## File Organization

```
/dev-docs/planning/
├── HEXTRACKR_LINEAR_WORKFLOW.md    # This file
├── templates/                       # Reusable templates
│   ├── SESSION_PLAN.md
│   ├── BUG_REPORT.md
│   └── FEATURE_PLAN.md
├── active/                          # Current work
│   └── v1.0.XX-feature/
└── completed/                       # Archived plans
    └── v1.0.XX-feature/
```

## Linear Issue States

1. **Backlog**: Identified but not researched
2. **Todo**: Researched and planned, ready to implement
3. **In Progress**: Currently being worked on
4. **In Review**: Implementation complete, testing needed
5. **Done**: Tested, documented, and merged

## Agent Handoff Protocol

### For the Outgoing Agent

1. **Update SESSION_PLAN.md**:
   - Mark all completed checkboxes
   - Add detailed session notes
   - Document any blockers or decisions

2. **Update Linear**:
   - Update checkbox progress
   - Add comment with session summary
   - Move to appropriate status

3. **Create Memento Entity**:
   ```
   Entity: HEXTRACKR:SESSION:[DATE]
   - Summary of completed work
   - Next steps
   - Any important context
   ```

4. **Commit Everything**:
   ```bash
   git add -A
   git commit -m "Session [date]: [what was completed]"
   ```

### for the Incoming Agent

1. **Load Context**:
   ```bash
   # Check current branch
   git status

   # Review plan
   cat /dev-docs/planning/active/*/SESSION_PLAN.md

   # Check Linear issue
   # Review last commit
   git log -1
   ```

2. **Verify State**:
   - Check which checkboxes are complete
   - Read session notes for context
   - Identify next task to work on

3. **Continue Work**:
   - Pick up from next unchecked item
   - Follow the established patterns
   - Maintain consistency with previous work

## Success Metrics

- **Context Preservation**: Next agent can start work within 5 minutes
- **Progress Visibility**: Clear checkbox completion in Linear
- **Documentation Quality**: Another developer could implement from plans
- **Session Efficiency**: 80% of planned tasks completed per session

## Common Commands

```bash
# Start a session
cd /Volumes/DATA/GitHub/HexTrackr
git pull
cat /dev-docs/planning/active/*/SESSION_PLAN.md

# During work
git add -A && git commit -m "WIP: [current task]"

# End session
git add -A
git commit -m "Session [date]: Completed [tasks]"
# Update Linear issue
# Create Memento entity
```

## Important Rules

1. **NEVER** start coding without a SESSION_PLAN.md
2. **ALWAYS** update checkboxes after completing tasks
3. **COMMIT** after each significant step
4. **DOCUMENT** decisions and blockers immediately
5. **TEST** in Docker before marking as complete

---

*This workflow ensures continuity between agents and sessions, maintaining momentum while preventing context loss.*