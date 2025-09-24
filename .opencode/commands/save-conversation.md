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
// Auto-generate session ID: PROJECT-KEYWORD-YYYYMMDD-HHMMSS
const generateSessionID = (keyword, project = "HEXTRACKR") => {
  const now = new Date();
  const date = now.toISOString().slice(0,10).replace(/-/g, "");
  const time = now.toTimeString().slice(0,8).replace(/:/g, "");
  return `${project}-${keyword.toUpperCase()}-${date}-${time}`;
};

// Example: "HEXTRACKR-AUTH-20250907-143045"
```

**Memory Tools:**
```javascript
// Step 1: Create the entity
mcp__memento__create_entities([{
  name: "Session: [GENERATED_SESSION_ID]",
  entityType: "PROJECT:DEVELOPMENT:SESSION",
  observations: [
    `TIMESTAMP: ${new Date().toISOString()}`,                    // ALWAYS FIRST
    `ABSTRACT: [One-line summary of conversation focus]`,       // ALWAYS SECOND
    `SUMMARY: [Detailed description: key outcomes, decisions made, technical insights discovered, problems solved, and workflow improvements identified]`, // ALWAYS THIRD
    "SESSION_ID: [GENERATED_SESSION_ID]",
    "key outcomes",
    "important decisions",
    "technical insights"
  ]
}])

// Step 2: Add tags per TAXONOMY.md
mcp__memento__add_tags({
  entityName: "Session: [GENERATED_SESSION_ID]",
  tags: [
    "project:[PROJECT_NAME]",        // Required: project:hextrackr, project:zen, etc.
    "spec:[SPEC_NUMBER]",            // If working on a spec: spec:001, spec:002, etc.
    "[CATEGORY]",                    // Required: frontend, backend, database, etc.
    "[IMPACT]",                      // Optional: feature, enhancement, critical-bug, etc.
    "[WORKFLOW_STATUS]",             // Required: completed, in-progress, blocked
    "[LEARNING_TAG]",                // Optional: breakthrough, pattern, lesson-learned
    `week-${getWeekNumber()}-${new Date().getFullYear()}`,  // Auto-generated temporal tag
    "v[CURRENT_VERSION]"             // Version tag if applicable
  ]
})

// Helper function for week number
const getWeekNumber = () => {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
};
```

**Instructions**:
1. **Generate Session ID**: Create unique ID using PROJECT-KEYWORD-DATE-TIME format
2. **Extract Key Content**: Save valuable outcomes, decisions, and insights (we just need to preserve the full session context not full transcripts)
3. **Apply Classification**: Use PROJECT:DEVELOPMENT:SESSION entity type
4. **Include Session ID**: Add session ID as first observation for easy recall
5. **Return Session ID**: Display generated session ID to user after saving

**Output After Saving:**
```
✅ Conversation saved successfully!
📋 Session ID: [GENERATED_SESSION_ID]
🔍 Use: /recall-conversation id:[SESSION_ID] to retrieve this conversation
```

Now process the conversation, generate session ID, and create the Memento entity with these guidelines.