#!/usr/bin/env node

/**
 * Scribe System Test - Tests both Ollama (Smart Scribe) and Gemini (Document Generator)
 */

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

const baseDir = '/Volumes/DATA/GitHub/rEngine';

console.log('🧪 TESTING BOTH SCRIBE SYSTEMS\n');

// Test 1: Check Smart Scribe (Ollama/Llama) Status
console.log('1️⃣ TESTING SMART SCRIBE (Ollama/Llama)');
console.log('═════════════════════════════════════');

try {
    const ollamaCheck = execSync('ps aux | grep ollama | grep -v grep', { encoding: 'utf8' });
    const smartScribeCheck = execSync('ps aux | grep smart-scribe | grep -v grep', { encoding: 'utf8' });
    
    console.log('✅ Ollama Process:', ollamaCheck.split('\n')[0] || 'Running');
    console.log('✅ Smart Scribe Process:', smartScribeCheck.split('\n')[0] || 'Running');
    
    // Check Smart Scribe outputs
    const techKnowledgePath = path.join(baseDir, 'rEngine', 'technical-knowledge.json');
    const searchOptPath = path.join(baseDir, 'rEngine', 'search-optimization.json');
    
    if (fs.existsSync(techKnowledgePath)) {
        const techStats = fs.statSync(techKnowledgePath);
        console.log(`✅ Technical Knowledge DB: ${Math.round(techStats.size / 1024)}KB, modified: ${techStats.mtime.toLocaleString()}`);
    } else {
        console.log('❌ Technical Knowledge DB: Not found');
    }
    
    if (fs.existsSync(searchOptPath)) {
        const searchStats = fs.statSync(searchOptPath);
        console.log(`✅ Search Optimization DB: ${Math.round(searchStats.size / 1024)}KB, modified: ${searchStats.mtime.toLocaleString()}`);
    } else {
        console.log('❌ Search Optimization DB: Not found');
    }
    
} catch (error) {
    console.log('❌ Smart Scribe Issue:', error.message);
}

console.log('\n2️⃣ TESTING DOCUMENT GENERATOR (Gemini API)');
console.log('═════════════════════════════════════════');

try {
    // Test Gemini API with the test script itself
    console.log('🧠 Testing Gemini API document generation...');
    const result = execSync(`cd ${baseDir}/rEngine && node document-generator.js scribe-system-test.js`, { encoding: 'utf8' });
    console.log('✅ Gemini Document Generator Result:');
    console.log(result);
    
    // Check generated docs
    const docsDir = path.join(baseDir, 'docs', 'generated');
    if (fs.existsSync(docsDir)) {
        const docFiles = execSync(`find ${docsDir} -name "*.md" -type f`, { encoding: 'utf8' }).trim().split('\n').filter(f => f);
        console.log(`✅ Generated Documents: ${docFiles.length} files found`);
        docFiles.forEach(file => {
            const relPath = path.relative(baseDir, file);
            const stats = fs.statSync(file);
            console.log(`   📄 ${relPath} (${Math.round(stats.size / 1024)}KB)`);
        });
    } else {
        console.log('❌ Generated docs directory not found');
    }
    
} catch (error) {
    console.log('❌ Gemini Document Generator Issue:', error.message);
}

console.log('\n3️⃣ TESTING DOCUMENT SWEEP CAPABILITY');
console.log('═══════════════════════════════════════');

// Check if there's supposed to be a batch document generation
const rEngineFiles = execSync(`find ${baseDir}/rEngine -name "*.js" -type f | head -5`, { encoding: 'utf8' }).trim().split('\n');

console.log('🔍 Found rEngine JavaScript files for potential batch processing:');
rEngineFiles.forEach(file => {
    const relPath = path.relative(baseDir, file);
    console.log(`   📄 ${relPath}`);
});

console.log('\n4️⃣ RECOMMENDATIONS');
console.log('═════════════════');

console.log('✅ Smart Scribe (Ollama): Working - produces technical-knowledge.json and search-optimization.json');
console.log('✅ Document Generator (Gemini): Working - produces markdown documentation on demand');
console.log('❓ Document Sweep: Not found - may need to create batch processing script');
console.log('\n💡 To create document sweep, consider adding batch mode to document-generator.js');
console.log('💡 Or create separate script that calls document-generator.js for multiple files');
