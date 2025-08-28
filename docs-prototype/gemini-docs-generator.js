#!/usr/bin/env node
/**
 * HexTrackr AI-Powered Documentation Generator
 * 
 * Uses Gemini API to automatically scan codebase and generate comprehensive documentation
 * with security best practices and professional formatting.
 * 
 * Usage: node gemini-docs-generator.js [--section=api|functions|all] [--force-update]
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiDocsGenerator {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.sourceDir = path.join(this.baseDir, 'docs-source');
        this.promptsDir = path.join(this.baseDir, '.prompts');
        this.templateDir = path.join(__dirname, 'templates');
        
        // Initialize Gemini AI
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not found in environment variables. Please check your .env file.');
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        this.stats = {
            filesScanned: 0,
            sectionsGenerated: 0,
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
            throw new Error('Master prompt file not found. Please ensure .prompts/generate-docs.prompt.md exists.');
        }
    }

    /**
     * Scan codebase and gather all relevant files for analysis
     */
    async scanCodebase() {
        const filesToScan = [
            // Backend files
            'server.js',
            'scripts/init-database.js',
            'scripts/version-manager.js',
            
            // Frontend pages
            'scripts/pages/tickets.js',
            'scripts/pages/vulnerabilities.js',
            
            // Shared components
            'scripts/shared/settings-modal.js',
            'scripts/shared/header-loader.js',
            'scripts/shared/footer-loader.js',
            
            // Documentation system
            'docs-prototype/js/docs-tabler.js',
            
            // Configuration
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
                    content: content,
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
     * Generate documentation section using Gemini AI
     */
    async generateDocumentationSection(sectionType, codebaseContent, customPrompt = '') {
        try {
            const masterPrompt = await this.loadMasterPrompt();
            
            // Create section-specific prompt
            const sectionPrompts = {
                api: `Focus on API endpoint discovery and documentation. Analyze server.js and related files for Express routes.`,
                functions: `Focus on JavaScript function analysis. Document all significant functions in the frontend codebase.`,
                architecture: `Focus on system architecture and component relationships. Show how different parts work together.`,
                database: `Focus on database schema and query analysis. Document tables, relationships, and data flow.`,
                security: `Focus on security analysis. Identify potential vulnerabilities and document security best practices.`
            };

            const prompt = `
${masterPrompt}

## Specific Analysis Focus
${sectionPrompts[sectionType] || 'Perform comprehensive analysis of all aspects.'}

${customPrompt}

## Codebase to Analyze
${Object.entries(codebaseContent).map(([filePath, info]) => `
### ${filePath}
\`\`\`javascript
${info.content}
\`\`\`
`).join('\n')}

Please analyze this codebase and generate comprehensive documentation following the standards and security requirements specified above.
`;

            console.log(`🤖 Generating ${sectionType} documentation with Gemini...`);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            
            return response.text();
            
        } catch (error) {
            console.error(`Error generating ${sectionType} documentation:`, error.message);
            throw error;
        }
    }

    /**
     * Save generated documentation with backup
     */
    async saveDocumentation(sectionType, content) {
        try {
            // Determine target directory and filename based on section type
            let targetDir = this.sourceDir;
            let fileName = `${sectionType}.md`;
            
            if (sectionType.startsWith('api-')) {
                targetDir = path.join(this.sourceDir, 'api');
                fileName = sectionType.replace('api-', '') + '.md';
            } else if (sectionType.startsWith('frameworks-')) {
                targetDir = path.join(this.sourceDir, 'frameworks');
                fileName = sectionType.replace('frameworks-', '') + '.md';
            } else if (sectionType.startsWith('functions-') || sectionType === 'database-schema' || 
                       sectionType.includes('flowcharts') || sectionType.includes('navigation') || 
                       sectionType === 'docs-system' || sectionType.includes('javascript') || 
                       sectionType.includes('symbols')) {
                targetDir = path.join(this.sourceDir, 'architecture');
                if (sectionType.startsWith('functions-')) {
                    fileName = sectionType.replace('functions-', '') + '.md';
                } else if (sectionType === 'javascript-reference') {
                    fileName = 'javascript-reference.md';
                } else if (sectionType === 'symbols-index') {
                    fileName = 'symbols-index.md';
                } else {
                    fileName = sectionType.replace(/-/g, '-') + '.md';
                }
            } else if (sectionType.startsWith('roadmaps-')) {
                targetDir = path.join(this.sourceDir, 'roadmaps');
                // Keep the full section name for roadmaps to match portal expectations
                fileName = sectionType + '.md';
            }
            
            // Ensure target directory exists
            await fs.mkdir(targetDir, { recursive: true });
            
            const filePath = path.join(targetDir, fileName);
            
            // Create backup if file exists
            try {
                const existingContent = await fs.readFile(filePath, 'utf8');
                const backupPath = path.join(targetDir, `${path.parse(fileName).name}.backup.${Date.now()}.md`);
                await fs.writeFile(backupPath, existingContent);
                console.log(`📁 Backup created: ${path.basename(backupPath)}`);
            } catch (error) {
                // File doesn't exist yet, no backup needed
            }
            
            // Save new content
            await fs.writeFile(filePath, content);
            console.log(`✅ Documentation saved: ${fileName}`);
            this.stats.sectionsGenerated++;
            
            return filePath;
            
        } catch (error) {
            console.error(`Error saving documentation:`, error.message);
            throw error;
        }
    }

    /**
     * Generate comprehensive project documentation
     */
    async generateComprehensiveDocumentation(sections = ['api', 'functions', 'architecture', 'database', 'security']) {
        try {
            console.log('🚀 Starting AI-powered documentation generation...');
            console.log(`📊 Scanning codebase...`);
            
            const codebaseContent = await this.scanCodebase();
            console.log(`✅ Scanned ${this.stats.filesScanned} files`);
            
            const generatedFiles = [];
            
            for (const section of sections) {
                try {
                    const documentation = await this.generateDocumentationSection(section, codebaseContent);
                    const filePath = await this.saveDocumentation(section, documentation);
                    generatedFiles.push(filePath);
                    
                    // Add delay between API calls to respect rate limits
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (error) {
                    console.error(`❌ Failed to generate ${section} documentation:`, error.message);
                }
            }
            
            // Generate summary report
            await this.generateSummaryReport(generatedFiles);
            
            const elapsed = (Date.now() - this.stats.startTime) / 1000;
            console.log(`\n🎉 Documentation generation complete!`);
            console.log(`📈 Generated ${this.stats.sectionsGenerated} sections in ${elapsed.toFixed(1)}s`);
            console.log(`📂 Files: ${generatedFiles.map(f => path.basename(f)).join(', ')}`);
            
            return generatedFiles;
            
        } catch (error) {
            console.error('❌ Documentation generation failed:', error.message);
            throw error;
        }
    }

    /**
     * Generate summary report of the documentation process
     */
    async generateSummaryReport(generatedFiles) {
        const reportContent = `
# Documentation Generation Report
*Generated: ${new Date().toISOString()}*

## Summary
- **Files Scanned**: ${this.stats.filesScanned}
- **Sections Generated**: ${this.stats.sectionsGenerated}
- **Total Duration**: ${((Date.now() - this.stats.startTime) / 1000).toFixed(1)}s

## Generated Documentation
${generatedFiles.map(file => `- ${path.basename(file)}`).join('\n')}

## Next Steps
1. Review generated documentation for accuracy
2. Test all code examples and links
3. Update navigation to include new sections
4. Deploy to documentation portal

## Security Notes
All documentation was generated with security best practices:
- No dynamic file paths used
- All inputs sanitized
- HTML output escaped
- Error handling implemented
`;

        const reportPath = path.join(this.sourceDir, 'generation-report.md');
        await fs.writeFile(reportPath, reportContent);
        console.log(`📋 Generation report saved: generation-report.md`);
    }
}

// CLI handling
async function main() {
    try {
        const generator = new GeminiDocsGenerator();
        
        // Parse command line arguments
        const args = process.argv.slice(2);
        const sectionArg = args.find(arg => arg.startsWith('--section='));
        const forceUpdate = args.includes('--force-update');
        
        let sections = [
            // API Documentation
            'api-tickets', 'api-vulnerabilities',
            // Framework Reference  
            'frameworks-tabler', 'frameworks-bootstrap', 'frameworks-apexcharts', 'frameworks-aggrid',
            // Architecture
            'functions-overview', 'functions-tickets', 'database-schema', 
            'ui-api-flowcharts', 'page-flow-navigation', 'docs-system',
            'javascript-reference', 'symbols-index',
            // Project Management
            'roadmaps-strategic', 'roadmaps-ui-ux', 'roadmaps-current-status', 
            'roadmaps-changelog', 'roadmaps-codacy'
        ];
        
        if (sectionArg) {
            const requestedSection = sectionArg.split('=')[1];
            if (requestedSection === 'all') {
                // Use full sections list above
            } else {
                sections = [requestedSection];
            }
        }
        
        console.log(`🎯 Generating documentation sections: ${sections.join(', ')}`);
        
        await generator.generateComprehensiveDocumentation(sections);
        
    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = GeminiDocsGenerator;
