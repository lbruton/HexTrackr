#!/usr/bin/env node

/**
 * Enhanced Context Entry Tool with MCP Integration
 * Usage: 
 *   Interactive: node add-context.js
 *   Direct: node add-context.js "title" "description" [type]
 */

import readline from 'readline';
import { addMemory } from './mcp-client.js';

const colors = {
    pink: '\x1b[95m',
    green: '\x1b[92m',
    blue: '\x1b[94m',
    yellow: '\x1b[93m',
    cyan: '\x1b[96m',
    red: '\x1b[91m',
    reset: '\x1b[0m'
};

async function addContextEntry(title, description, entryType = 'general') {
    try {
        console.log(`${colors.blue}Submitting to MCP Memory Server...${colors.reset}`);
        await addMemory(title, description, entryType);
        console.log(`${colors.green}✔ Context successfully submitted to memory.${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}Failed to add context to memory:${colors.reset}`, error);
        process.exit(1);
    }
}

async function interactiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

    try {
        console.log(`${colors.cyan}--- Interactive Memory Entry ---${colors.reset}`);
        const title = await prompt(`${colors.yellow}Enter Title: ${colors.reset}`);
        const description = await prompt(`${colors.yellow}Enter Description: ${colors.reset}`);
        const entryType = await prompt(`${colors.yellow}Enter Type (default: general): ${colors.reset}`) || 'general';

        await addContextEntry(title, description, entryType);
    } finally {
        rl.close();
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        await interactiveMode();
    } else if (args.length >= 2) {
        const [title, description, entryType] = args;
        await addContextEntry(title, description, entryType);
    } else {
        console.log(`${colors.red}Usage: node add-context.js "title" "description" [type]${colors.reset}`);
        console.log(`${colors.red}Or run interactively: node add-context.js${colors.reset}`);
        process.exit(1);
    }
}

main().catch(err => {
    console.error(`${colors.red}An unexpected error occurred: ${err.message}${colors.reset}`);
    process.exit(1);
});