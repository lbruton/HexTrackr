---
description: Save current conversation highlights to Memento with auto-generated session ID
allowed-tools: mcp__memento__create_entities, mcp__memento__create_relations, mcp__memento__add_observations
argument-hint: [keyword] [project:name]
---
Save current conversation highlights to Memento with auto-generated session ID: $ARGUMENTS

**Action**: Create a focused Memento entity with unique session ID capturing the essential outcomes of this conversation.

**Project Detection**: Auto-detects from working directory, or override with `project:name` argument

**Usage**:
- `/save-conversation` (auto-detects project)
- `/save-conversation project:stacktrackr` (explicit project override)
- `/save-conversation keyword:authentication` (custom keyword with auto-detect project)

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

**Project Context & Session ID Generation:**
```javascript
// Auto-detect project or use explicit override
const getProject = (args = "") => {
  // Priority 1: Explicit project argument
  const projectMatch = args.match(/project:(\w+)/i);
  if (projectMatch) return projectMatch[1].toUpperCase();

  // Priority 2: Git repository name from working directory
  try {
    const cwd = process.cwd();
    const parts = cwd.split('/').filter(p => p.length > 0);
    const repoName = parts[parts.length - 1];
    if (repoName && repoName !== 'tmp') return repoName.toUpperCase();
  } catch (e) {}

  // Priority 3: Fallback to generic
  return "PROJECT";
};

// Auto-generate session ID: PROJECT-KEYWORD-YYYYMMDD-HHMMSS
const generateSessionID = (keyword, args = "") => {
  const PROJECT = getProject(args);
  const now = new Date();

  // DATE VERIFICATION: Ensure we're using correct current date
  console.log(`Current UTC time: ${now.toISOString()}`);
  console.log(`Current local time: ${now.toString()}`);

  // Use UTC to ensure consistent timestamps
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');

  const date = `${year}${month}${day}`;
  const time = `${hours}${minutes}${seconds}`;

  // Verify the date is reasonable (not in far future or past)
  if (year < 2024 || year > 2026) {
    console.warn(`WARNING: Unusual year detected: ${year}. Please verify system date.`);
  }

  return `${PROJECT}-${keyword.toUpperCase()}-${date}-${time}`;
};

// Examples:
// HEXTRACKR-AUTH-20251002-143045 (auto-detected from /GitHub/HexTrackr/)
// STACKTRACKR-VULN-20251002-143045 (auto-detected from /GitHub/StackTrackr/)
// MYPROJECT-CONFIG-20251002-143045 (explicit: project:myproject)
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

// Step 2: Add tags per TAXONOMY.md (using add_observations with TAG: prefix)
const PROJECT_TAG = `project:${PROJECT.toLowerCase()}`;

mcp__memento__add_observations({
  observations: [{
    entityName: "Session: [GENERATED_SESSION_ID]",
    contents: [
      `TAG: ${PROJECT_TAG}`,                // Required: Auto-detected or explicit project tag
      "TAG: linear:[LINEAR_ISSUE]",         // Optional: linear:HEX-101, linear:DOCS-14, etc.
      "TAG: spec:[SPEC_NUMBER]",            // Optional: spec:001, spec:002, etc.
      "TAG: [CATEGORY]",                    // Required: frontend, backend, database, etc.
      "TAG: [IMPACT]",                      // Optional: feature, enhancement, critical-bug, etc.
      "TAG: [WORKFLOW_STATUS]",             // Required: completed, in-progress, blocked
      "TAG: [LEARNING_TAG]",                // Optional: breakthrough, pattern, lesson-learned
      `TAG: week-${getWeekNumber()}-${new Date().getFullYear()}`,  // Auto-generated temporal tag
      "TAG: v[CURRENT_VERSION]"             // Version tag if applicable
    ]
  }]
})

// Helper function for week number with date verification
const getWeekNumber = () => {
  const d = new Date();

  // DATE VERIFICATION
  const year = d.getFullYear();
  if (year < 2024 || year > 2026) {
    console.warn(`WARNING: Unusual year in week calculation: ${year}`);
  }

  const onejan = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);

  // Verify week number is reasonable (1-53)
  if (weekNum < 1 || weekNum > 53) {
    console.warn(`WARNING: Unusual week number calculated: ${weekNum}`);
  }

  return weekNum;
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