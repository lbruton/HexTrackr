#!/usr/bin/env node

// Test script for Enhanced Scribe Console AI features
import fs from 'fs/promises';
import path from 'path';

// Test the LLM configuration
const LLM_CONFIG = {
    ANALYSIS_MODEL: 'qwen2.5-coder:7b',
    OLLAMA_HOST: 'http://localhost:11434',
    TEMPERATURE: 0.3,
    MAX_TOKENS: 2048,
    CONTEXT_WINDOW: 8192,
    MEMORY_SYNC_INTERVAL: 60,
    ANALYSIS_BATCH_SIZE: 5,
    ENABLE_SMART_ANALYSIS: true,
    ENABLE_MEMORY_SYNC: true,
    ENABLE_FUNCTION_EXTRACTION: true,
    ENABLE_KNOWLEDGE_BUILDING: true
};

async function testOllamaConnection() {
    console.log('🤖 Testing Ollama connection...');
    
    try {
        const response = await fetch(`${LLM_CONFIG.OLLAMA_HOST}/api/tags`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Ollama is accessible');
        
        const models = data.models || [];
        const qwenModel = models.find(m => m.name.includes('qwen2.5-coder:7b'));
        
        if (qwenModel) {
            console.log('✅ Qwen2.5-Coder 7B model is available');
            console.log(`   Size: ${(qwenModel.size / 1024 / 1024 / 1024).toFixed(1)}GB`);
        } else {
            console.log('❌ Qwen2.5-Coder 7B model not found');
            console.log('Available models:');
            models.forEach(m => console.log(`   - ${m.name}`));
        }
        
        return true;
    } catch (error) {
        console.log('❌ Ollama connection failed:', error.message);
        console.log('   Make sure Ollama is running: ollama serve');
        return false;
    }
}

async function testSimpleAnalysis() {
    console.log('\n🔍 Testing simple code analysis...');
    
    const testCode = `
function calculateSum(a, b) {
    return a + b;
}

class MathHelper {
    static multiply(x, y) {
        return x * y;
    }
}

export { calculateSum, MathHelper };
`;

    const prompt = `Analyze this JavaScript code and extract key information.

Return a JSON object with:
{
  "functions": ["function1", "function2"],
  "classes": ["Class1", "Class2"], 
  "imports": ["module1", "module2"],
  "key_concepts": ["concept1", "concept2"],
  "summary": "Brief description of what this code does"
}

Code:
${testCode}`;

    try {
        const response = await fetch(`${LLM_CONFIG.OLLAMA_HOST}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: LLM_CONFIG.ANALYSIS_MODEL,
                messages: [{
                    role: "user",
                    content: prompt
                }],
                stream: false,
                options: {
                    temperature: LLM_CONFIG.TEMPERATURE,
                    num_predict: 500
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const result = data.message?.content;
        
        if (result) {
            console.log('✅ Analysis successful');
            console.log('Result:', result);
            
            try {
                const parsed = JSON.parse(result);
                console.log('✅ JSON parsing successful');
                console.log(`   Functions: ${parsed.functions?.join(', ') || 'None'}`);
                console.log(`   Classes: ${parsed.classes?.join(', ') || 'None'}`);
                console.log(`   Summary: ${parsed.summary || 'No summary'}`);
            } catch (e) {
                console.log('⚠️  Result not valid JSON, but analysis worked');
            }
        } else {
            console.log('❌ No result from analysis');
        }
        
        return true;
    } catch (error) {
        console.log('❌ Analysis failed:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Enhanced Scribe Console Test Suite');
    console.log('=====================================');
    
    console.log(`🤖 Configuration:`);
    console.log(`   Model: ${LLM_CONFIG.ANALYSIS_MODEL}`);
    console.log(`   Host: ${LLM_CONFIG.OLLAMA_HOST}`);
    console.log(`   Features: Smart Analysis ${LLM_CONFIG.ENABLE_SMART_ANALYSIS ? '✅' : '❌'}`);
    
    const ollamaOk = await testOllamaConnection();
    
    if (ollamaOk) {
        await testSimpleAnalysis();
    }
    
    console.log('\n🏁 Test completed!');
    console.log('\nTo start the enhanced console: node enhanced-scribe-console.js');
}

main().catch(console.error);
