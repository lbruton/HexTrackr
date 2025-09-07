# HexTrackr Module Boundaries & Architecture

## Overview

This document defines the modular architecture for HexTrackr's JavaScript codebase, establishing clear boundaries and responsibilities to enable AI-context-friendly development.

## Current State Analysis

### Large Files Requiring Refactoring

- `vulnerability-manager.js`: 2,614 lines → 8 modules (~300 lines each)
- `tickets.js`: 2,437 lines → 6 modules (~400 lines each)  
- `settings-modal.js`: 1,296 lines → 3 modules (~400 lines each)

## Target Architecture

### Long-Term Vision: Widget-Based Dashboard

**Strategic Goal**: Transform HexTrackr into a composable dashboard platform where users can drag-and-drop widgets to create personalized views. Each module being extracted becomes a potential dashboard widget with standardized interfaces.

### Vulnerability Management Module Structure (Widget-Ready)

```
scripts/pages/vulnerability/
├── vulnerability-core.js          # Main orchestrator (300 lines)
│   ├── Exports: ModernVulnManager class
│   ├── Imports: All other modules
│   └── Responsibilities: Initialization, coordination, event routing
│
├── vulnerability-grid.js          # AG Grid management (400 lines)
│   ├── Exports: GridManager class
│   ├── Dependencies: agGrid, vulnerability-data
│   └── Responsibilities: Grid init, column config, row updates
│
├── vulnerability-charts.js        # ApexCharts visualization (300 lines)
│   ├── Exports: ChartManager class
│   ├── Dependencies: ApexCharts, vulnerability-data
│   └── Responsibilities: Chart rendering, updates, timeline
│
├── vulnerability-cards.js         # Card view rendering (400 lines)
│   ├── Exports: CardRenderer class
│   ├── Dependencies: vulnerability-data, pagination-controller
│   └── Responsibilities: Device/vuln cards, pagination UI
│
├── vulnerability-modals.js        # Modal dialogs (300 lines)
│   ├── Exports: ModalManager class
│   ├── Dependencies: Bootstrap, vulnerability-data
│   └── Responsibilities: Device details, vuln info, import dialogs
│
├── vulnerability-data.js          # Data operations (400 lines)
│   ├── Exports: DataManager class
│   ├── Dependencies: Papa (CSV), fetch APIs
│   └── Responsibilities: Data fetching, processing, caching
│
├── vulnerability-import.js        # Import/export functions (300 lines)
│   ├── Exports: ImportManager class
│   ├── Dependencies: Papa, vulnerability-data
│   └── Responsibilities: CSV import, export, file handling
│
└── pagination-controller.js       # Reusable pagination (200 lines)
    ├── Exports: PaginationController class
    ├── Dependencies: None (pure utility)
    └── Responsibilities: Pagination logic, UI generation
```

### Ticket Management Module Structure

```
scripts/pages/tickets/
├── tickets-core.js                # Main orchestrator (400 lines)
├── tickets-table.js               # Table management (400 lines)
├── tickets-modals.js              # Modal dialogs (400 lines)
├── tickets-data.js                # Data operations (400 lines)
├── tickets-servicenow.js          # ServiceNow integration (400 lines)
└── tickets-attachments.js         # File attachment handling (400 lines)
```

### Settings Module Structure

```
scripts/shared/settings/
├── settings-core.js               # Main settings logic (400 lines)
├── settings-backup.js             # Backup/restore functions (400 lines)
└── settings-integrations.js       # Third-party integrations (400 lines)
```

## Module Communication Patterns

### Inter-Module Communication

```javascript
// Event-driven communication
window.dispatchEvent(new CustomEvent('vuln:dataUpdated', { detail: data }));

// Direct method calls for tight coupling
const chartManager = new ChartManager();
chartManager.updateData(processedData);

// Shared state through data manager
const dataManager = DataManager.getInstance();
```

### Dependency Management

- **Core modules** import and coordinate specialized modules
- **Specialized modules** export classes/functions, avoid cross-dependencies
- **Shared utilities** (like pagination) have no dependencies
- **Data managers** act as central state coordinators

## File Size Guidelines

### Target Sizes

- **Core orchestrators**: 300-400 lines
- **Specialized modules**: 300-400 lines  
- **Shared utilities**: 100-300 lines
- **Maximum context-friendly**: 500 lines (emergency limit)

### Complexity Guidelines

- **Cyclomatic complexity**: <15 per function
- **Class methods**: <50 lines each
- **Function parameters**: <5 parameters
- **Nesting levels**: <4 levels deep

## Refactoring Process

### Phase 1: Foundation Setup

1. Create architecture documentation system
2. Generate symbol table from current files
3. Define module boundaries (this document)
4. Extract one shared utility as proof of concept

### Phase 2: Core Refactoring

1. Start with vulnerability-manager.js (highest impact)
2. Extract modules in dependency order:
   - PaginationController (shared utility)
   - DataManager (data layer)
   - Specialized modules (grid, charts, cards, modals)
   - Core orchestrator (imports everything)

### Phase 3: Validation & Documentation

1. Update all import statements
2. Test functionality with Playwright
3. Update symbol table
4. Document patterns for future refactoring

## Testing Strategy

### Module Testing

- Each module exports testable classes/functions
- Unit tests for isolated functionality
- Integration tests for module communication
- End-to-end tests for complete workflows

### Refactoring Safety

- Extract modules incrementally
- Test after each extraction
- Maintain working state always
- Use git checkpoints frequently

## Memory System Integration

### Symbol Table Updates

- Auto-generate after each refactor phase
- Store in `/dev-docs/architecture/symbol-table.json`
- Include: name, type, file, line, dependencies, description
- Accessible to all AI assistants via Memento

### Progress Tracking

- Document each refactoring milestone in Memento
- Record lessons learned and patterns discovered
- Track performance and complexity improvements
- Enable knowledge sharing across AI sessions

## Success Criteria

### Immediate Goals

- ✅ All files < 500 lines (AI context friendly)
- ✅ Clear module boundaries and responsibilities
- ✅ Improved Codacy complexity scores
- ✅ Maintained functionality (zero regression)

### Long-term Goals  

- 📈 50% faster AI-assisted development
- 📈 Parallel development across multiple modules
- 📈 Easier maintenance and feature additions
- 📈 Reusable component library

## Future Expansion

### New Module Addition Process

1. Check symbol table for conflicts
2. Define clear boundaries and dependencies
3. Follow established patterns
4. Update documentation
5. Test integration

### Module Evolution Guidelines

- Keep modules focused on single responsibility
- Avoid feature creep within modules
- Split modules when they exceed size limits
- Maintain clear interfaces between modules

---

*This document is living and will be updated as the refactoring progresses and patterns emerge.*
