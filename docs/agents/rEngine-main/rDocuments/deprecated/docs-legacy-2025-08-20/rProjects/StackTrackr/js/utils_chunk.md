# `utils.js_chunk_2` Documentation

## Purpose & Overview

The `utils.js_chunk_2` script provides a collection of utility functions and constants that are used throughout the application. These functions handle various tasks such as date formatting, currency conversion, HTML sanitization, and inventory item validation.

The utilities in this script are designed to be flexible, reusable, and robust, helping to ensure consistency and reliability across the application.

## Technical Architecture

The script is organized into several sections, each containing related utility functions and constants:

1. **Date Formatting**: Functions for parsing and formatting date strings, including `parseDate` and `formatDisplayDate`.
2. **Currency Formatting**: Functions for formatting numbers as currency strings, including `formatCurrency` and `formatLossProfit`.
3. **HTML Sanitization**: The `sanitizeHtml` function for safely displaying user-provided text in the UI.
4. **Weight Conversion**: Functions for converting between grams and troy ounces, including `gramsToOzt`, `oztToGrams`, and `formatWeight`.
5. **Currency Conversion**: The `convertToUsd` function for converting amounts from various currencies to US Dollars.
6. **String Cleaning**: Functions for cleaning and sanitizing strings, including `stripNonAlphanumeric` and `cleanString`.
7. **Object Sanitization**: The `sanitizeObjectFields` function for sanitizing string properties of an object.
8. **Inventory Normalization**: Functions for normalizing inventory item types and mapping Numista types to internal categories, including `normalizeType` and `mapNumistaType`.
9. **Persistent Storage**: Functions for saving and loading data to/from localStorage, with optional encryption support (`saveData`, `loadData`, `saveDataSync`, `loadDataSync`).
10. **Storage Cleanup**: The `cleanupStorage` function for removing unknown keys from localStorage.
11. **Inventory Sorting**: The `sortInventoryByDateNewestFirst` function for sorting inventory items by date in descending order.
12. **Inventory Validation**: The `validateInventoryItem` function for validating the structure and contents of an inventory item.

The script uses a mix of synchronous and asynchronous functions, with the asynchronous versions handling encryption-related operations.

## Dependencies

The `utils.js_chunk_2` script does not have any external dependencies. It relies on the built-in JavaScript APIs and the global `StackrTrackrEncryption` object (if available) for encryption-related functionality.

## Key Functions/Classes

### Date Formatting

## `parseDate(dateStr)`

- **Parameters**: `dateStr` (string) - A date string in any parseable format
- **Returns**: `string` - The date in ISO format (YYYY-MM-DD), or '—' if the date could not be parsed
- **Description**: Attempts to parse the input date string using various methods, falling back to a generic date parsing approach. If all parsing attempts fail, it returns the '—' character.

## `formatDisplayDate(dateStr)`

- **Parameters**: `dateStr` (string) - A date string in any parseable format
- **Returns**: `string` - The date formatted as "Month Day, Year" (e.g., "Jan 1, 1969"), or '—' if the date could not be parsed
- **Description**: Formats the input date string in a human-readable format.

### Currency Formatting

## `formatCurrency(value, currency = DEFAULT_CURRENCY)`

- **Parameters**: `value` (number|string) - The numeric value to format, `currency` (string) - The ISO currency code (default is `DEFAULT_CURRENCY`)
- **Returns**: `string` - The formatted currency string (e.g., "$1,234.56")
- **Description**: Formats a number as a currency string using the specified (or default) currency.

## `formatLossProfit(value)`

- **Parameters**: `value` (number) - The profit/loss value to format
- **Returns**: `string` - An HTML string with the formatted value and appropriate color styling (green for positive, red for negative)
- **Description**: Formats a profit/loss value with color-coded styling.

### HTML Sanitization

## `sanitizeHtml(text)`

- **Parameters**: `text` (string) - The text to sanitize
- **Returns**: `string` - The sanitized text, safe for HTML insertion
- **Description**: Sanitizes the input text by encoding HTML special characters, preventing potential XSS attacks.

### Weight Conversion

## `gramsToOzt(grams)`

- **Parameters**: `grams` (number) - The weight in grams
- **Returns**: `number` - The weight in troy ounces
- **Description**: Converts a weight in grams to troy ounces.

## `oztToGrams(ozt)`

- **Parameters**: `ozt` (number) - The weight in troy ounces
- **Returns**: `number` - The weight in grams
- **Description**: Converts a weight in troy ounces to grams.

## `formatWeight(ozt)`

- **Parameters**: `ozt` (number) - The weight in troy ounces
- **Returns**: `string` - The formatted weight string with the appropriate unit (grams or ounces)
- **Description**: Formats a weight in troy ounces, displaying it in either grams or ounces depending on the value.

### Currency Conversion

## `convertToUsd(amount, currency = "USD")`

- **Parameters**: `amount` (number) - The monetary amount to convert, `currency` (string) - The ISO currency code of the input amount (default is "USD")
- **Returns**: `number` - The amount converted to US Dollars
- **Description**: Converts the input amount from the specified currency to US Dollars using static exchange rates.

### String Cleaning

**`stripNonAlphanumeric(str, { allowHyphen = false, allowSlash = false })`**

- **Parameters**: `str` (string) - The input string, `allowHyphen` (boolean) - Whether to allow hyphens, `allowSlash` (boolean) - Whether to allow slashes
- **Returns**: `string` - The cleaned string containing only letters, numbers, and optionally hyphens and/or slashes
- **Description**: Removes all non-alphanumeric characters from the input string, preserving spaces and optionally hyphens and/or slashes.

## `cleanString(str)`

- **Parameters**: `str` (string) - The input string
- **Returns**: `string` - The cleaned string
- **Description**: Cleans the input string by stripping HTML tags, control characters, and diacritics, while preserving punctuation and normalizing whitespace.

### Object Sanitization

## `sanitizeObjectFields(obj)`

- **Parameters**: `obj` (object) - The object to sanitize
- **Returns**: `object` - A new object with the string fields sanitized
- **Description**: Sanitizes all string properties of the input object by stripping non-alphanumeric characters (except for the `notes` field).

### Inventory Normalization

## `normalizeType(type = "")`

- **Parameters**: `type` (string) - The raw inventory item type
- **Returns**: `string` - The normalized type value, one of the predefined options
- **Description**: Normalizes the input inventory item type to one of the allowed values.

## `mapNumistaType(type = "")`

- **Parameters**: `type` (string) - The Numista inventory item type
- **Returns**: `string` - The mapped internal inventory type
- **Description**: Maps a Numista type string to the corresponding internal StackrTrackr category.

## `parseNumistaMetal(composition = "")`

- **Parameters**: `composition` (string) - The Numista composition description
- **Returns**: `string` - The recognized metal type or "Alloy" if not silver/gold/platinum/palladium
- **Description**: Determines the metal type from the Numista composition string.

### Persistent Storage

## `saveData(key, data)`

- **Parameters**: `key` (string) - The storage key, `data` (any) - The data to store
- **Returns**: `Promise<void>` - A Promise that resolves when the data is saved
- **Description**: Saves data to localStorage, with optional encryption support.

## `loadData(key, defaultValue = [])`

- **Parameters**: `key` (string) - The storage key, `defaultValue` (any) - The default value to return if no data is found (default is an empty array)
- **Returns**: `Promise<any>` - The loaded data, or the default value if the data could not be retrieved
- **Description**: Loads data from localStorage, with optional decryption support.

## `saveDataSync(key, data)`

- **Parameters**: `key` (string) - The storage key, `data` (any) - The data to store
- **Returns**: `void`
- **Description**: Synchronous version of `saveData` for backwards compatibility.

## `loadDataSync(key, defaultValue = [])`

- **Parameters**: `key` (string) - The storage key, `defaultValue` (any) - The default value to return if no data is found (default is an empty array)
- **Returns**: `any` - The loaded data, or the default value if the data could not be retrieved
- **Description**: Synchronous version of `loadData` for backwards compatibility.

## `cleanupStorage()`

- **Parameters**: `none`
- **Returns**: `void`
- **Description**: Removes unknown localStorage keys to maintain a clean storage state.

### Inventory Sorting

## `sortInventoryByDateNewestFirst(data = inventory)`

- **Parameters**: `data` (array) - The inventory data to sort (default is the global `inventory` array)
- **Returns**: `array` - The sorted inventory data
- **Description**: Sorts the inventory data by date in descending order (newest first), handling unknown/missing dates gracefully.

### Inventory Validation

## `validateInventoryItem(item)`

- **Parameters**: `item` (object) - The inventory item to validate
- **Returns**: `{ isValid: boolean, errors: string[] }` - The validation result, including a boolean flag and an array of error messages
- **Description**: Validates the structure and contents of an inventory item, checking for required fields, length limits, and numeric constraints.

## Usage Examples

### Date Formatting (2)

```javascript
const dateStr = "2023-04-15";
const formattedDate = formatDisplayDate(dateStr); // Output: "Apr 15, 2023"
```

### Currency Formatting (2)

```javascript
const amount = 1234.56;
const formattedCurrency = formatCurrency(amount, "USD"); // Output: "$1,234.56"
const formattedLossProfit = formatLossProfit(-100.50); // Output: "<span style="color: var(--danger);">-$100.50</span>"
```

### HTML Sanitization (2)

```javascript
const unsafeText = "<script>alert('XSS attack!');</script>";
const sanitizedText = sanitizeHtml(unsafeText); // Output: "&lt;script&gt;alert('XSS attack!');&lt;/script&gt;"
```

### Weight Conversion (2)

```javascript
const weightInGrams = 31.1034768;
const weightInOunces = gramsToOzt(weightInGrams); // Output: 1.0
const formattedWeight = formatWeight(weightInOunces); // Output: "1.00 oz"
```

### Currency Conversion (2)

```javascript
const amount = 100;
const convertedToUsd = convertToUsd(amount, "EUR"); // Output: 108
```

### Inventory Normalization (2)

```javascript
const rawType = "CoiN";
const normalizedType = normalizeType(rawType); // Output: "Coin"

const numistaType = "Silver Coin";
const mappedType = mapNumistaType(numistaType); // Output: "Coin"

const composition = "Silver";
const metalType = parseNumistaMetal(composition); // Output: "Silver"
```

### Persistent Storage (2)

```javascript
// Asynchronous
await saveData("myData", { key: "value" });
const loadedData = await loadData("myData", { defaultKey: "defaultValue" });

// Synchronous
saveDataSync("myDataSync", { key: "value" });
const loadedDataSync = loadDataSync("myDataSync", { defaultKey: "defaultValue" });
```

### Inventory Sorting (2)

```javascript
const sortedInventory = sortInventoryByDateNewestFirst(inventory);
```

### Inventory Validation (2)

```javascript
const invalidItem = { qty: -1, weight: "abc" };
const { isValid, errors } = validateInventoryItem(invalidItem);
console.log(isValid); // Output: false
console.log(errors); // Output: ["Quantity must be a positive integer", "Weight must be a positive number"]
```

## Configuration

This script does not have any configurable options. It relies on the global `DEFAULT_CURRENCY` constant, which should be set elsewhere in the application.

## Error Handling

The utility functions in this script handle errors gracefully and provide fallback values or default behaviors when issues occur. For example:

- The `parseDate` function returns the '—' character if the input date cannot be parsed.
- The `formatCurrency` function has a fallback for environments without Intl.NumberFormat support.
- The `loadData` and `saveData` functions log errors and return default values when data could not be loaded or saved.

## Integration

The `utils.js_chunk_2` script is a standalone utility module that can be used throughout the application. It is designed to be easily integrated into various components and features, providing consistent and reliable functionality.

## Development Notes

- The script uses a mix of synchronous and asynchronous functions, with the asynchronous versions handling encryption-related operations.
- The `cleanupStorage` function is designed to maintain a clean localStorage state by removing any unknown keys.
- The `sortInventoryByDateNewestFirst` function handles unknown/missing dates gracefully, ensuring a consistent sorting order.
- The `validateInventoryItem` function provides a centralized way to validate the structure and contents of inventory items, making it easier to enforce data integrity.
- The script uses a combination of custom functions (e.g., `stripNonAlphanumeric`, `cleanString`) and built-in JavaScript APIs (e.g., `Intl.NumberFormat`) to achieve its functionality.
