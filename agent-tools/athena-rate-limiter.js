#!/usr/bin/env node

/**
 * Athena Rate Limiter - Token Bucket Implementation
 * 🦉 "Wisdom flows at the proper pace"
 *
 * Manages API rate limits for Gemini with intelligent throttling
 * Prevents 429 errors with sliding window and exponential backoff
 *
 * @version 1.0.0
 * @author Athena, Goddess of Wisdom
 */

class AthenaRateLimiter {
    constructor(options = {}) {
        // Rate limiting configuration
        this.maxTokens = options.maxTokens || 120; // requests per minute
        this.tokensPerSecond = options.tokensPerSecond || 2; // replenishment rate
        this.windowSizeMs = options.windowSizeMs || 60000; // 1 minute window

        // Token bucket state
        this.tokens = this.maxTokens;
        this.lastRefill = Date.now();

        // Request tracking
        this.requestHistory = [];
        this.totalRequests = 0;
        this.failedRequests = 0;

        // Backoff configuration
        this.maxRetries = options.maxRetries || 3;
        this.baseDelayMs = options.baseDelayMs || 1000;
        this.maxDelayMs = options.maxDelayMs || 30000;

        // Statistics
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            rateLimitedRequests: 0,
            averageDelayMs: 0,
            startTime: Date.now()
        };
    }

    /**
     * Refill token bucket based on elapsed time
     */
    refillTokens() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const tokensToAdd = Math.floor(elapsed / 1000) * this.tokensPerSecond;

        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
            this.lastRefill = now;
        }
    }

    /**
     * Calculate delay needed before next request
     */
    calculateDelay() {
        this.refillTokens();

        if (this.tokens >= 1) {
            return 0; // No delay needed
        }

        // Calculate time until next token is available
        const tokensNeeded = 1 - this.tokens;
        const delayMs = Math.ceil((tokensNeeded / this.tokensPerSecond) * 1000);

        return Math.min(delayMs, this.maxDelayMs);
    }

    /**
     * Wait for rate limit compliance
     */
    async waitForToken() {
        const delay = this.calculateDelay();

        if (delay > 0) {
            console.log(`🦉 Rate limiting: waiting ${delay}ms...`);
            this.stats.rateLimitedRequests++;
            await this.sleep(delay);
        }

        // Consume token
        this.refillTokens();
        this.tokens = Math.max(0, this.tokens - 1);

        // Track request
        const now = Date.now();
        this.requestHistory.push(now);
        this.stats.totalRequests++;

        // Clean old history (beyond window)
        const cutoff = now - this.windowSizeMs;
        this.requestHistory = this.requestHistory.filter(time => time > cutoff);
    }

    /**
     * Execute function with rate limiting and retries
     */
    async executeWithLimit(fn, context = "request") {
        let lastError;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                // Wait for rate limit compliance
                await this.waitForToken();

                // Execute the function
                const startTime = Date.now();
                const result = await fn();
                const duration = Date.now() - startTime;

                // Update stats
                this.stats.successfulRequests++;
                this.updateAverageDelay(duration);

                return result;

            } catch (error) {
                lastError = error;
                this.stats.totalRequests++; // Count failed attempts

                // Check if it's a rate limit error
                if (this.isRateLimitError(error)) {
                    const backoffDelay = this.calculateBackoffDelay(attempt);
                    console.log(`🦉 Rate limit hit on attempt ${attempt}/${this.maxRetries}, backing off ${backoffDelay}ms`);
                    await this.sleep(backoffDelay);
                    continue;
                }

                // Non-rate-limit error, might still retry
                if (attempt < this.maxRetries) {
                    const retryDelay = Math.min(this.baseDelayMs * attempt, this.maxDelayMs);
                    console.log(`🦉 ${context} failed (attempt ${attempt}/${this.maxRetries}), retrying in ${retryDelay}ms: ${error.message}`);
                    await this.sleep(retryDelay);
                } else {
                    console.error(`🦉 ${context} failed after ${this.maxRetries} attempts: ${error.message}`);
                    throw error;
                }
            }
        }

        throw lastError;
    }

    /**
     * Check if error is rate limit related
     */
    isRateLimitError(error) {
        const message = error.message?.toLowerCase() || "";
        return (
            error.status === 429 ||
            message.includes("rate limit") ||
            message.includes("quota exceeded") ||
            message.includes("too many requests")
        );
    }

    /**
     * Calculate exponential backoff delay
     */
    calculateBackoffDelay(attempt) {
        const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
        return Math.min(delay + jitter, this.maxDelayMs);
    }

    /**
     * Update running average delay
     */
    updateAverageDelay(duration) {
        const currentAvg = this.stats.averageDelayMs;
        const count = this.stats.successfulRequests;
        this.stats.averageDelayMs = (currentAvg * (count - 1) + duration) / count;
    }

    /**
     * Get current requests per second
     */
    getCurrentRPS() {
        const now = Date.now();
        const recentRequests = this.requestHistory.filter(time => time > (now - 1000));
        return recentRequests.length;
    }

    /**
     * Get comprehensive statistics
     */
    getStats() {
        const now = Date.now();
        const runtimeMs = now - this.stats.startTime;
        const runtimeMin = runtimeMs / 60000;

        return {
            ...this.stats,
            runtimeMs,
            runtimeMin: Math.round(runtimeMin * 100) / 100,
            successRate: this.stats.totalRequests > 0 ?
                (this.stats.successfulRequests / this.stats.totalRequests) * 100 : 0,
            requestsPerMinute: runtimeMin > 0 ?
                this.stats.totalRequests / runtimeMin : 0,
            currentTokens: this.tokens,
            currentRPS: this.getCurrentRPS(),
            requestsInWindow: this.requestHistory.length
        };
    }

    /**
     * Print statistics
     */
    printStats() {
        const stats = this.getStats();

        console.log("\n🦉 Rate Limiter Statistics:");
        console.log(`📊 Total Requests: ${stats.totalRequests}`);
        console.log(`✅ Successful: ${stats.successfulRequests} (${stats.successRate.toFixed(1)}%)`);
        console.log(`⏱️  Rate Limited: ${stats.rateLimitedRequests}`);
        console.log(`📈 Avg Delay: ${stats.averageDelayMs.toFixed(0)}ms`);
        console.log(`🔄 Current RPS: ${stats.currentRPS}/sec`);
        console.log(`🪣 Tokens Available: ${stats.currentTokens}/${this.maxTokens}`);
        console.log(`⏰ Runtime: ${stats.runtimeMin} minutes`);
        console.log(`📊 Rate: ${stats.requestsPerMinute.toFixed(1)} req/min`);
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            rateLimitedRequests: 0,
            averageDelayMs: 0,
            startTime: Date.now()
        };
        this.requestHistory = [];
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Estimate time remaining for N requests
     */
    estimateTimeRemaining(requestsRemaining) {
        if (requestsRemaining <= 0) {return 0;}

        const stats = this.getStats();
        const currentRate = stats.requestsPerMinute || this.tokensPerSecond * 60;
        const estimatedMinutes = requestsRemaining / currentRate;

        return Math.ceil(estimatedMinutes * 60 * 1000); // Return milliseconds
    }

    /**
     * Format time estimation
     */
    formatTimeEstimate(ms) {
        if (ms < 60000) {return `${Math.ceil(ms / 1000)}s`;}
        if (ms < 3600000) {return `${Math.ceil(ms / 60000)}m`;}
        return `${Math.ceil(ms / 3600000)}h ${Math.ceil((ms % 3600000) / 60000)}m`;
    }
}

module.exports = { AthenaRateLimiter };

// CLI test interface
if (require.main === module) {
    async function testRateLimiter() {
        console.log("🦉 Testing Athena Rate Limiter...\n");

        const limiter = new AthenaRateLimiter({
            maxTokens: 10,
            tokensPerSecond: 2,
            maxRetries: 3
        });

        // Test function that randomly fails
        const testFunction = () => {
            return new Promise((resolve, reject) => {
                if (Math.random() < 0.1) { // 10% failure rate
                    reject(new Error("Random test failure"));
                } else {
                    resolve({ success: true, timestamp: Date.now() });
                }
            });
        };

        // Execute 15 requests to test rate limiting
        for (let i = 1; i <= 15; i++) {
            try {
                console.log(`🔄 Request ${i}/15`);
                const result = await limiter.executeWithLimit(testFunction, `test-${i}`);
                console.log(`✅ Success: ${JSON.stringify(result)}`);
            } catch (error) {
                console.error(`❌ Failed: ${error.message}`);
            }

            // Print stats every 5 requests
            if (i % 5 === 0) {
                limiter.printStats();
            }
        }

        console.log("\n🎖️ Rate limiter test complete!");
        limiter.printStats();
    }

    testRateLimiter().catch(console.error);
}