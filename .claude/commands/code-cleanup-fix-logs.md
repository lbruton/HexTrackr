---
runInSubAgent: false
autoApprove: false
---

# Code Cleanup Fix: Remove Console.log Statements

Remove ONE console.log debugging statement with verification and testing.

## Steps:

### 1. Find the Issue

- List issues in HexTrackr-Dev team
- Filter: status "Backlog" or "Todo"
- Filter: title contains "CODE CLEANUP: Remove console.log"
- Order by: createdAt (oldest first)
- Limit: 1

### 2. Verify Current State

- Read the source file mentioned in the issue
- Confirm the console.log statement still exists at specified line number
- If already removed, mark issue as Done and stop

### 3. Safety Verification

**Check 1: Confirm it's a debug log**
- Read surrounding context (10 lines before/after)
- Verify it's NOT:
  - In a catch/error handler logging errors
  - Server initialization logging
  - Performance measurement
  - Part of logger.* wrapper function

**Check 2: Check for side effects**
- Ensure the console.log doesn't have important side effects
- Example: `console.log(user.lastLogin = Date.now())` ← Has side effect!
- If side effects found, extract the operation and keep it

**Check 3: Verify alternative logging**
- Check if the file uses `logger.*` elsewhere
- Confirm this console.log is redundant
- If this is the ONLY logging, consider if it should be logger.* instead

**If verification fails:**
- Update Linear issue with findings
- If it should be logger.* instead, suggest replacement
- Mark as "Needs Discussion" and ask user

### 4. Apply the Removal

**For simple console.log:**
```javascript
// Remove this entire line:
console.log("Debug message", variable);
```

**For console.log with side effects:**
```javascript
// Before:
console.log(counter++);

// After (preserve side effect):
counter++;
```

- Use Edit tool to remove the console.log line
- Preserve any side effects
- Clean up any orphaned variables if the log was the only usage

### 5. Verification After Removal

**Automated Checks:**
```bash
npm run eslint
```
- Must pass with no new errors

**Check for orphaned variables:**
- If the console.log was logging a variable that's no longer used
- ESLint should flag it as unused
- Create follow-up issue if needed

**Manual Verification:**
- Read the file again to confirm clean removal
- Check that code flow makes sense
- Verify no debugging logic was dependent on the log

### 6. Testing

**For backend files (controllers/services):**
- Restart Docker if needed: `docker-compose restart hextrackr`
- Access dev server: https://dev.hextrackr.com
- Test the affected API endpoint
- Verify functionality unchanged
- Check Docker logs: `docker-compose logs hextrackr --tail=50`

**For frontend files (scripts):**
- Access dev server: https://dev.hextrackr.com
- Load the page that includes this script
- Test related UI interactions
- Open browser console and verify:
  - No unexpected errors
  - Feature works correctly
  - No broken functionality

**If tests fail:**
- Revert immediately
- Document failure in Linear issue
- Investigate why the log was critical

### 7. Update Documentation

- Get current version from package.json
- Append to changelog: `/app/public/docs-source/changelog/versions/{version}.md`
- Add under "Code Quality Improvements" section (create if needed)
- Format: `- **Cleanup**: Removed debug console.log from \`file/path.js:[line]\` ([ISSUE-ID](url))`

### 8. Update Linear Issue

- Update status to "Done"
- Add comment with:
  - What was removed (file, line, message)
  - Verification results (eslint, manual tests)
  - Any follow-up needed (orphaned variables, etc.)

## Safety Abort Conditions:

**Stop immediately if:**
- ❌ Console.log has side effects you can't preserve
- ❌ It's actually production logging (not debugging)
- ❌ ESLint fails after removal
- ❌ Manual tests reveal broken functionality
- ❌ It's the only logging in critical error handling

**When uncertain:** Ask the user, especially if:
- Log appears to be monitoring production state
- Removing it might hide important debugging info
- File has no other logging mechanisms

## Special Case: Upgrade to Logger

**If issue suggests replacing with logger.*:**

1. Determine appropriate logger level:
   - `logger.debug()` - Development debugging
   - `logger.info()` - General information
   - `logger.warn()` - Warnings
   - `logger.error()` - Errors

2. Replace console.log with logger call:
```javascript
// Before:
console.log("Processing user data:", userData);

// After:
logger.debug("Processing user data:", userData);
```

3. Verify logger is imported at top of file
4. Test that logging works correctly

## Report Format:

```
✅ Console.log Cleanup Complete

**Issue:** [ISSUE-ID] - [Title]
**File:** [path/to/file.js]
**Line:** [X]
**Removed:** console.log("[message]", ...)

**Verification Results:**
- ✅ No side effects
- ✅ ESLint: Passed
- ✅ Manual tests: [feature] working correctly
- ✅ No orphaned variables

**Changelog:** Updated v[X.Y.Z]
**Linear:** Marked as Done
```

## Important Notes:

- **Preserve side effects** - Don't break increment operators or assignments
- **One log at a time** - Never batch multiple removals
- **Test thoroughly** - Debug logs might hide bugs
- **Document patterns** - If you find many logs, note which files need logger.*
