#!/usr/bin/env node

/* eslint-env node */
/* global require, process, console, module */

/**
 * Agent Logger Utility
 * Standardized logging and Memento integration for all HexTrackr agents
 */

const fs = require("fs").promises;
const path = require("path");

class AgentLogger {
    constructor(agentName, agentPersonality = "") {
        this.agentName = agentName.toLowerCase();
        this.agentPersonality = agentPersonality;
        this.startTime = new Date();
        this.memoryId = null;
        this.logs = [];
        this.results = [];
    }

    /**
     * Initialize logging session
     */
    async initializeSession(taskDescription, memorySearchQuery = null) {
        this.taskDescription = taskDescription;
        
        // Create log directory if needed
        const logDir = path.join(process.cwd(), "hextrackr-specs", "data", "agentlogs", this.agentName);
        await fs.mkdir(logDir, { recursive: true });
        
        // Generate log filename
        const timestamp = this.startTime.toISOString().replace(/[-:.]/g, "").replace("T", "T").slice(0, 15);
        this.logFileName = `${this.agentName.toUpperCase()}_${timestamp}.md`;
        this.logFilePath = path.join(logDir, this.logFileName);
        
        this.log(`Session initialized for ${this.agentName}`);
        if (memorySearchQuery) {
            this.log(`Memory search query: ${memorySearchQuery}`);
        }
        
        return {
            logPath: this.logFilePath,
            sessionId: timestamp
        };
    }

    /**
     * Add a log entry
     */
    log(message, level = "INFO") {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            agent: this.agentName
        };
        
        this.logs.push(logEntry);
        console.log(`[${level}] ${this.agentName}: ${message}`);
    }

    /**
     * Add a result/finding
     */
    addResult(category, finding, details = null) {
        const result = {
            category,
            finding,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.results.push(result);
        this.log(`Result added: ${category} - ${finding}`);
    }

    /**
     * Set the Memento memory ID for this session
     */
    setMemoryId(memoryId) {
        this.memoryId = memoryId;
        this.log(`Memory ID set: ${memoryId}`);
    }

    /**
     * Generate and save the final log file
     */
    async finalizeLog(status = "SUCCESS", finalMessage = null) {
        const endTime = new Date();
        const duration = ((endTime - this.startTime) / 1000).toFixed(2);
        
        const logContent = this.generateLogContent(status, duration, finalMessage);
        
        try {
            await fs.writeFile(this.logFilePath, logContent, "utf8");
            this.log(`Log file saved: ${this.logFilePath}`);
            
            return {
                logPath: this.logFilePath,
                duration: `${duration}s`,
                status,
                memoryId: this.memoryId,
                resultCount: this.results.length
            };
        } catch (error) {
            console.error(`Failed to save log file: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate the formatted log content
     */
    generateLogContent(status, duration, finalMessage) {
        const date = this.startTime.toISOString().split("T")[0];
        const time = this.startTime.toTimeString().split(" ")[0];
        
        let content = `# ${this.getAgentTitle()} Execution Report\n\n`;
        content += `**Agent**: ${this.capitalizeFirst(this.agentName)}\n`;
        content += `**Date**: ${date}\n`;
        content += `**Time**: ${time}\n`;
        content += `**Task**: ${this.taskDescription || "General execution"}\n`;
        content += `**Duration**: ${duration}s\n`;
        content += `**Status**: ${status}\n`;
        
        if (this.memoryId) {
            content += `**Memory ID**: ${this.memoryId}\n`;
        }
        
        content += "\n## Execution Summary\n\n";
        if (this.results.length > 0) {
            content += `✅ Completed with ${this.results.length} result(s)\n\n`;
        } else {
            content += "✅ Completed successfully\n\n";
        }

        if (this.results.length > 0) {
            content += "## Results\n\n";
            this.results.forEach((result, index) => {
                content += `### ${index + 1}. ${result.category}\n`;
                content += `- **Finding**: ${result.finding}\n`;
                if (result.details) {
                    content += `- **Details**: ${result.details}\n`;
                }
                content += `- **Timestamp**: ${result.timestamp}\n\n`;
            });
        }

        if (this.logs.length > 0) {
            content += "## Execution Log\n\n";
            this.logs.forEach(log => {
                content += `- **${log.level}** [${log.timestamp.split("T")[1].split(".")[0]}]: ${log.message}\n`;
            });
            content += "\n";
        }

        if (finalMessage) {
            content += `## Final Notes\n\n${finalMessage}\n\n`;
        }

        content += "---\n";
        content += `*${this.getAgentSignature()}*\n`;
        
        return content;
    }

    /**
     * Get agent-specific title
     */
    getAgentTitle() {
        const titles = {
            worf: "Security Battle Report",
            uhura: "Communication Transmission Report",
            atlas: "Specification Cartography Report",
            doc: "Documentation Generation Report",
            specs: "Constitutional Compliance Report",
            merlin: "Truth Verification Report",
            larry: "Frontend Security Analysis Report",
            moe: "Backend Architecture Report",
            curly: "Creative Analysis Report",
            shemp: "Synthesis & Consensus Report",
            drjackson: "Archaeological Pattern Report"
        };
        
        return titles[this.agentName] || "Agent Execution Report";
    }

    /**
     * Get agent-specific signature
     */
    getAgentSignature() {
        const signatures = {
            worf: "\"Qa'pla! Today was a good day to secure code!\"",
            uhura: "\"All frequencies clear, Captain. Transmission successful.\"",
            atlas: "\"The specifications have been charted with precision.\"",
            doc: "\"Documentation generated with systematic thoroughness.\"",
            specs: "\"Constitutional compliance maintained.\"",
            merlin: "\"The truth has been verified and preserved.\"",
            larry: "\"Soitenly! Frontend security patterns analyzed!\"",
            moe: "\"Why I oughta... organize this backend better!\"",
            curly: "\"Nyuk nyuk nyuk! Creative solutions discovered!\"",
            shemp: "\"Analysis synthesized and consensus achieved.\"",
            drjackson: "\"By George! Ancient patterns have been uncovered!\""
        };
        
        return signatures[this.agentName] || this.agentPersonality || "\"Task completed successfully.\"";
    }

    /**
     * Utility: Capitalize first letter
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Create a standardized Memento entity for this execution
     */
    createMementoEntity() {
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "").replace("T", "T").slice(0, 15);
        const entityName = `HEXTRACKR:${this.agentName.toUpperCase()}:${this.taskDescription?.replace(/\s+/g, "_").toUpperCase() || "EXECUTION"}_${timestamp}`;
        
        const observations = [
            `Agent: ${this.capitalizeFirst(this.agentName)}`,
            `Task: ${this.taskDescription || "General execution"}`,
            `Duration: ${((new Date() - this.startTime) / 1000).toFixed(2)}s`,
            `Results: ${this.results.length} finding(s)`,
            `Log file: ${this.logFileName}`
        ];

        // Add result summaries
        this.results.forEach(result => {
            observations.push(`${result.category}: ${result.finding}`);
        });

        return {
            name: entityName,
            entityType: "PROJECT:AGENT:EXECUTION",
            observations
        };
    }
}

// Export for use as module
module.exports = { AgentLogger };

// CLI usage if called directly
if (require.main === module) {
    console.log("Agent Logger Utility");
    console.log("Usage: const { AgentLogger } = require(\"./agent-logger.js\");");
    console.log("");
    console.log("Example:");
    console.log("  const logger = new AgentLogger(\"worf\", \"Klingon Security Officer\");");
    console.log("  await logger.initializeSession(\"Security scan\");");
    console.log("  logger.log(\"Starting security analysis\");");
    console.log("  logger.addResult(\"Vulnerability\", \"XSS found in login form\");");
    console.log("  await logger.finalizeLog(\"SUCCESS\");");
}