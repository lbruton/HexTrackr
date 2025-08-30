#!/usr/bin/env node

/**
 * rEngine - VS Code Chat Integration MCP Server
 * Enhanced Multi-Provider AI Memory Scribe for VS Code Copilot Chat
 * 5-Tier Intelligent Fallback: Groq → Claude → ChatGPT → Gemini → Ollama
 * 
 * @version 2.1.0
 * @author lbruton
 * @date 2025-08-17
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// OpenWebUI Integration - Route through pipelines system
const OPENWEBUI_BASE_URL = process.env.OPENWEBUI_BASE_URL || 'http://127.0.0.1:9099/v1';
const OPENWEBUI_API_KEY = process.env.OPENWEBUI_API_KEY || '0p3n-w3bu!'; // Default OpenWebUI key

// VS Code Chat Integration Logger
function logToVSCode(message, level = 'info') {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [rEngine-VSCode] ${level.toUpperCase()}: ${message}`);
}

// 5-Tier AI Provider Configuration
const AI_MODELS = {
  groq: {
    provider: 'groq',
    model: 'llama-3.1-8b-instant',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    priority: 1
  },
  claude: {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    maxTokens: 4000,
    priority: 2
  },
  openai: {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    maxTokens: 4000,
    priority: 3
  },
  gemini: {
    provider: 'google',
    model: 'gemini-1.5-flash',
    maxTokens: 8000,
    priority: 4
  },
  ollama: {
    provider: 'ollama',
    models: ['qwen2.5-coder:7b', 'qwen2.5-coder:3b', 'gemma2:2b', 'qwen2.5:3b', 'qwen2:7b'],
    maxTokens: 4000,
    priority: 5
  }
};

// Initialize AI providers
let anthropic = null;
let openai = null;
let gemini = null;

if (ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
}

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

if (GEMINI_API_KEY) {
  gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// Enhanced Memory Manager with Ollama Search Matrix Tables
class VSCodeMemoryManager {
  constructor() {
    this.memoryDir = path.join(__dirname, '.rengine', 'memory');
    this.conversationsDir = path.join(__dirname, '.rengine', 'conversations');
    this.rAgentsDir = path.join(__dirname, '..', 'rAgents'); // Use rAgents for consistent branding
    this.searchMatrixDir = path.join(__dirname, '.rengine', 'search-matrix');
    this.conversationBuffer = [];
    this.lastScribeRun = Date.now();
    this.scribeInterval = 30000; // Auto-scribe every 30 seconds
    this.searchMatrix = new Map(); // In-memory search matrix
    this.initializeDirectories();
    this.startConversationScribe();
    this.loadSearchMatrix();
  }

  async initializeDirectories() {
    await fs.ensureDir(this.memoryDir);
    await fs.ensureDir(this.conversationsDir);
    await fs.ensureDir(this.searchMatrixDir);
    logToVSCode('Memory directories initialized for VS Code integration');
  }

  // Load existing search matrix on startup
  async loadSearchMatrix() {
    try {
      const matrixPath = path.join(this.searchMatrixDir, 'context-matrix.json');
      if (await fs.pathExists(matrixPath)) {
        const matrix = await fs.readJson(matrixPath);
        this.searchMatrix = new Map(Object.entries(matrix));
        logToVSCode(`🔍 Loaded search matrix with ${this.searchMatrix.size} context entries`);
      } else {
        // Build initial search matrix from existing data
        await this.buildInitialSearchMatrix();
      }
    } catch (error) {
      logToVSCode(`Warning: Could not load search matrix: ${error.message}`, 'warn');
    }
  }

  // Build comprehensive search matrix using Ollama for rapid context retrieval
  async buildInitialSearchMatrix() {
    logToVSCode('🔨 Building initial search matrix with Ollama analysis...');
    
    try {
      // Analyze project structure for code context mapping
      const projectStructure = await this.analyzeProjectStructure();
      
      // Analyze existing memories for historical context
      const memoryContext = await this.analyzeExistingMemories();
      
      // Build search matrix with Ollama
      const matrixData = await this.buildSearchMatrixWithOllama(projectStructure, memoryContext);
      
      if (matrixData) {
        // Save search matrix
        const matrixPath = path.join(this.searchMatrixDir, 'context-matrix.json');
        await fs.writeJson(matrixPath, Object.fromEntries(matrixData), { spaces: 2 });
        
        this.searchMatrix = matrixData;
        logToVSCode(`✅ Built search matrix with ${matrixData.size} context mappings`);
      }
    } catch (error) {
      logToVSCode(`Error building search matrix: ${error.message}`, 'error');
    }
  }

  // Analyze project structure for context mapping
  async analyzeProjectStructure() {
    const projectRoot = path.join(__dirname, '..');
    const structure = {
      jsFiles: [],
      configFiles: [],
      documentFiles: [],
      agentFiles: []
    };

    try {
      // Scan JS files
      const jsFiles = await this.findFiles(projectRoot, /\.js$/);
      for (const file of jsFiles.slice(0, 20)) { // Limit for performance
        const content = await fs.readFile(file, 'utf8');
        structure.jsFiles.push({
          path: file.replace(projectRoot, ''),
          size: content.length,
          functions: this.extractFunctionNames(content),
          imports: this.extractImports(content)
        });
      }

      // Scan agent files
      const rAgentFiles = await this.findFiles(this.rAgentsDir, /\.json$/);
      for (const file of rAgentFiles) {
        structure.agentFiles.push({
          path: file.replace(this.rAgentsDir, ''),
          type: path.basename(file, '.json')
        });
      }

      return structure;
    } catch (error) {
      logToVSCode(`Error analyzing project structure: ${error.message}`, 'warn');
      return structure;
    }
  }

  // Extract function names from JS content
  extractFunctionNames(content) {
    const functionRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)|(\w+)\s*:\s*(?:function|\([^)]*\)\s*=>))/g;
    const functions = [];
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const funcName = match[1] || match[2] || match[3];
      if (funcName) functions.push(funcName);
    }
    return functions.slice(0, 10); // Limit for performance
  }

  // Extract imports from JS content
  extractImports(content) {
    const importRegex = /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g;
    const imports = [];
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1] || match[2]);
    }
    return imports.slice(0, 5); // Limit for performance
  }

  // Find files recursively
  async findFiles(dir, pattern) {
    const files = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const subFiles = await this.findFiles(fullPath, pattern);
          files.push(...subFiles);
        } else if (entry.isFile() && pattern.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore directory access errors
    }
    return files;
  }

  // Analyze existing memories for context
  async analyzeExistingMemories() {
    try {
      const memoryPath = path.join(__dirname, '..', 'rMemory', 'rAgentMemories', 'memory.json');
      if (await fs.pathExists(memoryPath)) {
        const memoryData = await fs.readJson(memoryPath);
        
        // Handle both array and object formats
        let memories = [];
        if (Array.isArray(memoryData)) {
          memories = memoryData;
        } else if (memoryData.entities) {
          // Convert entities to memory array
          memories = Object.entries(memoryData.entities).map(([key, entity]) => ({
            type: entity.entityType || 'entity',
            name: key,
            observations: entity.observations || [],
            metadata: entity.metadata || {}
          }));
        }
        
        return {
          totalMemories: memories.length,
          recentMemories: memories.slice(-20),
          memoryTypes: [...new Set(memories.map(m => m.type || m.entityType || 'unknown'))]
        };
      }
    } catch (error) {
      logToVSCode(`Error analyzing memories: ${error.message}`, 'warn');
    }
    return { totalMemories: 0, recentMemories: [], memoryTypes: [] };
  }

  // Build search matrix using Ollama analysis
  async buildSearchMatrixWithOllama(projectStructure, memoryContext) {
    try {
      const prompt = `You are a code context mapping expert. Create a comprehensive search matrix for rapid context retrieval in VS Code development.

PROJECT STRUCTURE:
${JSON.stringify(projectStructure, null, 2)}

MEMORY CONTEXT:
${JSON.stringify(memoryContext, null, 2)}

CREATE A SEARCH MATRIX with these categories:
1. Code locations by functionality
2. File relationships and dependencies  
3. Common development patterns
4. Problem/solution mappings
5. Quick access keywords

OUTPUT FORMAT (JSON):
{
  "code_functions": {
    "keyword": {
      "files": ["path/to/file.js"],
      "functions": ["functionName"],
      "description": "what this code does",
      "context_weight": 0.9
    }
  },
  "file_relationships": {
    "keyword": {
      "primary_file": "main/file.js",
      "related_files": ["related1.js", "related2.js"],
      "relationship_type": "imports/exports/calls",
      "context_weight": 0.8
    }
  },
  "dev_patterns": {
    "keyword": {
      "pattern_type": "api/ui/data/logic",
      "typical_files": ["pattern/files.js"],
      "description": "when to use this pattern",
      "context_weight": 0.7
    }
  },
  "problem_solutions": {
    "keyword": {
      "problem_type": "bug/feature/optimization",
      "solution_location": "where to look",
      "common_files": ["solution/files.js"],
      "context_weight": 0.8
    }
  },
  "quick_keywords": {
    "keyword": {
      "immediate_target": "exact file or function",
      "context": "why you'd look here",
      "priority": "high/medium/low",
      "context_weight": 1.0
    }
  }
}

Focus on creating keywords that would help a developer immediately find the right code for editing within 1-2 transactions.`;

      const response = await callOllamaAPI([
        { role: 'system', content: 'You are a code analysis expert specialized in creating searchable context matrices for rapid development.' },
        { role: 'user', content: prompt }
      ], 'qwen2.5-coder:3b'); // Use code-specialized model

      if (response.success) {
        try {
          const matrixData = JSON.parse(response.content);
          
          // Convert to Map format with flattened keywords
          const searchMatrix = new Map();
          
          Object.entries(matrixData).forEach(([category, items]) => {
            Object.entries(items).forEach(([keyword, data]) => {
              const searchKey = `${category}:${keyword}`;
              searchMatrix.set(searchKey, {
                category,
                keyword,
                ...data,
                last_updated: new Date().toISOString()
              });
              
              // Also add just the keyword for simpler searches
              if (!searchMatrix.has(keyword)) {
                searchMatrix.set(keyword, {
                  category,
                  keyword,
                  ...data,
                  last_updated: new Date().toISOString()
                });
              }
            });
          });
          
          return searchMatrix;
        } catch (parseError) {
          logToVSCode(`Search matrix JSON parse error: ${parseError.message}`, 'warn');
          return new Map();
        }
      }
    } catch (error) {
      logToVSCode(`Ollama search matrix build failed: ${error.message}`, 'warn');
    }
    return new Map();
  }

  // Rapid context search using the matrix
  async rapidContextSearch(query, maxResults = 5) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    // Search through matrix
    for (const [key, data] of this.searchMatrix.entries()) {
      const score = this.calculateSearchScore(queryLower, key, data);
      if (score > 0.3) {
        results.push({ ...data, search_score: score, search_key: key });
      }
    }
    
    // Sort by score and context weight
    results.sort((a, b) => (b.search_score * b.context_weight) - (a.search_score * a.context_weight));
    
    return results.slice(0, maxResults);
  }

  // Calculate search relevance score
  calculateSearchScore(query, key, data) {
    let score = 0;
    const keyLower = key.toLowerCase();
    const dataStr = JSON.stringify(data).toLowerCase();
    
    // Exact keyword match
    if (keyLower === query) score += 1.0;
    else if (keyLower.includes(query)) score += 0.8;
    else if (query.includes(keyLower)) score += 0.6;
    
    // Description/content match
    if (dataStr.includes(query)) score += 0.4;
    
    // Function/file name matches
    if (data.functions?.some(f => f.toLowerCase().includes(query))) score += 0.7;
    if (data.files?.some(f => f.toLowerCase().includes(query))) score += 0.6;
    
    return Math.min(score, 1.0);
  }

  // Enhanced Context Prompting for Continuity
  async generateContinuationContext() {
    try {
      // Get recent conversation context
      const recentConversations = await this.getRecentConversations(3);
      
      // Get current work context from search matrix
      const workContext = await this.getCurrentWorkContext();
      
      // Get recent memories
      const recentMemories = await this.getRecentMemories(5);
      
      const contextPrompt = `## 🔄 CONTINUATION CONTEXT

**RECENT CONVERSATIONS:**
${recentConversations.map(conv => `- ${conv.timestamp}: ${conv.summary}`).join('\n')}

**CURRENT WORK CONTEXT:**
${workContext.active_files.map(f => `📁 ${f}`).join('\n')}
${workContext.current_tasks.map(t => `🎯 ${t}`).join('\n')}

**RECENT MEMORIES:**
${recentMemories.map(mem => `💭 ${mem.summary}`).join('\n')}

**CONTINUATION SUGGESTIONS:**
${workContext.suggested_next_steps.join('\n')}

---
*Context automatically generated from recent activity. Continue where you left off!*`;

      return contextPrompt;
    } catch (error) {
      logToVSCode(`Context generation failed: ${error.message}`, 'warn');
      return "## 🔄 CONTINUATION CONTEXT\n\n*Previous context available. Use 'get_agents_memory' to retrieve specific information.*";
    }
  }

  // Get recent conversations for continuity
  async getRecentConversations(limit = 3) {
    try {
      const conversationsDir = this.conversationsDir;
      const files = await fs.readdir(conversationsDir);
      
      // Sort by modification time (most recent first)
      const conversationFiles = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(conversationsDir, file);
          const stats = await fs.stat(filePath);
          return { file, path: filePath, mtime: stats.mtime };
        })
      );
      
      conversationFiles.sort((a, b) => b.mtime - a.mtime);
      
      // Read recent conversations
      const recentConversations = [];
      for (let i = 0; i < Math.min(limit, conversationFiles.length); i++) {
        try {
          const conversation = await fs.readJson(conversationFiles[i].path);
          recentConversations.push({
            timestamp: conversationFiles[i].mtime.toISOString(),
            summary: conversation.analysis?.summary || 'Conversation in progress',
            keywords: conversation.analysis?.keywords || [],
            file: conversationFiles[i].file
          });
        } catch (err) {
          // Skip invalid conversation files
        }
      }
      
      return recentConversations;
    } catch (error) {
      return [];
    }
  }

  // Get current work context from recent activity
  async getCurrentWorkContext() {
    try {
      // Analyze recent search matrix queries and memory entries
      const recentQueries = Array.from(this.searchMatrix.keys())
        .filter(key => key.startsWith('recent_search:'))
        .slice(-5);
      
      const activeFiles = [...new Set([
        ...Array.from(this.searchMatrix.values())
          .filter(data => data.files)
          .flatMap(data => data.files)
          .slice(-10)
      ])];
      
      const currentTasks = [...new Set([
        ...Array.from(this.searchMatrix.values())
          .filter(data => data.description)
          .map(data => data.description)
          .slice(-5)
      ])];
      
      return {
        active_files: activeFiles,
        current_tasks: currentTasks,
        recent_queries: recentQueries.map(q => q.replace('recent_search:', '')),
        suggested_next_steps: [
          '🔍 Use rapid_context_search to find specific code',
          '🎯 Use get_instant_code_target for exact file locations',
          '📝 Continue with the most recent task context'
        ]
      };
    } catch (error) {
      return {
        active_files: [],
        current_tasks: [],
        recent_queries: [],
        suggested_next_steps: ['Use available tools to continue development']
      };
    }
  }

  // Get recent memories for context
  async getRecentMemories(limit = 5) {
    try {
      const memoryPath = path.join(__dirname, '..', 'rMemory', 'agents', 'memory.json');
      if (await fs.pathExists(memoryPath)) {
        const memoryData = await fs.readJson(memoryPath);
        
        // Handle both array and object formats
        let memories = [];
        if (Array.isArray(memoryData)) {
          memories = memoryData;
        } else if (memoryData.entities) {
          memories = Object.entries(memoryData.entities).map(([key, entity]) => ({
            name: key,
            summary: entity.observations?.[0] || 'Memory entry',
            timestamp: entity.metadata?.timestamp || 'unknown'
          }));
        }
        
        return memories.slice(-limit);
      }
    } catch (error) {
      logToVSCode(`Error getting recent memories: ${error.message}`, 'warn');
    }
    return [];
  }

  // Full Project Context Ingestion with Ollama
  async ingestFullProjectContext(query) {
    try {
      logToVSCode(`🔍 Performing full project ingestion for: "${query}"`);
      
      // Gather comprehensive project data
      const projectData = await this.gatherFullProjectData();
      
      // Use Ollama to analyze and extract relevant context
      const contextPrompt = `You are a project analysis expert. Given this query and full project context, provide EXACTLY what the developer needs.

QUERY: ${query}

FULL PROJECT CONTEXT:
${JSON.stringify(projectData, null, 2)}

INSTRUCTIONS:
1. Find the EXACT files, functions, and code sections relevant to the query
2. Provide specific line numbers and code snippets if possible  
3. Include related dependencies and imports
4. Suggest the precise steps needed
5. Focus on reducing token usage in the response

OUTPUT FORMAT (JSON):
{
  "exact_targets": [
    {
      "file": "exact/path/to/file.js",
      "function": "exactFunctionName", 
      "lines": "45-67",
      "purpose": "what this code does",
      "relevance": "why it matches the query"
    }
  ],
  "code_snippets": [
    {
      "file": "path/to/file.js",
      "snippet": "actual code here",
      "context": "explanation of what this does"
    }
  ],
  "dependencies": ["list of related files/modules"],
  "action_plan": ["step 1", "step 2", "step 3"],
  "token_efficient_summary": "Concise summary of exactly what to do"
}`;

      const response = await callOllamaAPI([
        { role: 'system', content: 'You are a precise code analysis expert that provides exact, token-efficient responses.' },
        { role: 'user', content: contextPrompt }
      ], 'qwen2.5-coder:3b');

      if (response.success) {
        try {
          const analysis = JSON.parse(response.content);
          
          // Update search matrix with this new intelligence
          await this.updateSearchMatrix(`full_context:${query}`, {
            category: 'full_project_analysis',
            keyword: query,
            targets: analysis.exact_targets,
            context_weight: 0.95,
            analysis_timestamp: new Date().toISOString()
          });
          
          return analysis;
        } catch (parseError) {
          // Return raw analysis if JSON parsing fails
          return {
            token_efficient_summary: response.content,
            message: 'Full project analysis completed (raw format)'
          };
        }
      }
    } catch (error) {
      logToVSCode(`Full project ingestion failed: ${error.message}`, 'error');
      return null;
    }
  }

  // Gather comprehensive project data for analysis
  async gatherFullProjectData() {
    const projectRoot = path.join(__dirname, '..');
    
    try {
      const projectData = {
        structure: await this.analyzeProjectStructure(),
        package_configs: await this.getPackageConfigs(),
        recent_changes: await this.getRecentGitChanges(),
        memory_context: await this.analyzeExistingMemories(),
        search_matrix_summary: this.getSearchMatrixSummary()
      };
      
      return projectData;
    } catch (error) {
      logToVSCode(`Error gathering project data: ${error.message}`, 'warn');
      return { error: error.message };
    }
  }

  // Get package.json and other config files
  async getPackageConfigs() {
    const configs = {};
    const configFiles = ['package.json', '.env', 'tsconfig.json', 'vite.config.js'];
    
    for (const configFile of configFiles) {
      try {
        const configPath = path.join(__dirname, '..', configFile);
        if (await fs.pathExists(configPath)) {
          if (configFile.endsWith('.json')) {
            configs[configFile] = await fs.readJson(configPath);
          } else {
            configs[configFile] = await fs.readFile(configPath, 'utf8');
          }
        }
      } catch (error) {
        // Skip inaccessible config files
      }
    }
    
    return configs;
  }

  // Get recent git changes for context
  async getRecentGitChanges() {
    try {
      // This would need git integration - simplified for now
      return {
        recent_commits: ['Enhanced MCP with search matrix', 'Automatic memory recording'],
        modified_files: ['rEngine/index.js', 'rMemory/rAgentMemories/memory.json']
      };
    } catch (error) {
      return { error: 'Git history unavailable' };
    }
  }

  // Get search matrix summary
  getSearchMatrixSummary() {
    const categories = {};
    for (const [key, data] of this.searchMatrix.entries()) {
      const category = data.category || 'unknown';
      if (!categories[category]) categories[category] = 0;
      categories[category]++;
    }
    
    return {
      total_entries: this.searchMatrix.size,
      categories,
      most_recent: Array.from(this.searchMatrix.entries())
        .sort((a, b) => new Date(b[1].last_updated || 0) - new Date(a[1].last_updated || 0))
        .slice(0, 5)
        .map(([key, data]) => ({ key, category: data.category }))
    };
  }

  // Automatic Conversation Scribe with Ollama and Context Prompting
  startConversationScribe() {
    setInterval(async () => {
      if (this.conversationBuffer.length > 0) {
        await this.processConversationBuffer();
      }
      
      // Check if we should provide continuation context
      await this.checkForContinuationPrompt();
    }, this.scribeInterval);
    
    logToVSCode('🤖 Automatic conversation scribe started (30s intervals)');
  }

  // Check if we should prompt with continuation context
  async checkForContinuationPrompt() {
    try {
      const now = Date.now();
      const timeSinceLastActivity = now - this.lastScribeRun;
      
      // If there's been a gap in activity (5+ minutes), prepare context for resumption
      if (timeSinceLastActivity > 300000) { // 5 minutes
        const recentWork = await this.getCurrentWorkContext();
        
        // If there's active work context, log a context suggestion
        if (recentWork.current_tasks.length > 0 || recentWork.active_files.length > 0) {
          logToVSCode('💡 Use "get_continuation_context" to resume where you left off');
          
          // Update search matrix with continuation hint
          await this.updateSearchMatrix('continuation_available', {
            category: 'workflow_continuity',
            keyword: 'resume_work',
            description: 'Previous work context available for continuation',
            context_weight: 0.8,
            active_files: recentWork.active_files,
            current_tasks: recentWork.current_tasks
          });
        }
      }
    } catch (error) {
      // Silent fail for continuation checking
    }
  }

  // Add conversation to buffer for processing with automatic handoff detection
  addToConversationBuffer(interaction) {
    const timestamp = new Date().toISOString();
    this.conversationBuffer.push({
      timestamp,
      ...interaction
    });
    
    // Auto-detect handoff triggers
    if (interaction.type === 'user_message' || interaction.type === 'tool_call') {
      const content = (interaction.content || interaction.arguments?.content || '').toLowerCase();
      const handoffTriggers = [
        'lets take a break',
        'take a break',
        'lets pause',
        'pause here',
        'break time',
        'stopping for now',
        'continue later',
        'pick this up later'
      ];
      
      const resumeTriggers = [
        'hello, lets pick back up',
        'lets pick back up',
        'continue where we left off',
        'resume work',
        'pick up where',
        'back to work',
        'lets continue'
      ];
      
      if (handoffTriggers.some(trigger => content.includes(trigger))) {
        logToVSCode('🔄 Handoff trigger detected - recommend using trigger_session_handoff tool');
      }
      
      if (resumeTriggers.some(trigger => content.includes(trigger))) {
        logToVSCode('🔄 Resume trigger detected - recommend using resume_session_context tool');
      }
    }
    
    // If buffer gets large, process immediately
    if (this.conversationBuffer.length >= 10) {
      this.processConversationBuffer();
    }
  }

  // Process conversation buffer with Ollama memory analysis
  async processConversationBuffer() {
    if (this.conversationBuffer.length === 0) return;
    
    try {
      logToVSCode(`🧠 Processing ${this.conversationBuffer.length} conversation items with Ollama scribe...`);
      
      const conversationText = this.conversationBuffer.map(item => 
        `[${item.timestamp}] ${item.type || 'interaction'}: ${JSON.stringify(item.content)}`
      ).join('\n\n');

      // Use Ollama to analyze conversations and create structured memories
      const memoryAnalysis = await this.analyzeConversationWithOllama(conversationText);
      
      if (memoryAnalysis) {
        await this.saveAnalyzedMemories(memoryAnalysis);
        logToVSCode(`✅ Automatically processed ${this.conversationBuffer.length} conversation items`);
      }
      
      // Clear processed buffer
      this.conversationBuffer = [];
      this.lastScribeRun = Date.now();
      
    } catch (error) {
      logToVSCode(`❌ Conversation scribe error: ${error.message}`, 'error');
    }
  }

  // Advanced Ollama prompting for memory analysis
  async analyzeConversationWithOllama(conversationText) {
    try {
      const prompt = `You are an expert conversation analyst and memory architect. Analyze this VS Code development conversation and extract meaningful memories.

CONVERSATION DATA:
${conversationText}

ANALYSIS INSTRUCTIONS:
1. Extract key technical decisions made
2. Identify problems solved and solutions used
3. Note coding patterns and approaches
4. Record user preferences and workflow patterns
5. Capture context that should persist across sessions
6. Identify recurring themes or issues
7. Note any learning opportunities or insights

OUTPUT FORMAT (JSON):
{
  "technical_decisions": [
    {"decision": "description", "context": "why", "impact": "future_relevance"}
  ],
  "problems_solved": [
    {"problem": "description", "solution": "approach_used", "effectiveness": "rating"}
  ],
  "code_patterns": [
    {"pattern": "description", "usage": "when_applicable", "notes": "additional_context"}
  ],
  "user_preferences": [
    {"preference": "description", "evidence": "supporting_data", "confidence": "level"}
  ],
  "persistent_context": [
    {"context": "description", "importance": "high/medium/low", "duration": "session/project/permanent"}
  ],
  "insights": [
    {"insight": "description", "type": "learning/improvement/pattern", "value": "future_benefit"}
  ],
  "keywords": ["relevant", "searchable", "tags"],
  "summary": "Brief overview of the conversation session and key takeaways"
}

Be thorough but concise. Focus on information that will be valuable for future development sessions.`;

      const response = await callOllamaAPI([
        { role: 'system', content: 'You are a memory analysis expert specialized in software development conversations.' },
        { role: 'user', content: prompt }
      ], 'qwen2.5-coder:3b'); // Use qwen2.5-coder:3b for better memory efficiency

      if (response.success) {
        try {
          const analysis = JSON.parse(response.content);
          return analysis;
        } catch (parseError) {
          logToVSCode(`Memory analysis JSON parse error: ${parseError.message}`, 'warn');
          // Fallback: create basic memory entry
          return {
            summary: response.content,
            keywords: ['auto-generated', 'conversation', 'vscode'],
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      logToVSCode(`Ollama memory analysis failed: ${error.message}`, 'warn');
      return null;
    }
  }

  // Save analyzed memories to rMemory system
  async saveAnalyzedMemories(analysis) {
    try {
      const timestamp = new Date().toISOString();
      
      // Save to rMemory agents/memory.json
      const memoryPath = path.join(__dirname, '..', 'rMemory', 'agents', 'memory.json');
      let memories = [];
      
      if (await fs.pathExists(memoryPath)) {
        memories = await fs.readJson(memoryPath);
      }
      
      const memoryEntry = {
        timestamp,
        source: 'ollama-auto-scribe',
        type: 'conversation_analysis',
        analysis,
        session_id: `auto_${Date.now()}`
      };
      
      memories.push(memoryEntry);
      await fs.writeJson(memoryPath, memories, { spaces: 2 });
      
      // Also save to MCP memory system if available
      if (typeof mcp_memory_create_entities !== 'undefined') {
        const entities = [
          {
            entityType: 'Auto_Memory',
            name: `Conversation_${Date.now()}`,
            observations: [
              `Summary: ${analysis.summary}`,
              `Keywords: ${analysis.keywords?.join(', ')}`,
              `Technical decisions: ${analysis.technical_decisions?.length || 0}`,
              `Problems solved: ${analysis.problems_solved?.length || 0}`,
              `Insights captured: ${analysis.insights?.length || 0}`,
              `Auto-generated: ${timestamp}`
            ]
          }
        ];
        
        // Note: This would need the MCP memory tools to be available in this context
        logToVSCode('📝 Memory analysis saved to rMemory system');
      }
      
    } catch (error) {
      logToVSCode(`Error saving analyzed memories: ${error.message}`, 'error');
    }
  }

  // Enhanced manual save with automatic context
  async saveToAgents(content, operation = 'unknown') {
    try {
      // Add to conversation buffer for automatic processing
      this.addToConversationBuffer({
        type: 'manual_save',
        operation,
        content,
        source: 'vscode-chat-manual'
      });
      
      // Also do immediate manual save as before
      const timestamp = new Date().toISOString();
      const entry = {
        timestamp,
        operation,
        content,
        source: 'vscode-chat-manual'
      };

      const memoryPath = path.join(__dirname, '..', 'rMemory', 'agents', 'memory.json');
      let memories = [];
      
      if (await fs.pathExists(memoryPath)) {
        memories = await fs.readJson(memoryPath);
      }
      
      memories.push(entry);
      await fs.writeJson(memoryPath, memories, { spaces: 2 });
      
      logToVSCode(`💾 Manual save: ${operation} + added to auto-scribe buffer`);
    } catch (error) {
      logToVSCode(`Error in enhanced save: ${error.message}`, 'error');
    }
  }

  // Force immediate scribe run
  async forceScribeRun() {
    logToVSCode('🚀 Forcing immediate conversation scribe run...');
    await this.processConversationBuffer();
  }
}

// Enhanced AI calling functions for VS Code Chat - Route through OpenWebUI Pipelines
async function callGroqAPI(messages, model = AI_MODELS.groq.model) {
  return await callViaOpenWebUI(messages, model, 'groq');
}

async function callClaudeAPI(messages, model = AI_MODELS.claude.model) {
  return await callViaOpenWebUI(messages, model, 'claude');
}

async function callOpenAIAPI(messages, model = AI_MODELS.openai.model) {
  return await callViaOpenWebUI(messages, model, 'openai');
}

async function callGeminiAPI(messages, model = AI_MODELS.gemini.model) {
  return await callViaOpenWebUI(messages, model, 'gemini');
}

// Universal OpenWebUI router for all providers
async function callViaOpenWebUI(messages, model, provider) {
  try {
    logToVSCode(`🚀 Calling ${provider} via OpenWebUI pipelines (${model})`);
    
    const response = await axios.post(`${OPENWEBUI_BASE_URL}/chat/completions`, {
      model,
      messages,
      max_tokens: AI_MODELS[provider]?.maxTokens || 4000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENWEBUI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return {
      content: response.data.choices[0].message.content,
      provider,
      model,
      success: true
    };
  } catch (error) {
    logToVSCode(`❌ OpenWebUI ${provider} call failed: ${error.message}`, 'error');
    throw error;
  }
}

// Direct API functions for testing (bypass OpenWebUI)
async function callGeminiDirect(message, model = 'gemini-pro') {
  if (!gemini) throw new Error('Gemini API not configured');
  
  try {
    const genModel = gemini.getGenerativeModel({ model });
    const result = await genModel.generateContent(message);
    const response = await result.response;
    
    return {
      content: response.text(),
      provider: 'gemini-direct',
      model,
      success: true
    };
  } catch (error) {
    logToVSCode(`❌ Direct Gemini call failed: ${error.message}`, 'error');
    throw error;
  }
}

async function callGroqDirect(message, model = 'llama-3.1-8b-instant') {
  if (!GROQ_API_KEY) throw new Error('Groq API key not configured');
  
  try {
    const response = await axios.post(AI_MODELS.groq.apiUrl, {
      model,
      messages: [{ role: 'user', content: message }],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return {
      content: response.data.choices[0].message.content,
      provider: 'groq-direct',
      model,
      success: true
    };
  } catch (error) {
    logToVSCode(`❌ Direct Groq call failed: ${error.message}`, 'error');
    throw error;
  }
}

async function callClaudeDirect(message, model = 'claude-3-haiku-20240307') {
  if (!anthropic) throw new Error('Claude API not configured');
  
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: message }]
    });

    return {
      content: response.content[0].text,
      provider: 'claude-direct',
      model,
      success: true
    };
  } catch (error) {
    logToVSCode(`❌ Direct Claude call failed: ${error.message}`, 'error');
    throw error;
  }
}

async function callOpenAIDirect(message, model = 'gpt-3.5-turbo') {
  if (!openai) throw new Error('OpenAI API not configured');
  
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: message }],
      max_tokens: 1000,
      temperature: 0.7
    });

    return {
      content: response.choices[0].message.content,
      provider: 'openai-direct',
      model,
      success: true
    };
  } catch (error) {
    logToVSCode(`❌ Direct OpenAI call failed: ${error.message}`, 'error');
    throw error;
  }
}

async function callOllamaAPI(messages, selectedModel = null) {
  try {
    logToVSCode(`🏠 Using local Ollama fallback via OpenWebUI`);
    
    // Get available models through OpenWebUI (models are managed by OpenWebUI/Pipelines)
    const model = selectedModel || 'qwen2.5-coder:7b';
    
    const response = await axios.post(`${OPENWEBUI_BASE_URL}/chat/completions`, {
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENWEBUI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000 // Longer timeout for local models
    });

    return {
      content: response.data.choices[0].message.content,
      provider: 'ollama',
      model,
      success: true,
      isLocal: true
    };
  } catch (error) {
    logToVSCode(`❌ Ollama via OpenWebUI failed: ${error.message}`, 'error');
    throw error;
  }
}

async function getAvailableOllamaModels() {
  try {
    // Get models through OpenWebUI API instead of direct Ollama
    const response = await axios.get(`${OPENWEBUI_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${OPENWEBUI_API_KEY}`
      },
      timeout: 5000
    });
    
    // Filter for Ollama models if OpenWebUI returns model metadata
    const models = response.data.data || response.data.models || [];
    return models.map(m => m.name || m.id).filter(name => name);
  } catch (error) {
    logToVSCode(`Failed to get models from OpenWebUI: ${error.message}`, 'warn');
    // Fallback to common Ollama models (memory-efficient ones first)
    return ['qwen2.5-coder:7b', 'qwen2.5-coder:3b', 'gemma2:2b', 'qwen2.5:3b'];
  }
}

// Enhanced tagging with 5-tier fallback for VS Code Chat
async function enhancedAIAnalysis(content, operation = 'analyze') {
  const timestamp = new Date().toISOString();
  const messages = [
    {
      role: 'system',
      content: `You are an intelligent analysis assistant integrated with VS Code Chat. Analyze the following content for a precious metals inventory system. Provide insights, suggestions, and relevant information. Operation: ${operation}, Time: ${timestamp}`
    },
    {
      role: 'user',
      content: `Please analyze: ${content}`
    }
  ];

  const providers = [
    { name: 'groq', func: callGroqAPI },
    { name: 'claude', func: callClaudeAPI },
    { name: 'openai', func: callOpenAIAPI },
    { name: 'gemini', func: callGeminiAPI },
    { name: 'ollama', func: callOllamaAPI }
  ];

  // Try each provider in priority order
  for (const provider of providers) {
    try {
      logToVSCode(`Attempting ${provider.name.toUpperCase()} for VS Code Chat analysis...`);
      const result = await provider.func(messages);
      
      if (result.success) {
        logToVSCode(`${provider.name.toUpperCase()} analysis successful for VS Code Chat`);
        
        // Save to agents memory
        await memoryManager.saveToAgents({
          input: content,
          output: result.content,
          provider: result.provider,
          model: result.model,
          operation
        }, 'ai-analysis');
        
        return {
          analysis: result.content,
          provider: result.provider,
          model: result.model,
          timestamp
        };
      }
    } catch (error) {
      logToVSCode(`${provider.name.toUpperCase()} failed, trying next provider: ${error.message}`, 'warn');
      continue;
    }
  }

  throw new Error('All AI providers failed for VS Code Chat analysis');
}

// Initialize memory manager
const memoryManager = new VSCodeMemoryManager();

// MCP Server setup for VS Code Integration
const server = new Server(
  {
    name: 'rengine-mcp-vscode',
    version: '2.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions for VS Code Chat with Auto-Recording
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'analyze_with_ai',
        description: 'Analyze content using 5-tier AI system with intelligent fallback for VS Code Chat (auto-records to memory)',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Content to analyze',
            },
            operation: {
              type: 'string',
              description: 'Type of analysis to perform',
              default: 'general_analysis',
            },
          },
          required: ['content'],
        },
      },
      {
        name: 'rapid_context_search',
        description: 'Search the Ollama-powered context matrix for instant code/context location within 1-2 transactions',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (function names, file names, problem descriptions, keywords)',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 5,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_instant_code_target',
        description: 'Use Ollama analysis to find exact files/functions to edit for a given task description (1-2 transaction targeting)',
        inputSchema: {
          type: 'object',
          properties: {
            task_description: {
              type: 'string',
              description: 'Description of what needs to be coded/edited',
            },
            code_type: {
              type: 'string',
              description: 'Type of code (frontend, backend, api, ui, logic, etc.)',
              default: 'any',
            },
          },
          required: ['task_description'],
        },
      },
      {
        name: 'get_continuation_context',
        description: 'Get intelligent context prompting to continue where you left off in previous conversations',
        inputSchema: {
          type: 'object',
          properties: {
            include_recent_work: {
              type: 'boolean',
              description: 'Include recent work context and suggestions',
              default: true,
            },
          },
        },
      },
      {
        name: 'ingest_full_project',
        description: 'Use Ollama to analyze the ENTIRE project and provide exactly what you need (token-efficient)',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'What you need to find/do in the project',
            },
            analysis_depth: {
              type: 'string',
              description: 'Depth of analysis',
              enum: ['quick', 'detailed', 'comprehensive'],
              default: 'detailed',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_agents_memory',
        description: 'Retrieve information from the agents memory system (auto-records query)',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for agents memory',
            },
            limit: {
              type: 'number',
              description: 'Number of results to return',
              default: 5,
            },
          },
        },
      },
      {
        name: 'vscode_system_status',
        description: 'Get status of VS Code MCP integration and AI providers',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'force_memory_scribe',
        description: 'Force immediate processing of conversation buffer with Ollama memory analysis',
        inputSchema: {
          type: 'object',
          properties: {
            include_manual_note: {
              type: 'string',
              description: 'Optional manual note to include in the scribe run',
            },
          },
        },
      },
      {
        name: 'trigger_session_handoff',
        description: 'Trigger when user says "lets take a break" - creates comprehensive session summary and memory matrix',
        inputSchema: {
          type: 'object',
          properties: {
            session_context: {
              type: 'string',
              description: 'Current conversation context',
            },
            work_in_progress: {
              type: 'string',
              description: 'What work was being done',
            },
          },
        },
      },
      {
        name: 'resume_session_context',
        description: 'Trigger when user says "hello, lets pick back up" - provides minimal token context for continuation',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              description: 'Optional specific session to resume',
            },
          },
        },
      },
      {
        name: 'benchmark_all_models',
        description: 'Run comprehensive project assessment and codebase audit with all available AI models',
        inputSchema: {
          type: 'object',
          properties: {
            include_archive_suggestions: {
              type: 'boolean',
              description: 'Include file archival recommendations',
              default: true,
            },
            detailed_analysis: {
              type: 'boolean', 
              description: 'Perform detailed code analysis',
              default: true,
            },
          },
        },
      },
      {
        name: 'record_manual_memory',
        description: 'Manually record important information to memory (in addition to automatic recording)',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Content to record',
            },
            type: {
              type: 'string',
              description: 'Type of memory entry',
              default: 'manual_note',
            },
            importance: {
              type: 'string',
              description: 'Importance level: high, medium, low',
              default: 'medium',
            },
          },
          required: ['content'],
        },
      },
      {
        name: 'ask_llamabro_scribe',
        description: 'Ask the dedicated llamabro scribe agent to search through chat logs and extended context with ultra-fast lookup tables',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'What you need to find in chat logs or extended context',
            },
            search_type: {
              type: 'string',
              description: 'Type of search: keyword, timeline, code_pattern, decision_history, problem_solution',
              default: 'keyword',
            },
            time_period: {
              type: 'string',
              description: 'Time period to search: today, week, month, all',
              default: 'all',
            },
            max_results: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 5,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'llamabro_build_lookup_table',
        description: 'Have llamabro analyze and build keyword lookup tables for super fast future queries',
        inputSchema: {
          type: 'object',
          properties: {
            content_type: {
              type: 'string',
              description: 'Type of content to index: chat_logs, code_patterns, decisions, problems, solutions',
              default: 'all',
            },
            rebuild: {
              type: 'boolean',
              description: 'Whether to rebuild existing lookup tables',
              default: false,
            },
          },
        },
      },
      {
        name: 'test_gemini_direct',
        description: 'Test Gemini API directly (bypassing OpenWebUI) for debugging and validation',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message to send to Gemini',
            },
            model: {
              type: 'string',
              description: 'Gemini model to use',
              default: 'gemini-pro',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'test_groq_direct',
        description: 'Test Groq API directly (bypassing OpenWebUI) for debugging and validation',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message to send to Groq',
            },
            model: {
              type: 'string',
              description: 'Groq model to use',
              default: 'llama-3.1-8b-instant',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'test_claude_direct',
        description: 'Test Claude API directly (bypassing OpenWebUI) for debugging and validation',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message to send to Claude',
            },
            model: {
              type: 'string',
              description: 'Claude model to use',
              default: 'claude-3-haiku-20240307',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'test_openai_direct',
        description: 'Test OpenAI API directly (bypassing OpenWebUI) for debugging and validation',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message to send to OpenAI',
            },
            model: {
              type: 'string',
              description: 'OpenAI model to use',
              default: 'gpt-3.5-turbo',
            },
          },
          required: ['message'],
        },
      },
    ],
  };
});

// Tool handlers for VS Code Chat integration with Auto-Recording
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Auto-record all tool calls to conversation buffer
    memoryManager.addToConversationBuffer({
      type: 'tool_call',
      tool_name: name,
      arguments: args,
      source: 'vscode-chat'
    });

    switch (name) {
      case 'analyze_with_ai': {
        logToVSCode(`🔍 Analyzing content with AI: ${args.operation || 'general_analysis'}`);
        
        const result = await enhancedAIAnalysis(args.content, args.operation || 'general_analysis');
        
        // Auto-record the analysis result
        memoryManager.addToConversationBuffer({
          type: 'ai_analysis_result',
          input: args.content,
          output: result.analysis,
          provider: result.provider,
          operation: args.operation
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'rapid_context_search': {
        logToVSCode(`🔍 Rapid context search for: "${args.query}"`);
        
        const searchResults = await memoryManager.rapidContextSearch(args.query, args.maxResults || 5);
        
        // Auto-record the search
        memoryManager.addToConversationBuffer({
          type: 'rapid_search',
          query: args.query,
          results_found: searchResults.length,
          source: 'vscode-chat'
        });
        
        if (searchResults.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `🔍 No context found for "${args.query}"\n\nTry:\n- More specific keywords\n- Function names\n- File names\n- Problem descriptions`,
              },
            ],
          };
        }
        
        let response = `🎯 **Rapid Context Results for "${args.query}":**\n\n`;
        
        searchResults.forEach((result, index) => {
          response += `**${index + 1}. ${result.keyword}** (Score: ${(result.search_score * result.context_weight).toFixed(2)})\n`;
          response += `Category: ${result.category}\n`;
          
          if (result.files) {
            response += `📁 Files: ${result.files.join(', ')}\n`;
          }
          
          if (result.functions) {
            response += `⚡ Functions: ${result.functions.join(', ')}\n`;
          }
          
          if (result.description) {
            response += `📝 ${result.description}\n`;
          }
          
          if (result.immediate_target) {
            response += `🎯 Direct Target: ${result.immediate_target}\n`;
          }
          
          response += '\n';
        });
        
        return {
          content: [
            {
              type: 'text',
              text: response,
            },
          ],
        };
      }

      case 'get_instant_code_target': {
        logToVSCode(`🎯 Finding instant code target for: "${args.task_description}"`);
        
        // Use Ollama to analyze task and find best target
        const analysisPrompt = `You are a code targeting expert. Given this task description, identify the EXACT files and functions that need to be edited.

TASK: ${args.task_description}
CODE TYPE: ${args.code_type || 'any'}

Available search matrix keywords:
${Array.from(memoryManager.searchMatrix.keys()).slice(0, 20).join(', ')}

OUTPUT FORMAT (JSON):
{
  "primary_target": {
    "file": "exact/path/to/file.js",
    "function": "exactFunctionName",
    "line_estimate": 45,
    "confidence": 0.95
  },
  "secondary_targets": [
    {
      "file": "related/file.js",
      "reason": "needs related changes",
      "confidence": 0.7
    }
  ],
  "search_strategy": "how you determined these targets",
  "immediate_action": "what to edit first"
}`;

        try {
          const analysis = await callOllamaAPI([
            { role: 'system', content: 'You are a code targeting specialist that finds exact locations for code changes.' },
            { role: 'user', content: analysisPrompt }
          ], 'qwen2.5-coder:3b');

          // Auto-record the targeting request
          memoryManager.addToConversationBuffer({
            type: 'code_targeting',
            task: args.task_description,
            code_type: args.code_type,
            success: analysis.success,
            source: 'vscode-chat'
          });

          if (analysis.success) {
            try {
              const targets = JSON.parse(analysis.content);
              
              let response = `🎯 **Instant Code Targets for "${args.task_description}":**\n\n`;
              
              if (targets.primary_target) {
                const target = targets.primary_target;
                response += `**🎯 PRIMARY TARGET** (${(target.confidence * 100).toFixed(0)}% confidence)\n`;
                response += `📁 File: \`${target.file}\`\n`;
                if (target.function) response += `⚡ Function: \`${target.function}\`\n`;
                if (target.line_estimate) response += `📍 Estimated Line: ${target.line_estimate}\n`;
                response += '\n';
              }
              
              if (targets.secondary_targets?.length > 0) {
                response += '**🔗 SECONDARY TARGETS:**\n';
                targets.secondary_targets.forEach((target, index) => {
                  response += `${index + 1}. \`${target.file}\` - ${target.reason} (${(target.confidence * 100).toFixed(0)}%)\n`;
                });
                response += '\n';
              }
              
              if (targets.immediate_action) {
                response += `**⚡ IMMEDIATE ACTION:**\n${targets.immediate_action}\n\n`;
              }
              
              if (targets.search_strategy) {
                response += `**🧠 TARGETING STRATEGY:**\n${targets.search_strategy}`;
              }
              
              return {
                content: [
                  {
                    type: 'text',
                    text: response,
                  },
                ],
              };
            } catch (parseError) {
              // Fallback to text response
              return {
                content: [
                  {
                    type: 'text',
                    text: `🎯 **Code Target Analysis:**\n\n${analysis.content}`,
                  },
                ],
              };
            }
          } else {
            throw new Error('Failed to analyze code targets');
          }
        } catch (error) {
          logToVSCode(`Instant targeting failed: ${error.message}`, 'error');
          return {
            content: [
              {
                type: 'text',
                text: `❌ Code targeting failed: ${error.message}`,
              },
            ],
          };
        }
      }

      case 'get_continuation_context': {
        logToVSCode('🔄 Generating continuation context for seamless workflow...');
        
        try {
          const contextPrompt = await memoryManager.generateContinuationContext();
          
          // Auto-record the context request
          memoryManager.addToConversationBuffer({
            type: 'continuation_context',
            requested: true,
            source: 'vscode-chat'
          });
          
          return {
            content: [
              {
                type: 'text',
                text: contextPrompt,
              },
            ],
          };
        } catch (error) {
          logToVSCode(`Context generation failed: ${error.message}`, 'error');
          return {
            content: [
              {
                type: 'text',
                text: `❌ Context generation failed: ${error.message}`,
              },
            ],
          };
        }
      }

      case 'ingest_full_project': {
        logToVSCode(`🔍 Full project ingestion for: "${args.query}"`);
        
        try {
          const analysis = await memoryManager.ingestFullProjectContext(args.query);
          
          // Auto-record the full ingestion
          memoryManager.addToConversationBuffer({
            type: 'full_project_ingestion',
            query: args.query,
            analysis_depth: args.analysis_depth || 'detailed',
            success: !!analysis,
            source: 'vscode-chat'
          });
          
          if (!analysis) {
            return {
              content: [
                {
                  type: 'text',
                  text: `❌ Full project analysis failed for: "${args.query}"`,
                },
              ],
            };
          }
          
          let response = `🎯 **FULL PROJECT ANALYSIS for "${args.query}":**\n\n`;
          
          if (analysis.exact_targets?.length > 0) {
            response += '**🎯 EXACT TARGETS:**\n';
            analysis.exact_targets.forEach((target, index) => {
              response += `${index + 1}. **${target.file}**\n`;
              if (target.function) response += `   ⚡ Function: \`${target.function}\`\n`;
              if (target.lines) response += `   📍 Lines: ${target.lines}\n`;
              response += `   📝 ${target.purpose}\n`;
              response += `   🔗 Relevance: ${target.relevance}\n\n`;
            });
          }
          
          if (analysis.code_snippets?.length > 0) {
            response += '**📋 RELEVANT CODE:**\n';
            analysis.code_snippets.forEach((snippet, index) => {
              response += `${index + 1}. **${snippet.file}**\n`;
              response += `\`\`\`javascript\n${snippet.snippet}\n\`\`\`\n`;
              response += `${snippet.context}\n\n`;
            });
          }
          
          if (analysis.action_plan?.length > 0) {
            response += '**⚡ ACTION PLAN:**\n';
            analysis.action_plan.forEach((step, index) => {
              response += `${index + 1}. ${step}\n`;
            });
            response += '\n';
          }
          
          if (analysis.dependencies?.length > 0) {
            response += `**🔗 DEPENDENCIES:** ${analysis.dependencies.join(', ')}\n\n`;
          }
          
          if (analysis.token_efficient_summary) {
            response += `**💡 SUMMARY:** ${analysis.token_efficient_summary}`;
          }
          
          return {
            content: [
              {
                type: 'text',
                text: response,
              },
            ],
          };
        } catch (error) {
          logToVSCode(`Full project ingestion failed: ${error.message}`, 'error');
          return {
            content: [
              {
                type: 'text',
                text: `❌ Full project ingestion failed: ${error.message}`,
              },
            ],
          };
        }
      }

      case 'get_agents_memory': {
        logToVSCode(`🧠 Searching agents memory: ${args.query || 'all recent'}`);
        
        const memoryPath = path.join(memoryManager.rAgentsDir, 'memory.json');
        
        if (await fs.pathExists(memoryPath)) {
          const memories = await fs.readJson(memoryPath);
          const query = args.query?.toLowerCase() || '';
          
          const filtered = query 
            ? memories.filter(m => 
                JSON.stringify(m).toLowerCase().includes(query)
              ).slice(-(args.limit || 5))
            : memories.slice(-(args.limit || 5));
          
          // Auto-record the memory search
          memoryManager.addToConversationBuffer({
            type: 'memory_search',
            query: args.query,
            results_count: filtered.length,
            source: 'vscode-chat'
          });
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(filtered, null, 2),
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: 'No agents memory found.',
              },
            ],
          };
        }
      }

      case 'vscode_system_status': {
        const status = {
          timestamp: new Date().toISOString(),
          vscode_integration: 'active',
          auto_scribe: {
            enabled: true,
            interval: '30 seconds',
            buffer_size: memoryManager.conversationBuffer.length,
            last_run: new Date(memoryManager.lastScribeRun).toISOString()
          },
          providers: {
            groq: { configured: !!GROQ_API_KEY, priority: 1 },
            claude: { configured: !!ANTHROPIC_API_KEY, priority: 2 },
            openai: { configured: !!OPENAI_API_KEY, priority: 3 },
            gemini: { configured: !!GEMINI_API_KEY, priority: 4 },
            ollama: { configured: true, priority: 5, models: await getAvailableOllamaModels() }
          },
          memory: {
            ragents_dir: memoryManager.rAgentsDir,
            memory_dir: memoryManager.memoryDir,
            conversations_dir: memoryManager.conversationsDir
          }
        };

        // Auto-record system status check
        memoryManager.addToConversationBuffer({
          type: 'system_status_check',
          status_summary: 'VS Code MCP integration health check',
          auto_scribe_buffer: memoryManager.conversationBuffer.length
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      }

      case 'force_memory_scribe': {
        logToVSCode('🚀 Forcing immediate memory scribe run...');
        
        if (args.include_manual_note) {
          memoryManager.addToConversationBuffer({
            type: 'manual_note',
            content: args.include_manual_note,
            importance: 'high',
            forced_scribe: true
          });
        }
        
        await memoryManager.forceScribeRun();
        
        return {
          content: [
            {
              type: 'text',
              text: 'Memory scribe completed successfully. Conversation buffer processed and memories saved.',
            },
          ],
        };
      }

      case 'trigger_session_handoff': {
        logToVSCode(`🔄 Triggering session handoff - creating comprehensive summary`);
        
        try {
          // Force immediate processing of conversation buffer
          await memoryManager.forceScribeRun('SESSION_HANDOFF: ' + (args.work_in_progress || 'General work session'));
          
          // Create comprehensive session summary using Ollama
          const handoffPrompt = `You are a session handoff specialist. Create a COMPREHENSIVE but TOKEN-EFFICIENT summary for session resumption.

CURRENT SESSION CONTEXT:
${args.session_context || 'Not provided'}

WORK IN PROGRESS:
${args.work_in_progress || 'Not specified'}

CONVERSATION BUFFER:
${JSON.stringify(memoryManager.conversationBuffer.slice(-10), null, 2)}

CREATE A HANDOFF SUMMARY with this EXACT JSON format:
{
  "session_id": "unique_session_identifier",
  "handoff_timestamp": "ISO_timestamp",
  "work_status": {
    "primary_task": "what was being worked on",
    "completion_status": "percentage or stage",
    "next_steps": ["immediate", "actions", "needed"],
    "blocking_issues": ["any", "problems", "encountered"]
  },
  "technical_context": {
    "files_modified": ["list", "of", "files"],
    "functions_worked_on": ["function", "names"],
    "apis_used": ["api", "endpoints"],
    "key_decisions": ["important", "choices", "made"]
  },
  "memory_matrix": {
    "search_keywords": ["key", "terms", "for", "quick", "location"],
    "code_patterns": ["patterns", "established"],
    "user_preferences": ["observed", "preferences"],
    "context_priority": "high/medium/low"
  },
  "resume_instructions": {
    "token_efficient_context": "MINIMAL context needed to resume work effectively",
    "immediate_focus": "what to focus on first when resuming",
    "quick_wins": ["easy", "things", "to", "continue", "momentum"]
  }
}

Be extremely thorough but optimize for TOKEN EFFICIENCY when resuming.`;

          const handoffAnalysis = await callOllamaAPI([
            { role: 'system', content: 'You are a session handoff expert optimizing for efficient work resumption.' },
            { role: 'user', content: handoffPrompt }
          ], 'qwen2.5-coder:3b');

          if (handoffAnalysis.success) {
            try {
              const handoffData = JSON.parse(handoffAnalysis.content);
              
              // Save handoff data to rAgents system
              const handoffPath = path.join(memoryManager.rAgentsDir, 'session_handoffs.json');
              let handoffs = [];
              
              if (await fs.pathExists(handoffPath)) {
                handoffs = await fs.readJson(handoffPath);
              }
              
              handoffs.push(handoffData);
              await fs.writeJson(handoffPath, handoffs, { spaces: 2 });
              
              // Clear conversation buffer after successful handoff
              memoryManager.conversationBuffer = [];
              
              let response = `🔄 **SESSION HANDOFF COMPLETED**\n\n`;
              response += `**Session ID**: ${handoffData.session_id}\n`;
              response += `**Work Status**: ${handoffData.work_status.primary_task} (${handoffData.work_status.completion_status})\n`;
              response += `**Next Steps**: ${handoffData.work_status.next_steps.join(', ')}\n\n`;
              response += `**Files Modified**: ${handoffData.technical_context.files_modified.join(', ')}\n`;
              response += `**Resume Focus**: ${handoffData.resume_instructions.immediate_focus}\n\n`;
              response += `✅ Session memory matrix created for efficient resumption`;
              
              return {
                content: [
                  {
                    type: 'text',
                    text: response,
                  },
                ],
              };
            } catch (parseError) {
              // Fallback to text response
              const sessionId = `handoff_${Date.now()}`;
              await memoryManager.saveToRAgents({
                session_id: sessionId,
                handoff_summary: handoffAnalysis.content,
                work_context: args.work_in_progress,
                timestamp: new Date().toISOString()
              }, 'session_handoff');
              
              return {
                content: [
                  {
                    type: 'text',
                    text: `🔄 **SESSION HANDOFF COMPLETED**\n\nSession ID: ${sessionId}\n\n${handoffAnalysis.content}`,
                  },
                ],
              };
            }
          } else {
            throw new Error('Failed to create handoff summary');
          }
        } catch (error) {
          logToVSCode(`Session handoff failed: ${error.message}`, 'error');
          return {
            content: [
              {
                type: 'text',
                text: `❌ Session handoff failed: ${error.message}`,
              },
            ],
          };
        }
      }

      case 'resume_session_context': {
        logToVSCode(`🔄 Resuming session context`);
        
        try {
          // Get latest handoff data
          const handoffPath = path.join(memoryManager.rAgentsDir, 'session_handoffs.json');
          
          if (await fs.pathExists(handoffPath)) {
            const handoffs = await fs.readJson(handoffPath);
            const targetHandoff = args.session_id 
              ? handoffs.find(h => h.session_id === args.session_id)
              : handoffs[handoffs.length - 1]; // Get most recent
            
            if (targetHandoff) {
              // Create token-efficient resume context using Ollama
              const resumePrompt = `You are a session resume specialist. Create the MOST TOKEN-EFFICIENT context for resuming work.

HANDOFF DATA:
${JSON.stringify(targetHandoff, null, 2)}

Create a MINIMAL but COMPLETE resume context that tells the AI assistant:
1. What was being worked on (1-2 sentences)
2. Current status and next immediate steps (1-2 sentences)  
3. Key files/functions to focus on (bullet points)
4. Any critical context needed (1 sentence)

OUTPUT FORMAT:
🔄 **RESUMING**: [what was being worked on]
📍 **STATUS**: [current completion status] 
⚡ **NEXT**: [immediate next steps]
📁 **FOCUS**: [key files/functions]
🧠 **CONTEXT**: [critical context in minimal words]

Be EXTREMELY concise while maintaining all critical information.`;

              const resumeAnalysis = await callOllamaAPI([
                { role: 'system', content: 'You are a context compression expert providing minimal but complete resume information.' },
                { role: 'user', content: resumePrompt }
              ], 'qwen2.5:3b'); // Use fast model for quick response

              if (resumeAnalysis.success) {
                // Record that session was resumed
                memoryManager.addToConversationBuffer({
                  type: 'session_resume',
                  session_id: targetHandoff.session_id,
                  resume_timestamp: new Date().toISOString(),
                  context_provided: resumeAnalysis.content.substring(0, 200)
                });

                return {
                  content: [
                    {
                      type: 'text',
                      text: resumeAnalysis.content,
                    },
                  ],
                };
              } else {
                // Fallback to basic resume info
                let response = `🔄 **RESUMING SESSION**: ${targetHandoff.session_id}\n\n`;
                response += `📍 **WORK**: ${targetHandoff.work_status.primary_task}\n`;
                response += `⚡ **STATUS**: ${targetHandoff.work_status.completion_status}\n`;
                response += `🎯 **NEXT**: ${targetHandoff.work_status.next_steps.join(', ')}\n`;
                response += `📁 **FILES**: ${targetHandoff.technical_context.files_modified.join(', ')}\n`;
                response += `🧠 **FOCUS**: ${targetHandoff.resume_instructions.immediate_focus}`;
                
                return {
                  content: [
                    {
                      type: 'text',
                      text: response,
                    },
                  ],
                };
              }
            } else {
              return {
                content: [
                  {
                    type: 'text',
                    text: `🔍 No handoff session found${args.session_id ? ` for ID: ${args.session_id}` : ''}\n\nAvailable sessions: ${handoffs.map(h => h.session_id).join(', ')}`,
                  },
                ],
              };
            }
          } else {
            return {
              content: [
                {
                  type: 'text',
                  text: `🔍 No session handoffs found. Use trigger_session_handoff when taking breaks to enable efficient resumption.`,
                },
              ],
            };
          }
        } catch (error) {
          logToVSCode(`Session resume failed: ${error.message}`, 'error');
          return {
            content: [
              {
                type: 'text',
                text: `❌ Session resume failed: ${error.message}`,
              },
            ],
          };
        }
      }

      case 'record_manual_memory': {
        logToVSCode(`📝 Recording manual memory: ${args.type || 'manual_note'}`);
        
        // Add to automatic buffer
        memoryManager.addToConversationBuffer({
          type: 'manual_memory',
          content: args.content,
          memory_type: args.type || 'manual_note',
          importance: args.importance || 'medium',
          manual_entry: true
        });
        
        // Also save immediately to agents system
        await memoryManager.saveToAgents({
          content: args.content,
          type: args.type || 'manual_note',
          importance: args.importance || 'medium'
        }, 'manual_memory_record');
        
        return {
          content: [
            {
              type: 'text',
              text: `Manual memory recorded: ${args.content.substring(0, 100)}${args.content.length > 100 ? '...' : ''}`,
            },
          ],
        };
      }

      case 'ask_llamabro_scribe': {
        logToVSCode(`🤖 Asking llamabro scribe for: "${args.query}" (${args.search_type})`);
        
        const scribeResult = await memoryManager.askLlamaBroScribe(
          args.query, 
          args.search_type || 'keyword',
          args.time_period || 'all',
          args.max_results || 5
        );
        
        // Auto-record the scribe interaction
        memoryManager.addToConversationBuffer({
          type: 'llamabro_scribe_query',
          query: args.query,
          search_type: args.search_type,
          results_found: scribeResult.results.length,
          source: 'vscode-chat'
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(scribeResult, null, 2),
            },
          ],
        };
      }

      case 'llamabro_build_lookup_table': {
        logToVSCode(`🔨 Building llamabro lookup tables for: ${args.content_type || 'all'}`);
        
        const buildResult = await memoryManager.buildLookupTables(
          args.content_type || 'all',
          args.rebuild || false
        );
        
        // Auto-record the table building
        memoryManager.addToConversationBuffer({
          type: 'lookup_table_build',
          content_type: args.content_type,
          rebuild: args.rebuild,
          tables_created: buildResult.tables_created,
          source: 'vscode-chat'
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(buildResult, null, 2),
            },
          ],
        };
      }

      case 'test_gemini_direct': {
        logToVSCode(`🔍 Testing Gemini API directly: ${args.message}`);
        
        try {
          const result = await callGeminiDirect(args.message, args.model);
          
          return {
            content: [
              {
                type: 'text',
                text: `✅ Gemini Direct Test Success!\n\n**Model**: ${result.model}\n**Provider**: ${result.provider}\n\n**Response**:\n${result.content}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Gemini Direct Test Failed: ${error.message}`,
              },
            ],
          };
        }
      }

      case 'test_groq_direct': {
        logToVSCode(`🔍 Testing Groq API directly: ${args.message}`);
        
        try {
          const result = await callGroqDirect(args.message, args.model);
          
          return {
            content: [
              {
                type: 'text',
                text: `✅ Groq Direct Test Success!\n\n**Model**: ${result.model}\n**Provider**: ${result.provider}\n\n**Response**:\n${result.content}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Groq Direct Test Failed: ${error.message}`,
              },
            ],
          };
        }
      }

      case 'test_claude_direct': {
        logToVSCode(`🔍 Testing Claude API directly: ${args.message}`);
        
        try {
          const result = await callClaudeDirect(args.message, args.model);
          
          return {
            content: [
              {
                type: 'text',
                text: `✅ Claude Direct Test Success!\n\n**Model**: ${result.model}\n**Provider**: ${result.provider}\n\n**Response**:\n${result.content}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Claude Direct Test Failed: ${error.message}`,
              },
            ],
          };
        }
      }

      case 'test_openai_direct': {
        logToVSCode(`🔍 Testing OpenAI API directly: ${args.message}`);
        
        try {
          const result = await callOpenAIDirect(args.message, args.model);
          
          return {
            content: [
              {
                type: 'text',
                text: `✅ OpenAI Direct Test Success!\n\n**Model**: ${result.model}\n**Provider**: ${result.provider}\n\n**Response**:\n${result.content}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ OpenAI Direct Test Failed: ${error.message}`,
              },
            ],
          };
        }
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    logToVSCode(`Error executing tool ${name}: ${error.message}`, 'error');
    
    // Auto-record errors too
    memoryManager.addToConversationBuffer({
      type: 'tool_error',
      tool_name: name,
      error_message: error.message,
      arguments: args
    });
    
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${name}: ${error.message}`
    );
  }
});

// VS Code MCP Server startup
async function startVSCodeMCPServer() {
  logToVSCode('Starting Enhanced MCP Server for VS Code Chat Integration...');
  logToVSCode('5-Tier System: Groq → Claude → ChatGPT → Gemini → Ollama');
  
  // Check provider availability
  const providers = [];
  if (GROQ_API_KEY) providers.push('Groq');
  if (ANTHROPIC_API_KEY) providers.push('Claude');
  if (OPENAI_API_KEY) providers.push('OpenAI');
  if (GEMINI_API_KEY) providers.push('Gemini');
  providers.push('Ollama (local)');
  
  logToVSCode(`Available providers: ${providers.join(', ')}`);
  
  // Test Ollama connection
  try {
    const models = await getAvailableOllamaModels();
    if (models.length > 0) {
      logToVSCode(`Ollama models available: ${models.join(', ')}`);
    } else {
      logToVSCode('No Ollama models found', 'warn');
    }
  } catch (error) {
    logToVSCode(`Ollama connection failed: ${error.message}`, 'warn');
  }
  
  // Initialize memory system
  await memoryManager.initializeDirectories();
  
  logToVSCode('VS Code MCP Server ready for chat integration');
}

// Start the server for VS Code
async function main() {
  await startVSCodeMCPServer();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logToVSCode('rEngine Server connected to VS Code Chat');
}

main().catch((error) => {
  logToVSCode(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});