#!/bin/sh

# Install dependencies
npm install express cors marked fs-extra

# Start the project dashboard server
node -e "
const express = require('express');
const fs = require('fs-extra');
const marked = require('marked');
const path = require('path');

const app = express();
app.use(express.json());
app.use(require('cors')());

// Serve project dashboard
app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
      <title>rEngine Project Dashboard</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .header { background: #2196F3; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .project { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .active { border-left: 5px solid #4CAF50; }
        .status { font-weight: bold; padding: 5px 10px; border-radius: 20px; color: white; display: inline-block; }
        .status.active { background: #4CAF50; }
        .status.inactive { background: #f44336; }
        .status.development { background: #ff9800; }
        .memory-status { font-size: 12px; color: #666; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class='header'>
        <h1>🚀 rEngine Project Dashboard</h1>
        <p>Enhanced Docker Environment - All Systems</p>
      </div>
      <div class='dashboard' id='dashboard'></div>
      <script>
        const projects = [
          { name: 'Context7 MCP', port: 4049, status: 'active', description: 'Library context tracking' },
          { name: 'Memory MCP', port: 4041, status: 'active', description: 'Persistent session memory' },
          { name: 'GitHub MCP', port: 4042, status: 'active', description: 'Repository management' },
          { name: 'Playwright MCP', port: 4050, status: 'active', description: 'Browser automation' },
          { name: 'TimeSeries MCP', port: 4051, status: 'active', description: 'Context time tracking' }
        ];
        
        function updateDashboard() {
          const dashboard = document.getElementById('dashboard');
          dashboard.innerHTML = projects.map(project => \`
            <div class='project \${project.status}'>
              <h3>\${project.name}</h3>
              <p>\${project.description}</p>
              <div class='status \${project.status}'>\${project.status.toUpperCase()}</div>
              <div class='memory-status'>Port: \${project.port}</div>
            </div>
          \`).join('');
        }
        
        updateDashboard();
        setInterval(updateDashboard, 5000);
      </script>
    </body>
    </html>
  \`);
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(4046, '0.0.0.0', () => console.log('Project dashboard ready on port 4046'));
"
