---
runInSubAgent: false
autoApprove: false
---

# JSDoc Documentation Fix

Use linear-server to find and fix ONE JSDOC FIX issue from the HexTrackr-Docs team.

Steps:

1. **Find the oldest incomplete JSDOC FIX issue:**
   - List issues in HexTrackr-Docs team
   - Filter: status "Backlog" or "Todo"
   - Filter: title contains "JSDOC FIX"
   - Order by: createdAt (oldest first)
   - Limit: 1

2. **Verify current state:**
   - Read the source file mentioned in the issue
   - Confirm the function still needs the JSDoc fix
   - If already fixed, mark issue as Done and stop

3. **Apply the fix:**
   - Implement the suggested JSDoc from the issue description
   - Ensure @param, @returns, and @example tags are complete
   - Follow HexTrackr JSDoc standards (4-space indentation, double quotes)

4. **Verify the fix:**
   - Read the file again to confirm changes were applied correctly
   - Ensure no syntax errors were introduced

5. **Update documentation:**
   - Get current version from package.json
   - Append entry to changelog: /app/public/docs-source/changelog/versions/{version}.md
   - Add under "Documentation Improvements" section (create if needed)
   - Format: `- **JSDoc**: Fixed documentation for \`functionName\` in \`file/path.js\` ([DOCS-XX](issue-url))`

6. **Regenerate docs:**
   - Run: npm run docs:generate

7. **Update Linear:**
   - Update issue status to "Done"
   - Add comment summarizing the fix applied

Report: Issue number, file modified, and changelog entry added.
