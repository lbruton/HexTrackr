# Distinguish Current vs Archived Context

When working with the memory system, it's critical to distinguish between current active project state and archived historical knowledge.

## Memory Categories

### **Current/Active Memory**

- `entityType`: decision, milestone, issue, project, etc.
- `tags`: project:HexTrackr, current, active
- **Purpose**: Inform current development decisions
- **Usage**: Day-to-day development context

### **Archived/Historical Memory**

- `entityType`: archived_decision, archived_knowledge, archived_issue, legacy_project
- `tags`: status:archived, project:[name]-legacy, migration_date:2025-08-29
- **Purpose**: Reference and learning from past work
- **Usage**: Understanding history, avoiding repeated mistakes

## Search Strategies

### Current Context Only

```javascript
mcp_memento_semantic_search({
    query: "authentication implementation",
    entity_types: ["decision", "milestone", "issue"]
    // No archived types - focuses on current state
})
```

### Historical Reference

```javascript
mcp_memento_semantic_search({
    query: "authentication approaches tried",
    entity_types: ["archived_decision", "archived_knowledge"]
    // Only archived types - focuses on past experience
})
```

### Comprehensive Search (Current + Historical)

```javascript
mcp_memento_semantic_search({
    query: "authentication patterns",
    // Include both current and archived types
})
```

## Guidelines

✅ **When to use archived memories:**

- Understanding why current architecture exists
- Learning from past mistakes or successes  
- Finding patterns across project history
- Documenting evolution of decisions

❌ **When NOT to use archived memories:**

- Current task planning
- Active bug tracking
- Current roadmap decisions
- Day-to-day development context

## Relationship Rules

- **Current → Current**: Normal relationships for active development
- **Archived → Archived**: Historical context and evolution
- **Archived → Current**: Only when documenting clear evolution or influence
- **Current → Archived**: Rare, only when explicitly referencing historical context

## Example Queries

## Good Current Context:

- "What's our current authentication approach?"
- "Active bugs in the ticket system"
- "Current deployment strategy"

## Good Historical Context:

- "What authentication approaches did we try before?"
- "Past performance optimizations and results"
- "Previous database migration experiences"

## Good Combined Context:

- "Evolution of our UI framework choices"
- "How our deployment strategy has changed"
- "Authentication security improvements over time"
