#!/usr/bin/env node
/**
 * Documentation File Mapping Analyzer
 * 
 * Analyzes the current state of HTML and MD files to create a 1:1 mapping plan
 */

const fs = require("fs").promises;
const path = require("path");

class DocumentationMapper {
    constructor() {
        this.baseDir = process.cwd();
        this.docsSourceDir = path.join(this.baseDir, "docs-source");
        this.htmlContentDir = path.join(this.baseDir, "docs-prototype", "content");
        
        this.mapping = {
            matched: [],
            missingMd: [],
            missingHtml: [],
            backupFiles: []
        };
    }

    /**
     * Get all .md files in docs-source (excluding backups)
     */
    async getMdFiles() {
        const mdFiles = [];
        
        async function scanDirectory(dir, relativePath = "") {
            try {
                const entries = await fs.readdir(dir);
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry);
                    const relativeFilePath = path.join(relativePath, entry);
                    const stat = await fs.stat(fullPath);
                    
                    if (stat.isDirectory()) {
                        await scanDirectory(fullPath, relativeFilePath);
                    } else if (entry.endsWith(".md") && !entry.includes(".backup.")) {
                        mdFiles.push({
                            name: entry,
                            relativePath: relativeFilePath,
                            fullPath: fullPath,
                            directory: relativePath
                        });
                    }
                }
            } catch (error) {
                console.warn(`Warning: Could not scan directory ${dir}: ${error.message}`);
            }
        }
        
        await scanDirectory(this.docsSourceDir);
        return mdFiles;
    }

    /**
     * Get all .html files in docs-prototype/content
     */
    async getHtmlFiles() {
        const htmlFiles = [];
        
        async function scanDirectory(dir, relativePath = "") {
            try {
                const entries = await fs.readdir(dir);
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry);
                    const relativeFilePath = path.join(relativePath, entry);
                    const stat = await fs.stat(fullPath);
                    
                    if (stat.isDirectory()) {
                        await scanDirectory(fullPath, relativeFilePath);
                    } else if (entry.endsWith(".html") && !entry.includes(".backup.")) {
                        htmlFiles.push({
                            name: entry,
                            relativePath: relativeFilePath,
                            fullPath: fullPath,
                            directory: relativePath
                        });
                    }
                }
            } catch (error) {
                console.warn(`Warning: Could not scan directory ${dir}: ${error.message}`);
            }
        }
        
        await scanDirectory(this.htmlContentDir);
        return htmlFiles;
    }

    /**
     * Get all backup files for cleanup
     */
    async getBackupFiles() {
        const backupFiles = [];
        
        async function scanDirectory(dir) {
            try {
                const entries = await fs.readdir(dir);
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry);
                    const stat = await fs.stat(fullPath);
                    
                    if (stat.isDirectory()) {
                        await scanDirectory(fullPath);
                    } else if (entry.includes(".backup.")) {
                        backupFiles.push({
                            name: entry,
                            fullPath: fullPath
                        });
                    }
                }
            } catch (error) {
                console.warn(`Warning: Could not scan directory ${dir}: ${error.message}`);
            }
        }
        
        await scanDirectory(this.docsSourceDir);
        return backupFiles;
    }

    /**
     * Create mapping between HTML and MD files
     */
    async createMapping() {
        console.log("🔍 Analyzing documentation file structure...");
        
        const mdFiles = await this.getMdFiles();
        const htmlFiles = await this.getHtmlFiles();
        const backupFiles = await this.getBackupFiles();
        
        console.log(`📄 Found ${mdFiles.length} .md files`);
        console.log(`🌐 Found ${htmlFiles.length} .html files`);
        console.log(`🗑️  Found ${backupFiles.length} backup files`);
        
        // Create mapping
        for (const htmlFile of htmlFiles) {
            const expectedMdPath = this.htmlToMdPath(htmlFile.relativePath);
            const matchingMd = mdFiles.find(md => 
                md.relativePath === expectedMdPath || 
                md.relativePath === expectedMdPath.replace(".html", ".md")
            );
            
            if (matchingMd) {
                this.mapping.matched.push({
                    html: htmlFile,
                    md: matchingMd
                });
            } else {
                this.mapping.missingMd.push({
                    html: htmlFile,
                    expectedMdPath: expectedMdPath
                });
            }
        }
        
        // Find MD files without HTML counterparts
        for (const mdFile of mdFiles) {
            const expectedHtmlPath = this.mdToHtmlPath(mdFile.relativePath);
            const matchingHtml = htmlFiles.find(html => 
                html.relativePath === expectedHtmlPath
            );
            
            if (!matchingHtml && !this.mapping.matched.find(m => m.md.relativePath === mdFile.relativePath)) {
                this.mapping.missingHtml.push({
                    md: mdFile,
                    expectedHtmlPath: expectedHtmlPath
                });
            }
        }
        
        this.mapping.backupFiles = backupFiles;
        
        return this.mapping;
    }

    /**
     * Convert HTML file path to expected MD path
     */
    htmlToMdPath(htmlPath) {
        return htmlPath.replace(".html", ".md");
    }

    /**
     * Convert MD file path to expected HTML path
     */
    mdToHtmlPath(mdPath) {
        return mdPath.replace(".md", ".html");
    }

    /**
     * Generate detailed mapping report
     */
    generateReport() {
        const report = `# Documentation File Mapping Analysis
*Generated: ${new Date().toISOString()}*

## Summary
- **Matched pairs**: ${this.mapping.matched.length}
- **Missing .md files**: ${this.mapping.missingMd.length}
- **Missing .html files**: ${this.mapping.missingHtml.length}
- **Backup files to clean**: ${this.mapping.backupFiles.length}

## Matched Pairs (${this.mapping.matched.length})
${this.mapping.matched.map(pair => `- ✅ ${pair.html.relativePath} ↔ ${pair.md.relativePath}`).join("\n")}

## Missing .md Files (${this.mapping.missingMd.length})
${this.mapping.missingMd.map(item => `- ❌ **${item.html.relativePath}** needs **${item.expectedMdPath}**`).join("\n")}

## Missing .html Files (${this.mapping.missingHtml.length})
${this.mapping.missingHtml.map(item => `- ❌ **${item.md.relativePath}** needs **${item.expectedHtmlPath}**`).join("\n")}

## Backup Files to Clean (${this.mapping.backupFiles.length})
${this.mapping.backupFiles.map(file => `- 🗑️  ${path.basename(file.fullPath)}`).join("\n")}

## Repair Plan
1. Create ${this.mapping.missingMd.length} missing .md files
2. Create ${this.mapping.missingHtml.length} missing .html files  
3. Clean up ${this.mapping.backupFiles.length} backup files
4. Establish 1:1 mapping for ${this.mapping.matched.length + this.mapping.missingMd.length + this.mapping.missingHtml.length} total pairs
`;

        return report;
    }

    /**
     * Save the mapping report
     */
    async saveReport() {
        const report = this.generateReport();
        const reportPath = path.join(this.baseDir, "docs-mapping-analysis.md");
        await fs.writeFile(reportPath, report);
        console.log(`📋 Mapping analysis saved: ${reportPath}`);
        return reportPath;
    }
}

// CLI execution
async function main() {
    try {
        const mapper = new DocumentationMapper();
        const mapping = await mapper.createMapping();
        
        console.log("\n📊 Analysis Results:");
        console.log(`✅ Matched pairs: ${mapping.matched.length}`);
        console.log(`❌ Missing .md files: ${mapping.missingMd.length}`);
        console.log(`❌ Missing .html files: ${mapping.missingHtml.length}`);
        console.log(`🗑️  Backup files: ${mapping.backupFiles.length}`);
        
        await mapper.saveReport();
        
        return mapping;
        
    } catch (error) {
        console.error("💥 Analysis failed:", error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = DocumentationMapper;
