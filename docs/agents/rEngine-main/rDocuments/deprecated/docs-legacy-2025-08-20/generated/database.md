# rEngine Core: VulnTrackr Database Module

## Purpose & Overview

The `database.js` file in the `VulnTrackr` module of the rEngine Core platform provides the functionality for managing the database used to store vulnerability tracking data. It supports two different storage backends: SQLite and the browser's local storage.

The primary purpose of this module is to abstract the database implementation details, allowing the rest of the VulnTrackr application to interact with the database through a consistent set of functions, regardless of the underlying storage mechanism.

## Key Functions/Classes

1. `initDatabase(config)`: This function initializes the database based on the provided configuration. It supports two database types: SQLite and local storage.
2. `initLocalStorage()`: This function sets up the local storage-based "database" implementation, providing methods to save, retrieve, and manage the vulnerability history data.
3. `initSQLite(config)`: This function sets up the SQLite-based database implementation, which is currently a placeholder and falls back to local storage in the provided code.
4. `getDockerPersistenceInstructions()`: This function returns a string containing the necessary Docker instructions for setting up persistent storage for the VulnTrackr application.

## Dependencies

The `database.js` file does not have any external dependencies, as it uses the built-in `localStorage` API for the local storage implementation. However, if you were to use a real SQLite database, you would need to include a library like `better-sqlite3` or a similar SQLite driver.

## Usage Examples

To use the database module in your VulnTrackr application, you can import the `initDatabase` and `getDockerPersistenceInstructions` functions and call them as needed:

```javascript
import { initDatabase, getDockerPersistenceInstructions } from './database.js';

// Initialize the database with a configuration object
const db = await initDatabase({
  type: 'sqlite',
  // Additional configuration options for SQLite
});

// Add a new scan to the database
await db.addScan({
  id: 'scan-123',
  date: '2023-04-20',
  // Other scan data
});

// Retrieve the vulnerability history
const history = await db.getHistory();
console.log(history);

// Close the database connection
await db.close();

// Get the Docker persistence instructions
const dockerInstructions = getDockerPersistenceInstructions();
console.log(dockerInstructions);
```

## Configuration

The `initDatabase` function accepts a configuration object with the following properties:

| Property | Description |
| --- | --- |
| `type` | The type of database to use, either `'sqlite'` or `'local'` (default) |
| `// Additional configuration options for SQLite` | Any additional configuration options required for the SQLite implementation |

## Integration Points

The `database.js` file is a key component of the VulnTrackr module within the rEngine Core platform. It provides a standardized interface for interacting with the vulnerability tracking data, allowing other parts of the VulnTrackr application to seamlessly work with the database regardless of the underlying storage mechanism.

## Troubleshooting

1. **SQLite support requires server-side implementation or Electron**: The current implementation of the SQLite support is a placeholder, as the actual SQLite integration would require a server-side or Electron-based environment. If you need to use SQLite, you'll need to implement the necessary logic using a library like `better-sqlite3`.
2. **Falling back to local storage**: If the SQLite initialization fails for any reason, the module will fall back to using the local storage-based "database" implementation. This is a temporary solution and may not be suitable for production environments with larger amounts of data.
3. **Persistent data in Docker**: The `getDockerPersistenceInstructions` function provides the necessary Docker instructions to set up persistent storage for the VulnTrackr application. Make sure to follow these instructions when deploying the application in a Docker environment.

Remember, this is a part of the rEngine Core platform, so any issues or questions related to the integration and usage of this module should be directed to the rEngine Core support team.
