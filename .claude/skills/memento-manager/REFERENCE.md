# Memento Quick Reference

> Condensed reference for entity types and tags. Full details in `/docs/TAXONOMY.md`

## Entity Type Pattern: PROJECT:DOMAIN:TYPE

### Common HexTrackr Entity Types

**Sessions** (work done):
```
HEXTRACKR:FRONTEND:SESSION
HEXTRACKR:BACKEND:SESSION
HEXTRACKR:DATABASE:SESSION
HEXTRACKR:WORKFLOW:SESSION
```

**Patterns & Knowledge** (reusable):
```
HEXTRACKR:FRONTEND:PATTERN
HEXTRACKR:BACKEND:PATTERN
HEXTRACKR:ARCHITECTURE:DECISION
HEXTRACKR:WORKFLOW:INSIGHT
HEXTRACKR:DEVELOPMENT:BREAKTHROUGH
```

**Analysis & Research**:
```
HEXTRACKR:WORKFLOW:ANALYSIS
HEXTRACKR:ARCHITECTURE:ANALYSIS
HEXTRACKR:SECURITY:ANALYSIS
```

**Issues & Problems**:
```
HEXTRACKR:FRONTEND:ISSUE
HEXTRACKR:BACKEND:ISSUE
HEXTRACKR:DATABASE:ISSUE
```

**Handoffs** (transition packages):
```
HEXTRACKR:DEVELOPMENT:HANDOFF
HEXTRACKR:WORKFLOW:HANDOFF
```

## Tag Categories

### Required (Every Entity)

**Project** (pick one):
```
TAG: project:hextrackr
```

**Category** (pick one):
```
TAG: frontend
TAG: backend
TAG: database
TAG: documentation
TAG: testing
TAG: infrastructure
```

**Temporal** (pick one or more):
```
TAG: week-44-2025        # Current week (from generate_tags.py)
TAG: 2025-10             # Current month
TAG: q4-2025             # Current quarter
TAG: v1.1.10             # Current version
```

### Conditional (Add When Relevant)

**Issue Reference**:
```
TAG: HEX-350
TAG: HEX-324
```

**Impact**:
```
TAG: breaking-change
TAG: critical-bug
TAG: enhancement
TAG: feature
TAG: minor-fix
TAG: performance
TAG: security-fix
```

**Workflow**:
```
TAG: completed
TAG: in-progress
TAG: blocked
TAG: needs-review
TAG: experimental
TAG: deprecated
TAG: archived
```

**Learning**:
```
TAG: lesson-learned
TAG: pattern
TAG: breakthrough
TAG: pain-point
TAG: best-practice
TAG: anti-pattern
TAG: reusable
```

**Quality**:
```
TAG: tech-debt
TAG: refactor
TAG: optimization
TAG: cleanup
TAG: linting
TAG: modernization
```

**Research**:
```
TAG: research-[topic]
TAG: research:error-analysis
TAG: research:implementation-guide
TAG: research:performance-analysis
TAG: research:security-review
TAG: verified
TAG: authoritative
TAG: needs-verification
```

## Required Observations (In Order)

Every entity MUST include these observations in this exact order:

```javascript
observations: [
  "TIMESTAMP: 2025-10-31T10:30:00.000Z",
  "ABSTRACT: One-line summary of the work",
  "SUMMARY: Detailed description with context and outcomes",
  "SESSION_ID: UNIQUE-IDENTIFIER-20251031-103000"  // or INSIGHT_ID, PATTERN_ID, etc.
]
```

## Search Method Decision Tree

**Use `mcp__memento__search_nodes` for**:
- Exact ID matching: `"SESSION_ID: HEX-350-20251031-103000"`
- Specific tags: `"HEX-350 completed week-44-2025"`
- Tag combinations: `"project:hextrackr backend critical-bug"`

**Use `mcp__memento__semantic_search` for**:
- Conceptual queries: `"modal design patterns"`
- Natural language: `"how to implement WebSocket authentication"`
- Discovery: `"similar problems we've solved before"`
- Theme searches: `"architectural decisions from last month"`

**Hybrid Search** (both):
```javascript
mcp__memento__semantic_search({
  query: "week-43-2025 modal design patterns",
  hybrid_search: true,
  semantic_weight: 0.7  // 70% semantic, 30% keyword
})
```

## Common Save Patterns

### Save a Session
```javascript
// 1. Create entity
mcp__memento__create_entities({
  entities: [{
    name: "Session: HEX-350-Ticket-Creation",
    entityType: "HEXTRACKR:BACKEND:SESSION",
    observations: [
      "TIMESTAMP: 2025-10-31T10:30:00.000Z",
      "ABSTRACT: Implemented intelligent ticket creation",
      "SUMMARY: ...",
      "SESSION_ID: HEX-350-20251031-103000"
    ]
  }]
});

// 2. Add tags
mcp__memento__add_observations({
  observations: [{
    entityName: "Session: HEX-350-Ticket-Creation",
    contents: [
      "TAG: project:hextrackr",
      "TAG: backend",
      "TAG: feature",
      "TAG: completed",
      "TAG: week-44-2025",
      "TAG: v1.1.10",
      "TAG: HEX-350"
    ]
  }]
});
```

### Save a Pattern
```javascript
mcp__memento__create_entities({
  entities: [{
    name: "Pattern: Hostname-Parser-Service",
    entityType: "HEXTRACKR:BACKEND:PATTERN",
    observations: [
      "TIMESTAMP: 2025-10-31T10:30:00.000Z",
      "ABSTRACT: Singleton hostname parser with pattern matching",
      "SUMMARY: ...",
      "PATTERN_ID: HOSTNAME-PARSER-20251031"
    ]
  }]
});

mcp__memento__add_observations({
  observations: [{
    entityName: "Pattern: Hostname-Parser-Service",
    contents: [
      "TAG: project:hextrackr",
      "TAG: backend",
      "TAG: pattern",
      "TAG: reusable",
      "TAG: best-practice",
      "TAG: week-44-2025"
    ]
  }]
});
```

### Save a Breakthrough
```javascript
mcp__memento__create_entities({
  entities: [{
    name: "Breakthrough: SRPI-Scope-Reduction-Strategy",
    entityType: "HEXTRACKR:WORKFLOW:BREAKTHROUGH",
    observations: [
      "TIMESTAMP: 2025-10-31T10:30:00.000Z",
      "ABSTRACT: Search Memento first to avoid assumption-based planning",
      "SUMMARY: ...",
      "BREAKTHROUGH_ID: SRPI-MEMENTO-FIRST-20251031"
    ]
  }]
});

mcp__memento__add_observations({
  observations: [{
    entityName: "Breakthrough: SRPI-Scope-Reduction-Strategy",
    contents: [
      "TAG: project:hextrackr",
      "TAG: workflow",
      "TAG: breakthrough",
      "TAG: lesson-learned",
      "TAG: reusable",
      "TAG: best-practice",
      "TAG: week-44-2025"
    ]
  }]
});
```

## Common Recall Patterns

### Find Recent Work
```javascript
mcp__memento__search_nodes({
  query: "week-44-2025 project:hextrackr completed"
})
```

### Find Similar Bugs
```javascript
mcp__memento__semantic_search({
  query: "import timeout error critical-bug lesson-learned",
  limit: 10,
  min_similarity: 0.6,
  entity_types: ["HEXTRACKR:BACKEND:ISSUE", "HEXTRACKR:WORKFLOW:INSIGHT"]
})
```

### Find Design Patterns
```javascript
mcp__memento__semantic_search({
  query: "modal design patterns frontend reusable",
  limit: 10,
  hybrid_search: true
})
```

### Find Architectural Decisions
```javascript
mcp__memento__search_nodes({
  query: "project:hextrackr ARCHITECTURE:DECISION q4-2025"
})
```

## Temporal Tag Examples

Generated by `scripts/generate_tags.py`:

```
Current Week:    week-44-2025
Current Month:   2025-10
Current Quarter: q4-2025
Current Version: v1.1.10
```

Use these tags consistently for time-based filtering.

## Never Do

- ❌ Use `read_graph` (will fail with 200K+ tokens)
- ❌ Create entities without TIMESTAMP, ABSTRACT, SUMMARY, *_ID
- ❌ Skip project tag (project:hextrackr)
- ❌ Skip category tag (frontend/backend/database)
- ❌ Skip temporal tag (week-XX-YYYY)
- ❌ Forget "TAG: " prefix in add_observations
- ❌ Use creative entity types (follow PROJECT:DOMAIN:TYPE)

## Always Do

- ✅ Search Memento FIRST before architectural assumptions
- ✅ Use `generate_tags.py` for temporal tags
- ✅ Follow required observations order
- ✅ Add minimum 3 tags (project, category, temporal)
- ✅ Use semantic_search for concepts, search_nodes for exact tags
- ✅ Link related entities with relations
- ✅ Add issue tag when working on Linear issues (HEX-XXX)

---

**Full Documentation**: `/docs/TAXONOMY.md`
**Source of Truth**: Linear DOCS-14 (check first)
