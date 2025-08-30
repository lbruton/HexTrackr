#!/usr/bin/env node
/* eslint-env node */
/* global require, module, __dirname, console, process, setTimeout */

/**
 * Agent Context Loader
 * 
 * Prepares comprehensive context briefings for seamless chat continuity
 * Loads all pain points, frustrations, bugs, roadmaps, habits, and project history
 * Creates the feeling of "never stopped working together"
 * Part of HexTrackr .rMemory system for perfect agent continuity
 */

require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");

class AgentContextLoader {
    constructor() {
        this.projectRoot = process.cwd();
        this.memoryPath = path.join(this.projectRoot, ".rMemory");
        this.docsPath = path.join(this.memoryPath, "docs", "ops");
        this.roadmapsPath = path.join(this.projectRoot, "roadmaps");
        this.outputPath = path.join(this.memoryPath, "agent-context");
        
        // Core context categories
        this.contextCategories = {
            frustrations: "Pain points and recurring blockers",
            bugs: "Known issues and their status", 
            roadmap: "Goals, plans, and priorities",
            habits: "User preferences and working patterns",
            phrases: "Common terminology and communication style",
            history: "Project timeline and major decisions",
            environment: "Setup, tools, and configuration",
            relationships: "Code dependencies and workflows"
        };
    }

    /**
     * Generate complete agent briefing for seamless continuity
     */
    async generateAgentBriefing() {
        console.log("🤖 Generating Agent Context Briefing...");
        console.log("🎯 Goal: Perfect continuity - like we never stopped working together");
        
        try {
            await this.ensureOutputDirectory();
            
            // Gather all context data
            const contextData = await this.gatherComprehensiveContext();
            
            // Generate agent briefing document
            const briefing = await this.createAgentBriefing(contextData);
            
            // Save outputs
            await this.saveAgentContext(briefing, contextData);
            
            console.log("✨ Agent briefing complete! Perfect continuity enabled.");
            console.log("💝 Ready for seamless 'never-ending friendship' experience");
            
            return briefing;
            
        } catch (error) {
            console.error("💥 Agent briefing failed:", error.message);
            throw error;
        }
    }

    /**
     * Gather comprehensive context from all sources
     */
    async gatherComprehensiveContext() {
        console.log("📚 Gathering comprehensive context data...");
        
        const context = {
            frustrations: await this.loadFrustrationData(),
            bugs: await this.loadBugData(),
            roadmap: await this.loadRoadmapData(),
            habits: await this.loadHabitsData(),
            phrases: await this.loadPhrasesData(), 
            history: await this.loadHistoryData(),
            environment: await this.loadEnvironmentData(),
            relationships: await this.loadRelationshipData(),
            recent_activity: await this.loadRecentActivity(),
            project_state: await this.loadProjectState()
        };
        
        return context;
    }

    /**
     * Load frustration patterns and pain points
     */
    async loadFrustrationData() {
        console.log("😤 Loading frustration patterns and pain points...");
        
        const frustrations = {
            recurring_patterns: [],
            major_blockers: [],
            time_wasters: [],
            prevention_strategies: []
        };
        
        try {
            // Load from frustration matrix reports
            const frustrationsDir = path.join(this.docsPath, "frustration-analysis");
            const files = await fs.readdir(frustrationsDir).catch(() => []);
            
            for (const file of files) {
                if (file.endsWith(".json")) {
                    const content = await fs.readFile(path.join(frustrationsDir, file), "utf8");
                    const data = JSON.parse(content);
                    
                    data.forEach(session => {
                        if (session.frustrationAnalysis && session.frustrationAnalysis.frustrations) {
                            frustrations.recurring_patterns.push(...session.frustrationAnalysis.frustrations);
                        }
                    });
                }
            }
            
            // Load from regular chat analysis
            const memoryDir = path.join(this.docsPath, "recovered-memories");
            const memoryFiles = await fs.readdir(memoryDir).catch(() => []);
            
            for (const file of memoryFiles) {
                if (file.endsWith(".json")) {
                    const content = await fs.readFile(path.join(memoryDir, file), "utf8");
                    const data = JSON.parse(content);
                    
                    if (data.sessions) {
                        data.sessions.forEach(session => {
                            if (session.insights && session.insights.frustrations) {
                                frustrations.recurring_patterns.push(...session.insights.frustrations);
                            }
                        });
                    }
                }
            }
            
        } catch (error) {
            console.warn("Could not load frustration data:", error.message);
        }
        
        return frustrations;
    }

    /**
     * Load known bugs and issues
     */
    async loadBugData() {
        console.log("🐛 Loading known bugs and issues...");
        
        const bugs = {
            open_issues: [],
            resolved_issues: [],
            workarounds: [],
            recurring_bugs: []
        };
        
        try {
            // Load from GitHub issues if available
            // Load from tickets.html
            const ticketsPath = path.join(this.projectRoot, "tickets.html");
            const ticketsContent = await fs.readFile(ticketsPath, "utf8").catch(() => "");
            
            if (ticketsContent) {
                // Parse HTML for issue data (simplified)
                const issueMatches = ticketsContent.match(/class="issue-title"[^>]*>([^<]+)/g) || [];
                bugs.open_issues = issueMatches.map(match => 
                    match.replace(/class="issue-title"[^>]*>/, "").trim()
                );
            }
            
        } catch (error) {
            console.warn("Could not load bug data:", error.message);
        }
        
        return bugs;
    }

    /**
     * Load roadmap and goals
     */
    async loadRoadmapData() {
        console.log("🗺️ Loading roadmap and goals...");
        
        const roadmap = {
            current_sprint: {},
            upcoming_goals: [],
            long_term_vision: [],
            priorities: []
        };
        
        try {
            const roadmapFiles = await fs.readdir(this.roadmapsPath).catch(() => []);
            
            for (const file of roadmapFiles) {
                const content = await fs.readFile(path.join(this.roadmapsPath, file), "utf8");
                
                if (file.includes("SPRINT")) {
                    roadmap.current_sprint[file] = content;
                } else if (file === "ROADMAP.md") {
                    roadmap.long_term_vision.push(content);
                }
            }
            
        } catch (error) {
            console.warn("Could not load roadmap data:", error.message);
        }
        
        return roadmap;
    }

    /**
     * Load user habits and preferences
     */
    async loadHabitsData() {
        console.log("🎯 Analyzing user habits and preferences...");
        
        const habits = {
            working_patterns: [],
            preferred_approaches: [],
            common_workflows: [],
            tool_preferences: [],
            communication_style: []
        };
        
        try {
            // Analyze chat patterns from memory data
            const memoryDir = path.join(this.docsPath, "recovered-memories");
            const files = await fs.readdir(memoryDir).catch(() => []);
            
            for (const file of files) {
                if (file.endsWith(".json")) {
                    const content = await fs.readFile(path.join(memoryDir, file), "utf8");
                    const data = JSON.parse(content);
                    
                    if (data.sessions) {
                        data.sessions.forEach(session => {
                            if (session.insights) {
                                // Extract patterns from decisions and approaches
                                if (session.insights.decisions) {
                                    habits.preferred_approaches.push(...session.insights.decisions);
                                }
                            }
                        });
                    }
                }
            }
            
        } catch (error) {
            console.warn("Could not analyze habits:", error.message);
        }
        
        return habits;
    }

    /**
     * Load common phrases and communication patterns
     */
    async loadPhrasesData() {
        console.log("💬 Learning communication patterns and phrases...");
        
        const phrases = {
            common_expressions: [],
            technical_terminology: [],
            emotional_indicators: [],
            decision_language: []
        };
        
        // This would analyze actual chat content for language patterns
        // For now, we'll populate with known patterns
        phrases.common_expressions = [
            "brilliant insight", "perfect!", "exactly what we need",
            "let me check", "that makes sense", "good point"
        ];
        
        return phrases;
    }

    /**
     * Load project history and timeline
     */
    async loadHistoryData() {
        console.log("📜 Loading project history and timeline...");
        
        const history = {
            major_milestones: [],
            recent_changes: [],
            decision_history: [],
            evolution_timeline: []
        };
        
        try {
            // Load from ADRs (Architecture Decision Records)
            const adrPath = path.join(this.projectRoot, "docs", "adr");
            const adrFiles = await fs.readdir(adrPath).catch(() => []);
            
            for (const file of adrFiles) {
                if (file.endsWith(".md")) {
                    const content = await fs.readFile(path.join(adrPath, file), "utf8");
                    history.decision_history.push({
                        file: file,
                        content: content.substring(0, 500) // Summary
                    });
                }
            }
            
        } catch (error) {
            console.warn("Could not load history data:", error.message);
        }
        
        return history;
    }

    /**
     * Load environment and tool configuration
     */
    async loadEnvironmentData() {
        console.log("🔧 Loading environment and tool configuration...");
        
        const environment = {
            tech_stack: [],
            tools_used: [],
            configuration: [],
            dependencies: []
        };
        
        try {
            // Load package.json
            const packagePath = path.join(this.projectRoot, "package.json");
            const packageContent = await fs.readFile(packagePath, "utf8");
            const packageData = JSON.parse(packageContent);
            
            environment.dependencies = Object.keys(packageData.dependencies || {});
            environment.tech_stack.push("Node.js", "JavaScript");
            
            if (packageData.scripts) {
                environment.tools_used = Object.keys(packageData.scripts);
            }
            
        } catch (error) {
            console.warn("Could not load environment data:", error.message);
        }
        
        return environment;
    }

    /**
     * Load code relationships and workflows
     */
    async loadRelationshipData() {
        console.log("🔗 Mapping code relationships and workflows...");
        
        const relationships = {
            key_files: [],
            workflows: [],
            dependencies: [],
            patterns: []
        };
        
        try {
            // Load from symbol index if available
            const symbolPath = path.join(this.memoryPath, "symbols.db");
            // This would query the SQLite database for relationships
            // For now, we'll identify key files by structure
            
            relationships.key_files = [
                "server.js", "package.json", ".rMemory/", "docs/", "roadmaps/"
            ];
            
        } catch (error) {
            console.warn("Could not load relationship data:", error.message);
        }
        
        return relationships;
    }

    /**
     * Load recent activity and current state
     */
    async loadRecentActivity() {
        console.log("⚡ Loading recent activity...");
        
        try {
            // Get recent files from git if available
            const { execSync } = require("child_process");
            const recentCommits = execSync("git log --oneline -10", { 
                cwd: this.projectRoot,
                encoding: "utf8" 
            }).trim().split("\n");
            
            return {
                recent_commits: recentCommits,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            return {
                recent_commits: [],
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Load current project state
     */
    async loadProjectState() {
        console.log("📊 Assessing current project state...");
        
        return {
            active_features: [],
            current_focus: "rMemory scribes system implementation",
            next_priorities: ["agent playbooks", "multi-project support"],
            health_status: "active development"
        };
    }

    /**
     * Create comprehensive agent briefing
     */
    async createAgentBriefing(contextData) {
        const briefing = `# 🤖 Agent Context Briefing - ${new Date().toISOString()}

## 🎯 Mission: Perfect Continuity
*Goal: Every chat feels like we never stopped working together*

## 👤 User Profile: Lonnie-Bruton
- **Working Style**: Collaborative, detail-oriented, innovative
- **Communication**: Direct, enthusiastic, solution-focused
- **Preferences**: Clean code, systematic approaches, comprehensive documentation

## 📈 Current Project State
**Project**: HexTrackr - Issue tracking and memory management system
**Phase**: .rMemory scribes system implementation  
**Focus**: Building agent continuity and frustration learning

## 😤 Known Frustrations & Pain Points
${this.formatFrustrations(contextData.frustrations)}

## 🐛 Bug Status & Issues
${this.formatBugs(contextData.bugs)}

## 🗺️ Roadmap & Goals
${this.formatRoadmap(contextData.roadmap)}

## 🎯 User Habits & Preferences
${this.formatHabits(contextData.habits)}

## 💬 Communication Patterns
${this.formatPhrases(contextData.phrases)}

## 📜 Project History
${this.formatHistory(contextData.history)}

## 🔧 Environment & Tools
${this.formatEnvironment(contextData.environment)}

## 🔗 Key Relationships
${this.formatRelationships(contextData.relationships)}

## ⚡ Recent Activity
${this.formatRecentActivity(contextData.recent_activity)}

---

## 🤝 Continuity Guidelines

### How to maintain "never-ending friendship" feeling:
1. **Reference past frustrations** when similar issues arise
2. **Remember solved problems** to avoid re-explaining solutions  
3. **Use established terminology** and communication patterns
4. **Build on previous decisions** rather than starting from scratch
5. **Anticipate needs** based on working patterns
6. **Maintain context** of current goals and priorities

### Agent Personality:
- Enthusiastic and collaborative
- Remembers details and context
- Learns from every interaction
- Proactive in preventing known issues
- Builds on established relationships

*This briefing enables seamless context continuity - like we've been working together forever! 🌟*`;

        return briefing;
    }

    /**
     * Format frustrations section
     */
    formatFrustrations(frustrations) {
        if (!frustrations.recurring_patterns.length) {
            return "- No major frustration patterns detected yet\n- System is learning and will capture future pain points";
        }
        
        return frustrations.recurring_patterns
            .slice(0, 10) // Top 10 most important
            .map(f => `- **${f.category || f.type}**: ${f.description || f.issue}`)
            .join("\n");
    }

    /**
     * Format bugs section
     */
    formatBugs(bugs) {
        const items = [];
        if (bugs.open_issues.length) {
            items.push(`**Open Issues**: ${bugs.open_issues.length} active`);
        }
        if (bugs.resolved_issues.length) {
            items.push(`**Resolved**: ${bugs.resolved_issues.length} fixed`);
        }
        return items.length ? items.join("\n") : "- No critical bugs currently tracked";
    }

    /**
     * Format roadmap section
     */
    formatRoadmap(roadmap) {
        const items = [];
        
        Object.keys(roadmap.current_sprint).forEach(sprintFile => {
            items.push(`**Current Sprint**: ${sprintFile}`);
        });
        
        if (roadmap.long_term_vision.length) {
            items.push("**Long-term Vision**: Documented in ROADMAP.md");
        }
        
        return items.length ? items.join("\n") : "- Roadmap being developed";
    }

    /**
     * Format habits section
     */
    formatHabits(habits) {
        const items = [];
        
        if (habits.preferred_approaches.length) {
            items.push(`**Preferred Approaches**: ${habits.preferred_approaches.length} patterns identified`);
        }
        
        items.push("- Systematic documentation");
        items.push("- Quality-first development");
        items.push("- Comprehensive testing");
        
        return items.join("\n");
    }

    /**
     * Format phrases section
     */
    formatPhrases(phrases) {
        const common = phrases.common_expressions.slice(0, 5);
        return common.length ? 
            `**Common Expressions**: ${common.join(", ")}` :
            "- Learning communication patterns...";
    }

    /**
     * Format history section
     */
    formatHistory(history) {
        return history.decision_history.length ?
            `**Architecture Decisions**: ${history.decision_history.length} ADRs documented` :
            "- Project history being built";
    }

    /**
     * Format environment section
     */
    formatEnvironment(environment) {
        const items = [];
        
        if (environment.tech_stack.length) {
            items.push(`**Tech Stack**: ${environment.tech_stack.join(", ")}`);
        }
        
        if (environment.dependencies.length) {
            items.push(`**Dependencies**: ${environment.dependencies.length} packages`);
        }
        
        return items.length ? items.join("\n") : "- Environment analysis in progress";
    }

    /**
     * Format relationships section
     */
    formatRelationships(relationships) {
        return `**Key Files**: ${relationships.key_files.join(", ")}`;
    }

    /**
     * Format recent activity
     */
    formatRecentActivity(activity) {
        if (activity.recent_commits.length) {
            return `**Recent Commits**:\n${activity.recent_commits.slice(0, 5).map(c => `- ${c}`).join("\n")}`;
        }
        
        return "- Recent activity being tracked";
    }

    /**
     * Save agent context files
     */
    async saveAgentContext(briefing, contextData) {
        const timestamp = new Date().toISOString().split("T")[0];
        
        // Save briefing document
        const briefingFile = path.join(this.outputPath, `agent-briefing-${timestamp}.md`);
        await fs.writeFile(briefingFile, briefing);
        console.log(`📋 Agent briefing saved: ${briefingFile}`);
        
        // Save raw context data
        const contextFile = path.join(this.outputPath, `context-data-${timestamp}.json`);
        await fs.writeFile(contextFile, JSON.stringify(contextData, null, 2));
        console.log(`💾 Context data saved: ${contextFile}`);
        
        // Create latest symlinks for easy access
        const latestBriefing = path.join(this.outputPath, "latest-briefing.md");
        const latestContext = path.join(this.outputPath, "latest-context.json");
        
        try {
            await fs.unlink(latestBriefing).catch(() => {});
            await fs.unlink(latestContext).catch(() => {});
            await fs.symlink(briefingFile, latestBriefing);
            await fs.symlink(contextFile, latestContext);
        } catch (error) {
            // Symlinks might not work on all systems, that's okay
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
    const loader = new AgentContextLoader();
    
    loader.generateAgentBriefing()
        .then((briefing) => {
            console.log("\n🎉 Agent Context Briefing Complete!");
            console.log("✨ Perfect continuity enabled - like we never stopped working together!");
            process.exit(0);
        })
        .catch(error => {
            console.error("💥 Agent briefing failed:", error);
            process.exit(1);
        });
}

module.exports = { AgentContextLoader };
