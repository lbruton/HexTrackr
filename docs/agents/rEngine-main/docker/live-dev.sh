#!/bin/sh

# Install dependencies
npm install express cors chokidar ws

# Start the live development server
node -e "
const express = require('express');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(require('cors')());

// WebSocket server for live updates
const wss = new WebSocket.Server({ port: 8080 });

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
      <title>🔄 Live Development Server</title>
      <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #00ff00; }
        .log { background: #000; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .connected { color: #00ff00; }
        .disconnected { color: #ff0000; }
      </style>
    </head>
    <body>
      <h1>🔄 Live Development Server</h1>
      <div id='status' class='disconnected'>Disconnected</div>
      <div class='log' id='log'></div>
      <script>
        const ws = new WebSocket('ws://localhost:8080');
        const log = document.getElementById('log');
        const status = document.getElementById('status');
        
        ws.onopen = () => {
          status.textContent = 'Connected';
          status.className = 'connected';
        };
        
        ws.onclose = () => {
          status.textContent = 'Disconnected';
          status.className = 'disconnected';
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          log.innerHTML += \`<div>[\${new Date().toLocaleTimeString()}] \${data.message}</div>\`;
          log.scrollTop = log.scrollHeight;
        };
      </script>
    </body>
    </html>
  \`);
});

// File watcher
const watcher = chokidar.watch('/workspace', {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

watcher.on('change', (filePath) => {
  const message = { type: 'file_change', file: filePath, timestamp: new Date().toISOString() };
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message: \`File changed: \${filePath}\` }));
    }
  });
});

app.listen(4044, '0.0.0.0', () => console.log('Live dev server ready on port 4044'));
"
