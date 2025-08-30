# rEngine Core: `serverless-plugin/docker-serverless/api/server.js`

## Purpose & Overview

The `server.js` file is the main entry point for the API server of the `serverless-plugin` component within the rEngine Core platform. It sets up an Express.js application that provides various endpoints for fetching and managing price data related to precious metals (gold, silver, platinum, and palladium).

The API server serves as a central hub for handling requests, interacting with a Redis cache and a PostgreSQL database, and exposing data to client applications. It plays a crucial role in the overall data processing and caching pipeline of the rEngine Core platform.

## Key Functions/Classes

1. **Express.js Application Setup**:
   - The file sets up an Express.js application using the `express` library.
   - It configures middleware such as CORS, Helmet, and rate limiting to secure and protect the API.

1. **Redis and PostgreSQL Integration**:
   - The file sets up a Redis client using the `redis` library for caching price data.
   - It also sets up a PostgreSQL connection pool using the `pg` library to interact with the price data stored in the database.

1. **Logging and Error Handling**:
   - The file sets up a logging mechanism using the `winston` library, which is used throughout the application for logging various events and errors.
   - It also includes a global error handling middleware to handle any unhandled errors that occur in the application.

1. **API Endpoints**:
   - The file defines several API endpoints, including:
     - `/health`: a health check endpoint that returns the service status.
     - `/api/prices`: an endpoint that fetches the latest price data for a specific metal, currency, and time window, utilizing the Redis cache and PostgreSQL database.
     - `/api/proxy/:provider`: an endpoint that proxies requests to external price data providers.
     - `/api/config`: an endpoint that allows updating the application configuration (e.g., provider settings, cache TTL).

1. **Graceful Shutdown**:
   - The file includes a `SIGTERM` event handler that gracefully shuts down the server, closing the Redis and PostgreSQL connections.

## Dependencies

The `server.js` file depends on the following external libraries and components:

- **Express.js**: For setting up the web server and handling HTTP requests.
- **Cors**: For enabling CORS (Cross-Origin Resource Sharing) policies.
- **Helmet**: For setting security-related HTTP headers.
- **Express-rate-limit**: For implementing rate limiting on API requests.
- **Express-validator**: For validating request parameters and payloads.
- **Redis**: For caching price data.
- **pg**: For interacting with the PostgreSQL database.
- **Winston**: For logging and error handling.
- **dotenv**: For loading environment variables from a `.env` file.

## Usage Examples

To use the `serverless-plugin/docker-serverless/api/server.js` file, you can follow these steps:

1. Ensure that you have the necessary dependencies installed (e.g., via `npm install`).
2. Configure the required environment variables (see the "Configuration" section below).
3. Run the server using the following command:

   ```bash
   node server.js
   ```

   This will start the API server and make it available for client applications to interact with.

## Configuration

The `server.js` file relies on the following environment variables for configuration:

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | The port on which the API server should run. | `3001` |
| `REDIS_URL` | The URL of the Redis server. | `redis://localhost:6379` |
| `POSTGRES_URL` | The connection string for the PostgreSQL database. | `postgresql://stacktrackr:dev_password_change_in_prod@localhost:5432/stacktrackr_prices` |
| `CORS_ORIGIN` | The allowed origin(s) for CORS. | `['http://localhost:3000', 'file://']` |
| `RATE_LIMIT` | The maximum number of requests per minute. | `60` |

Make sure to set these environment variables correctly before running the server.

## Integration Points

The `serverless-plugin/docker-serverless/api/server.js` file is a key component within the rEngine Core platform, as it provides the API layer for interacting with the precious metals price data. It integrates with the following rEngine Core components:

1. **rAgents/rLab**: The `serverless-plugin` component, which this file is a part of, is part of the rAgents/rLab suite of tools and services.
2. **Data Processing Pipeline**: The API server interacts with the Redis cache and PostgreSQL database to fetch and manage the price data, which is a crucial part of the overall data processing pipeline in rEngine Core.
3. **Client Applications**: The API server exposes endpoints that can be consumed by various client applications, such as web applications or mobile apps, that are built on top of the rEngine Core platform.

## Troubleshooting

Here are some common issues and solutions related to the `serverless-plugin/docker-serverless/api/server.js` file:

1. **Server Startup Failure**:
   - **Issue**: The server fails to start due to connection issues with Redis or PostgreSQL.
   - **Solution**: Verify the correctness of the Redis and PostgreSQL connection details in the environment variables. Check that the respective services are running and accessible.

1. **API Request Failures**:
   - **Issue**: Clients are unable to successfully make requests to the API endpoints.
   - **Solution**: Check the logging output for any error messages. Ensure that the rate limiting configuration is appropriate for your use case. Verify the correctness of the request parameters and headers.

1. **Caching Issues**:
   - **Issue**: Price data is not being cached correctly or the cache is not being used as expected.
   - **Solution**: Inspect the logging output to see if the cache is being hit or if database queries are being executed. Ensure that the Redis connection is functioning correctly and that the cache expiration settings are appropriate.

1. **Configuration Updates Failing**:
   - **Issue**: The `/api/config` endpoint is not updating the configuration as expected.
   - **Solution**: Check the logging output for any error messages. Ensure that the request payload is correctly formatted and that the Redis connection is working as expected.

If you encounter any other issues, please refer to the logging output and the rEngine Core documentation for further assistance.
