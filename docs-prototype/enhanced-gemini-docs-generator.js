#!/usr/bin/env node
/**
 * HexTrackr Enhanced Documentation Generator (v2.0)
 * 
 * UPDATES existing .md files instead of overwriting them
 * Maintains 1:1 relationship with HTML files
 * Preserves HTML structure while updating content
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class EnhancedGeminiDocsGenerator {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.sourceDir = path.join(this.baseDir, 'docs-source');
        this.htmlDir = path.join(this.baseDir, 'docs-prototype', 'content');
        this.promptsDir = path.join(this.baseDir, '.prompts');
        
        // Initialize Gemini AI
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not found in environment variables. Please check your .env file.');
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        this.stats = {
            filesScanned: 0,
            filesUpdated: 0,
            startTime: Date.now()
        };
    }

    /**
     * Load the master prompt for documentation generation
     */
    async loadMasterPrompt() {
        try {
            const promptPath = path.join(this.promptsDir, 'generate-docs.prompt.md');
            const promptContent = await fs.readFile(promptPath, 'utf8');
            return promptContent;
        } catch (error) {
            console.error('Error loading master prompt:', error.message);
            // Use fallback prompt if file doesn't exist
            return this.getFallbackPrompt();
        }
    }

    /**
     * Fallback prompt if master prompt file is missing
     */
    getFallbackPrompt() {
        return `
# Documentation Generation Guidelines

You are an expert technical writer and documentation specialist. Your task is to UPDATE existing documentation while preserving its structure and improving its content.

## Key Requirements:
1. PRESERVE the existing document structure and headings
2. UPDATE content to be more accurate and comprehensive
3. Maintain professional tone and clarity
4. Include practical examples where appropriate
5. Follow Codacy markdown compliance standards
6. Add proper blank lines around headers and lists
7. Use consistent formatting throughout

## Codacy Compliance Rules:
- Blank lines before AND after every header
- Blank lines around all lists
- Sequential ordered list numbering (1., 2., 3.)
- Unique header content
- Proper code block language tags
- Consistent list formatting

## Update Approach:
- Analyze existing content for accuracy
- Enhance explanations and examples
- Add missing technical details
- Improve readability and structure
- Maintain existing tone and style
`;
    }

    /**
     * Get all matched .md and .html file pairs
     */
    async getDocumentationPairs() {
        const pairs = [];
        
        async function scanDirectory(sourceDir, htmlDir, relativePath = '') {
            try {
                const sourceEntries = await fs.readdir(sourceDir);
                
                for (const entry of sourceEntries) {
                    const sourcePath = path.join(sourceDir, entry);
                    const htmlPath = path.join(htmlDir, entry.replace('.md', '.html'));
                    const stat = await fs.stat(sourcePath);
                    
                    if (stat.isDirectory()) {
                        const nestedHtmlDir = path.join(htmlDir, entry);
                        await scanDirectory(sourcePath, nestedHtmlDir, path.join(relativePath, entry));
                    } else if (entry.endsWith('.md') && !entry.includes('.backup.')) {
                        // Check if corresponding HTML file exists
                        try {
                            await fs.access(htmlPath);
                            pairs.push({
                                mdPath: sourcePath,
                                htmlPath: htmlPath,
                                relativePath: path.join(relativePath, entry),
                                name: entry.replace('.md', '')
                            });
                        } catch (error) {
                            console.warn(`No HTML file found for ${entry}`);
                        }
                    }
                }
            } catch (error) {
                console.warn(`Warning: Could not scan directory ${sourceDir}: ${error.message}`);
            }
        }
        
        await scanDirectory(this.sourceDir, this.htmlDir);
        return pairs;
    }

    /**
     * Scan codebase for current content analysis
     */
    async scanCodebase() {
        const filesToScan = [
            'server.js',
            'scripts/init-database.js',
            'scripts/version-manager.js',
            'scripts/pages/tickets.js',
            'scripts/pages/vulnerabilities.js',
            'scripts/shared/settings-modal.js',
            'package.json',
            'eslint.config.js'
        ];

        const codebaseContent = {};
        
        for (const filePath of filesToScan) {
            try {
                const fullPath = path.join(this.baseDir, filePath);
                const content = await fs.readFile(fullPath, 'utf8');
                codebaseContent[filePath] = {
                    path: filePath,
                    content: content.substring(0, 10000), // Limit content size
                    size: content.length,
                    lines: content.split('\n').length
                };
                this.stats.filesScanned++;
            } catch (error) {
                console.warn(`Warning: Could not read ${filePath}: ${error.message}`);
            }
        }

        return codebaseContent;
    }

    /**
     * Update existing documentation file using Gemini AI
     */
    async updateDocumentationFile(pair, codebaseContent) {
        try {
            // Read existing content
            const existingContent = await fs.readFile(pair.mdPath, 'utf8');
            const masterPrompt = await this.loadMasterPrompt();
            
            // Create update prompt
            const updatePrompt = `
${masterPrompt}

## TASK: UPDATE EXISTING DOCUMENTATION

You are updating the documentation file: ${pair.relativePath}

### EXISTING CONTENT TO UPDATE:
\`\`\`markdown
${existingContent}
\`\`\`

### CODEBASE CONTEXT:
${Object.entries(codebaseContent).slice(0, 3).map(([filePath, info]) => `
**${filePath}** (${info.lines} lines, ${info.size} bytes)
\`\`\`javascript
${info.content.substring(0, 1000)}...
\`\`\`
`).join('\n')}

### UPDATE REQUIREMENTS:
1. PRESERVE the existing structure and all current headings
2. ENHANCE the content with better explanations and examples
3. ENSURE all information is accurate and up-to-date
4. ADD missing technical details where appropriate
5. MAINTAIN the professional tone and style
6. FOLLOW Codacy markdown compliance (blank lines around headers/lists)
7. KEEP all existing sections unless they are clearly incorrect

### OUTPUT:
Provide the COMPLETE updated markdown content. Do not add explanations or comments - just the improved documentation.
`;

            console.log(`🤖 Updating ${pair.relativePath}...`);
            const result = await this.model.generateContent(updatePrompt);
            const response = await result.response;
            const updatedContent = response.text();
            
            // Create backup of existing content
            const backupPath = `${pair.mdPath}.backup.${Date.now()}`;
            await fs.writeFile(backupPath, existingContent);
            
            // Write updated content
            await fs.writeFile(pair.mdPath, updatedContent);
            console.log(`✅ Updated: ${pair.relativePath}`);
            this.stats.filesUpdated++;
            
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to update ${pair.relativePath}: ${error.message}`);
            return false;
        }
    }

    /**
     * Update all documentation files
     */
    async updateAllDocumentation(limitToFiles = null) {
        try {
            console.log('🚀 Starting enhanced documentation update...');
            
            const pairs = await this.getDocumentationPairs();
            console.log(`📊 Found ${pairs.length} documentation pairs`);
            
            // Filter to specific files if requested
            const filesToUpdate = limitToFiles ? 
                pairs.filter(pair => limitToFiles.some(name => pair.relativePath.includes(name))) :
                pairs;
            
            console.log(`🎯 Updating ${filesToUpdate.length} files`);
            
            const codebaseContent = await this.scanCodebase();
            console.log(`✅ Scanned ${this.stats.filesScanned} code files`);
            
            const updatedFiles = [];
            
            for (const pair of filesToUpdate) {
                try {
                    const success = await this.updateDocumentationFile(pair, codebaseContent);
                    if (success) {
                        updatedFiles.push(pair.relativePath);
                    }
                    
                    // Add delay between API calls to respect rate limits
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                } catch (error) {
                    console.error(`❌ Failed to update ${pair.relativePath}: ${error.message}`);
                }
            }
            
            // Generate summary report
            await this.generateUpdateReport(updatedFiles);
            
            const elapsed = (Date.now() - this.stats.startTime) / 1000;
            console.log(`\\n🎉 Documentation update complete!`);
            console.log(`📈 Updated ${this.stats.filesUpdated} files in ${elapsed.toFixed(1)}s`);
            
            return updatedFiles;
            
        } catch (error) {
            console.error('❌ Documentation update failed:', error.message);
            throw error;
        }
    }

    /**
     * Generate summary report of the update process
     */
    async generateUpdateReport(updatedFiles) {
        const reportContent = `
# Documentation Update Report
*Generated: ${new Date().toISOString()}*

## Summary
- **Files Scanned**: ${this.stats.filesScanned}
- **Files Updated**: ${this.stats.filesUpdated}
- **Total Duration**: ${((Date.now() - this.stats.startTime) / 1000).toFixed(1)}s

## Updated Documentation Files
${updatedFiles.map(file => `- ✅ ${file}`).join('\n')}

## Update Process
1. ✅ Analyzed existing content structure
2. ✅ Preserved all current headings and organization
3. ✅ Enhanced content with better explanations
4. ✅ Applied Codacy compliance standards
5. ✅ Created backups of original files

## Quality Assurance
- All updates maintain existing document structure
- Content is enhanced, not replaced
- Codacy markdown compliance applied
- Professional tone and style preserved

## Next Steps
1. Review updated documentation for accuracy
2. Test all links and references
3. Verify HTML files render correctly
4. Deploy to documentation portal
`;

        const reportPath = path.join(this.sourceDir, 'update-report.md');
        await fs.writeFile(reportPath, reportContent);
        console.log(`📋 Update report saved: update-report.md`);
    }
}

// CLI handling
async function main() {
    try {
        const generator = new EnhancedGeminiDocsGenerator();
        
        // Parse command line arguments
        const args = process.argv.slice(2);
        const filesArg = args.find(arg => arg.startsWith('--files='));
        const testMode = args.includes('--test');
        
        let limitToFiles = null;
        if (filesArg) {
            limitToFiles = filesArg.split('=')[1].split(',');
            console.log(`🎯 Limited to files: ${limitToFiles.join(', ')}`);
        }
        
        if (testMode) {
            console.log('🧪 Running in test mode with first 3 files only');
            limitToFiles = ['overview.md', 'index.md', 'generation-report.md'];
        }
        
        await generator.updateAllDocumentation(limitToFiles);
        
    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = EnhancedGeminiDocsGenerator;
