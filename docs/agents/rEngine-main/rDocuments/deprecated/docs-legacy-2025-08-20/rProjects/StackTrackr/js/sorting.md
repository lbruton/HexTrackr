# Sorting Functionality

## Purpose & Overview

The `sortInventory` function is a utility that sorts an array of inventory items based on a specified sort column and direction. It handles various data types, including dates, numbers, booleans, and strings, ensuring consistent and intuitive sorting behavior.

The primary use case for this function is to provide a flexible and efficient way to sort inventory data, which can be crucial for tasks like displaying inventory in a user interface, generating reports, or performing data analysis.

## Technical Architecture

The `sortInventory` function takes an optional `data` parameter, which is an array of inventory items to be sorted. If no `data` parameter is provided, the function defaults to sorting the global `inventory` array.

The function first checks if a `sortColumn` has been specified. If not, it simply returns the original `data` array without performing any sorting.

The main sorting logic is implemented using the standard JavaScript `Array.sort()` method. The function maps the `sortColumn` index to the corresponding data property (e.g., `date`, `type`, `qty`, etc.) and performs the appropriate comparison based on the data type.

For date columns, the function handles special cases where the date value is empty or unknown, ensuring that these items are always sorted to the bottom of the list. For numeric columns, the function performs a straightforward numeric comparison. For boolean columns (e.g., `isCollectable`), the function uses a boolean comparison. For all other columns, the function performs a string comparison.

The sorting direction (`'asc'` or `'desc'`) is also taken into account, reversing the comparison logic as needed.

## Dependencies

This script does not have any external dependencies. It relies solely on built-in JavaScript functionality.

## Key Functions/Classes

### `sortInventory(data = inventory)`

- **Parameters**:
  - `data` (optional, default: `inventory`): An array of inventory items to be sorted.
- **Return Value**:
  - The sorted array of inventory items.

**Example Usage**:

```javascript
const sortedInventory = sortInventory([
  { name: 'Item A', qty: 10 },
  { name: 'Item B', qty: 5 },
]);
```

## Usage Examples

To use the `sortInventory` function, simply call it with an array of inventory items as the argument:

```javascript
// Sort the global inventory array by name in ascending order
const sortedInventory = sortInventory();

// Sort a custom array of inventory items by quantity in descending order
const customInventory = [
  { name: 'Item A', qty: 10 },
  { name: 'Item B', qty: 5 },
  { name: 'Item C', qty: 15 },
];
const sortedCustomInventory = sortInventory(customInventory);
```

## Configuration

This script does not have any configuration options or environment variables. The sorting behavior is controlled by the `sortColumn` and `sortDirection` variables, which are assumed to be managed elsewhere in the application.

## Error Handling

The `sortInventory` function does not throw any specific errors. However, it does handle a few special cases:

1. **Empty or unknown dates**: If the `date` property of an inventory item is empty or unknown (e.g., `'—'`), the function will ensure that these items are always sorted to the bottom of the list.
2. **Non-numeric values**: If the `qty`, `weight`, `price`, `spotPriceAtPurchase`, or `totalPremium` properties of an inventory item are not numeric, the function will still attempt to sort the items, but the sorting may not produce the expected results.
3. **Missing properties**: If an inventory item is missing one of the expected properties (e.g., `date`, `type`, `name`, etc.), the function will still attempt to sort the items, but the sorting may not produce the expected results.

## Integration

The `sortInventory` function is a standalone utility that can be used within a larger application to sort inventory data. It can be integrated into various components or modules that require sorted inventory information, such as:

- User interface components (e.g., tables, lists) that display inventory data
- Data analysis or reporting tools that process inventory information
- Background tasks or services that manage inventory-related operations

## Development Notes

- The `sortInventory` function uses the `Array.sort()` method, which modifies the original array. If you need to preserve the original `inventory` array, you should make a copy of it before calling the `sortInventory` function.
- The function assumes that the `inventory` array (or the `data` array passed as an argument) contains objects with the expected properties (e.g., `date`, `type`, `qty`, etc.). If the data structure changes, the function may need to be updated accordingly.
- The function does not handle sorting of nested objects or arrays within the inventory items. If your inventory data has more complex structures, you may need to extend the function to support those use cases.
- The function uses a `switch` statement to map the `sortColumn` index to the corresponding data property. If the number of columns changes, the `switch` statement will need to be updated.
