#!/bin/sh

# Install dependencies
npm install -g @modelcontextprotocol/server-playwright
npm install playwright express cors

# Start the Playwright MCP server
node -e "
const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

let browser = null;
let context = null;

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head><title>rEngine Playwright MCP</title></head>
    <body>
      <h1>🎭 rEngine Playwright MCP Server</h1>
      <h3>Browser Automation & HTML/JS Testing</h3>
      <div>
        <h4>Test HTML/JS:</h4>
        <textarea id='htmlCode' rows='10' cols='80' placeholder='Enter HTML/JS code...'></textarea><br>
        <button onclick='testHTML()'>Test in Browser</button>
      </div>
      <div>
        <h4>Automate Website:</h4>
        <input id='urlInput' placeholder='https://example.com' style='width: 300px;'>
        <button onclick='automateURL()'>Open & Automate</button>
      </div>
      <h3>Results:</h3>
      <div id='results' style='border: 1px solid #ccc; padding: 10px; min-height: 200px;'></div>
      <script>
        async function testHTML() {
          const code = document.getElementById('htmlCode').value;
          const response = await fetch('/test-html', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: code })
          });
          const result = await response.json();
          document.getElementById('results').innerHTML = \`<pre>\${JSON.stringify(result, null, 2)}</pre>\`;
        }
        
        async function automateURL() {
          const url = document.getElementById('urlInput').value;
          const response = await fetch('/automate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          });
          const result = await response.json();
          document.getElementById('results').innerHTML = \`<pre>\${JSON.stringify(result, null, 2)}</pre>\`;
        }
      </script>
    </body>
    </html>
  \`);
});

app.post('/test-html', async (req, res) => {
  try {
    if (!browser) {
      browser = await chromium.launch();
      context = await browser.newContext();
    }
    
    const page = await context.newPage();
    await page.setContent(req.body.html);
    
    const title = await page.title();
    const content = await page.content();
    const errors = [];
    
    page.on('pageerror', error => errors.push(error.message));
    
    await page.waitForTimeout(1000);
    
    const screenshot = await page.screenshot({ type: 'png', encoding: 'base64' });
    
    await page.close();
    
    res.json({
      success: true,
      title,
      contentLength: content.length,
      errors,
      screenshot: \`data:image/png;base64,\${screenshot}\`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/automate', async (req, res) => {
  try {
    if (!browser) {
      browser = await chromium.launch();
      context = await browser.newContext();
    }
    
    const page = await context.newPage();
    await page.goto(req.body.url);
    
    const title = await page.title();
    const url = page.url();
    const screenshot = await page.screenshot({ type: 'png', encoding: 'base64' });
    
    await page.close();
    
    res.json({
      success: true,
      title,
      url,
      screenshot: \`data:image/png;base64,\${screenshot}\`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

process.on('SIGINT', async () => {
  if (browser) await browser.close();
  process.exit();
});

app.listen(4050, '0.0.0.0', () => console.log('Playwright MCP ready on port 4050'));
"
