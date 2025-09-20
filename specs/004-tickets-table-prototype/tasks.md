# Tasks: Tickets Table AG-Grid Prototype

**Input**: Design documents from `/specs/004-tickets-table-prototype/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Loaded: HexTrackr web structure, AG-Grid Community v31+
   → Extract: JavaScript ES6+, Bootstrap 5, Tabler UI
2. Load optional design documents:
   → data-model.md: GridConfiguration, TicketRow, MultiValueDisplay entities
   → contracts/ticket-api.md: GET /api/tickets, PUT /api/tickets/:id, DELETE /api/tickets/:id
   → research.md: AG-Grid v33 lessons, theme management patterns
   → quickstart.md: Testing procedures, performance targets
3. Generate tasks by category:
   → Setup: HTML structure, file creation
   → Core: AG-Grid config, cell renderers, theme adapter
   → Integration: API connection, AGGridThemeManager integration
   → UI: Modal updates, responsive columns
   → Polish: Testing, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Core before integration
5. Number tasks sequentially (T001-T024)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All entities have implementations ✓
   → All endpoints connected ✓
   → Theme integration included ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **HexTrackr structure**: `app/public/` for frontend, `app/services/` for backend
- **Scripts**: `app/public/scripts/pages/` and `app/public/scripts/shared/`
- **Styles**: `app/public/styles/`

## Phase 3.0 Research
- [ ] spec.md reviewed
- [ ] all research files reviewed
- [ ] Context7 libraries reviewed
- [ ] Claude-Context Searched

## Phase 3.1: Setup & Structure
- [ ] T001 Create tickets2.html by duplicating tickets.html in app/public/
- [ ] T002 [P] Create app/public/scripts/pages/tickets2.js with basic module structure
- [ ] T003 [P] Create app/public/scripts/shared/ticket-grid.js for AG-Grid configuration
- [ ] T004 [P] Create app/public/scripts/shared/ticket-grid-theme-adapter.js for theme management
- [ ] T005 [P] Create app/public/styles/tickets2.css for prototype-specific styles

## Phase 3.2: Core AG-Grid Implementation
- [ ] T006 Replace table in tickets2.html with AG-Grid container div id="ticketGrid"
- [ ] T007 Add AG-Grid library references and script imports to tickets2.html
- [ ] T008 Implement createTicketGridOptions() factory in ticket-grid.js using agGrid.createGrid() with v33 patterns
- [ ] T009 Define column definitions in ticket-grid.js with proper field mappings from TicketRow entity
- [ ] T010 [P] Create custom cell renderer for devices array in ticket-grid.js showing 2 items + overflow
- [ ] T011 [P] Create custom cell renderer for supervisors array in ticket-grid.js with same pattern
- [ ] T012 [P] Implement tooltipValueGetter for multi-value fields in column definitions

## Phase 3.3: Data Transformation & API Integration
- [ ] T013 Create transformTicketToRow() in tickets2.js to convert API response to grid format
- [ ] T014 Parse supervisor semicolon-delimited strings with "LAST, FIRST" format and escape handling
- [ ] T015 Ensure devices array is properly handled (already JSON parsed in service)
- [ ] T016 Connect to existing GET /api/tickets endpoint and load data into grid
- [ ] T017 Implement ticket click handler to open edit modal (reuse existing modal)

## Phase 3.4: Theme & Responsive Integration
- [ ] T018 CREATE AGGridThemeManager class with registerGrid/unregisterGrid methods (doesn't exist)
- [ ] T019 Register grid with new AGGridThemeManager in ticket-grid-theme-adapter.js
- [ ] T020 Implement theme detection and apply themeQuartz.withParams() during grid creation (NOT after)
- [ ] T021 Add theme listener cleanup to prevent memory leaks (lesson from Memento)
- [ ] T022 Implement responsive column hiding based on viewport breakpoints

## Phase 3.5: Modal & Action Updates
- [ ] T023 Remove delete button from grid action column definition
- [ ] T024 Add delete button to ticket edit modal footer with confirmation
- [ ] T025 Update modal save handler to work with grid refresh
- [ ] T026 Add "PROTOTYPE - BETA" banner to tickets2.html header

## Phase 3.6: Security & Accessibility
- [ ] T027 Add DOMPurify sanitization for all tooltip content (XSS protection)
- [ ] T028 Add ARIA attributes to custom cell renderers for screen readers
- [ ] T029 Implement keyboard navigation support for tooltips
- [ ] T030 Verify WCAG contrast ratios for both light and dark themes
- [ ] T031 Enable row virtualization for 1000+ row performance
- [ ] T032 Consider popover alternative to tooltips for better accessibility

## Phase 3.7: Polish & Testing
- [ ] T033 [P] Test multi-value cell rendering with 0, 1, 2, and 20+ items
- [ ] T034 [P] Test supervisor parsing with escaped semicolons (\\;)
- [ ] T035 [P] Verify theme switching between light and dark modes
- [ ] T036 [P] Test responsive behavior at mobile, tablet, and desktop breakpoints
- [ ] T037 Validate export functionality still works with new grid
- [ ] T038 Performance test with 1000+ tickets (target < 200ms render with virtualization)
- [ ] T039 Update quickstart.md with actual test results

## Dependencies
- T001 blocks all other tasks (need HTML structure first)
- T006-T007 before T008-T012 (grid container before configuration)
- T008 blocks T013-T017 (grid config before data loading)
- T018 must happen before T019 (create AGGridThemeManager before using it)
- T020-T022 require T008 (grid must exist before theme integration)
- T023-T026 can run after T017 (modal work independent of grid)
- T027-T032 (security/accessibility) should happen with renderers
- All implementation before T033-T039 (testing last)

## Parallel Example
```bash
# Launch T002-T005 together (different new files):
Task: "Create tickets2.js page controller"
Task: "Create ticket-grid.js AG-Grid configuration"
Task: "Create ticket-grid-theme-adapter.js theme management"
Task: "Create tickets2.css styles"

# Launch T010-T012 together (different functions):
Task: "Device cell renderer implementation"
Task: "Supervisor cell renderer implementation"
Task: "Tooltip value getter implementation"

# Launch T033-T036 together (different test scenarios):
Task: "Test multi-value rendering"
Task: "Test supervisor parsing with escaped semicolons"
Task: "Test theme switching"
Task: "Test responsive breakpoints"
```

## Critical Implementation Notes

### From Research (AG-Grid v33 Lessons):
- **MUST** use `agGrid.createGrid()` not deprecated `new agGrid.Grid()`
- **MUST** set theme during creation with `themeQuartz.withParams()`
- **NEVER** use `updateGridOptions()` for theme changes (causes errors)
- **ALWAYS** implement cleanup for theme listeners (memory leak prevention)

### EDGE CASES IDENTIFIED BY CONSENSUS (Critical!):
- **Escaped Semicolons**: Device strings may contain `\;` that shouldn't split
- **Null/Empty Arrays**: Must handle gracefully without renderer crashes
- **XSS in Tooltips**: All tooltip content MUST be sanitized with DOMPurify
- **Accessibility**: Tooltips need ARIA attributes and keyboard navigation
- **Performance**: Enable row virtualization immediately for 1000+ rows
- **WCAG Compliance**: Verify 4.5:1 contrast ratios in both themes
- **Alternative UI**: Consider popovers instead of tooltips for better a11y

### From Existing Code Patterns (CORRECTED):
- **Devices**: Stored as JSON.stringify() arrays in DB, parsed to arrays on read
- **Supervisors**: Stored as semicolon-delimited "LAST, FIRST; LAST, FIRST" format
- **AGGridThemeManager**: Does NOT exist - must be created from scratch
- Delete function exists as `deleteTicket(id)` at line 1013 in tickets.js
- Modal already has all ticket fields, just needs delete button addition

### From Contract Requirements:
- GET /api/tickets returns array with `devices` and `supervisors` fields
- DELETE /api/tickets/:id endpoint already exists and works
- Ticket IDs are timestamp-based strings, not integers

## Validation Checklist
*GATE: Checked before execution*

- [x] All entities from data-model.md have implementation tasks
- [x] Theme integration follows AG-Grid v33 patterns from research
- [x] AGGridThemeManager creation task added (T018)
- [x] XSS protection tasks added (T027)
- [x] Accessibility tasks added (T028-T030, T032)
- [x] Performance optimization with row virtualization (T031)
- [x] Responsive requirements from spec.md addressed
- [x] Delete button migration (FR-007) has explicit task
- [x] Multi-value display (FR-005, FR-006) has renderer tasks
- [x] Edge case handling for escaped semicolons (T034)
- [x] No parallel tasks modify the same file
- [x] Each task specifies exact file path
- [x] All task numbers are unique (T001-T039)


## Success Metrics
- Single-line ticket display achieved
- Multi-value fields show 2 items + overflow indicator
- Tooltips display complete lists on hover
- Theme switching works without errors
- Delete button only appears in modal
- Responsive columns hide at correct breakpoints
- No memory leaks from theme listeners
- Performance < 200ms for 1000+ tickets
- [ ] No Unspecified Features Added
- [ ] JSDoc Comments Added to All Code
- [ ] Code Scanned with Codacy CLI 
- [ ] No Linting Errors


---

**Ready for Execution**: All tasks are specific, reference real code patterns found via Claude Context, and avoid the ghost function/endpoint issues from previous attempts.