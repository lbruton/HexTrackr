#!/usr/bin/env node

/**
 * Model Benchmarking Tool for Documentation Generation
 * 
 * Tests different LLM models on the same analysis task to compare:
 * - Memory usage
 * - Response quality
 * - JSON format compliance
 * - Speed/performance
 * - Accuracy of code analysis
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

const CONFIG = {
    OLLAMA_HOST: 'http://localhost:11434',
    OUTPUT_DIR: 'model-benchmark-results',
    
    // Models to test
    MODELS_TO_TEST: [
        'qwen2.5-coder:7b',
        'llama3.1:8b', 
        'llama3.1:70b',
        'mistral:7b',
        'gemma2:9b'
    ],
    
    // Test file for consistent comparison
    TEST_FILE: 'enhanced-scribe-console.js'
};

console.log('🏁 Starting Model Benchmark for Documentation Generation');
console.log(`📊 Testing ${CONFIG.MODELS_TO_TEST.length} models`);
console.log(`📁 Test file: ${CONFIG.TEST_FILE}`);

class ModelBenchmark {
    constructor() {
        this.results = new Map();
        this.testContent = '';
        this.testPrompt = '';
    }

    async initialize() {
        // Create output directory
        await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
        
        // Load test file
        try {
            this.testContent = await fs.readFile(CONFIG.TEST_FILE, 'utf8');
            console.log(`✅ Loaded test file: ${CONFIG.TEST_FILE} (${this.testContent.length} chars)`);
        } catch (error) {
            console.error(`❌ Failed to load test file: ${error.message}`);
            process.exit(1);
        }
        
        // Prepare consistent test prompt
        this.testPrompt = `Analyze this JavaScript file and return ONLY valid JSON in this exact format:

{
  "fileInfo": {
    "name": "${CONFIG.TEST_FILE}",
    "type": "javascript",
    "summary": "Brief description of what this file does"
  },
  "functions": [
    {
      "name": "functionName",
      "parameters": ["param1", "param2"],
      "description": "What this function does",
      "complexity": "low|medium|high"
    }
  ],
  "classes": [
    {
      "name": "ClassName", 
      "methods": ["method1", "method2"],
      "description": "What this class does"
    }
  ],
  "imports": [
    {
      "module": "moduleName",
      "from": "source"
    }
  ],
  "purpose": "Overall purpose of this file"
}

Return ONLY the JSON object, no additional text or explanations.

File content (first 2000 chars):
${this.testContent.substring(0, 2000)}`;
    }

    async callModel(modelName, prompt) {
        const startTime = Date.now();
        const startMemory = process.memoryUsage();
        
        try {
            console.log(`🤖 Testing ${modelName}...`);
            
            const response = await fetch(`${CONFIG.OLLAMA_HOST}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelName,
                    messages: [{ 
                        role: "user", 
                        content: prompt 
                    }],
                    stream: false,
                    options: {
                        temperature: 0.2,
                        num_predict: 2048
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const endTime = Date.now();
            const endMemory = process.memoryUsage();
            
            const result = {
                model: modelName,
                success: true,
                response: data.message?.content || '',
                responseTime: endTime - startTime,
                memoryDelta: {
                    rss: endMemory.rss - startMemory.rss,
                    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                    external: endMemory.external - startMemory.external
                },
                timestamp: new Date().toISOString()
            };
            
            // Try to parse as JSON to test format compliance
            try {
                const parsed = JSON.parse(result.response);
                result.jsonValid = true;
                result.analysisQuality = this.assessAnalysisQuality(parsed);
            } catch (parseError) {
                result.jsonValid = false;
                result.parseError = parseError.message;
            }
            
            console.log(`✅ ${modelName}: ${result.responseTime}ms, JSON valid: ${result.jsonValid}`);
            return result;
            
        } catch (error) {
            const endTime = Date.now();
            console.log(`❌ ${modelName}: Failed - ${error.message}`);
            
            return {
                model: modelName,
                success: false,
                error: error.message,
                responseTime: endTime - startTime,
                timestamp: new Date().toISOString()
            };
        }
    }

    assessAnalysisQuality(parsed) {
        const quality = {
            score: 0,
            details: {}
        };
        
        // Check required fields
        if (parsed.fileInfo) quality.score += 20;
        if (parsed.functions && Array.isArray(parsed.functions)) {
            quality.score += 30;
            quality.details.functionsFound = parsed.functions.length;
        }
        if (parsed.classes && Array.isArray(parsed.classes)) {
            quality.score += 20;
            quality.details.classesFound = parsed.classes.length;
        }
        if (parsed.imports && Array.isArray(parsed.imports)) {
            quality.score += 15;
            quality.details.importsFound = parsed.imports.length;
        }
        if (parsed.purpose) {
            quality.score += 15;
            quality.details.hasPurpose = true;
        }
        
        return quality;
    }

    async runBenchmark() {
        console.log('\n🚀 Starting benchmark tests...\n');
        
        for (const modelName of CONFIG.MODELS_TO_TEST) {
            try {
                const result = await this.callModel(modelName, this.testPrompt);
                this.results.set(modelName, result);
                
                // Save individual result
                const resultFile = path.join(CONFIG.OUTPUT_DIR, `${modelName.replace(':', '_')}.json`);
                await fs.writeFile(resultFile, JSON.stringify(result, null, 2), 'utf8');
                
                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`❌ Failed to test ${modelName}: ${error.message}`);
            }
        }
    }

    generateComparison() {
        console.log('\n📊 BENCHMARK RESULTS COMPARISON\n');
        console.log('═'.repeat(80));
        
        const successful = Array.from(this.results.values()).filter(r => r.success);
        
        if (successful.length === 0) {
            console.log('❌ No successful tests to compare');
            return;
        }
        
        // Sort by overall score (speed + JSON compliance + quality)
        successful.sort((a, b) => {
            const scoreA = this.calculateOverallScore(a);
            const scoreB = this.calculateOverallScore(b);
            return scoreB - scoreA;
        });
        
        console.log('🏆 RANKING (Best to Worst):\n');
        
        successful.forEach((result, index) => {
            const rank = index + 1;
            const score = this.calculateOverallScore(result);
            const memoryMB = Math.round(result.memoryDelta.rss / 1024 / 1024 * 100) / 100;
            
            console.log(`${rank}. ${result.model}`);
            console.log(`   ⏱️  Response Time: ${result.responseTime}ms`);
            console.log(`   🧠 Memory Usage: ${memoryMB}MB`);
            console.log(`   ✅ JSON Valid: ${result.jsonValid}`);
            if (result.analysisQuality) {
                console.log(`   📊 Analysis Quality: ${result.analysisQuality.score}/100`);
                console.log(`   🔧 Functions Found: ${result.analysisQuality.details.functionsFound || 0}`);
                console.log(`   📦 Classes Found: ${result.analysisQuality.details.classesFound || 0}`);
            }
            console.log(`   🎯 Overall Score: ${score}/100`);
            console.log('');
        });
        
        // Best model recommendation
        const winner = successful[0];
        console.log('🥇 RECOMMENDED MODEL FOR DOCUMENTATION:');
        console.log(`   ${winner.model}`);
        console.log(`   Reason: Best combination of speed, format compliance, and analysis quality`);
        console.log('');
        
        return winner.model;
    }

    calculateOverallScore(result) {
        if (!result.success) return 0;
        
        let score = 0;
        
        // Speed score (faster = better, max 30 points)
        const speedScore = Math.max(0, 30 - (result.responseTime / 1000 * 5));
        score += speedScore;
        
        // JSON compliance (30 points if valid)
        score += result.jsonValid ? 30 : 0;
        
        // Analysis quality (up to 40 points)
        if (result.analysisQuality) {
            score += (result.analysisQuality.score / 100) * 40;
        }
        
        return Math.round(score);
    }

    async saveDetailedReport() {
        const report = {
            benchmarkInfo: {
                timestamp: new Date().toISOString(),
                testFile: CONFIG.TEST_FILE,
                modelsTestedCount: this.results.size,
                ollmaHost: CONFIG.OLLAMA_HOST
            },
            results: Array.from(this.results.values()),
            winner: this.generateWinnerAnalysis()
        };
        
        const reportPath = path.join(CONFIG.OUTPUT_DIR, 'benchmark-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
        
        console.log(`📋 Detailed report saved: ${reportPath}`);
        return reportPath;
    }

    generateWinnerAnalysis() {
        const successful = Array.from(this.results.values()).filter(r => r.success);
        if (successful.length === 0) return null;
        
        successful.sort((a, b) => {
            const scoreA = this.calculateOverallScore(a);
            const scoreB = this.calculateOverallScore(b);
            return scoreB - scoreA;
        });
        
        return {
            model: successful[0].model,
            reasons: [
                `Fastest response time: ${successful[0].responseTime}ms`,
                `JSON compliance: ${successful[0].jsonValid}`,
                `Analysis quality: ${successful[0].analysisQuality?.score || 0}/100`,
                `Memory efficient: ${Math.round(successful[0].memoryDelta.rss / 1024 / 1024 * 100) / 100}MB`
            ]
        };
    }
}

// Run benchmark if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const benchmark = new ModelBenchmark();
    
    try {
        await benchmark.initialize();
        await benchmark.runBenchmark();
        const winner = benchmark.generateComparison();
        await benchmark.saveDetailedReport();
        
        console.log(`\n🎉 Benchmark complete! Winner: ${winner}`);
        console.log(`📁 Results saved in: ${CONFIG.OUTPUT_DIR}/`);
        
    } catch (error) {
        console.error(`❌ Benchmark failed: ${error.message}`);
        process.exit(1);
    }
}

export default ModelBenchmark;
