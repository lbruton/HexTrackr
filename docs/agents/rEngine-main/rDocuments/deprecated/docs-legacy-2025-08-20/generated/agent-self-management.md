# rEngine Core: Agent Self-Management Protocol

## Purpose & Overview

The `agent-self-management.js` file in the `rEngine` directory of the rEngine Core platform implements the Agent Self-Management Protocol. This protocol ensures that agents running within the rEngine ecosystem follow memory contribution and session management protocols, such as:

1. Checking for recent tasks and incomplete work from previous sessions.
2. Loading and updating short-term memory for the current agent session.
3. Monitoring the Git status of the rEngine codebase and creating incremental backups when necessary.
4. Initializing and cleaning up the current agent session, including logging session details to the extended context.

This protocol is designed to maintain the integrity of the agent's memory and the overall rEngine system by enforcing best practices for memory management and version control.

## Key Functions/Classes

The main component in this file is the `AgentSelfManagement` class, which contains the following key functions:

1. `startupCheck()`: Performs the initial startup checks, including loading recent tasks, short-term memory, and Git status.
2. `logTaskCompletion(taskDescription, outcome, filesModified)`: Logs the completion of a task, updates the short-term memory, and considers creating a Git backup if necessary.
3. `sessionCleanup()`: Performs the final cleanup of the agent session, including updating the short-term memory and logging the session summary to the extended context.

## Dependencies

The `agent-self-management.js` file depends on the following rEngine Core components and external libraries:

- `fs/promises`: For asynchronous file system operations.
- `path`: For working with file and directory paths.
- `fileURLToPath`: For converting URL-like module specifiers to file paths.
- `child_process`: For executing Git commands.
- `util`: For promisifying the `exec` function from `child_process`.

Additionally, it integrates with the following rEngine Core components:

- `rMemory/rAgentMemories`: For managing short-term and extended context memory.
- `rEngine/add-context.js`: For logging session and task information to the extended context.

## Usage Examples

The `agent-self-management.js` file can be used in the following ways:

1. **Startup Check**:

   ```bash
   node agent-self-management.js startup
   ```

   This will perform the initial startup checks, including loading recent tasks, short-term memory, and Git status.

1. **Log Task Completion**:

   ```bash
   node agent-self-management.js task-complete "Implement new feature" "Completed successfully"
   ```

   This will log the completion of a task, update the short-term memory, and consider creating a Git backup if necessary.

1. **Session Cleanup**:

   ```bash
   node agent-self-management.js cleanup
   ```

   This will perform the final cleanup of the agent session, including updating the short-term memory and logging the session summary to the extended context.

## Configuration

The `AgentSelfManagement` class uses the following configuration parameters:

- `baseDir`: The base directory of the rEngine Core project.
- `memoryDir`: The directory where agent memories are stored.
- `engineDir`: The directory where the rEngine Core files are located.
- `shortTermMemoryPath`: The path to the short-term memory file.
- `persistentMemoryPath`: The path to the persistent memory file.
- `extendedContextPath`: The path to the extended context file.

These paths are derived from the `baseDir` and can be adjusted if the rEngine Core project structure changes.

## Integration Points

The `agent-self-management.js` file integrates with the following rEngine Core components:

1. **rMemory**: It interacts with the short-term and extended context memory to load and update the agent's memory.
2. **rEngine/add-context.js**: It uses this script to log session and task information to the extended context.
3. **Git**: It monitors the Git status of the rEngine codebase and creates incremental backups when necessary.

## Troubleshooting

1. **Short-term memory file not found**: If the short-term memory file is not found, the agent will start with a fresh memory. This can happen if the file was deleted or the agent is running for the first time.

1. **Git status check fails**: If the Git status check fails, the agent will continue to run, but it will not create any Git backups. This can happen if the agent is running in an environment without Git installed or if there are issues with the Git repository.

1. **Extended context logging fails**: If the extended context logging fails, the agent will continue to run, but the session and task information will not be recorded in the extended context. This can happen if there are issues with the `add-context.js` script or the extended context file.

In these cases, the agent will log the issues and continue to run, but the full benefits of the self-management protocol may not be realized.
