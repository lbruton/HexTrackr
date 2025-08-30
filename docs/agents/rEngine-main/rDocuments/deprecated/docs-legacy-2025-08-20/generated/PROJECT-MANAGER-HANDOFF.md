# Project Manager Agent Handoff Guide

## Purpose & Overview

This file provides a comprehensive guide for the Project Manager Agent responsible for overseeing tasks, managing agent assignments, tracking progress, and ensuring quality delivery for the StackTrackr project within the rEngine Core ecosystem.

The Project Manager Agent acts as the central coordinator, handling the administrative overhead so the technical agents can focus on their specialized expertise. This guide outlines the agent's core responsibilities, essential file structure, task creation workflow, agent handoff protocol, progress tracking, escalation procedures, and integration with the rAgents system.

## Key Functions/Classes

The Project Manager Agent is responsible for the following key functions:

1. **Task Management**:
   - Creating new tasks in `agents/tasks.json` using standardized templates
   - Assigning tasks to appropriate agents based on the capability matrix
   - Tracking progress and updating task statuses
   - Managing dependencies and phase transitions
   - Coordinating handoffs between agents

1. **Quality Assurance**:
   - Validating task completion against success criteria
   - Ensuring proper documentation is created
   - Verifying testing requirements are met
   - Triggering rollback procedures when quality gates fail

1. **Communication Coordination**:
   - Generating agent handoff prompts using templates
   - Maintaining communication logs in `communications.json`
   - Updating agent memory files with task context
   - Creating status reports for human oversight

## Dependencies

The Project Manager Agent relies on the following essential files and components within the rEngine Core ecosystem:

- `agents/tasks.json`: The master task database and the primary tool for the Project Manager Agent.
- `agents/agents.json`: The agent capability matrix, which is used to assign tasks to the appropriate agents.
- `agents/communications.json`: The inter-agent communication log, used to track handoffs and progress updates.
- `agents/decisions.json`: The project decision history, which provides context and rationale for project-level decisions.
- `agents/VERSION.md`: The rAgents plugin versioning file, used for managing system upgrades and changes.
- `agents/tasks.json > task_templates`: The location of standardized task templates for various types of work (e.g., performance optimization, bug fixes, feature development).
- `agents/*_memories.json`: The agent memory files, which store context and discoveries made during task execution.

## Usage Examples

### Task Creation Workflow

1. **Use Task Templates**: Start by selecting an appropriate task template from `agents/tasks.json > task_templates`.
2. **Required Fields Checklist**: Ensure all necessary fields are filled out, such as `project_id`, `assigned_agent`, `success_criteria`, `dependencies`, `rollback_procedure`, and `testing_requirements`.
3. **Phase Management**: Organize the task into clear phases (analysis/planning, implementation, testing/validation, documentation/cleanup) and assign the appropriate agents based on the capability matrix.

### Agent Handoff Protocol

1. **Create Agent Prompt**: Use the provided template to generate a detailed handoff prompt for the assigned agent, including the task description, required actions, success criteria, and memory update instructions.
2. **Update Tasks.json**: Update the task's `assigned_agent`, `status`, `started`, and `last_updated` fields.
3. **Communication Log**: Add an entry to the `communications.json` file to record the task assignment and handoff.

### Progress Tracking

1. **Daily Status Checks**: Regularly review the task statuses, completion rates, and blocked tasks using simple grep commands.
2. **Quality Gates**: Verify that all success criteria are met, testing requirements are completed, documentation is updated, and no regressions are introduced before marking a task as complete.

### Escalation Procedures

When a task is blocked for more than 24 hours, the quality gates consistently fail, or other critical issues arise, the Project Manager Agent should escalate the issue to human oversight using the provided template.

## Configuration

The Project Manager Agent does not require any specific configuration. It relies on the existing file structure and conventions within the rEngine Core ecosystem.

## Integration Points

The Project Manager Agent is a central component of the rAgents system, responsible for coordinating the work of the various specialized agents (GPT-4, Claude Sonnet, Gemini Pro, GitHub Copilot). It integrates with the following rEngine Core components:

- `agents/tasks.json`: The master task database and the primary tool for the Project Manager Agent.
- `agents/agents.json`: The agent capability matrix, which is used to assign tasks to the appropriate agents.
- `agents/communications.json`: The inter-agent communication log, used to track handoffs and progress updates.
- `agents/decisions.json`: The project decision history, which provides context and rationale for project-level decisions.
- `agents/VERSION.md`: The rAgents plugin versioning file, used for managing system upgrades and changes.
- `agents/*_memories.json`: The agent memory files, which store context and discoveries made during task execution.

## Troubleshooting

## Issue: Task Blocked for More Than 24 Hours

- Ensure all dependencies are met and there are no resource conflicts between tasks.
- Verify that the assigned agent has the necessary capabilities to complete the task.
- If the issue persists, escalate the task to human oversight for further investigation and resolution.

## Issue: Quality Gates Consistently Failing

- Review the success criteria and testing requirements to ensure they are clear and achievable.
- Investigate the root causes of the quality issues and update the `agents/errors.json` file accordingly.
- Provide additional guidance or resources to the assigned agent to help them meet the quality standards.
- If the issues cannot be resolved, escalate the task to human oversight.

## Issue: Agent Expertise Mismatch

- Revisit the agent capability matrix and ensure tasks are assigned to the most appropriate agents.
- Consider reassigning the task to a different agent with the necessary expertise.
- If no suitable agent is available, escalate the issue to human oversight for a potential solution.

By following the guidelines and procedures outlined in this comprehensive Project Manager Agent Handoff Guide, you can effectively coordinate the work of the various rAgents, ensure consistent project delivery, and maintain high-quality standards within the rEngine Core ecosystem.
