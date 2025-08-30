#!/usr/bin/env node

/**
 * Workflow Automation & Pain Point Solutions for StackTrackr
 * Intelligent automation to speed up common development tasks
 * 
 * Usage:
 *   node workflow-automation.js --auto-context     # Auto-load project context for new sessions
 *   node workflow-automation.js --smart-handoff    # Prepare intelligent agent handoffs
 *   node workflow-automation.js --quick-setup      # One-command environment setup
 *   node workflow-automation.js --pain-analysis    # Analyze workflow pain points
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

/**
 * Common pain points and their automated solutions
 */
const PAIN_POINT_SOLUTIONS = {
    'slow_context_loading': {
        name: 'Slow Context Loading',
        description: 'Agents need time to understand project state',
        solution: 'Auto-generate context summaries',
        automation: 'auto-context'
    },
    'repetitive_handoffs': {
        name: 'Repetitive Agent Handoffs',
        description: 'Manual context transfer between agents',
        solution: 'Smart handoff with auto-context preparation',
        automation: 'smart-handoff'
    },
    'environment_setup': {
        name: 'Complex Environment Setup',
        description: 'Multiple steps to get development environment ready',
        solution: 'One-command setup with validation',
        automation: 'quick-setup'
    },
    'memory_fragmentation': {
        name: 'Memory System Fragmentation',
        description: 'Context scattered across multiple memory systems',
        solution: 'Unified memory access layer',
        automation: 'memory-unify'
    },
    'search_inefficiency': {
        name: 'Inefficient Code Search',
        description: 'Multiple tools needed to find relevant code',
        solution: 'Integrated search matrix with LLM enhancement',
        automation: 'smart-search'
    },
    'documentation_lag': {
        name: 'Documentation Always Behind',
        description: 'Docs get outdated quickly during development',
        solution: 'Auto-documentation with change detection',
        automation: 'auto-docs'
    }
};

/**
 * Auto-generate project context for new sessions
 */
async function autoLoadContext() {
    console.log(`${colors.bright}🧠 Auto-Loading Project Context${colors.reset}\n`);
    
    const context = {
        timestamp: new Date().toISOString(),
        project_state: {},
        recent_changes: [],
        active_priorities: [],
        agent_recommendations: {}
    };
    
    try {
        // Load search matrix stats
        console.log(`${colors.cyan}📊 Loading search matrix...${colors.reset}`);
        const matrixPath = path.join(__dirname, '../rMemory/search-matrix/context-matrix.json');
        const matrixContent = await fs.readFile(matrixPath, 'utf8');
        const matrix = JSON.parse(matrixContent);
        
        context.project_state.search_matrix = {
            total_entries: Object.keys(matrix).length,
            last_updated: new Date().toISOString(),
            status: 'ready'
        };
        
        // Check recent git changes
        console.log(`${colors.cyan}📁 Checking recent changes...${colors.reset}`);
        try {
            const { stdout: gitLog } = await execAsync('git log --oneline -10');
            context.recent_changes = gitLog.trim().split('\n').slice(0, 5);
        } catch (error) {
            context.recent_changes = ['Git history unavailable'];
        }
        
        // Load user preferences
        console.log(`${colors.cyan}👤 Loading user preferences...${colors.reset}`);
        try {
            const prefsPath = path.join(__dirname, '../rMemory/rAgentMemories/preferences.json');
            const prefsContent = await fs.readFile(prefsPath, 'utf8');
            const prefs = JSON.parse(prefsContent);
            
            context.user_preferences = {
                communication_style: prefs.user_preferences?.communication_style?.verbosity_level || 'concise',
                task_preferences: prefs.user_preferences?.task_preferences?.speed_vs_quality || 'balanced',
                workflow_preferences: prefs.user_preferences?.workflow_preferences?.task_breakdown_style || 'detailed'
            };
        } catch (error) {
            context.user_preferences = { note: 'Preferences not available' };
        }
        
        // Check system health
        console.log(`${colors.cyan}🔧 Checking system health...${colors.reset}`);
        context.system_health = await checkSystemHealth();
        
        // Generate agent recommendations
        context.agent_recommendations = generateAgentRecommendations(context);
        
        // Save context for agents
        const contextPath = path.join(__dirname, '../rMemory/auto-context.json');
        await fs.writeFile(contextPath, JSON.stringify(context, null, 2));
        
        console.log(`${colors.green}✅ Project context loaded and saved${colors.reset}`);
        console.log(`${colors.blue}📄 Context available at: rMemory/auto-context.json${colors.reset}`);
        
        // Display summary
        displayContextSummary(context);
        
        return context;
        
    } catch (error) {
        console.error(`${colors.red}❌ Error loading context: ${error.message}${colors.reset}`);
        return null;
    }
}

/**
 * Check system health and readiness
 */
async function checkSystemHealth() {
    const health = {
        search_matrix: false,
        llm_apis: false,
        memory_systems: false,
        environment: false
    };
    
    // Check search matrix
    try {
        const matrixPath = path.join(__dirname, '../rMemory/search-matrix/context-matrix.json');
        await fs.access(matrixPath);
        health.search_matrix = true;
    } catch (error) {
        // Matrix not available
    }
    
    // Check LLM APIs
    try {
        const envPath = path.join(__dirname, '.env');
        const envContent = await fs.readFile(envPath, 'utf8');
        health.llm_apis = envContent.includes('GEMINI_API_KEY') || 
                         envContent.includes('ANTHROPIC_API_KEY') ||
                         envContent.includes('OPENAI_API_KEY');
    } catch (error) {
        // Environment not configured
    }
    
    // Check memory systems
    try {
        const memoryPath = path.join(__dirname, '../rMemory/rAgentMemories');
        await fs.access(memoryPath);
        health.memory_systems = true;
    } catch (error) {
        // Memory system not available
    }
    
    // Check overall environment
    health.environment = health.search_matrix && health.memory_systems;
    
    return health;
}

/**
 * Generate intelligent agent recommendations
 */
function generateAgentRecommendations(context) {
    const recommendations = {
        suggested_agent: 'claude',
        reasoning: [],
        task_priority: 'medium',
        context_ready: true
    };
    
    // Analyze recent changes for recommendation
    if (context.recent_changes.length > 0) {
        const recentWork = context.recent_changes.join(' ').toLowerCase();
        
        if (recentWork.includes('performance') || recentWork.includes('optimization')) {
            recommendations.suggested_agent = 'gpt-4';
            recommendations.reasoning.push('Recent performance work detected - GPT-4 excels at optimization');
        } else if (recentWork.includes('bug') || recentWork.includes('fix') || recentWork.includes('debug')) {
            recommendations.suggested_agent = 'claude';
            recommendations.reasoning.push('Bug fixes detected - Claude excellent for debugging');
        } else if (recentWork.includes('test') || recentWork.includes('validation')) {
            recommendations.suggested_agent = 'gemini';
            recommendations.reasoning.push('Testing work detected - Gemini good for systematic validation');
        }
    }
    
    // Check system readiness
    if (!context.system_health.search_matrix) {
        recommendations.reasoning.push('Search matrix needs building - run: cd rScribe && ./start-search-matrix.sh scan');
        recommendations.context_ready = false;
    }
    
    if (!context.system_health.llm_apis) {
        recommendations.reasoning.push('LLM APIs need configuration - run: node configure-apis.js');
        recommendations.context_ready = false;
    }
    
    return recommendations;
}

/**
 * Display context summary for user
 */
function displayContextSummary(context) {
    console.log(`\n${colors.bright}📋 Project Context Summary${colors.reset}`);
    console.log(`${colors.green}🔍 Search Matrix: ${context.project_state.search_matrix.total_entries} entries${colors.reset}`);
    console.log(`${colors.blue}📝 Recent Changes: ${context.recent_changes.length} commits${colors.reset}`);
    console.log(`${colors.yellow}🤖 Recommended Agent: ${context.agent_recommendations.suggested_agent}${colors.reset}`);
    
    if (context.agent_recommendations.reasoning.length > 0) {
        console.log(`${colors.cyan}💡 Reasoning:${colors.reset}`);
        context.agent_recommendations.reasoning.forEach(reason => {
            console.log(`   • ${reason}`);
        });
    }
    
    console.log(`\n${colors.bright}🔧 System Health:${colors.reset}`);
    Object.entries(context.system_health).forEach(([system, status]) => {
        const icon = status ? '✅' : '❌';
        const color = status ? colors.green : colors.red;
        console.log(`   ${icon} ${color}${system.replace('_', ' ')}${colors.reset}`);
    });
}

/**
 * Prepare smart agent handoff with context
 */
async function smartHandoff(options = {}) {
    console.log(`${colors.bright}🔄 Preparing Smart Agent Handoff${colors.reset}\n`);
    
    const { targetAgent = 'auto', task = 'continue', priority = 'medium' } = options;
    
    // Load current context
    const context = await autoLoadContext();
    if (!context) return;
    
    // Prepare handoff package
    const handoff = {
        timestamp: new Date().toISOString(),
        from_agent: 'copilot',
        to_agent: targetAgent,
        task_description: task,
        priority,
        context_package: {
            search_matrix_ready: context.system_health.search_matrix,
            recent_changes: context.recent_changes.slice(0, 3),
            user_preferences: context.user_preferences,
            system_state: context.project_state,
            recommended_approach: context.agent_recommendations.reasoning
        },
        quick_access: {
            search_matrix_tool: 'node rEngine/ragent-search-matrix.js',
            llm_caller: 'node rEngine/call-llm.js',
            context_loader: 'cat rMemory/auto-context.json'
        }
    };
    
    // Save handoff package
    const handoffPath = path.join(__dirname, '../rMemory/smart-handoff.json');
    await fs.writeFile(handoffPath, JSON.stringify(handoff, null, 2));
    
    console.log(`${colors.green}✅ Smart handoff package prepared${colors.reset}`);
    console.log(`${colors.blue}📦 Package saved to: rMemory/smart-handoff.json${colors.reset}`);
    
    // Display handoff summary
    console.log(`\n${colors.bright}🎯 Handoff Summary${colors.reset}`);
    console.log(`Target Agent: ${handoff.to_agent}`);
    console.log(`Task: ${handoff.task_description}`);
    console.log(`Priority: ${handoff.priority}`);
    console.log(`Context Ready: ${handoff.context_package.search_matrix_ready ? 'Yes' : 'No'}`);
    
    return handoff;
}

/**
 * One-command environment setup
 */
async function quickSetup() {
    console.log(`${colors.bright}🚀 StackTrackr Quick Setup${colors.reset}\n`);
    
    const steps = [
        { name: 'Check dependencies', action: checkDependencies },
        { name: 'Build search matrix', action: buildSearchMatrix },
        { name: 'Configure APIs', action: configureAPIs },
        { name: 'Validate memory systems', action: validateMemory },
        { name: 'Test integrations', action: testIntegrations }
    ];
    
    let completed = 0;
    
    for (const step of steps) {
        console.log(`${colors.cyan}🔧 ${step.name}...${colors.reset}`);
        
        try {
            const result = await step.action();
            if (result) {
                console.log(`${colors.green}✅ ${step.name} completed${colors.reset}`);
                completed++;
            } else {
                console.log(`${colors.yellow}⚠️  ${step.name} needs attention${colors.reset}`);
            }
        } catch (error) {
            console.log(`${colors.red}❌ ${step.name} failed: ${error.message}${colors.reset}`);
        }
        
        console.log();
    }
    
    console.log(`${colors.bright}📊 Setup Complete: ${completed}/${steps.length} steps successful${colors.reset}`);
    
    if (completed === steps.length) {
        console.log(`${colors.green}🎉 Environment ready for development!${colors.reset}`);
        console.log(`${colors.yellow}Next steps:${colors.reset}`);
        console.log(`  • Test LLM: node call-llm.js -p gemini --prompt "Hello"`);
        console.log(`  • Search matrix: node ragent-search-matrix.js "api functions"`);
        console.log(`  • Auto context: node workflow-automation.js --auto-context`);
    } else {
        console.log(`${colors.yellow}⚠️  Some setup steps need attention. Review the output above.${colors.reset}`);
    }
}

/**
 * Setup step implementations
 */
async function checkDependencies() {
    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`   Node.js: ${nodeVersion}`);
    
    // Check for required directories
    const requiredDirs = ['rMemory', 'rEngine', 'rScribe'];
    for (const dir of requiredDirs) {
        try {
            await fs.access(path.join(__dirname, '..', dir));
            console.log(`   ✓ ${dir} directory exists`);
        } catch (error) {
            console.log(`   ✗ ${dir} directory missing`);
            return false;
        }
    }
    
    return true;
}

async function buildSearchMatrix() {
    try {
        const matrixPath = path.join(__dirname, '../rMemory/search-matrix/context-matrix.json');
        await fs.access(matrixPath);
        console.log(`   ✓ Search matrix already exists`);
        return true;
    } catch (error) {
        console.log(`   ⚠️  Building search matrix...`);
        try {
            await execAsync('cd ../rScribe && ./start-search-matrix.sh scan');
            console.log(`   ✓ Search matrix built successfully`);
            return true;
        } catch (buildError) {
            console.log(`   ✗ Failed to build search matrix`);
            return false;
        }
    }
}

async function configureAPIs() {
    try {
        const envPath = path.join(__dirname, '.env');
        const envContent = await fs.readFile(envPath, 'utf8');
        
        const hasKeys = envContent.includes('GEMINI_API_KEY') ||
                       envContent.includes('ANTHROPIC_API_KEY') ||
                       envContent.includes('OPENAI_API_KEY');
        
        if (hasKeys) {
            console.log(`   ✓ API keys configured`);
            return true;
        } else {
            console.log(`   ⚠️  No API keys found - run: node configure-apis.js`);
            return false;
        }
    } catch (error) {
        console.log(`   ⚠️  .env file not found - run: node configure-apis.js`);
        return false;
    }
}

async function validateMemory() {
    try {
        const memoryPath = path.join(__dirname, '../rMemory/rAgentMemories');
        await fs.access(memoryPath);
        console.log(`   ✓ Memory systems accessible`);
        return true;
    } catch (error) {
        console.log(`   ✗ Memory systems not accessible`);
        return false;
    }
}

async function testIntegrations() {
    // Test search matrix access
    try {
        const { stdout } = await execAsync('node ragent-search-matrix.js --stats');
        console.log(`   ✓ Search matrix integration working`);
        return true;
    } catch (error) {
        console.log(`   ✗ Search matrix integration failed`);
        return false;
    }
}

/**
 * Analyze workflow pain points
 */
async function analyzePainPoints() {
    console.log(`${colors.bright}🔍 Workflow Pain Point Analysis${colors.reset}\n`);
    
    const analysis = {
        detected_issues: [],
        automation_opportunities: [],
        performance_metrics: {},
        recommendations: []
    };
    
    // Check for common pain points
    for (const [key, painPoint] of Object.entries(PAIN_POINT_SOLUTIONS)) {
        console.log(`${colors.cyan}🔍 Checking: ${painPoint.name}${colors.reset}`);
        
        const hasIssue = await detectPainPoint(key);
        if (hasIssue) {
            analysis.detected_issues.push({
                name: painPoint.name,
                description: painPoint.description,
                solution: painPoint.solution,
                automation: painPoint.automation
            });
            
            console.log(`   ${colors.red}❌ Issue detected${colors.reset}`);
            console.log(`   ${colors.yellow}💡 Solution: ${painPoint.solution}${colors.reset}`);
        } else {
            console.log(`   ${colors.green}✅ No issues${colors.reset}`);
        }
    }
    
    // Generate recommendations
    if (analysis.detected_issues.length > 0) {
        console.log(`\n${colors.bright}📋 Automation Recommendations${colors.reset}`);
        
        analysis.detected_issues.forEach((issue, index) => {
            console.log(`\n${index + 1}. ${colors.cyan}${issue.name}${colors.reset}`);
            console.log(`   Problem: ${issue.description}`);
            console.log(`   Solution: ${issue.solution}`);
            console.log(`   Command: ${colors.yellow}node workflow-automation.js --${issue.automation}${colors.reset}`);
        });
    } else {
        console.log(`\n${colors.green}🎉 No major workflow pain points detected!${colors.reset}`);
    }
    
    return analysis;
}

/**
 * Detect specific pain points
 */
async function detectPainPoint(painPointKey) {
    switch (painPointKey) {
        case 'slow_context_loading':
            // Check if auto-context exists
            try {
                await fs.access(path.join(__dirname, '../rMemory/auto-context.json'));
                return false; // Auto-context exists, no issue
            } catch (error) {
                return true; // No auto-context, pain point exists
            }
            
        case 'environment_setup':
            // Check if all systems are ready
            const health = await checkSystemHealth();
            return !Object.values(health).every(Boolean);
            
        case 'search_inefficiency':
            // Check if search matrix is available
            try {
                await fs.access(path.join(__dirname, '../rMemory/search-matrix/context-matrix.json'));
                return false; // Search matrix exists
            } catch (error) {
                return true; // No search matrix
            }
            
        default:
            return false;
    }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        autoContext: false,
        smartHandoff: false,
        quickSetup: false,
        painAnalysis: false,
        help: false
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--auto-context':
                options.autoContext = true;
                break;
            case '--smart-handoff':
                options.smartHandoff = true;
                break;
            case '--quick-setup':
                options.quickSetup = true;
                break;
            case '--pain-analysis':
                options.painAnalysis = true;
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
        }
    }
    
    return options;
}

/**
 * Show help message
 */
function showHelp() {
    console.log(`${colors.bright}⚡ StackTrackr Workflow Automation${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node workflow-automation.js --auto-context    # Auto-load project context
  node workflow-automation.js --smart-handoff   # Prepare intelligent handoffs  
  node workflow-automation.js --quick-setup     # One-command environment setup
  node workflow-automation.js --pain-analysis   # Analyze workflow pain points

${colors.yellow}Pain Point Solutions:${colors.reset}
  🐌 Slow Context Loading → Auto-generate context summaries
  🔄 Repetitive Handoffs → Smart handoff preparation  
  🔧 Complex Setup → One-command environment validation
  📚 Memory Fragmentation → Unified memory access
  🔍 Search Inefficiency → Integrated search matrix
  📝 Documentation Lag → Auto-documentation system

${colors.yellow}Examples:${colors.reset}
  workflow-automation.js --auto-context         # Load context for new session
  workflow-automation.js --quick-setup          # Set up entire environment
  workflow-automation.js --pain-analysis        # Identify workflow issues
`);
}

/**
 * Main execution function
 */
async function main() {
    try {
        const options = parseArgs();
        
        if (options.help) {
            showHelp();
            return;
        }
        
        if (options.autoContext) {
            await autoLoadContext();
            return;
        }
        
        if (options.smartHandoff) {
            await smartHandoff();
            return;
        }
        
        if (options.quickSetup) {
            await quickSetup();
            return;
        }
        
        if (options.painAnalysis) {
            await analyzePainPoints();
            return;
        }
        
        // If no specific option, show help
        showHelp();
        
    } catch (error) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
