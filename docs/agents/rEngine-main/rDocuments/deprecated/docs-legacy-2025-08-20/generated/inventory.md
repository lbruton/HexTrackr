# rEngine Core: inventory.js Documentation

## Purpose & Overview

The `inventory.js` file is a critical component of the rEngine Core platform's "Precious Metals Inventory Tool". This file implements the core functionality for managing and interacting with the user's precious metals inventory, including features such as:

- Creating comprehensive backup archives of all inventory data
- Restoring application state from a backup file
- Importing and exporting inventory data in various formats (CSV, JSON, PDF)
- Rendering the main inventory table with filtering, sorting, and pagination
- Providing detailed financial summaries and metrics for the user's holdings
- Handling inline editing of inventory items
- Enabling advanced features like collectable item tracking and storage location management

This file is a central part of the rEngine Core ecosystem, as it powers the primary user interface and data management capabilities of the precious metals tracking application.

## Key Functions/Classes

The `inventory.js` file contains the following key functions and components:

### Backup/Restore Functions

- `createBackupZip()`: Generates a complete backup archive containing inventory data, settings, and spot price history.
- `restoreBackupZip(file)`: Restores application state from a previously created backup ZIP file.

### Import/Export Functions

- `importCsv(file, override = false)`: Imports inventory data from a CSV file, with support for merging or overriding existing data.
- `importNumistaCsv(file, override = false)`: Imports inventory data from a Numista-exported CSV file.
- `exportCsv()`: Exports the current inventory to a CSV file.
- `importJson(file, override = false)`: Imports inventory data from a JSON file, with support for merging or overriding existing data.
- `exportJson()`: Exports the current inventory to a JSON file.
- `exportPdf()`: Exports the current inventory to a PDF document.

### Rendering and Interaction

- `renderTable()`: Generates the HTML for the main inventory table, applying current filtering, sorting, and pagination settings.
- `startCellEdit(idx, field, icon)`: Handles inline editing of inventory item fields, with validation and update handling.
- `deleteItem(idx)`: Deletes the specified inventory item after confirmation.
- `showNotes(idx)`: Opens a modal to view and edit the notes for a specific inventory item.
- `editItem(idx, logIdx = null)`: Prepares and displays the edit modal for the specified inventory item.
- `toggleCollectable(idx)`: Toggles the collectable status of the specified inventory item.

### Utility Functions

- `saveInventory()`: Saves the current inventory data to the browser's localStorage.
- `loadInventory()`: Loads the inventory data from localStorage, performing data migration and normalization.
- `updateSummary()`: Calculates and updates all financial summary displays across the application.
- `optimizeStoragePhase1C()`: Performs storage optimization tasks, such as removing orphaned catalog mappings.

## Dependencies

The `inventory.js` file relies on the following dependencies:

- `JSZip`: A client-side ZIP file creation and management library, used for generating backup archives.
- `PapaParse`: A powerful CSV parsing and formatting library, used for importing and exporting CSV data.
- `jsPDF`: A client-side PDF generation library, used for exporting inventory data to PDF format.
- `catalogManager`: A custom class that manages the integration between inventory items and the Numista catalog database.
- `METALS`: A configuration object that provides metadata about the supported precious metals.
- `localStorage` and other browser APIs for data persistence and manipulation.

## Usage Examples

### Generating a Backup Archive

```javascript
await createBackupZip();
```

### Restoring from a Backup Archive

```javascript
const backupFile = /* File object from user input */;
await restoreBackupZip(backupFile);
```

### Importing Inventory from CSV

```javascript
const csvFile = /* File object from user input */;
importCsv(csvFile);
```

### Exporting Inventory to CSV

```javascript
exportCsv();
```

### Editing an Inventory Item

```javascript
const itemIndex = 0; // Index of the item to edit
editItem(itemIndex);
```

### Toggling Collectable Status

```javascript
const itemIndex = 0; // Index of the item to toggle
toggleCollectable(itemIndex);
```

## Configuration

The `inventory.js` file relies on the following configuration:

- `LS_KEY`: The localStorage key used to store the inventory data.
- `SERIAL_KEY`: The localStorage key used to store the next serial number for new inventory items.
- `SPOT_HISTORY_KEY`: The localStorage key used to store the spot price history.
- `THEME_KEY`: The localStorage key used to store the user's selected theme.
- `METALS`: An object that provides metadata about the supported precious metals, including their key, name, and local storage keys.

These configuration values are typically set in a separate file or module that is shared across the rEngine Core application.

## Integration Points

The `inventory.js` file integrates with several other components of the rEngine Core platform:

- **CatalogManager**: Handles the synchronization of inventory items with the Numista catalog database, ensuring consistent metadata and identifiers.
- **Search/Filtering**: Integrates with the search and filtering functionality implemented in the `search.js` file.
- **Spot Price Tracking**: Utilizes the spot price data and history management provided by the `spotPrices.js` file.
- **Logging and Debugging**: Interacts with the logging and debugging utilities provided by the `debug.js` file.
- **UI and Rendering**: Relies on the DOM manipulation and rendering functions from the `ui.js` file.

These integration points allow the `inventory.js` file to seamlessly participate in the overall functionality of the rEngine Core platform.

## Troubleshooting

### Backup/Restore Issues

- Ensure the backup ZIP file is not corrupted or modified outside of the application.
- Verify that the localStorage is accessible and not blocked by browser settings or extensions.

### Import/Export Errors

- Check the file format and encoding to ensure compatibility with the expected input.
- Validate that the data being imported or exported is structured correctly and matches the expected schema.

### Rendering and Interaction Problems

- Ensure the required DOM elements are present and correctly referenced in the `elements` object.
- Verify that the necessary dependencies (JSZip, PapaParse, jsPDF) are properly loaded and accessible.

If issues persist, refer to the rEngine Core documentation or reach out to the support team for further assistance.
