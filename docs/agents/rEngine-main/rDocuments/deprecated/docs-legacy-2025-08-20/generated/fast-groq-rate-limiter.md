# Fast Groq Rate Limiter

## Purpose & Overview

The `fast-groq-rate-limiter.js` file provides an optimized rate limiter for the Groq query language used in the rEngine Core platform. This rate limiter is designed to minimize delays and enforce aggressive rate limits to maintain the high performance of the Groq engine.

The `FastGroqRateLimiter` class implements a sliding window approach to track and manage Groq requests, ensuring that the platform stays within the specified rate limits. It also includes intelligent retry handling, with reduced retry attempts and faster backoff delays compared to a traditional rate limiter.

## Key Functions/Classes

### `FastGroqRateLimiter` Class

The main class responsible for the rate limiting functionality. It has the following key methods:

- `canMakeRequest()`: Checks if a new request can be made based on the current rate limits.
- `request(fn, id)`: Adds a new request to the queue and processes it when possible.
- `processQueue()`: Processes the request queue, executing requests that are within the rate limits.
- `executeRequest(request)`: Executes a single request, recording its success or failure.
- `handleError(request, error)`: Handles errors that occur during a request, deciding whether to retry or reject the request.
- `isRateLimitError(error)`: Determines if an error is a rate limit-related error.
- `isRetryableError(error)`: Determines if an error is retryable.
- `calculateDelay(attempt, isRateLimit)`: Calculates the delay for retrying a request based on the number of attempts and whether it's a rate limit error.
- `getStats()`: Returns the current state of the rate limiter, including queue length, processing status, and rate limit information.

## Dependencies

The `fast-groq-rate-limiter.js` file depends on the following modules:

- `fs-extra`: For file system operations.
- `path`: For working with file paths.

## Usage Examples

Here's an example of how to use the `FastGroqRateLimiter` class in your rEngine Core application:

```javascript
import FastGroqRateLimiter from './fast-groq-rate-limiter';

const rateLimiter = new FastGroqRateLimiter({
  name: 'my-groq-app',
  maxRequestsPerMinute: 30,
  maxRequestsPerHour: 1000,
  maxRetries: 3,
  baseDelay: 500,
  maxDelay: 5000
});

async function fetchData() {
  try {
    const result = await rateLimiter.request(async () => {
      // Your Groq query code here
      const data = await groqClient.fetch('*[_type == "post"]');
      return data;
    });
    console.log(result);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchData();
```

## Configuration

The `FastGroqRateLimiter` class accepts the following configuration options in its constructor:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | `'groq-fast'` | A name for the rate limiter instance. |
| `maxRequestsPerMinute` | `number` | `25` | The maximum number of requests allowed per minute. |
| `maxRequestsPerHour` | `number` | `900` | The maximum number of requests allowed per hour. |
| `maxRetries` | `number` | `2` | The maximum number of retries for a failed request. |
| `baseDelay` | `number` | `200` | The base delay (in milliseconds) for retrying a request. |
| `maxDelay` | `number` | `2000` | The maximum delay (in milliseconds) for retrying a request. |

## Integration Points

The `FastGroqRateLimiter` class is designed to be used within the rEngine Core platform, specifically when making Groq queries. It can be integrated with the Groq client or any other component that needs to interact with the Groq engine.

## Troubleshooting

**Rate Limit Exceeded**: If you encounter a rate limit error, the rate limiter will automatically retry the request after a calculated delay. If the request continues to fail after the maximum number of retries, the rate limiter will reject the request.

**Network Errors**: The rate limiter will automatically retry requests that fail due to network errors, up to the maximum number of retries.

**Other Errors**: For any other errors that are not rate limit-related or retryable, the rate limiter will reject the request after the maximum number of retries.

If you encounter any issues or have further questions, please consult the rEngine Core documentation or reach out to the development team.
