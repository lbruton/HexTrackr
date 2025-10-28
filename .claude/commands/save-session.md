---
description: Save complete session + auto-extract reusable insights to Memento
allowed-tools: mcp__memento__create_entities, mcp__memento__create_relations, mcp__memento__add_observations
argument-hint: [keyword] [project:name]
---
Save complete session context + auto-extract reusable insights to Memento: $ARGUMENTS

**Action**: Comprehensive knowledge capture combining session chronicle + insight extraction.

**Project Detection**: Auto-detects from working directory, or override with `project:name` argument

**Usage**:
- `/save-session` (auto-detects project, infers keyword from conversation)
- `/save-session keyword:authentication` (explicit keyword)
- `/save-session project:stacktrackr` (explicit project override)

**Two-Phase Process**:

## Phase 1: Extract Reusable Insights (if any exist)

**Insight Quality Threshold** - Save insights that meet ANY of these criteria:
- ✅ Breakthrough discovery or novel solution
- ✅ Reusable pattern applicable across projects
- ✅ Best practice or anti-pattern identified
- ✅ Workflow optimization with measurable impact
- ✅ Architectural decision with broad implications
- ✅ Technical pattern worth preserving for future reference

**Skip insights if**: Session was routine work with no broadly applicable discoveries.

**Insight Entity Structure**:
```javascript
mcp__memento__create_entities([{
  name: "Insight: [DESCRIPTIVE_TITLE]",
  entityType: "PROJECT:DOMAIN:TYPE", // e.g., HEXTRACKR:DOCUMENTATION:PATTERN
  observations: [
    `TIMESTAMP: ${new Date().toISOString()}`,
    "ABSTRACT: [One-line summary of the key insight]",
    "SUMMARY: [Detailed description: what was discovered, why it matters, how to implement, when to apply]",
    "INSIGHT_ID: [PROJECT-INSIGHT-YYYYMMDD-HHMMSS]",
    "[actionable knowledge]",
    "[implementation details]",
    "[best practices]"
  ]
}])
```

**Insight Tags**:
```javascript
mcp__memento__add_observations({
  observations: [{
    entityName: "Insight: [DESCRIPTIVE_TITLE]",
    contents: [
      "TAG: project:[project-name]",
      "TAG: [domain]", // frontend, backend, documentation, testing, etc.
      "TAG: [learning-type]", // breakthrough, pattern, lesson-learned, best-practice
      "TAG: reusable", // if applicable across projects
      "TAG: week-[XX]-2025",
      "TAG: v[version]" // if applicable
    ]
  }]
})
```

## Phase 2: Save Session Context (always)

**Session ID Generation**:
```javascript
// Auto-generate: PROJECT-KEYWORD-YYYYMMDD-HHMMSS
const generateSessionID = (keyword, args = "") => {
  const PROJECT = getProject(args); // Auto-detect or explicit
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');

  return `${PROJECT}-${keyword.toUpperCase()}-${year}${month}${day}-${hours}${minutes}${seconds}`;
};
```

**Session Entity Structure**:
```javascript
mcp__memento__create_entities([{
  name: "Session: [GENERATED_SESSION_ID]",
  entityType: "PROJECT:DEVELOPMENT:SESSION",
  observations: [
    `TIMESTAMP: ${new Date().toISOString()}`,
    "ABSTRACT: [One-line summary of conversation focus]",
    "SUMMARY: [Detailed description: key outcomes, decisions made, technical insights discovered, problems solved, workflow improvements]",
    "SESSION_ID: [GENERATED_SESSION_ID]",
    "OUTCOME: [key outcome 1]",
    "OUTCOME: [key outcome 2]",
    "DECISION: [important decision]",
    "PATTERN: [workflow pattern]",
    "INSIGHT: [technical insight]",
    "TECHNICAL_DETAIL: [implementation detail]",
    "WORKFLOW_IMPROVEMENT: [process improvement]",
    "ANTI_PATTERN_AVOIDED: [what we avoided and why]"
  ]
}])
```

**Session Tags**:
```javascript
mcp__memento__add_observations({
  observations: [{
    entityName: "Session: [GENERATED_SESSION_ID]",
    contents: [
      "TAG: project:[project-name]",
      "TAG: linear:[ISSUE-ID]", // if applicable
      "TAG: [domain]", // frontend, backend, database, etc.
      "TAG: [impact]", // feature, enhancement, critical-bug, etc.
      "TAG: [status]", // completed, in-progress, blocked
      "TAG: [learning-tag]", // breakthrough, pattern, lesson-learned (if applicable)
      "TAG: week-[XX]-2025",
      "TAG: v[version]" // if applicable
    ]
  }]
})
```

## Phase 3: Link Session to Insights (if insights were created)

```javascript
// Create relations: SESSION --PRODUCED--> INSIGHT
mcp__memento__create_relations([{
  from: "Session: [SESSION_ID]",
  to: "Insight: [INSIGHT_TITLE]",
  relationType: "PRODUCED"
}])
```

## Output Format

**If insights extracted**:
```
✅ Session saved successfully!
📋 Session ID: HEXTRACKR-JSDOC-20251023-033655

💡 Extracted 2 insights:
  1. Three-example JSDoc documentation pattern
  2. Linear-integrated automation workflow

🔗 2 SESSION→INSIGHT relations created

🔍 Recall commands:
  Session: /recall-conversation id:HEXTRACKR-JSDOC-20251023-033655
  Insights: Search Memento for "three-example JSDoc" or "Linear automation"
```

**If no insights** (routine work):
```
✅ Session saved successfully!
📋 Session ID: HEXTRACKR-ROUTINE-20251023-034500

🔍 Recall: /recall-conversation id:HEXTRACKR-ROUTINE-20251023-034500

ℹ️ No broadly applicable insights detected (routine work session)
```

## Instructions

1. **Analyze conversation** for reusable insights using quality threshold
2. **Generate SESSION_ID** from conversation topic (or use provided keyword)
3. **Create INSIGHT entities** (0-N based on what's found)
4. **Create SESSION entity** (always)
5. **Link them together** with PRODUCED relations
6. **Report results** with recall commands

**Key Principle**: Save SESSION for temporal context (always). Extract INSIGHTS for semantic reusability (when quality threshold met). Link them for bidirectional navigation.

Now process the conversation, generate IDs, and create the comprehensive Memento entities with these guidelines.
