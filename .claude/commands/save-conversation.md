Save current conversation highlights to Memento with auto-generated session ID: $ARGUMENTS

**Action**: Create a focused Memento entity with unique session ID capturing the essential outcomes of this conversation.

**Focus Areas:**
- Key decisions and solutions discussed
- Technical patterns or approaches identified
- Problems solved and methods used
- Workflow improvements discovered
- Project-specific insights with proper classification

**Entity Details:**
- **Classification**: Use PROJECT:DOMAIN:TYPE pattern (e.g., HEXTRACKR:DEVELOPMENT:SESSION)
- **Name**: Descriptive title based on main topic and context
- **Observations**: Actionable outcomes and key learnings (not full transcripts)
- **Relations**: Link to current project and related technical concepts

**Session ID Generation:**
```javascript
// Auto-generate session ID: PROJECT-KEYWORD-YYYYMMDD-NNN
const generateSessionID = (keyword, project = "HEXTRACKR") => {
  const date = new Date().toISOString().slice(0,10).replace(/-/g, "");
  const sequence = "001"; // Increment based on daily count
  return `${project}-${keyword.toUpperCase()}-${date}-${sequence}`;
};

// Example: "HEXTRACKR-AUTH-20250907-001"
```

**Memory Tools:**
```javascript
mcp__memento__create_entities([{
  name: "Session: [GENERATED_SESSION_ID]",
  entityType: "PROJECT:DEVELOPMENT:SESSION", 
  observations: [
    `TIMESTAMP: ${new Date().toISOString()}`,  // ALWAYS FIRST
    "SESSION_ID: [GENERATED_SESSION_ID]",
    "key outcomes", 
    "important decisions", 
    "technical insights"
  ]
}])
```

**Instructions**: 
1. **Generate Session ID**: Create unique ID using PROJECT-KEYWORD-DATE-SEQUENCE format
2. **Add Timestamp**: Include ISO 8601 timestamp as FIRST observation (required for conflict resolution)
3. **Extract Key Content**: Save valuable outcomes, decisions, and insights (we just need to preserve the full session context not full transcripts)
4. **Apply Classification**: Use PROJECT:DEVELOPMENT:SESSION entity type
5. **Include Session ID**: Add session ID as second observation for easy recall
6. **Return Session ID**: Display generated session ID to user after saving

**⚠️ TIMESTAMP REQUIREMENT**: Every Memento entity MUST include ISO 8601 timestamp as FIRST observation for temporal tracking and conflict resolution.

**Output After Saving:**
```
✅ Conversation saved successfully!
📋 Session ID: [GENERATED_SESSION_ID]
🔍 Use: /recall-conversation id:[SESSION_ID] to retrieve this conversation
```

Now process the conversation, generate session ID, and create the Memento entity with these guidelines.