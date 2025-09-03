#!/usr/bin/env node

/* eslint-env node */
/* global require, module, process, console, setTimeout */

/**
 * Gemini-Powered Documentation Generator
 * 
 * Uses Google Gemini API to comprehensively review and enhance HexTrackr documentation
 * Integrates with existing docs-source/ → docs-html/ workflow
 */

const fs = require("fs").promises;
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Secure path validation utility to prevent path traversal attacks
 */
class PathValidator {
    static validatePathComponent(component) {
        if (typeof component !== "string") {
            throw new Error("Path component must be a string");
        }
        
        // Block dangerous path components
        const dangerous = [".", "..", "__proto__", "constructor", "prototype"];
        if (dangerous.includes(component)) {
            throw new Error(`Dangerous path component: ${component}`);
        }
        
        // Block null bytes and other dangerous characters
        if (component.includes("\0") || component.includes("..")) {
            throw new Error(`Invalid characters in path component: ${component}`);
        }
        
        return component;
    }

    static async safeStat(filePath) {
        try {
            return await fs.stat(filePath);
        } catch (error) {
            throw new Error(`Cannot access path: ${filePath}: ${error.message}`);
        }
    }

    static async safeReadFile(filePath) {
        try {
            return await fs.readFile(filePath, "utf8");
        } catch (error) {
            throw new Error(`Cannot read file: ${filePath}: ${error.message}`);
        }
    }

    static async safeWriteFile(filePath, content) {
        try {
            return await fs.writeFile(filePath, content, "utf8");
        } catch (error) {
            throw new Error(`Cannot write file: ${filePath}: ${error.message}`);
        }
    }

    static async safeReaddir(dirPath) {
        try {
            return await fs.readdir(dirPath);
        } catch (error) {
            throw new Error(`Cannot read directory: ${dirPath}: ${error.message}`);
        }
    }
}

/**
 * Gemini Documentation Generator
 */
class GeminiDocsGenerator {
    constructor() {
        this.baseDir = process.cwd();
        this.docsSourceDir = path.join(this.baseDir, "docs-source");
        this.docsHtmlDir = path.join(this.baseDir, "docs-html");
        this.promptsDir = path.join(this.baseDir, ".prompts");
        
        // Initialize Gemini API
        this.initializeGeminiAPI();
        
        this.analysis = {
            scannedFiles: [],
            analysisResults: {},
            enhancements: [],
            errors: []
        };
    }

    /**
     * Initialize Google Gemini API
     */
    initializeGeminiAPI() {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY not found in environment variables");
            console.log("💡 Please set GEMINI_API_KEY in your .env file");
            process.exit(1);
        }

        try {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            console.log("✅ Gemini API initialized successfully");
        } catch (error) {
            console.error("❌ Failed to initialize Gemini API:", error.message);
            process.exit(1);
        }
    }

    /**
     * Load the documentation review prompt
     */
    async loadReviewPrompt() {
        const promptPath = path.join(this.promptsDir, "gemini-docs-review.prompt.md");
        
        try {
            const promptContent = await PathValidator.safeReadFile(promptPath);
            console.log(`📋 Loaded review prompt: ${promptPath}`);
            return promptContent;
        } catch (error) {
            console.error(`❌ Failed to load review prompt: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * Scan all documentation files
     */
    async scanDocumentationFiles() {
        console.log("🔍 Scanning documentation files...");
        
        const files = [];
        
        async function scanDirectory(dir, relativePath = "") {
            try {
                const entries = await PathValidator.safeReaddir(dir);
                
                for (const entry of entries) {
                    const validatedEntry = PathValidator.validatePathComponent(entry);
                    const fullPath = path.join(dir, validatedEntry);
                    const relativeFilePath = path.join(relativePath, validatedEntry);
                    const stat = await PathValidator.safeStat(fullPath);
                    
                    if (stat.isDirectory() && !validatedEntry.startsWith(".")) {
                        await scanDirectory(fullPath, relativeFilePath);
                    } else if (validatedEntry.endsWith(".md") && !validatedEntry.includes(".backup.")) {
                        files.push({
                            name: validatedEntry,
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
        
        this.analysis.scannedFiles = files;
        console.log(`📁 Found ${files.length} documentation files`);
        
        return files;
    }

    /**
     * Analyze a single documentation file with Gemini
     */
    async analyzeFileWithGemini(file, prompt) {
        try {
            console.log(`🤖 Analyzing: ${file.relativePath}`);
            
            const content = await PathValidator.safeReadFile(file.fullPath);
            
            const analysisPrompt = `${prompt}

## File Analysis Request

**File**: ${file.relativePath}
**Purpose**: Analyze this specific documentation file for accuracy, completeness, and quality

**Current Content**:
\`\`\`markdown
${content}
\`\`\`

**Analysis Requirements**:
1. Content accuracy and completeness
2. Technical correctness
3. Writing quality and clarity
4. Structural improvements needed
5. Missing information or sections
6. Specific enhancement recommendations

**Response Format**:
Please provide:
1. **Quality Score** (1-10)
2. **Key Issues** (bulleted list)
3. **Enhancement Recommendations** (specific, actionable)
4. **Improved Content** (if significant changes needed)

Focus on practical improvements that enhance user experience and technical accuracy.`;

            const result = await this.model.generateContent(analysisPrompt);
            const response = result.response;
            const analysisText = response.text();
            
            this.analysis.analysisResults[file.relativePath] = {
                originalContent: content,
                geminiAnalysis: analysisText,
                timestamp: new Date().toISOString()
            };
            
            console.log(`✅ Completed analysis: ${file.relativePath}`);
            
            // Add small delay to respect API rate limits (1 second)
            await new Promise(resolve => {
                setTimeout(resolve, 1000);
            });
            
            return analysisText;
            
        } catch (error) {
            console.error(`❌ Failed to analyze ${file.relativePath}: ${error.message}`);
            this.analysis.errors.push({
                file: file.relativePath,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return null;
        }
    }

    /**
     * Generate comprehensive documentation analysis
     */
    async generateComprehensiveAnalysis(prompt) {
        try {
            console.log("🧠 Generating comprehensive documentation analysis...");
            
            // Collect all file contents
            const fileContents = [];
            for (const file of this.analysis.scannedFiles) {
                try {
                    const content = await PathValidator.safeReadFile(file.fullPath);
                    fileContents.push({
                        path: file.relativePath,
                        content: content
                    });
                } catch (error) {
                    console.warn(`Warning: Could not read ${file.relativePath}: ${error.message}`);
                }
            }
            
            const comprehensivePrompt = `${prompt}

## Comprehensive Documentation Analysis

**Project**: HexTrackr v1.0.3 - Vulnerability & Ticket Management System

**All Documentation Files**:
${fileContents.map(file => `
### ${file.path}
\`\`\`markdown
${file.content}
\`\`\`
`).join("\n")}

**Analysis Requirements**:
1. Overall documentation completeness and structure
2. Cross-file consistency and accuracy
3. Missing critical documentation areas
4. User experience flow analysis
5. Technical accuracy verification
6. Priority enhancement recommendations

**Response Format**:
Please provide a comprehensive analysis including:
1. **Executive Summary** with key findings
2. **Section-by-Section Analysis** with specific issues
3. **Priority Enhancement Plan** with actionable items
4. **Overall Quality Score** and improvement metrics
5. **Specific Content Improvements** where needed

Focus on creating documentation that serves both technical and non-technical users effectively.`;

            const result = await this.model.generateContent(comprehensivePrompt);
            const response = result.response;
            const analysisText = response.text();
            
            console.log("✅ Comprehensive analysis completed");
            return analysisText;
            
        } catch (error) {
            console.error(`❌ Failed to generate comprehensive analysis: ${error.message}`);
            this.analysis.errors.push({
                file: "comprehensive_analysis",
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return null;
        }
    }

    /**
     * Save analysis results
     */
    async saveAnalysisResults(comprehensiveAnalysis) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const reportDir = path.join(this.baseDir, "docs-analysis");
        
        try {
            // Create analysis directory if it doesn't exist
            try {
                await PathValidator.safeStat(reportDir);
            } catch {
                await fs.mkdir(reportDir, { recursive: true });
            }
            
            // Save comprehensive analysis
            const comprehensiveReportPath = path.join(reportDir, `comprehensive-analysis-${timestamp}.md`);
            await PathValidator.safeWriteFile(comprehensiveReportPath, comprehensiveAnalysis);
            console.log(`📊 Comprehensive analysis saved: ${comprehensiveReportPath}`);
            
            // Save individual file analyses
            for (const [filePath, analysis] of Object.entries(this.analysis.analysisResults)) {
                const fileName = filePath.replace(/[/\\]/g, "-").replace(/\.md$/, "");
                const individualReportPath = path.join(reportDir, `${fileName}-analysis-${timestamp}.md`);
                
                const individualReport = `# Analysis: ${filePath}
*Generated: ${analysis.timestamp}*

## Original Content
\`\`\`markdown
${analysis.originalContent}
\`\`\`

## Gemini Analysis
${analysis.geminiAnalysis}
`;
                
                await PathValidator.safeWriteFile(individualReportPath, individualReport);
            }
            
            // Save summary report
            const summaryReportPath = path.join(reportDir, `analysis-summary-${timestamp}.md`);
            const summaryReport = `# HexTrackr Documentation Analysis Summary
*Generated: ${new Date().toISOString()}*

## Statistics
- **Files Analyzed**: ${this.analysis.scannedFiles.length}
- **Successful Analyses**: ${Object.keys(this.analysis.analysisResults).length}
- **Errors**: ${this.analysis.errors.length}

## Analyzed Files
${this.analysis.scannedFiles.map(file => `- ${file.relativePath}`).join("\n")}

## Analysis Results
${Object.keys(this.analysis.analysisResults).map(file => `- ✅ ${file}`).join("\n")}

## Errors
${this.analysis.errors.map(error => `- ❌ ${error.file}: ${error.error}`).join("\n")}

## Next Steps
1. Review comprehensive analysis report
2. Implement priority recommendations
3. Update documentation files
4. Run docs:generate to update HTML portal
5. Test documentation navigation and accuracy

## Files Generated
- Comprehensive Analysis: comprehensive-analysis-${timestamp}.md
- Individual Analyses: Available for each processed file
- Summary Report: This file (analysis-summary-${timestamp}.md)
`;
            
            await PathValidator.safeWriteFile(summaryReportPath, summaryReport);
            console.log(`📋 Analysis summary saved: ${summaryReportPath}`);
            
            return {
                comprehensiveReport: comprehensiveReportPath,
                summaryReport: summaryReportPath,
                analysisDir: reportDir
            };
            
        } catch (error) {
            console.error(`❌ Failed to save analysis results: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate analysis report
     */
    generateReport() {
        const report = `# Gemini Documentation Analysis Report
*Generated: ${new Date().toISOString()}*

## Summary
- **Files Scanned**: ${this.analysis.scannedFiles.length}
- **Successful Analyses**: ${Object.keys(this.analysis.analysisResults).length}
- **Errors**: ${this.analysis.errors.length}
- **Success Rate**: ${((Object.keys(this.analysis.analysisResults).length / this.analysis.scannedFiles.length) * 100).toFixed(1)}%

## Files Analyzed
${this.analysis.scannedFiles.map(file => {
    const status = this.analysis.analysisResults[file.relativePath] ? "✅" : "❌";
    return `${status} ${file.relativePath}`;
}).join("\n")}

## Errors
${this.analysis.errors.map(error => `- ❌ **${error.file}**: ${error.error}`).join("\n")}

## Next Steps
1. Review generated analysis reports in docs-analysis/ directory
2. Implement recommended improvements
3. Update documentation files based on Gemini suggestions
4. Run \`npm run docs:generate\` to update HTML portal
5. Test updated documentation for accuracy and completeness

## Generated Files
All analysis results have been saved to the docs-analysis/ directory with timestamped filenames.
`;

        return report;
    }
}

// CLI execution
async function main() {
    try {
        console.log("🚀 HexTrackr Gemini Documentation Generator");
        console.log("============================================\n");
        
        const generator = new GeminiDocsGenerator();
        
        // Load review prompt
        const prompt = await generator.loadReviewPrompt();
        
        // Scan documentation files
        const files = await generator.scanDocumentationFiles();
        
        if (files.length === 0) {
            console.log("📝 No documentation files found to analyze");
            return;
        }
        
        // Analyze each file individually
        console.log(`\n🤖 Starting Gemini analysis of ${files.length} files...\n`);
        
        for (const file of files) {
            await generator.analyzeFileWithGemini(file, prompt);
        }
        
        // Generate comprehensive analysis
        console.log("\n🧠 Generating comprehensive documentation analysis...\n");
        const comprehensiveAnalysis = await generator.generateComprehensiveAnalysis(prompt);
        
        // Save all results
        if (comprehensiveAnalysis) {
            const savedFiles = await generator.saveAnalysisResults(comprehensiveAnalysis);
            console.log(`\n📊 Analysis complete! Results saved to: ${savedFiles.analysisDir}`);
        }
        
        // Generate and display report
        const report = generator.generateReport();
        console.log("\n" + report);
        
        return generator.analysis;
        
    } catch (error) {
        console.error("💥 Documentation generation failed:", error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = GeminiDocsGenerator;
