# Deploy Agent Framework Script

## Purpose & Overview

The `deploy-agent-framework.sh` script is a core component of the rEngine Core ecosystem, responsible for rapidly deploying the StackTrackr Agent Framework to new projects. This framework provides a comprehensive set of tools and protocols for integrating AI-powered agents into the development process, enabling efficient and cost-optimized workflows.

When a new project is created within the rEngine Core platform, this script is used to set up the necessary directory structure, copy the required framework files, and configure the initial agent status. This ensures that the project has a consistent and standardized agent-enhanced development environment from the start.

## Key Functions/Classes

The main functions performed by this script are:

1. **Configuration Setup**: The script takes the target project path and an optional project name as input parameters. It then sets up the necessary directory structure for the new project.

1. **Framework File Copying**: The script copies a predefined set of framework files from the source project to the target project directory. These files include agent definitions, workflow protocols, backup scripts, and project templates.

1. **Agent Status Initialization**: The script creates initial agent status files for the Claude, GPT, and Gemini agents, setting their current status, last task, and next action.

1. **Project File Generation**: The script generates basic project files, such as a README, roadmap, and changelog, to provide a starting point for the new project.

1. **Script Execution Permissions**: The script ensures that all the copied script files (`.sh` and `.py`) are made executable.

1. **Git Repository Initialization**: If the target project directory is not already a Git repository, the script initializes a new Git repository and performs the initial commit.

## Dependencies

The `deploy-agent-framework.sh` script does not have any external dependencies beyond a standard Bash environment. It relies on the presence of the source project directory and the necessary framework files within it.

## Usage Examples

To use the `deploy-agent-framework.sh` script, follow these steps:

1. Navigate to the rEngine Core project directory:

   ```bash
   cd /path/to/rEngine/Core
   ```

1. Run the script, providing the target project path and an optional project name:

   ```bash
   ./rMemory/rAgentMemories/engine/scripts/deploy-agent-framework.sh /path/to/MyNewProject "My New Project"
   ```

   This will deploy the StackTrackr Agent Framework to the `/path/to/MyNewProject` directory and name the project "My New Project".

1. After the deployment is complete, follow the instructions provided in the script's output to initialize the MCP memory and start the first evening work session.

## Configuration

The `deploy-agent-framework.sh` script uses the following configuration parameters:

| Parameter | Description |
| --- | --- |
| `SOURCE_PROJECT` | The path to the source project directory containing the framework files. |
| `TARGET_PROJECT` | The path to the target project directory where the framework will be deployed. |
| `PROJECT_NAME` | The name of the new project. This is an optional parameter, and if not provided, the script will use "NewProject" as the default. |

These parameters can be modified at the beginning of the script if needed.

## Integration Points

The `deploy-agent-framework.sh` script is a crucial component of the rEngine Core platform, as it sets up the necessary infrastructure for agent-enhanced development. It integrates with the following rEngine Core components:

1. **rMemory**: The script creates the necessary directory structure and files within the `rAgentMemories` subsystem, which manages the agent-related data and workflows.

1. **rAgent**: The script initializes the agent status files, which are essential for the rAgent system to coordinate and manage the agents throughout the development process.

1. **rWorkflow**: The script generates project files, such as the roadmap and changelog, which are used to establish the project-specific workflows and track progress.

1. **rGit**: The script sets up a Git repository for the new project, enabling the rGit component to manage version control and checkpoints.

## Troubleshooting

Here are some common issues that may arise with the `deploy-agent-framework.sh` script and their potential solutions:

1. **Missing Source Project Files**:
   - If any of the framework files are missing from the `SOURCE_PROJECT` directory, the script will display a warning message.
   - Ensure that the source project directory contains all the required framework files.

1. **Permissions Issues**:
   - If the script encounters any permissions issues while creating directories or copying files, it may fail to complete the deployment.
   - Verify that the user running the script has the necessary permissions to access and write to the target project directory.

1. **Git Repository Initialization Failure**:
   - If the target project directory is already a Git repository, the script may fail to initialize a new one.
   - In this case, manually initialize the Git repository in the target project directory, or remove the existing repository before running the script.

1. **Incorrect Target Project Path**:
   - If the `TARGET_PROJECT` parameter is not a valid directory path, the script will display an error message and exit.
   - Ensure that the target project path is correct and accessible.

If you encounter any other issues, refer to the script's output for additional information and error messages, which may help you diagnose and resolve the problem.
