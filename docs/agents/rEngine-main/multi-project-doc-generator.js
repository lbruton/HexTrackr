#!/usr/bin/env node

/**
 const CONFIG = {
    OLLAMA_HOST: 'http://localhost:11434',
    // Using Llama3.1 instead of Qwen for better structured output
    ANALYSIS_MODEL: 'llama3.1:8b',  // Better at following JSON format
    // ANALYSIS_MODEL: 'qwen2.5-coder:7b',  // Too code-focused for documentation
    TEMPERATURE: 0.1,  // Very low for consistent JSON output
    MAX_TOKENS: 2048,ti-Project Smart Documentation Generator
 * 
 * Features:
 * - Scans rProjects symlinks to discover all projects
 * - Creates individual technical docs for each project
 * - Generates Docusaurus MDX pages for each project
 * - Avoids infinite loops with smart filtering
 * - Integrates with Qwen2.5-Coder 7B for analysis
 * - Creates unified documentation hub
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

// Configuration
const CONFIG = {
    OLLAMA_HOST: 'http://localhost:11434',
    ANALYSIS_MODEL: 'llama3.1:8b', // 🏆 Benchmark winner for reliable JSON output
    TEMPERATURE: 0.3, // Optimized for llama3.1:8b
    MAX_TOKENS: 2048, // Optimized for llama3.1:8b
    
    // Paths
    ENGINE_PATH: process.cwd(),
    PROJECTS_PATH: path.join(process.cwd(), 'rProjects'),
    DOCUSAURUS_PATH: path.join(process.cwd(), 'technical-docs-pro'),
    DOCS_OUTPUT_PATH: path.join(process.cwd(), 'technical-docs-pro', 'docs'),
    
    // File patterns to analyze
    INCLUDE_PATTERNS: [
        '**/*.js',
        '**/*.ts', 
        '**/*.tsx',
        '**/*.jsx',
        '**/*.py',
        '**/*.sh',
        '**/*.json',
        '**/*.md',
        '**/package.json',
        '**/README.md'
    ],
    
    // Folders to AVOID (prevent cascading loops)
    EXCLUDE_PATTERNS: [
        '**/node_modules/**',
        '**/logs/**',
        '**/rLogs/**',
        '**/backups/**',
        '**/.git/**',
        '**/deprecated/**',
        '**/temp/**',
        '**/test/**',
        '**/tests/**',
        '**/docker/**',
        '**/html/**',
        '**/docs/**',
        '**/technical-docs/**',
        '**/technical-docs-pro/**',
        '**/technical-docs-demo/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/.vscode/**',
        '**/.idea/**'
    ],
    
    // Project detection patterns
    PROJECT_INDICATORS: [
        'package.json',
        'README.md',
        'requirements.txt',
        'Cargo.toml',
        'go.mod',
        'pom.xml'
    ]
};

console.log(`🏗️  Multi-Project Documentation Generator`);
console.log(`🤖 Model: ${CONFIG.ANALYSIS_MODEL}`);
console.log(`📁 Projects: ${CONFIG.PROJECTS_PATH}`);
console.log(`📖 Output: ${CONFIG.DOCUSAURUS_PATH}`);

class MultiProjectDocGenerator {
    constructor() {
        this.projects = new Map();
        this.projectAnalysis = new Map();
        this.isAnalyzing = false;
        
        this.initializeSystem();
    }

    async initializeSystem() {
        try {
            console.log('🚀 Initializing Multi-Project Documentation Generator...');
            
            // Check if Docusaurus site exists
            await this.ensureDocusaurusSetup();
            
            // Discover all projects
            await this.discoverProjects();
            
            // Generate documentation for all projects
            await this.generateAllProjectDocs();
            
            // Start file watchers for all projects
            this.startProjectWatchers();
            
            console.log('✅ Multi-Project Documentation Generator ready!');
            
        } catch (error) {
            console.error(`❌ Initialization failed: ${error.message}`);
        }
    }

    async ensureDocusaurusSetup() {
        try {
            await fs.access(CONFIG.DOCUSAURUS_PATH);
            console.log('✅ Docusaurus site found');
            
            // Update docusaurus config for our needs
            await this.configureDocusaurus();
            
        } catch (error) {
            console.log('⚠️  Docusaurus site not found at expected location');
            console.log('   Run: npx create-docusaurus@latest technical-docs-pro classic --typescript');
            throw new Error('Docusaurus site required');
        }
    }

    async configureDocusaurus() {
        const configPath = path.join(CONFIG.DOCUSAURUS_PATH, 'docusaurus.config.ts');
        
        try {
            let config = await fs.readFile(configPath, 'utf8');
            
            // Add Mermaid plugin if not present
            if (!config.includes('@docusaurus/theme-mermaid')) {
                console.log('🔧 Adding Mermaid support to Docusaurus...');
                
                // This is a basic update - you might need to manually configure
                // the full Docusaurus config for optimal Mermaid integration
            }
            
            console.log('✅ Docusaurus configuration checked');
            
        } catch (error) {
            console.warn(`⚠️  Could not update Docusaurus config: ${error.message}`);
        }
    }

    async discoverProjects() {
        console.log('🔍 Discovering projects in rProjects...');
        
        try {
            const entries = await fs.readdir(CONFIG.PROJECTS_PATH, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isSymbolicLink() || entry.isDirectory()) {
                    const projectPath = path.join(CONFIG.PROJECTS_PATH, entry.name);
                    
                    try {
                        // Check if it's a valid project
                        const isProject = await this.isValidProject(projectPath);
                        
                        if (isProject) {
                            console.log(`📁 Found project: ${entry.name}`);
                            
                            this.projects.set(entry.name, {
                                name: entry.name,
                                path: projectPath,
                                type: entry.isSymbolicLink() ? 'symlink' : 'directory',
                                realPath: entry.isSymbolicLink() ? await fs.realpath(projectPath) : projectPath
                            });
                        }
                        
                    } catch (error) {
                        console.warn(`⚠️  Skipping ${entry.name}: ${error.message}`);
                    }
                }
            }
            
            // Also include rEngine itself as a project
            this.projects.set('rEngine', {
                name: 'rEngine',
                path: CONFIG.ENGINE_PATH,
                type: 'main',
                realPath: CONFIG.ENGINE_PATH
            });
            
            console.log(`✅ Discovered ${this.projects.size} projects`);
            
        } catch (error) {
            console.error(`❌ Failed to discover projects: ${error.message}`);
        }
    }

    async isValidProject(projectPath) {
        try {
            const entries = await fs.readdir(projectPath);
            
            // Check for project indicators
            const hasProjectFile = entries.some(entry => 
                CONFIG.PROJECT_INDICATORS.includes(entry)
            );
            
            // Check for source files
            const hasSourceFiles = entries.some(entry => {
                const ext = path.extname(entry);
                return ['.js', '.ts', '.py', '.sh', '.json'].includes(ext);
            });
            
            return hasProjectFile || hasSourceFiles;
            
        } catch (error) {
            return false;
        }
    }

    async analyzeProjectFile(filePath, projectName) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            
            // Skip very large files
            if (content.length > 100000) {
                console.log(`⚠️  Skipping large file: ${path.basename(filePath)}`);
                return null;
            }
            
            const prompt = `Analyze this code file from project "${projectName}" and extract key information:

File: ${path.basename(filePath)}
Project: ${projectName}
Content (first 4000 chars):
${content.substring(0, 4000)}

Return analysis in this JSON format:
{
  "fileName": "${path.basename(filePath)}",
  "projectName": "${projectName}",
  "fileType": "${path.extname(filePath)}",
  "purpose": "Brief description of what this file does",
  "functions": [
    {
      "name": "functionName",
      "description": "What it does",
      "parameters": ["param1", "param2"],
      "complexity": "low|medium|high"
    }
  ],
  "classes": [
    {
      "name": "ClassName", 
      "description": "What it does",
      "methods": ["method1", "method2"]
    }
  ],
  "dependencies": ["module1", "module2"],
  "keyInsights": ["insight1", "insight2"],
  "mermaidSuggestion": "Suggest a mermaid diagram type and brief description"
}

Focus on the most important elements. Return valid JSON only.`;

            const result = await this.callQwen(prompt);
            
            if (result) {
                try {
                    const analysis = JSON.parse(result);
                    console.log(`✅ Analyzed: ${projectName}/${path.basename(filePath)}`);
                    return analysis;
                } catch (parseError) {
                    console.warn(`⚠️  Failed to parse analysis for ${path.basename(filePath)}`);
                    return null;
                }
            }
            
            return null;
            
        } catch (error) {
            console.warn(`⚠️  Analysis failed for ${filePath}: ${error.message}`);
            return null;
        }
    }

    async callQwen(prompt) {
        try {
            const response = await fetch(`${CONFIG.OLLAMA_HOST}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: CONFIG.ANALYSIS_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    stream: false,
                    options: { 
                        temperature: CONFIG.TEMPERATURE, 
                        num_predict: CONFIG.MAX_TOKENS 
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Qwen API error: ${response.status}`);
            }

            const data = await response.json();
            return data.message?.content || null;
        } catch (error) {
            console.error(`❌ Qwen call failed: ${error.message}`);
            return null;
        }
    }

    async analyzeProject(projectName, projectInfo) {
        console.log(`🔍 Analyzing project: ${projectName}`);
        
        const projectAnalysis = {
            name: projectName,
            path: projectInfo.realPath,
            type: projectInfo.type,
            files: [],
            summary: {
                totalFiles: 0,
                functions: [],
                classes: [],
                dependencies: new Set(),
                keyInsights: []
            }
        };

        try {
            const files = await this.findProjectFiles(projectInfo.realPath);
            console.log(`📁 Found ${files.length} files in ${projectName}`);
            
            // Analyze files in batches
            const batchSize = 2; // Smaller batches for multiple projects
            for (let i = 0; i < Math.min(files.length, 20); i += batchSize) { // Limit to 20 files per project
                const batch = files.slice(i, i + batchSize);
                
                for (const file of batch) {
                    const analysis = await this.analyzeProjectFile(file, projectName);
                    if (analysis) {
                        projectAnalysis.files.push(analysis);
                        
                        // Aggregate data
                        if (analysis.functions) {
                            projectAnalysis.summary.functions.push(...analysis.functions);
                        }
                        if (analysis.classes) {
                            projectAnalysis.summary.classes.push(...analysis.classes);
                        }
                        if (analysis.dependencies) {
                            analysis.dependencies.forEach(dep => 
                                projectAnalysis.summary.dependencies.add(dep)
                            );
                        }
                        if (analysis.keyInsights) {
                            projectAnalysis.summary.keyInsights.push(...analysis.keyInsights);
                        }
                    }
                }
                
                // Small delay between batches
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            projectAnalysis.summary.totalFiles = projectAnalysis.files.length;
            projectAnalysis.summary.dependencies = Array.from(projectAnalysis.summary.dependencies);
            
            this.projectAnalysis.set(projectName, projectAnalysis);
            console.log(`✅ Project analysis complete: ${projectName}`);
            
            return projectAnalysis;
            
        } catch (error) {
            console.error(`❌ Project analysis failed for ${projectName}: ${error.message}`);
            return null;
        }
    }

    async findProjectFiles(projectPath) {
        const files = [];
        
        async function scanDirectory(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    const relativePath = path.relative(projectPath, fullPath);
                    
                    // Skip excluded patterns
                    if (CONFIG.EXCLUDE_PATTERNS.some(pattern => {
                        const cleanPattern = pattern.replace('**/', '').replace('/**', '');
                        return relativePath.includes(cleanPattern);
                    })) {
                        continue;
                    }
                    
                    if (entry.isDirectory()) {
                        await scanDirectory(fullPath);
                    } else if (entry.isFile()) {
                        // Check if file matches include patterns
                        const ext = path.extname(entry.name);
                        if (CONFIG.INCLUDE_PATTERNS.some(pattern => {
                            const cleanPattern = pattern.replace('**/', '').replace('*', '');
                            return entry.name.endsWith(cleanPattern) || ext === cleanPattern;
                        })) {
                            files.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        }
        
        await scanDirectory(projectPath);
        return files;
    }

    async generateProjectMDX(projectAnalysis) {
        const projectName = projectAnalysis.name;
        const mdxContent = `---
sidebar_position: ${Array.from(this.projects.keys()).indexOf(projectName) + 1}
title: ${projectName}
description: Technical documentation for ${projectName}
---

# ${projectName}

## Project Overview

**Path:** \`${projectAnalysis.path}\`  
**Type:** ${projectAnalysis.type}  
**Files Analyzed:** ${projectAnalysis.summary.totalFiles}  
**Functions Found:** ${projectAnalysis.summary.functions.length}  
**Classes Found:** ${projectAnalysis.summary.classes.length}  

## Key Dependencies

${projectAnalysis.summary.dependencies.length > 0 
    ? projectAnalysis.summary.dependencies.map(dep => `- \`${dep}\``).join('\n')
    : '- No dependencies detected'
}

## Functions

${projectAnalysis.summary.functions.length > 0 
    ? projectAnalysis.summary.functions.map(func => `
### ${func.name}

**Description:** ${func.description || 'No description'}  
**Parameters:** ${func.parameters ? func.parameters.join(', ') : 'None'}  
**Complexity:** ${func.complexity || 'Unknown'}  
`).join('\n')
    : 'No functions detected.'
}

## Classes

${projectAnalysis.summary.classes.length > 0 
    ? projectAnalysis.summary.classes.map(cls => `
### ${cls.name}

**Description:** ${cls.description || 'No description'}  
**Methods:** ${cls.methods ? cls.methods.join(', ') : 'None'}  
`).join('\n')
    : 'No classes detected.'
}

## Key Insights

${projectAnalysis.summary.keyInsights.length > 0 
    ? projectAnalysis.summary.keyInsights.map(insight => `- ${insight}`).join('\n')
    : '- No specific insights generated'
}

## File Details

${projectAnalysis.files.map(file => `
### ${file.fileName}

**Purpose:** ${file.purpose || 'No purpose specified'}  
**Type:** ${file.fileType}  

${file.mermaidSuggestion ? `**Suggested Diagram:** ${file.mermaidSuggestion}` : ''}
`).join('\n')}

---
*Generated by Multi-Project Documentation Generator • ${new Date().toLocaleString()}*
`;

        return mdxContent;
    }

    async generateAllProjectDocs() {
        console.log('📝 Generating documentation for all projects...');
        
        // Create docs directory structure
        await fs.mkdir(CONFIG.DOCS_OUTPUT_PATH, { recursive: true });
        
        // Generate overview page
        await this.generateOverviewPage();
        
        // Analyze and generate docs for each project
        for (const [projectName, projectInfo] of this.projects) {
            console.log(`\n🚀 Processing: ${projectName}`);
            
            const analysis = await this.analyzeProject(projectName, projectInfo);
            
            if (analysis) {
                const mdxContent = await this.generateProjectMDX(analysis);
                const outputPath = path.join(CONFIG.DOCS_OUTPUT_PATH, `${projectName}.mdx`);
                
                await fs.writeFile(outputPath, mdxContent, 'utf8');
                console.log(`✅ Generated: ${outputPath}`);
            }
        }
        
        console.log('\n🎉 All project documentation generated!');
        console.log(`📖 View at: http://localhost:3000 (run: cd technical-docs-pro && npm start)`);
    }

    async generateOverviewPage() {
        const overviewContent = `---
sidebar_position: 1
title: Overview
description: Multi-project technical documentation overview
---

# Multi-Project Documentation Hub

Welcome to the comprehensive technical documentation for all projects in the rEngine ecosystem.

## Projects Overview

| Project | Type | Files | Functions | Classes |
|---------|------|-------|-----------|---------|
${Array.from(this.projects.entries()).map(([name, info]) => {
    const analysis = this.projectAnalysis.get(name);
    return `| [${name}](./${name}) | ${info.type} | ${analysis?.summary.totalFiles || 'Analyzing...'} | ${analysis?.summary.functions.length || '-'} | ${analysis?.summary.classes.length || '-'} |`;
}).join('\n')}

## System Architecture

This documentation is automatically generated using:

- **Qwen2.5-Coder 7B** for intelligent code analysis
- **Docusaurus** for beautiful, searchable documentation
- **Real-time monitoring** for automatic updates
- **Multi-project scanning** with smart loop prevention

## Features

- 🔍 **Smart Analysis**: AI-powered code understanding
- 📊 **Function Mapping**: Complete function and class inventory
- 🔗 **Dependency Tracking**: Module and import analysis
- 🚀 **Real-time Updates**: Documentation stays current
- 🎯 **Project-specific Pages**: Individual project documentation
- 🔍 **Full-text Search**: Find anything instantly

---
*Last updated: ${new Date().toLocaleString()}*
`;

        const overviewPath = path.join(CONFIG.DOCS_OUTPUT_PATH, 'index.mdx');
        await fs.writeFile(overviewPath, overviewContent, 'utf8');
        console.log('✅ Overview page generated');
    }

    startProjectWatchers() {
        console.log('👀 Starting project file watchers...');
        
        for (const [projectName, projectInfo] of this.projects) {
            const watcher = chokidar.watch(CONFIG.INCLUDE_PATTERNS, {
                cwd: projectInfo.realPath,
                ignored: CONFIG.EXCLUDE_PATTERNS,
                persistent: true,
                ignoreInitial: true
            });

            watcher.on('change', async (filePath) => {
                console.log(`📝 File changed in ${projectName}: ${filePath}`);
                // Re-analyze the project and regenerate docs
                await this.regenerateProjectDocs(projectName);
            });

            watcher.on('add', async (filePath) => {
                console.log(`➕ New file in ${projectName}: ${filePath}`);
                await this.regenerateProjectDocs(projectName);
            });
        }
        
        console.log(`✅ Watching ${this.projects.size} projects for changes`);
    }

    async regenerateProjectDocs(projectName) {
        console.log(`🔄 Regenerating docs for: ${projectName}`);
        
        const projectInfo = this.projects.get(projectName);
        if (projectInfo) {
            const analysis = await this.analyzeProject(projectName, projectInfo);
            
            if (analysis) {
                const mdxContent = await this.generateProjectMDX(analysis);
                const outputPath = path.join(CONFIG.DOCS_OUTPUT_PATH, `${projectName}.mdx`);
                
                await fs.writeFile(outputPath, mdxContent, 'utf8');
                
                // Update overview page
                await this.generateOverviewPage();
                
                console.log(`✅ Updated: ${projectName} documentation`);
            }
        }
    }
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚀 Launching Multi-Project Documentation Generator...');
    new MultiProjectDocGenerator();
}

export default MultiProjectDocGenerator;
