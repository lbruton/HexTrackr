# rEngine Core - Numista Modal Functionality

## Purpose & Overview

The `numista-modal.js` file in the `StackTrackr` project of the `rProjects` directory provides the functionality for an embedded iframe modal that allows users to view Numista coin database pages. This feature is part of the "Intelligent Development Wrapper" platform, rEngine Core, and is designed to enhance the user experience when exploring coin information.

The modal supports navigation controls (back/forward), responsive display, and accessibility features such as focus trapping. It handles different protocols (file:// and HTTP/HTTPS) to provide the best possible user experience.

## Key Functions/Classes

The main components and their roles in the `numista-modal.js` file are:

1. **`openNumistaModal(numistaId, coinName)`**: This function is responsible for opening the Numista modal. It checks the current protocol, and if it's `file://`, it opens the Numista page in a popup window. Otherwise, it uses an iframe modal to display the Numista page. It also updates the navigation history, sets the iframe source and title, and traps the focus within the modal for accessibility.

1. **`closeNumistaModal()`**: This function is used to close the Numista modal and reset the iframe source and content.

1. **`numistaGoBack()`** and **`numistaGoForward()`**: These functions handle the navigation controls in the iframe modal, allowing the user to go back and forward in the navigation history.

1. **`updateNavButtons()`**: This function updates the state and visibility of the navigation buttons based on the current position in the navigation history and the active protocol.

1. **`trapFocus(element)`**: This function traps the focus within the given modal element to ensure keyboard accessibility.

## Dependencies

The `numista-modal.js` file does not have any external dependencies. It relies on the DOM elements with specific IDs (`numistaModal`, `numistaIframe`, `numistaModalTitle`, `numistaBackBtn`, `numistaForwardBtn`, `numistaCloseBtn`) to be present in the HTML structure.

## Usage Examples

To use the Numista modal functionality, you would typically call the `openNumistaModal(numistaId, coinName)` function when the user wants to view a specific coin's information from the Numista database. For example:

```javascript
// Assuming you have the necessary Numista ID and coin name
const numistaId = '123456';
const coinName = 'Silver Coin';

openNumistaModal(numistaId, coinName);
```

This will open the Numista modal and display the page for the specified coin.

## Configuration

The `numista-modal.js` file does not require any specific configuration. It uses the standard DOM elements and events to function correctly.

## Integration Points

The `numista-modal.js` file is part of the `StackTrackr` project within the `rProjects` directory of the rEngine Core platform. It integrates with the overall user interface and functionality of the rEngine Core application, providing a seamless experience for users to explore Numista coin information.

## Troubleshooting

1. **Popup Blocked**: If the user is running the application in `file://` protocol and the popup is blocked by the browser, the script will show an alert with instructions to manually visit the Numista page.

1. **Iframe Loading Issues**: If the iframe fails to load the Numista page, the script will display a fallback message with a link to open the page in a new tab.

1. **Missing DOM Elements**: If the necessary DOM elements (`numistaModal`, `numistaIframe`, `numistaModalTitle`, `numistaBackBtn`, `numistaForwardBtn`, `numistaCloseBtn`) are not present in the HTML structure, the script will log an error and not function correctly.

In case of any issues, the developer should ensure that the required DOM elements are present and that the user's browser settings allow for popups and iframe loading from the Numista website.
