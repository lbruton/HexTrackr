---
runInSubAgent: false
autoApprove: false
---

# Documentation Content Accuracy Fix

Use linear-server to find and fix ONE DOCS CONTENT FIX issue from the HexTrackr-Docs team.

Steps:

1. **Find the oldest incomplete DOCS CONTENT FIX issue:**
   - List issues in HexTrackr-Docs team
   - Filter: status "Backlog" or "Todo"
   - Filter: title contains "DOCS CONTENT FIX"
   - Order by: createdAt (oldest first)
   - Limit: 1

2. **Verify the inaccuracy still exists:**
   - Read the documentation file mentioned in the issue
   - Confirm the outdated/incorrect content is still present
   - If already fixed, mark issue as Done and stop

3. **Verify the correct information:**
   - Use claude-context to search current codebase implementation
   - Read relevant source files to confirm accuracy
   - Double-check version numbers against package.json
   - Verify links and references are valid

4. **Apply the fix:**
   - Update the markdown documentation file
   - Implement the suggested fix from the issue description
   - Ensure markdown formatting is correct
   - Preserve existing formatting style (heading levels, lists, code blocks)

5. **Verify the fix:**
   - Read the file again to confirm changes were applied correctly
   - Check that markdown syntax is valid
   - Ensure no broken links were introduced

6. **Update documentation:**
   - Get current version from package.json
   - Append entry to changelog: /app/public/docs-source/changelog/versions/{version}.md
   - Add under "Documentation Improvements" section (create if needed)
   - Format: `- **Content**: Fixed inaccurate information in \`path/to/file.md\` - [description] ([DOCS-XX](issue-url))`

7. **Regenerate HTML docs:**
   - Run: npm run docs:generate
   - This converts updated markdown to HTML

8. **Update Linear:**
   - Update issue status to "Done"
   - Add comment summarizing what was corrected and how it was verified

Report: Issue number, file modified, what was corrected, and changelog entry added.
