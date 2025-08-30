#!/usr/bin/env node

// Simple test of the multi-provider AI system via process communication
import { spawn } from 'child_process';

async function testProviders() {
  console.log('🧪 Testing 5-Tier AI Provider System...\n');
  
  const testRequest = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call", 
    "params": {
      "name": "tagInOllama",
      "arguments": {
        "message": "Hello! Please tell me which AI provider you are and what makes you special.",
        "model": "llama-3.1-8b-instant",
        "include_context": false,
        "session_id": "provider_test",
        "remember_conversation": false
      }
    }
  };
  
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: '/Volumes/DATA/GitHub/rEngine/rEngineMCP'
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('🎉 AI RESPONSE RECEIVED:');
        console.log('=' * 60);
        console.log(output);
        console.log('=' * 60);
        resolve(output);
      } else {
        console.error('❌ Test failed with code:', code);
        console.error('Error output:', errorOutput);
        reject(new Error(`Process exited with code ${code}`));
      }
    });
    
    // Send the test request
    child.stdin.write(JSON.stringify(testRequest) + '\n');
    child.stdin.end();
    
    // Timeout after 30 seconds
    setTimeout(() => {
      child.kill();
      reject(new Error('Test timeout'));
    }, 30000);
  });
}

testProviders().catch(console.error);
