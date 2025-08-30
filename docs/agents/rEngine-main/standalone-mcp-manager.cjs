#!/usr/bin/env node

/**
 * Standalone MCP Manager - No VS Code Extensions Required
 * 
 * Runs MCP servers as standalone services that your scripts can connect to
 * Eliminates the need for any VS Code MCP extensions
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

class StandaloneMCPManager {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.logDir = path.join(this.baseDir, 'logs');
        this.mcpServers = new Map();
        this.isShuttingDown = false;
        
        // Ensure log directory exists
        fs.ensureDirSync(this.logDir);
        
        console.log('🚀 Standalone MCP Manager Starting...');
        this.initialize();
    }
    
    async initialize() {
        // Start all MCP servers as standalone services
        await this.startAllServers();
        
        // Set up graceful shutdown
        this.setupGracefulShutdown();
        
        // Monitor server health
        this.startHealthMonitoring();
        
        console.log('\n✅ All MCP servers running as standalone services!');
        console.log('📋 Available for your scripts to connect to:');
        console.log('   • Memory MCP Server (knowledge graph)');
        console.log('   • Context7 MCP Server (long-term context)');
        console.log('   • Local memory scripts (no MCP needed)');
        console.log('\n🔧 To stop: Ctrl+C or send SIGTERM');
        
        // Keep the process alive
        this.keepAlive();
    }
    
    async startAllServers() {
        console.log('\n🔧 Starting standalone MCP servers...');
        
        // Start Memory MCP Server
        await this.startServer('memory', {
            name: 'Memory MCP Server',
            command: 'npx',
            args: ['@modelcontextprotocol/server-memory'],
            description: 'Knowledge graph and persistent memory'
        });
        
        // Start Context7 MCP Server  
        await this.startServer('context7', {
            name: 'Context7 MCP Server',
            command: 'npx',
            args: ['@upstash/context7-mcp'],
            description: 'Long-term context management'
        });
        
        console.log('\n📊 MCP servers running independently');
        console.log('   Your local scripts can use:');
        console.log('   • node rEngine/memory-intelligence.js search "query"');
        console.log('   • node rEngine/dual-memory-writer.js agent "title" "content"');
        console.log('   • node rEngine/enhanced-agent-init.js');
    }
    
    async startServer(id, config) {
        try {
            console.log(`   Starting ${config.name}...`);
            
            const logFile = path.join(this.logDir, `standalone-mcp-${id}.log`);
            const logStream = fs.createWriteStream(logFile, { flags: 'a' });
            
            const serverProcess = spawn(config.command, config.args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: this.baseDir,
                env: { ...process.env, NODE_ENV: 'production' }
            });
            
            // Log server output
            serverProcess.stdout?.on('data', (data) => {
                logStream.write(`[STDOUT] ${data}`);
            });
            
            serverProcess.stderr?.on('data', (data) => {
                logStream.write(`[STDERR] ${data}`);
                // Only log errors, not normal startup messages
                const message = data.toString().trim();
                if (message.includes('ERROR') || message.includes('FATAL')) {
                    console.log(`      ⚠️  ${config.name}: ${message}`);
                }
            });
            
            serverProcess.on('exit', (code, signal) => {
                logStream.end();
                if (!this.isShuttingDown) {
                    console.log(`❌ ${config.name} exited unexpectedly (code: ${code}, signal: ${signal})`);
                    // Auto-restart after 5 seconds
                    setTimeout(() => this.startServer(id, config), 5000);
                }
            });
            
            serverProcess.on('error', (error) => {
                console.error(`❌ ${config.name} error:`, error.message);
                logStream.write(`[ERROR] ${error.message}\n`);
            });
            
            this.mcpServers.set(id, {
                process: serverProcess,
                config,
                logStream,
                startTime: new Date()
            });
            
            console.log(`      ✅ ${config.name} started (PID: ${serverProcess.pid})`);
            
        } catch (error) {
            console.error(`❌ Failed to start ${config.name}:`, error.message);
        }
    }
    
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}, shutting down MCP servers...`);
            this.isShuttingDown = true;
            
            for (const [id, server] of this.mcpServers) {
                console.log(`   Stopping ${server.config.name}...`);
                server.logStream.end();
                server.process.kill('SIGTERM');
                
                // Give process 5 seconds to shut down gracefully
                setTimeout(() => {
                    if (!server.process.killed) {
                        server.process.kill('SIGKILL');
                    }
                }, 5000);
            }
            
            console.log('✅ All MCP servers stopped');
            process.exit(0);
        };
        
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('beforeExit', () => shutdown('beforeExit'));
    }
    
    startHealthMonitoring() {
        // Check server health every 30 seconds
        setInterval(() => {
            if (this.isShuttingDown) return;
            
            const runningCount = Array.from(this.mcpServers.values())
                .filter(server => !server.process.killed).length;
                
            if (runningCount < this.mcpServers.size) {
                console.log(`⚠️  Health check: ${runningCount}/${this.mcpServers.size} servers running`);
            }
        }, 30000);
    }
    
    keepAlive() {
        // Keep the process running
        setInterval(() => {
            // Do nothing, just keep alive
        }, 10000);
    }
    
    getStatus() {
        const status = {
            timestamp: new Date().toISOString(),
            servers: {}
        };
        
        for (const [id, server] of this.mcpServers) {
            status.servers[id] = {
                name: server.config.name,
                pid: server.process.pid,
                running: !server.process.killed,
                uptime: Date.now() - server.startTime.getTime(),
                description: server.config.description
            };
        }
        
        return status;
    }
}

// CLI interface
if (require.main === module) {
    const manager = new StandaloneMCPManager();
    
    // Handle status requests
    if (process.argv.includes('--status')) {
        setTimeout(() => {
            console.log('\n📊 MCP Server Status:');
            console.log(JSON.stringify(manager.getStatus(), null, 2));
        }, 2000);
    }
}

module.exports = StandaloneMCPManager;
