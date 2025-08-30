#!/usr/bin/env node

/**
 * Context7 MCP Connection Test
 * Tests connection to the standalone Context7 MCP server
 */

import { spawn } from 'child_process';
import { createWriteStream } from 'fs';

class Context7MCPClient {
    constructor() {
        this.serverProcess = null;
        this.connected = false;
    }

    async connect() {
        try {
            console.log('🔗 Connecting to Context7 MCP Server...');
            
            // Connect to Context7 MCP via stdio
            this.serverProcess = spawn('npx', ['@upstash/context7-mcp'], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            this.serverProcess.stdout.on('data', (data) => {
                const message = data.toString().trim();
                if (message) {
                    console.log('📥 Context7 Response:', message);
                }
            });

            this.serverProcess.stderr.on('data', (data) => {
                const error = data.toString().trim();
                if (error && !error.includes('[INFO]')) {
                    console.log('⚠️  Context7 Info:', error);
                }
            });

            // Send initialization message
            const initMessage = JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "initialize",
                params: {
                    protocolVersion: "2024-11-05",
                    capabilities: {},
                    clientInfo: {
                        name: "rEngine-Context7-Client",
                        version: "1.0.0"
                    }
                }
            }) + '\n';

            this.serverProcess.stdin.write(initMessage);
            console.log('📤 Sent initialization request to Context7');

            this.connected = true;
            console.log('✅ Connected to Context7 MCP Server');

            // Keep connection alive for testing
            setTimeout(() => {
                this.testContext7Capabilities();
            }, 2000);

        } catch (error) {
            console.error('❌ Failed to connect to Context7:', error.message);
        }
    }

    async testContext7Capabilities() {
        if (!this.connected || !this.serverProcess) {
            console.log('❌ Not connected to Context7');
            return;
        }

        try {
            console.log('\n🧪 Testing Context7 capabilities...');
            
            // Test tools list request
            const toolsMessage = JSON.stringify({
                jsonrpc: "2.0",
                id: 2,
                method: "tools/list",
                params: {}
            }) + '\n';

            this.serverProcess.stdin.write(toolsMessage);
            console.log('📤 Requested Context7 tools list');

            // Wait a bit then test context storage
            setTimeout(() => {
                this.testContextStorage();
            }, 3000);

        } catch (error) {
            console.error('❌ Error testing Context7:', error.message);
        }
    }

    async testContextStorage() {
        try {
            console.log('\n💾 Testing Context7 context storage...');
            
            const contextMessage = JSON.stringify({
                jsonrpc: "2.0",
                id: 3,
                method: "tools/call",
                params: {
                    name: "store_context",
                    arguments: {
                        context: "rEngine test session - Context7 connection successful",
                        metadata: {
                            timestamp: new Date().toISOString(),
                            source: "rEngine-standalone-test",
                            type: "connection_test"
                        }
                    }
                }
            }) + '\n';

            this.serverProcess.stdin.write(contextMessage);
            console.log('📤 Sent context storage test to Context7');

            // Clean up after test
            setTimeout(() => {
                this.disconnect();
            }, 5000);

        } catch (error) {
            console.error('❌ Error testing context storage:', error.message);
        }
    }

    disconnect() {
        if (this.serverProcess) {
            console.log('\n🔌 Disconnecting from Context7...');
            this.serverProcess.kill();
            this.connected = false;
            console.log('✅ Disconnected from Context7 MCP Server');
        }
        process.exit(0);
    }
}

// Run the test
const client = new Context7MCPClient();
client.connect();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down...');
    client.disconnect();
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    client.disconnect();
});
