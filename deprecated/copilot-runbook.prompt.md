```prompt

# Agent Workflow Instructions

---

## Efficient Context Retrieval Strategies

- **Semantic Search First**: Use targeted 3-5 word queries instead of full memory dumps
- **Progressive Context**: Start with narrow search, expand only if needed
- **Query Examples**:
  - Technical: "build errors", "API security", "database migration"
  - Project: "sprint planning", "dependency update", "deployment issues"
  - Learning: "troubleshooting steps", "best practices", "architecture decisions"
- **Avoid Buffer Overflow**: 
  - **Never** use `read_graph` for general context (47+ entities = massive buffer)
  - **Always** use `semantic_search` with limit=3-5 for targeted retrieval
  - **Only** use `read_graph` when specifically examining the entire knowledge structure
- **Memory System Selection**:
  - **Memento**: Code relationships, project architecture, technical decisions
  - **PAM**: Conversation patterns, user preferences, session continuity

---

## Security Standards

- Run Codacy analysis after every file edit
- Fix critical/high issues before proceeding
- Record security decisions in both memory systems

---

## Versioning & Releases

- Follow SemVer and Keep a Changelog
- Update version numbers consistently across files
- Update roadmaps and changelogs
- Tag releases as `vX.Y.Z`
- Create release entities in knowledge graph

---

## Knowledge Graph Guidelines

- Create entities for major project components
- Establish relationships between code, documentation, and decisions
- Use proper entity types (person, organization, project, file, function, etc.)
- **Use semantic relationship types** instead of generic "relates to":
  - **DECISION**: For decision-making relationships
  - **ACTION**: For implementation/execution relationships  
  - **CONTEXT**: For contextual/background relationships
  - **QUESTION**: For inquiry/investigation relationships
  - **STATUS**: For state/condition relationships
  - **Custom types**: implements, depends_on, creates, manages, uses, etc.
- Include strength and confidence values for relationships (0.0-1.0)
- Apply temporal awareness for versioning relationships
- Leverage semantic search for related context

## Memory System Integration Protocol

- **Always Activate Tools First**: 
  - Use `activate_mcp_memento_entity_management` and related activation functions
  - Use `activate_persistent_ai_tools` for PAM memory functions
  - Use `activate_mem0_tools` for personality/behavioral memory (when available)
  - Only proceed with memory operations after successful activation
- **Verify Connections**: 
  - For Memento MCP: Use `semantic_search` with simple query to verify (avoid `read_graph`)
  - For PAM: Use `get_recent_conversation_context` to verify server connection
- **PAM Git Hook Integration (Expected Behavior)**:
  - PAM integration via `.githooks/pre-commit` and `scripts/save_persistent_memory.py` is **working correctly**
  - MCP direct calls in git hooks will fail (expected) - system uses JSON backup fallback
  - Warning messages about "MCP tool not available" are **normal and expected**
  - JSON backup files in `/tmp/` provide resilient storage for later PAM processing
  - This dual-path architecture (MCP direct + JSON fallback) is **intentional design**
- **Context Retrieval Best Practices**:
  - **Default to semantic search**: Use targeted queries for 90% of context needs
  - **Limit results**: Use limit=3-5 to prevent buffer overflow
  - **Reserve full reads**: Only use `read_graph` for comprehensive analysis tasks
  - **Smart querying**: Match query style to information need (technical terms for code, conversational for decisions)
- **Error Handling**:
  - If activation fails, retry once more before notifying user
  - If verification fails, notify user of connection issues immediately
  - Never attempt to use curl or direct HTTP calls as fallback
- **Tool Usage Sequence**:
  1. Activate appropriate tool category
  2. Verify connection with targeted semantic search (limit=1)
  3. Perform targeted context retrieval with semantic search
  4. Only use full reads for comprehensive analysis
- **Fallback Procedure**:
  - If memory systems are unreachable, continue with local context only
  - Document connection failure to address in future sessions
  - Do not attempt to implement alternative memory mechanisms

## Key Architecture Patterns

### Backend Architecture

- Monolithic Express server (`server.js`) handling both API and static file serving
- SQLite database with runtime schema evolution
- Core middleware: CORS, compression, JSON/form parsing (100MB limits), security headers
- File uploads handled via multer in `uploads/` directory
- PathValidator class for secure file operations

### Frontend Architecture

- Modular pattern with shared components (`scripts/shared/`), page-specific code (`scripts/pages/`), and utilities (`scripts/utils/`)
- Page initialization flow:
  1. Load shared components (e.g., `settings-modal.js`)
  2. Load page-specific code (e.g., `tickets.js`)
- Inter-module communication via `window.refreshPageData(type)` pattern

### Database Schema

- Located at `data/hextrackr.db`, initialized by `scripts/init-database.js`
- Key tables: tickets, vulnerabilities, vulnerability_imports
- Schema evolution happens at runtime with idempotent ALTERs
- JSON fields stored as strings (e.g., devices in tickets table)

## Critical Workflows

### Development Setup

- **NEVER** run node.js locally for this project, always run in Docker container

## Docker Configuration

- Uses `Dockerfile.node` (not the main `Dockerfile`)
- Single container setup on port 8080
- **Important:** Restart Docker container before running Playwright tests

### Testing Setup

## Playwright Testing

- Requires Docker container restart: `docker-compose restart`
- Browser automation tests need clean container state
- All tests run against `http://localhost:8080`

---
```

## Usage Instructions

- Pin this workflow in chat for every session as **basic protocol reminders**
- Use **semantic search for fast context retrieval** - avoid buffer-filling full reads
- Let targeted queries guide context gathering instead of comprehensive dumps
- Activate both memory system MCPs at start of session
- Focus on **speed and relevance** over exhaustive context loading
