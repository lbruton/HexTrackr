# Handoff Command

Prepare context for transitioning work between AI assistants or team members.

## Usage
Type `/handoff` to generate a comprehensive context package for the next person/AI taking over.

## What It Generates

### 1. Current State Summary
```javascript
// Check active specification
const activeSpec = await Bash("cat .active-spec");

// Get pending tasks
const pendingTasks = await Bash("grep '\\[ \\]' hextrackr-specs/specs/$(cat .active-spec)/tasks.md");

// Git status
const gitStatus = await Bash("git status --short");
```

### 2. Memory Context Package
```javascript
// Save current session insights
await mcp__memento__create_entities({
  entities: [{
    name: `HEXTRACKR:HANDOFF:${Date.now()}`,
    entityType: "PROJECT:TRANSITION:HANDOFF",
    observations: [
      `Active spec: ${activeSpec}`,
      `Pending tasks: ${pendingTaskCount}`,
      `Current branch: ${branch}`,
      `Modified files: ${modifiedFiles}`,
      "Work completed in this session",
      "Known blockers or issues",
      "Next recommended steps"
    ]
  }]
});

// Get relevant context
const context = await mcp__memento__search_nodes({
  mode: "semantic",
  query: `${activeSpec} current work patterns decisions`,
  topK: 10
});
```

### 3. Handoff Report Format
```markdown
## Handoff Context - [Timestamp]

### Active Work
- **Specification**: [active-spec]
- **Branch**: [current-branch]
- **Tasks Remaining**: X of Y

### Session Summary
- Work completed
- Decisions made
- Patterns discovered
- Issues encountered

### Environment Status
- Docker: [running/stopped]
- Tests: [passing/failing]
- Lint: [clean/issues]

### Next Steps
1. [Specific next task]
2. [Known blockers]
3. [Recommendations]

### Relevant Memory Entities
[Top relevant patterns and solutions from Memento]

### Constitutional Reminders
- Article I: Check spec alignment
- Article VI: Save new insights
```

## Handoff Types

### Quick Handoff
Basic state for short breaks:
```bash
/handoff quick
```

### Full Handoff
Complete context for new person:
```bash
/handoff full
```

### AI-to-AI Handoff
Optimized for AI assistant transitions:
```bash
/handoff ai
```
Includes:
- MCP tool configurations
- Active command snippets
- Constitutional compliance state

## Constitutional Compliance
- **Article VI**: Preserves knowledge for next session
- **Article V**: Documents current state
- **Article III**: Maintains task continuity

## Integration Points
- Works with `/save-conversation` for session preservation
- Links to active specifications
- References constitutional requirements
- Maintains git checkpoint discipline