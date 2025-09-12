Create comprehensive handoff package with unique handoff ID: $ARGUMENTS

**Action**: Generate standardized handoff with session ID, searchable knowledge (Memento), and session state for seamless workflow transitions.

**Step 1: Generate Handoff ID**
```javascript
// Auto-generate handoff ID: PROJECT-HANDOFF-YYYYMMDD-NNN
const generateHandoffID = (project = "HEXTRACKR") => {
  const date = new Date().toISOString().slice(0,10).replace(/-/g, "");
  const sequence = "001"; // Increment based on daily count
  return `${project}-HANDOFF-${date}-${sequence}`;
};
// Example: "HEXTRACKR-HANDOFF-20250907-001"
```

**Step 2: Save to Memento with ID**
```javascript
mcp__memento__create_entities([{
  name: "Handoff: [GENERATED_HANDOFF_ID]",
  entityType: "PROJECT:DEVELOPMENT:HANDOFF",
  observations: [
    "HANDOFF_ID: [GENERATED_HANDOFF_ID]",
    "Session context and current task status",
    "Key decisions made during session", 
    "Next steps and outstanding tasks",
    "Active files and their current state"
  ]
}])
```

**Step 3: Create Local Handoff File (Optional)**
- Ensure `.claude/.handoff/` directory exists in project root
- Generate ID-based JSON file: `[HANDOFF_ID].json`
- Include session state data:
  - Handoff ID for cross-reference
  - Current task context and objectives
  - Active files and their locations (with line numbers if relevant)
  - Key decisions made during session
  - Next steps and outstanding tasks
  - Tool configurations and commands used
  - Any temporary state or work-in-progress details

**JSON Structure:**
```json
{
  "handoff_id": "HEXTRACKR-HANDOFF-20250907-001",
  "timestamp": "2025-09-07T14:30:45Z",
  "project": "HexTrackr", 
  "session_context": "Brief description",
  "active_files": ["path:line", "path:line"],
  "key_decisions": ["decision 1", "decision 2"],
  "next_steps": ["step 1", "step 2"],
  "tools_used": ["tool1", "tool2"],
  "notes": "Additional context"
}
```

**Output After Creation:**
```
✅ Handoff package created successfully!
📋 Handoff ID: [GENERATED_HANDOFF_ID]
🔍 Use: /recall-handoff id:[HANDOFF_ID] to retrieve this handoff
📁 JSON file: .claude/.handoff/[HANDOFF_ID].json (if created)
```

**Instructions**: If $ARGUMENTS provided, use as handoff focus or recipient context. Generate handoff ID, create Memento entity with standardized format, and optionally create JSON file for detailed session state.

Now execute the standardized handoff creation process.