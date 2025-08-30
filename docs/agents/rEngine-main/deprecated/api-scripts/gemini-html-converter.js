#!/usr/bin/env node

// Gemini HTML Documentation Converter
// Converts MD files to high-quality HTML documentation using Gemini
// Operates on docs/generated/ MD files and outputs to html-docs/generated/

import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

class GeminiHTMLConverter {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            console.error('❌ Error: GEMINI_API_KEY not found in .env. Please add it.');
            process.exit(1);
        }
        
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
        this.sourceDir = path.join(process.cwd(), 'docs/generated');
        this.outputDir = path.join(process.cwd(), 'html-docs/generated');
        
        console.log(`🎨 Gemini HTML Converter initialized`);
        console.log(`📂 Source: ${this.sourceDir}`);
        console.log(`📁 Output: ${this.outputDir}`);
    }

    /**
     * Get the unified HTML template with rEngine branding
     */
    getHTMLTemplate(title, content, relativePath, metadata = {}) {
        const currentDate = new Date().toISOString().split('T')[0];
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - StackTrackr Documentation</title>
    <style>
        :root {
            --rengine-primary: #667eea;
            --rengine-secondary: #764ba2;
            --rengine-accent: #495057;
            --rengine-accent-light: #6c757d;
            --status-success: #28a745;
            --status-warning: #ffc107;
            --status-danger: #dc3545;
            --status-info: #007acc;
            --text-primary: #333;
            --text-secondary: #666;
            --text-muted: #888;
            --bg-primary: #ffffff;
            --bg-secondary: #f8f9fa;
            --border-color: #e1e4e8;
            --shadow-heavy: 0 20px 40px rgba(0,0,0,0.1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background: linear-gradient(135deg, var(--rengine-primary) 0%, var(--rengine-secondary) 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: var(--bg-primary);
            border-radius: 15px;
            box-shadow: var(--shadow-heavy);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, var(--rengine-accent) 0%, var(--rengine-accent-light) 100%);
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
            background: var(--bg-secondary);
            padding: 15px 30px;
            border-bottom: 1px solid var(--border-color);
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
            background: var(--status-info);
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
            color: var(--text-primary); 
            margin-top: 2em; 
            margin-bottom: 0.5em; 
        }
        .content h1 { font-size: 2em; border-bottom: 2px solid var(--rengine-primary); padding-bottom: 0.5em; }
        .content h2 { font-size: 1.5em; }
        .content h3 { font-size: 1.3em; }
        
        .content pre { 
            background: var(--bg-secondary); 
            padding: 1em; 
            border-radius: 5px; 
            overflow-x: auto; 
            margin: 1em 0;
            border: 1px solid var(--border-color);
        }
        
        .content code { 
            background: var(--bg-secondary); 
            padding: 0.2em 0.4em; 
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
        }
        
        .content blockquote {
            border-left: 4px solid var(--rengine-primary);
            margin: 1em 0;
            padding-left: 1em;
            color: var(--text-secondary);
            background: var(--bg-secondary);
            padding: 1em 1em 1em 2em;
            border-radius: 5px;
        }
        
        .content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            overflow: hidden;
        }
        
        .content th, .content td {
            border: 1px solid var(--border-color);
            padding: 0.75em;
            text-align: left;
        }
        
        .content th {
            background: var(--bg-secondary);
            font-weight: 600;
            color: var(--text-primary);
        }

        .content a {
            color: var(--status-info);
            text-decoration: none;
        }

        .content a:hover {
            text-decoration: underline;
        }

        .metadata {
            background: var(--bg-secondary);
            padding: 1em;
            border-radius: 5px;
            margin-bottom: 2em;
            font-size: 0.9em;
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
        }
        
        .footer {
            background: var(--bg-secondary);
            padding: 20px 30px;
            border-top: 1px solid var(--border-color);
            text-align: center;
            color: var(--text-secondary);
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
            color: var(--rengine-accent);
        }

        .footer .version {
            color: var(--text-muted);
            font-style: italic;
        }

        .footer .divider {
            color: var(--text-muted);
            opacity: 0.5;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            .container {
                border-radius: 10px;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 1.8em;
            }
            
            .content {
                padding: 20px;
            }
            
            .nav-bar {
                padding: 10px 20px;
            }
            
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
                <span>📅 ${currentDate}</span>
                ${metadata.category ? `<span>📂 ${metadata.category}</span>` : ''}
            </div>
        </header>
        
        <nav class="nav-bar">
            <div class="nav-links">
                <a href="../../html-docs/documentation.html" class="nav-link">🏠 Documentation Portal</a>
                <a href="../index.html" class="nav-link">📚 All Docs</a>
                <a href="../../html-docs/developmentstatus.html" class="nav-link">📊 Development Status</a>
            </div>
        </nav>
        
        <main class="content">
            <div class="metadata">
                <strong>📂 Source File:</strong> ${relativePath} | 
                <strong>🕒 Generated:</strong> ${new Date().toLocaleString()} |
                <strong>🎨 Engine:</strong> Gemini HTML Converter
            </div>
            ${content}
        </main>
        
        <footer class="footer">
            <div class="branding">
                <span>Generated from the <span class="system-name">rScribe Document System</span></span>
                <span class="divider">•</span>
                <span class="system-name">rEngine</span> <span class="version">(v2.1.0)</span>
                <span class="divider">•</span>
                <span>Last updated: ${currentDate}</span>
            </div>
        </footer>
    </div>
</body>
</html>`;
    }

    /**
     * Find all MD files in the source directory
     */
    async findMarkdownFiles() {
        const files = [];
        
        const findInDir = async (dir) => {
            const items = await fs.readdir(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = await fs.stat(fullPath);
                
                if (stat.isDirectory()) {
                    await findInDir(fullPath);
                } else if (item.endsWith('.md')) {
                    const relativePath = path.relative(this.sourceDir, fullPath);
                    files.push({
                        fullPath,
                        relativePath,
                        name: path.basename(item, '.md')
                    });
                }
            }
        };
        
        await findInDir(this.sourceDir);
        return files;
    }

    /**
     * Convert markdown to HTML using Gemini
     */
    async convertWithGemini(markdownContent, title, relativePath) {
        const prompt = `Please convert this markdown content to clean, well-formatted HTML. Focus on:
1. Proper semantic HTML structure
2. Clear heading hierarchy
3. Well-formatted code blocks with syntax highlighting
4. Clean table formatting
5. Proper list structures

Only return the HTML content (not the full page template), as it will be inserted into a template:

${markdownContent}`;

        try {
            const response = await axios.post(
                `${this.apiEndpoint}?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                return response.data.candidates[0].content.parts[0].text.trim();
            } else {
                throw new Error('Invalid response structure from Gemini');
            }
        } catch (error) {
            console.warn(`⚠️  Gemini conversion failed for ${title}, falling back to marked.js`);
            console.warn(`Error: ${error.message}`);
            
            // Fallback to marked.js
            return marked(markdownContent);
        }
    }

    /**
     * Convert a single markdown file to HTML
     */
    async convertFile(file) {
        try {
            const markdownContent = await fs.readFile(file.fullPath, 'utf8');
            
            // Skip empty files
            if (!markdownContent.trim()) {
                console.log(`⏭️  Skipping empty file: ${file.relativePath}`);
                return;
            }

            console.log(`🎨 Converting: ${file.relativePath}`);
            
            // Convert with Gemini
            const htmlContent = await this.convertWithGemini(markdownContent, file.name, file.relativePath);
            
            // Read JSON metadata if available
            let metadata = {};
            const jsonPath = file.fullPath.replace('/generated/', '/generated/json/').replace('.md', '.json');
            if (await fs.pathExists(jsonPath)) {
                try {
                    metadata = await fs.readJson(jsonPath);
                } catch (error) {
                    console.warn(`⚠️  Could not read metadata for ${file.name}`);
                }
            }

            // Generate full HTML page
            const fullHTML = this.getHTMLTemplate(file.name, htmlContent, file.relativePath, metadata);
            
            // Save to output directory
            const outputPath = path.join(this.outputDir, file.relativePath.replace('.md', '.html'));
            await fs.ensureDir(path.dirname(outputPath));
            await fs.writeFile(outputPath, fullHTML, 'utf8');
            
            console.log(`✅ HTML saved: ${outputPath}`);
            
            // Small delay to respect API limits
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`❌ Error converting ${file.relativePath}:`, error.message);
        }
    }

    /**
     * Convert all markdown files to HTML
     */
    async convertAll() {
        console.log(`🔍 Scanning for markdown files...`);
        
        const files = await this.findMarkdownFiles();
        console.log(`📊 Found ${files.length} markdown files to convert`);
        
        if (files.length === 0) {
            console.log(`ℹ️  No markdown files found in ${this.sourceDir}`);
            return;
        }

        // Create output directory
        await fs.ensureDir(this.outputDir);
        
        let successful = 0;
        let failed = 0;
        
        for (const file of files) {
            try {
                await this.convertFile(file);
                successful++;
            } catch (error) {
                console.error(`❌ Failed to convert ${file.relativePath}:`, error.message);
                failed++;
            }
        }
        
        console.log(`\n🎉 Conversion complete!`);
        console.log(`✅ Successful: ${successful}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📁 HTML files saved to: ${this.outputDir}`);
    }

    /**
     * Convert specific files by pattern
     */
    async convertPattern(pattern) {
        const files = await this.findMarkdownFiles();
        const matchingFiles = files.filter(file => 
            file.relativePath.includes(pattern) || file.name.includes(pattern)
        );
        
        console.log(`📊 Found ${matchingFiles.length} files matching pattern: ${pattern}`);
        
        for (const file of matchingFiles) {
            await this.convertFile(file);
        }
    }
}

// Main execution
async function main() {
    const converter = new GeminiHTMLConverter();
    
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // Convert all files
        await converter.convertAll();
    } else {
        // Convert specific pattern
        await converter.convertPattern(args[0]);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default GeminiHTMLConverter;
