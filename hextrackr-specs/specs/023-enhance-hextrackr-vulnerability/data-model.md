# Data Model: Enhanced Vulnerability Table with AG Grid Enterprise Features

**Date**: 2025-09-09  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)  
**Research**: [research.md](./research.md)

## Entity Definitions

### VulnerabilityRecord (Existing - No Changes)

Existing database entity representing vulnerability data. No schema changes required.

**Fields**:

- `id` (INTEGER PRIMARY KEY)
- `cve_id` (TEXT) - CVE identifier
- `title` (TEXT) - Vulnerability title
- `severity` (TEXT) - Critical/High/Medium/Low
- `score` (REAL) - CVSS score
- `hostname` (TEXT) - Affected host
- `ip_address` (TEXT) - Host IP address
- `port` (TEXT) - Affected port
- `service` (TEXT) - Affected service
- `description` (TEXT) - Vulnerability description
- `solution` (TEXT) - Remediation information
- `date_found` (TEXT) - Discovery date
- `status` (TEXT) - Open/Fixed/In Progress

**Relationships**: None (flat table structure)

**Validation Rules**:

- `cve_id` format: CVE-YYYY-NNNN or custom format
- `severity` enum: ["Critical", "High", "Medium", "Low"]
- `score` range: 0.0-10.0
- `status` enum: ["Open", "Fixed", "In Progress", "Verified"]

### FilterConfiguration (Client-Side)

User-defined filter criteria for table columns.

**Fields**:

- `columnId` (String) - Column identifier
- `filterType` (String) - text|number|date|select
- `condition` (String) - equals|contains|startsWith|endsWith|greaterThan|lessThan
- `value` (String|Number|Date) - Filter value
- `caseSensitive` (Boolean) - Case sensitivity for text filters

**Storage**: Local Storage JSON structure
**Validation Rules**:

- `columnId` must match existing column definition
- `filterType` must match column data type
- `condition` must be valid for filterType
- `value` must be compatible with filterType

**Example**:

```javascript
{
  columnId: "severity",
  filterType: "select", 
  condition: "equals",
  value: "Critical",
  caseSensitive: false
}
```

### ColumnPreference (Client-Side)

User settings for column visibility, width, and order.

**Fields**:

- `columnId` (String) - Column identifier
- `visible` (Boolean) - Column visibility state
- `width` (Number) - Column width in pixels
- `pinned` (String) - left|right|null
- `sortOrder` (Number) - Display order position

**Storage**: Local Storage JSON structure
**Validation Rules**:

- `columnId` must match existing column definition
- `width` minimum: 50px, maximum: 800px
- `pinned` enum: ["left", "right", null]
- `sortOrder` must be unique integer

**Example**:

```javascript
{
  columnId: "cve_id",
  visible: true,
  width: 150,
  pinned: "left",
  sortOrder: 1
}
```

### GroupingConfiguration (Client-Side)

User-defined row grouping settings and expansion states.

**Fields**:

- `groupBy` (String) - Column to group by (cve_id|hostname)
- `expanded` (Array<String>) - List of expanded group keys
- `showCount` (Boolean) - Show child count in group headers
- `defaultExpanded` (Boolean) - Default expansion state for new groups

**Storage**: Local Storage JSON structure
**Validation Rules**:

- `groupBy` enum: ["cve_id", "hostname", null]
- `expanded` must contain valid group keys
- `showCount` boolean default: true
- `defaultExpanded` boolean default: false

**Example**:

```javascript
{
  groupBy: "cve_id",
  expanded: ["CVE-2023-1234", "CVE-2023-5678"],
  showCount: true,
  defaultExpanded: false
}
```

### PaginationState (Client-Side)

Current pagination settings and state.

**Fields**:

- `currentPage` (Number) - Zero-based current page index
- `pageSize` (Number) - Rows per page
- `totalRows` (Number) - Total row count (calculated)
- `totalPages` (Number) - Total page count (calculated)

**Storage**: Local Storage JSON structure
**Validation Rules**:

- `currentPage` minimum: 0
- `pageSize` enum: [10, 25, 50, 100]
- `totalRows` non-negative integer
- `totalPages` calculated: Math.ceil(totalRows / pageSize)

**Example**:

```javascript
{
  currentPage: 0,
  pageSize: 25,
  totalRows: 347,
  totalPages: 14
}
```

## Composite Entities

### UserPreferences (Client-Side)

Root preference object containing all user customizations.

**Structure**:

```javascript
{
  version: "1.0",
  lastUpdated: "2025-09-09T10:30:00Z",
  vulnerabilityTable: {
    columns: {
      "cve_id": { visible: true, width: 150, pinned: "left", sortOrder: 1 },
      "severity": { visible: true, width: 100, pinned: null, sortOrder: 2 },
      // ... other columns
    },
    filters: [
      { columnId: "severity", filterType: "select", condition: "equals", value: "Critical" }
      // ... other filters
    ],
    grouping: {
      groupBy: "cve_id",
      expanded: ["CVE-2023-1234"],
      showCount: true,
      defaultExpanded: false
    },
    pagination: {
      currentPage: 0,
      pageSize: 25,
      totalRows: 347,
      totalPages: 14
    }
  }
}
```

**Storage Key**: `hextrackr_preferences`
**Size Limit**: <5MB (browser local storage limit)
**Migration Strategy**: Version-based preference migration

## State Transitions

### Filter State Machine

```
No Filters → Add Filter → Active Filters → Remove Filter → No Filters
                ↓              ↓
            Clear All ← ← ← ← Modify Filter
```

### Grouping State Machine

```
No Grouping → Group By Column → Grouped → Expand/Collapse → Grouped
                ↓                ↓
            Clear Grouping ← ← Change Group Column
```

### Pagination State Machine

```
Page 1 → Next Page → Page N → Previous Page → Page N-1
   ↑                   ↓
Change Page Size ← ← ← ← Last Page
```

## Data Validation

### Client-Side Validation

- Column configuration validation before storage
- Filter value type checking before application
- Preference size limits before local storage save
- Group key validation against current data

### Error Handling

- Invalid preference data → fallback to defaults
- Storage quota exceeded → clear old preferences
- Column mismatch → remove invalid column preferences
- Filter errors → disable problematic filters

## Performance Considerations

### Local Storage Optimization

- Debounced preference saves (500ms delay)
- Incremental updates (not full object replacement)
- Compression for large preference objects
- Periodic cleanup of unused preferences

### Memory Management

- Lazy loading of preference data
- Cleanup of unused filter configurations
- Event listener cleanup on component unmount
- Grid state cleanup on page navigation

---

*Data model for spec 023-enhance-hextrackr-vulnerability*
