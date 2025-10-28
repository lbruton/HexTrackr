---
description: Recall a specific conversation by session ID from Memento
allowed-tools: mcp__memento__search_nodes, mcp__memento__semantic_search, mcp__memento__open_nodes
argument-hint: id:SESSION_ID or keyword:KEYWORD
---
Recall a specific conversation by session ID: $ARGUMENTS

**Action**: Retrieve and summarize a previously saved conversation using its unique session ID.

**Project Detection**: Auto-detects from working directory, or override with `project:name` argument

**Usage Patterns:**
```bash
/recall-conversation id:HEXTRACKR-AUTH-20250907-143045    # Full session ID with timestamp
/recall-conversation id:12                                # Shorthand ID lookup
/recall-conversation keyword:authentication                # Search by keyword
/recall-conversation keyword:auth project:stacktrackr     # Explicit project override
```

**Project Context Helper:**
```javascript
// Auto-detect project or use explicit override
const getProject = (args = "") => {
  // Priority 1: Explicit project argument
  const projectMatch = args.match(/project:(\w+)/i);
  if (projectMatch) return projectMatch[1].toUpperCase();

  // Priority 2: Git repository name from working directory
  // Example: /Volumes/DATA/GitHub/HexTrackr/ → HEXTRACKR
  try {
    const cwd = process.cwd(); // Get current working directory
    const parts = cwd.split('/').filter(p => p.length > 0);
    const repoName = parts[parts.length - 1];
    if (repoName && repoName !== 'tmp') return repoName.toUpperCase();
  } catch (e) {}

  // Priority 3: Fallback to generic
  return "PROJECT";
};

const PROJECT = getProject($ARGUMENTS);
const PROJECT_TAG = `project:${PROJECT.toLowerCase()}`;
```

**Memory Tools:**
```javascript
// Primary recall by session ID (use keyword search for exact ID matching)
mcp__memento__search_nodes({
  query: "SESSION_ID: ${sessionId}"  // Exact ID with prefix
})

// Fallback: Search by topic/keyword (use semantic for conceptual matching)
mcp__memento__semantic_search({
  query: "conversation keyword topic",
  limit: 10,
  min_similarity: 0.6,
  hybrid_search: true    // Hybrid for best results with mixed content
})

// Get detailed conversation entity
mcp__memento__open_nodes({
  names: ["Found Session Entity Name"]
})
```

**Search Strategies:**
1. **Direct ID Match**: Search for exact session ID in observations
2. **Tag-Based Search**: Use tags for precise filtering (spec:001, project:hextrackr, etc.)
3. **Keyword Search**: If no ID match, search by topic keywords
4. **Date Range**: Search conversations from specific time period
5. **Project Context**: Filter by project classification (HEXTRACKR:DEVELOPMENT:SESSION)

**Tag-Based Search Examples (use search_nodes for exact tags, semantic_search for concepts):**
- `"spec:001 backend"` - All backend sessions for spec 001 (search_nodes)
- `"project:hextrackr breakthrough"` - HexTrackr breakthrough sessions (search_nodes)
- `"linear:HEX-101 completed"` - Sessions for Linear issue HEX-101 (search_nodes)
- `"week-38-2025 completed"` - This week's completed sessions (search_nodes)
- `"frontend pattern discovery implementation"` - Frontend patterns (semantic_search)
- `"testing lessons quality improvements"` - Testing insights (semantic_search)
- `"v1.0.16 breaking-change"` - Sessions with breaking changes (search_nodes)

**Tag Reference**: See `TAXONOMY.md` in project root (or Linear DOCS-14 if available)

**Output Format:**
```
📋 Session ID: [FOUND_SESSION_ID]
📅 Date: [EXTRACTED_DATE] 
🎯 Topic: [SESSION_TOPIC]
🔍 Key Outcomes:
  - [Key outcome 1]
  - [Key outcome 2]
  - [Key outcome 3]

💡 Context: [Brief summary of what was discussed and decided]
```

**Instructions**:
1. **ID Search**: If $ARGUMENTS contains "id:", extract the session ID and use search_nodes for exact match
2. **Keyword Search**: If no ID provided, use semantic_search for topic/concept matching
3. **Format Output**: Return structured summary with session details and key outcomes

**Search Logic:**
- For "id:HEXTRACKR-CVESPLIT-20250910-001" → use search_nodes for "SESSION_ID: HEXTRACKR-CVESPLIT-20250910-001"
- For "keyword:authentication" → use semantic_search for "authentication" concepts
- For tags like "spec:001" → use search_nodes for exact tag matching
- For concepts like "performance optimization" → use semantic_search

Now search for and retrieve the requested conversation session.