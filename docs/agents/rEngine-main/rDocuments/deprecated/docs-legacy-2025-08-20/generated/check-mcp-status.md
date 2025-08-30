# rEngine Core: check-mcp-status.sh

## Purpose & Overview

The `check-mcp-status.sh` script is a utility provided as part of the rEngine Core platform. It is designed to quickly check the status of the rEngine MCP (Microservices Control Plane) servers without the need to start the full rEngine services.

This script serves as a convenient way to monitor the health and status of the core rEngine MCP components, including the rEngineMCP Server and the Memory MCP Server. It also checks the status of the Health Monitor process, which is responsible for continuously monitoring the rEngine infrastructure.

By running this script, rEngine Core users and administrators can quickly assess the current state of the rEngine MCP, identify any issues or problems, and take appropriate actions if necessary.

## Key Functions/Classes

The `check-mcp-status.sh` script contains the following key functions:

1. **`is_running()`**: This function checks if a specific process, identified by a pattern, is currently running.

1. **`get_process_info()`**: This function retrieves detailed information about a running process, including the process ID (PID), CPU usage, memory usage, and start time.

The script also utilizes various color-coded output to provide a clear and easily readable status report.

## Dependencies

The `check-mcp-status.sh` script depends on the following components and tools:

- Bash shell
- `pgrep` command (for finding running processes)
- `ps` command (for retrieving process information)

It also relies on the following rEngine Core-specific configuration:

- `RENGINE_DIR`: The directory where the rEngine Core files are located.
- `HEALTH_LOG`: The path to the rEngine Health Monitor log file.
- `PID_FILE`: The path to the rEngine MCP Monitor PID file.

## Usage Examples

To use the `check-mcp-status.sh` script, follow these steps:

1. Navigate to the rEngine Core directory:

   ```bash
   cd /Volumes/DATA/GitHub/rEngine/rEngine
   ```

1. Run the script:

   ```bash
   ./check-mcp-status.sh
   ```

The script will output the current status of the rEngine MCP servers, the Health Monitor, and the recent entries in the Health Log.

## Configuration

The `check-mcp-status.sh` script uses the following configuration parameters:

| Parameter | Description |
| --- | --- |
| `RENGINE_DIR` | The directory where the rEngine Core files are located. |
| `HEALTH_LOG` | The path to the rEngine Health Monitor log file. |
| `PID_FILE` | The path to the rEngine MCP Monitor PID file. |

These parameters are defined at the beginning of the script and should be updated to match the actual deployment environment.

## Integration Points

The `check-mcp-status.sh` script is designed to be a standalone utility within the rEngine Core platform. It can be used independently to monitor the status of the rEngine MCP servers and the Health Monitor.

This script is typically called as part of the rEngine Core management and monitoring workflows, such as the `start-mcp-servers-with-monitoring.sh` and `start-mcp-servers.sh` scripts, which provide options to start the rEngine MCP servers with or without monitoring.

## Troubleshooting

If you encounter any issues while using the `check-mcp-status.sh` script, here are some common troubleshooting steps:

1. **Verify the rEngine Core directory**: Ensure that the `RENGINE_DIR` variable is set correctly and points to the actual location of the rEngine Core files.

1. **Check file permissions**: Ensure that the script file (`check-mcp-status.sh`) has the appropriate permissions to be executed.

1. **Validate dependencies**: Ensure that the required commands (`pgrep` and `ps`) are available and functioning correctly on the system.

1. **Inspect the Health Log**: If the Health Log is not found or contains no recent entries, check for any issues with the rEngine Health Monitor or the log file location.

1. **Verify PID file**: If the Health Monitor PID file is not found or the process is not running, check for any issues with the Health Monitor process.

If you continue to experience issues, please consult the rEngine Core documentation or reach out to the rEngine support team for further assistance.
