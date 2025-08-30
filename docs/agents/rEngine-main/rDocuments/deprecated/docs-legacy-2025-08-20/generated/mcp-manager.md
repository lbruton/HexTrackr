# rEngine Core: MCP Server Management Script

## Purpose & Overview

The `mcp-manager.sh` script is a Bash script that provides a set of commands to manage the MCP (Memory and Compute Platform) servers in the rEngine Core ecosystem. This script allows you to start, stop, restart, check the status, install auto-startup, and monitor the health of the MCP servers.

The MCP servers are a critical component of the rEngine Core platform, responsible for handling memory and compute-intensive tasks. This script ensures that the MCP servers are properly managed and maintained, helping to keep the overall rEngine Core platform running smoothly.

## Key Functions/Classes

The `mcp-manager.sh` script provides the following main functions:

1. **show_usage**: Displays the available commands and their descriptions.
2. **is_running**: Checks if a specific process is running.
3. **show_status**: Displays the current status of the MCP servers, including whether they are running and if the auto-startup service is installed.
4. **start_servers**: Starts the MCP servers using the `start-mcp-servers.sh` script.
5. **stop_servers**: Stops the running MCP servers.
6. **install_autostart**: Installs an auto-startup service to ensure the MCP servers start automatically on system boot.
7. **uninstall_autostart**: Removes the auto-startup service.
8. **show_logs**: Displays the recent logs for the MCP servers and the health monitoring daemon.
9. **start_monitor**: Starts the health monitoring daemon, which checks the status of the MCP servers at regular intervals.

## Dependencies

The `mcp-manager.sh` script depends on the following files and scripts:

- `start-mcp-servers.sh`: This script is responsible for starting the MCP servers.
- `health-monitor.sh`: This script is used to monitor the health of the MCP servers.
- `com.stacktrackr.mcp-servers.plist`: This is a macOS LaunchAgent plist file used for the auto-startup service.

The script also assumes the presence of the following log files:

- `rengine.log`: Logs for the rEngineMCP server.
- `memory-server.log`: Logs for the Memory MCP server.
- `health-monitor.log`: Logs for the health monitoring daemon.

## Usage Examples

To use the `mcp-manager.sh` script, follow these steps:

1. Open a terminal window and navigate to the directory containing the script.
2. Run the script with one of the available commands:

   ```bash

   # Start the MCP servers

   ./mcp-manager.sh start

   # Stop the MCP servers

   ./mcp-manager.sh stop

   # Restart the MCP servers

   ./mcp-manager.sh restart

   # Check the status of the MCP servers

   ./mcp-manager.sh status

   # Install the auto-startup service

   ./mcp-manager.sh install

   # Uninstall the auto-startup service

   ./mcp-manager.sh uninstall

   # Show the recent logs

   ./mcp-manager.sh logs

   # Start the health monitoring daemon

   ./mcp-manager.sh monitor
   ```

1. If you run the script without any command, it will display the usage information.

## Configuration

The `mcp-manager.sh` script uses the following configuration variables:

| Variable | Description |
| --- | --- |
| `SCRIPT_DIR` | The directory where the script and its associated files are located. |
| `STARTUP_SCRIPT` | The path to the `start-mcp-servers.sh` script. |
| `HEALTH_SCRIPT` | The path to the `health-monitor.sh` script. |
| `PLIST_FILE` | The path to the `com.stacktrackr.mcp-servers.plist` file. |
| `PLIST_DEST` | The destination path for the `com.stacktrackr.mcp-servers.plist` file when installing the auto-startup service. |

These variables are set at the beginning of the script and should not need to be modified in most cases.

## Integration Points

The `mcp-manager.sh` script is a critical component of the rEngine Core platform, as it ensures the proper management and maintenance of the MCP servers. This script integrates with the following rEngine Core components:

1. **rEngineMCP**: The main rEngine Core server, which relies on the MCP servers to handle memory and compute-intensive tasks.
2. **Memory MCP**: The memory-focused MCP server, which is managed by this script.
3. **Health Monitoring**: The `health-monitor.sh` script, which is responsible for monitoring the health of the MCP servers and is integrated into this script.

## Troubleshooting

Here are some common issues and solutions related to the `mcp-manager.sh` script:

1. **MCP servers not starting**: If the MCP servers fail to start, check the following:
   - Ensure that the `start-mcp-servers.sh` script is present and executable.
   - Check the log files (`rengine.log`, `memory-server.log`) for any error messages.
   - Ensure that the necessary dependencies (e.g., Node.js) are installed and configured correctly.

1. **Auto-startup service not working**: If the auto-startup service is not working as expected, check the following:
   - Ensure that the `com.stacktrackr.mcp-servers.plist` file is present and the correct permissions are set.
   - Check the macOS system logs for any errors related to the LaunchAgent.
   - Ensure that the `PLIST_DEST` variable is set correctly to the user's LaunchAgents directory.

1. **Health monitoring daemon not starting**: If the health monitoring daemon fails to start, check the following:
   - Ensure that the `health-monitor.sh` script is present and executable.
   - Check the `health-monitor.log` file for any error messages.
   - Verify that the necessary dependencies (e.g., required libraries) are installed.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the rEngine Core support team for further assistance.
