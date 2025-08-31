# Memory System Integration

## Overview

HexTrackr now integrates with a **Persistent AI Memory** system that provides continuity across conversation sessions, enabling intelligent context preservation, decision tracking, and workflow optimization.

## Available Memory Tools

### Memory Management Tools

- **`create_memory`** - Create curated memory entries with importance levels, types, and tags
- **`update_memory`** - Update existing memory entries (content, importance, tags)  
- **`search_memories`** - Search memories using semantic similarity with filtering options

### Conversation Management

- **`store_conversation`** - Automatically store conversation content with roles and metadata
- **`get_recent_context`** - Retrieve recent conversation context by session

### Scheduling & Reminders

- **`create_appointment`** - Create appointments with dates, locations, and descriptions
- **`create_reminder`** - Create reminders with due dates and priority levels
- **`get_reminders`** - Get up to 5 active (uncompleted) reminders, sorted by due date

### AI Self-Reflection & Analytics

- **`get_ai_insights`** - Get AI self-reflection insights and patterns
- **`get_tool_usage_summary`** - Get AI tool usage summary and insights
- **`reflect_on_tool_usage`** - AI self-reflection on tool usage patterns and effectiveness

### System Management

- **`get_system_health`** - Get comprehensive system health, statistics, and database status

## Key Features

- **Semantic Search** - Find relevant memories based on meaning, not just keywords
- **Importance Levels** - Rank memories 1-10 for prioritization
- **Memory Types** - Categorize memories (safety, preference, skill, general, etc.)
- **Cross-Session Continuity** - Maintain context across different chat sessions
- **Database Filtering** - Search across conversations, AI memories, schedule, or all data
- **Self-Reflection** - AI can analyze its own tool usage patterns for improvement

## Memory Standards for HexTrackr

### Importance Levels

- **8-10**: Security issues, release blockers, critical decisions
- **5-7**: Feature work, bug fixes, routine changes
- **1-4**: Minor updates, documentation changes

### Required Tags

- Always include `["hextrackr"]` plus specific tags:
- `["security", "codacy", "release"]` for security-related work
- `["documentation", "portal"]` for documentation updates
- `["architecture", "decision"]` for architectural choices

### Memory Types

- **`security-issue`** - Security vulnerabilities and fixes
- **`project-status`** - Current project state and milestones
- **`user-preference`** - User coding standards and preferences
- **`architectural-decision`** - Technical design choices and rationale

## Integration with Development Workflow

### Agent Playbook Integration

The memory system is integrated into our 7-step agent playbook:

1. **observe** - Check reminders, search memories, get recent context
2. **plan** - Create memories for new work with proper importance and tags
3. **safeguards** - Store conversation state before major changes
4. **execute** - Apply changes incrementally
5. **verify** - Update memories if issues found or resolved
6. **map-update** - Update memories with decisions and outcomes
7. **log** - Store session summaries for major milestones

### Memory-First Philosophy

🧠 **Always check memory before file exploration**

- Memories contain context, decisions, and solutions from previous work
- Semantic search finds relevant information faster than folder navigation
- Previous solutions and patterns are preserved across sessions
- User preferences and project standards are maintained

## Usage Examples

### Creating Project Status Memory

```text
create_memory:

- content: "HexTrackr v1.0.3 release blocked by 4 critical Codacy security issues"
- importance_level: 9
- memory_type: "security-issue"
- tags: ["hextrackr", "security", "codacy", "release-blocker", "v1.0.3"]

```

### Setting Security Fix Reminder

```text
create_reminder:

- content: "Complete Generic Object Injection fix in docs-prototype/generate-docs.js"
- due_datetime: "2025-09-02T09:00:00Z"
- priority_level: 9

```

### Searching for Previous Solutions

```text
search_memories:

- query: "Codacy security vulnerability fixes Generic Object Injection"
- min_importance: 7
- memory_type: "security-issue"
- limit: 5

```

## Documentation and Resources

Detailed documentation for each memory tool is available in the `.prompts/` directory:

- Individual tool documentation with parameters, use cases, and examples
- Best practices for effective memory management
- Integration patterns for development workflows

## Benefits for HexTrackr Development

- **Continuity**: Resume work seamlessly across sessions
- **Context Preservation**: Never lose important decisions or insights
- **Pattern Recognition**: Learn from previous solutions and approaches
- **Quality Assurance**: Track security fixes and compliance requirements
- **Efficiency**: Memory-first approach reduces repetitive exploration
