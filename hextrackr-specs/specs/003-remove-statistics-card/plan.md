# Implementation Plan: Remove Statistics Card Flip Instruction Banner

**Branch**: `003-remove-statistics-banner` | **Date**: 2025-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-remove-statistics-card/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Project Type: Web application (frontend only change)
   → Structure Decision: Option 2 (web application)
3. Evaluate Constitution Check section below
   → No violations - simple UI removal task
   → Update Progress Tracking: Initial Constitution Check PASS
4. Execute Phase 0 → research.md
   → Research current implementation complete
5. Execute Phase 1 → contracts, data-model.md, quickstart.md
   → No contracts needed (UI-only change)
   → No data model changes required
   → Quickstart scenarios generated
6. Re-evaluate Constitution Check section
   → No violations introduced
   → Update Progress Tracking: Post-Design Constitution Check PASS
7. Plan Phase 2 → Task generation approach defined
8. STOP - Ready for /tasks command
```

## Summary

Remove the blue informational banner that instructs users to "Click on any statistics card to flip between vulnerability counts and VPR scores" from the vulnerabilities dashboard. This is a simple UI cleanup task that removes visual clutter while preserving all existing card flip functionality.

## Technical Context

**Language/Version**: JavaScript ES6+ / HTML5  
**Primary Dependencies**: Tabler.io CSS Framework, AG Grid, Chart.js  
**Storage**: N/A (UI-only change)  
**Testing**: Playwright E2E tests  
**Target Platform**: Web browsers (Chrome, Firefox, Safari)
**Project Type**: web - HexTrackr vulnerability management dashboard  
**Performance Goals**: Maintain current page load times (<500ms)  
**Constraints**: No changes to card flip functionality  
**Scale/Scope**: Single HTML element removal with spacing adjustment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:

- Projects: 1 (web frontend only)
- Using framework directly? Yes (Tabler.io CSS)
- Single data model? N/A (no data changes)
- Avoiding patterns? Yes (simple DOM removal)

**Architecture**:

- EVERY feature as library? N/A (UI-only change)
- Libraries listed: N/A
- CLI per library: N/A
- Library docs: N/A

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor cycle enforced? Yes (tests will fail after banner removal)
- Git commits show tests before implementation? Yes
- Order: Contract→Integration→E2E→Unit strictly followed? E2E only (UI change)
- Real dependencies used? Yes (actual browser testing)
- Integration tests for: N/A (no new libraries or contracts)
- FORBIDDEN: Implementation before test ✓ Avoided

**Observability**:

- Structured logging included? N/A (UI-only)
- Frontend logs → backend? N/A
- Error context sufficient? Console errors monitored

**Versioning**:

- Version number assigned? Will follow HexTrackr versioning
- BUILD increments on every change? Yes
- Breaking changes handled? No breaking changes

## Project Structure

### Documentation (this feature)

```
specs/003-remove-statistics-card/
├── spec.md              # Feature specification ✓
├── plan.md              # This file ✓
├── research.md          # Phase 0 output ✓
├── data-model.md        # N/A (no data changes)
├── quickstart.md        # Phase 1 output ✓
├── contracts/           # N/A (no API changes)
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code (repository root)

```
# HexTrackr uses a monolithic structure:
app/
└── public/
    ├── vulnerabilities.html     # Target file for banner removal
    ├── scripts/
    │   └── shared/
    │       └── vulnerability-statistics.js  # Contains flip functionality
    └── styles/
        └── pages/
            └── vulnerabilities.css  # May need spacing adjustments

tests/
└── e2e/
    └── vulnerability-banner.spec.js  # New test file
```

**Structure Decision**: Existing HexTrackr monolithic structure maintained

## Phase 0: Outline & Research

### Research Findings

1. **Banner Location Identified**:
   - File: `app/public/vulnerabilities.html`
   - Line: 722-726
   - Element: `<div class="alert alert-info">` containing the instruction text

2. **Card Flip Functionality Analysis**:
   - Implemented in: `scripts/shared/vulnerability-statistics.js`
   - Method: `flipStatCards()` function
   - No dependency on the banner element
   - Flip functionality is self-contained

3. **CSS Impact Assessment**:
   - Banner uses Tabler.io's alert classes
   - No custom CSS specific to this banner
   - Spacing handled by Bootstrap/Tabler grid system

4. **JavaScript Dependencies**:
   - No JavaScript references to the banner element
   - Card flip functionality operates independently
   - No event listeners attached to the banner

**Output**: research.md created with implementation findings

## Phase 1: Design & Contracts

*Prerequisites: research.md complete*

### Design Decisions

1. **No Data Model Changes**: This is a pure UI modification
2. **No API Contracts**: No backend interaction required
3. **Test Scenarios Generated**: See quickstart.md for E2E test scenarios
4. **No Agent File Updates**: Simple UI change doesn't require agent context updates

### Test Strategy

- **E2E Tests**: Verify banner removal and card functionality
- **Visual Regression**: Ensure spacing remains balanced
- **Cross-browser**: Test on Chrome, Firefox, Safari
- **Responsive**: Test on mobile, tablet, desktop viewports

**Output**: quickstart.md with test scenarios

## Phase 2: Task Planning Approach

*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

1. Create E2E test for banner absence (RED phase)
2. Create E2E test for preserved flip functionality
3. Remove banner element from HTML
4. Adjust spacing if needed
5. Run all tests (GREEN phase)
6. Visual verification across devices

**Ordering Strategy**:

1. Tests first (TDD approach)
2. Implementation (simple removal)
3. Validation (run tests)

**Estimated Output**: 5-7 numbered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

*No violations - section not needed for this simple UI change*

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
- [x] Complexity deviations documented (none needed)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
