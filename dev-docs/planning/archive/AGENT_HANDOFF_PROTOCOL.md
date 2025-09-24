# Agent Handoff Protocol for HexTrackr Development

## Purpose

This document ensures seamless continuity when one Claude agent hands off work to another. The goal is for the new agent to understand the context and continue work within 5 minutes.

## Critical Principle

**Any agent should be able to pick up exactly where another left off by reading a single SESSION_PLAN.md file.**

## Handoff Checklist for Outgoing Agent

### 1. Update SESSION_PLAN.md (Required)

Update the current session log section with:
```markdown
### Session [N] - [YYYY-MM-DD HH:MM]
**Duration**: [X] hours [X] minutes
**Status**: Complete/Interrupted/Paused

**Completed**:
- ✅ [Specific task with details]
- ✅ [Specific task with details]
- ⚠️ [Partially completed task - explain what's left]

**In Progress**:
- 🔄 [Current task and exact status]
- 📍 **Exact stopping point**: [File, function, line number]

**Next Priority**:
- 🎯 [Exactly what the next agent should work on]
- 📂 [Which files need to be modified]
- 🧪 [What to test after changes]

**Context for Next Agent**:
- [Any important discoveries or decisions made]
- [Any blockers encountered]
- [Any changes to the original plan]

**Commit Hash**: `[git commit hash]`
```

### 2. Update Linear Issue (Required)

- Update issue description with current progress
- Add comment with session summary
- Update issue status:
  - "In Progress" if more work needed
  - "In Review" if ready for testing
  - "Done" if complete

### 3. Commit All Changes (Required)

```bash
git add -A
git commit -m "Session [date]: [specific accomplishments]

- Completed: [task 1], [task 2]
- In progress: [current task and status]
- Next: [what's next]

Handoff ready for next agent."
```

### 4. Create Memento Entity (If Significant Progress)

Only create if substantial work completed (not for minor sessions):

```
Entity Name: HEXTRACKR:SESSION:[DATE]-[FEATURE]
Type: PROJECT:DEVELOPMENT:SESSION

Observations:
- [Date/time in ISO format]
- ABSTRACT: [One sentence summary of accomplishments]
- SUMMARY: [2-3 sentences about what was done]
- FILES_MODIFIED: [List of files changed]
- NEXT_STEPS: [What the next agent should focus on]
- BLOCKERS: [Any issues that need resolution]
```

## Context Loading for Incoming Agent

### 1. Quick Status Check (2 minutes)

```bash
cd /Volumes/DATA/GitHub/HexTrackr

# Check git status
git status
git log -3 --oneline

# Find active planning documents
ls -la /dev-docs/planning/active/
```

### 2. Load Context (3 minutes)

```bash
# Read the SESSION_PLAN.md
cat /dev-docs/planning/active/v1.0.XX-feature/SESSION_PLAN.md

# Focus on these sections:
# - Executive Summary (current status)
# - Last session log (what was just completed)
# - Agent Handoff Notes (specific instructions)
# - Next Priority section
```

### 3. Verify Understanding

Before starting work, confirm you understand:
- What was the last thing completed?
- What is the next specific task?
- Which files need to be modified?
- Are there any blockers or important context?

## Context Loading Patterns

### For Feature Development
```bash
# Quick context load
grep -A 10 "## Executive Summary" /dev-docs/planning/active/*/SESSION_PLAN.md
grep -A 20 "### Session.*$(date +%Y-%m-%d)" /dev-docs/planning/active/*/SESSION_PLAN.md
grep -A 10 "**Next Priority**" /dev-docs/planning/active/*/SESSION_PLAN.md
```

### For Bug Fixes
```bash
# Check what's been diagnosed
grep -A 5 "## Problem Statement" /dev-docs/planning/active/*/SESSION_PLAN.md
grep -A 10 "## Initial Investigation" /dev-docs/planning/active/*/SESSION_PLAN.md
```

## Common Handoff Scenarios

### Mid-Implementation Handoff

**Outgoing Agent Must Document**:
- Exact file and function being modified
- What code has been added/changed
- What still needs to be implemented
- Any compile/runtime errors encountered

**Incoming Agent Should**:
- Review the exact code changes made
- Understand the implementation approach
- Continue with the same patterns and style

### Research-to-Implementation Handoff

**Outgoing Agent Must Document**:
- All research findings and decisions
- Chosen implementation approach and rationale
- Files identified for modification
- Implementation plan with priorities

**Incoming Agent Should**:
- Review research findings
- Understand why decisions were made
- Follow the established implementation plan

### Testing Phase Handoff

**Outgoing Agent Must Document**:
- What has been implemented
- What testing has been done
- What tests are still needed
- Any bugs found during testing

**Incoming Agent Should**:
- Run the completed tests first
- Continue with remaining test plan
- Fix any bugs found

## Red Flags - When Handoff Is Not Ready

❌ **DO NOT ACCEPT HANDOFF IF**:
- No SESSION_PLAN.md exists
- Last session log is missing or vague
- No clear next steps documented
- Code is uncommitted
- Conflicting information between git log and plan

❌ **REQUIRE CLARIFICATION IF**:
- Multiple approaches mentioned without clear decision
- Blockers mentioned without resolution strategy
- Technical terms used without explanation
- References to undocumented decisions

## Emergency Context Recovery

### If Context Is Lost or Unclear

1. **Check Recent Memento Entities**:
   ```bash
   # Use Memento search for recent HexTrackr work
   ```

2. **Analyze Git History**:
   ```bash
   git log --oneline -10
   git show HEAD  # See what was last changed
   ```

3. **Check Linear Issues**:
   ```bash
   # Use Linear MCP tools to check recent issues
   # Look for comments and status updates
   ```

4. **Review Recent Code Changes**:
   ```bash
   git diff HEAD~5..HEAD  # See recent changes
   ```

### If No Clear Plan Exists

**STOP** - Do not start implementation without a plan:

1. Create SESSION_PLAN.md following template
2. Research the codebase with Claude-Context
3. Document findings and create implementation plan
4. Then begin implementation

## Quality Gates for Handoff

### Before Leaving (Outgoing Agent)
- [ ] SESSION_PLAN.md updated with complete session log
- [ ] Git commits are clean and descriptive
- [ ] Linear issue reflects current status
- [ ] Next steps are clearly documented
- [ ] Any blockers are documented with context

### Before Starting (Incoming Agent)
- [ ] Can identify exactly what was last completed
- [ ] Understand what the next task is
- [ ] Know which files need to be modified
- [ ] Understand any important context or decisions
- [ ] Have verified git status and linear status match expectations

## Success Metrics

### Effective Handoff
- New agent productive within 5 minutes
- No need to ask clarifying questions
- Implementation continues with same style/patterns
- No context loss between sessions

### Poor Handoff (Avoid)
- New agent spends >15 minutes understanding context
- Need to re-research already completed work
- Implementation style changes mid-feature
- Previous work gets accidentally undone

---

*This protocol ensures HexTrackr development can continue seamlessly across multiple agents and sessions.*