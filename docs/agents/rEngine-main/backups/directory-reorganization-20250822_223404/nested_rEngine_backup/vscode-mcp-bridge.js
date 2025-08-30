#!/usr/bin/env node

/**
 * VS Code MCP Bridge - Maintains connection to MCP servers even when plugin disconnects
 * 
 * This bridge ensures your recall.js and memory tools remain accessible
 * even when the VS Code MCP plugin becomes unstable after 5 minutes.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VSCodeMCPBridge {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.mcpServers = new Map();
        this.bridgeActive = false;
        this.reconnectAttempts = 0;
        this.maxReconnects = 5;
        
        console.log('🌉 VS Code MCP Bridge initializing...');
        this.initialize();
    }

    async initialize() {
        // Monitor VS Code MCP plugin status
        await this.checkVSCodeMCPStatus();
        
        // Start bridge servers if needed
        await this.startBridgeServers();
        
        // Setup health monitoring
        this.startHealthMonitoring();
        
        console.log('✅ VS Code MCP Bridge active - your tools remain accessible!');
    }

    async checkVSCodeMCPStatus() {
        try {
            // Check if VS Code MCP servers are responding
            const memoryServerActive = await this.pingMCPServer('memory', 8080);
            const context7Active = await this.pingMCPServer('context7', 8081);
            
            if (!memoryServerActive || !context7Active) {
                console.log('⚠️  VS Code MCP plugin appears disconnected - bridge taking over');
                this.bridgeActive = true;
            } else {
                console.log('✅ VS Code MCP plugin active - bridge in standby mode');
                this.bridgeActive = false;
            }
        } catch (error) {
            console.log('🚨 VS Code MCP status check failed - activating bridge');
            this.bridgeActive = true;
        }
    }

    async pingMCPServer(serverName, port) {
        // Simple health check for MCP servers
        try {
            const response = await fetch(`http://localhost:${port}/health`, {
                method: 'GET',
                timeout: 2000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async startBridgeServers() {
        if (!this.bridgeActive) {
            console.log('🔗 Bridge in standby - VS Code MCP plugin handling connections');
            return;
        }

        console.log('🚀 Starting bridge MCP servers...');

        // Start memory server bridge
        await this.startMemoryServerBridge();
        
        // Start context7 server bridge  
        await this.startContext7Bridge();
        
        // Start recall.js bridge
        await this.startRecallBridge();
    }

    async startMemoryServerBridge() {
        if (this.mcpServers.has('memory-bridge')) return;

        console.log('🧠 Starting Memory Server Bridge...');
        
        const memoryProcess = spawn('npx', ['@modelcontextprotocol/server-memory'], {
            cwd: this.baseDir,
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                MCP_SERVER_PORT: '8090' // Different port to avoid conflicts
            }
        });

        memoryProcess.stdout.on('data', (data) => {
            console.log(`[Memory Bridge] ${data.toString().trim()}`);
        });

        memoryProcess.stderr.on('data', (data) => {
            console.log(`[Memory Bridge Error] ${data.toString().trim()}`);
        });

        memoryProcess.on('exit', (code) => {
            console.log(`Memory bridge exited with code ${code}`);
            this.mcpServers.delete('memory-bridge');
            
            // Auto-restart if bridge is still needed
            if (this.bridgeActive && this.reconnectAttempts < this.maxReconnects) {
                this.reconnectAttempts++;
                setTimeout(() => this.startMemoryServerBridge(), 5000);
            }
        });

        this.mcpServers.set('memory-bridge', memoryProcess);
        console.log('✅ Memory Server Bridge running on port 8090');
    }

    async startContext7Bridge() {
        if (this.mcpServers.has('context7-bridge')) return;

        console.log('📚 Starting Context7 Bridge...');
        
        const context7Process = spawn('npx', ['@upstash/context7-mcp@latest'], {
            cwd: this.baseDir,
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                MCP_SERVER_PORT: '8091' // Different port to avoid conflicts
            }
        });

        context7Process.stdout.on('data', (data) => {
            console.log(`[Context7 Bridge] ${data.toString().trim()}`);
        });

        context7Process.stderr.on('data', (data) => {
            console.log(`[Context7 Bridge Error] ${data.toString().trim()}`);
        });

        context7Process.on('exit', (code) => {
            console.log(`Context7 bridge exited with code ${code}`);
            this.mcpServers.delete('context7-bridge');
            
            // Auto-restart if bridge is still needed
            if (this.bridgeActive && this.reconnectAttempts < this.maxReconnects) {
                this.reconnectAttempts++;
                setTimeout(() => this.startContext7Bridge(), 5000);
            }
        });

        this.mcpServers.set('context7-bridge', context7Process);
        console.log('✅ Context7 Bridge running on port 8091');
    }

    async startRecallBridge() {
        console.log('🔍 Setting up Recall.js Bridge...');
        
        // Create a simple HTTP API for recall.js access
        const express = require('express');
        const app = express();
        
        app.use(express.json());
        
        // Recall endpoint that VS Code can access
        app.post('/api/recall', async (req, res) => {
            try {
                const { query, timeframe } = req.body;
                
                // Execute recall.js
                const { exec } = await import('child_process');
                const { promisify } = await import('util');
                const execAsync = promisify(exec);
                
                const result = await execAsync(`cd ${this.baseDir}/rEngine && node recall.js "${query}"`);
                
                res.json({
                    success: true,
                    query,
                    results: result.stdout,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    query: req.body.query
                });
            }
        });
        
        // Memory status endpoint
        app.get('/api/memory-status', async (req, res) => {
            try {
                const memoryPath = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
                const files = await fs.readdir(memoryPath);
                
                const status = {
                    memory_files: files,
                    bridge_active: this.bridgeActive,
                    mcp_servers: Array.from(this.mcpServers.keys()),
                    timestamp: new Date().toISOString()
                };
                
                res.json(status);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        const server = app.listen(8092, () => {
            console.log('✅ Recall Bridge API running on port 8092');
            console.log('📡 VS Code can now access recall.js via HTTP even if MCP disconnects');
        });
        
        this.mcpServers.set('recall-bridge', server);
    }

    startHealthMonitoring() {
        // Check VS Code MCP plugin status every 2 minutes
        setInterval(async () => {
            await this.checkVSCodeMCPStatus();
            
            // If plugin reconnected, can switch back to standby
            if (this.bridgeActive) {
                const memoryServerActive = await this.pingMCPServer('memory', 8080);
                const context7Active = await this.pingMCPServer('context7', 8081);
                
                if (memoryServerActive && context7Active) {
                    console.log('🔄 VS Code MCP plugin reconnected - bridge switching to standby');
                    this.bridgeActive = false;
                    this.reconnectAttempts = 0;
                }
            }
        }, 120000); // 2 minutes
        
        console.log('👁️  Bridge health monitoring active');
    }

    async shutdown() {
        console.log('🛑 Shutting down VS Code MCP Bridge...');
        
        for (const [name, process] of this.mcpServers.entries()) {
            console.log(`Stopping ${name}...`);
            
            if (process.kill) {
                process.kill('SIGTERM');
            } else if (process.close) {
                process.close();
            }
        }
        
        console.log('✅ Bridge shutdown complete');
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    if (global.bridge) {
        await global.bridge.shutdown();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    if (global.bridge) {
        await global.bridge.shutdown();
    }
    process.exit(0);
});

// Start the bridge
global.bridge = new VSCodeMCPBridge();

export default VSCodeMCPBridge;
