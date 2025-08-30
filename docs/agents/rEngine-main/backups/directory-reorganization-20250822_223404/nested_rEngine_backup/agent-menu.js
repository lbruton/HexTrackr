#!/usr/bin/env node

/**
 * Agent Menu Handler - Process numbered menu choices
 * Simplified interface for the agent initialization menu
 */

import AgentHelloWorkflow from './agent-hello-workflow.js';

const colors = {
    pink: '\x1b[95m',
    green: '\x1b[92m',
    blue: '\x1b[94m',
    yellow: '\x1b[93m',
    cyan: '\x1b[96m',
    reset: '\x1b[0m'
};

async function handleMenuChoice(choice) {
    const workflow = new AgentHelloWorkflow();
    
    console.log(`${colors.blue}🤖 Processing menu choice: ${choice}${colors.reset}\n`);
    
    // Initialize Memory Intelligence System first
    console.log(`${colors.cyan}🧠 Initializing Memory Intelligence System...${colors.reset}`);
    const memoryReady = await workflow.initializeMemorySystem();
    
    if (memoryReady) {
        console.log(`${colors.green}✅ Memory system ready for instant recall${colors.reset}\n`);
    } else {
        console.log(`${colors.yellow}⚠️  Memory system partially available${colors.reset}\n`);
    }
    
    switch (choice) {
        case '1':
            console.log(`${colors.green}🔄 **Continue where we left off**${colors.reset}`);
            console.log(`${colors.blue}✅ Agent context loaded and ready to continue.${colors.reset}`);
            console.log(`${colors.yellow}💡 You can now proceed with your development tasks!${colors.reset}`);
            if (memoryReady) {
                console.log(`${colors.cyan}🔍 Memory commands available - use fast recall for instant context${colors.reset}`);
            }
            break;
            
        case '2':
            console.log(`${colors.green}🆕 **Start fresh session**${colors.reset}`);
            console.log(`${colors.blue}✅ Previous memories remain available for reference.${colors.reset}`);
            console.log(`${colors.yellow}💡 Ready for new tasks and objectives!${colors.reset}`);
            break;
            
        case '3':
            console.log(`${colors.green}📊 **Detailed context summary**${colors.reset}`);
            try {
                const initResult = await workflow.initializeAgent();
                if (initResult.hasContext && initResult.detailedContext) {
                    const detailedContext = workflow.generateDetailedContext(
                        initResult.detailedContext.latestHandoff,
                        initResult.detailedContext.personalMemories,
                        initResult.detailedContext.mcpMemories,
                        initResult.detailedContext.knowledgeDB
                    );
                    console.log(detailedContext);
                } else {
                    console.log(`${colors.yellow}ℹ️  No detailed context available${colors.reset}`);
                }
            } catch (error) {
                console.log(`${colors.yellow}⚠️  Error loading detailed context: ${error.message}${colors.reset}`);
            }
            break;
            
        case '4':
            console.log(`${colors.green}🔍 **Memory search mode**${colors.reset}`);
            if (memoryReady) {
                await workflow.showMemoryCommands();
            } else {
                console.log(`${colors.blue}To search memories, use: node agent-hello-workflow.js search "your query"${colors.reset}`);
                console.log(`${colors.yellow}Example: node agent-hello-workflow.js search "scribe console"${colors.reset}`);
            }
            break;
            
        default:
            console.log(`${colors.yellow}❓ Unknown choice: ${choice}${colors.reset}`);
            console.log(`${colors.blue}Valid choices: 1, 2, 3, 4${colors.reset}`);
            console.log(`${colors.green}🎯 Defaulting to continue mode...${colors.reset}`);
            console.log(`${colors.blue}✅ Agent ready to assist with your tasks!${colors.reset}`);
            break;
    }
    
    console.log(`\n${colors.cyan}🚀 Agent system ready! You can continue your work.${colors.reset}`);
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const choice = process.argv[2];
    if (!choice) {
        console.log('Usage: node agent-menu.js [1|2|3|4]');
        console.log('  1 - Continue where we left off');
        console.log('  2 - Start fresh');
        console.log('  3 - Show detailed context');
        console.log('  4 - Memory search info');
        process.exit(1);
    }
    
    await handleMenuChoice(choice);
}

export default handleMenuChoice;
