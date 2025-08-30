# StackTrackr Change Log Documentation

## Purpose & Overview

The `changeLog.js` file is a critical component of the `StackTrackr` module within the rEngine Core ecosystem. It is responsible for tracking and managing all changes made to the inventory table, allowing users to undo or redo those changes as needed. This file provides the necessary functionality to record, persist, and render the change log, enabling users to maintain a comprehensive history of their inventory management actions.

## Key Functions/Classes

1. **`logChange`**:
   - This function records a change to the change log and persists it in the browser's `localStorage`.
   - It takes the following parameters:
     - `itemName`: The name of the inventory item.
     - `field`: The field that was changed.
     - `oldValue`: The previous value.
     - `newValue`: The new value.
     - `idx`: The index of the item in the inventory array.

1. **`logItemChanges`**:
   - This function compares two item objects and logs any differences between them.
   - It iterates through a list of predefined fields and checks if the values have changed. If so, it calls the `logChange` function to record the change.

1. **`renderChangeLog`**:
   - This function renders the change log table with all the recorded entries.
   - It creates the HTML rows for the table, displaying the timestamp, item name, field, old value, new value, and action buttons.

1. **`toggleChange`**:
   - This function toggles a logged change between the "undone" and "redone" states.
   - It handles the logic for restoring or removing items from the inventory based on the change type (e.g., "Deleted" field).
   - After toggling the change, it saves the inventory, renders the table, and updates the change log in `localStorage`.

1. **`clearChangeLog`**:
   - This function clears all the change log entries after confirmation from the user.
   - It resets the `changeLog` array and updates the `localStorage` accordingly.

## Dependencies

The `changeLog.js` file depends on the following:

1. **Global variables**:
   - `changeLog`: An array that stores the change log entries.
   - `inventory`: The inventory array, which is used to update and restore item values.
   - `catalogMap`: A mapping of item serial numbers to their corresponding Numista IDs.

1. **External functions**:
   - `saveInventory()`: A function to save the updated inventory to the `localStorage`.
   - `renderTable()`: A function to re-render the inventory table.
   - `editItem(idx, logIdx)`: A function to edit an item from the change log.
   - `sanitizeHtml(str)`: A function to sanitize HTML strings.

1. **Browser APIs**:
   - `localStorage`: Used to persist the change log entries.
   - `Date.now()`: Used to record the timestamp of each change.

## Usage Examples

1. **Logging a change**:

   ```javascript
   logChange('Gold Coin', 'price', 100, 120, 5);
   ```

   This will log a change to the "price" field of the "Gold Coin" item, with the old value of 100 and the new value of 120, at index 5 in the inventory array.

1. **Rendering the change log**:

   ```javascript
   renderChangeLog();
   ```

   This will update the change log table in the DOM with all the recorded entries.

1. **Toggling a change**:

   ```javascript
   toggleChange(3);
   ```

   This will toggle the change at index 3 in the `changeLog` array, undoing or redoing the corresponding action.

1. **Clearing the change log**:

   ```javascript
   clearChangeLog();
   ```

   This will clear all the change log entries after confirming with the user.

## Configuration

The `changeLog.js` file does not require any specific configuration. It relies on the global variables and functions mentioned in the "Dependencies" section, which are assumed to be available in the rEngine Core ecosystem.

## Integration Points

The `changeLog.js` file is a crucial component of the `StackTrackr` module, which is part of the rEngine Core platform. It integrates with the following components:

1. **Inventory Management**: The change log is directly tied to the inventory table, tracking and managing all the changes made to the inventory items.
2. **User Interface**: The change log table is rendered in the DOM, allowing users to interact with the change log and undo/redo actions.
3. **Persistence**: The change log entries are stored in the browser's `localStorage`, ensuring that the history is preserved across page loads and sessions.

## Troubleshooting

1. **Change log not rendering**: Ensure that the `renderChangeLog()` function is being called correctly and that the necessary DOM elements (e.g., `#changeLogTable tbody`) are present in the HTML.

1. **Undo/Redo not working**: Verify that the `toggleChange()` function is being called with the correct `logIdx` parameter, and that the `inventory`, `catalogMap`, and other required global variables are properly initialized and updated.

1. **Change log not persisting**: Check that the `localStorage.setItem('changeLog', JSON.stringify(changeLog))` call is being executed correctly after each change log update.

1. **Unexpected behavior**: Review the code for any potential edge cases or race conditions, and ensure that the integration with other rEngine Core components is functioning as expected.

If you encounter any issues or have further questions, please refer to the rEngine Core documentation or reach out to the development team for assistance.
