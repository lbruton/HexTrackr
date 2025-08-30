# Custom Mapping Module Documentation

## Purpose & Overview

The `customMapping.js` file provides a custom mapping module for the rEngine Core platform. This module offers a simple, regex-based rule engine that allows developers to map imported field names to application-specific fields. This is particularly useful when working with external data sources that may have different field naming conventions than the rEngine Core application.

The custom mapping module enables developers to define custom rules to automatically transform field names during data import processes, ensuring a seamless integration with the rEngine Core platform.

## Key Functions/Classes

The `CustomMapping` module exposes the following key functions:

### `addMapping(pattern, field)`

- **Purpose:** Adds a new mapping rule to the module.
- **Parameters:**
  - `pattern` (string): A regular expression pattern to match against field names.
  - `field` (string): The target field identifier to map the matched field names to.
- **Returns:** `void`

### `mapField(name)`

- **Purpose:** Attempts to map an input field name using the stored mapping rules.
- **Parameters:**
  - `name` (string): The field name to test against the mapping rules.
- **Returns:** `string|null` - The mapped field name or `null` if no rule matches.

### `clear()`

- **Purpose:** Removes all custom mapping rules.
- **Parameters:** `void`
- **Returns:** `void`

### `list()`

- **Purpose:** Returns a simplified view of the current mapping rules.
- **Parameters:** `void`
- **Returns:** `Array<{regex:string, field:string}>` - An array of objects containing the regex pattern and the mapped field for each rule.

## Dependencies

The `customMapping.js` file does not have any external dependencies. It is a self-contained module that can be used within the rEngine Core platform.

## Usage Examples

Here are some examples of how to use the `CustomMapping` module:

```javascript
// Add a new mapping rule
CustomMapping.addMapping(/^first_name$/, 'firstName');
CustomMapping.addMapping(/^last_name$/, 'lastName');

// Map a field name
const mappedField = CustomMapping.mapField('first_name'); // 'firstName'
const unmappedField = CustomMapping.mapField('unknown_field'); // null

// List current mappings
const mappings = CustomMapping.list();
console.log(mappings);
// Output: [
//   { regex: '/^first_name$/', field: 'firstName' },
//   { regex: '/^last_name$/', field: 'lastName' }
// ]

// Clear all mappings
CustomMapping.clear();
```

## Configuration

The `customMapping.js` file does not require any external configuration. The mapping rules are defined and managed entirely within the module.

## Integration Points

The `CustomMapping` module is designed to be used within the rEngine Core platform's data import and transformation processes. It can be integrated with other components, such as the data source connectors and the data mapping UI, to provide a seamless custom mapping experience for developers.

## Troubleshooting

## Issue: Invalid regular expression pattern

If an invalid regular expression pattern is provided to the `addMapping` function, the module will log a warning to the console and skip that mapping rule.

**Solution:** Ensure that the regular expression patterns provided are valid and correctly match the expected field names.

## Issue: Mapping not working as expected

If the `mapField` function is not returning the expected mapped field, double-check the following:

1. Ensure that the mapping rules are correctly defined, with the appropriate regular expression patterns and target field names.
2. Verify that the field names being passed to `mapField` match the expected format.
3. Check for any conflicts or overlaps between the mapping rules.

**Solution:** Review the mapping rules and the input field names to identify and resolve any issues.
