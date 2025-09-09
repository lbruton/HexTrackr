#!/bin/bash
# Global Commands Update Script - COMPLETE VERSION
# This script contains all updated command snippets for your global .claude/commands/ directory

echo "Creating updated command snippets for global installation..."
echo "Target directory: /Users/lbruton/.claude/commands/"
echo ""

# Create temporary directory for new commands
mkdir -p /tmp/claude-commands-update

# ============================================================================
# 1. save-conversation.md
# ============================================================================
cat > /tmp/claude-commands-update/save-conversation.md << 'EOF'
# Save Conversation

Saves the current conversation to Memento memory system with constitutional compliance.

## Implementation

1. Analyze current conversation for key insights
2. Create timestamped conversation entity
3. Extract decisions, patterns, and solutions
4. Link to relevant project entities
5. Apply PROJECT:DOMAIN:TYPE classification

```javascript
const timestamp = new Date().toISOString();
const projectName = await Bash("basename $(pwd)") || "GENERAL";

await mcp__memento__create_entities({
  entities: [{
    name: `${projectName}:CONVERSATION:${timestamp}`,
    entityType: "PROJECT:SESSION:CONVERSATION",
    observations: [
      // Extract from conversation:
      "Key topics discussed",
      "Decisions made", 
      "Problems solved",
      "Patterns discovered",
      "Next steps identified",
      "Tools and techniques used"
    ]
  }]
});

// Link to active work if applicable
const activeSpec = await Bash("cat .active-spec 2>/dev/null");
if (activeSpec) {
  await mcp__memento__create_relations({
    relations: [{
      from: `${projectName}:CONVERSATION:${timestamp}`,
      to: `${projectName}:SPEC:${activeSpec}`,
      relationType: "DISCUSSES"
    }]
  });
}
```

## Constitutional Compliance
- **Article VI**: Knowledge Management - Preserves institutional knowledge
- **Article I**: Links to specifications when applicable
EOF

# ============================================================================
# 2. save-insights.md
# ============================================================================
cat > /tmp/claude-commands-update/save-insights.md << 'EOF'
# Save Insights

Captures discoveries, patterns, and solutions to Memento for future reference.

## Implementation

1. Identify key insights from current work
2. Classify using PROJECT:DOMAIN:TYPE convention
3. Create detailed observations
4. Link to related entities
5. Ensure semantic searchability

```javascript
const projectName = await Bash("basename $(pwd)") || "GENERAL";
const timestamp = Date.now();

await mcp__memento__create_entities({
  entities: [{
    name: `${projectName}:INSIGHT:${timestamp}`,
    entityType: "PROJECT:KNOWLEDGE:INSIGHT",
    observations: [
      // Document specific insights:
      "Technical pattern discovered",
      "Solution that worked",
      "Performance optimization found",
      "Bug fix approach",
      "Architecture decision rationale",
      "Tool configuration that succeeded"
    ]
  }]
});

// Search for related patterns to link
const related = await mcp__memento__search_nodes({
  mode: "semantic",
  query: "similar patterns and solutions",
  topK: 3,
  threshold: 0.35
});

// Create relationships if relevant
if (related.entities.length > 0) {
  // Link to related insights
}
```

## Usage Triggers
- After solving a complex problem
- When discovering a reusable pattern
- After successful debugging
- When making architecture decisions
- After performance optimizations

## Constitutional Compliance
- **Article VI**: MANDATORY - Save insights between tasks
- **Article VIII**: Continuous improvement through knowledge capture
EOF

# ============================================================================
# 3. memory-search.md
# ============================================================================
cat > /tmp/claude-commands-update/memory-search.md << 'EOF'
# Memory Search

Search the Memento knowledge graph using semantic similarity.

## Implementation

```javascript
// Parse search query from command arguments
const query = args || "recent insights and patterns";

// ALWAYS use semantic mode per Constitution Article VI
const results = await mcp__memento__search_nodes({
  mode: "semantic",  // REQUIRED by constitution
  query: query,
  topK: 8,
  threshold: 0.35
});

// Format and display results
results.entities.forEach(entity => {
  console.log(`\n📍 ${entity.name} (${entity.entityType})`);
  entity.observations.forEach(obs => {
    console.log(`  • ${obs}`);
  });
});

// Show relationships if any
if (results.relations?.length > 0) {
  console.log("\n🔗 Relationships:");
  results.relations.forEach(rel => {
    console.log(`  ${rel.from} → ${rel.to} (${rel.relationType})`);
  });
}
```

## Search Strategies

### By Pattern Type
- "implementation patterns"
- "error handling approaches"
- "performance optimizations"
- "security measures"

### By Problem Domain
- "authentication issues"
- "database migrations"
- "API integration problems"
- "testing strategies"

### By Status
- "FIXED bugs"
- "DEPRECATED patterns"
- "ACTIVE features"
- "BLOCKED tasks"

## Constitutional Compliance
- **Information Research Priority**: Check memory before external sources
- **Article VI**: Use semantic search mode
EOF

# ============================================================================
# 4. handoff.md
# ============================================================================
cat > /tmp/claude-commands-update/handoff.md << 'EOF'
# Handoff

Prepare comprehensive context for work transitions.

## Implementation

```javascript
// Gather current state
const projectName = await Bash("basename $(pwd)");
const branch = await Bash("git branch --show-current");
const activeSpec = await Bash("cat .active-spec 2>/dev/null") || "none";
const modifiedFiles = await Bash("git status --porcelain | wc -l");
const dockerStatus = await Bash("docker-compose ps --services --filter status=running 2>/dev/null | wc -l") || "0";

// Get pending tasks if spec active
let pendingTasks = [];
if (activeSpec !== "none") {
  pendingTasks = await Bash(`grep '\\[ \\]' hextrackr-specs/specs/${activeSpec}/tasks.md 2>/dev/null`);
}

// Create handoff entity
const handoffId = `${projectName}:HANDOFF:${Date.now()}`;
await mcp__memento__create_entities({
  entities: [{
    name: handoffId,
    entityType: "PROJECT:TRANSITION:HANDOFF",
    observations: [
      `Project: ${projectName}`,
      `Branch: ${branch}`,
      `Active Spec: ${activeSpec}`,
      `Modified Files: ${modifiedFiles}`,
      `Docker Services Running: ${dockerStatus}`,
      `Pending Tasks: ${pendingTasks.length}`,
      "=== Work Completed ===",
      // List completed work
      "=== Known Issues ===",
      // List any blockers
      "=== Next Steps ===",
      // Recommended actions
    ]
  }]
});

// Search for relevant context
const context = await mcp__memento__search_nodes({
  mode: "semantic",
  query: `${projectName} ${activeSpec} recent work patterns decisions`,
  topK: 5,
  threshold: 0.35
});

// Generate handoff report
console.log(`
## Handoff Report - ${new Date().toISOString()}

### Environment
- Project: ${projectName}
- Branch: ${branch}
- Active Spec: ${activeSpec}
- Modified Files: ${modifiedFiles}
- Docker Status: ${dockerStatus} services running

### Pending Tasks
${pendingTasks.join('\n')}

### Recent Context
${context.entities.map(e => `- ${e.name}: ${e.observations[0]}`).join('\n')}

### Constitutional Reminders
- Article I: Check spec alignment before implementing
- Article VI: Save insights to Memento
- Article II: Maintain git discipline

### Next Session Setup
1. Check .active-spec matches intended work
2. Run docker-compose up -d if needed
3. Search memory for: "${activeSpec} patterns"
4. Review pending tasks in tasks.md
`);
```

## Handoff Types
- `quick` - Basic state for short breaks
- `full` - Complete context with all details
- `ai` - Optimized for AI assistant transitions

## Constitutional Compliance
- **Article VI**: Preserves knowledge
- **Article III**: Maintains task continuity
EOF

# ============================================================================
# 5. specify.md (Updated for new structure)
# ============================================================================
cat > /tmp/claude-commands-update/specify.md << 'EOF'
# Specify

Start a new feature by creating a specification (Step 1 of Spec-Kit workflow).

## Implementation

Given the feature description in arguments:

1. Check constitutional compliance
2. Create feature branch and specification structure
3. Generate spec from template
4. Set up for next phase (plan)
5. Save to memory

```bash
# From repository root
PROJECT_ROOT=$(pwd)

# Run the creation script
RESULT=$(hextrackr-specs/scripts/create-new-feature.sh --json "$ARGUMENTS")
BRANCH_NAME=$(echo $RESULT | jq -r '.branch')
SPEC_FILE=$(echo $RESULT | jq -r '.spec_file')

# Load and populate template
TEMPLATE="hextrackr-specs/templates/spec-template.md"
# ... populate spec content ...

# Save to memory
await mcp__memento__create_entities({
  entities: [{
    name: `${PROJECT}:SPEC:${FEATURE_NAME}`,
    entityType: "PROJECT:SPECIFICATION:FEATURE",
    observations: [
      "Feature requirements",
      "User stories",
      "Technical constraints",
      "Success criteria"
    ]
  }]
});
```

## Template Structure
- Problem Statement
- User Stories
- Requirements (Functional/Non-functional)
- Success Criteria
- Technical Constraints

## Constitutional Compliance
- **Article I**: Specification-Driven Development
- **Article III**: Spec → Plan → Tasks → Implementation
EOF

# ============================================================================
# 6. plan.md (Updated for new structure)
# ============================================================================
cat > /tmp/claude-commands-update/plan.md << 'EOF'
# Plan

Create implementation plan from specification (Step 2 of Spec-Kit workflow).

## Implementation

Given implementation details in arguments:

1. Verify specification exists
2. Analyze requirements and constraints
3. Generate technical plan
4. Create supporting artifacts
5. Prepare for task generation

```bash
# Get current feature context
RESULT=$(hextrackr-specs/scripts/setup-plan.sh --json)
FEATURE_SPEC=$(echo $RESULT | jq -r '.feature_spec')
IMPL_PLAN=$(echo $RESULT | jq -r '.impl_plan')
SPECS_DIR=$(echo $RESULT | jq -r '.specs_dir')

# Read specification
SPEC_CONTENT=$(cat $FEATURE_SPEC)

# Check constitution
CONSTITUTION=$(cat .claude/constitution.md)

# Execute plan template phases
# Phase 0: Research
# Phase 1: Design (data-model, contracts, quickstart)
# Phase 2: Task generation prep

# Save plan to memory
await mcp__memento__create_entities({
  entities: [{
    name: `${PROJECT}:PLAN:${FEATURE_NAME}`,
    entityType: "PROJECT:PLANNING:IMPLEMENTATION",
    observations: [
      "Technical approach",
      "Architecture decisions",
      "Dependencies identified",
      "Risk factors"
    ]
  }]
});
```

## Artifacts Generated
- research.md - Technical research
- data-model.md - Entity definitions
- contracts/ - API specifications
- quickstart.md - Test scenarios

## Constitutional Compliance
- **Article III**: Following spec → plan workflow
- **Article V**: Documentation requirements
EOF

# ============================================================================
# 7. tasks.md (Updated for new structure)
# ============================================================================
cat > /tmp/claude-commands-update/tasks.md << 'EOF'
# Tasks

Generate executable tasks from plan (Step 3 of Spec-Kit workflow).

## Implementation

1. Check prerequisites and available documents
2. Generate tasks based on plan artifacts
3. Apply parallel execution markers
4. Set up task tracking
5. Activate specification

```bash
# Check prerequisites
RESULT=$(hextrackr-specs/scripts/check-task-prerequisites.sh --json)
FEATURE_DIR=$(echo $RESULT | jq -r '.feature_dir')
AVAILABLE_DOCS=$(echo $RESULT | jq -r '.available_docs[]')

# Read available documents
PLAN=$(cat $FEATURE_DIR/plan.md)
[[ -f "$FEATURE_DIR/data-model.md" ]] && DATA_MODEL=$(cat $FEATURE_DIR/data-model.md)
[[ -d "$FEATURE_DIR/contracts" ]] && CONTRACTS=$(ls $FEATURE_DIR/contracts/)

# Generate tasks using template
TEMPLATE="hextrackr-specs/templates/tasks-template.md"

# Task categories:
# - Setup tasks (T001-T00X)
# - Test tasks [P] (T00X-T0XX) 
# - Core implementation (T0XX-TXXX)
# - Integration tasks (TXXX-TYYY)
# - Polish tasks [P] (TYYY-TZZZ)

# Save to memory
await mcp__memento__create_entities({
  entities: [{
    name: `${PROJECT}:TASKS:${FEATURE_NAME}`,
    entityType: "PROJECT:EXECUTION:TASKS",
    observations: [
      `Total tasks: ${TASK_COUNT}`,
      `Parallel tasks: ${PARALLEL_COUNT}`,
      "Task dependencies mapped",
      "Execution order defined"
    ]
  }]
});

# Activate specification
echo "${FEATURE_NAME}" > .active-spec
```

## Task Markers
- `[P]` - Can run in parallel
- `T###` - Task number
- Dependencies noted inline

## Constitutional Compliance
- **Article III**: Task-gated implementation
- **Article I**: Tasks derived from specifications
EOF

# ============================================================================
# 8. refresh-context.md (New command for context loading)
# ============================================================================
cat > /tmp/claude-commands-update/refresh-context.md << 'EOF'
# Refresh Context

Load relevant context from memory and check project state.

## Implementation

```javascript
// Get project context
const projectName = await Bash("basename $(pwd)");
const activeSpec = await Bash("cat .active-spec 2>/dev/null") || "none";

// Search for relevant context
const context = await mcp__memento__search_nodes({
  mode: "semantic",
  query: `${projectName} ${activeSpec} recent patterns insights decisions`,
  topK: 10,
  threshold: 0.35
});

// Check constitutional compliance
const constitution = await Read(".claude/constitution.md");

// Display context
console.log(`
## Project Context Refreshed

### Active Work
- Project: ${projectName}
- Specification: ${activeSpec}

### Constitutional Reminders
- Article I: Specification-driven development
- Article VI: Save insights to Memento
- Article II: Git discipline

### Recent Memory Context
${context.entities.slice(0, 5).map(e => 
  `- ${e.name}: ${e.observations[0]}`
).join('\n')}

### Information Priority
1. ref.tools - Documentation
2. Memento - Project memory
3. Zen - Code analysis
4. WebSearch - External (if needed)
`);
```

## Usage
- Start of session
- After context switch
- Before major work
- After breaks

## Constitutional Compliance
- **Article VI**: Load preserved knowledge
- **Information Research Priority**: Follow hierarchy
EOF

# ============================================================================
# 9. amend-constitution.md (NEW - Constitutional Expert)
# ============================================================================
cat > /tmp/claude-commands-update/amend-constitution.md << 'EOF'
# Amend Constitution

Invokes the Spec-Kit Constitutional Expert to properly handle constitutional amendments.

## Purpose

Ensures proper separation between:
- **Universal principles** (constitution)
- **Project implementation** (CLAUDE.md)

## Implementation

```javascript
// Load the Spec-Kit Constitutional Expert
const agent = await Read(".claude/agents/spec-kit-constitutional-expert.md");

// Analyze the proposed amendment
const proposal = args;

// Classify the change
const analysis = {
  isUniversal: !proposal.match(/hextrackr|\.active-spec|8989|docker|copilot/i),
  hasProjectPaths: proposal.match(/[\w-]+\/[\w-]+\//),
  mentionsTools: proposal.match(/docker|playwright|codacy|sqlite/i)
};

// Validation checklist
const validates = {
  worksForPython: !analysis.mentionsTools,
  worksForMobile: !analysis.hasProjectPaths,
  worksWithoutDocker: !proposal.match(/docker/i),
  toolAgnostic: !analysis.mentionsTools,
  pathAgnostic: !analysis.hasProjectPaths
};

// Determine target
if (Object.values(validates).every(v => v)) {
  console.log("✅ Valid universal principle → Constitution");
} else {
  console.log("📁 Project-specific → CLAUDE.md");
}
```

## Examples

### Universal Principle (→ Constitution):
```
/amend-constitution "All code reviews must include performance analysis"
```

### Project Detail (→ CLAUDE.md):
```
/amend-constitution "Use .active-spec file to track current work"
```

### Mixed (→ Split):
```
/amend-constitution "Track specs in .active-spec and require docker"
```

## The Sacred Separation

**Constitution** = WHAT (universal principles)
**CLAUDE.md** = HOW (project implementation)

## Violations Prevented
- 🚫 Project paths in constitution
- 🚫 Tool names in constitution
- 🚫 Port numbers in constitution
- 🚫 File names in constitution
- 🚫 Technology choices in constitution

## Constitutional Compliance
- Maintains spec-kit purity
- Prevents contamination
- Ensures reusability
EOF

# ============================================================================
# Installation Instructions
# ============================================================================
cat > /tmp/claude-commands-update/INSTALL.md << 'EOF'
# Installing Updated Global Commands

## Quick Install
```bash
# Backup existing commands
cp -r /Users/lbruton/.claude/commands /Users/lbruton/.claude/commands.backup

# Copy new commands
cp /tmp/claude-commands-update/*.md /Users/lbruton/.claude/commands/

# Verify installation
ls -la /Users/lbruton/.claude/commands/
```

## Commands Included (9 Total)
1. **save-conversation** - Save entire conversation to memory
2. **save-insights** - Save discoveries and patterns
3. **memory-search** - Search knowledge graph
4. **handoff** - Prepare transition context
5. **specify** - Create new specification (spec-kit step 1)
6. **plan** - Generate implementation plan (spec-kit step 2)
7. **tasks** - Create executable tasks (spec-kit step 3)
8. **refresh-context** - Load project context from memory
9. **amend-constitution** - Constitutional amendments with expert validation

## Constitutional Compliance
All commands now enforce:
- Article I: Specification-driven development
- Article VI: Knowledge management with Memento
- Article IX: Active specification management
- Information Research Priority
- PROJECT:DOMAIN:TYPE classification

## Usage Pattern
1. Start session: `/refresh-context`
2. Search memory: `/memory-search [query]`
3. Begin feature: `/specify [description]`
4. Plan approach: `/plan [details]`
5. Generate tasks: `/tasks`
6. Save discoveries: `/save-insights`
7. End session: `/save-conversation`
8. Transition: `/handoff`
9. Amend rules: `/amend-constitution [change]`

## Spec-Kit Expert Agent
The `/amend-constitution` command uses the Spec-Kit Constitutional Expert agent to:
- Validate universal vs project-specific
- Prevent constitutional contamination
- Maintain sacred separation
- Update correct files

## Validation Script
Run periodically to check constitutional purity:
```bash
/Volumes/DATA/GitHub/HexTrackr/scripts/validate-constitution.sh
```
EOF

echo ""
echo "✅ Command snippets prepared in: /tmp/claude-commands-update/"
echo ""
echo "📦 Total Commands: 9"
echo "  - Memory: save-conversation, save-insights, memory-search, handoff"
echo "  - Spec-Kit: specify, plan, tasks"
echo "  - Utility: refresh-context"
echo "  - Governance: amend-constitution (NEW)"
echo ""
echo "To install globally, run:"
echo "  cp /tmp/claude-commands-update/*.md /Users/lbruton/.claude/commands/"
echo ""
echo "🛡️ Spec-Kit Constitutional Expert agent created at:"
echo "  /Volumes/DATA/GitHub/HexTrackr/.claude/agents/spec-kit-constitutional-expert.md"
echo ""
echo "🔍 Validation script created at:"
echo "  /Volumes/DATA/GitHub/HexTrackr/scripts/validate-constitution.sh"
echo ""