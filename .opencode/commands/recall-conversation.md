Recall a specific conversation by session ID: $ARGUMENTS

**Action**: Retrieve and summarize a previously saved conversation using its unique session ID.

**Usage Patterns:**
```bash
/recall-conversation id:HEXTRACKR-AUTH-20250907-143045    # Full session ID with timestamp
/recall-conversation id:12                                # Shorthand ID lookup
/recall-conversation keyword:authentication                # Search by keyword
```

**Memory Tools:**
```javascript
// Primary recall by session ID (exact match)
mcp__memento__search_nodes({
  query: "SESSION_ID: ${sessionId}",  // Exact ID with prefix
  mode: "keyword",        // Exact ID matching
  topK: 5
})

// Fallback: Search by keyword if ID not found
mcp__memento__search_nodes({
  query: "conversation keyword topic",
  mode: "hybrid",         // Semantic + keyword search
  topK: 10
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

**Tag-Based Search Examples:**
- `"spec:001 backend"` - All backend sessions for spec 001
- `"project:hextrackr breakthrough"` - HexTrackr breakthrough sessions
- `"week-38-2025 completed"` - This week's completed sessions
- `"frontend pattern"` - Frontend pattern discovery sessions
- `"lesson-learned testing"` - Testing lesson sessions
- `"v1.0.16 breaking-change"` - Sessions with breaking changes

**Tag Reference**: See `/Volumes/DATA/GitHub/HexTrackr/memento/TAXONOMY.md`

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
1. **ID Search**: If $ARGUMENTS contains "id:", extract the session ID and search for "SESSION_ID: ${sessionId}" exactly as stored
2. **Keyword Search**: If no ID provided, search by conversation topic/keyword using hybrid mode
3. **Format Output**: Return structured summary with session details and key outcomes

**Search Logic:**
- For "id:HEXTRACKR-CVESPLIT-20250910-001" → search for "SESSION_ID: HEXTRACKR-CVESPLIT-20250910-001"
- For "keyword:authentication" → search for "authentication" with hybrid mode
- Always use keyword mode for session ID searches to ensure exact matching

Now search for and retrieve the requested conversation session.