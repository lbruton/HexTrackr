#!/usr/bin/env node

/**
 * Search Matrix Performance Analysis
 * Evaluates current performance and projects future scaling needs
 */

import fs from 'fs-extra';
import { performance } from 'perf_hooks';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeSearchMatrixPerformance() {
    console.log('🔍 Search Matrix Performance Analysis\n');
    
    const matrixPath = path.join(__dirname, '..', 'rMemory', 'search-matrix', 'context-matrix.json');
    
    // File size analysis
    const stats = await fs.stat(matrixPath);
    console.log('📊 Current Storage Metrics:');
    console.log(`   File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Disk Usage: ${stats.size.toLocaleString()} bytes`);
    
    // Loading performance test
    console.log('\n⚡ Loading Performance Test:');
    const loadStart = performance.now();
    const matrix = await fs.readJson(matrixPath);
    const loadEnd = performance.now();
    
    console.log(`   Load Time: ${(loadEnd - loadStart).toFixed(2)}ms`);
    console.log(`   Entries: ${Object.keys(matrix).length.toLocaleString()}`);
    
    // Memory usage analysis
    const memUsage = process.memoryUsage();
    console.log(`   Memory Usage: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    
    // Search performance test
    console.log('\n🔍 Search Performance Test:');
    const searchQueries = ['api', 'memory', 'validation', 'encrypt', 'search'];
    
    for (const query of searchQueries) {
        const searchStart = performance.now();
        const results = searchMatrix(matrix, query);
        const searchEnd = performance.now();
        
        console.log(`   "${query}": ${results.length} results in ${(searchEnd - searchStart).toFixed(2)}ms`);
    }
    
    // Category analysis
    console.log('\n📋 Category Breakdown:');
    const categories = {};
    const functionCount = {};
    const fileCount = {};
    
    Object.values(matrix).forEach(entry => {
        if (!categories[entry.category]) categories[entry.category] = 0;
        categories[entry.category]++;
        
        if (entry.functions) {
            entry.functions.forEach(func => {
                if (!functionCount[func]) functionCount[func] = 0;
                functionCount[func]++;
            });
        }
        
        if (entry.files) {
            entry.files.forEach(file => {
                if (!fileCount[file]) fileCount[file] = 0;
                fileCount[file]++;
            });
        }
    });
    
    Object.entries(categories).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} entries`);
    });
    
    console.log(`\n📁 File Coverage: ${Object.keys(fileCount).length} files indexed`);
    console.log(`⚡ Function Coverage: ${Object.keys(functionCount).length} unique functions`);
    
    // Growth projection
    console.log('\n📈 Growth Projections:');
    const currentEntries = Object.keys(matrix).length;
    const avgEntriesPerFile = currentEntries / Object.keys(fileCount).length;
    
    console.log(`   Current: ${currentEntries} entries`);
    console.log(`   Avg entries/file: ${avgEntriesPerFile.toFixed(1)}`);
    console.log(`   Projected at 2x codebase: ${(currentEntries * 2).toLocaleString()} entries`);
    console.log(`   Projected at 5x codebase: ${(currentEntries * 5).toLocaleString()} entries`);
    console.log(`   Projected file size at 5x: ${((stats.size * 5) / 1024 / 1024).toFixed(2)} MB`);
    
    // Performance thresholds
    console.log('\n⚠️ Performance Considerations:');
    const loadTimeMs = loadEnd - loadStart;
    
    if (loadTimeMs < 100) {
        console.log('   ✅ Load time: EXCELLENT (< 100ms)');
    } else if (loadTimeMs < 500) {
        console.log('   ⚡ Load time: GOOD (< 500ms)');
    } else {
        console.log('   ⚠️ Load time: CONCERNING (> 500ms)');
    }
    
    if (stats.size < 5 * 1024 * 1024) { // 5MB
        console.log('   ✅ File size: MANAGEABLE (< 5MB)');
    } else if (stats.size < 20 * 1024 * 1024) { // 20MB
        console.log('   ⚡ File size: ACCEPTABLE (< 20MB)');
    } else {
        console.log('   ⚠️ File size: LARGE (> 20MB)');
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (currentEntries < 5000 && loadTimeMs < 200) {
        console.log('   📝 Current JSON approach is OPTIMAL');
        console.log('   🚀 Continue with file-based matrix for now');
        console.log('   📅 Consider SQLite when entries > 10,000 or load time > 500ms');
    } else if (currentEntries < 10000 && loadTimeMs < 500) {
        console.log('   ⚡ JSON approach still VIABLE');
        console.log('   🔄 Consider optimization techniques first');
        console.log('   📅 Plan SQLite migration for next quarter');
    } else {
        console.log('   🚨 SQLite migration should be PRIORITIZED');
        console.log('   📊 Performance is approaching limits');
        console.log('   🎯 Implement database solution immediately');
    }
    
    // Alternative strategies
    console.log('\n🛠️ Alternative Optimization Strategies:');
    console.log('   1. 🗜️ JSON compression (gzip/brotli) - 60-80% size reduction');
    console.log('   2. 📦 Chunked loading - Load categories on demand');
    console.log('   3. 🧠 Memory caching - Keep hot data in memory');
    console.log('   4. 🔍 Indexing - Pre-build search indices');
    console.log('   5. 🚀 SQLite migration - Full database benefits');
    
    console.log('\n✅ Analysis Complete!');
}

function searchMatrix(matrix, query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    Object.entries(matrix).forEach(([key, entry]) => {
        let score = 0;
        
        if (entry.keyword && entry.keyword.toLowerCase().includes(queryLower)) {
            score += 5;
        }
        
        if (entry.context_clues && entry.context_clues.some(clue => 
            clue.toLowerCase().includes(queryLower))) {
            score += 3;
        }
        
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
    analyzeSearchMatrixPerformance().catch(console.error);
}
