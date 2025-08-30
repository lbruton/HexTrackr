# rEngine Core: Metals.dev Provider

## Purpose & Overview

The `metals-dev.js` file in the `rAgents/rLab/serverless-plugin/docker-serverless/api/providers` directory of the rEngine Core project provides an implementation of the `MetalsDevProvider` class. This class serves as a provider for fetching real-time spot prices of various metals from the [metals.dev](https://metals.dev/) API and normalizing the data to a consistent schema.

The `MetalsDevProvider` class is responsible for:

1. Connecting to the metals.dev API using the provided API key.
2. Fetching the current spot price for a given metal and currency.
3. Normalizing the response data to a standardized format.
4. Providing a health check to ensure the provider is functioning correctly.

This provider integration allows rEngine Core to access and utilize up-to-date metal price data from the metals.dev service, which can be valuable for various financial applications and analysis tools built on the rEngine Core platform.

## Key Functions/Classes

### `MetalsDevProvider` Class

The `MetalsDevProvider` class is the main component of this file and has the following key functions:

1. `constructor()`: Initializes the provider with the `name`, `baseUrl`, and `apiKey` properties.
2. `fetchPrice(metal, currency = 'USD')`: Fetches the current spot price for the specified metal and currency from the metals.dev API. It handles authentication, error handling, and data normalization.
3. `isHealthy()`: Performs a health check by attempting to fetch the gold spot price and returning `true` if the operation is successful, `false` otherwise.

### `axios` Module

The `axios` module is used to make HTTP requests to the metals.dev API. It handles the low-level details of making the API calls and parsing the responses.

## Dependencies

This file depends on the following external resources:

1. **Axios**: A popular HTTP client library for Node.js, used for making API requests to the metals.dev service.
2. **Metals.dev API**: The external API provided by metals.dev, which is used to fetch the current spot prices of various metals.

## Usage Examples

To use the `MetalsDevProvider` in your rEngine Core application, you can import the module and create an instance of the class:

```javascript
const MetalsDevProvider = require('./providers/metals-dev');

async function getPlatinumPrice() {
  try {
    const price = await MetalsDevProvider.fetchPrice('platinum', 'USD');
    console.log(price);
  } catch (error) {
    console.error('Error fetching platinum price:', error.message);
  }
}

getPlatinumPrice();
```

This example demonstrates how to use the `fetchPrice()` method to retrieve the current spot price of platinum in US dollars.

## Configuration

The `MetalsDevProvider` class expects the `METALS_DEV_API_KEY` environment variable to be set with a valid API key from the metals.dev service. If the API key is not configured, the `fetchPrice()` method will throw an error.

To set the API key, you can use the following approach:

```bash
export METALS_DEV_API_KEY=your_api_key_here
```

Alternatively, you can pass the API key directly when creating an instance of the `MetalsDevProvider` class:

```javascript
const MetalsDevProvider = require('./providers/metals-dev');

const provider = new MetalsDevProvider({
  apiKey: 'your_api_key_here'
});

async function getPlatinumPrice() {
  try {
    const price = await provider.fetchPrice('platinum', 'USD');
    console.log(price);
  } catch (error) {
    console.error('Error fetching platinum price:', error.message);
  }
}

getPlatinumPrice();
```

## Integration Points

The `MetalsDevProvider` class is designed to be used within the rEngine Core platform, specifically as part of the `rAgents/rLab/serverless-plugin/docker-serverless/api/providers` module. It can be integrated with other components of the rEngine Core ecosystem, such as data processing pipelines, analytics tools, or financial applications that require access to real-time metal price data.

## Troubleshooting

### Metals.dev API Key Not Configured

If the `METALS_DEV_API_KEY` environment variable is not set or the API key is not provided when creating an instance of the `MetalsDevProvider` class, the `fetchPrice()` method will throw an error with the message "Metals.dev API key not configured".

To resolve this issue, ensure that the API key is properly configured and accessible to your rEngine Core application.

### Metals.dev API Error

If there is an issue with the Metals.dev API, such as a network error or an invalid response, the `fetchPrice()` method will throw an error with a message like "Metals.dev API error: {error_message}". In this case, you should check the API status, network connectivity, and the provided API key.

### Health Check Failure

If the `isHealthy()` method returns `false`, it indicates that the Metals.dev provider is not functioning correctly. This could be due to the same reasons as the Metals.dev API error mentioned above. You should investigate the root cause of the health check failure and take appropriate actions to resolve the issue.
