#!/bin/sh

# Install dependencies
apk add --no-cache python3 py3-pip
npm install express cors

# Start the code executor server
node -e "
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(require('cors')());

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head><title>rEngine Code Executor</title></head>
    <body>
      <h1>🚀 rEngine Code Executor</h1>
      <textarea id='code' rows='20' cols='80' placeholder='Enter JavaScript or Python code...'></textarea><br>
      <select id='lang'><option value='javascript'>JavaScript</option><option value='python'>Python</option></select>
      <button onclick='runCode()'>Execute</button>
      <h3>Output:</h3>
      <pre id='output'></pre>
      <script>
        function runCode() {
          fetch('/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              code: document.getElementById('code').value,
              language: document.getElementById('lang').value
            })
          }).then(r => r.json()).then(data => {
            document.getElementById('output').textContent = 
              (data.success ? data.output : 'Error: ' + data.error);
          });
        }
      </script>
    </body>
    </html>
  \`);
});

app.post('/execute', (req, res) => {
  const { code, language = 'javascript' } = req.body;
  const filename = \`/tmp/test_\${Date.now()}.\${language === 'python' ? 'py' : 'js'}\`;
  
  fs.writeFileSync(filename, code);
  const cmd = language === 'python' ? \`python3 \${filename}\` : \`node \${filename}\`;
  
  exec(cmd, { timeout: 30000, cwd: '/workspace' }, (error, stdout, stderr) => {
    res.json({ 
      success: !error,
      output: stdout,
      error: stderr || (error ? error.message : null),
      timestamp: new Date().toISOString()
    });
    try { fs.unlinkSync(filename); } catch(e) {}
  });
});

app.listen(4043, '0.0.0.0', () => console.log('Code executor ready on port 4043'));
"
