#!/usr/bin/env node

/**
 * Universal LLM API Caller for StackTrackr
 * Allows direct access to all configured LLM providers from command line or MCP
 * 
 * Usage:
 *   node call-llm.js --provider gemini --prompt "your prompt here"
 *   node call-llm.js --provider claude --model sonnet --prompt "analyze this code"
 *   node call-llm.js --provider openai --model gpt-4 --prompt "help with this task"
 *   node call-llm.js --provider groq --prompt "fast inference needed"
 * 
 * MCP Mode:
 *   echo '{"provider":"gemini","prompt":"analyze performance"}' | node call-llm.js --mcp
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

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
 * LLM Provider configurations
 */
const LLM_PROVIDERS = {
    gemini: {
        name: 'Google Gemini',
        apiKeyEnv: 'GEMINI_API_KEY',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
        defaultModel: 'gemini-1.5-flash'
    },
    claude: {
        name: 'Anthropic Claude',
        apiKeyEnv: 'ANTHROPIC_API_KEY',
        endpoint: 'https://api.anthropic.com/v1/messages',
        models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229'],
        defaultModel: 'claude-3-haiku-20240307'
    },
    openai: {
        name: 'OpenAI GPT',
        apiKeyEnv: 'OPENAI_API_KEY',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
        defaultModel: 'gpt-4o'
    },
    groq: {
        name: 'Groq',
        apiKeyEnv: 'GROQ_API_KEY',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        models: ['mixtral-8x7b-32768', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
        defaultModel: 'llama-3.1-70b-versatile'
    }
};

/**
 * Call Gemini API
 */
async function callGemini(prompt, model = 'gemini-1.5-flash') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not found in environment');

    const response = await fetch(`${LLM_PROVIDERS.gemini.endpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

/**
 * Call Claude API
 */
async function callClaude(prompt, model = 'claude-3-5-sonnet-20241022') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found in environment');

    const response = await fetch(LLM_PROVIDERS.claude.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: model,
            max_tokens: 4000,
            messages: [
                { role: 'user', content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt, model = 'gpt-4o') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not found in environment');

    const response = await fetch(LLM_PROVIDERS.openai.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Call Groq API
 */
async function callGroq(prompt, model = 'llama-3.1-70b-versatile') {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not found in environment');

    const response = await fetch(LLM_PROVIDERS.groq.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Main LLM caller function
 */
async function callLLM(provider, prompt, model = null) {
    const startTime = Date.now();
    
    try {
        let response;
        const selectedModel = model || LLM_PROVIDERS[provider]?.defaultModel;
        
        console.log(`${colors.cyan}🤖 Calling ${LLM_PROVIDERS[provider].name} (${selectedModel})...${colors.reset}`);
        
        switch (provider) {
            case 'gemini':
                response = await callGemini(prompt, selectedModel);
                break;
            case 'claude':
                response = await callClaude(prompt, selectedModel);
                break;
            case 'openai':
                response = await callOpenAI(prompt, selectedModel);
                break;
            case 'groq':
                response = await callGroq(prompt, selectedModel);
                break;
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
        
        const duration = Date.now() - startTime;
        console.log(`${colors.green}✅ Response received in ${duration}ms${colors.reset}\n`);
        
        return {
            provider,
            model: selectedModel,
            prompt,
            response,
            duration,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`${colors.red}❌ Error calling ${provider}: ${error.message}${colors.reset}`);
        
        return {
            provider,
            model: model || LLM_PROVIDERS[provider]?.defaultModel,
            prompt,
            error: error.message,
            duration,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Show available providers and models
 */
function showProviders() {
    console.log(`${colors.bright}🤖 Available LLM Providers:${colors.reset}\n`);
    
    for (const [key, provider] of Object.entries(LLM_PROVIDERS)) {
        const hasKey = !!process.env[provider.apiKeyEnv];
        const status = hasKey ? `${colors.green}✅ Configured${colors.reset}` : `${colors.red}❌ Missing API Key${colors.reset}`;
        
        console.log(`${colors.cyan}${key}${colors.reset} - ${provider.name} ${status}`);
        console.log(`  Models: ${provider.models.join(', ')}`);
        console.log(`  Default: ${provider.defaultModel}`);
        console.log(`  API Key: ${provider.apiKeyEnv}\n`);
    }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        provider: null,
        model: null,
        prompt: null,
        mcp: false,
        help: false,
        list: false
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--provider':
            case '-p':
                options.provider = args[++i];
                break;
            case '--model':
            case '-m':
                options.model = args[++i];
                break;
            case '--prompt':
                options.prompt = args[++i];
                break;
            case '--mcp':
                options.mcp = true;
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
            case '--list':
            case '-l':
                options.list = true;
                break;
            default:
                if (!options.prompt && !args[i].startsWith('--')) {
                    options.prompt = args[i];
                }
        }
    }
    
    return options;
}

/**
 * Show help message
 */
function showHelp() {
    console.log(`${colors.bright}🤖 Universal LLM API Caller${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node call-llm.js --provider <provider> --prompt "your prompt"
  node call-llm.js -p gemini -m gemini-1.5-pro --prompt "analyze this"
  
${colors.yellow}Options:${colors.reset}
  -p, --provider <name>    LLM provider (gemini, claude, openai, groq)
  -m, --model <name>       Specific model (optional, uses default)
  --prompt <text>          Prompt text to send
  --mcp                    MCP mode (read JSON from stdin)
  -l, --list               List available providers and models
  -h, --help               Show this help

${colors.yellow}Examples:${colors.reset}
  node call-llm.js -p gemini --prompt "Explain quantum computing"
  node call-llm.js -p claude -m claude-3-haiku-20240307 --prompt "Quick analysis"
  node call-llm.js -p groq --prompt "Fast response needed"
  
${colors.yellow}MCP Mode:${colors.reset}
  echo '{"provider":"gemini","prompt":"analyze this"}' | node call-llm.js --mcp
`);
}

/**
 * Handle MCP mode (read JSON from stdin)
 */
async function handleMCPMode() {
    return new Promise((resolve, reject) => {
        let data = '';
        
        process.stdin.on('data', chunk => {
            data += chunk;
        });
        
        process.stdin.on('end', () => {
            try {
                const input = JSON.parse(data);
                resolve(input);
            } catch (error) {
                reject(new Error(`Invalid JSON input: ${error.message}`));
            }
        });
        
        process.stdin.on('error', reject);
    });
}

/**
 * Log call to history
 */
async function logCall(callData) {
    try {
        const logDir = path.join(__dirname, '../logs');
        await fs.mkdir(logDir, { recursive: true });
        
        const logFile = path.join(logDir, 'llm-calls.jsonl');
        const logEntry = JSON.stringify(callData) + '\n';
        
        await fs.appendFile(logFile, logEntry);
    } catch (error) {
        console.warn(`${colors.yellow}⚠️  Failed to log call: ${error.message}${colors.reset}`);
    }
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
        
        if (options.list) {
            showProviders();
            return;
        }
        
        let provider, prompt, model;
        
        if (options.mcp) {
            const input = await handleMCPMode();
            provider = input.provider;
            prompt = input.prompt;
            model = input.model;
        } else {
            provider = options.provider;
            prompt = options.prompt;
            model = options.model;
        }
        
        if (!provider || !prompt) {
            console.error(`${colors.red}❌ Provider and prompt are required${colors.reset}`);
            console.log(`${colors.yellow}Use --help for usage information${colors.reset}`);
            process.exit(1);
        }
        
        if (!LLM_PROVIDERS[provider]) {
            console.error(`${colors.red}❌ Unknown provider: ${provider}${colors.reset}`);
            console.log(`${colors.yellow}Available providers: ${Object.keys(LLM_PROVIDERS).join(', ')}${colors.reset}`);
            process.exit(1);
        }
        
        const result = await callLLM(provider, prompt, model);
        
        // Log the call
        await logCall(result);
        
        if (options.mcp) {
            // MCP mode: output JSON
            console.log(JSON.stringify(result));
        } else {
            // Interactive mode: pretty output
            if (result.error) {
                console.error(`${colors.red}❌ Call failed: ${result.error}${colors.reset}`);
                process.exit(1);
            } else {
                console.log(`${colors.bright}🤖 ${LLM_PROVIDERS[provider].name} Response:${colors.reset}\n`);
                console.log(result.response);
                console.log(`\n${colors.cyan}ℹ️  Duration: ${result.duration}ms | Model: ${result.model}${colors.reset}`);
            }
        }
        
    } catch (error) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
