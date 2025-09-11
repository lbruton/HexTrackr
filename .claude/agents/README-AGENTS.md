# HexTrackr Agent Architecture Guide

## 🚨 CRITICAL: Agents are AI Configurations, NOT Scripts!

**AGENTS ARE**:
- Markdown files with YAML frontmatter
- AI personality configurations for Claude
- Instructions for how Claude should behave
- Launched via the Task tool from commands

**AGENTS ARE NOT**:
- Node.js scripts
- Bash scripts  
- Executable programs
- Things that run independently

## Architecture Overview

```
/commands/*.md          →  Task tool  →  /agents/*.md
(orchestration)            (launches)    (AI personalities)
```

## Agent Structure

Every agent MUST have:

### 1. YAML Frontmatter
```yaml
---
name: agent-name
description: Brief description for Task tool
model: sonnet
color: blue
---
```

### 2. Constitutional Requirements (Article X)
```javascript
// MANDATORY Before Starting ANY Task
await mcp__memento__search_nodes({
  mode: "semantic",
  query: "[task description]",
  topK: 8
});

// MANDATORY After Discoveries
await mcp__memento__create_entities({
  entities: [{...}]
});
```

### 3. Log File Template
```markdown
Save to: /hextrackr-specs/data/agentlogs/[agent]/[AGENT]_YYYYMMDDTHHMMSS.md
```

### 4. Personality & Role
Each agent maintains unique personality traits while following technical requirements.

## The Stooges System

**Purpose**: Parallel context routing to prevent main conversation overflow

### Core Stooges
- **LARRY**: Frontend Security Specialist (wild-haired enthusiasm)
- **MOE**: Backend Architecture Specialist (bossy organization)
- **CURLY**: Creative Problem Solver (energetic patterns)
- **SHEMP**: Overflow Router (reliable backup)

### How They Work
1. Commands use Task tool to launch Stooges
2. Each Stooge runs in parallel context
3. Full results saved to log files
4. Brief summaries returned to main chat
5. Context window preserved

## Security Team

### Members
- **WORF**: Security Officer (Klingon honor)
- **DRJACKSON**: Code Archaeologist (linguistic enthusiasm)
- **UHURA**: Communications Officer (diplomatic grace)

### Orchestration
The `/security-team` command orchestrates all three in sequence:
1. DrJackson - Archaeological analysis
2. Worf - Security enforcement
3. Uhura - Repository synchronization (if release mode)

## Documentation Team

### Core Members
- **ATLAS**: Specification Cartographer (stoic precision)
- **DOC**: Documentation Guardian (methodical grumpiness)
- **MERLIN**: Truth Wizard (mystical wisdom)
- **SPECS**: Compliance Officer (constitutional enthusiasm)

## Command Structure

Commands (`/commands/*.md`) are prompts that tell Claude how to use agents:

```javascript
Task(
  subagent_type: "agent-name",
  description: "What the agent should do",
  prompt: `
    Detailed instructions with personality...
    PHASE 1: [Actions]
    PHASE 2: [More actions]
    Save to: [log file path]
  `
)
```

## Common Mistakes to Avoid

### ❌ DON'T
- Create Node.js scripts for agents
- Write bash scripts to implement agents
- Try to make agents "run" anything
- Skip Constitutional Requirements
- Forget personality in responses

### ✅ DO
- Use Task tool to launch agents
- Maintain agent personalities
- Follow Constitutional Article X
- Save detailed logs
- Return brief summaries

## Tool Usage Hierarchy

### Primary (Use First)
- `mcp__memento__*` - Memory operations
- `mcp__sequential_thinking__*` - Complex analysis
- `mcp__Ref__*` - Documentation
- `TodoWrite` - Task tracking

### Standard
- File operations (Read/Write/Edit)
- Search operations (Grep/Glob)
- System operations (Bash)

### Restricted (Only When Instructed)
- `mcp__zen__*` - Only when explicitly requested
- These are powerful but expensive operations

## Testing Agent Configuration

To verify an agent is properly configured:

```bash
# Check for YAML header
head -6 /Volumes/DATA/GitHub/HexTrackr/.claude/agents/[agent].md

# Check for Constitutional Requirements
grep -c "Constitutional Requirements" [agent].md

# Check for log file format
grep -c "MANDATORY Log File Format" [agent].md
```

## Why This Architecture?

1. **Context Preservation**: Agents handle heavy work outside main chat
2. **Parallel Processing**: Multiple agents can work simultaneously
3. **Personality Consistency**: Each agent maintains character traits
4. **Audit Trail**: All work saved to timestamped logs
5. **Constitutional Compliance**: Enforces Article X MCP tool usage

---

**Remember**: Agents are instructions for Claude's behavior, not programs to execute. They're launched via Task tool, not run as scripts.