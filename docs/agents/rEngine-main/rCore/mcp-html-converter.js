#!/usr/bin/env node

/**
 * MCP-Based HTML Documentation Converter
 * Converts MD files to high-quality HTML documentation using MCP relay system
 * Operates on rDocuments/autogen/ MD files and outputs to rDocuments/html/
 * Uses the rEngine MCP infrastructure instead of direct API calls
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPHTMLConverter {
    constructor() {
        this.sourceDir = path.join(process.cwd(), 'rDocuments/autogen');
        this.outputDir = path.join(process.cwd(), 'rDocuments/html');
        this.callLLMPath = path.join(__dirname, 'call-llm.js');
        
        console.log(`🎨 MCP HTML Converter initialized`);
        console.log(`📂 Source: ${this.sourceDir}`);
        console.log(`📁 Output: ${this.outputDir}`);
        console.log(`🔗 MCP Relay: ${this.callLLMPath}`);
    }

    /**
     * Call LLM via MCP relay system
     */
    async callLLMViaMCP(provider, prompt, model = null) {
        try {
            // Create a temporary file for the prompt to avoid shell escaping issues
            const tempFile = path.join(__dirname, 'temp_prompt.txt');
            await fs.writeFile(tempFile, prompt, 'utf-8');
            
            const command = model 
                ? `node "${this.callLLMPath}" --provider ${provider} --model ${model} --prompt "$(cat "${tempFile}")"`
                : `node "${this.callLLMPath}" --provider ${provider} --prompt "$(cat "${tempFile}")"`;
            
            const { stdout, stderr } = await execAsync(command);
            
            // Clean up temp file
            await fs.remove(tempFile).catch(() => {});
            
            if (stderr && !stderr.includes('command not found')) {
                console.warn(`⚠️ MCP Warning: ${stderr}`);
            }
            
            // Parse the response - the call-llm.js outputs JSON
            try {
                const lines = stdout.trim().split('\n');
                const lastLine = lines[lines.length - 1];
                if (lastLine.startsWith('{')) {
                    const result = JSON.parse(lastLine);
                    return result.response || result.error;
                }
                return stdout.trim();
            } catch (parseError) {
                // Fallback: return raw output
                return stdout.trim();
            }
            
        } catch (error) {
            console.error(`❌ MCP Call Error for ${provider}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Multi-provider fallback system
     * Tries multiple LLM providers via MCP until one succeeds
     */
    async callWithFallback(prompt, preferredProvider = 'gemini') {
        const providers = [
            { name: 'gemini', model: 'gemini-1.5-flash' },
            { name: 'groq', model: 'llama-3.1-70b-versatile' },
            { name: 'openai', model: 'gpt-4o' },
            { name: 'claude', model: 'claude-3-haiku-20240307' }
        ];

        // Put preferred provider first
        const sortedProviders = providers.sort((a, b) => 
            a.name === preferredProvider ? -1 : 
            b.name === preferredProvider ? 1 : 0
        );

        for (const provider of sortedProviders) {
            try {
                console.log(`🤖 Trying ${provider.name} (${provider.model})...`);
                const response = await this.callLLMViaMCP(provider.name, prompt, provider.model);
                
                if (response && !response.includes('error') && response.length > 50) {
                    console.log(`✅ Success with ${provider.name}`);
                    return response;
                }
            } catch (error) {
                console.warn(`⚠️ ${provider.name} failed: ${error.message}`);
                continue;
            }
        }
        
        throw new Error('All LLM providers failed via MCP relay');
    }

    /**
     * Get the unified HTML template with rEngine branding following established vision template
     */
    getHTMLTemplate(title, content, relativePath, metadata = {}) {
        const currentDate = new Date().toISOString().split('T')[0];
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - rEngine Core Documentation</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../vision/styles.css">
    <style>
        /* Additional documentation-specific styles */
        .doc-content {
            max-width: 900px;
            margin: 0 auto;
            padding: var(--spacing-8);
        }
        
        .doc-header {
            text-align: center;
            margin-bottom: var(--spacing-12);
            padding: var(--spacing-8) 0;
            border-bottom: 2px solid var(--gray-200);
        }
        
        .doc-title {
            font-size: var(--font-size-4xl);
            font-weight: 700;
            color: var(--gray-900);
            margin-bottom: var(--spacing-4);
        }
        
        .doc-subtitle {
            font-size: var(--font-size-lg);
            color: var(--gray-600);
            margin-bottom: var(--spacing-6);
        }
        
        .doc-meta {
            display: flex;
            justify-content: center;
            gap: var(--spacing-6);
            font-size: var(--font-size-sm);
            color: var(--gray-500);
        }
        
        .content-wrapper {
            line-height: 1.8;
        }
        
        .content-wrapper h1,
        .content-wrapper h2,
        .content-wrapper h3,
        .content-wrapper h4 {
            margin-top: var(--spacing-10);
            margin-bottom: var(--spacing-4);
        }
        
        .content-wrapper p {
            margin-bottom: var(--spacing-4);
        }
        
        .content-wrapper ul,
        .content-wrapper ol {
            margin-bottom: var(--spacing-4);
            padding-left: var(--spacing-6);
        }
        
        .content-wrapper li {
            margin-bottom: var(--spacing-2);
        }
        
        .content-wrapper code {
            background: var(--gray-100);
            padding: var(--spacing-1) var(--spacing-2);
            border-radius: var(--radius);
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: var(--font-size-sm);
        }
        
        .content-wrapper pre {
            background: var(--gray-900);
            color: white;
            padding: var(--spacing-4);
            border-radius: var(--radius-lg);
            overflow-x: auto;
            margin: var(--spacing-4) 0;
        }
        
        .content-wrapper pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
        
        .content-wrapper blockquote {
            border-left: 4px solid var(--primary-color);
            padding-left: var(--spacing-4);
            margin: var(--spacing-6) 0;
            font-style: italic;
            color: var(--gray-600);
        }
        
        .content-wrapper table {
            width: 100%;
            border-collapse: collapse;
            margin: var(--spacing-6) 0;
        }
        
        .content-wrapper th,
        .content-wrapper td {
            padding: var(--spacing-3);
            text-align: left;
            border-bottom: 1px solid var(--gray-200);
        }
        
        .content-wrapper th {
            background: var(--gray-50);
            font-weight: 600;
        }
        
        /* Navigation breadcrumb */
        .doc-nav {
            background: var(--gray-50);
            padding: var(--spacing-4) 0;
            border-bottom: 1px solid var(--gray-200);
        }
        
        .breadcrumb {
            display: flex;
            align-items: center;
            gap: var(--spacing-2);
            font-size: var(--font-size-sm);
            color: var(--gray-600);
        }
        
        .breadcrumb a {
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .breadcrumb a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <span class="logo">⚙️</span>
                <span class="brand-name">rEngine Core</span>
            </div>
            <div class="nav-menu">
                <a href="../vision/platform-overview.html" class="nav-link">Platform Overview</a>
                <a href="../generated/" class="nav-link active">Documentation</a>
                <a href="../vision/executive-summary.html" class="nav-link">Executive Summary</a>
            </div>
        </div>
    </nav>

    <div class="doc-nav">
        <div class="container">
            <div class="breadcrumb">
                <a href="../vision/platform-overview.html">rEngine Core</a>
                <span>›</span>
                <a href="../generated/">Documentation</a>
                <span>›</span>
                <span>${title}</span>
            </div>
        </div>
    </div>

    <main class="doc-content">
        <div class="doc-header">
            <h1 class="doc-title">${title}</h1>
            <p class="doc-subtitle">rEngine Core Documentation</p>
            <div class="doc-meta">
                <span>📅 ${currentDate}</span>
                <span>⚙️ rEngine Core v1.2.2</span>
                <span>📖 Auto-Generated</span>
            </div>
        </div>
        
        <div class="content-wrapper">${content}</div>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="footer-logo">
                        <span class="logo">⚙️</span>
                        <span>rEngine Core</span>
                    </div>
                    <p>Intelligent Development Wrapper</p>
                </div>
                <div class="footer-links">
                    <div class="footer-section">
                        <h4>Platform</h4>
                        <a href="../vision/platform-overview.html">Overview</a>
                        <a href="../generated/">Documentation</a>
                    </div>
                    <div class="footer-section">
                        <h4>Resources</h4>
                        <a href="../vision/executive-summary.html">Executive Summary</a>
                        <a href="../vision/one-page-pitch.html">One-Page Pitch</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} rEngine Core. Intelligent Development Wrapper.</p>
            </div>
        </div>
    </footer>

    <script src="../vision/script.js"></script>
</body>
</html>`;

        h2 {
            font-size: 2rem;
            font-weight: 600;
            margin: 2rem 0 1rem 0;
            color: var(--rengine-primary);
            border-bottom: 2px solid var(--rengine-border);
            padding-bottom: 0.5rem;
        }

        h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
            color: var(--rengine-secondary);
        }

        h4, h5, h6 {
            font-weight: 600;
            margin: 1rem 0 0.5rem 0;
            color: var(--rengine-text);
        }

        p {
            margin-bottom: 1rem;
            color: var(--rengine-text);
        }

        .content {
            background: white;
            padding: 3rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-bottom: 3rem;
        }

        code {
            background: var(--rengine-bg-alt);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
            color: var(--rengine-primary);
        }

        pre {
            background: var(--rengine-bg-alt);
            padding: 1.5rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1rem 0;
            border-left: 4px solid var(--rengine-primary);
        }

        pre code {
            background: none;
            padding: 0;
            color: var(--rengine-text);
        }

        blockquote {
            border-left: 4px solid var(--rengine-accent);
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: var(--rengine-text-light);
        }

        ul, ol {
            margin: 1rem 0;
            padding-left: 2rem;
        }

        li {
            margin-bottom: 0.5rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--rengine-border);
        }

        th {
            background: var(--rengine-bg-alt);
            font-weight: 600;
            color: var(--rengine-primary);
        }

        .metadata {
            background: var(--rengine-bg-alt);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            border: 1px solid var(--rengine-border);
        }

        .metadata-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }

        .metadata-label {
            font-weight: 600;
            color: var(--rengine-text-light);
        }

        footer {
            background: var(--rengine-bg-alt);
            padding: 2rem 0;
            margin-top: 3rem;
            text-align: center;
            color: var(--rengine-text-light);
            border-top: 1px solid var(--rengine-border);
        }

        .footer-links {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 1rem;
        }

        .footer-links a {
            color: var(--rengine-primary);
            text-decoration: none;
        }

        .footer-links a:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .container {
                padding: 0 1rem;
            }
            
            .header-content {
                flex-direction: column;
                gap: 1rem;
            }
            
            .nav-links {
                gap: 1rem;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .content {
                padding: 2rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <div class="logo">rEngine Core</div>
                <nav class="nav-links">
                    <a href="../index.html">Home</a>
                    <a href="../README.html">Documentation</a>
                    <a href="https://github.com/lbruton/StackTrackr">GitHub</a>
                </nav>
            </div>
        </div>
    </header>

    <div class="container">
        <div class="content">
            <h1>${title}</h1>
            
            ${Object.keys(metadata).length > 0 ? `
            <div class="metadata">
                ${Object.entries(metadata).map(([key, value]) => `
                    <div class="metadata-item">
                        <span class="metadata-label">${key}:</span>
                        <span>${value}</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${content}
        </div>
    </div>

    <footer>
        <div class="container">
            <div class="footer-links">
                <a href="../index.html">Home</a>
                <a href="../README.html">Documentation</a>
                <a href="https://github.com/lbruton/StackTrackr">GitHub</a>
            </div>
            <p>Generated on ${currentDate} by rEngine Core HTML Converter</p>
            <p>© 2025 rEngine Core - Intelligent Development Wrapper</p>
        </div>
    </footer>
</body>
</html>`;
    }

    /**
     * Convert markdown to enhanced HTML
     */
    async convertMarkdownToHTML(markdownContent, filename) {
        const prompt = `Convert this Markdown documentation to well-structured HTML content. Focus on:

1. Clean, semantic HTML structure
2. Proper heading hierarchy 
3. Code blocks with syntax highlighting hints
4. Tables and lists properly formatted
5. Preserve all technical content exactly
6. Add appropriate CSS classes for styling
7. Make it professional and readable

Return ONLY the HTML content (body content), no full HTML document structure.

Markdown content:
\`\`\`markdown
${markdownContent}
\`\`\``;

        try {
            const htmlContent = await this.callWithFallback(prompt, 'gemini');
            return htmlContent;
        } catch (error) {
            console.error(`❌ Failed to convert ${filename} via MCP: ${error.message}`);
            // Fallback to basic markdown conversion
            const marked = await import('marked');
            return marked.marked(markdownContent);
        }
    }

    /**
     * Process a single markdown file
     */
    async processFile(filepath) {
        try {
            const filename = path.basename(filepath, '.md');
            const relativePath = path.relative(this.sourceDir, filepath);
            
            console.log(`📄 Processing: ${relativePath}`);
            
            // Read the markdown file
            const markdownContent = await fs.readFile(filepath, 'utf-8');
            
            if (!markdownContent.trim()) {
                console.warn(`⚠️ Skipping empty file: ${relativePath}`);
                return;
            }
            
            // Convert to HTML via MCP
            const htmlContent = await this.convertMarkdownToHTML(markdownContent, filename);
            
            // Extract title from first heading or use filename
            const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : filename.replace(/[-_]/g, ' ');
            
            // Create metadata
            const stats = await fs.stat(filepath);
            const metadata = {
                'Source File': relativePath,
                'Generated': new Date().toISOString().split('T')[0],
                'Last Modified': stats.mtime.toISOString().split('T')[0],
                'Converter': 'rEngine MCP HTML Converter'
            };
            
            // Generate full HTML document
            const fullHTML = this.getHTMLTemplate(title, htmlContent, relativePath, metadata);
            
            // Ensure output directory exists
            const outputPath = path.join(this.outputDir, `${filename}.html`);
            const outputDir = path.dirname(outputPath);
            await fs.ensureDir(outputDir);
            
            // Write HTML file
            await fs.writeFile(outputPath, fullHTML, 'utf-8');
            
            console.log(`✅ Generated: ${path.relative(process.cwd(), outputPath)}`);
            
        } catch (error) {
            console.error(`❌ Error processing ${filepath}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Process all markdown files in the source directory
     */
    async processAllFiles() {
        try {
            console.log(`🚀 Starting MCP HTML conversion process...`);
            
            // Ensure output directory exists
            await fs.ensureDir(this.outputDir);
            
            // Find all markdown files
            const files = await this.findMarkdownFiles(this.sourceDir);
            
            if (files.length === 0) {
                console.log(`⚠️ No markdown files found in ${this.sourceDir}`);
                return;
            }
            
            console.log(`📁 Found ${files.length} markdown files to convert`);
            
            // Process files sequentially to avoid rate limits
            let successful = 0;
            let failed = 0;
            
            for (const file of files) {
                try {
                    await this.processFile(file);
                    successful++;
                    
                    // Small delay to avoid overwhelming the MCP relay
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (error) {
                    console.error(`❌ Failed to process ${file}: ${error.message}`);
                    failed++;
                }
            }
            
            console.log(`\n🎉 Conversion complete!`);
            console.log(`✅ Successful: ${successful} files`);
            console.log(`❌ Failed: ${failed} files`);
            console.log(`📁 Output directory: ${this.outputDir}`);
            
        } catch (error) {
            console.error(`❌ Conversion process failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Find all markdown files recursively
     */
    async findMarkdownFiles(dir) {
        const files = [];
        
        async function walk(currentDir) {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                
                if (entry.isDirectory()) {
                    await walk(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.md')) {
                    files.push(fullPath);
                }
            }
        }
        
        await walk(dir);
        return files.sort();
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const converter = new MCPHTMLConverter();
    
    converter.processAllFiles()
        .then(() => {
            console.log('🎉 HTML conversion completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ HTML conversion failed:', error.message);
            process.exit(1);
        });
}

export default MCPHTMLConverter;
