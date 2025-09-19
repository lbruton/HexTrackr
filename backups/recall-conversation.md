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
2. **Keyword Search**: If no ID match, search by topic keywords
3. **Date Range**: Search conversations from specific time period
4. **Project Context**: Filter by project classification (HEXTRACKR:DEVELOPMENT:SESSION)

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