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
        const resolvedBase = path.resolve(process.cwd(), allowedBaseDir);

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
        this.marked = null;
    }

    /**
     * Initialize the marked library
     */
    async initializeMarked() {
        const { marked } = await import("marked");
        this.marked = marked;
        
        // Create custom renderer
        const renderer = {
            link(token) {
                // Handle both old and new marked.js API formats
                const href = typeof token === "string" ? token : token.href;
                const title = arguments.length > 1 ? arguments[1] : token.title;
                const text = arguments.length > 2 ? arguments[2] : token.text;
                
                // Keep a Changelog badge
                if (href === "https://keepachangelog.com/en/1.0.0/") {
                    return `<a href="${href}" target="_blank" title="${title || "Keep a Changelog"}" class="me-2">
                        <img src="https://img.shields.io/badge/changelog-Keep%20a%20Changelog-orange?style=flat&logo=markdown&logoColor=white" 
                             alt="Keep a Changelog" style="height: 24px;" class="img-fluid"/>
                    </a>`;
                }
                
                // Semantic Versioning badge
                if (href === "https://semver.org/spec/v2.0.0.html") {
                    return `<a href="${href}" target="_blank" title="${title || "Semantic Versioning"}" class="me-2">
                        <img src="https://img.shields.io/badge/versioning-Semantic%20Versioning-blue?style=flat&logo=semver&logoColor=white" 
                             alt="Semantic Versioning" style="height: 24px;" class="img-fluid"/>
                    </a>`;
                }
                
                // Default link rendering for all other links
                const titleAttr = title ? ` title="${title}"` : "";
                return `<a href="${href}"${titleAttr}>${text}</a>`;
            }
        };
        
        // Configure marked options with custom renderer
        this.marked.setOptions({
            breaks: true,
            gfm: true,
            sanitize: false,
            highlight: function(code, lang) {
                try {
                    const hljs = require("highlight.js");
                    const language = hljs.getLanguage(lang) ? lang : "plaintext";
                    return hljs.highlight(code, { language }).value;
                } catch (_e) {
                    return code; // Fallback to plain text if highlighting fails
                }
            }
        });

        // Use marked.use() to set the renderer for newer versions
        this.marked.use({ renderer });
    }

    /**
     * Load the master HTML template
     */
    async loadTemplate() {
        try {
            const templatePath = path.join(process.cwd(), "docs-html", "template.html");
            this.templateContent = await fs.readFile(templatePath, "utf8");
            console.log(`✓ Template loaded successfully from ${templatePath}`);
            return this.templateContent;
        } catch (_error) {
            throw new Error("template.html not found in docs-html directory.");
        }
    }

    /**
     * Find all markdown source files that need to be converted.
     */
    async findAllMarkdownSources() {
        const sources = [];
        const docsSourceDir = path.join(process.cwd(), "docs-source");
        const docsProtoDir = path.join(process.cwd(), "docs-html/content");

        const findMdFiles = async (dir, relativePath = "") => {
            const items = await PathValidator.safeReaddir(dir);
            
            for (const item of items) {
                // Validate item before using in path operations
                const validatedItem = PathValidator.validatePathComponent(item);
                const fullPath = path.resolve(dir, validatedItem);
                if (!fullPath.startsWith(path.resolve(dir))) {
                    throw new Error("Attempted directory traversal detected");
                }
                const stat = await PathValidator.safeStat(fullPath);
                const currentRelativePath = path.join(relativePath, validatedItem);
                const resolvedCurrentPath = path.resolve(relativePath, validatedItem);
                if (!resolvedCurrentPath.startsWith(path.resolve(relativePath))) {
                    throw new Error("Attempted directory traversal detected in relative path");
                }
                
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

        // Process main docs-source directory
        await findMdFiles(docsSourceDir);
        
        // Process specific files from root directory
        const rootFiles = ["CHANGELOG.md"];
        for (const rootFile of rootFiles) {
            const rootFilePath = path.join(process.cwd(), rootFile);
            try {
                const stat = await PathValidator.safeStat(rootFilePath);
                if (stat.isFile()) {
                    const htmlPath = path.join(docsProtoDir, rootFile.replace(".md", ".html"));
                    sources.push({
                        mdPath: rootFilePath,
                        htmlPath: htmlPath,
                        relativePath: rootFile
                    });
                }
            } catch (_error) {
                console.log(`ℹ️  ${rootFile} not found in root directory, skipping.`);
            }
        }
        
        // Process specific files from roadmaps directory
        const roadmapsFiles = ["ROADMAP.md"];
        const roadmapsDir = path.join(process.cwd(), "roadmaps");
        for (const roadmapFile of roadmapsFiles) {
            const roadmapFilePath = path.join(roadmapsDir, roadmapFile);
            try {
                const stat = await PathValidator.safeStat(roadmapFilePath);
                if (stat.isFile()) {
                    const htmlPath = path.join(docsProtoDir, roadmapFile.replace(".md", ".html"));
                    sources.push({
                        mdPath: roadmapFilePath,
                        htmlPath: htmlPath,
                        relativePath: roadmapFile
                    });
                }
            } catch (_error) {
                console.log(`ℹ️  ${roadmapFile} not found in roadmaps directory, skipping.`);
            }
        }
        
        return sources;
    }

    /**
     * Convert markdown to HTML content.
     */
    markdownToHtml(markdownContent) {
        return this.marked.parse(markdownContent);
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
            // Initialize marked library first
            await this.initializeMarked();
            
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
