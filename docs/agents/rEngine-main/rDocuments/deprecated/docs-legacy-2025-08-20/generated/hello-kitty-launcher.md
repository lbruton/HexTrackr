# rEngine Hello Kitty Launcher

## Purpose & Overview

The `hello-kitty-launcher.sh` script is a cute and informative startup script for the rEngine Core platform. It provides a friendly interface to monitor the status of the rEngine MCP (Micro Control Plane) Server, Memory MCP Server, Smart Scribe system, and Ollama Server. The script also offers quick access to common management tasks, such as viewing logs, restarting the rEngine server, and running memory protection.

This script is designed to be the main entry point for rEngine administrators, offering a centralized and visually appealing way to check the overall health and status of the rEngine ecosystem.

## Key Functions/Classes

1. **Status Checks**:
   - rEngine MCP Server
   - Memory MCP Server
   - Smart Scribe system
   - Ollama Server
   - Persistent memory protection

1. **Management Actions**:
   - Starting the rEngine MCP Server if it's not running
   - Displaying quick access commands for common tasks

1. **Formatting and Visualization**:
   - Displaying colorful ASCII art and status messages
   - Using ANSI escape codes to set terminal colors

## Dependencies

The `hello-kitty-launcher.sh` script relies on the following dependencies:

- Bash shell
- `ps` command to check process status
- `curl` command to interact with the Ollama Server
- `jq` command-line JSON processor (for parsing Ollama Server response)
- `crontab` command to check the status of the Smart Scribe's keep-alive job

Additionally, the script assumes that the rEngine Core components are installed and configured in the expected locations, such as the `/Volumes/DATA/GitHub/rEngine/rEngine` directory.

## Usage Examples

To use the `hello-kitty-launcher.sh` script, simply run the following command in your terminal:

```bash
./hello-kitty-launcher.sh
```

This will display the current status of the rEngine Core components and provide a list of quick access commands for common management tasks.

## Configuration

The `hello-kitty-launcher.sh` script does not require any specific configuration. However, it assumes that the rEngine Core components are installed and configured correctly, with the necessary directories and files in place.

## Integration Points

The `hello-kitty-launcher.sh` script is designed to be the central entry point for rEngine administrators. It interacts with the following rEngine Core components:

- rEngine MCP Server (`index.js`)
- Memory MCP Server (`mcp-server-memory`)
- Smart Scribe system (`smart-scribe.js`)
- Ollama Server (`http://localhost:11434/api/tags`)
- Persistent memory protection (`persistent-memory.json`)

The script monitors the status of these components and provides a unified view of the rEngine Core ecosystem.

## Troubleshooting

Here are some common issues and solutions related to the `hello-kitty-launcher.sh` script:

### rEngine MCP Server not starting

If the script fails to start the rEngine MCP Server, check the following:

1. Ensure that the `node` command is available in your system's PATH.
2. Verify that the `index.js` file is present in the `/Volumes/DATA/GitHub/rEngine/rEngine` directory.
3. Check the `rengine.log` file for any error messages or clues about the startup failure.

### Smart Scribe system not running

If the Smart Scribe system is not running, check the following:

1. Ensure that the `smart-scribe.js` file is present in the expected location.
2. Verify that the keep-alive cron job is configured correctly. The script checks for the presence of the `scribe-keepalive` entry in the crontab.
3. Check the technical knowledge database file (`technical-knowledge.json`) for any issues or corruption.

### Ollama Server not responding

If the Ollama Server is not responding, check the following:

1. Ensure that the Ollama Server is running and accessible at `http://localhost:11434/api/tags`.
2. Verify that the `curl` and `jq` commands are available in your system.
3. Check the Ollama Server logs for any error messages or clues about the issue.

If you encounter any other issues, refer to the rEngine Core documentation or reach out to the development team for further assistance.
