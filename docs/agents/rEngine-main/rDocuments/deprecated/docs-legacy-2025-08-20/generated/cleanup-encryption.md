# StackTrackr Encryption Cleanup Script

## Purpose & Overview

The `cleanup-encryption.js` script is a utility designed to address issues related to encryption in the StackTrackr application, which is part of the rEngine Core ecosystem. This script aims to safely remove orphaned encryption keys from the browser's local storage, helping to resolve any problems caused by the lingering presence of these keys.

The script is intended to be run as a one-time cleanup operation, typically when users are experiencing issues with encryption state or seeing confusing "encrypted" status messages in the StackTrackr application.

## Key Functions/Classes

The script does not define any specific functions or classes. Instead, it is a self-contained, immediately-invoked function expression (IIFE) that performs the following key tasks:

1. **Logging the start of the cleanup process**: The script logs a message to the console to indicate that the StackTrackr Encryption Cleanup is starting.

1. **Identifying encryption keys to remove**: The script defines an array of keys that should be removed from the browser's local storage, as they are considered orphaned encryption keys.

1. **Checking for existing encryption keys**: The script iterates through the list of keys and checks if they exist in the local storage. It logs the found keys to the console.

1. **Removing the encryption keys**: If any encryption keys are found, the script proceeds to remove them from the local storage, logging the removal of each key.

1. **Verifying the cleanup**: After removing the keys, the script checks if any remaining encryption-related keys exist in the local storage and logs a message accordingly.

1. **Advising a page refresh**: Finally, the script advises the user to refresh the page to see the changes.

## Dependencies

The `cleanup-encryption.js` script does not have any external dependencies. It is a self-contained script that interacts directly with the browser's local storage API.

## Usage Examples

To use the StackTrackr Encryption Cleanup script, follow these steps:

1. Open the browser's developer tools (e.g., F12 in Chrome, Firefox, or Edge).
2. Navigate to the "Console" tab.
3. Copy and paste the entire `cleanup-encryption.js` script into the console.
4. Press Enter to execute the script.

The script will then perform the encryption key cleanup process and provide feedback in the console.

## Configuration

The `cleanup-encryption.js` script does not require any configuration. The list of encryption keys to remove is hardcoded within the script.

## Integration Points

The `cleanup-encryption.js` script is a standalone utility that is intended to be used within the context of the StackTrackr application, which is part of the rEngine Core ecosystem. The script does not directly integrate with any other rEngine Core components, but it is designed to address issues related to the encryption functionality within the StackTrackr application.

## Troubleshooting

Here are some common issues and solutions related to the StackTrackr Encryption Cleanup script:

### Issue: No encryption keys found

If the script logs a message indicating that no encryption keys were found, it means that the local storage is already clean, and no further action is required.

### Issue: Some encryption-related keys still exist

If the script logs a warning message indicating that some encryption-related keys may still exist, it means that the cleanup process was not fully successful. In this case, you can try running the script again, or you may need to investigate further to identify the remaining keys and remove them manually.

### Issue: Refresh the page not working

If the page does not appear to update after running the script and refreshing, try clearing your browser's cache or using a private/incognito window to ensure that the changes are properly reflected.

### Issue: Ongoing encryption issues

If you continue to experience issues with encryption state or "encrypted" status messages in the StackTrackr application after running the cleanup script, there may be underlying problems that require further investigation or troubleshooting. In such cases, you should reach out to the rEngine Core support team for assistance.
