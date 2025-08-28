#!/usr/bin/env node
/* eslint-disable no-undef */

/**
 * HTML Content Updater
 * Generates HTML files from markdown sources using a master template.
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');

class HtmlContentUpdater {
    constructor() {
        this.stats = {
            startTime: Date.now(),
            filesGenerated: 0,
            errors: 0
        };
        this.templateContent = null;
    }

    /**
     * Load the master HTML template
     */
    async loadTemplate() {
        try {
            const templatePath = path.join(process.cwd(), 'docs-prototype', 'template.html');
            this.templateContent = await fs.readFile(templatePath, 'utf8');
            console.log('📄 Master HTML template loaded.');
        } catch (error) {
            console.error('❌ Fatal Error: Could not load template.html.', error);
            throw new Error('template.html not found in docs-prototype directory.');
        }
    }

    /**
     * Find all markdown source files that need to be converted.
     */
    async findAllMarkdownSources() {
        const sources = [];
        const docsSourceDir = path.join(process.cwd(), 'docs-source');
        const docsProtoDir = path.join(process.cwd(), 'docs-prototype/content');

        const findMdFiles = async (dir, relativePath = '') => {
            const items = await fs.readdir(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = await fs.stat(fullPath);
                const currentRelativePath = path.join(relativePath, item);
                
                if (stat.isDirectory()) {
                    await findMdFiles(fullPath, currentRelativePath);
                } else if (item.endsWith('.md')) {
                    const htmlPath = path.join(docsProtoDir, currentRelativePath.replace('.md', '.html'));
                    sources.push({
                        mdPath: fullPath,
                        htmlPath: htmlPath,
                        relativePath: currentRelativePath
                    });
                }
            }
        };

        await findMdFiles(docsSourceDir);
        return sources;
    }

    /**
     * Convert markdown to HTML content.
     */
    markdownToHtml(markdownContent) {
        marked.setOptions({
            breaks: true,
            gfm: true,
            sanitize: false,
            highlight: function(code, lang) {
                const hljs = require('highlight.js');
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        });
        return marked.parse(markdownContent);
    }

    /**
     * Generate a single HTML file from a markdown source using the template.
     */
    async generateHtmlFile(source) {
        try {
            // Read markdown content
            const markdownContent = await fs.readFile(source.mdPath, 'utf8');
            
            // Convert markdown to HTML
            const newHtmlContent = this.markdownToHtml(markdownContent);
            
            // Inject content into the template
            const finalHtml = this.templateContent.replace(
                '<!-- CONTENT WILL BE INJECTED HERE -->',
                newHtmlContent
            );

            // Ensure the destination directory exists
            await fs.mkdir(path.dirname(source.htmlPath), { recursive: true });
            
            // Write the final HTML file
            await fs.writeFile(source.htmlPath, finalHtml);
            
            console.log(`✅ Generated HTML: ${source.relativePath.replace('.md', '.html')}`);
            this.stats.filesGenerated++;
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to generate ${source.relativePath}: ${error.message}`);
            this.stats.errors++;
            return false;
        }
    }

    /**
     * Generate update report.
     */
    async generateUpdateReport(generatedFiles) {
        const elapsed = (Date.now() - this.stats.startTime) / 1000;
        
        const report = `# HTML Generation Report

Generated: ${new Date().toISOString()}
Duration: ${elapsed.toFixed(1)}s
Files Generated: ${this.stats.filesGenerated}
Errors: ${this.stats.errors}

## Generated Files

${generatedFiles.map(file => `- ${file}`).join('\n')}

## Summary

The HTML generator successfully created ${this.stats.filesGenerated} HTML files from their corresponding markdown sources using the master template.
`;

        await fs.writeFile('docs-source/html-update-report.md', report);
        console.log('📋 HTML generation report saved: html-update-report.md');
    }

    /**
     * Main execution function.
     */
    async run() {
        console.log('🚀 Starting HTML generation from markdown sources...');
        
        try {
            // Load the template first
            await this.loadTemplate();

            // Find all markdown source files
            const sources = await this.findAllMarkdownSources();
            console.log(`📊 Found ${sources.length} markdown source files to convert.`);
            
            if (sources.length === 0) {
                console.log('ℹ️ No markdown files found in docs-source. Nothing to generate.');
                return;
            }

            const generatedFiles = [];
            
            // Generate each HTML file
            for (const source of sources) {
                const success = await this.generateHtmlFile(source);
                if (success) {
                    generatedFiles.push(source.relativePath.replace('.md', '.html'));
                }
                // Small delay to prevent overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Generate summary report
            await this.generateUpdateReport(generatedFiles);
            
            const elapsed = (Date.now() - this.stats.startTime) / 1000;
            console.log(`
🎉 HTML generation complete!`);
            console.log(`📈 Generated ${this.stats.filesGenerated} files in ${elapsed.toFixed(1)}s`);
            
            if (this.stats.errors > 0) {
                console.log(`⚠️  ${this.stats.errors} errors encountered during generation.`);
            }
            
        } catch (error) {
            console.error('❌ HTML generation process failed:', error);
            process.exit(1);
        }
    }
}

// Run if called directly
if (require.main === module) {
    const updater = new HtmlContentUpdater();
    updater.run().catch(console.error);
}

module.exports = HtmlContentUpdater;
