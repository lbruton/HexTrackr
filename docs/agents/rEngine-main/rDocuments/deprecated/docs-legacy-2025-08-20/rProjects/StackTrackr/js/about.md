# About.js Documentation

## Purpose & Overview

The `about.js` script is responsible for handling the display and functionality of the "About" and "Acknowledgment" modals in the application. It provides a set of functions to show, hide, and populate these modals with relevant information, such as the current version, changelog, and development roadmap.

The script is designed to work seamlessly with the application's overall modal management system, allowing for a consistent and user-friendly experience. It also includes fallback mechanisms to ensure the modals can be displayed even if the external announcement data is unavailable.

## Technical Architecture

The `about.js` script is structured around several key functions:

1. **Modal Display Functions**:
   - `showAboutModal()`: Displays the "About" modal and populates it with data.
   - `hideAboutModal()`: Hides the "About" modal.
   - `showAckModal()`: Displays the "Acknowledgment" modal and populates it with data.
   - `hideAckModal()`: Hides the "Acknowledgment" modal.

1. **Modal Interaction Functions**:
   - `acceptAck()`: Saves the user's acknowledgment and hides the "Acknowledgment" modal.

1. **Modal Population Functions**:
   - `populateAboutModal()`: Fills the "About" modal with version information and fetches the latest announcements.
   - `populateAckModal()`: Fills the "Acknowledgment" modal with version information.
   - `loadAnnouncements()`: Fetches the latest announcements from a Markdown file and populates the "What's New" and "Roadmap" sections.

1. **Fallback Functions**:
   - `getEmbeddedWhatsNew()`: Provides a fallback for the "What's New" section when the external announcements data is unavailable.
   - `getEmbeddedRoadmap()`: Provides a fallback for the "Roadmap" section when the external announcements data is unavailable.

1. **Event Setup Functions**:
   - `setupAboutModalEvents()`: Attaches event listeners to the "About" modal elements.
   - `setupAckModalEvents()`: Attaches event listeners to the "Acknowledgment" modal elements.

The script uses the `elements` object to access the necessary DOM elements, and it also assumes the existence of certain global functions (`openModalById`, `closeModalById`, `sanitizeHtml`) and variables (`APP_VERSION`, `ACK_DISMISSED_KEY`, `getBrandingName`) that are not defined within the script itself.

## Dependencies

The `about.js` script has the following external dependencies:

1. **Fetch API**: Used to fetch the latest announcements from a Markdown file.
2. **Branding Name**: Relies on the `getBrandingName()` function to retrieve the application's branding name.
3. **Modal Management**: Assumes the existence of `openModalById()` and `closeModalById()` functions to handle modal display.
4. **HTML Sanitization**: Uses the `sanitizeHtml()` function to sanitize the announcements data.
5. **Local Storage**: Utilizes the `localStorage` API to store the user's acknowledgment status.

## Key Functions/Classes

### Modal Display Functions

1. **`showAboutModal()`**:
   - Parameters: None
   - Return Value: None
   - Description: Displays the "About" modal and populates it with data.

1. **`hideAboutModal()`**:
   - Parameters: None
   - Return Value: None
   - Description: Hides the "About" modal.

1. **`showAckModal()`**:
   - Parameters: None
   - Return Value: None
   - Description: Displays the "Acknowledgment" modal and populates it with data.

1. **`hideAckModal()`**:
   - Parameters: None
   - Return Value: None
   - Description: Hides the "Acknowledgment" modal.

### Modal Interaction Functions

1. **`acceptAck()`**:
   - Parameters: None
   - Return Value: None
   - Description: Saves the user's acknowledgment and hides the "Acknowledgment" modal.

### Modal Population Functions

1. **`populateAboutModal()`**:
   - Parameters: None
   - Return Value: None
   - Description: Fills the "About" modal with version information and fetches the latest announcements.

1. **`populateAckModal()`**:
   - Parameters: None
   - Return Value: None
   - Description: Fills the "Acknowledgment" modal with version information.

1. **`loadAnnouncements()`**:
   - Parameters: None
   - Return Value: Promise
   - Description: Fetches the latest announcements from a Markdown file and populates the "What's New" and "Roadmap" sections.

### Fallback Functions

1. **`getEmbeddedWhatsNew()`**:
   - Parameters: None
   - Return Value: String
   - Description: Provides a fallback for the "What's New" section when the external announcements data is unavailable.

1. **`getEmbeddedRoadmap()`**:
   - Parameters: None
   - Return Value: String
   - Description: Provides a fallback for the "Roadmap" section when the external announcements data is unavailable.

### Event Setup Functions

1. **`setupAboutModalEvents()`**:
   - Parameters: None
   - Return Value: None
   - Description: Attaches event listeners to the "About" modal elements.

1. **`setupAckModalEvents()`**:
   - Parameters: None
   - Return Value: None
   - Description: Attaches event listeners to the "Acknowledgment" modal elements.

## Usage Examples

1. **Displaying the "About" Modal**:

   ```javascript
   showAboutModal();
   ```

1. **Displaying the "Acknowledgment" Modal**:

   ```javascript
   showAckModal();
   ```

1. **Accepting the Acknowledgment**:

   ```javascript
   acceptAck();
   ```

1. **Manually Fetching the Latest Announcements**:

   ```javascript
   loadAnnouncements();
   ```

## Configuration

The `about.js` script does not have any specific configuration options or environment variables. It relies on the following global variables and functions:

- `APP_VERSION`: The current version of the application.
- `ACK_DISMISSED_KEY`: The key used to store the user's acknowledgment status in localStorage.
- `getBrandingName()`: A function that returns the application's branding name.
- `openModalById(id)`: A function that opens a modal with the specified ID.
- `closeModalById(id)`: A function that closes a modal with the specified ID.
- `sanitizeHtml(html)`: A function that sanitizes the provided HTML content.

## Error Handling

The `about.js` script handles errors that may occur during the fetch of the latest announcements. If the fetch fails, it falls back to using the embedded "What's New" and "Roadmap" data. Any errors are logged to the console using `console.warn()`.

## Integration

The `about.js` script is designed to integrate seamlessly with the larger application. It provides a set of globally exposed functions that can be called from other parts of the codebase to manage the "About" and "Acknowledgment" modals.

The script assumes the existence of a modal management system that can handle the opening and closing of modals, as well as the necessary HTML elements and global variables/functions required for its operation.

## Development Notes

1. **Announcements Fetch**: The script fetches the latest announcements from a Markdown file located at `docs/announcements.md`. If this file is not available or the fetch fails, the script will use the embedded fallback data.

1. **Modal Event Handling**: The script sets up event listeners for the "About" and "Acknowledgment" modal elements, allowing users to close the modals by clicking outside or using the Escape key.

1. **Branding Name**: The script relies on the `getBrandingName()` function to retrieve the application's branding name, which is used to populate the modal content.

1. **Versioning**: The script uses the `APP_VERSION` global variable to display the current version of the application in the modals.

1. **Acknowledgment Persistence**: The script stores the user's acknowledgment status in the browser's localStorage, using the `ACK_DISMISSED_KEY` constant as the key.

1. **Sanitization**: The script uses the `sanitizeHtml()` function to sanitize the announcements data before displaying it in the modals, to prevent potential security issues.

1. **Modal Management Integration**: The script assumes the existence of `openModalById()` and `closeModalById()` functions to handle the opening and closing of modals. If these functions are not available, the script will use its own methods to display and hide the modals.
