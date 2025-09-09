# Architecture Modularization - Implementation Reference

**Reference for**: `specs/000-architecture-modularization/spec.md`  
**Purpose**: Technical implementation details extracted from draft specifications  
**Status**: Implementation guidance for modular architecture

---

## Current State Analysis

```
scripts/pages/vulnerability-manager.js (2,429 lines)
├── Data loading and management
├── Statistical calculations
├── Search and filtering
├── Chart rendering
├── Grid management  
├── Card display
├── Modal handling
└── Event coordination
```

## Target Modular Architecture

```
vulnerability-core.js (orchestrator - 300 lines)
├── vulnerability-data.js (data layer - 350 lines)
├── vulnerability-statistics.js (metrics - 300 lines) ✅ COMPLETE
├── vulnerability-search.js (search - 200 lines)
├── vulnerability-grid.js (table view - 400 lines)
├── vulnerability-cards.js (card view - 400 lines)
├── vulnerability-charts.js (visualization - 300 lines)
└── vulnerability-modals.js (detail views - 400 lines)
```

## Module Implementation Specifications

### 1. vulnerability-core.js (VulnerabilityOrchestrator)

**Technical Implementation**:

```javascript
class VulnerabilityOrchestrator {
  registerWidget(name, instance)
  unregisterWidget(name)
  broadcast(event, data)
  subscribe(event, callback)
  getGlobalState()
  updateGlobalState(updates)
}
```

**Responsibilities**:

- Widget registration and lifecycle management
- Event bus for inter-module communication
- Global state coordination
- Error handling and recovery
- Performance monitoring

### 2. vulnerability-data.js (DataManager)

**Technical Implementation**:

```javascript
class DataManager {
  async loadData(filters)
  getCachedData()
  filterData(criteria)
  searchData(query)
  refreshCache()
  validateData(data)
}
```

**Responsibilities**:

- Data loading from APIs and cache
- Data transformation and normalization
- Filtering and query logic
- Cache management and invalidation
- Data validation and error handling

### 3. vulnerability-statistics.js (VPRStatistics) ✅ COMPLETED

**Status**: Successfully extracted and tested (363 lines)

**Responsibilities**:

- Statistical calculations and trend analysis
- VPR (Vulnerability Priority Rating) logic
- Risk metrics generation
- Data aggregation and summarization
- Historical trend analysis

### 4. vulnerability-search.js (VulnerabilitySearch)

**Technical Implementation**:

```javascript
class VulnerabilitySearch {
  parseQuery(query)
  executeSearch(criteria)
  rankResults(results)
  saveSearchState(state)
  getSearchHistory()
}
```

**Responsibilities**:

- Query parsing and validation
- Advanced search operators
- Search result ranking
- Filter state management
- Search history and suggestions

### 5. vulnerability-grid.js (VulnerabilityDataTable)

**Technical Implementation**:

```javascript
class VulnerabilityDataTable {
  initializeGrid(container)
  updateColumns(definitions)
  setData(data)
  getSelectedRows()
  exportData(format)
}
```

**Responsibilities**:

- AG Grid configuration and management
- Dynamic column definitions
- Row selection and interactions
- Table state persistence
- Responsive table behavior

### 6. vulnerability-cards.js (DeviceVulnerabilityCards)

**Technical Implementation**:

```javascript
class DeviceVulnerabilityCards {
  renderCards(data, container)
  updateLayout()
  handleCardClick(cardId)
  setPagination(page, size)
  refreshCards()
}
```

**Responsibilities**:

- Card rendering and layout
- Responsive card design
- Pagination and navigation
- Card interactions and selection
- Dynamic card updates

### 7. vulnerability-charts.js (VulnerabilityTrendChart)

**Technical Implementation**:

```javascript
class VulnerabilityTrendChart {
  createChart(container, config)
  updateData(data)
  setChartType(type)
  exportChart(format)
  destroy()
}
```

**Responsibilities**:

- Chart initialization and configuration
- Data visualization and transformation
- Chart responsiveness and interactions
- Real-time data updates
- Chart export functionality

### 8. vulnerability-modals.js (VulnerabilityDetailsModal)

**Technical Implementation**:

```javascript
class VulnerabilityDetailsModal {
  show(data)
  hide()
  updateContent(data)
  handleFormSubmit(form)
  setAccessibility()
}
```

**Responsibilities**:

- Modal creation and management
- Detail view content generation
- Form handling and validation
- Modal interactions and navigation
- Accessibility compliance

## Communication Patterns

### Event-Driven Architecture

```javascript
// Event Bus Pattern
const eventBus = {
  events: {},
  
  subscribe(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  },
  
  publish(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
};

// Standard Events
const EVENTS = {
  DATA_LOADED: 'data:loaded',
  DATA_FILTERED: 'data:filtered', 
  SELECTION_CHANGED: 'selection:changed',
  SEARCH_EXECUTED: 'search:executed',
  VIEW_CHANGED: 'view:changed'
};
```

### State Management

```javascript
// Centralized State in vulnerability-data.js
class AppState {
  constructor() {
    this.data = [];
    this.filters = {};
    this.selections = [];
    this.view = 'table';
    this.loading = false;
  }
  
  update(changes) {
    Object.assign(this, changes);
    this.publish('state:changed', this);
  }
}
```

## Widget Interface Standard

```javascript
class WidgetBase {
  constructor(container, options) {
    this.container = container;
    this.options = options;
    this.initialized = false;
  }
  
  // Required methods for all widgets
  async init() { /* Initialize widget */ }
  render(data) { /* Render widget content */ }
  resize() { /* Handle container resize */ }
  destroy() { /* Cleanup widget resources */ }
  
  // Optional methods
  getConfig() { /* Return widget configuration */ }
  setConfig(config) { /* Update widget configuration */ }
  export() { /* Export widget data */ }
}
```

## Implementation Strategy

### Phase 1: Foundation (Week 1)

1. Extract vulnerability-data.js with centralized data management
2. Complete vulnerability-statistics.js integration ✅ DONE
3. Establish event bus and communication patterns

### Phase 2: Interface Components (Week 2-3)

4. Extract vulnerability-search.js with query handling
5. Extract vulnerability-charts.js with ApexCharts integration
6. Extract vulnerability-grid.js with AG Grid management
7. Extract vulnerability-cards.js with responsive card layout
8. Extract vulnerability-modals.js with detail views

### Phase 3: Orchestration (Week 4)

9. Create vulnerability-core.js as system orchestrator
10. Implement comprehensive integration testing
11. Optimize performance and memory usage
12. Update documentation and create migration guide

## Testing Strategy

### Unit Testing

- Each module tested independently with Jest
- Mock dependencies for isolated testing
- Test all public interface methods
- Validate error handling and edge cases

### Integration Testing

- Test module communication through event bus
- Validate state synchronization across modules
- Test widget lifecycle management
- Performance testing under load

### End-to-End Testing

- Playwright tests for complete user workflows
- Visual regression testing for UI components
- Cross-browser compatibility testing
- Mobile responsiveness validation

## Performance Considerations

### Module Loading

- Lazy loading for non-critical modules
- Progressive enhancement approach
- Minimize initial bundle size
- Cache modules for subsequent loads

### Memory Management

- Proper event listener cleanup
- DOM element cleanup in destroy methods
- Avoid memory leaks in closures
- Regular garbage collection monitoring

### Communication Overhead

- Minimize event frequency
- Batch state updates where possible
- Debounce high-frequency events
- Use efficient data structures

## Error Handling

### Module Isolation

```javascript
class ModuleErrorBoundary {
  constructor(module) {
    this.module = module;
    this.setupErrorHandling();
  }
  
  setupErrorHandling() {
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
  }
  
  handleError(error) {
    console.error(`Module ${this.module.name} error:`, error);
    this.module.handleError(error);
    // Don't let module errors crash the app
    return true;
  }
}
```

### Graceful Degradation

- Non-critical module failures don't break core functionality
- Fallback UI for failed components
- Error reporting and recovery mechanisms
- User-friendly error messages

## Future Widget Dashboard Integration

### Widget Configuration

```javascript
const widgetConfigs = {
  statisticsCard: {
    module: 'vulnerability-statistics',
    size: { width: 2, height: 1 },
    refreshInterval: 30000
  },
  trendChart: {
    module: 'vulnerability-charts', 
    size: { width: 4, height: 2 },
    chartType: 'line'
  },
  dataTable: {
    module: 'vulnerability-grid',
    size: { width: 6, height: 3 },
    columns: ['hostname', 'cve', 'severity']
  }
};
```

### Dashboard Layout Engine

```javascript
class DashboardLayoutEngine {
  constructor(container) {
    this.container = container;
    this.widgets = new Map();
    this.layout = [];
  }
  
  addWidget(config) {
    const widget = this.createWidget(config);
    this.widgets.set(config.id, widget);
    this.updateLayout();
  }
  
  removeWidget(id) {
    const widget = this.widgets.get(id);
    if (widget) {
      widget.destroy();
      this.widgets.delete(id);
      this.updateLayout();
    }
  }
}
```

This modular architecture provides the foundation for HexTrackr's evolution from a monolithic application to a flexible, widget-based vulnerability management platform.
