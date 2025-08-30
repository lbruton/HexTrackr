#!/usr/bin/env node

/**
 * Overnight Batch Document Generator
 * Ultra-conservative processing for large files
 * Designed to run unattended with excellent error handling
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OvernightBatchProcessor {
    constructor() {
        this.logFile = path.join(__dirname, 'logs', `batch-processing-${new Date().toISOString().slice(0, 10)}.log`);
        fs.ensureDirSync(path.dirname(this.logFile));
        this.startTime = new Date();
        
        this.log('🌙 Starting overnight batch processing...');
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${message}`;
        console.log(logLine);
        fs.appendFileSync(this.logFile, logLine + '\n');
    }

    async processFile(filePath) {
        this.log(`📄 Processing: ${filePath}`);
        
        try {
            // Dynamic import of the document generator
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);
            
            // Use new unified document-scribe system
            const command = `node ${path.join(__dirname, 'document-scribe.js')} --document-sweep --file "${filePath}"`;
            // DEPRECATED: const command = `node ${path.join(__dirname, 'smart-document-generator.js')} "${filePath}"`;
            this.log(`🚀 Executing: ${command}`);
            
            const { stdout, stderr } = await execAsync(command, {
                timeout: 30 * 60 * 1000, // 30 minute timeout per file
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            
            if (stdout) this.log(`✅ Output: ${stdout.trim()}`);
            if (stderr) this.log(`⚠️  Stderr: ${stderr.trim()}`);
            
            return { success: true, file: filePath };
            
        } catch (error) {
            this.log(`❌ Error processing ${filePath}: ${error.message}`);
            return { success: false, file: filePath, error: error.message };
        }
    }

    async processBatch(filePatterns) {
        const results = {
            total: 0,
            successful: 0,
            failed: 0,
            files: []
        };

        for (const pattern of filePatterns) {
            this.log(`🔍 Finding files matching: ${pattern}`);
            
            try {
                // Simple file finding using fs instead of globby
                const files = this.findFiles(pattern);
                
                this.log(`📋 Found ${files.length} files for pattern: ${pattern}`);
                
                for (const file of files) {
                    results.total++;
                    const result = await this.processFile(file);
                    results.files.push(result);
                    
                    if (result.success) {
                        results.successful++;
                        this.log(`✅ Successfully processed: ${file}`);
                    } else {
                        results.failed++;
                        this.log(`❌ Failed to process: ${file}`);
                    }
                    
                    // Conservative delay between files
                    this.log('⏱️  Waiting 10 seconds before next file...');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
                
            } catch (error) {
                this.log(`❌ Error with pattern ${pattern}: ${error.message}`);
            }
        }

        return results;
    }

    findFiles(pattern) {
        // Simple file finder for common patterns
        const files = [];
        const basePath = path.join(__dirname, '..');
        
        if (pattern.includes('*.css')) {
            const cssDir = pattern.replace('*.css', '').replace(/\/$/, '');
            const fullCssDir = path.join(basePath, cssDir);
            if (fs.existsSync(fullCssDir)) {
                const cssFiles = fs.readdirSync(fullCssDir)
                    .filter(file => file.endsWith('.css'))
                    .map(file => path.join(fullCssDir, file));
                files.push(...cssFiles);
            }
        }
        
        if (pattern.includes('*.js')) {
            const jsDir = pattern.replace('*.js', '').replace(/\/$/, '');
            const fullJsDir = path.join(basePath, jsDir);
            if (fs.existsSync(fullJsDir)) {
                const jsFiles = fs.readdirSync(fullJsDir)
                    .filter(file => file.endsWith('.js'))
                    .map(file => path.join(fullJsDir, file));
                files.push(...jsFiles);
            }
        }
        
        return files;
    }

    generateReport(results) {
        const endTime = new Date();
        const duration = Math.round((endTime - this.startTime) / 1000 / 60); // minutes
        
        const report = `
🌙 OVERNIGHT BATCH PROCESSING REPORT
===================================

📊 SUMMARY:
- Total files: ${results.total}
- Successful: ${results.successful}
- Failed: ${results.failed}
- Success rate: ${results.total > 0 ? Math.round((results.successful / results.total) * 100) : 0}%
- Duration: ${duration} minutes

📋 DETAILED RESULTS:
${results.files.map(f => `${f.success ? '✅' : '❌'} ${f.file}${f.error ? ` (${f.error})` : ''}`).join('\n')}

⏰ Started: ${this.startTime.toISOString()}
⏰ Ended: ${endTime.toISOString()}
        `;

        this.log(report);
        
        // Save detailed report
        const reportFile = path.join(__dirname, 'logs', `batch-report-${new Date().toISOString().slice(0, 10)}.md`);
        fs.writeFileSync(reportFile, report);
        this.log(`📋 Detailed report saved: ${reportFile}`);
        
        return report;
    }
}

// Main execution
async function main() {
    const processor = new OvernightBatchProcessor();
    
    // Default file patterns for StackTrackr
    const patterns = [
        'rProjects/StackTrackr/css/*.css',
        'rProjects/StackTrackr/js/*.js',
        'js/*.js',
        'scripts/*.js'
    ];
    
    // Allow custom patterns from command line
    const customPatterns = process.argv.slice(2);
    const finalPatterns = customPatterns.length > 0 ? customPatterns : patterns;
    
    processor.log(`🎯 Target patterns: ${finalPatterns.join(', ')}`);
    
    try {
        const results = await processor.processBatch(finalPatterns);
        const report = processor.generateReport(results);
        
        processor.log('🎉 Batch processing complete!');
        
        // Exit with appropriate code
        process.exit(results.failed === 0 ? 0 : 1);
        
    } catch (error) {
        processor.log(`💥 Fatal error: ${error.message}`);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
