---
name: memento-manager
description: Manages HexTrackr Memento knowledge graph operations for saving sessions, insights, and patterns, and recalling historical context. Triggers when user mentions "remember this", "save to memento", "recall", "have we solved this before", or at session start/end. Enforces TAXONOMY.md conventions and "Memento First" strategy.
---

# Memento Knowledge Graph Manager

## When to Use This Skill

### Automatic Triggering (Save Operations)

Trigger when the user:
- Says "remember this", "save this", "add to memento"
- Completes a major session or feature
- Discovers a breakthrough, pattern, or lesson learned
- Ends a conversation (proactive save prompt)
- Creates reusable code patterns

### Automatic Triggering (Recall Operations)

Trigger when the user:
- Says "recall", "have we done this before", "search memento"
- Starts planning a new feature (proactive "Memento First" check)
- Encounters a problem ("have we solved this?")
- Asks about architectural decisions or patterns
- References past work by topic/tag/week

## Critical Principles

1. **Memento First Strategy**: ALWAYS search Memento BEFORE making architectural assumptions
2. **Required Tagging**: Every entity MUST have project + category + temporal tags
3. **Search Method Selection**: Use semantic_search for concepts, search_nodes for exact tags/IDs
4. **Temporal Context**: The graph contains 497K+ tokens - filter with temporal tags
5. **No read_graph**: NEVER use read_graph (will fail with 200K+ tokens)

## Save Workflow

### Step 1: Determine Entity Type

Use REFERENCE.md for complete list. Common types:

**Sessions**:
- `HEXTRACKR:FRONTEND:SESSION` - UI/UX work
- `HEXTRACKR:BACKEND:SESSION` - Server/API work
- `HEXTRACKR:DATABASE:SESSION` - Schema/migration work

**Patterns & Insights**:
- `HEXTRACKR:FRONTEND:PATTERN` - Reusable UI patterns
- `HEXTRACKR:ARCHITECTURE:DECISION` - Architectural choices
- `HEXTRACKR:WORKFLOW:INSIGHT` - Process improvements
- `HEXTRACKR:DEVELOPMENT:BREAKTHROUGH` - Major discoveries

**SRPI Work**:
- `HEXTRACKR:WORKFLOW:ANALYSIS` - Research phase findings
- `HEXTRACKR:ARCHITECTURE:DECISION` - Plan phase decisions

### Step 2: Generate Temporal Tags

Use `scripts/generate_tags.py` to get current tags:
```bash
python3 .claude/skills/memento-manager/scripts/generate_tags.py
```

Output format:
```
week-44-2025
2025-10
q4-2025
```

### Step 3: Create Entity with Required Observations

**CRITICAL**: Observations MUST be in this exact order:

1. `TIMESTAMP: ISO 8601 format`
2. `ABSTRACT: One-line summary`
3. `SUMMARY: Detailed description`
4. `[TYPE]_ID: Unique identifier` (SESSION_ID, INSIGHT_ID, etc.)

Example:
```javascript
mcp__memento__create_entities({
  entities: [{
    name: "Session: HEX-350-Intelligent-Ticket-Creation",
    entityType: "HEXTRACKR:BACKEND:SESSION",
    observations: [
      "TIMESTAMP: 2025-10-31T10:30:00.000Z",
      "ABSTRACT: Implemented intelligent ticket creation with hostname parsing",
      "SUMMARY: Complete session implementing HEX-350 with Five Whys debugging...",
      "SESSION_ID: HEX-350-20251031-103000"
    ]
  }]
});
```

### Step 4: Add Tags via add_observations

**Required Tags** (every entity MUST have):
- Project tag: `TAG: project:hextrackr`
- Category tag: `TAG: frontend` / `TAG: backend` / `TAG: database`
- Temporal tag: `TAG: week-44-2025`

**Conditional Tags** (add when relevant):
- Issue reference: `TAG: HEX-350`
- Version: `TAG: v1.1.10`
- Impact: `TAG: feature` / `TAG: enhancement` / `TAG: critical-bug`
- Learning: `TAG: breakthrough` / `TAG: lesson-learned` / `TAG: pattern`
- Workflow: `TAG: completed` / `TAG: in-progress`
- Quality: `TAG: reusable` / `TAG: best-practice`

Example:
```javascript
mcp__memento__add_observations({
  observations: [{
    entityName: "Session: HEX-350-Intelligent-Ticket-Creation",
    contents: [
      "TAG: project:hextrackr",
      "TAG: backend",
      "TAG: feature",
      "TAG: completed",
      "TAG: week-44-2025",
      "TAG: v1.1.10",
      "TAG: HEX-350",
      "TAG: reusable",
      "TAG: pattern"
    ]
  }]
});
```

### Step 5: Create Relations (if applicable)

Link related entities with active voice relations:

```javascript
mcp__memento__create_relations({
  relations: [{
    from: "Session: HEX-350-Intelligent-Ticket-Creation",
    to: "Pattern: Hostname-Parser-Service",
    relationType: "implements",
    strength: 1.0,
    confidence: 1.0
  }]
});
```

## Recall Workflow

### Step 1: Choose Search Method

**Decision Tree**:
1. Searching for exact Linear issue (HEX-350)? → `search_nodes`
2. Searching for specific tags (week-44-2025)? → `search_nodes`
3. Searching for concepts ("modal patterns")? → `semantic_search`
4. Mixed (tags + concepts)? → `semantic_search` with `hybrid_search: true`

### Step 2: Execute Search

**Semantic Search** (for concepts):
```javascript
mcp__memento__semantic_search({
  query: "hostname parsing normalization patterns",
  limit: 10,
  min_similarity: 0.6,
  hybrid_search: false,  // Pure semantic
  entity_types: ["HEXTRACKR:BACKEND:PATTERN", "HEXTRACKR:WORKFLOW:INSIGHT"]
})
```

**Keyword Search** (for exact tags):
```javascript
mcp__memento__search_nodes({
  query: "HEX-350 completed week-44-2025"
})
```

**Hybrid Search** (tags + concepts):
```javascript
mcp__memento__semantic_search({
  query: "week-43-2025 modal design patterns",
  limit: 10,
  min_similarity: 0.5,
  hybrid_search: true,
  semantic_weight: 0.7  // 70% semantic, 30% keyword
})
```

### Step 3: Filter Temporal Context

For recent work, add temporal filters:
- Last week: `week-43-2025` (from generate_tags.py)
- This month: `2025-10`
- This quarter: `q4-2025`
- Recent version: `v1.1.10` or `v1.1.9`

### Step 4: Present Results

When presenting search results to user:
1. Show entity name and type
2. Highlight relevant observations (ABSTRACT, SUMMARY)
3. Show temporal context (when was this done?)
4. Suggest related entities via relations
5. Ask if user wants to explore deeper

## Proactive Assistance

### At Session Start
Ask: "Should I search Memento for related context before we begin?" then run semantic search on topic.

### Before SRPI Research Phase
Automatically run: `semantic_search("topic breakthrough lesson-learned pattern")`

### After Major Session
Ask: "Ready to save this session to Memento?" then guide through save workflow.

### When User References Past Work
If user says "like we did before" without specifics, proactively search for similar patterns.

## Common Patterns

### Save a Session
```
User: "Remember this session"
→ Ask for one-line summary
→ Generate temporal tags
→ Create entity with required observations
→ Add tags (project, category, temporal, issue, workflow)
→ Confirm saved with entity name
```

### Recall Similar Work
```
User: "Have we done modal design before?"
→ Run semantic_search("modal design patterns frontend")
→ Filter to HEXTRACKR:FRONTEND entities
→ Present top 5 results with abstracts
→ Offer to open specific entities for details
```

### Save a Breakthrough
```
User: "This hostname parser pattern is reusable"
→ Create HEXTRACKR:BACKEND:PATTERN entity
→ Tag with: reusable, pattern, best-practice, backend
→ Link to current session via "discovered-in" relation
→ Confirm saved for future reference
```

### Find Past Bugs
```
User: "Did we have this import bug before?"
→ Run semantic_search("import bug critical-bug lesson-learned")
→ Filter to recent (last quarter)
→ Show if similar bug was solved
→ Link to solution if found
```

## Tag Generation Helper

Always use `scripts/generate_tags.py` to get current temporal tags - ensures consistency across all saves.

**Output Includes**:
- Current week tag (week-44-2025)
- Current month tag (2025-10)
- Current quarter tag (q4-2025)
- Current version (from package.json)

## Validation Checklist

Before saving entity, verify:
- [ ] Entity type follows PROJECT:DOMAIN:TYPE pattern
- [ ] Required observations present (TIMESTAMP, ABSTRACT, SUMMARY, *_ID)
- [ ] Project tag present (project:hextrackr)
- [ ] Category tag present (frontend/backend/database)
- [ ] Temporal tag present (week-XX-YYYY)
- [ ] Issue tag if applicable (HEX-XXX)
- [ ] Workflow tag if applicable (completed/in-progress)

## Reference Materials

- **Full Taxonomy**: See `REFERENCE.md` for complete entity types and tag list
- **Tag Generator**: Run `scripts/generate_tags.py` for current temporal tags
- **Source Document**: `/docs/TAXONOMY.md` (fallback - prefer Linear DOCS-14)
- **MCP Tools Guide**: `/docs/MCP_TOOLS.md` for tool syntax

## Error Prevention

**NEVER**:
- Use `read_graph` (will fail with 200K+ tokens)
- Create entities without required observations
- Skip temporal tags (critical for filtering)
- Use creative tag names (check existing tags first)
- Forget to add "TAG: " prefix when using add_observations

**ALWAYS**:
- Search Memento FIRST before architectural assumptions
- Use semantic_search for concepts, search_nodes for tags
- Generate temporal tags with helper script
- Follow required observations order (TIMESTAMP, ABSTRACT, SUMMARY, *_ID)
- Tag with project, category, temporal minimum
