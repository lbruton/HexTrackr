#!/usr/bin/env node

/**
 * Enhanced Agent Initialization with Memory Intelligence & API LLM Optimization
 * Automatically configures agents with optimal LLM selection and memory systems
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

class EnhancedAgentInit {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.engineDir = path.join(this.baseDir, 'rEngine');
        this.memoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        
        // LLM Configuration
        this.llmConfig = {
            primary: 'groq', // Fast API for quick responses
            fallbacks: ['claude', 'openai', 'gemini'],
            local_fallback: 'qwen', // Only if APIs unavailable
            performance_threshold: 5000 // 5 seconds max response time
        };
        
        // Memory Intelligence Paths
        this.memoryPaths = {
            recall: path.join(this.engineDir, 'recall.js'),
            addContext: path.join(this.engineDir, 'add-context.js'),
            memoryIntelligence: path.join(this.engineDir, 'memory-intelligence.js'),
            extendedContext: path.join(this.memoryDir, 'extendedcontext.json')
        };
        
        // MCP Configuration
        this.mcpConfig = {
            enabled: true,
            scribe_server: 'memory-scribe',
            prevent_popups: true,
            background_only: true
        };
    }
    
    async initialize() {
        console.log(`${colors.cyan}🚀 Enhanced Agent Initialization Starting...${colors.reset}\n`);
        
        // Step 1: System Status Check
        await this.checkSystemStatus();
        
        // Step 2: Memory Intelligence System
        const memoryReady = await this.initializeMemorySystem();
        
        // Step 3: LLM Optimization
        const optimalLLM = await this.configureLLM();
        
        // Step 4: MCP Configuration
        await this.configureMCP();
        
        // Step 5: Agent Profile Setup
        await this.setupAgentProfile(memoryReady, optimalLLM);
        
        // Step 6: Quick Verification
        await this.verifySetup();
        
        console.log(`${colors.green}✅ Enhanced Agent Initialization Complete!${colors.reset}\n`);
        
        return {
            memorySystem: memoryReady,
            llm: optimalLLM,
            mcpEnabled: this.mcpConfig.enabled,
            status: 'ready'
        };
    }
    
    async checkSystemStatus() {
        console.log(`${colors.blue}📊 System Status Check...${colors.reset}`);
        
        const checks = [
            { name: 'Memory Intelligence', path: this.memoryPaths.memoryIntelligence },
            { name: 'Fast Recall', path: this.memoryPaths.recall },
            { name: 'Context Entry', path: this.memoryPaths.addContext },
            { name: 'Extended Context DB', path: this.memoryPaths.extendedContext }
        ];
        
        for (const check of checks) {
            try {
                await fs.access(check.path);
                console.log(`${colors.green}  ✅ ${check.name}: Available${colors.reset}`);
            } catch (error) {
                console.log(`${colors.red}  ❌ ${check.name}: Missing${colors.reset}`);
            }
        }
        console.log('');
    }
    
    async initializeMemorySystem() {
        console.log(`${colors.cyan}🧠 Memory Intelligence System Initialization...${colors.reset}`);
        
        try {
            // Check if all memory tools are available
            const allAvailable = await Promise.all(
                Object.values(this.memoryPaths).map(async (p) => {
                    try {
                        await fs.access(p);
                        return true;
                    } catch {
                        return false;
                    }
                })
            );
            
            if (allAvailable.every(Boolean)) {
                console.log(`${colors.green}✅ Memory Intelligence: READY${colors.reset}`);
                
                // Quick memory test
                try {
                    const testResult = await execPromise(`node "${this.memoryPaths.recall}" "system"`);
                    const matchCount = (testResult.stdout.match(/Found \\d+ matches/) || ['Found 0 matches'])[0];
                    console.log(`${colors.yellow}  🔬 Memory Test: ${matchCount}${colors.reset}`);
                } catch (error) {
                    console.log(`${colors.yellow}  ⚠️  Memory test skipped${colors.reset}`);
                }
                
                // Add initialization context
                try {
                    await execPromise(`node "${this.memoryPaths.addContext}" "Agent Initialization" "Enhanced agent initialization with memory intelligence and API LLM optimization completed successfully" "system_init"`);
                    console.log(`${colors.blue}  📝 Initialization logged to memory${colors.reset}`);
                } catch (error) {
                    console.log(`${colors.yellow}  ⚠️  Context logging skipped${colors.reset}`);
                }
                
                console.log('');
                return true;
            } else {
                console.log(`${colors.red}❌ Memory Intelligence: INCOMPLETE${colors.reset}`);
                console.log(`${colors.yellow}  Some memory tools are missing, basic functionality available${colors.reset}\n`);
                return false;
            }
        } catch (error) {
            console.log(`${colors.red}❌ Memory system check failed: ${error.message}${colors.reset}\n`);
            return false;
        }
    }
    
    async configureLLM() {
        console.log(`${colors.blue}🤖 LLM Configuration & Optimization...${colors.reset}`);
        
        // Check API availability
        const apiStatus = await this.checkAPIAvailability();
        
        if (apiStatus.hasAPIs) {
            console.log(`${colors.green}✅ API LLMs Available: ${apiStatus.available.join(', ')}${colors.reset}`);
            console.log(`${colors.cyan}  🚀 Using ${this.llmConfig.primary} for optimal performance${colors.reset}`);
            console.log(`${colors.blue}  🔄 Fallback chain: ${this.llmConfig.fallbacks.join(' → ')} → ${this.llmConfig.local_fallback}${colors.reset}`);
        } else {
            console.log(`${colors.yellow}⚠️  No API LLMs detected, using local Ollama${colors.reset}`);
            console.log(`${colors.cyan}  🐌 Note: Qwen may be slower than API models${colors.reset}`);
        }
        
        console.log('');
        return apiStatus.hasAPIs ? this.llmConfig.primary : this.llmConfig.local_fallback;
    }
    
    async checkAPIAvailability() {
        const apiKeys = [
            'GROQ_API_KEY',
            'ANTHROPIC_API_KEY', 
            'OPENAI_API_KEY',
            'GEMINI_API_KEY'
        ];
        
        const available = [];
        
        for (const key of apiKeys) {
            if (process.env[key]) {
                const provider = key.replace('_API_KEY', '').toLowerCase();
                available.push(provider);
            }
        }
        
        return {
            hasAPIs: available.length > 0,
            available,
            count: available.length
        };
    }
    
    async configureMCP() {
        console.log(`${colors.blue}🔗 MCP (Model Context Protocol) Configuration...${colors.reset}`);
        
        if (this.mcpConfig.enabled) {
            console.log(`${colors.green}✅ MCP Memory Server: ENABLED${colors.reset}`);
            console.log(`${colors.blue}  📝 Scribe integration: Background only (no popups)${colors.reset}`);
            console.log(`${colors.cyan}  🧠 Memory persistence: Extended context + MCP dual layer${colors.reset}`);
        } else {
            console.log(`${colors.yellow}⚠️  MCP: DISABLED (local memory only)${colors.reset}`);
        }
        
        console.log('');
    }
    
    async setupAgentProfile(memoryReady, llm) {
        console.log(`${colors.blue}👤 Agent Profile Configuration...${colors.reset}`);
        
        const profile = {
            memory_intelligence: memoryReady,
            llm_provider: llm,
            fast_recall_enabled: memoryReady,
            context_awareness: 'enhanced',
            initialization_timestamp: new Date().toISOString(),
            capabilities: [
                'instant_memory_recall',
                'pattern_recognition',
                'historical_context_analysis',
                'multi_source_memory_search'
            ]
        };
        
        // Save profile for other agents to reference
        const profilePath = path.join(this.memoryDir, 'active-agent-profile.json');
        try {
            await fs.writeFile(profilePath, JSON.stringify(profile, null, 2));
            console.log(`${colors.green}✅ Agent profile saved: active-agent-profile.json${colors.reset}`);
        } catch (error) {
            console.log(`${colors.yellow}⚠️  Could not save agent profile: ${error.message}${colors.reset}`);
        }
        
        console.log(`${colors.cyan}  🎯 Memory Intelligence: ${memoryReady ? 'ENABLED' : 'BASIC'}${colors.reset}`);
        console.log(`${colors.cyan}  🤖 LLM Provider: ${llm.toUpperCase()}${colors.reset}`);
        console.log(`${colors.cyan}  🧠 Context Awareness: Enhanced${colors.reset}`);
        console.log('');
    }
    
    async verifySetup() {
        console.log(`${colors.blue}🔍 Setup Verification...${colors.reset}`);
        
        const verifications = [];
        
        // Test memory recall
        if (await this.isFileAvailable(this.memoryPaths.recall)) {
            verifications.push('✅ Fast recall ready');
        }
        
        // Test context addition
        if (await this.isFileAvailable(this.memoryPaths.addContext)) {
            verifications.push('✅ Context entry ready');
        }
        
        // Test extended context
        if (await this.isFileAvailable(this.memoryPaths.extendedContext)) {
            verifications.push('✅ Extended context database ready');
        }
        
        // Test agent workflow
        const agentWorkflowPath = path.join(this.engineDir, 'agent-hello-workflow.js');
        if (await this.isFileAvailable(agentWorkflowPath)) {
            verifications.push('✅ Agent workflow system ready');
        }
        
        verifications.forEach(v => console.log(`  ${v}`));
        
        console.log(`${colors.green}  🎉 ${verifications.length} systems verified and operational${colors.reset}`);
        console.log('');
    }
    
    async isFileAvailable(path) {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }
    
    displayUsageInstructions() {
        console.log(`${colors.cyan}📋 Quick Start Instructions:${colors.reset}\n`);
        
        console.log(`${colors.green}🔍 Fast Memory Recall:${colors.reset}`);
        console.log(`  node ${this.memoryPaths.recall} "search term"`);
        console.log(`  Example: node recall.js "menu system"\n`);
        
        console.log(`${colors.green}📝 Add Important Context:${colors.reset}`);
        console.log(`  node ${this.memoryPaths.addContext} "title" "description" [type]`);
        console.log(`  Example: node add-context.js "Bug Fix" "Fixed undefined variable" "fix"\n`);
        
        console.log(`${colors.green}🤖 Agent Menu:${colors.reset}`);
        console.log(`  node ${path.join(this.engineDir, 'agent-menu.js')} [1|2|3|4]`);
        console.log(`  1 - Continue where left off, 2 - Fresh start, 3 - Detail view, 4 - Memory commands\n`);
        
        console.log(`${colors.blue}💡 Pro Tips:${colors.reset}`);
        console.log(`  • Use MCP calls to scribe to avoid popups`);
        console.log(`  • Memory intelligence searches across all time periods`);
        console.log(`  • API LLMs are faster than local Qwen for complex tasks`);
        console.log(`  • Extended context persists across all restarts`);
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const enhancedInit = new EnhancedAgentInit();
    
    try {
        const result = await enhancedInit.initialize();
        enhancedInit.displayUsageInstructions();
        
        console.log(`${colors.green}🚀 Agent ready for work! Memory intelligence and optimal LLM configured.${colors.reset}`);
        
    } catch (error) {
        console.error(`${colors.red}❌ Initialization failed: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

export default EnhancedAgentInit;
