# Agent Hello Workflow Documentation

## Purpose & Overview

The `agent-hello-workflow.js` script is a part of a larger system that provides an artificial intelligence (AI) agent with memory and context capabilities. This script is responsible for managing the initialization, status checking, and command-line interface (CLI) interactions of the agent's memory intelligence system.

The script is designed to ensure that the necessary memory-related components are available and functioning correctly, allowing the agent to access and manipulate its memory and context data. It provides methods for checking the status of the memory system, initializing the system, and displaying available memory-related commands.

## Technical Architecture

The `AgentHelloWorkflow` class is the main component of this script. It contains the following key properties and methods:

### Properties

- `memoryIntelligencePath`: The file path to the `memory-intelligence.js` module.
- `fastRecallPath`: The file path to the `recall.js` module.
- `addContextPath`: The file path to the `add-context.js` module.
- `extendedContextPath`: The file path to the `extendedcontext.json` file.
- `memorySystemStatus`: An object that tracks the availability of various memory system components.

### Methods

- `checkMemorySystemStatus()`: Checks the existence of the required memory system files and updates the `memorySystemStatus` object accordingly.
- `initializeMemorySystem()`: Logs the current status of the memory system and performs a quick memory test if all components are available.
- `showMemoryCommands()`: Displays the available memory-related commands and their usage examples.

The script also includes a CLI section that allows users to interact with the agent's memory system by running the script with different commands (e.g., `init`, `search`, `context`).

## Dependencies

The `agent-hello-workflow.js` script imports the following dependencies:

- `fs`: The Node.js file system module, used for checking the existence of memory system files.
- `child_process`: The Node.js child process module, used for executing a memory test command.
- `util`: The Node.js utility module, used for promisifying the `exec` function from the `child_process` module.

## Key Functions/Classes

### `AgentHelloWorkflow` Class

#### `checkMemorySystemStatus()`

- **Purpose**: Checks the existence of the required memory system files and updates the `memorySystemStatus` object accordingly.
- **Parameters**: None.
- **Return Value**: An object containing the status of each memory system component.

#### `initializeMemorySystem()`

- **Purpose**: Logs the current status of the memory system and performs a quick memory test if all components are available.
- **Parameters**: None.
- **Return Value**: A boolean indicating whether all memory system components are ready.

#### `showMemoryCommands()`

- **Purpose**: Displays the available memory-related commands and their usage examples.
- **Parameters**: None.
- **Return Value**: None.

## Usage Examples

To use the `AgentHelloWorkflow` class, you can create an instance of it and call the available methods:

```javascript
const workflow = new AgentHelloWorkflow();

// Check the memory system status
const status = workflow.checkMemorySystemStatus();
console.log(status);

// Initialize the memory system
const isReady = await workflow.initializeMemorySystem();
console.log(isReady);

// Display the available memory commands
workflow.showMemoryCommands();
```

You can also run the script from the command line with the following commands:

```bash

# Initialize the agent

node agent-hello-workflow.js init

# Search for a specific term in the memory

node agent-hello-workflow.js search "javascript bug"

# Display the detailed context

node agent-hello-workflow.js context
```

## Configuration

The `AgentHelloWorkflow` class requires the following configuration:

- `memoryIntelligencePath`: The file path to the `memory-intelligence.js` module.
- `fastRecallPath`: The file path to the `recall.js` module.
- `addContextPath`: The file path to the `add-context.js` module.
- `extendedContextPath`: The file path to the `extendedcontext.json` file.

These paths should be set correctly to ensure that the memory system components are properly recognized.

## Error Handling

The `AgentHelloWorkflow` class handles errors that occur during the memory system status check and the memory test execution. In case of errors, the script logs the error message and continues to operate, albeit with limited functionality.

## Integration

The `AgentHelloWorkflow` class is designed to be a part of a larger system that provides an AI agent with memory and context capabilities. It is responsible for managing the initialization and status of the memory system, allowing other components of the system to interact with the agent's memory and context data.

## Development Notes

- The script uses colored console logs to provide a better visual experience for the user.
- The `initializeMemorySystem()` method includes a quick memory test to ensure that the memory system is functioning correctly.
- The CLI usage section allows developers to interact with the agent's memory system directly from the command line.
- The script is designed to be modular and extensible, allowing for the addition of new memory-related features and components in the future.
