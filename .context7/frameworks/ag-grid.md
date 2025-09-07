# AG-Grid Documentation Cache

**Source**: Context7 Library ID `/ag-grid/ag-grid`  
**Trust Score**: 8.9/10  
**Code Snippets**: 646  
**Last Updated**: September 5, 2025

## Overview

AG-Grid is a feature-rich data grid component for JavaScript applications. It provides enterprise-grade features like sorting, filtering, grouping, and virtualization for handling large datasets efficiently.

## Key Topics

- Grid initialization and configuration
- Column definitions and properties
- Data binding and row management
- Filtering and sorting capabilities
- Cell renderers and editors

## Installation and Setup

```javascript
import { Grid } from 'ag-grid-community';
// or for CDN usage
// <script src="https://unpkg.com/ag-grid-community/dist/ag-grid-community.min.js"></script>
```

## Code Examples

### Basic Grid Setup

```javascript
// Define column definitions
const columnDefs = [
  { field: 'make', sortable: true, filter: true },
  { field: 'model', sortable: true, filter: true },
  { field: 'price', sortable: true, filter: 'agNumberFilter' }
];

// Sample row data
const rowData = [
  { make: 'Toyota', model: 'Celica', price: 35000 },
  { make: 'Ford', model: 'Mondeo', price: 32000 },
  { make: 'Porsche', model: 'Boxster', price: 72000 }
];

// Grid options
const gridOptions = {
  columnDefs: columnDefs,
  rowData: rowData,
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true
  }
};

// Create the grid
const gridDiv = document.querySelector('#myGrid');
new Grid(gridDiv, gridOptions);
```

### Column Configuration

```javascript
const columnDefs = [
  {
    headerName: 'Athlete',
    field: 'athlete',
    width: 150,
    pinned: 'left',
    headerCheckboxSelection: true,
    checkboxSelection: true
  },
  {
    headerName: 'Age',
    field: 'age',
    width: 90,
    type: 'numberColumn'
  },
  {
    headerName: 'Country',
    field: 'country',
    width: 120,
    cellRenderer: params => {
      return `<img border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/${params.value}.png"> ${params.value}`;
    }
  },
  {
    headerName: 'Year',
    field: 'year',
    width: 90,
    filter: 'agNumberFilter',
    filterParams: {
      buttons: ['reset', 'apply'],
      closeOnApply: true
    }
  },
  {
    headerName: 'Date',
    field: 'date',
    width: 110,
    cellRenderer: params => {
      return new Date(params.value).toLocaleDateString();
    }
  },
  {
    headerName: 'Sport',
    field: 'sport',
    width: 110
  },
  {
    headerName: 'Gold',
    field: 'gold',
    width: 100,
    type: 'numberColumn'
  },
  {
    headerName: 'Silver',
    field: 'silver',
    width: 100,
    type: 'numberColumn'
  },
  {
    headerName: 'Bronze',
    field: 'bronze',
    width: 100,
    type: 'numberColumn'
  },
  {
    headerName: 'Total',
    field: 'total',
    width: 100,
    type: 'numberColumn'
  }
];
```

### Cell Renderers

```javascript
// Custom cell renderer component
class CompanyRenderer {
  init(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = `
      <div style="display: flex; align-items: center;">
        <img src="${params.data.logo}" style="width: 20px; height: 20px; margin-right: 8px;" />
        <span>${params.value}</span>
      </div>
    `;
  }
  
  getGui() {
    return this.eGui;
  }
  
  destroy() {
    // cleanup
  }
}

// Column definition with custom renderer
{
  headerName: 'Company',
  field: 'company',
  cellRenderer: CompanyRenderer,
  width: 200
}
```

### Filtering and Searching

```javascript
// Text filter configuration
{
  headerName: 'Name',
  field: 'name',
  filter: 'agTextColumnFilter',
  filterParams: {
    buttons: ['reset', 'apply'],
    closeOnApply: true,
    filterOptions: ['contains', 'notContains', 'equals', 'notEqual', 'startsWith', 'endsWith']
  }
}

// Number filter configuration
{
  headerName: 'Price',
  field: 'price',
  filter: 'agNumberColumnFilter',
  filterParams: {
    buttons: ['reset', 'apply'],
    closeOnApply: true,
    filterOptions: ['equals', 'notEqual', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual']
  }
}

// Date filter configuration
{
  headerName: 'Date',
  field: 'date',
  filter: 'agDateColumnFilter',
  filterParams: {
    buttons: ['reset', 'apply'],
    closeOnApply: true,
    comparator: (filterLocalDateAtMidnight, cellValue) => {
      const dateAsString = cellValue;
      if (dateAsString == null) return -1;
      const dateParts = dateAsString.split('/');
      const cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
      
      if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        return 0;
      }
      
      if (cellDate < filterLocalDateAtMidnight) {
        return -1;
      }
      
      if (cellDate > filterLocalDateAtMidnight) {
        return 1;
      }
    }
  }
}
```

### Row Selection

```javascript
const gridOptions = {
  columnDefs: columnDefs,
  rowData: rowData,
  rowSelection: 'multiple',
  onSelectionChanged: onSelectionChanged,
  defaultColDef: {
    sortable: true,
    filter: true
  }
};

function onSelectionChanged() {
  const selectedRows = gridOptions.api.getSelectedRows();
  console.log('Selected rows:', selectedRows);
}

// Programmatic selection
function selectAll() {
  gridOptions.api.selectAll();
}

function clearSelection() {
  gridOptions.api.deselectAll();
}
```

### Data Updates

```javascript
// Add new rows
function addRows() {
  const newRows = [
    { make: 'BMW', model: 'X5', price: 45000 },
    { make: 'Audi', model: 'A4', price: 38000 }
  ];
  gridOptions.api.applyTransaction({ add: newRows });
}

// Update existing rows
function updateRows() {
  const rowNode = gridOptions.api.getRowNode('0'); // Get row by ID
  rowNode.setData({ make: 'Toyota', model: 'Camry', price: 30000 });
}

// Remove rows
function removeSelectedRows() {
  const selectedRows = gridOptions.api.getSelectedRows();
  gridOptions.api.applyTransaction({ remove: selectedRows });
}
```

### Pagination

```javascript
const gridOptions = {
  columnDefs: columnDefs,
  rowData: rowData,
  pagination: true,
  paginationPageSize: 20,
  paginationSizeSelector: [10, 20, 50, 100],
  defaultColDef: {
    sortable: true,
    filter: true
  }
};
```

### Grouping

```javascript
const gridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'sport', rowGroup: true, hide: true },
    { field: 'athlete' },
    { field: 'age' },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' }
  ],
  rowData: rowData,
  autoGroupColumnDef: {
    headerName: 'Group',
    minWidth: 250,
    cellRendererParams: {
      suppressCount: true
    }
  },
  groupDefaultExpanded: 1
};
```

## Grid API Methods

### Data Management

- **`api.setRowData(rowData)`** - Set all row data
- **`api.applyTransaction(transaction)`** - Add, update, or remove rows
- **`api.getRowNode(id)`** - Get row node by ID
- **`api.forEachNode(callback)`** - Iterate through all row nodes

### Selection

- **`api.selectAll()`** - Select all rows
- **`api.deselectAll()`** - Clear all selection
- **`api.getSelectedNodes()`** - Get selected row nodes
- **`api.getSelectedRows()`** - Get selected row data

### Filtering

- **`api.setFilterModel(model)`** - Set filter state
- **`api.getFilterModel()`** - Get current filter state
- **`api.isAnyFilterPresent()`** - Check if any filters are active
- **`api.onFilterChanged()`** - Refresh filters

### Sorting

- **`api.setSortModel(sortModel)`** - Set sort state
- **`api.getSortModel()`** - Get current sort state

### Export

- **`api.exportDataAsCsv(params)`** - Export data as CSV
- **`api.exportDataAsExcel(params)`** - Export data as Excel

## Events

### Grid Events

```javascript
const gridOptions = {
  // ... other options
  onGridReady: params => {
    console.log('Grid is ready');
    gridApi = params.api;
    gridColumnApi = params.columnApi;
  },
  onRowClicked: event => {
    console.log('Row clicked:', event.data);
  },
  onCellClicked: event => {
    console.log('Cell clicked:', event.value);
  },
  onSelectionChanged: () => {
    const selectedRows = gridOptions.api.getSelectedRows();
    console.log('Selection changed:', selectedRows.length);
  },
  onFilterChanged: () => {
    console.log('Filter changed');
  },
  onSortChanged: () => {
    console.log('Sort changed');
  }
};
```

## Column Types

### Predefined Column Types

```javascript
const gridOptions = {
  columnTypes: {
    numberColumn: {
      width: 130,
      filter: 'agNumberColumnFilter'
    },
    medalColumn: {
      width: 100,
      columnGroupShow: 'open',
      filter: false
    },
    nonEditableColumn: {
      editable: false
    }
  },
  defaultColDef: {
    width: 150,
    editable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    resizable: true
  }
};
```

## Best Practices

1. **Use `defaultColDef`** for common column properties
2. **Implement pagination** for large datasets
3. **Use cell renderers** for custom display logic
4. **Enable filtering and sorting** for better user experience
5. **Handle grid events** for interactive functionality
6. **Use row IDs** for efficient data updates
7. **Implement proper error handling** for API calls

## Performance Optimization

- **Virtual Scrolling**: Automatically enabled for large datasets
- **Infinite Scrolling**: Load data on demand
- **Delta Updates**: Use `applyTransaction()` for efficient updates
- **Column Virtualization**: Only render visible columns
- **Async Transactions**: Process large updates asynchronously

## HexTrackr Integration

In HexTrackr, AG-Grid is used for:

- Vulnerability data table display
- Ticket management grids
- Interactive data filtering and sorting
- CSV export functionality
- Multi-column searching and pagination
