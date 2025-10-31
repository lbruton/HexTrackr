# Memento Knowledge Graph Manager Skill

## Purpose

This skill automates Memento MCP knowledge graph operations for HexTrackr, enforcing the TAXONOMY.md conventions and implementing the "Memento First" strategy. It handles both **saving** context (sessions, insights, patterns) and **recalling** historical knowledge.

## How It Works

### Automatic Triggering

**Save Operations** - Claude loads this skill when you:
- Say "remember this", "save to memento", "add this to the knowledge graph"
- Complete a major session or feature
- Discover a breakthrough, pattern, or lesson learned
- End a conversation (Claude prompts to save)

**Recall Operations** - Claude loads this skill when you:
- Say "recall", "have we done this before?", "search memento"
- Start planning a new feature (proactive "Memento First" check)
- Reference past work by topic, tag, or week
- Encounter a problem (automatic search for similar solutions)

### What It Does

**Save Workflow**:
1. Determines appropriate entity type (SESSION, PATTERN, BREAKTHROUGH, etc.)
2. Generates current temporal tags via `scripts/generate_tags.py`
3. Creates entity with required observations (TIMESTAMP, ABSTRACT, SUMMARY, *_ID)
4. Adds tags (project, category, temporal, issue, workflow, learning)
5. Creates relations to link with existing entities
6. Validates tagging completeness

**Recall Workflow**:
1. Chooses optimal search method (semantic vs keyword vs hybrid)
2. Filters with temporal context (week/month/quarter)
3. Presents results with abstracts and temporal context
4. Suggests related entities via relations
5. Offers to explore deeper

### Memento First Strategy

**CRITICAL**: Before making architectural assumptions or planning features, this skill enforces searching Memento FIRST to discover if:
- We've solved this problem before
- Similar patterns exist in the codebase
- Architectural decisions were already made
- Lessons were learned from past attempts

This prevents assumption-based development that leads to scope creep (see HEX-190-193 SRPI cycle where searching Memento reduced 8 tasks to 4).

## File Structure

```
memento-manager/
├── SKILL.md                    # Skill instructions (Claude loads this)
├── REFERENCE.md                # Quick reference for entity types & tags
├── scripts/
│   └── generate_tags.py        # Temporal tag generator
└── README.md                   # This file (human documentation)
```

## Progressive Loading

- **Metadata** (~180 tokens): Always loaded at startup - Claude knows this skill exists
- **Instructions** (~4K tokens): Loaded only when you mention memento/save/recall
- **Reference** (~2.5K tokens): Loaded on-demand when checking entity types/tags
- **Script Output** (~100 tokens): Generated only when creating temporal tags

**Token Savings**: Without this skill, TAXONOMY.md (~5K tokens) would need to be in CLAUDE.md (always loaded). Now it's on-demand.

## Tag Generation Helper

### Manual Usage

Generate current temporal tags:
```bash
python3 .claude/skills/memento-manager/scripts/generate_tags.py
```

Output (plain text):
```
week-44-2025
2025-10
q4-2025
v1.1.10
```

JSON format:
```bash
python3 .claude/skills/memento-manager/scripts/generate_tags.py --json
```

Output:
```json
{
  "week": "week-44-2025",
  "month": "2025-10",
  "quarter": "q4-2025",
  "version": "v1.1.10"
}
```

Custom package.json location:
```bash
python3 .claude/skills/memento-manager/scripts/generate_tags.py --package-json /path/to/package.json
```

## Testing This Skill

Try these prompts in your **next conversation** (skills load at startup):

### Test 1: Save a Session
```
"Remember this session about HEX-350 ticket creation"
```
**Expected**: Claude loads the skill, asks for a one-line summary, generates tags, creates entity with required observations, adds tags, and confirms save.

### Test 2: Recall Similar Work
```
"Have we implemented modal design patterns before?"
```
**Expected**: Claude loads the skill, runs semantic_search for modal patterns, filters to HEXTRACKR:FRONTEND entities, presents top results with abstracts.

### Test 3: Memento First Check
```
"I want to plan a new feature for hostname parsing"
```
**Expected**: Claude proactively asks "Should I search Memento for related context?" then runs semantic search for hostname parsing patterns.

### Test 4: Save a Breakthrough
```
"This SRPI scope reduction strategy is a major breakthrough"
```
**Expected**: Claude creates HEXTRACKR:WORKFLOW:BREAKTHROUGH entity, tags with breakthrough/lesson-learned/reusable, links to current session.

### Test 5: Find Past Bugs
```
"Did we encounter this import timeout bug before?"
```
**Expected**: Claude searches for "import timeout critical-bug lesson-learned", shows if similar bug was solved, links to solution.

## Entity Types Quick Reference

**Common Types**:
- `HEXTRACKR:FRONTEND:SESSION` - UI/UX work sessions
- `HEXTRACKR:BACKEND:SESSION` - Server/API work sessions
- `HEXTRACKR:FRONTEND:PATTERN` - Reusable UI patterns
- `HEXTRACKR:BACKEND:PATTERN` - Reusable backend patterns
- `HEXTRACKR:ARCHITECTURE:DECISION` - Architectural choices
- `HEXTRACKR:WORKFLOW:BREAKTHROUGH` - Major discoveries
- `HEXTRACKR:WORKFLOW:INSIGHT` - Process improvements

**Required Tags** (every entity):
- Project: `TAG: project:hextrackr`
- Category: `TAG: frontend` / `TAG: backend` / `TAG: database`
- Temporal: `TAG: week-44-2025` (from generate_tags.py)

**Common Tags**:
- Issue: `TAG: HEX-350`
- Version: `TAG: v1.1.10`
- Learning: `TAG: breakthrough` / `TAG: lesson-learned` / `TAG: pattern`
- Workflow: `TAG: completed` / `TAG: in-progress`
- Quality: `TAG: reusable` / `TAG: best-practice`

## Search Method Decision Tree

**Use `mcp__memento__search_nodes` for**:
- Exact Linear issue: `"HEX-350"`
- Specific week: `"week-44-2025 completed"`
- Tag combinations: `"project:hextrackr backend critical-bug"`

**Use `mcp__memento__semantic_search` for**:
- Concepts: `"modal design patterns"`
- Natural language: `"how to implement WebSocket authentication"`
- Discovery: `"similar problems we've solved before"`

**Hybrid** (tags + concepts):
```javascript
semantic_search({
  query: "week-43-2025 modal patterns frontend",
  hybrid_search: true
})
```

## Integration with HexTrackr Workflow

### SRPI Process
- **Before Research Phase**: Automatically search Memento for topic
- **After Implementation**: Prompt to save session with proper tags
- **During Planning**: Check for similar architectural decisions

### Linear Issues
- **Auto-tagging**: Extract HEX-XXX from Linear context, add as tag
- **Status Sync**: Tag with workflow status (in-progress/completed)
- **Version Tracking**: Auto-add current version tag

### Version Bumps
- **Pre-Release**: Tag completed work with upcoming version
- **Post-Release**: Search for all work in this version (`v1.1.10`)

## Knowledge Graph Context

**Current State**:
- 497K+ tokens in Memento graph
- 100+ sessions across multiple projects
- Temporal filtering critical (use week/month/quarter tags)

**Why Filtering Matters**:
- `read_graph` will fail (200K+ tokens)
- Always use search_nodes or semantic_search with filters
- Recent context (last quarter) most relevant for current work

## Error Prevention

**Never**:
- ❌ Use `read_graph` (will fail)
- ❌ Skip required observations (TIMESTAMP, ABSTRACT, SUMMARY, *_ID)
- ❌ Skip project tag (project:hextrackr)
- ❌ Skip temporal tag (week-XX-YYYY)
- ❌ Use creative entity types (follow PROJECT:DOMAIN:TYPE)

**Always**:
- ✅ Search Memento FIRST before assumptions
- ✅ Use `generate_tags.py` for temporal tags
- ✅ Follow required observations order
- ✅ Add minimum 3 tags (project, category, temporal)
- ✅ Tag Linear issues with HEX-XXX
- ✅ Link related entities with relations

## References

- **Full Taxonomy**: `/docs/TAXONOMY.md`
- **MCP Tools Guide**: `/docs/MCP_TOOLS.md`
- **CLAUDE.md**: See "Memento First Strategy" section
- **Source of Truth**: Linear DOCS-14 (check first, fallback to TAXONOMY.md)

## Future Enhancements

Potential additions:
- Auto-extract insights from session transcripts
- Suggest related entities based on semantic similarity
- Generate weekly summaries from tagged sessions
- Auto-tag based on Linear issue metadata
- Detect duplicate saves (warn if similar entity exists)
