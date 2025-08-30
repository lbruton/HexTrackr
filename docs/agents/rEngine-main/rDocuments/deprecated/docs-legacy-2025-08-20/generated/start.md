# StackTrackr Serverless: Quick Start Script

## Purpose & Overview

The `start.sh` script is a utility script that sets up and starts the local Docker development environment for the StackTrackr Serverless project, which is part of the rEngine Core ecosystem. This script is responsible for the following tasks:

1. Verifying that Docker is running on the system.
2. Creating a `.env` file from a template, prompting the user to add the required API keys.
3. Building the Docker containers for the StackTrackr Serverless stack.
4. Starting the StackTrackr Serverless stack using Docker Compose.
5. Verifying the health of the API and web services.
6. Waiting for the first price data to be fetched and stored in the database.
7. Providing instructions for the next steps in the development process.

## Key Functions/Classes

This script does not contain any specific functions or classes. It is a Bash shell script that orchestrates the setup and startup of the StackTrackr Serverless Docker-based development environment.

## Dependencies

The `start.sh` script relies on the following dependencies:

1. **Docker**: The script requires Docker to be installed and running on the system. It checks if Docker is running before proceeding with the setup.
2. **Docker Compose**: The script uses Docker Compose to build and start the StackTrackr Serverless stack.
3. **StackTrackr Serverless project files**: The script assumes that the StackTrackr Serverless project files, including the `docker-compose.yml` and `.env.example` files, are present in the same directory as the `start.sh` script.

## Usage Examples

To use the `start.sh` script, follow these steps:

1. Ensure that Docker is installed and running on your system.
2. Navigate to the directory containing the `start.sh` script and the StackTrackr Serverless project files.
3. Run the script:

   ```bash
   ./start.sh
   ```

1. Follow the instructions provided by the script:
   - If the `.env` file is not found, the script will create one from the `.env.example` template and prompt you to add the required API keys.
   - The script will build the Docker containers and start the StackTrackr Serverless stack.
   - After the services are started, the script will test the health of the API and web services.
   - The script will wait for the first price data to be fetched and stored in the database.
   - Finally, the script will provide instructions for the next steps, including how to access the web application, API, and monitoring options.

## Configuration

The `start.sh` script relies on a `.env` file for configuration. The `.env` file should contain the following environment variables:

- `METALS_DEV_API_KEY`: The API key required to access the Metals.dev service.

The script will create a `.env` file from the `.env.example` template if it is not found, and prompt the user to add the required API key.

## Integration Points

The `start.sh` script is part of the StackTrackr Serverless project, which is a component within the rEngine Core ecosystem. The StackTrackr Serverless project is responsible for fetching and storing price data, as well as providing a web application and API for accessing this data.

The script integrates with the following rEngine Core components:

1. **Docker**: The script uses Docker and Docker Compose to build and run the StackTrackr Serverless stack.
2. **StackTrackr Serverless project**: The script assumes the presence of the StackTrackr Serverless project files, including the `docker-compose.yml` and `.env.example` files.
3. **Metals.dev API**: The script requires a valid API key to access the Metals.dev service, which is used to fetch the price data.

## Troubleshooting

Here are some common issues and solutions related to the `start.sh` script:

1. **Docker is not running**:
   - Ensure that Docker Desktop is installed and running on your system.
   - If Docker is not running, the script will exit with an error message.

1. **API key not set in .env file**:
   - If the `METALS_DEV_API_KEY` is not set or is set to the default value of `your_metals_dev_api_key_here`, the script will exit with an error message.
   - Update the `.env` file with the correct API key and run the script again.

1. **Services not responding**:
   - If the API or web service is not responding, check the Docker logs for any errors or issues:

     ```bash
     docker-compose logs -f
     ```

   - Ensure that the Docker containers are running correctly and that there are no issues with the StackTrackr Serverless project code.

1. **Price data not being fetched**:
   - If the script reports that price data is still being fetched, check the logs for the `price-fetcher` service:

     ```bash
     docker-compose logs -f price-fetcher
     ```

   - Ensure that the Metals.dev API key is correct and that the price fetching process is working as expected.

If you encounter any other issues, refer to the rEngine Core documentation or contact the StackTrackr Serverless project maintainers for further assistance.
