#!/usr/bin/env node

/**
 * Scribe Summary System
 * Provides on-demand conversation summaries for multiple timeframes
 * Can be called from any chat to get context quickly
 */

import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ScribeSummarySystem {
    constructor() {
        this.baseDir = path.dirname(__dirname);
        this.memoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        this.handoffDir = this.memoryDir;
        this.ollamaEndpoint = 'http://localhost:11434';
        this.model = 'qwen2.5-coder:7b';
        
        console.log('📚 Scribe Summary System initialized');
    }

    async generateSummary(timeframe = '1h') {
        const timeframes = {
            'last': '30 minutes',
            '1h': '1 hour', 
            '6h': '6 hours',
            '12h': '12 hours',
            '24h': '24 hours'
        };

        console.log(`📊 Generating summary for last ${timeframes[timeframe] || timeframe}...`);
        
        try {
            const cutoffTime = this.getTimeframeCutoff(timeframe);
            const relevantData = await this.gatherRelevantData(cutoffTime);
            
            if (!relevantData.length) {
                return `ℹ️  No significant activity found in the last ${timeframes[timeframe] || timeframe}`;
            }

            const summary = await this.summarizeWithAI(relevantData, timeframe);
            return summary;

        } catch (error) {
            console.error('❌ Error generating summary:', error);
            return `⚠️  Unable to generate summary: ${error.message}`;
        }
    }

    getTimeframeCutoff(timeframe) {
        const now = new Date();
        const hours = {
            'last': 0.5,  // 30 minutes
            '1h': 1,
            '6h': 6, 
            '12h': 12,
            '24h': 24
        };
        
        return new Date(now.getTime() - (hours[timeframe] || 1) * 60 * 60 * 1000);
    }

    async gatherRelevantData(cutoffTime) {
        const relevantData = [];
        
        try {
            // Get handoff files
            const handoffFiles = await this.getHandoffFiles(cutoffTime);
            relevantData.push(...handoffFiles);

            // Get recent memory updates
            const memoryUpdates = await this.getRecentMemoryUpdates(cutoffTime);
            relevantData.push(...memoryUpdates);

            // Get git commit history
            const gitHistory = await this.getGitHistory(cutoffTime);
            relevantData.push(...gitHistory);

            // Get scribe logs
            const scribeLogs = await this.getScribeLogs(cutoffTime);
            relevantData.push(...scribeLogs);

        } catch (error) {
            console.error('⚠️  Error gathering data:', error);
        }

        return relevantData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    async getHandoffFiles(cutoffTime) {
        const handoffs = [];
        
        try {
            const files = await fs.readdir(this.handoffDir);
            const handoffFiles = files.filter(f => f.startsWith('catch-up-') && f.endsWith('.md'));
            
            for (const file of handoffFiles) {
                const filePath = path.join(this.handoffDir, file);
                const stats = await fs.stat(filePath);
                
                if (stats.mtime > cutoffTime) {
                    const content = await fs.readFile(filePath, 'utf8');
                    handoffs.push({
                        type: 'handoff',
                        timestamp: stats.mtime.toISOString(),
                        source: file,
                        content: content.substring(0, 2000) // Truncate for processing
                    });
                }
            }
        } catch (error) {
            console.log('ℹ️  No handoff files found');
        }
        
        return handoffs;
    }

    async getRecentMemoryUpdates(cutoffTime) {
        const updates = [];
        
        try {
            const memoryFiles = ['memory.json', 'decisions.json', 'functions.json'];
            
            for (const file of memoryFiles) {
                const filePath = path.join(this.memoryDir, file);
                if (await fs.pathExists(filePath)) {
                    const stats = await fs.stat(filePath);
                    if (stats.mtime > cutoffTime) {
                        updates.push({
                            type: 'memory_update',
                            timestamp: stats.mtime.toISOString(),
                            source: file,
                            content: `${file} was updated`
                        });
                    }
                }
            }
        } catch (error) {
            console.log('ℹ️  No recent memory updates found');
        }
        
        return updates;
    }

    async getGitHistory(cutoffTime) {
        const history = [];
        
        try {
            const { execSync } = await import('child_process');
            const since = cutoffTime.toISOString().split('T')[0];
            const gitLog = execSync(`git log --since="${since}" --oneline --no-merges`, {
                cwd: this.baseDir,
                encoding: 'utf8'
            });
            
            if (gitLog.trim()) {
                const commits = gitLog.trim().split('\n');
                commits.forEach(commit => {
                    history.push({
                        type: 'git_commit',
                        timestamp: new Date().toISOString(), // Approximate
                        source: 'git',
                        content: commit
                    });
                });
            }
        } catch (error) {
            console.log('ℹ️  No recent git activity found');
        }
        
        return history;
    }

    async getScribeLogs(cutoffTime) {
        const logs = [];
        
        try {
            const logDir = path.join(this.baseDir, 'rMemory', 'memory-scribe', 'logs');
            if (await fs.pathExists(logDir)) {
                const files = await fs.readdir(logDir);
                
                for (const file of files) {
                    const filePath = path.join(logDir, file);
                    const stats = await fs.stat(filePath);
                    
                    if (stats.mtime > cutoffTime) {
                        const content = await fs.readFile(filePath, 'utf8');
                        logs.push({
                            type: 'scribe_log',
                            timestamp: stats.mtime.toISOString(),
                            source: file,
                            content: content.substring(0, 1000)
                        });
                    }
                }
            }
        } catch (error) {
            console.log('ℹ️  No scribe logs found');
        }
        
        return logs;
    }

    async summarizeWithAI(data, timeframe) {
        try {
            const prompt = `You are an AI assistant summarizing recent development activity. 

TIMEFRAME: Last ${timeframe}
DATA TO SUMMARIZE:
${data.map(item => `[${item.type}] ${item.timestamp}: ${item.content}`).join('\n\n')}

Please provide a concise summary covering:
1. 🎯 Main objectives and accomplishments
2. 🔧 Technical changes made
3. 🐛 Issues encountered and resolved
4. 📋 Current status and next steps
5. ⚠️  Any warnings or concerns

Keep it brief but informative for quick context switching.`;

            const response = await axios.post(`${this.ollamaEndpoint}/api/generate`, {
                model: this.model,
                prompt: prompt,
                stream: false
            });

            return `📊 **Activity Summary - Last ${timeframe}**\n\n${response.data.response}`;

        } catch (error) {
            console.error('❌ AI summarization failed:', error);
            
            // Fallback to simple text summary
            return this.generateSimpleSummary(data, timeframe);
        }
    }

    generateSimpleSummary(data, timeframe) {
        const summary = [`📊 **Activity Summary - Last ${timeframe}**\n`];
        
        const byType = data.reduce((acc, item) => {
            acc[item.type] = acc[item.type] || [];
            acc[item.type].push(item);
            return acc;
        }, {});

        if (byType.handoff) {
            summary.push(`🔄 **Handoffs**: ${byType.handoff.length} agent handoff(s)`);
        }
        
        if (byType.git_commit) {
            summary.push(`📝 **Git Activity**: ${byType.git_commit.length} commit(s)`);
            summary.push(byType.git_commit.slice(0, 3).map(c => `  • ${c.content}`).join('\n'));
        }
        
        if (byType.memory_update) {
            summary.push(`🧠 **Memory Updates**: ${byType.memory_update.length} file(s) updated`);
        }
        
        if (byType.scribe_log) {
            summary.push(`📚 **Scribe Activity**: ${byType.scribe_log.length} log entry(ies)`);
        }

        return summary.join('\n\n');
    }

    /**
     * Intelligent Pre-Chunking for Documentation Queue
     * Analyzes recent code changes and pre-chunks files for documentation
     * Uses Qwen 2.5 Coder to identify logical chunk boundaries
     */
    async analyzeAndPreChunk(targetFile = null) {
        console.log('🧩 Starting intelligent pre-chunking analysis...');
        
        try {
            // If no target file specified, look for recent changes
            const filesToAnalyze = targetFile ? [targetFile] : await this.findRecentChanges();
            
            if (!filesToAnalyze.length) {
                console.log('ℹ️  No files need pre-chunking');
                return [];
            }

            const preChunkResults = [];
            
            for (const file of filesToAnalyze) {
                console.log(`🔍 Analyzing ${file} for optimal chunking...`);
                
                const analysis = await this.analyzeFileStructure(file);
                if (analysis) {
                    const chunkPlan = await this.createChunkPlan(file, analysis);
                    preChunkResults.push({
                        file,
                        analysis,
                        chunkPlan,
                        timestamp: new Date().toISOString()
                    });
                    
                    // Queue for documentation with optimized chunks
                    await this.queueForDocumentation(file, chunkPlan);
                }
            }
            
            return preChunkResults;
            
        } catch (error) {
            console.error('❌ Pre-chunking analysis failed:', error);
            return [];
        }
    }

    async findRecentChanges() {
        const cutoffTime = new Date(Date.now() - 30 * 60 * 1000); // Last 30 minutes
        const gitHistory = await this.getGitHistory(cutoffTime);
        
        const changedFiles = gitHistory
            .filter(entry => entry.type === 'git_commit')
            .flatMap(entry => entry.files || [])
            .filter(file => file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.html'))
            .filter(file => fs.existsSync(path.join(this.baseDir, file)));
            
        return [...new Set(changedFiles)]; // Remove duplicates
    }

    async analyzeFileStructure(filePath) {
        try {
            const fullPath = path.join(this.baseDir, filePath);
            const content = await fs.readFile(fullPath, 'utf8');
            const lines = content.split('\n');
            
            if (lines.length < 100) {
                return null; // Too small to need chunking
            }

            const prompt = `Analyze this ${path.extname(filePath)} file structure and identify optimal chunking boundaries.
File: ${filePath} (${lines.length} lines)

Look for:
- Function/class boundaries
- Major sections or modules
- Comment-separated logical blocks
- Import/export sections

Respond with JSON only:
{
  "recommendedChunkSize": 150-300,
  "boundaries": [
    {"line": 1, "type": "imports", "description": "Import section"},
    {"line": 45, "type": "class", "description": "Main class definition"},
    {"line": 120, "type": "methods", "description": "Helper methods"}
  ],
  "complexity": "low|medium|high"
}

First 50 lines:
${lines.slice(0, 50).join('\n')}

Last 20 lines:
${lines.slice(-20).join('\n')}`;

            const response = await axios.post(`${this.ollamaEndpoint}/api/generate`, {
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.1,
                    num_predict: 500
                }
            });

            return JSON.parse(response.data.response);
            
        } catch (error) {
            console.error(`⚠️  Analysis failed for ${filePath}:`, error);
            return null;
        }
    }

    async createChunkPlan(filePath, analysis) {
        const chunkPlan = {
            file: filePath,
            totalLines: analysis.boundaries[analysis.boundaries.length - 1]?.line || 0,
            chunks: [],
            strategy: 'intelligent_boundaries'
        };

        // Create chunks based on boundaries
        for (let i = 0; i < analysis.boundaries.length - 1; i++) {
            const start = analysis.boundaries[i].line;
            const end = analysis.boundaries[i + 1].line - 1;
            const size = end - start + 1;
            
            chunkPlan.chunks.push({
                id: i + 1,
                startLine: start,
                endLine: end,
                size: size,
                type: analysis.boundaries[i].type,
                description: analysis.boundaries[i].description,
                priority: size > 200 ? 'high' : 'normal'
            });
        }

        return chunkPlan;
    }

    async queueForDocumentation(filePath, chunkPlan) {
        const queueFile = path.join(this.baseDir, 'rEngine', 'pre-chunk-queue.json');
        
        try {
            let queue = [];
            if (await fs.pathExists(queueFile)) {
                queue = await fs.readJSON(queueFile);
            }
            
            // Remove any existing entries for this file
            queue = queue.filter(item => item.file !== filePath);
            
            // Add new entry with pre-chunk plan
            queue.push({
                file: filePath,
                chunkPlan,
                queuedAt: new Date().toISOString(),
                status: 'pre_chunked',
                source: 'scribe_analysis'
            });
            
            await fs.writeJSON(queueFile, queue, { spaces: 2 });
            console.log(`📋 Queued ${filePath} with ${chunkPlan.chunks.length} intelligent chunks`);
            
        } catch (error) {
            console.error('⚠️  Failed to queue for documentation:', error);
        }
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const scribe = new ScribeSummarySystem();
    const timeframe = process.argv[2] || '1h';
    
    scribe.generateSummary(timeframe).then(summary => {
        console.log('\n' + summary);
    }).catch(error => {
        console.error('❌ Summary generation failed:', error);
    });
}

export default ScribeSummarySystem;
