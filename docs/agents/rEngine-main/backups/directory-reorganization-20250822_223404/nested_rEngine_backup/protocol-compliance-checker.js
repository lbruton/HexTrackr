#!/usr/bin/env node

/**
 * Protocol Compliance Checker for StackTrackr rEngine
 * Prevents agents from breaking critical protocols that cause issues
 * 
 * CRITICAL PROTOCOLS:
 * 1. NO files outside /StackTrackr/ directory
 * 2. NO automated GitHub operations (push/pull) 
 * 3. MANDATORY backups before changes
 * 4. LOCAL git snapshots only - user handles GitHub sync
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

class ProtocolComplianceChecker {
    constructor() {
        this.projectRoot = '/Volumes/DATA/GitHub/rEngine';
        this.violations = [];
        this.isCompliant = true;
        
        console.log('🛡️  Protocol Compliance Checker initialized');
        console.log(`📁 Project root: ${this.projectRoot}`);
    }

    /**
     * Master compliance check - run before ANY agent operation
     */
    async checkCompliance() {
        console.log('\n🔍 Running Protocol Compliance Check...');
        
        this.violations = [];
        this.isCompliant = true;
        
        await this.checkFileContainment();
        await this.checkGitOperations();
        await this.checkBackupRequirements();
        await this.checkPathReferences();
        
        return this.generateComplianceReport();
    }

    /**
     * PROTOCOL 1: Ensure no files created outside StackTrackr directory
     */
    async checkFileContainment() {
        console.log('📁 Checking file containment...');
        
        const gitHubRoot = '/Volumes/DATA/GitHub';
        const dangerousPaths = [
            path.join(gitHubRoot, 'rEngine'),
            path.join(gitHubRoot, 'rAgents'),
            path.join(gitHubRoot, 'rMemory'),
            path.join(gitHubRoot, 'agents')
        ];
        
        for (const dangerousPath of dangerousPaths) {
            if (await fs.pathExists(dangerousPath)) {
                this.addViolation('EXTERNAL_FILES', 
                    `Dangerous external directory found: ${dangerousPath}`, 
                    'DELETE_EXTERNAL_DIR'
                );
            }
        }
        
        // Check current working directory
        const cwd = process.cwd();
        if (!cwd.startsWith(this.projectRoot)) {
            this.addViolation('WRONG_DIRECTORY', 
                `Working outside project root: ${cwd}`, 
                'CHANGE_TO_PROJECT_ROOT'
            );
        }
    }

    /**
     * PROTOCOL 2: No automated GitHub operations
     */
    async checkGitOperations() {
        console.log('🔒 Checking git operation compliance...');
        
        // Scan all JS files for dangerous git operations (exclude this checker file)
        const dangerousOperations = [
            'execSync.*git.*push',
            'execSync.*git.*pull',
            'spawn.*git.*push',
            'spawn.*git.*pull'
        ];
        
        try {
            const jsFiles = execSync(`find ${this.projectRoot} -name "*.js" -type f`, 
                { encoding: 'utf8' }).trim().split('\n');
            
            for (const file of jsFiles) {
                if (!file || file.includes('protocol-compliance-checker.js')) continue;
                
                try {
                    const content = await fs.readFile(file, 'utf8');
                    
                    for (const operation of dangerousOperations) {
                        const regex = new RegExp(operation, 'gi');
                        if (regex.test(content)) {
                            this.addViolation('AUTOMATED_GITHUB', 
                                `Dangerous git operation in ${file}: ${operation}`, 
                                'REMOVE_AUTO_GIT'
                            );
                        }
                    }
                } catch (err) {
                    // Skip unreadable files
                }
            }
        } catch (err) {
            console.log('⚠️  Could not scan all JS files for git operations');
        }
    }

    /**
     * PROTOCOL 3: Backup requirements
     */
    async checkBackupRequirements() {
        console.log('💾 Checking backup compliance...');
        
        const backupDir = path.join(this.projectRoot, 'rEngine', 'backups');
        if (!await fs.pathExists(backupDir)) {
            this.addViolation('NO_BACKUP_SYSTEM', 
                'Backup directory not found', 
                'CREATE_BACKUP_SYSTEM'
            );
            return;
        }
        
        // Check for recent backups
        try {
            const backups = await fs.readdir(backupDir);
            const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const hasRecentBackup = backups.some(backup => backup.includes(today));
            
            if (!hasRecentBackup) {
                this.addViolation('NO_RECENT_BACKUP', 
                    'No backup created today before changes', 
                    'CREATE_BACKUP'
                );
            }
        } catch (err) {
            this.addViolation('BACKUP_CHECK_FAILED', 
                'Could not verify backup status', 
                'CHECK_BACKUP_MANUALLY'
            );
        }
    }

    /**
     * PROTOCOL 4: Check path references for compliance
     */
    async checkPathReferences() {
        console.log('🔍 Checking path references...');
        
        const dangerousPatterns = [
            "path.join.*'agents'",
            'path.join.*"agents"',
            '/GitHub/StackTrackr/agents',
            '../agents'
        ];
        
        try {
            const jsFiles = execSync(`find ${this.projectRoot}/rEngine -name "*.js" -type f`, 
                { encoding: 'utf8' }).trim().split('\n');
            
            for (const file of jsFiles) {
                if (!file) continue;
                
                try {
                    const content = await fs.readFile(file, 'utf8');
                    
                    for (const pattern of dangerousPatterns) {
                        const regex = new RegExp(pattern, 'gi');
                        if (regex.test(content) && !content.includes('rAgentMemories')) {
                            this.addViolation('DANGEROUS_PATH', 
                                `Dangerous path pattern in ${file}: ${pattern}`, 
                                'FIX_PATH_REFERENCE'
                            );
                        }
                    }
                } catch (err) {
                    // Skip unreadable files
                }
            }
        } catch (err) {
            console.log('⚠️  Could not scan all JS files for path patterns');
        }
    }

    addViolation(type, message, action) {
        this.violations.push({ type, message, action, timestamp: new Date().toISOString() });
        this.isCompliant = false;
    }

    generateComplianceReport() {
        console.log('\n📋 Protocol Compliance Report:');
        console.log('=' .repeat(50));
        
        if (this.isCompliant) {
            console.log('✅ ALL PROTOCOLS COMPLIANT');
            console.log('🛡️  Safe to proceed with operations');
            return { compliant: true, violations: [] };
        }
        
        console.log('🚨 PROTOCOL VIOLATIONS DETECTED:');
        console.log(`❌ ${this.violations.length} violation(s) found\n`);
        
        for (const violation of this.violations) {
            console.log(`🔴 ${violation.type}: ${violation.message}`);
            console.log(`   Action Required: ${violation.action}\n`);
        }
        
        console.log('🛑 OPERATIONS BLOCKED UNTIL VIOLATIONS RESOLVED');
        
        return { compliant: false, violations: this.violations };
    }

    /**
     * Quick validation for specific operations
     */
    validatePath(filePath) {
        if (!filePath.startsWith(this.projectRoot)) {
            throw new Error(`🚨 PROTOCOL VIOLATION: Path outside project root: ${filePath}`);
        }
        return true;
    }

    validateGitOperation(operation) {
        const dangerousOps = ['push', 'pull'];
        if (dangerousOps.some(op => operation.toLowerCase().includes(op))) {
            throw new Error(`🚨 PROTOCOL VIOLATION: Automated GitHub operation: ${operation}`);
        }
        return true;
    }

    /**
     * Create backup before making changes
     */
    async createProtocolBackup(description = 'Protocol compliance backup') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const backupDir = path.join(this.projectRoot, 'rEngine', 'backups', `${timestamp}_protocol`);
        
        await fs.ensureDir(backupDir);
        
        // Backup critical files
        const criticalFiles = [
            'rEngine/smart-scribe.js',
            'rEngine/agent-hello-workflow.js',
            'rEngine/memory-sync-manager.js',
            'rEngine/index.js'
        ];
        
        for (const file of criticalFiles) {
            const srcPath = path.join(this.projectRoot, file);
            if (await fs.pathExists(srcPath)) {
                const destPath = path.join(backupDir, path.basename(file));
                await fs.copy(srcPath, destPath);
            }
        }
        
        console.log(`💾 Protocol backup created: ${backupDir}`);
        return backupDir;
    }

    /**
     * User prompt for GitHub operations
     */
    promptGitHubSync() {
        console.log('\n📱 GitHub Sync Required:');
        console.log('🔄 Please use GitHub Desktop app to:');
        console.log('   1. Review changes');
        console.log('   2. Commit if desired');
        console.log('   3. Push/Pull as needed');
        console.log('🚨 DO NOT use VS Code GitHub integration');
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const checker = new ProtocolComplianceChecker();
    
    if (process.argv[2] === 'check') {
        const result = await checker.checkCompliance();
        process.exit(result.compliant ? 0 : 1);
    } else if (process.argv[2] === 'backup') {
        await checker.createProtocolBackup(process.argv[3] || 'Manual backup');
    } else {
        console.log('Usage: node protocol-compliance-checker.js [check|backup]');
    }
}

export default ProtocolComplianceChecker;
