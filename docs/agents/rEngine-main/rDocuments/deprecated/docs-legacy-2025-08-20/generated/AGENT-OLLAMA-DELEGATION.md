# 🤖 Agent-to-Ollama Direct Communication Architecture

## Purpose & Overview

This file outlines the architecture and implementation details for the Agent-to-Ollama Direct Communication system, which enables cloud-based agents like GitHub Copilot and Claude to seamlessly delegate tasks to local Ollama models. This creates a hybrid intelligence network where the strengths of both cloud and local AI are combined, providing faster lookups, preserving privacy, and optimizing costs.

The key goals of this system are:

1. **Seamless Handoffs**: Agents can transparently delegate tasks to local Ollama models without interrupting the user's workflow.
2. **Instant Context**: Local Ollama models can provide immediate results for memory lookups, code analysis, and task routing, avoiding the latency of cloud API calls.
3. **Privacy Preservation**: Sensitive data, such as code and project-specific information, never leaves the user's machine, ensuring privacy.
4. **Hybrid Intelligence**: The combination of cloud-based reasoning and local processing creates a powerful hybrid intelligence system.
5. **Cost Optimization**: Reducing the need for cloud API calls leads to significant cost savings.

## Key Functions/Classes

The main components of the Agent-to-Ollama Direct Communication system are:

1. **`OllamaAgentBridge`**: This class is responsible for managing the communication between agents and the local Ollama models. It handles task delegation, builds prompts, and queries the appropriate Ollama model based on the task type.

1. **`AgentCommunications`**: This class manages the registration and communication with the various agents in the rEngine Core ecosystem. It receives delegation requests from agents and routes them to the `OllamaAgentBridge`.

1. **`delegation-server.js`**: This Express.js server provides the API endpoints for agents to communicate with the delegation system, allowing them to delegate tasks to the local Ollama models.

## Dependencies

The Agent-to-Ollama Direct Communication system depends on the following:

1. **Ollama Models**: The system requires the local installation of the recommended Ollama models, such as `llama3`, `qwen2.5-coder`, and `gemma2`, which are used for memory lookups, code analysis, and task routing, respectively.
2. **Express.js**: The delegation server is built using the Express.js web framework.
3. **Node.js**: The entire system is implemented in Node.js and requires a compatible runtime environment.

## Usage Examples

### Delegating a Memory Lookup

```javascript
// Within a cloud agent like GitHub Copilot
async function analyzeTableHoverBug() {
  const memoryResults = await fetch('http://localhost:3001/delegate/memory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'table hover css styling issues',
      agentId: 'github_copilot'
    })
  });

  // Now I have instant local analysis + memory context!
  return this.synthesizeSolution(memoryResults);
}
```

### Delegating Code Analysis

```javascript
// Within a cloud agent like Claude
async function explainInventorySearch() {
  const codeAnalysis = await fetch('http://localhost:3001/delegate/code', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filePath: 'js/search.js',
      agentId: 'claude'
    })
  });

  // Provide a comprehensive explanation of the search functionality
  return this.summarizeCodeAnalysis(codeAnalysis);
}
```

## Configuration

The Agent-to-Ollama Direct Communication system requires the following configuration:

1. **Ollama Models**: The system needs to be configured with the appropriate Ollama model endpoints and versions, which are defined in the `OllamaAgentBridge` class.
2. **Delegation Server Port**: The delegation server listens on port `3001` by default, but this can be changed in the `delegation-server.js` file.

## Integration Points

The Agent-to-Ollama Direct Communication system integrates with the following rEngine Core components:

1. **Cloud Agents**: Agents like GitHub Copilot and Claude can use the delegation system to offload tasks to the local Ollama models.
2. **VS Code Extension**: The rEngine Core VS Code extension can leverage the delegation system to provide local analysis and lookups to the user.
3. **rEngine Core API**: The delegation server exposes a set of API endpoints that can be consumed by other rEngine Core components.

## Troubleshooting

### Delegation Server Not Running

Ensure that the delegation server is running by executing the `npm run ollama:delegation:start` command. Check the server logs for any errors or issues.

### Ollama Models Not Found

Verify that the recommended Ollama models (`llama3`, `qwen2.5-coder`, and `gemma2`) are correctly installed and configured in the `OllamaAgentBridge` class.

### Connectivity Issues

Ensure that the cloud agents can successfully communicate with the delegation server running on `http://localhost:3001`. Check for any network-related issues or firewall configurations that might be blocking the connection.

### Unsupported Task Type

If an agent tries to delegate an unknown task type, the system will throw an error. Ensure that the agent is using the correct task types (`memory_search`, `code_analysis`, `task_routing`) when making delegation requests.
