# rEngine Core: `sorting.js` Documentation

## Purpose & Overview

The `sorting.js` file in the `StackTrackr` project of the rEngine Core platform provides a centralized sorting functionality for the inventory data. It handles the sorting of inventory items based on various columns, such as date, type, metal, quantity, name, weight, price, spot price, premium, purchase location, storage location, Numista ID, and collectability. This sorting mechanism ensures consistent and intuitive ordering of the inventory data across the rEngine Core ecosystem.

## Key Functions/Classes

The main function exported by this file is `sortInventory`, which takes an array of inventory items as input and returns the sorted array.

```javascript
/**

 * Sorts inventory based on the current sort column and direction.
 * Handles special cases for date, numeric, boolean, and string columns.

 *

 * @param {Array<Object>} [data=inventory] - Array of inventory items to sort (defaults to main inventory)
 * @returns {Array<Object>} Sorted inventory data

 *

 * @example
 * sortInventory([{name: 'A'}, {name: 'B'}]);

 */
const sortInventory = (data = inventory) => {
  // Function implementation
};
```

The `sortInventory` function performs the following steps:

1. Checks if a sort column is set, and returns the original data if not.
2. Sorts the input data array using the `Array.sort()` method.
3. Handles special cases for different data types (date, numeric, boolean, string) to ensure correct sorting order.
4. Respects the current sort direction (ascending or descending) for each column.

## Dependencies

The `sorting.js` file does not have any direct dependencies. It relies on the global `inventory` variable, which is assumed to be available in the rEngine Core ecosystem.

## Usage Examples

To use the `sortInventory` function, you can call it with an array of inventory items:

```javascript
import { sortInventory } from './sorting.js';

const inventoryData = [
  { name: 'Item A', type: 'Gold', qty: 10 },
  { name: 'Item B', type: 'Silver', qty: 5 },
  { name: 'Item C', type: 'Gold', qty: 8 },
];

const sortedInventory = sortInventory(inventoryData);
console.log(sortedInventory);
```

The `sortInventory` function will return the sorted inventory data based on the current sort column and direction.

## Configuration

The `sorting.js` file does not require any specific configuration. It relies on the global `sortColumn` and `sortDirection` variables, which are assumed to be managed elsewhere in the rEngine Core ecosystem.

## Integration Points

The `sorting.js` file is a core component of the `StackTrackr` project within the rEngine Core platform. It is responsible for providing consistent sorting functionality for the inventory data, which is likely used across various other components and interfaces within the rEngine Core ecosystem.

## Troubleshooting

## Issue: Sorting not working as expected

- Ensure that the `sortColumn` and `sortDirection` variables are set correctly and accessible to the `sortInventory` function.
- Verify that the inventory data structure matches the expected format, and that the mapping between column indices and data properties is correct.
- Check for any special cases or edge cases in the data that might not be handled properly by the sorting logic.

## Issue: Sorting performance issues

- The `sortInventory` function creates a new array and performs a full sort, which can be inefficient for large datasets. Consider optimizing the sorting logic or implementing pagination/lazy loading to improve performance.
- Analyze the time complexity of the sorting algorithm and identify any potential bottlenecks.

**Issue: Sorting not consistent across the rEngine Core platform**

- Ensure that the `sortInventory` function is used consistently across all relevant components and interfaces in the rEngine Core ecosystem.
- Verify that the `sortColumn` and `sortDirection` variables are managed centrally and synchronized properly.
- Consider implementing a shared sorting utility or service to maintain consistency across the platform.
