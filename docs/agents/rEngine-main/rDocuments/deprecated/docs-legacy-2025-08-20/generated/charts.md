# rEngine Core: Charts.js Documentation

## Purpose & Overview

The `charts.js` file in the `StackTrackr` project of the rEngine Core platform provides a set of utility functions for generating and managing chart visualizations. It primarily focuses on creating and configuring pie charts, which can be used to display data in a clear and visually appealing manner.

The main responsibilities of this file are:

1. Generating color palettes for chart segments.
2. Determining appropriate background and text colors for charts based on the current theme (light or dark).
3. Creating and initializing pie chart instances using the Chart.js library.
4. Providing a function to destroy existing chart instances to prevent memory leaks.

These utilities are designed to be integrated into the rEngine Core platform, allowing developers to easily incorporate data visualization capabilities into their applications.

## Key Functions/Classes

### `generateColors(count)`

This function generates a color palette for pie chart segments. It takes the number of colors needed as input and returns an array of color strings. If the requested number of colors exceeds the predefined set, it generates additional unique colors using the golden ratio.

### `getChartBackgroundColor()`

This function returns the appropriate background color for charts based on the current theme (light or dark) of the application.

### `getChartTextColor()`

This function returns the appropriate text color for charts based on the current theme (light or dark) of the application.

### `createPieChart(canvas, data, title)`

This function creates a pie chart with the given data and renders it on the provided canvas element. It takes the following parameters:

- `canvas`: The HTML `<canvas>` element where the chart will be rendered.
- `data`: An object containing the chart data, with labels as keys and objects with `value` and `count` properties as values.
- `title`: The title of the chart.

The function returns the created Chart.js instance.

### `destroyCharts()`

This function destroys all existing chart instances to prevent memory leaks.

## Dependencies

The `charts.js` file primarily depends on the following:

1. **Chart.js**: A popular open-source library for creating data visualizations in HTML5 canvas.
2. **Utility functions**: It utilizes the `formatCurrency` function, which is likely defined elsewhere in the codebase.

## Usage Examples

To use the chart utilities provided in `charts.js`, you can follow these steps:

1. Ensure that you have a `<canvas>` element in your HTML where the chart will be rendered.
2. Import the `charts.js` file into your JavaScript code.
3. Call the `createPieChart` function, passing in the canvas element, chart data, and a title:

```javascript
import { createPieChart } from './charts.js';

const chartData = {
  'Category A': { value: 100, count: 10, weight: 5.25 },
  'Category B': { value: 80, count: 8, weight: 4.50 },
  'Category C': { value: 60, count: 6, weight: 3.75 },
};

const chartCanvas = document.getElementById('myChart');
const chart = createPieChart(chartCanvas, chartData, 'My Pie Chart');
```

1. When you need to clean up the chart instances, call the `destroyCharts` function:

```javascript
import { destroyCharts } from './charts.js';

// Destroy all chart instances
destroyCharts();
```

## Configuration

The `charts.js` file does not require any explicit configuration. It relies on the current theme (light or dark) of the application, which is determined by the `data-theme` attribute on the `<html>` element.

## Integration Points

The `charts.js` file is designed to be integrated into the rEngine Core platform, providing data visualization capabilities to various components and applications. It can be used in conjunction with other rEngine Core modules, such as data management and user interface components, to create a cohesive and interactive user experience.

## Troubleshooting

## Issue: Chart not rendering correctly

- Ensure that the `<canvas>` element has a valid reference and is correctly sized.
- Check the chart data structure and make sure it matches the expected format.
- Verify that the necessary dependencies (Chart.js) are properly imported and initialized.

## Issue: Memory leaks

- Make sure to call the `destroyCharts` function when the chart instances are no longer needed, such as when the application is being unloaded or the user navigates away from the chart view.

## Issue: Incorrect colors or theming

- Ensure that the `data-theme` attribute on the `<html>` element is correctly set to either "light" or "dark".
- Verify that the `getChartBackgroundColor` and `getChartTextColor` functions are returning the appropriate values based on the current theme.

If you encounter any other issues or have questions about the integration of the `charts.js` file within the rEngine Core platform, please consult the project documentation or reach out to the rEngine Core development team for assistance.
