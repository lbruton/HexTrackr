# rEngine Core: INTELLIGENCE_COMPLETE.md

## Purpose & Overview

The `INTELLIGENCE_COMPLETE.md` file provides a comprehensive overview of the advanced intelligence system integrated into the `rEngineMCP` (rEngine Multimodal Collaboration Platform). This system has transformed the basic Ollama chat interface into an "Advanced AI Collaboration Engine" with full workspace intelligence and agent database integration.

## Key Functions/Classes

The key components of the rEngine Core intelligence system include:

### Intelligent Code Search Matrix

- **Function Database**: Live function catalog with 3 categories (search_engine, data_management, ai_integration)
- **Error Pattern Recognition**: Known issue database for instant debugging
- **Smart Context**: Searches across function names, descriptions, files, and categories
- **Relevance Scoring**: Prioritizes most relevant matches for queries

### Agent Database Integration

- **Memory System**: 8 entity types loaded (projects, system_components, development_sessions, etc.)
- **Project Context**: Live project status, active tasks, critical issues
- **Conversation Memory**: Persistent session tracking with context preservation
- **Knowledge Persistence**: Automatically saves insights back to agent database

### Context-Aware Prompting

- **Domain Expertise**: Specialized prompts for search, data, architecture, and file management
- **Live Workspace Data**: Real-time file/function/issue references
- **Project Status Integration**: Current focus, active projects, and critical issues
- **Intelligent Suggestions**: Context-aware code recommendations

## Dependencies

The rEngine Core intelligence system relies on the following components:

1. **rEngineMCP**: The main Multimodal Collaboration Platform server, which has been enhanced with advanced intelligence capabilities.
2. **Agent Database**: A set of JSON files that store the function catalog, project memory, active tasks, known error patterns, and AI collaboration history.

## Usage Examples

Here are some examples of how to use the rEngine Core intelligence system:

```bash

# Status check with intelligence monitoring

./status-check.sh

# Test intelligence system directly  

node test-intelligence.js

# Restart with Mac Mini optimizations

./restart-rengine.sh
```

You can also interact with the intelligence system by asking questions about:

- Searching for functions
- Filtering data
- API integration
- Current project status
- Any development-related question

The system will provide enhanced responses based on the live workspace context and the agent database information.

## Configuration

The rEngine Core intelligence system does not require any additional configuration beyond the standard rEngineMCP setup. The agent database files are automatically loaded and integrated into the system.

## Integration Points

The rEngine Core intelligence system is tightly integrated with the following rEngine Core components:

1. **rEngineMCP**: The main server that hosts the advanced intelligence capabilities.
2. **Ollama**: The language model used for natural language processing and intelligent responses.
3. **VS Code MCP**: The Visual Studio Code extension that provides access to the rEngine Core tools, including the intelligence system.

## Troubleshooting

If you encounter any issues with the rEngine Core intelligence system, you can check the following:

1. **System Health Check**: Ensure that the `rEngineMCP` is running and the agent database files are loaded correctly.
2. **Logs**: Check the `rengine.log` file for any error messages or intelligence loading confirmations.
3. **Test Intelligence**: Run the `test-intelligence.js` script to verify the functionality of the different intelligence components.
4. **Restart rEngine**: Use the `restart-rengine.sh` script to restart the rEngineMCP with the latest intelligence updates.

If you continue to experience issues, please reach out to the rEngine Core support team for further assistance.
