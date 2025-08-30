# rEngine Core: utils.js Documentation

## Purpose & Overview

The `utils.js` file is a critical part of the rEngine Core ecosystem, providing a comprehensive set of utility functions and helpers that power various features and components across the platform. This file serves as a centralized location for common functionality, ensuring consistency and reusability throughout the application.

The utilities in this file cover a wide range of tasks, including:

- Data compression and decompression
- Logging and performance monitoring
- Branding and application title management
- Date/time parsing and formatting
- Currency conversion and formatting
- HTML sanitization and cleaning
- Inventory data validation and normalization
- Storage management and reporting
- Error handling and user-friendly messaging

These utilities are designed to be lightweight, efficient, and easily integrable, making them a crucial part of the rEngine Core infrastructure.

## Key Functions/Classes

The `utils.js` file exports the following key functions and classes:

### Compression Helpers

- `__compressIfNeeded(str)`: Compresses a string using LZString if it exceeds a certain size.
- `__decompressIfNeeded(stored)`: Decompresses a previously compressed string.

### Logging and Performance

- `debugLog(...args)`: Logs messages to the console when the `DEBUG` flag is enabled.
- `monitorPerformance(fn, name, ...args)`: Measures the execution time of a function and logs a warning if it exceeds a certain threshold.

### Branding and Application Title

- `getBrandingName()`: Determines the active branding name considering domain overrides.
- `getAppTitle(baseTitle = "StackrTrackr")`: Returns the full application title with version or branding name.

### Date and Time

- `parseDate(dateStr)`: Parses various date formats into the standard YYYY-MM-DD format.
- `formatDisplayDate(dateStr)`: Formats a date string into the "Month Day, Year" format.

### Currency and Formatting

- `formatCurrency(value, currency = DEFAULT_CURRENCY)`: Formats a number as a currency string using the default currency.
- `formatLossProfit(value)`: Formats a profit/loss value with color coding.
- `sanitizeHtml(text)`: Sanitizes text input for safe HTML display.
- `gramsToOzt(grams)` and `oztToGrams(ozt)`: Converts between grams and troy ounces.
- `formatWeight(ozt)`: Formats a weight in troy ounces as either grams or ounces.
- `convertToUsd(amount, currency = "USD")`: Converts an amount from the specified currency to USD using static rates.
- `detectCurrency(str)`: Detects the currency code from a value string containing symbols or codes.

### Inventory Management

- `validateInventoryItem(item)`: Validates an inventory item data object.
- `sanitizeImportedItem(item)`: Sanitizes imported inventory data, coercing invalid fields to safe defaults.

### Storage Management

- `saveData(key, data)` and `loadData(key, defaultValue = [])`: Saves and loads data with optional encryption.
- `cleanupStorage()`: Removes unknown localStorage keys to maintain a clean storage state.
- `sortInventoryByDateNewestFirst(data = inventory)`: Sorts inventory data by date, with unknown dates sorting to the bottom.
- `generateStorageReportHTML()`: Generates comprehensive HTML storage report with theme support.
- `generateStorageReportTar()`: Generates a ZIP file with storage report and data.

### Error Handling

- `handleError(error, context)`: Handles errors with user-friendly messaging.
- `getUserFriendlyMessage(errorMessage)`: Converts technical error messages to user-friendly ones.

### Miscellaneous

- `downloadFile(filename, content, mimeType)`: Downloads a file with the specified content and filename.
- `stripNonAlphanumeric(str, { allowHyphen = false, allowSlash = false })`: Removes all non-alphanumeric characters from a string, preserving spaces.
- `cleanString(str)`: Cleans a string by stripping HTML tags, control characters, and diacritics.
- `sanitizeObjectFields(obj)`: Sanitizes all string properties of an object by stripping non-alphanumeric characters.
- `normalizeType(type)`: Normalizes an item type to one of the predefined options.
- `mapNumistaType(type)`: Maps Numista type strings to internal StackrTrackr categories.
- `parseNumistaMetal(composition)`: Determines metal type from a Numista composition string.

## Dependencies

The `utils.js` file has the following dependencies:

- **LZString**: A minimal subset of the LZString library, providing UTF16 compression helpers.
- **StackrTrackrEncryption**: An optional encryption module for secure data storage.
- **JSZip** (optional): A library used for generating compressed storage reports.
- **Chart.js** (optional): A charting library used in the storage report.

These dependencies are either directly included in the file or conditionally loaded based on their availability.

## Usage Examples

Here are some examples of how to use the utilities provided in `utils.js`:

```javascript
// Logging and performance monitoring
debugLog('This is a debug message');
const result = monitorPerformance(myFunction, 'My Function', arg1, arg2);

// Date and time formatting
const formattedDate = formatDisplayDate('2023-04-25');

// Currency conversion and formatting
const usd = convertToUsd(100, 'EUR');
const formattedCurrency = formatCurrency(123.45, 'USD');

// Inventory data validation and sanitization
const validationResult = validateInventoryItem(inventoryItem);
const sanitizedItem = sanitizeImportedItem(rawItem);

// Storage management
saveData('my-key', { data: 'value' });
const loadedData = await loadData('my-key', []);
cleanupStorage();

// Error handling
try {
  // Some code that might throw an error
} catch (error) {
  handleError(error, 'My Function');
}
```

## Configuration

The `utils.js` file relies on the following configuration variables:

- `DEBUG`: A flag that enables or disables debug logging when `debugLog` is used.
- `BRANDING_DOMAIN_OVERRIDE`: An optional override for the active branding name based on the domain.
- `BRANDING_TITLE`: The default branding title when no domain override is set.
- `MAX_LOCAL_FILE_SIZE`: The maximum file size (in bytes) allowed for local uploads.
- `DEFAULT_CURRENCY`: The default currency code used for currency formatting.
- `ALLOWED_STORAGE_KEYS`: An array of allowed localStorage keys to maintain a clean storage state.

These variables are typically set elsewhere in the application or passed as environment variables.

## Integration Points

The `utils.js` file is a central utility library that is used throughout the rEngine Core application. It integrates with various other components and modules, including:

- **Storage Management**: The storage-related utilities, such as `saveData` and `loadData`, are used by other modules to persist and retrieve data.
- **Inventory Management**: The inventory validation and sanitization functions are used by the inventory management module.
- **Spot Price and History**: The date parsing and formatting utilities are used to handle spot price data.
- **API Integration**: The currency conversion and formatting utilities are used to display monetary values from the API.
- **User Interface**: The branding, application title, and error handling utilities are used to provide a consistent and user-friendly experience.
- **Reporting**: The storage reporting utilities are used to generate comprehensive reports of the application's storage usage.

## Troubleshooting

Here are some common issues and solutions related to the `utils.js` file:

1. **Compression/Decompression Issues**:
   - If you encounter issues with data compression or decompression, ensure that the LZString library is properly included and integrated.
   - Check the version of LZString and make sure it matches the one used in the `utils.js` file.

1. **Encryption Errors**:
   - If you're using the encryption features, make sure the `StackrTrackrEncryption` module is available and properly initialized.
   - Verify that the encryption key is correctly stored and accessible when loading and saving data.

1. **Storage Cleanup Problems**:
   - If you're experiencing issues with the `cleanupStorage` function, ensure that the `ALLOWED_STORAGE_KEYS` constant is correctly configured to include all the necessary storage keys used by your application.

1. **Date Parsing Errors**:
   - If the `parseDate` function is not correctly handling certain date formats, review the logic and add additional cases to support your specific date formats.
   - Provide feedback and suggestions for improvements to the date parsing functionality.

1. **Currency Conversion Issues**:
   - If the currency conversion rates in the `convertToUsd` function are not accurate, update the static rates to match the latest exchange rates.
   - Consider integrating with a dynamic currency conversion API for more accurate and up-to-date conversions.

1. **Error Handling Concerns**:
   - If the user-friendly error messages are not meeting your requirements, modify the `getUserFriendlyMessage` function to provide more appropriate messages for your application.
   - Ensure that the `handleError` function is properly integrated with your application's error reporting and logging mechanisms.

Remember, the `utils.js` file is a central utility library, so any issues or feedback related to its functionality should be addressed to ensure a smooth and consistent experience across the rEngine Core application.
