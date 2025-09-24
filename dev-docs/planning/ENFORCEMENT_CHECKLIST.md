# HexTrackr Workflow Enforcement Checklist

## 🚨 MANDATORY PRE-IMPLEMENTATION VALIDATION

**Before ANY code changes, agents MUST verify all checkboxes:**

### Phase 1: Issue Creation
- [ ] Linear issue exists with format: "v1.0.XX: [Feature/Bug Name]"
- [ ] Linear issue has appropriate labels: [Type] + [Priority]
- [ ] Linear issue description includes link to SESSION_PLAN.md location
- [ ] Linear issue status is set to "Backlog" (will move to "Todo" after planning)

### Phase 2: Planning Structure
- [ ] Planning folder exists: `/dev-docs/planning/active/v1.0.XX-[name]/`
- [ ] SESSION_PLAN.md exists and is populated from template
- [ ] Research and implementation subfolders created
- [ ] Agent is currently in **Plan Mode** (no code execution allowed)

### Phase 3: Research Completion
- [ ] Claude-Context searches documented in SESSION_PLAN.md with results
- [ ] Context7 framework research completed (if applicable)
- [ ] Existing code analysis section completed in SESSION_PLAN.md
- [ ] Architecture decisions documented with rationale

### Phase 4: Implementation Plan
- [ ] All phases have specific checkboxes with file locations and line numbers
- [ ] Time estimates provided for each phase (realistic 30min-2hr blocks)
- [ ] Test plan includes unit, integration, and manual testing steps
- [ ] Success criteria are specific and measurable

### Phase 5: Pre-Implementation Validation
- [ ] SESSION_PLAN.md is complete with all sections filled
- [ ] ExitPlanMode tool has been called to get user approval
- [ ] User has approved the implementation plan
- [ ] Git status confirms we're on correct branch (main or feature branch)

## ⛔ STOP CONDITIONS

**Agent MUST STOP and request guidance if:**

1. **No SESSION_PLAN.md exists** - Cannot proceed without planning document
2. **Plan Mode not active** - Research must happen in Plan Mode only
3. **Missing research sections** - Cannot implement without understanding existing code
4. **Vague implementation steps** - Checkboxes must be specific and actionable
5. **No user approval** - Must exit Plan Mode and get approval before coding

## ✅ VALIDATION COMMANDS

**Run these commands to verify compliance:**

```bash
# Verify planning structure exists
ls -la /dev-docs/planning/active/v1.0.XX-*/SESSION_PLAN.md

# Check if planning document has required sections
grep -E "(Research & Context|Implementation Plan|Success Criteria)" /dev-docs/planning/active/v1.0.XX-*/SESSION_PLAN.md

# Verify git branch status
git branch --show-current
git status --short

# Confirm Docker is running for testing
docker-compose ps | grep hextrackr
```

## 🔄 SESSION CONTINUATION VALIDATION

**When continuing existing work, verify:**

- [ ] SESSION_PLAN.md exists and contains session logs
- [ ] Last session notes indicate stopping point and next priority
- [ ] Git commits show progress aligned with SESSION_PLAN.md checkboxes
- [ ] Linear issue reflects current progress status
- [ ] No uncommitted changes or work-in-progress conflicts

## 📋 QUALITY GATES

**Before marking work complete:**

- [ ] All linters pass: `npm run lint:all`
- [ ] All tests pass (if applicable): `npm test`
- [ ] Docker testing completed on port 8989
- [ ] JSDoc comments updated for new/modified functions
- [ ] CHANGELOG.md updated (if user-facing changes)
- [ ] Linear issue moved to appropriate status
- [ ] Planning folder archived to `/completed/` (when fully done)

## 🤝 HANDOFF VALIDATION

**Before agent handoff:**

- [ ] SESSION_PLAN.md updated with detailed session log
- [ ] Next priority clearly documented for incoming agent
- [ ] All changes committed with descriptive messages
- [ ] Linear issue updated with progress and comments
- [ ] Memento entity created (if significant progress made)

---

**This checklist ensures consistent, high-quality development that maintains context across sessions and agents.**