#!/usr/bin/env node

/**
 * Documentation HTML Generator
 * Converts all Markdown files in docs/ to beautiful HTML pages
 * Following our established design patterns from developmentstatus.html
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DocumentationHTMLGenerator {
    constructor() {
        this.docsDir = path.join(__dirname, '../docs');
        this.patchNotesDir = path.join(__dirname, '../patchnotes');
        this.rEnginePatchNotesDir = path.join(__dirname, '../rEngine-patchnotes');
        this.outputDir = path.join(__dirname, '../docs/html');
        this.templatePath = path.join(__dirname, 'doc-template.html');
        
        // Ensure output directory exists
        fs.ensureDirSync(this.outputDir);
        
        // Configure marked options
        marked.setOptions({
            highlight: function(code, lang) {
                return `<pre><code class="language-${lang}">${code}</code></pre>`;
            },
            gfm: true,
            breaks: false
        });
    }

    getDocumentCategory(filename) {
        const categories = {
            'VISION': { icon: '🎯', color: 'vision', title: 'Strategic Vision' },
            'MASTER_ROADMAP': { icon: '🗺️', color: 'roadmap', title: 'Master Roadmap' },
            'RENGINE': { icon: '⚙️', color: 'engine', title: 'rEngine Platform' },
            'AGENT': { icon: '🤖', color: 'agent', title: 'Agent System' },
            'BRAIN': { icon: '🧠', color: 'brain', title: 'Memory System' },
            'DOCKER': { icon: '🐳', color: 'docker', title: 'Container Management' },
            'MOBILE': { icon: '📱', color: 'mobile', title: 'Mobile Development' },
            'PROTOCOL': { icon: '📋', color: 'protocol', title: 'Protocol Guide' },
            'RSCRIBE': { icon: '📝', color: 'scribe', title: 'Document Protocol' },
            'GROQ': { icon: '⚡', color: 'groq', title: 'AI Optimization' },
            'TASK': { icon: '✅', color: 'task', title: 'Task Management' },
            'CLEANUP': { icon: '🧹', color: 'cleanup', title: 'Maintenance' },
            'QUICK_START': { icon: '🚀', color: 'quickstart', title: 'Quick Start' },
            'PATCH': { icon: '🔧', color: 'patch', title: 'Patch Notes' },
            'RENGINE': { icon: '🤖', color: 'rengine', title: 'rEngine Platform' }
        };

        for (const [key, category] of Object.entries(categories)) {
            if (filename.toUpperCase().includes(key)) {
                return category;
            }
        }

        return { icon: '📄', color: 'default', title: 'Documentation' };
    }

    getHTMLTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - rEngine Core Documentation</title>
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
            background: linear-gradient(135deg, {{HEADER_COLOR_1}} 0%, {{HEADER_COLOR_2}} 100%);
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

        .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
            color: #2c3e50;
            margin-top: 30px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .content h1 { font-size: 2.2em; border-bottom: 3px solid #007acc; padding-bottom: 10px; }
        .content h2 { font-size: 1.8em; color: #007acc; }
        .content h3 { font-size: 1.4em; color: #495057; }
        .content h4 { font-size: 1.2em; color: #6c757d; }

        .content p {
            margin-bottom: 16px;
            line-height: 1.7;
            color: #444;
        }

        .content ul, .content ol {
            margin-bottom: 16px;
            padding-left: 25px;
        }

        .content li {
            margin-bottom: 8px;
            line-height: 1.6;
        }

        .content blockquote {
            border-left: 4px solid #007acc;
            background: #f8f9fa;
            margin: 20px 0;
            padding: 15px 20px;
            border-radius: 0 6px 6px 0;
        }

        .content code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
            color: #e83e8c;
        }

        .content pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 20px 0;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
            line-height: 1.5;
        }

        .content pre code {
            background: none;
            color: inherit;
            padding: 0;
        }

        .content table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .content th, .content td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #e1e4e8;
        }

        .content th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
        }

        .content tr:hover {
            background: #f8f9fa;
        }

        .content a {
            color: #007acc;
            text-decoration: none;
            font-weight: 500;
        }

        .content a:hover {
            color: #0056b3;
            text-decoration: underline;
        }

        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            border-top: 1px solid #e1e4e8;
            text-align: center;
            color: #6c757d;
            font-size: 0.9em;
        }

        .doc-meta {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #007acc;
        }

        .doc-meta h3 {
            color: #007acc;
            margin-bottom: 10px;
            font-size: 1.1em;
        }

        .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }

        .meta-item {
            background: white;
            padding: 10px 15px;
            border-radius: 6px;
            border: 1px solid #e1e4e8;
        }

        .meta-label {
            font-weight: 600;
            color: #495057;
            font-size: 0.9em;
        }

        .meta-value {
            color: #6c757d;
            font-size: 0.9em;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            body { padding: 10px; }
            .content { padding: 20px; }
            .header { padding: 20px; }
            .nav-bar { padding: 15px 20px; }
            .nav-links { justify-content: center; }
            .header .meta { flex-direction: column; gap: 10px; }
        }

        /* Category-specific colors */
        .color-vision { --primary: #9c27b0; --secondary: #7b1fa2; }
        .color-roadmap { --primary: #007acc; --secondary: #0056b3; }
        .color-engine { --primary: #2c3e50; --secondary: #34495e; }
        .color-agent { --primary: #28a745; --secondary: #198754; }
        .color-brain { --primary: #6f42c1; --secondary: #495057; }
        .color-docker { --primary: #0db7ed; --secondary: #086dd7; }
        .color-mobile { --primary: #fd7e14; --secondary: #dc3545; }
        .color-protocol { --primary: #20c997; --secondary: #198754; }
        .color-scribe { --primary: #17a2b8; --secondary: #138496; }
        .color-groq { --primary: #ffc107; --secondary: #e0a800; }
        .color-task { --primary: #dc3545; --secondary: #c82333; }
        .color-cleanup { --primary: #6c757d; --secondary: #5a6268; }
        .color-quickstart { --primary: #28a745; --secondary: #198754; }
        .color-patch { --primary: #ff6b35; --secondary: #e55a32; }
        .color-rengine { --primary: #8b5cf6; --secondary: #7c3aed; }
        .color-default { --primary: #495057; --secondary: #6c757d; }
    </style>
</head>
<body class="color-{{CATEGORY}}">
    <div class="container">
        <header class="header">
            <div class="header-icon">{{ICON}}</div>
            <h1>{{TITLE}}</h1>
            <div class="subtitle">{{SUBTITLE}}</div>
            <div class="meta">
                <span>📁 {{FILENAME}}</span>
                <span>📅 {{LAST_UPDATED}}</span>
                <span>📊 {{FILE_SIZE}}</span>
            </div>
        </header>

        <nav class="nav-bar">
            <div class="nav-links">
                <a href="../index.html" class="nav-link">🏠 Documentation Home</a>
                <a href="../developmentstatus.html" class="nav-link">📊 Development Status</a>
                <a href="{{SOURCE_FILE}}" class="nav-link">📝 View Source MD</a>
                <a href="../json/{{JSON_FILE}}" class="nav-link">🔧 JSON Data</a>
            </div>
        </nav>

        <main class="content">
            {{CONTENT}}
        </main>

        <footer class="footer">
            <p>Generated from <strong>{{FILENAME}}</strong> • StackTrackr Documentation System • Last updated: {{LAST_UPDATED}}</p>
        </footer>
    </div>
</body>
</html>`;
    }

    async generateHTML(mdFilePath) {
        try {
            const mdContent = await fs.readFile(mdFilePath, 'utf-8');
            const filename = path.basename(mdFilePath, '.md');
            const category = this.getDocumentCategory(filename);
            
            // Get file stats
            const stats = await fs.stat(mdFilePath);
            const lastUpdated = stats.mtime.toISOString().split('T')[0];
            const fileSize = `${Math.round(stats.size / 1024)}KB`;
            
            // Convert markdown to HTML
            const htmlContent = marked(mdContent);
            
            // Extract title from first h1 or use filename
            const titleMatch = mdContent.match(/^# (.+)$/m);
            const title = titleMatch ? titleMatch[1] : filename.replace(/_/g, ' ');
            
            // Generate HTML
            let html = this.getHTMLTemplate();
            
            // Color mappings for categories
            const colorMap = {
                'vision': ['#9c27b0', '#7b1fa2'],
                'roadmap': ['#007acc', '#0056b3'],
                'engine': ['#2c3e50', '#34495e'],
                'agent': ['#28a745', '#198754'],
                'brain': ['#6f42c1', '#495057'],
                'docker': ['#0db7ed', '#086dd7'],
                'mobile': ['#fd7e14', '#dc3545'],
                'protocol': ['#20c997', '#198754'],
                'scribe': ['#17a2b8', '#138496'],
                'groq': ['#ffc107', '#e0a800'],
                'task': ['#dc3545', '#c82333'],
                'cleanup': ['#6c757d', '#5a6268'],
                'quickstart': ['#28a745', '#198754'],
                'default': ['#495057', '#6c757d']
            };
            
            const colors = colorMap[category.color] || colorMap['default'];
            
            // Replace template variables
            html = html
                .replace(/{{TITLE}}/g, title)
                .replace(/{{SUBTITLE}}/g, category.title)
                .replace(/{{ICON}}/g, category.icon)
                .replace(/{{CATEGORY}}/g, category.color)
                .replace(/{{FILENAME}}/g, filename + '.md')
                .replace(/{{LAST_UPDATED}}/g, lastUpdated)
                .replace(/{{FILE_SIZE}}/g, fileSize)
                .replace(/{{CONTENT}}/g, htmlContent)
                .replace(/{{SOURCE_FILE}}/g, `../${path.relative(this.docsDir, mdFilePath)}`)
                .replace(/{{JSON_FILE}}/g, filename + '.json')
                .replace(/{{HEADER_COLOR_1}}/g, colors[0])
                .replace(/{{HEADER_COLOR_2}}/g, colors[1]);
            
            // Create output path
            const relativePath = path.relative(this.docsDir, mdFilePath);
            const outputPath = path.join(this.outputDir, relativePath.replace('.md', '.html'));
            
            // Ensure output directory exists
            await fs.ensureDir(path.dirname(outputPath));
            
            // Write HTML file
            await fs.writeFile(outputPath, html);
            
            console.log(`✅ Generated: ${path.relative(this.docsDir, outputPath)}`);
            
            return {
                filename: filename,
                title: title,
                category: category,
                outputPath: outputPath,
                sourceFile: mdFilePath
            };
            
        } catch (error) {
            console.error(`❌ Error generating HTML for ${mdFilePath}:`, error.message);
            return null;
        }
    }

    async generateAllHTML() {
        console.log('🚀 Starting HTML documentation generation...');
        
        // Find all MD files from docs, patchnotes, and rEngine-patchnotes directories
        const docsFiles = await this.findMarkdownFiles(this.docsDir);
        const patchFiles = await this.findMarkdownFiles(this.patchNotesDir);
        const rEnginePatchFiles = await this.findMarkdownFiles(this.rEnginePatchNotesDir);
        const mdFiles = [...docsFiles, ...patchFiles, ...rEnginePatchFiles];
        console.log(`📋 Found ${mdFiles.length} markdown files`);
        
        const results = [];
        
        for (const mdFile of mdFiles) {
            const result = await this.generateHTML(mdFile);
            if (result) {
                results.push(result);
            }
        }
        
        // Generate index page
        await this.generateIndexPage(results);
        
        console.log(`🎉 Generated ${results.length} HTML files`);
        return results;
    }

    async findMarkdownFiles(dir) {
        const files = [];
        const items = await fs.readdir(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = await fs.stat(fullPath);
            
            if (stat.isDirectory()) {
                // Recursively search subdirectories
                const subFiles = await this.findMarkdownFiles(fullPath);
                files.push(...subFiles);
            } else if (item.endsWith('.md')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    async generateIndexPage(results) {
        const indexHTML = `<!DOCTYPE html>
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
        .doc-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .doc-card {
            background: white;
            border: 1px solid #e1e4e8;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            text-decoration: none;
            color: inherit;
        }
        .doc-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .doc-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 15px;
        }
        .doc-icon { font-size: 2em; }
        .doc-title { font-size: 1.2em; font-weight: 600; color: #2c3e50; }
        .doc-category { 
            background: #f8f9fa; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 0.8em; 
            color: #495057; 
        }
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
                    <div class="stat-number">${results.length}</div>
                    <div class="stat-label">Documentation Pages</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${new Set(results.map(r => r.category.color)).size}</div>
                    <div class="stat-label">Categories</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">142</div>
                    <div class="stat-label">Total Documents</div>
                </div>
            </div>
            
            <div class="doc-grid">
                ${results.map(doc => `
                    <a href="${path.relative(this.outputDir, doc.outputPath)}" class="doc-card">
                        <div class="doc-header">
                            <span class="doc-icon">${doc.category.icon}</span>
                            <div>
                                <div class="doc-title">${doc.title}</div>
                                <div class="doc-category">${doc.category.title}</div>
                            </div>
                        </div>
                    </a>
                `).join('')}
            </div>
        </main>
    </div>
</body>
</html>`;
        
        await fs.writeFile(path.join(this.outputDir, 'index.html'), indexHTML);
        console.log('✅ Generated documentation index');
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new DocumentationHTMLGenerator();
    generator.generateAllHTML().catch(console.error);
}

export { DocumentationHTMLGenerator };
