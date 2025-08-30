#!/usr/bin/env node

/**
 * rEngine Core: Claude Complete Documentation Sweep & HTML Generation
 * 
 * This script performs a complete documentation overhaul:
 * 1. Scans entire codebase for undocumented files
 * 2. Generates comprehensive Markdown documentation using Claude
 * 3. Converts all documentation to professional HTML with rEngine Core branding
 * 4. Creates a unified documentation portal
 * 
 * Usage: node claude-doc-sweep-and-html.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

class ClaudeDocumentationEngine {
    constructor() {
        this.apiKey = process.env.ANTHROPIC_API_KEY;
        this.baseDir = path.resolve(__dirname, '..');
        this.docsDir = path.join(this.baseDir, 'docs');
        this.generatedDir = path.join(this.docsDir, 'generated');
        this.htmlOutputDir = path.join(this.baseDir, 'html-docs', 'generated');
        
        // rEngine Core branding
        this.branding = {
            name: 'rEngine Core',
            tagline: 'Intelligent Development Wrapper',
            version: '1.2.2',
            colors: {
                primary: '#6366f1',
                secondary: '#8b5cf6',
                accent: '#06b6d4',
                text: '#1f2937',
                background: '#ffffff'
            }
        };

        // File scanning configuration
        this.scanDirs = [
            'rEngine',
            'rAgents', 
            'rMemory',
            'rScribe',
            'scripts',
            'bin',
            'rProjects'
        ];

        this.excludePatterns = [
            'node_modules',
            '.git',
            'logs',
            'backups',
            'archive',
            'deprecated',
            '.env',
            'package-lock.json'
        ];

        // Rate limiting
        this.requestDelay = 2000; // 2 seconds between Claude requests
        this.processedFiles = [];
        this.errors = [];
    }

    async init() {
        console.log('🚀 rEngine Core: Claude Documentation Engine Starting...');
        console.log(`📁 Base Directory: ${this.baseDir}`);
        
        // Validate API key
        if (!this.apiKey) {
            throw new Error('❌ ANTHROPIC_API_KEY not found in environment');
        }

        // Create directories
        await this.ensureDirectories();
        
        console.log('✅ Initialization complete');
    }

    async ensureDirectories() {
        const dirs = [this.generatedDir, this.htmlOutputDir];
        for (const dir of dirs) {
            try {
                await fs.mkdir(dir, { recursive: true });
                console.log(`📁 Directory ready: ${dir}`);
            } catch (error) {
                console.error(`❌ Failed to create directory ${dir}:`, error.message);
            }
        }
    }

    async scanCodebase() {
        console.log('🔍 Scanning codebase for documentation targets...');
        const filesToDocument = [];

        for (const scanDir of this.scanDirs) {
            const fullPath = path.join(this.baseDir, scanDir);
            try {
                const files = await this.scanDirectory(fullPath);
                filesToDocument.push(...files);
            } catch (error) {
                console.log(`⚠️  Could not scan ${scanDir}: ${error.message}`);
            }
        }

        console.log(`📊 Found ${filesToDocument.length} files to document`);
        return filesToDocument;
    }

    async scanDirectory(dirPath) {
        const files = [];
        
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                // Skip excluded patterns
                if (this.excludePatterns.some(pattern => entry.name.includes(pattern))) {
                    continue;
                }

                if (entry.isDirectory()) {
                    const subFiles = await this.scanDirectory(fullPath);
                    files.push(...subFiles);
                } else if (this.shouldDocument(entry.name)) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.log(`⚠️  Could not read directory ${dirPath}: ${error.message}`);
        }

        return files;
    }

    shouldDocument(filename) {
        const documentableExtensions = ['.js', '.mjs', '.ts', '.py', '.sh', '.md'];
        const extension = path.extname(filename).toLowerCase();
        return documentableExtensions.includes(extension);
    }

    async callClaude(prompt, maxTokens = 4000) {
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: maxTokens,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Claude API error: ${response.status}`);
            }

            const data = await response.json();
            return data.content[0].text;
        } catch (error) {
            console.error('❌ Claude API error:', error.message);
            throw error;
        }
    }

    async generateDocumentation(filePath) {
        console.log(`📝 Documenting: ${path.relative(this.baseDir, filePath)}`);
        
        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const relativePath = path.relative(this.baseDir, filePath);
            
            const prompt = `
You are a technical documentation expert for rEngine Core, an "Intelligent Development Wrapper" platform.

Please analyze this file and create comprehensive technical documentation in Markdown format:

File: ${relativePath}
Content:
\`\`\`
${fileContent}
\`\`\`

Create documentation that includes:

1. **Purpose & Overview** - What this file does in the rEngine Core ecosystem
2. **Key Functions/Classes** - Main components and their roles
3. **Dependencies** - What this file depends on or integrates with
4. **Usage Examples** - How to use/call this file
5. **Configuration** - Any environment variables or config needed
6. **Integration Points** - How this connects to other rEngine Core components
7. **Troubleshooting** - Common issues and solutions

Format as professional Markdown with:
- Clear headers (##, ###)
- Code blocks with syntax highlighting
- Tables for structured information
- Lists for step-by-step instructions

Focus on practical usage and integration within the rEngine Core platform.
`;

            const documentation = await this.callClaude(prompt);
            
            // Save Markdown documentation
            const docFilename = path.basename(filePath, path.extname(filePath)) + '.md';
            const docPath = path.join(this.generatedDir, docFilename);
            await fs.writeFile(docPath, documentation);
            
            console.log(`✅ Documentation saved: ${docFilename}`);
            this.processedFiles.push({ source: filePath, doc: docPath });
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, this.requestDelay));
            
            return { docPath, content: documentation };
            
        } catch (error) {
            console.error(`❌ Failed to document ${filePath}:`, error.message);
            this.errors.push({ file: filePath, error: error.message });
            return null;
        }
    }

    async generateHTML(markdownPath, content) {
        const filename = path.basename(markdownPath, '.md');
        console.log(`🎨 Converting to HTML: ${filename}`);
        
        const prompt = `
Convert this Markdown documentation to professional HTML for the rEngine Core platform.

Markdown Content:
\`\`\`markdown
${content}
\`\`\`

Create a complete HTML page with:

1. **rEngine Core Branding:**
   - Title: "rEngine Core - [Page Title]"
   - Colors: Primary #6366f1, Secondary #8b5cf6, Accent #06b6d4
   - Font: Inter family
   - Professional, modern design

2. **HTML Structure:**
   - Complete <!DOCTYPE html> document
   - Responsive design (mobile-first)
   - Navigation sidebar for sections
   - Clean typography and spacing
   - Code syntax highlighting
   - Tables with proper styling

3. **CSS Styling:**
   - Embedded <style> section
   - Modern, professional appearance
   - Consistent with rEngine Core brand
   - Responsive breakpoints
   - Hover effects and smooth transitions

4. **Interactive Features:**
   - Collapsible sections
   - Copy-to-clipboard for code blocks
   - Smooth scrolling navigation
   - Search functionality if applicable

Make it production-ready for the rEngine Core documentation portal.
`;

        try {
            const htmlContent = await this.callClaude(prompt, 6000);
            
            const htmlPath = path.join(this.htmlOutputDir, filename + '.html');
            await fs.writeFile(htmlPath, htmlContent);
            
            console.log(`✅ HTML generated: ${filename}.html`);
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, this.requestDelay));
            
            return htmlPath;
            
        } catch (error) {
            console.error(`❌ Failed to generate HTML for ${filename}:`, error.message);
            this.errors.push({ file: markdownPath, error: error.message });
            return null;
        }
    }

    async generateIndexPage() {
        console.log('📋 Generating documentation index...');
        
        const indexContent = `
# rEngine Core Documentation Portal

Welcome to the comprehensive documentation for **rEngine Core** - the Intelligent Development Wrapper.

## 📚 Generated Documentation

${this.processedFiles.map(file => {
    const filename = path.basename(file.doc, '.md');
    return `- [${filename}](${filename}.html) - ${path.relative(this.baseDir, file.source)}`;
}).join('\n')}

## 🎯 Platform Overview

rEngine Core is an intelligent development wrapper that enhances your development workflow with:

- **Automated Documentation Generation**
- **Multi-LLM Integration** (Claude, Gemini, OpenAI, Groq)
- **Intelligent Code Analysis**
- **Development Environment Management**
- **Project Lifecycle Automation**

## 🔧 System Information

- **Version:** ${this.branding.version}
- **Documentation Generated:** ${new Date().toISOString()}
- **Files Processed:** ${this.processedFiles.length}
- **Total Components:** ${this.processedFiles.length} documented

---
*Generated by rEngine Core Documentation Engine*
`;

        const indexPath = path.join(this.generatedDir, 'index.md');
        await fs.writeFile(indexPath, indexContent);

        // Generate HTML index
        const htmlIndex = await this.generateHTML(indexPath, indexContent);
        
        console.log('✅ Documentation index created');
        return { markdown: indexPath, html: htmlIndex };
    }

    async run() {
        console.log('🚀 Starting Complete Documentation Sweep & HTML Generation...');
        
        try {
            await this.init();
            
            // Step 1: Scan codebase
            const filesToDocument = await this.scanCodebase();
            
            if (filesToDocument.length === 0) {
                console.log('ℹ️  No files found to document');
                return;
            }

            // Step 2: Generate Markdown documentation
            console.log('\n📝 === MARKDOWN GENERATION PHASE ===');
            for (const filePath of filesToDocument) {
                const result = await this.generateDocumentation(filePath);
                if (!result) continue;
            }

            // Step 3: Convert to HTML
            console.log('\n🎨 === HTML GENERATION PHASE ===');
            for (const { doc, content } of this.processedFiles.map(f => ({ doc: f.doc, content: null }))) {
                if (!content) {
                    try {
                        const markdownContent = await fs.readFile(doc, 'utf-8');
                        await this.generateHTML(doc, markdownContent);
                    } catch (error) {
                        console.error(`❌ Failed to read ${doc}:`, error.message);
                    }
                } else {
                    await this.generateHTML(doc, content);
                }
            }

            // Step 4: Generate index
            await this.generateIndexPage();

            // Final summary
            console.log('\n🎉 === COMPLETION SUMMARY ===');
            console.log(`✅ Files Processed: ${this.processedFiles.length}`);
            console.log(`❌ Errors: ${this.errors.length}`);
            console.log(`📁 Markdown Docs: ${this.generatedDir}`);
            console.log(`🎨 HTML Portal: ${this.htmlOutputDir}`);
            
            if (this.errors.length > 0) {
                console.log('\n⚠️  Errors encountered:');
                this.errors.forEach(error => {
                    console.log(`  - ${error.file}: ${error.error}`);
                });
            }

            console.log('\n🚀 rEngine Core Documentation Portal Ready!');
            
        } catch (error) {
            console.error('❌ Fatal error:', error.message);
            throw error;
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const engine = new ClaudeDocumentationEngine();
    engine.run().catch(error => {
        console.error('💥 Documentation engine failed:', error);
        process.exit(1);
    });
}

export default ClaudeDocumentationEngine;
