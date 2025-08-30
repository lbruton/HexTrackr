# Change Log Documentation

## Purpose & Overview

The `changeLog.js` script is responsible for tracking and managing changes made to the inventory table in a web application. It provides the following key functionalities:

1. **Logging Changes**: Whenever an item in the inventory is modified, the script records the change in a change log, including the item name, field changed, old and new values, and the index of the item in the inventory array.
2. **Persisting Change Log**: The change log is stored in the browser's `localStorage` so that it persists across page refreshes and sessions.
3. **Rendering Change Log**: The script generates an HTML table to display the recorded changes, allowing users to view and interact with the change log.
4. **Undoing/Redoing Changes**: Users can undo or redo individual changes from the change log, which updates the corresponding item in the inventory.
5. **Clearing Change Log**: The script provides a mechanism to clear the entire change log if desired.

This script is an important part of the application's data management and auditing capabilities, enabling users to track and revert changes made to the inventory.

## Technical Architecture

The `changeLog.js` script is structured around the following key components:

1. **logChange**: A function that records a change in the change log and persists it to `localStorage`.
2. **logItemChanges**: A function that compares the old and new values of an inventory item and logs any differences using `logChange`.
3. **renderChangeLog**: A function that generates the HTML table to display the change log entries.
4. **toggleChange**: A function that allows users to undo or redo a specific change from the change log, updating the corresponding item in the inventory.
5. **clearChangeLog**: A function that clears the entire change log after user confirmation.

The script also exposes these functions as global variables to be accessible from other parts of the application.

The data flow is as follows:

1. When an inventory item is modified, `logItemChanges` is called to compare the old and new values and log any changes.
2. The `logChange` function is used to record the change in the change log and persist it to `localStorage`.
3. The `renderChangeLog` function is called to update the change log table in the UI.
4. When a user interacts with the change log (e.g., undo/redo a change), the `toggleChange` function is called to update the inventory and the change log.
5. The `clearChangeLog` function can be used to clear the entire change log.

## Dependencies

The `changeLog.js` script does not have any external dependencies. It relies on the following built-in JavaScript functions and browser APIs:

- `Date.now()`: To get the current timestamp for the change log entry.
- `localStorage.setItem()` and `localStorage.getItem()`: To persist and retrieve the change log data.
- `document.querySelector()`: To select the HTML elements for rendering the change log table.

## Key Functions/Classes

### `logChange(itemName, field, oldValue, newValue, idx)`

- **Purpose**: Records a change in the change log and persists it to `localStorage`.
- **Parameters**:
  - `itemName` (string): The name of the inventory item.
  - `field` (string): The field that was changed.
  - `oldValue` (any): The previous value of the field.
  - `newValue` (any): The new value of the field.
  - `idx` (number): The index of the item in the inventory array.
- **Return Value**: None.

### `logItemChanges(oldItem, newItem)`

- **Purpose**: Compares the old and new values of an inventory item and logs any differences using `logChange`.
- **Parameters**:
  - `oldItem` (object): The original item values.
  - `newItem` (object): The updated item values.
- **Return Value**: None.

### `renderChangeLog()`

- **Purpose**: Generates the HTML table to display the change log entries.
- **Parameters**: None.
- **Return Value**: None.

### `toggleChange(logIdx)`

- **Purpose**: Toggles a logged change between the undone and redone states, updating the corresponding item in the inventory.
- **Parameters**:
  - `logIdx` (number): The index of the change entry in the change log array.
- **Return Value**: None.

### `clearChangeLog()`

- **Purpose**: Clears all change log entries after confirmation from the user.
- **Parameters**: None.
- **Return Value**: None.

## Usage Examples

To use the `changeLog.js` script in your application, you can follow these steps:

1. Include the script in your HTML file:

```html
<script src="changeLog.js"></script>
```

1. Call the `logItemChanges` function whenever an inventory item is modified:

```javascript
const oldItem = { /* ... */ };
const newItem = { /* ... */ };
logItemChanges(oldItem, newItem);
```

1. Render the change log table in your application's UI:

```javascript
renderChangeLog();
```

1. Allow users to interact with the change log by adding event listeners for the "Undo" and "Redo" buttons:

```javascript
const undoButtons = document.querySelectorAll('.action-btn');
undoButtons.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    const logIdx = parseInt(event.target.getAttribute('onclick').split(',')[1]);
    toggleChange(logIdx);
  });
});
```

1. Provide a way for users to clear the change log:

```javascript
const clearBtn = document.getElementById('clearChangeLog');
clearBtn.addEventListener('click', clearChangeLog);
```

## Configuration

The `changeLog.js` script does not require any specific configuration. It relies on the `localStorage` API to persist the change log data, which is automatically handled by the script.

## Error Handling

The `changeLog.js` script does not explicitly handle errors. If any errors occur during the execution of the script's functions, they will be propagated up the call stack and can be handled by the application's global error handling mechanism.

## Integration

The `changeLog.js` script is designed to be integrated into a larger web application that manages an inventory. It provides a centralized way to track and manage changes made to the inventory, which can be useful for auditing, reporting, and data integrity purposes.

To integrate the `changeLog.js` script into your application, you will need to ensure that the necessary data and functions are accessible to the script. This may involve passing references to the `inventory` array and `catalogMap` object, as well as the `saveInventory` and `renderTable` functions.

## Development Notes

1. **Sanitization**: The `sanitizeHtml` function is used to safely display the change log entries in the HTML table. This is important to prevent potential cross-site scripting (XSS) vulnerabilities.
2. **Deleted Items**: The script handles the case where an item is deleted from the inventory. In this case, the deleted item is temporarily stored in the change log, and can be restored by undoing the "Deleted" change.
3. **Sorted Rendering**: The change log entries are sorted in reverse chronological order when rendering the table, ensuring the most recent changes are displayed first.
4. **Global Exposure**: The key functions of the script are exposed as global variables to allow for easier integration and usage in the larger application.
5. **Performance Considerations**: The `renderChangeLog` function could potentially become slow as the number of change log entries increases. In such cases, you may want to consider implementing pagination or lazy loading to improve the performance of the change log table.
