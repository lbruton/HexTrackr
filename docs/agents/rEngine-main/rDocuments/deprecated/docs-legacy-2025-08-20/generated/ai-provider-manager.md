# rEngine Core: AI Provider Manager

## Purpose & Overview

The `ai-provider-manager.js` file is a crucial component of the rEngine Core ecosystem, responsible for managing the integration and interaction with various AI service providers. It serves as a unified interface, allowing rEngine Core to seamlessly utilize different AI models and services from various providers, such as OpenAI, Google, Anthropic, and the internal OLLaMA provider.

The `AIProviderManager` class encapsulates the necessary logic to handle the initialization, status checks, and querying of these AI providers, providing a consistent and abstracted way for other rEngine Core components to leverage AI capabilities.

## Key Functions/Classes

### `AIProviderManager` Class

The `AIProviderManager` class is the main component in this file, responsible for the following tasks:

1. **Provider Configuration**: Maintains a configuration object that holds the details of the supported AI providers, including their endpoints, status, and available models.
2. **Provider Status Checks**: Provides the `checkProviderStatus()` method to asynchronously check the status and availability of each configured provider.
3. **Model Retrieval**: Offers the `getAvailableModels()` method to retrieve a list of all available AI models across the configured providers.
4. **Provider Querying**: Implements the `queryProvider()` method to handle AI model queries, delegating the execution to the appropriate provider-specific logic (e.g., `queryOllama()`).
5. **Provider Initialization**: Includes the `initializeProviders()` method to initialize and log the status of all configured AI providers.

### `queryOllama()` Method

The `queryOllama()` method is a provider-specific implementation that handles the interaction with the internal OLLaMA AI model. It uses the `axios` library to make a POST request to the OLLaMA API endpoint and returns the response data or an error message.

## Dependencies

The `ai-provider-manager.js` file has the following dependencies:

- **axios**: A popular HTTP client library used for making API requests to the various AI providers.

## Usage Examples

Here's an example of how to use the `AIProviderManager` class within the rEngine Core ecosystem:

```javascript
const AIProviderManager = require('./ai-provider-manager');

async function main() {
  const providerManager = new AIProviderManager();

  // Initialize providers
  await providerManager.initializeProviders();

  // Get available models
  const availableModels = await providerManager.getAvailableModels();
  console.log('Available models:', availableModels);

  // Query a provider
  const response = await providerManager.queryProvider('ollama', 'gpt-4-turbo', 'What is the capital of France?', {
    temperature: 0.5,
    top_p: 0.8
  });

  if (response.success) {
    console.log('Response:', response.response);
  } else {
    console.error('Error:', response.error);
  }
}

main();
```

## Configuration

The `AIProviderManager` class reads its configuration from the `providers` object defined within the constructor. This object holds the details for each supported AI provider, including the endpoint URL, status, and available models.

To add or modify the supported providers, you can update this configuration object accordingly.

## Integration Points

The `AIProviderManager` class is designed to be a central hub for AI provider integration within the rEngine Core ecosystem. Other components in rEngine Core can leverage this class to seamlessly access and utilize the various AI models and services, without needing to worry about the underlying provider-specific implementation details.

## Troubleshooting

1. **Provider Unavailability**: If a provider is marked as 'offline' or 'requires_auth' in the status returned by `checkProviderStatus()`, it means that the provider is currently unavailable or requires authentication. You may need to check the provider's status, network connectivity, or provide the necessary authentication credentials.

1. **Unsupported Provider**: If you encounter an error when calling `queryProvider()` with a provider that is not yet implemented, you will receive an error message indicating that the provider is not implemented. In this case, you will need to either implement the provider-specific logic or reach out to the rEngine Core team for assistance.

1. **Timeout Errors**: The `queryOllama()` method has a timeout of 30 seconds. If the OLLaMA API takes longer than 30 seconds to respond, you may encounter a timeout error. You can adjust the timeout value or investigate the cause of the slow response from the OLLaMA API.

1. **API Key Issues**: For external providers like OpenAI, Google, and Anthropic, the `AIProviderManager` class assumes that the necessary API keys and credentials are available. If you encounter issues related to authentication or authorization, you will need to ensure that the correct API keys and configurations are set up and accessible.

Remember to thoroughly test and monitor the integration of the `AIProviderManager` class within your rEngine Core application to identify and address any potential issues that may arise.
