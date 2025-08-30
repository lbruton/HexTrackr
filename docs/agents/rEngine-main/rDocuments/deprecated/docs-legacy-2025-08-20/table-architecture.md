# Table System Architecture Documentation

## Overview

The StackTrackr table system is a complex interactive data display component built with vanilla JavaScript. It provides robust inventory management capabilities with features like sorting, filtering, pagination, responsive design, and inline editing.

## Core Files & Responsibilities

### 1. index.html

- Defines the main table structure and column headers
- Contains template for table-related modals (edit, notes, etc.)
- Houses search and filter UI elements
- Defines responsive table section layout

### 2. js/inventory.js

Primary table logic with core functions:

```javascript
// Main rendering engine
renderTable()

- Filters and sorts inventory data
- Implements pagination
- Generates table row HTML
- Updates sort indicators
- Manages column visibility
- Triggers summary updates

// Data manipulation
recalcItem(item)

- Calculates derived values (premiums, totals)
- Updates item properties

// UI Interactions
toggleCollectable(idx)

- Toggles item collectable status
- Updates derived values
- Saves changes

deleteItem(idx)

- Removes items with confirmation
- Updates display
- Logs changes

showNotes(idx)

- Opens notes modal
- Manages text area content

// Display updates
updateItemCount(filteredCount, totalCount)

- Shows filtered vs total items ratio

updateTypeSummary(items)

- Legacy filter chip system

hideEmptyColumns()

- Optimizes table display

```

### 3. js/events.js

Event handling and interaction logic:

```javascript
// Column Management
updateColumnVisibility()

- Responsive column hiding based on screen width
- Implements breakpoint-based column display

setupResponsiveColumns()

- Initializes responsive behavior
- Attaches resize listeners

// Search & Filter Events
setupEventListeners()

- Debounced search input handling
- Filter dropdown behaviors
- Sort header click handlers
- Pagination control events
- Button click handlers

// Table Interactions
setupTableListeners()

- Header click sorting
- Row action buttons
- Inline edit triggers

```

### 4. js/search.js

Search and filter functionality:

```javascript
filterInventory()

- Applies search query to items
- Implements column filters
- Returns filtered dataset

clearAllFilters()

- Resets search and filters
- Restores full table view

```

## Key Features

### 1. Responsive Design

- Dynamically hides columns based on screen width
- Maintains data density on mobile
- Preserves critical columns at all sizes

### 2. Interactive Elements

- Sortable column headers
- Inline editing capability
- Quick actions (collect, notes, delete)
- Filter chips and dropdowns

### 3. Data Management

- Local storage persistence
- Batch operations
- Change logging
- Undo capability

### 4. Performance Optimizations

- Debounced search input
- Paginated data display
- Optimized re-rendering
- Empty column hiding

### 5. Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast support

## State Management

```javascript
// Global State
inventory[] - Main data store
currentPage - Current page number
sortColumn - Active sort column index
sortDirection - Current sort direction
itemsPerPage - Items shown per page
columnFilters - Active column filters
searchQuery - Current search term
```

## Event Flow

1. User interaction triggers event
2. Event handler processes action
3. Data updates if needed
4. renderTable() called to refresh view
5. UI elements updated
6. State saved if required

## Rendering Process

1. Filter data based on search/filters
2. Sort filtered data
3. Calculate pagination
4. Generate row HTML
5. Update table body
6. Refresh UI elements
7. Setup interactive features

## Best Practices

1. Use filter links for consistent filtering
2. Implement proper error handling
3. Validate data before updates
4. Log significant changes
5. Maintain responsive design
6. Follow accessibility guidelines

## Dependencies

- Required files loaded in index.html
- CSS styles in styles.css
- Utility functions in utils.js
- Constants in constants.js

## Version Management

- Changes tracked in changelog.md
- Features documented in patch notes
- Version updated in constants.js
- Performance metrics monitored
