# rEngine Core - `setup-openwebui-apis.sh` Documentation

## Purpose & Overview

The `setup-openwebui-apis.sh` script is a Bash script used within the rEngine Core ecosystem to set up and configure the OpenWebUI Docker container with the necessary API keys for various AI models and services. This script is a crucial component in the process of integrating and utilizing the OpenWebUI platform, which serves as an "Intelligent Development Wrapper" for the rEngine Core platform.

The main purpose of this script is to:

1. Stop the current running OpenWebUI container.
2. Start a new OpenWebUI container with the required API keys for the supported AI models and services.
3. Provide information about the available AI models and their details.

By running this script, developers and users can ensure that the OpenWebUI component within the rEngine Core platform is properly configured and ready to interact with the various AI services and models.

## Key Functions/Classes

The `setup-openwebui-apis.sh` script contains the following key functions:

1. **Stopping the Current OpenWebUI Container**: The script first stops the currently running OpenWebUI container using the `docker stop` command.
2. **Starting the OpenWebUI Container with API Keys**: The script then starts a new OpenWebUI container with the necessary API keys for the supported AI models and services. These API keys are passed as environment variables to the Docker container using the `docker run` command.
3. **Providing Information about Available AI Models**: At the end of the script, it prints out information about the available AI models, including their names and details, to help users understand the capabilities of the OpenWebUI platform.

## Dependencies

The `setup-openwebui-apis.sh` script has the following dependencies:

1. **Docker**: The script relies on the Docker engine to manage the lifecycle of the OpenWebUI container.
2. **API Keys**: The script requires the following API keys to be provided:
   - OpenAI API Key
   - Anthropic API Key
   - Google API Key
   - Gemini API Key
   - Groq API Key
   - Ollama Base URL

These API keys are used to authenticate and authorize the OpenWebUI platform to access the various AI services and models.

## Usage Examples

To use the `setup-openwebui-apis.sh` script, follow these steps:

1. Ensure that Docker is installed and running on your system.
2. Save the script content to a file, e.g., `setup-openwebui-apis.sh`.
3. Make the script executable: `chmod +x setup-openwebui-apis.sh`.
4. Run the script: `./setup-openwebui-apis.sh`.

The script will stop the current OpenWebUI container, start a new container with the provided API keys, and display information about the available AI models.

## Configuration

The `setup-openwebui-apis.sh` script requires the following environment variables to be set:

| Environment Variable | Description |
| --- | --- |
| `OPENAI_API_KEY` | The API key for the OpenAI service. |
| `OPENAI_API_BASE_URL` | The base URL for the OpenAI API. |
| `ANTHROPIC_API_KEY` | The API key for the Anthropic service. |
| `GOOGLE_API_KEY` | The API key for the Google service. |
| `GEMINI_API_KEY` | The API key for the Gemini service. |
| `GROQ_API_KEY` | The API key for the Groq service. |
| `OLLAMA_BASE_URL` | The base URL for the Ollama service. |

These environment variables need to be set before running the script or passed as command-line arguments when starting the script.

## Integration Points

The `setup-openwebui-apis.sh` script is a crucial part of the rEngine Core platform, as it sets up the necessary API integrations for the OpenWebUI component. The OpenWebUI platform serves as an "Intelligent Development Wrapper" for the rEngine Core platform, providing a user-friendly interface and access to various AI models and services.

By running this script, the OpenWebUI component is properly configured and ready to interact with the following rEngine Core components:

1. **AI Models**: The script configures the OpenWebUI container to access various AI models, including those from OpenAI, Anthropic, Gemini, and Groq.
2. **AI Services**: The script integrates the OpenWebUI platform with different AI services, such as the Ollama service, to provide access to the supported AI models.

## Troubleshooting

Here are some common issues and solutions related to the `setup-openwebui-apis.sh` script:

1. **Docker Container Fails to Start**: If the new OpenWebUI container fails to start, check the following:
   - Ensure that the Docker engine is running and accessible.
   - Verify that the provided API keys are correct and have the necessary permissions.
   - Check the Docker logs for any error messages or clues about the failure.

1. **API Keys Not Working**: If the API keys provided in the script are not working, ensure that:
   - The API keys are valid and have the correct format.
   - The API keys have the necessary permissions to access the corresponding services.
   - The API base URLs are correct and accessible.

1. **Missing Dependencies**: If the script fails due to missing dependencies, ensure that you have the following installed:
   - Docker
   - Bash (or a compatible shell)

If you encounter any other issues or have questions about the `setup-openwebui-apis.sh` script, please consult the rEngine Core documentation or reach out to the rEngine Core support team for assistance.
