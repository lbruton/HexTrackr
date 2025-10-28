---
runInSubAgent: false
autoApprove: false
---

# Code Cleanup Fix: Remove Commented Code

Remove ONE commented code block with comprehensive verification and testing.

## Steps:

### 1. Find the Issue

- List issues in HexTrackr-Dev team
- Filter: status "Backlog" or "Todo"
- Filter: title contains "CODE CLEANUP: Remove commented"
- Order by: createdAt (oldest first)
- Limit: 1

### 2. Verify Current State

- Read the source file mentioned in the issue
- Confirm the commented code block still exists at specified line numbers
- If already removed, mark issue as Done and stop

### 3. Safety Verification (ALL must pass)

**Check 1: Git History**
```bash
git log --oneline --all -S "first line of comment" -- path/to/file.js
```
- When was it commented? (Must be 3+ months old)
- What was the commit message?
- Was there a related issue/ticket?

**Check 2: No Active References**
- Use Grep to search for function/variable names from commented code
- Verify nothing in active code references it
- Check for similar patterns in other files

**Check 3: Current Implementation**
- Verify the feature/functionality works without this code
- Confirm there's a current implementation that replaced it
- Check that tests exist for current implementation (if applicable)

**If ANY check fails:**
- Update the Linear issue with findings
- Mark as "Blocked" with explanation
- DO NOT proceed with removal

### 4. Apply the Removal

- Remove the commented code block using Edit tool
- Preserve surrounding code and formatting
- Ensure no extra blank lines are left

### 5. Verification After Removal

**Automated Checks:**
```bash
npm run eslint
```
- Must pass with no new errors

**Manual Verification:**
- Read the file again to confirm clean removal
- Check that surrounding code still makes sense
- Verify no accidental deletions

**If verification fails:**
- Immediately revert the change
- Update Linear issue with error details
- Mark as "Blocked"

### 6. Testing (if applicable)

**For controller/service files:**
- Identify affected feature
- Restart Docker if needed: `docker-compose restart hextrackr`
- Access dev server: https://dev.hextrackr.com
- Manually test the feature
- Check Docker logs: `docker-compose logs hextrackr --tail=50`
- Verify functionality unchanged

**For frontend scripts:**
- Access dev server: https://dev.hextrackr.com
- Load the page that uses this file
- Test related UI interactions
- Check browser console for errors

**If tests fail:**
- Revert changes immediately
- Document failure in Linear issue
- Mark as "Blocked"

### 7. Update Documentation

- Get current version from package.json
- Append to changelog: `/app/public/docs-source/changelog/versions/{version}.md`
- Add under "Code Quality Improvements" section (create if needed)
- Format: `- **Cleanup**: Removed commented code from \`file/path.js\` lines [X-Y] - [brief description] ([ISSUE-ID](url))`

### 8. Update Linear Issue

- Update status to "Done"
- Add comment with:
  - What was removed (file, lines)
  - Verification results (git history, eslint, manual tests)
  - Any follow-up actions needed

### 9. Update Memento Entity

- Find entity: `mcp__memento__search_nodes({ query: "[ISSUE-ID]" })`
- Add observations:
  - `FIXED_TIMESTAMP: [ISO 8601 format]`
  - `FIX_SUMMARY: Removed commented code lines [X-Y]: [brief description of what was removed]`
  - `CHANGELOG_VERSION: [version]`
  - `VERIFICATION: ESLint passed, [feature] tested successfully, no active references found`
- Add tags:
  - `TAG: completed`
  - `TAG: v[X.Y.Z]`

## Safety Abort Conditions:

**Stop immediately if:**
- ❌ Code was commented in last 3 months
- ❌ Found active references in codebase
- ❌ No current implementation exists
- ❌ ESLint fails after removal
- ❌ Manual tests fail
- ❌ Can't verify what the code was for

**When in doubt:** Ask the user before proceeding.

## Report Format:

```
✅ Code Cleanup Complete

**Issue:** [ISSUE-ID] - [Title]
**File:** [path/to/file.js]
**Lines removed:** [X-Y]
**What was removed:** [brief description]

**Verification Results:**
- ✅ Git history: Commented [X] months ago
- ✅ No active references found
- ✅ ESLint: Passed
- ✅ Manual tests: [feature] working correctly

**Changelog:** Updated v[X.Y.Z]
**Linear:** Marked as Done
```

## Important Notes:

- **One removal at a time** - Never batch multiple cleanups
- **Test before marking Done** - No exceptions
- **Document everything** - Future you will thank you
- **When uncertain, ask** - Better safe than sorry
