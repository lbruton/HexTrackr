# Agent Constitutional Configuration

*Shared configuration for ALL HexTrackr agents per Article XI*

## 🏛️ Constitutional Inheritance

This document serves as the single source of constitutional requirements for all agents.
Every agent MUST enforce these requirements without exception.

**Constitution Source**: `/hextrackr-specs/memory/constitution.md`

## 📜 Article Enforcement Requirements

### Article I: Task-First Implementation

Every agent MUST verify before implementation:

```bash
cat .active-spec                    # Must exist
cat hextrackr-specs/specs/$(cat .active-spec)/tasks.md  # Must have pending tasks
```

- NEVER implement without spec-derived tasks
- Tests MUST exist in quickstart.md before coding
- Complex fixes route through appropriate spec

### Article II: Git Checkpoint Enforcement

Every agent MUST enforce:

- Work from `copilot` branch (NEVER main)
- Create git checkpoints before major changes
- Generate constitutional evidence for commits

### Article III: Spec-Kit Workflow Compliance

Every agent MUST follow:

- Planning Phase: spec.md → plan.md → tasks.md
- Implementation Phase: Execute only spec-derived tasks
- Documentation Phase: Update after implementation
- No arbitrary changes outside spec framework

### Article IV: Per-Spec Bug Management

Every agent MUST route bugs:

- Simple Fixes (<10 lines): TodoWrite + immediate fix
- Complex Fixes: Add to specs/{number}/tasks.md
- Classification: B001, B002 with severity
- Orphaned Bugs: Create new spec or route to project-planner-manager

### Article V: Constitutional Inheritance

Every agent MUST:

- Validate constitutional compliance before execution
- Include constitutional evidence in logs
- Enforce quality gates at each step

### Article VII: Production Reality Integration

Every agent MUST integrate:

- Performance monitoring (<500ms tables, <200ms charts)
- Error pattern documentation
- User experience feedback
- Operational learnings to spec evolution

### Article X: MCP Tool Usage Mandate

**MANDATORY Before Starting ANY Task**:

```javascript
// Search for existing patterns and solutions
await mcp__memento__search_nodes({
  mode: "semantic", 
  query: "[current task description]",
  topK: 8
});

// For complex analysis, use sequential thinking
await mcp__sequential_thinking__sequentialthinking({
  thought: "Breaking down task: [description]",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 3
});
```

**MANDATORY After Discoveries/Analysis**:

```javascript
// Save all discoveries to Memento
await mcp__memento__create_entities({
  entities: [{
    name: "HEXTRACKR:[DOMAIN]:[discovery]",
    entityType: "PROJECT:[TYPE]:PATTERN",
    observations: ["findings", "solutions", "patterns"]
  }]
});

// Create relationships between entities
await mcp__memento__create_relations({
  relations: [{
    from: "entity1",
    to: "entity2",
    relationType: "IMPLEMENTS|FIXES|RELATES_TO"
  }]
});
```

## 🧠 Memory Management

### Namespace Standards

All agents use these prefixes for Memento entities:

- `HEXTRACKR:VULNERABILITY:*` - Security and vulnerability findings
- `HEXTRACKR:TICKET:*` - Ticket integration patterns
- `HEXTRACKR:IMPORT:*` - CSV/data import solutions
- `HEXTRACKR:UI:*` - UI/frontend patterns
- `HEXTRACKR:API:*` - API endpoint patterns
- `HEXTRACKR:BUG:*` - Bug fixes and solutions
- `HEXTRACKR:AGENT:[NAME]:*` - Agent-specific discoveries

### Logging Requirements

Every agent MUST use AgentLogger:

```javascript
const logger = new AgentLogger('[AGENT_NAME]');
const memoryId = logger.createMemoryId('[OPERATION]');
logger.log('info', 'message', { memoryId, data });
```

Logs saved to: `/hextrackr-specs/data/agentlogs/[agent]/`

## 🔧 Tool Priority Order

When researching or solving problems:

1. **ref.tools MCP** - Technical documentation first
2. **Memento semantic search** - Check project memory
3. **Sequential Thinking** - Break down complex tasks
4. **Zen MCP** - Analyze existing code
5. **WebSearch** - Only if above sources fail
6. **WebFetch** - Last resort for specific URLs

## ✅ Quality Gates

Every agent enforces these checkpoints:

- [ ] Constitutional compliance verified
- [ ] Active spec and tasks checked
- [ ] Git branch confirmed (copilot)
- [ ] Docker services running
- [ ] Tests written before implementation
- [ ] Performance benchmarks met
- [ ] Memory saved to Memento

## 🚫 Constitutional Violations

Any agent committing these violations must halt:

- Working on main branch
- Implementing without spec tasks
- Skipping Memento search
- Failing to save discoveries
- Bypassing test creation
- Ignoring performance benchmarks
- Making arbitrary changes

---
*This configuration is inherited by ALL agents per Article XI of the HexTrackr Constitution*
*Last Updated: 2025-01-11 | Version: 1.0.0*
