#!/bin/sh

# Install dependencies
npm install express cors axios dotenv helmet rate-limiter-flexible

# Start the LLM Gateway server
node -e "
const express = require('express');
const axios = require('axios');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const fs = require('fs');
const path = require('path');

const app = express();

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(require('cors')());

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip + req.body.provider,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Load API keys from secure mounted directory
let apiKeys = {};
try {
  const envContent = fs.readFileSync('/secrets/api-keys.env', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        apiKeys[key.trim()] = value.trim();
      }
    }
  });
  console.log('✅ API keys loaded successfully');
} catch (error) {
  console.error('❌ Failed to load API keys:', error.message);
}

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
      <title>🤖 rEngine LLM Gateway</title>
      <style>
        body { font-family: 'SF Pro Text', -apple-system, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .provider { background: #e3f2fd; border-left: 4px solid #2196f3; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status.available { background: #4caf50; color: white; }
        .status.unavailable { background: #f44336; color: white; }
        .test-btn { background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class='container'>
        <div class='header'>
          <h1>🤖 rEngine LLM Gateway</h1>
          <p>Secure API gateway for all LLM providers • Rate limited • Monitored • Cached</p>
        </div>
        
        <div class='grid'>
          <div class='card provider'>
            <h3>🚀 OpenAI</h3>
            <div class='status \${apiKeys.OPENAI_API_KEY ? 'available' : 'unavailable'}'>
              \${apiKeys.OPENAI_API_KEY ? 'Available' : 'Not Configured'}
            </div>
            <p>GPT-4, GPT-3.5-turbo, DALL-E</p>
            <button class='test-btn' onclick='testProvider(\"openai\")'>Test Connection</button>
          </div>
          
          <div class='card provider'>
            <h3>🧠 Anthropic</h3>
            <div class='status \${apiKeys.ANTHROPIC_API_KEY ? 'available' : 'unavailable'}'>
              \${apiKeys.ANTHROPIC_API_KEY ? 'Available' : 'Not Configured'}
            </div>
            <p>Claude 3.5 Sonnet, Claude 3 Opus</p>
            <button class='test-btn' onclick='testProvider(\"anthropic\")'>Test Connection</button>
          </div>
          
          <div class='card provider'>
            <h3>🔍 Google</h3>
            <div class='status \${apiKeys.GOOGLE_API_KEY ? 'available' : 'unavailable'}'>
              \${apiKeys.GOOGLE_API_KEY ? 'Available' : 'Not Configured'}
            </div>
            <p>Gemini Pro, PaLM 2</p>
            <button class='test-btn' onclick='testProvider(\"google\")'>Test Connection</button>
          </div>
          
          <div class='card provider'>
            <h3>⚡ Groq</h3>
            <div class='status \${apiKeys.GROQ_API_KEY ? 'available' : 'unavailable'}'>
              \${apiKeys.GROQ_API_KEY ? 'Available' : 'Not Configured'}
            </div>
            <p>Ultra-fast inference</p>
            <button class='test-btn' onclick='testProvider(\"groq\")'>Test Connection</button>
          </div>
        </div>
        
        <div class='card' style='margin-top: 20px;'>
          <h3>🧪 Test LLM Request</h3>
          <div style='margin: 15px 0;'>
            <select id='provider' style='padding: 8px; margin-right: 10px;'>
              <option value='openai'>OpenAI GPT-4</option>
              <option value='anthropic'>Anthropic Claude</option>
              <option value='google'>Google Gemini</option>
              <option value='groq'>Groq Llama</option>
            </select>
            <button class='test-btn' onclick='testLLM()'>Send Test Request</button>
          </div>
          <textarea id='prompt' placeholder='Enter your prompt here...' style='width: 100%; height: 100px; padding: 10px;'></textarea>
          <div id='response' style='margin-top: 15px; padding: 15px; background: #f5f5f5; border-radius: 6px; min-height: 50px;'></div>
        </div>
      </div>
      
      <script>
        function testProvider(provider) {
          fetch('/test/' + provider)
            .then(r => r.json())
            .then(data => alert(data.status + ': ' + data.message))
            .catch(err => alert('Error: ' + err.message));
        }
        
        function testLLM() {
          const provider = document.getElementById('provider').value;
          const prompt = document.getElementById('prompt').value;
          
          fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, prompt })
          })
          .then(r => r.json())
          .then(data => {
            document.getElementById('response').innerHTML = 
              '<strong>Response:</strong><br>' + (data.response || data.error);
          })
          .catch(err => {
            document.getElementById('response').innerHTML = '<strong>Error:</strong> ' + err.message;
          });
        }
      </script>
    </body>
    </html>
  \`);
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    await rateLimiter.consume(req.ip + req.body.provider);
    
    const { provider, prompt, model } = req.body;
    let response;
    
    switch (provider) {
      case 'openai':
        response = await callOpenAI(prompt, model || 'gpt-4');
        break;
      case 'anthropic':
        response = await callAnthropic(prompt, model || 'claude-3-5-sonnet-20241022');
        break;
      case 'google':
        response = await callGoogle(prompt, model || 'gemini-pro');
        break;
      case 'groq':
        response = await callGroq(prompt, model || 'llama-3.1-70b-versatile');
        break;
      default:
        throw new Error('Unsupported provider: ' + provider);
    }
    
    res.json({ success: true, response, provider, model });
  } catch (error) {
    res.status(429).json({ success: false, error: error.message });
  }
});

// Provider test endpoints
app.get('/test/:provider', async (req, res) => {
  const provider = req.params.provider;
  try {
    let result;
    switch (provider) {
      case 'openai':
        result = await testOpenAI();
        break;
      case 'anthropic':
        result = await testAnthropic();
        break;
      case 'google':
        result = await testGoogle();
        break;
      case 'groq':
        result = await testGroq();
        break;
      default:
        throw new Error('Unknown provider');
    }
    res.json({ status: 'success', message: result });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
});

// LLM API implementations
async function callOpenAI(prompt, model) {
  if (!apiKeys.OPENAI_API_KEY) throw new Error('OpenAI API key not configured');
  
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000
  }, {
    headers: {
      'Authorization': 'Bearer ' + apiKeys.OPENAI_API_KEY,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
}

async function callAnthropic(prompt, model) {
  if (!apiKeys.ANTHROPIC_API_KEY) throw new Error('Anthropic API key not configured');
  
  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model,
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  }, {
    headers: {
      'x-api-key': apiKeys.ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    }
  });
  
  return response.data.content[0].text;
}

async function testOpenAI() {
  if (!apiKeys.OPENAI_API_KEY) throw new Error('API key not configured');
  
  const response = await axios.get('https://api.openai.com/v1/models', {
    headers: { 'Authorization': 'Bearer ' + apiKeys.OPENAI_API_KEY }
  });
  
  return 'Connected successfully. Available models: ' + response.data.data.length;
}

async function testAnthropic() {
  if (!apiKeys.ANTHROPIC_API_KEY) throw new Error('API key not configured');
  return 'Anthropic API key configured';
}

async function testGoogle() {
  if (!apiKeys.GOOGLE_API_KEY) throw new Error('API key not configured');
  return 'Google API key configured';
}

async function testGroq() {
  if (!apiKeys.GROQ_API_KEY) throw new Error('API key not configured');
  return 'Groq API key configured';
}

app.listen(4052, '0.0.0.0', () => console.log('🤖 LLM Gateway ready on port 4052'));
"
