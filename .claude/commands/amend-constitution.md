# Amend Constitution

Invokes the Spec-Kit Constitutional Expert to properly handle constitutional amendments and framework changes.

## Usage
Type `/amend-constitution [your proposed change]` to request a constitutional amendment.

## What This Does

1. **Analyzes your request** to determine if it's universal or project-specific
2. **Validates** against spec-kit principles
3. **Separates** universal rules from implementation details
4. **Updates** the appropriate files (.claude/constitution.md or CLAUDE.md)
5. **Preserves** the sacred separation

## Implementation

```javascript
// Load the Spec-Kit Constitutional Expert
const agent = await Read(".claude/agents/spec-kit-constitutional-expert.md");

// Analyze the proposed amendment
const proposal = args; // The amendment request

// Classify the change
const analysis = {
  isUniversal: !proposal.match(/hextrackr|\.active-spec|8989|docker|copilot/i),
  hasProjectPaths: proposal.match(/[\w-]+\/[\w-]+\//),
  mentionsTools: proposal.match(/docker|playwright|codacy|sqlite/i),
  isValid: true
};

// Determine target
if (analysis.isUniversal && !analysis.hasProjectPaths && !analysis.mentionsTools) {
  console.log("✅ This is a valid universal principle for the constitution");
  // Update .claude/constitution.md
} else if (!analysis.isUniversal || analysis.hasProjectPaths || analysis.mentionsTools) {
  console.log("📁 This contains project-specific details for CLAUDE.md");
  // Update CLAUDE.md
} else {
  console.log("🔀 This needs to be split between constitution and CLAUDE.md");
  // Split and update both
}

// Generate proper amendment
console.log(`
## Constitutional Amendment Analysis

### Request: "${proposal}"

### Classification:
- Universal Principle: ${analysis.isUniversal}
- Contains Paths: ${analysis.hasProjectPaths}
- Contains Tools: ${analysis.mentionsTools}

### Recommendation:
${analysis.isUniversal ? 
  "Add to constitution as new article" : 
  "Add to CLAUDE.md under project-specific rules"}

### Validation Checklist:
- [ ] Works for Python project
- [ ] Works for mobile app  
- [ ] Works without Docker
- [ ] Tool-agnostic
- [ ] Path-agnostic

### Next Steps:
1. Review the analysis
2. Confirm the classification
3. Apply to correct file
4. Update version if constitutional
5. Save to memento
`);
```

## Examples

### Good Universal Principle:
```
/amend-constitution "All code reviews must include performance analysis"
```
→ Goes in constitution (universal rule)

### Project-Specific Detail:
```
/amend-constitution "Use .active-spec file to track current work"
```
→ Goes in CLAUDE.md (HexTrackr-specific)

### Mixed (Needs Separation):
```
/amend-constitution "Track specifications in .active-spec and require docker for testing"
```
→ Split: Universal principle in constitution, implementation in CLAUDE.md

## Common Violations Prevented

The agent will catch and prevent:
- 🚫 Project paths in constitution
- 🚫 Tool names in constitution
- 🚫 Port numbers in constitution
- 🚫 File names in constitution
- 🚫 Technology choices in constitution

## The Sacred Separation

**Constitution** = WHAT (universal principles)
**CLAUDE.md** = HOW (project implementation)

## Agent Activation

This command loads the Spec-Kit Constitutional Expert who:
1. Guards constitutional purity
2. Ensures spec-kit compliance
3. Maintains separation of concerns
4. Validates all amendments
5. Updates templates if needed

## Related Commands
- `/specify` - Start new specification
- `/plan` - Create implementation plan
- `/tasks` - Generate tasks
- `/save-insights` - Preserve knowledge