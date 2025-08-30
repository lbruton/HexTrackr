# rAgents Version Manager

## Purpose & Overview

The `version-manager.js` file is part of the rAgents agentic layer within the rEngine Core ecosystem. It serves as a dedicated version management system for the rAgents component, allowing developers to track and manage the versioning of agent capabilities, memory system improvements, and plugin features separately from the main StackTrackr application.

This version manager ensures that changes to the rAgents system are properly documented, enabling seamless updates and migrations for users of the rEngine Core platform.

## Key Functions/Classes

The main class in this file is the `RAgentsVersionManager`, which encapsulates the following key functions:

1. **Version Management**:
   - `getCurrentVersion()`: Retrieves the current version of the rAgents system.
   - `bumpVersion(type, description)`: Increments the version number based on the specified type (patch, minor, or major) and records the changes in the version history.
   - `incrementVersion(version, type)`: Performs the actual version number increment based on the specified type.
   - `recordRelease(version, type, description)`: Logs a new release in the version history, including details about the changes and current capabilities.

1. **Capability Detection**:
   - `detectCurrentCapabilities()`: Scans the rAgents system to determine the current set of available features and capabilities across various categories (memory system, search engine, agent coordination, workflow automation, export collaboration, and development tools).
   - Helper methods like `fileExists()`, `hasBackupSystem()`, `hasMCPIntegration()`, etc. are used to check for the presence of specific capabilities.

1. **Metrics and Logging**:
   - `gatherMetrics()`: Collects relevant metrics about the rAgents system, such as the number of memory entities, files, and other statistics.
   - `detectChanges(previousCapabilities)`: Compares the current capabilities with the previous version to identify the changes.
   - `updateChangelog(release)`: Appends the details of a new release to the project's CHANGELOG.md file.

1. **Version History Management**:
   - `getVersionHistory()`: Retrieves the complete version history, including release details and capability changes.
   - `saveVersionHistory(history)`: Persists the updated version history to the `version-history.json` file.

1. **CLI Interface**:
   - The `main()` function provides a command-line interface for interacting with the version manager, allowing users to perform actions like bumping the version, displaying the current version, viewing the version history, and inspecting the current capabilities.

## Dependencies

The `version-manager.js` file depends on the following modules and libraries:

- `fs/promises`: For asynchronous file system operations.
- `path`: For handling file paths.

## Usage Examples

Here are some examples of how to use the rAgents Version Manager:

### Bump the version

```bash
node version-manager.js bump patch "Added search optimization"
node version-manager.js bump minor "New serverless plugin"
node version-manager.js bump major "Complete architecture overhaul"
```

### Display the current version

```bash
node version-manager.js show
```

### View the version history

```bash
node version-manager.js history
```

### Inspect the current capabilities

```bash
node version-manager.js capabilities
```

### Show the status report

```bash
node version-manager.js
node version-manager.js --status
```

## Configuration

The `RAgentsVersionManager` class relies on the following paths and files:

- `agentsPath`: The root directory of the rAgents system, where the `package.json` file and other relevant files are located.
- `packagePath`: The path to the `package.json` file, which holds the current version information.
- `versionHistoryPath`: The path to the `version-history.json` file, which stores the version history.
- `changelogPath`: The path to the `CHANGELOG.md` file, where the release details are recorded.

No environment variables or additional configuration is required for this component.

## Integration Points

The rAgents Version Manager is an integral part of the rEngine Core platform, responsible for managing the versioning and capability tracking of the rAgents agentic layer. It seamlessly integrates with the following rEngine Core components:

1. **StackTrackr**: The main application that utilizes the rAgents system. The version management system ensures that the StackTrackr application can properly handle updates and migrations to the rAgents capabilities.

1. **Memory System**: The rAgents Version Manager tracks changes to the memory system, including the number of entities and files, as well as the presence of backup and integration features.

1. **Agent Coordination**: The version manager records the availability of agent profiles, capabilities matrices, task assignment, and workflow protocols.

1. **Workflow Automation**: The version manager tracks the presence of backup scripts, sync automation, export workflows, and task tracking capabilities.

1. **Export Collaboration**: The version manager monitors the availability of ChatGPT export, memory change bundles, cross-platform sharing, and return processing features.

1. **Development Tools**: The version manager records the presence of serverless plugins, Docker integration, testing frameworks, and debug utilities.

## Troubleshooting

## Issue: Cannot read package.json or version-history.json

Solution: Ensure that the rAgents system is properly installed and that the required files (`package.json` and `version-history.json`) exist in the expected locations. If the files are missing, the version manager will use default values and initialize an empty version history.

## Issue: Capabilities not detected correctly

Solution: Check the implementation of the `detectCurrentCapabilities()` method and the associated helper methods. Ensure that the file paths and detection logic are accurate for your rAgents system configuration.

## Issue: Version history not updating correctly

Solution: Verify that the `saveVersionHistory()` method is correctly persisting the updated version history to the `version-history.json` file. Also, check the `updateChangelog()` method to ensure that the CHANGELOG.md file is being properly updated.

If you encounter any other issues, please reach out to the rEngine Core support team for further assistance.
