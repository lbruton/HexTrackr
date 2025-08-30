# rPrompts: GPT-4 Project Manager Handoff

## Purpose & Overview

The `gpt4-project-manager-handoff.md` file is part of the `rLegacy` module within the `rAgents` component of the rEngine Core platform. This file serves as a handoff document, providing instructions and guidance for a GPT-4 AI agent to take on the role of a Project Manager (PM) for the StackTrackr application.

The purpose of this file is to onboard the GPT-4 agent with the necessary information and tools to effectively manage the tasks and coordination of the StackTrackr project, allowing the technical agents to focus on complex work.

## Key Functions/Classes

The key components and their roles in this file are:

1. **Project Manager (GPT-4 Agent)**: The GPT-4 AI agent who will be responsible for the overall task coordination and management of the StackTrackr project.

1. **StackTrackr Application**: The application that the GPT-4 agent will be managing as the Project Manager.

1. **PM Documentation and Templates**: The documentation and templates that the GPT-4 agent can reference to perform their duties as the Project Manager.

1. `agents/tasks.json`: The file that contains the current active projects and tasks for the StackTrackr application.

## Dependencies

This file does not have any direct dependencies, as it is a standalone handoff document. However, it assumes the existence of the following components within the rEngine Core platform:

1. `rAgents` component
2. `rLegacy` module
3. `npm` scripts for accessing the PM documentation and templates
4. `agents/tasks.json` file for managing project tasks

## Usage Examples

To get started as the Project Manager for the StackTrackr application, the GPT-4 agent should follow these steps:

1. Run the `npm run pm:guide` command to read the complete Project Manager documentation.
2. Run the `npm run pm:templates` command to access the quick reference templates.
3. Check the `agents/tasks.json` file to review the current active projects.

Once the GPT-4 agent has familiarized themselves with the necessary information, they can proceed to perform their duties as the Project Manager, which include:

- Creating tasks using the provided templates
- Assigning agents based on the capability matrix
- Tracking progress and quality gates
- Handling communication and handoffs
- Escalating to human intervention when necessary

## Configuration

This file does not require any specific configuration. It is a handoff document that provides instructions and guidance to the GPT-4 agent, without any environmental variables or configuration settings.

## Integration Points

The `gpt4-project-manager-handoff.md` file is part of the `rLegacy` module within the `rAgents` component of the rEngine Core platform. It is designed to integrate with the following components:

1. `rAgents` component: This component provides the necessary infrastructure and resources for the GPT-4 agent to function as the Project Manager.
2. `agents/tasks.json`: This file is used by the GPT-4 agent to review and manage the current active projects and tasks.

## Troubleshooting

Since this file is a handoff document, there are no specific troubleshooting steps. However, if the GPT-4 agent encounters any issues or has questions while performing their duties as the Project Manager, they should escalate the issue to the human team as specified in the "Your Mission" section of the document.
