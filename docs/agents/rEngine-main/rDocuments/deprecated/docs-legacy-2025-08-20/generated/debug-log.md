# `debug-log.js` - Debugging Utility for rEngine Core

## Purpose & Overview

The `debug-log.js` file provides a centralized and configurable debugging utility for the rEngine Core platform. It allows developers to log messages, warnings, and errors to the console, with the ability to enable/disable debugging based on a persistent user setting.

This file serves as a common debugging infrastructure that can be leveraged across various components and applications within the rEngine Core ecosystem, ensuring a consistent and manageable logging experience.

## Key Functions/Classes

The `debug-log.js` file defines the following key functions:

1. `isEnabled()`: Checks if the debugging functionality is enabled by retrieving a value from the browser's local storage.
2. `log(level, args)`: Logs messages to the console based on the specified log level (INFO, WARN, ERROR). It appends a standard prefix and timestamp to the log entries and stores them in a history array.
3. `debugLog(...)`, `debugWarn(...)`, `debugError(...)`: Wrapper functions that call the `log()` function with the respective log levels.
4. `getDebugHistory()`: Returns a copy of the debug log history.

## Dependencies

The `debug-log.js` file does not have any direct dependencies on other rEngine Core components. It uses the browser's built-in `localStorage` API and `console` object to handle the logging functionality.

## Usage Examples

To use the debugging utility in your rEngine Core application, you can call the provided wrapper functions:

```javascript
import { debugLog, debugWarn, debugError } from 'rProjects/StackTrackr/js/debug-log.js';

debugLog('This is an informational message');
debugWarn('This is a warning message');
debugError('This is an error message');
```

You can also access the debug log history:

```javascript
import { getDebugHistory } from 'rProjects/StackTrackr/js/debug-log.js';

const debugHistory = getDebugHistory();
console.log(debugHistory);
```

## Configuration

The debugging functionality is controlled by a persistent setting in the browser's local storage. To enable or disable debugging, you can set the `stackrtrackr.debug` key in the local storage:

```javascript
// Enable debugging
localStorage.setItem('stackrtrackr.debug', 'true');

// Disable debugging
localStorage.setItem('stackrtrackr.debug', 'false');
```

Alternatively, you can use the browser's developer tools to directly manipulate the local storage.

## Integration Points

The `debug-log.js` file is designed to be used across various components and applications within the rEngine Core platform. It provides a consistent and centralized way to manage debugging functionality, allowing developers to easily integrate it into their projects.

## Troubleshooting

## Issue: Debugging is not working as expected.

- Ensure that the `stackrtrackr.debug` key is set correctly in the browser's local storage.
- Check if the `localStorage` API is available and accessible in the current environment.
- Verify that the `debug-log.js` file is correctly imported and used in your application.

**Issue: Debug log entries are not appearing in the console.**

- Confirm that the log level (INFO, WARN, ERROR) matches the console method you are using (e.g., `console.log()`, `console.warn()`, `console.error()`).
- Check if there are any runtime errors or exceptions that are preventing the logging functionality from working correctly.
- Ensure that the browser's console is open and configured to display the appropriate log levels.

If you encounter any other issues or have additional questions, please refer to the rEngine Core documentation or reach out to the support team.
