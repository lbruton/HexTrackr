#!/usr/bin/env node

/**
 * Smart Technical Documentation Generator
 * 
 * Features:
 * - Qwen-powered code analysis
 * - Mermaid diagram generation
 * - Function mapping and key tables
 * - Searchable matrix format
 * - Beautiful HTML dashboard
 * - Real-time updates
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

// Configuration
const CONFIG = {
    OLLAMA_URL: 'http://localhost:11434',
    MODEL: 'llama3.1:8b', // 🏆 Benchmark winner - reliable JSON output
    TEMPERATURE: 0.3, // Optimized for llama3.1:8b
    MAX_TOKENS: 2048, // Optimized for llama3.1:8b
    WATCH_EXTENSIONS: ['.js', '.py', '.ts', '.jsx', '.tsx', '.vue', '.go', '.rs', '.java', '.cpp', '.c', '.h'],
    OUTPUT_DIR: './docs/generated',
    TEMPLATE_DIR: './docs/templates',
    ENGINE_PATH: process.cwd(),
    MEMORY_SYNC_LOCK: './memory-sync.lock',
    IGNORE_PATTERNS: [
        'node_modules',
        '.git',
        'docs/generated',
        'dist',
        'build',
        '.vscode',
        'logs',
        'backups',
        'deprecated'
    ]
};

// Generate watch patterns from extensions
CONFIG.WATCH_PATTERNS = CONFIG.WATCH_EXTENSIONS.map(ext => `**/*${ext}`);

console.log(`🤖 Smart Documentation Generator`);
console.log(`📊 Model: ${CONFIG.MODEL}`);
console.log(`📁 Output: ${CONFIG.OUTPUT_DIR}`);

class SmartDocumentationGenerator {
    constructor() {
        this.templates = null;
        this.documentationMatrix = new Map();
        this.fileAnalysis = new Map();
        this.isAnalyzing = false;
        
        this.initializeSystem();
    }

    /**
     * Wait for memory sync to complete before proceeding
     */
    async waitForMemorySyncComplete() {
        try {
            await fs.access(CONFIG.MEMORY_SYNC_LOCK);
            console.log('⏳ Waiting for memory sync to complete...');
            
            // Wait up to 10 seconds for memory sync to finish
            for (let i = 0; i < 20; i++) {
                try {
                    await fs.access(CONFIG.MEMORY_SYNC_LOCK);
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch {
                    // Lock file removed, sync complete
                    break;
                }
            }
        } catch {
            // No lock file, proceed normally
        }
    }

    async initializeSystem() {
        try {
            // Create output directory
            await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
            
            // Load templates
            await this.loadTemplates();
            
            console.log('✅ Smart Documentation Generator initialized');
            
            // Start watching files
            this.startFileWatcher();
            
            // Generate initial documentation
            await this.generateFullDocumentation();
            
        } catch (error) {
            console.error(`❌ Initialization failed: ${error.message}`);
        }
    }

    async loadTemplates() {
        try {
            const templatesPath = path.join(CONFIG.TEMPLATE_DIR, 'qwen-analysis-templates.json');
            const content = await fs.readFile(templatesPath, 'utf8');
            this.templates = JSON.parse(content);
            console.log('✅ Templates loaded');
        } catch (error) {
            console.error(`❌ Failed to load templates: ${error.message}`);
            throw error;
        }
    }

    async callLLM(prompt, systemPrompt = null) {
        try {
            const messages = [];
            
            if (systemPrompt) {
                messages.push({
                    role: "system",
                    content: systemPrompt
                });
            }
            
            messages.push({
                role: "user", 
                content: prompt
            });

            const response = await fetch(`${CONFIG.OLLAMA_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: CONFIG.MODEL,
                    messages: messages,
                    stream: false,
                    options: {
                        temperature: CONFIG.TEMPERATURE,
                        num_predict: CONFIG.MAX_TOKENS
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`LLM API error: ${response.status}`);
            }

            const data = await response.json();
            return data.message?.content || null;
        } catch (error) {
            console.error(`❌ LLM analysis failed: ${error.message}`);
            return null;
        }
    }

    async analyzeCodeFile(filePath) {
        try {
            // Wait for any ongoing memory sync to complete
            await this.waitForMemorySyncComplete();
            
            console.log(`🔍 Analyzing: ${path.basename(filePath)}`);
            
            const content = await fs.readFile(filePath, 'utf8');
            
            // Skip very large files
            if (content.length > 50000) {
                console.log(`⚠️  Skipping large file: ${path.basename(filePath)}`);
                return null;
            }
            
            // Prepare prompt from template
            const prompt = this.templates.promptTemplate
                .replace('{{fileName}}', path.basename(filePath))
                .replace('{{fileContent}}', content.substring(0, 8000)); // Limit content size
            
            const systemPrompt = this.templates.codeAnalysisTemplate.systemPrompt;
            
            const result = await this.callLLM(prompt, systemPrompt);
            
            if (result) {
                try {
                    // Try to parse JSON response
                    const analysis = JSON.parse(result);
                    
                    // Ensure fileInfo object exists
                    if (!analysis.fileInfo) {
                        analysis.fileInfo = {};
                    }
                    
                    // Ensure documentation object exists  
                    if (!analysis.documentation) {
                        analysis.documentation = {
                            summary: 'Analysis pending',
                            purpose: 'Not specified',
                            keyFeatures: [],
                            technicalNotes: [],
                            examples: []
                        };
                    }
                    
                    // Ensure codeStructure object exists
                    if (!analysis.codeStructure) {
                        analysis.codeStructure = {
                            functions: [],
                            classes: [],
                            imports: [],
                            exports: []
                        };
                    }
                    
                    // Add file path and timestamp
                    analysis.fileInfo.path = filePath;
                    analysis.fileInfo.name = path.basename(filePath);
                    analysis.fileInfo.type = path.extname(filePath).substring(1) || 'unknown';
                    analysis.fileInfo.analyzedAt = new Date().toISOString();
                    
                    this.fileAnalysis.set(filePath, analysis);
                    console.log(`✅ Analysis complete: ${path.basename(filePath)}`);
                    
                    return analysis;
                } catch (parseError) {
                    console.error(`❌ Failed to parse analysis for ${path.basename(filePath)}: ${parseError.message}`);
                    return null;
                }
            }
            
            return null;
        } catch (error) {
            console.error(`❌ Analysis failed for ${filePath}: ${error.message}`);
            return null;
        }
    }

    async generateSearchMatrix() {
        console.log('🔍 Building search matrix...');
        
        const matrix = {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalFiles: this.fileAnalysis.size,
                model: CONFIG.MODEL
            },
            functions: [],
            classes: [],
            files: [],
            relationships: [],
            keywords: new Set()
        };

        for (const [filePath, analysis] of this.fileAnalysis) {
            // Ensure analysis has proper structure
            if (!analysis.documentation) {
                analysis.documentation = {
                    summary: 'No summary available',
                    purpose: 'Not specified',
                    keyFeatures: [],
                    technicalNotes: [],
                    examples: []
                };
            }
            
            // Add file info
            matrix.files.push({
                path: filePath,
                name: analysis.fileInfo?.name || path.basename(filePath),
                type: analysis.fileInfo?.type || 'unknown',
                summary: analysis.documentation.summary || 'No summary available'
            });

            // Add functions
            if (analysis.codeStructure.functions) {
                analysis.codeStructure.functions.forEach(func => {
                    matrix.functions.push({
                        name: func.name,
                        file: filePath,
                        description: func.description,
                        parameters: func.parameters,
                        complexity: func.complexity
                    });
                    
                    // Add keywords
                    matrix.keywords.add(func.name);
                    if (func.description) {
                        func.description.split(' ').forEach(word => {
                            if (word.length > 3) matrix.keywords.add(word.toLowerCase());
                        });
                    }
                });
            }

            // Add classes
            if (analysis.codeStructure.classes) {
                analysis.codeStructure.classes.forEach(cls => {
                    matrix.classes.push({
                        name: cls.name,
                        file: filePath,
                        description: cls.description,
                        methods: cls.methods,
                        properties: cls.properties
                    });
                    
                    matrix.keywords.add(cls.name);
                });
            }

            // Add relationships
            if (analysis.relationships.calls) {
                analysis.relationships.calls.forEach(call => {
                    matrix.relationships.push({
                        from: call.from,
                        to: call.to,
                        type: call.type,
                        file: filePath
                    });
                });
            }
        }

        // Convert Set to Array for JSON
        matrix.keywords = Array.from(matrix.keywords);

        // Save matrix
        await fs.writeFile(CONFIG.MATRIX_FILE, JSON.stringify(matrix, null, 2), 'utf8');
        console.log(`✅ Search matrix saved: ${matrix.functions.length} functions, ${matrix.classes.length} classes`);
        
        return matrix;
    }

    async generateHTML(matrix) {
        console.log('🎨 Generating HTML documentation...');
        
        let html = this.templates.htmlTemplate.header
            .replace('{{projectName}}', 'rEngine Technical Documentation')
            .replace('{{css}}', this.templates.cssTemplate);

        // Navigation
        const navLinks = `
            <a href="#overview">Overview</a>
            <a href="#functions">Functions</a>
            <a href="#classes">Classes</a>
            <a href="#files">Files</a>
        `;
        
        html += this.templates.htmlTemplate.navigation
            .replace('{{projectName}}', 'rEngine Technical Documentation')
            .replace('{{navLinks}}', navLinks);

        html += '<div class="container">';

        // Search box
        html += `
            <div class="search-section">
                <input type="text" class="search-box" placeholder="Search functions, classes, files..." id="searchBox">
            </div>
        `;

        // Overview section
        html += `
            <section id="overview" class="file-section">
                <h2>📊 Documentation Overview</h2>
                <div class="key-table-container">
                    <table class="key-table">
                        <tr><th>Metric</th><th>Count</th></tr>
                        <tr><td>Total Files Analyzed</td><td>${matrix.files.length}</td></tr>
                        <tr><td>Functions Discovered</td><td>${matrix.functions.length}</td></tr>
                        <tr><td>Classes Found</td><td>${matrix.classes.length}</td></tr>
                        <tr><td>Relationships Mapped</td><td>${matrix.relationships.length}</td></tr>
                        <tr><td>Last Updated</td><td>${new Date(matrix.metadata.generatedAt).toLocaleString()}</td></tr>
                    </table>
                </div>
            </section>
        `;

        // Functions section
        html += `
            <section id="functions" class="file-section">
                <h2>🔧 Function Map</h2>
                <div class="functions-grid">
        `;
        
        matrix.functions.forEach(func => {
            html += `
                <div class="function-card searchable" data-keywords="${func.name} ${func.description || ''} ${func.file}">
                    <div class="function-name">${func.name}(${func.parameters?.join(', ') || ''})</div>
                    <div class="function-params">File: ${path.basename(func.file)}</div>
                    <div class="function-description">${func.description || 'No description'}</div>
                    <div class="function-complexity">Complexity: ${func.complexity || 'unknown'}</div>
                </div>
            `;
        });
        
        html += '</div></section>';

        // File details with diagrams
        for (const [filePath, analysis] of this.fileAnalysis) {
            const fileName = path.basename(filePath);
            
            // Ensure analysis has proper structure
            if (!analysis.documentation) {
                analysis.documentation = {
                    summary: 'No summary available',
                    purpose: 'Not specified',
                    keyFeatures: [],
                    technicalNotes: [],
                    examples: []
                };
            }
            
            html += `
                <section class="file-section searchable" data-keywords="${fileName} ${analysis.documentation.summary || ''}">
                    <h2>📄 ${fileName}</h2>
                    <div class="file-meta">
                        <strong>Path:</strong> ${filePath}<br>
                        <strong>Type:</strong> ${analysis.fileInfo?.type || 'unknown'}<br>
                        <strong>Purpose:</strong> ${analysis.documentation.purpose || 'Not specified'}<br>
                        <strong>Summary:</strong> ${analysis.documentation.summary || 'No summary'}
                    </div>
            `;

            // Add mermaid diagram if available
            if (analysis.mermaidDiagram && analysis.mermaidDiagram.code) {
                html += `
                    <h3>📊 Structure Diagram</h3>
                    <div class="mermaid">
                        ${analysis.mermaidDiagram.code}
                    </div>
                `;
            }

            // Functions table
            if (analysis.codeStructure.functions && analysis.codeStructure.functions.length > 0) {
                html += `
                    <h3>🔧 Functions</h3>
                    <table class="key-table">
                        <tr><th>Function</th><th>Parameters</th><th>Description</th></tr>
                `;
                
                analysis.codeStructure.functions.forEach(func => {
                    html += `
                        <tr>
                            <td><code>${func.name}</code></td>
                            <td><code>${func.parameters?.join(', ') || ''}</code></td>
                            <td>${func.description || 'No description'}</td>
                        </tr>
                    `;
                });
                
                html += '</table>';
            }

            html += '</section>';
        }

        html += '</div>'; // Close container

        // Add search functionality
        html += `
            <script>
                document.getElementById('searchBox').addEventListener('input', function(e) {
                    const query = e.target.value.toLowerCase();
                    const searchables = document.querySelectorAll('.searchable');
                    
                    searchables.forEach(element => {
                        const keywords = element.getAttribute('data-keywords').toLowerCase();
                        if (keywords.includes(query) || query === '') {
                            element.style.display = 'block';
                        } else {
                            element.style.display = 'none';
                        }
                    });
                });
            </script>
        `;

        html += this.templates.htmlTemplate.footer;

        // Save HTML
        await fs.writeFile(CONFIG.HTML_FILE, html, 'utf8');
        console.log(`✅ HTML documentation generated: ${CONFIG.HTML_FILE}`);
        
        return html;
    }

    async findFilesToAnalyze() {
        const files = [];
        
        async function scanDirectory(dir, patterns) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    // Skip ignored patterns
                    const relativePath = path.relative(CONFIG.ENGINE_PATH, fullPath);
                    if (CONFIG.IGNORE_PATTERNS.some(pattern => {
                        return relativePath.includes(pattern.replace('**/', '').replace('/**', ''));
                    })) {
                        continue;
                    }
                    
                    if (entry.isDirectory()) {
                        // Recursively scan subdirectories
                        await scanDirectory(fullPath, patterns);
                    } else if (entry.isFile()) {
                        // Check if file matches patterns
                        const ext = path.extname(entry.name);
                        if (patterns.some(pattern => {
                            const cleanPattern = pattern.replace('**/', '').replace('*', '');
                            return entry.name.endsWith(cleanPattern) || ext === cleanPattern;
                        })) {
                            files.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                // Skip directories we can't read
                console.warn(`⚠️  Cannot read directory: ${dir}`);
            }
        }
        
        await scanDirectory(CONFIG.ENGINE_PATH, CONFIG.WATCH_PATTERNS);
        return files;
    }

    async generateFullDocumentation() {
        if (this.isAnalyzing) {
            console.log('⚠️  Analysis already in progress...');
            return;
        }

        this.isAnalyzing = true;
        console.log('🚀 Starting full documentation generation...');

        try {
            // Find all files to analyze
            const files = await this.findFilesToAnalyze();

            console.log(`📁 Found ${files.length} files to analyze`);

            // Analyze files in batches
            const batchSize = 3;
            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);
                const promises = batch.map(file => this.analyzeCodeFile(file));
                
                await Promise.all(promises);
                console.log(`📊 Completed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}`);
                
                // Small delay between batches to prevent overwhelming the LLM
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Generate outputs
            const matrix = await this.generateSearchMatrix();
            await this.generateHTML(matrix);

            console.log('🎉 Documentation generation complete!');
            console.log(`📖 View at: file://${CONFIG.HTML_FILE}`);

        } catch (error) {
            console.error(`❌ Documentation generation failed: ${error.message}`);
        } finally {
            this.isAnalyzing = false;
        }
    }

    startFileWatcher() {
        console.log('👀 Starting file watcher...');
        
        const watcher = chokidar.watch(CONFIG.WATCH_PATTERNS, {
            ignored: CONFIG.IGNORE_PATTERNS,
            persistent: true,
            ignoreInitial: true,
            cwd: CONFIG.ENGINE_PATH
        });

        watcher.on('change', async (filePath) => {
            const fullPath = path.resolve(CONFIG.ENGINE_PATH, filePath);
            console.log(`📝 File changed: ${path.basename(fullPath)}`);
            
            // Re-analyze the changed file
            await this.analyzeCodeFile(fullPath);
            
            // Regenerate documentation
            const matrix = await this.generateSearchMatrix();
            await this.generateHTML(matrix);
            
            console.log('🔄 Documentation updated');
        });

        watcher.on('add', async (filePath) => {
            const fullPath = path.resolve(CONFIG.ENGINE_PATH, filePath);
            console.log(`➕ New file: ${path.basename(fullPath)}`);
            
            await this.analyzeCodeFile(fullPath);
            
            const matrix = await this.generateSearchMatrix();
            await this.generateHTML(matrix);
            
            console.log('🔄 Documentation updated');
        });

        console.log('✅ File watcher active');
    }
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚀 Launching Smart Documentation Generator...');
    new SmartDocumentationGenerator();
}

export default SmartDocumentationGenerator;
