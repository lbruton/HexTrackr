# rEngine MCP Tools Documentation

**Version:** 2.1.1  
**Date:** August 19, 2025  
**Component:** rEngine Platform  
**Priority:** P0 - Core Infrastructure  

## Overview

The rEngine Platform integrates Model Context Protocol (MCP) tools providing powerful automation capabilities for development workflow, documentation, and project management. This document details the complete MCP tool ecosystem available within the StackTrackr repository.

## MCP Tool Categories

### 🧠 Memory Management Tools

The MCP Memory system provides persistent project memory with sophisticated querying and management capabilities.

#### Core Memory Operations

- **`mcp_memory_read_graph`**: Retrieve complete project memory graph
- **`mcp_memory_create_entities`**: Create new memory entities with observations
- **`mcp_memory_add_observations`**: Add observations to existing entities
- **`mcp_memory_search_nodes`**: Search memory by keywords and patterns
- **`mcp_memory_open_nodes`**: Access specific entities by name
- **`mcp_memory_delete_entities`**: Remove entities and relations
- **`mcp_memory_create_relations`**: Establish entity relationships

#### Memory System Architecture

```
MCP Memory Server ↔ /agents/memory ↔ /rAgents/memory (sync)
```

**Memory Sync Pattern**: MCP server writes to `/agents/memory`, sync required to preserve in `/rAgents/memory` for version control.

**Current Status**: 31 entities recovered, fully operational memory system with project context, development history, and system architecture.

### 🌐 Playwright Browser Automation

Advanced browser automation capabilities for testing, monitoring, and interface interaction.

#### Navigation & Control

- **`mcp_playwright_browser_navigate`**: Navigate to URLs or local files
- **`mcp_playwright_browser_navigate_back/forward`**: Browser history navigation
- **`mcp_playwright_browser_click`**: Element interaction with permission system
- **`mcp_playwright_browser_type`**: Text input with submit options
- **`mcp_playwright_browser_select_option`**: Dropdown selection

#### Visual Documentation

- **`mcp_playwright_browser_take_screenshot`**: Full page or element screenshots
- **`mcp_playwright_browser_snapshot`**: Accessibility-based page snapshots
- **`mcp_playwright_browser_evaluate`**: JavaScript execution in browser context

#### Tab Management

- **`mcp_playwright_browser_tab_new/close/select/list`**: Multi-tab workflow management

**Example Usage**: Successfully navigated to `file:///Volumes/DATA/GitHub/rEngine/html-docs/developmentstatus.html` and captured dashboard screenshots.

### 🐙 GitHub Repository Management

Direct integration with GitHub API for repository operations and project management.

#### Release Management

- **`mcp_github_get_latest_release`**: Current release information
- **`mcp_github_list_releases`**: Release history and changelogs
- **`mcp_github_update_pull_request_branch`**: Branch synchronization

#### Team & Organization

- **`mcp_github_get_teams`**: Team membership information
- **`mcp_github_get_team_members`**: Team member lists
- **`mcp_github_list_issue_types`**: Repository issue configuration

**Current Repository**: lbruton/StackTrackr, Latest Release: v3.1.11 (August 8, 2025)

### 📚 Context7 Documentation System

Access to comprehensive library documentation and code examples.

#### Library Resolution

- **`mcp_context7_resolve-library-id`**: Find Context7-compatible library IDs
- **`mcp_context7_get-library-docs`**: Retrieve detailed documentation

**Available Libraries**: 39 JavaScript-related libraries including Node.js (14,444 snippets), LangChain (10,183 snippets), jQuery, Bootstrap, and specialized frameworks.

**Token Limits**: Default 10,000 tokens, configurable for different documentation depths.

## Integration with rEngine Platform

### Development Dashboard Integration

- **Dashboard URL**: `file:///Volumes/DATA/GitHub/rEngine/html-docs/developmentstatus.html`
- **Screenshot Location**: `.playwright-mcp/dashboard-current-state.png`
- **Live Monitoring**: Real-time dashboard state capture and analysis

### Memory-Driven Development

- **Session Continuity**: All MCP activities logged to persistent memory
- **Context Recovery**: Complete project context restoration from memory entities
- **Agent Handoffs**: Memory system enables seamless agent transitions

### Automation Workflows

- **Document Generation**: MCP tools integrated with rScribe and document sweep systems
- **Quality Assurance**: Automated testing and validation through Playwright
- **Repository Management**: Direct GitHub integration for release and issue tracking

## Operational Protocols

### Memory Management Protocol

1. **Startup**: Always read memory graph first (`mcp_memory_read_graph`)
2. **Session Logging**: Create entities for significant development sessions
3. **Context Preservation**: Add observations for important discoveries or changes
4. **Sync Requirements**: Ensure memory sync between MCP server and local storage

### Browser Automation Protocol

1. **Permission System**: Always provide human-readable element descriptions
2. **Screenshot Documentation**: Capture visual state before/after major changes
3. **Accessibility Focus**: Use snapshots for element interaction, screenshots for documentation

### GitHub Integration Protocol

1. **Release Tracking**: Monitor latest releases for version alignment
2. **Team Coordination**: Use team/member tools for collaboration workflows
3. **Repository State**: Regular checks for branch status and pull request updates

## Security & Access Control

### Authentication

- **GitHub**: Repository access via authenticated user credentials
- **MCP Memory**: Local file system access with sync protocols
- **Playwright**: Sandboxed browser environment with permission controls

### Data Privacy

- **Memory Storage**: Local file system with optional MCP server sync
- **Screenshot Storage**: Local `.playwright-mcp/` directory
- **Repository Access**: Limited to authenticated user's accessible repositories

## Troubleshooting

### Memory Issues

- **Sync Problems**: Run memory sync utility between `/agents/memory` and `/rAgents/memory`
- **Entity Not Found**: Create entity before adding observations
- **Large Memory**: Use search/filter tools for specific entity access

### Browser Automation Issues

- **Element Access**: Ensure proper element references from snapshots
- **Navigation Errors**: Check URL accessibility and network connectivity
- **Screenshot Failures**: Verify write permissions in `.playwright-mcp/` directory

### GitHub API Issues

- **Rate Limits**: Respect GitHub API rate limiting (5000 requests/hour)
- **Repository Access**: Verify repository permissions and authentication
- **Release Data**: Handle missing or incomplete release information gracefully

## Success Metrics

### Memory System Health

- ✅ **31 Entities Recovered**: Complete project context restoration
- ✅ **Session Continuity**: Successful agent handoffs and context preservation
- ✅ **Search Functionality**: Effective keyword-based memory retrieval

### Automation Capabilities

- ✅ **Dashboard Navigation**: Successfully loaded and captured rEngine dashboard
- ✅ **Visual Documentation**: Full-page screenshots and accessibility snapshots
- ✅ **Repository Integration**: Latest release tracking and changelog access

### Documentation Access

- ✅ **Library Resolution**: JavaScript ecosystem documentation availability
- ✅ **Code Examples**: Thousands of code snippets across popular frameworks
- ✅ **Context-Aware Help**: Relevant documentation for development tasks

## Future Enhancements

### Planned Integrations

- **Auto-Documentation Triggers**: Memory scribe integration with document generation
- **Advanced Repository Management**: Pull request and issue automation
- **Enhanced Browser Testing**: Automated UI testing and validation workflows

### Performance Optimizations

- **Memory Compression**: Rolling context window system for large memory graphs
- **Batch Operations**: Multi-entity memory operations for efficiency
- **Cached Documentation**: Local documentation caching for faster access

---

**Last Updated**: August 19, 2025  
**Next Review**: August 26, 2025  
**Maintainer**: rEngine Platform Team  
**Status**: ✅ Operational - All MCP tool categories verified functional
