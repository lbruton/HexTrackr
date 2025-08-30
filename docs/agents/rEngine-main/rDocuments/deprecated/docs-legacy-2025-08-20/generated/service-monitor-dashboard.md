# `service-monitor-dashboard.sh` - StackTrackr Service Monitoring Dashboard

## Purpose & Overview

The `service-monitor-dashboard.sh` script is a real-time monitoring tool for the StackTrackr platform, which is part of the rEngine Core ecosystem. This script provides a comprehensive dashboard that displays the status of all essential StackTrackr services, including the Smart Scribe, MCP Memory Server, and Split Scribe Console. The dashboard allows developers and operations teams to quickly identify the running status of these critical services and troubleshoot any issues that may arise.

## Key Functions/Classes

The script consists of the following main functions:

1. `check_service(service_name, process_pattern)`: This function checks the status of a specific service by searching for a matching process pattern using the `pgrep` command. It then displays the service status (running or stopped) and the process ID (PID) if the service is running.

1. `show_process_details()`: This function displays detailed information about the running processes related to the StackTrackr services, including the `mcp`, `smart-scribe`, and `docker` processes.

1. `show_docker_status()`: This function checks the status of the Docker engine and displays the running Docker containers, their status, and the exposed ports.

The script also includes a main monitoring loop that continuously refreshes the dashboard every 10 seconds, providing real-time updates on the status of the StackTrackr services.

## Dependencies

The `service-monitor-dashboard.sh` script has the following dependencies:

- Bash shell
- `pgrep` command (part of the `procps-ng` package)
- `docker` command (if Docker is installed and running)

## Usage Examples

To use the `service-monitor-dashboard.sh` script, follow these steps:

1. Save the script to a file, e.g., `service-monitor-dashboard.sh`.
2. Make the script executable with the command `chmod +x service-monitor-dashboard.sh`.
3. Run the script using the command `./service-monitor-dashboard.sh`.

The script will then display the StackTrackr Service Dashboard, which will continuously refresh every 10 seconds, showing the status of the core services, Docker containers, and process details.

To exit the script, press `Ctrl+C`.

## Configuration

The `service-monitor-dashboard.sh` script does not require any specific configuration. However, it relies on the following environment:

- The `pgrep` command must be available in the system's `PATH`.
- If Docker is used, the `docker` command must be available in the system's `PATH`.

## Integration Points

The `service-monitor-dashboard.sh` script is primarily designed to monitor the core StackTrackr services within the rEngine Core ecosystem. It can be used in conjunction with other rEngine Core components, such as the StackTrackr application itself, to provide a comprehensive view of the platform's health and performance.

## Troubleshooting

If you encounter any issues while using the `service-monitor-dashboard.sh` script, here are some common problems and their potential solutions:

### The script doesn't display any service status information

1. **Check the service process patterns**: Ensure that the process patterns used in the `check_service()` function match the actual process names running on the system.
2. **Verify the `pgrep` command**: Make sure the `pgrep` command is available and functioning correctly on your system.

### Docker status is not displayed correctly

1. **Verify Docker installation**: Ensure that Docker is installed and running on the system.
2. **Check the `docker` command**: Ensure that the `docker` command is available and accessible in the system's `PATH`.

### The script doesn't refresh the dashboard automatically

1. **Check the sleep duration**: Ensure that the sleep duration in the main monitoring loop (10 seconds) is appropriate for your use case.
2. **Verify the `clear` command**: Make sure the `clear` command is working correctly to refresh the terminal display.

If you continue to experience issues, you may need to adjust the script or investigate the underlying system dependencies and configurations.
