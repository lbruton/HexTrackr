#!/bin/sh

# Install dependencies
npm install express cors

# Start the TimeSeries MCP server
node -e "
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
app.use(require('cors')());

const dataPath = '/data/timeseries.json';

// Initialize data file
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify({ series: [], events: [] }));
}

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
      <title>rEngine TimeSeries MCP</title>
      <script src='https://cdn.jsdelivr.net/npm/chart.js'></script>
    </head>
    <body>
      <h1>📊 rEngine TimeSeries MCP Server</h1>
      <h3>Context & Event Time Tracking</h3>
      <div>
        <button onclick='addEvent()'>Add Event</button>
        <button onclick='loadChart()'>Load Chart</button>
      </div>
      <canvas id='chart' width='800' height='400'></canvas>
      <div id='data'></div>
      <script>
        async function addEvent() {
          const event = prompt('Event description:');
          if (event) {
            await fetch('/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ event, timestamp: Date.now() })
            });
            loadChart();
          }
        }
        
        async function loadChart() {
          const response = await fetch('/data');
          const data = await response.json();
          document.getElementById('data').innerHTML = \`<pre>\${JSON.stringify(data, null, 2)}</pre>\`;
          
          const ctx = document.getElementById('chart').getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: data.events.map(e => new Date(e.timestamp).toLocaleTimeString()),
              datasets: [{
                label: 'Events',
                data: data.events.map((e, i) => i + 1),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              }]
            }
          });
        }
        
        loadChart();
      </script>
    </body>
    </html>
  \`);
});

app.post('/events', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    data.events.push({
      ...req.body,
      timestamp: Date.now(),
      id: Date.now().toString()
    });
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (error) {
    res.json({ series: [], events: [], error: error.message });
  }
});

app.listen(4051, '0.0.0.0', () => console.log('Time Series MCP ready on port 4051'));
"
