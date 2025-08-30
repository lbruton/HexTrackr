#!/usr/bin/env node

/**
 * Dual Memory Writer - Ensures all agents write to both memory stores
 * Includes JSON sanitization and error handling
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DualMemoryWriter {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.persistentMemoryPath = path.join(__dirname, 'persistent-memory.json');
        this.agentMemoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        this.extendedContextPath = path.join(this.agentMemoryDir, 'extendedcontext.json');
    }

    // Sanitize JSON data to prevent parse errors
    sanitizeForJSON(data) {
        if (typeof data === 'string') {
            // Remove control characters and fix common JSON issues
            return data
                .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
                .replace(/\\/g, '\\\\') // Escape backslashes
                .replace(/"/g, '\\"') // Escape quotes
                .replace(/\n/g, '\\n') // Escape newlines
                .replace(/\r/g, '\\r') // Escape carriage returns
                .replace(/\t/g, '\\t'); // Escape tabs
        }
        
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[this.sanitizeForJSON(key)] = this.sanitizeForJSON(value);
            }
            return sanitized;
        }
        
        return data;
    }

    // Write to persistent-memory.json
    async writeToPersistentMemory(entry) {
        try {
            let persistentMemory = {};
            
            try {
                const content = await fs.readFile(this.persistentMemoryPath, 'utf8');
                persistentMemory = JSON.parse(content);
            } catch (e) {
                console.log('⚠️  Creating new persistent memory file');
                persistentMemory = {
                    metadata: {
                        version: "1.0.0",
                        created: new Date().toISOString(),
                        purpose: "Persistent memory store for rEngine MCP server"
                    },
                    entities: {},
                    relations: {},
                    conversations: {},
                    system_state: {}
                };
            }

            // Sanitize entry
            const sanitizedEntry = this.sanitizeForJSON(entry);
            
            // Add to conversations
            if (!persistentMemory.conversations) persistentMemory.conversations = {};
            const sessionKey = `${entry.agent || 'unknown'}_${Date.now()}`;
            persistentMemory.conversations[sessionKey] = {
                ...sanitizedEntry,
                timestamp: new Date().toISOString(),
                sanitized: true
            };

            // Update metadata
            if (persistentMemory.metadata) {
                persistentMemory.metadata.lastSync = new Date().toISOString();
            }

            // Write with proper formatting
            await fs.writeFile(this.persistentMemoryPath, JSON.stringify(persistentMemory, null, 2));
            console.log('🟢 >RAN MCP Memory Write: persistent-memory.json updated');
            console.log(`📝 Inline: ${JSON.stringify(sanitizedEntry, null, 0).substring(0, 100)}...`);
            return true;
            
        } catch (error) {
            console.error('❌ Persistent memory write failed:', error.message);
            return false;
        }
    }

    // Write to agent-specific memory
    async writeToAgentMemory(agentType, entry) {
        try {
            const agentMemoryPath = path.join(this.agentMemoryDir, `${agentType}-memory.json`);
            let agentMemory = {};
            
            try {
                const content = await fs.readFile(agentMemoryPath, 'utf8');
                agentMemory = JSON.parse(content);
            } catch (e) {
                agentMemory = {
                    agent_type: agentType,
                    created_at: new Date().toISOString(),
                    sessions: {}
                };
            }

            // Sanitize entry
            const sanitizedEntry = this.sanitizeForJSON(entry);
            
            // Add to today's session
            const today = new Date().toISOString().split('T')[0];
            if (!agentMemory.sessions[today]) agentMemory.sessions[today] = [];
            
            agentMemory.sessions[today].push({
                session_id: `${agentType}-${Date.now()}`,
                timestamp: new Date().toISOString(),
                ...sanitizedEntry,
                sanitized: true
            });

            // Update stats
            if (!agentMemory.memory_stats) agentMemory.memory_stats = {};
            agentMemory.memory_stats.last_active = new Date().toISOString();
            agentMemory.memory_stats.total_sessions = (agentMemory.memory_stats.total_sessions || 0) + 1;

            // Write with proper formatting
            await fs.writeFile(agentMemoryPath, JSON.stringify(agentMemory, null, 2));
            console.log(`🔵 >RAN Agent Memory Write: ${agentType}-memory.json updated`);
            console.log(`📝 Inline: ${JSON.stringify(sanitizedEntry, null, 0).substring(0, 100)}...`);
            return true;
            
        } catch (error) {
            console.error(`❌ ${agentType} memory write failed:`, error.message);
            return false;
        }
    }

    // Write to extended context
    async writeToExtendedContext(entry) {
        try {
            let extendedContext = {};
            
            try {
                const content = await fs.readFile(this.extendedContextPath, 'utf8');
                extendedContext = JSON.parse(content);
            } catch (e) {
                extendedContext = {
                    metadata: { version: "1.0.0", created: new Date().toISOString() },
                    sessions: {}
                };
            }

            // Sanitize entry
            const sanitizedEntry = this.sanitizeForJSON(entry);
            
            // Add to today's session
            const today = new Date().toISOString().split('T')[0];
            if (!extendedContext.sessions[today]) extendedContext.sessions[today] = [];
            
            const sessionEntry = {
                session_id: `dual-memory-${Date.now()}`,
                start_time: new Date().toISOString(),
                summary: sanitizedEntry.title || 'Dual Memory Write',
                activities: [{
                    timestamp: new Date().toLocaleTimeString(),
                    type: 'DUAL_MEMORY',
                    message: sanitizedEntry.content || 'Memory synchronization',
                    full: `DUAL_MEMORY - ${sanitizedEntry.content || 'Memory sync'}`,
                    isoTimestamp: new Date().toISOString()
                }],
                last_updated: new Date().toISOString()
            };
            
            extendedContext.sessions[today].push(sessionEntry);
            extendedContext.metadata.last_updated = new Date().toISOString();

            // Write with proper formatting
            await fs.writeFile(this.extendedContextPath, JSON.stringify(extendedContext, null, 2));
            console.log('🟡 >RAN Extended Context Write: extendedcontext.json updated');
            console.log(`📝 Inline: ${(sanitizedEntry.content || 'Memory sync').substring(0, 100)}...`);
            return true;
            
        } catch (error) {
            console.error('❌ Extended context write failed:', error.message);
            return false;
        }
    }

    // Main dual write method
    async dualWrite(agentType, entry) {
        console.log(`🚀 >RAN Dual Memory Write for ${agentType}...`);
        
        const results = await Promise.all([
            this.writeToPersistentMemory({ agent: agentType, ...entry }),
            this.writeToAgentMemory(agentType, entry),
            this.writeToExtendedContext(entry)
        ]);
        
        const successCount = results.filter(r => r).length;
        console.log(`📊 >RAN Memory Writes: ${successCount}/3 successful`);
        
        // Try MCP memory if available (optional)
        try {
            // Placeholder for MCP memory integration
            console.log('� >RAN MCP Memory: Ready for implementation');
        } catch (error) {
            console.log('⚠️  MCP memory not available');
        }
        
        return successCount >= 2; // Consider success if at least 2/3 writes succeed
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const writer = new DualMemoryWriter();
    const agentType = process.argv[2] || 'claude';
    const title = process.argv[3] || 'Test Entry';
    const content = process.argv[4] || 'Test dual memory write';
    
    await writer.dualWrite(agentType, { title, content, type: 'test' });
}

export default DualMemoryWriter;
