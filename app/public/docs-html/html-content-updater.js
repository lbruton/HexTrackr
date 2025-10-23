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
            },

            // Add heading handler to properly process {#id} anchor syntax
            heading(token) {
                // Handle both old and new marked.js API formats
                const text = typeof token === "string" ? token : token.text;
                const level = arguments.length > 1 ? arguments[1] : token.depth;

                // Check for {#id} syntax in the heading text
                const anchorMatch = text.match(/^(.+?)\s*\{#([^}]+)\}$/);
                if (anchorMatch) {
                    const headingText = anchorMatch[1].trim();
                    const id = anchorMatch[2].trim();
                    return `<h${level} id="${id}">${headingText}</h${level}>`;
                }

                // Default heading without custom ID
                return `<h${level}>${text}</h${level}>`;
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
     * Source of truth: ROOT package.json (updated by npm version commands)
     */
    async updateVersionsAcrossFiles() {
        try {
            // Read current version from ROOT package.json (source of truth)
            const rootPackagePath = path.join(process.cwd(), "package.json");
            const rootPackageContent = JSON.parse(await fs.readFile(rootPackagePath, "utf8"));
            const currentVersion = rootPackageContent.version;

            console.log(` Updating all version references to v${currentVersion}...`);

            let updatesApplied = 0;

            // 1. Update app/public/package.json (sync FROM root)
            try {
                const appPackagePath = path.join(process.cwd(), "app", "public", "package.json");
                const appPackageContent = JSON.parse(await fs.readFile(appPackagePath, "utf8"));

                if (appPackageContent.version !== currentVersion) {
                    appPackageContent.version = currentVersion;
                    await fs.writeFile(appPackagePath, JSON.stringify(appPackageContent, null, 2) + "\n");
                    console.log(" Updated app/public/package.json version");
                    updatesApplied++;
                }
            } catch (error) {
                console.warn(` Could not update app/public/package.json: ${error.message}`);
            }

            // 2. Update footer.html version badge
            try {
                const footerPath = path.join(process.cwd(), "app", "public", "scripts", "shared", "footer.html");
                const footerContent = await fs.readFile(footerPath, "utf8");
                const updatedFooter = footerContent.replace(
                    /HexTrackr-v[\d.]+(-blue\?style=flat)/g,
                    `HexTrackr-v${currentVersion}$1`
                );

                if (footerContent !== updatedFooter) {
                    await fs.writeFile(footerPath, updatedFooter);
                    console.log(" Updated footer.html version badge");
                    updatesApplied++;
                }
            } catch (error) {
                console.warn(` Could not update footer.html: ${error.message}`);
            }

            // 3. Update README.md version (supports both badge and text formats)
            try {
                const readmePath = path.join(process.cwd(), "README.md");
                const readmeContent = await fs.readFile(readmePath, "utf8");
                let updatedReadme = readmeContent;

                // Update badge URL format (HexTrackr-v1.0.55-blue)
                updatedReadme = updatedReadme.replace(
                    /HexTrackr-v[\d.]+-blue/g,
                    `HexTrackr-v${currentVersion}-blue`
                );

                // Update plain text format (Current version: **v1.0.54**)
                updatedReadme = updatedReadme.replace(
                    /Current version: \*\*v[\d.]+\*\*/g,
                    `Current version: **v${currentVersion}**`
                );

                if (readmeContent !== updatedReadme) {
                    await fs.writeFile(readmePath, updatedReadme);
                    console.log(" Updated README.md version");
                    updatesApplied++;
                }
            } catch (error) {
                console.warn(` Could not update README.md: ${error.message}`);
            }

            // 4. Update docker-compose.yml HEXTRACKR_VERSION
            try {
                const dockerComposePath = path.join(process.cwd(), "docker-compose.yml");
                const dockerContent = await fs.readFile(dockerComposePath, "utf8");
                const updatedDocker = dockerContent.replace(
                    /HEXTRACKR_VERSION=[\d.]+/g,
                    `HEXTRACKR_VERSION=${currentVersion}`
                );

                if (dockerContent !== updatedDocker) {
                    await fs.writeFile(dockerComposePath, updatedDocker);
                    console.log(" Updated docker-compose.yml HEXTRACKR_VERSION");
                    updatesApplied++;
                }
            } catch (error) {
                console.warn(` Could not update docker-compose.yml: ${error.message}`);
            }

            // 5. Update server.js fallback version
            try {
                const serverPath = path.join(process.cwd(), "app", "public", "server.js");
                const serverContent = await fs.readFile(serverPath, "utf8");
                const updatedServer = serverContent.replace(
                    /HEXTRACKR_VERSION \|\| "[\d.]+"/g,
                    `HEXTRACKR_VERSION || "${currentVersion}"`
                );

                if (serverContent !== updatedServer) {
                    await fs.writeFile(serverPath, updatedServer);
                    console.log(" Updated server.js fallback version");
                    updatesApplied++;
                }
            } catch (error) {
                console.warn(` Could not update server.js: ${error.message}`);
            }

            // 6. Update login.html version footer
            try {
                const loginPath = path.join(process.cwd(), "app", "public", "login.html");
                const loginContent = await fs.readFile(loginPath, "utf8");
                const updatedLogin = loginContent.replace(
                    /HexTrackr v[\d.]+/g,
                    `HexTrackr v${currentVersion}`
                );

                if (loginContent !== updatedLogin) {
                    await fs.writeFile(loginPath, updatedLogin);
                    console.log(" Updated login.html version footer");
                    updatesApplied++;
                }
            } catch (error) {
                console.warn(` Could not update login.html: ${error.message}`);
            }

            if (updatesApplied > 0) {
                console.log(` Version sync complete: ${updatesApplied} files updated to v${currentVersion}`);
            } else {
                console.log(`✓ All files already at v${currentVersion}`);
            }

        } catch (error) {
            console.warn("Could not read root package.json:", error.message);
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
     * @param {string} [sourcePath] - The relative path of the source file for special handling
     */
    markdownToHtml(markdownContent, currentSection = null, sourcePath = null) {
        // Store the current section for the link renderer
        this.currentSection = currentSection;

        // Simple markdown to HTML conversion
        // Note: CHANGELOG.md has been split into individual version files in changelog/versions/
        // No special accordion processing needed - each version is now a standalone markdown file
        return this.marked.parse(markdownContent);
    }

    /**
     * Process changelog content with collapsible accordion sections
     * @param {string} markdownContent - The changelog markdown content
     * @returns {string} HTML content with Bootstrap accordion structure
     */
    processChangelogContent(markdownContent) {
        // Split content into lines for processing
        const lines = markdownContent.split("\n");
        let result = "";
        let currentVersionContent = "";
        let versionCount = 0;
        let inVersionSection = false;
        let versionHeader = "";
        let versionId = "";

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check if this is a version header (## [x.x.x] - date)
            const versionMatch = line.match(/^## \[([^\]]+)\] - (.+)$/);

            if (versionMatch) {
                // If we were processing a previous version, close it
                if (inVersionSection && versionHeader) {
                    const versionHtml = this.marked.parse(currentVersionContent);
                    const isFirstVersion = versionCount === 1;
                    const collapseClass = isFirstVersion ? "show" : "";
                    const buttonClass = isFirstVersion ? "" : "collapsed";
                    const ariaExpanded = isFirstVersion ? "true" : "false";

                    result += `
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button ${buttonClass}"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#${versionId}"
                                    aria-expanded="${ariaExpanded}"
                                    aria-controls="${versionId}">
                                ${versionHeader}
                            </button>
                        </h2>
                        <div id="${versionId}"
                             class="accordion-collapse collapse ${collapseClass}"
                             data-bs-parent="#changelogAccordion">
                            <div class="accordion-body">
                                ${versionHtml}
                            </div>
                        </div>
                    </div>`;
                }

                // Start new version section
                versionCount++;
                const version = versionMatch[1];
                const date = versionMatch[2];
                versionHeader = `[${version}] - ${date}`;
                versionId = `version-${version.replace(/\./g, "-")}`;
                currentVersionContent = "";
                inVersionSection = true;
            } else if (inVersionSection) {
                // Add line to current version content
                currentVersionContent += line + "\n";
            } else if (!inVersionSection) {
                // This is header content before any versions
                const headerHtml = this.marked.parse(line + "\n");
                result += headerHtml;
            }
        }

        // Handle the last version if there is one
        if (inVersionSection && versionHeader) {
            const versionHtml = this.marked.parse(currentVersionContent);
            const isFirstVersion = versionCount === 1;
            const collapseClass = isFirstVersion ? "show" : "";
            const buttonClass = isFirstVersion ? "" : "collapsed";
            const ariaExpanded = isFirstVersion ? "true" : "false";

            result += `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button ${buttonClass}"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#${versionId}"
                            aria-expanded="${ariaExpanded}"
                            aria-controls="${versionId}">
                        ${versionHeader}
                    </button>
                </h2>
                <div id="${versionId}"
                     class="accordion-collapse collapse ${collapseClass}"
                     data-bs-parent="#changelogAccordion">
                    <div class="accordion-body">
                        ${versionHtml}
                    </div>
                </div>
            </div>`;
        }

        // If we found any versions, wrap in accordion container
        if (versionCount > 0) {
            result = `<div class="accordion" id="changelogAccordion">${result}</div>`;
        } else {
            // Fallback to regular markdown processing if no versions found
            result = this.marked.parse(markdownContent);
        }

        return result;
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
            const newHtmlContent = this.markdownToHtml(markdownContent, currentSection, source.relativePath);

            // Inject content into the template
            const finalHtml = this.templateContent.replace(
                "<!-- CONTENT WILL BE INJECTED HERE -->",
                newHtmlContent
            );

            // Ensure the destination directory exists
            await PathValidator.safeMkdir(path.dirname(source.htmlPath), { recursive: true });
            
            // Write the final HTML file
            await PathValidator.safeWriteFile(source.htmlPath, finalHtml);
            
            console.log(` Generated HTML: ${source.relativePath.replace(".md", ".html")}`);
            this.stats.filesGenerated++;
            return true;
            
        } catch (error) {
            console.error(` Failed to generate ${source.relativePath}: ${error.message}`);
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

            // Handle sectioned files (supports nested folders like changelog/versions/*)
            const sectionName = parts[0];

            // Initialize section if it doesn't exist
            if (!manifest.sections[sectionName]) {
                manifest.sections[sectionName] = {
                    title: this.sanitizeTitle(sectionName),
                    icon: this.getSectionIcon(sectionName),
                    indexFile: `${sectionName}/index`,
                    children: {}
                };
            }

            // Handle 2-part paths: section/file.md
            if (parts.length === 2) {
                const fileName = parts[1].replace(".md", "");

                // Skip index files as they're handled at section level
                if (fileName !== "index") {
                    manifest.sections[sectionName].children[fileName] = {
                        file: `${sectionName}/${fileName}`,
                        title: this.sanitizeTitle(fileName),
                        path: `${sectionName}/${fileName}.html`
                    };
                }
            }

            // Handle 3+ part paths (nested folders): section/subfolder/file.md
            // Example: changelog/versions/1.0.54.md
            if (parts.length >= 3) {
                const subPath = parts.slice(1, -1).join("/");  // "versions"
                const fileName = parts[parts.length - 1].replace(".md", "");  // "1.0.54"
                const fullPath = `${sectionName}/${subPath}/${fileName}`;  // "changelog/versions/1.0.54"

                // Use just the filename as the key for cleaner navigation
                // This makes version files appear as direct children of the changelog section
                manifest.sections[sectionName].children[fileName] = {
                    file: fullPath,
                    title: this.sanitizeTitle(fileName),
                    path: `${fullPath}.html`
                };
            }
        }

        // Sort changelog versions (newest first) and implement rolling window (last 10 versions)
        if (manifest.sections.changelog && manifest.sections.changelog.children) {
            const sortedChildren = {};
            const archivedVersions = {};
            const versionKeys = Object.keys(manifest.sections.changelog.children);

            // Sort version numbers in descending order (newest first)
            versionKeys.sort((a, b) => {
                // Parse version numbers (e.g., "1.0.54" -> [1, 0, 54])
                const aParts = a.split('.').map(Number);
                const bParts = b.split('.').map(Number);

                // Compare each part from left to right
                for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                    const aNum = aParts[i] || 0;
                    const bNum = bParts[i] || 0;
                    if (aNum !== bNum) {
                        return bNum - aNum;  // Descending order (newest first)
                    }
                }
                return 0;
            });

            // Rolling window: Keep last 10 versions in children, move rest to archivedVersions
            const RECENT_VERSION_LIMIT = 10;
            versionKeys.forEach((key, index) => {
                if (index < RECENT_VERSION_LIMIT) {
                    // Last 10 versions stay in children (visible in dropdown)
                    sortedChildren[key] = manifest.sections.changelog.children[key];
                } else {
                    // Older versions move to archive (still accessible, not in dropdown)
                    archivedVersions[key] = manifest.sections.changelog.children[key];
                }
            });

            manifest.sections.changelog.children = sortedChildren;
            manifest.sections.changelog.archivedVersions = archivedVersions;

            console.log(` Changelog rolling window: ${Object.keys(sortedChildren).length} recent versions, ${Object.keys(archivedVersions).length} archived versions`);
        }

        // Write manifest file
        const manifestPath = path.join(process.cwd(), "app", "public", "docs-html", "content-manifest.json");
        await PathValidator.safeWriteFile(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log(` Content manifest generated: ${Object.keys(manifest.sections).length} sections, ${manifest.totalFiles} total files`);
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
     * Parse YAML frontmatter from markdown content
     * Simple frontmatter parser that extracts key-value pairs from --- delimited sections
     * @param {string} content - The markdown content with frontmatter
     * @returns {object} Parsed frontmatter object
     */
    parseFrontmatter(content) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
        const match = content.match(frontmatterRegex);

        if (!match) {
            return {};
        }

        const frontmatterText = match[1];
        const frontmatter = {};

        // Parse each line as key: value
        frontmatterText.split("\n").forEach(line => {
            const colonIndex = line.indexOf(":");
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, "");
                frontmatter[key] = value;
            }
        });

        return frontmatter;
    }

    /**
     * Generate dynamic index.md for changelog with last 10 versions
     * Creates an auto-updating index page that displays recent releases with summaries
     */
    async generateDynamicIndex() {
        try {
            const manifestPath = path.join(process.cwd(), "app", "public", "docs-html", "content-manifest.json");
            const manifest = JSON.parse(await PathValidator.safeReadFile(manifestPath, "utf8"));

            if (!manifest.sections.changelog) {
                console.warn(" No changelog section found in manifest, skipping index generation");
                return;
            }

            const recentVersions = manifest.sections.changelog.children;
            const versionKeys = Object.keys(recentVersions);

            // Build recent releases list with metadata from version files
            const recentReleasesList = [];
            for (const versionKey of versionKeys) {
                const versionFile = recentVersions[versionKey].file;
                const versionPath = path.join(process.cwd(), "app", "public", "docs-source", `${versionFile}.md`);

                try {
                    const versionContent = await PathValidator.safeReadFile(versionPath, "utf8");
                    const frontmatter = this.parseFrontmatter(versionContent);

                    const version = frontmatter.version || versionKey;
                    const date = frontmatter.date || "Unknown date";
                    const title = frontmatter.title || `Version ${version}`;
                    const category = frontmatter.category || "Update";

                    // Extract first paragraph from content as summary (skip frontmatter and title)
                    const contentWithoutFrontmatter = versionContent.replace(/^---[\s\S]*?---\n/, "");
                    const contentLines = contentWithoutFrontmatter.split("\n");
                    let summary = "";
                    for (const line of contentLines) {
                        if (line.trim() && !line.startsWith("#") && !line.startsWith("**")) {
                            summary = line.trim();
                            break;
                        }
                    }

                    recentReleasesList.push({
                        version,
                        date,
                        title,
                        category,
                        summary,
                        link: `#changelog/versions/${version}`
                    });
                } catch (error) {
                    console.warn(` Could not read version file ${versionPath}: ${error.message}`);
                }
            }

            // Get current version from root package.json
            const rootPackagePath = path.join(process.cwd(), "package.json");
            const rootPackageContent = JSON.parse(await PathValidator.safeReadFile(rootPackagePath, "utf8"));
            const currentVersion = rootPackageContent.version;

            // Build the index.md content
            const indexContent = `<!-- AUTO-GENERATED FILE - DO NOT EDIT MANUALLY -->
<!-- This file is automatically generated by html-content-updater.js -->
<!-- Last generated: ${new Date().toISOString()} -->

# HexTrackr Changelog

Welcome to the HexTrackr changelog! This page tracks all notable changes, features, and fixes across all versions of HexTrackr.

**Current Version**: [v${currentVersion}](#changelog/versions/${currentVersion}) - Released ${recentReleasesList[0]?.date || "Unknown"}

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Recent Releases

${recentReleasesList.map(release =>
    `### [v${release.version}](${release.link}) - ${release.date}
**Category**: ${release.category}

${release.summary}

[View full changelog →](${release.link})`
).join("\n\n")}

---

## Older Versions

For versions older than the 10 most recent releases, see the [Changelog Archive](#changelog/archive).

---

## Navigation

- **[Latest Version (v${recentReleasesList[0]?.version || currentVersion})](${recentReleasesList[0]?.link || "#"})** - Most recent changes
- **[Changelog Archive](#changelog/archive)** - All historical versions
- **[Project Roadmap](#roadmap)** - Planned features and improvements

---

## Contributing

Found a bug or want to request a feature? Check our [project roadmap](#roadmap) or create an issue in our Linear workspace.
`;

            // Write the generated index.md
            const indexPath = path.join(process.cwd(), "app", "public", "docs-source", "changelog", "index.md");
            await PathValidator.safeWriteFile(indexPath, indexContent);

            console.log(` Dynamic changelog index.md generated with ${recentReleasesList.length} recent versions`);

        } catch (error) {
            console.error(` Failed to generate dynamic index.md: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate archive.md table with all versions older than the last 10
     * Creates a comprehensive table of historical versions
     */
    async generateArchiveTable() {
        try {
            const manifestPath = path.join(process.cwd(), "app", "public", "docs-html", "content-manifest.json");
            const manifest = JSON.parse(await PathValidator.safeReadFile(manifestPath, "utf8"));

            if (!manifest.sections.changelog || !manifest.sections.changelog.archivedVersions) {
                console.warn(" No archived versions found in manifest, creating empty archive");

                // Create empty archive file
                const emptyArchiveContent = `<!-- AUTO-GENERATED FILE - DO NOT EDIT MANUALLY -->
<!-- This file is automatically generated by html-content-updater.js -->
<!-- Last generated: ${new Date().toISOString()} -->

# HexTrackr Changelog Archive

This archive contains all historical versions of HexTrackr older than the 10 most recent releases.

For the latest changes, see the [Changelog Index](#changelog/index).

---

## Archived Versions

No archived versions yet. All versions are still in the recent releases list.

---

[← Back to Changelog Index](#changelog/index)
`;
                const archivePath = path.join(process.cwd(), "app", "public", "docs-source", "changelog", "archive.md");
                await PathValidator.safeWriteFile(archivePath, emptyArchiveContent);
                console.log(" Empty archive.md generated (no archived versions yet)");
                return;
            }

            const archivedVersions = manifest.sections.changelog.archivedVersions;
            const versionKeys = Object.keys(archivedVersions);

            // Build table rows with metadata from version files
            const tableRows = [];
            for (const versionKey of versionKeys) {
                const versionFile = archivedVersions[versionKey].file;
                const versionPath = path.join(process.cwd(), "app", "public", "docs-source", `${versionFile}.md`);

                try {
                    const versionContent = await PathValidator.safeReadFile(versionPath, "utf8");
                    const frontmatter = this.parseFrontmatter(versionContent);

                    const version = frontmatter.version || versionKey;
                    const date = frontmatter.date || "Unknown";
                    const category = frontmatter.category || "Update";
                    const title = frontmatter.title || `Version ${version}`;

                    // Extract brief summary (first sentence or first 100 chars)
                    const contentWithoutFrontmatter = versionContent.replace(/^---[\s\S]*?---\n/, "");
                    const contentLines = contentWithoutFrontmatter.split("\n");
                    let summary = "";
                    for (const line of contentLines) {
                        if (line.trim() && !line.startsWith("#") && !line.startsWith("**")) {
                            summary = line.trim();
                            const firstSentence = summary.match(/^[^.!?]+[.!?]/);
                            if (firstSentence) {
                                summary = firstSentence[0];
                            } else if (summary.length > 100) {
                                summary = summary.substring(0, 100) + "...";
                            }
                            break;
                        }
                    }

                    tableRows.push({
                        version,
                        date,
                        category,
                        summary,
                        link: `#changelog/versions/${version}`
                    });
                } catch (error) {
                    console.warn(` Could not read archived version file ${versionPath}: ${error.message}`);
                }
            }

            // Build the archive.md content
            const archiveContent = `<!-- AUTO-GENERATED FILE - DO NOT EDIT MANUALLY -->
<!-- This file is automatically generated by html-content-updater.js -->
<!-- Last generated: ${new Date().toISOString()} -->

# HexTrackr Changelog Archive

This archive contains all historical versions of HexTrackr older than the 10 most recent releases.

For the latest changes, see the [Changelog Index](#changelog/index).

---

## Archived Versions

Total archived versions: **${tableRows.length}**

| Version | Release Date | Category | Summary | Details |
|---------|--------------|----------|---------|---------|
${tableRows.map(row =>
    `| [v${row.version}](${row.link}) | ${row.date} | ${row.category} | ${row.summary} | [View →](${row.link}) |`
).join("\n")}

---

[← Back to Changelog Index](#changelog/index)
`;

            // Write the generated archive.md
            const archivePath = path.join(process.cwd(), "app", "public", "docs-source", "changelog", "archive.md");
            await PathValidator.safeWriteFile(archivePath, archiveContent);

            console.log(` Changelog archive.md generated with ${tableRows.length} archived versions`);

        } catch (error) {
            console.error(` Failed to generate archive.md: ${error.message}`);
            throw error;
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
Files Removed: ${this.stats.filesRemoved}
Errors: ${this.stats.errors}

## Generated Files

${generatedFiles.map(file => `- ${file}`).join("\n")}

## Summary

The HTML generator successfully created ${this.stats.filesGenerated} HTML files from their corresponding markdown sources using the master template.
${this.stats.filesRemoved > 0 ? `\nAdditionally, ${this.stats.filesRemoved} orphaned HTML files were removed that no longer have corresponding markdown sources.` : ""}
`;

        await PathValidator.safeWriteFile("logs/docs-source/html-update-report.md", report);
        console.log("HTML generation report saved: logs/docs-source/html-update-report.md");
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
                                console.log(` Removed empty directory: ${currentRelPath}`);
                            } catch (error) {
                                console.error(` Failed to remove directory ${currentRelPath}: ${error.message}`);
                            }
                        }
                    } else if (item.name.endsWith(".html")) {
                        // Check if this HTML file was generated in the current run
                        const relativePosixPath = currentRelPath.split(path.sep).join("/");
                        if (!generatedFiles.includes(relativePosixPath)) {
                            try {
                                await fs.unlink(fullPath);
                                console.log(` Removed orphaned HTML file: ${relativePosixPath}`);
                                this.stats.filesRemoved++;
                            } catch (error) {
                                console.error(` Failed to remove file ${relativePosixPath}: ${error.message}`);
                            }
                        }
                    }
                }
            };
            
            // Start checking from the content root directory
            await checkDirectory(contentDir);
            
            if (this.stats.filesRemoved > 0) {
                console.log(` Cleanup complete: removed ${this.stats.filesRemoved} orphaned HTML files`);
            } else {
                console.log("✓ No orphaned HTML files found, nothing to clean up");
            }
        } catch (error) {
            console.error(` Cleanup process failed: ${error.message}`);
        }
    }

    /**
     * Generate JSDoc HTML documentation from code comments
     */
    async generateJSDoc() {
        const { exec } = require("child_process");
        const util = require("util");
        const execPromise = util.promisify(exec);

        try {
            console.log("\n📚 Generating JSDoc HTML documentation...");

            // Run JSDoc generation (equivalent to npm run docs:dev)
            await execPromise("npm run docs:dev", {
                cwd: process.cwd(),
                maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large output
            });

            console.log("JSDoc HTML generation complete!");

        } catch (error) {
            console.warn(` JSDoc generation encountered an issue: ${error.message}`);
            // Non-fatal - continue with process
        }
    }

    /**
     * Main execution function - Complete release workflow
     * 1. Sync versions across all files
     * 2. Generate markdown → HTML documentation
     * 3. Generate JSDoc → HTML API reference
     */
    async run() {
        console.log("Starting complete documentation generation workflow...\n");

        try {
            // Initialize marked library first
            await this.initializeMarked();

            // STEP 1: Update version across all project files to maintain consistency
            await this.updateVersionsAcrossFiles();

            // STEP 2: Find all markdown source files (needed for manifest generation)
            const sources = await this.findAllMarkdownSources();
            console.log(` Found ${sources.length} markdown source files to convert.`);

            if (sources.length === 0) {
                console.log("No markdown files found in docs-source. Nothing to generate.");
                return;
            }

            // STEP 3: Generate content manifest FIRST (contains rolling window logic)
            await this.generateContentManifest(sources);

            // STEP 4: Generate dynamic changelog files BEFORE HTML conversion
            // This ensures index.md is up-to-date when converted to HTML
            console.log("\nGenerating dynamic changelog files...");
            await this.generateDynamicIndex();
            await this.generateArchiveTable();

            console.log("\nGenerating markdown documentation...");

            // STEP 5: Load the template for HTML conversion
            await this.loadTemplate();

            const generatedFiles = [];

            // STEP 6: Generate HTML files from markdown (now uses fresh index.md)
            for (const source of sources) {
                const success = await this.generateHtmlFile(source);
                if (success) {
                    generatedFiles.push(source.relativePath.replace(".md", ".html"));
                }
                // Small delay to prevent overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            // STEP 7: Clean up deleted files
            await this.cleanupDeletedFiles(generatedFiles);

            // Generate summary report
            await this.generateUpdateReport(generatedFiles);

            const elapsed = (Date.now() - this.stats.startTime) / 1000;
            console.log(`\n Markdown HTML generation complete!`);
            console.log(` Generated ${this.stats.filesGenerated} files in ${elapsed.toFixed(1)}s`);

            if (this.stats.filesRemoved > 0) {
                console.log(` Removed ${this.stats.filesRemoved} orphaned HTML files`);
            }

            if (this.stats.errors > 0) {
                console.log(` ${this.stats.errors} errors encountered during markdown generation.`);
            }

            // STEP 2: Generate JSDoc HTML documentation
            await this.generateJSDoc();

            console.log("\nComplete documentation workflow finished successfully!\n");

            // NOTE: Changelog index.md and archive.md are now auto-generated
            console.log("Changelog Management:");
            console.log(" Changelog index.md and archive.md are automatically generated");
            console.log(" Rolling window: Last 10 versions in dropdown, older versions in archive");
            console.log(" To add a new version: Add the .md file to changelog/versions/ and run: npm run docs:generate\n");

        } catch (error) {
            console.error("Documentation generation process failed:", error);
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
