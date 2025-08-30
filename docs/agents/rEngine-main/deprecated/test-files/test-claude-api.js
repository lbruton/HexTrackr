#!/usr/bin/env node

// Quick test to verify Claude API key is working
import dotenv from 'dotenv';
dotenv.config();

async function testClaudeAPI() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
        console.log('❌ No ANTHROPIC_API_KEY found in environment');
        return false;
    }
    
    console.log('🔑 API Key found:', apiKey.substring(0, 20) + '...');
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 50,
                messages: [{
                    role: 'user',
                    content: 'Say "API test successful!" and nothing else.'
                }]
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ API Error:', response.status, errorText);
            return false;
        }
        
        const data = await response.json();
        console.log('✅ API Response:', data.content[0].text);
        console.log('✅ Claude API is working perfectly!');
        return true;
        
    } catch (error) {
        console.log('❌ Connection Error:', error.message);
        return false;
    }
}

testClaudeAPI();
