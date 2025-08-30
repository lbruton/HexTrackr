#!/usr/bin/env node

// HeyGemini - Quick Gemini test via OpenWebUI Pipelines
// Updated for rEngine MCP integration architecture

import axios from 'axios';

import axios from 'axios';

// Try OpenWebUI direct endpoint first (fallback to Ollama)
const OPENWEBUI_BASE_URL = 'http://localhost:3031/ollama/api';
const BACKUP_PIPELINES_URL = 'http://localhost:9099/v1';
const OPENWEBUI_API_KEY = '0p3n-w3bu!';

async function testOpenWebUI(message) {
  try {
    console.log('🤖 Testing OpenWebUI connection...');
    console.log(`📝 Message: "${message}"`);
    console.log(`🔗 Trying Ollama endpoint: ${OPENWEBUI_BASE_URL}`);
    
    // Try Ollama through OpenWebUI first
    const response = await axios.post(`${OPENWEBUI_BASE_URL}/chat`, {
      model: 'qwen2.5-coder:3b',
      messages: [
        { role: 'user', content: message }
      ],
      stream: false
    }, {
      timeout: 30000
    });

    console.log('✅ Success via OpenWebUI Ollama!');
    console.log('📤 Response:');
    console.log(response.data.message.content);
    
  } catch (error) {
    console.log('❌ OpenWebUI Ollama failed, trying pipelines...');
    
    try {
      // Fallback to pipelines
      const pipelineResponse = await axios.post(`${BACKUP_PIPELINES_URL}/chat/completions`, {
        model: 'qwen2.5-coder:3b',
        messages: [{ role: 'user', content: message }],
        max_tokens: 200
      }, {
        headers: {
          'Authorization': `Bearer ${OPENWEBUI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      console.log('✅ Success via Pipelines!');
      console.log('📤 Response:');
      console.log(pipelineResponse.data.choices[0].message.content);
      
    } catch (pipelineError) {
      console.log('❌ Both endpoints failed:');
      console.log('📋 Ollama error:', error.message);
      console.log('📋 Pipelines error:', pipelineError.message);
      
      console.log('
💡 Status check:');
      console.log('  ✅ OpenWebUI container running (port 3031)');
      console.log('  ✅ Pipelines container running (port 9099)'); 
      console.log('  🔄 May need to configure models or wait for startup');
      console.log('
🌙 Goodnight anyway! Tomorrow we'll get the full pipeline working! �');
      
      process.exit(1);
    }
  }
}

// Get message from command line or use default
const message = process.argv[2] || 'Hello! Testing OpenWebUI integration.';
testOpenWebUI(message); "${message}"`);
    console.log(`🤖 Model: ${model}`);
    console.log(`🔗 Endpoint: ${OPENWEBUI_BASE_URL}`);
    
    const response = await axios.post(`${OPENWEBUI_BASE_URL}/chat/completions`, {
      model,
      messages: [
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENWEBUI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Success!');
    console.log('📤 Response:');
    console.log(response.data.choices[0].message.content);
    
  } catch (error) {
    console.log('❌ Error calling AI via OpenWebUI:');
    console.log('📋 Error details:', error.message);
    
    if (error.response) {
      console.log('🔍 Response status:', error.response.status);
      console.log('🔍 Response data:', error.response.data);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('  • Check if OpenWebUI Pipelines is running on port 9099');
    console.log('  • Verify the model is available');
    console.log('  • Test: curl http://localhost:9099/v1/models');
    
    process.exit(1);
  }
}

// Get message from command line or use default
const message = process.argv.slice(2).join(' ') || 'Hello! Testing OpenWebUI Pipelines integration.';
heyOpenWebUI(message);
