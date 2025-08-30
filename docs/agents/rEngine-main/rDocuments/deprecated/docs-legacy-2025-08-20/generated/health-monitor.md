# rEngine Core Health Monitor

## Purpose & Overview

The `health-monitor.sh` script is a critical component in the rEngine Core ecosystem, responsible for monitoring the health of the rEngineMCP and Memory MCP servers. This script runs as a background process (daemon) and automatically restarts the servers if they crash or become unresponsive, ensuring the continuous operation of the rEngine Core platform.

## Key Functions/Classes

1. **`log_message()`**: A utility function that appends a timestamp and a message to the health monitor log file.
2. **`is_running()`**: A helper function that checks if a process with a given pattern is running.
3. **`health_check()`**: The main function that performs the health checks and initiates the server restart if necessary.

## Dependencies

The `health-monitor.sh` script depends on the following:

1. **`start-mcp-servers.sh`**: The script responsible for starting the rEngineMCP and Memory MCP servers.
2. **`health-monitor.log`**: The log file where the health monitor records its activities.

## Usage Examples

1. **Running the Health Monitor in Daemon Mode**:

   ```bash
   ./health-monitor.sh --daemon
   ```

   This will start the health monitor in continuous monitoring mode, checking the server status every 5 minutes and restarting the servers if necessary.

1. **Running a One-Time Health Check**:

   ```bash
   ./health-monitor.sh
   ```

   This will perform a single health check and log the results to the `health-monitor.log` file.

## Configuration

The `health-monitor.sh` script uses the following configuration settings:

- `SCRIPT_DIR`: The directory where the rEngine Core scripts are located.
- `STARTUP_SCRIPT`: The path to the `start-mcp-servers.sh` script.
- `HEALTH_LOG`: The path to the health monitor log file.

These settings are defined at the beginning of the script and can be adjusted as needed to match your rEngine Core deployment.

## Integration Points

The `health-monitor.sh` script is a crucial component in the rEngine Core platform, as it ensures the continuous availability of the rEngineMCP and Memory MCP servers. It integrates with the following rEngine Core components:

1. **rEngineMCP**: The script monitors the health of the rEngineMCP server and restarts it if necessary.
2. **Memory MCP**: The script also monitors the health of the Memory MCP server and restarts it if necessary.
3. **`start-mcp-servers.sh`**: The script relies on the `start-mcp-servers.sh` script to restart the servers when needed.

## Troubleshooting

### Common Issues and Solutions

1. **Health monitor not running**: Ensure that the `health-monitor.sh` script has the correct permissions to execute. You can check this by running `chmod +x health-monitor.sh`.
2. **Servers not restarting**: Verify that the `start-mcp-servers.sh` script is functioning correctly and that the necessary dependencies are available.
3. **Incomplete log entries**: Check the permissions on the `health-monitor.log` file to ensure that the script has write access.

If you encounter any other issues, you can refer to the log file (`health-monitor.log`) for more information about the health monitor's activities and any errors that may have occurred.
