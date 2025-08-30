#!/usr/bin/env node

/**
 * rAgent Search Matrix Integration Tool
 * Provides rAgents instant access to StackTrackr's search matrix for rapid context
 * 
 * Usage:
 *   node ragent-search-matrix.js "search query"
 *   echo '{"query":"api functions","context":"debugging"}' | node ragent-search-matrix.js --mcp
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

/**
 * Load search matrix from rMemory
 */
async function loadSearchMatrix() {
    const matrixPath = path.join(__dirname, '../rMemory/search-matrix/context-matrix.json');
    
    try {
        const content = await fs.readFile(matrixPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`${colors.red}❌ Failed to load search matrix: ${error.message}${colors.reset}`);
        console.log(`${colors.yellow}💡 Make sure the search matrix is built. Run:${colors.reset}`);
        console.log(`   cd ../rScribe && ./start-search-matrix.sh scan`);
        return null;
    }
}

/**
 * Search the matrix for relevant entries
 */
function searchMatrix(matrix, query, options = {}) {
    const {
        maxResults = 20,
        includeContext = true,
        category = null,
        minScore = 0.3
    } = options;
    
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    
    const results = [];
    
    for (const [key, entry] of Object.entries(matrix)) {
        let score = 0;
        const searchableText = `${entry.file || ''} ${entry.function || ''} ${entry.context_clues?.join(' ') || ''}`.toLowerCase();
        
        // Category filter
        if (category && entry.category !== category) continue;
        
        // Calculate relevance score
        queryWords.forEach(word => {
            if (searchableText.includes(word)) {
                score += 1;
                // Boost for exact function matches
                if (entry.function && entry.function.toLowerCase().includes(word)) {
                    score += 2;
                }
                // Boost for file name matches
                if (entry.file && entry.file.toLowerCase().includes(word)) {
                    score += 1.5;
                }
            }
        });
        
        // Normalize score
        score = score / queryWords.length;
        
        if (score >= minScore) {
            results.push({
                ...entry,
                key,
                relevance_score: score
            });
        }
    }
    
    // Sort by relevance and limit results
    return results
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, maxResults);
}

/**
 * Format search results for rAgent consumption
 */
function formatResults(results, query, options = {}) {
    const {
        format = 'context',
        includeSnippets = true,
        includeMetadata = true
    } = options;
    
    if (format === 'json') {
        return {
            query,
            total_results: results.length,
            timestamp: new Date().toISOString(),
            results: results.map(result => ({
                file: result.file,
                function: result.function,
                category: result.category,
                relevance: result.relevance_score,
                context_clues: result.context_clues,
                line_range: result.line_range,
                dependencies: result.dependencies
            }))
        };
    }
    
    if (format === 'context') {
        let output = `🔍 **Search Matrix Results for "${query}"**\n`;
        output += `📊 Found ${results.length} relevant entries\n\n`;
        
        results.forEach((result, index) => {
            output += `**${index + 1}. ${result.function || 'Context'}** (${(result.relevance_score * 100).toFixed(0)}% match)\n`;
            output += `   📁 File: \`${result.file}\`\n`;
            
            if (result.line_range) {
                output += `   📍 Lines: ${result.line_range.start}-${result.line_range.end}\n`;
            }
            
            if (result.context_clues && result.context_clues.length > 0) {
                output += `   💡 Context: ${result.context_clues.slice(0, 3).join(', ')}\n`;
            }
            
            if (result.dependencies && result.dependencies.length > 0) {
                output += `   🔗 Dependencies: ${result.dependencies.slice(0, 3).join(', ')}\n`;
            }
            
            output += '\n';
        });
        
        return output;
    }
    
    if (format === 'summary') {
        const fileGroups = {};
        results.forEach(result => {
            if (!fileGroups[result.file]) {
                fileGroups[result.file] = [];
            }
            fileGroups[result.file].push(result);
        });
        
        let output = `🎯 **Quick Context for "${query}"**\n\n`;
        
        Object.entries(fileGroups).forEach(([file, entries]) => {
            output += `📁 **${file}**\n`;
            entries.slice(0, 3).forEach(entry => {
                output += `   • ${entry.function || 'Context'}\n`;
            });
            output += '\n';
        });
        
        return output;
    }
    
    return results;
}

/**
 * Get user preferences for search behavior
 */
async function getUserPreferences() {
    try {
        const prefsPath = path.join(__dirname, '../rMemory/rAgentMemories/preferences.json');
        const content = await fs.readFile(prefsPath, 'utf8');
        const prefs = JSON.parse(content);
        
        return {
            verbosity: prefs.user_preferences?.communication_style?.verbosity_level || 'concise',
            detail_level: prefs.user_preferences?.communication_style?.explanation_depth || 'minimal',
            format_preference: prefs.user_preferences?.communication_style?.preferred_formats || ['bullet_points']
        };
    } catch (error) {
        return {
            verbosity: 'concise',
            detail_level: 'minimal',
            format_preference: ['bullet_points']
        };
    }
}

/**
 * Handle MCP mode (JSON input/output)
 */
async function handleMCPMode() {
    return new Promise((resolve, reject) => {
        let data = '';
        
        process.stdin.on('data', chunk => {
            data += chunk;
        });
        
        process.stdin.on('end', () => {
            try {
                const input = JSON.parse(data);
                resolve(input);
            } catch (error) {
                reject(new Error(`Invalid JSON input: ${error.message}`));
            }
        });
        
        process.stdin.on('error', reject);
    });
}

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        query: null,
        mcp: false,
        format: 'context',
        category: null,
        maxResults: 20,
        help: false,
        stats: false
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--mcp':
                options.mcp = true;
                break;
            case '--format':
            case '-f':
                options.format = args[++i];
                break;
            case '--category':
            case '-c':
                options.category = args[++i];
                break;
            case '--max-results':
            case '-n':
                options.maxResults = parseInt(args[++i]) || 20;
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
            case '--stats':
                options.stats = true;
                break;
            default:
                if (!options.query && !args[i].startsWith('--')) {
                    options.query = args[i];
                }
        }
    }
    
    return options;
}

/**
 * Show search matrix statistics
 */
async function showStats() {
    console.log(`${colors.bright}📊 Search Matrix Statistics${colors.reset}\n`);
    
    const matrix = await loadSearchMatrix();
    if (!matrix) return;
    
    const stats = {
        total_entries: Object.keys(matrix).length,
        categories: {},
        files: new Set(),
        functions: 0,
        context_clues: 0
    };
    
    Object.values(matrix).forEach(entry => {
        // Count categories
        const category = entry.category || 'unknown';
        stats.categories[category] = (stats.categories[category] || 0) + 1;
        
        // Count files
        if (entry.file) stats.files.add(entry.file);
        
        // Count functions
        if (entry.function) stats.functions++;
        
        // Count context clues
        if (entry.context_clues) stats.context_clues += entry.context_clues.length;
    });
    
    console.log(`${colors.green}📈 Total Entries: ${stats.total_entries}${colors.reset}`);
    console.log(`${colors.blue}📁 Files Indexed: ${stats.files.size}${colors.reset}`);
    console.log(`${colors.cyan}⚡ Functions: ${stats.functions}${colors.reset}`);
    console.log(`${colors.yellow}💡 Context Clues: ${stats.context_clues}${colors.reset}\n`);
    
    console.log(`${colors.bright}📂 Categories:${colors.reset}`);
    Object.entries(stats.categories)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
            console.log(`  ${category}: ${count} entries`);
        });
}

/**
 * Show help message
 */
function showHelp() {
    console.log(`${colors.bright}🔍 rAgent Search Matrix Integration${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node ragent-search-matrix.js "search query"
  node ragent-search-matrix.js --stats
  echo '{"query":"api","format":"json"}' | node ragent-search-matrix.js --mcp

${colors.yellow}Options:${colors.reset}
  -f, --format <type>      Output format: context, json, summary
  -c, --category <name>    Filter by category: code_functions, context_clues
  -n, --max-results <num>  Maximum results to return (default: 20)
  --stats                  Show search matrix statistics
  --mcp                    MCP mode (JSON input/output)
  -h, --help               Show this help

${colors.yellow}Examples:${colors.reset}
  ragent-search-matrix.js "api functions"
  ragent-search-matrix.js "memory" --format summary
  ragent-search-matrix.js "encryption" --category code_functions
  ragent-search-matrix.js --stats

${colors.yellow}For rAgents:${colors.reset}
  This tool provides instant access to StackTrackr's comprehensive
  search matrix with 1,853+ contextual entries for rapid code targeting.
`);
}

/**
 * Main execution function
 */
async function main() {
    try {
        const options = parseArgs();
        
        if (options.help) {
            showHelp();
            return;
        }
        
        if (options.stats) {
            await showStats();
            return;
        }
        
        let query, searchOptions = {};
        
        if (options.mcp) {
            const input = await handleMCPMode();
            query = input.query;
            searchOptions = {
                format: input.format || 'json',
                category: input.category,
                maxResults: input.maxResults || 20
            };
        } else {
            query = options.query;
            searchOptions = {
                format: options.format,
                category: options.category,
                maxResults: options.maxResults
            };
        }
        
        if (!query) {
            console.error(`${colors.red}❌ Search query is required${colors.reset}`);
            console.log(`${colors.yellow}Use --help for usage information${colors.reset}`);
            process.exit(1);
        }
        
        // Load search matrix
        const matrix = await loadSearchMatrix();
        if (!matrix) {
            process.exit(1);
        }
        
        // Get user preferences
        const prefs = await getUserPreferences();
        
        // Adjust options based on preferences
        if (prefs.verbosity === 'concise' && !options.mcp) {
            searchOptions.format = 'summary';
            searchOptions.maxResults = Math.min(searchOptions.maxResults, 10);
        }
        
        // Perform search
        const startTime = Date.now();
        const results = searchMatrix(matrix, query, {
            maxResults: searchOptions.maxResults,
            category: searchOptions.category
        });
        const searchTime = Date.now() - startTime;
        
        // Format and output results
        const formattedResults = formatResults(results, query, searchOptions);
        
        if (options.mcp) {
            console.log(JSON.stringify(formattedResults));
        } else {
            console.log(formattedResults);
            console.log(`${colors.cyan}⚡ Search completed in ${searchTime}ms${colors.reset}`);
        }
        
    } catch (error) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
