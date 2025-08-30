# rEngine Core - Memory Health Monitor

## Purpose & Overview

The `memory-health-monitor.js` file is a critical component of the rEngine Core platform, responsible for real-time monitoring and reporting on the health of the system's memory and file integrity. This module, known as the "Memory Health Monitor", integrates with the Smart Scribe module to provide comprehensive memory health status updates, enabling rEngine Core to proactively detect and address any issues that may impact the system's performance and stability.

The main objectives of the Memory Health Monitor are:

1. **Real-time Monitoring**: Continuously checks the health and integrity of critical memory files, ensuring the system's ability to maintain agent continuity.
2. **MCP Connectivity**: Verifies the connection and synchronization status between the local memory and the Memory Coordination Platform (MCP), a central hub for managing agent memories.
3. **Sync Status Validation**: Validates the timeliness of the last memory synchronization, alerting the system if the sync is overdue.
4. **Alert Generation**: Identifies and reports any critical issues or anomalies detected during the health check, triggering alerts for prompt resolution.
5. **Comprehensive Reporting**: Generates detailed health reports, including overall status, file-level details, and recommended actions, which can be saved for further analysis and monitoring.

## Key Functions/Classes

The `MemoryHealthMonitor` class is the main component of this module, responsible for performing the various health checks and generating the comprehensive health report.

### `MemoryHealthMonitor` Class

- **Constructor**: Initializes the class with the base directory, critical file paths, and health thresholds.
- **`checkFileHealth()`**: Examines the integrity and status of the critical memory files, such as `memory.json`, `handoff.json`, and others.
- **`checkMCPHealth()`**: Checks the connectivity and synchronization status between the local memory and the Memory Coordination Platform (MCP).
- **`checkSyncHealth()`**: Validates the timeliness of the last memory synchronization, ensuring the system is up-to-date.
- **`generateHealthReport()`**: Compiles the overall health status, including file-level details, MCP and sync status, and any detected issues or recommendations.
- **`saveHealthReport()`**: Saves the generated health report to a JSON file in the logs directory.
- **`logHealthSummary()`**: Prints a formatted summary of the health report to the console.
- **`run()`**: Orchestrates the execution of the health checks and generates the final health report.
- **`quickHealthCheck()`**: Provides a simplified health check for real-time monitoring integration (e.g., Smart Scribe).

## Dependencies

The `memory-health-monitor.js` file relies on the following dependencies:

- **`fs-extra`**: Provides enhanced file system functionality, such as ensuring directory existence and writing JSON files.
- **`path`**: Handles file path manipulation.
- **`axios`**: (not currently used) Allows for making HTTP requests, potentially for fetching data from the MCP.

## Usage Examples

To use the Memory Health Monitor, you can import the `MemoryHealthMonitor` class and create an instance of it:

```javascript
import MemoryHealthMonitor from './memory-health-monitor';

const monitor = new MemoryHealthMonitor();
const healthReport = await monitor.run();
```

This will execute a comprehensive health check and generate a detailed report. The report can be accessed through the `healthReport` variable.

You can also use the `quickHealthCheck()` method to get a simplified health status update for real-time monitoring:

```javascript
const quickStatus = await monitor.quickHealthCheck();
console.log(quickStatus);
```

This method returns an object with the following properties:

- `healthy`: `true` if no issues were detected, `false` otherwise
- `issues`: The number of issues found
- `status`: `'healthy'` or `'issues_detected'`
- `lastCheck`: The timestamp of the last health check

## Configuration

The `MemoryHealthMonitor` class can be configured by passing a `baseDir` parameter to the constructor. This sets the base directory for the memory files and logs.

```javascript
const monitor = new MemoryHealthMonitor('/path/to/your/rEngine/base/directory');
```

If no `baseDir` is provided, the class will use the default value of `/Volumes/DATA/GitHub/rEngine`.

The class also defines several health thresholds that can be adjusted as needed:

- `maxFileAge`: The maximum age (in milliseconds) for a critical memory file before it is considered "stale".
- `maxSyncLag`: The maximum time (in milliseconds) since the last memory synchronization before it is considered "overdue".
- `minFileSize`: The minimum size (in bytes) for a critical memory file.
- `maxLogAge`: The maximum age (in milliseconds) for log files before they are considered for cleanup.

## Integration Points

The Memory Health Monitor is designed to integrate with several key components of the rEngine Core platform:

1. **Smart Scribe**: The `quickHealthCheck()` method provides a simplified health status update that can be leveraged by the Smart Scribe module for real-time monitoring and alerting.
2. **Cron-based Scheduled Validation**: The `run()` method can be executed periodically using a cron job or similar scheduling mechanism to ensure regular health checks and report generation.
3. **Dashboard Status Updates**: The generated health reports can be used to update the rEngine Core dashboard, providing users with a clear overview of the system's memory health.
4. **Alert Generation**: The identified issues and recommendations from the health report can trigger alerts, notifying the rEngine Core team of critical problems that require immediate attention.

## Troubleshooting

## Issue: Critical memory file is missing or corrupted

- **Symptoms**: The health report shows that a critical file, such as `memory.json` or `handoff.json`, is missing or has issues.
- **Resolution**: Investigate the root cause of the missing or corrupted file, which could be due to file system errors, sync issues, or other system problems. Attempt to restore the file from backups or recreate it if possible.

## Issue: MCP synchronization is lagging or unavailable

- **Symptoms**: The health report indicates that the MCP synchronization is outdated or that the local MCP cache is not available.
- **Resolution**: Check the connectivity and status of the MCP service. Ensure that the memory sync process is running as expected and is not encountering any issues. If the MCP is unavailable, the system may need to operate in offline mode until the sync can be restored.

## Issue: Sync history is missing or incomplete

- **Symptoms**: The health report shows that no sync history is available or that the last sync operation failed.
- **Resolution**: Investigate the sync process and logs to determine the root cause of the missing or failed sync history. Ensure that the memory sync automation is configured and running correctly.

If you encounter any other issues or have questions about the Memory Health Monitor, please consult the rEngine Core documentation or reach out to the development team for assistance.
