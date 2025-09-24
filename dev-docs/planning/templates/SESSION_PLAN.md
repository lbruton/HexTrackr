# v1.0.XX: [Feature/Bug Name]

## Executive Summary
- **Linear Issue**: HEX-[NUMBER]
- **Type**: Bug/Feature/Enhancement
- **Priority**: High/Medium/Low
- **Estimated Sessions**: [X] sessions (2 hours each)
- **Status**: Planning/In Progress/Testing/Complete
- **Started**: YYYY-MM-DD
- **Target Completion**: YYYY-MM-DD

## Problem Statement

[Clear, concise description of what needs to be fixed or built. Include user impact and why this is important.]

## Success Criteria

- [ ] [Specific, measurable outcome 1]
- [ ] [Specific, measurable outcome 2]
- [ ] [Specific, measurable outcome 3]

## Research & Context

### Claude-Context Searches

| Search Query | Key Findings | Relevant Files |
|--------------|--------------|----------------|
| "[search 1]" | [What was found] | `file.js:line` |
| "[search 2]" | [What was found] | `file.js:line` |

### Context7 Framework Research

| Framework | Topic | Key Findings |
|-----------|-------|--------------|
| Express.js | [Pattern] | [Best practice] |
| Socket.io | [Pattern] | [Best practice] |

### Existing Code Analysis

**Current Implementation**:
- Location: `app/[path]/[file].js:line`
- Pattern: [Describe current pattern]
- Dependencies: [List key dependencies]

**Related Code**:
- `app/[path]/[file].js` - [Purpose]
- `app/[path]/[file].js` - [Purpose]

### Architecture Decisions

1. **Decision**: [What approach to take]
   - **Rationale**: [Why this approach]
   - **Alternative**: [What was considered but rejected]

## Implementation Plan

### Phase 1: Foundation Setup
**Estimated Time**: 30 minutes

- [ ] Create feature branch from `main`
- [ ] Set up test file at `test/[feature].test.js`
- [ ] Create backup commit point
- [ ] Verify Docker container running on port 8989

### Phase 2: Core Implementation
**Estimated Time**: 1 hour

- [ ] Implement [main component] in `app/[path]/[file].js`
  - Location: Line [XXX]
  - Changes: [Specific changes]
- [ ] Update [related component] in `app/[path]/[file].js`
  - Location: Line [XXX]
  - Changes: [Specific changes]
- [ ] Add error handling for [edge case]

### Phase 3: Integration
**Estimated Time**: 30 minutes

- [ ] Update frontend component in `app/public/scripts/[file].js`
- [ ] Modify CSS in `app/public/styles/[file].css`
- [ ] Update WebSocket events if needed

### Phase 4: Testing & Documentation
**Estimated Time**: 30 minutes

- [ ] Run unit tests: `npm test`
- [ ] Run linters: `npm run lint:all`
- [ ] Test in Docker container (port 8989)
- [ ] Update JSDoc comments
- [ ] Update user documentation in `/docs-source/`

### Phase 5: Finalization
**Estimated Time**: 30 minutes

- [ ] Create pull request to `main` branch
- [ ] Update CHANGELOG.md
- [ ] Create Memento entity for knowledge graph
- [ ] Archive planning folder to `/completed/`

## Test Plan

### Unit Tests
- [ ] Test [function] handles [case]
- [ ] Test error handling for [scenario]
- [ ] Test edge case: [description]

### Integration Tests
- [ ] Test API endpoint: `[method] /api/[path]`
- [ ] Test WebSocket event: `[event-name]`
- [ ] Test UI interaction: [description]

### Manual Testing Checklist
- [ ] Import CSV with [scenario]
- [ ] Verify [UI element] displays correctly
- [ ] Test dark mode compatibility
- [ ] Verify mobile responsiveness

## Session Logs

### Session 1 - [YYYY-MM-DD HH:MM]
**Duration**: 2 hours
**Completed**:
- ✅ [Task completed]
- ✅ [Task completed]
- ⚠️ [Task partially completed - note]
- ❌ [Task blocked - reason]

**Discoveries**:
- [Unexpected finding that affects implementation]
- [Additional dependency discovered]

**Decisions Made**:
- [Decision and rationale]

**Next Session Priority**:
- [Most important task for next session]

**Commit Hash**: `[git commit hash]`

### Session 2 - [YYYY-MM-DD HH:MM]
[Template for next session]

## Blockers & Dependencies

| Blocker | Description | Resolution Strategy | Status |
|---------|-------------|-------------------|---------|
| [Name] | [What's blocking] | [How to resolve] | Open/Resolved |

## Code Snippets & Notes

### Snippet 1: [Description]
```javascript
// Important code pattern discovered during research
```

### Note 1: [Topic]
[Important implementation note for future reference]

## Files Modified

Track all files that will be/have been modified:

- [ ] `app/[path]/[file].js` - [Description of changes]
- [ ] `app/[path]/[file].js` - [Description of changes]
- [ ] `app/public/[path]/[file].html` - [Description of changes]

## Agent Handoff Notes

**For Next Agent**:
- Current state: [Where we are in the plan]
- Next priority: [What to work on next]
- Watch out for: [Any gotchas or important context]
- Questions to resolve: [Any open questions]

## References

- Linear Issue: [URL]
- Related PR: [URL]
- Documentation: [URL]
- Context7 Docs: [URL]

---

*Last Updated: YYYY-MM-DD HH:MM by [Agent/Person]*