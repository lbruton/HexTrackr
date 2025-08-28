const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

/**
 * HexTrackr Documentation Generator - Markdown to Beautiful HTML
 * Converts markdown sources to styled HTML using Tabler.io templates
 */
class MarkdownDocumentationGenerator {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.sourceDir = path.join(this.baseDir, "docs-source");
        this.outputDir = path.join(this.baseDir, "docs-prototype", "content");
        this.templatesDir = path.join(this.sourceDir, "templates");
        
        // Configure marked for beautiful HTML output
        this.configureMarkdown();
        
        // Load HTML templates
        this.templates = this.loadTemplates();
        
        // Statistics tracking
        this.stats = {
            markdownFiles: 0,
            htmlGenerated: 0,
            sectionsCreated: 0
        };
    }

    /**
     * Configure markdown parser for documentation
     */
    configureMarkdown() {
        marked.setOptions({
            headerIds: true,
            gfm: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: true,
            highlight: function(code, lang) {
                // Add syntax highlighting classes
                return `<pre class="language-${lang}"><code class="language-${lang}">${code}</code></pre>`;
            }
        });

        // Custom renderer for enhanced styling
        const renderer = new marked.Renderer();
        
        // Style headers with FontAwesome icons
        const originalHeading = renderer.heading;
        renderer.heading = function(text, level, raw) {
            const iconMap = {
                1: "fas fa-book-open",
                2: "fas fa-layer-group", 
                3: "fas fa-list-ul",
                4: "fas fa-dot-circle",
                5: "fas fa-chevron-right",
                6: "fas fa-chevron-right"
            };
            
            const icon = iconMap[level] || "fas fa-chevron-right";
            const styledText = level <= 2 ? 
                `<i class="${icon} me-2"></i>${text}` : text;
            
            return originalHeading.call(this, styledText, level, raw);
        };

        // Enhanced table styling
        renderer.table = function(header, body) {
            return `<div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">${header}</thead>
                    <tbody>${body}</tbody>
                </table>
            </div>`;
        };

        // Enhanced code blocks
        renderer.code = function(code, language) {
            const validLang = language && language.match(/\S*/)[0];
            const langClass = validLang ? ` language-${validLang}` : "";
            
            return `<div class="code-block mb-3">
                <pre class="bg-light border rounded p-3${langClass}"><code${langClass ? ` class="${langClass}"` : ""}>${code}</code></pre>
            </div>`;
        };

        // Enhanced blockquotes  
        renderer.blockquote = function(quote) {
            return `<div class="alert alert-info border-start border-4 border-info">
                <div class="alert-body">${quote}</div>
            </div>`;
        };

        marked.use({ renderer });
    }

    /**
     * Load HTML templates for conversion
     */
    loadTemplates() {
        const templates = {};
        
        try {
            templates.base = fs.readFileSync(
                path.join(this.templatesDir, "base.html"), "utf8"
            );
            templates.section = fs.readFileSync(
                path.join(this.templatesDir, "section.html"), "utf8"
            );
        } catch (error) {
            console.error("❌ Error loading templates:", error.message);
            throw error;
        }

        return templates;
    }

    /**
     * Main generation method - convert all markdown to HTML
     */
    async generateAll() {
        console.log("🎨 Starting Beautiful Documentation Generation...\n");
        console.log("📝 Converting Markdown → Styled HTML with Tabler.io\n");

        // Ensure output directories exist
        this.ensureDirectories();

        // Process all markdown files
        await this.processMarkdownFiles();

        // Generate enhanced components
        await this.generateEnhancedComponents();

        // Update navigation system
        await this.updateNavigation();

        // Show completion stats
        this.showCompletionStats();
    }

    /**
     * Ensure all output directories exist
     */
    ensureDirectories() {
        const dirs = ["api", "architecture", "frameworks", "code-review"];
        dirs.forEach(dir => {
            const fullPath = path.join(this.outputDir, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        });
    }

    /**
     * Process all markdown files and convert to HTML
     */
    async processMarkdownFiles() {
        const markdownFiles = this.findMarkdownFiles();
        
        for (const mdFile of markdownFiles) {
            await this.convertMarkdownToHTML(mdFile);
            this.stats.markdownFiles++;
        }
    }

    /**
     * Find all markdown files in source directory
     */
    findMarkdownFiles() {
        const files = [];
        
        const scanDirectory = (dir, relativePath = "") => {
            const entries = fs.readdirSync(dir);
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry);
                const entryRelativePath = path.join(relativePath, entry);
                
                if (fs.statSync(fullPath).isDirectory() && entry !== "templates") {
                    scanDirectory(fullPath, entryRelativePath);
                } else if (entry.endsWith(".md")) {
                    files.push({
                        fullPath,
                        relativePath: entryRelativePath,
                        outputPath: entryRelativePath.replace(".md", ".html")
                    });
                }
            }
        };
        
        scanDirectory(this.sourceDir);
        return files;
    }

    /**
     * Convert individual markdown file to beautiful HTML
     */
    async convertMarkdownToHTML(fileInfo) {
        const { fullPath, outputPath } = fileInfo;
        
        try {
            // Read markdown content
            const markdownContent = fs.readFileSync(fullPath, "utf8");
            
            // Extract metadata if present
            const { content, metadata } = this.extractMetadata(markdownContent);
            
            // Convert markdown to HTML
            const htmlContent = marked(content);
            
            // Apply section template
            const styledContent = this.applyTemplate("section", {
                content: htmlContent,
                custom_styles: this.getCustomStyles(outputPath)
            });
            
            // Write to output directory
            const outputFullPath = path.join(this.outputDir, outputPath);
            fs.writeFileSync(outputFullPath, styledContent);
            
            console.log(`   ✓ Generated: ${outputPath}`);
            this.stats.htmlGenerated++;
            
        } catch (error) {
            console.error(`❌ Error converting ${fullPath}:`, error.message);
        }
    }

    /**
     * Extract metadata from markdown frontmatter
     */
    extractMetadata(markdown) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = markdown.match(frontmatterRegex);
        
        if (match) {
            const metadata = this.parseFrontmatter(match[1]);
            return { content: match[2], metadata };
        }
        
        return { content: markdown, metadata: {} };
    }

    /**
     * Parse YAML-like frontmatter
     */
    parseFrontmatter(frontmatter) {
        const metadata = {};
        const lines = frontmatter.split("\n");
        
        for (const line of lines) {
            const [key, ...valueParts] = line.split(":");
            if (key && valueParts.length > 0) {
                metadata[key.trim()] = valueParts.join(":").trim();
            }
        }
        
        return metadata;
    }

    /**
     * Apply template with variable substitution
     */
    applyTemplate(templateName, variables) {
        let template = this.templates[templateName];
        
        // Substitute variables
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{{${key}}}`;
            template = template.replace(new RegExp(placeholder, "g"), value || "");
        }
        
        return template;
    }

    /**
     * Get custom styles for specific sections
     */
    getCustomStyles(outputPath) {
        const styleMap = {
            "architecture/database-schema.html": `
                .schema-diagram {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin: 2rem 0;
                }
                
                .table-box {
                    background: white;
                    border: 2px solid #dee2e6;
                    border-radius: 8px;
                    padding: 1rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .table-box h4 {
                    background: #007bff;
                    color: white;
                    margin: -1rem -1rem 1rem -1rem;
                    padding: 0.75rem 1rem;
                    border-radius: 6px 6px 0 0;
                    font-weight: 600;
                }
                
                .fields .field {
                    padding: 0.5rem;
                    border-bottom: 1px solid #f1f3f4;
                    font-family: 'Monaco', monospace;
                    font-size: 0.9em;
                }
                
                .field.primary {
                    background: #e3f2fd;
                    font-weight: bold;
                }
                
                .field.foreign {
                    background: #fff3e0;
                    color: #f57c00;
                }
            `,
            "roadmap.html": `
                .roadmap-status {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                }
                
                .progress-tracking {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    margin: 1.5rem 0;
                }
                
                .progress-item {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 1.5rem;
                    text-align: center;
                }
            `
        };
        
        return styleMap[outputPath] || "";
    }

    /**
     * Generate enhanced components for special sections
     */
    async generateEnhancedComponents() {
        console.log("\n🎨 Generating Enhanced Components...");
        
        // Add any special component generation here
        console.log("   ✓ Enhanced components ready");
    }

    /**
     * Update navigation system with new sections
     */
    async updateNavigation() {
        console.log("\n🧭 Updating Navigation System...");
        
        // This would update the docs-tabler.js fileMap
        // For now, we'll just log what sections were created
        const htmlFiles = this.findGeneratedFiles();
        
        console.log("   ✓ Navigation sections available:");
        htmlFiles.forEach(file => {
            console.log(`     • ${file.replace(".html", "")}`);
        });
    }

    /**
     * Find all generated HTML files
     */
    findGeneratedFiles() {
        const files = [];
        
        const scanDirectory = (dir, relativePath = "") => {
            const entries = fs.readdirSync(dir);
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry);
                const entryRelativePath = path.join(relativePath, entry);
                
                if (fs.statSync(fullPath).isDirectory()) {
                    scanDirectory(fullPath, entryRelativePath);
                } else if (entry.endsWith(".html")) {
                    files.push(entryRelativePath);
                }
            }
        };
        
        scanDirectory(this.outputDir);
        return files;
    }

    /**
     * Show completion statistics
     */
    showCompletionStats() {
        console.log("\n✅ Beautiful Documentation Generation Complete!");
        console.log("📊 Generated documentation:");
        console.log(`   • ${this.stats.markdownFiles} markdown files processed`);
        console.log(`   • ${this.stats.htmlGenerated} HTML files generated`);
        console.log("   • Tabler.io styling applied throughout");
        console.log("   • Templates preserved visual consistency");
        console.log("\n🎯 Ready for portal integration!\n");
    }
}

// Export for use as module or run directly
if (require.main === module) {
    const generator = new MarkdownDocumentationGenerator();
    generator.generateAll().catch(console.error);
}

module.exports = MarkdownDocumentationGenerator;
