#!/usr/bin/env node

/**
 * Document Sweep - Batch Documentation Generator using Gemini API
 * 
 * This script performs a "document sweep" by automatically generating
 * documentation for all JavaScript files in specified directories using
 * the Gemini-powered document-generator.js
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DocumentSweep {
    constructor() {
        this.baseDir = '/Volumes/DATA/GitHub/rEngine';
        this.documentGenerator = path.join(__dirname, 'document-generator.js');
        this.targetDirectories = [
            'rEngine',
            'js', 
            'memory-scribe',
            'rMemory/memory-scribe',
            'scripts',
            'rAgents',
            'rMemory',
            'rScribe',
            '.' // Root directory files
        ];
        this.excludePatterns = [
            'node_modules',
            '.git',
            'test_bundle',
            'backups',
            'archive',
            'docs/generated', // Don't document the generated docs
            'logs',
            '.vscode',
            '.DS_Store',
            'agents/' // Exclude symlink to avoid duplicates
        ];
        this.results = {
            processed: 0,
            succeeded: 0,
            failed: 0,
            skipped: 0,
            errors: [],
            changes: [],
            diffs: []
        };
        this.diffsDir = path.join(this.baseDir, 'logs', 'documentation-diffs');
        this.changeLogPath = path.join(this.baseDir, 'logs', 'documentation-changes.log');
    }

    async findJavaScriptFiles() {
        const files = [];
        
        for (const dir of this.targetDirectories) {
            const fullPath = path.join(this.baseDir, dir);
            if (await fs.pathExists(fullPath)) {
                console.log(`🔍 Scanning directory: ${dir}`);
                const dirFiles = await this.scanDirectory(fullPath);
                files.push(...dirFiles);
            } else {
                console.log(`⚠️  Directory not found: ${dir}`);
            }
        }
        
        return files;
    }

    async scanDirectory(dirPath) {
        const files = [];
        
        try {
            const items = await fs.readdir(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = await fs.stat(fullPath);
                
                if (stat.isDirectory()) {
                    // Skip excluded directories
                    if (this.excludePatterns.some(pattern => item.includes(pattern))) {
                        continue;
                    }
                    
                    // Recursively scan subdirectories
                    const subFiles = await this.scanDirectory(fullPath);
                    files.push(...subFiles);
                } else if (stat.isFile() && item.endsWith('.js')) {
                    // Skip excluded files
                    if (this.excludePatterns.some(pattern => fullPath.includes(pattern))) {
                        continue;
                    }
                    
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`❌ Error scanning ${dirPath}:`, error.message);
        }
        
        return files;
    }

    async generateDocumentation(filePath) {
        try {
            console.log(`📄 Generating docs for: ${path.relative(this.baseDir, filePath)}`);
            
            // Check if documentation already exists
            const relativePath = path.relative(path.join(this.baseDir, 'rEngine'), filePath);
            const expectedDocPath = path.join(this.baseDir, 'docs', 'generated', relativePath).replace(/\.js$/, '.md');
            
            let existingContent = null;
            let isUpdate = false;
            
            if (await fs.pathExists(expectedDocPath)) {
                existingContent = await fs.readFile(expectedDocPath, 'utf8');
                isUpdate = true;
                console.log(`🔄 Updating existing documentation: ${path.basename(expectedDocPath)}`);
            }
            
            const result = execSync(
                `node "${this.documentGenerator}" "${filePath}"`,
                { 
                    encoding: 'utf8',
                    cwd: path.dirname(this.documentGenerator),
                    timeout: 30000 // 30 second timeout per file
                }
            );
            
            // If this was an update, generate and save diff
            if (isUpdate && existingContent) {
                await this.generateAndSaveDiff(filePath, expectedDocPath, existingContent);
            }
            
            this.results.succeeded++;
            console.log(`✅ Success: ${path.basename(filePath)}`);
            return { success: true, output: result, wasUpdate: isUpdate };
            
        } catch (error) {
            this.results.failed++;
            const errorMsg = `Failed to generate docs for ${filePath}: ${error.message}`;
            this.results.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
            return { success: false, error: error.message };
        }
    }

    async generateAndSaveDiff(sourceFilePath, docPath, previousContent) {
        try {
            // Read the new content
            const newContent = await fs.readFile(docPath, 'utf8');
            
            // Skip if content is identical
            if (previousContent === newContent) {
                console.log(`📝 No changes in documentation for ${path.basename(sourceFilePath)}`);
                return;
            }
            
            // Create diffs directory if it doesn't exist
            await fs.ensureDir(this.diffsDir);
            
            // Generate git-format diff
            const diff = this.generateGitDiff(docPath, previousContent, newContent);
            
            // Save diff to file
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const diffFileName = `${path.basename(sourceFilePath, '.js')}_${timestamp}.diff`;
            const diffPath = path.join(this.diffsDir, diffFileName);
            
            await fs.writeFile(diffPath, diff);
            
            // Log the change
            const changeEntry = {
                timestamp: new Date().toISOString(),
                sourceFile: path.relative(this.baseDir, sourceFilePath),
                docFile: path.relative(this.baseDir, docPath),
                diffFile: path.relative(this.baseDir, diffPath),
                changeHash: crypto.createHash('md5').update(newContent).digest('hex').substring(0, 8)
            };
            
            this.results.changes.push(changeEntry);
            this.results.diffs.push(diffPath);
            
            // Append to change log
            const logEntry = `${changeEntry.timestamp} | ${changeEntry.sourceFile} | UPDATED | ${changeEntry.changeHash} | ${changeEntry.diffFile}\n`;
            await fs.appendFile(this.changeLogPath, logEntry);
            
            console.log(`📊 Diff saved: ${diffFileName}`);
            
        } catch (error) {
            console.error(`❌ Failed to generate diff for ${sourceFilePath}:`, error.message);
        }
    }

    generateGitDiff(filePath, oldContent, newContent) {
        const fileName = path.basename(filePath);
        const timestamp = new Date().toISOString();
        
        // Split content into lines
        const oldLines = oldContent.split('\n');
        const newLines = newContent.split('\n');
        
        // Generate unified diff header
        let diff = `diff --git a/${fileName} b/${fileName}\n`;
        diff += `index ${crypto.createHash('sha1').update(oldContent).digest('hex').substring(0, 7)}..${crypto.createHash('sha1').update(newContent).digest('hex').substring(0, 7)} 100644\n`;
        diff += `--- a/${fileName}\n`;
        diff += `+++ b/${fileName}\n`;
        diff += `@@ Generated by Gemini 1.5 Pro at ${timestamp} @@\n`;
        
        // Simple line-by-line diff (could be enhanced with more sophisticated diff algorithm)
        const maxLines = Math.max(oldLines.length, newLines.length);
        let contextLines = 0;
        let hunkStartOld = -1;
        let hunkStartNew = -1;
        let hunkLines = [];
        
        for (let i = 0; i < maxLines; i++) {
            const oldLine = oldLines[i] || '';
            const newLine = newLines[i] || '';
            
            if (oldLine === newLine) {
                // Lines are identical
                if (hunkLines.length > 0) {
                    hunkLines.push(` ${oldLine}`);
                    contextLines++;
                    
                    // If we have enough context, close the hunk
                    if (contextLines >= 3) {
                        diff += this.formatHunk(hunkStartOld, hunkStartNew, hunkLines);
                        hunkLines = [];
                        contextLines = 0;
                        hunkStartOld = -1;
                        hunkStartNew = -1;
                    }
                }
            } else {
                // Lines differ
                if (hunkStartOld === -1) {
                    hunkStartOld = Math.max(0, i - 3);
                    hunkStartNew = Math.max(0, i - 3);
                    
                    // Add context lines before the change
                    for (let j = Math.max(0, i - 3); j < i; j++) {
                        if (oldLines[j] !== undefined) {
                            hunkLines.push(` ${oldLines[j]}`);
                        }
                    }
                }
                
                contextLines = 0;
                
                // Add the changed lines
                if (i < oldLines.length && oldLines[i] !== '') {
                    hunkLines.push(`-${oldLines[i]}`);
                }
                if (i < newLines.length && newLines[i] !== '') {
                    hunkLines.push(`+${newLines[i]}`);
                }
            }
        }
        
        // Close any remaining hunk
        if (hunkLines.length > 0) {
            diff += this.formatHunk(hunkStartOld, hunkStartNew, hunkLines);
        }
        
        return diff;
    }

    formatHunk(startOld, startNew, lines) {
        const oldCount = lines.filter(line => line.startsWith('-') || line.startsWith(' ')).length;
        const newCount = lines.filter(line => line.startsWith('+') || line.startsWith(' ')).length;
        
        let hunk = `@@ -${startOld + 1},${oldCount} +${startNew + 1},${newCount} @@\n`;
        hunk += lines.join('\n') + '\n';
        return hunk;
    }

    async performSweep() {
        console.log('🚀 STARTING DOCUMENT SWEEP WITH GEMINI API');
        console.log('═══════════════════════════════════════════\n');
        
        // Find all JavaScript files
        const files = await this.findJavaScriptFiles();
        console.log(`\n📊 Found ${files.length} JavaScript files to process\n`);
        
        if (files.length === 0) {
            console.log('❌ No JavaScript files found to process');
            return;
        }
        
        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            this.results.processed++;
            
            console.log(`\n[${i + 1}/${files.length}] Processing: ${path.relative(this.baseDir, file)}`);
            
            await this.generateDocumentation(file);
            
            // Small delay to be respectful to Gemini API
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        this.printSummary();
    }

    printSummary() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
        const successRate = ((this.results.succeeded / this.results.processed) * 100).toFixed(1);
        
        console.log('\n🎉 DOCUMENT SWEEP COMPLETE');
        console.log('═══════════════════════════');
        console.log(`📊 Total files processed: ${this.results.processed}`);
        console.log(`✅ Successfully generated: ${this.results.succeeded}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Success rate: ${successRate}%`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`🔄 Documentation updates: ${this.results.changes.length}`);
        console.log(`📊 Diffs generated: ${this.results.diffs.length}`);
        
        if (this.results.changes.length > 0) {
            console.log('\n🔄 CHANGES DETECTED:');
            this.results.changes.forEach(change => {
                console.log(`   • ${change.sourceFile} → ${change.docFile} (${change.changeHash})`);
            });
            console.log(`\n📝 Change log: ${path.relative(this.baseDir, this.changeLogPath)}`);
            console.log(`📊 Diffs saved to: ${path.relative(this.baseDir, this.diffsDir)}`);
        }
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.results.errors.forEach(error => console.log(`   • ${error}`));
        }
        
        console.log(`\n📁 Documentation saved to: docs/generated/`);
        console.log('🧠 Powered by: Gemini 1.5 Pro API');
        
        // Save detailed results to JSON for future reference
        const detailedResults = {
            timestamp: new Date().toISOString(),
            summary: {
                processed: this.results.processed,
                succeeded: this.results.succeeded,
                failed: this.results.failed,
                successRate: parseFloat(successRate),
                duration: parseFloat(duration),
                updatesDetected: this.results.changes.length,
                diffsGenerated: this.results.diffs.length
            },
            changes: this.results.changes,
            diffs: this.results.diffs,
            errors: this.results.errors
        };
        
        // Write results to logs directory
        const resultsPath = path.join(this.baseDir, 'logs', 'document-sweep-results.json');
        require('fs-extra').writeFileSync(resultsPath, JSON.stringify(detailedResults, null, 2));
        console.log(`📋 Detailed results saved to: ${path.relative(this.baseDir, resultsPath)}`);
    }

    async dryRun() {
        console.log('🧪 DRY RUN - Document Sweep Preview');
        console.log('═══════════════════════════════════\n');
        
        const files = await this.findJavaScriptFiles();
        
        console.log(`📊 Would process ${files.length} files:`);
        files.forEach((file, i) => {
            console.log(`   ${i + 1}. ${path.relative(this.baseDir, file)}`);
        });
        
        console.log(`\n💡 Run without --dry-run to actually generate documentation`);
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const sweep = new DocumentSweep();
    const isDryRun = process.argv.includes('--dry-run');
    
    if (isDryRun) {
        sweep.dryRun();
    } else {
        sweep.performSweep().catch(error => {
            console.error('❌ Document sweep failed:', error);
            process.exit(1);
        });
    }
}

export default DocumentSweep;
