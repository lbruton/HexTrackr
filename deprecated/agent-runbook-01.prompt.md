# Agent Runbook: Dual Memory System

## 7-Step Turn Loop

### 1. observe

- **CHECK CONTEXT FIRST**: Analyze if the answer exists in the current conversation context
- If not in context, **ACCESS TIERED MEMORY**:
  1. Check active reminders via `get_reminders` for pending tasks
  2. Query Memento MCP via `semantic_search` for structured knowledge
     - Use tags: `project:${current_project}` and topic-specific tags
  1. Query persistent-ai-memory via `search_memories` only if needed for:
     - Conversation history (use: `type:conversation`)
     - Git commit summaries (use: `type:git-commit`)
  1. Get recent context via `get_recent_context` if continuing previous work
- **TRACK MEMORY SOURCE** with each retrieved item: `[MEMENTO]` or `[PAM]` prefix

### 2. plan

- Produce a short actionable checklist tied to requirements
- Identify files to change and expected outputs
- **CREATE STRUCTURED MEMORIES** for new concepts:
  - Technical concepts → Memento MCP via `create_entities` with relevant relations
  - Conversational notes → persistent-ai-memory via `create_memory`

### 3. safeguards

- Make a pre-flight commit to snapshot baseline
- Note roll-back strategy
- Store conversation state via `store_conversation` before major changes
- **BACKUP CRITICAL KNOWLEDGE** to both systems for redundancy

### 4. execute

- Apply the smallest changes needed
- After each file edit, run Codacy CLI analysis for the edited file
- Prefer incremental, verifiable steps

### 5. verify

- Run linters and tests
- Perform a small smoke test where applicable
- Fix issues before proceeding

### 6. map-update

- **DUAL MEMORY UPDATE**:
  - Technical knowledge → Memento via `add_observations` and `create_relations`
  - Conversation context → persistent-ai-memory via `update_memory`
- Create reminders via `create_reminder` for time-sensitive tasks

### 7. log

- Store structured knowledge in Memento MCP for:
  - Entity relationships
  - Code structure
  - Technical decisions with reasons
- Store conversation logs in persistent-ai-memory for:
  - Chat history
  - Git commit summaries
  - User preferences
- Update project roadmap (`roadmaps/ROADMAP.md`) with progress

## Context-First, Memory-Optimized Philosophy

🧠 **Check context first, then query the right memory system**

- **Context is king**: Use what's already in the conversation before memory lookup
- **Know your memory systems**:
  - **Memento MCP**: For structured knowledge, technical concepts, relationships between code components
  - **persistent-ai-memory**: For conversation history, git commit logs, chronological project history
- **Cross-reference memories**: Link information between systems with consistent entity IDs
- **Optimize token usage**: Fetch only what's needed, in the right order:
  1. Check context window first
  2. Use semantic search in Memento for targeted knowledge
  3. Fall back to persistent-ai-memory for historical context

## Memory Taxonomy

| Knowledge Type | Storage System | Query Method | When to Use |
|---------------|---------------|-------------|------------|
| Code structure | Memento MCP | `semantic_search` with `type:code-component` | Understanding architecture |
| Technical decisions | Memento MCP | `semantic_search` with `type:decision` | Retrieving rationale |
| User preferences | Memento MCP | `open_nodes` with user ID | Personalizing responses |
| Conversation history | persistent-ai-memory | `search_memories` with `type:conversation` | Getting chat context |
| Git commits | persistent-ai-memory | `search_memories` with `type:git-commit` | Understanding changes |
| Project timelines | persistent-ai-memory | `get_memories_by_date` | Tracking progress |
