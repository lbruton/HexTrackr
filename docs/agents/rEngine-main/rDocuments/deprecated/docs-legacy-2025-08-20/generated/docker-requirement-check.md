# rEngine Core: Docker Requirement Check

## Purpose & Overview

The `docker-requirement-check.sh` script is a critical part of the rEngine Core platform's startup sequence. Its primary purpose is to ensure that the necessary Docker installation and configuration requirements are met before launching the rEngine development environment.

This script performs the following key checks:

1. Verifies the presence of the `docker` command, indicating a proper Docker installation.
2. Ensures the Docker daemon is running and accessible.
3. Checks the installed Docker and Docker Compose versions.
4. Evaluates the available system resources, such as CPU cores and RAM, to provide performance recommendations.
5. Validates the available disk space for rEngine Platform operations.

By running this script, the rEngine Core platform can guarantee a reliable and consistent development environment, eliminating potential issues caused by missing or misconfigured Docker components.

## Key Functions/Classes

The script defines the following main functions:

1. `print_header()`: Displays a formatted header for the rEngine Platform Docker check.
2. `print_success()`, `print_warning()`, `print_error()`, `print_info()`: Utility functions to print output with color-coded status indicators.
3. `check_docker_installation()`: The main function that performs the Docker requirement checks and provides detailed feedback.

## Dependencies

The `docker-requirement-check.sh` script relies on the following external components:

- **Docker**: The Docker runtime is a fundamental requirement for the rEngine Platform. This script ensures Docker is properly installed and configured.
- **Docker Compose**: Docker Compose is used to manage the multi-service architecture of the rEngine Platform. The script verifies the availability of Docker Compose.
- **System commands**: The script utilizes various system commands, such as `sysctl`, `df`, and `cut`, to gather information about the system's resources and Docker installation.

## Usage Examples

To use the `docker-requirement-check.sh` script, follow these steps:

1. Ensure the script has execute permissions:

   ```bash
   chmod +x scripts/docker-requirement-check.sh
   ```

1. Run the script from the rEngine Core project root directory:

   ```bash
   ./scripts/docker-requirement-check.sh
   ```

The script will perform the necessary checks and provide detailed feedback about the Docker installation and system resources. If any issues are detected, the script will offer relevant instructions and recommendations to resolve them.

## Configuration

The `docker-requirement-check.sh` script does not require any external configuration files or environment variables. It uses built-in variables and system commands to gather the necessary information.

## Integration Points

The `docker-requirement-check.sh` script is an integral part of the rEngine Core platform's startup sequence. It is typically executed before launching the rEngine development environment using the `docker-dev.sh` script.

The script's output and exit status are used to determine if the rEngine Platform can proceed with the container deployment or if the user needs to address any Docker-related issues first.

## Troubleshooting

Here are some common issues that may arise and their potential solutions:

1. **Docker not installed**:
   - Provide the user with instructions to install Docker Desktop on their system.
   - Suggest installation options via Homebrew, MacPorts, or the official Docker website.

1. **Docker Desktop not running**:
   - Instruct the user to launch the Docker Desktop application and ensure it is fully started.
   - Advise the user to check the status of the Docker Desktop application in the system tray or menu bar.

1. **Docker Compose not found**:
   - Inform the user that Docker Compose is required for the rEngine Platform.
   - Recommend upgrading Docker Desktop to the latest version, which includes Docker Compose.

1. **Insufficient system resources**:
   - Provide recommendations for the minimum required RAM and CPU cores for optimal rEngine Platform performance.
   - Advise the user to consider upgrading their system hardware if the resources are found to be inadequate.

1. **Low disk space**:
   - Warn the user about the recommended minimum free disk space for the rEngine Platform.
   - Suggest freeing up disk space by removing unused files or applications.

By addressing these common issues, users can ensure a smooth setup and deployment of the rEngine Core platform on their development systems.
