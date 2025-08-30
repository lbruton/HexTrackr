# Interactive Agent Menu

## Purpose & Overview

The `interactive-agent-menu.js` file provides an interactive command-line interface (CLI) for the agent memory system in the rEngine Core platform. It allows users to:

1. Continue their previous work context.
2. Start a fresh session while retaining access to previous memories.
3. View a detailed summary of the current context and memories.
4. Search through the agent's memories and knowledge base.

This interface is designed to give developers and users a seamless way to interact with the agent's memory system, enabling them to efficiently manage their development tasks and access relevant information.

## Key Functions/Classes

1. **`InteractiveAgentMenu` Class**:
   - Responsible for managing the interactive menu and processing user input.
   - Initializes the `AgentHelloWorkflow` instance and sets up the readline interface.
   - Implements the `start()` method to display the main menu and prompt the user for input.
   - Handles user input through the `processInput()` method, which routes the user's choices to the appropriate actions.
   - Provides methods to display detailed context, search memories, and handle common commands (e.g., "exit", "quit").

1. **`AgentHelloWorkflow` Class**:
   - This class is not shown in the provided code, but it is likely responsible for initializing the agent, managing the agent's memory and knowledge base, and providing methods to interact with the agent's capabilities.

## Dependencies

The `interactive-agent-menu.js` file depends on the following modules:

1. `readline`: Node.js built-in module for creating a readline interface for user input.
2. `./agent-hello-workflow.js`: A custom module that provides the `AgentHelloWorkflow` class, which is responsible for managing the agent's memory and knowledge base.

## Usage Examples

To use the Interactive Agent Menu, follow these steps:

1. Ensure that the `rEngine/interactive-agent-menu.js` file is part of your rEngine Core project.
2. Run the file using Node.js:

   ```bash
   node rEngine/interactive-agent-menu.js
   ```

1. The interactive menu will be displayed, and you can follow the on-screen instructions to interact with the agent's memory system.

Example usage:

```
🧠 Interactive Agent Menu

➤ Enter your choice (1-4) or type your request: 3

📊 Generating detailed context summary...
[Detailed context information displayed]

Press Enter to return to main menu, or type 'exit' to quit...

🧠 Interactive Agent Menu

➤ Enter your choice (1-4) or type your request: 4

🔍 Memory search mode activated...
🔍 Enter search query: machine learning

🔍 Searching for: "machine learning"
✅ Found 3 results

📋 Handoff Results:

1. Discussed strategies for applying machine learning to optimize...
2. Reviewed the latest advancements in deep learning algorithms for...
3. Brainstormed ideas for implementing a machine learning-based...

📚 Knowledge Results:

1. Machine Learning: The study of computer algorithms that improve automatically through experience.
2. Deep Learning: A subset of machine learning inspired by the structure and function of the brain.
3. Supervised Learning: A machine learning technique where the algorithm is trained on labeled data.

Press Enter to continue...
```

## Configuration

The `interactive-agent-menu.js` file does not require any specific configuration or environment variables. It relies on the `AgentHelloWorkflow` class, which may have its own configuration requirements.

## Integration Points

The `interactive-agent-menu.js` file is a part of the rEngine Core platform and is designed to integrate with the following components:

1. **Agent Memory System**: The file interacts with the agent's memory system, which is managed by the `AgentHelloWorkflow` class, to provide users with access to their previous work context, memories, and knowledge base.
2. **rEngine Core**: The interactive menu is a user-facing interface that allows developers and users to interact with the rEngine Core platform and its agent-based features.

## Troubleshooting

1. **Error loading detailed context**: If the `showDetailedContext()` method encounters an error, it will log the error message to the console. This could be due to issues with the `AgentHelloWorkflow` class or the agent's memory system.

1. **Search failure**: If the `searchMemories()` method encounters an error, it will log the error message to the console. This could be due to issues with the agent's memory or knowledge base, or with the search functionality.

1. **Readline interface issues**: If you encounter any issues with the readline interface, such as problems with input/output or closing the interface, you may need to investigate the underlying Node.js readline module documentation and troubleshoot accordingly.

In case of any issues, you can try the following steps:

1. Check the logs for any error messages or clues about the problem.
2. Ensure that the `AgentHelloWorkflow` class and its dependencies are functioning correctly.
3. Verify that the agent's memory and knowledge base are properly initialized and accessible.
4. Review the Node.js readline module documentation for any specific issues related to the interactive interface.
5. If the problem persists, you may need to consult the rEngine Core documentation or reach out to the development team for further assistance.
