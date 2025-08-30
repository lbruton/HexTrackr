#!/usr/bin/env node

// Smart Scribe System - Continuous Knowledge Management with Qwen2.5-Coder
// Monitors, analyzes, optimizes search tables, and maintains technical knowledge database

import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import chokidar from 'chokidar';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import SmartScribeMemoryMonitor from './smart-scribe-memory-monitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SmartScribe {
    constructor() {
        this.configPath = path.join(__dirname, 'system-config.json');
        this.config = fs.readJsonSync(this.configPath);
        this.baseDir = '/Volumes/DATA/GitHub/rEngine';
        this.knowledgeDB = path.join(this.baseDir, 'rEngine', 'technical-knowledge.json');
        this.searchTables = path.join(this.baseDir, 'rEngine', 'search-optimization.json');
        this.chatLogsPath = path.join(this.baseDir, 'rMemory', 'memory-scribe', 'logs');
        this.ollamaEndpoint = this.config.brainShareSystem.smartScribe.localLlm.endpoint;
        this.model = this.config.brainShareSystem.smartScribe.localLlm.model;
        this.isProcessing = false;
        this.lastActivity = Date.now();
        this.systemPrompts = this.initializeSystemPrompts();
        this.memoryMonitor = new SmartScribeMemoryMonitor();
        this.jsonParseFailures = []; // Track files that need Claude fallback
        
        console.log('🤖 Smart Scribe initializing...');
        this.initialize();
    }

    initializeSystemPrompts() {
        return {
            documentAnalysis: `You are a technical documentation expert and knowledge architect. Your job is to analyze technical documents and extract structured knowledge.

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

OUTPUT FORMAT: Always respond with valid JSON containing:
{
  "concepts": [{"term": "name", "definition": "meaning", "category": "type", "relationships": ["related_terms"]}],
  "patterns": [{"pattern": "code_pattern", "usage": "when_to_use", "examples": ["example1"]}],
  "keywords": ["searchable", "terms"],
  "summary": "brief_overview",
  "importance": "high|medium|low",
  "type": "document_type"
}

CRITICAL: Your response must be ONLY valid JSON - no markdown formatting, no explanations, no code blocks. Start directly with { and end with }.`,

            chatAnalysis: `You are a conversation analyst specialized in technical development sessions. Extract actionable knowledge from chat logs.

EXTRACTION TARGETS:
1. Technical decisions and their reasoning
2. Problem-solution pairs that were successful
3. User preferences and workflow patterns
4. Code changes and their impact
5. Error resolution strategies
6. Feature requests and implementations
7. Performance insights and optimizations

MEMORY PRIORITIES:
- HIGH: Architecture decisions, successful solutions, critical bugs
- MEDIUM: User preferences, workflow optimizations, tool usage
- LOW: Routine operations, standard procedures

OUTPUT FORMAT: Valid JSON with:
{
  "decisions": [{"decision": "what", "reasoning": "why", "impact": "future_relevance"}],
  "solutions": [{"problem": "issue", "solution": "fix", "effectiveness": "rating"}],
  "preferences": [{"user_preference": "what", "evidence": "supporting_data"}],
  "insights": [{"insight": "discovery", "value": "future_benefit"}],
  "keywords": ["relevant", "tags"],
  "session_summary": "overview"
}

CRITICAL: Your response must be ONLY valid JSON - no markdown formatting, no explanations, no code blocks. Start directly with { and end with }.`,

            keepAlive: `You are a cheerful Jamaican AI assistant monitoring system health. 

When someone says "sanka ya dead mon", always respond EXACTLY with: "ya mon"

This confirms you're alive and well. After responding, reinitialize your system prompts and clear any conversation context to ensure optimal performance.`
        };
    }

    async initialize() {
        try {
            // Ensure Qwen model is loaded
            await this.ensureModelLoaded();
            
            // Initialize knowledge database
            await this.initializeKnowledgeDB();
            
            // Start file monitoring
            this.startFileWatching();
            
            // Start chat log monitoring
            this.startChatLogMonitoring();
            
            // Start idle processing
            this.startIdleProcessor();
            
            // Start handoff scheduler
            this.startHandoffScheduler();
            
            // Start memory health monitoring
            this.startMemoryHealthMonitoring();
            
            console.log('✅ Smart Scribe fully operational');
            
            // Initial system scan
            setTimeout(() => this.performIdleAnalysis(), 5000);
            
        } catch (error) {
            console.error('❌ Smart Scribe initialization failed:', error);
        }
    }

    async ensureModelLoaded() {
        try {
            // Check if model is running
            const response = await axios.get(`${this.ollamaEndpoint}/api/ps`);
            const runningModels = response.data.models || [];
            
            const isRunning = runningModels.some(m => m.name === this.model);
            
            if (!isRunning) {
                console.log(`🔄 Loading ${this.model}...`);
                await this.queryOllama('System initialization', this.systemPrompts.keepAlive);
                console.log(`✅ ${this.model} loaded and ready`);
            }
            
        } catch (error) {
            console.log(`⚠️  Ollama not ready, attempting to start model: ${error.message}`);
            try {
                await this.queryOllama('System check', this.systemPrompts.keepAlive);
            } catch (startError) {
                console.error('❌ Failed to start model:', startError.message);
            }
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
                model: this.model,
                messages: messages,
                stream: false
            });
            
            const content = response.data.message.content;
            
            if (expectJSON) {
                try {
                    // Try to extract JSON from the response if it's wrapped in markdown
                    let jsonContent = content;
                    
                    // Handle markdown code blocks
                    const jsonBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
                    if (jsonBlockMatch) {
                        jsonContent = jsonBlockMatch[1];
                    }
                    
                    // Try direct parsing
                    return JSON.parse(jsonContent);
                } catch (parseError) {
                    console.warn('⚠️  JSON parse failed, trying fallback approach');
                    
                    // Mark for Claude fallback processing
                    this.jsonParseFailures = this.jsonParseFailures || [];
                    this.jsonParseFailures.push({
                        content: content,
                        error: parseError.message,
                        timestamp: new Date().toISOString()
                    });
                    
                    // Create a minimal valid response structure
                    return {
                        raw_content: content,
                        parse_error: parseError.message,
                        summary: "Content analysis completed (JSON parsing failed)",
                        keywords: [],
                        type: "raw_analysis",
                        importance: "medium",
                        needs_claude_fallback: true
                    };
                }
            }
            
            return content;
            
        } catch (error) {
            console.error('❌ Ollama query failed:', error.message);
            return null;
        }
    }

    async initializeKnowledgeDB() {
        if (!await fs.pathExists(this.knowledgeDB)) {
            const initialDB = {
                metadata: {
                    created: new Date().toISOString(),
                    last_updated: new Date().toISOString(),
                    version: '1.0.0',
                    total_concepts: 0,
                    total_patterns: 0
                },
                concepts: {},
                patterns: {},
                search_index: {},
                chat_insights: {},
                document_analysis: {}
            };
            
            await fs.writeJson(this.knowledgeDB, initialDB, { spaces: 2 });
            console.log('📚 Technical knowledge database initialized');
        }

        if (!await fs.pathExists(this.searchTables)) {
            const initialTables = {
                metadata: {
                    created: new Date().toISOString(),
                    last_optimized: new Date().toISOString(),
                    optimization_count: 0
                },
                keyword_frequency: {},
                concept_relationships: {},
                search_performance: {},
                optimization_history: []
            };
            
            await fs.writeJson(this.searchTables, initialTables, { spaces: 2 });
            console.log('🔍 Search optimization tables initialized');
        }
    }

    startFileWatching() {
        const watchPaths = [
            path.join(this.baseDir, '**/*.md'),
            path.join(this.baseDir, '**/*.js'),
            path.join(this.baseDir, '**/*.json'),
            path.join(this.baseDir, '**/*.sh')
        ];

        const watcher = chokidar.watch(watchPaths, {
            ignored: [
                '**/node_modules/**',
                '**/backups/**',
                '**/archive/**',
                this.knowledgeDB,
                this.searchTables
            ],
            persistent: true,
            ignoreInitial: true
        });

        watcher.on('change', (filePath) => {
            console.log(`📝 File changed: ${path.basename(filePath)}`);
            this.scheduleFileAnalysis(filePath);
        });

        watcher.on('add', (filePath) => {
            console.log(`📄 New file: ${path.basename(filePath)}`);
            this.scheduleFileAnalysis(filePath);
        });

        console.log('👁️  File watching active');
    }

    startChatLogMonitoring() {
        if (!fs.existsSync(this.chatLogsPath)) {
            console.log('⚠️  Chat logs path not found, skipping chat monitoring');
            return;
        }

        const logWatcher = chokidar.watch(path.join(this.chatLogsPath, '**/*.log'), {
            persistent: true,
            ignoreInitial: true
        });

        logWatcher.on('change', (logPath) => {
            console.log(`💬 Chat log updated: ${path.basename(logPath)}`);
            this.analyzeChatLog(logPath);
        });

        console.log('💬 Chat log monitoring active');
    }

    startIdleProcessor() {
        // Check for idle state every 30 seconds
        setInterval(() => {
            const timeSinceActivity = Date.now() - this.lastActivity;
            const isIdle = timeSinceActivity > 60000; // 1 minute idle
            
            if (isIdle && !this.isProcessing) {
                this.performIdleAnalysis();
            }
        }, 30000);

        console.log('😴 Idle processing scheduler active');
    }

    startHandoffScheduler() {
        // Generate handoff every 30 minutes
        setInterval(() => {
            this.generateHandoffLog();
        }, 30 * 60 * 1000);

        console.log('📋 Handoff scheduler active (every 30 minutes)');
        
        // Generate initial handoff after 5 minutes
        setTimeout(() => {
            this.generateHandoffLog();
        }, 5 * 60 * 1000);
    }

    startMemoryHealthMonitoring() {
        // Perform memory health check every 15 minutes
        setInterval(() => {
            this.performMemoryHealthCheck();
        }, 15 * 60 * 1000);

        console.log('🧠 Memory health monitoring active (every 15 minutes)');
        
        // Perform initial health check after 2 minutes (let system stabilize first)
        setTimeout(() => {
            this.performMemoryHealthCheck();
        }, 2 * 60 * 1000);
        
        // Process JSON parse failures with Claude every 20 minutes
        setInterval(() => {
            this.processJSONFailuresWithClaude();
        }, 20 * 60 * 1000);
        
        console.log('🤖 Claude fallback processing scheduled (every 20 minutes)');
    }

    async performMemoryHealthCheck() {
        console.log('🔍 Performing memory health check...');
        
        try {
            const healthReport = await this.memoryMonitor.performHealthCheck();
            
            // Log the health status
            console.log(`🧠 Memory Health Status: ${healthReport.overall_health}`);
            
            // If there are issues, generate detailed report for logging
            if (healthReport.overall_health === 'CRITICAL' || healthReport.overall_health === 'WARNING') {
                console.log('⚠️  Memory health issues detected, generating detailed report...');
                
                // Generate AI analysis of memory issues
                const analysisPrompt = `Analyze this memory health report and provide actionable recommendations:

MEMORY HEALTH REPORT:
${JSON.stringify(healthReport, null, 2)}

Please provide:
1. Root cause analysis of any detected issues
2. Immediate action items to resolve critical problems
3. Preventive measures to avoid future issues
4. Impact assessment on system reliability
5. Recommended monitoring frequency adjustments

Format as a technical incident report with clear priority levels.`;

                const memoryAnalysis = await this.queryOllama(analysisPrompt, this.systemPrompts.documentAnalysis, false);
                
                // Store memory incident report
                await this.storeMemoryIncidentReport(healthReport, memoryAnalysis);
                
                console.log('📋 Memory incident report generated and stored');
            } else {
                console.log('✅ Memory systems healthy');
            }
            
        } catch (error) {
            console.error('❌ Memory health check failed:', error);
            
            // Log the failure as a critical incident
            await this.storeMemoryIncidentReport({
                error: error.message,
                timestamp: new Date().toISOString(),
                overall_health: 'UNKNOWN'
            }, `Memory health monitoring system failure: ${error.message}`);
        }
    }

    async storeMemoryIncidentReport(healthReport, analysis) {
        try {
            const timestamp = new Date().toISOString();
            const reportData = {
                timestamp,
                type: 'memory_health_incident',
                health_report: healthReport,
                ai_analysis: analysis,
                generated_by: 'smart_scribe_memory_monitor'
            };
            
            // Store in memory scribe logs
            const reportPath = path.join(this.baseDir, 'rMemory', 'memory-scribe', 'logs', `memory-incident-${Date.now()}.json`);
            await fs.ensureDir(path.dirname(reportPath));
            await fs.writeJson(reportPath, reportData, { spaces: 2 });
            
            // Also append to main scribe log for historical tracking
            const logEntry = `[${timestamp}] MEMORY_HEALTH: ${healthReport.overall_health} - Report stored at ${reportPath}\n`;
            const scribeLogPath = path.join(this.baseDir, 'scribe.log');
            await fs.appendFile(scribeLogPath, logEntry);
            
            console.log(`📁 Memory incident report stored: ${path.basename(reportPath)}`);
            
        } catch (error) {
            console.error('❌ Failed to store memory incident report:', error);
        }
    }

    async generateHandoffLog() {
        console.log('📝 Generating agent handoff log...');
        
        try {
            // Get current system state
            const systemState = await this.getCurrentSystemState();
            
            // Analyze recent context
            const recentContext = await this.analyzeRecentContext();
            
            // Generate handoff prompt
            const handoffPrompt = `Generate a comprehensive handoff log for agent continuity:

CURRENT SYSTEM STATE:
${JSON.stringify(systemState, null, 2)}

RECENT CONTEXT (last 30 minutes):
${recentContext}

Create a handoff log that includes:
1. Current project status and active tasks
2. Recent decisions and their reasoning
3. User preferences observed in this session
4. Technical context and important discoveries
5. Next logical steps or pending items
6. Critical information for seamless continuation

Format as a structured handoff document with clear sections and actionable next steps.`;

            const handoffData = await this.queryOllama(handoffPrompt, this.systemPrompts.documentAnalysis, false);
            
            // Store handoff log
            await this.storeHandoffLog(handoffData);
            
        } catch (error) {
            console.error('❌ Handoff generation failed:', error);
        }
    }

    async getCurrentSystemState() {
        return {
            timestamp: new Date().toISOString(),
            active_processes: await this.getActiveProcesses(),
            recent_files_modified: await this.getRecentFileChanges(),
            current_git_status: await this.getGitStatus(),
            running_models: await this.getRunningModels(),
            knowledge_db_stats: await this.getKnowledgeStats()
        };
    }

    async analyzeRecentContext() {
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        const db = await fs.readJson(this.knowledgeDB);
        
        let recentContext = "RECENT ACTIVITY:\n";
        
        // Get recent chat insights
        for (const [sessionKey, insight] of Object.entries(db.chat_insights)) {
            const analyzedTime = new Date(insight.analyzed_at).getTime();
            if (analyzedTime > thirtyMinutesAgo) {
                recentContext += `\nCHAT SESSION: ${sessionKey}\n`;
                recentContext += `Summary: ${insight.analysis.session_summary || 'No summary'}\n`;
                if (insight.analysis.decisions) {
                    recentContext += `Decisions: ${insight.analysis.decisions.map(d => d.decision).join(', ')}\n`;
                }
            }
        }
        
        // Get recent document analyses
        for (const [filePath, analysis] of Object.entries(db.document_analysis)) {
            const analyzedTime = new Date(analysis.analyzed_at).getTime();
            if (analyzedTime > thirtyMinutesAgo) {
                recentContext += `\nFILE ANALYZED: ${filePath}\n`;
                recentContext += `Type: ${analysis.analysis.type || 'unknown'}\n`;
                recentContext += `Summary: ${analysis.analysis.summary || 'No summary'}\n`;
            }
        }
        
        return recentContext;
    }

    async storeHandoffLog(handoffData) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        // Fix: Use rMemory/rAgentMemories directory (avoid confusion with rAgents)
        const handoffDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        await fs.ensureDir(handoffDir);
        
        const handoffFile = path.join(handoffDir, `catch-up-${timestamp}.md`);
        
        const handoffContent = `# Agent Handoff Log
**Generated:** ${new Date().toISOString()}
**Duration:** 30-minute context window
**Source:** Smart Scribe System

## Quick Continuation Prompt
\`\`\`
To continue from this point, load this handoff context and say:
"Resume from handoff ${timestamp} - show me current status and next steps"
\`\`\`

## Handoff Details
${handoffData}

## System Integration
- **Memory Status:** Available via MCP Memory sync
- **Knowledge Base:** ${await this.getKnowledgeStats()}
- **Active Models:** ${await this.getRunningModels()}
- **File Watching:** Active on all project files

---
*This handoff log expires after 8 hours and will be archived automatically*
`;

        await fs.writeFile(handoffFile, handoffContent);
        
        // Clean up old handoff files (keep 8 hours worth)
        await this.cleanupOldHandoffs(handoffDir);
        
        console.log(`📤 Handoff log created: catch-up-${timestamp}.md`);
    }

    async cleanupOldHandoffs(handoffDir) {
        const eightHoursAgo = Date.now() - (8 * 60 * 60 * 1000);
        
        try {
            const files = await fs.readdir(handoffDir);
            const handoffFiles = files.filter(f => f.startsWith('catch-up-') && f.endsWith('.md'));
            
            for (const file of handoffFiles) {
                const filePath = path.join(handoffDir, file);
                const stats = await fs.stat(filePath);
                
                if (stats.mtime.getTime() < eightHoursAgo) {
                    // Archive to compressed folder instead of deleting
                    const archiveDir = path.join(handoffDir, 'archived');
                    await fs.ensureDir(archiveDir);
                    await fs.move(filePath, path.join(archiveDir, file));
                    console.log(`🗄️  Archived old handoff: ${file}`);
                }
            }
        } catch (error) {
            console.warn('⚠️  Handoff cleanup warning:', error.message);
        }
    }

    // Add helper methods
    async getActiveProcesses() {
        try {
            const processes = execSync('ps aux | grep -E "(ollama|node.*scribe|mcp)" | grep -v grep', { encoding: 'utf8' });
            return processes.trim().split('\n').map(p => p.split(/\s+/).slice(1, 3).join(' '));
        } catch (error) {
            return [];
        }
    }

    async getRecentFileChanges() {
        try {
            const changes = execSync(`find ${this.baseDir} -type f -mtime -1 -name "*.md" -o -name "*.js" -o -name "*.json" | head -10`, { encoding: 'utf8' });
            return changes.trim().split('\n').filter(f => f);
        } catch (error) {
            return [];
        }
    }

    async getGitStatus() {
        try {
            const status = execSync('git status --porcelain', { cwd: this.baseDir, encoding: 'utf8' });
            return status.trim();
        } catch (error) {
            return 'Git status unavailable';
        }
    }

    async getRunningModels() {
        try {
            const response = await axios.get(`${this.ollamaEndpoint}/api/ps`);
            return response.data.models?.map(m => m.name).join(', ') || 'None';
        } catch (error) {
            return 'Ollama unavailable';
        }
    }

    async getKnowledgeStats() {
        try {
            const db = await fs.readJson(this.knowledgeDB);
            return `${db.metadata.total_concepts} concepts, ${db.metadata.total_patterns} patterns`;
        } catch (error) {
            return 'Knowledge DB unavailable';
        }
    }

    async performIdleAnalysis() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        console.log('🧠 Starting idle analysis...');
        
        try {
            // Analyze all documentation
            await this.analyzeAllDocuments();
            
            // Optimize search tables
            await this.optimizeSearchTables();
            
            // Clean up old data
            await this.performMaintenance();
            
            console.log('✅ Idle analysis complete');
            
        } catch (error) {
            console.error('❌ Idle analysis failed:', error);
        } finally {
            this.isProcessing = false;
            this.lastActivity = Date.now();
        }
    }

    async analyzeAllDocuments() {
        const docPaths = [
            path.join(this.baseDir, 'rAgents', '**/*.md'),
            path.join(this.baseDir, 'rEngine', '**/*.js'),
            path.join(this.baseDir, 'rMemory', '**/*.md'),
            path.join(this.baseDir, 'rScribe', '**/*.md'),
            path.join(this.baseDir, '*.md')
        ];

        for (const pattern of docPaths) {
            try {
                const files = await this.globFiles(pattern);
                for (const file of files.slice(0, 5)) { // Process 5 files per idle cycle
                    await this.analyzeDocument(file);
                    await this.sleep(1000); // Prevent overwhelming the system
                }
            } catch (error) {
                console.warn(`⚠️  Document analysis error for ${pattern}:`, error.message);
            }
        }
    }

    async analyzeDocument(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const relativePath = path.relative(this.baseDir, filePath);
            
            if (content.length > 50000) {
                console.log(`⚠️  Skipping large file: ${relativePath}`);
                return;
            }

            const prompt = `Analyze this technical document and extract structured knowledge:

FILE: ${relativePath}
CONTENT:
${content.substring(0, 10000)}${content.length > 10000 ? '...' : ''}

Focus on technical concepts, patterns, and relationships that would be valuable for future development work.`;

            const analysis = await this.queryOllama(prompt, this.systemPrompts.documentAnalysis, true);
            
            if (analysis && typeof analysis === 'object') {
                await this.storeDocumentAnalysis(relativePath, analysis);
                console.log(`📚 Analyzed: ${relativePath}`);
                
                // Trigger HTML generation for documentation files
                if (relativePath.includes('docs/') || relativePath.includes('patchnotes/')) {
                    await this.regenerateHTMLDocumentation();
                }
            }

        } catch (error) {
            console.warn(`⚠️  Document analysis failed for ${filePath}:`, error.message);
            
            // Fallback to Claude for comprehensive processing
            console.log(`🔄 Attempting Claude fallback for: ${path.relative(this.baseDir, filePath)}`);
            await this.claudeFallbackProcessing(filePath, error.message);
        }
    }

    async storeDocumentAnalysis(filePath, analysis) {
        const db = await fs.readJson(this.knowledgeDB);
        
        db.document_analysis[filePath] = {
            analysis,
            analyzed_at: new Date().toISOString(),
            file_path: filePath
        };

        // Update search index
        if (analysis.keywords) {
            for (const keyword of analysis.keywords) {
                if (!db.search_index[keyword]) {
                    db.search_index[keyword] = [];
                }
                if (!db.search_index[keyword].includes(filePath)) {
                    db.search_index[keyword].push(filePath);
                }
            }
        }

        // Store concepts
        if (analysis.concepts) {
            for (const concept of analysis.concepts) {
                db.concepts[concept.term] = {
                    ...concept,
                    source_file: filePath,
                    updated_at: new Date().toISOString()
                };
            }
        }

        // Store patterns
        if (analysis.patterns) {
            for (const pattern of analysis.patterns) {
                const patternKey = `${pattern.pattern}_${Date.now()}`;
                db.patterns[patternKey] = {
                    ...pattern,
                    source_file: filePath,
                    updated_at: new Date().toISOString()
                };
            }
        }

        db.metadata.last_updated = new Date().toISOString();
        db.metadata.total_concepts = Object.keys(db.concepts).length;
        db.metadata.total_patterns = Object.keys(db.patterns).length;

        await fs.writeJson(this.knowledgeDB, db, { spaces: 2 });
    }

    async regenerateHTMLDocumentation() {
        try {
            console.log('🔄 Regenerating HTML documentation via Gemini...');
            
            // Use our new unified document-scribe system with Gemini for HTML conversion
            const documentScribePath = path.join(__dirname, 'document-scribe.js');
            
            // Check if document-scribe exists
            if (!await fs.pathExists(documentScribePath)) {
                console.warn('⚠️  Document scribe not found:', documentScribePath);
                return;
            }
            
            // Run HTML sweep via Gemini (rate-limited and intelligent)
            execSync(`node "${documentScribePath}" --html-sweep`, { 
                cwd: this.baseDir,
                stdio: 'pipe' // Suppress output to avoid clutter
            });
            
            console.log('✅ HTML documentation regenerated via Gemini');
            
        } catch (error) {
            console.warn('⚠️  HTML generation failed:', error.message);
        }
    }

    /**
     * Claude fallback processing for files that failed with Qwen
     * Provides comprehensive MD, JSON, and HTML processing
     */
    async claudeFallbackProcessing(filePath, originalError) {
        try {
            const relativePath = path.relative(this.baseDir, filePath);
            const content = await fs.readFile(filePath, 'utf8');
            const documentScribePath = path.join(__dirname, 'document-scribe.js');
            
            console.log(`🤖 Claude processing: ${relativePath}`);
            
            // Step 1: Generate comprehensive markdown documentation with Claude
            const mdPrompt = `FALLBACK PROCESSING REQUEST
            
Original Error: ${originalError}
File: ${relativePath}
            
Please provide comprehensive technical documentation for this file. Include:

1. **Purpose & Overview**: What this file does and why it exists
2. **Technical Analysis**: Key functions, classes, patterns, dependencies
3. **Usage Examples**: How to use/call this code
4. **Error Context**: Why this might have failed with other processors
5. **Recommendations**: Optimization suggestions or important notes

File Content:
\`\`\`
${content.substring(0, 15000)}${content.length > 15000 ? '\n[TRUNCATED - File is large]' : ''}
\`\`\`

Format as structured markdown with clear headings and technical accuracy.`;

            // Call Claude via document-scribe
            const mdResult = await this.callDocumentScribe('claude', mdPrompt, 'documentation');
            
            if (mdResult) {
                // Save markdown documentation
                const mdOutputPath = path.join(this.baseDir, 'rDocuments/autogen/claude-fallback', relativePath.replace(path.extname(relativePath), '.md'));
                await fs.ensureDir(path.dirname(mdOutputPath));
                await fs.writeFile(mdOutputPath, mdResult, 'utf8');
                console.log(`📝 Claude MD saved: ${path.relative(this.baseDir, mdOutputPath)}`);
                
                // Step 2: Generate structured JSON analysis
                const jsonPrompt = `Create structured JSON analysis for: ${relativePath}

Content: ${content.substring(0, 8000)}

Return valid JSON with:
{
  "file_path": "${relativePath}",
  "analysis_type": "claude_fallback",
  "original_error": "${originalError}",
  "summary": "brief description",
  "keywords": ["keyword1", "keyword2"],
  "technical_details": {
    "functions": [],
    "dependencies": [],
    "patterns": []
  },
  "complexity_score": 1-10,
  "recommendations": [],
  "processing_notes": "why this needed Claude fallback"
}`;

                const jsonResult = await this.callDocumentScribe('claude', jsonPrompt, 'analysis');
                
                if (jsonResult) {
                    try {
                        const analysis = JSON.parse(jsonResult);
                        await this.storeDocumentAnalysis(`${relativePath}[claude-fallback]`, analysis);
                        console.log(`📊 Claude JSON saved: ${relativePath}`);
                    } catch (parseError) {
                        console.warn(`⚠️  Claude JSON parse failed: ${parseError.message}`);
                    }
                }
                
                // Step 3: Generate HTML with Gemini (faster for HTML)
                const htmlPrompt = `Convert this markdown documentation to clean, professional HTML:

${mdResult}

Requirements:
- Clean HTML5 structure
- Responsive design classes
- Proper code syntax highlighting
- Clear navigation
- Professional styling`;

                const htmlResult = await this.callDocumentScribe('gemini', htmlPrompt, 'html');
                
                if (htmlResult) {
                    const htmlOutputPath = path.join(this.baseDir, 'rDocuments/html/claude-fallback', relativePath.replace(path.extname(relativePath), '.html'));
                    await fs.ensureDir(path.dirname(htmlOutputPath));
                    await fs.writeFile(htmlOutputPath, htmlResult, 'utf8');
                    console.log(`🌐 HTML saved: ${path.relative(this.baseDir, htmlOutputPath)}`);
                }
                
                console.log(`✅ Claude fallback complete: ${relativePath}`);
            }
            
        } catch (fallbackError) {
            console.error(`❌ Claude fallback failed for ${filePath}:`, fallbackError.message);
        }
    }

    /**
     * Helper to call document-scribe with specific providers
     */
    async callDocumentScribe(provider, prompt, taskType = 'documentation') {
        try {
            const documentScribePath = path.join(__dirname, 'document-scribe.js');
            const result = execSync(`node "${documentScribePath}" --provider ${provider} --prompt "${prompt.replace(/"/g, '\\"')}"`, {
                cwd: this.baseDir,
                encoding: 'utf8',
                maxBuffer: 1024 * 1024 * 5, // 5MB buffer
                timeout: 120000 // 2 minute timeout
            });
            
            // Extract response from document-scribe output
            const responseMatch = result.match(/--- Response ---([\s\S]*?)--- End Response ---/);
            return responseMatch ? responseMatch[1].trim() : null;
            
        } catch (error) {
            console.warn(`⚠️  Document scribe ${provider} call failed:`, error.message);
            return null;
        }
    }

    /**
     * Process accumulated JSON parse failures with Claude
     */
    async processJSONFailuresWithClaude() {
        if (!this.jsonParseFailures || this.jsonParseFailures.length === 0) {
            return;
        }
        
        console.log(`🔄 Processing ${this.jsonParseFailures.length} JSON parse failures with Claude...`);
        
        for (const failure of this.jsonParseFailures.slice(0, 5)) { // Process 5 at a time
            try {
                const prompt = `URGENT: JSON Parse Failure Recovery

This content failed JSON parsing with our local model. Please analyze and create valid JSON:

ERROR: ${failure.error}
TIMESTAMP: ${failure.timestamp}

CONTENT TO ANALYZE:
${failure.content}

Please provide a valid JSON response with:
{
  "recovery_analysis": "why parsing failed and what content represents",
  "summary": "clear technical summary",
  "keywords": ["extracted", "technical", "terms"],
  "content_type": "identified type (code, docs, config, etc)",
  "complexity": 1-10,
  "recommendations": ["actionable suggestions"],
  "structured_data": {
    "functions": [],
    "classes": [],
    "configs": {},
    "dependencies": []
  }
}`;

                const result = await this.callDocumentScribe('claude', prompt, 'analysis');
                
                if (result) {
                    try {
                        const analysis = JSON.parse(result);
                        analysis.processed_by_claude_fallback = true;
                        analysis.original_failure = failure;
                        
                        // Store the recovered analysis
                        await this.storeDocumentAnalysis(`json-recovery-${Date.now()}`, analysis);
                        console.log(`✅ JSON failure recovered by Claude`);
                        
                    } catch (parseError) {
                        console.warn(`⚠️  Claude JSON response also failed to parse: ${parseError.message}`);
                    }
                }
                
            } catch (error) {
                console.error(`❌ Claude JSON recovery failed:`, error.message);
            }
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        }
        
        // Clear processed failures
        this.jsonParseFailures = this.jsonParseFailures.slice(5);
        console.log(`✅ JSON failure recovery batch completed`);
    }

    async analyzeChatLog(logPath) {
        try {
            const content = await fs.readFile(logPath, 'utf8');
            const lines = content.split('\n').slice(-100); // Last 100 lines
            const recentContent = lines.join('\n');

            if (recentContent.length < 100) return; // Skip if too little content

            const prompt = `Analyze this recent chat session and extract valuable technical insights:

CHAT LOG:
${recentContent}

Focus on technical decisions, successful solutions, user preferences, and actionable insights for future development sessions.`;

            const analysis = await this.queryOllama(prompt, this.systemPrompts.chatAnalysis, true);
            
            if (analysis && typeof analysis === 'object') {
                await this.storeChatAnalysis(logPath, analysis);
                console.log(`💬 Chat analysis stored: ${path.basename(logPath)}`);
            }

        } catch (error) {
            console.warn(`⚠️  Chat log analysis failed:`, error.message);
        }
    }

    async storeChatAnalysis(logPath, analysis) {
        const db = await fs.readJson(this.knowledgeDB);
        const sessionKey = `${path.basename(logPath)}_${Date.now()}`;
        
        db.chat_insights[sessionKey] = {
            analysis,
            log_file: logPath,
            analyzed_at: new Date().toISOString()
        };

        // Update search index with keywords
        if (analysis.keywords) {
            for (const keyword of analysis.keywords) {
                if (!db.search_index[keyword]) {
                    db.search_index[keyword] = [];
                }
                const entry = `chat:${sessionKey}`;
                if (!db.search_index[keyword].includes(entry)) {
                    db.search_index[keyword].push(entry);
                }
            }
        }

        db.metadata.last_updated = new Date().toISOString();
        await fs.writeJson(this.knowledgeDB, db, { spaces: 2 });
    }

    async optimizeSearchTables() {
        console.log('🔍 Optimizing search tables...');
        
        const db = await fs.readJson(this.knowledgeDB);
        const searchTables = await fs.readJson(this.searchTables);

        // Calculate keyword frequencies
        const keywordFreq = {};
        for (const [keyword, sources] of Object.entries(db.search_index)) {
            keywordFreq[keyword] = sources.length;
        }

        // Identify concept relationships
        const relationships = {};
        for (const [term, concept] of Object.entries(db.concepts)) {
            if (concept.relationships) {
                relationships[term] = concept.relationships;
            }
        }

        // Update optimization tables
        searchTables.keyword_frequency = keywordFreq;
        searchTables.concept_relationships = relationships;
        searchTables.metadata.last_optimized = new Date().toISOString();
        searchTables.metadata.optimization_count++;

        // Record optimization history
        searchTables.optimization_history.push({
            timestamp: new Date().toISOString(),
            keywords_processed: Object.keys(keywordFreq).length,
            concepts_analyzed: Object.keys(db.concepts).length,
            patterns_indexed: Object.keys(db.patterns).length
        });

        // Keep only last 50 optimization records
        if (searchTables.optimization_history.length > 50) {
            searchTables.optimization_history = searchTables.optimization_history.slice(-50);
        }

        await fs.writeJson(this.searchTables, searchTables, { spaces: 2 });
        console.log('✅ Search tables optimized');
    }

    async performMaintenance() {
        // Keep knowledge DB under reasonable size
        const db = await fs.readJson(this.knowledgeDB);
        
        // Archive old chat insights (keep last 100)
        const chatKeys = Object.keys(db.chat_insights);
        if (chatKeys.length > 100) {
            const toArchive = chatKeys.slice(0, chatKeys.length - 100);
            const archivePath = path.join(this.baseDir, 'rEngine', 'archived-insights.json');
            
            let archived = {};
            if (await fs.pathExists(archivePath)) {
                archived = await fs.readJson(archivePath);
            }
            
            for (const key of toArchive) {
                archived[key] = db.chat_insights[key];
                delete db.chat_insights[key];
            }
            
            await fs.writeJson(archivePath, archived, { spaces: 2 });
            await fs.writeJson(this.knowledgeDB, db, { spaces: 2 });
            
            console.log(`🗄️  Archived ${toArchive.length} old chat insights`);
        }
    }

    async scheduleFileAnalysis(filePath) {
        // Debounce file analysis
        setTimeout(() => {
            this.analyzeDocument(filePath);
        }, 2000);
    }

    async globFiles(pattern) {
        // Simple glob implementation
        try {
            const result = execSync(`find ${this.baseDir} -path "${pattern}" -type f 2>/dev/null || true`, { encoding: 'utf8' });
            return result.trim().split('\n').filter(f => f.length > 0);
        } catch (error) {
            return [];
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Keep-alive handler for cron job
    async handleKeepAlive(message) {
        if (message.toLowerCase().includes('sanka ya dead mon')) {
            // Respond with life confirmation
            const response = await this.queryOllama('sanka ya dead mon', this.systemPrompts.keepAlive);
            
            // Reinitialize system prompts
            this.systemPrompts = this.initializeSystemPrompts();
            
            // Ensure model is properly loaded
            await this.ensureModelLoaded();
            
            console.log('💓 Keep-alive successful, system reinitialized');
            return response || 'ya mon';
        }
        return null;
    }

    // Export knowledge for MCP sync
    async exportForMCPSync() {
        const db = await fs.readJson(this.knowledgeDB);
        const exportData = {
            timestamp: new Date().toISOString(),
            source: 'smart-scribe',
            entities: [],
            insights: [],
            concepts: Object.keys(db.concepts).length,
            patterns: Object.keys(db.patterns).length,
            chat_sessions: Object.keys(db.chat_insights).length
        };

        // Convert concepts to MCP entities
        for (const [term, concept] of Object.entries(db.concepts)) {
            exportData.entities.push({
                entityType: 'technical_concept',
                name: term,
                observations: [
                    `Definition: ${concept.definition}`,
                    `Category: ${concept.category}`,
                    `Source: ${concept.source_file}`,
                    `Relationships: ${concept.relationships?.join(', ') || 'none'}`,
                    `Updated: ${concept.updated_at}`
                ]
            });
        }

        // Convert chat insights
        for (const [sessionKey, insight] of Object.entries(db.chat_insights)) {
            if (insight.analysis.decisions) {
                for (const decision of insight.analysis.decisions) {
                    exportData.entities.push({
                        entityType: 'technical_decision',
                        name: `Decision_${sessionKey}_${Date.now()}`,
                        observations: [
                            `Decision: ${decision.decision}`,
                            `Reasoning: ${decision.reasoning}`,
                            `Impact: ${decision.impact}`,
                            `Session: ${sessionKey}`,
                            `Source: smart-scribe-chat-analysis`
                        ]
                    });
                }
            }
        }

        const exportPath = path.join(this.baseDir, 'rEngine', 'scribe-mcp-export.json');
        await fs.writeJson(exportPath, exportData, { spaces: 2 });
        
        console.log(`📤 Exported ${exportData.entities.length} entities for MCP sync`);
        return exportPath;
    }
}

// Export for use in other modules
export default SmartScribe;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const scribe = new SmartScribe();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Smart Scribe shutting down gracefully...');
        process.exit(0);
    });
    
    // Keep process alive
    process.on('uncaughtException', (error) => {
        console.error('💥 Uncaught exception:', error);
        // Don't exit, just log and continue
    });
}
