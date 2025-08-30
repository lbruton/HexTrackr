# Research Agent - Internet Access & Context7 Integration

## Purpose & Overview

The `research-agent-internet-context7.md` file describes a specialized research agent within the rEngine Core ecosystem. This agent is responsible for performing comprehensive internet-based research, web scraping, and integration with the Context7 MCP (Metadata Catalog Platform) to build knowledge bases and documentation resources.

The research agent serves as the "intelligence gathering" arm of the hybrid rEngine Core network, ensuring that the system has access to the most current and comprehensive information available on the internet. It can be leveraged by other primary agents to delegate research tasks and retrieve synthesized findings.

## Key Functions/Classes

The core functionality of the research agent is implemented in the `ResearchAgent` class, which includes the following key components:

### `WebScrapingEngine`

Handles the web scraping capabilities, allowing the agent to extract content from websites, documentation, and repositories.

### `Context7Client`

Provides integration with the Context7 MCP, enabling the agent to build comprehensive documentation databases, API reference collections, and code example libraries.

### `SharedMemory`

Manages the storage and retrieval of research findings, allowing the agent to maintain a persistent knowledge base that can be accessed by other agents in the network.

### `InformationSynthesis`

Responsible for combining and organizing the information gathered from multiple sources into coherent summaries and knowledge representations.

The `performResearch()` method is the main entry point for the research agent, where it takes a query, identifies relevant sources, gathers the information, synthesizes the findings, and stores the knowledge in the shared memory.

## Dependencies

The research agent relies on the following core dependencies:

1. **Web Scraping Engine**: Utilizes a web scraping engine, potentially Gemini, to access real-time data from the internet.
2. **Local Language Models**: Leverages local LLMs, such as Ollama, for data synthesis and organization.
3. **Large Language Models**: Integrates with more complex LLMs, like GPT, for deep analysis and cross-source verification.
4. **Context7 MCP**: Integrates with the Context7 Metadata Catalog Platform to build structured knowledge bases and documentation.
5. **Shared Memory System**: Stores the research findings and makes them accessible to other agents in the network.

## Usage Examples

The research agent can be initiated and used through the following command-line interface:

```bash

# Research Agent Commands

npm run research:start          # Initialize research agent
npm run research:web -- "query" # Web research task
npm run research:context7       # Build Context7 libraries
npm run research:synthesis      # Synthesize multi-source data
```

Additionally, the research agent can be called from other primary agents using the `delegateResearch()` function, which follows the agent handoff protocol:

```javascript
// Primary Agent → Research Agent Handoff
async function delegateResearch(query, context) {
  const handoff = {
    type: 'research_request',
    query: query,
    context: context,
    priority: 'background',
    expectedDuration: 'minutes',
    deliverables: ['summary', 'sources', 'knowledge_base']
  };
  
  return await researchAgent.acceptHandoff(handoff);
}
```

## Configuration

The research agent does not require any specific environment variables or configuration files. However, it may need to be configured with the appropriate API keys or credentials for the various dependencies it integrates with, such as the web scraping engine, language models, and Context7 MCP.

## Integration Points

The research agent is designed to integrate seamlessly with the broader rEngine Core ecosystem. It serves as a supporting component for other primary agents, providing them with the ability to delegate research tasks and access the accumulated knowledge base.

The key integration points include:

1. **Agent Handoff Protocol**: The research agent follows the defined handoff protocol to accept research requests from primary agents and return the synthesized findings.
2. **Shared Memory System**: The research agent stores its findings in the shared memory system, making them accessible to other agents in the network.
3. **Context7 MCP Integration**: The research agent utilizes the Context7 MCP to build structured knowledge bases, API references, and code example libraries.
4. **Multi-LLM Strategy**: The research agent orchestrates the use of different language models (Gemini, Ollama, GPT, Claude) to optimize the research process.

## Troubleshooting

Common issues and solutions related to the research agent:

1. **Web Scraping Failures**: If the web scraping engine is unable to extract data from a specific website or source, check the following:
   - Ensure that the web scraping engine has the necessary permissions and configurations to access the target websites.
   - Verify that the website's robots.txt file does not disallow the scraping activities.
   - Consider using different web scraping techniques or strategies to bypass any anti-scraping measures.

1. **Context7 Integration Issues**: If the research agent is unable to properly integrate with the Context7 MCP, check the following:
   - Verify the authentication credentials and permissions for the Context7 API.
   - Ensure that the Context7 client library is correctly configured and integrated with the research agent.
   - Review the Context7 documentation and API specifications to troubleshoot any integration-related problems.

1. **Shared Memory Errors**: If the research agent is experiencing issues with storing or retrieving data from the shared memory system, check the following:
   - Ensure that the shared memory system is properly configured and accessible to the research agent.
   - Verify that the research agent has the necessary permissions and access rights to interact with the shared memory.
   - Review the shared memory system's documentation and troubleshoot any potential issues with the underlying storage or retrieval mechanisms.

1. **Performance Bottlenecks**: If the research agent is experiencing performance issues or slow response times, consider the following:
   - Optimize the web scraping and data processing pipelines to reduce the overhead.
   - Investigate the usage of the various language models and their impact on overall performance.
   - Implement caching mechanisms to reduce the need for repeated API calls or data processing.
   - Ensure that the underlying infrastructure (e.g., compute resources, network bandwidth) is adequate to handle the research agent's workload.

By addressing these common issues, you can ensure that the research agent operates efficiently and provides the desired research capabilities within the rEngine Core ecosystem.
