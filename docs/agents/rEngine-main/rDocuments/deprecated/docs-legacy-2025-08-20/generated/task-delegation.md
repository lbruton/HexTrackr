# rAgents/rTemplates/task-delegation.md - Task Delegation Templates

## Purpose & Overview

The `task-delegation.md` file provides a set of templates and guidelines for efficiently managing task delegation and tracking within the rEngine Core platform. This file serves as a reference for project managers and technical agents to streamline the process of assigning, monitoring, and escalating tasks across the rEngine ecosystem.

## Key Functions/Classes

1. **Quick Task Delegation Templates**:
   - **Instant Agent Assignment**: Templates for delegating bug fixes, feature implementations, and performance optimizations to appropriate agents.
   - **Project Manager Actions**: Templates and instructions for creating new tasks, assigning tasks to agents, and tracking task progress.

1. **Agent Selection Quick Reference**: A table that provides guidance on which agent to choose for different task types based on their capabilities.

1. **Quality Checklist**: A checklist of criteria to ensure tasks are completed to the desired quality standard before being marked as "completed".

1. **Escalation Process**: Guidelines for when and how to escalate issues that require human intervention, including the expected format for escalation reports.

1. **Essential Files Quick Access**: A list of key files within the rEngine Core platform that are relevant to the task delegation process.

1. **Project Manager Mission**: A summary of the responsibilities for project managers and technical agents in the task delegation workflow.

## Dependencies

The `task-delegation.md` file relies on the following rEngine Core components:

1. `agents/tasks.json`: The master file containing all active tasks and their details.
2. `agents/agents.json`: The file that defines the capabilities and specialties of each available agent.
3. `agents/communications.json`: The log of all communications between agents and project managers.
4. `agents/unified-workflow.md`: The documentation describing the overall workflow and integration points within the rEngine Core platform.
5. `agents/version-manager.js`: The script responsible for managing versioning and deployment of rEngine Core components.

## Usage Examples

### Creating a New Task

To create a new task, project managers can use the provided JSON template:

```json
{
  "new_project_2025_08_XX": {
    "project_id": "descriptive_name_2025_08_XX",
    "title": "Clear Title",
    "description": "What needs to be done and why",
    "status": "ready",
    "priority": "high|medium|low",
    "estimated_total_time": "XX_minutes",
    "assigned_agent": "best_fit_agent",
    "success_criteria": [
      "Specific measurable outcome 1",
      "Specific measurable outcome 2"
    ],
    "phases": {
      "phase_1": {
        "title": "Analysis/Planning", 
        "status": "ready",
        "estimated_time": "15_minutes"
      }
    }
  }
}
```

### Assigning a Task to an Agent

To assign a task to an agent, project managers should follow these steps:

1. Find the appropriate agent in the capability matrix.
2. Update the `assigned_agent` field in the task.
3. Set the task status to "assigned".
4. Send the agent a handoff message with the task details.

### Tracking Task Progress

Project managers can quickly check the status of tasks using the following command:

```bash

# Quick status check

grep -n "status.*in_progress" agents/tasks.json
grep -n "status.*completed" agents/tasks.json
grep -n "status.*blocked" agents/tasks.json
```

## Configuration

The `task-delegation.md` file does not require any specific configuration. It serves as a reference guide and template repository for managing tasks within the rEngine Core platform.

## Integration Points

The `task-delegation.md` file is closely integrated with the following rEngine Core components:

1. `agents/tasks.json`: The master file for all active tasks and their details.
2. `agents/agents.json`: The file that defines the capabilities and specialties of each available agent.
3. `agents/communications.json`: The log of all communications between agents and project managers.
4. `agents/unified-workflow.md`: The documentation describing the overall workflow and integration points within the rEngine Core platform.
5. `agents/version-manager.js`: The script responsible for managing versioning and deployment of rEngine Core components.

## Troubleshooting

**Task Blocked for More Than 24 Hours**:
If a task is blocked for more than 24 hours, project managers should escalate the issue using the provided escalation format. This indicates that the agent is unable to make progress on the task, and human intervention may be required.

**Critical Bugs Affecting Users**:
If a critical bug is discovered that is affecting users, project managers should immediately escalate the issue using the provided escalation format. This ensures that the bug is addressed as quickly as possible.

**Agent Reports Cannot Complete Task**:
If an agent reports that they are unable to complete a task, project managers should escalate the issue using the provided escalation format. This allows the rEngine Core team to investigate the issue and provide the necessary support or resources to the agent.

**Quality Gates Failing Repeatedly**:
If the quality checklist is repeatedly failing for a task, project managers should escalate the issue using the provided escalation format. This indicates that there are underlying problems that need to be addressed before the task can be marked as "completed".
