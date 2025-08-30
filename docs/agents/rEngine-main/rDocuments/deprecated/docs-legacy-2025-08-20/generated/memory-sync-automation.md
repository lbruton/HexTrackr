# Memory Sync Automation Script

## Purpose & Overview

The `memory-sync-automation.sh` script is a crucial component of the rEngine Core platform, responsible for automating the daily synchronization between the MCP (Memory Coordination Protocol) and the rMemory systems. This script ensures that the critical agent memories, tasks, and other persistent data are consistently backed up and maintained, enabling the seamless operation of the rEngine Core ecosystem.

## Key Functions/Classes

1. **`run_memory_sync()`**: This function is responsible for executing the memory sync process. It changes to the project directory, runs the `memory-sync-utility.js` script, and handles the success or failure of the sync operation. It also updates the development status dashboard with the current sync timestamp and creates a status marker file.

1. **`check_sync_health()`**: This function checks the health of the critical memory-related files, such as `memory.json`, `handoff.json`, `tasks.json`, and `persistent-memory.json`. It logs the age of these files, alerting the user if they are older than 24 hours, which may indicate the need for a sync.

1. **`setup_cron()`**: This function sets up a daily cron job to automatically run the memory sync script at 6 AM. It checks if the cron job already exists and adds it if not.

1. **`show_status()`**: This function displays the current memory sync status, including the last sync status, the health of the critical files, and the recent sync log files.

## Dependencies

The `memory-sync-automation.sh` script depends on the following:

1. **`memory-sync-utility.js`**: This is the main utility script that performs the actual memory synchronization between the MCP and rMemory systems.
2. **`developmentstatus.html`**: This file is updated with the current sync timestamp when the sync is successful.

## Usage Examples

1. **Manual Execution**:

   ```bash
   ./memory-sync-automation.sh manual
   ```

   This will run the sync process interactively, displaying the full output.

1. **Cron Execution**:

   ```bash
   ./memory-sync-automation.sh cron
   ```

   This will run the sync process silently, with all output going to the log file only.

1. **Setup Automated Sync**:

   ```bash
   ./memory-sync-automation.sh setup
   ```

   This will set up a daily cron job to run the memory sync at 6 AM.

1. **Check Sync Status**:

   ```bash
   ./memory-sync-automation.sh status
   ```

   This will display the current memory sync status, including the last sync status, the health of critical files, and recent sync log files.

## Configuration

The script uses the following environment variables:

- `SCRIPT_DIR`: The directory where the script is located.
- `PROJECT_DIR`: The root directory of the rEngine Core project.
- `LOG_DIR`: The directory where the sync log files are stored.

## Integration Points

The `memory-sync-automation.sh` script is a crucial component of the rEngine Core platform, responsible for maintaining the synchronization between the MCP and rMemory systems. It integrates with the following components:

1. **`memory-sync-utility.js`**: This is the main utility script that performs the actual memory synchronization.
2. **`developmentstatus.html`**: The sync script updates the development status dashboard with the current sync timestamp when the sync is successful.
3. **Cron**: The script can be set up to run automatically via a daily cron job, ensuring the memory sync is performed consistently.

## Troubleshooting

1. **Missing Critical Files**: If the script detects that any of the critical memory-related files are missing, it will log an error message. This may indicate a problem with the MCP or rMemory systems, and the user should investigate the issue.

1. **Sync Failure**: If the memory sync process fails, the script will log an error message and create a failure marker file. The user should check the log file for more details on the failure and take appropriate action to resolve the issue.

1. **Cron Job Issues**: If the automated daily sync is not working as expected, the user should check the cron job setup and the log files for any errors or issues.

By understanding the purpose, functionality, and integration points of the `memory-sync-automation.sh` script, rEngine Core users and developers can effectively manage and maintain the synchronization of critical agent data within the platform.
