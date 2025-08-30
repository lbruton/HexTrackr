# rAgents Version Manager

## Purpose & Overview

The `version-manager.js` script is a powerful tool that manages the versioning and tracking of the rAgents agentic layer, which is separate from the StackTrackr application. This script is responsible for:

- Tracking agent capabilities, memory system improvements, and plugin features
- Automatically bumping versions (patch, minor, or major) and updating the `package.json` file
- Maintaining a detailed version history, including release notes and capability changes
- Automatically updating the project's `CHANGELOG.md` file with each new release
- Providing a comprehensive status report on the current version, metrics, and active capabilities

By using this script, the rAgents development team can ensure that the agentic layer's versioning is well-documented, organized, and aligned with the overall project's progress.

## Technical Architecture

The `RAgentsVersionManager` class is the central component of this script, and it handles all the version management tasks. The class has the following key components:

1. **File Paths**: The constructor sets up the necessary file paths for the `package.json`, `version-history.json`, and `CHANGELOG.md` files.
2. **Version Management**: The `getCurrentVersion()`, `bumpVersion()`, and `incrementVersion()` methods handle the version retrieval, incrementing, and updating processes.
3. **Version History**: The `getVersionHistory()`, `saveVersionHistory()`, and `recordRelease()` methods manage the version history, including the release details and capability changes.
4. **Capability Detection**: The `detectCurrentCapabilities()` and supporting methods (e.g., `hasBackupSystem()`, `hasMCPIntegration()`) are responsible for analyzing the project's features and generating a detailed capability report.
5. **Metrics Collection**: The `gatherMetrics()` and `getMemoryStats()` methods collect various metrics, such as the number of memory entities, files, and overall project activity.
6. **Changelog Management**: The `updateChangelog()` method is responsible for updating the project's `CHANGELOG.md` file with each new release.
7. **CLI Interface**: The `main()` function provides a command-line interface for interacting with the version manager, allowing users to perform actions like bumping the version, viewing the version history, and checking the current capabilities.

The script uses the `fs/promises` and `path` modules from the Node.js standard library to interact with the file system and manage the various files and directories.

## Dependencies

This script does not have any external dependencies. It uses the built-in Node.js modules `fs/promises` and `path`.

## Key Functions/Classes

### `RAgentsVersionManager` Class

## Constructor

- Sets up the necessary file paths for the project's files.

## `getCurrentVersion()`

- Retrieves the current version from the `package.json` file.
- Returns the version as a string (e.g., "1.2.3").

## `getVersionHistory()`

- Retrieves the version history from the `version-history.json` file.
- Returns an object with the following structure:

  ```typescript
  {
    releases: Release[],
    current_capabilities: Capabilities,
    migration_log: string[]
  }
  ```

## `saveVersionHistory(history)`

- Saves the version history to the `version-history.json` file.

## `bumpVersion(type, description)`

- Increments the version number based on the provided `type` (patch, minor, or major).
- Updates the `package.json` file with the new version.
- Records the new release in the version history.
- Returns the new version number as a string.

## `incrementVersion(version, type)`

- Increments the version number based on the provided `type` (patch, minor, or major).
- Returns the new version number as a string.

## `recordRelease(version, type, description)`

- Creates a new release object with the version, type, date, description, capabilities, metrics, and changes.
- Adds the new release to the version history.
- Updates the `current_capabilities` in the version history.
- Calls `updateChangelog()` to update the `CHANGELOG.md` file.

## `detectCurrentCapabilities()`

- Analyzes the project's files and directories to detect the current capabilities of the rAgents system.
- Returns an object with the following structure:

  ```typescript
  {
    memory_system: MemorySystemCapabilities,
    search_engine: SearchEngineCapabilities,
    agent_coordination: AgentCoordinationCapabilities,
    workflow_automation: WorkflowAutomationCapabilities,
    export_collaboration: ExportCollaborationCapabilities,
    development_tools: DevelopmentToolsCapabilities
  }
  ```

## `gatherMetrics()`

- Collects various metrics about the project, such as the number of memory entities, files, and the last activity date.
- Returns an object with the collected metrics.

## `updateChangelog(release)`

- Appends the new release information to the project's `CHANGELOG.md` file.

## Helper Methods

- The script includes several helper methods (e.g., `fileExists()`, `hasBackupSystem()`, `hasMCPIntegration()`) that are used to detect the presence of various project features and capabilities.

### `main()` Function

- Provides a command-line interface for interacting with the `RAgentsVersionManager` class.
- Supports the following commands:
  - `(none)` or `--status`: Shows the detailed status report
  - `bump [type]`: Bumps the version with the specified type (patch, minor, or major)
  - `show`: Displays the current version
  - `history`: Shows the version history
  - `capabilities`: Displays the current capabilities

## Usage Examples

### Bumping the Version

```bash
node version-manager.js bump patch "Added search optimization"
node version-manager.js bump minor "New serverless plugin"
node version-manager.js bump major "Complete architecture overhaul"
```

### Checking the Status

```bash
node version-manager.js
node version-manager.js --status
```

### Viewing the Version History

```bash
node version-manager.js history
```

### Displaying the Current Capabilities

```bash
node version-manager.js capabilities
```

## Configuration

This script does not require any specific configuration. It uses the following file paths, which are set up in the constructor:

- `packagePath`: The path to the `package.json` file
- `versionHistoryPath`: The path to the `version-history.json` file
- `changelogPath`: The path to the `CHANGELOG.md` file

## Error Handling

The script uses try-catch blocks to handle errors that may occur during various operations, such as reading or writing files, detecting capabilities, and gathering metrics. When an error occurs, the script logs the error message to the console.

## Integration

The `version-manager.js` script is designed to be a standalone utility that can be used to manage the versioning and tracking of the rAgents agentic layer. It can be integrated into the overall rAgents project by calling the `RAgentsVersionManager` class from other parts of the codebase, or by running the script as a standalone CLI tool.

## Development Notes

- The script uses a mix of synchronous and asynchronous file system operations, which may impact performance for large projects with many files.
- The capability detection logic could be further optimized to reduce the number of file system checks and improve overall performance.
- The `updateChangelog()` method could be improved to handle merge conflicts or multiple concurrent updates to the `CHANGELOG.md` file.
- The CLI interface could be enhanced with additional features, such as the ability to view detailed release notes or generate reports.
