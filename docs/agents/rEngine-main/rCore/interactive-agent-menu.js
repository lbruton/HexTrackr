#!/usr/bin/env node

/**
 * Interactive Agent Menu - Wait for user input and process menu choices
 * Provides interactive interface for agent memory system
 */

import readline from 'readline';
import AgentHelloWorkflow from './agent-hello-workflow.js';

const colors = {
    pink: '\x1b[95m',
    green: '\x1b[92m',
    blue: '\x1b[94m',
    yellow: '\x1b[93m',
    cyan: '\x1b[96m',
    reset: '\x1b[0m'
};

class InteractiveAgentMenu {
    constructor() {
        this.workflow = new AgentHelloWorkflow();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        console.log(`${colors.pink}🧠 Interactive Agent Menu${colors.reset}\n`);
        
        // Initialize and show the menu
        const result = await this.workflow.initializeAgent();
        console.log(result.continuationPrompt);
        console.log();
        
        // Wait for user input
        this.promptUser();
    }

    promptUser() {
        this.rl.question(`${colors.cyan}➤ Enter your choice (1-4) or type your request: ${colors.reset}`, async (input) => {
            await this.processInput(input.trim());
        });
    }

    async processInput(input) {
        console.log(); // Add spacing
        
        switch (input) {
            case '1':
                console.log(`${colors.green}🔄 Continuing where we left off...${colors.reset}`);
                console.log(`${colors.blue}✅ Agent ready to continue previous work context.${colors.reset}`);
                console.log(`${colors.yellow}💡 You can now proceed with your development tasks!${colors.reset}`);
                break;
                
            case '2':
                console.log(`${colors.green}🆕 Starting fresh session...${colors.reset}`);
                console.log(`${colors.blue}✅ Previous memories remain available for reference.${colors.reset}`);
                console.log(`${colors.yellow}💡 Ready for new tasks and objectives!${colors.reset}`);
                break;
                
            case '3':
                console.log(`${colors.green}📊 Generating detailed context summary...${colors.reset}`);
                await this.showDetailedContext();
                break;
                
            case '4':
                console.log(`${colors.green}🔍 Memory search mode activated...${colors.reset}`);
                await this.searchMemories();
                return; // Return to avoid asking for another choice
                
            case 'exit':
            case 'quit':
            case 'q':
                console.log(`${colors.pink}👋 Goodbye! Agent system remains active.${colors.reset}`);
                this.rl.close();
                return;
                
            default:
                console.log(`${colors.green}📝 Processing custom request: "${input}"${colors.reset}`);
                console.log(`${colors.blue}✅ Request noted. You can now work on this task.${colors.reset}`);
                console.log(`${colors.yellow}💡 Agent memory system is ready to assist!${colors.reset}`);
                break;
        }
        
        console.log();
        console.log(`${colors.yellow}Press Enter to return to main menu, or type 'exit' to quit...${colors.reset}`);
        this.rl.question('', () => {
            console.clear();
            this.start();
        });
    }

    async showDetailedContext() {
        try {
            const initResult = await this.workflow.initializeAgent();
            if (initResult.hasContext && initResult.detailedContext) {
                const detailedContext = this.workflow.generateDetailedContext(
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
    }

    async searchMemories() {
        this.rl.question(`${colors.cyan}🔍 Enter search query: ${colors.reset}`, async (query) => {
            if (!query.trim()) {
                console.log(`${colors.yellow}⚠️  Please enter a search query${colors.reset}`);
                this.promptUser();
                return;
            }
            
            console.log(`${colors.blue}🔍 Searching for: "${query}"${colors.reset}`);
            try {
                const searchResults = await this.workflow.searchMemories(query);
                console.log(`${colors.green}✅ Found ${searchResults.total} results${colors.reset}\n`);
                
                if (searchResults.total > 0) {
                    if (searchResults.handoffs.length > 0) {
                        console.log(`${colors.blue}📋 Handoff Results:${colors.reset}`);
                        searchResults.handoffs.forEach((result, i) => {
                            console.log(`  ${i + 1}. ${result.summary.substring(0, 100)}...`);
                        });
                        console.log();
                    }
                    
                    if (searchResults.knowledge.length > 0) {
                        console.log(`${colors.blue}📚 Knowledge Results:${colors.reset}`);
                        searchResults.knowledge.forEach((result, i) => {
                            console.log(`  ${i + 1}. ${result.term}: ${result.definition.substring(0, 100)}...`);
                        });
                        console.log();
                    }
                } else {
                    console.log(`${colors.yellow}No results found for "${query}"${colors.reset}`);
                }
            } catch (error) {
                console.log(`${colors.yellow}❌ Search failed: ${error.message}${colors.reset}`);
            }
            
            console.log();
            console.log(`${colors.yellow}Press Enter to continue...${colors.reset}`);
            this.rl.question('', () => {
                this.promptUser();
            });
        });
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const menu = new InteractiveAgentMenu();
    menu.start();
}

export default InteractiveAgentMenu;
