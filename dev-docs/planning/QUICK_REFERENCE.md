# HexTrackr Linear Workflow - Quick Reference

## Starting a New Feature/Bug

### 1. Create Linear Issue
```bash
# Use Linear MCP tools to create issue with:
Title: "v1.0.XX: [Feature Name]"
Description: "[Brief description, will link to SESSION_PLAN.md]"
Labels: [Bug/Feature/Enhancement] + [High/Medium/Low]
```

### 2. Create Planning Structure
```bash
mkdir -p /dev-docs/planning/active/v1.0.XX-feature-name/{research,implementation}
cp /dev-docs/planning/templates/SESSION_PLAN.md /dev-docs/planning/active/v1.0.XX-feature-name/
```

### 3. Research Phase (Plan Mode)
```bash
# Search codebase
# Use Claude-Context searches
# Use Context7 for framework best practices
# Document everything in SESSION_PLAN.md
```

## During Implementation Sessions

### Session Start Checklist
- [ ] Review SESSION_PLAN.md
- [ ] Check Linear issue for updates
- [ ] Create feature branch: `git checkout -b feature/v1.0.XX-feature-name`
- [ ] Move Linear issue to "In Progress"

### Work Session Pattern
1. Pick next unchecked item from plan
2. Implement the change
3. Test immediately
4. Commit: `git commit -m "WIP: [task description]"`
5. Check off item in SESSION_PLAN.md
6. Update Linear issue if milestone reached

### Session End Checklist
- [ ] Update SESSION_PLAN.md with session log
- [ ] Commit all changes: `git commit -m "Session [date]: [summary]"`
- [ ] Update Linear issue with progress
- [ ] Create Memento entity if significant progress

## Agent Handoff Protocol

### Leaving Agent
1. Complete session end checklist
2. Add detailed notes in SESSION_PLAN.md under "Agent Handoff Notes"
3. Specify exact next task for incoming agent
4. Document any blockers or important context

### Incoming Agent
```bash
# Quick context load
cd /Volumes/DATA/GitHub/HexTrackr
git status
cat /dev-docs/planning/active/*/SESSION_PLAN.md | head -50

# Check Linear for current issue status
# Review last commit: git log -1
```

## Common File Locations

### Planning
- `/dev-docs/planning/templates/` - All templates
- `/dev-docs/planning/active/` - Current work
- `/dev-docs/planning/completed/` - Archived plans

### HexTrackr Code
- `app/controllers/` - Route controllers
- `app/services/` - Business logic
- `app/public/scripts/shared/` - Frontend components
- `app/public/styles/` - CSS files

### Testing
- Docker: `docker-compose up -d` (port 8989)
- Linting: `npm run lint:all`
- Tests: `npm test`

## Linear Issue States

| State | Meaning | When to Use |
|-------|---------|-------------|
| Backlog | Identified, not planned | Initial issue creation |
| Todo | Planned, ready to work | After research complete |
| In Progress | Currently implementing | During active work |
| In Review | Implementation done, testing needed | Before final testing |
| Done | Complete, tested, merged | After all criteria met |

## Essential Commands

### Research
```bash
# Search codebase for patterns
# Use Claude-Context MCP tools

# Research framework best practices
# Use Context7 MCP tools
```

### Implementation
```bash
# Start feature branch
git checkout -b feature/v1.0.XX-feature-name

# Regular commits during work
git add -A && git commit -m "WIP: [current task]"

# Session end commit
git add -A && git commit -m "Session [date]: [summary]"
```

### Testing
```bash
# Full test suite
npm run lint:all
npm test

# Docker testing
docker-compose up -d
# Test on http://localhost:8989
```

### Linear Updates
```bash
# Use Linear MCP tools to:
# - Update issue description
# - Change issue status
# - Add comments with session summaries
```

## Template Usage

### For Bugs
1. Copy `templates/BUG_REPORT.md` to Linear issue description
2. Fill in details
3. Create SESSION_PLAN.md for implementation

### For Features
1. Copy `templates/FEATURE_REQUEST.md` to Linear issue description
2. Define requirements clearly
3. Create SESSION_PLAN.md for implementation

## Quality Gates

Before marking any issue as "Done":

- [ ] All planned tasks completed
- [ ] Tests passing: `npm test`
- [ ] Linting clean: `npm run lint:all`
- [ ] Docker testing successful (port 8989)
- [ ] JSDoc comments updated
- [ ] SESSION_PLAN.md has complete session logs
- [ ] Memento entity created for knowledge graph

## Emergency Procedures

### Context Lost Between Sessions
1. Read most recent SESSION_PLAN.md
2. Check git log for last few commits
3. Review Linear issue comments
4. Look for Memento entities from recent dates

### Implementation Stuck
1. Document the blocker in SESSION_PLAN.md
2. Update Linear issue with blocker status
3. Research alternative approaches
4. Consider asking for help or changing approach

### Need to Switch Features
1. Complete current session checklist
2. Move Linear issue to appropriate state
3. Update SESSION_PLAN.md with handoff notes
4. Switch to new feature following start checklist

---

*Keep this file bookmarked for quick reference during development sessions*