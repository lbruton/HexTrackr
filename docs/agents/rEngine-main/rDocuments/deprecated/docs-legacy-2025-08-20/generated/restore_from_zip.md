# `restore_from_zip.sh`: Intelligent Restoration for rEngine Core

## Purpose & Overview

The `restore_from_zip.sh` script is a critical component of the rEngine Core platform, responsible for restoring project files after they have been modified or updated through the ChatGPT/GPT5 integration. This script handles the entire restoration workflow, including:

1. Restoring executable permissions on shell scripts.
2. Validating the integrity of JSON files.
3. Checking for cross-references between key memory files (e.g., tasks, bugs, roadmap).
4. Updating timestamps to reflect the restoration process.
5. Generating a detailed restoration report.

By automating these restoration tasks, this script ensures that the rEngine Core project is properly set up and ready for continued development and collaboration.

## Key Functions/Classes

The `restore_from_zip.sh` script consists of several key functions that work together to achieve the overall restoration process:

1. `restore_permissions()`: Restores executable permissions on shell scripts, either using a stored metadata file or by making all `.sh` files executable.
2. `validate_json_files()`: Validates the integrity of all JSON files in the `agents` directory.
3. `validate_cross_references()`: Checks for valid cross-references between key memory files, such as tasks referencing valid bugs.
4. `update_timestamps()`: Updates the `last_updated`, `restored_from_zip`, and `restoration_date` metadata fields in the key memory files.
5. `check_git_status()`: Checks the status of the Git repository and reports any changes made during the restoration process.
6. `run_final_validation()`: Runs a final validation step, including testing any portable scripts and re-validating the memory system.
7. `create_restoration_report()`: Generates a detailed JSON report of the restoration process, including validation results and next steps.

## Dependencies

The `restore_from_zip.sh` script relies on the following dependencies:

- Bash shell
- Python 3 (for JSON validation and metadata updates)
- The `agents` directory and its contents (memory files, portable scripts, etc.)

## Usage Examples

To use the `restore_from_zip.sh` script, simply run it from the project root directory:

```bash
cd /path/to/rEngine/Core/project
./rAgents/rScripts/restore_from_zip.sh
```

The script will automatically detect the project root, perform the restoration workflow, and generate a restoration report.

## Configuration

The `restore_from_zip.sh` script does not require any external configuration. It dynamically detects the project root and other necessary paths based on the script's location.

However, the script does rely on the presence of certain files and directories, such as the `agents` directory and the `zip_prep` subdirectory. Ensure that these are present and correctly organized within your rEngine Core project.

## Integration Points

The `restore_from_zip.sh` script is a key integration point within the rEngine Core platform. It is responsible for restoring the project state after modifications have been made through the ChatGPT/GPT5 integration. Other rEngine Core components, such as the memory management system and the sync tools, rely on the successful execution of this script to ensure the consistency and integrity of the project.

## Troubleshooting

Here are some common issues that may arise while using the `restore_from_zip.sh` script and their solutions:

1. **Agents directory not found**: If the script cannot find the `agents` directory, ensure that you are running the script from the correct project root directory.

1. **JSON file validation errors**: If the script reports invalid JSON files, check the restoration report for details on the specific issues and address them accordingly.

1. **Cross-reference validation failures**: If the script detects invalid cross-references between memory files, review the restoration report and make any necessary corrections to the affected files.

1. **Permissions restoration issues**: If the script fails to restore executable permissions on shell scripts, check the restoration metadata file (if present) and ensure that the file paths are correct.

1. **Portable script issues**: If the script reports problems with the portable scripts, ensure that they are present in the `zip_prep` directory and that they have the correct permissions.

1. **Git status problems**: If the script reports changes in the working directory, review the changes and consider committing them if everything looks correct.

If you encounter any other issues, refer to the restoration report for more information, or seek support from the rEngine Core development team.
