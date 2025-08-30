#!/usr/bin/env node

// Multi-Provider Rate Limiter
// Handles Groq, OpenAI, Gemini, and other AI providers with their specific limits

import fs from 'fs-extra';
import path from 'path';
import { EventEmitter } from 'events';

class MultiProviderRateLimiter extends EventEmitter {
    constructor() {
        super();
        
        // Provider-specific configurations
        this.providers = {
            groq: {
                name: 'Groq',
                maxTokensPerRequest: 6000,  // User specified
                maxRequestsPerMinute: 30,   // Conservative estimate
                maxRequestsPerHour: 1000,   // Conservative estimate
                maxRequestsPerDay: 10000,   // Conservative estimate
                baseDelay: 500,             // 500ms base delay
                maxRetries: 5,
                retryMultiplier: 2,
                models: ['deepseek-r1', 'llama3-8b-8192', 'mixtral-8x7b-32768']
            },
            openai: {
                name: 'OpenAI',
                maxTokensPerRequest: 4096,  // GPT-3.5 default
                maxRequestsPerMinute: 20,   // API tier dependent
                maxRequestsPerHour: 500,    // Conservative
                maxRequestsPerDay: 2000,    // Conservative
                baseDelay: 1000,            // 1s base delay
                maxRetries: 3,
                retryMultiplier: 2,
                models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
            },
            gemini: {
                name: 'Gemini',
                maxTokensPerRequest: 8192,  // Current working limit
                maxRequestsPerMinute: 15,   // Based on our experience
                maxRequestsPerHour: 200,    // Conservative
                maxRequestsPerDay: 1000,    // Conservative
                baseDelay: 2000,            // 2s base delay
                maxRetries: 5,
                retryMultiplier: 1.5,
                models: ['gemini-1.5-flash', 'gemini-1.5-pro']
            },
            ollama: {
                name: 'Ollama (Local)',
                maxTokensPerRequest: 32768, // Local, no real limit
                maxRequestsPerMinute: 60,   // CPU dependent
                maxRequestsPerHour: 1000,   // No real limit
                maxRequestsPerDay: 10000,   // No real limit
                baseDelay: 100,             // Very fast
                maxRetries: 2,
                retryMultiplier: 1,
                models: ['qwen2.5-coder:3b', 'gemma2:2b', 'qwen2.5:3b', 'qwen2:7b']
            }
        };
        
        // Track usage per provider
        this.usage = {};
        this.requestQueues = {};
        
        // Initialize tracking for each provider
        Object.keys(this.providers).forEach(provider => {
            this.usage[provider] = {
                minute: { count: 0, resetTime: Date.now() + 60000 },
                hour: { count: 0, resetTime: Date.now() + 3600000 },
                day: { count: 0, resetTime: Date.now() + 86400000 },
                totalRequests: 0,
                totalTokens: 0,
                errors: 0,
                retries: 0
            };
            this.requestQueues[provider] = [];
        });
        
        // Start cleanup interval
        this.startCleanupInterval();
    }
    
    // Get provider configuration
    getProviderConfig(provider) {
        if (!this.providers[provider]) {
            throw new Error(`Unknown provider: ${provider}`);
        }
        return this.providers[provider];
    }
    
    // Check if request can be made
    canMakeRequest(provider, tokenCount = 0) {
        const config = this.getProviderConfig(provider);
        const usage = this.usage[provider];
        const now = Date.now();
        
        // Reset counters if time periods have passed
        if (now > usage.minute.resetTime) {
            usage.minute = { count: 0, resetTime: now + 60000 };
        }
        if (now > usage.hour.resetTime) {
            usage.hour = { count: 0, resetTime: now + 3600000 };
        }
        if (now > usage.day.resetTime) {
            usage.day = { count: 0, resetTime: now + 86400000 };
        }
        
        // Check limits
        const checks = [
            { limit: config.maxRequestsPerMinute, current: usage.minute.count, period: 'minute' },
            { limit: config.maxRequestsPerHour, current: usage.hour.count, period: 'hour' },
            { limit: config.maxRequestsPerDay, current: usage.day.count, period: 'day' },
            { limit: config.maxTokensPerRequest, current: tokenCount, period: 'request' }
        ];
        
        for (const check of checks) {
            if (check.current >= check.limit) {
                return {
                    allowed: false,
                    reason: `${config.name} ${check.period} limit exceeded`,
                    waitTime: check.period === 'request' ? 0 : this.getWaitTime(provider, check.period)
                };
            }
        }
        
        return { allowed: true };
    }
    
    // Calculate wait time until next available slot
    getWaitTime(provider, period) {
        const usage = this.usage[provider];
        const now = Date.now();
        
        switch (period) {
            case 'minute':
                return Math.max(0, usage.minute.resetTime - now);
            case 'hour':
                return Math.max(0, usage.hour.resetTime - now);
            case 'day':
                return Math.max(0, usage.day.resetTime - now);
            default:
                return 0;
        }
    }
    
    // Record successful request
    recordRequest(provider, tokenCount = 0) {
        const usage = this.usage[provider];
        
        usage.minute.count++;
        usage.hour.count++;
        usage.day.count++;
        usage.totalRequests++;
        usage.totalTokens += tokenCount;
        
        this.emit('requestRecorded', {
            provider,
            tokenCount,
            usage: { ...usage }
        });
    }
    
    // Record error
    recordError(provider, error) {
        this.usage[provider].errors++;
        this.emit('errorRecorded', { provider, error });
    }
    
    // Record retry
    recordRetry(provider) {
        this.usage[provider].retries++;
        this.emit('retryRecorded', { provider });
    }
    
    // Make rate-limited request
    async makeRequest(provider, requestFn, tokenCount = 0, retryCount = 0) {
        const config = this.getProviderConfig(provider);
        
        // Check if request is allowed
        const canRequest = this.canMakeRequest(provider, tokenCount);
        if (!canRequest.allowed) {
            if (canRequest.waitTime > 0) {
                console.log(`⏳ ${config.name}: Rate limited, waiting ${Math.round(canRequest.waitTime/1000)}s...`);
                await this.sleep(canRequest.waitTime);
                return this.makeRequest(provider, requestFn, tokenCount, retryCount);
            } else {
                throw new Error(canRequest.reason);
            }
        }
        
        // Add base delay between requests
        if (config.baseDelay > 0) {
            await this.sleep(config.baseDelay);
        }
        
        try {
            const result = await requestFn();
            this.recordRequest(provider, tokenCount);
            
            console.log(`✅ ${config.name}: Request successful (${tokenCount} tokens)`);
            return result;
            
        } catch (error) {
            this.recordError(provider, error);
            
            // Check if we should retry
            if (retryCount < config.maxRetries && this.shouldRetry(error)) {
                this.recordRetry(provider);
                const delay = config.baseDelay * Math.pow(config.retryMultiplier, retryCount);
                
                console.log(`🔄 ${config.name}: Retry ${retryCount + 1}/${config.maxRetries} in ${delay}ms`);
                await this.sleep(delay);
                
                return this.makeRequest(provider, requestFn, tokenCount, retryCount + 1);
            }
            
            console.error(`❌ ${config.name}: Request failed after ${retryCount} retries:`, error.message);
            throw error;
        }
    }
    
    // Determine if error is retryable
    shouldRetry(error) {
        const retryableErrors = [
            'rate limit',
            'quota exceeded',
            'service unavailable',
            'timeout',
            'temporary failure',
            'overloaded',
            '503',
            '429',
            '500',
            '502',
            '504'
        ];
        
        const errorMessage = error.message.toLowerCase();
        return retryableErrors.some(msg => errorMessage.includes(msg));
    }
    
    // Sleep utility
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Get usage statistics
    getUsageStats(provider = null) {
        if (provider) {
            const config = this.getProviderConfig(provider);
            const usage = this.usage[provider];
            
            return {
                provider: config.name,
                usage,
                limits: {
                    requestsPerMinute: config.maxRequestsPerMinute,
                    requestsPerHour: config.maxRequestsPerHour,
                    requestsPerDay: config.maxRequestsPerDay,
                    tokensPerRequest: config.maxTokensPerRequest
                }
            };
        }
        
        // Return stats for all providers
        const stats = {};
        Object.keys(this.providers).forEach(p => {
            stats[p] = this.getUsageStats(p);
        });
        return stats;
    }
    
    // Choose best provider for request
    chooseBestProvider(tokenCount = 0, preferredProviders = []) {
        const candidates = preferredProviders.length > 0 ? 
            preferredProviders : Object.keys(this.providers);
        
        const available = candidates.filter(provider => {
            const canRequest = this.canMakeRequest(provider, tokenCount);
            return canRequest.allowed;
        });
        
        if (available.length === 0) {
            // Find provider with shortest wait time
            const waitTimes = candidates.map(provider => ({
                provider,
                waitTime: this.getWaitTime(provider, 'minute')
            }));
            
            waitTimes.sort((a, b) => a.waitTime - b.waitTime);
            return {
                provider: waitTimes[0].provider,
                waitTime: waitTimes[0].waitTime
            };
        }
        
        // Prefer providers with higher token limits and lower usage
        available.sort((a, b) => {
            const configA = this.providers[a];
            const configB = this.providers[b];
            const usageA = this.usage[a];
            const usageB = this.usage[b];
            
            // Factor in token capacity and current usage
            const scoreA = configA.maxTokensPerRequest - (usageA.minute.count * 10);
            const scoreB = configB.maxTokensPerRequest - (usageB.minute.count * 10);
            
            return scoreB - scoreA;
        });
        
        return { provider: available[0], waitTime: 0 };
    }
    
    // Start cleanup interval
    startCleanupInterval() {
        setInterval(() => {
            const now = Date.now();
            Object.keys(this.usage).forEach(provider => {
                const usage = this.usage[provider];
                
                // Reset expired counters
                if (now > usage.minute.resetTime) {
                    usage.minute = { count: 0, resetTime: now + 60000 };
                }
                if (now > usage.hour.resetTime) {
                    usage.hour = { count: 0, resetTime: now + 3600000 };
                }
                if (now > usage.day.resetTime) {
                    usage.day = { count: 0, resetTime: now + 86400000 };
                }
            });
        }, 10000); // Check every 10 seconds
    }
    
    // Save usage statistics to file
    async saveUsageStats(filePath) {
        const stats = {
            timestamp: new Date().toISOString(),
            providers: this.getUsageStats()
        };
        
        await fs.writeJson(filePath, stats, { spaces: 2 });
        console.log(`📊 Usage stats saved to ${filePath}`);
    }
    
    // Load usage statistics from file
    async loadUsageStats(filePath) {
        try {
            if (await fs.pathExists(filePath)) {
                const stats = await fs.readJson(filePath);
                console.log(`📊 Loaded usage stats from ${stats.timestamp}`);
                return stats;
            }
        } catch (error) {
            console.warn(`⚠️  Could not load usage stats: ${error.message}`);
        }
        return null;
    }
}

export default MultiProviderRateLimiter;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const limiter = new MultiProviderRateLimiter();
    
    // Test all providers
    console.log('🧪 Testing Multi-Provider Rate Limiter...\n');
    
    const providers = ['groq', 'openai', 'gemini', 'ollama'];
    
    for (const provider of providers) {
        console.log(`\n--- ${provider.toUpperCase()} ---`);
        
        const canRequest = limiter.canMakeRequest(provider, 1000);
        console.log('Can make request:', canRequest);
        
        const stats = limiter.getUsageStats(provider);
        console.log('Current usage:', {
            minute: stats.usage.minute.count,
            hour: stats.usage.hour.count,
            day: stats.usage.day.count
        });
        
        console.log('Limits:', stats.limits);
    }
    
    // Test provider selection
    console.log('\n--- PROVIDER SELECTION ---');
    const best = limiter.chooseBestProvider(2000, ['groq', 'gemini']);
    console.log('Best provider for 2000 tokens:', best);
    
    const bestAny = limiter.chooseBestProvider(500);
    console.log('Best provider for 500 tokens:', bestAny);
}
