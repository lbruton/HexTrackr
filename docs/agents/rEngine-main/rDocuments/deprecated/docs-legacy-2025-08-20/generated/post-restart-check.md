# post-restart-check.sh - rEngine Core System Status Verification

## Purpose & Overview

The `post-restart-check.sh` script is a critical part of the rEngine Core ecosystem. It serves as a comprehensive system status check after a restart or deployment, ensuring that all essential components and files are in place and operational. This script provides a quick and reliable way to verify the health of the rEngine Core system, enabling developers and administrators to quickly identify and address any issues before proceeding with further operations.

## Key Functions/Classes

1. **Directory Verification**: The script first checks if it is being executed from the correct root directory of the StackTrackr project.
2. **Instruction File Checks**: It then verifies the presence of key instruction files, such as `COPILOT_INSTRUCTIONS.md`, `AGENT.md`, and `emergencycontext.md`.
3. **Conflict Detection**: The script checks for any conflicting COPILOT instruction files (e.g., `COPILOT_INSTRUCTIONS_*.md`).
4. **rEngine Component Checks**: It inspects the contents of the `rEngine` directory, ensuring that all essential files (e.g., `split-scribe-console.js`, `auto-launch-split-scribe.sh`, `agent-menu.js`, `agent-init.sh`) are present.
5. **Process Status**: The script checks if the `split-scribe-console.js` process is running, which is a critical component of the rEngine Core system.
6. **Git Status**: Finally, the script checks the status of the Git repository, reporting any uncommitted changes and the last commit made.

## Dependencies

The `post-restart-check.sh` script relies on the following dependencies:

- Bash shell
- Common Unix utilities (e.g., `ls`, `grep`, `awk`, `head`)
- Git command-line tools

## Usage Examples

To run the `post-restart-check.sh` script, follow these steps:

1. Navigate to the StackTrackr root directory:

   ```
   cd /Volumes/DATA/GitHub/rEngine
   ```

1. Execute the script:

   ```
   ./rEngine/post-restart-check.sh
   ```

The script will perform the various checks and report the status of the rEngine Core system. If any issues are detected, the script will provide guidance on how to address them.

## Configuration

The `post-restart-check.sh` script does not require any specific configuration. It relies on the file and directory structure of the StackTrackr project and the availability of the necessary rEngine Core components.

## Integration Points

The `post-restart-check.sh` script is closely integrated with the overall rEngine Core ecosystem. It serves as a crucial verification step after any system restart or deployment, ensuring the seamless operation of the rEngine Core platform.

## Troubleshooting

Here are some common issues that may arise and their corresponding solutions:

1. **Missing COPILOT_INSTRUCTIONS.md or other key files**:
   - Ensure that all the required instruction files are present in the StackTrackr root directory.
   - If any files are missing, create them or copy them from a known working environment.

1. **Conflicting COPILOT instruction files**:
   - Investigate the conflicting files and determine the correct version to use.
   - Remove or rename the conflicting files to resolve the issue.

1. **Missing rEngine components**:
   - Verify that the `rEngine` directory exists and contains all the necessary files.
   - If any files are missing, copy them from a known working environment or re-deploy the rEngine Core components.

1. **Split scribe console not running**:
   - Check if the `split-scribe-console.js` process is running using the `ps` command.
   - If the process is not running, start it manually or investigate any issues that may be preventing it from launching.

1. **Uncommitted changes in the Git repository**:
   - Review the reported Git status and commit or discard any pending changes as appropriate.
   - Ensure that the Git repository is in a clean state before proceeding with further operations.

By addressing any issues reported by the `post-restart-check.sh` script, you can ensure that the rEngine Core system is in a healthy and operational state, ready for further use and integration.
