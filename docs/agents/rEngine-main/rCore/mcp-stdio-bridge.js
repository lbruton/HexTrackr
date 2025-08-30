#!/usr/bin/env node

/**
 * MCP STDIO Bridge - Connects VS Code to our integrated MCP servers
 * 
 * This bridge allows VS Code to communicate with our locally managed MCP servers
 * without needing VS Code extensions or complex configuration
 */

const { spawn } = require("child_process");

class MCPSTDIOBridge {
    constructor(serverType) {
        this.serverType = serverType;
        this.serverProcess = null;
        
        // Server configurations
        this.serverConfigs = {
            memory: {
                command: "npx",
                args: ["@modelcontextprotocol/server-memory"]
            },
            context7: {
                command: "npx",
                args: ["@upstash/context7-mcp"]
            },
            filesystem: {
                command: "npx",
                args: ["@modelcontextprotocol/server-filesystem", process.cwd()]
            }
        };
        
        this.startServer();
    }
    
    startServer() {
        const config = this.serverConfigs[this.serverType];
        
        if (!config) {
            console.error(`Unknown server type: ${this.serverType}`);
            process.exit(1);
        }
        
        // Start the MCP server
        this.serverProcess = spawn(config.command, config.args, {
            stdio: ["pipe", "pipe", "pipe"],
            env: process.env
        });
        
        // Pipe VS Code's stdin to server's stdin
        process.stdin.pipe(this.serverProcess.stdin);
        
        // Pipe server's stdout to VS Code's stdout
        this.serverProcess.stdout.pipe(process.stdout);
        
        // Log errors but don't pipe to stdout (would interfere with MCP protocol)
        this.serverProcess.stderr.on("data", (data) => {
            console.error(`[${this.serverType}] ${data.toString()}`);
        });
        
        // Handle server exit
        this.serverProcess.on("exit", (code, signal) => {
            process.exit(code || 0);
        });
        
        // Handle bridge exit
        process.on("exit", () => {
            if (this.serverProcess && !this.serverProcess.killed) {
                this.serverProcess.kill();
            }
        });
        
        process.on("SIGINT", () => {
            if (this.serverProcess) {
                this.serverProcess.kill("SIGINT");
            }
            process.exit(0);
        });
        
        process.on("SIGTERM", () => {
            if (this.serverProcess) {
                this.serverProcess.kill("SIGTERM");
            }
            process.exit(0);
        });
    }
}

// Get server type from command line argument
const serverType = process.argv[2];

if (!serverType) {
    console.error("Usage: node mcp-stdio-bridge.js <server-type>");
    console.error("Available types: memory, context7, filesystem");
    process.exit(1);
}

new MCPSTDIOBridge(serverType);
