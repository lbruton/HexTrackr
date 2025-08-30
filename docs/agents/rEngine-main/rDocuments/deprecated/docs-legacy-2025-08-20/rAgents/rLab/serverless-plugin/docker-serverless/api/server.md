# StackTrackr API Server

## Purpose & Overview

The `server.js` script is the main entry point for the StackTrackr API, a service that provides real-time precious metal price data. This API allows users to retrieve the latest prices for gold, silver, platinum, and palladium, along with historical price series data. The script sets up an Express.js server, configures middleware, and handles various API endpoints for fetching prices, proxying external provider data, and managing the application's configuration.

## Technical Architecture

The StackTrackr API server is built on the following key components:

1. **Express.js**: The main web framework used to handle HTTP requests and define API endpoints.
2. **Redis**: An in-memory data store used for caching price data to improve response times.
3. **PostgreSQL**: A relational database used to store the historical price data.
4. **Winston**: A logging library used for recording information, warnings, and errors.
5. **Express Validator**: A middleware used for validating and sanitizing user input.
6. **Helmet**: A middleware that helps secure the Express apps by setting various HTTP headers.
7. **CORS**: A middleware that provides a way to specify what origins can access the API.
8. **Express Rate Limit**: A middleware used to limit repeated requests to public APIs and endpoints.

The data flow in the application is as follows:

1. A client makes a request to one of the API endpoints (e.g., `/api/prices`).
2. The server first checks the Redis cache for the requested data.
3. If the data is not found in the cache, the server queries the PostgreSQL database to fetch the latest price data.
4. The fetched data is then cached in Redis for a configurable amount of time (e.g., 5 minutes).
5. The server returns the price data to the client in the response.

The server also provides a `/api/proxy` endpoint that allows clients to fetch prices directly from external price data providers. This is useful for cases where the StackTrackr API does not have the necessary data or when clients need to access provider-specific features.

## Dependencies

The `server.js` script relies on the following external dependencies:

| Dependency | Version | Purpose |
| --- | --- | --- |
| `express` | ^4.17.1 | Web framework for Node.js |
| `cors` | ^2.8.5 | Middleware for handling CORS with various options |
| `helmet` | ^4.4.1 | Middleware that adds security-related HTTP headers |
| `express-rate-limit` | ^5.2.6 | Middleware for limiting repeated requests to public APIs and endpoints |
| `express-validator` | ^6.12.1 | Middleware for validating and sanitizing user input |
| `redis` | ^3.1.2 | Client for interacting with Redis |
| `pg` | ^8.7.1 | Client for interacting with PostgreSQL |
| `winston` | ^3.3.3 | Logging library for Node.js |
| `dotenv` | ^10.0.0 | Loads environment variables from a `.env` file |

## Key Functions/Classes

### Middleware Setup

1. **Logging Configuration**:
   - Creates a Winston logger instance with custom formatting and transports.

1. **Express App Initialization**:
   - Sets up the Express application and defines the server port.

1. **Redis Client**:
   - Creates a Redis client instance using the provided connection URL.

1. **PostgreSQL Pool**:
   - Creates a PostgreSQL connection pool using the provided connection string.

1. **Express Middleware**:
   - Applies Helmet, CORS, and JSON parsing middleware to the Express app.
   - Enables rate limiting for the `/api/` endpoint.

### API Endpoints

1. **Health Check**:
   - Provides a basic health check endpoint at `/health`.

1. **Get Latest Prices**:
   - Implements the `/api/prices` endpoint, which allows clients to fetch the latest precious metal prices.
   - Supports optional query parameters for filtering by metal, currency, unit, and time window.
   - Caches the response in Redis for a configurable amount of time.

1. **Provider Proxy**:
   - Implements the `/api/proxy/:provider` endpoint, which allows clients to fetch prices directly from external providers.
   - Validates the input parameters and dynamically imports the corresponding provider module.

1. **Configuration Management**:
   - Implements the `/api/config` endpoint, which allows administrators to update the application's configuration (e.g., provider settings, cache TTL).
   - Stores the configuration in Redis for easy access.

### Error Handling

- The script includes a global error handling middleware that logs unhandled errors and returns a generic 500 Internal Server Error response to the client.

### Initialization and Graceful Shutdown

- The `startServer` function initializes the Redis and PostgreSQL connections, then starts the Express server.
- The script listens for the `SIGTERM` signal and gracefully shuts down the server, closing the Redis and PostgreSQL connections.

## Usage Examples

### Fetch Latest Precious Metal Prices

```
GET /api/prices?metal=gold&currency=USD&unit=toz&window=24h
```

This request will fetch the latest gold prices in US dollars per troy ounce for the past 24 hours.

Example response:

```json
{
  "metal": "gold",
  "currency": "USD",
  "unit": "toz",
  "window": "24h",
  "latest": {
    "ts": "2023-04-26T12:00:00.000Z",
    "metal": "gold",
    "currency": "USD",
    "unit": "toz",
    "price": 2000.00,
    "ask": 2000.50,
    "bid": 1999.50,
    "high24h": 2001.00,
    "low24h": 1998.00,
    "change_amount": 10.00,
    "change_percent": 0.005,
    "provider": "kitco",
    "source": "https://www.kitco.com"
  },
  "series": [
    // Historical price data
  ],
  "cached_at": "2023-04-26T12:00:10.000Z",
  "count": 100
}
```

### Fetch Prices from External Provider

```
GET /api/proxy/kitco?metal=gold&currency=USD
```

This request will fetch the latest gold price in US dollars from the Kitco provider.

Example response:

```json
{
  "metal": "gold",
  "currency": "USD",
  "price": 2000.00,
  "ask": 2000.50,
  "bid": 1999.50,
  "timestamp": "2023-04-26T12:00:00.000Z",
  "provider": "kitco",
  "source": "https://www.kitco.com"
}
```

## Configuration

The StackTrackr API server can be configured using the following environment variables:

| Variable | Description | Default Value |
| --- | --- | --- |
| `PORT` | The port the server will listen on | `3001` |
| `REDIS_URL` | The connection URL for the Redis server | `redis://localhost:6379` |
| `POSTGRES_URL` | The connection string for the PostgreSQL database | `postgresql://stacktrackr:dev_password_change_in_prod@localhost:5432/stacktrackr_prices` |
| `CORS_ORIGIN` | Allowed origin URLs for CORS | `['http://localhost:3000', 'file://']` |
| `RATE_LIMIT` | The maximum number of requests per minute | `60` |

Additionally, the `/api/config` endpoint allows administrators to update the following configuration options:

| Configuration | Description | Default Value |
| --- | --- | --- |
| `providers` | An object containing settings for each price data provider | `{}` |
| `cache.ttlSeconds` | The time-to-live (in seconds) for cached price data | `300` (5 minutes) |

## Error Handling (2)

The StackTrackr API server handles errors in the following ways:

1. **Validation Errors**: If the client provides invalid input, the server will return a 400 Bad Request response with details about the errors.

1. **Provider Errors**: If an error occurs while fetching data from an external price provider, the server will return a 500 Internal Server Error response with a generic "Provider error" message.

1. **Unhandled Errors**: Any unhandled errors in the server code will be logged using the Winston logger and a 500 Internal Server Error response will be returned to the client.

## Integration

The StackTrackr API server is designed to be a standalone service that can be integrated into a larger system. It can be consumed by various client applications (e.g., web applications, mobile apps, data analysis tools) that need access to real-time and historical precious metal price data.

The API can be easily integrated into other systems by making HTTP requests to the defined endpoints. Clients can fetch the latest prices, historical price series, and even proxy data from external providers.

## Development Notes

1. **Provider Modules**: The `server.js` script uses a dynamic import to load provider-specific modules. This allows the API to be easily extended with support for new price data providers without modifying the core server code.

1. **Configuration Management**: The ability to update the application's configuration through the `/api/config` endpoint makes it easy to adjust settings (e.g., provider settings, cache TTL) without restarting the server.

1. **Caching**: The use of Redis for caching price data significantly improves the server's response times, especially for frequently requested data.

1. **Error Handling**: The comprehensive error handling, including validation errors, provider-specific errors, and unhandled errors, ensures that the API provides clear and informative responses to clients.

1. **Logging**: The Winston logger set up in the script provides a centralized logging solution, making it easier to diagnose and debug issues in the production environment.

1. **Graceful Shutdown**: The script listens for the `SIGTERM` signal and gracefully shuts down the server, closing the Redis and PostgreSQL connections, to ensure a clean shutdown process.

Overall, the `server.js` script demonstrates a well-structured, scalable, and production-ready implementation of the StackTrackr API server.
