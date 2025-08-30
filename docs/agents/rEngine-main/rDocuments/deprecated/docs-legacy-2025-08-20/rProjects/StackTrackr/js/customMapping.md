# Custom Mapping Module

## Purpose & Overview

The `customMapping.js` script provides a simple, regex-based rule engine for mapping imported field names to application-specific fields. This allows for flexible, configurable field mapping without hardcoding complex logic. The module can be used to normalize incoming data to match the expected structure of the application.

## Technical Architecture

The script uses a closure to encapsulate the mapping rules and expose a set of public methods:

- `addMapping(pattern, field)`: Adds a new mapping rule by creating a regex pattern and associating it with a target field name.
- `mapField(name)`: Attempts to map an input field name to a target field using the stored mapping rules. Returns the mapped field or `null` if no rule matches.
- `clear()`: Removes all custom mapping rules.
- `list()`: Returns a simplified view of the current mapping rules.

The mapping rules are stored in the `mappings` array, where each rule is represented by a `MappingRule` object containing the regex pattern and the target field name.

## Dependencies

This script has no external dependencies and can be used standalone.

## Key Functions/Classes

### `addMapping(pattern, field)`

- **Parameters**:
  - `pattern` (string): A regex pattern as a string to match against field names.
  - `field` (string): The target field identifier to map to.
- **Returns**: `void`
- **Description**: Adds a new mapping rule by creating a regex pattern and associating it with a target field name. Invalid regex patterns are logged as warnings.

### `mapField(name)`

- **Parameters**:
  - `name` (string): The field name to test against the mapping rules.
- **Returns**: `string|null`
  - The mapped field name if a rule matches, or `null` if no rule applies.
- **Description**: Attempts to map an input field name to a target field using the stored mapping rules.

### `clear()`

- **Parameters**: None
- **Returns**: `void`
- **Description**: Removes all custom mapping rules.

### `list()`

- **Parameters**: None
- **Returns**: `Array<{regex:string, field:string}>`
  - An array of objects representing the current mapping rules, with the regex pattern and target field.
- **Description**: Returns a simplified view of the current mapping rules.

## Usage Examples

```javascript
// Add some mapping rules
CustomMapping.addMapping("first_name", "firstName");
CustomMapping.addMapping("last_name", "lastName");
CustomMapping.addMapping("email_address", "email");

// Map an incoming field name
const mappedField = CustomMapping.mapField("first_name"); // "firstName"
const unmappedField = CustomMapping.mapField("some_other_field"); // null

// List current mappings
console.log(CustomMapping.list());
// [
//   { regex: '/first_name/i', field: 'firstName' },
//   { regex: '/last_name/i', field: 'lastName' },
//   { regex: '/email_address/i', field: 'email' }
// ]

// Clear all mappings
CustomMapping.clear();
```

## Configuration

This module has no external configuration options or environment variables. The mapping rules are defined and managed entirely within the script.

## Error Handling

The only potential error scenario is when an invalid regex pattern is provided to `addMapping()`. In this case, a warning is logged to the console, and the invalid rule is skipped.

## Integration

The `CustomMapping` module is designed to be used as a standalone utility within a larger application. It can be integrated into any project that needs to perform flexible field mapping between imported data and application-specific fields.

## Development Notes

- The use of a closure ensures that the mapping rules are encapsulated and not directly accessible from outside the module.
- The `list()` function provides a simplified view of the mapping rules, which can be useful for debugging or displaying the current configuration.
- The global exposure of the `CustomMapping` object allows for easy integration with prototype/UI hooks, where the mapping functionality may be needed.
- Error handling is minimal, focusing only on invalid regex patterns. More robust error handling could be added if needed, such as throwing custom errors or providing more detailed feedback.
- The script is designed to be lightweight and dependency-free, making it easy to integrate into various projects.
