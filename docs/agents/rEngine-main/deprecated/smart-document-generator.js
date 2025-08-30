#!/usr/bin/env node

// Document Manager with Smart Rate Limiting
// Generates high-quality documentation while respecting API limits

import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import RateLimiter from './rate-limiter.js';
import FastGroqRateLimiter from './fast-groq-rate-limiter.js';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

class SmartDocumentManager {
    constructor() {
        this.configPath = path.join(__dirname, 'system-config.json');
        if (!fs.existsSync(this.configPath)) {
            console.error('❌ Error: system-config.json not found. Please run setup.');
            process.exit(1);
        }
        
        this.config = fs.readJsonSync(this.configPath);
        this.docManagerConfig = this.config.brainShareSystem.documentManager;
        this.provider = this.docManagerConfig.api.defaultProvider || 'groq';
        this.providerConfig = this.docManagerConfig.api.providers[this.provider];
        this.apiEndpoint = this.providerConfig.endpoint;
        this.model = this.providerConfig.defaultModel;
        
        // Set API key based on provider
        if (this.provider === 'groq') {
            this.apiKey = process.env.GROQ_API_KEY;
            if (!this.apiKey) {
                console.error('❌ Error: GROQ_API_KEY not found in .env. Please add it.');
                process.exit(1);
            }
                        // Groq is MUCH faster than Gemini - use fast rate limiter
            this.rateLimiter = new FastGroqRateLimiter({
                name: 'groq',
                maxRequestsPerMinute: 25, // Well under 30 limit
                maxRequestsPerHour: 800,  // Well under 1000 limit
                maxRetries: 2,
                baseDelay: 200,  // Start with 200ms
                maxDelay: 2000   // Max 2 seconds
            });
        } else if (this.provider === 'claude') {
            this.apiKey = process.env.ANTHROPIC_API_KEY;
            if (!this.apiKey) {
                console.error('❌ Error: ANTHROPIC_API_KEY not found in .env. Please add it.');
                process.exit(1);
            }
            // Claude 3 Haiku - fast and efficient
            this.rateLimiter = new RateLimiter({
                name: 'claude',
                maxRequestsPerMinute: 50,  // Claude allows high rate
                maxRequestsPerHour: 2000,  // Very generous limits
                maxRetries: 2,
                baseDelay: 1200,   // 1.2 seconds - faster than others
                maxDelay: 5000     // Reasonable max delay
            });
        } else {
            this.apiKey = process.env.GEMINI_API_KEY;
            if (!this.apiKey) {
                console.error('❌ Error: GEMINI_API_KEY not found in .env. Please add it.');
                process.exit(1);
            }
            // Gemini 1.5 Flash - optimized for speed
            this.rateLimiter = new RateLimiter({
                name: 'gemini',
                maxRequestsPerMinute: 15,  // Conservative for stability  
                maxRequestsPerHour: 1000,  // Gemini 1.5 Flash allows much higher
                maxRetries: 3,
                baseDelay: 1000,  // Faster than 2 seconds
                maxDelay: 8000    // Shorter max delay
            });
        }
        
        this.docsDir = path.join(this.config.brainShareSystem.storage.memoryDirectory, '../..', 'docs', 'generated');
        this.htmlDocsDir = path.join(this.config.brainShareSystem.storage.memoryDirectory, '../..', 'docs', 'html');
        this.jsonDocsDir = path.join(this.config.brainShareSystem.storage.memoryDirectory, '../..', 'docs', 'json');
        
        // Optimized for Gemini 1.5 Flash - larger context window, faster processing
        this.maxFileSizeBytes = 200 * 1024; // 200KB - Gemini handles larger files
        this.maxLines = 500; // Larger chunks for Gemini's bigger context
        this.delayBetweenChunks = 4000; // 4 seconds - much faster than Groq token limits
        
        console.log(`📚 Smart Document Manager initialized with ${this.provider.toUpperCase()} provider`);
    }

    /**
     * Get HTML template for documentation pages
     */
    getHTMLTemplate(title, content, relativePath) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - StackTrackr Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #495057 0%, #6c757d 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header-icon {
            font-size: 3em;
            margin-bottom: 15px;
            opacity: 0.9;
        }

        .header h1 {
            font-size: 2.2em;
            margin-bottom: 10px;
            font-weight: 300;
        }

        .header .subtitle {
            font-size: 1.1em;
            opacity: 0.8;
            margin-bottom: 5px;
        }

        .header .meta {
            font-size: 0.9em;
            opacity: 0.7;
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }

        .nav-bar {
            background: #f8f9fa;
            padding: 15px 30px;
            border-bottom: 1px solid #e1e4e8;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        .nav-links {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        .nav-link {
            padding: 8px 16px;
            background: #007acc;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-size: 0.9em;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .nav-link:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }

        .content {
            padding: 40px;
            max-width: none;
        }
        
        .content h1, .content h2, .content h3 { 
            color: #2c3e50; 
            margin-top: 2em; 
            margin-bottom: 0.5em; 
        }
        .content h1 { font-size: 2em; border-bottom: 2px solid #3498db; padding-bottom: 0.5em; }
        .content h2 { font-size: 1.5em; }
        .content h3 { font-size: 1.3em; }
        .content pre { 
            background: #f8f9fa; 
            padding: 1em; 
            border-radius: 5px; 
            overflow-x: auto; 
            margin: 1em 0;
            border: 1px solid #e1e4e8;
        }
        .content code { 
            background: #f8f9fa; 
            padding: 0.2em 0.4em; 
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
        }
        .content blockquote {
            border-left: 4px solid #3498db;
            margin: 1em 0;
            padding-left: 1em;
            color: #555;
            background: #f8f9fa;
            padding: 1em 1em 1em 2em;
            border-radius: 5px;
        }
        .content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            overflow: hidden;
        }
        .content th, .content td {
            border: 1px solid #e1e4e8;
            padding: 0.75em;
            text-align: left;
        }
        .content th {
            background: #f8f9fa;
            font-weight: 600;
            color: #24292e;
        }
        .metadata {
            background: #f8f9fa;
            padding: 1em;
            border-radius: 5px;
            margin-bottom: 2em;
            font-size: 0.9em;
            color: #666;
            border: 1px solid #e1e4e8;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            border-top: 1px solid #e1e4e8;
            text-align: center;
            color: #6c757d;
            font-size: 0.9em;
        }

        .footer .branding {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .footer .system-name {
            font-weight: 600;
            color: #495057;
        }

        .footer .version {
            color: #888;
            font-style: italic;
        }

        .footer .divider {
            color: #888;
            opacity: 0.5;
        }
        
        @media (max-width: 768px) {
            .footer .branding {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="header-icon">📄</div>
            <h1>${title}</h1>
            <div class="subtitle">StackTrackr Documentation</div>
            <div class="meta">
                <span>📁 ${relativePath}</span>
                <span>📅 ${new Date().toISOString().split('T')[0]}</span>
            </div>
        </header>
        
        <nav class="nav-bar">
            <div class="nav-links">
                <a href="../index.html" class="nav-link">🏠 Home</a>
                <a href="../html/index.html" class="nav-link">📚 All Docs</a>
                <a href="../../html-docs/documentation.html" class="nav-link">🔍 Search</a>
                <a href="../../html-docs/developmentstatus.html" class="nav-link">📊 Status</a>
            </div>
        </nav>
        
        <main class="content">
            <div class="metadata">
                <strong>📂 Source File:</strong> ${relativePath} | 
                <strong>🕒 Generated:</strong> ${new Date().toLocaleString()} |
                <strong>⚡ Engine:</strong> Groq Smart Generator
            </div>
            ${content}
        </main>
        
        <footer class="footer">
            <div class="branding">
                <span>Generated from the <span class="system-name">rScribe Document System</span></span>
                <span class="divider">•</span>
                <span class="system-name">rEngine</span> <span class="version">(v2.1.0)</span>
                <span class="divider">•</span>
                <span>Last updated: ${new Date().toISOString().split('T')[0]}</span>
            </div>
        </footer>
    </div>
</body>
</html>`;
    }

    /**
     * Generate JSON metadata for documentation file
     */
    generateJSONMetadata(originalFilePath, markdownPath, htmlPath, stats) {
        const relativePath = path.relative(process.cwd(), originalFilePath);
        const parsedPath = path.parse(relativePath);
        
        return {
            version: "1.0",
            file: {
                original: relativePath,
                name: parsedPath.name,
                extension: parsedPath.ext,
                directory: parsedPath.dir,
                size: stats?.size || 0,
                lines: stats?.lines || 0
            },
            documentation: {
                markdown: path.relative(process.cwd(), markdownPath),
                html: path.relative(process.cwd(), htmlPath),
                generated: new Date().toISOString(),
                generator: "smart-document-generator",
                provider: this.provider,
                model: this.model
            },
            processing: {
                chunked: stats?.chunked || false,
                chunks: stats?.chunks || 1,
                method: stats?.method || "single-file",
                preChunked: stats?.preChunked || false
            },
            metadata: {
                title: `${parsedPath.name}${parsedPath.ext}`,
                category: this.getFileCategory(parsedPath.ext),
                icon: this.getFileIcon(parsedPath.ext),
                description: `Documentation for ${relativePath}`
            }
        };
    }

    /**
     * Get file category based on extension
     */
    getFileCategory(extension) {
        const categories = {
            '.js': 'JavaScript',
            '.ts': 'TypeScript', 
            '.css': 'Stylesheet',
            '.html': 'HTML',
            '.md': 'Markdown',
            '.json': 'Data',
            '.py': 'Python',
            '.sh': 'Shell Script'
        };
        return categories[extension] || 'File';
    }

    /**
     * Get icon for file type
     */
    getFileIcon(extension) {
        const icons = {
            '.js': '⚡',
            '.ts': '🔷',
            '.css': '🎨', 
            '.html': '🌐',
            '.md': '📝',
            '.json': '📊',
            '.py': '🐍',
            '.sh': '🔧'
        };
        return icons[extension] || '📄';
    }

    /**
     * Convert markdown to HTML
     */
    async convertMarkdownToHTML(markdownContent, title, relativePath) {
        // Configure marked for better rendering
        marked.setOptions({
            highlight: function(code, lang) {
                return `<pre><code class="language-${lang}">${code}</code></pre>`;
            },
            breaks: true,
            gfm: true
        });
        
        const htmlContent = marked(markdownContent);
        return this.getHTMLTemplate(title, htmlContent, relativePath);
    }

    /**
     * Update HTML documentation index
     */
    async updateHTMLIndex() {
        const indexPath = path.join(this.htmlDocsDir, 'index.html');
        
        try {
            // Find all HTML documentation files
            const htmlFiles = await this.findHTMLFiles(path.join(this.htmlDocsDir, 'generated'));
            
            // Read existing index or use current one
            let indexContent = '';
            if (await fs.pathExists(indexPath)) {
                indexContent = await fs.readFile(indexPath, 'utf8');
            } else {
                // Use the template from your existing index
                indexContent = this.getDefaultIndexHTML();
            }
            
            // Update stats
            const statsMatch = indexContent.match(/<div class="stat-number">(\d+)<\/div>\s*<div class="stat-label">Documentation Pages<\/div>/);
            if (statsMatch) {
                const newCount = htmlFiles.length;
                indexContent = indexContent.replace(
                    statsMatch[0], 
                    `<div class="stat-number">${newCount}</div>\n                    <div class="stat-label">Documentation Pages</div>`
                );
            }
            
            await fs.writeFile(indexPath, indexContent, 'utf8');
            console.log(`📊 Updated HTML index with ${htmlFiles.length} pages`);
            
        } catch (error) {
            console.warn('⚠️  Failed to update HTML index:', error.message);
        }
    }

    /**
     * Find all HTML documentation files
     */
    async findHTMLFiles(dir) {
        const files = [];
        try {
            const items = await fs.readdir(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    files.push(...await this.findHTMLFiles(fullPath));
                } else if (item.name.endsWith('.html')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't be read
        }
        return files;
    }

    /**
     * Get default HTML index template
     */
    getDefaultIndexHTML() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StackTrackr Documentation Index</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; font-weight: 300; }
        .header .subtitle { font-size: 1.2em; opacity: 0.9; }
        .content { padding: 40px; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border-left: 4px solid #007acc;
        }
        .stat-number { font-size: 2em; font-weight: bold; color: #007acc; }
        .stat-label { color: #6c757d; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>📚 StackTrackr Documentation</h1>
            <div class="subtitle">Complete HTML Documentation Index</div>
        </header>
        
        <main class="content">
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">0</div>
                    <div class="stat-label">Documentation Pages</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">14</div>
                    <div class="stat-label">Categories</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">0</div>
                    <div class="stat-label">Total Documents</div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`;
    }

    /**
     * Check if file has pre-chunked analysis from scribe system
     * Use intelligent boundaries if available, fallback to line-based chunking
     */
    async checkPreChunkedAnalysis(filePath) {
        const queueFile = path.join(__dirname, 'pre-chunk-queue.json');
        
        try {
            if (!await fs.pathExists(queueFile)) {
                return null;
            }
            
            const queue = await fs.readJSON(queueFile);
            const relativePath = path.relative(path.dirname(__dirname), filePath);
            const entry = queue.find(item => item.file === relativePath);
            
            if (entry && entry.chunkPlan) {
                console.log(`🧩 Found pre-chunked analysis: ${entry.chunkPlan.chunks.length} intelligent chunks`);
                return entry.chunkPlan;
            }
            
        } catch (error) {
            console.log('ℹ️  No pre-chunk analysis available, using standard chunking');
        }
        
        return null;
    }

    async generateForPreChunkedFile(filePath, content, chunkPlan) {
        console.log(`🎯 Using intelligent pre-chunking strategy`);
        console.log(`📋 Processing ${chunkPlan.chunks.length} chunks based on code structure`);
        
        const lines = content.split('\n');
        const results = [];
        
        for (const chunk of chunkPlan.chunks) {
            console.log(`🔄 Processing ${chunk.description} (lines ${chunk.startLine}-${chunk.endLine})`);
            
            try {
                const chunkContent = lines.slice(chunk.startLine - 1, chunk.endLine).join('\n');
                const filename = path.basename(filePath);
                const chunkFilename = `${filename}_${chunk.type}_${chunk.id}`;
                
                const result = await this.generateDocumentation(filePath, chunkContent, chunkFilename);
                results.push(result);
                
                // Show progress with intelligent chunking info
                const stats = this.rateLimiter.getStats();
                console.log(`📊 Progress: ${chunk.id}/${chunkPlan.chunks.length} | Type: ${chunk.type} | Queue: ${stats.queueLength} | Requests: ${stats.limits.requestsLastMinute}/${stats.limits.minuteLimit}/min`);
                
                // Still use conservative delay for token limits
                if (chunk.id < chunkPlan.chunks.length) {
                    console.log(`⏳ Waiting ${this.delayBetweenChunks/1000}s for token window reset...`);
                    await new Promise(resolve => setTimeout(resolve, this.delayBetweenChunks));
                }
                
            } catch (error) {
                console.error(`❌ Error processing chunk ${chunk.id}:`, error.message);
            }
        }
        
        console.log(`✅ Completed intelligent chunking for ${path.basename(filePath)}`);
        return results;
    }

    async generate(filePath) {
        if (!filePath) {
            console.error('❌ Error: File path is required.');
            console.log('Usage: node smart-document-generator.js <file-path>');
            return;
        }

        const absoluteFilePath = path.resolve(filePath);
        
        if (!fs.existsSync(absoluteFilePath)) {
            console.error(`❌ Error: File "${absoluteFilePath}" does not exist.`);
            return;
        }

        try {
            console.log(`📖 Analyzing file: ${absoluteFilePath}`);
            
            // Check file size before processing
            const stats = fs.statSync(absoluteFilePath);
            const fileContent = await fs.readFile(absoluteFilePath, 'utf8');
            const lineCount = fileContent.split('\n').length;
            
            console.log(`📊 File stats: ${stats.size} bytes, ${lineCount} lines`);
            
            // Check for intelligent pre-chunking from scribe analysis
            const preChunkPlan = await this.checkPreChunkedAnalysis(absoluteFilePath);
            
            // Handle large files
            if (stats.size > this.maxFileSizeBytes || lineCount > this.maxLines) {
                if (preChunkPlan) {
                    console.log(`🎯 Using scribe's intelligent pre-chunking...`);
                    await this.generateForPreChunkedFile(absoluteFilePath, fileContent, preChunkPlan);
                } else {
                    console.log(`⚠️  Large file detected. Splitting into chunks...`);
                    await this.generateForLargeFile(absoluteFilePath, fileContent);
                }
                return;
            }
            
            // Generate documentation with rate limiting
            await this.generateDocumentation(absoluteFilePath, fileContent);
            
        } catch (error) {
            console.error('❌ An error occurred during file processing:');
            console.error(error.message);
        }
    }

    async generateForLargeFile(filePath, content) {
        const lines = content.split('\n');
        const chunkSize = Math.floor(this.maxLines * 0.8); // Use 80% of max to be safe
        const chunks = [];
        
        console.log(`🔪 Splitting ${lines.length} lines into chunks of ${chunkSize} lines`);
        
        for (let i = 0; i < lines.length; i += chunkSize) {
            const chunk = lines.slice(i, i + chunkSize).join('\n');
            chunks.push({
                content: chunk,
                startLine: i + 1,
                endLine: Math.min(i + chunkSize, lines.length),
                index: chunks.length
            });
        }
        
        console.log(`📦 Created ${chunks.length} chunks`);
        
        // Process chunks with rate limiting
        const results = [];
        for (const chunk of chunks) {
            console.log(`🔄 Processing chunk ${chunk.index + 1}/${chunks.length} (lines ${chunk.startLine}-${chunk.endLine})`);
            
            try {
                const filename = path.basename(filePath);
                const chunkFilename = `${filename}_chunk_${chunk.index + 1}`;
                const result = await this.generateDocumentation(filePath, chunk.content, chunkFilename);
                results.push(result);
                
                // Show progress and rate limiter stats
                const stats = this.rateLimiter.getStats();
                console.log(`📊 Progress: ${chunk.index + 1}/${chunks.length} | Queue: ${stats.queueLength} | Requests: ${stats.limits.requestsLastMinute}/${stats.limits.minuteLimit}/min`);
                
                // Conservative delay between chunks for overnight processing
                if (chunk.index + 1 < chunks.length) {
                    console.log(`⏱️  Waiting ${this.delayBetweenChunks}ms before next chunk...`);
                    await new Promise(resolve => setTimeout(resolve, this.delayBetweenChunks));
                }
                
            } catch (error) {
                console.error(`❌ Failed to process chunk ${chunk.index + 1}: ${error.message}`);
                results.push(null);
            }
        }
        
        // Combine results
        await this.combineChunkResults(filePath, chunks, results);
    }

    async combineChunkResults(originalFilePath, chunks, results) {
        const filename = path.basename(originalFilePath);
        const validResults = results.filter(r => r !== null);
        
        if (validResults.length === 0) {
            console.error('❌ No chunks were successfully processed');
            return;
        }
        
        const combinedDoc = `# ${filename} - Combined Documentation

> **Note**: This file was too large for single analysis and was processed in ${chunks.length} chunks.
> Successfully processed: ${validResults.length}/${chunks.length} chunks.

## File Overview

This documentation was generated by analyzing the file in chunks due to size limitations.

${validResults.map((result, index) => `
## Chunk ${index + 1} Analysis

${result}

---
`).join('\n')}

## Processing Summary

- **Total Chunks**: ${chunks.length}
- **Successful**: ${validResults.length}
- **Failed**: ${chunks.length - validResults.length}
- **Processing Method**: Smart chunking with rate limiting
- **Generated**: ${new Date().toISOString()}
`;

        const stats = {
            chunked: true,
            chunks: chunks.length,
            method: "smart-chunking",
            lines: chunks.reduce((total, chunk) => total + chunk.size || 0, 0)
        };

        await this.saveDocumentation(originalFilePath, combinedDoc, '_combined', stats);
        console.log(`✅ Combined documentation saved for ${filename}`);
    }

    async generateDocumentation(filePath, fileContent, customFilename = null) {
        const filename = customFilename || path.basename(filePath);
        const prompt = this.createPrompt(filename, fileContent);
        
        // Use rate limiter to make the API request
        const requestFn = async () => {
            if (this.provider === 'groq') {
                return await this.makeGroqRequest(prompt);
            } else if (this.provider === 'claude') {
                return await this.makeClaudeRequest(prompt);
            } else {
                return await this.makeGeminiRequest(prompt);
            }
        };
        
        const requestId = `doc_${filename}_${Date.now()}`;
        
        try {
            console.log(`🚀 Queuing documentation request for ${filename}...`);
            const generatedDoc = await this.rateLimiter.makeRequest(requestFn, requestId);
            
            const stats = {
                chunked: false,
                chunks: 1,
                method: customFilename ? "chunked" : "single-file",
                lines: fileContent.split('\n').length
            };
            
            await this.saveDocumentation(filePath, generatedDoc, customFilename ? '_chunk' : null, stats);
            return generatedDoc;
            
        } catch (error) {
            console.error(`❌ Failed to generate documentation for ${filename}:`);
            if (error.response) {
                console.error('API Error:', error.response.status, error.response.data);
            } else {
                console.error(error.message);
            }
            throw error;
        }
    }

    async makeGroqRequest(prompt) {
        const response = await axios.post(this.apiEndpoint, {
            model: this.model,
            messages: [
                { role: "system", content: "You are a world-class technical writer creating comprehensive documentation." },
                { role: "user", content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 4000
        }, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            }
        });
        
        return response.data.choices[0].message.content;
    }

    async makeGeminiRequest(prompt) {
        const response = await axios.post(`${this.apiEndpoint}?key=${this.apiKey}`, {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 4000
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        return response.data.candidates[0].content.parts[0].text;
    }

    async makeClaudeRequest(prompt) {
        const response = await axios.post(this.apiEndpoint, {
            model: this.model,
            max_tokens: 4000,
            messages: [
                { role: "user", content: prompt }
            ],
            system: "You are a world-class technical writer creating comprehensive documentation."
        }, {
            headers: {
                'x-api-key': this.apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
        });
        
        return response.data.content[0].text;
    }

    createPrompt(filename, fileContent) {
        return `
You are a world-class senior technical writer, known for creating exceptionally clear, comprehensive, and accessible documentation. Your task is to generate a complete markdown documentation file for the provided script.

**File**: ${filename}

## Analysis Requirements:

1. **Purpose & Overview**: Explain what this script does and why it exists
2. **Technical Architecture**: Break down the code structure, key components, and data flow
3. **Dependencies**: List all imports and external dependencies
4. **Key Functions/Classes**: Document each major function or class with parameters and return values
5. **Usage Examples**: Provide clear examples of how to use this code
6. **Configuration**: Explain any configuration options or environment variables
7. **Error Handling**: Document potential errors and how they're handled
8. **Integration**: Explain how this fits into the larger system
9. **Development Notes**: Any important implementation details or gotchas

## Documentation Style:
- Use clear, professional markdown formatting
- Include code examples with syntax highlighting
- Add tables for structured information
- Use emojis sparingly for visual breaks
- Focus on practical information that helps developers

## Code to Analyze:

\`\`\`
${fileContent}
\`\`\`

Generate comprehensive, production-ready documentation for this code.
`;
    }

    async saveDocumentation(originalFilePath, content, suffix = null, stats = null) {
        const relativePath = path.relative(process.cwd(), originalFilePath);
        const parsedPath = path.parse(relativePath);
        
        // Calculate the correct directory structure avoiding recursion
        let targetDir = parsedPath.dir;
        
        // If the file is already in docs/generated/, extract the actual project path
        if (targetDir.startsWith('docs/generated/')) {
            targetDir = targetDir.replace('docs/generated/', '');
        }
        
        // 1. Save Markdown Documentation (always in docs/generated/)
        const outputDir = path.join(this.docsDir, targetDir);
        await fs.ensureDir(outputDir);
        
        const outputFilename = `${parsedPath.name}${suffix || ''}.md`;
        const markdownPath = path.join(outputDir, outputFilename);
        
        await fs.writeFile(markdownPath, content, 'utf8');
        console.log(`✅ Markdown saved: ${markdownPath}`);

        // 2. Skip HTML generation - will be handled by separate Gemini HTML converter
        console.log(`⏭️  HTML generation skipped (will be handled by Gemini converter)`);

        // 3. Generate and Save JSON Metadata (in docs/generated/json/)
        const jsonOutputDir = path.join(this.docsDir, 'json', targetDir);
        await fs.ensureDir(jsonOutputDir);
        
        const jsonFilename = `${parsedPath.name}${suffix || ''}.json`;
        const jsonPath = path.join(jsonOutputDir, jsonFilename);
        
        // HTML path will be generated later by Gemini converter
        const htmlPath = markdownPath.replace('/docs/generated/', '/html-docs/generated/').replace('.md', '.html');
        const metadata = this.generateJSONMetadata(originalFilePath, markdownPath, htmlPath, stats);
        
        await fs.writeFile(jsonPath, JSON.stringify(metadata, null, 2), 'utf8');
        console.log(`✅ JSON metadata saved: ${jsonPath}`);
        
        // 4. Update HTML Index
        await this.updateHTMLIndex();
        
        return {
            markdown: markdownPath,
            html: htmlPath,
            json: jsonPath
        };
    }

    async shutdown() {
        console.log('🛑 Shutting down Smart Document Manager...');
        if (this.rateLimiter && typeof this.rateLimiter.shutdown === 'function') {
            await this.rateLimiter.shutdown();
        }
        console.log('✅ Shutdown complete');
    }

    getStats() {
        return this.rateLimiter ? this.rateLimiter.getStats() : {};
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const manager = new SmartDocumentManager();
    const filePath = process.argv[2];
    
    if (!filePath) {
        console.log('📚 Smart Document Manager with Rate Limiting');
        console.log('Usage: node smart-document-generator.js <file-path>');
        console.log('');
        console.log('Features:');
        console.log('  🚦 Auto rate limiting with exponential backoff');
        console.log('  📦 Smart chunking for large files');
        console.log('  🔄 Automatic retries with error handling');
        console.log('  💾 Persistent state across runs');
        console.log('  📊 Real-time progress and stats');
        process.exit(0);
    }
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Received interrupt signal...');
        await manager.shutdown();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Received termination signal...');
        await manager.shutdown();
        process.exit(0);
    });
    
    // Run the generator
    manager.generate(filePath)
        .then(() => {
            console.log('🎉 Documentation generation complete!');
            const stats = manager.getStats();
            console.log(`📊 Final stats:`, stats);
        })
        .catch(async (error) => {
            console.error('💥 Generation failed:', error.message);
            await manager.shutdown();
            process.exit(1);
        });
}

export default SmartDocumentManager;
