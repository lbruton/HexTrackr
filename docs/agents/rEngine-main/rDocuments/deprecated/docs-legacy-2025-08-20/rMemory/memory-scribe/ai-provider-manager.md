# AI Provider Manager

## Purpose & Overview

The `AIProviderManager` class is a utility that provides a centralized interface for interacting with various AI service providers, such as OpenAI, Google, Anthropic, and others. It abstracts away the details of communicating with each provider's API, allowing developers to focus on the high-level functionality of their application rather than the implementation details of connecting to different AI services.

The main responsibilities of the `AIProviderManager` class are:

1. **Provider Management**: It maintains a list of available AI providers, their endpoints, and the models they support.
2. **Provider Status Checking**: It can check the status of each provider (online, offline, or requires authentication) and retrieve the available models.
3. **Query Execution**: It provides a unified interface for sending requests to the different AI providers, handling the specific implementation details for each provider.

This utility helps developers build applications that can leverage multiple AI services without having to worry about the complexities of integrating with each provider's API directly.

## Technical Architecture

The `AIProviderManager` class is the central component of this system. It has the following key elements:

1. **Provider Configuration**: The `constructor` initializes a `providers` object that holds the configuration details for each supported AI provider, including their endpoint URLs and available models.
2. **Provider Status Checking**: The `checkProviderStatus()` method checks the status of each provider and returns a status object with the provider's online/offline status and the available models.
3. **Available Models Retrieval**: The `getAvailableModels()` method collects the available models across all providers and returns a list of model information.
4. **Query Execution**: The `queryProvider()` method is the main entry point for sending requests to the AI providers. It dispatches the request to the appropriate provider-specific implementation (e.g., `queryOllama()`).
5. **Provider Initialization**: The `initializeProviders()` method is used to check the status of all providers when the application starts up.

The data flow in this system is as follows:

1. The application calls the `getAvailableModels()` method to retrieve the list of available AI models.
2. The application selects a model and calls the `queryProvider()` method, passing in the provider name, model, and the request parameters.
3. The `AIProviderManager` class handles the request, dispatching it to the appropriate provider-specific implementation.
4. The provider-specific implementation (e.g., `queryOllama()`) sends the request to the AI service and returns the response.
5. The `AIProviderManager` class returns the response to the application.

## Dependencies

The `AIProviderManager` class has the following external dependency:

- `axios`: A popular HTTP client library for making API requests.

## Key Functions/Classes

### `AIProviderManager` Class

## Constructor

- Initializes the `providers` object with the configuration details for each supported AI provider.

## `checkProviderStatus()`

- Checks the status of each AI provider and returns a status object with the provider's online/offline status and available models.

## `getAvailableModels()`

- Retrieves the available models across all providers and returns a list of model information.

## `queryProvider(provider, model, message, options)`

- Sends a request to the specified AI provider and model, with the provided message and options.
- Dispatches the request to the appropriate provider-specific implementation (e.g., `queryOllama()`).

## `queryOllama(model, message, options)`

- Sends a request to the Ollama AI provider with the specified model, message, and options.
- Returns the response or an error object.

## `initializeProviders()`

- Checks the status of all AI providers and logs the results.

## Usage Examples

Here are some examples of how to use the `AIProviderManager` class:

```javascript
const AIProviderManager = require('./ai-provider-manager');

const providerManager = new AIProviderManager();

// Check the status of all providers
const providerStatus = await providerManager.initializeProviders();
console.log(providerStatus);

// Get the available models
const availableModels = await providerManager.getAvailableModels();
console.log(availableModels);

// Query a specific provider and model
const response = await providerManager.queryProvider('ollama', 'gpt-3.5-turbo', 'Hello, world!', {
    temperature: 0.8,
    top_p: 0.9
});

if (response.success) {
    console.log('Response:', response.response);
} else {
    console.error('Error:', response.error);
}
```

## Configuration

The `AIProviderManager` class doesn't require any external configuration. The provider details are hardcoded in the `constructor`.

## Error Handling

The `AIProviderManager` class handles errors in the following ways:

1. **Provider Status Checking**: If a provider is offline, the `checkProviderStatus()` method will return an object with the `status` set to `'offline'` and the `error` property set to the error message.
2. **Query Execution**: If an error occurs during the execution of a query, the `queryProvider()` and `queryOllama()` methods will return an object with the `success` property set to `false` and the `error` property set to the error message.

## Integration

The `AIProviderManager` class is designed to be integrated into a larger application that needs to interact with various AI service providers. It provides a consistent and abstracted interface for managing the connection to these providers, allowing the application to focus on the high-level functionality rather than the implementation details.

## Development Notes

1. **Provider-Specific Implementations**: The current implementation only includes a provider-specific implementation for the Ollama AI service. Additional provider-specific implementations (e.g., `queryOpenAI()`, `queryGoogle()`) will need to be added as required.
2. **Configuration Management**: The provider configuration is currently hardcoded in the `constructor`. In a production environment, this information may need to be loaded from a configuration file or a database.
3. **Authentication and Authorization**: The current implementation assumes that the Ollama provider does not require authentication, while the other providers do. In a real-world scenario, the authentication and authorization mechanisms for each provider would need to be implemented.
4. **Extensibility**: The `AIProviderManager` class is designed to be extensible, allowing new providers to be added without requiring changes to the existing code. However, adding a new provider would still require implementing the provider-specific query logic.
5. **Error Handling and Logging**: The current error handling is minimal, and additional logging and error reporting features may be required in a production environment.
6. **Performance Optimization**: Depending on the number of providers and the frequency of requests, the performance of the `checkProviderStatus()` and `getAvailableModels()` methods may need to be optimized, potentially by caching the results or using asynchronous processing.
