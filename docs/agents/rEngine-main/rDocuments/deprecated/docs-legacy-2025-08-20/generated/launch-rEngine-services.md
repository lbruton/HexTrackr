# `launch-rEngine-services.sh` - Comprehensive Documentation

## Purpose & Overview

The `launch-rEngine-services.sh` script is a one-click startup script for the StackTrackr development environment within the rEngine Core platform. It is responsible for launching all necessary components of the StackTrackr system in separate terminal windows, ensuring a seamless and automated development experience.

This script serves as the entry point for developers working on the StackTrackr project, providing a simple and efficient way to get the entire development environment up and running with minimal effort.

## Key Functions/Classes

The main functions performed by this script are:

1. **Obtaining the Project Directory**: The script determines the absolute path to the project directory by navigating to the directory of the script itself and then moving up one level.

1. **Launching the Docker Environment**: The script calls the `start-environment.sh` script, which is responsible for launching the Docker-based development environment. This includes starting the necessary Docker containers and services.

1. **Providing Protocol Reminders**: The script displays a protocol reminder, highlighting the importance of checking the `/rProtocols/` folder for operational procedures, as well as the use of GitHub Copilot as the "HEAD ORCHESTRATOR" for rEngine and the availability of MCP tools.

## Dependencies

The `launch-rEngine-services.sh` script depends on the following components:

1. **Docker**: The script assumes that the Docker environment is properly installed and configured on the host system.
2. **start-environment.sh**: This script is called by `launch-rEngine-services.sh` to handle the actual launching of the Docker-based development environment.
3. `/rProtocols/`: The script reminds the user to check this folder for operational procedures related to the StackTrackr project.
4. **GitHub Copilot**: The script acknowledges the use of GitHub Copilot as the "HEAD ORCHESTRATOR" for the rEngine Core platform.
5. **MCP Tools**: The script mentions the availability of MCP (Mission Control Panel) tools, which can be used during the development process.

## Usage Examples

To use the `launch-rEngine-services.sh` script, follow these steps:

1. Navigate to the root directory of the rEngine Core project.
2. Execute the script using the following command:

   ```bash
   ./bin/launch-rEngine-services.sh
   ```

   This will start the entire StackTrackr development environment, launching all necessary components in separate terminal windows.

## Configuration

The `launch-rEngine-services.sh` script does not require any specific configuration. It relies on the environment variables and configurations set up for the Docker-based development environment.

## Integration Points

The `launch-rEngine-services.sh` script is a key integration point within the rEngine Core platform. It serves as the entry point for developers working on the StackTrackr project, providing a seamless way to bootstrap the entire development environment.

The script is closely integrated with the following rEngine Core components:

1. **Docker Environment**: The script is responsible for launching the Docker-based development environment, which is a crucial part of the rEngine Core platform.
2. **StackTrackr Project**: The script is specifically designed for the StackTrackr project, and it assumes the presence of the necessary project files and directories.
3. **rProtocols**: The script reminds the user to refer to the `/rProtocols/` folder for operational procedures related to the StackTrackr project.
4. **GitHub Copilot**: The script acknowledges the use of GitHub Copilot as the "HEAD ORCHESTRATOR" for the rEngine Core platform.
5. **MCP Tools**: The script mentions the availability of MCP tools, which can be used during the development process.

## Troubleshooting

Here are some common issues and solutions related to the `launch-rEngine-services.sh` script:

### Issue 1: Docker environment fails to launch

**Possible Causes**:

- Docker is not installed or not properly configured on the host system.
- The `start-environment.sh` script is not functioning correctly.

**Solution**:

1. Ensure that Docker is installed and running on the host system.
2. Check the `start-environment.sh` script for any issues or errors.
3. Refer to the rEngine Core documentation for guidance on setting up the Docker environment.

### Issue 2: Terminal windows do not open as expected

**Possible Causes**:

- The script is not being executed with the correct permissions.
- There are issues with the terminal application or window management on the host system.

**Solution**:

1. Verify that the script has the necessary execute permissions (`chmod +x bin/launch-rEngine-services.sh`).
2. Check the terminal application settings and configurations on the host system.
3. Ensure that the host system has the required terminal emulator or window manager installed and configured correctly.

### Issue 3: Missing or outdated rProtocols or MCP tools

**Possible Causes**:

- The `/rProtocols/` folder or MCP tools are not up-to-date or are missing.
- The script is referencing outdated or incorrect locations for these resources.

**Solution**:

1. Ensure that the `/rProtocols/` folder and MCP tools are present and up-to-date in the rEngine Core project.
2. Check the script for any hardcoded references to the `/rProtocols/` folder or MCP tools, and update them if necessary.
3. Refer to the rEngine Core documentation for the latest information on the location and availability of these resources.

Remember to always consult the rEngine Core documentation and the project's issue tracking system for the most up-to-date troubleshooting information and guidance.
