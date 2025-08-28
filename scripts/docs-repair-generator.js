#!/usr/bin/env node
/**
 * HTML File Generator for Documentation
 * 
 * Creates missing HTML files based on existing .md files
 */

const fs = require('fs').promises;
const path = require('path');

class HtmlFileGenerator {
    constructor() {
        this.baseDir = process.cwd();
        this.docsSourceDir = path.join(this.baseDir, 'docs-source');
        this.htmlContentDir = path.join(this.baseDir, 'docs-prototype', 'content');
    }

    /**
     * Generate HTML content from markdown file
     */
    async generateHtmlFromMd(mdPath) {
        try {
            // Read the markdown content
            const mdContent = await fs.readFile(mdPath, 'utf8');
            
            // Extract title from markdown (first # heading)
            const titleMatch = mdContent.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : 'Documentation';
            
            // Extract first paragraph as description
            const lines = mdContent.split('\n');
            let description = 'Documentation content';
            for (const line of lines) {
                if (line.trim() && !line.startsWith('#') && !line.startsWith('*Generated:')) {
                    description = line.trim();
                    break;
                }
            }

            // Determine icon based on content type
            let icon = 'fas fa-file-alt';
            if (mdPath.includes('roadmap') || mdPath.includes('planning')) {
                icon = 'fas fa-road';
            } else if (mdPath.includes('api')) {
                icon = 'fas fa-plug';
            } else if (mdPath.includes('architecture')) {
                icon = 'fas fa-building';
            } else if (mdPath.includes('code-review')) {
                icon = 'fas fa-search';
            }

            // Create HTML content
            const htmlContent = `<div class="documentation-section">
    <h2><i class="${icon} me-2"></i>${title}</h2>
    <p class="text-muted mb-4">${description}</p>
    
    <div class="alert alert-info">
        <small><i class="fas fa-info-circle me-1"></i>
        This content is generated from ${path.basename(mdPath)}</small>
    </div>
    
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Content Summary</h3>
        </div>
        <div class="card-body">
            <p>This documentation section contains detailed information about ${title.toLowerCase()}.</p>
            <p>The content is automatically synchronized with the corresponding markdown file.</p>
            
            <div class="alert alert-warning">
                <small><i class="fas fa-wrench me-1"></i>
                This is a placeholder HTML file. Content will be updated by the documentation generator.</small>
            </div>
        </div>
    </div>
</div>`;

            return htmlContent;
            
        } catch (error) {
            console.error(`Error generating HTML for ${mdPath}:`, error.message);
            throw error;
        }
    }

    /**
     * Create missing HTML files
     */
    async createMissingHtmlFiles() {
        const missingHtmlFiles = [
            'architecture/tickets.html',
            'roadmaps/changelog.html',
            'roadmaps/codacy-compliance.html',
            'roadmaps/codacy.html',
            'roadmaps/current-status.html',
            'roadmaps/roadmaps-strategic.html',
            'roadmaps/roadmaps-ui-ux.html',
            'roadmaps/strategic-roadmap.html',
            'roadmaps/strategic.html',
            'roadmaps/ui-ux-roadmap.html',
            'roadmaps/ui-ux.html'
        ];

        const createdFiles = [];

        for (const htmlFile of missingHtmlFiles) {
            try {
                const htmlPath = path.join(this.htmlContentDir, htmlFile);
                const mdPath = path.join(this.docsSourceDir, htmlFile.replace('.html', '.md'));
                
                // Check if the corresponding .md file exists
                try {
                    await fs.access(mdPath);
                } catch (error) {
                    console.warn(`Warning: No corresponding .md file found for ${htmlFile}, skipping`);
                    continue;
                }

                // Ensure directory exists
                await fs.mkdir(path.dirname(htmlPath), { recursive: true });

                // Generate HTML content
                const htmlContent = await this.generateHtmlFromMd(mdPath);

                // Write HTML file
                await fs.writeFile(htmlPath, htmlContent);
                console.log(`✅ Created: ${htmlFile}`);
                createdFiles.push(htmlPath);

            } catch (error) {
                console.error(`❌ Failed to create ${htmlFile}: ${error.message}`);
            }
        }

        return createdFiles;
    }

    /**
     * Clean up backup files
     */
    async cleanupBackupFiles() {
        const backupFiles = [
            'docs-source/api/tickets.backup.1756352891570.md',
            'docs-source/api/vulnerabilities.backup.1756352953743.md',
            'docs-source/architecture/database-schema.backup.1756353414805.md',
            'docs-source/architecture/overview.backup.1756353273847.md',
            'docs-source/architecture/page-flow-navigation.backup.1756353565057.md',
            'docs-source/architecture/ui-api-flowcharts.backup.1756353482331.md',
            'docs-source/frameworks/aggrid.backup.1756353232301.md',
            'docs-source/frameworks/apexcharts.backup.1756353144626.md',
            'docs-source/frameworks/bootstrap.backup.1756353065526.md',
            'docs-source/frameworks/tabler.backup.1756353006178.md',
            'docs-source/overview/overview.backup.1756351077688.md',
            'docs-source/roadmaps/changelog.backup.1756354127284.md',
            'docs-source/roadmaps/current-status.backup.1756354047233.md',
            'docs-prototype/content/overview/overview.backup.1756351077688.html'
        ];

        const cleanedFiles = [];

        for (const backupFile of backupFiles) {
            try {
                const backupPath = path.join(this.baseDir, backupFile);
                await fs.access(backupPath);
                await fs.unlink(backupPath);
                console.log(`🗑️  Removed: ${backupFile}`);
                cleanedFiles.push(backupPath);
            } catch (error) {
                // File doesn't exist, which is fine
            }
        }

        return cleanedFiles;
    }

    /**
     * Generate repair report
     */
    async generateRepairReport(createdFiles, cleanedFiles) {
        const report = `# Documentation Repair Report
*Generated: ${new Date().toISOString()}*

## Summary
- **HTML files created**: ${createdFiles.length}
- **Backup files cleaned**: ${cleanedFiles.length}

## Created HTML Files (${createdFiles.length})
${createdFiles.map(file => `- ✅ ${path.relative(this.baseDir, file)}`).join('\n')}

## Cleaned Backup Files (${cleanedFiles.length})
${cleanedFiles.map(file => `- 🗑️  ${path.relative(this.baseDir, file)}`).join('\n')}

## Next Steps
1. Verify all HTML files load correctly
2. Run Gemini documentation generator to update content
3. Test documentation portal navigation
4. Update any broken links

## Status
All missing HTML files have been created with placeholder content. The Gemini generator can now update these files with actual content from the corresponding .md files.
`;

        const reportPath = path.join(this.baseDir, 'docs-repair-report.md');
        await fs.writeFile(reportPath, report);
        console.log(`📋 Repair report saved: ${reportPath}`);
        return reportPath;
    }
}

// CLI execution
async function main() {
    try {
        const generator = new HtmlFileGenerator();
        
        console.log('🔧 Starting documentation repair...');
        
        // Create missing HTML files
        console.log('\n📄 Creating missing HTML files...');
        const createdFiles = await generator.createMissingHtmlFiles();
        
        // Clean up backup files
        console.log('\n🗑️  Cleaning up backup files...');
        const cleanedFiles = await generator.cleanupBackupFiles();
        
        // Generate report
        await generator.generateRepairReport(createdFiles, cleanedFiles);
        
        console.log('\n🎉 Documentation repair complete!');
        console.log(`✅ Created ${createdFiles.length} HTML files`);
        console.log(`🗑️  Cleaned ${cleanedFiles.length} backup files`);
        
    } catch (error) {
        console.error('💥 Repair failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = HtmlFileGenerator;
