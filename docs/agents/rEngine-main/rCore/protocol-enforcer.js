#!/usr/bin/env node

/**
 * Protocol Enforcement System
 * Prevents agents from going rogue and breaking established protocols
 * Mandatory checks before any significant operations
 * ENHANCED: Integrates with memory safety system
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import MemorySafetySystem from './memory-safety.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProtocolEnforcer {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.lastBackupTime = null;
        this.protocolsEnabled = true;
        this.violationCount = 0;
        this.maxViolations = 3;
        this.memorySafety = new MemorySafetySystem();
        
        console.log('🛡️  Protocol Enforcer initialized');
        console.log('🔒 All protocol checks ACTIVE');
        console.log('🧠 Memory safety system integrated');
    }

    /**
     * MANDATORY: Must be called before ANY significant changes
     */
    async enforceProtocols(operation, details = {}) {
        if (!this.protocolsEnabled) {
            console.log('⚠️  Protocol enforcement DISABLED - PROCEED WITH CAUTION');
            return { allowed: true, reason: 'enforcement_disabled' };
        }

        console.log(`🔍 Protocol check for operation: ${operation}`);
        
        const checks = [
            await this.checkBackupRequirement(operation),
            await this.checkFileContainment(details.files || []),
            await this.checkGitOperations(operation, details),
            await this.checkMemoryConsistency(),
            await this.checkAgentBehavior(operation, details)
        ];

        const violations = checks.filter(check => !check.passed);
        
        if (violations.length > 0) {
            this.violationCount += violations.length;
            
            console.log('🚨 PROTOCOL VIOLATIONS DETECTED:');
            violations.forEach(v => console.log(`   ❌ ${v.violation}`));
            
            if (this.violationCount >= this.maxViolations) {
                console.log('🔒 MAXIMUM VIOLATIONS REACHED - AGENT LOCKDOWN INITIATED');
                return { 
                    allowed: false, 
                    reason: 'max_violations_exceeded',
                    violations: violations,
                    lockdown: true
                };
            }
            
            return { 
                allowed: false, 
                reason: 'protocol_violations',
                violations: violations 
            };
        }

        console.log('✅ All protocol checks passed');
        return { allowed: true, reason: 'compliant' };
    }

    async checkBackupRequirement(operation) {
        const backupRequired = [
            'file_modification',
            'directory_restructure', 
            'code_rewrite',
            'memory_update',
            'system_change'
        ];

        if (!backupRequired.includes(operation)) {
            return { passed: true };
        }

        // Check if backup was created recently (within 10 minutes)
        const backupAge = await this.getLastBackupAge();
        
        if (backupAge > 10 * 60 * 1000) { // 10 minutes in ms
            return {
                passed: false,
                violation: `Operation '${operation}' requires recent backup (last backup: ${Math.round(backupAge/60000)} minutes ago)`
            };
        }

        return { passed: true };
    }

    async checkFileContainment(files) {
        const violations = [];
        
        for (const file of files) {
            // Ensure all files are within StackTrackr directory
            if (!file.startsWith(this.baseDir)) {
                violations.push(`File outside project: ${file}`);
            }
            
            // Check for dangerous directories
            if (file.includes('/agents/') && !file.includes('/rAgentMemories/')) {
                violations.push(`Dangerous path detected: ${file} (use rMemory/rAgentMemories/)`);
            }
        }

        return violations.length === 0 ? 
            { passed: true } : 
            { passed: false, violation: violations.join(', ') };
    }

    async checkGitOperations(operation, details) {
        // CRITICAL: No automated GitHub operations allowed
        const forbiddenGitOps = ['git_push', 'git_pull', 'github_sync'];
        
        if (forbiddenGitOps.includes(operation)) {
            return {
                passed: false,
                violation: `Forbidden git operation: ${operation}. User must handle GitHub sync via desktop app.`
            };
        }

        // Check if operation involves git commands that could trigger GitHub
        if (details.command && details.command.includes('git push')) {
            return {
                passed: false,
                violation: 'Automated git push detected. User must handle GitHub sync manually.'
            };
        }

        return { passed: true };
    }

    async checkMemoryConsistency() {
        try {
            const memoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
            
            // Verify critical memory files exist
            const criticalFiles = ['memory.json', 'decisions.json', 'functions.json'];
            
            for (const file of criticalFiles) {
                const filePath = path.join(memoryDir, file);
                if (!await fs.pathExists(filePath)) {
                    return {
                        passed: false,
                        violation: `Critical memory file missing: ${file}`
                    };
                }
                
                // Verify file is valid JSON
                try {
                    await fs.readJson(filePath);
                } catch (error) {
                    return {
                        passed: false,
                        violation: `Corrupted memory file: ${file}`
                    };
                }
            }

            return { passed: true };
            
        } catch (error) {
            return {
                passed: false,
                violation: `Memory consistency check failed: ${error.message}`
            };
        }
    }

    async checkAgentBehavior(operation, details) {
        // Detect patterns that indicate rogue behavior
        const roguePatterns = [
            'complete_rewrite',
            'delete_all',
            'ignore_protocol',
            'bypass_backup'
        ];

        if (roguePatterns.some(pattern => operation.includes(pattern))) {
            return {
                passed: false,
                violation: `Rogue behavior pattern detected: ${operation}`
            };
        }

        // Check for excessive operations without user confirmation
        if (details.bulk_operation && !details.user_confirmed) {
            return {
                passed: false,
                violation: 'Bulk operation requires explicit user confirmation'
            };
        }

        return { passed: true };
    }

    async getLastBackupAge() {
        try {
            const gitLog = execSync('git log -1 --format=%ct', { 
                cwd: this.baseDir, 
                encoding: 'utf8' 
            });
            
            const lastCommitTime = parseInt(gitLog.trim()) * 1000;
            const now = Date.now();
            
            return now - lastCommitTime;
            
        } catch (error) {
            console.log('⚠️  Cannot check backup age:', error.message);
            return Infinity; // Force backup creation
        }
    }

    /**
     * EMERGENCY: Disable protocol enforcement (dangerous!)
     */
    disableProtocols(reason) {
        console.log('🚨 WARNING: Protocol enforcement DISABLED');
        console.log(`📝 Reason: ${reason}`);
        this.protocolsEnabled = false;
    }

    /**
     * Re-enable protocol enforcement
     */
    enableProtocols() {
        console.log('🔒 Protocol enforcement RE-ENABLED');
        this.protocolsEnabled = true;
        this.violationCount = 0;
    }

    /**
     * Quick backup before risky operations
     */
    async createProtocolBackup(operation) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const message = `PROTOCOL BACKUP: Before ${operation} - ${timestamp}`;
            
            execSync('git add .', { cwd: this.baseDir });
            execSync(`git commit -m "${message}"`, { cwd: this.baseDir });
            
            console.log('✅ Protocol backup created');
            this.lastBackupTime = Date.now();
            
            return true;
            
        } catch (error) {
            console.error('❌ Protocol backup failed:', error.message);
            return false;
        }
    }

    /**
     * Report protocol status
     */
    getProtocolStatus() {
        return {
            enabled: this.protocolsEnabled,
            violations: this.violationCount,
            maxViolations: this.maxViolations,
            lockdown: this.violationCount >= this.maxViolations,
            lastBackup: this.lastBackupTime
        };
    }
}

// CLI interface for manual protocol checks
if (import.meta.url === `file://${process.argv[1]}`) {
    const enforcer = new ProtocolEnforcer();
    const operation = process.argv[2] || 'manual_check';
    const details = process.argv[3] ? JSON.parse(process.argv[3]) : {};
    
    enforcer.enforceProtocols(operation, details).then(result => {
        console.log('\n📊 Protocol Enforcement Result:');
        console.log(JSON.stringify(result, null, 2));
        
        if (!result.allowed) {
            console.log('\n🚨 Operation BLOCKED by protocol enforcement');
            process.exit(1);
        } else {
            console.log('\n✅ Operation approved');
            process.exit(0);
        }
    }).catch(error => {
        console.error('❌ Protocol enforcement failed:', error);
        process.exit(1);
    });
}

export default ProtocolEnforcer;
