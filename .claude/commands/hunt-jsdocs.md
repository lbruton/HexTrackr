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
3. **Check Memento for duplicate work:**
   - Use semantic search: `mcp__memento__semantic_search({ query: "[function name] JSDoc documentation [file name]", entity_types: ["HEXTRACKR:DOCUMENTATION:ISSUE"], limit: 5 })`
   - Check for similar issues already logged
   - If duplicate found, skip to next function
   - This prevents recreating already-identified issues
4. Create a Linear issue in HexTrackr-Docs team with:
   - Title: "JSDOC FIX: [brief description]"
   - Include: Current state, problem description, suggested fix with complete JSDoc
   - Labels: ["documentation", "technical-debt"]
   - Priority: Low
5. **Save to Memento:**
   - Create entity:
     - Name: "Documentation Issue: [ISSUE-ID] - [brief description]"
     - Type: `HEXTRACKR:DOCUMENTATION:ISSUE`
     - Observations:
       - `TIMESTAMP: [ISO 8601 format]`
       - `ABSTRACT: Missing JSDoc for [functionName] in [filename]`
       - `SUMMARY: File: [path]:[line]. Function: [functionName]. Missing: [list missing tags]. Suggested fix: [brief description]`
       - `ISSUE_ID: [DOCS-XXX]`
       - `FILE_PATH: [full file path]`
       - `ISSUE_TYPE: jsdoc-missing`
     - Tags:
       - `TAG: project:hextrackr`
       - `TAG: documentation`
       - `TAG: [ISSUE-ID]`
       - `TAG: jsdoc-missing`
       - `TAG: week-[XX]-2025`
       - `TAG: identified`
6. Report the issue number and link

Only create ONE issue per hunt - this is a daily incremental improvement process.
