# Tasks Command

**Purpose:** Execute Tasks phase (T00X) with coordinated multi-tool implementation based on comprehensive S-R-P-T planning.

## Core Operating Principles (S-R-P-T Phase 4)

- **Context-Complete Execution**: All tasks execute with full context from S00X + R00X + P00X
- **Optimal Delegation**: Use the right tool for each specific task type
- **Progress Tracking**: Monitor execution against original specification requirements
- **Quality Validation**: Verify each task meets success criteria from S00X
- **Coordination Management**: Manage work across multiple execution environments

## Pre-Execution Requirements

Before starting task execution:

1. **Plan Review**: Thoroughly understand P00X implementation plan and delegation strategy
2. **Context Preparation**: Gather all context needed for delegated tasks
3. **Tool Readiness**: Ensure access to Claude Code, Codex, Gemini as needed
4. **Validation Strategy**: Prepare testing approach from P00X planning

## Multi-Tool Execution Strategy

### Claude Code Optimal Tasks
- **Architectural Changes**: Complex refactoring, design pattern implementation
- **Integration Logic**: Component integration, API connections
- **Complex Business Logic**: Algorithms, data processing, validation rules
- **Error Handling**: Comprehensive error management and recovery
- **Testing Infrastructure**: Test setup, complex test scenarios

### Codex/Gemini Optimal Tasks
- **Boilerplate Code**: Templates, repetitive implementations
- **Simple Functions**: Utility functions, data transformations
- **Styling Implementation**: CSS classes, responsive design rules
- **Configuration Files**: Config updates, environment setup
- **Documentation Updates**: API docs, inline comments

### Manual Review Tasks
- **Critical Decisions**: Architecture choices requiring human judgment
- **Creative Design**: UI/UX decisions, visual design choices
- **Stakeholder Communication**: Requirements clarification, progress updates
- **Final Integration Testing**: End-to-end user experience validation
- **Performance Validation**: Real-world performance testing

## Task Execution Process

### 1. Phase-Based Execution
Execute tasks according to P00X phases:
- **Phase 1**: Foundation and setup tasks
- **Phase 2**: Core implementation tasks
- **Phase 3**: Integration and testing tasks

### 2. Delegation Management
For each task group:
- Prepare comprehensive context from S00X + R00X + P00X
- Use optimal tool based on P00X delegation strategy
- Provide prompts and templates as needed
- Coordinate between different execution environments

### 3. Progress Tracking
- Use TodoWrite to track task completion
- Validate against S00X success criteria
- Monitor quality gates from P00X planning
- Coordinate dependencies between tasks

### 4. Quality Validation
- Execute testing strategy from P00X
- Validate against original S00X requirements
- Perform code review and quality checks
- Verify performance and accessibility requirements

## Task Coordination Patterns

### Sequential Execution Pattern
```bash
# Execute tasks in dependency order
Foundation Setup → Core Implementation → Integration Testing
```

### Parallel Execution Pattern
```bash
# Execute independent tasks simultaneously
Frontend Changes + Backend Updates + Documentation Updates
```

### Tool Coordination Pattern
```bash
# Coordinate between different AI tools
Claude (Architecture) → Codex (Boilerplate) → Manual Review → Integration
```

## Context Management

### For Claude Code Tasks
- Full S-R-P-T context including problem definition and research findings
- Specific file locations and integration points from P00X
- Quality requirements and testing expectations
- Error handling and rollback strategies

### For Codex/Gemini Tasks
- Simplified context focused on specific implementation
- Clear templates and examples
- Precise requirements and acceptance criteria
- Integration points with Claude-implemented components

### For Manual Tasks
- High-level overview of implementation goals
- Critical decision points requiring human judgment
- Quality validation checklists
- Performance and user experience requirements

## Output Requirements

Tasks phase should produce:
- Fully implemented solution meeting all S00X requirements
- Validated against all success criteria from specification
- Quality assurance completed per P00X testing plan
- Documentation updated to reflect implementation
- Ready for production deployment or user testing

## Completion Validation

Before marking tasks complete:
- [ ] All S00X success criteria met and validated
- [ ] All P00X quality gates passed
- [ ] Testing strategy executed with passing results
- [ ] Code review completed for all implementations
- [ ] Documentation updated to reflect changes
- [ ] Performance requirements met (if specified in S00X)
- [ ] Accessibility requirements validated (if applicable)

## Integration with S-R-P-T Workflow

This command completes the full S-R-P-T cycle:
- **S00X**: Requirements and problem clarification (completed)
- **R00X**: Multi-agent research and validation (completed)
- **P00X**: Technical implementation planning (completed)
- **T00X**: Coordinated execution with delegation (this command)

## Post-Completion Activities

After successful task completion:
- Update CHANGELOG.md with completed features
- Archive S00X/R00X/P00X/T00X documents to Completed/ folder
- Update planning roadmap to remove completed items
- Store learnings and patterns in Memento for future projects
- Prepare for next iteration or new specification

## Template Usage

The T000-TEMPLATE.md includes:
- Task breakdown with delegation assignments
- Progress tracking with completion criteria
- Quality assurance checklist with validation steps
- Context and prompts for each tool type
- Completion and archival procedures

ARGUMENTS: [planning-number] [execution-focus]