# Research Command

**Purpose:** Execute Research phase (R00X) with multi-agent technical analysis and assumption validation.

## Core Operating Principles (S-R-P-T Phase 2)

- **Multi-Agent Analysis**: Deploy specialized agents for comprehensive coverage
- **Assumption Validation**: Test every assumption from Specification phase
- **Three Stooges Pattern**: Frontend, backend, and edge cases parallel analysis
- **Current State Research**: Analyze existing codebase and integration points
- **Clarification Resolution**: Answer all "NEEDS CLARIFICATION" items from Specification

## Pre-Research Context Gathering

Before launching agents, gather context:

1. **Specification Review**: Read S00X document thoroughly
2. **Memento Search**: `mcp__memento__search_nodes` for relevant technical patterns
3. **Codebase Context**: Understand current implementation and integration points
4. **Agent Selection**: Choose optimal agents based on specification requirements

## Multi-Agent Research Strategy

### Core Research Pattern: Three Stooges Approach
- **Larry (Frontend/UI)**: User interface, experience, and frontend technical analysis
- **Moe (Backend/API)**: Server-side, database, and integration analysis
- **Curly (Edge Cases)**: Error handling, performance, security, and boundary conditions

### Agent Selection Guidelines
Based on specification requirements, select from:
- **CSS Expert**: UI styling and layout challenges
- **Security Auditor**: Security implications and vulnerability assessment
- **Performance Analyst**: Performance bottlenecks and optimization opportunities
- **Database Expert**: Data model and query optimization analysis
- **Frontend Developer**: Component architecture and user experience
- **Backend Developer**: API design and server-side architecture
- **Accessibility Expert**: WCAG compliance and inclusive design
- **Testing Expert**: Test strategy and quality assurance

## Research Execution Process

### 1. Assumption Validation
For each assumption from S00X:
- Deploy appropriate expert agent to validate
- Document evidence supporting or contradicting assumption
- Propose alternative approaches for invalid assumptions

### 2. Technical Approach Exploration
- Research multiple implementation strategies
- Analyze trade-offs between different approaches
- Evaluate compatibility with existing architecture
- Assess complexity and risk factors

### 3. Current State Analysis
- Analyze existing codebase for integration points
- Identify technical debt that affects implementation
- Document current architecture and frameworks
- Map dependencies and constraints

### 4. Risk Assessment
- Identify technical risks and mitigation strategies
- Evaluate implementation complexity
- Assess impact on existing functionality
- Document fallback approaches

## Research Documentation Structure

Use `R000-TEMPLATE.md` pattern with sections for:
- **Assumption Validation Results**: Each S00X assumption with validation evidence
- **Technical Approach Analysis**: Multiple approaches with trade-offs
- **Current State Assessment**: Existing code analysis
- **Risk Analysis**: Identified risks with mitigation strategies
- **Implementation Recommendations**: Preferred approach with justification

## Agent Coordination Patterns

### Parallel Research Pattern
```bash
# Launch multiple agents simultaneously for comprehensive analysis
"Research frontend implications" + "Research backend requirements" + "Research security concerns"
```

### Sequential Deep Dive Pattern
```bash
# Chain agents for building understanding
"Initial analysis" → "Based on findings, deep dive into X" → "Integration analysis"
```

## Output Requirements

Research phase should produce:
- Validated assumptions with evidence
- Multiple technical approaches with trade-off analysis
- Current codebase integration assessment
- Comprehensive risk analysis with mitigation strategies
- Clear recommendation for optimal implementation approach

## Next Phase Transition

Once research is complete with validated assumptions and clear technical direction:

→ **Planning Phase (P00X)**: Compile research findings with specification requirements into comprehensive implementation plan

## Quality Gates

Before transitioning to Planning:
- [ ] All assumptions from S00X validated or disproven with evidence
- [ ] Multiple technical approaches evaluated
- [ ] Current system integration points identified
- [ ] Risk assessment completed with mitigation strategies
- [ ] Clear technical direction recommended

## Integration with S-R-P-T Workflow

This command continues the S-R-P-T cycle:
- **S00X**: Requirements and problem clarification (completed)
- **R00X**: Multi-agent research and validation (this command)
- **P00X**: Technical implementation planning (next)
- **T00X**: Coordinated execution with delegation

ARGUMENTS: [specification-number] [focus-areas]