# StackTrackr Encryption Cleanup Script

## Purpose & Overview

This script is designed to safely remove orphaned encryption keys from the browser's localStorage. It is part of a gradual encryption removal process for the StackTrackr application. The script is intended to be run in the browser console to address issues related to encryption state or confusing "encrypted" status messages.

## Technical Architecture

The script is a self-executing function that performs the following steps:

1. Checks for the existence of specific encryption-related keys in localStorage.
2. If any keys are found, it logs the list of keys and proceeds to remove them.
3. After the removal process, it verifies that all expected encryption keys have been removed.
4. Finally, it logs a message advising the user to refresh the page to see the changes.

The script operates directly on the browser's localStorage, without any external dependencies or imports.

## Dependencies

This script has no external dependencies. It solely interacts with the browser's built-in localStorage API.

## Key Functions/Classes

The script does not define any named functions or classes. It is a self-contained, self-executing function.

## Usage Examples

To use this script, follow these steps:

1. Open the StackTrackr web application in your browser.
2. Open the browser's developer tools and navigate to the Console tab.
3. Copy and paste the entire script into the console.
4. Press Enter to execute the script.

The script will log its progress and the results of the encryption key cleanup process.

## Configuration

This script does not require any configuration options or environment variables. It uses a predefined list of encryption keys to remove.

## Error Handling

The script does not explicitly handle any errors. It assumes that the localStorage API calls will succeed without any issues. If an error occurs during the key removal process, it will be logged to the browser's console.

## Integration

This script is designed to be a standalone utility that can be used to address encryption-related issues in the StackTrackr application. It is not directly integrated with the main application code.

## Development Notes

- The script uses a self-executing function to encapsulate its logic and avoid polluting the global namespace.
- The list of encryption keys to remove is hardcoded within the script, which may need to be updated if the application's encryption strategy changes.
- The script provides a visual indication of its progress using console logs and emojis for better readability.
- The script includes an optional verification step to ensure that all expected encryption keys have been removed.
- The script advises the user to refresh the page after the cleanup process to ensure the changes take effect.

Overall, this script provides a simple and effective way to address encryption-related issues in the StackTrackr application by safely removing orphaned encryption keys from the browser's localStorage.
