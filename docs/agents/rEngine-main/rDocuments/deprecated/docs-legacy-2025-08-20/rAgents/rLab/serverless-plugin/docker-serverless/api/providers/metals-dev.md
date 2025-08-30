# metals-dev.js Documentation

## Purpose & Overview

The `metals-dev.js` script provides a `MetalsDevProvider` class that serves as a wrapper around the Metals.dev API. This allows developers to easily fetch current spot prices for various precious metals, such as gold, silver, platinum, and palladium, in different currencies. The normalized response data can then be used within a larger application or system.

## Technical Architecture

The `MetalsDevProvider` class has the following key components:

1. **Constructor**: Initializes the class with the Metals.dev API base URL and the API key from the environment variables.
2. **`fetchPrice`**: An asynchronous method that makes a GET request to the Metals.dev API to fetch the current spot price for a given metal and currency. It handles error cases and normalizes the response data to a consistent schema.
3. **`isHealthy`**: An asynchronous method that checks the health of the Metals.dev API by attempting to fetch the gold spot price in USD. This can be used for monitoring or failover purposes.

The script exports a singleton instance of the `MetalsDevProvider` class, allowing it to be easily imported and used throughout the application.

## Dependencies

The `metals-dev.js` script has the following dependencies:

- `axios`: A popular HTTP client library for making API requests.

## Key Functions/Classes

### `MetalsDevProvider` Class

**Constructor**:

- **Parameters**: None
- **Returns**: A new instance of the `MetalsDevProvider` class.

**`fetchPrice`**:

- **Parameters**:
  - `metal` (string): The name of the metal to fetch the spot price for (e.g., "gold", "silver", "platinum", "palladium").
  - `currency` (string, optional): The currency to fetch the spot price in (default is "USD").
- **Returns**: An object with the following properties:
  - `ts` (string): The current timestamp in ISO format.
  - `metal` (string): The name of the metal, in lowercase.
  - `currency` (string): The currency, in uppercase.
  - `unit` (string): The unit of measurement, which is always "toz" (troy ounce).
  - `price` (number): The current spot price.
  - `ask` (number): The current ask price.
  - `bid` (number): The current bid price.
  - `high24h` (number): The 24-hour high price.
  - `low24h` (number): The 24-hour low price.
  - `change` (number): The price change since the previous update.
  - `changePct` (number): The percentage price change since the previous update.
  - `provider` (string): The name of the data provider, which is "metals.dev".
  - `source` (string): The source of the data, which is "spot".
  - `raw` (object): The raw response data from the Metals.dev API.

**`isHealthy`**:

- **Parameters**: None
- **Returns**: A boolean value indicating whether the Metals.dev API is currently healthy and accessible.

## Usage Examples

Here's an example of how to use the `MetalsDevProvider` class to fetch the current gold spot price in USD:

```javascript
const metalsDevProvider = require('./metals-dev');

(async () => {
  try {
    const goldPrice = await metalsDevProvider.fetchPrice('gold', 'USD');
    console.log(goldPrice);
  } catch (error) {
    console.error('Error fetching gold price:', error.message);
  }
})();
```

This will output an object with the current gold spot price information:

```json
{
  "ts": "2023-04-19T12:34:56.789Z",
  "metal": "gold",
  "currency": "USD",
  "unit": "toz",
  "price": 1,980.25,
  "ask": 1,980.50,
  "bid": 1,980.00,
  "high24h": 1,985.00,
  "low24h": 1,975.75,
  "change": 5.50,
  "changePct": 0.28,
  "provider": "metals.dev",
  "source": "spot",
  "raw": {
    "price": 1980.25,
    "ask": 1980.50,
    "bid": 1980.00,
    "high": 1985.00,
    "low": 1975.75,
    "change": 5.50,
    "change_percent": 0.28
  }
}
```

## Configuration

The `MetalsDevProvider` class requires the `METALS_DEV_API_KEY` environment variable to be set with a valid Metals.dev API key. This API key is used to authenticate the requests to the Metals.dev API.

## Error Handling

The `MetalsDevProvider` class handles errors in the following ways:

1. If the `METALS_DEV_API_KEY` environment variable is not set, the `fetchPrice` method will throw an error with the message "Metals.dev API key not configured".
2. If there is an error while making the API request, the `fetchPrice` method will throw an error with the message "Metals.dev API error: [error message]".

In both cases, the calling code should handle these errors appropriately, such as by logging the error, retrying the request, or displaying a user-friendly error message.

## Integration

The `metals-dev.js` script can be integrated into a larger application or system that requires access to current precious metal spot prices. For example, it could be used in a financial dashboard, a trading platform, or a risk management system.

## Development Notes

- The `MetalsDevProvider` class is designed as a singleton, which means there will only be a single instance of the class throughout the application. This ensures that the API key is only loaded from the environment variables once and is consistently used across the application.
- The `fetchPrice` method uses the `axios` library to make the API request and handles any errors that may occur during the request. It also applies a 5-second timeout to the request to prevent the application from getting stuck waiting for a response.
- The `isHealthy` method is provided as a way to check the health of the Metals.dev API. This can be useful for monitoring the availability of the API or implementing failover mechanisms in the application.
- The response data from the Metals.dev API is normalized to a consistent schema, which makes it easier to integrate the data into the larger application or system.
