# File Protocol Fix

## Purpose & Overview

The `file-protocol-fix.js` script is a lightweight solution to address compatibility issues with the `file://` protocol in web browsers. When a web application is loaded from the local file system using the `file://` protocol, certain browser features and APIs, such as `localStorage`, may not function as expected. This script provides a simple fallback mechanism to ensure that the `localStorage` API continues to work reliably in such scenarios.

## Technical Architecture

The script consists of the following key components:

1. **Safe Debugging**: The `safeDebug` function is used to log debug messages, ensuring that the logging works even if the `debugLog` function is not defined.

1. **File Protocol Detection**: The script checks if the current window's protocol is `file://`. If so, it enables the localStorage fallback mechanism.

1. **localStorage Fallback**: When the `file://` protocol is detected, the script overrides the standard `localStorage` methods (`setItem`, `getItem`, `removeItem`) with a fallback implementation that uses an in-memory `window.tempStorage` object to store and retrieve data.

The data flow is as follows:

1. The script checks the current window's protocol.
2. If the `file://` protocol is detected, the script overrides the `localStorage` methods.
3. When the overridden `localStorage` methods are called, they first attempt to use the original `localStorage` implementation.
4. If the original `localStorage` implementation fails (e.g., due to permission issues), the fallback mechanism stores or retrieves the data from the `window.tempStorage` object.

## Dependencies

This script has no external dependencies and can be used standalone.

## Key Functions/Classes

1. **`safeDebug`**:
   - Parameters: `...args`
   - Return Value: `void`
   - Description: Logs debug messages using the `debugLog` function if it's available, or falls back to `console.log` if `debugLog` is not defined.

1. **`localStorage` Fallback**:
   - `localStorage.setItem`:
     - Parameters: `key: string, value: string`
     - Return Value: `void`
     - Description: Attempts to set the item in the original `localStorage`, and if that fails, stores the data in the `window.tempStorage` object.
   - `localStorage.getItem`:
     - Parameters: `key: string`
     - Return Value: `string | null`
     - Description: Attempts to retrieve the item from the original `localStorage`, and if that fails, retrieves the data from the `window.tempStorage` object.
   - `localStorage.removeItem`:
     - Parameters: `key: string`
     - Return Value: `void`
     - Description: Attempts to remove the item from the original `localStorage`, and if that fails, removes the data from the `window.tempStorage` object.

## Usage Examples

To use the `file-protocol-fix.js` script, simply include it in your HTML file:

```html
<script src="file-protocol-fix.js"></script>
```

The script will automatically detect the `file://` protocol and enable the `localStorage` fallback mechanism when necessary. You can then use the `localStorage` API as you normally would, and the script will handle the compatibility issues.

## Configuration

This script does not require any configuration options or environment variables.

## Error Handling

The script handles errors that may occur when using the `localStorage` API. If the original `localStorage` implementation fails (e.g., due to permission issues), the script will log a warning message and use the in-memory `window.tempStorage` object as a fallback.

## Integration

The `file-protocol-fix.js` script is designed to be a standalone solution for addressing `file://` protocol compatibility issues with the `localStorage` API. It can be easily integrated into any web application that needs to ensure reliable `localStorage` functionality when running on the local file system.

## Development Notes

- The script uses a lightweight approach to avoid conflicts with other scripts or libraries that may also be using the `localStorage` API.
- The in-memory `window.tempStorage` fallback is a simple solution, but it has limitations. Data stored in `window.tempStorage` will be lost when the page is refreshed or closed. For more robust solutions, you may need to consider alternative storage mechanisms, such as IndexedDB or a custom in-memory cache.
- This script is intended to be a minimal, focused solution for the `file://` protocol compatibility issue. For more comprehensive file protocol handling, you may need to consider additional features or integrations.
