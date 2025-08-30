#!/usr/bin/env node

/**
 * StackTrackr Application Documentation Sync
 * 
 * This script copies all StackTrackr-specific documentation from the main docs/generated
 * folder to the StackTrackr application's local docs/html/ folder for easy access.
 */

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StackTrackrDocSync {
    constructor() {
        this.sourceDir = path.join(__dirname, 'docs/generated');
        this.targetDir = path.join(__dirname, 'rProjects/StackTrackr/docs');
        this.htmlTargetDir = path.join(this.targetDir, 'html');
    }

    async syncDocumentation() {
        console.log('🔄 Syncing StackTrackr Application Documentation...');
        
        try {
            // Ensure target directories exist
            await fs.ensureDir(this.htmlTargetDir);
            
            // Find all StackTrackr-related documentation
            const stackTrackrDocs = await this.findStackTrackrDocs();
            
            console.log(`📚 Found ${stackTrackrDocs.length} StackTrackr documentation files`);
            
            // Copy markdown files
            const mdFiles = stackTrackrDocs.filter(file => file.endsWith('.md'));
            await this.copyFiles(mdFiles, this.targetDir);
            
            // Copy HTML files
            const htmlFiles = await this.findStackTrackrHtmlDocs();
            await this.copyFiles(htmlFiles, this.htmlTargetDir);
            
            // Create index file
            await this.createDocumentationIndex(mdFiles, htmlFiles);
            
            console.log('✅ StackTrackr documentation sync complete!');
            console.log(`📁 Documentation available at: rProjects/StackTrackr/docs/`);
            
        } catch (error) {
            console.error('❌ Error syncing documentation:', error);
            throw error;
        }
    }

    async findStackTrackrDocs() {
        const pattern = '**/StackTrackr/**/*.md';
        const files = await glob(pattern, { cwd: this.sourceDir });
        return files.map(file => path.join(this.sourceDir, file));
    }

    async findStackTrackrHtmlDocs() {
        const htmlPattern = '**/StackTrackr/**/*.html';
        const files = await glob(htmlPattern, { cwd: path.join(this.sourceDir, 'html') }) || [];
        return files.map(file => path.join(this.sourceDir, 'html', file));
    }

    async copyFiles(files, targetDir) {
        for (const file of files) {
            const sourcePath = file;
            const relativePath = path.relative(this.sourceDir, sourcePath);
            const targetPath = path.join(targetDir, relativePath);
            
            await fs.ensureDir(path.dirname(targetPath));
            await fs.copy(sourcePath, targetPath);
            
            console.log(`📄 Copied: ${relativePath}`);
        }
    }

    async createDocumentationIndex(mdFiles, htmlFiles) {
        const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StackTrackr Application Documentation</title>
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
            background: linear-gradient(135deg, #ff6b35, #e55a32);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.2em;
            margin-bottom: 10px;
            font-weight: 300;
        }

        .content {
            padding: 40px;
        }

        .section {
            margin-bottom: 40px;
        }

        .section h2 {
            color: #2c3e50;
            border-bottom: 2px solid #ff6b35;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .doc-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }

        .doc-card {
            background: #f8f9fa;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
            text-decoration: none;
            color: inherit;
        }

        .doc-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border-color: #ff6b35;
        }

        .doc-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: #2c3e50;
        }

        .doc-type {
            background: #ff6b35;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 500;
        }

        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #ff6b35;
            text-decoration: none;
            font-weight: 500;
        }

        .back-link:hover {
            text-decoration: underline;
        }

        .stats {
            background: #e8f4fd;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #007acc;
        }

        .stats h3 {
            color: #007acc;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>💎 StackTrackr Application Documentation</h1>
            <div class="subtitle">Comprehensive Development Documentation</div>
        </header>
        
        <main class="content">
            <a href="../index.html" class="back-link">← Back to StackTrackr Application</a>
            
            <div class="stats">
                <h3>📊 Documentation Overview</h3>
                <p><strong>Total Documentation Files:</strong> ${mdFiles.length + htmlFiles.length}</p>
                <p><strong>Markdown Files:</strong> ${mdFiles.length} | <strong>HTML Files:</strong> ${htmlFiles.length}</p>
                <p><strong>Last Updated:</strong> ${new Date().toLocaleString()}</p>
            </div>

            ${htmlFiles.length > 0 ? `
            <div class="section">
                <h2>📖 HTML Documentation</h2>
                <div class="doc-grid">
                    ${htmlFiles.map(file => {
                        const fileName = path.basename(file, '.html');
                        const relativePath = path.relative(path.join(this.sourceDir, 'html'), file);
                        return `
                        <a href="html/${relativePath}" class="doc-card">
                            <div class="doc-title">${fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                            <span class="doc-type">HTML</span>
                        </a>`;
                    }).join('')}
                </div>
            </div>
            ` : ''}

            <div class="section">
                <h2>📝 Source Documentation</h2>
                <div class="doc-grid">
                    ${mdFiles.map(file => {
                        const fileName = path.basename(file, '.md');
                        const relativePath = path.relative(this.sourceDir, file);
                        const category = path.dirname(relativePath).split('/').pop();
                        return `
                        <a href="${relativePath}" class="doc-card">
                            <div class="doc-title">${fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                            <span class="doc-type">${category.toUpperCase()}</span>
                        </a>`;
                    }).join('')}
                </div>
            </div>
        </main>
    </div>
</body>
</html>`;

        const indexPath = path.join(this.targetDir, 'index.html');
        await fs.writeFile(indexPath, indexContent);
        console.log('📄 Created documentation index at docs/index.html');
    }
}

// Execute if run directly
const sync = new StackTrackrDocSync();
sync.syncDocumentation().catch(console.error);

export default StackTrackrDocSync;
