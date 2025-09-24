# IMPLEMENT_MODE Instructions

## Purpose
Execute the plan created in PLANNING_MODE using research from RESEARCH_MODE. Work through Linear checkboxes one at a time.

## Rules
- ✅ **Follow the Plan**: Work through Linear checkboxes sequentially
- ✅ **Update Linear**: Check off boxes as you complete them
- ✅ **Commit Frequently**: After each major checkbox completion
- ❌ **No Planning Changes**: If you need to change the plan, stop and discuss

## Process

### Step 1: Prepare for Implementation

**Check Prerequisites**:
- [ ] Linear issue exists with checkboxes
- [ ] Research phase is complete (comments in Linear)
- [ ] All affected files are identified
- [ ] Docker container is running (port 8989)

### Step 2: Work Through Phases

**Follow this pattern for each phase**:

1. **Read the phase checkboxes**
2. **Start first uncompleted checkbox**
3. **Complete the task**
4. **Update Linear** - check off the box
5. **Commit changes** with descriptive message
6. **Move to next checkbox**

### Step 3: Implementation Pattern

**For each checkbox**:

```bash
# 1. Before starting
git status  # Check current state

# 2. Complete the task
# (Make your changes)

# 3. Test the change (if applicable)
npm run lint:all  # For code changes
# Manual testing in Docker if UI changes

# 4. Commit
git add -A
git commit -m "Complete: [checkbox description]

- [Specific change made]
- [Verification performed]"

# 5. Update Linear
# Check off the completed checkbox
```

### Step 4: Phase Completion Pattern

**End of each phase**:
1. All checkboxes in phase are complete ✅
2. All changes are committed
3. Add Linear comment summarizing phase completion

```markdown
## Phase [X] Complete - [Date] [Time]

**Completed**:
- [List what was accomplished]

**Changes Made**:
- Modified `file.js` - [specific changes]
- Updated `other.js` - [specific changes]

**Testing**:
- [What testing was performed]

**Next**: Ready for Phase [X+1]
```

### Step 5: Issue Completion

**When all phases are done**:
1. All checkboxes are checked ✅
2. All success criteria are met
3. Final testing is complete
4. CHANGELOG.md is updated
5. PR is created
6. Linear issue moved to "In Review"

**Final Linear comment**:
```
Implementation complete. All phases executed successfully.

**Summary**:
- [Brief description of what was implemented]

**Files Modified**:
- `file1.js` - [changes]
- `file2.js` - [changes]

**Testing Results**:
- All linters pass
- Manual testing successful
- [Other verification]

**Ready for Review**: [PR URL]
```

## Handling Problems

### If You Get Stuck
1. **Stop implementation**
2. **Document the issue in Linear**:
   ```
   Implementation blocker encountered:
   - Problem: [Describe issue]
   - Attempted: [What you tried]
   - Needs: [What's needed to proceed]
   ```
3. **Ask for guidance** before continuing

### If Plan Needs Changes
1. **Stop implementation**
2. **Document in Linear**:
   ```
   Plan modification needed:
   - Original plan: [What was planned]
   - Reality: [What you discovered]
   - Suggested change: [What should change]
   ```
3. **Get approval** for plan changes before continuing

### If Testing Fails
1. **Don't check the box**
2. **Document the failure**:
   ```
   Testing failure on [checkbox]:
   - Expected: [What should happen]
   - Actual: [What actually happened]
   - Investigation needed: [Next steps]
   ```
3. **Fix the issue** before marking complete

## Quality Gates

**Before marking any checkbox complete**:
- [ ] The specific task is fully finished
- [ ] Any code changes follow existing patterns
- [ ] Linting passes (if code was changed)
- [ ] Manual testing passes (if UI was changed)
- [ ] Changes are committed with clear message

**Before marking entire issue complete**:
- [ ] All checkboxes are marked complete ✅
- [ ] All success criteria from planning phase are met
- [ ] All linting passes: `npm run lint:all`
- [ ] Manual testing complete in Docker (port 8989)
- [ ] CHANGELOG.md updated (if user-facing)
- [ ] PR created
- [ ] Linear issue moved to "In Review"

## Common Implementation Patterns

### Bug Fix Implementation
1. Create branch
2. Reproduce bug (verify issue)
3. Implement fix
4. Test fix works
5. Test no regression
6. Update documentation
7. Create PR

### Feature Implementation
1. Create branch
2. Implement backend changes first
3. Implement frontend changes
4. Test integration
5. Test edge cases
6. Update documentation
7. Create PR

### Refactoring Implementation
1. Create branch
2. Add tests (if missing)
3. Refactor incrementally
4. Test after each change
5. Verify no behavior changes
6. Update documentation
7. Create PR

## Next Step
After implementation is complete and PR is created, the work moves to review and testing phases (handled outside of these modes).