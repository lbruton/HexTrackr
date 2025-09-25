# PLANNING_MODE Instructions

## Purpose
Break down any request into actionable 1-2 hour sessions. Create a Linear issue with clear phases and implementation checkboxes.

## Rules
- ❌ **NO CODING**: Only planning and breakdown allowed
- ✅ **Linear Focus**: All planning goes in Linear issue
- ✅ **Session-sized**: Break work into 1-2 hour chunks

## Process

### Step 1: Create Linear Issue
```bash
# Use Linear MCP to create issue
Title: "v1.0.XX: [Feature/Bug Name]"
Description: [Use template below]
Team: HexTrackr
Priority: High/Medium/Low
Labels: Bug/Feature/Enhancement
```

### Step 2: Linear Issue Template

```markdown
## Problem Statement
[Clear description of what needs to be fixed/built and why it matters]

## Success Criteria
- [ ] Specific measurable outcome 1
- [ ] Specific measurable outcome 2
- [ ] All linting passes
- [ ] Manual testing complete

## Implementation Phases

### Phase 1: Setup & Research (30 minutes)
- [ ] Create feature branch: `[branch-name]`
- [ ] Research existing code patterns
- [ ] Document affected files

### Phase 2: Core Implementation (60 minutes)
- [ ] Modify file A: [specific change]
- [ ] Update file B: [specific change]
- [ ] Add tests if needed

### Phase 3: Testing & Documentation (30 minutes)
- [ ] Test functionality in Docker (port 8989)
- [ ] Run linters: `npm run lint:all`
- [ ] Update CHANGELOG.md
- [ ] Create PR and update Linear to "In Review"

## Files to Modify
- `path/to/file.js` - [specific changes needed]
- `path/to/other.js` - [specific changes needed]
```

### Step 3: Validate Plan
Ensure each phase is:
- **Timeboxed**: 30-90 minutes each
- **Specific**: Exact files and line numbers when possible
- **Testable**: Clear verification steps
- **Complete**: Covers setup through PR creation

### Step 4: Set Linear Status
Move issue to "Todo" status to indicate planning is complete.

## Common Planning Patterns

### Bug Fix (30-60 minutes total)
- Phase 1: Research and locate bug (15 min)
- Phase 2: Fix implementation (30 min)
- Phase 3: Test and document (15 min)

### Small Feature (60-120 minutes total)
- Phase 1: Research and setup (30 min)
- Phase 2: Core implementation (60 min)
- Phase 3: Testing and polish (30 min)

### Large Feature (multiple sessions)
- Session 1: Backend foundation
- Session 2: Frontend implementation
- Session 3: Integration and testing

## Output Requirements

✅ **Valid Planning Complete When**:
- Linear issue created with complete description
- All phases have specific, actionable checkboxes
- Time estimates are realistic (1-2 hours total)
- Files to modify are identified
- Success criteria are measurable

❌ **Invalid Planning (Redo Required)**:
- Vague checkboxes like "implement feature"
- No time estimates or unrealistic times
- Missing file locations
- No clear success criteria

## Next Step
After planning is complete, move to RESEARCH_MODE to investigate the codebase before implementation.