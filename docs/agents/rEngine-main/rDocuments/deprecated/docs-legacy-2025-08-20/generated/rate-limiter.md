# rEngine Core: Rate Limiter Documentation

## Purpose & Overview

The `rate-limiter.js` file is a critical component of the rEngine Core platform, responsible for managing API request rate limiting, exponential backoff, and request queuing. It ensures that rEngine-powered applications can interact with external APIs in a smart and scalable way, avoiding rate limit issues and providing resilient, self-healing behavior.

This rate limiter module helps rEngine Core applications:

1. **Automatically Manage Rate Limits**: Tracks request history and enforces configurable rate limits per minute and per hour.
2. **Implement Exponential Backoff**: Retries failed requests with exponentially increasing delays, up to a maximum delay.
3. **Queue Requests**: Queues requests that exceed rate limits and processes them as soon as capacity becomes available.
4. **Persist State**: Saves and loads request history to disk, ensuring rate limiting data is preserved across application restarts.

By integrating this rate limiter, rEngine Core applications can reliably and efficiently interact with external APIs without experiencing rate limit-related errors or downtime.

## Key Functions/Classes

The main component in this file is the `RateLimiter` class, which encapsulates all the rate limiting logic. Here are the key functions and their responsibilities:

### `RateLimiter` Class

- `constructor(options)`: Initializes the rate limiter with the provided options, including name, rate limit thresholds, and maximum retries.
- `loadState()`: Loads the previous request history from a persistent state file, if available.
- `saveState()`: Saves the current request history to a persistent state file.
- `cleanupHistory()`: Removes old requests from the request history and retry count data.
- `getCurrentLimits()`: Calculates the current rate limit usage and determines if a new request can be made.
- `calculateDelay(retryAttempt, isRateLimit)`: Calculates the delay for retrying a request, using exponential backoff or a longer delay for rate limit errors.
- `makeRequest(requestFn, requestId)`: Adds a new request to the queue and triggers the `processQueue()` method.
- `processQueue()`: Executes the requests in the queue, waiting for rate limit windows to open up as needed.
- `executeRequest(request)`: Executes a single request, handling success and failure cases.
- `handleRequestError(request, error)`: Handles request errors, retrying if possible or recording the failure.
- `isRateLimitError(error)`: Checks if an error is a rate limit-related error.
- `isRetryableError(error)`: Checks if an error is retryable.
- `sleep(ms)`: Provides a promisified `setTimeout()` function.
- `getStats()`: Returns current statistics about the rate limiter's state.
- `shutdown()`: Saves the current state and shuts down the rate limiter.

### Utility Functions

- `if (import.meta.url === ...)`: Provides a simple CLI usage message when the file is executed directly.

## Dependencies

The `rate-limiter.js` file has the following dependencies:

1. `fs-extra`: A comprehensive file system library for Node.js, used for reading and writing the persistent state file.
2. `path`: The built-in Node.js path manipulation module, used for constructing the state file path.

These dependencies are imported at the top of the file using ES6 `import` statements.

## Usage Examples

To use the `RateLimiter` class in your rEngine Core application, follow these steps:

1. Import the `RateLimiter` class:

```javascript
import RateLimiter from './rate-limiter';
```

1. Create a new instance of the `RateLimiter` class with your desired configuration:

```javascript
const rateLimiter = new RateLimiter({
  name: 'my-api',
  maxRequestsPerMinute: 30,
  maxRequestsPerHour: 1000,
  maxRetries: 5,
  baseDelay: 2000, // 2 seconds
  maxDelay: 120000 // 2 minutes
});
```

1. Use the `makeRequest()` method to execute API calls, passing in a function that makes the actual API request:

```javascript
await rateLimiter.makeRequest(async () => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});
```

1. If you need to, you can also get statistics about the rate limiter's state using the `getStats()` method:

```javascript
const stats = rateLimiter.getStats();
console.log(stats);
```

1. When your application is shutting down, call the `shutdown()` method to save the current state:

```javascript
await rateLimiter.shutdown();
```

## Configuration

The `RateLimiter` class supports the following configuration options:

| Option | Description | Default |
| --- | --- | --- |
| `name` | A unique name for this rate limiter instance. | `'default'` |
| `maxRequestsPerMinute` | The maximum number of requests allowed per minute. | `15` |
| `maxRequestsPerHour` | The maximum number of requests allowed per hour. | `500` |
| `maxRetries` | The maximum number of times a failed request will be retried. | `3` |
| `baseDelay` | The base delay (in milliseconds) for the exponential backoff. | `1000` (1 second) |
| `maxDelay` | The maximum delay (in milliseconds) for the exponential backoff. | `60000` (1 minute) |

These options can be passed as an object to the `RateLimiter` constructor.

## Integration Points

The `rate-limiter.js` file is a core component of the rEngine Core platform and is intended to be used by all rEngine-powered applications that need to interact with external APIs. It helps ensure that these applications can reliably and efficiently make API requests without experiencing rate limit-related issues.

Other rEngine Core components, such as the API client or the orchestration system, should integrate with the `RateLimiter` class to handle their API requests. This way, the rate limiting logic is centralized and can be easily maintained and improved over time.

## Troubleshooting

### Rate Limit Errors

If your application is still experiencing rate limit errors despite using the `RateLimiter`, check the following:

1. **Verify Configuration**: Ensure that the `maxRequestsPerMinute` and `maxRequestsPerHour` settings are appropriate for the APIs you are using. You may need to adjust these values based on the actual rate limits enforced by the APIs.
2. **Monitor Request History**: Use the `getStats()` method to monitor the rate limiter's state, including the current rate limit usage and the request history. This can help you identify any patterns or spikes in API usage that may be causing rate limit issues.
3. **Investigate Retried Requests**: Check the `retryCount` statistic to see if requests are being retried frequently. If so, you may need to increase the `maxRetries` setting or investigate why the retries are failing.
4. **Validate Error Handling**: Ensure that your API request functions are properly handling rate limit-related errors and passing them to the `RateLimiter`. The `isRateLimitError()` function can be used to identify these errors.

### Persistent State Issues

If you encounter problems with the persistent state file, such as the rate limiter failing to load or save state, check the following:

1. **File Permissions**: Ensure that the application has the necessary permissions to read and write the state file located at ``.rate-limiter-${this.name}.json``.
2. **Disk Space**: Verify that the disk where the state file is stored has sufficient free space available.
3. **File Corruption**: If the state file becomes corrupted, you may need to manually delete it and allow the rate limiter to start with a fresh state.

In the event of persistent state issues, the rate limiter will still function, but it may not be able to preserve request history across application restarts, which could impact its ability to accurately enforce rate limits.
