#!/usr/bin/env node

// Rate Limiter Test & Monitor
// Test rate limiting functionality and monitor API usage

import RateLimiter from './rate-limiter.js';
import axios from 'axios';

class RateLimiterTester {
    constructor() {
        this.geminiLimiter = new RateLimiter({
            name: 'gemini-test',
            maxRequestsPerMinute: 5,  // Conservative for testing
            maxRequestsPerHour: 100,
            maxRetries: 2,
            baseDelay: 1000
        });
        
        this.groqLimiter = new RateLimiter({
            name: 'groq-test',
            maxRequestsPerMinute: 15,
            maxRequestsPerHour: 500,
            maxRetries: 3,
            baseDelay: 500
        });
    }

    async testBasicFunctionality() {
        console.log('🧪 Testing basic rate limiter functionality...');
        
        // Create mock request function
        let requestCount = 0;
        const mockRequest = async () => {
            requestCount++;
            console.log(`   📞 Mock request #${requestCount}`);
            
            // Simulate random failures
            if (Math.random() < 0.2) {
                const error = new Error('Mock API error');
                error.response = { status: 503, data: { message: 'Service overloaded' } };
                throw error;
            }
            
            return { success: true, requestNumber: requestCount };
        };

        try {
            // Test multiple requests
            const promises = [];
            for (let i = 0; i < 8; i++) {
                promises.push(this.geminiLimiter.makeRequest(mockRequest, `test-${i}`));
            }

            const results = await Promise.allSettled(promises);
            
            console.log('✅ Test Results:');
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    console.log(`   ✓ Request ${index}: Success`);
                } else {
                    console.log(`   ✗ Request ${index}: Failed - ${result.reason.message}`);
                }
            });
            
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    }

    async testRateLimitDetection() {
        console.log('\n🔍 Testing rate limit detection...');
        
        const testErrors = [
            { status: 429, data: { message: 'Rate limit exceeded' } },
            { status: 503, data: { message: 'Service temporarily overloaded' } },
            { status: 500, data: { message: 'Internal server error' } },
            { status: 400, data: { message: 'Bad request' } },
        ];

        testErrors.forEach((errorResponse, index) => {
            const error = new Error('Test error');
            error.response = errorResponse;
            
            const isRateLimit = this.geminiLimiter.isRateLimitError(error);
            const isRetryable = this.geminiLimiter.isRetryableError(error);
            
            console.log(`   Error ${index + 1} (${errorResponse.status}): Rate Limit=${isRateLimit}, Retryable=${isRetryable}`);
        });
    }

    async monitorLimiter(limiter, duration = 30000) {
        console.log(`\n📊 Monitoring rate limiter "${limiter.name}" for ${duration/1000}s...`);
        
        const startTime = Date.now();
        const monitorInterval = setInterval(() => {
            const stats = limiter.getStats();
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            
            console.log(`[${elapsed}s] Queue: ${stats.queueLength} | Processing: ${stats.isProcessing} | Requests: ${stats.limits.requestsLastMinute}/${stats.limits.minuteLimit}/min`);
        }, 2000);

        setTimeout(() => {
            clearInterval(monitorInterval);
            console.log(`✅ Monitoring complete for "${limiter.name}"`);
        }, duration);
    }

    async stressTest() {
        console.log('\n🔥 Running stress test...');
        
        const stressRequest = async () => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
            
            if (Math.random() < 0.3) {
                const error = new Error('Stress test error');
                error.response = { status: 503, data: { message: 'Overloaded' } };
                throw error;
            }
            
            return { timestamp: Date.now() };
        };

        // Start monitoring
        this.monitorLimiter(this.geminiLimiter, 20000);

        // Send burst of requests
        const promises = [];
        for (let i = 0; i < 20; i++) {
            promises.push(
                this.geminiLimiter.makeRequest(stressRequest, `stress-${i}`)
                    .catch(error => ({ error: error.message }))
            );
        }

        console.log(`🚀 Sent ${promises.length} stress test requests`);
        
        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
        
        console.log(`📈 Stress test complete: ${successful}/${results.length} successful`);
    }

    async demonstrateChunking() {
        console.log('\n📦 Demonstrating file chunking simulation...');
        
        // Simulate processing a large file
        const chunks = Array.from({ length: 12 }, (_, i) => ({
            id: `chunk-${i + 1}`,
            size: Math.floor(Math.random() * 1000) + 500
        }));

        console.log(`Processing ${chunks.length} chunks...`);
        
        const chunkRequest = async (chunk) => {
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
            
            // Larger chunks more likely to fail
            if (chunk.size > 800 && Math.random() < 0.4) {
                const error = new Error('Chunk too large');
                error.response = { status: 503, data: { message: 'Request too large' } };
                throw error;
            }
            
            return { processed: chunk.id, size: chunk.size };
        };

        const results = [];
        for (const chunk of chunks) {
            try {
                const result = await this.geminiLimiter.makeRequest(() => chunkRequest(chunk), chunk.id);
                results.push(result);
                console.log(`   ✅ ${chunk.id} processed (${chunk.size} bytes)`);
            } catch (error) {
                console.log(`   ❌ ${chunk.id} failed: ${error.message}`);
                results.push(null);
            }
        }

        const successful = results.filter(r => r !== null).length;
        console.log(`📊 Chunking demo: ${successful}/${chunks.length} chunks processed successfully`);
    }

    async runAllTests() {
        console.log('🚀 Starting comprehensive rate limiter tests...\n');
        
        await this.testBasicFunctionality();
        await this.testRateLimitDetection();
        await this.stressTest();
        await this.demonstrateChunking();
        
        console.log('\n🎉 All tests complete!');
        
        // Cleanup
        await this.geminiLimiter.shutdown();
        await this.groqLimiter.shutdown();
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new RateLimiterTester();
    const command = process.argv[2];

    switch (command) {
        case 'basic':
            tester.testBasicFunctionality().then(() => process.exit(0));
            break;
        case 'stress':
            tester.stressTest().then(() => process.exit(0));
            break;
        case 'chunk':
            tester.demonstrateChunking().then(() => process.exit(0));
            break;
        case 'monitor':
            const limiter = new RateLimiter({ name: 'monitor-test' });
            tester.monitorLimiter(limiter, 60000).then(() => process.exit(0));
            break;
        default:
            if (command && command !== 'all') {
                console.log('❌ Unknown command:', command);
                console.log('Available commands: basic, stress, chunk, monitor, all');
                process.exit(1);
            }
            tester.runAllTests().then(() => process.exit(0));
    }
}
