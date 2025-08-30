#!/usr/bin/env node

// Enhanced Document Generator with Multi-Provider Support
// Automatically chooses best provider and handles rate limiting

import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import MultiProviderRateLimiter from './multi-provider-rate-limiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

class EnhancedDocumentGenerator {
    constructor() {
        this.configPath = path.join(__dirname, 'system-config.json');
        if (!fs.existsSync(this.configPath)) {
            console.error('❌ Error: system-config.json not found. Please run setup.');
            process.exit(1);
        }
        
        this.config = fs.readJsonSync(this.configPath);
        this.apiConfig = this.config.brainShareSystem.documentManager.api;
        this.rateLimiter = new MultiProviderRateLimiter();
        
        // Check API keys
        this.apiKeys = {
            groq: process.env.GROQ_API_KEY,
            openai: process.env.OPENAI_API_KEY,
            gemini: process.env.GEMINI_API_KEY
        };
        
        // Determine available providers
        this.availableProviders = Object.keys(this.apiKeys).filter(key => this.apiKeys[key]);
        
        if (this.availableProviders.length === 0) {
            console.error('❌ Error: No API keys found. Please add at least one of: GROQ_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY');
            process.exit(1);
        }
        
        console.log(`🔑 Available providers: ${this.availableProviders.join(', ')}`);
    }
    
    // Estimate token count for content
    estimateTokens(text) {
        // Rough estimate: 1 token ≈ 4 characters for English text
        return Math.ceil(text.length / 4);
    }
    
    // Choose best provider for the request
    chooseBestProvider(contentTokens) {
        const preference = this.apiConfig.fallbackOrder || this.availableProviders;
        const available = preference.filter(p => this.availableProviders.includes(p));
        
        const choice = this.rateLimiter.chooseBestProvider(contentTokens, available);
        return choice;
    }
    
    // Make API request with provider fallback
    async makeDocumentRequest(content, provider, retryCount = 0) {
        const providerConfig = this.apiConfig.providers[provider];
        
        if (!providerConfig) {
            throw new Error(`Provider ${provider} not configured`);
        }
        
        const requestFn = async () => {
            if (provider === 'gemini') {
                return this.makeGeminiRequest(content, providerConfig);
            } else {
                return this.makeOpenAICompatibleRequest(content, provider, providerConfig);
            }
        };
        
        const tokenCount = this.estimateTokens(content);
        
        try {
            return await this.rateLimiter.makeRequest(provider, requestFn, tokenCount);
        } catch (error) {
            console.error(`❌ ${provider} failed:`, error.message);
            
            // Try next available provider
            const remaining = this.availableProviders.filter(p => p !== provider);
            if (remaining.length > 0) {
                console.log(`🔄 Falling back to next provider...`);
                const nextChoice = this.rateLimiter.chooseBestProvider(tokenCount, remaining);
                return this.makeDocumentRequest(content, nextChoice.provider, retryCount + 1);
            }
            
            throw new Error(`All providers failed. Last error: ${error.message}`);
        }
    }
    
    // Make Gemini API request
    async makeGeminiRequest(content, config) {
        const prompt = this.buildDocumentationPrompt(content);
        
        const response = await axios.post(
            `${config.endpoint}?key=${this.apiKeys.gemini}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: Math.min(2048, config.maxTokens),
                    topP: 0.8,
                    topK: 10
                }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );
        
        if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid Gemini response format');
        }
        
        return response.data.candidates[0].content.parts[0].text;
    }
    
    // Make OpenAI-compatible request (Groq, OpenAI)
    async makeOpenAICompatibleRequest(content, provider, config) {
        const prompt = this.buildDocumentationPrompt(content);
        
        const response = await axios.post(
            config.endpoint,
            {
                model: config.defaultModel,
                messages: [
                    {
                        role: "system",
                        content: "You are an expert technical documentation generator. Create comprehensive, well-structured documentation in Markdown format."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: Math.min(2048, config.maxTokens),
                temperature: 0.1,
                top_p: 0.8
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKeys[provider]}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        if (!response.data?.choices?.[0]?.message?.content) {
            throw new Error(`Invalid ${provider} response format`);
        }
        
        return response.data.choices[0].message.content;
    }
    
    // Build documentation prompt
    buildDocumentationPrompt(content) {
        return `Please analyze this code file and generate comprehensive documentation in Markdown format.

Focus on:
1. **Purpose & Overview**: What this code does and why it exists
2. **Key Functions/Classes**: Main components and their roles
3. **Dependencies**: Important imports and requirements
4. **Usage Examples**: How to use key functions
5. **Architecture Notes**: Important design decisions
6. **Potential Issues**: Areas that might need attention

Code to analyze:
\`\`\`
${content}
\`\`\`

Please provide clean, well-formatted Markdown documentation.`;
    }
    
    // Generate documentation for a file
    async generateDocumentation(filePath) {
        try {
            console.log(`\n📝 Generating documentation for: ${path.basename(filePath)}`);
            
            if (!await fs.pathExists(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }
            
            const content = await fs.readFile(filePath, 'utf-8');
            
            if (content.length === 0) {
                console.log('⚠️  File is empty, skipping...');
                return null;
            }
            
            // Check if file is too large
            const tokenCount = this.estimateTokens(content);
            console.log(`📊 Estimated tokens: ${tokenCount}`);
            
            if (tokenCount > 8000) {
                console.log('⚠️  File too large, splitting into chunks...');
                return this.generateDocumentationForLargeFile(filePath, content);
            }
            
            // Choose best provider
            const providerChoice = this.chooseBestProvider(tokenCount);
            
            if (providerChoice.waitTime > 0) {
                console.log(`⏳ Waiting ${Math.round(providerChoice.waitTime/1000)}s for rate limits...`);
                await new Promise(resolve => setTimeout(resolve, providerChoice.waitTime));
            }
            
            console.log(`🤖 Using provider: ${providerChoice.provider}`);
            
            // Generate documentation
            const documentation = await this.makeDocumentRequest(content, providerChoice.provider);
            
            // Save documentation
            const outputPath = this.getOutputPath(filePath);
            await fs.ensureDir(path.dirname(outputPath));
            await fs.writeFile(outputPath, documentation, 'utf-8');
            
            console.log(`✅ Documentation saved to: ${outputPath}`);
            
            return {
                filePath,
                outputPath,
                provider: providerChoice.provider,
                tokenCount,
                documentation
            };
            
        } catch (error) {
            console.error(`❌ Failed to generate documentation for ${filePath}:`, error.message);
            return {
                filePath,
                error: error.message,
                provider: null,
                tokenCount: 0
            };
        }
    }
    
    // Handle large files by splitting into sections
    async generateDocumentationForLargeFile(filePath, content) {
        console.log('🔄 Processing large file in chunks...');
        
        // Try to split by functions or logical sections
        const sections = this.splitContentIntoSections(content);
        const results = [];
        
        for (let i = 0; i < sections.length; i++) {
            console.log(`📄 Processing section ${i + 1}/${sections.length}...`);
            
            const sectionTokens = this.estimateTokens(sections[i]);
            if (sectionTokens > 6000) {
                console.log(`⚠️  Section ${i + 1} still too large (${sectionTokens} tokens), skipping...`);
                continue;
            }
            
            const providerChoice = this.chooseBestProvider(sectionTokens);
            if (providerChoice.waitTime > 0) {
                await new Promise(resolve => setTimeout(resolve, providerChoice.waitTime));
            }
            
            try {
                const documentation = await this.makeDocumentRequest(sections[i], providerChoice.provider);
                results.push(documentation);
            } catch (error) {
                console.error(`❌ Section ${i + 1} failed:`, error.message);
                results.push(`<!-- Section ${i + 1} failed to generate: ${error.message} -->`);
            }
        }
        
        // Combine all sections
        const combinedDoc = results.join('\n\n---\n\n');
        
        // Save combined documentation
        const outputPath = this.getOutputPath(filePath);
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, combinedDoc, 'utf-8');
        
        console.log(`✅ Large file documentation saved to: ${outputPath}`);
        
        return {
            filePath,
            outputPath,
            provider: 'multiple',
            tokenCount: this.estimateTokens(content),
            documentation: combinedDoc,
            sections: sections.length
        };
    }
    
    // Split content into manageable sections
    splitContentIntoSections(content) {
        const lines = content.split('\n');
        const sections = [];
        let currentSection = [];
        let currentTokens = 0;
        
        for (const line of lines) {
            const lineTokens = this.estimateTokens(line);
            
            // Start new section if current would be too large
            if (currentTokens + lineTokens > 5000 && currentSection.length > 0) {
                sections.push(currentSection.join('\n'));
                currentSection = [line];
                currentTokens = lineTokens;
            } else {
                currentSection.push(line);
                currentTokens += lineTokens;
            }
        }
        
        // Add final section
        if (currentSection.length > 0) {
            sections.push(currentSection.join('\n'));
        }
        
        return sections;
    }
    
    // Get output path for documentation
    getOutputPath(filePath) {
        const relativePath = path.relative(process.cwd(), filePath);
        const outputDir = path.join(process.cwd(), 'docs', 'generated');
        const outputFile = relativePath.replace(/\.[^.]+$/, '.md');
        return path.join(outputDir, outputFile);
    }
    
    // Generate documentation for multiple files
    async generateBatchDocumentation(filePaths) {
        console.log(`\n🚀 Starting batch documentation generation for ${filePaths.length} files...\n`);
        
        const results = [];
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < filePaths.length; i++) {
            console.log(`\n--- File ${i + 1}/${filePaths.length} ---`);
            
            const result = await this.generateDocumentation(filePaths[i]);
            results.push(result);
            
            if (result.error) {
                errorCount++;
            } else {
                successCount++;
            }
            
            // Show progress stats
            const stats = this.rateLimiter.getUsageStats();
            console.log(`\n📊 Progress: ${successCount} success, ${errorCount} errors`);
            
            // Add delay between files to be nice to APIs
            if (i < filePaths.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Save batch report
        const reportPath = path.join(process.cwd(), 'docs', 'batch-documentation-report.json');
        await fs.ensureDir(path.dirname(reportPath));
        await fs.writeJson(reportPath, {
            timestamp: new Date().toISOString(),
            totalFiles: filePaths.length,
            successCount,
            errorCount,
            results,
            usageStats: this.rateLimiter.getUsageStats()
        }, { spaces: 2 });
        
        console.log(`\n🎉 Batch documentation complete!`);
        console.log(`✅ Success: ${successCount}, ❌ Errors: ${errorCount}`);
        console.log(`📄 Report saved to: ${reportPath}`);
        
        return results;
    }
    
    // Show provider status
    showProviderStatus() {
        console.log('\n--- PROVIDER STATUS ---');
        
        this.availableProviders.forEach(provider => {
            const stats = this.rateLimiter.getUsageStats(provider);
            const canRequest = this.rateLimiter.canMakeRequest(provider, 1000);
            
            console.log(`\n${stats.provider}:`);
            console.log(`  Available: ${canRequest.allowed ? '✅' : '❌'}`);
            if (!canRequest.allowed) {
                console.log(`  Issue: ${canRequest.reason}`);
                if (canRequest.waitTime) {
                    console.log(`  Wait: ${Math.round(canRequest.waitTime/1000)}s`);
                }
            }
            console.log(`  Usage: ${stats.usage.minute.count}/${stats.limits.requestsPerMinute} per minute`);
            console.log(`  Total: ${stats.usage.totalRequests} requests, ${stats.usage.totalTokens} tokens`);
        });
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new EnhancedDocumentGenerator();
    
    const command = process.argv[2];
    const target = process.argv[3];
    
    switch (command) {
        case 'status':
            generator.showProviderStatus();
            break;
            
        case 'file':
            if (!target) {
                console.error('❌ Please provide a file path');
                process.exit(1);
            }
            generator.generateDocumentation(target);
            break;
            
        case 'batch':
            if (!target) {
                console.error('❌ Please provide a glob pattern or directory');
                process.exit(1);
            }
            // This would need glob support - simplified for now
            console.log('Batch mode would scan for files matching:', target);
            break;
            
        default:
            console.log(`
🤖 Enhanced Document Generator

Usage:
  node enhanced-document-generator.js status              # Show provider status
  node enhanced-document-generator.js file <path>         # Generate docs for single file
  node enhanced-document-generator.js batch <pattern>     # Generate docs for multiple files

Examples:
  node enhanced-document-generator.js status
  node enhanced-document-generator.js file js/inventory.js
  node enhanced-document-generator.js batch "js/*.js"
            `);
    }
}

export default EnhancedDocumentGenerator;
