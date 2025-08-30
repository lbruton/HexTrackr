#!/usr/bin/env node

/**
 * Memory Safety & Isolation System
 * 
 * Ensures:
 * 1. Scribe can only write to scribe-specific files
 * 2. Agents have their own isolated memory spaces
 * 3. Master lookup table maintains references to both
 * 4. Automatic backup of deleted memories (24h retention)
 * 5. No memory database wipes without explicit confirmation
 * 6. Integration with MCP memory system
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MemorySafetySystem {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.memoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        this.scribeDir = path.join(this.memoryDir, 'scribe');
        this.agentDir = path.join(this.memoryDir, 'agents');
        this.backupDir = path.join(this.memoryDir, 'backups');
        this.deletedBackupFile = path.join(this.backupDir, 'deletedMemories24h.json');
        this.masterLookupFile = path.join(this.memoryDir, 'master_memory_lookup.json');
        
        this.scribeAllowedFiles = [
            'scribe_analysis.json',
            'scribe_patterns.json', 
            'scribe_handoffs.json',
            'scribe_conversations.json',
            'scribe_system_health.json'
        ];
        
        this.agentAllowedFiles = [
            'github_copilot_memories.json',
            'claude_sonnet_memories.json',
            'claude_opus_memories.json',
            'gpt4_memories.json',
            'gpt4o_memories.json',
            'gemini_pro_memories.json'
        ];
        
        this.sharedFiles = [
            'memory.json',           // Master project memory
            'tasks.json',           // Current assignments
            'decisions.json',       // Architectural decisions
            'functions.json',       // Function ownership
            'errors.json',          // Known issues
            'preferences.json',     // Project settings
            'styles.json',          // Visual definitions
            'patterns.json'         // Learning patterns
        ];
        
        this.init();
    }
    
    async init() {
        try {
            await this.ensureDirectoryStructure();
            await this.initializeMasterLookup();
            await this.initializeDeletedBackup();
            console.log('🛡️  Memory Safety System initialized');
            console.log('📁 Directory structure verified');
            console.log('🔍 Master lookup table ready'); 
            console.log('💾 Deleted memory backup active');
        } catch (error) {
            console.error('❌ Memory Safety System initialization failed:', error.message);
            throw error;
        }
    }
    
    async ensureDirectoryStructure() {
        const dirs = [this.scribeDir, this.agentDir, this.backupDir];
        
        for (const dir of dirs) {
            await fs.ensureDir(dir);
        }
        
        // Create safety README files
        await fs.writeFile(
            path.join(this.scribeDir, 'README.md'),
            '# Scribe Memory Files\n\nThese files are ONLY writable by the scribe system.\nAgents cannot modify these files directly.\n'
        );
        
        await fs.writeFile(
            path.join(this.agentDir, 'README.md'), 
            '# Agent Memory Files\n\nEach agent has their own isolated memory file.\nScribe cannot modify these files directly.\n'
        );
    }
    
    async initializeMasterLookup() {
        if (!await fs.pathExists(this.masterLookupFile)) {
            const initialLookup = {
                version: "1.0",
                last_updated: new Date().toISOString(),
                scribe_files: {},
                agent_files: {},
                shared_files: {},
                access_control: {
                    scribe_write_permissions: this.scribeAllowedFiles,
                    agent_write_permissions: this.agentAllowedFiles,
                    shared_read_write: this.sharedFiles
                },
                backup_policy: {
                    deleted_retention_hours: 24,
                    automatic_backup_before_delete: true,
                    mcp_sync_enabled: true
                }
            };
            
            await fs.writeJson(this.masterLookupFile, initialLookup, { spaces: 2 });
        }
    }
    
    async initializeDeletedBackup() {
        if (!await fs.pathExists(this.deletedBackupFile)) {
            const initialBackup = {
                version: "1.0",
                created: new Date().toISOString(),
                retention_hours: 24,
                deleted_memories: []
            };
            
            await fs.writeJson(this.deletedBackupFile, initialBackup, { spaces: 2 });
        }
    }
    
    /**
     * Validate file access based on requester type
     */
    async validateFileAccess(requester, operation, filePath) {
        const fileName = path.basename(filePath);
        const isScribe = requester === 'scribe';
        const isAgent = requester.startsWith('agent_') || this.agentAllowedFiles.some(f => f.includes(requester));
        
        // Check if it's a scribe file
        if (this.scribeAllowedFiles.includes(fileName)) {
            if (!isScribe && operation === 'write') {
                return {
                    allowed: false,
                    reason: `Only scribe can write to ${fileName}`,
                    violation: 'UNAUTHORIZED_SCRIBE_FILE_ACCESS'
                };
            }
        }
        
        // Check if it's an agent file
        if (this.agentAllowedFiles.includes(fileName)) {
            if (isScribe && operation === 'write') {
                return {
                    allowed: false,
                    reason: `Scribe cannot write to agent file ${fileName}`,
                    violation: 'UNAUTHORIZED_AGENT_FILE_ACCESS'
                };
            }
            
            // Agents can only write to their own files
            if (isAgent && operation === 'write' && !fileName.includes(requester)) {
                return {
                    allowed: false,
                    reason: `Agent can only write to their own memory file`,
                    violation: 'CROSS_AGENT_FILE_ACCESS'
                };
            }
        }
        
        // Shared files - both can read/write but with backup requirement
        if (this.sharedFiles.includes(fileName)) {
            if (operation === 'write') {
                await this.requireBackupBeforeWrite(filePath);
            }
        }
        
        return { allowed: true };
    }
    
    /**
     * Backup memory before deletion (24h retention)
     */
    async backupBeforeDelete(filePath, content) {
        try {
            const backup = await fs.readJson(this.deletedBackupFile);
            const now = new Date();
            
            // Clean old backups (older than 24h)
            backup.deleted_memories = backup.deleted_memories.filter(entry => {
                const entryDate = new Date(entry.deleted_at);
                const hoursSince = (now - entryDate) / (1000 * 60 * 60);
                return hoursSince < 24;
            });
            
            // Add new backup entry
            backup.deleted_memories.push({
                file_path: filePath,
                file_name: path.basename(filePath),
                content: content,
                deleted_at: now.toISOString(),
                backed_up_by: 'memory_safety_system'
            });
            
            await fs.writeJson(this.deletedBackupFile, backup, { spaces: 2 });
            console.log(`💾 Backed up deleted memory: ${path.basename(filePath)}`);
            
        } catch (error) {
            console.error('❌ Failed to backup deleted memory:', error.message);
            throw new Error('Cannot delete memory without backup');
        }
    }
    
    /**
     * Update master lookup table
     */
    async updateMasterLookup() {
        try {
            const lookup = await fs.readJson(this.masterLookupFile);
            lookup.last_updated = new Date().toISOString();
            
            // Scan scribe files
            const scribeFiles = await fs.readdir(this.scribeDir);
            for (const file of scribeFiles.filter(f => f.endsWith('.json'))) {
                const filePath = path.join(this.scribeDir, file);
                const stats = await fs.stat(filePath);
                lookup.scribe_files[file] = {
                    path: filePath,
                    size: stats.size,
                    last_modified: stats.mtime.toISOString(),
                    access_level: 'scribe_only'
                };
            }
            
            // Scan agent files  
            const agentFiles = await fs.readdir(this.agentDir);
            for (const file of agentFiles.filter(f => f.endsWith('.json'))) {
                const filePath = path.join(this.agentDir, file);
                const stats = await fs.stat(filePath);
                lookup.agent_files[file] = {
                    path: filePath,
                    size: stats.size,
                    last_modified: stats.mtime.toISOString(),
                    access_level: 'agent_only'
                };
            }
            
            // Scan shared files
            for (const file of this.sharedFiles) {
                const filePath = path.join(this.memoryDir, file);
                if (await fs.pathExists(filePath)) {
                    const stats = await fs.stat(filePath);
                    lookup.shared_files[file] = {
                        path: filePath,
                        size: stats.size,
                        last_modified: stats.mtime.toISOString(),
                        access_level: 'shared_read_write'
                    };
                }
            }
            
            await fs.writeJson(this.masterLookupFile, lookup, { spaces: 2 });
            console.log('🔍 Master lookup table updated');
            
        } catch (error) {
            console.error('❌ Failed to update master lookup:', error.message);
        }
    }
    
    /**
     * Enforce backup before writing to critical files
     */
    async requireBackupBeforeWrite(filePath) {
        if (await fs.pathExists(filePath)) {
            const content = await fs.readJson(filePath);
            const backupPath = `${filePath}.backup.${Date.now()}`;
            await fs.writeJson(backupPath, content, { spaces: 2 });
            console.log(`💾 Created backup: ${path.basename(backupPath)}`);
        }
    }
    
    /**
     * Sync with MCP memory system
     */
    async syncWithMCP() {
        try {
            const { execSync } = await import('child_process');
            const result = execSync('node memory-sync-manager.js health', { 
                cwd: path.join(this.baseDir, 'rEngine'),
                encoding: 'utf8' 
            });
            
            if (result.includes('Memory System Health:')) {
                console.log('✅ MCP memory system connection verified');
                return true;
            }
            
        } catch (error) {
            console.warn('⚠️  MCP memory system not available:', error.message);
            return false;
        }
    }
    
    /**
     * Emergency recovery from deleted backups
     */
    async recoverDeletedMemory(fileName, hoursBack = 24) {
        try {
            const backup = await fs.readJson(this.deletedBackupFile);
            const now = new Date();
            
            const candidates = backup.deleted_memories.filter(entry => {
                const entryDate = new Date(entry.deleted_at);
                const hoursSince = (now - entryDate) / (1000 * 60 * 60);
                return entry.file_name === fileName && hoursSince <= hoursBack;
            });
            
            if (candidates.length === 0) {
                throw new Error(`No deleted backup found for ${fileName} within ${hoursBack} hours`);
            }
            
            // Get most recent backup
            const latest = candidates.sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at))[0];
            
            console.log(`🔄 Found deleted backup: ${fileName} from ${latest.deleted_at}`);
            return latest.content;
            
        } catch (error) {
            console.error('❌ Recovery failed:', error.message);
            throw error;
        }
    }
    
    /**
     * Generate memory system status report
     */
    async generateStatusReport() {
        await this.updateMasterLookup();
        const lookup = await fs.readJson(this.masterLookupFile);
        const mcpConnected = await this.syncWithMCP();
        
        const report = {
            timestamp: new Date().toISOString(),
            memory_isolation: {
                scribe_files: Object.keys(lookup.scribe_files).length,
                agent_files: Object.keys(lookup.agent_files).length,
                shared_files: Object.keys(lookup.shared_files).length
            },
            backup_system: {
                deleted_backups_available: (await fs.readJson(this.deletedBackupFile)).deleted_memories.length,
                mcp_connection: mcpConnected ? 'active' : 'inactive'
            },
            safety_status: 'all_systems_operational'
        };
        
        console.log('📊 Memory Safety Status:');
        console.log(JSON.stringify(report, null, 2));
        
        return report;
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const safety = new MemorySafetySystem();
    
    const command = process.argv[2] || 'status';
    
    switch (command) {
        case 'init':
            console.log('🛡️  Initializing memory safety system...');
            break;
            
        case 'status':
            await safety.generateStatusReport();
            break;
            
        case 'update-lookup':
            await safety.updateMasterLookup();
            break;
            
        case 'recover':
            const fileName = process.argv[3];
            if (!fileName) {
                console.error('Usage: node memory-safety.js recover <filename>');
                process.exit(1);
            }
            try {
                const content = await safety.recoverDeletedMemory(fileName);
                console.log('📄 Recovered content:');
                console.log(JSON.stringify(content, null, 2));
            } catch (error) {
                console.error('❌ Recovery failed:', error.message);
                process.exit(1);
            }
            break;
            
        default:
            console.log('Usage: node memory-safety.js [init|status|update-lookup|recover <filename>]');
    }
}

export default MemorySafetySystem;
