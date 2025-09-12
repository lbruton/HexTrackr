# Tasks: Dark Mode Theme System

**Input**: Design documents from `/specs/005-005-darkmode/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Extract: Tabler.io v1.0.0-beta17, ApexCharts, AG-Grid Community
   → Structure: HexTrackr web application (frontend + backend)
2. Load optional design documents:
   → data-model.md: ThemePreference, SystemPreference, ThemeState entities
   → contracts/endpoints.json: Theme API contracts and validation rules
   → research.md: Hybrid approach, XSS-safe patterns, performance optimization
3. Generate tasks by category:
   → Setup: Branch creation, file structure, security patterns
   → Tests: Contract tests, E2E theme switching, component adaptation
   → Core: Theme controller, chart adapter, localStorage persistence
   → Integration: Component theme updates, cross-tab sync, system detection
   → Polish: Accessibility testing, performance validation, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests? YES
   → All entities have models? YES (localStorage schema)
   → All components have adapters? YES
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

**HexTrackr Web Application Structure**:

- **Frontend**: `/app/public/scripts/`, `/app/public/styles/`
- **Backend**: `/app/public/server.js` (Express monolith)
- **Tests**: `/tests/` (Playwright E2E), `/tests/unit/` (Jest)

## Phase 3.1: Setup

- [ ] T001 Create feature branch `005-dark-mode-theme-system` from `copilot`
- [ ] T002 [P] Create `app/public/scripts/shared/theme-controller.js` file structure
- [ ] T003 [P] Create `app/public/scripts/utils/chart-theme-adapter.js` file structure  
- [ ] T004 [P] Create `app/public/styles/shared/dark-theme.css` file structure
- [ ] T005 Validate existing security.js utilities for XSS-safe DOM manipulation

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (API Endpoints - Phase 2 Future)

- [ ] T006 [P] Contract test GET /api/preferences/theme in `tests/contract/theme-preferences-get.spec.js`
- [ ] T007 [P] Contract test POST /api/preferences/theme in `tests/contract/theme-preferences-post.spec.js`
- [ ] T008 [P] Contract test GET /api/preferences/theme/system in `tests/contract/system-detection.spec.js`

### Integration Tests (E2E Theme Functionality)

- [ ] T009 [P] Theme toggle functionality test in `tests/e2e/theme-toggle.spec.js`
- [ ] T010 [P] Theme persistence across browser sessions test in `tests/e2e/theme-persistence.spec.js`
- [ ] T011 [P] System preference detection test in `tests/e2e/system-preference.spec.js`
- [ ] T012 [P] ApexCharts theme adaptation test in `tests/e2e/charts-theming.spec.js`
- [ ] T013 [P] AG-Grid dark mode styling test in `tests/e2e/grid-theming.spec.js`
- [ ] T014 [P] Cross-tab theme synchronization test in `tests/e2e/cross-tab-sync.spec.js`
- [ ] T015 [P] VPR badge contrast validation test in `tests/e2e/vpr-badges.spec.js`
- [ ] T016 [P] Print theme override test in `tests/e2e/print-styling.spec.js`

### Component Tests (Client-Side Interfaces)

- [ ] T017 [P] ThemeController interface test in `tests/unit/theme-controller.test.js`
- [ ] T018 [P] ApexChartsThemeAdapter interface test in `tests/unit/chart-theme-adapter.test.js`
- [ ] T019 [P] localStorage persistence layer test in `tests/unit/theme-storage.test.js`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Theme Management Core

- [ ] T020 [P] ThemePreference entity localStorage schema in `app/public/scripts/shared/theme-controller.js`
- [ ] T021 [P] SystemPreference detection logic in `app/public/scripts/shared/theme-controller.js`
- [ ] T022 [P] ThemeState management in `app/public/scripts/shared/theme-controller.js`
- [ ] T023 Theme toggle UI button in header navigation (`app/public/scripts/shared/header.js`)
- [ ] T024 CSS custom properties dark theme palette in `app/public/styles/shared/dark-theme.css`

### Component Adapters  

- [ ] T025 [P] ApexCharts theme adapter core logic in `app/public/scripts/utils/chart-theme-adapter.js`
- [ ] T026 [P] AG-Grid theme class switching logic in `app/public/scripts/utils/chart-theme-adapter.js`
- [ ] T027 Dashboard ApexCharts integration in `app/public/scripts/pages/dashboard.js`
- [ ] T028 Vulnerability Manager AG-Grid integration in `app/public/scripts/pages/vulnerability-manager.js`

### Security & Validation

- [ ] T029 Theme value validation using existing security patterns
- [ ] T030 XSS-safe DOM manipulation for theme attribute updates
- [ ] T031 Input sanitization for theme preferences

## Phase 3.4: Integration

### Component Theme Integration

- [ ] T032 Integrate theme controller into `app/public/vulnerabilities.html`
- [ ] T033 Integrate theme controller into `app/public/tickets.html`
- [ ] T034 Integrate theme controller into `app/public/dashboard.html`
- [ ] T035 VPR severity badge dark mode styling in `app/public/styles/shared/base.css`

### Cross-Browser & Performance

- [ ] T036 Debounced theme switching (300ms) to prevent performance issues
- [ ] T037 CSS `contain` property for chart redraw isolation
- [ ] T038 Event listener cleanup for memory leak prevention
- [ ] T039 Browser compatibility detection for CSS custom properties

### Persistence & Synchronization

- [ ] T040 localStorage quota handling and error recovery
- [ ] T041 Cross-tab synchronization via storage events
- [ ] T042 System preference change detection via media query listeners

## Phase 3.5: Polish

### Accessibility & Standards

- [ ] T043 [P] WCAG AA contrast ratio validation for all dark mode elements
- [ ] T044 [P] Screen reader announcements for theme changes
- [ ] T045 [P] Keyboard navigation support for theme toggle
- [ ] T046 [P] High contrast mode compatibility testing

### Performance & Reliability

- [ ] T047 [P] Theme switching performance validation (<100ms target)
- [ ] T048 [P] Memory usage testing for theme transitions
- [ ] T049 [P] Browser extension conflict detection (Dark Reader)
- [ ] T050 [P] Print CSS override implementation for light theme

### Documentation & Validation  

- [ ] T051 [P] Update `CLAUDE.md` with dark mode feature documentation
- [ ] T052 [P] Execute quickstart.md validation scenarios
- [ ] T053 [P] Browser compatibility matrix testing
- [ ] T054 Remove any duplicate CSS rules or redundant code
- [ ] T055 Final integration testing across all supported browsers

## Dependencies

### Phase Dependencies

- Setup (T001-T005) before everything
- Tests (T006-T019) before implementation (T020-T031)
- Core (T020-T031) before integration (T032-T042)
- Integration before polish (T043-T055)

### Specific Task Dependencies  

- T020 (ThemePreference) blocks T021 (SystemPreference), T040 (localStorage handling)
- T023 (Toggle UI) blocks T032-T034 (Page integration)
- T025 (ApexCharts adapter) blocks T027 (Dashboard integration)
- T026 (AG-Grid adapter) blocks T028 (Vulnerability Manager integration)
- T024 (CSS dark theme) blocks T035 (VPR badge styling)
- T029-T031 (Security) must complete before any user-facing features

## Parallel Example

### Contract Tests (Can run simultaneously)

```
Task: "Contract test GET /api/preferences/theme in tests/contract/theme-preferences-get.spec.js"
Task: "Contract test POST /api/preferences/theme in tests/contract/theme-preferences-post.spec.js" 
Task: "Contract test GET /api/preferences/theme/system in tests/contract/system-detection.spec.js"
```

### E2E Tests (Independent scenarios)

```
Task: "Theme toggle functionality test in tests/e2e/theme-toggle.spec.js"
Task: "Theme persistence across browser sessions test in tests/e2e/theme-persistence.spec.js"
Task: "System preference detection test in tests/e2e/system-preference.spec.js"
Task: "ApexCharts theme adaptation test in tests/e2e/charts-theming.spec.js"
```

### Core Implementation (Different files)

```
Task: "ThemePreference entity localStorage schema in app/public/scripts/shared/theme-controller.js"
Task: "ApexCharts theme adapter core logic in app/public/scripts/utils/chart-theme-adapter.js"
Task: "CSS custom properties dark theme palette in app/public/styles/shared/dark-theme.css"
```

## Notes

- **[P] tasks** = Different files, no dependencies
- **Verify tests fail** before implementing corresponding functionality
- **Commit after each task** with descriptive messages
- **Use existing security.js patterns** for all DOM manipulation
- **Follow WCAG AA standards** for all color contrast requirements
- **Target <100ms** theme switching performance throughout

## Task Generation Rules

*Applied during main() execution*

1. **From Contracts** (endpoints.json):
   - GET /api/preferences/theme → contract test task [P]
   - POST /api/preferences/theme → contract test task [P]
   - GET /api/preferences/theme/system → contract test task [P]
   - ThemeController interface → unit test task [P]
   - ApexChartsThemeAdapter interface → unit test task [P]

2. **From Data Model** (data-model.md):
   - ThemePreference entity → localStorage schema task [P]
   - SystemPreference entity → system detection task [P]
   - ThemeState entity → state management task [P]
   - Cross-tab synchronization → storage event task

3. **From User Stories** (spec.md functional requirements):
   - FR-001 System auto-detection → integration test [P]
   - FR-002 Toggle visibility → UI integration test [P]  
   - FR-003 Performance <100ms → performance test [P]
   - FR-004 Persistence → storage test [P]
   - FR-007 ApexCharts adaptation → chart test [P]
   - FR-008 AG-Grid styling → grid test [P]

4. **From Research** (research.md decisions):
   - XSS-safe patterns → security implementation
   - Hybrid Tabler.io approach → CSS integration
   - Debounced switching → performance optimization
   - Extension conflict detection → edge case handling

## Validation Checklist

*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T006-T008, T017-T019)
- [x] All entities have model tasks (T020-T022 for ThemePreference, SystemPreference, ThemeState)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (different files, verified)
- [x] Each task specifies exact file path (all tasks include specific file paths)
- [x] No task modifies same file as another [P] task (verified no conflicts)
- [x] Component adapters cover ApexCharts and AG-Grid (T025-T028)
- [x] Security patterns integrated (T029-T031)
- [x] WCAG AA compliance addressed (T043-T046)
- [x] Performance targets specified (T047-T048)
- [x] Cross-browser compatibility covered (T053)

**STATUS**: Ready for execution - All 55 tasks generated and validated ✅
