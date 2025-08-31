# Memory Workflow Instructions

## Persistent AI Memory Integration (DETAILED)

HexTrackr uses a persistent AI memory system to maintain context across sessions and ensure project continuity. The following memory practices are REQUIRED:

## Session Initialization

- **ALWAYS** check recent context at the start of any session: `get_recent_context`
- **SEARCH** for relevant memories when resuming work: `search_memories`
- **REVIEW** active reminders for pending tasks: `get_reminders`

## Memory Creation (CRITICAL)

- **CREATE MEMORY** for all significant project decisions and status changes
- **STORE CONVERSATIONS** at key decision points and milestone achievements
- **SET REMINDERS** for time-sensitive tasks and security fixes
- **CREATE APPOINTMENTS** for planned releases and important deadlines

## Memory Management Standards

- Use **importance levels 8-10** for security issues and release blockers
- Tag memories with **project-specific tags**: ["hextrackr", "security", "codacy", "release"]
- Use **memory types**: "security-issue", "project-status", "user-preference", "architectural-decision"
- **UPDATE MEMORIES** when status changes (e.g., issues resolved, milestones completed)

## Required Memory Events

1. **After any security fix**: Update memory with resolution status
2. **After Codacy analysis**: Store results and remaining issues count
3. **At sprint completion**: Document achievements and next priorities
4. **Before context switches**: Store current state and next steps
5. **After critical decisions**: Record rationale and chosen approach

## Memory Tool Integration

- Memory tools available in `.prompts/` directory with full documentation
- Use semantic search to find previous solutions to similar problems
- Maintain audit trail of all security-related decisions and implementations
- Store user preferences and coding standards for consistency

## Memory Types and Examples

### Security Issues

```yaml
Type: "security-issue"
Tags: ["hextrackr", "security", "codacy", "vulnerability"]
Importance: 8-10
```

### Project Status

```yaml
Type: "project-status"
Tags: ["hextrackr", "milestone", "release"]
Importance: 5-7
```

### Architectural Decisions

```yaml
Type: "architectural-decision"
Tags: ["hextrackr", "architecture", "decision"]
Importance: 6-8
```

### User Preferences

```yaml
Type: "user-preference"
Tags: ["hextrackr", "workflow", "preference"]
Importance: 3-5
```
