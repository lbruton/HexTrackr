# Numista Modal Functionality

## Purpose & Overview

The `numista-modal.js` script provides a comprehensive solution for integrating an embedded Numista coin database viewer within a web application. It handles the display of a responsive modal window, loading the Numista coin page within an iframe, and adding navigation controls for seamless user experience.

The script is designed to address the challenge of displaying Numista content on sites that do not directly support the Numista iframe integration. It provides a fallback solution for the `file://` protocol by opening the Numista page in a popup window, and handles various user interactions and edge cases for a robust and accessible implementation.

## Technical Architecture

The script is structured around the following key components:

1. **Modal Management**: The `openNumistaModal()` and `closeNumistaModal()` functions handle the display and closure of the modal window, respectively. They interact with the necessary DOM elements to show/hide the modal and update its content.

1. **Navigation History**: The script maintains a history of visited Numista pages, tracked through the `numistaHistory` and `numistaCurrentIndex` variables. This allows for back/forward navigation within the modal, providing a familiar browsing experience.

1. **Responsive Handling**: The script checks the current protocol (`file://` vs. `http(s)://`) and adjusts its behavior accordingly. For `file://` protocol, it opens the Numista page in a popup window, while for `http(s)://` it uses the iframe-based modal.

1. **Error Handling**: The script listens for load and error events on the iframe, and provides a fallback solution to open the Numista page in a new tab if the iframe fails to load.

1. **Accessibility Features**: The script implements a focus trap within the modal, ensuring that keyboard users can navigate the modal without losing focus. It also handles the "Escape" key to close the modal.

1. **Event Listeners**: The script sets up various event listeners on the modal, navigation buttons, and the document to handle user interactions and update the UI accordingly.

## Dependencies

The `numista-modal.js` script does not have any external dependencies. It is a self-contained solution that can be integrated into a web application without requiring any additional libraries or frameworks.

## Key Functions/Classes

### `openNumistaModal(numistaId, coinName)`

- **Purpose**: Opens the Numista modal with the specified coin ID and coin name.
- **Parameters**:
  - `numistaId` (string): The Numista catalog ID for the coin.
  - `coinName` (string): The name of the coin to be displayed in the modal title.
- **Return Value**: None.
- **Description**: This function is responsible for setting up the Numista modal, loading the appropriate Numista page, and updating the navigation history. It handles the different protocols (`file://` and `http(s)://`) and provides fallback solutions when necessary.

### `closeNumistaModal()`

- **Purpose**: Closes the Numista modal and resets the iframe source/content.
- **Parameters**: None.
- **Return Value**: None.
- **Description**: This function is used to hide the Numista modal and clear the iframe content when the user wants to close the modal.

### `numistaGoBack()`

- **Purpose**: Navigates back in the Numista modal history (iframe mode only).
- **Parameters**: None.
- **Return Value**: None.
- **Description**: This function is responsible for updating the iframe source to the previous URL in the navigation history, effectively allowing the user to go back to the previous Numista page.

### `numistaGoForward()`

- **Purpose**: Navigates forward in the Numista modal history (iframe mode only).
- **Parameters**: None.
- **Return Value**: None.
- **Description**: This function is responsible for updating the iframe source to the next URL in the navigation history, effectively allowing the user to go forward to the next Numista page.

### `updateNavButtons()`

- **Purpose**: Updates the state and visibility of navigation buttons in the Numista modal.
- **Parameters**: None.
- **Return Value**: None.
- **Description**: This function is responsible for managing the display and enabled/disabled state of the back and forward navigation buttons based on the current position in the navigation history.

### `trapFocus(element)`

- **Purpose**: Traps focus within the given modal element for accessibility.
- **Parameters**:
  - `element` (HTMLElement): The modal element to trap focus in.
- **Return Value**: None.
- **Description**: This function is responsible for ensuring that keyboard users can navigate within the modal without losing focus. It sets the initial focus on the first focusable element and traps the focus between the first and last focusable elements.

## Usage Examples

To use the Numista modal functionality, you need to have the following HTML structure in your web application:

```html
<div id="numistaModal" class="numista-modal">
  <div class="numista-modal-content">
    <div class="numista-modal-header">
      <h2 id="numistaModalTitle"></h2>
      <button id="numistaCloseBtn" class="numista-close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="numista-modal-body">
      <iframe id="numistaIframe" frameborder="0"></iframe>
    </div>
    <div class="numista-modal-footer">
      <button id="numistaBackBtn" class="numista-nav-btn" disabled>
        <i class="fas fa-chevron-left"></i> Back
      </button>
      <button id="numistaForwardBtn" class="numista-nav-btn" disabled>
        Forward <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</div>
```

To open the Numista modal, call the `openNumistaModal()` function with the appropriate parameters:

```javascript
openNumistaModal('12345', 'Silver Coin');
```

This will open the Numista modal and load the coin page with the ID `12345` and the title "Silver Coin".

## Configuration

The `numista-modal.js` script does not require any specific configuration options or environment variables. It is designed to work out-of-the-box with the provided HTML structure and can be integrated into a web application without additional setup.

## Error Handling

The script handles potential errors in the following ways:

1. **Iframe Load Failure**: If the iframe fails to load the Numista page, the script displays a fallback message with a link to open the Numista page in a new tab.
2. **Missing Modal Elements**: If any of the required modal elements (modal, iframe, or title) are not found, the script logs an error message to the console and exits.
3. **Popup Blockers**: If the script detects the `file://` protocol and the popup window is blocked, it displays an alert message instructing the user to allow popups or manually visit the Numista page.

## Integration

The `numista-modal.js` script is designed to be a self-contained solution that can be easily integrated into a web application. It does not have any external dependencies and can be included in the project's JavaScript files or loaded as a separate script.

To integrate the Numista modal functionality, you need to:

1. Include the `numista-modal.js` script in your HTML file, either by linking to it or embedding the code directly.
2. Ensure that the required HTML structure for the modal is present in your application.
3. Call the `openNumistaModal()` function when you want to display the Numista modal, passing the appropriate `numistaId` and `coinName` parameters.

The script will handle the rest of the functionality, including navigation, error handling, and accessibility features.

## Development Notes

1. **Responsive Design**: The script assumes that the modal will be responsive and adapts its behavior accordingly. It does not include any specific CSS for the modal, as that should be handled by the hosting application.
2. **Accessibility**: The script places a strong emphasis on accessibility, implementing a focus trap and handling keyboard navigation. This ensures that the Numista modal is usable by users who rely on keyboard input.
3. **Fallback for `file://` Protocol**: The script provides a fallback solution for the `file://` protocol by opening the Numista page in a popup window. This is necessary because popup windows do not support the same level of history and navigation as the iframe-based modal.
4. **Iframe Monitoring**: The script listens for load and error events on the iframe to ensure that the Numista page is loaded successfully. If the iframe fails to load, it provides a fallback solution to open the Numista page in a new tab.
5. **Navigation History Management**: The script maintains a history of visited Numista pages, allowing users to navigate back and forth between them. This history is managed separately for the `file://` and `http(s)://` protocols due to their different capabilities.
6. **Flexible Integration**: The script is designed to be easily integrated into a web application without requiring any specific framework or library. It can be included and used as a standalone solution.
