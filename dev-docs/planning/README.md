# HexTrackr Linear Planning System

This directory contains the formal workflow system for HexTrackr development using Linear for issue tracking and structured planning.

## Core Philosophy

**Plan → Document → Implement**

Never start coding without a complete plan. Always document every change before implementing. This ensures any Claude agent can pick up exactly where another left off.

## Directory Structure

```
/dev-docs/planning/
├── README.md                           # This file
├── HEXTRACKR_LINEAR_WORKFLOW.md        # Complete workflow documentation
├── QUICK_REFERENCE.md                  # Quick commands and checklists
├── AGENT_HANDOFF_PROTOCOL.md           # Agent continuity procedures
├── structured-vibe-coding-workflow.md  # Original research document
├── templates/                          # Reusable templates
│   ├── SESSION_PLAN.md                 # Main planning template
│   ├── BUG_REPORT.md                   # Bug issue template
│   └── FEATURE_REQUEST.md              # Feature issue template
├── active/                             # Current work in progress
│   └── v1.0.XX-feature-name/
│       ├── SESSION_PLAN.md
│       ├── research/
│       └── implementation/
└── completed/                          # Archived completed work
    └── v1.0.XX-feature-name/
```

## Quick Start

### New Feature or Bug
1. Create Linear issue with appropriate template
2. Copy SESSION_PLAN.md template to new planning folder
3. Complete research phase (Plan Mode)
4. Document implementation plan
5. Begin implementation following session pattern

### Continuing Existing Work
1. Review SESSION_PLAN.md in active folder
2. Check Linear issue status
3. Pick up from last completed checkbox
4. Update session logs as you work

### Agent Handoff
1. Follow AGENT_HANDOFF_PROTOCOL.md procedures
2. Update SESSION_PLAN.md with detailed handoff notes
3. Commit all changes with descriptive messages

## Key Files

| File | Purpose |
|------|---------|
| `HEXTRACKR_LINEAR_WORKFLOW.md` | Complete workflow documentation |
| `QUICK_REFERENCE.md` | Commands and checklists for daily use |
| `AGENT_HANDOFF_PROTOCOL.md` | Ensuring continuity between agents |
| `templates/SESSION_PLAN.md` | Main planning document template |

## Success Criteria

- **Context Preservation**: Next agent can start within 5 minutes
- **Progress Visibility**: Clear checkbox completion tracking
- **Implementation Quality**: Another developer could implement from plans
- **Session Efficiency**: 80% of planned tasks completed per session

## Integration with HexTrackr

This workflow integrates with:
- **CONSTITUTION.md**: Follows all project requirements
- **CLAUDE.md**: Maintains architectural patterns
- **Linear MCP**: Issue tracking and project management
- **Claude-Context MCP**: Codebase research and discovery
- **Memento MCP**: Knowledge graph and session summaries

## Getting Started

1. **Read**: `HEXTRACKR_LINEAR_WORKFLOW.md` for complete understanding
2. **Bookmark**: `QUICK_REFERENCE.md` for daily development
3. **Practice**: Create your first issue using the templates
4. **Refine**: Adapt the workflow to your preferences over time

---

*This system enables consistent, documented development that maintains context across agents and sessions while preserving the flexibility of "vibe coding" for solo developers.*