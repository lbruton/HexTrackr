# rEngine Core: Rate Limiter Test & Monitor

## Purpose & Overview

The `test-rate-limiter.js` file serves as a comprehensive test suite and monitoring tool for the `RateLimiter` class, which is a core component of the rEngine Core platform. This file allows developers to:

1. **Test the basic functionality** of the `RateLimiter` class, including handling rate limit errors and retries.
2. **Simulate and detect rate limit conditions** to ensure the limiter is properly configured and functioning.
3. **Stress test** the rate limiter by sending a burst of requests.
4. **Demonstrate file chunking** with rate limiting, simulating the processing of large files.
5. **Monitor the rate limiter's behavior** in real-time, providing insights into queue length, processing status, and request limits.

This test suite and monitoring tool helps ensure the reliability and robustness of the rEngine Core's rate limiting functionality, which is critical for managing API usage and preventing service overloads.

## Key Functions/Classes

1. **`RateLimiterTester` Class**:
   - Responsible for orchestrating the various test scenarios and monitoring the rate limiters.
   - Instantiates two `RateLimiter` instances (`geminiLimiter` and `groqLimiter`) with different configurations for testing.
   - Provides the following methods:
     - `testBasicFunctionality()`: Tests the basic rate limiting functionality, including retries and handling of rate limit errors.
     - `testRateLimitDetection()`: Simulates various error responses and verifies the rate limit detection logic.
     - `monitorLimiter(limiter, duration)`: Continuously monitors the provided `RateLimiter` instance for a specified duration.
     - `stressTest()`: Runs a stress test by sending a burst of requests to the `geminiLimiter`.
     - `demonstrateChunking()`: Simulates the processing of a large file with chunking, demonstrating the rate limiting behavior.
     - `runAllTests()`: Executes all the test scenarios and cleanup tasks.

1. **`RateLimiter` Class**:
   - Handles the rate limiting logic, including tracking request counts, applying delays, and retrying requests.
   - Provides methods for making requests (`makeRequest()`), checking if an error is a rate limit error (`isRateLimitError()`), and checking if an error is retryable (`isRetryableError()`).
   - Exposes various configuration options, such as `maxRequestsPerMinute`, `maxRequestsPerHour`, `maxRetries`, and `baseDelay`.
   - Maintains internal state and statistics, which can be accessed using the `getStats()` method.
   - Supports graceful shutdown via the `shutdown()` method.

## Dependencies

The `test-rate-limiter.js` file depends on the following external modules:

1. **`RateLimiter`**: The main rate limiting implementation, imported from the `./rate-limiter.js` file.
2. **`axios`**: A popular HTTP client library used for making requests in the test scenarios.

## Usage Examples

To run the comprehensive rate limiter tests, you can execute the `test-rate-limiter.js` file using Node.js:

```bash
node test-rate-limiter.js
```

This will run all the test scenarios, including basic functionality, rate limit detection, stress testing, and file chunking demonstration.

You can also run specific test cases by passing a command-line argument:

```bash

# Run basic functionality test

node test-rate-limiter.js basic

# Run stress test

node test-rate-limiter.js stress

# Run file chunking demonstration

node test-rate-limiter.js chunk

# Monitor a rate limiter for 1 minute

node test-rate-limiter.js monitor
```

## Configuration

The `RateLimiterTester` class creates two `RateLimiter` instances with the following configurations:

| Limiter      | `maxRequestsPerMinute` | `maxRequestsPerHour` | `maxRetries` | `baseDelay` |
| ------------ | --------------------- | ------------------- | ------------ | ----------- |
| `geminiLimiter` | 5                     | 100                 | 2            | 1000 ms     |
| `groqLimiter`   | 15                    | 500                 | 3            | 500 ms      |

These configurations can be adjusted within the `RateLimiterTester` constructor to suit your specific testing and monitoring needs.

## Integration Points

The `RateLimiter` class is a core component of the rEngine Core platform, responsible for managing API usage and preventing service overloads. It is designed to be used by other rEngine Core components that make external API requests, such as the API gateway, data transformers, and integration adapters.

The `test-rate-limiter.js` file serves as a standalone test and monitoring tool for the `RateLimiter` class, ensuring its reliability and proper integration within the rEngine Core ecosystem.

## Troubleshooting

1. **Rate Limit Errors not being detected**:
   - Verify that the error response data matches the expected format for rate limit errors (e.g., `{ status: 429, data: { message: 'Rate limit exceeded' } }`).
   - Ensure that the `isRateLimitError()` method in the `RateLimiter` class is properly configured to identify the relevant error responses.

1. **Retries not working as expected**:
   - Check the `maxRetries` and `baseDelay` configuration in the `RateLimiter` instances to ensure they are set correctly.
   - Verify that the `isRetryableError()` method in the `RateLimiter` class is correctly identifying the errors that should be retried.

1. **Monitoring issues**:
   - Ensure that the `monitorLimiter()` method is correctly retrieving and displaying the `RateLimiter` instance's stats.
   - Verify that the `getStats()` method in the `RateLimiter` class is providing the necessary information for monitoring.

If you encounter any other issues or have further questions, please consult the rEngine Core documentation or reach out to the rEngine Core support team for assistance.
