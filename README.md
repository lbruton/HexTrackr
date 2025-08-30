# HexTrackr

## Advanced Cybersecurity Management Platform with AI-Powered Memory System

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/1ba09700c14c4926a696073a2f495189)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

**Last Updated**: August 30, 2025

HexTrackr is a sophisticated cybersecurity management platform featuring advanced AI memory capabilities, real-time vulnerability tracking, and intelligent agent collaboration systems. Built with Neo4j Enterprise, Memento MCP integration, and the innovative `.rMemory` architecture for perfect development continuity.

## 🧠 Advanced Memory Architecture

HexTrackr features a breakthrough **Perfect Continuity Memory System** that enables seamless AI collaboration where "every chat feels like we never stopped working together."

### Core Memory Components

- **Neo4j Enterprise Backend**: Graph database with 124+ entities and 26+ relationships
- **Memento MCP Integration**: VS Code-integrated memory operations via @gannonh/memento-mcp v0.3.9
- **`.rMemory` Pipeline**: Real-time chat monitoring, semantic analysis, and context preservation
- **Unified Knowledge Graph**: Development sessions, code analysis, chat history, and canonical notes

### Memory Pipeline Status

```bash

# Current operational status (August 30, 2025)

✅ Neo4j Enterprise 5.11 (Docker container: hextrackr-neo4j-dev)
✅ Memento MCP Server (124 entities, 26 relationships)
✅ embedding-indexer.js (PID 52143) - RUNNING
⚠️  memory-orchestrator.js - Ready to start
⚠️  realtime-chat-scribe.js - Ready to start
```

## 🚀 Core Features

### Cybersecurity Management

- **Ticket Tracking**: Advanced issue lifecycle management
- **Vulnerability Monitoring**: Real-time security assessment
- **Agent Coordination**: Multi-agent collaboration with memory persistence
- **Security Compliance**: Automated compliance tracking and reporting

### AI-Powered Development

- **Perfect Continuity**: Zero-context-loss development sessions
- **Frustration Prevention**: Learning from past pain points
- **Code Symbol Analysis**: 1,133 mapped symbols across codebase
- **Semantic Search**: Advanced knowledge graph traversal

### Enterprise Architecture

- **Multi-tenant Support**: SaaS-ready deployment model
- **Microservices Design**: Scalable container orchestration
- **Real-time Communication**: Event-driven agent coordination
- **Cloud Infrastructure**: Enterprise-grade scalability

## 📁 Project Structure

```
HexTrackr/
├── .rMemory/                   # AI Memory System
│   ├── core/                   # Processing scripts
│   ├── json/                   # Structured exports
│   └── docs/ops/              # Memory outputs
├── data/                       # SQLite database
├── docs/                       # Project documentation
│   ├── adr/                    # Architecture Decision Records
│   └── agents/                 # Agent memory backups
├── docs-source/                # Markdown documentation
├── docs-html/                  # Generated HTML docs
├── scripts/                    # Utility scripts
├── styles/                     # CSS frameworks
├── server.js                   # Main application server
└── docker-compose.dev.yml     # Development environment
```

## 🏗️ Technical Stack

### Backend Infrastructure

- **Node.js**: Primary runtime environment
- **Express**: Web application framework
- **SQLite3**: High-performance local database
- **Neo4j Enterprise**: Graph database for memory operations

### AI & Memory Systems

- **Anthropic Claude**: Advanced analysis and embeddings
- **Memento MCP**: VS Code memory integration
- **OpenAI Embeddings**: text-embedding-3-small (1536 dimensions)
- **Custom Pipeline**: `.rMemory` real-time processing

### Frontend & DevOps

- **Tabler Framework**: Modern UI components
- **Docker**: Containerized development environment
- **GitHub Actions**: CI/CD pipeline
- **Codacy**: Code quality and security analysis

## 🚦 Quick Start

### Development Environment

```bash

# Clone the repository

git clone https://github.com/Lonnie-Bruton/HexTrackr.git
cd HexTrackr

# Start Neo4j Enterprise container

docker-compose -f docker-compose.dev.yml up -d

# Install dependencies

npm install

# Initialize database

node scripts/init-database.js

# Start the server

npm start
```

### Memory System Activation

```bash

# Start memory pipeline components

node .rMemory/core/memory-orchestrator.js &
node .rMemory/core/realtime-chat-scribe.js &

# Verify memory system status

docker exec hextrackr-neo4j-dev cypher-shell -u neo4j -p qwerty1234 \
  "MATCH (n) RETURN count(n) as total_nodes"
```

## 📚 Documentation

### Architecture & Development

- **[Memory System](docs-source/development/memory-system.md)**: Perfect Continuity Architecture
- **[Architecture Overview](docs-source/architecture/index.md)**: System components and design
- **[ADR-0001](docs/adr/ADR-0001-memory-backend.md)**: Memory backend decisions
- **[ADR-0003](docs/adr/ADR-0003-claude-embeddings-rMemory-inspired.md)**: Claude embeddings strategy

### Operations & Memory

- **[Agent Playbooks](docs/ops/agent-playbook-v2-execution-log-2025-01-29.md)**: Operational procedures
- **[Memory Archaeology](docs/ops/HANDOFF-MEMORY-ARCHAEOLOGY-2025-08-29.md)**: Memory system restoration
- **[Agents Log](docs/ops/AGENTS_LOG.md)**: Development session records

## 🤝 Contributing

HexTrackr uses a memory-first development approach:

1. **📋 Observe**: Scan current context and identify key information
2. **🎯 Plan**: Design approach using available knowledge and tools
3. **🛡️ Safeguards**: Validate inputs, check constraints, ensure security
4. **⚡ Execute**: Implement solution with proper error handling
5. **✅ Verify**: Test functionality and validate results
6. **🧠 Map**: Update memory with new knowledge and relationships
7. **📝 Log**: Record decisions and outcomes for future reference

## 🔧 Memory System Features

### Entity Management

- **124 Active Entities**: Development sessions, canonical notes, chat sessions
- **Development Sessions**: 85 entities covering project evolution
- **Code Analysis**: Symbol mapping and architectural insights
- **Chat Evidence**: Clustered conversation data with quality scoring

### Relationship Mapping

- **26 Active Relationships**: Inter-entity connections and dependencies
- **Semantic Connections**: Context-aware relationship types
- **Temporal Tracking**: Version history and evolution patterns

### Advanced Capabilities

- **Semantic Search**: Context-aware knowledge retrieval
- **Frustration Learning**: Pattern recognition for issue prevention
- **Agent Handoffs**: Seamless context preservation across sessions
- **Real-time Monitoring**: Continuous pipeline processing

## 🌟 Key Achievements

- **Perfect Continuity**: Zero-context-loss development experience
- **Enterprise Migration**: Successful Neo4j Community → Enterprise transition
- **Memory Unification**: 110 original + 14 new entities without duplicates
- **Operational Pipeline**: Real-time chat monitoring and analysis
- **Security Integration**: Codacy compliance with automated analysis

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Memento MCP**: @gannonh for the foundational memory architecture
- **Anthropic**: Claude API for advanced analysis capabilities
- **Neo4j**: Enterprise graph database platform
- **VS Code**: MCP server integration and development environment
