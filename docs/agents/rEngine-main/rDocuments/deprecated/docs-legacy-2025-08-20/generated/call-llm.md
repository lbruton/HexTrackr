# rEngine Core: `call-llm.js` - Universal LLM API Caller

## Purpose & Overview

The `call-llm.js` script is a part of the rEngine Core ecosystem, serving as a universal interface to interact with various Large Language Model (LLM) providers from the command line or through the rEngine Core's MCP (Micro-Service Communication Protocol).

This script allows developers to easily access and utilize different LLM providers, such as Google Gemini, Anthropic Claude, OpenAI GPT, and Groq, without having to manage the complex API integration for each provider separately. It provides a standardized way to send prompts to these LLM models and retrieve the generated responses.

By using this script, rEngine Core users can quickly test and experiment with various LLM providers, compare their performance, and integrate the most suitable one into their rEngine-based applications.

## Key Functions/Classes

The `call-llm.js` script defines the following key functions:

1. **`callGemini(prompt, model)`**: Calls the Google Gemini LLM API with the provided prompt and model.
2. **`callClaude(prompt, model)`**: Calls the Anthropic Claude LLM API with the provided prompt and model.
3. **`callOpenAI(prompt, model)`**: Calls the OpenAI GPT LLM API with the provided prompt and model.
4. **`callGroq(prompt, model)`**: Calls the Groq LLM API with the provided prompt and model.
5. **`callLLM(provider, prompt, model)`**: The main function that handles the LLM API calls and returns the response.
6. **`showProviders()`**: Displays the available LLM providers, their models, and the status of the configured API keys.
7. **`parseArgs()`**: Parses the command-line arguments and options.
8. **`handleMCPMode()`**: Handles the MCP mode, where the input is read from stdin as a JSON object.
9. **`logCall(callData)`**: Logs the LLM API call details to a JSONL file for historical reference.

## Dependencies

The `call-llm.js` script has the following dependencies:

1. **Node.js**: The script is designed to run on a Node.js environment.
2. **fs/promises**: The built-in Node.js file system module, used for logging call details.
3. **path**: The built-in Node.js path module, used for handling file paths.
4. **fileURLToPath**: A utility function from the Node.js URL module, used for obtaining the script's file path.
5. **dotenv**: A library for loading environment variables from a `.env` file.

## Usage Examples

### Command-line Usage

1. Call the Gemini LLM provider with a prompt:

   ```
   node call-llm.js --provider gemini --prompt "Explain quantum computing in simple terms."
   ```

1. Call the Claude LLM provider with a specific model and prompt:

   ```
   node call-llm.js --provider claude --model claude-3-sonnet-20240229 --prompt "Analyze this code snippet."
   ```

1. Call the OpenAI GPT LLM provider with a prompt:

   ```
   node call-llm.js --provider openai --prompt "Help me with this task."
   ```

1. Call the Groq LLM provider with a prompt:

   ```
   node call-llm.js --provider groq --prompt "I need a fast response."
   ```

### MCP Mode

In MCP mode, the input is provided as a JSON object through stdin:

```
echo '{"provider":"gemini","prompt":"analyze performance"}' | node call-llm.js --mcp
```

## Configuration

The `call-llm.js` script relies on the following environment variables to be set:

- `GEMINI_API_KEY`: The API key for the Google Gemini LLM provider.
- `ANTHROPIC_API_KEY`: The API key for the Anthropic Claude LLM provider.
- `OPENAI_API_KEY`: The API key for the OpenAI GPT LLM provider.
- `GROQ_API_KEY`: The API key for the Groq LLM provider.

These API keys can be stored in a `.env` file, which the script will automatically load.

## Integration Points

The `call-llm.js` script is designed to be used as a standalone utility within the rEngine Core ecosystem. It can be integrated into other rEngine Core components, such as the MCP, to provide a unified interface for accessing various LLM providers.

Additionally, the script's output, which includes the provider, model, prompt, response, and other metadata, can be used by other rEngine Core components for further processing, analysis, or integration into larger applications.

## Troubleshooting

1. **Missing API Key**: If an API key for a specific LLM provider is not found in the environment, the script will throw an error and prompt the user to configure the missing API key.

1. **Unsupported Provider**: If an unsupported provider is specified, the script will display an error message and list the available providers.

1. **API Call Failure**: If an API call to an LLM provider fails, the script will display the error message returned by the provider's API, along with the HTTP status code.

1. **Logging Failure**: If the script fails to log the call details to the `llm-calls.jsonl` file, a warning message will be displayed, but the script will continue to execute.

By following the usage examples and ensuring the necessary API keys are configured, users should be able to successfully utilize the `call-llm.js` script within the rEngine Core ecosystem.
