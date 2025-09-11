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

**Memory Tools:**
```javascript
mcp__memento__create_entities([{
  name: "Specific Insight Title",
  entityType: "PROJECT:DOMAIN:TYPE",
  observations: ["actionable knowledge", "implementation details", "best practices"]
}])

mcp__memento__create_relations([{
  from: "New Insight",
  to: "Related Entity",
  relationType: "IMPLEMENTS" // or DEPENDS_ON, SOLVES, etc.
}])
```

**Selection Criteria**: Save only insights with broad applicability or significant project impact. Avoid session-specific details - focus on reusable knowledge.

**Instructions**: If $ARGUMENTS provided, use as insight category or specific focus area. Create entity capturing the gems worth preserving for future development work.

Now identify and save the key insights from this session using proper classification.