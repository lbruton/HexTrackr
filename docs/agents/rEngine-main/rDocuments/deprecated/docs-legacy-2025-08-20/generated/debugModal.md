# rEngine Core: `debugModal.js` Documentation

## Purpose & Overview

The `debugModal.js` file is a part of the rEngine Core ecosystem and provides functionality for displaying a debug modal window within the application. This modal allows developers to view the debug history, which can be useful for troubleshooting and debugging purposes.

## Key Functions/Classes

The file defines two main functions:

1. `showDebugModal()`:
   - This function is responsible for displaying the debug modal.
   - It first retrieves the necessary DOM elements (the modal itself and its content area).
   - If the `window.getDebugHistory()` function is available, it populates the modal content with the debug history.
   - It then opens the modal using either the `window.openModalById()` function or by directly setting the modal's display style.
   - When the modal is open, the body's overflow is set to `'hidden'` to prevent scrolling.

1. `hideDebugModal()`:
   - This function is responsible for hiding the debug modal.
   - It first checks if the `window.closeModalById()` function is available and uses it to close the modal.
   - If the function is not available, it directly sets the modal's display style to `'none'`.
   - It then attempts to reset the body's overflow style.

Both of these functions are added to the global `window` object, allowing them to be called from other parts of the application.

## Dependencies

The `debugModal.js` file depends on the following:

1. **DOM manipulation**: The file uses standard DOM manipulation techniques to interact with the modal and its content.
2. **Modal management**: The file assumes the presence of `window.openModalById()` and `window.closeModalById()` functions, which are likely provided by other components or utilities within the rEngine Core ecosystem.
3. **Debug history**: The file expects the `window.getDebugHistory()` function to be available, which is responsible for retrieving the debug history data.

## Usage Examples

To use the debug modal functionality, you can call the exposed functions as follows:

```javascript
// Show the debug modal
window.showDebugModal();

// Hide the debug modal
window.hideDebugModal();
```

## Configuration

The `debugModal.js` file does not require any specific configuration. It assumes the presence of the necessary DOM elements (`'debugModal'` and `'debugModalContent'`) and the availability of the required functions (`window.getDebugHistory()`, `window.openModalById()`, and `window.closeModalById()`).

## Integration Points

The `debugModal.js` file is intended to be used within the rEngine Core ecosystem, where it can be integrated with other components or utilities that handle the overall application's modal management and debug history functionality.

## Troubleshooting

## Issue: Debug modal not displaying

- Ensure that the necessary DOM elements (`'debugModal'` and `'debugModalContent'`) are present in the application's HTML structure.
- Verify that the `window.getDebugHistory()` function is correctly implemented and returns the expected debug history data.
- Check if the `window.openModalById()` and `window.closeModalById()` functions are correctly defined and functioning as expected.

## Issue: Debug modal not closing

- Ensure that the `window.closeModalById()` function is correctly implemented and can properly close the modal.
- If the `window.closeModalById()` function is not available, verify that the fallback logic in the `hideDebugModal()` function is working as expected.
- Check for any event listeners or other code that might be preventing the modal from closing.

## Issue: Body overflow not restored

- The `hideDebugModal()` function attempts to reset the body's overflow style, but it may fail in certain scenarios.
- Ensure that the body's overflow is correctly managed throughout the application, and consider adding additional error handling or fallback logic to the `hideDebugModal()` function.

If you encounter any other issues or have further questions, please consult the rEngine Core documentation or reach out to the development team for assistance.
