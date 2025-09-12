
Plan how to implement the specified feature with comprehensive research and analysis.

This is the third step in the Spec-Driven Development lifecycle (after /planspec and /specify).

Given the implementation details provided as an argument, do this:

## Phase 0: Initial Setup
1. Run `hextrackr-specs/scripts/setup-plan.sh [spec-number] --json` from repo root (use active spec if no number provided)
2. Parse JSON for SPEC_NAME, FEATURE_SPEC, IMPL_PLAN, SPEC_DIR, BRANCH
3. Search Memento for architectural context: "HEXTRACKR:ARCHITECTURE:CURRENT"
4. Search Athena for related past implementations

## Phase 1: Current State Analysis (Parallel Research)
Launch the Three Stooges in parallel using Task tool:
```
Task 1 (Larry): "Analyze frontend implementation for [feature]. Check relevant files in app/public/scripts/. Test current UI behavior. Document CSS/JS patterns."

Task 2 (Moe): "Review backend architecture for [feature]. Examine app/public/server.js, routes, and services. Document data flow and API patterns."

Task 3 (Curly): "Find edge cases and creative concerns for [feature]. Test with different data volumes. Check browser compatibility. Identify potential gotchas."
```

Wait for all three Stooges to complete their analysis.

## Phase 2: Synthesis and Clarification
1. Combine findings from all three Stooges
2. Present consolidated research to user:
   - "Larry found: [frontend findings]"
   - "Moe discovered: [backend findings]"
   - "Curly warns about: [edge cases]"
3. For each [NEEDS CLARIFICATION] in spec:
   - Present context from research
   - Ask specific question with options
   - Wait for user response
   - Update spec.md with answer

## Phase 3: Technical Planning
1. Load `hextrackr-specs/templates/plan-template.md`
2. Auto-fill Technical Context from Memento:
   - Language: Node.js 20
   - Database: SQLite with WAL mode
   - Frontend: Vanilla JS with AG-Grid
   - Testing: Jest + Playwright
   - Deployment: Docker on port 8989
3. Execute template phases:
   - Phase 0: Generate research.md (from Stooges findings)
   - Phase 1: Generate plan.md, data-model.md, contracts/, quickstart.md
   - Document pre-state behavior from testing
   - Include specific file paths from codebase

## Phase 4: Validation and Save
1. Verify all [NEEDS CLARIFICATION] resolved
2. Confirm constitution compliance
3. Save to Memento:
   - "HEXTRACKR:PLAN:[spec-number]:[name]" with architectural decisions
   - Link to related specs and implementations
4. Report completion with:
   - Generated artifacts list
   - Key architectural decisions
   - Ready for /tasks phase

## Key Principles:
- ALWAYS use Stooges for parallel research
- NEVER guess when clarification needed
- DOCUMENT current state before planning changes
- TEST existing functionality first
- SAVE all findings to Memento
