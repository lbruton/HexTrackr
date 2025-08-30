#!/usr/bin/env node

// Rate Limiter - Smart API Request Management
// Handles auto rate limiting, exponential backoff, and request queuing

import fs from 'fs-extra';
import path from 'path';

class RateLimiter {
    constructor(options = {}) {
        this.name = options.name || 'default';
        this.maxRequestsPerMinute = options.maxRequestsPerMinute || options.requestsPerMinute || 15;
        this.maxRequestsPerHour = options.maxRequestsPerHour || options.requestsPerHour || 500;
        this.maxRetries = options.maxRetries || 3;
        this.baseDelay = options.baseDelay || 1000; // 1 second base delay
        this.maxDelay = options.maxDelay || 60000; // 60 seconds max delay
        
        // Track requests and timing
        this.requestHistory = [];
        this.queue = [];
        this.isProcessing = false;
        this.retryCount = new Map();
        
        // Load persistent state if available
        this.stateFile = path.join(process.cwd(), `.rate-limiter-${this.name}.json`);
        this.loadState();
        
        console.log(`🚦 Rate Limiter "${this.name}" initialized:`);
        console.log(`   • ${this.maxRequestsPerMinute} requests/minute`);
        console.log(`   • ${this.maxRequestsPerHour} requests/hour`);
        console.log(`   • ${this.maxRetries} max retries with exponential backoff`);
    }

    loadState() {
        try {
            if (fs.existsSync(this.stateFile)) {
                const state = fs.readJsonSync(this.stateFile);
                // Only load recent history (last hour)
                const oneHourAgo = Date.now() - (60 * 60 * 1000);
                this.requestHistory = state.requestHistory.filter(req => req.timestamp > oneHourAgo);
                console.log(`📊 Loaded ${this.requestHistory.length} recent requests from state`);
            }
        } catch (error) {
            console.warn(`⚠️  Could not load rate limiter state: ${error.message}`);
            this.requestHistory = [];
        }
    }

    saveState() {
        try {
            const state = {
                requestHistory: this.requestHistory,
                lastSaved: Date.now()
            };
            fs.writeJsonSync(this.stateFile, state, { spaces: 2 });
        } catch (error) {
            console.warn(`⚠️  Could not save rate limiter state: ${error.message}`);
        }
    }

    cleanupHistory() {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const oneMinuteAgo = Date.now() - (60 * 1000);
        
        // Remove old requests
        this.requestHistory = this.requestHistory.filter(req => req.timestamp > oneHourAgo);
        
        // Clean up retry counts for old requests
        for (const [key, data] of this.retryCount.entries()) {
            if (data.firstAttempt < oneMinuteAgo) {
                this.retryCount.delete(key);
            }
        }
    }

    getCurrentLimits() {
        const now = Date.now();
        const oneMinuteAgo = now - (60 * 1000);
        const oneHourAgo = now - (60 * 60 * 1000);

        const requestsLastMinute = this.requestHistory.filter(req => req.timestamp > oneMinuteAgo).length;
        const requestsLastHour = this.requestHistory.filter(req => req.timestamp > oneHourAgo).length;

        return {
            requestsLastMinute,
            requestsLastHour,
            minuteLimit: this.maxRequestsPerMinute,
            hourLimit: this.maxRequestsPerHour,
            canMakeRequest: requestsLastMinute < this.maxRequestsPerMinute && requestsLastHour < this.maxRequestsPerHour
        };
    }

    calculateDelay(retryAttempt = 0, isRateLimit = false) {
        if (isRateLimit) {
            // For rate limits, wait longer
            const rateLimitDelay = Math.min(30000 + (retryAttempt * 15000), 120000); // 30s to 2min
            return rateLimitDelay;
        }
        
        // Exponential backoff for other errors
        const exponentialDelay = Math.min(this.baseDelay * Math.pow(2, retryAttempt), this.maxDelay);
        const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
        return exponentialDelay + jitter;
    }

    async makeRequest(requestFn, requestId = null) {
        return new Promise((resolve, reject) => {
            const request = {
                id: requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                fn: requestFn,
                resolve,
                reject,
                timestamp: Date.now(),
                attempts: 0
            };

            this.queue.push(request);
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.queue.length > 0) {
            this.cleanupHistory();
            const limits = this.getCurrentLimits();
            
            if (!limits.canMakeRequest) {
                const waitTime = this.calculateWaitTime(limits);
                console.log(`⏳ Rate limit reached. Waiting ${Math.round(waitTime/1000)}s...`);
                console.log(`   📊 Current: ${limits.requestsLastMinute}/${limits.minuteLimit} per minute, ${limits.requestsLastHour}/${limits.hourLimit} per hour`);
                
                await this.sleep(waitTime);
                continue;
            }

            const request = this.queue.shift();
            await this.executeRequest(request);
        }
        
        this.isProcessing = false;
        this.saveState();
    }

    calculateWaitTime(limits) {
        const now = Date.now();
        
        if (limits.requestsLastMinute >= limits.minuteLimit) {
            // Find oldest request in last minute and wait until it's > 1 minute old
            const oneMinuteAgo = now - (60 * 1000);
            const recentRequests = this.requestHistory
                .filter(req => req.timestamp > oneMinuteAgo)
                .sort((a, b) => a.timestamp - b.timestamp);
            
            if (recentRequests.length > 0) {
                const oldestRecent = recentRequests[0];
                return Math.max(1000, (oldestRecent.timestamp + 61000) - now); // Wait 61s from oldest
            }
        }
        
        // Default wait time
        return 5000; // 5 seconds
    }

    async executeRequest(request) {
        try {
            request.attempts++;
            
            console.log(`🚀 Executing request ${request.id} (attempt ${request.attempts})`);
            
            const result = await request.fn();
            
            // Record successful request
            this.requestHistory.push({
                id: request.id,
                timestamp: Date.now(),
                success: true
            });
            
            // Clean up retry tracking
            this.retryCount.delete(request.id);
            
            request.resolve(result);
            
        } catch (error) {
            await this.handleRequestError(request, error);
        }
    }

    async handleRequestError(request, error) {
        const isRateLimit = this.isRateLimitError(error);
        const isRetryable = this.isRetryableError(error);
        
        console.log(`❌ Request ${request.id} failed (attempt ${request.attempts}): ${error.message}`);
        
        if (isRetryable && request.attempts < this.maxRetries) {
            const retryDelay = this.calculateDelay(request.attempts - 1, isRateLimit);
            
            console.log(`🔄 Retrying in ${Math.round(retryDelay/1000)}s... (${request.attempts}/${this.maxRetries})`);
            
            // Track retry attempts
            if (!this.retryCount.has(request.id)) {
                this.retryCount.set(request.id, {
                    firstAttempt: Date.now(),
                    attempts: 0
                });
            }
            this.retryCount.get(request.id).attempts++;
            
            await this.sleep(retryDelay);
            
            // Put request back in queue for retry
            this.queue.unshift(request);
        } else {
            // Record failed request
            this.requestHistory.push({
                id: request.id,
                timestamp: Date.now(),
                success: false,
                error: error.message
            });
            
            request.reject(error);
        }
    }

    isRateLimitError(error) {
        if (!error.response) return false;
        
        const status = error.response.status;
        const message = error.response.data ? JSON.stringify(error.response.data).toLowerCase() : '';
        
        return (
            status === 429 || 
            status === 503 ||
            message.includes('rate limit') ||
            message.includes('quota') ||
            message.includes('overloaded') ||
            message.includes('too many requests')
        );
    }

    isRetryableError(error) {
        if (!error.response) return true; // Network errors are retryable
        
        const status = error.response.status;
        
        // Don't retry client errors (4xx except 429) or permanent failures
        if (status >= 400 && status < 500 && status !== 429) {
            return false;
        }
        
        return true; // Retry server errors (5xx) and rate limits (429)
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStats() {
        const limits = this.getCurrentLimits();
        return {
            name: this.name,
            queueLength: this.queue.length,
            isProcessing: this.isProcessing,
            limits,
            retryCount: this.retryCount.size,
            historyLength: this.requestHistory.length
        };
    }

    async shutdown() {
        console.log(`🛑 Shutting down rate limiter "${this.name}"`);
        
        // Wait for current processing to finish
        while (this.isProcessing) {
            await this.sleep(100);
        }
        
        this.saveState();
        console.log(`💾 State saved for ${this.requestHistory.length} requests`);
    }
}

export default RateLimiter;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚦 Rate Limiter Module');
    console.log('Import this module to use in your applications.');
}
