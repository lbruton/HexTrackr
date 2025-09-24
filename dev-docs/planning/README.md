# HexTrackr Three-Mode Development Workflow

## Quick Start Pattern

**User**: "Hey Claude, we need to fix X"

**Claude Response**:
1. "Let me enter PLANNING_MODE" → Creates Linear issue with breakdown
2. "Let me enter RESEARCH_MODE" → Investigates and documents findings
3. "Let me enter IMPLEMENT_MODE" → Executes phase by phase

## The Three Modes

### 🎯 PLANNING_MODE
**Purpose**: Break down any request into actionable 1-2 hour sessions
**Output**: Linear issue with clear phases and checkboxes
**No coding allowed**: Only planning and breakdown

### 🔍 RESEARCH_MODE
**Purpose**: Investigate codebase and document findings
**Output**: Linear comments with research findings
**No coding allowed**: Only discovery and documentation

### ⚙️ IMPLEMENT_MODE
**Purpose**: Execute the plan created in planning mode
**Output**: Code changes following Linear checkboxes
**Focus**: Implementation only, no planning changes

## Mode Instructions

Each mode has its own instruction file with specific steps:

- [`modes/PLANNING_MODE.md`](modes/PLANNING_MODE.md) - How to create plans
- [`modes/RESEARCH_MODE.md`](modes/RESEARCH_MODE.md) - How to research effectively
- [`modes/IMPLEMENT_MODE.md`](modes/IMPLEMENT_MODE.md) - How to execute plans

## Linear as Single Source of Truth

- **Planning**: Issue description contains the breakdown
- **Research**: Comments contain all findings
- **Implementation**: Checkboxes track progress
- **No duplicate files**: Linear contains everything

## Directory Structure

```
/dev-docs/planning/
├── README.md                # This file
├── modes/                   # Mode instruction files
│   ├── PLANNING_MODE.md    # Planning instructions
│   ├── RESEARCH_MODE.md    # Research instructions
│   └── IMPLEMENT_MODE.md   # Implementation instructions
├── templates/              # Reusable templates (for reference)
└── archive/                # Old workflow docs (for reference)
```

## Key Benefits

- **Simple**: Three clear modes instead of complex nested processes
- **Consistent**: Same pattern every time regardless of task size
- **Linear-focused**: Single source of truth, no duplicate tracking
- **Flexible**: Works for 1-hour fixes or multi-day features
- **Trackable**: Progress always visible in Linear

## Getting Started

1. Read the mode instructions that match your current task
2. Follow the pattern: Planning → Research → Implement
3. Use Linear for all tracking and documentation
4. Each mode has clear boundaries and deliverables

---

*This simplified workflow eliminates SESSION_PLAN.md maintenance while keeping all the benefits of structured development through Linear's built-in features.*