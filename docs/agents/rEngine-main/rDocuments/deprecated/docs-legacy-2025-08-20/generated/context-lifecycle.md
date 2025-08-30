# rEngine Core: ContextLifecycleManager Documentation

## Purpose & Overview

The `ContextLifecycleManager` file is responsible for managing the lifecycle of contexts within the rEngine Core platform. It handles the configuration, cleanup, and archiving of context data based on predefined retention policies. This component plays a crucial role in maintaining the overall health and efficiency of the rEngine Core ecosystem by ensuring that obsolete context data is properly managed and removed.

## Key Functions/Classes

### `ContextLifecycleManager` Class

The `ContextLifecycleManager` class is the main component of this file. It provides the following key functionalities:

1. **Initialize**: Sets up the initial configuration for the context lifecycle management, including default values for retention days, "forever mode", and auto-cleanup.
2. **getConfig**: Retrieves the current configuration settings from a JSON file.
3. **performCleanup**: Performs the context cleanup process based on the configured retention policy, handling the "forever mode" scenario.

## Dependencies

The `ContextLifecycleManager` file relies on the following dependencies:

1. **fs**: The built-in Node.js file system module, used for reading and writing configuration and log files.
2. **path**: The built-in Node.js path module, used for constructing file paths.

## Usage Examples

To use the `ContextLifecycleManager` in your rEngine Core application, follow these steps:

1. Import the `ContextLifecycleManager` class:

```javascript
const ContextLifecycleManager = require('./context-lifecycle');
```

1. Create an instance of the `ContextLifecycleManager` and initialize it:

```javascript
const manager = new ContextLifecycleManager();
manager.initialize().then(() => {
    console.log('Context Lifecycle Manager ready');
});
```

1. Perform context cleanup as needed:

```javascript
const cleanupResult = await manager.performCleanup();
console.log(cleanupResult);
```

## Configuration

The `ContextLifecycleManager` reads its configuration from a JSON file located at `lifecycle-config.json` in the same directory as the `context-lifecycle.js` file. The configuration file should have the following structure:

```json
{
  "retentionDays": 90,
  "foreverMode": true,
  "autoCleanup": false,
  "lastCleanup": null
}
```

- `retentionDays`: The number of days to retain context data before archiving.
- `foreverMode`: If set to `true`, the cleanup process will be skipped, and all context data will be retained indefinitely.
- `autoCleanup`: If set to `true`, the cleanup process will be automatically triggered at regular intervals.
- `lastCleanup`: The timestamp of the last cleanup operation, used for tracking the last cleanup time.

## Integration Points

The `ContextLifecycleManager` is a core component of the rEngine Core platform and is intended to be integrated with other components that deal with context management, such as the context storage and retrieval systems.

## Troubleshooting

## Issue: Context cleanup is not happening as expected

1. **Check the configuration file**: Ensure that the `lifecycle-config.json` file exists and contains the correct configuration settings.
2. **Verify the "forever mode"**: If the `foreverMode` setting is set to `true`, the cleanup process will be skipped, and all context data will be retained indefinitely.
3. **Enable logging**: Add more logging statements in the `ContextLifecycleManager` class to help diagnose the issue.

**Issue: The context cleanup process is taking too long or causing performance issues**

1. **Optimize the cleanup process**: Review the `performCleanup` method and consider ways to optimize the cleanup process, such as batching operations or leveraging parallel processing.
2. **Adjust the retention policy**: Increase the `retentionDays` setting to reduce the amount of context data that needs to be processed during the cleanup.
3. **Enable "forever mode"**: If the context data is not critical, consider enabling the "forever mode" to skip the cleanup process entirely.

If you encounter any other issues or have further questions, please consult the rEngine Core documentation or reach out to the rEngine Core support team.
