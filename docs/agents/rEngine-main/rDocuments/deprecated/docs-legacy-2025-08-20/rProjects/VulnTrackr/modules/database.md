# Database Module Documentation

## Purpose & Overview

The `database.js` script is a module that provides an abstraction layer for managing the data storage of a VPR (Vulnerability Prioritization and Remediation) score tracking application. It supports two storage backends: SQLite for server-side or Electron-based implementations, and local browser storage for client-side web applications.

The module's main responsibilities are:

1. Initializing the appropriate data storage mechanism based on the provided configuration.
2. Providing a consistent API for saving, retrieving, and adding VPR scan data.
3. Handling any necessary error handling or fallback mechanisms.

This module aims to decouple the data storage concerns from the core application logic, allowing the application to be more flexible and scalable in its storage options.

## Technical Architecture

The `database.js` module exports two main functions:

1. `initDatabase(config)`: This function is responsible for setting up the appropriate data storage backend based on the provided configuration. It currently supports two backends:
   - **SQLite**: This option is intended for server-side or Electron-based implementations, but is not fully implemented in the provided code. Instead, it falls back to using the local browser storage as a simulation.
   - **Local Storage**: This option is used for client-side web applications, where the data is stored in the browser's local storage.

1. `getDockerPersistenceInstructions()`: This function returns a string containing instructions for setting up a Docker container with persistent data storage for the VPR Tracker application.

The data flow within the module is as follows:

1. The `initDatabase` function is called with a configuration object, which specifies the desired storage backend.
2. Depending on the configuration, the function initializes either the SQLite or local storage backend.
3. The initialized backend provides a set of methods for interacting with the data storage:
   - `saveHistory(history)`: Saves the entire VPR scan history to the storage.
   - `getHistory()`: Retrieves the entire VPR scan history from the storage.
   - `addScan(scan)`: Adds a new VPR scan to the history.
   - `close()`: Closes the connection to the storage backend.

## Dependencies

The `database.js` module has no external dependencies. It uses only built-in JavaScript features and APIs, such as `localStorage` for the local storage implementation.

## Key Functions/Classes

1. `initDatabase(config)`:
   - **Parameters**: `config` (object) - Configuration object with a `type` property that specifies the desired storage backend.
   - **Return Value**: An object with the following methods:
     - `saveHistory(history)`: Saves the VPR scan history to the storage.
     - `getHistory()`: Retrieves the VPR scan history from the storage.
     - `addScan(scan)`: Adds a new VPR scan to the history.
     - `close()`: Closes the connection to the storage backend.

1. `initLocalStorage()`:
   - **Return Value**: An object with the same methods as the one returned by `initDatabase`, but using the browser's local storage as the storage backend.

1. `initSQLite(config)`:
   - **Parameters**: `config` (object) - Configuration object for the SQLite backend.
   - **Return Value**: An object with the same methods as the one returned by `initDatabase`, but using a simulated SQLite implementation (backed by local storage).

1. `getDockerPersistenceInstructions()`:
   - **Return Value**: A string containing instructions for setting up a Docker container with persistent data storage for the VPR Tracker application.

## Usage Examples

```javascript
// Initialize the database using the SQLite backend
const config = { type: 'sqlite' };
const db = await initDatabase(config);

// Save VPR scan history
await db.saveHistory([
  { id: 1, score: 85, timestamp: '2023-05-01T12:00:00Z' },
  { id: 2, score: 92, timestamp: '2023-05-02T10:30:00Z' },
]);

// Retrieve VPR scan history
const history = await db.getHistory();
console.log(history);

// Add a new VPR scan
await db.addScan({ id: 3, score: 78, timestamp: '2023-05-03T14:15:00Z' });

// Close the database connection
await db.close();
```

## Configuration

The `initDatabase` function accepts a configuration object with the following property:

- `type` (string): Specifies the desired storage backend. Supported values are `'sqlite'` and `'local'` (default).

## Error Handling

The `initSQLite` function attempts to set up the SQLite backend, but if it encounters any errors, it falls back to using the local storage backend instead. Any errors encountered during the SQLite initialization are logged to the console.

## Integration

The `database.js` module is designed to be integrated into a larger VPR Tracker application. It provides a consistent API for managing the application's data storage, allowing the core application logic to be decoupled from the specific storage implementation details.

## Development Notes

- The SQLite backend implementation is a placeholder and does not actually use a real SQLite database. Instead, it simulates the SQLite behavior by using the browser's local storage.
- In a real-world implementation, the SQLite backend would likely use a library like `better-sqlite3` for server-side or Electron-based applications. For browser-based applications, a solution like IndexedDB would be more appropriate.
- The `getDockerPersistenceInstructions` function provides a template for setting up a Docker container with persistent data storage for the VPR Tracker application. This can be used as a starting point for deploying the application in a containerized environment.
