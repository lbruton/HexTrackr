# rEngine Core: configure-apis.js Documentation

## Purpose & Overview

The `configure-apis.js` file is a crucial component of the rEngine Core platform, responsible for the secure setup and management of API keys for various Large Language Model (LLM) providers. This script serves as an interactive wizard, guiding users through the configuration process and ensuring seamless integration of LLM capabilities within the rEngine ecosystem.

The primary functions of this file include:

1. **API Configuration**: Allows users to easily configure API keys for supported LLM providers, such as Google Gemini, Anthropic Claude, OpenAI GPT, and Groq.
2. **Configuration Status**: Provides a comprehensive overview of the current API configuration status, including which providers are set up and which are not.
3. **API Key Testing**: Validates the provided API keys to ensure they are working correctly and can be used for LLM integrations.
4. **Environment Management**: Saves the configured API keys and other settings in a `.env` file, ensuring consistent and secure access to the necessary credentials.

By streamlining the API configuration process, `configure-apis.js` plays a crucial role in enabling the seamless integration of advanced LLM capabilities within the rEngine Core platform, empowering developers to leverage these powerful tools for their projects.

## Key Functions/Classes

The `configure-apis.js` file contains the following key functions:

1. **`createReadline()`**: Creates a readline interface for user input.
2. **`promptHidden()`**: Prompts the user for input with hidden characters, such as API keys or passwords.
3. **`prompt()`**: Prompts the user for visible input.
4. **`validateApiKey()`**: Validates the format of the provided API key for a specific LLM provider.
5. **`loadEnvFile()`**: Loads the existing `.env` file and returns the environment variables.
6. **`saveEnvFile()`**: Saves the API keys and other configuration settings to the `.env` file.
7. **`testApiKey()`**: Tests the provided API key with a simple LLM call to ensure it's working correctly.
8. **`showStatus()`**: Displays the current configuration status for all supported LLM providers.
9. **`configureProvider()`**: Guides the user through the configuration process for a specific LLM provider.
10. **`checkHasApiKey()`**: Checks if the user has an API key and provides guidance on how to obtain one.
11. **`runWizard()`**: Executes the interactive configuration wizard, walking the user through the setup of all LLM providers.
12. **`testAllProviders()`**: Tests the configured API keys for all LLM providers.
13. **`parseArgs()`**: Parses the command-line arguments and sets the appropriate options.
14. **`showHelp()`**: Displays the help message for the `configure-apis.js` script.
15. **`main()`**: The main execution function that handles the different command-line options.

## Dependencies

The `configure-apis.js` file depends on the following modules and libraries:

1. **Node.js built-in modules**:
   - `fs/promises`: For file system operations.
   - `path`: For working with file paths.
   - `url`: For converting file URLs to paths.
   - `readline`: For creating the interactive command-line interface.
   - `crypto`: For generating random values.

1. **Custom module**:
   - `./call-llm.js`: Provides the `callLLM` function for making LLM API calls.

The script also utilizes various environment variables for storing the API keys and other configuration settings.

## Usage Examples

The `configure-apis.js` script can be used in the following ways:

1. **Interactive Wizard**:

   ```bash
   node configure-apis.js
   ```

   This will launch the interactive configuration wizard, guiding the user through the process of setting up API keys for all supported LLM providers.

1. **Check Configuration Status**:

   ```bash
   node configure-apis.js --status
   ```

   This will display the current configuration status for all LLM providers, indicating which ones are set up and which are not.

1. **Test All Configured Providers**:

   ```bash
   node configure-apis.js --test
   ```

   This will test the configured API keys for all LLM providers and report the results.

1. **Configure a Specific Provider**:

   ```bash
   node configure-apis.js --provider gemini
   ```

   This will guide the user through the configuration process for the specified LLM provider (in this case, Google Gemini).

1. **Get Help**:

   ```bash
   node configure-apis.js --help
   ```

   This will display the help message, which includes information about the available options and usage examples.

## Configuration

The `configure-apis.js` script relies on the following configuration settings:

1. **Environment Variables**:
   - The API keys for each supported LLM provider are stored in environment variables, which are saved in the `.env` file. The environment variable names are defined in the `LLM_PROVIDERS` object.
   - Additional configuration settings, such as the `OLLAMA_BASE_URL` and `MAX_VRAM_GB`, are also stored in the `.env` file.

1. **LLM Provider Configuration**:
   - The `LLM_PROVIDERS` object contains the configuration details for each supported LLM provider, including the provider name, environment variable name, API key prefix, available models, default model, sign-up URL, and a brief description.

## Integration Points

The `configure-apis.js` script is a critical component of the rEngine Core platform, as it enables the seamless integration of LLM capabilities across various rEngine Core components. Here are some of the key integration points:

1. **call-llm.js**: The `configure-apis.js` script relies on the `callLLM` function from the `call-llm.js` module to test the configured API keys.
2. **rEngine API**: The configured API keys are used by the rEngine API to make calls to the various LLM providers, allowing rEngine-based applications to leverage the power of these advanced language models.
3. **rEngine CLI**: The `configure-apis.js` script is accessible through the rEngine CLI, allowing developers to easily manage their LLM API configurations.
4. **rEngine Documentation**: The configuration process and available LLM providers are documented in the rEngine Core documentation, ensuring that developers have a clear understanding of how to set up and utilize the LLM capabilities within the rEngine ecosystem.

## Troubleshooting

Here are some common issues and solutions related to the `configure-apis.js` script:

1. **Invalid API Key Format**:
   - If the provided API key does not match the expected format (e.g., doesn't start with the correct prefix), the script will display an error message and prompt the user to re-enter the key.
   - Ensure that the API key is copied correctly and matches the requirements for the specific LLM provider.

1. **API Key Test Failure**:
   - If the API key test fails, the script will display an error message and advise the user to check the key and try again.
   - Verify that the API key is valid and has the necessary permissions to make LLM calls.
   - Check the rEngine Core documentation or reach out to the support team if the issue persists.

1. **Missing Environment Variables**:
   - If the required environment variables (e.g., `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`) are not set, the script will not be able to save the configuration correctly.
   - Ensure that the environment variables are set correctly in the `.env` file or in the system's environment.

1. **Unexpected Errors**:
   - If the script encounters any unexpected errors, it will display an error message and exit.
   - Check the error message for any relevant information and consult the rEngine Core documentation or reach out to the support team if you need further assistance.

By following the guidance provided in this documentation and the error messages displayed by the `configure-apis.js` script, developers should be able to successfully configure the LLM API keys and integrate the rEngine Core platform with the desired LLM providers.
