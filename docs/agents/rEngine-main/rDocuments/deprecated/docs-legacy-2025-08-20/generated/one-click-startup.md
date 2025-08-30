# One-Click Startup Script for StackTrackr

## Purpose & Overview

The `one-click-startup.sh` script is a convenience tool that simplifies the process of launching the entire StackTrackr development environment in the rEngine Core ecosystem. This script automates the process of starting the Docker environment and the Split Scribe console, which are essential components for the StackTrackr application.

By running this script, developers can quickly set up the necessary infrastructure and begin working on the StackTrackr project without having to manually launch each component individually.

## Key Functions/Classes

The `one-click-startup.sh` script performs the following key functions:

1. **Launch Docker Environment**: The script calls the `start-environment.sh` script to launch the Docker environment, which provides the necessary containerized services for the StackTrackr application.

1. **Launch Split Scribe Console**: The script calls the `auto-launch-split-scribe.sh` script to launch the Split Scribe console, which provides a verbose log of the application's activities.

## Dependencies

The `one-click-startup.sh` script depends on the following files and components:

- `start-environment.sh`: A script that launches the Docker environment for the StackTrackr application.
- `auto-launch-split-scribe.sh`: A script that launches the Split Scribe console.
- Docker: The containerization platform used to run the StackTrackr application's services.

## Usage Examples

To use the `one-click-startup.sh` script, follow these steps:

1. Navigate to the project directory containing the `one-click-startup.sh` script.
2. Open a terminal and run the following command:

   ```bash
   ./one-click-startup.sh
   ```

1. The script will display the progress of launching the Docker environment and the Split Scribe console.
2. Once the script has finished, you should see multiple terminal windows open, each running a different component of the StackTrackr development environment.

## Configuration

The `one-click-startup.sh` script does not require any additional configuration. It uses the absolute path to the project directory, which is determined dynamically using the `SCRIPT_DIR` variable.

## Integration Points

The `one-click-startup.sh` script is part of the rEngine Core ecosystem and is designed to integrate with the following components:

- Docker: The containerization platform used to run the StackTrackr application's services.
- Split Scribe: The verbose logging console that provides detailed information about the application's activities.

## Troubleshooting

If you encounter any issues while running the `one-click-startup.sh` script, here are some common troubleshooting steps:

1. **Ensure Docker is running**: Verify that the Docker daemon is running on your system. If Docker is not running, the `start-environment.sh` script will fail.
2. **Check script permissions**: Ensure that the `one-click-startup.sh`, `start-environment.sh`, and `auto-launch-split-scribe.sh` scripts have the necessary permissions to execute. You can do this by running `chmod +x <script_name>`.
3. **Inspect log output**: Check the terminal windows that were opened by the script for any error messages or unexpected behavior.
4. **Verify script paths**: Ensure that the paths used in the script to locate the `start-environment.sh` and `auto-launch-split-scribe.sh` scripts are correct.

If you continue to encounter issues, please reach out to the rEngine Core support team for further assistance.
