#!/usr/bin/env node

/**
 * Enhanced Smart Scribe with Gemini Fallback & Documentation Generator
 * Reduces JSON parse noise and creates comprehensive auto-documentation
 */

import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnhancedSmartScribe {
    constructor() {
        this.baseDir = '/Volumes/DATA/GitHub/rEngine';
        this.ollamaEndpoint = 'http://localhost:11434';
        this.primaryModel = 'qwen2.5-coder:3b';
        this.fallbackModel = 'gemma2:2b'; // More reliable for JSON
        this.geminiAvailable = false; // Check if Gemini API available
        
        this.jsonParseFailures = 0;
        this.maxJsonFailures = 3; // Switch to fallback after 3 failures
        
        console.log('🤖 Enhanced Smart Scribe with Gemini fallback initializing...');
        this.initialize();
    }

    async initialize() {
        try {
            // Check available models and Gemini API
            await this.checkAvailableModels();
            
            // Initialize with best available model
            await this.selectOptimalModel();
            
            console.log('✅ Enhanced Smart Scribe operational');
            
        } catch (error) {
            console.error('❌ Enhanced Smart Scribe initialization failed:', error);
        }
    }

    async checkAvailableModels() {
        try {
            const response = await axios.get(`${this.ollamaEndpoint}/api/ps`);
            this.availableModels = response.data.models?.map(m => m.name) || [];
            console.log(`📊 Available models: ${this.availableModels.join(', ')}`);
            
            // Check if Gemini API key available
            if (process.env.GEMINI_API_KEY) {
                this.geminiAvailable = true;
                console.log('🔷 Gemini API available as premium fallback');
            }
            
        } catch (error) {
            console.warn('⚠️  Ollama not available, using Gemini fallback only');
            this.availableModels = [];
        }
    }

    async selectOptimalModel() {
        // Use most reliable model for JSON tasks
        if (this.jsonParseFailures >= this.maxJsonFailures) {
            if (this.geminiAvailable) {
                this.currentModel = 'gemini';
                console.log('🔷 Switched to Gemini for better JSON reliability');
            } else if (this.availableModels.includes(this.fallbackModel)) {
                this.currentModel = this.fallbackModel;
                console.log(`🔄 Switched to fallback model: ${this.fallbackModel}`);
            }
        } else {
            this.currentModel = this.primaryModel;
        }
    }

    async queryWithFallback(prompt, systemPrompt = null, expectJSON = false) {
        try {
            let result;
            
            if (this.currentModel === 'gemini' && this.geminiAvailable) {
                result = await this.queryGemini(prompt, systemPrompt, expectJSON);
            } else {
                result = await this.queryOllama(prompt, systemPrompt, expectJSON);
            }
            
            // Reset failure count on success
            if (expectJSON && result && !result.parse_error) {
                this.jsonParseFailures = 0;
            }
            
            return result;
            
        } catch (error) {
            console.error(`❌ Query failed with ${this.currentModel}:`, error.message);
            
            // Try fallback if primary failed
            if (this.currentModel === this.primaryModel) {
                console.log('🔄 Trying fallback model...');
                this.jsonParseFailures++;
                await this.selectOptimalModel();
                return this.queryWithFallback(prompt, systemPrompt, expectJSON);
            }
            
            return null;
        }
    }

    async queryGemini(prompt, systemPrompt = null, expectJSON = false) {
        try {
            const payload = {
                contents: [{
                    parts: [{
                        text: systemPrompt ? `${systemPrompt}\\n\\n${prompt}` : prompt
                    }]
                }],
                generationConfig: {
                    temperature: expectJSON ? 0.1 : 0.7, // Lower temp for JSON
                    maxOutputTokens: 2048
                }
            };

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                payload
            );

            const content = response.data.candidates[0].content.parts[0].text;

            if (expectJSON) {
                try {
                    return JSON.parse(content);
                } catch (parseError) {
                    this.jsonParseFailures++;
                    console.warn('⚠️  Gemini JSON parse failed, returning raw content');
                    return { raw_content: content, parse_error: parseError.message };
                }
            }

            return content;

        } catch (error) {
            console.error('❌ Gemini query failed:', error.message);
            throw error;
        }
    }

    async queryOllama(prompt, systemPrompt = null, expectJSON = false) {
        try {
            const messages = [];
            
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            
            messages.push({ role: 'user', content: prompt });
            
            const response = await axios.post(`${this.ollamaEndpoint}/api/chat`, {
                model: this.currentModel,
                messages: messages,
                stream: false,
                options: {
                    temperature: expectJSON ? 0.1 : 0.7 // Lower temp for JSON
                }
            });
            
            const content = response.data.message.content;
            
            if (expectJSON) {
                try {
                    // Clean content before parsing
                    const cleanContent = this.cleanJSONContent(content);
                    return JSON.parse(cleanContent);
                } catch (parseError) {
                    this.jsonParseFailures++;
                    console.warn(`⚠️  ${this.currentModel} JSON parse failed, returning raw content`);
                    return { raw_content: content, parse_error: parseError.message };
                }
            }
            
            return content;
            
        } catch (error) {
            console.error(`❌ ${this.currentModel} query failed:`, error.message);
            throw error;
        }
    }

    cleanJSONContent(content) {
        // Remove markdown code blocks
        content = content.replace(/```json\\n?/g, '').replace(/```\\n?/g, '');
        
        // Remove common prefixes
        content = content.replace(/^(Here's|Here is|The JSON|Result:?)\\s*/i, '');
        
        // Find JSON object bounds
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            content = content.substring(jsonStart, jsonEnd + 1);
        }
        
        return content.trim();
    }

    async generateSystemDocumentation() {
        console.log('📚 Generating comprehensive system documentation...');
        
        const documentationTasks = [
            this.generateReadme(),
            this.generateAPIDocumentation(),
            this.generateAgentWorkflowGuide(),
            this.generateMemorySystemDocumentation(),
            this.generateTroubleshootingGuide()
        ];
        
        const results = await Promise.allSettled(documentationTasks);
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        console.log(`📊 Documentation generation: ${successful}/${results.length} completed`);
        
        return successful === results.length;
    }

    async generateReadme() {
        const prompt = `Generate a comprehensive README.md for StackTrackr project based on the current system state.

CURRENT SYSTEM FEATURES:
- Multi-agent memory intelligence system
- Dual memory protocol (persistent + MCP)
- JSON sanitization and error handling
- Smart Scribe with Ollama/Gemini integration
- Agent accountability and handoff protocols
- Precious metals inventory tracking
- Real-time search and filtering

Include:
1. Project overview and vision
2. Quick start guide
3. Agent system architecture
4. Memory management features
5. Installation and setup
6. Usage examples
7. Contributing guidelines

Make it professional and comprehensive for both users and developers.`;

        try {
            const content = await this.queryWithFallback(prompt, this.systemPrompts.documentAnalysis);
            
            if (content && !content.parse_error) {
                await fs.writeFile(path.join(this.baseDir, 'README.md'), content);
                console.log('✅ README.md generated');
                return true;
            }
        } catch (error) {
            console.error('❌ README generation failed:', error);
        }
        
        return false;
    }

    async generateAPIDocumentation() {
        const prompt = `Generate API documentation for the StackTrackr memory and agent system.

DOCUMENT THESE APIS:
- Memory Intelligence API (recall.js, memory-intelligence.js)
- Dual Memory Writer API (dual-memory-writer.js)
- Agent Management API (universal-agent-init.js)
- MCP Integration APIs
- Smart Scribe APIs

Include:
1. Endpoint descriptions
2. Parameter specifications
3. Example requests/responses
4. Error handling
5. Authentication requirements
6. Rate limits and best practices

Format as markdown with clear sections and code examples.`;

        try {
            const content = await this.queryWithFallback(prompt, this.systemPrompts.documentAnalysis);
            
            if (content && !content.parse_error) {
                await fs.writeFile(path.join(this.baseDir, 'docs', 'API.md'), content);
                console.log('✅ API documentation generated');
                return true;
            }
        } catch (error) {
            console.error('❌ API documentation failed:', error);
        }
        
        return false;
    }

    // Add system prompts property
    get systemPrompts() {
        return {
            documentAnalysis: `You are a technical documentation expert and knowledge architect. 

CORE RESPONSIBILITIES:
1. Extract technical terms, concepts, and relationships
2. Identify code patterns, architectural decisions, and best practices  
3. Create searchable keywords and categorization
4. Maintain technical accuracy and context
5. Build knowledge graphs of system relationships

ANALYSIS FOCUS:
- API endpoints and their purposes
- Class structures and inheritance patterns
- Configuration parameters and their effects
- Error patterns and debugging approaches
- Performance optimizations and bottlenecks
- Integration points between systems
- User workflow patterns and preferences

OUTPUT FORMAT: 
- Use clear, professional language
- Include practical examples
- Structure information logically
- Provide actionable insights
- Maintain consistency across documents`
        };
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const enhancedScribe = new EnhancedSmartScribe();
    
    // Generate documentation if requested
    if (process.argv.includes('--generate-docs')) {
        enhancedScribe.generateSystemDocumentation();
    }
}

export default EnhancedSmartScribe;
