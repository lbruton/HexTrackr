# rEngine Core: start-mcp-servers-with-monitoring.sh

## Purpose & Overview

The `start-mcp-servers-with-monitoring.sh` script is a critical component of the rEngine Core platform. It is responsible for starting and monitoring the operation of two essential microservices: the `rEngineMCP` server and the `Memory MCP` server. This script ensures the continuous and reliable operation of these services, which are crucial for the overall functionality of the rEngine Core ecosystem.

The script provides the following key features:

1. **Automatic Startup**: It handles the startup of the rEngineMCP and Memory MCP servers, ensuring they are running and available for use.
2. **Health Monitoring**: The script continuously monitors the health of the running processes, checking for CPU and memory usage, as well as log file sizes.
3. **Automatic Restart**: If a server process fails, the script attempts to restart it, up to a configured maximum number of attempts. This helps maintain the integrity of the system by protecting against memory corruption or other issues that could arise from a crashed process.
4. **Logging and Notifications**: The script logs all relevant events, including startup, health checks, and restart attempts, to help with troubleshooting and monitoring.

By automating the management of these critical components, the `start-mcp-servers-with-monitoring.sh` script ensures the stability and reliability of the rEngine Core platform, allowing developers to focus on building innovative applications on top of the platform.

## Key Functions/Classes

The script is divided into several key functions that handle different aspects of the server management and monitoring:

1. **`cleanup()`**: This function is responsible for cleaning up any monitoring processes and removing the PID file when the script is terminated.
2. **`log_message()`**: This function is used to log messages with timestamps to the health monitoring log file.
3. **`is_running()`**: This function checks if a specific process is currently running.
4. **`check_process_health()`**: This function checks the health of a running process, including CPU and memory usage.
5. **`start_rengine()`**: This function starts the rEngineMCP server.
6. **`start_memory()`**: This function starts the Memory MCP server.
7. **`restart_service()`**: This function handles the process of restarting a failed service, with a configurable number of retry attempts.
8. **`health_monitor()`**: This is the main function that runs the continuous health monitoring loop, checking the status of the running servers and restarting them if necessary.

## Dependencies

The `start-mcp-servers-with-monitoring.sh` script has the following dependencies:

- Node.js runtime for running the rEngineMCP and Memory MCP servers
- `@modelcontextprotocol/server-memory` package for the Memory MCP server
- `sync-memory-files.sh` script (optional) for synchronizing memory files

The script also relies on various shell utilities, such as `pgrep`, `ps`, and `stat`, which are commonly available on Unix-based systems.

## Usage Examples

To use the `start-mcp-servers-with-monitoring.sh` script, follow these steps:

1. Ensure that the necessary dependencies (Node.js, `@modelcontextprotocol/server-memory`) are installed and available on your system.
2. Place the `start-mcp-servers-with-monitoring.sh` script in the appropriate directory, typically the `rEngine` directory.
3. Open a terminal and navigate to the `rEngine` directory.
4. Run the script using the following command:

   ```bash
   bash start-mcp-servers-with-monitoring.sh
   ```

   This will start the rEngineMCP and Memory MCP servers, and begin the continuous health monitoring process.

1. The script will output relevant information, including the status of the servers, log file locations, and any errors or restart attempts.
2. To stop the monitoring process, press `Ctrl+C`. This will trigger the `cleanup()` function and gracefully shut down the monitoring.

## Configuration

The `start-mcp-servers-with-monitoring.sh` script can be configured by modifying the variables at the beginning of the file:

| Variable | Description | Default Value |
| --- | --- | --- |
| `RENGINE_DIR` | The directory where the rEngine Core project is located. | `/Volumes/DATA/GitHub/rEngine/rEngine` |
| `RENGINE_LOG` | The file path for the rEngineMCP server log. | `$RENGINE_DIR/rengine.log` |
| `MEMORY_LOG` | The file path for the Memory MCP server log. | `$RENGINE_DIR/memory-server.log` |
| `HEALTH_LOG` | The file path for the health monitoring log. | `$RENGINE_DIR/health-monitor.log` |
| `PID_FILE` | The file path for the monitoring process PID file. | `$RENGINE_DIR/mcp-monitor.pid` |
| `HEALTH_CHECK_INTERVAL` | The interval (in seconds) between health checks. | `30` |
| `MAX_RESTART_ATTEMPTS` | The maximum number of attempts to restart a failed service. | `3` |
| `RESTART_COOLDOWN` | The time (in seconds) to wait before attempting to restart a service again. | `60` |

## Integration Points

The `start-mcp-servers-with-monitoring.sh` script is a crucial component of the rEngine Core platform, as it ensures the reliable operation of the rEngineMCP and Memory MCP servers. These servers are essential for the overall functionality of the rEngine Core ecosystem, as they provide the core services and infrastructure for building and deploying applications.

The script integrates with the following rEngine Core components:

1. **rEngineMCP Server**: The script starts and monitors the rEngineMCP server, which is the main application server for the rEngine Core platform.
2. **Memory MCP Server**: The script starts and monitors the Memory MCP server, which is responsible for managing the memory context protocol (MCP) operations.
3. **Memory File Synchronization**: The script checks for and runs the `sync-memory-files.sh` script, which is responsible for synchronizing memory files across the platform.

By ensuring the continuous and reliable operation of these critical components, the `start-mcp-servers-with-monitoring.sh` script plays a vital role in the overall stability and performance of the rEngine Core platform.

## Troubleshooting

Here are some common issues that may arise and their potential solutions:

1. **Server Startup Failure**:
   - Check the log files (`rengine.log`, `memory-server.log`, `health-monitor.log`) for any error messages or clues about the failure.
   - Ensure that the necessary dependencies (Node.js, `@modelcontextprotocol/server-memory`) are installed and accessible.
   - Verify that the `RENGINE_DIR` variable is set correctly and the directory exists.

1. **Continuous Restarts**:
   - Review the `health-monitor.log` file for any patterns or indications of why the servers are continuously failing.
   - Increase the `MAX_RESTART_ATTEMPTS` and `RESTART_COOLDOWN` variables to give the servers more time to recover.
   - Check for any resource constraints (CPU, memory, disk space) that may be causing the servers to crash.

1. **Large Log File Sizes**:
   - Monitor the log file sizes and consider implementing log rotation or log file management strategies.
   - Increase the file size threshold in the script if necessary, but be mindful of disk space constraints.

1. **Monitoring Process Termination**:
   - Ensure that the `cleanup()` function is properly handling the termination of the monitoring process and removing the PID file.
   - Check for any external processes or signals that may be interfering with the monitoring process.

By addressing these common issues and reviewing the log files, you can troubleshoot and maintain the reliable operation of the `start-mcp-servers-with-monitoring.sh` script within the rEngine Core platform.
