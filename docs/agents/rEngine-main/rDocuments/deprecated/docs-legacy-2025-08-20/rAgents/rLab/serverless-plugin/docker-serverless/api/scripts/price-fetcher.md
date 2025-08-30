# Price Fetcher Documentation

## Purpose & Overview

The `price-fetcher.js` script is a key component of the StackTrackr system, responsible for fetching and storing up-to-date prices for various precious metals (gold, silver, platinum, palladium) across multiple currencies (USD, EUR, GBP). This data is essential for the StackTrackr application to provide accurate and timely price information to its users.

The script uses a `PriceFetcher` class to manage the price data retrieval and storage process. It periodically (configurable interval) fetches the latest prices from one or more provider modules, stores the data in a PostgreSQL database, and clears the relevant cache keys in Redis. This ensures that the application's price data is always fresh and reliable.

## Technical Architecture

The `price-fetcher.js` script is structured as follows:

1. **Logging Setup**: The script configures a Winston logger to handle informational, warning, and error logs.
2. **Connection Initialization**: The script initializes connections to Redis and PostgreSQL using the provided environment variables.
3. **Provider Modules**: The script imports one or more provider modules (e.g., `metalsDevProvider`) that are responsible for fetching the actual price data from external sources.
4. **PriceFetcher Class**: The main logic is encapsulated in the `PriceFetcher` class, which has the following key components:
   - `fetchAndStore()`: Fetches the latest prices from all configured providers and stores the data in the PostgreSQL database.
   - `storePriceData()`: Inserts or updates the price data in the `price_snapshots` table.
   - `clearCache()`: Clears the relevant cache keys in Redis to ensure the application uses the latest data.
   - `start()`: Initializes the connections, performs the initial price fetch, and schedules regular fetch cycles.
   - `stop()`: Gracefully shuts down the price fetcher by closing the database and Redis connections.
1. **Graceful Shutdown**: The script sets up event listeners for `SIGTERM` and `SIGINT` signals to ensure a graceful shutdown of the price fetcher.
2. **Startup**: The script checks if it's the main module and starts the price fetcher if so.

## Dependencies

The `price-fetcher.js` script has the following dependencies:

- `redis`: For connecting to and interacting with the Redis cache.
- `pg`: For connecting to and querying the PostgreSQL database.
- `winston`: For logging informational, warning, and error messages.
- `dotenv`: For loading environment variables from a `.env` file.
- `../providers/metals-dev`: A provider module that fetches the actual price data.

## Key Functions/Classes

### `PriceFetcher` Class

The `PriceFetcher` class is the main component of the script and has the following key methods:

| Method | Parameters | Return Value | Description |
| --- | --- | --- | --- |
| `constructor()` | N/A | N/A | Initializes the `PriceFetcher` instance with the list of supported metals, currencies, and provider modules. |
| `fetchAndStore()` | N/A | N/A | Fetches the latest prices from all configured providers and stores the data in the PostgreSQL database. Also clears the relevant cache keys in Redis. |
| `storePriceData(data)` | `data` (object): Price data to be stored | N/A | Inserts or updates the price data in the `price_snapshots` table. |
| `clearCache()` | N/A | N/A | Clears the relevant cache keys in Redis. |
| `start()` | N/A | N/A | Initializes the connections to Redis and PostgreSQL, performs the initial price fetch, and schedules regular fetch cycles. |
| `stop()` | N/A | N/A | Gracefully shuts down the price fetcher by closing the database and Redis connections. |

## Usage Examples

To use the `price-fetcher.js` script, you can follow these steps:

1. Ensure that you have a Redis server and a PostgreSQL database set up and configured.
2. Create a `.env` file in the project root directory and add the necessary environment variables:

   ```
   REDIS_URL=redis://localhost:6379
   POSTGRES_URL=postgresql://stacktrackr:dev_password_change_in_prod@localhost:5432/stacktrackr_prices
   FETCH_INTERVAL=300000 # 5 minutes
   ```

1. Run the script using Node.js:

   ```
   node price-fetcher.js
   ```

   This will start the price fetcher, which will periodically (every 5 minutes by default) fetch the latest prices and store them in the PostgreSQL database.

## Configuration

The `price-fetcher.js` script can be configured using the following environment variables:

| Variable | Default Value | Description |
| --- | --- | --- |
| `REDIS_URL` | `redis://localhost:6379` | The URL to connect to the Redis server. |
| `POSTGRES_URL` | `postgresql://stacktrackr:dev_password_change_in_prod@localhost:5432/stacktrackr_prices` | The URL to connect to the PostgreSQL database. |
| `FETCH_INTERVAL` | `300000` (5 minutes) | The interval (in milliseconds) at which the price fetcher should run. |

## Error Handling

The `price-fetcher.js` script uses the `winston` logger to handle errors and log them appropriately. When an error occurs during the price fetch or storage process, the script will log the error message and stack trace to the console.

Additionally, the `PriceFetcher` class has error handling built into the `fetchAndStore()` method. If an error occurs while fetching prices from a provider or storing the data in the database, the method will log the error and continue with the next provider or currency. This ensures that a failure in one part of the process doesn't prevent the entire price fetch cycle from completing.

## Integration

The `price-fetcher.js` script is a key component of the StackTrackr system, responsible for providing the latest precious metal prices to the application. The data stored in the PostgreSQL database by this script is then used by other parts of the StackTrackr application, such as the frontend, to display current and historical price information to users.

## Development Notes

- The script uses the `dotenv` library to load environment variables from a `.env` file. This allows for easy configuration of the Redis and PostgreSQL connection details, as well as the price fetch interval.
- The `PriceFetcher` class is designed to be extensible, allowing for the addition of new provider modules in the future. This ensures that the script can be easily updated to fetch data from additional sources as needed.
- The script uses a combination of Redis and PostgreSQL to store and manage the price data. Redis is used for caching, while PostgreSQL is used as the primary data store. This approach helps to improve the overall performance and reliability of the StackTrackr application.
- The script includes graceful shutdown functionality, allowing it to be easily stopped and restarted without losing data or causing issues in the larger system.
