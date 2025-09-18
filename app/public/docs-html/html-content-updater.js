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
            filesRemoved: 0,
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
        
        // Create custom renderer with context binding
        const self = this;
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
                
                // Convert internal .md links to hash-based navigation for SPA
                let fixedHref = href;
                if (href && href.endsWith(".md")) {
                    // Only transform relative links, not absolute URLs
                    if (!href.startsWith("http://") && !href.startsWith("https://")) {
                        // Convert relative paths to hash-based routing
                        // Examples:
                        // '../architecture/rollover-mechanism.md' -> '#architecture/rollover-mechanism'
                        // './data-model.md' -> '#user-guides/data-model'
                        // '/content/getting-started/index.md' -> '#getting-started/index'
                        // 'getting-started/index.md' -> '#getting-started/index'
                        // Handle relative links (./) with section context first
                        let hashPath;
                        if (href.startsWith("./") && self.currentSection) {
                            hashPath = href
                                .replace(/^\.\//, "")        // Remove './' prefix
                                .replace(/\.md$/, "");       // Remove '.md' extension
                            hashPath = `${self.currentSection}/${hashPath}`;
                        } else {
                            hashPath = href
                                .replace(/^\/content\//, "")  // Remove '/content/' prefix
                                .replace(/^\.\.\//, "")      // Remove '../' prefix
                                .replace(/^\.\//, "")        // Remove './' prefix
                                .replace(/^\//, "")          // Remove leading '/'
                                .replace(/\.md$/, "");       // Remove '.md' extension
                        }

                        fixedHref = `#${hashPath}`;
                    }
                }
                
                // Default link rendering for all other links
                const titleAttr = title ? ` title="${title}"` : "";
                return `<a href="${fixedHref}"${titleAttr}>${text}</a>`;
            }
        };
        
        // Add code block handler for Mermaid diagrams
        renderer.code = function(token) {
            const code = typeof token === "string" ? token : token.text;
            const lang = arguments.length > 1 ? arguments[1] : token.lang;

            // Handle Mermaid diagrams specially
            if (lang === "mermaid") {
                // Return a div with class="mermaid" for client-side rendering
                return `<div class="mermaid">${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;
            }

            // Default code block handling with syntax highlighting
            try {
                const hljs = require("highlight.js");
                const language = hljs.getLanguage(lang) ? lang : "plaintext";
                const highlighted = hljs.highlight(code, { language }).value;
                return `<pre><code class="language-${lang}">${highlighted}</code></pre>`;
            } catch (_e) {
                // Fallback to plain text if highlighting fails
                return `<pre><code class="language-${lang}">${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
            }
        };

        // Configure marked options with custom renderer
        this.marked.setOptions({
            breaks: true,
            gfm: true,
            sanitize: false
        });

        // Use marked.use() to set the renderer for newer versions
        this.marked.use({ renderer });
    }


    /**
     * Update version across all project files to match package.json version
     * Source of truth: app/public/package.json
     */
    async updateVersionsAcrossFiles() {
        try {
            // Read current version from package.json (source of truth)
            const packagePath = path.join(process.cwd(), "app", "public", "package.json");
            const packageContent = JSON.parse(await fs.readFile(packagePath, "utf8"));
            const currentVersion = packageContent.version;

            console.log(`🔄 Updating all version references to v${currentVersion}...`);

            let updatesApplied = 0;

            // 1. Update footer.html badge
            try {
                const footerPath = path.join(process.cwd(), "app", "public", "scripts", "shared", "footer.html");
                const footerContent = await fs.readFile(footerPath, "utf8");
                const updatedFooter = footerContent.replace(
                    /HexTrackr-v[\d.]+(-blue\?style=flat)/g,
                    `HexTrackr-v${currentVersion}$1`
                );

                if (footerContent !== updatedFooter) {
                    await fs.writeFile(footerPath, updatedFooter);
                    console.log("  ✅ Updated footer.html version badge");
                    updatesApplied++;
                }
            } catch (error) {
                console.warn(`  ⚠️  Could not update footer.html: ${error.message}`);
            }

            // 2. Update docker-compose.yml HEXTRACKR_VERSION
            try {
                const dockerComposePath = path.join(process.cwd(), "docker-compose.yml");
                const dockerContent = await fs.readFile(dockerComposePath, "utf8");
                const updatedDocker = dockerContent.replace(
                    /HEXTRACKR_VERSION=[\d.]+/g,
                    `HEXTRACKR_VERSION=${currentVersion}`
                );

                if (dockerContent !== updatedDocker) {
                    await fs.writeFile(dockerComposePath, updatedDocker);
                    console.log("  ✅ Updated docker-compose.yml HEXTRACKR_VERSION");
                    updatesApplied++;
                }
            } catch (error) {
                console.warn(`  ⚠️  Could not update docker-compose.yml: ${error.message}`);
            }

            // 3. Update root package.json
            try {
                const rootPackagePath = path.join(process.cwd(), "package.json");
                const rootPackageContent = JSON.parse(await fs.readFile(rootPackagePath, "utf8"));

                if (rootPackageContent.version !== currentVersion) {
                    rootPackageContent.version = currentVersion;
                    await fs.writeFile(rootPackagePath, JSON.stringify(rootPackageContent, null, 2) + "\n");
                    console.log("  ✅ Updated root package.json version");
                    updatesApplied++;
                }
            } catch (error) {
                console.warn(`  ⚠️  Could not update root package.json: ${error.message}`);
            }

            // 4. Update server.js fallback version (optional - for consistency)
            try {
                const serverPath = path.join(process.cwd(), "app", "public", "server.js");
                const serverContent = await fs.readFile(serverPath, "utf8");
                const updatedServer = serverContent.replace(
                    /HEXTRACKR_VERSION \|\| "[\d.]+"/g,
                    `HEXTRACKR_VERSION || "${currentVersion}"`
                );

                if (serverContent !== updatedServer) {
                    await fs.writeFile(serverPath, updatedServer);
                    console.log("  ✅ Updated server.js fallback version");
                    updatesApplied++;
                }
            } catch (error) {
                console.warn(`  ⚠️  Could not update server.js: ${error.message}`);
            }

            if (updatesApplied > 0) {
                console.log(`✨ Version sync complete: ${updatesApplied} files updated to v${currentVersion}`);
            } else {
                console.log(`✓ All files already at v${currentVersion}`);
            }

        } catch (error) {
            console.warn("⚠️  Could not read source package.json:", error.message);
            // Non-fatal - continue with HTML generation
        }
    }

    /**
     * Legacy method name for backward compatibility
     * @deprecated Use updateVersionsAcrossFiles() instead
     */
    async updateFooterVersion() {
        return this.updateVersionsAcrossFiles();
    }

    /**
     * Load the master HTML template
     */
    async loadTemplate() {
        try {
            const templatePath = path.join(process.cwd(), "app", "public", "docs-html", "template.html");
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
        const docsSourceDir = path.join(process.cwd(), "app", "public", "docs-source");
        const docsProtoDir = path.join(process.cwd(), "app", "public", "docs-html/content");

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

        // Process main docs-source directory (including root files like ROADMAP.md and CHANGELOG.md)
        await findMdFiles(docsSourceDir);
        
        return sources;
    }

    /**
     * Convert markdown to HTML content.
     * @param {string} markdownContent - The markdown content to convert
     * @param {string} [currentSection] - The current section context for relative links
     */
    markdownToHtml(markdownContent, currentSection = null) {
        // Store the current section for the link renderer
        this.currentSection = currentSection;
        return this.marked.parse(markdownContent);
    }


    /**
     * Generate a single HTML file from a markdown source using the template.
     */
    async generateHtmlFile(source) {
        try {
            // Read markdown content
            const markdownContent = await PathValidator.safeReadFile(source.mdPath, "utf8");
            
            // Extract section from the source path for link context
            const pathParts = source.relativePath.split("/");
            const currentSection = pathParts.length > 1 ? pathParts[0] : null;

            // Convert markdown to HTML
            const newHtmlContent = this.markdownToHtml(markdownContent, currentSection);

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
     * Generate content manifest for dynamic navigation
     */
    async generateContentManifest(sources) {
        const manifest = {
            generated: new Date().toISOString(),
            sections: {},
            specialFiles: {},
            totalFiles: sources.length
        };

        // Process regular sectioned files
        for (const source of sources) {
            const parts = source.relativePath.split("/");
            
            // Handle root-level special files
            if (parts.length === 1) {
                const fileName = parts[0].replace(".md", "");
                const upperFileName = fileName.toUpperCase();
                
                // Special root files (CHANGELOG, ROADMAP, etc.)
                if (["CHANGELOG", "ROADMAP", "SPRINT", "OVERVIEW"].includes(upperFileName)) {
                    manifest.specialFiles[fileName.toLowerCase()] = {
                        file: fileName,
                        title: this.sanitizeTitle(fileName),
                        type: "special",
                        path: `${fileName}.html`
                    };
                }
                continue;
            }

            // Handle sectioned files
            const sectionName = parts[0];
            const fileName = parts[1].replace(".md", "");
            
            if (!manifest.sections[sectionName]) {
                manifest.sections[sectionName] = {
                    title: this.sanitizeTitle(sectionName),
                    icon: this.getSectionIcon(sectionName),
                    indexFile: `${sectionName}/index`,
                    children: {}
                };
            }

            // Skip index files as they're handled at section level
            if (fileName !== "index") {
                manifest.sections[sectionName].children[fileName] = {
                    file: `${sectionName}/${fileName}`,
                    title: this.sanitizeTitle(fileName),
                    path: `${sectionName}/${fileName}.html`
                };
            }
        }

        // Write manifest file
        const manifestPath = path.join(process.cwd(), "app", "public", "docs-html", "content-manifest.json");
        await PathValidator.safeWriteFile(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log(`📝 Content manifest generated: ${Object.keys(manifest.sections).length} sections, ${manifest.totalFiles} total files`);
        return manifest;
    }

    /**
     * Sanitize filename to proper title (kebab-case to Title Case)
     */
    sanitizeTitle(filename) {
        return filename
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    }

    /**
     * Get appropriate icon for section
     */
    getSectionIcon(sectionName) {
        const iconMap = {
            "overview": "fas fa-home",
            "getting-started": "fas fa-rocket",
            "user-guides": "fas fa-users",
            "api-reference": "fas fa-code",
            "architecture": "fas fa-building",
            "development": "fas fa-hammer",
            "security": "fas fa-shield-alt",
            "white-papers": "fas fa-file-alt",
            "roadmap": "fas fa-map",
            "changelog": "fas fa-list",
            "sprint": "fas fa-running"
        };
        return iconMap[sectionName] || "fas fa-file-alt";
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
Files Removed: ${this.stats.filesRemoved}
Errors: ${this.stats.errors}

## Generated Files

${generatedFiles.map(file => `- ${file}`).join("\n")}

## Summary

The HTML generator successfully created ${this.stats.filesGenerated} HTML files from their corresponding markdown sources using the master template.
${this.stats.filesRemoved > 0 ? `\nAdditionally, ${this.stats.filesRemoved} orphaned HTML files were removed that no longer have corresponding markdown sources.` : ""}
`;

        await PathValidator.safeWriteFile("logs/docs-source/html-update-report.md", report);
        console.log("📋 HTML generation report saved: logs/docs-source/html-update-report.md");
    }

    /**
     * Clean up HTML files that no longer have corresponding markdown sources
     */
    async cleanupDeletedFiles(generatedFiles) {
        try {
            const contentDir = path.join(process.cwd(), "app", "public", "docs-html/content");
            this.stats.filesRemoved = 0;
            
            // Recursive function to check all directories
            const checkDirectory = async (dir, relativePath = "") => {
                const items = await PathValidator.safeReaddir(dir, { withFileTypes: true });
                
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    const currentRelPath = path.join(relativePath, item.name);
                    
                    if (item.isDirectory()) {
                        // Recursively check subdirectories
                        await checkDirectory(fullPath, currentRelPath);
                        
                        // Check if directory is now empty and remove it if it is
                        const remainingItems = await PathValidator.safeReaddir(fullPath);
                        if (remainingItems.length === 0) {
                            try {
                                await fs.rmdir(fullPath);
                                console.log(`🗑️  Removed empty directory: ${currentRelPath}`);
                            } catch (error) {
                                console.error(`❌ Failed to remove directory ${currentRelPath}: ${error.message}`);
                            }
                        }
                    } else if (item.name.endsWith(".html")) {
                        // Check if this HTML file was generated in the current run
                        const relativePosixPath = currentRelPath.split(path.sep).join("/");
                        if (!generatedFiles.includes(relativePosixPath)) {
                            try {
                                await fs.unlink(fullPath);
                                console.log(`🗑️  Removed orphaned HTML file: ${relativePosixPath}`);
                                this.stats.filesRemoved++;
                            } catch (error) {
                                console.error(`❌ Failed to remove file ${relativePosixPath}: ${error.message}`);
                            }
                        }
                    }
                }
            };
            
            // Start checking from the content root directory
            await checkDirectory(contentDir);
            
            if (this.stats.filesRemoved > 0) {
                console.log(`🧹 Cleanup complete: removed ${this.stats.filesRemoved} orphaned HTML files`);
            } else {
                console.log("✓ No orphaned HTML files found, nothing to clean up");
            }
        } catch (error) {
            console.error(`❌ Cleanup process failed: ${error.message}`);
        }
    }

    /**
     * Main execution function.
     */
    async run() {
        console.log("🚀 Starting HTML generation from markdown sources...");

        try {
            // Initialize marked library first
            await this.initializeMarked();

            // Update version across all project files to maintain consistency
            await this.updateVersionsAcrossFiles();

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
            
            // Clean up deleted files
            await this.cleanupDeletedFiles(generatedFiles);
            
            // Generate content manifest for dynamic navigation
            await this.generateContentManifest(sources);
            
            // Generate summary report
            await this.generateUpdateReport(generatedFiles);
            
            const elapsed = (Date.now() - this.stats.startTime) / 1000;
            console.log(`
🎉 HTML generation complete!`);
            console.log(`📈 Generated ${this.stats.filesGenerated} files in ${elapsed.toFixed(1)}s`);
            
            if (this.stats.filesRemoved > 0) {
                console.log(`🧹 Removed ${this.stats.filesRemoved} orphaned HTML files`);
            }
            
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
