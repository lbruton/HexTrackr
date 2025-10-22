---
runInSubAgent: false
autoApprove: true
---

# Code Cleanup Hunt: Console.log Statements

Search for ONE console.log debugging statement in the HexTrackr codebase that can be safely removed.

## Safe Targets Only:

**Look for:**
- `console.log()` statements used for debugging
- `console.debug()` statements
- `console.warn()` for debugging (NOT production warnings)
- Leftover debug logs from development

**DO NOT target:**
- `logger.*` calls (these are intentional logging)
- `console.error()` in error handlers (needed for production debugging)
- `console.warn()` for actual user-facing warnings
- Initialization logs (e.g., "Server started on port...")
- Performance measurement logs
- Logs in test files

## Search Strategy:

1. **Use Grep to find console.log calls:**
   - Search for `console.log` in JavaScript files
   - Focus on app/controllers/, app/services/, app/public/scripts/
   - Exclude test files and node_modules

2. **Read the file for context:**
   - What is being logged?
   - Is it debugging output or intentional monitoring?
   - Is there a `logger.*` alternative being used elsewhere in the file?

3. **Categorize the log:**
   - **Debugging:** "in here", "test", "data:", "checking..." → SAFE to remove
   - **Monitoring:** "Server started", "Connection established" → KEEP
   - **Error context:** Inside catch blocks → KEEP (or suggest logger replacement)

4. **Check git history:**
   - When was this console.log added?
   - Was it part of a debugging session?
   - Is it in recent code (last 30 days) or old code?

## Create Linear Issue:

**Team:** HexTrackr-Dev

**Title:** `CODE CLEANUP: Remove console.log in [filename]`

**Description Template:**
```markdown
## Issue Summary

Found debugging console.log statement in `[file path]:[line number]` that can be safely removed.

## Current State

**Location:** `[file path]:[line number]`

**Console.log statement:**
```javascript
console.log("[message]", variable);
```

**Context:**
[Paste 5 lines before and after for context]

## Why It's Safe to Remove

- [ ] This is a debugging statement, not production logging
- [ ] File uses `logger.*` elsewhere for intentional logging
- [ ] No critical information being logged
- [ ] Removing won't affect error handling

## Classification

**Type:** [Debugging / Leftover dev code / Variable inspection]

**Alternative:** [If needed, suggest logger.debug() replacement]

## Verification Steps

1. Remove console.log statement
2. Run `npm run eslint` to verify no breakage
3. Test affected feature to ensure no regression
4. Verify no other code depends on side effects

## Context

**What was being logged:** [Explain the variable/message]

**Why it was added:** [From git history or code context]

**Current status:** No longer needed for debugging

**Estimated Impact:** None (debugging code only)
```

**Labels:** ["technical-debt", "code-quality"]

**Priority:** Low

## Safety Rules:

- ✅ Only target obvious debugging logs
- ✅ Only create ONE issue per hunt
- ✅ Include surrounding code context
- ✅ Verify it's not production monitoring
- ❌ NEVER remove logger.* calls
- ❌ NEVER remove console.error in catch blocks
- ❌ NEVER remove initialization/startup logs
- ❌ NEVER remove performance measurement logs

## Special Cases:

**If you find a console.log that SHOULD be logger.*:**
- Create issue titled: `CODE CLEANUP: Replace console.log with logger in [filename]`
- Suggest appropriate logger level (debug, info, warn, error)
- This is an upgrade, not just removal

## Output:

Report the Linear issue number, file location, and what was being logged for debugging purposes.
