#!/usr/bin/env node

/**
 * API Configuration Wizard for StackTrackr
 * Secure setup and management of LLM API keys
 * 
 * Usage:
 *   node configure-apis.js                    # Interactive wizard
 *   node configure-apis.js --status           # Check configuration
 *   node configure-apis.js --test             # Test all providers
 *   node configure-apis.js --provider gemini  # Configure specific provider
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        envVar: 'GEMINI_API_KEY',
        keyPrefix: 'AIza',
        models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
        defaultModel: 'gemini-1.5-flash',
        signupUrl: 'https://aistudio.google.com/',
        description: 'Fast, cost-effective analysis and documentation'
    },
    claude: {
        name: 'Anthropic Claude',
        envVar: 'ANTHROPIC_API_KEY',
        keyPrefix: 'sk-ant-',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
        defaultModel: 'claude-3-5-sonnet-20241022',
        signupUrl: 'https://console.anthropic.com/',
        description: 'Excellent for code analysis and architecture'
    },
    openai: {
        name: 'OpenAI GPT',
        envVar: 'OPENAI_API_KEY',
        keyPrefix: 'sk-proj-',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
        defaultModel: 'gpt-4o',
        signupUrl: 'https://platform.openai.com/',
        description: 'Most capable for complex reasoning tasks'
    },
    groq: {
        name: 'Groq',
        envVar: 'GROQ_API_KEY',
        keyPrefix: 'gsk_',
        models: ['mixtral-8x7b-32768', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
        defaultModel: 'llama-3.1-70b-versatile',
        signupUrl: 'https://console.groq.com/',
        description: 'Fastest inference for development and testing'
    }
};

/**
 * Create readline interface for user input
 */
function createReadline() {
    return createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

/**
 * Prompt user with hidden input (for passwords/API keys)
 */
function promptHidden(query) {
    return new Promise((resolve) => {
        const rl = createReadline();
        process.stdout.write(query);
        
        // Hide input
        process.stdin.setRawMode(true);
        let input = '';
        
        const onData = (char) => {
            const byte = char[0];
            
            switch (byte) {
                case 3: // Ctrl+C
                    process.stdout.write('\n');
                    process.exit(1);
                    break;
                case 13: // Enter
                    process.stdout.write('\n');
                    process.stdin.setRawMode(false);
                    process.stdin.removeListener('data', onData);
                    rl.close();
                    resolve(input);
                    break;
                case 127: // Backspace
                    if (input.length > 0) {
                        input = input.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    break;
                default:
                    if (byte >= 32 && byte <= 126) {
                        input += char;
                        process.stdout.write('*');
                    }
            }
        };
        
        process.stdin.on('data', onData);
    });
}

/**
 * Regular prompt for visible input
 */
function prompt(query) {
    return new Promise((resolve) => {
        const rl = createReadline();
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

/**
 * Validate API key format
 */
function validateApiKey(provider, key) {
    const config = LLM_PROVIDERS[provider];
    if (!config) return false;
    
    if (!key || typeof key !== 'string') return false;
    if (!key.startsWith(config.keyPrefix)) return false;
    if (key.length < 20) return false;
    
    return true;
}

/**
 * Load existing .env file
 */
async function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    
    try {
        const content = await fs.readFile(envPath, 'utf8');
        const env = {};
        
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    env[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
        
        return env;
    } catch (error) {
        return {};
    }
}

/**
 * Save API keys to .env file
 */
async function saveEnvFile(config) {
    const envPath = path.join(__dirname, '.env');
    
    let content = `# rEngineMCP API Configuration
# Generated by configure-apis.js

`;
    
    // Add API keys
    for (const [provider, providerConfig] of Object.entries(LLM_PROVIDERS)) {
        const envVar = providerConfig.envVar;
        if (config[envVar]) {
            content += `# ${providerConfig.name}\n`;
            content += `${envVar}=${config[envVar]}\n\n`;
        }
    }
    
    // Add other configuration
    content += `# Ollama Configuration
OLLAMA_BASE_URL=${config.OLLAMA_BASE_URL || 'http://localhost:11434'}

# Performance Settings for Mac Mini
MAX_VRAM_GB=${config.MAX_VRAM_GB || '8'}
`;
    
    await fs.writeFile(envPath, content);
    console.log(`${colors.green}✅ Configuration saved to .env${colors.reset}`);
}

/**
 * Test API key with a simple call
 */
async function testApiKey(provider, apiKey) {
    try {
        const testPrompt = 'Hello, this is a test message. Please respond with just "OK".';
        
        // Import and use the call-llm functionality
        const { callLLM } = await import('./call-llm.js');
        
        // Temporarily set the environment variable
        const envVar = LLM_PROVIDERS[provider].envVar;
        const originalValue = process.env[envVar];
        process.env[envVar] = apiKey;
        
        try {
            const result = await callLLM(provider, testPrompt);
            return !result.error;
        } finally {
            // Restore original value
            if (originalValue) {
                process.env[envVar] = originalValue;
            } else {
                delete process.env[envVar];
            }
        }
    } catch (error) {
        return false;
    }
}

/**
 * Show configuration status
 */
async function showStatus() {
    console.log(`${colors.bright}🔧 StackTrackr API Configuration Status${colors.reset}\n`);
    
    const env = await loadEnvFile();
    
    for (const [provider, config] of Object.entries(LLM_PROVIDERS)) {
        const hasKey = !!env[config.envVar];
        const status = hasKey ? `${colors.green}✅ Configured${colors.reset}` : `${colors.red}❌ Not configured${colors.reset}`;
        
        console.log(`${colors.cyan}${config.name}${colors.reset}`);
        console.log(`  Status: ${status}`);
        console.log(`  Environment: ${config.envVar}`);
        console.log(`  Models: ${config.models.join(', ')}`);
        console.log(`  Sign up: ${config.signupUrl}\n`);
    }
}

/**
 * Configure a specific provider
 */
async function configureProvider(providerKey) {
    const provider = LLM_PROVIDERS[providerKey];
    if (!provider) {
        console.error(`${colors.red}❌ Unknown provider: ${providerKey}${colors.reset}`);
        return false;
    }
    
    console.log(`${colors.bright}🔧 Configuring ${provider.name}${colors.reset}`);
    console.log(`${colors.blue}${provider.description}${colors.reset}\n`);
    
    if (!await checkHasApiKey(provider)) {
        return false;
    }
    
    const apiKey = await promptHidden(`${colors.yellow}Enter your ${provider.name} API key: ${colors.reset}`);
    
    if (!validateApiKey(providerKey, apiKey)) {
        console.log(`${colors.red}❌ Invalid API key format. Expected to start with: ${provider.keyPrefix}${colors.reset}`);
        return false;
    }
    
    console.log(`${colors.cyan}🧪 Testing API key...${colors.reset}`);
    const isValid = await testApiKey(providerKey, apiKey);
    
    if (!isValid) {
        console.log(`${colors.red}❌ API key test failed. Please check your key and try again.${colors.reset}`);
        return false;
    }
    
    console.log(`${colors.green}✅ API key validated successfully!${colors.reset}`);
    
    // Save the configuration
    const env = await loadEnvFile();
    env[provider.envVar] = apiKey;
    await saveEnvFile(env);
    
    return true;
}

/**
 * Check if user has API key and offer guidance
 */
async function checkHasApiKey(provider) {
    const hasKey = await prompt(`${colors.yellow}Do you have a ${provider.name} API key? (y/n): ${colors.reset}`);
    
    if (hasKey.toLowerCase() !== 'y' && hasKey.toLowerCase() !== 'yes') {
        console.log(`${colors.blue}📄 To get your ${provider.name} API key:${colors.reset}`);
        console.log(`   1. Visit: ${provider.signupUrl}`);
        console.log(`   2. Create an account or sign in`);
        console.log(`   3. Navigate to API keys section`);
        console.log(`   4. Create a new API key`);
        console.log(`   5. Copy the key (starts with "${provider.keyPrefix}")\n`);
        
        const shouldContinue = await prompt(`${colors.yellow}Press Enter when you have your API key, or 'q' to skip: ${colors.reset}`);
        if (shouldContinue.toLowerCase() === 'q') {
            return false;
        }
    }
    
    return true;
}

/**
 * Interactive configuration wizard
 */
async function runWizard() {
    console.log(`${colors.bright}🤖 StackTrackr LLM API Configuration Wizard${colors.reset}`);
    console.log(`${colors.blue}This wizard will help you configure API keys for all LLM providers.${colors.reset}\n`);
    
    const env = await loadEnvFile();
    let configured = 0;
    
    for (const [providerKey, provider] of Object.entries(LLM_PROVIDERS)) {
        const hasExisting = !!env[provider.envVar];
        
        console.log(`${colors.cyan}━━━ ${provider.name} ━━━${colors.reset}`);
        console.log(`${colors.blue}${provider.description}${colors.reset}`);
        
        if (hasExisting) {
            console.log(`${colors.green}✅ Already configured${colors.reset}`);
            const reconfigure = await prompt(`${colors.yellow}Reconfigure? (y/n): ${colors.reset}`);
            if (reconfigure.toLowerCase() !== 'y' && reconfigure.toLowerCase() !== 'yes') {
                configured++;
                console.log();
                continue;
            }
        }
        
        const success = await configureProvider(providerKey);
        if (success) configured++;
        
        console.log();
    }
    
    console.log(`${colors.bright}🎉 Configuration Complete!${colors.reset}`);
    console.log(`${colors.green}✅ ${configured} providers configured${colors.reset}`);
    
    if (configured > 0) {
        console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
        console.log(`  • Test your setup: ${colors.cyan}node call-llm.js --list${colors.reset}`);
        console.log(`  • Make a test call: ${colors.cyan}node call-llm.js -p gemini --prompt "Hello"${colors.reset}`);
        console.log(`  • Read the docs: ${colors.cyan}cat ../rProtocols/api_configuration_protocol.md${colors.reset}`);
    }
}

/**
 * Test all configured providers
 */
async function testAllProviders() {
    console.log(`${colors.bright}🧪 Testing All Configured Providers${colors.reset}\n`);
    
    const env = await loadEnvFile();
    let tested = 0;
    let passed = 0;
    
    for (const [providerKey, provider] of Object.entries(LLM_PROVIDERS)) {
        if (!env[provider.envVar]) {
            console.log(`${colors.yellow}⏭️  ${provider.name}: Not configured${colors.reset}`);
            continue;
        }
        
        console.log(`${colors.cyan}🧪 Testing ${provider.name}...${colors.reset}`);
        tested++;
        
        const isValid = await testApiKey(providerKey, env[provider.envVar]);
        
        if (isValid) {
            console.log(`${colors.green}✅ ${provider.name}: Working${colors.reset}`);
            passed++;
        } else {
            console.log(`${colors.red}❌ ${provider.name}: Failed${colors.reset}`);
        }
    }
    
    console.log(`\n${colors.bright}Test Results: ${passed}/${tested} providers working${colors.reset}`);
}

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        status: false,
        test: false,
        provider: null,
        help: false,
        wizard: false
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--status':
                options.status = true;
                break;
            case '--test':
                options.test = true;
                break;
            case '--provider':
                options.provider = args[++i];
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
            default:
                if (args.length === 0) {
                    options.wizard = true;
                }
        }
    }
    
    // If no arguments, run wizard
    if (args.length === 0) {
        options.wizard = true;
    }
    
    return options;
}

/**
 * Show help message
 */
function showHelp() {
    console.log(`${colors.bright}🔧 StackTrackr API Configuration Tool${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node configure-apis.js                 # Run interactive wizard
  node configure-apis.js --status        # Show configuration status
  node configure-apis.js --test          # Test all configured providers
  node configure-apis.js --provider gemini  # Configure specific provider
  
${colors.yellow}Providers:${colors.reset}
  gemini    Google Gemini (fast, cost-effective)
  claude    Anthropic Claude (code analysis)
  openai    OpenAI GPT (complex reasoning)
  groq      Groq (fastest inference)

${colors.yellow}Examples:${colors.reset}
  configure-apis.js                      # Interactive setup
  configure-apis.js --status             # Check what's configured
  configure-apis.js --provider claude    # Set up Claude only
  configure-apis.js --test               # Validate all keys
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
        
        if (options.status) {
            await showStatus();
            return;
        }
        
        if (options.test) {
            await testAllProviders();
            return;
        }
        
        if (options.provider) {
            const success = await configureProvider(options.provider);
            if (success) {
                console.log(`${colors.green}🎉 ${LLM_PROVIDERS[options.provider].name} configured successfully!${colors.reset}`);
            }
            return;
        }
        
        if (options.wizard) {
            await runWizard();
            return;
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
