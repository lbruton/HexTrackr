# rEngine Core: Price Fetcher Module

## Purpose & Overview

The `price-fetcher.js` file is a crucial component within the rEngine Core ecosystem. It is responsible for fetching and storing price data for various metals (gold, silver, platinum, palladium) across multiple currencies (USD, EUR, GBP). This data is then used by other rEngine Core services and applications to provide accurate and up-to-date pricing information to users.

The `PriceFetcher` class in this file is the main entry point for the price fetching functionality. It coordinates the retrieval of price data from various provider modules, stores the data in a PostgreSQL database, and manages the caching of this information in a Redis store.

## Key Functions/Classes

1. **PriceFetcher**:
   - Responsible for managing the price fetching process
   - Initializes connections to Redis and PostgreSQL
   - Iterates through the configured providers, metals, and currencies to fetch price data
   - Stores the fetched price data in the PostgreSQL database
   - Clears the relevant cache keys in Redis to ensure data consistency

1. **metalsDevProvider**:
   - A provider module that fetches price data from a specific source (e.g., a metals development API)
   - Implements the necessary logic to retrieve the required price information

## Dependencies

The `price-fetcher.js` file integrates with the following dependencies:

- **Redis**: Used for caching price data to improve performance and reduce database load.
- **PostgreSQL**: The primary data store for the fetched price information.
- **Winston**: A logging library used to manage and output logs related to the price fetching process.
- **dotenv**: Allows the script to load environment variables from a `.env` file.

## Usage Examples

To use the `PriceFetcher` class, you can create an instance and call the `start()` method:

```javascript
const fetcher = new PriceFetcher();
fetcher.start();
```

This will initiate the price fetching process, which will run at regular intervals (specified by the `FETCH_INTERVAL` environment variable) and store the data in the PostgreSQL database.

## Configuration

The `price-fetcher.js` file relies on the following environment variables for configuration:

| Variable | Description | Default |
| --- | --- | --- |
| `REDIS_URL` | The connection URL for the Redis server | `redis://localhost:6379` |
| `POSTGRES_URL` | The connection URL for the PostgreSQL database | `postgresql://stacktrackr:dev_password_change_in_prod@localhost:5432/stacktrackr_prices` |
| `FETCH_INTERVAL` | The interval (in milliseconds) at which the price data should be fetched | `300000` (5 minutes) |

Make sure to set these environment variables correctly before running the price fetcher.

## Integration Points

The `price-fetcher.js` file is a core component of the rEngine Core platform, as it provides the necessary price data for various other services and applications. Some key integration points include:

1. **Caching**: The price data is cached in Redis to improve the performance of price lookups and reduce the load on the PostgreSQL database.
2. **Data Storage**: The fetched price data is stored in a PostgreSQL database, which can be accessed by other rEngine Core components that require this information.
3. **Event-driven Architecture**: The price fetcher can be integrated into the rEngine Core's event-driven architecture, allowing other services to subscribe to price updates and react accordingly.

## Troubleshooting

Here are some common issues and solutions related to the `price-fetcher.js` file:

1. **Failed to connect to Redis or PostgreSQL**:
   - Ensure that the connection URLs (`REDIS_URL` and `POSTGRES_URL`) are correct and that the respective services are running and accessible.
   - Check the network connectivity and firewall settings to ensure that the price fetcher can communicate with the Redis and PostgreSQL servers.

1. **Price fetch errors**:
   - Check the logs for more information about the specific errors that occurred during the price fetching process.
   - Ensure that the provider modules (e.g., `metalsDevProvider`) are correctly implemented and able to fetch the necessary price data.
   - Verify that the fetched data is compatible with the PostgreSQL schema defined in the `storePriceData()` method.

1. **Caching issues**:
   - Ensure that the Redis connection is working correctly and that the cache keys are being cleared properly.
   - Monitor the cache size and eviction policies to optimize the caching performance.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the development team for further assistance.
