# rEngine Core - status-check.sh

## Purpose & Overview

The `status-check.sh` script is a utility tool for the rEngineMCP (rEngine Micro-Service Communication Protocol) component within the rEngine Core platform. This script provides a comprehensive status check for the rEngineMCP plugin, the Ollama server, the conversation memory directory, and the Visual Studio Code (VS Code) MCP configuration.

The primary purpose of this script is to help developers and system administrators quickly assess the overall health and operational status of the rEngine Core ecosystem, allowing them to identify any issues or configuration problems that may need attention.

## Key Functions/Classes

The `status-check.sh` script performs the following key checks:

1. **rEngineMCP Plugin Status**: Checks if the rEngineMCP plugin is running and accessible, providing the process ID (PID) if it is running.
2. **Ollama Server Status**: Checks if the Ollama server is accessible, and reports the number of available models, including a specific check for the `llama3:8b` model.
3. **Conversation Memory Directory**: Checks if the conversation memory directory exists and reports the number of conversation files stored.
4. **VS Code MCP Configuration**: Checks if the rEngineMCP configuration is present in the user's VS Code settings file, and recommends restarting VS Code to activate the MCP tools.

## Dependencies

The `status-check.sh` script relies on the following dependencies:

- **Bash shell**: The script is written in Bash, the default shell on macOS and many Linux distributions.
- **jq**: A lightweight and flexible command-line JSON processor, used to parse the Ollama server response.
- **curl**: A command-line tool for transferring data using various protocols, including HTTP, used to check the Ollama server.

## Usage Examples

To run the `status-check.sh` script, follow these steps:

1. Navigate to the rEngine Core directory:

   ```
   cd /Volumes/DATA/GitHub/rEngine/rEngine
   ```

1. Execute the script:

   ```
   ./status-check.sh
   ```

The script will output the status of the various rEngine Core components, along with some quick action suggestions for common troubleshooting tasks.

## Configuration

The `status-check.sh` script does not require any specific configuration. However, it does rely on some hardcoded paths and values, such as:

- The location of the rEngineMCP plugin: `/Volumes/DATA/GitHub/rEngine/rEngine`
- The location of the conversation memory directory: `/Volumes/DATA/GitHub/rEngine/rEngine/.rengine/conversations`
- The location of the VS Code settings file: `/Users/$(whoami)/Library/Application Support/Code/User/settings.json`

These values may need to be adjusted if your rEngine Core installation is in a different location or if you are using a different user account.

## Integration Points

The `status-check.sh` script is a standalone utility that provides a comprehensive overview of the rEngine Core ecosystem. It does not directly integrate with other rEngine Core components, but rather serves as a tool to help developers and system administrators monitor the overall health and status of the system.

## Troubleshooting

Here are some common issues and solutions related to the `status-check.sh` script:

1. **rEngineMCP Plugin Not Running**:
   - Ensure that the rEngineMCP plugin is correctly installed and configured.
   - Check the rEngine Core directory and start the rEngineMCP plugin manually using the provided command.

1. **Ollama Server Not Running**:
   - Verify that the Ollama server is installed and running.
   - Start the Ollama server using the provided command.

1. **Conversation Memory Directory Missing**:
   - Ensure that the conversation memory directory is correctly configured and accessible.
   - Check the file system permissions and create the directory if it does not exist.

1. **VS Code MCP Configuration Not Found**:
   - Verify that the rEngineMCP configuration is correctly set up in the user's VS Code settings.
   - Update the VS Code settings file with the necessary rEngineMCP configuration.

If you encounter any other issues or have questions, please consult the rEngine Core documentation or reach out to the rEngine Core development team for further assistance.
