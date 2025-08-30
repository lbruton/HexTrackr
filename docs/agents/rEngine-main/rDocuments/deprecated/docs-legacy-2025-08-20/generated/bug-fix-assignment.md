# rPrompts: Bug Fix Assignment

## Purpose & Overview

The `bug-fix-assignment.md` file is a template used within the `rAgents/rLegacy` component of the rEngine Core platform. This file outlines the process and details for an urgent bug fix assignment, providing a standardized format for agents to diagnose, fix, and document the resolution of a critical issue.

The purpose of this file is to guide agents through the necessary steps to effectively address a reported bug, ensuring a consistent and efficient workflow for bug triage and remediation within the rEngine Core ecosystem.

## Key Functions/Classes

The `bug-fix-assignment.md` file does not contain any specific functions or classes. Instead, it provides a structured template with the following key sections:

1. **Bug Details**: Describes the bug that needs to be addressed, including reproduction steps, expected behavior, and the current (incorrect) behavior.
2. **Files to Check**: Lists the specific files and locations that should be inspected for the bug.
3. **Your Task**: Outlines the steps the agent should follow to diagnose, fix, and test the bug.
4. **Success Criteria**: Defines the conditions that must be met for the bug fix to be considered successful.

## Dependencies

The `bug-fix-assignment.md` file relies on the following dependencies within the rEngine Core ecosystem:

1. **agents/errors.json**: A JSON file containing known error patterns and their associated resolutions.
2. **agents/recentissues.json**: A JSON file tracking recent bug fixes and their corresponding details.
3. **agents/tasks.json**: A JSON file containing the task details for the bug fix assignment.

## Usage Examples

To use the `bug-fix-assignment.md` template, follow these steps:

1. Open the file and review the provided information, including the bug details, reproduction steps, and files to check.
2. Update the `agents/tasks.json` file with the task details.
3. Set the task status to "in_progress" to indicate that the bug fix is underway.
4. Follow the phases outlined in the "Your Task" section: diagnosis, fix, and test.
5. Document your findings and discoveries in your memory file.
6. Ensure that the success criteria are met before marking the task as complete.

## Configuration

The `bug-fix-assignment.md` file does not require any specific configuration. However, the agent may need to access and update the related JSON files (e.g., `agents/errors.json`, `agents/recentissues.json`, `agents/tasks.json`) as part of the bug fix process.

## Integration Points

The `bug-fix-assignment.md` file is closely integrated with the following components of the rEngine Core platform:

1. **rAgents/rLegacy**: The file is part of the `rAgents/rLegacy` component, which handles the management and execution of agent-based tasks.
2. **Reporting and Tracking**: The file's contents are linked to the `agents/tasks.json`, `agents/errors.json`, and `agents/recentissues.json` files, which are used for reporting and tracking bug fixes.

## Troubleshooting

If an agent encounters any issues while following the instructions in the `bug-fix-assignment.md` file, they should refer to the following resources for troubleshooting:

1. **agents/errors.json**: This file contains known error patterns and their associated resolutions, which may provide guidance for diagnosing and fixing the current bug.
2. **agents/recentissues.json**: This file tracks recent bug fixes and their corresponding details, which can be used to identify similar issues and their resolutions.
3. **rEngine Core Documentation**: The comprehensive documentation for the rEngine Core platform may provide additional information and support for the bug fix process.

If the agent is unable to resolve the issue using the available resources, they should escalate the problem to the appropriate rEngine Core support team for further assistance.
