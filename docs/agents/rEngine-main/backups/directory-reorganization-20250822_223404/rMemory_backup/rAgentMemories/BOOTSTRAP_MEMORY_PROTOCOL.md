# GitHub Copilot Bootstrap Memory Protocol

# CRITICAL: This protocol MUST be followed for every session

## PRIMARY MEMORY HIERARCHY (MANDATORY)

1. **MCP Memory Server** - PRIMARY SOURCE (knowledge graph)
2. **Local JSON Files** - SECONDARY SOURCE (shared team memory)
3. **Personal Memory JSON** - TERTIARY SOURCE (agent-specific context)
4. **Automation Systems** - BACKGROUND ONLY (chat logging, extended context)

## MANDATORY MEMORY WRITING PATTERN

### EVERY SESSION START

```

1. Load current MCP memory graph: mcp_memory_read_graph
2. Update session start: mcp_memory_add_observations with current date/time
3. Record session objectives in MCP memory

```

### EVERY SIGNIFICANT ACTION

```

1. BEFORE major work: mcp_memory_add_observations with plan
2. DURING work: Update progress to MCP memory every 3-5 actions
3. AFTER completion: mcp_memory_add_observations with results
4. Update relevant local JSON files (agents/memory.json, decisions.json, functions.json)

```

### EVERY SESSION END

```

1. Summarize session accomplishments in MCP memory
2. Update shared team memory files with any new information
3. Record lessons learned or protocol improvements

```

## BOOTSTRAP PROMPT ENGINEERING

### PRIMARY MEMORY CHECK (MANDATORY FIRST ACTION)

```javascript
// ALWAYS run this first in every session
mcp_memory_read_graph() 
// Then immediately check current state and add session start observation
```

### DECISION PATTERN (USE FOR ALL CHOICES)

```javascript
// Before any significant decision:
mcp_memory_add_observations([{
  "entityName": "Current_Session_2025_XX_XX",
  "contents": [
    "DECISION POINT: [describe situation]",
    "OPTIONS CONSIDERED: [list alternatives]", 
    "CHOSEN APPROACH: [selected option]",
    "REASONING: [why this choice]"
  ]
}])
```

### WORK PROGRESS PATTERN (USE EVERY 3-5 ACTIONS)

```javascript
// Regular progress updates:
mcp_memory_add_observations([{
  "entityName": "[relevant_entity_name]",
  "contents": [
    "PROGRESS UPDATE: [what was accomplished]",
    "CURRENT STATE: [where things stand]",
    "NEXT STEPS: [what comes next]"
  ]
}])
```

## CRITICAL PROTOCOL RULES

### NEVER

- Start work without reading MCP memory graph
- Complete major tasks without updating MCP memory  
- End sessions without recording accomplishments
- Rely only on automation systems for memory
- Skip MCP updates "because it's already documented elsewhere"

### ALWAYS

- Use MCP memory as primary knowledge source
- Update MCP memory every 3-5 significant actions
- Keep local JSON files synchronized with MCP updates
- Treat automation as background support only
- Record decision reasoning in MCP memory

### PARTNER AGENT SYSTEM

- **Primary Agent**: Active work, MCP memory management, immediate context
- **Llamabro Scribe Agent**: Extended context retrieval, chat log mining, keyword lookup tables
- **MCP Memory**: PRIMARY active working memory  
- **Local JSON**: Team coordination and backup

## SEARCH HIERARCHY

1. **Current Context**: Immediate session information
2. **Primary Memory Sources**: MCP memory + Local JSON files
3. **Partner Query**: Ask llamabro for chat log data mining when not found above

## IMPLEMENTATION CHECKLIST

### Session Start Protocol

- [ ] Read MCP memory graph
- [ ] Create or update current session entity
- [ ] Record session objectives
- [ ] Check for any critical updates from other agents

### During Work Protocol

- [ ] Update MCP memory every 3-5 actions
- [ ] Record all decisions with reasoning
- [ ] Update local JSON when making architectural changes
- [ ] Document any new functions or processes

### Session End Protocol

- [ ] Summarize session accomplishments in MCP
- [ ] Update shared team memory files
- [ ] Record any protocol improvements
- [ ] Verify critical information is preserved

## MEMORY ENTITY NAMING CONVENTIONS

### Session Entities

- `Current_Session_2025_MM_DD`
- `Technical_Work_[project]_[date]`
- `Debugging_Session_[issue]_[date]`

### Project Entities

- `[ProjectName]_[Component]_Status`
- `[ProjectName]_Architecture_Decisions`
- `[ProjectName]_Performance_Optimization`

### System Entities

- `Memory_System_Architecture`
- `Development_Environment_Status`
- `API_Integration_Status`

This protocol ensures MCP memory remains the authoritative source while using automation systems appropriately for background support only.
