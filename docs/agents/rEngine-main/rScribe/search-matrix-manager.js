#!/usr/bin/env node

/**
 * rScribe Search Matrix Integration
 * Monitors code changes and automatically updates the search matrix with context clues
 * 
 * Features:
 * - Watches for new functions and code changes
 * - Analyzes function purpose and creates context clues
 * - Updates search matrix for rapid context retrieval
 * - Integrates with rEngine MCP tools
 */

import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class rScribeSearchMatrixManager {
    constructor() {
        this.rootDir = path.resolve(__dirname, '..');
        this.searchMatrixDir = path.join(this.rootDir, 'rMemory', 'search-matrix');
        this.logFile = path.join(this.rootDir, 'rScribe', 'logs', 'search-matrix.log');
        this.searchMatrix = new Map();
        this.watchedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.md'];
        this.isProcessing = false;
        
        // Initialize directories
        this.initializeDirectories();
    }

    async initializeDirectories() {
        await fs.ensureDir(path.dirname(this.logFile));
        await fs.ensureDir(this.searchMatrixDir);
    }

    async log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        await fs.appendFile(this.logFile, logEntry);
        console.log(`🔍 rScribe Matrix: ${message}`);
    }

    async loadExistingMatrix() {
        try {
            const matrixPath = path.join(this.searchMatrixDir, 'context-matrix.json');
            if (await fs.pathExists(matrixPath)) {
                const matrixData = await fs.readJson(matrixPath);
                this.searchMatrix = new Map(Object.entries(matrixData));
                await this.log(`Loaded existing search matrix with ${this.searchMatrix.size} entries`);
            } else {
                await this.log('No existing search matrix found, starting fresh');
            }
        } catch (error) {
            await this.log(`Error loading search matrix: ${error.message}`);
        }
    }

    async saveMatrix() {
        try {
            const matrixPath = path.join(this.searchMatrixDir, 'context-matrix.json');
            const matrixData = Object.fromEntries(this.searchMatrix);
            await fs.writeJson(matrixPath, matrixData, { spaces: 2 });
            await this.log(`Saved search matrix with ${this.searchMatrix.size} entries`);
        } catch (error) {
            await this.log(`Error saving search matrix: ${error.message}`);
        }
    }

    extractFunctions(fileContent, filePath) {
        const functions = [];
        const ext = path.extname(filePath);
        
        // JavaScript/TypeScript function extraction
        if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
            // Function declarations
            const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/g;
            let match;
            while ((match = functionRegex.exec(fileContent)) !== null) {
                functions.push({
                    name: match[1],
                    type: 'function',
                    line: fileContent.substring(0, match.index).split('\n').length
                });
            }
            
            // Arrow functions and method definitions
            const arrowFunctionRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;
            while ((match = arrowFunctionRegex.exec(fileContent)) !== null) {
                functions.push({
                    name: match[1],
                    type: 'arrow_function',
                    line: fileContent.substring(0, match.index).split('\n').length
                });
            }
            
            // Class methods
            const methodRegex = /^\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/gm;
            while ((match = methodRegex.exec(fileContent)) !== null) {
                if (!['if', 'for', 'while', 'switch', 'catch'].includes(match[1])) {
                    functions.push({
                        name: match[1],
                        type: 'method',
                        line: fileContent.substring(0, match.index).split('\n').length
                    });
                }
            }
        }
        
        // Python function extraction
        if (ext === '.py') {
            const pythonFunctionRegex = /def\s+(\w+)\s*\([^)]*\):/g;
            let match;
            while ((match = pythonFunctionRegex.exec(fileContent)) !== null) {
                functions.push({
                    name: match[1],
                    type: 'python_function',
                    line: fileContent.substring(0, match.index).split('\n').length
                });
            }
        }
        
        return functions;
    }

    analyzeFunction(functionName, fileContent, filePath) {
        // Extract context around the function
        const lines = fileContent.split('\n');
        const funcRegex = new RegExp(`(?:function\\s+${functionName}|${functionName}\\s*=|def\\s+${functionName})`, 'i');
        
        let funcStartLine = -1;
        for (let i = 0; i < lines.length; i++) {
            if (funcRegex.test(lines[i])) {
                funcStartLine = i;
                break;
            }
        }
        
        if (funcStartLine === -1) return null;
        
        // Get comments above the function
        let comments = [];
        for (let i = funcStartLine - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('//') || line.startsWith('*') || line.startsWith('/*') || line.startsWith('#')) {
                comments.unshift(line.replace(/^[\/\*#\s]+/, ''));
            } else if (line === '' || line.startsWith('/**')) {
                continue;
            } else {
                break;
            }
        }
        
        // Get function body (first few lines)
        const bodyLines = [];
        for (let i = funcStartLine; i < Math.min(funcStartLine + 10, lines.length); i++) {
            const line = lines[i].trim();
            if (line) bodyLines.push(line);
        }
        
        // Generate context clues
        const contextClues = this.generateContextClues(functionName, comments, bodyLines, filePath);
        
        return {
            name: functionName,
            file: filePath,
            line: funcStartLine + 1,
            comments: comments,
            bodyPreview: bodyLines.slice(0, 3).join(' '),
            contextClues: contextClues,
            lastAnalyzed: new Date().toISOString()
        };
    }

    generateContextClues(functionName, comments, bodyLines, filePath) {
        const clues = new Set();
        
        // Function name analysis
        const nameWords = functionName.replace(/([A-Z])/g, ' $1').toLowerCase().split(/[_\s]+/);
        nameWords.forEach(word => {
            if (word.length > 2) clues.add(word);
        });
        
        // Comments analysis
        comments.forEach(comment => {
            const words = comment.toLowerCase().split(/\s+/);
            words.forEach(word => {
                word = word.replace(/[^\w]/g, '');
                if (word.length > 3 && !['function', 'method', 'returns', 'params'].includes(word)) {
                    clues.add(word);
                }
            });
        });
        
        // Body analysis for action words
        const bodyText = bodyLines.join(' ').toLowerCase();
        const actionWords = bodyText.match(/\b(create|update|delete|get|set|fetch|save|load|process|handle|manage|validate|check|find|search|filter|sort|calculate|convert|transform|parse|generate|build|execute|run|start|stop|init|setup|configure|connect|disconnect|send|receive|read|write|open|close|add|remove|insert|append|clear|reset|copy|move|import|export)\w*/g);
        if (actionWords) {
            actionWords.forEach(word => clues.add(word));
        }
        
        // File path context
        const pathParts = filePath.split('/');
        pathParts.forEach(part => {
            if (part.includes('.')) {
                const baseName = path.basename(part, path.extname(part));
                const words = baseName.split(/[-_]/);
                words.forEach(word => {
                    if (word.length > 2) clues.add(word.toLowerCase());
                });
            }
        });
        
        return Array.from(clues).slice(0, 15); // Limit to top 15 context clues
    }

    async updateSearchMatrix(functionAnalysis) {
        if (!functionAnalysis) return;
        
        const { name, file, line, contextClues, comments, bodyPreview } = functionAnalysis;
        
        // Create multiple search matrix entries for this function
        const matrixEntries = [];
        
        // Main function entry
        const mainKey = `function:${name}`;
        matrixEntries.push([mainKey, {
            category: 'code_functions',
            keyword: name,
            files: [file],
            functions: [name],
            description: comments.length > 0 ? comments.join(' ') : `Function ${name} in ${path.basename(file)}`,
            context_weight: 0.9,
            line_number: line,
            body_preview: bodyPreview,
            context_clues: contextClues,
            last_updated: new Date().toISOString()
        }]);
        
        // Context clue entries
        contextClues.forEach(clue => {
            const clueKey = `context:${clue}`;
            const existing = this.searchMatrix.get(clueKey);
            
            if (existing) {
                // Add to existing entry
                if (!existing.files.includes(file)) existing.files.push(file);
                if (!existing.functions.includes(name)) existing.functions.push(name);
                existing.context_weight = Math.min(existing.context_weight + 0.1, 1.0);
                existing.last_updated = new Date().toISOString();
            } else {
                // Create new entry
                matrixEntries.push([clueKey, {
                    category: 'context_clues',
                    keyword: clue,
                    files: [file],
                    functions: [name],
                    description: `Code related to ${clue}`,
                    context_weight: 0.6,
                    context_type: 'auto_generated',
                    last_updated: new Date().toISOString()
                }]);
            }
        });
        
        // File relationship entry
        const fileKey = `file:${path.basename(file)}`;
        const existingFile = this.searchMatrix.get(fileKey);
        if (existingFile) {
            if (!existingFile.functions.includes(name)) {
                existingFile.functions.push(name);
                existingFile.last_updated = new Date().toISOString();
            }
        } else {
            matrixEntries.push([fileKey, {
                category: 'file_relationships',
                keyword: path.basename(file),
                primary_file: file,
                functions: [name],
                description: `File containing ${name} and other functions`,
                context_weight: 0.7,
                last_updated: new Date().toISOString()
            }]);
        }
        
        // Add all entries to search matrix
        matrixEntries.forEach(([key, value]) => {
            this.searchMatrix.set(key, value);
        });
        
        await this.log(`Updated search matrix with ${matrixEntries.length} entries for function: ${name}`);
    }

    async analyzeFile(filePath) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        try {
            const relativePath = path.relative(this.rootDir, filePath);
            await this.log(`Analyzing file: ${relativePath}`);
            
            const content = await fs.readFile(filePath, 'utf8');
            const functions = this.extractFunctions(content, relativePath);
            
            if (functions.length > 0) {
                await this.log(`Found ${functions.length} functions in ${relativePath}`);
                
                for (const func of functions) {
                    const analysis = this.analyzeFunction(func.name, content, relativePath);
                    if (analysis) {
                        await this.updateSearchMatrix(analysis);
                    }
                }
                
                await this.saveMatrix();
            }
        } catch (error) {
            await this.log(`Error analyzing file ${filePath}: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    startWatching() {
        const watchPaths = [
            path.join(this.rootDir, 'rEngine/**/*'),
            path.join(this.rootDir, 'rProjects/**/*'),
            path.join(this.rootDir, 'rAgents/**/*'),
            path.join(this.rootDir, 'rScribe/**/*'),
            path.join(this.rootDir, 'scripts/**/*')
        ];
        
        const watcher = chokidar.watch(watchPaths, {
            ignored: [
                '**/node_modules/**',
                '**/logs/**',
                '**/*.log',
                '**/backups/**',
                '**/archive/**',
                '**/.git/**'
            ],
            persistent: true
        });
        
        watcher.on('change', (filePath) => {
            const ext = path.extname(filePath);
            if (this.watchedExtensions.includes(ext)) {
                this.analyzeFile(filePath);
            }
        });
        
        watcher.on('add', (filePath) => {
            const ext = path.extname(filePath);
            if (this.watchedExtensions.includes(ext)) {
                this.analyzeFile(filePath);
            }
        });
        
        this.log('Started watching for file changes...');
        return watcher;
    }

    async performFullScan() {
        await this.log('Starting full project scan for search matrix update...');
        
        const scanPaths = [
            path.join(this.rootDir, 'rEngine'),
            path.join(this.rootDir, 'rProjects'),
            path.join(this.rootDir, 'rAgents'),
            path.join(this.rootDir, 'scripts')
        ];
        
        for (const scanPath of scanPaths) {
            if (await fs.pathExists(scanPath)) {
                await this.scanDirectory(scanPath);
            }
        }
        
        await this.saveMatrix();
        await this.log(`Full scan complete. Search matrix now has ${this.searchMatrix.size} entries`);
    }

    async scanDirectory(dirPath) {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            
            if (item.isDirectory()) {
                if (!['node_modules', 'logs', 'backups', 'archive', '.git'].includes(item.name)) {
                    await this.scanDirectory(fullPath);
                }
            } else if (item.isFile()) {
                const ext = path.extname(item.name);
                if (this.watchedExtensions.includes(ext)) {
                    await this.analyzeFile(fullPath);
                }
            }
        }
    }
}

// Main execution
async function main() {
    const manager = new rScribeSearchMatrixManager();
    await manager.loadExistingMatrix();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--scan')) {
        await manager.performFullScan();
    } else if (args.includes('--watch')) {
        manager.startWatching();
        console.log('👀 rScribe Search Matrix Manager is watching for changes...');
        console.log('Press Ctrl+C to stop');
    } else {
        console.log('rScribe Search Matrix Manager');
        console.log('Usage:');
        console.log('  --scan   Perform full project scan');
        console.log('  --watch  Start watching for file changes');
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default rScribeSearchMatrixManager;
