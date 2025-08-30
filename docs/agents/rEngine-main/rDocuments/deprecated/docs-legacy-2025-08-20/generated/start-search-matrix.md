# rScribe Search Matrix Manager

## Purpose & Overview

The `start-search-matrix.sh` script is a key component of the rScribe documentation system within the rEngine Core platform. It manages the search matrix, which is a central repository of contextual information about the various functions and features of the rEngine ecosystem.

The primary responsibilities of this script are:

1. **Automatic Function Scanning**: Performing a full project scan to build and update the search matrix, which serves as the foundation for rapid context-based search and documentation.
2. **File Watcher**: Launching a file watcher process that continuously monitors the codebase for changes, automatically updating the search matrix as new functions and features are added or modified.
3. **Integration with rEngine MCP**: Providing a seamless integration with the rEngine Managed Code Platform (MCP), ensuring that the search matrix is in sync with the latest codebase and that the rapid_context_search tool can effectively retrieve relevant documentation.

By automating the process of building and maintaining the search matrix, this script plays a crucial role in the rEngine Core ecosystem, enabling efficient code navigation, discovery, and documentation.

## Key Functions/Classes

The `start-search-matrix.sh` script defines several key functions:

1. **`run_scan()`**: Performs a full project scan to build the initial search matrix.
2. **`start_watcher()`**: Launches the file watcher process to continuously monitor the codebase for changes.
3. **`stop_watcher()`**: Stops the file watcher process.
4. **`check_status()`**: Checks the status of the file watcher and provides information about the search matrix.

These functions are then called based on the command-line arguments passed to the script.

## Dependencies

The `start-search-matrix.sh` script has the following dependencies:

1. **Node.js**: The script requires Node.js to be installed and available in the system's PATH. It uses Node.js to run the `search-matrix-manager.js` script, which is responsible for the actual search matrix management.
2. **jq**: The script uses the `jq` command-line JSON processor to extract information from the `search-matrix/context-matrix.json` file.

## Usage Examples

The `start-search-matrix.sh` script can be invoked with various commands:

```bash

# Perform a full project scan to build the search matrix

./start-search-matrix.sh scan

# Start the file watcher process

./start-search-matrix.sh watch

# Stop the file watcher process

./start-search-matrix.sh stop

# Restart the file watcher process

./start-search-matrix.sh restart

# Check the status of the file watcher and the search matrix

./start-search-matrix.sh status

# Initialize the search matrix (scan + watch)

./start-search-matrix.sh init
```

## Configuration

The script does not require any specific configuration files or environment variables. However, it assumes the following directory structure:

- The script is located in the `rScribe` directory.
- The project root directory is one level above the `rScribe` directory.
- The `search-matrix/context-matrix.json` file is located in the `rMemory` directory, which is a sibling of the `rScribe` directory.

## Integration Points

The `start-search-matrix.sh` script is a key integration point within the rEngine Core platform. It interacts with the following components:

1. **rEngine Managed Code Platform (MCP)**: The search matrix built and maintained by this script is used by the rEngine MCP's `rapid_context_search` tool to provide efficient code navigation and documentation retrieval.
2. **rScribe Documentation System**: The search matrix serves as the foundation for the rScribe documentation system, enabling the automatic generation of function-level documentation.

## Troubleshooting

Here are some common issues and solutions related to the `start-search-matrix.sh` script:

### Node.js not found

If the script fails to find the `node` command, ensure that Node.js is installed and available in the system's PATH.

### Watcher process not running

If the script reports that the watcher process is not running, check the following:

1. Ensure that the `logs/watcher.pid` file exists and contains a valid process ID.
2. Use the `ps` command to verify if the process is still running.
3. If the process is not running, delete the `logs/watcher.pid` file and try starting the watcher again.

### Search matrix file not found

If the script reports that the `search-matrix/context-matrix.json` file is not found, ensure that the file exists in the expected location (one level above the `rScribe` directory, in the `rMemory` directory).

### Incorrect project root directory

If the script is unable to determine the correct project root directory, verify the directory structure and ensure that the `rScribe` directory is located as expected.

By understanding the purpose, functionality, and integration points of the `start-search-matrix.sh` script, you can effectively utilize and troubleshoot the rScribe search matrix management system within the rEngine Core platform.
