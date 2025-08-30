#!/usr/bin/env node

/**
 * Mobile Development Checkin System
 * Merges mobile development changes back into main environment
 * 
 * Features:
 * - Extracts changes from mobile checkout zip
 * - Compares with current state
 * - Merges non-conflicting changes
 * - Reports conflicts for manual resolution
 * - Updates git status and memory system
 * 
 * Usage: node mobile-checkin.js <checkout-id> [zip-path]
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import unzipper from 'unzipper';

const execPromise = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

class MobileCheckin {
    constructor(checkoutId, zipPath) {
        this.baseDir = '/Volumes/DATA/GitHub/rEngine';
        this.checkoutId = checkoutId;
        this.zipPath = zipPath || path.join(this.baseDir, `${checkoutId}.zip`);
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.checkinId = `mobile-checkin-${this.timestamp}`;
        this.conflicts = [];
        this.merged = [];
        this.updated = [];
    }

    async start() {
        console.log(`🔄 Starting mobile development checkin: ${this.checkoutId}`);
        
        try {
            // Step 1: Validate checkout package
            await this.validateCheckout();
            
            // Step 2: Extract mobile changes
            const tempDir = await this.extractChanges();
            
            // Step 3: Analyze differences
            await this.analyzeDifferences(tempDir);
            
            // Step 4: Merge non-conflicting changes
            await this.mergeChanges(tempDir);
            
            // Step 5: Report conflicts
            await this.reportConflicts();
            
            // Step 6: Update memory system
            await this.updateMemorySystem();
            
            // Step 7: Generate checkin report
            await this.generateCheckinReport();
            
            // Cleanup
            await fs.remove(tempDir);
            
            console.log(`✅ Mobile checkin complete: ${this.checkinId}`);
            
        } catch (error) {
            console.error('❌ Checkin failed:', error.message);
            process.exit(1);
        }
    }

    async validateCheckout() {
        console.log('🔍 Validating checkout package...');
        
        // Check if zip exists
        if (!await fs.pathExists(this.zipPath)) {
            throw new Error(`Checkout zip not found: ${this.zipPath}`);
        }
        
        // Check if manifest exists
        const manifestPath = path.join(this.baseDir, `${this.checkoutId}-manifest.json`);
        if (!await fs.pathExists(manifestPath)) {
            console.log('   ⚠️  Original manifest not found, continuing without validation');
            return;
        }
        
        const manifest = await fs.readJson(manifestPath);
        console.log(`   ✅ Checkout ID: ${manifest.checkout_info.id}`);
        console.log(`   ✅ Created: ${manifest.checkout_info.timestamp}`);
        console.log(`   ✅ Files: ${manifest.ignored_files.length} ignored files`);
        console.log(`   ✅ APIs: ${manifest.api_keys_found.length} API keys`);
    }

    async extractChanges() {
        console.log('📦 Extracting mobile changes...');
        
        const tempDir = path.join(this.baseDir, `.mobile-checkin-${this.timestamp}`);
        await fs.ensureDir(tempDir);
        
        try {
            await new Promise((resolve, reject) => {
                fs.createReadStream(this.zipPath)
                    .pipe(unzipper.Extract({ path: tempDir }))
                    .on('close', resolve)
                    .on('error', reject);
            });
            
            console.log(`   ✅ Extracted to: ${tempDir}`);
            return tempDir;
            
        } catch (error) {
            await fs.remove(tempDir);
            throw new Error(`Failed to extract zip: ${error.message}`);
        }
    }

    async analyzeDifferences(tempDir) {
        console.log('🔍 Analyzing differences...');
        
        // Check for modified files in ignored-files directory
        const ignoredFilesDir = path.join(tempDir, 'ignored-files');
        if (await fs.pathExists(ignoredFilesDir)) {
            const files = await this.getFilesRecursively(ignoredFilesDir);
            
            for (const file of files) {
                const relativePath = path.relative(ignoredFilesDir, file);
                const currentPath = path.join(this.baseDir, relativePath);
                
                if (await fs.pathExists(currentPath)) {
                    const currentContent = await fs.readFile(currentPath, 'utf8');
                    const mobileContent = await fs.readFile(file, 'utf8');
                    
                    if (currentContent !== mobileContent) {
                        console.log(`   📝 Modified: ${relativePath}`);
                        this.updated.push({
                            path: relativePath,
                            current: currentPath,
                            mobile: file,
                            type: 'modified'
                        });
                    }
                } else {
                    console.log(`   ➕ New: ${relativePath}`);
                    this.updated.push({
                        path: relativePath,
                        current: currentPath,
                        mobile: file,
                        type: 'new'
                    });
                }
            }
        }
        
        // Check for new configurations
        const configsDir = path.join(tempDir, 'mobile-configs');
        if (await fs.pathExists(configsDir)) {
            const configs = await fs.readdir(configsDir);
            console.log(`   ⚙️  Found ${configs.length} configuration files`);
            
            for (const config of configs) {
                if (config.endsWith('.json')) {
                    const configPath = path.join(configsDir, config);
                    const configData = await fs.readJson(configPath);
                    
                    if (config === 'mobile-config.json') {
                        console.log(`   📱 Mobile config: ${Object.keys(configData.fallback_apis).length} API configurations`);
                    }
                }
            }
        }
        
        console.log(`   ✅ Analysis complete: ${this.updated.length} changes detected`);
    }

    async mergeChanges(tempDir) {
        console.log('🔄 Merging changes...');
        
        for (const change of this.updated) {
            try {
                if (change.type === 'new' || change.type === 'modified') {
                    // For sensitive files, be extra careful
                    if (this.isSensitiveFile(change.path)) {
                        console.log(`   🔐 Sensitive file detected: ${change.path}`);
                        
                        // Create backup before merging
                        if (await fs.pathExists(change.current)) {
                            const backupPath = `${change.current}.backup-${this.timestamp}`;
                            await fs.copy(change.current, backupPath);
                            console.log(`   💾 Backup created: ${path.basename(backupPath)}`);
                        }
                    }
                    
                    // Ensure directory exists
                    await fs.ensureDir(path.dirname(change.current));
                    
                    // Copy the file
                    await fs.copy(change.mobile, change.current);
                    this.merged.push(change);
                    
                    console.log(`   ✅ ${change.type === 'new' ? 'Added' : 'Updated'}: ${change.path}`);
                }
                
            } catch (error) {
                console.log(`   ❌ Failed to merge ${change.path}: ${error.message}`);
                this.conflicts.push({
                    ...change,
                    error: error.message
                });
            }
        }
        
        console.log(`   ✅ Merged: ${this.merged.length} files`);
        if (this.conflicts.length > 0) {
            console.log(`   ⚠️  Conflicts: ${this.conflicts.length} files need manual resolution`);
        }
    }

    async reportConflicts() {
        if (this.conflicts.length === 0) {
            console.log('✅ No conflicts detected!');
            return;
        }
        
        console.log('⚠️  Conflict Report:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        for (const conflict of this.conflicts) {
            console.log(`📄 File: ${conflict.path}`);
            console.log(`   Error: ${conflict.error}`);
            console.log(`   Mobile version: ${conflict.mobile}`);
            console.log(`   Current version: ${conflict.current}`);
            console.log('');
        }
        
        console.log('Manual resolution required for the above files.');
        console.log('Use diff tools to compare and merge manually.');
    }

    async updateMemorySystem() {
        console.log('🧠 Updating memory system...');
        
        try {
            // Add checkin context to memory
            const contextData = {
                type: 'mobile_checkin',
                checkout_id: this.checkoutId,
                checkin_id: this.checkinId,
                timestamp: this.timestamp,
                summary: {
                    merged: this.merged.length,
                    conflicts: this.conflicts.length,
                    files_updated: this.updated.length
                },
                details: {
                    merged_files: this.merged.map(m => m.path),
                    conflict_files: this.conflicts.map(c => c.path)
                }
            };
            
            // Try to use existing memory system
            const memoryScript = path.join(this.baseDir, 'rEngine', 'add-context.js');
            if (await fs.pathExists(memoryScript)) {
                const title = `Mobile Checkin ${this.checkoutId}`;
                const description = `Merged ${this.merged.length} files, ${this.conflicts.length} conflicts`;
                
                try {
                    await execPromise(`node "${memoryScript}" "${title}" "${description}" "mobile_checkin"`, {
                        cwd: this.baseDir
                    });
                    console.log('   ✅ Memory system updated');
                } catch (error) {
                    console.log('   ⚠️  Memory system update failed, saving locally');
                    await this.saveLocalMemory(contextData);
                }
            } else {
                await this.saveLocalMemory(contextData);
            }
            
        } catch (error) {
            console.log(`   ⚠️  Memory update failed: ${error.message}`);
        }
    }

    async saveLocalMemory(contextData) {
        const memoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        await fs.ensureDir(memoryDir);
        
        const memoryFile = path.join(memoryDir, `mobile-checkin-${this.timestamp}.json`);
        await fs.writeJson(memoryFile, contextData, { spaces: 2 });
        
        console.log(`   💾 Local memory saved: ${path.basename(memoryFile)}`);
    }

    async generateCheckinReport() {
        console.log('📋 Generating checkin report...');
        
        const report = {
            checkin_info: {
                id: this.checkinId,
                checkout_id: this.checkoutId,
                timestamp: this.timestamp,
                zip_path: this.zipPath
            },
            summary: {
                total_changes: this.updated.length,
                successful_merges: this.merged.length,
                conflicts: this.conflicts.length,
                success_rate: this.updated.length > 0 ? (this.merged.length / this.updated.length * 100).toFixed(1) + '%' : '100%'
            },
            merged_files: this.merged.map(m => ({
                path: m.path,
                type: m.type,
                size: this.getFileSize(m.current)
            })),
            conflicts: this.conflicts.map(c => ({
                path: c.path,
                error: c.error,
                mobile_version: c.mobile,
                current_version: c.current
            })),
            next_steps: this.generateNextSteps(),
            git_status: await this.getGitStatus()
        };
        
        const reportPath = path.join(this.baseDir, `${this.checkinId}-report.json`);
        await fs.writeJson(reportPath, report, { spaces: 2 });
        
        // Also create human-readable summary
        const summaryPath = path.join(this.baseDir, `${this.checkinId}-summary.md`);
        await this.createSummaryMarkdown(report, summaryPath);
        
        console.log(`   ✅ Report created: ${path.basename(reportPath)}`);
        console.log(`   ✅ Summary created: ${path.basename(summaryPath)}`);
    }

    generateNextSteps() {
        const steps = [];
        
        if (this.conflicts.length > 0) {
            steps.push("Resolve conflicts manually using diff tools");
            steps.push("Re-run checkin after resolving conflicts");
        }
        
        if (this.merged.length > 0) {
            steps.push("Review merged changes");
            steps.push("Test functionality");
            steps.push("Commit changes to git");
        }
        
        steps.push("Clean up checkout files if no longer needed");
        
        return steps;
    }

    async createSummaryMarkdown(report, summaryPath) {
        const summary = `# Mobile Development Checkin Summary

## Checkin Information
- **Checkin ID**: ${report.checkin_info.id}
- **Checkout ID**: ${report.checkin_info.checkout_id}
- **Timestamp**: ${report.checkin_info.timestamp}
- **Zip Source**: ${report.checkin_info.zip_path}

## Results Summary
- **Total Changes**: ${report.summary.total_changes}
- **Successful Merges**: ${report.summary.successful_merges}
- **Conflicts**: ${report.summary.conflicts}
- **Success Rate**: ${report.summary.success_rate}

## Merged Files
${report.merged_files.map(f => `- \`${f.path}\` (${f.type})`).join('\n')}

## Conflicts Requiring Manual Resolution
${report.conflicts.map(c => `- \`${c.path}\`: ${c.error}`).join('\n')}

## Next Steps
${report.next_steps.map(step => `1. ${step}`).join('\n')}

## Git Status
- **Branch**: ${report.git_status.branch || 'unknown'}
- **Commit**: ${report.git_status.commit || 'unknown'}
- **Has Changes**: ${report.git_status.has_changes ? 'Yes' : 'No'}

---

*Generated by mobile-checkin.js at ${new Date().toISOString()}*
`;
        
        await fs.writeFile(summaryPath, summary);
    }

    async getFilesRecursively(dir) {
        const files = [];
        const items = await fs.readdir(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = await fs.stat(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...await this.getFilesRecursively(fullPath));
            } else {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    isSensitiveFile(filePath) {
        const sensitive = ['.env', 'key', 'secret', 'config', 'password', 'token', 'api'];
        return sensitive.some(term => filePath.toLowerCase().includes(term));
    }

    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return `${(stats.size / 1024).toFixed(1)}KB`;
        } catch {
            return 'unknown';
        }
    }

    async getGitStatus() {
        try {
            const { stdout: status } = await execPromise('git status --porcelain', { cwd: this.baseDir });
            const { stdout: branch } = await execPromise('git branch --show-current', { cwd: this.baseDir });
            const { stdout: commit } = await execPromise('git rev-parse HEAD', { cwd: this.baseDir });
            
            return {
                branch: branch.trim(),
                commit: commit.trim().substring(0, 8),
                has_changes: status.trim().length > 0,
                changes: status.trim().split('\n').filter(line => line.trim())
            };
        } catch (error) {
            return {
                error: "Could not get git status",
                message: error.message
            };
        }
    }
}

// Handle command line arguments
if (import.meta.url === `file://${process.argv[1]}`) {
    const checkoutId = process.argv[2];
    const zipPath = process.argv[3];
    
    if (!checkoutId) {
        console.error('❌ Usage: node mobile-checkin.js <checkout-id> [zip-path]');
        process.exit(1);
    }
    
    const checkin = new MobileCheckin(checkoutId, zipPath);
    checkin.start().catch(console.error);
}

export default MobileCheckin;
