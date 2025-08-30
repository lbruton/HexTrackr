#!/usr/bin/env node

/**
 * rEngine Documentation Publication System
 * Distributes generated HTML documentation to individual project directories
 * 
 * Usage:
 *   node rEngine/publish-docs.js                    # Publish to all projects
 *   node rEngine/publish-docs.js --project=StackTrackr  # Publish to specific project
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DocumentPublisher {
    constructor() {
        this.rootDir = path.resolve(__dirname, '..');
        this.sourceDir = path.join(this.rootDir, 'html-docs');
        this.projectsDir = path.join(this.rootDir, 'rProjects');
        this.logFile = path.join(this.rootDir, 'rEngine', 'logs', 'doc-publication.log');
        
        // Core documentation files that should always be published
        this.coreFiles = [
            'developmentstatus.html',
            'documentation.html', 
            'MASTER_ROADMAP.html',
            'documents.json'
        ];
        
        // System documentation files (selective publication)
        this.systemFiles = [
            'agent-self-management.html',
            'document-generator.html',
            'memory-intelligence.html',
            'enhanced-document-generator.html'
        ];
    }

    async initialize() {
        // Ensure logs directory exists
        await fs.ensureDir(path.dirname(this.logFile));
        
        console.log('🚀 rEngine Documentation Publisher');
        console.log('=====================================');
        console.log(`📂 Source: ${this.sourceDir}`);
        console.log(`🎯 Projects: ${this.projectsDir}`);
        console.log('');
    }

    async log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        await fs.appendFile(this.logFile, logEntry);
        console.log(message);
    }

    async discoverProjects() {
        try {
            const entries = await fs.readdir(this.projectsDir, { withFileTypes: true });
            const projects = entries
                .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
                .map(entry => entry.name);
            
            await this.log(`🔍 Discovered ${projects.length} projects: ${projects.join(', ')}`);
            return projects;
        } catch (error) {
            await this.log(`❌ Error discovering projects: ${error.message}`);
            return [];
        }
    }

    async ensureProjectDocsStructure(projectName) {
        const projectDir = path.join(this.projectsDir, projectName);
        const docsDir = path.join(projectDir, 'docs');
        const htmlDir = path.join(docsDir, 'html');
        
        try {
            await fs.ensureDir(htmlDir);
            await this.log(`✅ Ensured docs structure for ${projectName}`);
            return htmlDir;
        } catch (error) {
            await this.log(`❌ Failed to create docs structure for ${projectName}: ${error.message}`);
            return null;
        }
    }

    async adaptContentForProject(content, projectName) {
        // Update relative paths to work from project context
        let adaptedContent = content;
        
        // Fix navigation links to point back to main platform
        adaptedContent = adaptedContent.replace(
            /href="([^"]*\.html)"/g,
            (match, filename) => {
                // If it's a local HTML file, keep it local
                if (!filename.startsWith('../') && !filename.startsWith('http')) {
                    return match;
                }
                return match;
            }
        );
        
        // Add project-specific header if it's the main documentation page
        if (content.includes('rEngine Platform Documentation')) {
            adaptedContent = adaptedContent.replace(
                '<h1>📚 rEngine Platform Documentation</h1>',
                `<h1>📚 rEngine Platform Documentation</h1>
                <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; margin-top: 15px;">
                    <strong>Project Context:</strong> ${projectName}
                </div>`
            );
        }
        
        return adaptedContent;
    }

    async publishFileToProject(filename, projectName, targetDir) {
        const sourcePath = path.join(this.sourceDir, filename);
        const targetPath = path.join(targetDir, filename);
        
        try {
            // Check if source file exists
            if (!(await fs.pathExists(sourcePath))) {
                await this.log(`⚠️  Source file not found: ${filename}`);
                return false;
            }
            
            // Read and adapt content
            const content = await fs.readFile(sourcePath, 'utf8');
            const adaptedContent = await this.adaptContentForProject(content, projectName);
            
            // Write to target
            await fs.writeFile(targetPath, adaptedContent, 'utf8');
            await this.log(`📄 Published ${filename} to ${projectName}`);
            return true;
        } catch (error) {
            await this.log(`❌ Failed to publish ${filename} to ${projectName}: ${error.message}`);
            return false;
        }
    }

    async publishToProject(projectName) {
        await this.log(`\n📦 Publishing documentation to ${projectName}...`);
        
        // Ensure project docs structure
        const targetDir = await this.ensureProjectDocsStructure(projectName);
        if (!targetDir) {
            return false;
        }
        
        let successCount = 0;
        let totalFiles = 0;
        
        // Publish core files (always)
        for (const filename of this.coreFiles) {
            totalFiles++;
            const success = await this.publishFileToProject(filename, projectName, targetDir);
            if (success) successCount++;
        }
        
        // Publish system files (all for now, can be filtered later)
        for (const filename of this.systemFiles) {
            totalFiles++;
            const success = await this.publishFileToProject(filename, projectName, targetDir);
            if (success) successCount++;
        }
        
        await this.log(`✅ Published ${successCount}/${totalFiles} files to ${projectName}`);
        return successCount === totalFiles;
    }

    async generateProjectIndex(projectName, targetDir) {
        // Create a project-specific documents.json
        const sourceIndexPath = path.join(this.sourceDir, 'documents.json');
        const targetIndexPath = path.join(targetDir, 'documents.json');
        
        try {
            const sourceIndex = await fs.readJson(sourceIndexPath);
            
            // Create project-specific index
            const projectIndex = {
                ...sourceIndex,
                last_updated: new Date().toISOString(),
                project_context: projectName,
                metadata: {
                    ...sourceIndex.metadata,
                    project_name: projectName,
                    publication_source: "rEngine Documentation Publisher",
                    maintenance_notes: `Published from main platform documentation for ${projectName} project`
                }
            };
            
            await fs.writeJson(targetIndexPath, projectIndex, { spaces: 2 });
            await this.log(`📋 Generated project index for ${projectName}`);
            return true;
        } catch (error) {
            await this.log(`❌ Failed to generate project index for ${projectName}: ${error.message}`);
            return false;
        }
    }

    async publishAll() {
        const projects = await this.discoverProjects();
        if (projects.length === 0) {
            await this.log('⚠️  No projects found to publish to');
            return;
        }
        
        let successfulPublications = 0;
        
        for (const project of projects) {
            const success = await this.publishToProject(project);
            if (success) {
                const targetDir = path.join(this.projectsDir, project, 'docs', 'html');
                await this.generateProjectIndex(project, targetDir);
                successfulPublications++;
            }
        }
        
        await this.log(`\n🎉 Publication complete: ${successfulPublications}/${projects.length} projects successful`);
        
        if (successfulPublications < projects.length) {
            process.exit(1);
        }
    }

    async publishToSpecificProject(projectName) {
        await this.log(`🎯 Publishing to specific project: ${projectName}`);
        
        const projects = await this.discoverProjects();
        if (!projects.includes(projectName)) {
            await this.log(`❌ Project '${projectName}' not found in rProjects/`);
            process.exit(1);
        }
        
        const success = await this.publishToProject(projectName);
        if (success) {
            const targetDir = path.join(this.projectsDir, projectName, 'docs', 'html');
            await this.generateProjectIndex(projectName, targetDir);
            await this.log(`✅ Successfully published to ${projectName}`);
        } else {
            await this.log(`❌ Failed to publish to ${projectName}`);
            process.exit(1);
        }
    }
}

// Main execution
async function main() {
    const publisher = new DocumentPublisher();
    await publisher.initialize();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const projectArg = args.find(arg => arg.startsWith('--project='));
    
    if (projectArg) {
        const projectName = projectArg.split('=')[1];
        await publisher.publishToSpecificProject(projectName);
    } else {
        await publisher.publishAll();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('💥 Publication failed:', error);
        process.exit(1);
    });
}

export default DocumentPublisher;
