# rEngine Core Patch Notes Documentation

## Purpose & Overview

The `patch-notes-guidelines.md` file provides a standardized approach for documenting changes and updates to the rEngine Core platform. It serves as a comprehensive reference for developers, operations, and stakeholders to understand the specifics of each version release, including new features, bug fixes, performance improvements, and any breaking changes.

These patch notes play a crucial role in the rEngine Core ecosystem by:

1. **Maintaining Historical Record**: Capturing the evolution of the platform over time, allowing for easier debugging, rollback, and tracking of changes.
2. **Enabling Effective Communication**: Serving as a reliable source of information for users, customers, and the wider rEngine community.
3. **Facilitating Smooth Upgrades**: Providing the necessary context and guidance for users to understand the impact of updates and plan their migration strategies accordingly.

## Key Functions/Classes

The `patch-notes-guidelines.md` file outlines the following key components and their roles:

1. **Patch Notes Directory Structure**: Defines the organization and naming convention for patch note files, including the use of `.ai` and `.md` extensions to differentiate between agent-generated summaries and comprehensive human-reviewed documentation.

1. **Patch Note Templates**: Provides standard templates for both detailed markdown-based patch notes and quick agent-generated summaries, ensuring consistency and completeness of information.

1. **Patch Note Triggers**: Outlines the mandatory and optional scenarios that warrant the creation of patch notes, such as version bumps, major feature additions, critical bug fixes, and breaking changes.

1. **Integration with JSON System**: Describes how patch note files are referenced and linked within the rEngine Core's `recentissues.json` and `tasks.json` files, enabling seamless cross-referencing and automation.

1. **Agent Workflow**: Defines the step-by-step process for rEngine agents to create, update, and maintain patch notes, including version checking, format selection, template usage, and cross-referencing.

1. **Quality Standards**: Establishes the guidelines for comprehensive documentation, cross-referencing, and consistency, ensuring that patch notes provide complete context and are effective as a communication and troubleshooting tool.

1. **Maintenance Practices**: Outlines the weekly review and monthly archiving processes to keep the patch note repository organized, up-to-date, and aligned with the evolving needs of the rEngine Core platform.

## Dependencies

The `patch-notes-guidelines.md` file is a central component of the rEngine Core's documentation and release management processes. It relies on and integrates with the following components:

1. **rEngine Core Versioning**: The patch note file naming convention and content are directly tied to the platform's version numbering scheme, following the Semantic Versioning (SemVer) standard.

1. **rEngine Core JSON System**: The patch note files are cross-referenced and linked within the `recentissues.json` and `tasks.json` files, enabling automated workflows and providing contextual information.

1. **rEngine Core Agent Framework**: The agents responsible for creating and maintaining patch notes follow the guidelines outlined in this file, ensuring consistency and quality.

1. **rEngine Core Release Management**: The patch note documentation is a critical part of the overall release management process, informing users about changes and guiding them through upgrades.

## Usage Examples

To create a new patch note file, rEngine agents can follow these steps:

1. Determine the appropriate version number and file format (`.ai` or `.md`) based on the guidelines.
2. Create a new file in the `patchnotes/` directory following the naming convention: `PATCH-[version].[extension]`.
3. Use the provided templates to structure the patch note content, including the mandatory and optional sections.
4. Cross-reference the patch note in the relevant JSON files (`recentissues.json`, `tasks.json`, etc.).
5. Validate the completeness and accuracy of the patch note before committing it to the repository.

To view and manage existing patch notes, rEngine agents can use the following commands:

```bash

# List the 5 most recent patch notes

ls -la patchnotes/PATCH-* | tail -5

# Find a specific patch note by version

find patchnotes/ -name "PATCH-3.04.88.*"
```

## Configuration

The `patch-notes-guidelines.md` file does not require any specific configuration settings. However, it is important to ensure that the rEngine Core's versioning scheme and JSON system are properly set up and maintained to enable the seamless integration of patch notes.

## Integration Points

The `patch-notes-guidelines.md` file is a central component of the rEngine Core's overall release management and documentation processes. It integrates with the following key areas:

1. **Versioning and Release Management**: The patch note file naming and content structure are directly tied to the platform's version numbering and release schedule.

1. **JSON System Integration**: The patch note files are referenced and linked within the `recentissues.json` and `tasks.json` files, enabling automated workflows and providing contextual information.

1. **Agent Framework**: rEngine agents follow the guidelines outlined in this file to create, update, and maintain the patch note documentation.

1. **User Documentation**: The patch note files serve as a valuable resource for rEngine Core users, providing them with detailed information about platform changes and updates.

1. **Debugging and Troubleshooting**: The historical record of changes captured in the patch notes can be used to aid in debugging and resolving issues that may arise in the platform.

## Troubleshooting

Here are some common issues and solutions related to the rEngine Core patch note documentation:

1. **Incomplete or Inaccurate Patch Notes**:
   - Ensure that all mandatory change scenarios are covered and that the information provided is comprehensive and accurate.
   - Regularly review the patch notes and consolidate any agent-generated summaries into comprehensive human-reviewed documentation.

1. **Broken Cross-References**:
   - Verify that the patch note files are properly referenced in the `recentissues.json` and `tasks.json` files.
   - Check for any changes to file paths or naming conventions that may have broken the cross-references.

1. **Inconsistent Formatting or Structure**:
   - Enforce the use of the provided templates and guidelines to maintain a consistent format and structure across all patch note files.
   - Periodically review the patch notes to identify and address any deviations from the established standards.

1. **Outdated or Irrelevant Information**:
   - Regularly archive older patch notes (older than 6 months) to a separate folder to maintain a focused and up-to-date repository.
   - Review the patch note content and remove any information that is no longer relevant or applicable to the current state of the rEngine Core platform.

By following the guidelines and best practices outlined in the `patch-notes-guidelines.md` file, rEngine Core teams can ensure that the patch note documentation remains a valuable and reliable resource for the platform's users, developers, and stakeholders.
