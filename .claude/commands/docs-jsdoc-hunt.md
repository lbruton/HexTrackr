---
runInSubAgent: false
autoApprove: true
---

# JSDoc Documentation Hunt

Use claude-context semantic search to find ONE function in the HexTrackr codebase that is missing proper JSDoc documentation.

Search criteria:
- Focus on controller and service files (app/controllers/, app/services/)
- Look for functions missing @param, @returns, or @throws tags
- Prioritize public API functions over internal helpers
- Exclude functions that already have complete JSDoc

When you find a suitable function:

1. Read the file to confirm the function's current JSDoc state
2. Analyze the function to understand:
   - Input parameters and their types
   - Return value and type
   - Possible error conditions
3. Create a Linear issue in HexTrackr-Docs team with:
   - Title: "JSDOC FIX: [brief description]"
   - Include: Current state, problem description, suggested fix with complete JSDoc
   - Labels: ["documentation", "technical-debt"]
   - Priority: Low
4. Report the issue number and link

Only create ONE issue per hunt - this is a daily incremental improvement process.
