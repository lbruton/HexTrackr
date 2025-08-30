# rAgents/rScripts/handoff.sh - StackTrackr Environment Handoff Script

## Purpose & Overview

The `handoff.sh` script is a critical component in the rEngine Core ecosystem, responsible for coordinating the seamless transition of development work between the local Visual Studio Code (VS Code) environment and the remote Codex environment. This script ensures that the codebase remains in a consistent and synchronized state, preventing conflicts and data loss during the handoff process.

The script provides the following key functionalities:

1. **Prepare for Codex Handoff**: This mode ensures that the local repository is in a clean state, with all changes committed or stashed, before pushing the latest updates to the remote GitHub repository. It also creates a safety backup branch in case any issues arise during the Codex session.

1. **Prepare for Local Work**: After the Codex session is complete, this mode fetches the latest changes from the remote repository, merges them with the local repository, and updates the handoff timestamp. This allows developers to safely resume their local work in VS Code.

1. **Check Status**: This mode provides an overview of the current state of the repository, including the synchronization status between the local and remote repositories, as well as the timestamps of the last handoffs.

1. **Emergency Conflict Resolution**: In the event of a conflict between the local and remote repositories, this mode offers a guided process to help resolve the issue, either by resetting the local repository to match the remote, force-pushing the local changes to the remote, or performing a manual merge.

By using this script, the rEngine Core team ensures a reliable and consistent development workflow, where developers can seamlessly transition between local and remote environments without the risk of data loss or synchronization issues.

## Key Functions/Classes

The `handoff.sh` script is a Bash script that contains the following main functions:

1. **`prepare_for_codex()`**: This function handles the preparation for a Codex session. It checks the repository status, handles any uncommitted changes, pushes the latest changes to the remote repository, and creates a safety backup branch.

1. **`prepare_for_local()`**: This function prepares the repository for local work after a Codex session. It fetches the latest changes from the remote repository, merges them with the local repository, and updates the handoff timestamp.

1. **`check_status()`**: This function provides an overview of the current repository status, including the synchronization between the local and remote repositories, as well as the timestamps of the last handoffs.

1. **`emergency_resolve()`**: This function guides the user through the process of resolving conflicts between the local and remote repositories, offering options to reset the local repository, force-push the local changes, or perform a manual merge.

The script also includes several helper functions, such as `log()`, `error()`, `warning()`, and `success()`, which handle the logging and output formatting.

## Dependencies

The `handoff.sh` script has the following dependencies:

1. **Bash shell**: The script is written in Bash and requires a Bash-compatible shell environment to run.
2. **Git**: The script extensively uses Git commands to interact with the local and remote repositories, so a working Git installation is required.
3. **StackTrackr repository**: The script assumes that it is being executed within the root directory of the StackTrackr repository.

## Usage Examples

The `handoff.sh` script can be used in the following ways:

1. **Prepare for Codex Session**:

   ```bash
   ./handoff.sh to-codex
   ```

   or

   ```bash
   ./handoff.sh codex
   ```

1. **Prepare for Local Work**:

   ```bash
   ./handoff.sh to-local
   ```

   or

   ```bash
   ./handoff.sh local
   ```

1. **Check Repository Status**:

   ```bash
   ./handoff.sh status
   ```

   or

   ```bash
   ./handoff.sh check
   ```

1. **Resolve Conflicts (Emergency Mode)**:

   ```bash
   ./handoff.sh emergency
   ```

   or

   ```bash
   ./handoff.sh resolve
   ```

1. **Display Help**:

   ```bash
   ./handoff.sh help
   ```

## Configuration

The `handoff.sh` script uses the following configuration parameters:

| Parameter | Description |
| --- | --- |
| `REPO_ROOT` | The root directory of the StackTrackr repository. This is hardcoded to `/Volumes/DATA/GitHub/rEngine`. |
| `HANDOFF_LOG` | The path to the handoff log file, which is set to `$REPO_ROOT/agents/handoff.log`. |

The script does not require any external environment variables to be set.

## Integration Points

The `handoff.sh` script is a crucial component in the rEngine Core ecosystem, as it ensures the seamless integration between the local VS Code development environment and the remote Codex environment. It helps maintain the integrity of the codebase by preventing conflicts and data loss during the handoff process.

The script is typically used by rEngine Core developers who are working on the StackTrackr project. It provides a standardized and reliable way to transition between local and remote development workflows, allowing for efficient collaboration and deployment.

## Troubleshooting

Here are some common issues that may arise when using the `handoff.sh` script and their solutions:

1. **Repository not found**:
   - **Error**: `Not in StackTrackr repository root`
   - **Solution**: Ensure that you are running the script from the root directory of the StackTrackr repository.

1. **Uncommitted changes**:
   - **Error**: `Working directory has uncommitted changes`
   - **Solution**: Either commit the changes, stash them, or choose to cancel the handoff process when prompted.

1. **Remote repository out of sync**:
   - **Error**: `Local and remote are out of sync`
   - **Solution**: Run the `prepare_for_local()` function to fetch the latest changes from the remote repository and merge them with the local repository.

1. **Merge conflicts**:
   - **Error**: `Merge conflicts detected`
   - **Solution**: When prompted, choose the "Manual merge resolution" option and resolve the conflicts manually. Once resolved, run `git add -A && git commit` to complete the merge.

1. **Backup branch creation failure**:
   - **Error**: `Failed to create backup branch`
   - **Solution**: Check the repository permissions and ensure that you have the necessary rights to create new branches.

If you encounter any other issues or have questions about the usage or integration of the `handoff.sh` script, please reach out to the rEngine Core team for assistance.
