# rAgents/rVisions/agent-delegation-architecture.md

## Purpose & Overview

This file outlines the architecture and implementation details for the "Agent-to-Ollama Direct Communication" feature within the rEngine Core ecosystem. This feature enables cloud-based AI agents (like GitHub Copilot or Claude) to seamlessly delegate various tasks to local Ollama models, creating a hybrid intelligence system that combines the strengths of both cloud and local processing.

The key objectives of this architecture are:

1. **Seamless Handoffs**: Allowing agents to fluidly transition between cloud-based reasoning and local-based lookups without interrupting the user's workflow.
2. **Instant Context**: Providing agents with immediate access to memory, code analysis, and task routing information by leveraging the speed of local Ollama models.
3. **Privacy Preservation**: Ensuring that sensitive data, such as project code and memory content, never leaves the user's machine, addressing privacy concerns.
4. **Hybrid Intelligence**: Blending the capabilities of cloud-based agents (complex reasoning, large context) with the speed and efficiency of local Ollama models.
5. **Cost Optimization**: Reducing the reliance on cloud API calls and leveraging the free local processing power of Ollama, leading to significant cost savings.

## Key Functions/Classes

The main components of the agent-to-Ollama direct communication architecture are:

1. **OllamaAgentBridge**:
   - Responsible for managing the connection and delegation of tasks to the appropriate Ollama models.
   - Provides methods for delegating memory searches, code analysis, and task routing to the corresponding Ollama models.
   - Handles the communication with the Ollama models and returns the results to the requesting agent.

1. **AgentCommunications**:
   - Manages the registration and communication between the cloud-based agents and the local delegation server.
   - Receives delegation requests from agents and routes them to the OllamaAgentBridge for processing.
   - Maintains a registry of active agents and their capabilities.

1. **Delegation Server**:
   - An Express.js-based server that exposes API endpoints for agents to delegate tasks.
   - Handles incoming delegation requests and passes them to the AgentCommunications component for processing.
   - Sends the results back to the requesting agent.

## Dependencies

The agent-to-Ollama direct communication architecture depends on the following components:

1. **Ollama Models**: The local Ollama models (e.g., `llama3`, `qwen2.5-coder`, `gemma2`) that provide the necessary functionality for memory lookup, code analysis, and task routing.
2. **rEngine Core**: The overall rEngine Core platform that the agent-delegation system is integrated into.
3. **VS Code Extension**: An optional integration point that allows users to leverage the delegation system directly from their VS Code environment.
4. **GitHub Copilot (or other cloud-based agents)**: The cloud-based AI agents that can utilize the delegation system to enhance their capabilities.

## Usage Examples

### Cloud Agent Integration

Here's an example of how a cloud-based agent like GitHub Copilot could use the delegation system:

```javascript
// How I would use the delegation system
async function analyzeTableHoverBug() {
  // Instead of asking you to search manually...
  const memoryResults = await fetch('http://localhost:3001/delegate/memory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'table hover css styling issues',
      agentId: 'github_copilot'
    })
  });

  const codeAnalysis = await fetch('http://localhost:3001/delegate/code', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filePath: 'css/styles.css',
      agentId: 'github_copilot'
    })
  });

  // Now I have instant local analysis + memory context!
  return this.synthesizeSolution(memoryResults, codeAnalysis);
}
```

### VS Code Extension Integration

The agent-delegation system can also be integrated into a VS Code extension, allowing users to leverage the functionality directly from their IDE:

```javascript
// VS Code extension that enables agent delegation
vscode.commands.registerCommand('ragents.delegateToOllama', async (taskType, context) => {
  const result = await fetch('http://localhost:3001/delegate/' + taskType, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...context,
      agentId: 'vscode_extension'
    })
  });
  
  return result.json();
});
```

## Configuration

The agent-delegation system requires the following configuration:

1. **Ollama Models**: The user must have the recommended Ollama models (`llama3`, `qwen2.5-coder`, `gemma2`) installed and configured on their local machine.
2. **Delegation Server**: The delegation server runs on `http://localhost:3001` by default, but this can be configured by modifying the `rEngine/delegation-server.js` file.

## Integration Points

The agent-delegation architecture is a core component of the rEngine Core ecosystem, designed to integrate seamlessly with other rEngine Core features and components:

1. **rAgents**: The cloud-based AI agents, such as GitHub Copilot or Claude, can utilize the delegation system to enhance their capabilities and provide a more seamless user experience.
2. **rVisions**: The agent-delegation architecture is part of the rVisions component, which focuses on the hybrid intelligence capabilities of the rEngine Core platform.
3. **rEngine Core**: The delegation system is tightly integrated with the rEngine Core platform, leveraging its infrastructure and providing benefits to the overall ecosystem.

## Troubleshooting

## Issue: Delegation requests are failing

- Ensure that the Ollama models are properly installed and configured on the local machine.
- Verify that the delegation server is running and accessible at `http://localhost:3001`.
- Check the server logs for any error messages or issues with the delegation requests.

**Issue: Cloud agents are unable to communicate with the delegation server**

- Ensure that the cloud agents are correctly registered with the AgentCommunications component.
- Verify that the network configuration allows the cloud agents to access the local delegation server.
- Check the server logs for any issues with agent registration or communication.

## Issue: Performance issues with the delegation system

- Optimize the Ollama models for better response times.
- Implement caching mechanisms to reduce redundant lookups.
- Analyze the load distribution between cloud and local processing to identify bottlenecks.

If you encounter any other issues, please refer to the rEngine Core documentation or contact the rEngine Core support team for further assistance.
