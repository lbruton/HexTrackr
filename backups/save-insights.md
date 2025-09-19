Extract and save high-value insights to Memento with PROJECT:DOMAIN:TYPE classification: $ARGUMENTS

**Action**: Create a selective Memento entity focusing on the most valuable technical and workflow discoveries from current session.

**Target Insights:**
- Technical patterns and architectural decisions
- Workflow optimizations and process improvements  
- Code quality discoveries and best practices
- Tool configurations and integration patterns
- Performance optimizations and debugging techniques
- Security considerations and implementation approaches

**Entity Details:**
- **Classification**: Use PROJECT:DOMAIN:TYPE (e.g., SYSTEM:WORKFLOW:PATTERN, HEXTRACKR:SECURITY:INSIGHT)
- **Name**: Specific, searchable title describing the core insight
- **Observations**: Concrete, actionable knowledge applicable to future projects
- **Relations**: Connect to relevant technologies, frameworks, or project patterns

**Insight ID Generation:**
```javascript
// Auto-generate insight ID: PROJECT-INSIGHT-YYYYMMDD-HHMMSS
const generateInsightID = (project = "HEXTRACKR") => {
  const now = new Date();
  const date = now.toISOString().slice(0,10).replace(/-/g, "");
  const time = now.toTimeString().slice(0,8).replace(/:/g, "");
  return `${project}-INSIGHT-${date}-${time}`;
};

// Example: "HEXTRACKR-INSIGHT-20250907-143045"
```

**Memory Tools:**
```javascript
mcp__memento__create_entities([{
  name: "Insight: [GENERATED_INSIGHT_ID]",
  entityType: "PROJECT:DOMAIN:TYPE",
  observations: [
    `TIMESTAMP: ${new Date().toISOString()}`,                    // ALWAYS FIRST
    `ABSTRACT: [One-line summary of the key insight]`,          // ALWAYS SECOND
    `SUMMARY: [Detailed description: what was discovered, why it matters, how to implement, and when to apply this knowledge]`, // ALWAYS THIRD
    "INSIGHT_ID: [GENERATED_INSIGHT_ID]",
    "actionable knowledge",
    "implementation details",
    "best practices"
  ]
}])

mcp__memento__create_relations([{
  from: "New Insight",
  to: "Related Entity",
  relationType: "IMPLEMENTS" // or DEPENDS_ON, SOLVES, etc.
}])
```

**Selection Criteria**: Save only insights with broad applicability or significant project impact. Avoid session-specific details - focus on reusable knowledge.

**Instructions**:
1. **Generate Insight ID**: Create unique ID using PROJECT-INSIGHT-DATE-TIME format
2. **Extract Key Insight**: Identify the most valuable reusable knowledge from the session
3. **Apply Classification**: Use appropriate PROJECT:DOMAIN:TYPE entity type
4. **Include Insight ID**: Add insight ID as observation for easy recall
5. **Return Insight ID**: Display generated insight ID to user after saving

**Output After Saving:**
```
✅ Insight saved successfully!
📋 Insight ID: [GENERATED_INSIGHT_ID]
🔍 Use: /recall-insight id:[INSIGHT_ID] to retrieve this insight
```

If $ARGUMENTS provided, use as insight category or specific focus area. Create entity capturing the gems worth preserving for future development work.

Now identify and save the key insights from this session using proper classification.