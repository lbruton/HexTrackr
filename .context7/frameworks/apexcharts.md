# ApexCharts Documentation Cache

**Source**: Context7 Library ID `/apexcharts/apexcharts.js`  
**Trust Score**: 7.2/10  
**Code Snippets**: 1989  
**Last Updated**: September 5, 2025

## Overview

ApexCharts is a modern charting library that helps create interactive charts and visualizations for web applications. It provides a wide variety of chart types with excellent customization options and responsive design.

## Key Topics

- Chart types and configurations
- Data series and formatting
- Interactive features and animations
- Styling and theming options
- Event handling and callbacks

## Installation and Setup

```html
<!-- CDN -->
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

<!-- NPM -->
npm install apexcharts
```

```javascript
import ApexCharts from 'apexcharts';
// or for CommonJS
const ApexCharts = require('apexcharts');
```

## Code Examples

### Basic Line Chart

```javascript
var options = {
  series: [{
    name: "Desktops",
    data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
  }],
  chart: {
    height: 350,
    type: 'line',
    zoom: {
      enabled: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'straight'
  },
  title: {
    text: 'Product Trends by Month',
    align: 'left'
  },
  grid: {
    row: {
      colors: ['#f3f3f3', 'transparent'],
      opacity: 0.5
    },
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  }
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();
```

### Area Chart with Multiple Series

```javascript
var options = {
  series: [{
    name: 'series1',
    data: [31, 40, 28, 51, 42, 109, 100]
  }, {
    name: 'series2',
    data: [11, 32, 45, 32, 34, 52, 41]
  }],
  chart: {
    height: 350,
    type: 'area'
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth'
  },
  xaxis: {
    type: 'datetime',
    categories: ["2018-09-19T00:00:00.000Z", "2018-09-19T01:30:00.000Z", "2018-09-19T02:30:00.000Z", "2018-09-19T03:30:00.000Z", "2018-09-19T04:30:00.000Z", "2018-09-19T05:30:00.000Z", "2018-09-19T06:30:00.000Z"]
  },
  tooltip: {
    x: {
      format: 'dd/MM/yy HH:mm'
    },
  },
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();
```

### Bar Chart with Data Labels

```javascript
var options = {
  series: [{
    data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
  }],
  chart: {
    type: 'bar',
    height: 350
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true,
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: ['South Korea', 'Canada', 'United Kingdom', 'Netherlands', 'Italy', 'France', 'Japan',
      'United States', 'China', 'Germany'
    ],
  }
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();
```

### Pie Chart with Custom Colors

```javascript
var options = {
  series: [44, 55, 13, 43, 22],
  chart: {
    width: 380,
    type: 'pie',
  },
  labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
  colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();
```

### Mixed Chart (Line + Column)

```javascript
var options = {
  series: [{
    name: 'Website Blog',
    type: 'column',
    data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160]
  }, {
    name: 'Social Media',
    type: 'line',
    data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16]
  }],
  chart: {
    height: 350,
    type: 'line',
  },
  stroke: {
    width: [0, 4]
  },
  title: {
    text: 'Traffic Sources'
  },
  dataLabels: {
    enabled: true,
    enabledOnSeries: [1]
  },
  labels: ['01 Jan 2001', '02 Jan 2001', '03 Jan 2001', '04 Jan 2001', '05 Jan 2001', '06 Jan 2001', '07 Jan 2001', '08 Jan 2001', '09 Jan 2001', '10 Jan 2001', '11 Jan 2001', '12 Jan 2001'],
  xaxis: {
    type: 'datetime'
  },
  yaxis: [{
    title: {
      text: 'Website Blog',
    },
  
  }, {
    opposite: true,
    title: {
      text: 'Social Media'
    }
  }]
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();
```

### Donut Chart with Gradient

```javascript
var options = {
  series: [44, 55, 41, 17, 15],
  chart: {
    type: 'donut',
    height: 350
  },
  labels: ['Apple', 'Mango', 'Orange', 'Watermelon', 'Banana'],
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: "horizontal",
      shadeIntensity: 0.5,
      gradientToColors: undefined,
      inverseColors: true,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 50, 100],
      colorStops: []
    }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%'
      }
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();
```

### Heatmap Chart

```javascript
function generateData(name, count) {
  var i = 0;
  var series = [];
  while (i < count) {
    var x = 'w' + (i + 1).toString();
    var y = Math.floor(Math.random() * (80 - 30 + 1)) + 30;

    series.push({
      x: x,
      y: y
    });
    i++;
  }
  return series;
}

var options = {
  series: [{
    name: 'Metric1',
    data: generateData('Metric1', 18)
  },
  {
    name: 'Metric2',
    data: generateData('Metric2', 18)
  },
  {
    name: 'Metric3',
    data: generateData('Metric3', 18)
  }],
  chart: {
    height: 350,
    type: 'heatmap',
  },
  dataLabels: {
    enabled: false
  },
  colors: ["#008FFB"],
  title: {
    text: 'HeatMap Chart (Single color)'
  },
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();
```

### Real-time Chart with WebSocket

```javascript
var options = {
  series: [{
    data: []
  }],
  chart: {
    id: 'realtime',
    height: 350,
    type: 'line',
    animations: {
      enabled: true,
      easing: 'linear',
      dynamicAnimation: {
        speed: 1000
      }
    },
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth'
  },
  title: {
    text: 'Dynamic Updating Chart',
    align: 'left'
  },
  markers: {
    size: 0
  },
  xaxis: {
    type: 'datetime',
    range: 777600000,
  },
  yaxis: {
    max: 100
  },
  legend: {
    show: false
  },
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();

function updateChart() {
  var x = new Date().getTime();
  var y = Math.floor(Math.random() * 100);
  
  ApexCharts.exec('realtime', 'appendData', [{
    data: [{
      x: x,
      y: y
    }]
  }]);
}

// Update chart every second
setInterval(updateChart, 1000);
```

## Chart Configuration Options

### Chart Types

- **Line Charts**: `type: 'line'`
- **Area Charts**: `type: 'area'`
- **Bar Charts**: `type: 'bar'`
- **Column Charts**: `type: 'column'`
- **Pie Charts**: `type: 'pie'`
- **Donut Charts**: `type: 'donut'`
- **Scatter Charts**: `type: 'scatter'`
- **Heatmap Charts**: `type: 'heatmap'`
- **Treemap Charts**: `type: 'treemap'`
- **Radar Charts**: `type: 'radar'`

### Common Configuration

```javascript
var options = {
  series: [...],
  chart: {
    type: 'line',
    height: 350,
    width: '100%',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    },
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true
      }
    }
  },
  title: {
    text: 'Chart Title',
    align: 'center',
    style: {
      fontSize: '16px',
      fontWeight: 'bold'
    }
  },
  colors: ['#008FFB', '#00E396', '#FEB019'],
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  grid: {
    show: true,
    borderColor: '#e7e7e7',
    strokeDashArray: 0
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'center'
  },
  tooltip: {
    enabled: true,
    shared: true,
    intersect: false
  }
};
```

## Events and Methods

### Chart Events

```javascript
var options = {
  // ... other options
  chart: {
    events: {
      click: function(event, chartContext, config) {
        console.log('Chart clicked');
      },
      dataPointSelection: function(event, chartContext, config) {
        console.log('Data point selected:', config.dataPointIndex);
      },
      legendClick: function(chartContext, seriesIndex, config) {
        console.log('Legend clicked:', seriesIndex);
      },
      markerClick: function(event, chartContext, { seriesIndex, dataPointIndex, config}) {
        console.log('Marker clicked:', seriesIndex, dataPointIndex);
      }
    }
  }
};
```

### Chart Methods

```javascript
// Update series data
chart.updateSeries([{
  data: [10, 20, 30, 40, 50]
}]);

// Update options
chart.updateOptions({
  xaxis: {
    categories: ['A', 'B', 'C', 'D', 'E']
  }
});

// Append data (for real-time charts)
chart.appendData([{
  data: [51]
}]);

// Destroy chart
chart.destroy();

// Zoom to specific range
chart.zoomX(new Date('2018-09-19').getTime(), new Date('2018-09-25').getTime());

// Export chart
chart.dataURI().then(({imgURI, blob}) => {
  // Download image
});
```

## Responsive Design

```javascript
var options = {
  // ... other options
  responsive: [{
    breakpoint: 1000,
    options: {
      plotOptions: {
        bar: {
          horizontal: false
        }
      },
      legend: {
        position: "bottom"
      }
    }
  }]
};
```

## Annotations

```javascript
var options = {
  // ... other options
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
        radius: 2
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
  }
};
```

## Best Practices

1. **Choose appropriate chart types** for your data
2. **Use responsive configuration** for mobile devices
3. **Implement proper error handling** for data loading
4. **Optimize performance** with data sampling for large datasets
5. **Use consistent color schemes** across charts
6. **Provide meaningful tooltips** and legends
7. **Test chart rendering** across different browsers

## Performance Tips

- Use `dataLabels: { enabled: false }` for large datasets
- Implement data sampling for time series with many points
- Use `animations: { enabled: false }` for faster rendering
- Consider lazy loading for multiple charts
- Optimize data structure to avoid unnecessary processing

## HexTrackr Integration

In HexTrackr, ApexCharts is used for:

- Vulnerability trend analysis
- Risk assessment dashboards
- Time-series data visualization
- Comparative analysis charts
- Interactive data exploration
