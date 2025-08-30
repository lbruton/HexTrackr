# StackTrackr - Clean rX Plugin Architecture

## Project Structure

```
StackTrackr/                          # Main application (precious metals inventory)
├── index.html                        # Main app entry point
├── js/                              # Core application JavaScript
├── css/                             # Application styles
├── images/                          # Application assets
├── docs/                           # Project documentation
├── package.json                     # Main app dependencies
├── scripts/                         # Core app scripts only
└── README.md                        # Main project documentation

rEngine/                             # AI Engine Plugin
├── index.js                         # MCP server for VS Code Chat integration
├── package.json                     # Engine dependencies  
├── .env                            # API keys for AI providers
├── mcp-manager.sh                   # MCP server management
├── health-monitor.sh                # Auto-restart monitoring
└── test-*.js                       # Engine testing scripts

rMemory/                             # Memory Management Plugin
├── memory-scribe/                   # Real-time console monitoring
├── agents/                          # Shared team memory files
│   ├── memory.json                  # Primary memory storage
│   ├── functions.json               # Function registry
│   ├── decisions.json               # Decision tracking
│   ├── bootstrap-config.json        # Bootstrap protocol config
│   └── BOOTSTRAP_MEMORY_PROTOCOL.md # Memory protocol documentation
└── logs/                           # Memory system logs

rScribe/                             # Data Analysis & Benchmarking Plugin  
├── scripts/                         # AI benchmarking scripts
│   ├── heygpt, heygemini, heyclaude # AI interaction tools
│   ├── technical-audit.sh           # Technical auditing
│   ├── memory-review-benchmark.sh   # Memory system benchmarking
│   └── project-audit.sh            # Project analysis
├── benchmark_results/               # Audit and benchmark outputs
└── logs/                           # Analysis logs

rAgents/                             # Agent Documentation & Coordination
├── AGENTS.md                        # Agent system documentation
├── COPILOT_INSTRUCTIONS.md          # GitHub Copilot setup guide
├── handoff.md                       # Agent handoff protocols
├── output/                          # Agent analysis outputs
└── github_copilot_memories.json    # Agent coordination memory
```

## Plugin Responsibilities

### rEngine

- **Purpose**: AI collaboration and VS Code Chat integration
- **Key Features**: 5-tier AI system (Groq→Claude→ChatGPT→Gemini→Ollama)
- **Integration**: MCP server for VS Code Chat, conversation memory
- **Scribe Agent**: QwenCode 2.5 for code analysis and lookup tables

### rMemory  

- **Purpose**: Memory management and persistence
- **Key Features**: Real-time console monitoring, shared team memory
- **Integration**: MCP memory server, Memory Scribe dashboard
- **Protocol**: Bootstrap memory protocol for consistent agent behavior

### rScribe

- **Purpose**: Data analysis, benchmarking, and technical auditing
- **Key Features**: Multi-AI technical assessments, performance benchmarking
- **Integration**: AI provider APIs, automated audit reports
- **Output**: Technical reviews, performance metrics, audit trails

### rAgents

- **Purpose**: Agent coordination and documentation
- **Key Features**: Agent handoff protocols, shared documentation
- **Integration**: Cross-agent communication, instruction management
- **Memory**: Team coordination files and agent interaction logs

## Memory Hierarchy

1. **MCP Memory Server** (Primary) - Knowledge graph storage
2. **Local JSON Files** (Shared Team) - Cross-agent coordination  
3. **Personal JSON Files** (Agent-specific) - Individual agent context
4. **Automation Systems** (Background) - Console logging, extended context

## Bootstrap Protocol

All agents must follow the mandatory memory writing protocol:

- **Session Start**: Read MCP graph, create session entity, record objectives
- **During Work**: Update MCP memory every 3-5 actions with reasoning
- **Session End**: Summarize accomplishments, update shared files

## Quick Start

1. **Main App**: Open `index.html` for precious metals inventory
2. **AI Collaboration**: Use VS Code Chat with rEngine integration  
3. **Memory Access**: Check `rMemory/rAgentMemories/memory.json` for team state
4. **Analysis**: Run `rScribe/scripts/technical-audit.sh` for project review
5. **Documentation**: Reference `rAgents/AGENTS.md` for agent protocols

## Path Updates Applied

All references updated from old structure to new rX organization:

- `rEngineMCP/` → `rEngine/`
- `memory-scribe/` → `rMemory/memory-scribe/`
- `agents/` → `rMemory/rAgentMemories/`
- `benchmark_results/` → `rScribe/benchmark_results/`
- Documentation moved to `rAgents/`

This clean separation ensures plugins are properly organized while maintaining the core StackTrackr application in the root directory.
