#!/usr/bin/env node

/**
 * rEngine Command Client
 * Sends commands to the rEngine MCP server for execution.
 */

import fetch from 'node-fetch';

const RENGINE_URL = 'http://localhost:3034';

async function sendCommand(command, args = {}) {
    const url = `${RENGINE_URL}/command`;
    const payload = {
        command,
        args,
        timestamp: new Date().toISOString()
    };

    console.log(`Sending command to rEngine: ${command}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const result = await response.json();
        console.log('rEngine response:', result);
        return result;
    } catch (error) {
        console.error('Failed to send command to rEngine:', error.message);
        throw error;
    }
}

async function main() {
    const [command, ...args] = process.argv.slice(2);

    if (!command) {
        console.log('Usage: node rengine-client.js <command> [args...]');
        console.log('Example: node rengine-client.js git-checkpoint "feat: implemented new client"');
        process.exit(1);
    }

    // Simple arg parsing, assumes args are key=value or just values
    const parsedArgs = {};
    const valueArgs = [];
    args.forEach(arg => {
        if (arg.includes('=')) {
            const [key, value] = arg.split('=');
            parsedArgs[key] = value;
        } else {
            valueArgs.push(arg);
        }
    });
    
    if(valueArgs.length > 0) {
        parsedArgs.values = valueArgs;
    }

    await sendCommand(command, parsedArgs);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(err => {
        console.error(`Command failed: ${err.message}`);
        process.exit(1);
    });
}

export { sendCommand };
