# Sanitize Name Slash Test

## Purpose & Overview

This script tests the `sanitizeImportedItem` function from the `../js/utils.js` module. The function is responsible for cleaning and normalizing data for imported inventory items. The purpose of this test is to ensure that the `sanitizeImportedItem` function correctly preserves the forward slash character (`/`) in the `name` property of the item.

## Technical Architecture

The script uses the built-in `assert` module from Node.js to perform a strict equality check on the `name` property of the sanitized item. It creates a sample item object with a name containing a forward slash, passes it to the `sanitizeImportedItem` function, and verifies that the output name is unchanged.

The key components are:

1. `sanitizeImportedItem` function (imported from `../js/utils.js`)
2. Sample item object with a forward slash in the `name` property
3. `assert.strictEqual()` method to validate the output

## Dependencies

- `assert` module from the Node.js standard library

## Key Functions/Classes

### `sanitizeImportedItem(item)`

## Parameters:

- `item` (Object): The item object to be sanitized

## Returns:

- (Object): The sanitized item object

This function takes an item object as input and returns a new object with the following properties sanitized and normalized:

- `name`: The item name, with leading/trailing whitespace removed
- `type`: The item type, with leading/trailing whitespace removed
- `metal`: The item metal, with leading/trailing whitespace removed
- `qty`: The item quantity, converted to a number
- `weight`: The item weight, converted to a number
- `price`: The item price, converted to a number

## Usage Examples

```javascript
const { sanitizeImportedItem } = require('../js/utils.js');

const item = sanitizeImportedItem({
  name: '1/2 oz Round',
  type: 'Round',
  metal: 'Silver',
  qty: 1,
  weight: 1,
  price: 1,
});

console.log(item);
// Output:
// {
//   name: '1/2 oz Round',
//   type: 'Round',
//   metal: 'Silver',
//   qty: 1,
//   weight: 1,
//   price: 1
// }
```

## Configuration

This script does not require any configuration options or environment variables.

## Error Handling

The `sanitizeImportedItem` function does not explicitly handle any errors. If the input object is missing required properties or contains invalid data, the function will return the sanitized object with the best effort to normalize the values.

## Integration

This script is a unit test for the `sanitizeImportedItem` function, which is likely used as part of a larger inventory management system. The test ensures that the function properly handles item names containing forward slashes, which is an important requirement for accurate data processing and display.

## Development Notes

The key implementation detail for this test is the use of the `assert.strictEqual()` method to validate the output of the `sanitizeImportedItem` function. This ensures that the function not only sanitizes the input data, but also preserves the forward slash character in the `name` property.
