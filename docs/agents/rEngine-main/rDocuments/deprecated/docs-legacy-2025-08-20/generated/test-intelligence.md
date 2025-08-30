# rEngine Core: test-intelligence.js Documentation

## Purpose & Overview

The `test-intelligence.js` file is a part of the rEngine Core ecosystem and serves as a test script for the rEngineMCP Advanced Intelligence System. This script is responsible for loading and testing the agent database and the intelligent search capabilities of the rEngineMCP platform.

The main objectives of this script are:

1. Load the agent databases, including the function matrix, error patterns, project memory, and current tasks.
2. Provide an interface to test the intelligent search functionality by querying the function database.
3. Ensure the proper loading and functionality of the rEngineMCP intelligence system.

## Key Functions/Classes

The `test-intelligence.js` file contains the following key components:

### `IntelligenceTest` Class

The `IntelligenceTest` class is the main component of this script, responsible for the following tasks:

1. **Loading JSON Data**: The `loadJSON` method is used to load JSON data from various files, such as `functions.json`, `errors.json`, `memory.json`, `tasks.json`, and `github_copilot_memories.json`.
2. **Loading Agent Intelligence**: The `loadAgentIntelligence` method is responsible for loading the agent databases and displaying the results.
3. **Intelligent Search**: The `searchFunctionDatabase` method provides the functionality to search the function database based on a given query and return the top 5 relevant results.

### `runTest` Function

The `runTest` function is the entry point of the script, which creates an instance of the `IntelligenceTest` class, loads the agent intelligence, and then calls the `testIntelligentSearch` method to perform the search tests.

## Dependencies

The `test-intelligence.js` file depends on the following modules and libraries:

- `fs-extra`: A comprehensive file system library for Node.js that adds extra functionality to the built-in `fs` module.
- `path`: The built-in Node.js module for working with file and directory paths.
- `fileURLToPath`: A function from the built-in `url` module that converts a file URL to a file path.

## Usage Examples

To use the `test-intelligence.js` script, you can follow these steps:

1. Ensure that the necessary agent database files (`functions.json`, `errors.json`, `memory.json`, `tasks.json`, and `github_copilot_memories.json`) are present in the `rMemory/rAgentMemories` directory.
2. Run the script using Node.js:

   ```bash
   node test-intelligence.js
   ```

   This will execute the `runTest` function, which will load the agent intelligence and perform the intelligent search tests.

## Configuration

The `test-intelligence.js` script does not require any specific configuration. The agent database files are loaded from the `rMemory/rAgentMemories` directory, which is a fixed location within the rEngine Core ecosystem.

## Integration Points

The `test-intelligence.js` script is designed to test the rEngineMCP Advanced Intelligence System, which is a core component of the rEngine Core platform. This script can be used to ensure the proper functioning of the intelligence system and to validate the integration with other rEngine Core components that rely on the agent databases and intelligent search capabilities.

## Troubleshooting

If the agent database files are not found or there are any issues with loading the data, the script will display appropriate error messages. Here are some common issues and solutions:

1. **Missing Agent Database Files**:
   - Ensure that the `rMemory/rAgentMemories` directory contains the necessary JSON files (`functions.json`, `errors.json`, `memory.json`, `tasks.json`, and `github_copilot_memories.json`).
   - If any of the files are missing, the script will log an error message and indicate that the file was not found.

1. **Corrupted or Invalid JSON Data**:
   - Verify that the JSON data in the agent database files is properly formatted and valid.
   - If there are any issues with the JSON data, the script will log an error message indicating the problem.

1. **Insufficient Permissions**:
   - Ensure that the script has the necessary permissions to read the agent database files.
   - If the script is unable to access the files, it will log an error message about the permission issue.

If you encounter any other issues or need further assistance, please consult the rEngine Core documentation or reach out to the rEngine Core support team.
