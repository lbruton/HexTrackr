# Debug Log Bootstrap

## Purpose & Overview

The `debug-log.js` script provides a simple and lightweight logging mechanism for your application. It allows you to log messages at different levels (info, warn, error) and persist a history of logged messages. This can be helpful for debugging and troubleshooting issues in your application, especially in a production environment where traditional logging solutions may not be feasible.

## Technical Architecture

The script is implemented as a self-executing anonymous function that adds three global functions to the execution context (`window` or `global`):

1. `debugLog()`: Logs an informational message
2. `debugWarn()`: Logs a warning message
3. `debugError()`: Logs an error message

These functions internally call the `log()` function, which handles the actual logging logic. The `log()` function checks if debugging is enabled (based on a localStorage flag) and then logs the message to the console using the appropriate console method (`console.log()`, `console.warn()`, or `console.error()`).

The script also maintains a `history` array that keeps track of all the logged messages. The `getDebugHistory()` function can be used to retrieve this history.

## Dependencies

This script has no external dependencies and can be used standalone in any JavaScript-based application.

## Key Functions/Classes

### `isEnabled()`

- **Purpose**: Checks if debugging is enabled by looking for the `'stackrtrackr.debug'` flag in localStorage.
- **Parameters**: None
- **Return Value**: `true` if debugging is enabled, `false` otherwise.

### `log(level, args)`

- **Purpose**: Logs a message with the specified level to the console and the internal history.
- **Parameters**:
  - `level` (string): The logging level, one of `'INFO'`, `'WARN'`, or `'ERROR'`.
  - `args` (array): The message to be logged, as an array of arguments.
- **Return Value**: None

### `debugLog()`

- **Purpose**: Logs an informational message.
- **Parameters**: `...args` (any): The message to be logged.
- **Return Value**: None

### `debugWarn()`

- **Purpose**: Logs a warning message.
- **Parameters**: `...args` (any): The message to be logged.
- **Return Value**: None

### `debugError()`

- **Purpose**: Logs an error message.
- **Parameters**: `...args` (any): The message to be logged.
- **Return Value**: None

### `getDebugHistory()`

- **Purpose**: Retrieves the history of all logged messages.
- **Parameters**: None
- **Return Value**: An array of strings, representing the logged messages.

## Usage Examples

To use the debug logging functionality, simply call one of the provided functions:

```javascript
debugLog('This is an informational message');
debugWarn('This is a warning message');
debugError('This is an error message');
```

You can also retrieve the debug history:

```javascript
const debugHistory = getDebugHistory();
console.log(debugHistory);
```

## Configuration

The debug logging functionality is controlled by a flag stored in localStorage. To enable debugging, set the `'stackrtrackr.debug'` flag in localStorage to any truthy value:

```javascript
localStorage.setItem('stackrtrackr.debug', 'true');
```

To disable debugging, remove the flag from localStorage:

```javascript
localStorage.removeItem('stackrtrackr.debug');
```

## Error Handling

The `log()` function is wrapped in a `try-catch` block to prevent any errors in the logging process from affecting the main application. If an error occurs during logging, it is silently ignored.

## Integration

This debug logging script can be integrated into any JavaScript-based application, including web applications, Node.js applications, and more. It provides a simple and lightweight way to add logging capabilities to your project without introducing heavy dependencies.

## Development Notes

- The script uses the `'use strict'` directive to enforce strict mode, which can help catch certain types of errors during development.
- The script checks the global execution context (`window` or `global`) to determine where to attach the logging functions.
- The script uses the `Date.toISOString()` method to generate a timestamp for each logged message, which can be helpful for debugging and troubleshooting.
- The script uses the `console.log()`, `console.warn()`, and `console.error()` methods to output the logged messages, which ensures consistent formatting and behavior across different environments.
