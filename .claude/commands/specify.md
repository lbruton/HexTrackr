# Specify Command

**Purpose:** Initialize Specification phase (S00X) with requirements gathering and clarification dialogue.

## Core Operating Principles (S-R-P-T Phase 1)

- **Requirements-First**: Focus on WHAT and WHY before any technical considerations
- **Dialogue-Driven**: Use conversation to clarify unclear requirements
- **Assumption Documentation**: Explicitly document all assumptions for validation in Research phase
- **Memento Integration**: Search for existing patterns and similar specifications
- **Clarification Tracking**: Mark unclear items as "NEEDS CLARIFICATION" for Research phase

## Pre-Specification Context Check

Before starting specification, perform the following searches to build context:

1. **Memento Search**: `mcp__memento__search_nodes` (semantic mode) for similar problems/features
2. **Project Patterns**: Search existing specifications for established patterns
3. **Architecture Context**: Understanding of current system constraints

## Specification Dialogue Process

### 1. Problem Clarification
- What specific problem are we solving?
- Who is affected by this problem?
- What are the current workarounds or pain points?
- Why is solving this problem important now?

### 2. Success Criteria Definition
- What does "success" look like in measurable terms?
- How will we know when this is complete?
- What are the acceptance criteria from user perspective?
- What are the key performance indicators?

### 3. Constraints and Assumptions
- What technical constraints exist?
- What business constraints must we consider?
- What assumptions are we making?
- What dependencies exist?

### 4. Scope Boundaries
- What is explicitly included in this specification?
- What is explicitly excluded from this scope?
- What are the integration points with existing systems?
- What could cause scope creep?

## Template Usage

Use the `S000-TEMPLATE.md` as a starting point, but adapt the dialogue based on the specific problem. Key sections to focus on:

- **Problem Statement**: Clear, specific description
- **Success Criteria**: Measurable, testable outcomes
- **Open Questions & Clarifications Needed**: Items for Research phase
- **Assumptions & Dependencies**: Items needing validation

## Output Requirements

The specification phase should produce:
- Clear problem definition with measurable success criteria
- Documented assumptions for validation in Research phase
- List of clarifications needed for Research phase
- Well-defined constraints and scope boundaries
- Status ready for Research phase (R00X)

## Next Phase Transition

Once specification is complete with clear requirements and documented assumptions, transition to:

→ **Research Phase (R00X)**: Multi-agent technical analysis to validate assumptions and explore implementation approaches

## Examples

**Good Specification Clarity:**
- "Reduce modal loading time from current 800ms to under 200ms"
- "Support CSV files up to 100MB without browser timeout"

**Poor Specification (needs clarification):**
- "Make the system faster" → NEEDS CLARIFICATION: Which parts? What metrics?
- "Better user experience" → NEEDS CLARIFICATION: How measured? Which users?

## Integration with S-R-P-T Workflow

This command initializes the full S-R-P-T cycle:
- **S00X**: Requirements and problem clarification (this command)
- **R00X**: Multi-agent research and validation
- **P00X**: Technical implementation planning
- **T00X**: Coordinated execution with delegation

ARGUMENTS: [feature-name] [problem-description]