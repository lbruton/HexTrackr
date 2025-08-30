# `start-environment.sh` - Launching the rEngine Core Development Environment

## Purpose & Overview

The `start-environment.sh` script is a vital component in the rEngine Core ecosystem, as it is responsible for launching the Docker-based development environment. This script ensures that the development environment is set up and running correctly, providing a consistent and reliable environment for developers to work within.

## Key Functions/Classes

The script performs the following key functions:

1. **Determining the Project Directory**: The script first determines the absolute path to the project directory by navigating to the directory containing the script itself and then moving up one level.
2. **Launching the Docker Environment**: The script uses the `osascript` command to open a new Terminal window and execute the `docker-dev.sh` script with the `start` command. This ensures that the development environment is launched in a separate Terminal window, preventing VS Code from capturing any script prompts and ensuring the correct execution context.

## Dependencies

The `start-environment.sh` script depends on the following components:

1. **Docker**: The script assumes that Docker is installed and configured on the development machine, as it relies on the `docker-dev.sh` script to manage the Docker-based development environment.
2. **Terminal Application**: The script uses the `osascript` command to interact with the Terminal application, which must be installed and accessible on the system.

## Usage Examples

To use the `start-environment.sh` script, follow these steps:

1. Navigate to the rEngine Core project directory in the Terminal.
2. Execute the script using the following command:

   ```bash
   ./bin/start-environment.sh
   ```

   This will launch the Docker-based development environment in a new Terminal window.

## Configuration

The `start-environment.sh` script does not require any specific configuration or environment variables. It assumes that the Docker-based development environment is set up and ready to be launched.

## Integration Points

The `start-environment.sh` script is a critical component in the rEngine Core development workflow. It integrates with the following components:

1. **Docker-based Development Environment**: The script launches the Docker-based development environment, which provides a consistent and isolated environment for developers to work in.
2. **VS Code**: While the script is designed to prevent VS Code from capturing script prompts, it can be integrated with VS Code's terminal functionality to provide a seamless development experience.

## Troubleshooting

If you encounter any issues while using the `start-environment.sh` script, here are some common problems and their solutions:

1. **Docker not installed or configured correctly**: Ensure that Docker is installed and properly configured on your development machine. If you're unsure, refer to the rEngine Core documentation for instructions on setting up the development environment.
2. **Terminal application not found**: Verify that the Terminal application is installed and accessible on your system. If you're using a different terminal emulator, you may need to modify the `osascript` command accordingly.
3. **Script prompts not being captured**: If you're still experiencing issues with script prompts being captured by VS Code, try running the script directly in the Terminal instead of from within VS Code.

If you continue to encounter issues, please refer to the rEngine Core documentation or reach out to the support team for further assistance.
