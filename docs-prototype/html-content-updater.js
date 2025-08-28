#!/usr/bin/env node

/* eslint-env node */
/* global require, process, console, module, setTimeout */

/**
 * HTML Content Updater
 * Generates HTML files from markdown sources using a master template.
 */

require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const { marked } = require("marked");

/**
 * Secure path validation utility to prevent path traversal attacks
 */
class PathValidator {
    static validatePathComponent(component) {
        if (!component || typeof component !== "string") {
            throw new Error("Invalid path component: must be a non-empty string");
        }

        // Check for dangerous characters
        const dangerousChars = /[<>"|?*\0]/;
        if (dangerousChars.test(component)) {
            throw new Error(`Invalid characters in path component: ${component}`);
        }

        // Check for path traversal attempts
        if (component.includes("..") || component.startsWith("/") || component.includes("\\")) {
            throw new Error(`Path traversal attempt detected in component: ${component}`);
        }

        return component;
    }

    static validatePath(filePath, allowedBaseDir = process.cwd()) {
        if (!filePath || typeof filePath !== "string") {
            throw new Error("Invalid file path: path must be a non-empty string");
        }

        // Resolve the path to get absolute path
        const resolvedPath = path.resolve(filePath);
        const resolvedBase = path.resolve(allowedBaseDir);

        // Check if the resolved path is within the allowed base directory
        if (!resolvedPath.startsWith(resolvedBase)) {
            throw new Error(`Path traversal detected: ${filePath} is outside allowed directory ${allowedBaseDir}`);
        }

        return resolvedPath;
    }

    static async safeReadFile(filePath, options = "utf8") {
        const validatedPath = PathValidator.validatePath(filePath);
        return await fs.readFile(validatedPath, options);
    }

    static async safeReaddir(dirPath, options = {}) {
        const validatedPath = PathValidator.validatePath(dirPath);
        return await fs.readdir(validatedPath, options);
    }

    static async safeStat(filePath) {
        const validatedPath = PathValidator.validatePath(filePath);
        return await fs.stat(validatedPath);
    }

    static async safeWriteFile(filePath, data, options = "utf8") {
        const validatedPath = PathValidator.validatePath(filePath);
        return await fs.writeFile(validatedPath, data, options);
    }

    static async safeMkdir(dirPath, options = { recursive: true }) {
        const validatedPath = PathValidator.validatePath(dirPath);
        return await fs.mkdir(validatedPath, options);
    }
}

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
            const templatePath = path.join(process.cwd(), "docs-prototype", "template.html");
            this.templateContent = await PathValidator.safeReadFile(templatePath, "utf8");
            console.log("📄 Master HTML template loaded.");
        } catch (error) {
            console.error("❌ Fatal Error: Could not load template.html.", error);
            throw new Error("template.html not found in docs-prototype directory.");
        }
    }

    /**
     * Find all markdown source files that need to be converted.
     */
    async findAllMarkdownSources() {
        const sources = [];
        const docsSourceDir = path.join(process.cwd(), "docs-source");
        const docsProtoDir = path.join(process.cwd(), "docs-prototype/content");

        const findMdFiles = async (dir, relativePath = "") => {
            const items = await PathValidator.safeReaddir(dir);
            
            for (const item of items) {
                // Validate item before using in path operations
                const validatedItem = PathValidator.validatePathComponent(item);
                const fullPath = path.join(dir, validatedItem);
                const stat = await PathValidator.safeStat(fullPath);
                const currentRelativePath = path.join(relativePath, validatedItem);
                
                if (stat.isDirectory()) {
                    await findMdFiles(fullPath, currentRelativePath);
                } else if (validatedItem.endsWith(".md")) {
                    const htmlPath = path.join(docsProtoDir, currentRelativePath.replace(".md", ".html"));
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
                const hljs = require("highlight.js");
                const language = hljs.getLanguage(lang) ? lang : "plaintext";
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
            const markdownContent = await PathValidator.safeReadFile(source.mdPath, "utf8");
            
            // Convert markdown to HTML
            const newHtmlContent = this.markdownToHtml(markdownContent);
            
            // Inject content into the template
            const finalHtml = this.templateContent.replace(
                "<!-- CONTENT WILL BE INJECTED HERE -->",
                newHtmlContent
            );

            // Ensure the destination directory exists
            await PathValidator.safeMkdir(path.dirname(source.htmlPath), { recursive: true });
            
            // Write the final HTML file
            await PathValidator.safeWriteFile(source.htmlPath, finalHtml);
            
            console.log(`✅ Generated HTML: ${source.relativePath.replace(".md", ".html")}`);
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

${generatedFiles.map(file => `- ${file}`).join("\n")}

## Summary

The HTML generator successfully created ${this.stats.filesGenerated} HTML files from their corresponding markdown sources using the master template.
`;

        await PathValidator.safeWriteFile("docs-source/html-update-report.md", report);
        console.log("📋 HTML generation report saved: html-update-report.md");
    }

    /**
     * Main execution function.
     */
    async run() {
        console.log("🚀 Starting HTML generation from markdown sources...");
        
        try {
            // Load the template first
            await this.loadTemplate();

            // Find all markdown source files
            const sources = await this.findAllMarkdownSources();
            console.log(`📊 Found ${sources.length} markdown source files to convert.`);
            
            if (sources.length === 0) {
                console.log("ℹ️ No markdown files found in docs-source. Nothing to generate.");
                return;
            }

            const generatedFiles = [];
            
            // Generate each HTML file
            for (const source of sources) {
                const success = await this.generateHtmlFile(source);
                if (success) {
                    generatedFiles.push(source.relativePath.replace(".md", ".html"));
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
            console.error("❌ HTML generation process failed:", error);
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
