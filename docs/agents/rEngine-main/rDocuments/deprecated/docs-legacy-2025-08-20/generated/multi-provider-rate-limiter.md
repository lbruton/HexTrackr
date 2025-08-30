# Multi-Provider Rate Limiter

## Purpose & Overview

The `multi-provider-rate-limiter.js` file is a key component of the rEngine Core platform, responsible for managing rate limiting and request handling across multiple AI service providers. This module ensures that requests made to services like Groq, OpenAI, Gemini, and others adhere to their specific rate limits, preventing rate limit violations and ensuring optimal platform performance.

The `MultiProviderRateLimiter` class encapsulates the logic for tracking usage, managing request queues, and making rate-limited requests to the various AI providers. This allows rEngine Core to utilize the capabilities of different AI models and services while staying within the constraints of their respective rate limits.

## Key Functions/Classes

### `MultiProviderRateLimiter` Class

- **Constructor**: Initializes the provider configurations and usage tracking for each supported AI provider.
- **`getProviderConfig(provider)`**: Retrieves the configuration details for the specified AI provider.
- **`canMakeRequest(provider, tokenCount)`**: Checks if a request can be made to the given provider based on the current usage and rate limits.
- **`getWaitTime(provider, period)`**: Calculates the wait time until the next available slot for the specified time period (minute, hour, day).
- **`recordRequest(provider, tokenCount)`**: Records a successful request to the given provider, updating the usage statistics.
- **`recordError(provider, error)`**: Records an error that occurred during a request to the given provider.
- **`recordRetry(provider)`**: Records a retry attempt for a request to the given provider.
- **`makeRequest(provider, requestFn, tokenCount, retryCount)`**: Executes a rate-limited request to the given provider, handling retries if necessary.
- **`shouldRetry(error)`**: Determines if an error is retryable based on a predefined list of error messages.
- **`chooseBestProvider(tokenCount, preferredProviders)`**: Selects the best available provider for a request based on the current usage and rate limits.
- **`startCleanupInterval()`**: Starts a periodic cleanup interval to reset the usage counters for each provider.
- **`saveUsageStats(filePath)`**: Saves the current usage statistics to a JSON file at the specified path.
- **`loadUsageStats(filePath)`**: Loads the usage statistics from a JSON file at the specified path.

### Utility Functions

- **`sleep(ms)`**: A simple utility function to pause the execution for the specified number of milliseconds.

## Dependencies

The `multi-provider-rate-limiter.js` file depends on the following external modules:

- `fs-extra`: For file system operations, including reading and writing JSON files.
- `path`: For handling file paths.
- `events`: For event emitter functionality.

## Usage Examples

Here's an example of how to use the `MultiProviderRateLimiter` class in your rEngine Core application:

```javascript
import MultiProviderRateLimiter from './multi-provider-rate-limiter';

const limiter = new MultiProviderRateLimiter();

// Make a rate-limited request to the Groq provider
const requestFn = async () => {
  // Your Groq request logic goes here
  const response = await groqClient.query('...');
  return response;
};

const result = await limiter.makeRequest('groq', requestFn, 1000);
console.log('Groq response:', result);

// Choose the best provider for a 2000-token request
const { provider, waitTime } = limiter.chooseBestProvider(2000, ['groq', 'gemini']);
console.log(`Best provider for 2000 tokens: ${provider} (wait time: ${waitTime}ms)`);

// Save usage statistics to a file
await limiter.saveUsageStats('usage-stats.json');
```

## Configuration

The `MultiProviderRateLimiter` class is configured with provider-specific settings in the constructor. These settings include:

- `maxTokensPerRequest`: The maximum number of tokens allowed per request.
- `maxRequestsPerMinute`: The maximum number of requests allowed per minute.
- `maxRequestsPerHour`: The maximum number of requests allowed per hour.
- `maxRequestsPerDay`: The maximum number of requests allowed per day.
- `baseDelay`: The base delay (in milliseconds) between requests.
- `maxRetries`: The maximum number of retries allowed for failed requests.
- `retryMultiplier`: The multiplier used to calculate the delay between retries.
- `models`: The list of supported models for the provider.

No external configuration is required for this module.

## Integration Points

The `MultiProviderRateLimiter` class is a central component of the rEngine Core platform, responsible for managing the rate-limited interactions with various AI service providers. It integrates with the following rEngine Core components:

1. **AI Service Clients**: The `makeRequest` method is used by the AI service client modules (e.g., Groq, OpenAI, Gemini) to execute requests in a rate-limited manner.
2. **Provider Selection**: The `chooseBestProvider` method is used by the rEngine Core request routing logic to select the most suitable provider for a given request.
3. **Usage Tracking**: The usage statistics collected by the `MultiProviderRateLimiter` class are used for monitoring and reporting purposes within the rEngine Core platform.

## Troubleshooting

### Rate Limit Exceeded Errors

If you encounter rate limit exceeded errors, check the following:

1. Ensure that the provider-specific rate limit configurations in the `MultiProviderRateLimiter` class are accurate and up-to-date.
2. Monitor the usage statistics for each provider to identify any spikes in request volume that may be causing the rate limits to be exceeded.
3. Consider implementing additional backoff or throttling mechanisms in your AI service client code to further protect against rate limit violations.

### Retryable Errors

The `MultiProviderRateLimiter` class automatically retries requests that encounter certain types of errors, such as `rate limit`, `quota exceeded`, or `service unavailable`. If you find that some errors are not being retried correctly, review the `shouldRetry` method and update the list of retryable error messages as needed.

### Usage Statistics Persistence

If you encounter issues with saving or loading the usage statistics from the JSON file, ensure that the file path is accessible and writable by your rEngine Core application. Additionally, check the file permissions and directory structure to ensure that the file can be successfully read and written.
