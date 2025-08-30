# rAgents Version Management

## 🎯 Overview

The `rAgents` module is a critical component of the rEngine Core platform, providing the agentic layer for the StackTrackr application. It is responsible for managing AI agent coordination, memory management, and workflow automation within the larger rEngine ecosystem.

This `VERSION.md` file serves as the central documentation for tracking the versioning and capabilities of the `rAgents` module. It outlines the version structure, current feature set, and historical changes to ensure developers have a clear understanding of the evolution and state of the agentic layer.

## 📦 Version Structure

### Versioning Scheme

The `rAgents` module follows a standard semantic versioning scheme with the following guidelines:

- **Major (X.0.0)**: Fundamental architecture changes, breaking changes to agent APIs
- **Minor (X.Y.0)**: New features, agent capabilities, significant improvements
- **Patch (X.Y.Z)**: Bug fixes, optimizations, minor enhancements

### Current Version: `1.1.0`

## 🚀 Quick Commands

The `rAgents` module provides a set of command-line tools for managing the version and capabilities of the system:

```bash

# Show current status

node version-manager.js

# Bump version with description

node version-manager.js bump patch "Fixed memory search performance"
node version-manager.js bump minor "Added new agent coordination features"
node version-manager.js bump major "Complete memory system overhaul"

# View version history

node version-manager.js history

# Show current capabilities

node version-manager.js capabilities
```

## 🎯 Tracked Capabilities

The `rAgents` module provides a comprehensive set of features and capabilities, which are tracked and versioned over time. The current capabilities include:

### Memory System

- ✅ **Structured Format**: JSON-based memory with MCP fallback
- ✅ **Backup System**: Automated timestamped snapshots
- ✅ **MCP Integration**: Model Context Protocol support
- ✅ **Entity Management**: 17+ tracked entities across categories
- ✅ **Cross-session Persistence**: Maintains state between agent sessions

### Search Engine

- ✅ **In-Memory Index**: 100x faster than linear JSON parsing
- ✅ **CLI Interface**: Command-line search and exploration tools
- ✅ **Keyword Indexing**: 1,550+ searchable keywords
- ✅ **Relationship Traversal**: Instant entity connection discovery
- ✅ **Performance Optimized**: Sub-millisecond search results

### Agent Coordination

- ✅ **Agent Profiles**: Specialized capabilities for GPT-4, Claude, Gemini
- ✅ **Capabilities Matrix**: Task-to-agent assignment optimization
- ✅ **Task Assignment**: Automated task routing based on agent strengths
- ✅ **Workflow Protocols**: Standardized collaboration procedures

### Workflow Automation

- ✅ **Backup Scripts**: Automated memory and configuration backups
- ✅ **Export Workflows**: ChatGPT, Claude, and cross-platform sharing
- ✅ **Task Tracking**: JSON-based task and decision management
- ⚠️ **Sync Automation**: Partial implementation

### Export Collaboration

- ✅ **ChatGPT Export**: 7.2MB optimized bundles for LLM collaboration
- ✅ **Memory Change Bundles**: RFC-6902 patch format for return workflows
- ✅ **Cross-platform Sharing**: Compatible export formats
- ✅ **Return Processing**: Automated import of LLM responses

### Development Tools

- ✅ **Serverless Plugin**: Complete Phase 1 implementation with Docker
- ✅ **Docker Integration**: Development containers and permission management
- ✅ **Testing Framework**: Memory search validation and CLI testing
- ✅ **Debug Utilities**: Comprehensive debugging and logging tools

## 📊 Current Metrics

The `rAgents` module tracks various metrics to provide a holistic view of the system's state:

| Metric | Value |
| --- | --- |
| Memory Entities | 17 tracked entities |
| Memory Files | 41 JSON configuration files |
| Total Files | 309 managed files |
| Search Keywords | 1,550+ indexed terms |
| Agent Profiles | 5 specialized AI agents |
| Active Features | 29/30 capability features enabled |

## 🔄 Relationship to StackTrackr

### Independent Versioning

The `rAgents` module is versioned separately from the StackTrackr application to manage plugin-specific capabilities and improvements. The current versions are:

- **StackTrackr App**: `v3.04.87` (UI, inventory management, core features)
- **rAgents Plugin**: `v1.1.0` (AI coordination, memory, workflows)

### Compatibility Matrix

The `rAgents` module is designed to be compatible with specific versions of the StackTrackr application. The current compatibility matrix is as follows:

| StackTrackr | rAgents | Status |
| --- | --- | --- |
| >= 3.04.70 | >= 1.0.0 | ✅ Compatible |
| >= 3.04.80 | >= 1.1.0 | ✅ Enhanced |
| >= 3.05.00 | >= 2.0.0 | 🔮 Future |

### Integration Points

The `rAgents` module integrates with the StackTrackr application in the following ways:

- **Memory Coordination**: rAgents manages agent memory, StackTrackr manages app data
- **Export Workflows**: rAgents handles LLM collaboration exports
- **Development Tools**: rAgents provides agent-focused development utilities
- **Backup Systems**: Separate backup strategies for app vs. agent data

## 📚 Version History

The `rAgents` module has the following version history:

### v1.1.0 (2025-08-17)

**Minor Release** - Initial rAgents release with comprehensive agentic capabilities

## Capabilities:

- **memory system**: structured format, backup system, mcp integration, entity management, cross session persistence
- **search engine**: in memory index, cli interface, keyword indexing, relationship traversal, performance optimized
- **agent coordination**: agent profiles, capabilities matrix, task assignment, workflow protocols
- **workflow automation**: backup scripts, export workflows, task tracking
- **export collaboration**: chatgpt export, memory change bundles, cross platform sharing, return processing
- **development tools**: serverless plugin, docker integration, testing framework, debug utilities

### v1.0.0 (2025-08-16)

**Initial Version** - Base agentic system setup

## 🎯 Future Roadmap

The `rAgents` module has a roadmap for future enhancements and capabilities:

### v1.2.0 - Enhanced Search & Analytics

- Advanced search pattern learning
- Usage analytics and optimization suggestions
- Enhanced relationship inference
- Performance monitoring dashboard

### v1.3.0 - Advanced Agent Coordination

- Dynamic agent selection based on performance
- Multi-agent collaboration workflows
- Agent specialization refinement
- Cross-project coordination protocols

### v2.0.0 - Next Generation Architecture

- Real-time collaborative memory
- Advanced AI model integration
- Distributed agent networks
- Cloud-native deployment options

## 🔧 Development Integration

The `rAgents` module provides integration points for both agent development and plugin updates.

### For Agent Development

```javascript
import { RAgentsVersionManager } from './version-manager.js';

const versionManager = new RAgentsVersionManager();
const capabilities = await versionManager.detectCurrentCapabilities();

// Check if feature is available
if (capabilities.search_engine.in_memory_index) {
  // Use optimized search
} else {
  // Fallback to basic search
}
```

### For Plugin Updates

```bash

# After adding new agent capabilities

node version-manager.js bump minor "Added GPT-5 agent profile"

# After performance improvements  

node version-manager.js bump patch "Optimized memory search indexing"

# After major architecture changes

node version-manager.js bump major "Migrated to distributed agent network"
```

## 📝 Contribution Guidelines

### Version Bumping Rules

1. **Patch**: Bug fixes, performance improvements, minor feature additions
2. **Minor**: New agent capabilities, new workflow features, significant improvements
3. **Major**: Breaking changes to agent APIs, fundamental architecture changes

### Documentation Requirements

- Always include descriptive commit messages for version bumps
- Update capability detection when adding new features
- Maintain compatibility matrix with StackTrackr versions
- Document breaking changes in CHANGELOG.md

## 🎪 Plugin Architecture

The `rAgents` module operates as a **plugin layer** that enhances the StackTrackr application with AI capabilities. This separation allows for independent evolution, modular deployment, specialized versioning, and cross-project reuse.

```
┌─────────────────────────────────────────┐
│              StackTrackr App            │  v3.04.87
│         (Inventory Management)          │
├─────────────────────────────────────────┤
│              rAgents Plugin             │  v1.1.0
│           (AI Coordination)             │
├─────────────────────────────────────────┤
│           System Foundation             │
│      (Node.js, Browser, File System)   │
└─────────────────────────────────────────┘
```

This versioning system ensures clear tracking of when AI capabilities were added, improved, or modified, making it easier to understand the evolution of the agentic layer over time.
