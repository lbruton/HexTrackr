#!/usr/bin/env node

/**
 * Integrated MCP Server Manager - Zero Configuration
 * 
 * Starts all MCP servers locally and provides them to VS Code through a unified interface
 * Eliminates the need for VS Code MCP extensions and manual configuration
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs-extra");

class IntegratedMCPManager {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.logDir = path.join(this.baseDir, "logs");
        this.mcpServers = new Map();
        this.isShuttingDown = false;
        
        // Get the correct path to this script's directory
        this.scriptDir = __dirname;
        
        // Ensure log directory exists
        fs.ensureDirSync(this.logDir);
        
        // MCP Server configurations
        this.serverConfigs = {
            memory: {
                name: "Memory Server",
                command: "npx",
                args: ["@modelcontextprotocol/server-memory"],
                description: "Knowledge graph and persistent memory",
                stdio: ["pipe", "pipe", "pipe"]
            },
            context7: {
                name: "Context7 Server",
                command: "npx",
                args: ["@upstash/context7-mcp"],
                description: "Long-term context management",
                stdio: ["pipe", "pipe", "pipe"]
            },
            filesystem: {
                name: "Filesystem Server",
                command: "npx",
                args: ["@modelcontextprotocol/server-filesystem", this.baseDir],
                description: "File system access and management",
                stdio: ["pipe", "pipe", "pipe"]
            }
        };
        
        console.log("🚀 Integrated MCP Manager Starting...");
        this.initialize();
    }
    
    async initialize() {
        // Create VS Code settings for direct stdio communication
        await this.createVSCodeSettings();
        
        // Start all MCP servers
        await this.startAllServers();
        
        // Set up graceful shutdown
        this.setupGracefulShutdown();
        
        // Monitor server health
        this.startHealthMonitoring();
        
        console.log("\n✅ All MCP servers running and ready!");
        console.log("📋 Available tools in VS Code Copilot:");
        console.log("   • mcp_memory_* (knowledge graph operations)");
        console.log("   • mcp_context7_* (long-term context)");
        console.log("   • mcp_filesystem_* (file operations)");
        console.log("\n🔧 To stop: Ctrl+C or send SIGTERM");
    }
    
    async createVSCodeSettings() {
        const vscodeDir = path.join(this.baseDir, ".vscode");
        const settingsFile = path.join(vscodeDir, "settings.json");
        
        await fs.ensureDir(vscodeDir);
        
        // Create settings that point to our integrated servers
        const settings = {
            "mcp.servers": {
                "integrated-memory": {
                    "command": "node",
                    "args": [path.join(this.scriptDir, "mcp-stdio-bridge.js"), "memory"],
                    "disabled": false
                },
                "integrated-context7": {
                    "command": "node", 
                    "args": [path.join(this.scriptDir, "mcp-stdio-bridge.js"), "context7"],
                    "disabled": false
                },
                "integrated-filesystem": {
                    "command": "node",
                    "args": [path.join(this.scriptDir, "mcp-stdio-bridge.js"), "filesystem"], 
                    "disabled": false
                }
            },
            "mcp.logging.level": "info",
            "files.associations": {
                "*.json": "jsonc"
            }
        };
        
        await fs.writeJson(settingsFile, settings, { spaces: 2 });
        console.log("✅ Updated VS Code settings for integrated MCP servers");
    }
    
    async startAllServers() {
        console.log("\n🔧 Starting MCP servers...");
        
        for (const [id, config] of Object.entries(this.serverConfigs)) {
            await this.startServer(id, config);
            // Small delay between starts
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    async startServer(id, config) {
        try {
            console.log(`   Starting ${config.name}...`);
            
            const logFile = path.join(this.logDir, `mcp-${id}.log`);
            const logStream = fs.createWriteStream(logFile, { flags: "a" });
            
            const process = spawn(config.command, config.args, {
                stdio: config.stdio,
                cwd: this.baseDir,
                env: { ...process.env, NODE_ENV: "production" }
            });
            
            // Log server output
            process.stdout?.on("data", (data) => {
                logStream.write(`[STDOUT] ${data}`);
            });
            
            process.stderr?.on("data", (data) => {
                logStream.write(`[STDERR] ${data}`);
                console.log(`      ⚠️  ${config.name}: ${data.toString().trim()}`);
            });
            
            process.on("exit", (code, signal) => {
                logStream.end();
                if (!this.isShuttingDown) {
                    console.log(`❌ ${config.name} exited unexpectedly (code: ${code}, signal: ${signal})`);
                    // Auto-restart after 5 seconds
                    setTimeout(() => this.startServer(id, config), 5000);
                }
            });
            
            process.on("error", (error) => {
                console.error(`❌ ${config.name} error:`, error.message);
                logStream.write(`[ERROR] ${error.message}\n`);
            });
            
            this.mcpServers.set(id, {
                process,
                config,
                logStream,
                startTime: new Date()
            });
            
            console.log(`      ✅ ${config.name} started (PID: ${process.pid})`);
            
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
                server.process.kill("SIGTERM");
                
                // Give process 5 seconds to shut down gracefully
                setTimeout(() => {
                    if (!server.process.killed) {
                        server.process.kill("SIGKILL");
                    }
                }, 5000);
            }
            
            console.log("✅ All MCP servers stopped");
            process.exit(0);
        };
        
        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("beforeExit", () => shutdown("beforeExit"));
    }
    
    startHealthMonitoring() {
        // Check server health every 30 seconds
        setInterval(() => {
            if (this.isShuttingDown) {return;}
            
            const runningCount = Array.from(this.mcpServers.values())
                .filter(server => !server.process.killed).length;
                
            if (runningCount < this.mcpServers.size) {
                console.log(`⚠️  Health check: ${runningCount}/${this.mcpServers.size} servers running`);
            }
        }, 30000);
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
    const manager = new IntegratedMCPManager();
    
    // Handle status requests
    if (process.argv.includes("--status")) {
        setTimeout(() => {
            console.log("\n📊 MCP Server Status:");
            console.log(JSON.stringify(manager.getStatus(), null, 2));
        }, 2000);
    }
}

module.exports = IntegratedMCPManager;
