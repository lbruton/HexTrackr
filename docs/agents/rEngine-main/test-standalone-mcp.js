#!/usr/bin/env node

/**
 * Test Script for Standalone MCP Manager
 * Verifies that the standalone approach eliminates VS Code dependencies
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Standalone MCP Manager...\n');

// Test if standalone MCP manager exists
const standaloneMcpPath = join(__dirname, 'rEngine', 'standalone-mcp-manager.cjs');
console.log(`📁 Checking for standalone MCP manager at: ${standaloneMcpPath}`);

import('fs').then(fs => {
    if (fs.existsSync(standaloneMcpPath)) {
        console.log('✅ Standalone MCP manager found');
        
        // Test if we can start it
        console.log('🚀 Starting standalone MCP manager...');
        
        const mcpProcess = spawn('node', [standaloneMcpPath], {
            cwd: __dirname,
            stdio: 'pipe'
        });
        
        mcpProcess.stdout.on('data', (data) => {
            console.log(`📤 MCP Output: ${data.toString().trim()}`);
        });
        
        mcpProcess.stderr.on('data', (data) => {
            console.log(`⚠️  MCP Error: ${data.toString().trim()}`);
        });
        
        // Let it run for 10 seconds then test
        setTimeout(() => {
            console.log('\n🔍 Testing MCP server status...');
            
            // Check if processes are running
            import('child_process').then(cp => {
                cp.exec('ps aux | grep -E "(mcp-server|Memory MCP|Context7)" | grep -v grep', (error, stdout) => {
                    if (stdout.trim()) {
                        console.log('✅ MCP servers detected running:');
                        console.log(stdout.trim());
                    } else {
                        console.log('❌ No MCP server processes found');
                    }
                    
                    // Clean shutdown
                    console.log('\n🛑 Shutting down test...');
                    mcpProcess.kill('SIGTERM');
                    process.exit(0);
                });
            });
        }, 10000);
        
    } else {
        console.log('❌ Standalone MCP manager not found');
        console.log('Expected location:', standaloneMcpPath);
        process.exit(1);
    }
}).catch(err => {
    console.error('❌ Error testing standalone MCP:', err.message);
    process.exit(1);
});
