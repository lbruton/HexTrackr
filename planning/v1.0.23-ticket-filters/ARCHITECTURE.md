# v1.0.23 Ticket Filters - Technical Architecture

## Architecture Overview

The card filtering feature integrates with HexTrackr's existing ticket management system by extending the current filter chain architecture. This approach preserves all existing functionality while adding new card-based filtering capabilities.

## System Components

### Component Interaction Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Statistics    │    │   HexagonTickets│    │    AG-Grid      │
│     Cards       │───▶│    Manager      │───▶│   Integration   │
│   (UI Layer)    │    │  (Logic Layer)  │    │  (View Layer)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         └──────────────▶│  Filter Chain   │◀─────────────┘
                         │   Processor     │
                         └─────────────────┘
```

### Core Components

#### 1. Statistics Cards (UI Layer)
**Location**: `/app/public/tickets2.html` (lines 362-446)

**Responsibility**: User interaction surface for filter selection

**Key Features**:
- Click event handlers
- Visual feedback (hover, active states)
- Accessibility attributes (ARIA, keyboard support)
- Theme-aware styling

**Structure**:
```html
<div class="card stats-card"
     data-filter-type="filterType"
     onclick="window.ticketManager?.applyCardFilter('filterType')"
     role="button"
     tabindex="0"
     aria-label="Filter description">
```

#### 2. HexagonTicketsManager (Logic Layer)
**Location**: `/app/public/scripts/pages/tickets.js`

**Responsibility**: Filter state management and business logic

**Key Methods**:
- `applyCardFilter(filterType)` - Primary filter application
- `applyCardFilterLogic(ticket)` - Individual ticket filtering logic
- `getFilteredTickets()` - Master filter chain processor
- `updateCardStyles(filterType)` - Visual state management
- `updateStatistics()` - Statistics calculation

#### 3. AG-Grid Integration (View Layer)
**Location**: `/app/public/scripts/pages/tickets-aggrid.js`

**Responsibility**: Grid display and data synchronization

**Integration Points**:
- Uses `getFilteredTickets()` for data source
- Handles pagination reset on filter changes
- Manages empty state display

## Data Flow Architecture

### Filter Processing Pipeline

```
┌───────────────┐
│ User Clicks   │
│ Statistics    │
│ Card          │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ applyCardFilter│
│ - Store state  │
│ - Update UI    │
│ - Reset other  │
│   filters      │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ renderTickets  │
│ (triggers      │
│ getFiltered)   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ getFiltered    │
│ Tickets        │
│ - Apply search │
│ - Apply card   │
│ - Apply status │
│ - Apply location│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ AG-Grid        │
│ setGridOption  │
│ (rowData)      │
└───────────────┘
```

### Filter Precedence Chain

1. **Text Search** (highest precedence)
   - Applies across all ticket fields
   - Always active when search term present

2. **Card Filter** (primary status filter)
   - Overrides status dropdown when active
   - Four predefined combinations

3. **Status Dropdown** (secondary status filter)
   - Only active when no card filter selected
   - Exact status matching

4. **Location Filter** (lowest precedence)
   - Geographic filtering
   - Independent of other filters

**Result**: Intersection (AND) of all active filters

## State Management

### Filter State Properties

```javascript
class HexagonTicketsManager {
    constructor() {
        // Filter state
        this.activeCardFilter = null; // 'all', 'open', 'overdue', 'completed'

        // Performance optimization
        this.cachedFilters = null;
        this.cachedFilteredTickets = null;
        this.filterDebounceTimer = null;
    }
}
```

### State Transitions

```
┌─────────────┐    click card    ┌─────────────┐
│   No Filter │ ──────────────▶  │ Card Active │
│   (All)     │                  │             │
└─────────────┘                  └─────────────┘
       ▲                              │
       │                              │ click same card
       │                              │ OR status dropdown
       └──────────────────────────────┘
```

### Mutual Exclusivity Rules

1. **Card ↔ Status Dropdown**:
   - Selecting card clears status dropdown
   - Selecting status dropdown clears card filter

2. **Card ↔ Card**:
   - Only one card can be active
   - Clicking same card twice resets to "all"

3. **Independent Filters**:
   - Search and Location work WITH card filters
   - Combined using AND logic

## Filter Logic Implementation

### Card Filter Definitions

```javascript
applyCardFilterLogic(ticket) {
    switch (this.activeCardFilter) {
        case 'all':
            return true; // No filtering

        case 'open':
            // Active tickets needing attention
            return !['Closed', 'Completed', 'Failed'].includes(ticket.status);

        case 'overdue':
            // Urgent/problematic tickets
            return ['Overdue', 'Failed'].includes(ticket.status);

        case 'completed':
            // Successfully finished tickets
            return ['Completed', 'Closed'].includes(ticket.status);
    }
}
```

### Statistics Calculation Alignment

```javascript
updateStatistics() {
    // Statistics use same logic as filters for consistency
    const open = this.tickets.filter(t =>
        !['Closed', 'Completed', 'Failed'].includes(t.status)
    ).length;

    const overdue = this.tickets.filter(t =>
        ['Overdue', 'Failed'].includes(t.status)
    ).length;

    const completed = this.tickets.filter(t =>
        ['Completed', 'Closed'].includes(t.status)
    ).length;
}
```

## Performance Architecture

### Optimization Strategies

#### 1. Debounced Filter Operations
```javascript
applyCardFilter(filterType) {
    if (this.filterDebounceTimer) {
        clearTimeout(this.filterDebounceTimer);
    }

    this.filterDebounceTimer = setTimeout(() => {
        this.doApplyCardFilter(filterType);
    }, 50);
}
```

#### 2. Filter Result Caching
```javascript
getFilteredTickets() {
    const currentFilters = {
        search: document.getElementById("searchInput").value,
        status: document.getElementById("statusFilter").value,
        location: document.getElementById("locationFilter").value,
        card: this.activeCardFilter
    };

    // Return cached results if filters unchanged
    if (this.cachedFilters &&
        JSON.stringify(currentFilters) === JSON.stringify(this.cachedFilters)) {
        return this.cachedFilteredTickets;
    }

    // Perform filtering and cache results
    const filtered = this.performFiltering();
    this.cachedFilters = currentFilters;
    this.cachedFilteredTickets = filtered;

    return filtered;
}
```

#### 3. Minimal DOM Updates
- Only update changed elements
- Use `requestAnimationFrame` for visual updates
- Batch style changes

### Performance Targets

- **Filter Operation**: < 100ms for 1000+ tickets
- **Visual Feedback**: < 50ms for click response
- **Memory Usage**: Stable with frequent filter changes
- **AG-Grid Update**: < 200ms for grid re-render

## Security Architecture

### Input Validation

```javascript
applyCardFilter(filterType) {
    // Validate filter type
    const validTypes = ['all', 'open', 'overdue', 'completed'];
    if (!validTypes.includes(filterType)) {
        console.warn(`Invalid filter type: ${filterType}`);
        return;
    }

    // Proceed with filtering
}
```

### XSS Prevention
- No user input directly processed
- All display values escaped through existing mechanisms
- Filter operations use predefined logic only

### Data Access Control
- Feature only filters existing ticket data
- No new data exposure or privilege escalation
- Maintains existing access control patterns

## Theme Integration Architecture

### CSS Variable System

```css
.stats-card {
    border: 1px solid var(--tblr-border-color);
    background: var(--tblr-bg-surface);
    color: var(--tblr-body-color);
}

.stats-card-active {
    border-color: var(--hextrackr-primary);
    background: var(--hextrackr-surface-active);
    box-shadow: 0 6px 20px var(--hextrackr-primary-shadow);
}
```

### Theme-Aware Effects

```css
[data-bs-theme="light"] .stats-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

[data-bs-theme="dark"] .stats-card:hover {
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.1);
}
```

## Accessibility Architecture

### ARIA Implementation

```html
<div class="card stats-card"
     role="button"
     tabindex="0"
     aria-label="Show open tickets (currently X tickets)"
     aria-describedby="openTicketsDesc"
     aria-pressed="false">

<div id="openTicketsDesc" class="sr-only">
    Click to filter and show only active tickets that need attention
</div>
```

### Keyboard Navigation

```javascript
document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('stats-card') &&
        (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        e.target.click();
    }
});
```

### Screen Reader Support

```javascript
announceFilterChange(filterType) {
    const messages = {
        'all': 'Showing all tickets',
        'open': 'Showing open tickets only',
        'overdue': 'Showing overdue and failed tickets',
        'completed': 'Showing completed tickets only'
    };

    // Update live region for screen readers
    const announcement = document.getElementById('filterAnnouncement');
    announcement.textContent = messages[filterType];
}
```

## Integration Architecture

### AG-Grid Integration Points

```javascript
// tickets-aggrid.js integration
renderTickets() {
    const filteredTickets = this.getFilteredTickets(); // ← Integration point
    this.filteredTicketsCount = filteredTickets.length;

    if (this.gridApi) {
        this.gridApi.setGridOption("rowData", filteredTickets); // ← Data update
        this.updatePaginationDisplay(); // ← Pagination reset
    }
}
```

### Existing Filter Integration

```javascript
// Preserves existing filter chain
getFilteredTickets() {
    return this.tickets.filter(ticket => {
        // 1. Search filter (unchanged)
        const matchesSearch = this.searchFilterLogic(ticket);

        // 2. Card filter (NEW)
        const matchesCardFilter = this.applyCardFilterLogic(ticket);

        // 3. Status filter (conditional)
        const matchesStatus = this.activeCardFilter ?
            true : this.statusFilterLogic(ticket);

        // 4. Location filter (unchanged)
        const matchesLocation = this.locationFilterLogic(ticket);

        return matchesSearch && matchesCardFilter &&
               matchesStatus && matchesLocation;
    });
}
```

## Error Handling Architecture

### Graceful Degradation

```javascript
applyCardFilter(filterType) {
    try {
        // Core filter logic
        this.doApplyCardFilter(filterType);
    } catch (error) {
        console.error('Filter operation failed:', error);

        // Reset to safe state
        this.activeCardFilter = null;
        this.updateCardStyles(null);

        // Notify user
        this.showErrorToast('Filter operation failed. Please try again.');
    }
}
```

### Edge Case Handling

1. **Empty Dataset**:
   - Cards remain clickable
   - Zero counts displayed
   - Empty state shown in grid

2. **Missing DOM Elements**:
   - Null checks before element access
   - Graceful fallbacks

3. **Invalid Filter States**:
   - Reset to default "all" state
   - Log warnings for debugging

## Testing Architecture

### Unit Test Structure

```javascript
describe('Card Filter Logic', () => {
    it('should filter open tickets correctly', () => {
        const tickets = [
            { status: 'Open' },
            { status: 'Closed' },
            { status: 'Failed' }
        ];

        const manager = new HexagonTicketsManager();
        manager.activeCardFilter = 'open';

        const filtered = manager.applyCardFilterLogic(tickets[0]);
        expect(filtered).toBe(true);
    });
});
```

### Integration Test Scenarios

1. **Filter Chain Integration**
2. **AG-Grid Data Synchronization**
3. **Statistics Calculation Accuracy**
4. **Theme Compatibility**
5. **Performance Benchmarks**

## Deployment Architecture

### Browser Compatibility Matrix

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 100+ | ✅ Full | Primary target |
| Firefox | 100+ | ✅ Full | Full compatibility |
| Safari | 15+ | ✅ Full | WebKit considerations |
| Edge | 100+ | ✅ Full | Chromium-based |

### Progressive Enhancement

1. **Base Functionality**: Cards display statistics
2. **Enhanced**: Cards become clickable
3. **Advanced**: Visual effects and animations
4. **Optimal**: Full accessibility and performance

### Rollback Strategy

```javascript
// Feature flag for quick disable
const ENABLE_CARD_FILTERS = true;

if (ENABLE_CARD_FILTERS) {
    // Enable card filtering
    this.initializeCardFilters();
} else {
    // Fallback to display-only cards
    this.initializeStaticCards();
}
```

## Maintenance Architecture

### Code Organization

```
/app/public/scripts/pages/
├── tickets.js              # Core ticket management
│   ├── applyCardFilter()    # Primary filter method
│   ├── applyCardFilterLogic() # Filter logic
│   ├── updateCardStyles()   # Visual management
│   └── updateStatistics()  # Statistics calculation
│
├── tickets-aggrid.js       # AG-Grid integration
│   └── renderTickets()     # Data synchronization
│
/app/public/tickets2.html   # UI components
├── Statistics cards        # Click handlers
├── CSS styling            # Visual effects
└── Accessibility attrs    # ARIA implementation
```

### Documentation Standards

- JSDoc comments for all public methods
- Inline comments for complex logic
- Architecture decision records
- Performance benchmarks
- Accessibility compliance notes

This architecture provides a robust, maintainable, and extensible foundation for the card filtering feature while preserving all existing functionality and maintaining HexTrackr's quality standards.