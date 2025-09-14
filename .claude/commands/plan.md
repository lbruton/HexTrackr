# Plan Command

**Purpose:** Execute Planning phase (P00X) by compiling Specification and Research into comprehensive technical implementation plan.

## Core Operating Principles (S-R-P-T Phase 3)

- **Synthesis-Based**: Compile requirements from S00X with validated research from R00X
- **Delegation Strategy**: Optimize task distribution between Claude/Codex/Gemini/Manual
- **Implementation Focus**: Create actionable technical plan with specific file references
- **Risk Mitigation**: Include concrete strategies for identified risks
- **Context Preparation**: Prepare prompts and context for task delegation

## Pre-Planning Requirements

Before creating implementation plan:

1. **Specification Review**: Thoroughly understand S00X requirements and success criteria
2. **Research Synthesis**: Analyze R00X findings and validated approaches
3. **Architecture Decisions**: Choose optimal technical approach based on research
4. **Tool Selection**: Determine best delegation strategy for implementation tasks

## Planning Compilation Process

### 1. Requirements Integration
- Extract key requirements from S00X specification
- Map validated research findings from R00X to requirements
- Identify any remaining gaps or clarifications needed

### 2. Technical Architecture Design
- Select optimal implementation approach based on R00X research
- Design integration with existing codebase
- Plan for scalability and maintainability
- Address all technical constraints identified

### 3. Implementation Breakdown
- Break implementation into logical phases
- Identify specific files and code locations to modify
- Plan dependencies and execution order
- Estimate effort for each task group

### 4. Delegation Strategy Design
- **Claude Code Tasks**: Complex logic, architectural changes, refactoring
- **Codex/Gemini Tasks**: Boilerplate code, repetitive implementations, simple functions
- **Manual Tasks**: Critical decisions, creative design, stakeholder communication
- **Review Checkpoints**: Human validation points throughout implementation

## Implementation Planning Structure

Use `P000-TEMPLATE.md` with emphasis on:
- **Executive Summary**: Problem + Solution + Strategy
- **Specification Summary**: Key requirements from S00X
- **Research Findings**: Validated assumptions and selected approach from R00X
- **Implementation Plan**: Phased approach with specific tasks
- **Delegation Strategy**: Optimal tool for each task type
- **Testing Strategy**: Validation approach for success criteria

## Delegation Optimization Patterns

### Task Classification
- **Architectural**: Complex integration, design patterns → Claude Code
- **Boilerplate**: Repetitive code, templates → Codex/Gemini
- **Logic**: Business rules, algorithms → Claude Code or Manual
- **Styling**: CSS, responsive design → Codex or specialist agents
- **Testing**: Test cases, validation → Claude Code with specialist agents

### Context Preparation
For each delegated task group:
- Prepare comprehensive context documentation
- Create prompt templates for other AI tools
- Define acceptance criteria and validation steps
- Plan integration and review processes

## Risk and Quality Management

### Risk Mitigation Planning
- Address each risk identified in R00X research
- Create fallback strategies for high-risk components
- Plan rollback procedures for critical changes
- Define monitoring and validation checkpoints

### Quality Assurance Strategy
- Plan testing approach for each implementation phase
- Define code review requirements
- Plan accessibility and performance validation
- Create documentation update strategy

## Output Requirements

Planning phase should produce:
- Comprehensive implementation plan with specific file references
- Clear delegation strategy with optimal tool assignments
- Detailed risk mitigation plan with specific actions
- Testing and validation strategy aligned with S00X success criteria
- Ready-to-execute task breakdown with all context needed

## Next Phase Transition

Once planning is complete with detailed implementation strategy:

→ **Tasks Phase (T00X)**: Execute coordinated implementation with optimal delegation

## Quality Gates

Before transitioning to Tasks:
- [ ] All S00X requirements addressed in implementation plan
- [ ] All R00X findings integrated into technical approach
- [ ] Delegation strategy optimized for task types
- [ ] Risk mitigation strategies defined with specific actions
- [ ] Testing approach covers all S00X success criteria
- [ ] Task breakdown is specific and actionable

## Integration with S-R-P-T Workflow

This command completes the planning phase of S-R-P-T:
- **S00X**: Requirements and problem clarification (completed)
- **R00X**: Multi-agent research and validation (completed)
- **P00X**: Technical implementation planning (this command)
- **T00X**: Coordinated execution with delegation (next)

## Template Usage

The P000-TEMPLATE.md includes:
- Consolidation of S00X + R00X insights
- Specific implementation phases with file references
- Delegation assignments with rationale
- Context preparation for each tool/agent
- Validation and testing strategy

ARGUMENTS: [specification-number] [research-number]