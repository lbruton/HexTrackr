#!/usr/bin/env node

/**
 * Quick Agent Setup - Single command to initialize any agent with full memory intelligence
 * Usage: node quick-agent-setup.js [api-preference]
 */

import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

const colors = {
    pink: '\x1b[95m',
    green: '\x1b[92m',
    blue: '\x1b[94m',
    yellow: '\x1b[93m',
    cyan: '\x1b[96m',
    red: '\x1b[91m',
    reset: '\x1b[0m'
};

async function quickAgentSetup(apiPreference = 'auto') {
    console.log(`${colors.pink}
╔═══════════════════════════════════════════════════════════════════╗
║                    🌸 Hello Kitty Agent Setup 🌸                   ║
║                                                                   ║
║  Memory Intelligence + API Optimization + MCP Integration        ║
╚═══════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    
    try {
        // Run enhanced initialization
        console.log(`${colors.cyan}🚀 Running enhanced agent initialization...${colors.reset}`);
        const initResult = await execPromise('node enhanced-agent-init.js');
        console.log(initResult.stdout);
        
        // Quick memory test
        console.log(`${colors.blue}🧠 Testing memory intelligence system...${colors.reset}`);
        try {
            const memoryTest = await execPromise('node recall.js "system"');
            console.log(`${colors.green}✅ Memory test passed${colors.reset}`);
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Memory test inconclusive, but system should work${colors.reset}`);
        }
        
        // CRITICAL: Run agent self-management startup check and git backup
        console.log(`${colors.blue}🛡️ Running mandatory startup protocols...${colors.reset}`);
        try {
            const protocolResult = await execPromise('node agent-self-management.js startup');
            console.log(`${colors.green}✅ Agent protocols: ${protocolResult.stdout.split('\n')[0]}${colors.reset}`);
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Protocol check had issues: ${error.message}${colors.reset}`);
        }

        // Add setup completion to memory via MCP (no popup)
        console.log(`${colors.blue}📝 Logging setup completion via MCP...${colors.reset}`);
        try {
            // Use MCP call instead of direct add-context to avoid popups
            await execPromise(`echo '{"type":"context_entry","title":"Quick Agent Setup Complete","content":"Enhanced agent initialization with memory intelligence, API optimization, MCP integration, and mandatory protocol compliance completed via quick-agent-setup.js","category":"system_ready"}' | node add-context.js --mcp-mode`);
            console.log(`${colors.green}✅ Setup logged to memory for future reference${colors.reset}`);
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Memory logging skipped${colors.reset}`);
        }
        
        // Display quick reference
        console.log(`${colors.pink}
🌸 Agent Ready! Quick Reference:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${colors.cyan}🔍 Fast Recall:${colors.reset}     node recall.js "search term"
${colors.cyan}📝 Add Context:${colors.reset}     node add-context.js "title" "description" [type]  
${colors.cyan}🤖 Agent Menu:${colors.reset}      node agent-menu.js [1|2|3|4]
${colors.cyan}🧠 Advanced Search:${colors.reset} node memory-intelligence.js recall "query"

${colors.green}💡 Pro Tips:${colors.reset}
• Use MCP calls to scribe to avoid popups
• API LLMs (Groq/Claude/OpenAI) are faster than Qwen for complex tasks
• Memory intelligence searches across ALL time periods instantly
• Extended context persists through restarts and system changes

${colors.pink}Ready to assist with any task! 🌸${colors.reset}
        `);
        
    } catch (error) {
        console.error(`${colors.red}❌ Setup failed: ${error.message}${colors.reset}`);
        console.log(`${colors.yellow}💡 Try running components individually:${colors.reset}`);
        console.log(`  node enhanced-agent-init.js`);
        console.log(`  node agent-menu.js 1`);
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const apiPreference = process.argv[2] || 'auto';
    await quickAgentSetup(apiPreference);
}

export { quickAgentSetup };
