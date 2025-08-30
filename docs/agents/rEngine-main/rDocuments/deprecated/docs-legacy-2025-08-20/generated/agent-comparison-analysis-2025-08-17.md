# rAgents: AI Agent Comparison Analysis

## Purpose & Overview

This file is part of the `rAgents` module within the rEngine Core ecosystem. It provides a comprehensive analysis and comparison of the various AI agents available for analyzing and assessing the quality of software codebases.

The primary purpose of this file is to:

1. Evaluate the strengths, specialties, and performance characteristics of each AI agent.
2. Establish a framework for selecting the most appropriate agent for different analysis tasks.
3. Provide guidance on how to integrate and utilize these AI agents within the rEngine Core platform.

By maintaining this detailed agent comparison, rEngine Core users can make informed decisions on which agent to leverage for their specific needs, ensuring they get the most accurate and actionable insights for their codebase.

## Key Functions/Classes

The main components in this file are:

1. **Agent Profiles**: Detailed information about each AI agent, including their priority, token limits, and specialized capabilities.
2. **Analysis Samples**: Examples of the type of analysis and findings provided by each agent.
3. **Comparison Matrix**: A tabular comparison of the agents' performance across key metrics like security focus, code quality, and actionability.
4. **Best Agent Recommendations**: Guidance on which agent is most suitable for different analysis tasks.
5. **Agent Querying Mechanism**: Instructions on how to programmatically request analysis from the various agents.

## Dependencies

This file is part of the `rAgents` module and relies on the following rEngine Core components:

- `analyze_with_ai` function: Used to trigger analysis requests for the different AI agents.
- `rEngineMCP` system: Provides the underlying infrastructure for managing and integrating the AI agents.

## Usage Examples

To request a codebase analysis from one of the AI agents, you can use the `analyze_with_ai` function provided by the rEngine Core platform:

```javascript
// To query a specific agent
analyze_with_ai({
  content: "StackTrackr codebase analysis",
  operation: "security_audit",
  provider: "groq" // or "claude", "openai", "gemini", "ollama"
});

// To automatically select the best agent
analyze_with_ai({
  content: "StackTrackr codebase analysis",
  operation: "security_audit"
});
```

The `analyze_with_ai` function will route the analysis request to the appropriate AI agent based on the specified parameters or the automatic agent selection process.

## Configuration

There are no environment variables or additional configuration required to use the functionality described in this file. The agent selection and integration is handled seamlessly by the rEngine Core platform.

## Integration Points

The `rAgents` module, and this file specifically, is a core component of the rEngine Core ecosystem. It integrates with the following parts of the platform:

1. **rEngineMCP**: Provides the underlying infrastructure for managing and communicating with the various AI agents.
2. **VS Code MCP Extension**: Exposes the `analyze_with_ai` function and agent selection capabilities within the Visual Studio Code development environment.
3. **Reporting & Dashboards**: The analysis results from the AI agents are integrated into the rEngine Core reporting and dashboard features.

## Troubleshooting

If you encounter any issues when using the AI agent analysis functionality, here are some common problems and solutions:

1. **Timeout Errors**: If an agent is taking too long to respond, you can try increasing the timeout threshold or manually selecting a different agent that may be more suitable for the task.
2. **Token Limit Reached**: If an agent's token limit is exceeded, you can either switch to a different agent with a higher token capacity or break down the analysis request into smaller, more manageable chunks.
3. **Inconsistent Results**: If you notice significant discrepancies in the analysis provided by different agents, you can cross-reference the findings and use the comparison matrix to determine the most reliable agent for the specific task.

If you continue to encounter problems, please refer to the rEngine Core documentation or reach out to the support team for further assistance.
