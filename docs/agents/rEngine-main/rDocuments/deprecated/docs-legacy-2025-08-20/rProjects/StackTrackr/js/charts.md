# Documentation: `charts.js`

## Purpose & Overview

The `charts.js` script provides a set of utility functions for generating and managing interactive data visualizations, specifically pie charts, within a web application. These functions allow developers to easily create customizable, responsive, and themable charts to display data in an engaging and informative manner.

## Technical Architecture

The `charts.js` script consists of several key components:

1. **Color Generation**: The `generateColors` function generates a color palette for the pie chart segments, ensuring a visually appealing and distinct set of colors.
2. **Theme-based Styling**: The `getChartBackgroundColor` and `getChartTextColor` functions provide a way to dynamically determine the appropriate background and text colors for the charts based on the current theme (light or dark) of the application.
3. **Pie Chart Creation**: The `createPieChart` function is responsible for creating and configuring a pie chart using the Chart.js library. It takes in the chart data, a canvas element, and a chart title, and returns a Chart.js instance.
4. **Chart Destruction**: The `destroyCharts` function is used to clean up and destroy any existing chart instances to prevent memory leaks.

The script utilizes the Chart.js library to handle the actual rendering and interactivity of the charts, while the custom functions in this script provide a layer of abstraction and convenience for the developers using the charts.

## Dependencies

The `charts.js` script has the following dependencies:

- **Chart.js**: A popular open-source library for creating highly customizable and interactive charts.
- **formatCurrency**: A custom function (not provided in the code snippet) that formats a numeric value as currency.

## Key Functions/Classes

### `generateColors(count)`

- **Purpose**: Generates a color palette for the pie chart segments.
- **Parameters**:
  - `count` (number): The number of colors needed.
- **Return Value**: An array of color strings.

### `getChartBackgroundColor()`

- **Purpose**: Determines the appropriate background color for the charts based on the current theme (light or dark) of the application.
- **Return Value**: A color string representing the background color.

### `getChartTextColor()`

- **Purpose**: Determines the appropriate text color for the charts based on the current theme (light or dark) of the application.
- **Return Value**: A color string representing the text color.

### `createPieChart(canvas, data, title)`

- **Purpose**: Creates a pie chart with the given data.
- **Parameters**:
  - `canvas` (HTMLCanvasElement): The canvas element to render the chart on.
  - `data` (Object): The chart data, with labels as keys and objects with `value`, `count`, and `weight` properties as values.
  - `title` (string): The chart title.
- **Return Value**: A Chart.js instance representing the created pie chart.

### `destroyCharts()`

- **Purpose**: Destroys all existing chart instances to prevent memory leaks.

## Usage Examples

To use the `charts.js` script, you would typically follow these steps:

1. Include the `charts.js` script in your HTML file, along with the required dependencies (Chart.js and the `formatCurrency` function).
2. Create a canvas element in your HTML where the chart will be rendered.
3. Prepare the chart data as an object, with labels as keys and objects with `value`, `count`, and `weight` properties as values.
4. Call the `createPieChart` function, passing in the canvas element, the chart data, and a chart title.
5. When your application is about to be unloaded or the chart is no longer needed, call the `destroyCharts` function to clean up the chart instances.

Example usage:

```html
<canvas id="myChart"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="charts.js"></script>
<script>
  const chartData = {
    'Category A': { value: 100, count: 20, weight: 5.2 },
    'Category B': { value: 75, count: 15, weight: 3.8 },
    'Category C': { value: 50, count: 10, weight: 2.5 },
    'Category D': { value: 25, count: 5, weight: 1.3 }
  };

  const myChart = createPieChart(document.getElementById('myChart'), chartData, 'My Pie Chart');

  // When the chart is no longer needed
  destroyCharts();
</script>
```

## Configuration

The `charts.js` script does not have any explicit configuration options or environment variables. However, the theme-based styling functions (`getChartBackgroundColor` and `getChartTextColor`) rely on the `data-theme` attribute of the `<html>` element to determine the current theme. You can set this attribute in your HTML to control the chart colors.

## Error Handling

The `charts.js` script does not include any explicit error handling mechanisms. Errors that may occur during the chart creation process (e.g., issues with the Chart.js library or the provided data) will be handled by the underlying Chart.js library and bubbled up to the application level.

## Integration

The `charts.js` script is designed to be a standalone utility that can be easily integrated into any web application that requires data visualization capabilities. It can be used in conjunction with various front-end frameworks or libraries, such as React, Angular, or Vue.js, as long as the necessary dependencies (Chart.js and the `formatCurrency` function) are available.

## Development Notes

- The `generateColors` function uses the golden ratio to distribute the colors evenly, which helps to create a visually appealing and distinct set of colors for the chart segments.
- The `createPieChart` function leverages the built-in functionality of the Chart.js library to create the pie chart, but adds additional customization options, such as theme-based styling and a more detailed tooltip.
- The `destroyCharts` function is important to call when the chart is no longer needed, as it helps to prevent memory leaks by cleaning up the chart instances.

Overall, the `charts.js` script provides a comprehensive and flexible solution for integrating data visualization capabilities into a web application, with a focus on ease of use, customization, and performance.
