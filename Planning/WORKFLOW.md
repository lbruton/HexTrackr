# S-R-P-T Workflow System Documentation

*HexTrackr's comprehensive Specification-Research-Planning-Task development methodology*

## Overview

The S-R-P-T (Specification-Research-Planning-Task) workflow system is our evolved approach to feature development that ensures complete understanding before implementation. This four-phase methodology prevents the "guessing game" problem where implementations break because requirements weren't fully specified and validated through expert research.

## Why S-R-P-T? Evolution from P-R-T

The original P-R-T (Planning-Research-Task) workflow was a major improvement over rigid spec-kit approaches, but we discovered that even P-R-T suffered from the "guessing game" where planning was often based on assumptions rather than clear requirements. S-R-P-T adds a crucial Specification phase that ensures complete understanding before any technical work begins.

**P-R-T Problems S-R-P-T Solves:**

- Planning documents mixing requirements with technical assumptions
- Research conducted without clear problem definition
- Implementation breaking because requirements weren't fully understood
- Expert agents analyzing unclear or incomplete specifications

**S-R-P-T Advantages:**

- Clear requirements gathering before any technical analysis
- Multi-agent research with defined success criteria
- Technical planning based on validated research findings
- Task delegation with complete context and clear outcomes
- Prevents "technical solutions looking for problems"

## Four-Phase System

### Phase 1: Specification (S00X) - Requirements & Alignment

**Focus**: WHAT and WHY (clear problem definition)
**Purpose**: Establish clear requirements and success criteria before any technical work

**Our Requirements-First Approach:**

- Start with collaborative requirements gathering through dialogue
- Define clear problem statements and measurable success criteria
- Identify constraints and assumptions that need validation
- Use "NEEDS CLARIFICATION" markers for unclear requirements
- Build shared understanding of the problem space, not solutions
- Document all assumptions for validation in Research phase

**Key Questions:**

- What specific problem are we solving?
- Why is this important to our users and business?
- What are the measurable success criteria?
- What constraints and assumptions exist?
- What clarifications are needed before proceeding?

**Deliverables:**

- Clear problem statement with measurable outcomes
- Well-defined success criteria and constraints
- List of assumptions needing validation
- Open questions marked for research phase
- Requirements ready for technical analysis

### Phase 2: Research (R00X) - Multi-Agent Technical Analysis

**Focus**: HOW (validate assumptions and explore technical approaches)
**Purpose**: Comprehensive technical analysis using specialized expert agents

**Our Multi-Agent Research Approach:**

- Deploy multiple specialized agents for parallel analysis (CSS-expert, security-auditor, etc.)
- Validate all assumptions from Specification phase
- Use "Three Stooges" pattern for comprehensive coverage (frontend, backend, edge cases)
- Explore multiple technical approaches and compare trade-offs
- Research current codebase and integration points
- Answer all "NEEDS CLARIFICATION" items from Specification

**Key Questions:**

- Which technical approaches are viable for our requirements?
- What are the trade-offs between different implementation strategies?
- Which assumptions from Specification are valid/invalid?
- What are the technical risks and how can they be mitigated?
- What does the existing codebase tell us about integration points?

**Deliverables:**

- Validated assumptions with research evidence
- Multiple technical approaches evaluated with trade-offs
- Current codebase analysis and integration assessment
- Risk analysis with specific mitigation strategies
- Research findings ready for technical planning compilation

### Phase 3: Planning (P00X) - Technical Implementation Compilation

**Focus**: HOW to implement (synthesis of Specification + Research)
**Purpose**: Create comprehensive technical implementation plan with delegation strategy

**Our Synthesis Approach:**

- Compile requirements from Specification with validated research findings
- Create detailed technical implementation plan based on expert research
- Break down implementation into phases with clear delegation assignments
- Design testing and validation strategy
- Prepare prompt templates and context for task delegation
- Define success criteria and quality gates

**Key Questions:**

- What is the optimal implementation approach based on our research?
- How should work be distributed between different tools/agents?
- What are the specific tasks and their dependencies?
- How will we validate that requirements are met?
- What context and prompts are needed for effective delegation?

**Deliverables:**

- Comprehensive implementation plan based on S00X + R00X
- Task breakdown with delegation assignments (Claude/Codex/Gemini/Manual)
- Testing and validation strategy
- Risk mitigation plan with specific actions
- Ready-to-execute task list with all context needed

### Phase 4: Tasks (T00X) - Coordinated Execution

**Focus**: DO (with complete context and clear delegation)
**Purpose**: Multi-tool execution with full context from all previous phases

**Our Delegation-Optimized Approach:**

- Execute tasks with complete context from S00X + R00X + P00X phases
- Use optimal tool for each task type (Claude/Codex/Gemini/Manual)
- Include prompt templates and context for effective delegation
- Track progress with clear completion criteria
- Coordinate between different execution environments
- Validate against original specification requirements

**Key Questions:**

- Which tool is optimal for each specific task?
- What context and prompts are needed for effective delegation?
- How will we coordinate work across multiple execution environments?
- How will we validate that each task meets the original specification?
- What are the checkpoints for human review and validation?

**Deliverables:**

- Executed implementation meeting all specification requirements
- Validated against original success criteria from S00X
- Quality assurance completed per P00X testing plan
- Documentation and context updated
- Ready for production deployment or next iteration

## S-R-P-T Philosophy: How We Really Work

### Our Evolved Pattern

This is how S-R-P-T matches our actual collaborative process:

1. **Start with clear dialogue** - We begin by clarifying what we actually want to achieve
2. **Validate through expert research** - Multiple specialized agents explore the problem space
3. **Synthesize into actionable plans** - We compile research into concrete implementation strategy
4. **Execute with optimal delegation** - We use the right tool for each specific task
5. **Maintain traceability** - Each phase builds on and references the previous phases
6. **Iterate when needed** - S-R-P-T adapts to complexity, not artificial constraints

### Key Principles

**Requirements-First Development**

- Clear problem definition prevents solution-seeking behavior
- Specifications establish success criteria before technical exploration
- Assumptions are explicitly documented for validation

**Multi-Agent Research Integration**

- Specialized agents provide comprehensive technical analysis
- Parallel research patterns (Three Stooges approach) ensure thorough coverage
- Research validates assumptions rather than making new ones

**Synthesis-Based Planning**

- Technical plans compile specification requirements with research findings
- Delegation strategy optimizes tool selection for task types
- Implementation confidence comes from thorough preparation, not luck

**Context-Aware Execution**

- Tasks execute with complete context from all previous phases
- Multi-tool coordination leverages strengths of different AI systems
- Validation traces back to original specification requirements

### Why S-R-P-T Works for Us

- **Prevents the guessing game** - Clear specifications eliminate assumptions and reduce implementation failures
- **Leverages AI agent strengths** - Multi-agent research provides comprehensive analysis across all domains
- **Optimizes delegation** - Right tool for each task type maximizes efficiency and quality
- **Maintains traceability** - Each phase builds on previous work, creating clear decision audit trails
- **Reduces rework** - Thorough preparation prevents expensive changes during implementation
- **Scales with complexity** - More complex projects get more thorough specification and research phases

## Document Templates

### Specification Template (S00X)

```markdown
# S00X: [Feature Name]

*Specification Phase: WHAT and WHY*

## Problem Statement
[Clear description of the problem being solved]

## Current Issues
- Issue 1
- Issue 2
- Issue 3

## Goals
### Primary Objective
[Main goal of this feature]

### Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Strategic Approach
### High-Level Strategy
[Overall approach to solving the problem]

### Key Principles
1. Principle 1
2. Principle 2
3. Principle 3

## Project Constraints
### Technical Constraints
- Constraint 1
- Constraint 2

### Business Constraints
- Constraint 1
- Constraint 2

## Success Metrics
- Metric 1: [Definition]
- Metric 2: [Definition]

## Next Steps
→ **Research Phase (R00X)**: Technical analysis and implementation planning

---
*This is a planning document focusing on WHAT we want to achieve and WHY it's important.*
```

### Research Template (R00X)

```markdown
# R00X: [Feature Name] - Technical Research

*Research Phase: HOW to implement*

## Technical Analysis
[Detailed technical investigation]

## Implementation Strategy
### Architecture Overview
[High-level technical approach]

### Technology Stack
- Technology 1: [Reason for selection]
- Technology 2: [Reason for selection]

### Code Changes Required
- File/Module 1: [Changes needed]
- File/Module 2: [Changes needed]

## Risk Assessment
### Technical Risks
- Risk 1: [Mitigation strategy]
- Risk 2: [Mitigation strategy]

### Dependencies
- Dependency 1: [Impact and status]
- Dependency 2: [Impact and status]

## Testing Strategy
[How will this be tested and validated]

## Next Steps
→ **Task Phase (T00X)**: Detailed task breakdown and implementation

---
*This is a research document focusing on HOW to implement the solution technically.*
```

### Task Template (T00X)

```markdown
# T00X: [Feature Name] - Implementation Tasks

*Task Phase: DO the implementation*

## Task Breakdown

### Phase 1: Setup and Preparation
- [ ] Task 1: [Specific action]
- [ ] Task 2: [Specific action]
- [ ] Task 3: [Specific action]

### Phase 2: Core Implementation
- [ ] Task 4: [Specific action]
- [ ] Task 5: [Specific action]
- [ ] Task 6: [Specific action]

### Phase 3: Testing and Validation
- [ ] Task 7: [Specific action]
- [ ] Task 8: [Specific action]
- [ ] Task 9: [Specific action]

## Timeline
- Week 1: Tasks 1-3
- Week 2: Tasks 4-6
- Week 3: Tasks 7-9

## Quality Assurance
### Testing Checklist
- [ ] Unit tests written and passing
- [ ] Integration tests completed
- [ ] Manual testing performed
- [ ] Security review completed

### Completion Criteria
- [ ] All tasks completed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Ready for production deployment

## Next Steps
→ **Completion**: Add to changelog, update roadmap, archive documents

---
*This is a task document focusing on DO - the actual implementation work.*
```

## Workflow Commands

### Starting a New Feature

```bash
# Initialize new planning cycle
"Start P002-API-Authentication"

# This creates:
# - Planning/Plans/P002-api-authentication.md
# - Updates Planning/planning-roadmap.md
# - Sets up TodoWrite tracking
```

### Phase Transitions

```bash
# Complete planning, start research
"Complete P002, start R002"

# Complete research, start tasks
"Complete R002, start T002"

# Complete all tasks
"Complete T002"
```

### Status Management

```bash
# Check current sprint status
"Sprint status"

# Update planning roadmap
"Update planning roadmap"

# Generate completion report
"Planning report"
```

## Best Practices

### Planning Phase

- Be specific about problems and goals
- Include measurable success criteria
- Consider all constraints upfront
- Keep focus on WHAT and WHY

### Research Phase

- Investigate all technical options
- Consider edge cases and risks
- Plan for testing and validation
- Keep focus on HOW

### Task Phase

- Break tasks into 1-2 day chunks
- Include testing in every task list
- Set clear completion criteria
- Keep focus on DO

## Integration Points

### Sprint Coordinator Agent

The `sprint-coordinator` agent automates:

- Phase transitions and status updates
- TodoWrite integration and task tracking
- Changelog generation from completed tasks
- Public roadmap maintenance

### Three-Tier Documentation

- **Public Roadmap**: Coming soon features (no commitments)
- **Planning Roadmap**: Internal P-R-T tracking with status
- **Changelog**: Historical record of actual releases

### Quality Gates

Each phase has quality gates:

- **Planning**: Clear problem definition and success criteria
- **Research**: Actionable technical implementation plan
- **Tasks**: Specific, measurable, and testable action items

## Common Patterns

### Security Feature Pattern

```
P00X: Define security requirements and compliance needs
R00X: Research authentication frameworks and implementation
T00X: Implement, test, and deploy security measures
```

### UI Enhancement Pattern

```
P00X: Identify user experience problems and goals
R00X: Research design patterns and technical approaches
T00X: Implement designs, test accessibility, deploy changes
```

### Integration Pattern

```
P00X: Define integration requirements and business value
R00X: Research APIs, data formats, and technical constraints
T00X: Build integration, test data flow, deploy and monitor
```

## Troubleshooting

### Common Issues

**Skipping Phases**: Always complete all three phases. Skipping leads to incomplete understanding and implementation issues.

**Vague Planning**: Planning documents must clearly define WHAT and WHY. Avoid technical details in P00X documents.

**Research Without Analysis**: Research must include technical analysis, not just feature descriptions.

**Tasks Too Large**: Break large tasks into smaller 1-2 day chunks for better tracking and completion.

### Quality Checks

- Does P00X clearly explain the problem and why it's important?
- Does R00X provide actionable technical implementation details?
- Are T00X tasks specific, measurable, and testable?
- Do all phases link together logically?

## Examples

See the following completed examples:

- `P001-dark-mode-enhancement.md` - UI enhancement planning
- `Planning/planning-roadmap.md` - Current sprint tracking
- `CHANGELOG.md` - Completed feature history

---

*This workflow system ensures thorough planning, technical validation, and successful delivery of HexTrackr features while maintaining high quality and clear documentation throughout the development process.*
