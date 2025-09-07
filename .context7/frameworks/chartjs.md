# Chart.js Documentation Cache

**Source**: Context7 Library ID `/chartjs/chart.js`  
**Trust Score**: 7.5/10  
**Code Snippets**: 529  
**Last Updated**: September 5, 2025

## Overview

Chart.js is a simple yet flexible JavaScript charting library for designers and developers, enabling the creation of various chart types.

## Key Topics

- Chart configuration and setup
- Data visualization patterns
- Line charts and animations
- Dataset manipulation
- Responsive design options

## Code Examples

### Basic Line Chart Setup and Configuration

```javascript
// <block:setup:1>
const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [{
    label: 'My First Dataset',
    data: [65, 59, 80, 81, 56, 55, 40],
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

### Chart.js Data Configuration

Defines the data structure for a Chart.js chart, including labels and datasets with specific background colors for each data point.

```javascript
const data = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [{
    label: '# of Votes',
    data: [12, 19, 3, 5, 2, 3],
    borderWidth: 1,
    backgroundColor: ['#CB4335', '#1F618D', '#F1C40F', '#27AE60', '#884EA0', '#D35400'],
  }]
};
```

### Dynamic Data Manipulation

Demonstrates how to dynamically manage Chart.js data and configurations with functions for randomizing data, adding/removing datasets, and adding/removing data points.

```javascript
// <block:actions:2>
const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = Utils.numbers({count: chart.data.labels.length, min: -100, max: 100});
      });
      chart.update();
    }
  },
  {
    name: 'Add Dataset',
    handler(chart) {
      const data = chart.data;
      const dsColor = Utils.namedColor(chart.data.datasets.length);
      const newDataset = {
        label: 'Dataset ' + (data.datasets.length + 1),
        backgroundColor: Utils.transparentize(dsColor, 0.5),
        borderColor: dsColor,
        data: Utils.numbers({count: data.labels.length, min: -100, max: 100}),
      };
      chart.data.datasets.push(newDataset);
      chart.update();
    }
  },
  {
    name: 'Add Data',
    handler(chart) {
      const data = chart.data;
      if (data.datasets.length > 0) {
        data.labels = Utils.months({count: data.labels.length + 1});

        for (let index = 0; index < data.datasets.length; ++index) {
          data.datasets[index].data.push(Utils.rand(-100, 100));
        }

        chart.update();
      }
    }
  },
  {
    name: 'Remove Dataset',
    handler(chart) {
      chart.data.datasets.pop();
      chart.update();
    }
  },
  {
    name: 'Remove Data',
    handler(chart) {
      chart.data.labels.splice(-1, 1); // remove the label first

      chart.data.datasets.forEach(dataset => {
        dataset.data.pop();
      });

      chart.update();
    }
  }
];
```

### Stacked Bar/Line Chart Configuration

Sets up the data and configuration for a stacked bar/line chart using Chart.js.

```javascript
// <block:setup:1>
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
      stack: 'combined',
      type: 'bar'
    },
    {
      label: 'Dataset 2',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
      stack: 'combined'
    }
  ]
};

// <block:config:0>
const config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Stacked Line/Bar Chart'
      }
    },
    scales: {
      y: {
        stacked: true
      }
    }
  },
};
```

### Configure Dataset Parsing

Demonstrates how to configure the `parsing` option for Chart.js datasets using JavaScript. This allows specifying which keys in your data objects map to the chart's axes.

```javascript
const data = [{x: 'Jan', net: 100, cogs: 50, gm: 50}, {x: 'Feb', net: 120, cogs: 55, gm: 75}];
const cfg = {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb'],
    datasets: [{
      label: 'Net sales',
      data: data,
      parsing: {
        yAxisKey: 'net'
      }
    }, {
      label: 'Cost of goods sold',
      data: data,
      parsing: {
        yAxisKey: 'cogs'
      }
    }, {
      label: 'Gross margin',
      data: data,
      parsing: {
        yAxisKey: 'gm'
      }
    }]
  },
};
```

### Line Chart with Annotations

Defines the configuration object for an ApexCharts line chart including annotations for yaxis, xaxis, and points.

```javascript
var options = {
  series: [{
    data: series.monthDataSeries1.prices
  }],
  chart: {
    height: 350,
    type: 'line',
    id: 'areachart-2'
  },
  annotations: {
    yaxis: [{
      y: 8200,
      borderColor: '#00E396',
      label: {
        borderColor: '#00E396',
        style: {
          color: '#fff',
          background: '#00E396'
        },
        text: 'Support'
      }
    }],
    xaxis: [{
      x: new Date('23 Nov 2017').getTime(),
      strokeDashArray: 0,
      borderColor: '#775DD0',
      label: {
        borderColor: '#775DD0',
        style: {
          color: '#fff',
          background: '#775DD0'
        },
        text: 'Anno Test'
      }
    }],
    points: [{
      x: new Date('01 Dec 2017').getTime(),
      y: 8607.55,
      marker: {
        size: 8,
        fillColor: '#fff',
        strokeColor: 'red',
        radius: 2,
        cssClass: 'apexcharts-custom-class'
      },
      label: {
        borderColor: '#FF4560',
        offsetY: 0,
        style: {
          color: '#fff',
          background: '#FF4560'
        },
        text: 'Point Annotation'
      }
    }]
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'straight'
  },
  grid: {
    padding: {
      right: 30,
      left: 20
    }
  },
  title: {
    text: 'Line with Annotations',
    align: 'left'
  },
  labels: series.monthDataSeries1.dates,
  xaxis: {
    type: 'datetime'
  }
};
```

## Chart Types

### Line Charts

Line charts are commonly used to plot data points on a line, often to show trend data and compare two sets of data.

## Key Properties

- `type: 'line'`
- `data.datasets[].borderColor` - Line color
- `data.datasets[].backgroundColor` - Fill color
- `data.datasets[].tension` - Line curve (0 = straight, 0.4 = curved)

### Bar Charts

Horizontal bar charts inherit most options from standard bar charts, with x-axis configurations mapping to the y-axis.

## Key Configuration

- `indexAxis: 'y'` - Renders bars horizontally
- `scales.y.stacked: true` - Enable stacking

## Configuration Options

### Axis Common Configuration

Common properties that can be configured for any axis in Chart.js:

- `type: string` - Type of scale being employed
- `display: boolean|string` - Controls axis visibility
- `min/max: number` - User defined minimum/maximum values
- `reverse: boolean` - Reverse the scale
- `stacked: boolean|string` - Enable data stacking
- `grid: object` - Grid line configuration
- `ticks: object` - Tick configuration

### Responsive Configuration

Chart.js provides responsive design options:

```javascript
const config = {
  type: 'line',
  data: data,
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Line Chart'
      }
    }
  },
};
```

## Best Practices

1. **Data Structure**: Use consistent data structures across datasets
2. **Color Management**: Use color utilities for consistent theming
3. **Performance**: Use `chart.update()` for dynamic data changes
4. **Responsive Design**: Always enable responsive options
5. **Accessibility**: Provide meaningful labels and titles

## Common Patterns

- **Dynamic Updates**: Use actions array for interactive chart controls
- **Color Utilities**: Leverage `Utils.transparentize()` for alpha transparency
- **Data Generation**: Use utility functions for sample data
- **Animation**: Configure animations for smooth transitions
- **Parsing**: Use parsing options for flexible data structures
