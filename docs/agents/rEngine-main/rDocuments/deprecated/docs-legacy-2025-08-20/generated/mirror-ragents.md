# rAgents Mirror to Private Repo Script

## Purpose & Overview

The `mirror-ragents.sh` script is a crucial security measure for the rEngine Core platform's `rAgents` module. This script is responsible for mirroring the entire `rAgents` folder to a private repository, ensuring the protection of sensitive intellectual property (IP) and commercial information.

The script performs the following key steps:

1. Creates a timestamped archive of the complete `rAgents` folder.
2. Adds a comprehensive `.gitignore` file to the public repository, effectively hiding the `rAgents` folder and related sensitive files from the public codebase.
3. Provides detailed instructions for the manual steps required to set up the private repository and maintain the sync workflow between the public and private repositories.
4. Generates a helper script (`sync-to-private.sh`) to simplify the process of syncing changes from the public repository to the private repository in the future.

By following this process, the rEngine Core team can keep the sensitive `rAgents` code and assets completely separate from the public-facing repository, reducing the risk of accidental exposure or unauthorized access to the company's intellectual property.

## Key Functions/Classes

The `mirror-ragents.sh` script primarily consists of the following key functions:

1. **Archive Creation**: The script creates a timestamped archive of the complete `rAgents` folder using the `tar` command.
2. **.gitignore Management**: The script adds a comprehensive set of exclusion patterns to the `.gitignore` file, ensuring that the `rAgents` folder and related sensitive files are ignored in the public repository.
3. **Verification**: The script checks the effectiveness of the `.gitignore` rules and displays the current git status of the `rAgents` folder.
4. **Manual Step Instructions**: The script provides detailed instructions for the manual steps required to set up the private repository and maintain the sync workflow.
5. **Sync Helper Script**: The script generates a helper script (`sync-to-private.sh`) to simplify the process of syncing changes from the public repository to the private repository.

## Dependencies

The `mirror-ragents.sh` script has the following dependencies:

- Bash shell
- `tar` command for creating archives
- `git` for version control operations

## Usage Examples

To use the `mirror-ragents.sh` script, follow these steps:

1. Navigate to the `rAgents` folder in the rEngine Core codebase.
2. Run the script using the following command:

   ```bash
   ./mirror-ragents.sh
   ```

   This will execute the script and perform the necessary steps to mirror the `rAgents` folder to a private repository.

1. Follow the detailed instructions provided by the script to set up the private repository and maintain the sync workflow.

1. Use the generated `sync-to-private.sh` script to simplify the process of syncing changes from the public repository to the private repository in the future.

## Configuration

The `mirror-ragents.sh` script does not require any specific configuration. However, you will need to provide the following information when setting up the private repository:

- Your GitHub username or the URL of the private repository
- The local path where you want to clone the private repository

These details are provided in the instructions displayed by the script.

## Integration Points

The `mirror-ragents.sh` script is a standalone security measure for the `rAgents` module within the rEngine Core platform. It does not directly integrate with other rEngine Core components, but it plays a crucial role in protecting the sensitive intellectual property and commercial information associated with the `rAgents` module.

## Troubleshooting

Here are some common issues that may arise and their solutions:

1. **Private repository not found**: If the script is unable to find the private repository at the specified location, ensure that you have cloned the repository correctly and that the path is correct.

1. **Git command issues**: If you encounter any issues with the git commands provided in the instructions, ensure that you have the necessary permissions and that your git configuration is set up correctly.

1. **Sync issues**: If you experience any issues with syncing changes between the public and private repositories, double-check the permissions, file paths, and ensure that you are following the sync workflow as described in the instructions.

If you encounter any other issues, please consult the rEngine Core documentation or reach out to the rEngine Core support team for assistance.
