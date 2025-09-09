# Implementation Plan: Modal System Z-Index Enhancement

**Branch**: `005-modal-system-enhancement` | **Date**: 2025-09-09 | **Spec**: [link](./spec.md)
**Input**: Feature specification from `/specs/005-modal-system-enhancement/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → Loaded: Modal z-index conflicts in nested modal scenarios
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Project Type: web (frontend CSS + JavaScript), HexTrackr modal system
   → Structure Decision: Enhancement to existing modal architecture
3. Evaluate Constitution Check section below
   → No violations: Simple CSS and JavaScript enhancement
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → CSS z-index best practices, modal management patterns
5. Execute Phase 1 → contracts, data-model.md, quickstart.md
   → Modal state contracts, z-index hierarchy model, testing guide
6. Re-evaluate Constitution Check section
   → No new violations: Enhancement maintains existing patterns
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach
   → CSS framework updates, JavaScript modal manager enhancement
8. STOP - Ready for /tasks command
```

## Summary

Critical UX enhancement to resolve z-index conflicts in nested modal scenarios where multiple modals (settings, vulnerability details, device security) create visual obstructions and accessibility issues. Technical approach involves implementing proper CSS z-index hierarchy and JavaScript modal state management for clean modal layering.

## Technical Context

**Language/Version**: JavaScript ES2020+, CSS3 (existing HexTrackr frontend)  
**Primary Dependencies**: Existing modal system (vulnerability-details-modal.js, settings-modal.js), Tabler.io CSS framework  
**Storage**: N/A (frontend enhancement only)  
**Testing**: Playwright E2E tests for modal interactions, visual regression testing  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: web (frontend enhancement - CSS + JavaScript)  
**Performance Goals**: Modal transitions <200ms, no visual flicker during layering  
**Constraints**: Zero functionality regression, maintain existing modal APIs  
**Scale/Scope**: All modal components across HexTrackr interface

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:

- Projects: 1 (modal system enhancement only)
- Using framework directly? (yes - extending existing Tabler.io modal patterns)
- Single data model? (yes - modal state and z-index hierarchy)
- Avoiding patterns? (no new architectural patterns introduced)

**Architecture**:

- EVERY feature as library? (enhancement to existing modal modules)
- Libraries listed: Modal state manager for z-index coordination
- CLI per library: N/A (frontend enhancement)
- Library docs: Modal usage patterns documentation

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor cycle enforced? (E2E tests for modal layering first)
- Git commits show tests before implementation? (required)
- Order: E2E→Integration→Unit for modal interactions
- Real dependencies used? (actual browser modal rendering)
- Integration tests for: modal state management, z-index conflicts, nested interactions
- FORBIDDEN: Implementation before E2E modal tests

**Observability**:

- Structured logging included? (modal state transitions logged)
- Frontend logs → backend? (modal interaction events)
- Error context sufficient? (z-index conflict detection)

**Versioning**:

- Version number assigned? (1.0.13 - modal enhancement)
- BUILD increments on every change? (yes)
- Breaking changes handled? (backward compatible modal API)

## Project Structure

### Documentation (this feature)

```
specs/005-modal-system-enhancement/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Modal system enhancement structure
app/public/
├── scripts/shared/
│   ├── modal-manager.js         # Enhanced z-index coordination
│   ├── vulnerability-details-modal.js  # Updated for layering
│   ├── settings-modal.js        # Updated for layering
│   └── device-security-modal.js # Updated for layering
├── styles/
│   ├── modal-enhancements.css   # Z-index hierarchy definitions
│   └── modal-transitions.css    # Smooth layering animations
└── __tests__/
    ├── e2e/
    │   └── modal-layering.spec.js
    └── unit/
        └── modal-manager.test.js
```

**Structure Decision**: Option 1 (single project) - Frontend enhancement to existing architecture

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - CSS z-index best practices for modal layering
   - JavaScript modal state management patterns
   - Browser compatibility for nested modal focus management
   - Performance impact of z-index calculations

2. **Generate and dispatch research agents**:

   ```
   Task: "Research CSS z-index best practices for nested modal systems"
   Task: "Find JavaScript modal state management patterns for layering"
   Task: "Research accessibility requirements for nested modal focus"
   Task: "Find performance optimization techniques for modal transitions"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: CSS custom properties for dynamic z-index management
   - Rationale: Maintainable and performant layering system
   - Alternatives considered: Fixed z-index values, JavaScript-only management

**Output**: research.md with modal enhancement technical decisions

## Phase 1: Design & Contracts

*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - ModalState entity with z-index, layer, visibility properties
   - ModalLayer hierarchy with parent/child relationships
   - ModalManager singleton for coordination
   - FocusManager for accessibility handling

2. **Generate API contracts** from functional requirements:
   - openModal(modalId, options) with z-index calculation
   - closeModal(modalId) with layer management
   - getModalLayer(modalId) for state queries
   - Output modal management API to `/contracts/`

3. **Generate contract tests** from contracts:
   - Modal opening in correct z-index layer
   - Proper layer cleanup on modal close
   - Focus management between modal layers
   - Tests must fail (no z-index management yet)

4. **Extract test scenarios** from user stories:
   - Settings → Device Security nested workflow
   - Vulnerability Details → CVE Information → External References
   - Rapid modal opening/closing scenarios
   - Quickstart test = nested modal workflow validation

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh claude`
   - Add: CSS z-index management, modal state coordination
   - Update recent changes (modal system enhancement)
   - Keep under 150 lines for token efficiency

**Output**: data-model.md, /contracts/*, failing E2E tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach

*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each modal state contract → E2E test task [P]
- Each z-index scenario → implementation task
- Each user workflow → integration test task
- CSS and JavaScript implementation tasks for layering

**Ordering Strategy**:

- TDD order: E2E modal tests before implementation
- Dependency order: CSS foundation before JavaScript coordination
- Mark [P] for parallel execution (different modal types)

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run E2E tests, execute quickstart.md, performance validation)

## Complexity Tracking

*No constitutional violations identified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Progress Tracking

*This checklist is updated during execution flow*

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---
*Based on Constitution v1.0.0 - See `/memory/constitution.md`*
