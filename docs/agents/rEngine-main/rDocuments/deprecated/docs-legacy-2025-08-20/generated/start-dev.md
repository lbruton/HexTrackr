# rEngine Core: `start-dev.sh` - Serverless Plugin Development Environment

## Purpose & Overview

The `start-dev.sh` script is a part of the `rLegacy/lab/serverless-plugin` component within the rEngine Core ecosystem. Its primary purpose is to set up a development environment for the StackTrackr Serverless Plugin, which is built on top of the rEngine Core platform.

This script automates the process of building and starting a Docker-based development container, ensuring consistent and reliable development conditions across different host systems. By using a containerized environment, the script helps to avoid permission issues and other environment-specific problems that may arise during the development process.

## Key Functions/Classes

The `start-dev.sh` script performs the following key functions:

1. **Docker Setup**: Checks if Docker is running and, if not, prompts the user to start Docker Desktop.
2. **Container Build**: Builds a Docker container for the development environment, using the `docker-compose.dev.yml` file. The script sets the correct user and group IDs to ensure proper file permissions inside the container.
3. **Service Start**: Starts the development environment services (PostgreSQL and Redis) using the Docker Compose configuration.
4. **Service Readiness Check**: Verifies that the PostgreSQL and Redis services are ready and available for use.
5. **Usage Instructions**: Provides a list of available commands and instructions for working with the development environment.

## Dependencies

The `start-dev.sh` script relies on the following dependencies:

- Docker and Docker Compose
- PostgreSQL and Redis services, as defined in the `docker-compose.dev.yml` file

## Usage Examples

To use the `start-dev.sh` script, follow these steps:

1. Ensure that Docker Desktop is running on your host system.
2. Navigate to the `rLegacy/lab/serverless-plugin` directory in your rEngine Core project.
3. Run the `start-dev.sh` script:

   ```bash
   ./start-dev.sh
   ```

1. The script will set up the development container and start the necessary services.
2. Once the services are ready, you can enter the container and start the API and web servers:

   ```bash
   docker-compose -f docker-compose.dev.yml exec stacktrackr-dev bash
   start-api
   start-web
   ```

1. To stop the development environment, run:

   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## Configuration

The `start-dev.sh` script uses the following environment variables:

| Variable | Description |
| --- | --- |
| `USER_ID` | The ID of the current user, used to set the correct permissions inside the development container. |
| `GROUP_ID` | The ID of the current user's primary group, used to set the correct permissions inside the development container. |

These variables are automatically retrieved and used during the container build process.

## Integration Points

The `start-dev.sh` script is part of the `rLegacy/lab/serverless-plugin` component within the rEngine Core ecosystem. It is specifically designed to facilitate the development of the StackTrackr Serverless Plugin, which is built on top of the rEngine Core platform.

The development container created by this script provides a standardized and isolated environment for developers to work on the StackTrackr Serverless Plugin, ensuring consistency across different host systems.

## Troubleshooting

Here are some common issues and solutions related to the `start-dev.sh` script:

1. **Docker is not running**: If the script reports that Docker is not running, ensure that Docker Desktop is installed and running on your host system.

1. **Permission issues inside the container**: If you encounter any permission-related issues while working inside the development container, ensure that the `USER_ID` and `GROUP_ID` variables are correctly set in the script.

1. **Services not ready**: If the script reports that the PostgreSQL or Redis services are not ready, wait a few moments and try again. If the issue persists, check the logs of the Docker containers to investigate the problem.

1. **Unable to start the API or web server**: Ensure that you are running the `start-api` and `start-web` commands from within the development container. These commands are specific to the container environment and may not work outside of it.

Remember to consult the rEngine Core documentation and the development team for further assistance with any issues or integration-related questions.
