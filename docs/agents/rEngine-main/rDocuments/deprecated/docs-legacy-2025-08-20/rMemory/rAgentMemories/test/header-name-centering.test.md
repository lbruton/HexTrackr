# `header-name-centering.test.js` Documentation

## Purpose & Overview

This script is a test suite that verifies the centering of the "Name" header in an inventory table across different viewport widths. It uses Puppeteer, a Node.js library for automating web browsers, to interact with a web page and ensure that the header icon and text are properly aligned.

The purpose of this script is to ensure that the "Name" header in the inventory table maintains a consistent and visually appealing layout, regardless of the user's screen size or device. This is an important aspect of responsive design and accessibility, as it helps to provide a seamless and user-friendly experience for all users.

## Technical Architecture

The script uses the following key components:

1. **Puppeteer**: A Node.js library for automating web browsers. It is used to launch a headless Chrome browser instance, navigate to the test page, and interact with the DOM to perform the centering verification.
2. **Assertion Library**: The script uses the built-in `assert` module to perform assertions and ensure that the header centering is within the expected tolerance.

The script follows this data flow:

1. The script launches a new Puppeteer browser instance.
2. It creates a new page within the browser.
3. For each of the specified viewport widths (375px, 768px, and 1024px), the script:
   - Sets the viewport size of the page.
   - Navigates to the test page (`index.html`).
   - Evaluates JavaScript code within the page context to calculate the difference between the center of the header icon and the center of the header text.
   - Logs the calculated difference and asserts that it is less than 1 pixel.
1. After testing all widths, the script closes the browser instance.

## Dependencies

The script has the following dependencies:

- `puppeteer`: A Node.js library for automating web browsers.
- `assert`: A built-in Node.js module for writing assertions.

## Key Functions/Classes

The script does not define any custom functions or classes. It uses the Puppeteer API and the built-in `assert` module to perform the centering verification.

## Usage Examples

To run the `header-name-centering.test.js` script, you can use the following command:

```
node header-name-centering.test.js
```

This will launch a headless Chrome browser instance, navigate to the `index.html` file, and perform the centering verification across the specified viewport widths. The script will log the calculated center difference for each width and assert that the difference is less than 1 pixel.

## Configuration

The script does not require any external configuration. The viewport widths to be tested are hardcoded in the script as an array: `[375, 768, 1024]`.

## Error Handling

The script uses the built-in `assert` module to handle errors. If the centering difference for any of the tested widths exceeds the 1-pixel tolerance, the script will throw an `AssertionError` with a descriptive error message.

## Integration

This script is likely part of a larger testing suite or continuous integration (CI) pipeline. It ensures that the "Name" header in the inventory table maintains a consistent and visually appealing layout across different viewport sizes, which is an important aspect of the application's responsive design and accessibility.

## Development Notes

The script uses Puppeteer's `page.evaluate()` method to execute JavaScript code within the context of the test page. This allows the script to interact with the DOM and perform the necessary calculations to verify the header centering.

The script also uses the `--no-sandbox` argument when launching the Puppeteer browser instance. This is a workaround for a known issue with Puppeteer on some systems, where the default sandbox mode may cause compatibility problems.
