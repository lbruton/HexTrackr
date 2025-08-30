#!/usr/bin/env node
/* eslint-env node */
/**
 * Claude-4 Code Analysis Scribe
 * Uses Claude-4 for premium code analysis and documentation generation
 */

require("dotenv").config();
const { Anthropic } = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

class ClaudeOpusScribe {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = "claude-opus-4-1-20250805"; // Claude-4: Most powerful model available
  }

  /**
   * Analyze repository structure and generate insights
   */
  async analyzeRepository(projectPath = process.cwd()) {
    try {
      console.log("🔍 Claude Opus analyzing repository structure...");
      
      // Get repository overview
      const repoStructure = await this.getRepositoryStructure(projectPath);
      const packageInfo = await this.getPackageInfo(projectPath);
      const readmeContent = await this.getReadmeContent(projectPath);
      
      const prompt = `You are a senior software architect analyzing a repository. Provide a comprehensive analysis:

PROJECT STRUCTURE:
${repoStructure}

PACKAGE INFORMATION:
${packageInfo}

README CONTENT:
${readmeContent}

Please provide:
1. **Architecture Overview** - High-level system design and patterns
2. **Technology Stack Analysis** - Dependencies, frameworks, tools used
3. **Code Organization** - How the project is structured and why
4. **Key Components** - Main modules and their responsibilities
5. **Security Considerations** - Potential security aspects based on the codebase
6. **Documentation Gaps** - What documentation should be created/improved
7. **Improvement Recommendations** - Suggestions for code quality, architecture, or documentation

Be thorough but concise. Focus on actionable insights.`;

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4000,
        temperature: 0.1,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      const analysis = response.content[0].text;
      
      // Save analysis to file
      const outputPath = path.join(projectPath, "docs", "analysis", "claude-opus-analysis.md");
      await this.ensureDirectoryExists(path.dirname(outputPath));
      fs.writeFileSync(outputPath, this.formatAnalysisOutput(analysis));
      
      console.log("✅ Repository analysis complete!");
      console.log(`📄 Analysis saved to: ${outputPath}`);
      
      return {
        analysis,
        outputPath,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens
      };
      
    } catch (error) {
      console.error("❌ Repository analysis failed:", error.message);
      throw error;
    }
  }

  /**
   * Generate comprehensive documentation for a specific module/component
   */
  async generateDocumentation(filePath, outputDir = "docs/api-reference") {
    try {
      console.log(`📚 Generating documentation for: ${filePath}`);
      
      const fileContent = fs.readFileSync(filePath, "utf8");
      const fileName = path.basename(filePath);
      
      const prompt = `You are a technical documentation specialist. Analyze this code file and generate comprehensive documentation:

FILE: ${fileName}
CONTENT:
${fileContent}

Generate documentation including:
1. **Purpose** - What this module/component does
2. **API Reference** - Functions, classes, methods with parameters and return values  
3. **Usage Examples** - How to use the main functionality
4. **Dependencies** - What this module depends on
5. **Integration** - How it fits into the larger system
6. **Configuration** - Any configuration options or environment variables
7. **Error Handling** - Common errors and how to handle them

Format as professional technical documentation in Markdown.`;

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 3000,
        temperature: 0.1,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      const documentation = response.content[0].text;
      
      // Save documentation
      const outputPath = path.join(outputDir, `${path.parse(fileName).name}.md`);
      await this.ensureDirectoryExists(path.dirname(outputPath));
      fs.writeFileSync(outputPath, this.formatDocumentationOutput(fileName, documentation));
      
      console.log(`✅ Documentation generated: ${outputPath}`);
      
      return {
        documentation,
        outputPath,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens
      };
      
    } catch (error) {
      console.error(`❌ Documentation generation failed for ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Get repository structure (files and directories)
   */
  async getRepositoryStructure(projectPath, maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) {return "";}
    
    try {
      const items = fs.readdirSync(projectPath);
      let structure = "";
      
      for (const item of items) {
        // Skip common ignore patterns
        if (item.startsWith(".") || ["node_modules", "dist", "build"].includes(item)) {
          continue;
        }
        
        const itemPath = path.join(projectPath, item);
        const stats = fs.statSync(itemPath);
        const indent = "  ".repeat(currentDepth);
        
        if (stats.isDirectory()) {
          structure += `${indent}${item}/\n`;
          structure += await this.getRepositoryStructure(itemPath, maxDepth, currentDepth + 1);
        } else {
          structure += `${indent}${item}\n`;
        }
      }
      
      return structure;
    } catch (error) {
      return `Error reading directory: ${error.message}\n`;
    }
  }

  /**
   * Get package.json information
   */
  async getPackageInfo(projectPath) {
    try {
      const packagePath = path.join(projectPath, "package.json");
      if (fs.existsSync(packagePath)) {
        return fs.readFileSync(packagePath, "utf8");
      }
      return "No package.json found";
    } catch (error) {
      return `Error reading package.json: ${error.message}`;
    }
  }

  /**
   * Get README content
   */
  async getReadmeContent(projectPath) {
    try {
      const readmePaths = ["README.md", "README.txt", "readme.md"];
      for (const readmePath of readmePaths) {
        const fullPath = path.join(projectPath, readmePath);
        if (fs.existsSync(fullPath)) {
          return fs.readFileSync(fullPath, "utf8");
        }
      }
      return "No README file found";
    } catch (error) {
      return `Error reading README: ${error.message}`;
    }
  }

  /**
   * Ensure directory exists
   */
  async ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Format analysis output
   */
  formatAnalysisOutput(analysis) {
    const timestamp = new Date().toISOString();
    return `# Repository Analysis - Claude Opus

**Generated**: ${timestamp}  
**Analyzer**: Claude-4 (claude-opus-4-1-20250805)

${analysis}

---
*This analysis was generated automatically by Claude-4. Review and validate all recommendations.*`;
  }

  /**
   * Format documentation output
   */
  formatDocumentationOutput(fileName, documentation) {
    const timestamp = new Date().toISOString();
    return `# ${fileName} - API Documentation

**Generated**: ${timestamp}  
**Source**: ${fileName}  
**Documentation Generator**: Claude-4

${documentation}

---
*This documentation was generated automatically by Claude-4. Please review and update as needed.*`;
  }
}

/**
 * CLI interface
 */
async function main() {
  const [command, ...args] = process.argv.slice(2);
  const scribe = new ClaudeOpusScribe();

  try {
    switch (command) {
      case "analyze":
        const projectPath = args[0] || process.cwd();
        const result = await scribe.analyzeRepository(projectPath);
        console.log(`\n📊 Analysis complete! Used ${result.tokensUsed} tokens.`);
        break;

      case "document":
        if (!args[0]) {
          console.error("Usage: node claude-opus-scribe.js document <file-path>");
          process.exit(1);
        }
        const docResult = await scribe.generateDocumentation(args[0], args[1]);
        console.log(`\n📚 Documentation complete! Used ${docResult.tokensUsed} tokens.`);
        break;

      default:
        console.log(`Claude-4 Code Analysis & Documentation Scribe

Usage:
  node scripts/claude-opus-scribe.js analyze [project-path]     # Analyze repository
  node scripts/claude-opus-scribe.js document <file-path> [output-dir]  # Generate docs

Examples:
  node scripts/claude-opus-scribe.js analyze
  node scripts/claude-opus-scribe.js document server.js
  node scripts/claude-opus-scribe.js document scripts/memory-local.js docs/api

Environment Variables:
  ANTHROPIC_API_KEY     # Your Claude API key (required)
`);
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ Scribe execution failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ClaudeOpusScribe };
