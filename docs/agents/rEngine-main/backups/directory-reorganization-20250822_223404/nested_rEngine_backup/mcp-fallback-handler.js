#!/usr/bin/env node
/**
 * MCP Fallback Handler for StackTrackr
 * 
 * This script provides automatic fallback to local JSON memory files
 * when MCP server is unavailable or fails.
 * 
 * Usage:
 * const fallback = require('./mcp-fallback-handler.js');
 * const memory = await fallback.getMemoryWithFallback('search term');
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPFallbackHandler {
    constructor() {
        this.basePath = '/Volumes/DATA/GitHub/rEngine';
        this.ragentsPath = path.join(this.basePath, 'rAgents');
        this.rMemoryPath = path.join(this.basePath, 'rMemory/rAgentMemories');
    }

    /**
     * Test if MCP server is available
     */
    async testMCPConnection() {
        try {
            // Try to check if MCP memory server is running
            const mcpCheck = execSync('ps aux | grep mcp-server-memory | grep -v grep', { encoding: 'utf8' });
            return mcpCheck.trim().length > 0;
        } catch (error) {
            console.log('🔄 MCP server not detected, falling back to local JSON memory');
            return false;
        }
    }

    /**
     * Get memory using local JSON files (fallback)
     */
    async getLocalMemory(searchTerm = '') {
        try {
            console.log('📁 Using local JSON memory fallback...');
            
            // Use the existing recall.js system
            const recallResult = execSync(`cd ${this.basePath}/rEngine && node recall.js "${searchTerm}"`, 
                { encoding: 'utf8' });
            
            return {
                source: 'local_json',
                success: true,
                data: recallResult,
                searchTerm: searchTerm
            };
        } catch (error) {
            console.error('❌ Local memory fallback failed:', error.message);
            return {
                source: 'local_json',
                success: false,
                error: error.message,
                searchTerm: searchTerm
            };
        }
    }

    /**
     * Get specific JSON memory file
     */
    async getMemoryFile(filename) {
        const locations = [
            path.join(this.ragentsPath, filename),
            path.join(this.rMemoryPath, filename)
        ];

        for (const location of locations) {
            try {
                const content = await fs.readFile(location, 'utf8');
                return {
                    source: 'local_file',
                    success: true,
                    file: location,
                    data: JSON.parse(content)
                };
            } catch (error) {
                // Try next location
                continue;
            }
        }

        return {
            source: 'local_file',
            success: false,
            error: `File ${filename} not found in any memory location`
        };
    }

    /**
     * Get handoff information (critical for agent transitions)
     */
    async getHandoffInfo() {
        const handoffResult = await this.getMemoryFile('handoff.json');
        if (handoffResult.success) {
            return {
                ...handoffResult,
                summary: handoffResult.data.current_handoff?.handoff_summary || 'No handoff summary available'
            };
        }
        return handoffResult;
    }

    /**
     * Main method: Try MCP first, fallback to local JSON
     */
    async getMemoryWithFallback(searchTerm = '') {
        const mcpAvailable = await this.testMCPConnection();
        
        if (mcpAvailable) {
            console.log('🟢 MCP server available - use MCP tools directly');
            return {
                source: 'mcp_available',
                message: 'Use MCP memory tools directly',
                fallback_available: true
            };
        } else {
            console.log('🔄 MCP server unavailable - using local JSON fallback');
            return await this.getLocalMemory(searchTerm);
        }
    }

    /**
     * Emergency handoff method - always works regardless of MCP status
     */
    async emergencyHandoff() {
        console.log('🚨 Emergency handoff mode - reading all critical files...');
        
        const criticalFiles = [
            'handoff.json',
            'tasks.json', 
            'decisions.json',
            'memory.json',
            'extendedcontext.json'
        ];

        const results = {};
        
        for (const file of criticalFiles) {
            const result = await this.getMemoryFile(file);
            results[file] = result;
        }

        return {
            source: 'emergency_fallback',
            success: true,
            criticalData: results,
            message: 'Emergency handoff data retrieved from local JSON files'
        };
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const handler = new MCPFallbackHandler();
    const args = process.argv.slice(2);
    const command = args[0] || 'test';
    const searchTerm = args[1] || '';

    (async () => {
        switch (command) {
            case 'test':
                const available = await handler.testMCPConnection();
                console.log(`MCP Status: ${available ? '🟢 Available' : '🔴 Unavailable'}`);
                break;
            
            case 'search':
                const result = await handler.getMemoryWithFallback(searchTerm);
                console.log(JSON.stringify(result, null, 2));
                break;
            
            case 'handoff':
                const handoff = await handler.getHandoffInfo();
                console.log(JSON.stringify(handoff, null, 2));
                break;
            
            case 'emergency':
                const emergency = await handler.emergencyHandoff();
                console.log(JSON.stringify(emergency, null, 2));
                break;
            
            default:
                console.log('Usage: node mcp-fallback-handler.js [test|search|handoff|emergency] [searchTerm]');
        }
    })();
}

export default MCPFallbackHandler;
