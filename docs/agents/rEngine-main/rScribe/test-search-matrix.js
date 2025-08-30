#!/usr/bin/env node

/**
 * Test the rScribe Search Matrix Integration
 * Demonstrates the automatic function documentation and context breakdown
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSearchMatrix() {
    console.log('🔍 Testing rScribe Search Matrix Integration...\n');
    
    // Load the search matrix
    const matrixPath = path.join(__dirname, '..', 'rMemory', 'search-matrix', 'context-matrix.json');
    
    if (!await fs.pathExists(matrixPath)) {
        console.log('❌ Search matrix not found. Run rScribe search matrix scan first.');
        return;
    }
    
    const matrix = await fs.readJson(matrixPath);
    const totalEntries = Object.keys(matrix).length;
    
    console.log(`📊 Search Matrix Statistics:`);
    console.log(`   Total Entries: ${totalEntries}`);
    
    // Analyze by category
    const categories = {};
    const functions = [];
    const contextClues = [];
    
    Object.values(matrix).forEach(entry => {
        if (!categories[entry.category]) categories[entry.category] = 0;
        categories[entry.category]++;
        
        if (entry.category === 'code_functions') {
            functions.push(entry.keyword);
        } else if (entry.category === 'context_clues') {
            contextClues.push(entry.keyword);
        }
    });
    
    console.log(`\n📋 Categories:`);
    Object.entries(categories).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} entries`);
    });
    
    console.log(`\n⚡ Function Examples (first 10):`);
    functions.slice(0, 10).forEach((func, i) => {
        console.log(`   ${i + 1}. ${func}`);
    });
    
    console.log(`\n🔗 Context Clue Examples (first 15):`);
    contextClues.slice(0, 15).forEach((clue, i) => {
        console.log(`   ${i + 1}. ${clue}`);
    });
    
    // Test search functionality
    console.log(`\n🔍 Testing Search Capabilities:`);
    
    const testQueries = ['api', 'encrypt', 'memory', 'search', 'validation'];
    
    for (const query of testQueries) {
        const matches = searchByKeyword(matrix, query);
        console.log(`   "${query}" → ${matches.length} matches`);
        
        if (matches.length > 0) {
            const topMatch = matches[0];
            if (topMatch.files && topMatch.files.length > 0) {
                console.log(`     → Best match: ${topMatch.files[0]} (${topMatch.keyword})`);
            }
        }
    }
    
    // Test function location
    console.log(`\n🎯 Function Location Test:`);
    const testFunctions = ['saveInventory', 'loadApiConfig', 'addMemory', 'validateFieldValue'];
    
    for (const funcName of testFunctions) {
        const functionKey = `function:${funcName}`;
        if (matrix[functionKey]) {
            const func = matrix[functionKey];
            console.log(`   ${funcName} → ${func.files[0]}:${func.line_number}`);
            console.log(`     Context: [${func.context_clues.slice(0, 3).join(', ')}]`);
        } else {
            console.log(`   ${funcName} → Not found`);
        }
    }
    
    console.log(`\n✅ rScribe Search Matrix Integration Test Complete!`);
    console.log(`\n💡 This restores the missing functionality that:`);
    console.log(`   • Automatically documents new functions when written`);
    console.log(`   • Breaks down functions into context clues`);
    console.log(`   • Updates search matrix for rapid code location`);
    console.log(`   • Integrates with rEngine MCP tools for AI agents`);
}

function searchByKeyword(matrix, query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    Object.entries(matrix).forEach(([key, entry]) => {
        let score = 0;
        
        // Exact keyword match
        if (entry.keyword && entry.keyword.toLowerCase() === queryLower) {
            score += 10;
        }
        
        // Partial keyword match
        if (entry.keyword && entry.keyword.toLowerCase().includes(queryLower)) {
            score += 5;
        }
        
        // Context clues match
        if (entry.context_clues && entry.context_clues.some(clue => 
            clue.toLowerCase().includes(queryLower))) {
            score += 3;
        }
        
        // Description match
        if (entry.description && entry.description.toLowerCase().includes(queryLower)) {
            score += 2;
        }
        
        if (score > 0) {
            results.push({ ...entry, search_score: score });
        }
    });
    
    return results.sort((a, b) => b.search_score - a.search_score);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
    testSearchMatrix().catch(console.error);
}
