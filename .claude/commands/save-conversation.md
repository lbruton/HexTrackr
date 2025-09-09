# Save Conversation Command

Saves the current conversation to Memento memory system for future reference.

## Usage
Type `/save-conversation` to preserve this entire conversation in the knowledge graph.

## What It Does
1. Creates a conversation entity with timestamp
2. Captures key insights and decisions from this session
3. Links to related project entities
4. Preserves context for future sessions

## Example Implementation
```javascript
await mcp__memento__create_entities({
  entities: [{
    name: `HEXTRACKR:CONVERSATION:${new Date().toISOString()}`,
    entityType: "PROJECT:SESSION:CONVERSATION",
    observations: [
      "Summary of key topics discussed",
      "Decisions made",
      "Problems solved",
      "Next steps identified"
    ]
  }]
});

// Link to current work
await mcp__memento__create_relations({
  relations: [{
    from: `HEXTRACKR:CONVERSATION:${timestamp}`,
    to: "HEXTRACKR:FEATURE:CurrentFeature",
    relationType: "DISCUSSES"
  }]
});
```

## Constitutional Compliance
- **Article VI**: Knowledge Management - Preserves institutional knowledge
- **Article I**: Links conversations to specifications when applicable
- **Article V**: Documents decisions and rationale