#!/bin/sh

# Install dependencies
npm install express cors sqlite3 chart.js

# Start the usage tracker server
node -e "
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(require('cors')());

// Initialize database
const db = new sqlite3.Database('/logs/api-usage.db');

db.serialize(() => {
  db.run(\`CREATE TABLE IF NOT EXISTS api_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    provider TEXT NOT NULL,
    model TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    cost_usd REAL,
    response_time_ms INTEGER,
    user_ip TEXT,
    success BOOLEAN
  )\`);
});

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
      <title>📊 rEngine API Usage Dashboard</title>
      <script src='https://cdn.jsdelivr.net/npm/chart.js'></script>
      <style>
        body { font-family: 'SF Pro Text', -apple-system, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .metric { text-align: center; }
        .metric-value { font-size: 2.5em; font-weight: bold; color: #2196f3; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9em; }
        .chart-container { position: relative; height: 300px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; font-weight: 600; }
        .success { color: #4caf50; }
        .error { color: #f44336; }
      </style>
    </head>
    <body>
      <div class='container'>
        <div class='header'>
          <h1>📊 API Usage Dashboard</h1>
          <p>Monitor costs, track usage patterns, and optimize your LLM API consumption</p>
        </div>
        
        <div class='grid'>
          <div class='card metric'>
            <div class='metric-value' id='totalRequests'>-</div>
            <div class='metric-label'>Total Requests</div>
          </div>
          <div class='card metric'>
            <div class='metric-value' id='totalCost'>-</div>
            <div class='metric-label'>Total Cost (USD)</div>
          </div>
          <div class='card metric'>
            <div class='metric-value' id='avgResponseTime'>-</div>
            <div class='metric-label'>Avg Response Time (ms)</div>
          </div>
          <div class='card metric'>
            <div class='metric-value' id='successRate'>-</div>
            <div class='metric-label'>Success Rate (%)</div>
          </div>
        </div>
        
        <div class='card'>
          <h3>📈 Usage Over Time</h3>
          <div class='chart-container'>
            <canvas id='usageChart'></canvas>
          </div>
        </div>
        
        <div class='card'>
          <h3>🔍 Recent API Calls</h3>
          <table id='recentCalls'>
            <thead>
              <tr>
                <th>Time</th>
                <th>Provider</th>
                <th>Model</th>
                <th>Tokens</th>
                <th>Cost</th>
                <th>Time (ms)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      
      <script>
        async function loadDashboard() {
          try {
            const [metrics, usage, recent] = await Promise.all([
              fetch('/metrics').then(r => r.json()),
              fetch('/usage-over-time').then(r => r.json()),
              fetch('/recent-calls').then(r => r.json())
            ]);
            
            // Update metrics
            document.getElementById('totalRequests').textContent = metrics.totalRequests || 0;
            document.getElementById('totalCost').textContent = '$' + (metrics.totalCost || 0).toFixed(2);
            document.getElementById('avgResponseTime').textContent = Math.round(metrics.avgResponseTime || 0);
            document.getElementById('successRate').textContent = Math.round((metrics.successRate || 0) * 100);
            
            // Update chart
            const ctx = document.getElementById('usageChart').getContext('2d');
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: usage.map(u => new Date(u.hour).toLocaleTimeString()),
                datasets: [{
                  label: 'API Calls',
                  data: usage.map(u => u.count),
                  borderColor: '#2196f3',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  tension: 0.4
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true }
                }
              }
            });
            
            // Update recent calls table
            const tbody = document.querySelector('#recentCalls tbody');
            tbody.innerHTML = recent.map(call => \`
              <tr>
                <td>\${new Date(call.timestamp).toLocaleTimeString()}</td>
                <td>\${call.provider}</td>
                <td>\${call.model || '-'}</td>
                <td>\${call.total_tokens || '-'}</td>
                <td>$\${(call.cost_usd || 0).toFixed(4)}</td>
                <td>\${call.response_time_ms || '-'}</td>
                <td class='\${call.success ? 'success' : 'error'}'>
                  \${call.success ? '✅' : '❌'}
                </td>
              </tr>
            \`).join('');
            
          } catch (error) {
            console.error('Failed to load dashboard:', error);
          }
        }
        
        // Load data every 30 seconds
        loadDashboard();
        setInterval(loadDashboard, 30000);
      </script>
    </body>
    </html>
  \`);
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  db.all(\`
    SELECT 
      COUNT(*) as totalRequests,
      SUM(cost_usd) as totalCost,
      AVG(response_time_ms) as avgResponseTime,
      AVG(CAST(success as FLOAT)) as successRate
    FROM api_usage
    WHERE timestamp > datetime('now', '-24 hours')
  \`, (err, rows) => {
    if (err) {
      res.json({ error: err.message });
    } else {
      res.json(rows[0] || {});
    }
  });
});

// Usage over time endpoint
app.get('/usage-over-time', (req, res) => {
  db.all(\`
    SELECT 
      strftime('%Y-%m-%d %H:00:00', timestamp) as hour,
      COUNT(*) as count
    FROM api_usage
    WHERE timestamp > datetime('now', '-24 hours')
    GROUP BY hour
    ORDER BY hour
  \`, (err, rows) => {
    if (err) {
      res.json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Recent calls endpoint
app.get('/recent-calls', (req, res) => {
  db.all(\`
    SELECT * FROM api_usage
    ORDER BY timestamp DESC
    LIMIT 50
  \`, (err, rows) => {
    if (err) {
      res.json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Log API usage endpoint (called by LLM gateway)
app.post('/log', (req, res) => {
  const {
    provider, model, prompt_tokens, completion_tokens, total_tokens,
    cost_usd, response_time_ms, user_ip, success
  } = req.body;
  
  db.run(\`
    INSERT INTO api_usage (
      provider, model, prompt_tokens, completion_tokens, total_tokens,
      cost_usd, response_time_ms, user_ip, success
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  \`, [provider, model, prompt_tokens, completion_tokens, total_tokens,
      cost_usd, response_time_ms, user_ip, success], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID });
    }
  });
});

app.listen(4054, '0.0.0.0', () => console.log('📊 Usage tracker ready on port 4054'));
"
