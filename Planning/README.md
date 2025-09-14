# HexTrackr S-R-P-T Planning Methodology

*Comprehensive Specification-Research-Planning-Task development methodology*

## Overview

The S-R-P-T (Specification-Research-Planning-Task) methodology is our evolved approach to feature development that ensures complete understanding before implementation. This four-phase system prevents the "guessing game" problem where implementations break because requirements weren't fully specified and validated through expert research.

## Four-Phase Workflow

### 📝 Phase 1: Specification (S-files)

**Focus**: WHAT and WHY (Requirements & Alignment)
**Duration**: 30-90 minutes
**Location**: `Specification/`

Clear requirements gathering through dialogue:

- **Problem Statement**: What specific problem are we solving?
- **Success Criteria**: Measurable, testable outcomes
- **Constraints & Assumptions**: Documented for validation
- **Open Questions**: "NEEDS CLARIFICATION" items for research
- **Scope Boundaries**: What's included/excluded

**Commands**: `/specify [feature-name]`
**Example**: `S001-dark-mode-enhancement.md`

### 🔬 Phase 2: Research (R-files)

**Focus**: HOW (Multi-Agent Technical Analysis)
**Duration**: 1-4 hours
**Location**: `Research/`

Multi-agent technical analysis and validation:

- **Assumption Validation**: Test every assumption from Specification
- **Three Stooges Pattern**: Frontend, backend, edge cases analysis
- **Technical Approaches**: Multiple implementation strategies evaluated
- **Current State Analysis**: Existing codebase integration points
- **Risk Assessment**: Technical challenges with mitigation strategies

**Tools to Use**:

- Expert agents (`css-expert`, `security-auditor`, `performance-engineer`)
- Multi-agent research patterns (parallel analysis)
- Sequential thinking for complex problems

**Commands**: `/research [spec-number]`
**Example**: `R001-dark-mode-technical-analysis.md`

### 📋 Phase 3: Planning (P-files)

**Focus**: HOW (Technical Implementation Compilation)
**Duration**: 1-2 hours
**Location**: `Plans/`

Synthesis of Specification + Research into actionable plan:

- **Requirements Integration**: S00X requirements + R00X findings
- **Implementation Strategy**: Optimal approach based on research
- **Delegation Strategy**: Claude/Codex/Gemini/Manual task assignments
- **Risk Mitigation**: Specific actions for identified risks
- **Testing Strategy**: Validation approach for success criteria

**Commands**: `/plan [spec-number] [research-number]`
**Example**: `P001-dark-mode-implementation-plan.md`

### ✅ Phase 4: Tasks (T-files)

**Focus**: Coordinated Execution
**Duration**: Variable (implementation time)
**Location**: `Tasks/`

Multi-tool coordinated execution with complete context:

- **Context-Complete Execution**: All tasks have full S-R-P-T context
- **Optimal Delegation**: Right tool for each task type
- **Progress Tracking**: TodoWrite integration for task monitoring
- **Quality Validation**: Verify against original specification
- **Coordination Management**: Manage work across multiple tools

**Commands**: `/tasks [plan-number]`
**Example**: `T001-dark-mode-implementation-tasks.md`

## Directory Structure

```
Planning/
├── README.md                 # This file - S-R-P-T quick reference
├── Specification/            # Phase 1: Requirements & alignment (WHAT/WHY)
│   ├── S000-TEMPLATE.md      # Specification template
│   ├── S001-feature-name.md  # [COMPLETED] examples
│   ├── S002-tickets-grid.md  # Active specifications
│   └── S003-authentication.md
├── Research/                 # Phase 2: Multi-agent analysis (HOW to approach)
│   ├── R000-TEMPLATE.md      # Research template
│   ├── R001-feature-analysis.md
│   └── R002-security-review.md
├── Plans/                    # Phase 3: Implementation compilation (HOW to implement)
│   ├── P000-TEMPLATE.md      # Planning template
│   └── P001-implementation-plan.md
├── Tasks/                    # Phase 4: Coordinated execution (DO)
│   ├── T000-TEMPLATE.md      # Task template
│   └── T001-implementation-tasks.md
├── Completed/                # Archived completed S-R-P-T cycles
├── WORKFLOW.md               # Complete S-R-P-T methodology
└── planning-roadmap.md       # Active project roadmap
```

## Naming Conventions

### S-R-P-T Cycle Numbering

All phases use the same number for related work:

### Specification (S-files)

- `S001-dark-mode-enhancement.md`
- `S002-tickets-ag-grid-migration.md`
- `S003-user-authentication-system.md`

### Research (R-files)

- `R001-dark-mode-analysis.md` ← Validates S001
- `R002-ag-grid-research.md` ← Validates S002
- `R003-auth-security-review.md` ← Validates S003

### Planning (P-files)

- `P001-dark-mode-plan.md` ← Compiles S001 + R001
- `P002-ag-grid-plan.md` ← Compiles S002 + R002
- `P003-auth-plan.md` ← Compiles S003 + R003

### Tasks (T-files)

- `T001-dark-mode-tasks.md` ← Executes P001
- `T002-ag-grid-tasks.md` ← Executes P002
- `T003-auth-tasks.md` ← Executes P003

## Example S-R-P-T Workflow: Dark Mode Enhancement

### 📝 S001: Specification Phase

```markdown
# S001: Dark Mode Enhancement

*Specification Phase: WHAT and WHY*

## Problem Statement
Current dark mode lacks visual hierarchy - all surfaces use same color.

## Success Criteria
- [ ] Distinct visual layers (cards, modals, tables) with 2.7:1 contrast ratio
- [ ] Maintains WCAG AA accessibility standards
- [ ] Zero breaking changes to existing functionality

## Open Questions & Clarifications Needed
- [CLARIFIED] What specific contrast ratios are acceptable?
- [CLARIFIED] Which components need surface hierarchy?

## Next Steps
→ Research Phase (R001): Multi-agent technical analysis
```

### 🔬 R001: Research Phase

```markdown
# R001: Dark Mode Technical Analysis

*Research Phase: HOW to validate assumptions*

## Assumption Validation Results
✅ CSS custom properties approach viable
✅ No framework conflicts with surface hierarchy
❌ Chart themes need different approach than assumed

## Multi-Agent Research Findings
- **CSS Expert**: Surface hierarchy variables optimal approach
- **Accessibility Expert**: 2.7:1 contrast ratio recommendations
- **Frontend Expert**: Chart integration requires theme detection

## Implementation Recommendation
Surface hierarchy CSS variables with centralized theme management
```

### 📋 P001: Planning Phase

```markdown
# P001: Dark Mode Implementation Plan

*Planning Phase: HOW to implement (S001 + R001 synthesis)*

## Implementation Strategy
Based on S001 requirements and R001 research findings

## Delegation Strategy
- **Claude Code**: CSS architecture, theme management logic
- **Codex**: Variable updates, simple style modifications
- **Manual Review**: Visual hierarchy validation, accessibility testing

## Task Breakdown
Phase 1: CSS Foundation (Claude) → Phase 2: Component Updates (Codex) → Phase 3: Testing (Manual)
```

### ✅ T001: Tasks Phase

```markdown
# T001: Dark Mode Implementation Tasks

*Tasks Phase: Coordinated execution with full S-R-P-T context*

## Phase 1: Foundation (Claude Code - 1.5 hours)
- [ ] Implement surface hierarchy CSS variables per R001 research
- [ ] Create centralized theme management per P001 delegation

## Phase 2: Component Updates (Codex - 1 hour)
- [ ] Update component styles using new variables
- [ ] Apply hierarchy across cards, modals, tables

## Phase 3: Validation (Manual - 30 minutes)
- [ ] Verify S001 success criteria met
- [ ] Test accessibility compliance per research findings
```

## Validation Best Practices

*Lessons learned from real implementation failures*

### Critical Validation Points

Based on analysis of recent bugs and implementation failures, these validation checkpoints prevent major issues:

#### Environment & State Validation

- [ ] **Both Themes Tested**: If UI changes, verify both light and dark modes work
- [ ] **CSS Variable Scoping**: Ensure variables are defined at appropriate scope levels
- [ ] **Framework Integration**: Test that custom code works with Bootstrap/Tabler overrides
- [ ] **Build Process**: Verify development and production builds work identically

#### Research Phase Validation

- [ ] **Assumption Testing**: Actually test every assumption, don't just theorize
- [ ] **Codebase Review**: Agents must read actual code, not assume implementations
- [ ] **Edge Case Analysis**: Consider all supported states (themes, browsers, devices)
- [ ] **Integration Points**: Verify how changes affect existing components

#### Implementation Validation

- [ ] **Success Criteria Mapping**: Each task directly addresses a specific S001 criterion
- [ ] **Regression Testing**: Test areas that might be affected by changes
- [ ] **Multi-Environment Testing**: Validate across all supported configurations
- [ ] **Documentation Accuracy**: Ensure documentation matches actual implementation

### Common Failure Patterns to Avoid

#### "Tunnel Vision" Research

**Problem**: Agents focus only on the specific area being changed
**Example**: Dark mode research that ignores light mode impact
**Prevention**: Always include "What could this break?" in research scope

#### CSS Scoping Assumptions

**Problem**: Assuming variables are globally available when they're scoped
**Example**: `--hextrackr-surface-1` defined only in `[data-bs-theme="dark"]`
**Prevention**: Validate variable definitions across all theme states

#### Framework Override Conflicts

**Problem**: Custom CSS gets overridden by framework specificity
**Example**: Bootstrap modal styles overriding custom surface hierarchy
**Prevention**: Test CSS specificity and use appropriate selectors

#### Theme Transition Gaps

**Problem**: Components work in one theme but break during theme switching
**Example**: Modals created without theme attributes in JavaScript
**Prevention**: Test theme switching with components in all states

## Best Practices

### Specification Phase

- ✅ Focus on WHAT and WHY, never HOW
- ✅ Use measurable, testable success criteria
- ✅ Mark unclear items as "NEEDS CLARIFICATION"
- ✅ Document assumptions for validation
- ❌ Don't assume technical solutions

### Research Phase

- ✅ Deploy multiple expert agents in parallel
- ✅ Validate every assumption from specification
- ✅ Use "Three Stooges" pattern for comprehensive coverage
- ✅ Answer all clarification items from specification
- ❌ Don't research without clear specification

### Planning Phase

- ✅ Compile specification requirements with research findings
- ✅ Optimize delegation strategy for task types
- ✅ Include specific file references and implementation details
- ✅ Plan testing strategy for all success criteria
- ❌ Don't plan without completed research

### Tasks Phase

- ✅ Execute with complete S-R-P-T context
- ✅ Use optimal tool for each task type
- ✅ Validate against original specification requirements
- ✅ Coordinate between multiple execution environments
- ❌ Don't execute without comprehensive planning

## Integration with Existing Tools

### TodoWrite Integration

Tasks phase integrates with TodoWrite for progress tracking:

```javascript
// S-R-P-T context in TodoWrite format
[
  {"content": "Implement CSS variables per R001 research", "status": "pending", "activeForm": "Implementing CSS variables"},
  {"content": "Update components per P001 delegation", "status": "pending", "activeForm": "Updating component styles"},
  {"content": "Validate against S001 success criteria", "status": "pending", "activeForm": "Validating implementation"}
]
```

### Multi-Agent Research Patterns

Research phase leverages specialized agents:

- **Parallel Pattern**: `css-expert` + `accessibility-expert` + `performance-engineer`
- **Three Stooges**: Frontend analysis + Backend review + Edge cases
- **Sequential Deep Dive**: Initial analysis → Focused research → Integration study

### Boot Commands

Each phase has dedicated boot commands:

- `/specify [feature-name]` - Initialize specification dialogue
- `/research [spec-number]` - Launch multi-agent technical analysis
- `/plan [spec-number] [research-number]` - Compile implementation plan
- `/tasks [plan-number]` - Execute coordinated implementation

### Memory System Integration

Store S-R-P-T patterns in Memento:

```javascript
// Document methodology improvements
mcp__memento__create_entities([{
  name: "SRPT-WORKFLOW-PATTERN-001",
  entityType: "PROJECT:METHODOLOGY:SRPT",
  observations: ["Four-phase approach eliminated implementation failures", "Multi-agent research prevented 5 technical debt issues", "Delegation optimization improved efficiency by 40%"]
}])
```

## Why S-R-P-T Works

1. **Prevents Guessing Games**: Clear specifications eliminate assumptions
2. **Leverages AI Strengths**: Multi-agent research provides comprehensive analysis
3. **Optimizes Delegation**: Right tool for each task type maximizes efficiency
4. **Maintains Traceability**: Each phase references and builds on previous work
5. **Scales with Complexity**: More complex projects get proportionally more analysis
6. **Reduces Rework**: Thorough preparation prevents costly implementation changes

## Quick Start Commands

1. **Start Specification**: `/specify feature-name "problem description"`
2. **Launch Research**: `/research S001` (with multi-agent analysis)
3. **Compile Plan**: `/plan S001 R001` (synthesis of spec + research)
4. **Execute Tasks**: `/tasks P001` (coordinated multi-tool implementation)
5. **Store Learnings**: Document patterns in Memento for future sessions

## S-R-P-T Command Reference

| Phase | Command | Focus | Duration | Output |
|-------|---------|-------|----------|---------|
| **S** | `/specify` | WHAT/WHY | 30-90 min | Clear requirements |
| **R** | `/research` | HOW (validate) | 1-4 hours | Technical analysis |
| **P** | `/plan` | HOW (implement) | 1-2 hours | Implementation plan |
| **T** | `/tasks` | DO | Variable | Working solution |

---

*The S-R-P-T methodology evolves with our understanding. This comprehensive approach ensures successful feature delivery through systematic specification, research, planning, and execution.*
