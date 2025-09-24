# RESEARCH_MODE Instructions

## Purpose
Investigate the codebase to understand existing patterns and document findings. All research goes into Linear issue comments.

## Rules
- ❌ **NO CODING**: Only investigation and documentation allowed
- ✅ **Document Everything**: All findings go in Linear comments
- ✅ **Be Thorough**: Better to over-research than under-research

## Process

### Step 1: Move Linear Issue
Update Linear issue status to "In Progress" and add comment:
```
Starting research phase. Will document all findings here.
```

### Step 2: Codebase Investigation

**Use Claude-Context for Codebase Searches**:
```bash
# Search for existing patterns
# Document each search and its results in Linear
```

**Common Search Patterns**:
- Function/method names related to the feature
- Similar existing functionality
- Error handling patterns
- Database interaction patterns
- Frontend/backend integration points

### Step 3: Framework Research

**Use Context7 for Framework Best Practices**:
- Express.js patterns for new endpoints
- Socket.io patterns for real-time features
- Database patterns for SQLite operations
- Frontend patterns for UI components

### Step 4: Document Findings in Linear

Add a comment to the Linear issue with this template:

```markdown
## Research Findings - [Date]

### Codebase Searches
| Search Query | Key Findings | Relevant Files |
|--------------|--------------|----------------|
| "function name" | Found existing pattern at line X | `app/path/file.js:123` |
| "similar feature" | Implementation approach discovered | `app/path/other.js:456` |

### Framework Research
| Framework | Pattern | Best Practice |
|-----------|---------|---------------|
| Express.js | Route handling | Use middleware pattern for validation |
| Socket.io | Real-time updates | Use rooms for targeted updates |

### Existing Code Analysis
**Current Implementation**:
- Location: `app/path/file.js:line`
- Pattern: [Describe current pattern]
- Dependencies: [List dependencies]

**Related Files**:
- `app/controllers/something.js` - [Purpose and relevance]
- `app/services/something.js` - [Purpose and relevance]
- `app/public/scripts/something.js` - [Purpose and relevance]

### Architecture Decisions
1. **Decision**: [What approach to take]
   - **Rationale**: [Why this approach]
   - **Alternative**: [What else was considered]

### Risks & Considerations
- **Risk**: [Potential issue]
  - **Mitigation**: [How to handle it]

### Implementation Notes
- File to modify: `path/file.js` - [Specific changes needed]
- Dependencies to install: [If any]
- Configuration changes: [If any]
```

### Step 5: Validate Research Completeness

✅ **Research Complete When**:
- All files mentioned in planning phase are analyzed
- Similar existing patterns are documented
- Framework best practices are identified
- Potential risks are noted
- Implementation approach is clear

❌ **Research Incomplete**:
- Files mentioned in plan are not analyzed
- No existing patterns found (keep searching)
- Framework approach is unclear
- Major risks not identified

### Step 6: Update Linear Issue

Add final research comment:
```
Research phase complete. Key findings documented above.
Ready to proceed to implementation phase.

Implementation approach confirmed: [Brief summary]
Files to modify: [List files]
Estimated complexity: [Original estimate still accurate?]
```

## Research Checklists by Feature Type

### Bug Fix Research
- [ ] Reproduce the bug in code/understand the issue
- [ ] Find the exact location causing the problem
- [ ] Understand the expected behavior
- [ ] Check for similar fixes in codebase
- [ ] Identify potential side effects

### New Feature Research
- [ ] Find similar existing features
- [ ] Understand the data flow requirements
- [ ] Identify UI/UX patterns to follow
- [ ] Check database schema requirements
- [ ] Understand integration points

### Refactoring Research
- [ ] Map all current usage of code being refactored
- [ ] Identify dependencies and dependents
- [ ] Find test coverage (if any)
- [ ] Understand performance implications
- [ ] Plan backwards compatibility

## Next Step
After research is complete, move to IMPLEMENT_MODE to execute the plan with documented understanding.