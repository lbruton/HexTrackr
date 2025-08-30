#!/usr/bin/env node

/**
 * Enhanced Context Entry Tool with MCP Integration
 * Usage: 
 *   Interactive: node add-context.js
 *   Direct: node add-context.js "title" "description" [type]
 *   MCP Mode: echo '{"type":"context_entry","title":"...","content":"...","category":"..."}' | node add-context.js --mcp-mode
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
    pink: '\x1b[95m',
    green: '\x1b[92m',
    blue: '\x1b[94m',
    yellow: '\x1b[93m',
    cyan: '\x1b[96m',
    red: '\x1b[91m',
    reset: '\x1b[0m'
};

// Check for MCP mode
const isMCPMode = process.argv.includes('--mcp-mode');

async function addContextEntry(title, description, entryType = 'general') {
    const baseDir = path.dirname(__dirname);
    const extendedContextPath = path.join(baseDir, 'rMemory', 'rAgentMemories', 'extendedcontext.json');
    
    try {
        // Load existing context
        let extendedContext = {};
        try {
            const data = await fs.readFile(extendedContextPath, 'utf8');
            extendedContext = JSON.parse(data);
        } catch (error) {
            extendedContext = {
                metadata: {
                    created: new Date().toISOString().split('T')[0],
                    last_updated: new Date().toISOString().split('T')[0],
                    version: "1.0.0",
                    purpose: "Persistent memory storage for important discussions and long-term context"
                },
                sessions: {}
            };
        }
        
        // Update metadata
        extendedContext.metadata.last_updated = new Date().toISOString().split('T')[0];
        
        // Ensure sessions object exists
        if (!extendedContext.sessions) {
            extendedContext.sessions = {};
        }
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Ensure today's session exists
        if (!extendedContext.sessions[today]) {
            extendedContext.sessions[today] = [];
        }
        
        // Create manual entry session
        const manualEntry = {
            session_id: `manual-${Date.now()}`,
            start_time: new Date().toISOString(),
            summary: title,
            activities: [
                {
                    timestamp: new Date().toLocaleTimeString('en-US', { 
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    type: entryType.toUpperCase(),
                    message: description,
                    full: `${entryType.toUpperCase()} - ${description}`,
                    isoTimestamp: new Date().toISOString()
                }
            ],
            key_events: [
                {
                    timestamp: new Date().toLocaleTimeString('en-US', { 
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    type: entryType.toUpperCase(),
                    message: description,
                    full: `${entryType.toUpperCase()} - ${description}`,
                    isoTimestamp: new Date().toISOString()
                }
            ],
            last_updated: new Date().toISOString()
        };
        
        extendedContext.sessions[today].push(manualEntry);
        
        // Write back to file WITH VISIBLE NOTIFICATION
        await fs.writeFile(extendedContextPath, JSON.stringify(extendedContext, null, 2));
        
        // ALWAYS show memory write notifications for user confidence
        console.log(`\x1b[95m📝 MEMORY WRITE: \x1b[92mextendedcontext.json\x1b[0m`);
        console.log(`\x1b[94m   Operation: add_context\x1b[0m`);
        console.log(`\x1b[93m   Entry: "${title}" (${entryType})\x1b[0m`);
        console.log(`\x1b[92m✅ MEMORY SAVED SUCCESSFULLY\x1b[0m\n`);
        
        // Standard output for backwards compatibility
        if (!isMCPMode) {
            console.log(`✅ Added context entry: "${title}"`);
            console.log(`📅 Date: ${today}`);
            console.log(`🏷️  Type: ${entryType}`);
            console.log(`📝 Description: ${description}`);
        }
        
    } catch (error) {
        if (!isMCPMode) {
            console.error(`❌ Failed to add context entry: ${error.message}`);
        }
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        // Handle MCP mode - read from stdin
        if (isMCPMode) {
            let inputData = '';
            process.stdin.on('data', (chunk) => {
                inputData += chunk;
            });
            process.stdin.on('end', async () => {
                try {
                    const mcpData = JSON.parse(inputData);
                    await addContextEntry(mcpData.title, mcpData.content, mcpData.category);
                    // No console output in MCP mode to avoid popups
                    process.exit(0);
                } catch (error) {
                    process.exit(1);
                }
            });
            return;
        }
        
        const title = process.argv[2];
        const description = process.argv[3];
        const type = process.argv[4] || 'manual_entry';
        
        if (!title || !description) {
            console.log('Usage: node add-context.js "title" "description" [type]');
            console.log('       echo \'{"title":"...","content":"...","category":"..."}\' | node add-context.js --mcp-mode');
            console.log('');
            console.log('Examples:');
            console.log('  node add-context.js "Menu System Fix" "Fixed agent menu interaction by creating agent-menu.js for direct numbered commands" "fix"');
            console.log('  node add-context.js "Split Console Implementation" "Created enhanced scribe console with Hello Kitty art and dual-pane display" "feature"');
            console.log('  node add-context.js "External Terminal Setup" "Auto-launching macOS Terminal with AppleScript for dedicated monitoring" "setup"');
            process.exit(1);
        }
        
        await addContextEntry(title, description, type);
    })();
}
