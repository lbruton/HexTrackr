#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Simple MCP Test Manager');
console.log(`Current directory: ${process.cwd()}`);
console.log(`Script directory: ${__dirname}`);

// Just test running the MCP server directly
console.log('Testing direct MCP server start...');

try {
    const process = spawn('npx', ['@modelcontextprotocol/server-memory'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    console.log(`✅ MCP Memory server started (PID: ${process.pid})`);
    
    process.stdout.on('data', (data) => {
        console.log(`[STDOUT] ${data}`);
    });
    
    process.stderr.on('data', (data) => {
        console.log(`[STDERR] ${data}`);
    });
    
    // Stop after 10 seconds for testing
    setTimeout(() => {
        console.log('🛑 Stopping test server...');
        process.kill();
        process.exit(0);
    }, 10000);
    
} catch (error) {
    console.error('❌ Failed to start MCP server:', error);
}
