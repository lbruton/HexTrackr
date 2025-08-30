# rEngine Protocol Compliance Checker

## Purpose & Overview

The `protocol-compliance-checker.js` file is a critical component of the rEngine Core platform. It acts as a gatekeeper, enforcing a set of strict protocols to ensure the integrity and security of the rEngine ecosystem. This script checks for any potential violations before allowing any agent operations to proceed, preventing agents from breaking critical protocols that could cause issues.

The main protocols enforced by this checker are:

1. **NO files outside /StackTrackr/ directory**: Agents are not allowed to create or modify files outside the designated project root directory.
2. **NO automated GitHub operations (push/pull)**: Agents are prohibited from performing any automated Git push or pull operations, as these could lead to unintended changes or data loss.
3. **MANDATORY backups before changes**: Agents must create a backup of critical files before making any changes to the system.
4. **LOCAL git snapshots only - user handles GitHub sync**: Agents can only perform local Git operations, with the user responsible for handling any GitHub synchronization.

By enforcing these protocols, the `protocol-compliance-checker.js` script helps maintain the stability, security, and traceability of the rEngine Core platform.

## Key Functions/Classes

The main class in this file is `ProtocolComplianceChecker`, which contains the following key functions:

1. `checkCompliance()`: Runs the comprehensive protocol compliance check, covering all the critical protocols.
2. `checkFileContainment()`: Ensures that no files are created outside the designated project root directory.
3. `checkGitOperations()`: Scans all JavaScript files for any automated Git push or pull operations.
4. `checkBackupRequirements()`: Verifies that a recent backup has been created before any changes are made.
5. `checkPathReferences()`: Checks for any dangerous path references that could lead to unintended file access.
6. `validatePath(filePath)`: Performs a quick validation to ensure a file path is within the project root.
7. `validateGitOperation(operation)`: Checks if a Git operation is allowed (no push or pull).
8. `createProtocolBackup(description)`: Creates a backup of critical files before making changes.
9. `promptGitHubSync()`: Provides instructions for the user to manually synchronize changes with GitHub.

## Dependencies

The `protocol-compliance-checker.js` file depends on the following modules:

- `fs-extra`: For advanced file system operations.
- `path`: For handling file paths.
- `child_process`: For executing shell commands (e.g., `find` to locate JavaScript files).

## Usage Examples

The `ProtocolComplianceChecker` class can be used in the following ways:

1. **Compliance Check**:

```javascript
const checker = new ProtocolComplianceChecker();
const result = await checker.checkCompliance();

if (result.compliant) {
  console.log('All protocols are compliant, safe to proceed');
} else {
  console.error('Protocol violations detected, cannot proceed');
  for (const violation of result.violations) {
    console.error(`${violation.type}: ${violation.message} (Action: ${violation.action})`);
  }
  process.exit(1);
}
```

1. **Creating a Backup**:

```javascript
const checker = new ProtocolComplianceChecker();
const backupDir = await checker.createProtocolBackup('Manual backup before changes');
console.log(`Backup created at: ${backupDir}`);
```

1. **Validating a File Path**:

```javascript
const checker = new ProtocolComplianceChecker();
try {
  checker.validatePath('/Volumes/DATA/GitHub/rEngine/rEngine/some-file.js');
  // Path is valid, proceed with operation
} catch (err) {
  console.error(err.message);
  // Path is invalid, handle the error
}
```

1. **Validating a Git Operation**:

```javascript
const checker = new ProtocolComplianceChecker();
try {
  checker.validateGitOperation('git pull');
  // Git operation is allowed, proceed
} catch (err) {
  console.error(err.message);
  // Git operation is not allowed, handle the error
}
```

## Configuration

The `ProtocolComplianceChecker` class has a hardcoded `projectRoot` property set to `/Volumes/DATA/GitHub/rEngine`. This path can be modified if the project's root directory is located elsewhere.

## Integration Points

The `protocol-compliance-checker.js` file is a critical component of the rEngine Core platform. It integrates with various other rEngine components, such as:

- `smart-scribe.js`: Responsible for managing agent operations.
- `agent-hello-workflow.js`: Handles the initial agent setup and communication.
- `memory-sync-manager.js`: Manages the synchronization of agent memory with the central repository.

By enforcing the defined protocols, the `ProtocolComplianceChecker` ensures the overall integrity and security of the rEngine ecosystem.

## Troubleshooting

1. **Compliance Check Failure**:
   - **Symptom**: The `checkCompliance()` method returns a `compliant: false` result.
   - **Resolution**: Examine the `violations` array in the returned object and address each violation accordingly. The `action` property in each violation provides guidance on the required steps.

1. **Backup Creation Failure**:
   - **Symptom**: The `createProtocolBackup()` method throws an error or fails to create the backup directory.
   - **Resolution**: Ensure that the `rEngine/backups` directory exists within the project root and that the user running the script has the necessary permissions to create files and directories.

1. **Invalid Path or Git Operation**:
   - **Symptom**: The `validatePath()` or `validateGitOperation()` methods throw an error.
   - **Resolution**: Verify that the file path or Git operation being validated is within the defined protocols. Modify the operation or path to comply with the protocol requirements.

If you encounter any other issues or have questions about the usage or integration of the `protocol-compliance-checker.js` file, please reach out to the rEngine Core development team for further assistance.
