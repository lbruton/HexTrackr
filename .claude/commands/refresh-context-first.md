Refresh Claude's workflow context before processing user request: $ARGUMENTS

**Context Reminder:**
- **Search First**: Use `mcp__memento__search_nodes` for existing patterns/solutions  
- **Core Workflow**: Search → Plan (TodoWrite) → Execute → Save (Memento)
- **Memory Tools**: `mcp__memento__search_nodes`, `mcp__memento__create_entities`, `mcp__memento__create_relations`
- **Reference Files**: ~/.claude/CLAUDE.md (universal) + project/CLAUDE.md (specific)
- **Classification**: Use PROJECT:DOMAIN:TYPE pattern for new entities
- **Follow Instructions**: Adhere to established patterns and user preferences

Now process the user's request: $ARGUMENTS