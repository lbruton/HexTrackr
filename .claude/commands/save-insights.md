# Save Insights Command

This command saves current insights and discoveries to Memento memory system.

## Usage
Type `/save-insights` to preserve knowledge after completing tasks or discovering patterns.

## Example
```javascript
await mcp__memento__create_entities({
  entities: [{
    name: "HEXTRACKR:INSIGHT:[timestamp]",
    entityType: "PROJECT:KNOWLEDGE:INSIGHT",
    observations: [
      "Key insight from current work",
      "Pattern discovered",
      "Solution that worked"
    ]
  }]
});
```

## Constitutional Compliance
This satisfies Article VI: Knowledge Management - "ALWAYS save insights to Memento between tasks"