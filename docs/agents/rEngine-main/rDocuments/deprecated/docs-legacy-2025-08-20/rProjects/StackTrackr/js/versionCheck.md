# Version Change Detection and Changelog Display

## Purpose & Overview

The `versionCheck.js` script is responsible for detecting changes in the application's version and displaying a changelog modal to the user. It compares the stored version in the user's local storage with the current version, and if there's a difference, it fetches the corresponding changelog from a markdown file and presents it in a modal window.

This script ensures that users are aware of the changes and improvements made to the application, providing a seamless and transparent update experience.

## Technical Architecture

The script is divided into several key components:

1. **`checkVersionChange()`**: This function is the main entry point, responsible for checking the version stored in the user's local storage and displaying the changelog modal if a change is detected.
2. **`getChangelogForVersion()`**: This function extracts the changelog section for a specific version from the full changelog markdown text.
3. **`populateVersionModal()`**: This function populates the version modal with the current version and the corresponding changelog, and then displays the modal.
4. **`getEmbeddedChangelog()`**: This function provides a fallback mechanism for displaying the changelog when the fetch request for the markdown file fails, by using embedded changelog data.
5. **`setupVersionModalEvents()`**: This function sets up the event handlers for the version modal, including accepting the version change and closing the modal.

The script listens for the `DOMContentLoaded` event and calls the `checkVersionChange()` function to initiate the version change detection process.

## Dependencies

The `versionCheck.js` script does not have any external dependencies. It relies on the following global variables and functions:

- `LS_KEY`: The key used to store data in the user's local storage.
- `VERSION_ACK_KEY`: The key used to store the acknowledged version in the user's local storage.
- `APP_VERSION`: The current version of the application.
- `showAckModal()`: A function that displays an acknowledgment modal (if available).
- `loadAnnouncements()`: A function that loads and displays application announcements (if available).
- `sanitizeHtml()`: A function that sanitizes HTML input to prevent XSS attacks.

## Key Functions/Classes

1. **`checkVersionChange()`**
   - Parameters: None
   - Return Value: None
   - Description: Checks the stored version in the user's local storage and displays the changelog modal if a change is detected.

1. **`getChangelogForVersion()`**
   - Parameters:
     - `text`: The full changelog markdown text.
     - `version`: The version string to extract the changelog for.
   - Return Value: An HTML string containing the changelog items for the specified version.
   - Description: Extracts the changelog section for a specific version from the full changelog markdown text.

1. **`populateVersionModal()`**
   - Parameters:
     - `version`: The current application version.
     - `html`: The HTML content of the changelog.
   - Return Value: None
   - Description: Populates and displays the version modal with the current version and the corresponding changelog.

1. **`getEmbeddedChangelog()`**
   - Parameters:
     - `version`: The version to get the changelog for.
   - Return Value: An HTML string containing the changelog items for the specified version.
   - Description: Provides embedded changelog data as a fallback when the fetch request for the markdown file fails.

1. **`setupVersionModalEvents()`**
   - Parameters:
     - `version`: The current application version.
   - Return Value: None
   - Description: Sets up the event handlers for the version modal, including accepting the version change and closing the modal.

## Usage Examples

The `versionCheck.js` script is typically included in the main HTML file of the application, often near the end of the `<body>` section. It will automatically check for version changes and display the changelog modal when necessary.

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Application</title>
  <!-- Other HTML content -->
</head>
<body>
  <!-- Application content -->

  <!-- Version modal -->
  <div id="versionModal" class="modal">
    <div class="modal-content">
      <h2>Version Update <span id="versionModalVersion"></span></h2>
      <div id="versionChanges"></div>
      <div class="modal-buttons">
        <button id="versionAcceptBtn">Got it</button>
        <button id="versionCloseBtn">Close</button>
      </div>
    </div>
  </div>

  <!-- Load the version check script -->
  <script src="versionCheck.js"></script>
</body>
</html>
```

## Configuration

The `versionCheck.js` script relies on the following configuration options and environment variables:

- `LS_KEY`: The key used to store data in the user's local storage.
- `VERSION_ACK_KEY`: The key used to store the acknowledged version in the user's local storage.
- `APP_VERSION`: The current version of the application.

These values should be defined and maintained separately, as they are used throughout the application.

## Error Handling

The `versionCheck.js` script handles the following potential errors:

1. **Fetch Error**: If the fetch request for the changelog markdown file fails, the script will display a fallback changelog using the `getEmbeddedChangelog()` function.
2. **Changelog Parsing Error**: If the markdown file cannot be parsed correctly, the script will display a message indicating that no changelog entry was found.

In both cases, the script will log the error to the console for debugging purposes.

## Integration

The `versionCheck.js` script is designed to be integrated into the larger application system. It relies on the following external functions and variables:

- `showAckModal()`: A function that displays an acknowledgment modal (if available) when no version data is found in the user's local storage.
- `loadAnnouncements()`: A function that loads and displays application announcements (if available) when the version modal is shown.
- `sanitizeHtml()`: A function that sanitizes HTML input to prevent XSS attacks.

These dependencies should be provided or implemented by the application to ensure the smooth functioning of the version change detection and changelog display.

## Development Notes

1. **Changelog Markdown Format**: The script expects the changelog to be formatted in Markdown, with each version change listed under a heading in the format `### Version x.xx.xx`. This allows the script to parse the changelog and extract the relevant section for the current version.

1. **Local Storage Usage**: The script uses the user's local storage to store the current version and the acknowledged version. This ensures that the changelog modal is only displayed when there's a new version, and not every time the user visits the application.

1. **Fallback Changelog**: The `getEmbeddedChangelog()` function provides a fallback mechanism for displaying the changelog when the fetch request for the markdown file fails. This could happen in certain environments or scenarios where the markdown file is not accessible.

1. **Modal Event Handling**: The `setupVersionModalEvents()` function sets up the event handlers for the version modal, including accepting the version change and closing the modal. This ensures a consistent user experience when interacting with the version update notification.

1. **Accessibility Considerations**: The script sets the `overflow` property of the `<body>` element to `"hidden"` when the version modal is displayed, to prevent scrolling behind the modal. This should be considered when integrating the script into the larger application, as it may affect the overall layout and accessibility of the page.
