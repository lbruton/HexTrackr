#!/usr/bin/env node

// Fast Groq Rate Limiter - Optimized for speed
// Minimal delays, aggressive limits for Groq's high performance

import fs from 'fs-extra';
import path from 'path';

class FastGroqRateLimiter {
    constructor(options = {}) {
        this.name = options.name || 'groq-fast';
        this.maxRequestsPerMinute = options.maxRequestsPerMinute || 25;
        this.maxRequestsPerHour = options.maxRequestsPerHour || 900;
        this.maxRetries = options.maxRetries || 2; // Reduced retries
        this.baseDelay = options.baseDelay || 200; // Much faster base delay
        this.maxDelay = options.maxDelay || 2000; // Much lower max delay
        
        // Track requests with simple sliding window
        this.requestTimes = [];
        this.queue = [];
        this.isProcessing = false;
        
        console.log(`⚡ Fast Groq Rate Limiter initialized: ${this.maxRequestsPerMinute}/min, ${this.maxRequestsPerHour}/hour`);
    }

    canMakeRequest() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const oneHourAgo = now - 3600000;
        
        // Clean old requests
        this.requestTimes = this.requestTimes.filter(time => time > oneHourAgo);
        
        const recentRequests = this.requestTimes.filter(time => time > oneMinuteAgo);
        const hourlyRequests = this.requestTimes.length;
        
        const canMake = recentRequests.length < this.maxRequestsPerMinute && 
                       hourlyRequests < this.maxRequestsPerHour;
        
        if (!canMake) {
            console.log(`🚦 Rate limit: ${recentRequests.length}/${this.maxRequestsPerMinute}/min, ${hourlyRequests}/${this.maxRequestsPerHour}/hour`);
        }
        
        return canMake;
    }

    async request(fn, id = null) {
        return new Promise((resolve, reject) => {
            const requestId = id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const request = {
                id: requestId,
                fn,
                resolve,
                reject,
                attempts: 0,
                createdAt: Date.now()
            };
            
            this.queue.push(request);
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.queue.length > 0) {
            if (this.canMakeRequest()) {
                const request = this.queue.shift();
                await this.executeRequest(request);
            } else {
                // Quick wait before checking again
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        this.isProcessing = false;
    }

    async executeRequest(request) {
        try {
            request.attempts++;
            console.log(`⚡ Executing Groq request ${request.id} (attempt ${request.attempts})`);
            
            const startTime = Date.now();
            const result = await request.fn();
            const duration = Date.now() - startTime;
            
            // Record successful request
            this.requestTimes.push(Date.now());
            console.log(`✅ Groq request completed in ${duration}ms`);
            
            request.resolve(result);
            
        } catch (error) {
            await this.handleError(request, error);
        }
    }

    async handleError(request, error) {
        const isRateLimit = this.isRateLimitError(error);
        const shouldRetry = request.attempts < this.maxRetries && (isRateLimit || this.isRetryableError(error));
        
        console.log(`❌ Groq request ${request.id} failed (attempt ${request.attempts}): ${error.message}`);
        
        if (shouldRetry) {
            const delay = this.calculateDelay(request.attempts - 1, isRateLimit);
            console.log(`⏱️  Retrying in ${delay}ms...`);
            
            setTimeout(() => {
                this.queue.unshift(request); // Put back at front of queue
                this.processQueue();
            }, delay);
        } else {
            console.log(`💥 Request ${request.id} failed permanently after ${request.attempts} attempts`);
            request.reject(error);
        }
    }

    isRateLimitError(error) {
        if (!error.response) return false;
        
        const status = error.response.status;
        const data = error.response.data || {};
        const message = JSON.stringify(data).toLowerCase();
        
        return (
            status === 429 || 
            status === 503 ||
            message.includes('rate limit') ||
            message.includes('quota') ||
            message.includes('too many requests')
        );
    }

    isRetryableError(error) {
        if (!error.response) return true; // Network errors
        
        const status = error.response.status;
        return status >= 500 || status === 429; // Server errors and rate limits
    }

    calculateDelay(attempt, isRateLimit = false) {
        if (isRateLimit) {
            return Math.min(this.baseDelay * Math.pow(2, attempt), this.maxDelay);
        }
        
        // Much faster for non-rate-limit errors
        return Math.min(this.baseDelay, 1000);
    }

    getStats() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const recentRequests = this.requestTimes.filter(time => time > oneMinuteAgo);
        
        return {
            name: this.name,
            queueLength: this.queue.length,
            isProcessing: this.isProcessing,
            limits: {
                requestsLastMinute: recentRequests.length,
                requestsLastHour: this.requestTimes.length,
                minuteLimit: this.maxRequestsPerMinute,
                hourLimit: this.maxRequestsPerHour,
                canMakeRequest: this.canMakeRequest()
            }
        };
    }
}

export default FastGroqRateLimiter;
