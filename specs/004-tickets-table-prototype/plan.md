# Implementation Plan: Tickets Table Modernization Prototype

**Branch**: `004-tickets-table-prototype` | **Date**: 2025-09-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-tickets-table-prototype/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → Successfully loaded spec.md with 15 functional requirements
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detected Project Type: web (frontend+backend integration)
   → Set Structure Decision: Existing HexTrackr structure
3. Fill the Constitution Check section based on the content of the constitution document.
   → JSDoc requirements, linting, testing requirements added
4. Evaluate Constitution Check section below
   → All checks pass, no violations
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → Researched AG-Grid patterns, multi-value handling, theme integration
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → Generated data model for grid configuration
   → Created API contracts for ticket endpoints
   → Developed quickstart testing guide
7. Re-evaluate Constitution Check section
   → All checks still pass
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

## Summary
Create a modernized tickets table prototype using AG-Grid Community Edition to display all tickets in single-line rows with enhanced user experience. The prototype (tickets2.html) will preserve all existing functionality while implementing progressive disclosure for multi-value fields, responsive design, and theme support. Research confirms AG-Grid Community provides all needed features including custom cell renderers, tooltips, and responsive column management.

## Technical Context
**Language/Version**: JavaScript ES6+, Node.js 18+
**Primary Dependencies**: AG-Grid Community v33+ (MUST use agGrid.createGrid()), Bootstrap 5, Tabler UI
**Storage**: SQLite (devices as JSON arrays, supervisors as semicolon-delimited text)
**Testing**: Playwright (E2E), Jest (unit tests)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: web - frontend enhancement with backend API integration
**Performance Goals**: < 200ms initial grid render, 60fps scrolling, handle 10k+ rows with row virtualization
**Constraints**: Community Edition only, AGGridThemeManager must be created (doesn't exist)
**Scale/Scope**: Support 1000+ tickets, 20+ devices per ticket, responsive to 320px width
**Critical Requirements**: Theme setting during grid creation, XSS protection, ARIA accessibility

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Article I: Development Framework
- ✅ Context gathered via Claude Context semantic search
- ✅ Will store insights in Memento after implementation
- ✅ JSDoc comments required for all new functions
- ✅ Documentation will be generated in app/public/docs-source/

### Article II: Claude Context Framework
- ✅ Used semantic search to understand existing patterns
- ✅ Researched vulnerabilities.html AG-Grid implementation
- ✅ Analyzed current tickets.html structure

### Article III: Spec-Kit Framework
- ✅ Following /specify → /plan → /tasks workflow
- ✅ Specification created without implementation details

### Article IV: MCP Tool Usage
- ✅ Will use Playwright for testing
- ✅ Claude Context for code discovery
- ✅ Brave Search for AG-Grid documentation research

### Article V & VI: External CLI Tools
- N/A - Not required for this feature

## Project Structure

### Documentation (this feature)
```
specs/004-tickets-table-prototype/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (HexTrackr existing structure)
```
app/
├── public/
│   ├── tickets2.html                        # New prototype page
│   ├── scripts/
│   │   ├── pages/
│   │   │   └── tickets2.js                  # New page controller
│   │   └── shared/
│   │       ├── ticket-grid.js               # New AG-Grid configuration
│   │       └── ticket-grid-theme-adapter.js # New theme management
│   └── styles/
│       └── tickets2.css                     # New prototype styles
├── services/
│   └── ticketService.js                     # Existing, no changes needed
└── routes/
    └── tickets.js                           # Existing, no changes needed
```

**Structure Decision**: Use existing HexTrackr web application structure

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context**:
   - AG-Grid Community multi-value cell strategies
   - Tooltip implementation for arrays
   - Theme switching with AG-Grid Quartz theme
   - Responsive column hiding patterns

2. **Generate and dispatch research agents**:
   ```
   Task: "Research AG-Grid Community array display patterns"
   Task: "Find best practices for AG-Grid tooltips with multiple values"
   Task: "Research AG-Grid Quartz theme switching implementation"
   Task: "Analyze existing vulnerability-grid.js patterns"
   ```

3. **Consolidate findings** in `research.md`:
   - Decision: Custom cell renderers with truncation
   - Rationale: Maintains readability while showing overflow
   - Alternatives considered: Expand/collapse rows (too complex for prototype)

**Output**: research.md with all AG-Grid patterns documented

## Phase 1: Design & Contracts

1. **Extract entities from feature spec** → `data-model.md`:
   - GridConfiguration entity with column definitions
   - TicketRow entity matching existing ticket structure
   - MultiValueDisplay configuration for devices/supervisors

2. **Generate API contracts** from functional requirements:
   - GET /api/tickets (existing, no changes)
   - GET /api/tickets/:id (existing, no changes)
   - PUT /api/tickets/:id (modify to include delete from modal)

3. **Generate contract tests** from contracts:
   - Test grid initialization with mock data
   - Test multi-value cell rendering
   - Test tooltip content generation

4. **Extract test scenarios** from user stories:
   - Load page → verify grid renders
   - Click ticket → verify modal opens
   - Hover truncated → verify tooltip shows full list

5. **Update CLAUDE.md incrementally**:
   - Add AG-Grid patterns section
   - Update recent changes with prototype info
   - Keep existing context

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md updates

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Create setup tasks for new files [P]
- Generate AG-Grid configuration tasks
- Create cell renderer tasks for multi-value fields [P]
- Generate theme integration tasks
- Create responsive behavior tasks
- Generate testing tasks

**Ordering Strategy**:
- HTML structure first
- AG-Grid configuration second
- Cell renderers third (parallel)
- Theme and responsive fourth
- Testing last

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks following constitutional principles)
**Phase 5**: Validation (Playwright tests, side-by-side comparison with tickets.html)

## Complexity Tracking
*No violations - all approaches align with constitutional requirements*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command + additional MCP enhancement)
- [x] Phase 2: Task planning complete (/plan command - approach described only)

**Constitution Checks**:
- [x] Initial Constitution Check passed
- [x] Post-Design Constitution Check passed
- [x] All MCP tools utilized:
  - [x] Claude Context: Used for semantic code search
  - [x] Brave Search: Researched AG-Grid best practices
  - [x] Context7: Validated patterns with official AG-Grid docs (Trust Score: 9.8)

**Artifacts Generated**:
- [x] research.md created (enhanced with AG-Grid best practices)
- [x] data-model.md created (comprehensive entity definitions)
- [x] contracts/ folder with API specs (complete REST and WebSocket)
- [x] quickstart.md created (detailed testing procedures)
- [x] CLAUDE.md updated (AG-Grid patterns section added)

---