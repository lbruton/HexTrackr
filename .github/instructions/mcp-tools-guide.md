# MCP Tools Guide

## Model Context Protocol (MCP) Integration

HexTrackr integrates with multiple MCP servers to provide specialized capabilities. This guide covers efficient usage patterns for available MCP tools.

## Core MCP Categories

### FileScopeMCP - File Analysis & Architecture

The FileScopeMCP server is a critical component for code analysis and architecture visualization. It provides real-time insights into project structure, dependencies, and file relationships.

#### Server Configuration

```json
"filescope": {
  "command": "node",
  "args": [
    "/Volumes/DATA/GitHub/FileScopeMCP-evaluation/dist/mcp-server.js",
    "--base-dir=/Volumes/DATA/GitHub/HexTrackr"
  ],
  "type": "stdio"
}
```

#### Key Features

- **File Importance Scoring**: Automatically assigns importance scores (0-10) to files based on:
  - Dependency relationships
  - Import frequency
  - Code complexity
  - File size and change frequency

- **Dependency Analysis**:
  - Maps file interdependencies
  - Tracks package dependencies
  - Identifies circular dependencies
  - Shows dependent and dependency relationships

- **Project Structure Analysis**:
  - Real-time directory structure mapping
  - File categorization
  - Architecture visualization
  - Component relationship tracking

#### Manual Server Management

If the FileScopeMCP server needs to be started manually:

```bash
node /Volumes/DATA/GitHub/FileScopeMCP-evaluation/dist/mcp-server.js --base-dir=/Volumes/DATA/GitHub/HexTrackr
```

Verify server status:

```bash
ps aux | grep "[m]cp-server"
```

#### Best Practices

- Keep the server running for real-time analysis
- Check server status if file analysis features are unavailable
- Use file importance scores for prioritizing reviews
- Reference dependency maps when making architectural decisions

#### Available Tools

- **set_project_path**: Initialize FileScopeMCP with project directory
- **get_file_importance**: Retrieve importance score (0-10) for specific files
- **get_dependency_map**: Analyze file dependencies and relationships
- **generate_architecture_diagram**: Create Mermaid visualization of project structure
- **scan_directory**: Analyze directory structure and file relationships
- **get_file_summary**: Generate summary of critical file components

### Persistent AI Memory Tools

- **get_recent_context**: Session initialization and context recovery
- **search_memories**: Semantic search for previous solutions
- **create_memory**: Document decisions and store conversations
- **get_reminders**: Check active tasks and deadlines
- **create_reminder**: Set time-sensitive task reminders
- **store_conversation**: Archive important conversation milestones
- **update_memory**: Modify existing memory entries

### Code Quality & Security (Codacy MCP)

- **codacy_cli_analyze**: Local code quality analysis (MANDATORY after edits)
- **codacy_get_repository_with_analysis**: Current quality metrics
- **codacy_list_files**: File-specific analysis and coverage data
- **codacy_get_file_with_analysis**: Detailed file metrics

### GitHub Integration (GitHub MCP)

- **github_create_issue**: Create GitHub issues for tracking
- **github_create_pull_request**: Automated PR creation
- **github_list_releases**: Version management and release tracking
- **github_get_repository**: Repository information and status

### Documentation & Research (Multiple MCPs)

- **microsoft_docs_search**: Microsoft/Azure documentation lookup
- **context7_get_library_docs**: Library documentation retrieval
- **huggingface_search_models**: ML model discovery and selection
- **deepwiki_ask_question**: GitHub repository documentation queries

### Web Automation (Playwright & Firecrawl MCPs)

- **playwright_navigate**: Browser automation for testing
- **firecrawl_scrape**: Web content extraction
- **firecrawl_search**: Multi-site information gathering

## HexTrackr-Specific MCP Patterns

### Required Configuration Parameters

```yaml

# Codacy Tools

provider: gh
organization: Lonnie-Bruton
repository: HexTrackr
rootPath: /Volumes/DATA/GitHub/HexTrackr

# GitHub Tools  

owner: Lonnie-Bruton
repo: HexTrackr
```

### Mandatory Security Workflow

1. **After file edits**: `codacy_cli_analyze` with edited file path
2. **After dependency changes**: `codacy_cli_analyze` with `tool: trivy`
3. **Before releases**: Full repository analysis for security compliance

### Memory Integration Pattern

1. **Session Start**: `get_recent_context` + `search_memories`
2. **Decision Points**: `create_memory` with importance 6-8
3. **Security Issues**: `create_memory` with importance 8-10
4. **Session End**: `store_conversation` at milestones

## Efficient Usage Patterns

### Code Quality Analysis

```bash

# After editing specific file

codacy_cli_analyze --file=path/to/edited/file

# Security scan after dependency updates  

codacy_cli_analyze --tool=trivy

# Full project analysis

codacy_cli_analyze
```

### Memory Operations

```bash

# Initialize session context

get_recent_context

# Find previous solutions

search_memories --query="similar problem description"

# Document important decisions

create_memory --type="architectural-decision" --importance=7
```

### GitHub Integration

```bash

# Create tracking issue

github_create_issue --title="Security Fix: Description" --labels=["security"]

# Check release status

github_list_releases --owner=Lonnie-Bruton --repo=HexTrackr
```

### Documentation Research

```bash

# Find specific library docs

context7_resolve_library_id --libraryName="express"
context7_get_library_docs --context7CompatibleLibraryID="/expressjs/express"

# Microsoft documentation

microsoft_docs_search --query="Azure security best practices"
```

## Tool Selection Guidelines

### When to Use Specific MCPs

**Codacy MCP**:

- After any file modification (MANDATORY)
- Security vulnerability scanning
- Code quality metrics tracking

**GitHub MCP**:

- Issue tracking and project management
- Release management and versioning
- Repository information queries

**Memory MCP**:

- Session initialization and recovery
- Decision documentation
- Context preservation across conversations

**Documentation MCPs**:

- Library/framework research
- Technical documentation lookup
- Best practices discovery

**Web Automation MCPs**:

- Testing automation
- Content extraction for research
- Multi-source information gathering

## Error Handling Patterns

### Common MCP Issues

1. **404 Repository Errors**: Use `codacy_setup_repository` if available
2. **Permission Issues**: Verify organization access and MCP settings
3. **Tool Unavailable**: Check MCP server status and restart if needed

### Troubleshooting Steps

1. Reset MCP connection in VS Code
2. Verify GitHub Copilot MCP settings
3. Check organization permissions
4. Contact MCP server support if persistent issues

## Performance Optimization

### Efficient Tool Usage

- **Batch Operations**: Group related MCP calls when possible
- **Targeted Analysis**: Use file-specific analysis instead of full scans
- **Context Reuse**: Leverage memory system to avoid redundant lookups
- **Selective Loading**: Only activate MCP categories when needed

### Token Management

- Use MCP tools for detailed research instead of lengthy explanations
- Cache important information in memory system
- Prefer specific tool calls over general queries
- Leverage specialized documentation MCPs for technical details
