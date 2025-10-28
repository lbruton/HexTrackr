---
runInSubAgent: false
autoApprove: true
---

# Code Cleanup Hunt: Commented Code

Search for ONE block of commented-out code in the HexTrackr codebase that can be safely removed.

## Safe Targets Only:

**Look for:**
- Multi-line commented code blocks (`/* ... */` spanning 3+ lines)
- Consecutive single-line comments (`// ...` on 3+ consecutive lines)
- Old debugging code that's been commented out
- Refactored code that was commented instead of deleted

**DO NOT target:**
- JSDoc comments (`/** ... */`)
- Inline documentation explaining WHY code works a certain way
- Copyright/license headers
- TODO/FIXME comments (separate hunt for these)
- Comments explaining complex algorithms
- Commented examples in configuration files

## Search Strategy:

1. **Use Grep to find commented blocks:**
   - Search for multi-line comment blocks in JavaScript files
   - Look for consecutive single-line comments
   - Focus on app/controllers/, app/services/, app/public/scripts/

2. **Read the file for context:**
   - Verify it's actually dead code, not documentation
   - Check surrounding code to understand purpose
   - Look for date stamps or author notes in comments

3. **Check git history:**
   - Run: `git log --oneline --all -S "first line of commented code" -- path/to/file.js`
   - When was it commented out? (Prefer code commented >3 months ago)
   - Why was it commented? (Check commit messages)

4. **Verify it's safe to remove:**
   - Is it redundant to current implementation?
   - Does current code work without it?
   - Was it part of an abandoned approach?

5. **Check Memento for duplicate work:**
   - Use semantic search: `mcp__memento__semantic_search({ query: "commented code [filename] [function/context]", entity_types: ["HEXTRACKR:CODE:ISSUE"], limit: 5 })`
   - Check for similar issues already logged in same file
   - If duplicate found, skip to next commented block
   - This prevents recreating already-identified cleanup tasks

## Create Linear Issue:

**Team:** HexTrackr-Dev

**Title:** `CODE CLEANUP: Remove commented code in [filename]`

**Description Template:**
```markdown
## Issue Summary

Found commented-out code block in `[file path]:[line numbers]` that can be safely removed.

## Current State

**Location:** `[file path]:[start line]-[end line]`

**Commented code:**
```javascript
[paste commented code snippet]
```

## Why It's Safe to Remove

- [ ] Verified no active references to this code
- [ ] Git history shows it was commented out on [date]
- [ ] Commit message: "[commit message]"
- [ ] Current implementation works without this code
- [ ] Not documentation - actual dead code

## Verification Steps

1. Check git blame to see when it was commented
2. Verify current functionality works without it
3. Remove commented block
4. Run `npm run eslint` to verify no breakage
5. Test affected feature (if applicable)

## Context

[Explain what this code used to do and why it's no longer needed]

**Estimated Impact:** Low (removing comments only)
```

**Labels:** ["technical-debt", "code-quality"]

**Priority:** Low

## Save to Memento:

After creating the Linear issue:

- Create entity:
  - Name: "Code Issue: [ISSUE-ID] - [brief description]"
  - Type: `HEXTRACKR:CODE:ISSUE`
  - Observations:
    - `TIMESTAMP: [ISO 8601 format]`
    - `ABSTRACT: Commented code in [filename] lines [X-Y]`
    - `SUMMARY: File: [path]:[lines]. Commented: [date]. Reason: [from git]. Current: [working implementation exists]. Safe: [verification]`
    - `ISSUE_ID: [HEX-XXX]`
    - `FILE_PATH: [full file path]`
    - `ISSUE_TYPE: commented-code`
  - Tags:
    - `TAG: project:hextrackr`
    - `TAG: code-quality`
    - `TAG: [ISSUE-ID]`
    - `TAG: commented-code`
    - `TAG: week-[XX]-2025`
    - `TAG: identified`

## Safety Rules:

- ✅ Only target code that's been commented for 3+ months
- ✅ Only create ONE issue per hunt
- ✅ Include git history context in issue
- ✅ Verify current implementation exists and works
- ❌ NEVER remove documentation comments
- ❌ NEVER remove error handling explanations
- ❌ NEVER remove algorithm explanations

## Output:

Report the Linear issue number, file location, and brief explanation of what the commented code was.
