#!/usr/bin/env node

/**
 * rEngine Core: Claude HTML Documentation Generator
 * Converts Markdown documentation to professional HTML with rEngine Core branding
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class ClaudeHTMLGenerator {
    constructor() {
        this.apiKey = process.env.ANTHROPIC_API_KEY;
        this.inputDir = '../docs/generated';
        this.outputDir = '../html-docs/generated';
        this.templateDir = '../html-docs/vision';
        this.rateLimit = 1000; // 1 second between requests
        
        // rEngine Core branding
        this.branding = {
            name: 'rEngine Core',
            tagline: 'Intelligent Development Wrapper',
            colors: {
                primary: '#6366f1',
                secondary: '#8b5cf6',
                accent: '#06b6d4'
            }
        };
    }

    async validateAPI() {
        if (!this.apiKey) {
            console.log('❌ No ANTHROPIC_API_KEY found in environment');
            console.log('📝 Please add your Claude API key to .env file');
            return false;
        }

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
                    max_tokens: 50,
                    messages: [{
                        role: 'user',
                        content: 'Say "API Ready" and nothing else.'
                    }]
                })
            });

            if (!response.ok) {
                console.log('❌ Claude API Error:', response.status);
                return false;
            }

            console.log('✅ Claude API validated successfully');
            return true;
        } catch (error) {
            console.log('❌ Claude API connection failed:', error.message);
            return false;
        }
    }

    async convertMarkdownToHTML(markdown, filename) {
        const prompt = `Convert this Markdown documentation to professional HTML with rEngine Core branding.

REQUIREMENTS:
1. Use rEngine Core branding (colors: #6366f1, #8b5cf6, #06b6d4)
2. Include navigation, responsive design, professional styling
3. Maintain all technical content and code blocks
4. Add "rEngine Core" header and "Intelligent Development Wrapper" tagline
5. Use Inter font family
6. Include syntax highlighting for code blocks
7. Make it responsive and mobile-friendly

MARKDOWN CONTENT:
${markdown}

Return ONLY the complete HTML document with embedded CSS.`;

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 4000,
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
            console.log(`❌ Error converting ${filename}:`, error.message);
            return null;
        }
    }

    async generateHTMLDocs() {
        console.log('🚀 rEngine Core: Claude HTML Generator Starting...');
        
        // Validate API
        if (!(await this.validateAPI())) {
            return;
        }

        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // Get all markdown files
        const markdownFiles = fs.readdirSync(this.inputDir)
            .filter(file => file.endsWith('.md'))
            .sort();

        console.log(`📁 Found ${markdownFiles.length} markdown files to convert`);

        let converted = 0;
        let failed = 0;

        for (const file of markdownFiles) {
            const inputPath = path.join(this.inputDir, file);
            const outputPath = path.join(this.outputDir, file.replace('.md', '.html'));

            console.log(`\n🔄 Converting: ${file}`);

            try {
                const markdown = fs.readFileSync(inputPath, 'utf8');
                const html = await this.convertMarkdownToHTML(markdown, file);

                if (html) {
                    fs.writeFileSync(outputPath, html);
                    console.log(`✅ Generated: ${file.replace('.md', '.html')}`);
                    converted++;
                } else {
                    console.log(`❌ Failed: ${file}`);
                    failed++;
                }

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, this.rateLimit));

            } catch (error) {
                console.log(`❌ Error processing ${file}:`, error.message);
                failed++;
            }
        }

        console.log(`\n🎉 HTML Generation Complete!`);
        console.log(`✅ Converted: ${converted} files`);
        console.log(`❌ Failed: ${failed} files`);
        console.log(`📁 Output: ${this.outputDir}`);
    }

    async generateIndex() {
        console.log('\n📋 Generating index.html...');

        const htmlFiles = fs.readdirSync(this.outputDir)
            .filter(file => file.endsWith('.html'))
            .sort();

        const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>rEngine Core Documentation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
        }
        .logo {
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }
        .tagline {
            color: #64748b;
            font-size: 1.2rem;
            font-weight: 500;
        }
        .docs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        .doc-card {
            padding: 2rem;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            transition: all 0.3s ease;
            text-decoration: none;
            color: inherit;
        }
        .doc-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-color: #6366f1;
        }
        .doc-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        .doc-desc {
            color: #64748b;
            line-height: 1.6;
        }
        .stats {
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚙️ rEngine Core</div>
            <div class="tagline">Intelligent Development Wrapper</div>
            <p style="margin-top: 1rem; color: #64748b;">Complete Documentation Portal</p>
        </div>

        <div class="docs-grid">
            ${htmlFiles.map(file => `
                <a href="${file}" class="doc-card">
                    <div class="doc-title">${file.replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div class="doc-desc">rEngine Core documentation for ${file.replace('.html', '')}</div>
                </a>
            `).join('')}
        </div>

        <div class="stats">
            <strong>${htmlFiles.length}</strong> documentation files available
        </div>
    </div>
</body>
</html>`;

        fs.writeFileSync(path.join(this.outputDir, 'index.html'), indexHTML);
        console.log('✅ Generated: index.html');
    }
}

// Run the generator
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new ClaudeHTMLGenerator();
    
    generator.generateHTMLDocs()
        .then(() => generator.generateIndex())
        .then(() => {
            console.log('\n🎯 rEngine Core: HTML Documentation Generation Complete!');
            console.log('🌐 Open html-docs/generated/index.html to view the documentation portal');
        })
        .catch(error => {
            console.error('❌ Generation failed:', error);
            process.exit(1);
        });
}

export default ClaudeHTMLGenerator;
