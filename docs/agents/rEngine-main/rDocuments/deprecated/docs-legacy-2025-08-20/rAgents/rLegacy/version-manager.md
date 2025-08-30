# rAgents Version Manager

## Purpose & Overview

The `version-manager.js` script is a command-line tool that manages the versioning and change tracking for the rAgents agentic layer, which is a separate component from the StackTrackr application. This script allows you to:

- Bump the version (patch, minor, or major) of the rAgents system
- Maintain a detailed changelog of changes and new capabilities
- Track the current capabilities and metrics of the rAgents system
- Provide a comprehensive overview of the system's status

The version manager is essential for managing the evolution of the rAgents agentic layer, ensuring that changes and improvements are documented and accessible to the development team and users.

## Technical Architecture

The `RAgentsVersionManager` class is the core component of this script, and it handles all the version management and capability detection functionality. The class has the following key components:

1. **File Paths**: The constructor initializes the file paths for the `package.json`, `version-history.json`, and `CHANGELOG.md` files.
2. **Version Management**: The `bumpVersion()`, `incrementVersion()`, and `recordRelease()` methods handle version bumping, updating the `package.json` file, and recording the release details in the version history.
3. **Capability Detection**: The `detectCurrentCapabilities()` method examines the codebase to determine the current set of features and capabilities available in the rAgents system.
4. **Metrics Gathering**: The `gatherMetrics()` method collects various metrics about the rAgents system, such as the number of memory entities, files, and last activity date.
5. **Change Detection**: The `detectChanges()` method compares the current capabilities with the previous version to identify what has been added or removed.
6. **Changelog Management**: The `updateChangelog()` method updates the `CHANGELOG.md` file with the details of the latest release.
7. **Helper Methods**: The script includes a set of helper methods to detect the existence of specific files and directories, which are used in the capability detection process.
8. **CLI Interface**: The `main()` function provides a command-line interface for interacting with the version manager, allowing users to perform various actions like bumping the version, showing the current status, and viewing the version history.

The data flow in the script is as follows:

1. The `RAgentsVersionManager` class is instantiated, which sets up the necessary file paths.
2. The version management methods (`bumpVersion()`, `recordRelease()`) update the `package.json` file and the version history.
3. The capability detection methods (`detectCurrentCapabilities()`, `gatherMetrics()`, `detectChanges()`) analyze the codebase and gather relevant information.
4. The changelog management method (`updateChangelog()`) updates the `CHANGELOG.md` file with the details of the latest release.
5. The CLI interface (`main()`) allows users to interact with the version manager and view the system's status.

## Dependencies

The script imports the following dependencies:

- `fs/promises`: For asynchronous file system operations
- `path`: For working with file paths

The script does not have any external dependencies, as it is a self-contained version management tool.

## Key Functions/Classes

### `RAgentsVersionManager` Class

This is the main class that handles the version management and capability detection functionality.

**Constructor**:

- Initializes the file paths for `package.json`, `version-history.json`, and `CHANGELOG.md`.

**Methods**:

- `getCurrentVersion()`: Reads the current version from the `package.json` file.
- `getVersionHistory()`: Reads the version history from the `version-history.json` file.
- `saveVersionHistory(history)`: Writes the version history to the `version-history.json` file.
- `bumpVersion(type, description)`: Increments the version, updates the `package.json` file, and records the release details.
- `incrementVersion(version, type)`: Increments the version based on the specified type (patch, minor, or major).
- `recordRelease(version, type, description)`: Records the details of a new release in the version history.
- `detectCurrentCapabilities()`: Analyzes the codebase to detect the current capabilities of the rAgents system.
- `gatherMetrics()`: Collects various metrics about the rAgents system.
- `detectChanges(previousCapabilities)`: Compares the current capabilities with the previous version to identify changes.
- `generateAutoDescription(type)`: Generates a default description for a release based on the version type.
- `updateChangelog(release)`: Updates the `CHANGELOG.md` file with the details of a new release.
- `fileExists(filePath)`: Checks if a file or directory exists.
- `hasBackupSystem()`, `hasMCPIntegration()`, `hasAgentProfiles()`, `hasCapabilitiesMatrix()`, `hasTaskAssignment()`, `hasBackupScripts()`, `hasExportWorkflows()`, `hasChatGPTExport()`, `hasMemoryChangeBundles()`, `hasReturnProcessing()`, `hasServerlessPlugin()`, `hasDockerIntegration()`, `hasTestingFramework()`: Helper methods to detect the presence of specific capabilities.
- `showStatus()`: Displays a comprehensive status report for the rAgents system.

### `main()` Function

The `main()` function provides a command-line interface for interacting with the `RAgentsVersionManager` class. It handles the following commands:

- `(none)` or `--status`: Shows the status report
- `bump [type]`: Bumps the version (patch, minor, or major)
- `show`: Shows the current version
- `history`: Shows the version history
- `capabilities`: Shows the current capabilities
- `--status`: Shows the detailed status report

## Usage Examples

### Bumping the Version

```bash
node version-manager.js bump patch "Added search optimization"
node version-manager.js bump minor "New serverless plugin"
node version-manager.js bump major "Complete architecture overhaul"
```

### Showing the Current Version

```bash
node version-manager.js show
```

### Viewing the Version History

```bash
node version-manager.js history
```

### Checking the Current Capabilities

```bash
node version-manager.js capabilities
```

### Viewing the Detailed Status Report

```bash
node version-manager.js
node version-manager.js --status
```

## Configuration

The `RAgentsVersionManager` class does not require any external configuration. The file paths for `package.json`, `version-history.json`, and `CHANGELOG.md` are hardcoded in the constructor.

## Error Handling

The script handles various errors that may occur during its execution:

- If the `package.json` file cannot be read, the `getCurrentVersion()` method will return `'0.0.0'`.
- If the `version-history.json` file doesn't exist, the `getVersionHistory()` method will initialize an empty history object.
- If any errors occur during the capability detection process, the script will log a warning and continue with the available information.
- If any errors occur during the metrics gathering process, the script will return an object with an `error` property containing the error message.

## Integration

The `version-manager.js` script is a standalone tool that can be integrated into the rAgents system's development and deployment workflows. It can be used to:

1. **Automate Version Bumping**: The script can be incorporated into the build or deployment process to automatically bump the version whenever new changes are introduced.
2. **Track Capability Changes**: The version history and changelog can be used to understand the evolution of the rAgents system and how its capabilities have changed over time.
3. **Provide System Status**: The `showStatus()` method can be used to display the current version, capabilities, and metrics of the rAgents system, which can be helpful for monitoring and troubleshooting.
4. **Facilitate Collaboration**: The detailed changelog can be shared with the development team and users to communicate the changes and improvements in the rAgents system.

## Development Notes

- The script uses a combination of file system operations and capability detection methods to manage the versioning and change tracking for the rAgents system.
- The capability detection process is based on a set of helper methods that check for the existence of specific files and directories. This approach may need to be updated if the structure or naming conventions of the rAgents codebase change.
- The `CHANGELOG.md` format follows a standard structure, with sections for version, type, description, changes, and capabilities. This format can be customized if needed.
- The CLI interface provides a user-friendly way to interact with the version manager, but it could be further extended to include additional features or commands.
- The script is designed to be self-contained and does not have any external dependencies, making it easy to integrate into the rAgents development workflow.
