# HexTrackr Simplified Development Workflow

## Overview
HexTrackr uses a streamlined Linear-only workflow that eliminates bureaucracy while maintaining quality standards.

## How It Works

### Simple Pattern
1. **User Request**: "We need to fix/build [something]"
2. **Linear Issue**: Create or update issue with brief task breakdown
3. **Natural Work**: Implement with progress updates in Linear comments
4. **Complete**: Update Linear status, run quality checks, commit

### Key Benefits
- **No Dual Tracking**: Linear is the single source of truth
- **Natural Flow**: Work conversationally without rigid modes
- **Quality Maintained**: Still use linting, testing, JSDoc standards
- **Context Preserved**: All research and decisions in Linear comments

## Linear MCP Tools
- `mcp__linear__create_issue` - Create new tickets
- `mcp__linear__update_issue` - Update status and details
- `mcp__linear__add_comment` - Add progress notes
- `mcp__linear__list_issues` - Find existing work

## Quality Standards (Still Required)
- Test in Docker container (port 8989)
- Run `npm run lint:all` before commits
- Complete JSDoc documentation for functions
- Follow existing code patterns
- Create PRs for main branch merges

## What We Removed
- SESSION_PLAN.md files
- Complex three-mode workflow (PLANNING_MODE, RESEARCH_MODE, IMPLEMENT_MODE)
- Duplicate markdown documentation
- Rigid phase boundaries

## What We Kept
- Linear issue tracking
- Code quality checks
- Git workflow with feature branches
- JSDoc documentation requirements
- Docker testing requirement

## Archive
The old complex workflow files are preserved in `/archive/old-three-mode-system/` for reference.

---

*This simplified approach maintains all quality benefits while removing workflow friction.*