# Implementation Plan: Comprehensive Dark Mode Theme System

**Branch**: `005-dark-mode-theme-system` | **Date**: 2025-09-12 | **Spec**: [005-005-darkmode/spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-005-darkmode/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Implement comprehensive dark mode theme system for HexTrackr vulnerability management platform using hybrid Tabler.io v1.0.0-beta17 native `data-bs-theme="dark"` functionality combined with HexTrackr custom component styling. The system provides instant theme switching (<100ms), user preference persistence, system preference detection, and WCAG AA compliance across all pages (vulnerabilities.html, tickets.html, dashboard). Key technical challenges include ApexCharts dynamic theming, AG-Grid dark styling adaptation, and VPR severity badge contrast optimization.

## Technical Context

**Language/Version**: Node.js 20, Vanilla JavaScript ES2022, CSS3 with custom properties  
**Primary Dependencies**: Tabler.io v1.0.0-beta17, ApexCharts, AG-Grid Community, Express.js  
**Storage**: localStorage (Phase 1), SQLite database (Phase 2 future enhancement)  
**Testing**: Jest unit tests, Playwright E2E, manual accessibility testing  
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: web - frontend + backend (Express monolith)  
**Performance Goals**: <100ms theme switching, <50ms CSS transition duration, 60fps animations  
**Constraints**: WCAG AA contrast ratios (4.5:1 normal, 3:1 large), no page reload, no visual flickering  
**Scale/Scope**: 3 main pages, 7 key components, support for 1000+ vulnerability records in dark mode

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:

- Projects: 1 (HexTrackr web application - within limit)
- Using framework directly? YES (Tabler.io theming system used directly)
- Single data model? YES (ThemePreference entity only)
- Avoiding patterns? YES (Direct localStorage, no unnecessary abstractions)

**Architecture**:

- EVERY feature as library? N/A (UI theme system integrated with existing app)
- Libraries listed: theme-controller.js (theme management), chart-theme-adapter.js (ApexCharts theming)
- CLI per library: N/A (browser-based theme system)
- Library docs: Documentation integrated in quickstart.md

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor cycle enforced? YES (theme switching tests fail before implementation)
- Git commits show tests before implementation? YES (Playwright tests first, then JS implementation)
- Order: Contract→Integration→E2E→Unit strictly followed? YES (theme API contracts, E2E theme switching, unit validation)
- Real dependencies used? YES (actual browser localStorage, real DOM elements)
- Integration tests for: theme persistence, cross-tab sync, ApexCharts adaptation, AG-Grid theming
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:

- Structured logging included? YES (theme switch events, performance metrics)
- Frontend logs → backend? YES (theme preference analytics via existing logging)
- Error context sufficient? YES (localStorage errors, theme validation failures)

**Versioning**:

- Version number assigned? YES (1.0.13 → 1.1.0 - MINOR increment for new feature)
- BUILD increments on every change? YES (follows existing HexTrackr versioning)
- Breaking changes handled? NO breaking changes (purely additive theme system)

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application) - HexTrackr has frontend + backend Express monolith architecture

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## Progress Tracking

*This checklist is updated during execution flow*

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
