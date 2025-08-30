#!/usr/bin/env node
/* eslint-env node */
/* global require, module, __dirname, console, process, setTimeout */

/**
 * Frustration Matrix Scribe
 * 
 * Specialized analysis tool for identifying, categorizing, and learning from
 * development frustrations, pain points, and recurring issues.
 * Builds institutional memory to help avoid repeated frustrations.
 * Part of HexTrackr .rMemory scribes system for pain point management
 */

require("dotenv").config();
const { Anthropic } = require("@anthropic-ai/sdk");
const fs = require("fs").promises;
const path = require("path");

class FrustrationMatrixScribe {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.model = "claude-3-5-sonnet-20241022"; // Latest Sonnet for nuanced frustration analysis
        this.chatSessionsPath = path.join(
            process.env.HOME,
            "Library/Application Support/Code/User/workspaceStorage"
        );
        this.outputPath = path.join(__dirname, "../docs/ops/frustration-analysis");
        this.batchSize = 1; // Small batches for detailed frustration analysis
    }

    /**
     * Main frustration analysis execution
     */
    async analyzeFrustrations() {
        console.log("😤 Starting Frustration Matrix Analysis with Claude Opus...");
        console.log("🎯 Focus: Pain points, blockers, and recurring issues");
        
        try {
            await this.ensureOutputDirectory();
            
            // Find all chat sessions
            const chatSessions = await this.findChatSessions();
            console.log(`📁 Found ${chatSessions.length} chat sessions to analyze for frustrations`);
            
            // Process sessions for frustration patterns
            const frustrations = [];
            for (let i = 0; i < chatSessions.length; i += this.batchSize) {
                const batch = chatSessions.slice(i, i + this.batchSize);
                console.log(`😠 Analyzing frustration batch ${Math.floor(i/this.batchSize) + 1}...`);
                
                for (const session of batch) {
                    const analysis = await this.analyzeFrustrationPatterns(session);
                    if (analysis && !analysis.error) {
                        frustrations.push({
                            ...session,
                            frustrationAnalysis: analysis
                        });
                    }
                }
            }
            
            // Generate frustration matrix report
            const matrixReport = await this.generateFrustrationMatrix(frustrations);
            
            // Save all outputs
            await this.saveFrustrationAnalysis(frustrations, matrixReport);
            
            console.log("💡 Frustration Matrix complete! Pain points identified and categorized.");
            
        } catch (error) {
            console.error("💥 Frustration analysis failed:", error.message);
            throw error;
        }
    }

    /**
     * Find and filter chat sessions for frustration analysis
     */
    async findChatSessions() {
        const sessions = [];
        
        try {
            const workspaceStorageDirs = await fs.readdir(this.chatSessionsPath);
            
            for (const workspaceDir of workspaceStorageDirs) {
                const chatHistoryPath = path.join(
                    this.chatSessionsPath,
                    workspaceDir,
                    "ms-vscode.vscode-copilot-chat",
                    "chatHistory"
                );
                
                try {
                    const content = await fs.readFile(chatHistoryPath, "utf8");
                    if (content.trim()) {
                        // Look for sessions that likely contain frustrations
                        const frustratingKeywords = [
                            "error", "failed", "not working", "stuck", "problem", 
                            "issue", "bug", "broken", "wrong", "frustrated",
                            "why", "doesn't work", "can't", "help", "fix"
                        ];
                        
                        const hasKeywords = frustratingKeywords.some(keyword => 
                            content.toLowerCase().includes(keyword)
                        );
                        
                        if (hasKeywords && content.length > 500) { // Substantial conversations
                            sessions.push({
                                workspaceDir,
                                file: chatHistoryPath,
                                content: content,
                                size: content.length
                            });
                        }
                    }
                } catch {
                    // Skip if file doesn't exist or can't be read
                }
            }
        } catch (error) {
            console.error("Error finding chat sessions:", error.message);
        }
        
        return sessions.sort((a, b) => b.size - a.size); // Prioritize longer sessions
    }

    /**
     * Analyze individual session for frustration patterns
     */
    async analyzeFrustrationPatterns(session) {
        const prompt = `Analyze this VS Code chat session specifically for FRUSTRATIONS, PAIN POINTS, and BLOCKERS.

CONTENT:
${session.content}

Extract and categorize ALL frustrations encountered. Return JSON with this structure:

{
  "session_metadata": {
    "workspace": "inferred project name",
    "frustration_intensity": "low|medium|high|extreme",
    "session_type": "debugging|learning|blocked|error_fixing|configuration"
  },
  "frustrations": [
    {
      "type": "technical|environmental|knowledge|tooling|api|dependency",
      "category": "build_error|import_issue|config_problem|syntax_error|logic_bug|performance|deployment|testing|documentation",
      "description": "what specifically was frustrating",
      "context": "what the user was trying to do",
      "symptoms": ["specific error messages or behaviors"],
      "duration_signals": ["immediately", "after_trying_X", "spent_hours", "recurring_issue"],
      "emotional_indicators": ["confused", "stuck", "frustrated", "angry", "desperate"],
      "root_cause": "what actually caused this",
      "resolution": "how it was eventually solved (if solved)",
      "prevention_strategy": "how to avoid this in the future"
    }
  ],
  "recurring_patterns": [
    {
      "pattern": "description of repeated frustration",
      "frequency": "how often this seems to happen",
      "impact": "how much this slows down work"
    }
  ],
  "productivity_impact": {
    "time_lost": "estimated time wasted on frustrations",
    "context_switching": "number of times had to switch approaches",
    "momentum_breaks": "how many times flow was broken"
  },
  "learning_opportunities": [
    "what knowledge gaps were revealed",
    "what skills need improvement",
    "what documentation is missing"
  ]
}

Focus on:
- Specific technical frustrations and their exact causes
- Repeated patterns that keep causing problems  
- Time wasted and productivity impact
- Emotional indicators of frustration (user saying "stuck", "confused", etc.)
- Root causes vs symptoms
- Prevention strategies for the future

Be thorough - extract EVERY frustration, no matter how small.`;

        try {
            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 3000,
                temperature: 0.1, // Low temperature for accurate analysis
                messages: [{
                    role: "user", 
                    content: prompt
                }]
            });
            
            const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                return { error: "Could not extract JSON from analysis" };
            }
        } catch (error) {
            console.error("Frustration analysis failed for session:", error.message);
            return { error: error.message };
        }
    }

    /**
     * Generate comprehensive frustration matrix report
     */
    async generateFrustrationMatrix(frustrations) {
        const matrixPrompt = `Create a comprehensive FRUSTRATION MATRIX report from these analyzed frustrations:

${JSON.stringify(frustrations.map(f => f.frustrationAnalysis), null, 2)}

Generate a strategic analysis with:

1. **TOP FRUSTRATION PATTERNS** (most recurring/impactful)
2. **CATEGORY BREAKDOWN** (technical, environmental, knowledge, etc.)
3. **PROJECT-SPECIFIC PAIN POINTS** (by workspace/project)
4. **PRODUCTIVITY IMPACT ASSESSMENT** (time lost, momentum breaks)
5. **PREVENTION STRATEGIES** (actionable steps to avoid repeats)
6. **KNOWLEDGE GAPS** (what training/documentation is needed)
7. **TOOLING IMPROVEMENTS** (what tools could help)
8. **ENVIRONMENTAL FIXES** (setup improvements)

Focus on ACTIONABLE INSIGHTS that can prevent future frustrations.`;

        try {
            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 4000,
                temperature: 0.2,
                messages: [{
                    role: "user",
                    content: matrixPrompt
                }]
            });
            
            return response.content[0].text;
        } catch (error) {
            console.error("Matrix generation failed:", error.message);
            return "Matrix generation failed: " + error.message;
        }
    }

    /**
     * Save frustration analysis results
     */
    async saveFrustrationAnalysis(frustrations, matrixReport) {
        const timestamp = new Date().toISOString().split("T")[0];
        
        // Save detailed frustration data
        const frustrationsFile = path.join(this.outputPath, `frustrations-${timestamp}.json`);
        await fs.writeFile(frustrationsFile, JSON.stringify(frustrations, null, 2));
        console.log(`💾 Detailed frustrations saved: ${frustrationsFile}`);
        
        // Save matrix report
        const matrixFile = path.join(this.outputPath, `frustration-matrix-${timestamp}.md`);
        const reportContent = `# Frustration Matrix Report - ${timestamp}

${matrixReport}

---
*Generated by HexTrackr Frustration Matrix Scribe*
*Analysis Date: ${new Date().toISOString()}*
*Sessions Analyzed: ${frustrations.length}*
`;
        
        await fs.writeFile(matrixFile, reportContent);
        console.log(`📊 Matrix report saved: ${matrixFile}`);
        
        // Create Memento entities for frustration patterns
        await this.createFrustrationMemories(frustrations);
    }

    /**
     * Create Memento MCP entities for frustration patterns
     */
    async createFrustrationMemories(frustrations) {
        try {
            const { createMementoImport } = require("../core/memento-launcher");
            
            // Group frustrations by pattern for Memento
            const frustrationEntities = [];
            
            for (const session of frustrations) {
                const analysis = session.frustrationAnalysis;
                if (!analysis || !analysis.frustrations) {continue;}
                
                for (const frustration of analysis.frustrations) {
                    frustrationEntities.push({
                        name: `Frustration: ${frustration.category} in ${analysis.session_metadata?.workspace || "Unknown Project"}`,
                        entityType: "frustration_pattern",
                        observations: [
                            `Type: ${frustration.type}`,
                            `Category: ${frustration.category}`,
                            `Description: ${frustration.description}`,
                            `Context: ${frustration.context}`,
                            `Root Cause: ${frustration.root_cause}`,
                            `Resolution: ${frustration.resolution || "Unresolved"}`,
                            `Prevention: ${frustration.prevention_strategy}`,
                            `Emotional Impact: ${frustration.emotional_indicators?.join(", ") || "Unknown"}`,
                            `Symptoms: ${frustration.symptoms?.join("; ") || "None recorded"}`
                        ]
                    });
                }
            }
            
            if (frustrationEntities.length > 0) {
                await createMementoImport(frustrationEntities, "frustration-patterns");
                console.log(`🧠 Created ${frustrationEntities.length} frustration pattern memories in Memento`);
            }
            
        } catch (error) {
            console.warn("Could not create Memento memories:", error.message);
        }
    }

    /**
     * Ensure output directory exists
     */
    async ensureOutputDirectory() {
        try {
            await fs.mkdir(this.outputPath, { recursive: true });
        } catch (error) {
            console.error("Failed to create output directory:", error.message);
        }
    }
}

// CLI interface
if (require.main === module) {
    const scribe = new FrustrationMatrixScribe();
    
    scribe.analyzeFrustrations()
        .then(() => {
            console.log("🎉 Frustration Matrix analysis complete! Check outputs for insights.");
            process.exit(0);
        })
        .catch(error => {
            console.error("💥 Frustration Matrix analysis failed:", error);
            process.exit(1);
        });
}

module.exports = { FrustrationMatrixScribe };
