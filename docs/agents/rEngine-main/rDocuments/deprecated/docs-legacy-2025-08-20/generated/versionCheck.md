# rEngine Core: `versionCheck.js` Documentation

## Purpose & Overview

The `versionCheck.js` file is part of the `StackTrackr` application, which is built using the rEngine Core platform. This file is responsible for detecting version changes in the application and displaying a changelog modal to the user when a new version is available. It handles the logic for fetching the changelog from a local file, parsing the content, and populating the version modal with the relevant changelog information.

## Key Functions/Classes

The main components and their roles in this file are:

### `checkVersionChange()`

This function is the entry point for the version change detection and changelog display logic. It checks if there is a version change by comparing the stored version with the current version, and then fetches the changelog content to display the relevant changes.

### `getChangelogForVersion()`

This function takes the full changelog text and a specific version, and extracts the changelog entries for that version. It uses a regular expression to find the section that corresponds to the given version and returns the HTML-formatted changelog items.

### `populateVersionModal()`

This function is responsible for populating the version modal with the current version and the changelog content, and then displaying the modal to the user.

### `getEmbeddedChangelog()`

This function provides a fallback mechanism for retrieving the changelog information when the fetch request for the external changelog file fails. It contains a pre-defined set of changelog entries for specific versions, which are used to populate the version modal.

### `setupVersionModalEvents()`

This function sets up the event handlers for the version modal, allowing the user to acknowledge the changelog and close the modal.

## Dependencies

The `versionCheck.js` file depends on the following elements:

1. **Local Storage**: The file uses the browser's local storage to store the current version and the user's acknowledgment of the changelog.
2. **Changelog File**: The file expects a `changelog.md` file to be present in the `docs` directory, which contains the markdown-formatted changelog information.
3. **DOM Elements**: The file interacts with several DOM elements, such as the version modal, the changelog content container, and the version acknowledgment buttons.
4. **Global Functions**: The file relies on the global functions `showAckModal()` and `loadAnnouncements()`, which are likely defined elsewhere in the application.

## Usage Examples

To use the version change detection and changelog display functionality provided by `versionCheck.js`, you can follow these steps:

1. Include the `versionCheck.js` file in your HTML document:

   ```html
   <script src="js/versionCheck.js"></script>
   ```

1. Ensure that the `changelog.md` file is present in the `docs` directory of your application.
2. Optionally, implement the `showAckModal()` and `loadAnnouncements()` functions to integrate with the version change detection logic.
3. The `versionCheck.js` file will automatically check for version changes and display the changelog modal when necessary, based on the user's previous acknowledgment.

## Configuration

The `versionCheck.js` file does not require any specific configuration. It relies on the following environment variables and constants:

- `LS_KEY`: The key used to store data in the local storage.
- `VERSION_ACK_KEY`: The key used to store the user's acknowledgment of the changelog in the local storage.
- `APP_VERSION_KEY`: The key used to store the current application version in the local storage.
- `APP_VERSION`: The current version of the application, used as a fallback when the version is not stored in the local storage.

## Integration Points

The `versionCheck.js` file is designed to work within the rEngine Core ecosystem, specifically the `StackTrackr` application. It integrates with the following components:

1. **Local Storage**: The file uses the browser's local storage to store and retrieve version information and user acknowledgments.
2. **Changelog File**: The file expects a `changelog.md` file to be present in the `docs` directory, which contains the markdown-formatted changelog information.
3. **DOM Elements**: The file interacts with several DOM elements, such as the version modal, the changelog content container, and the version acknowledgment buttons.
4. **Global Functions**: The file relies on the global functions `showAckModal()` and `loadAnnouncements()`, which are likely defined elsewhere in the application.

## Troubleshooting

Here are some common issues and solutions related to the `versionCheck.js` file:

### "Unable to load changelog" error

If the `versionCheck.js` file is unable to fetch the `changelog.md` file, it will display a fallback changelog based on the embedded data. This could happen if the file is not present in the correct location or if the application is running in a restricted environment (e.g., file:// protocol).

**Solution**: Ensure that the `changelog.md` file is present in the `docs` directory of your application. If the issue persists, you can update the embedded changelog data in the `getEmbeddedChangelog()` function to match your application's version history.

### Version modal not displaying

If the version modal is not displaying when a new version is available, check the following:

1. Ensure that the `versionModal` element is present in the DOM and has the correct ID.
2. Verify that the `populateVersionModal()` function is being called correctly and that the necessary DOM elements (e.g., `versionModalVersion`, `versionChanges`) are present.
3. Check if the `checkVersionChange()` function is being called at the appropriate time, such as on `DOMContentLoaded` event.

**Solution**: Review the implementation of the version change detection and modal display logic, and make sure that all the necessary elements and function calls are in place.

### Changelog content not displaying correctly

If the changelog content is not being displayed correctly in the version modal, check the following:

1. Ensure that the `getChangelogForVersion()` function is properly extracting the relevant changelog entries from the `changelog.md` file.
2. Verify that the HTML formatting of the changelog items is correct and consistent.
3. Check if the `populateVersionModal()` function is properly inserting the changelog content into the DOM.

**Solution**: Debug the changelog parsing and content population logic to ensure that the changelog information is being processed and displayed correctly.

By addressing these common issues, you can ensure that the `versionCheck.js` file is functioning as expected within the rEngine Core ecosystem.
