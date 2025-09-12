#!/usr/bin/env node

/**
 * Gemini Tools - "Zen Light" Free Validation System
 * 
 * Provides cost-efficient second opinion validation using free Gemini API
 * Integrates with HexTrackr's personality-driven agent system
 * 
 * Cost: $0 (FREE via Gemini CLI)
 * Context: 1M+ tokens
 * Purpose: Daily validation without API costs
 */

const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs").promises;
const path = require("path");
const execAsync = promisify(exec);

class GeminiTools {
    constructor() {
        this.logDir = path.join(__dirname, "..", "hextrackr-specs", "data", "agentlogs", "gemini");
        this.ensureLogDirectory();
    }

    async ensureLogDirectory() {
        try {
            await fs.mkdir(this.logDir, { recursive: true });
        } catch (error) {
            console.error("Failed to create log directory:", error);
        }
    }

    /**
     * Execute Gemini CLI with proper error handling
     */
    async executeGemini(prompt) {
        try {
            // Simple command - Gemini reads files on demand from project root
            const command = `gemini -p "${prompt.replace(/"/g, "\\\"")}"`;
            
            // Run from project root so Gemini can access all files

            console.log("🔮 Invoking Gemini for validation...");
            const { stdout, stderr } = await execAsync(command, {
                maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large responses
            });

            if (stderr && !stderr.includes("Warning")) {
                console.error("Gemini stderr:", stderr);
            }

            return stdout;
        } catch (error) {
            console.error("❌ Gemini execution failed:", error.message);
            throw error;
        }
    }

    /**
     * Quick consensus validation (FREE daily use)
     */
    async quickConsensus(topic, files = []) {
        const prompt = `Provide a quick consensus validation for: ${topic}
        
        Analyze the following aspects:
        1. Security implications
        2. Architecture consistency
        3. Performance impact
        4. Best practices compliance
        
        Be concise but thorough. Flag any critical issues.`;

        const result = await this.executeGemini(prompt, files);
        await this.saveLog("consensus", topic, result);
        return this.parseConsensus(result);
    }

    /**
     * Security validation for code changes
     */
    async validateSecurity(files) {
        const prompt = `Perform a security validation of the provided code:
        
        Check for:
        - XSS vulnerabilities
        - SQL injection risks
        - CSRF vulnerabilities
        - Authentication/authorization issues
        - Sensitive data exposure
        - Input validation problems
        
        Report findings with severity levels (CRITICAL/HIGH/MEDIUM/LOW).`;

        const result = await this.executeGemini(prompt, files);
        await this.saveLog("security", "validation", result);
        return this.parseSecurityFindings(result);
    }

    /**
     * Code review for changes
     */
    async reviewCode(changes, files = []) {
        const prompt = `Review the following code changes:
        ${changes}
        
        Evaluate:
        1. Code quality and maintainability
        2. Performance implications
        3. Security considerations
        4. Architectural alignment
        5. Testing requirements
        
        Provide actionable feedback.`;

        const result = await this.executeGemini(prompt, files);
        await this.saveLog("review", "code-changes", result);
        return this.parseReview(result);
    }

    /**
     * Get second opinion on agent findings
     */
    async getSecondOpinion(agentName, findings) {
        const prompt = `Validate the following findings from ${agentName}:
        
        ${findings}
        
        Provide:
        1. Agreement/disagreement with findings
        2. Additional considerations missed
        3. Priority recommendations
        4. Risk assessment
        
        Be objective and thorough.`;

        const result = await this.executeGemini(prompt);
        await this.saveLog("second-opinion", agentName, result);
        return this.parseOpinion(result);
    }

    /**
     * Compare with paid Zen consensus (for escalation decisions)
     */
    async shouldEscalateToZen(findings) {
        const prompt = `Based on these findings, determine if escalation to paid Zen consensus is needed:
        
        ${findings}
        
        Escalate if:
        - Critical security issues found
        - Major architectural changes needed
        - High-risk production deployment
        - Complex multi-system integration
        
        Return: { escalate: boolean, reason: string }`;

        const result = await this.executeGemini(prompt);
        return this.parseEscalation(result);
    }

    /**
     * Comprehensive documentation audit with focused approach
     */
    async auditDocumentation(scope = "api") {
        console.log(`🔍 Starting focused documentation audit: ${scope}...`);
        
        let auditPrompt = "";
        
        if (scope === "api") {
            auditPrompt = `Audit HexTrackr API documentation for accuracy.

Read the file: app/public/docs-source/api-reference/vulnerabilities-api.md
Compare it with routes in: app/public/server.js

Check if documented API endpoints actually exist in the Express server.
Look for POST, GET, PUT, DELETE routes that match the documentation.

For each inaccuracy found, report:
- File: vulnerabilities-api.md
- Section: [endpoint section]
- Issue: [brief description]
- Severity: CRITICAL/HIGH/MEDIUM/LOW
- Current Text: [documented endpoint]
- Should Be: [actual endpoint in server.js]`;
        
        } else if (scope === "database") {
            auditPrompt = `Audit HexTrackr database documentation for accuracy.

Read the file: app/public/docs-source/architecture/database.md
Check the documented table schemas against the actual database structure.

You can check the init file: app/public/scripts/init-database.js
Look for CREATE TABLE statements and column definitions.

Report any missing columns, incorrect data types, or wrong table names.`;
        
        } else if (scope === "ports") {
            auditPrompt = `Audit HexTrackr port configuration documentation.

Read files mentioning ports in: app/public/docs-source/
Compare with: docker-compose.yml

Check if documented ports match actual Docker configuration.
Look for port 8080 vs 8989 discrepancies.`;
        
        } else {
            auditPrompt = `Quick audit of HexTrackr documentation files in app/public/docs-source/

Focus on obvious inaccuracies like:
1. Wrong file paths 
2. Missing API endpoints
3. Incorrect port numbers
4. Outdated dependency references

Check 3-5 documentation files and report major issues only.`;
        }

        const result = await this.executeGemini(auditPrompt);
        await this.saveLog("audit", scope, result);
        return this.parseAuditFindings(result);
    }

    /**
     * Parse audit findings into structured format
     */
    parseAuditFindings(result) {
        const findings = {
            summary: {
                total: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            },
            issues: [],
            raw: result
        };

        const lines = result.split("\n");
        let currentIssue = {};
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.startsWith("File:")) {
                if (currentIssue.file) {
                    findings.issues.push(currentIssue);
                    findings.summary.total++;
                    findings.summary[currentIssue.severity?.toLowerCase()] = 
                        (findings.summary[currentIssue.severity?.toLowerCase()] || 0) + 1;
                }
                currentIssue = { file: trimmed.substring(5).trim() };
            } else if (trimmed.startsWith("Section:")) {
                currentIssue.section = trimmed.substring(8).trim();
            } else if (trimmed.startsWith("Issue:")) {
                currentIssue.issue = trimmed.substring(6).trim();
            } else if (trimmed.startsWith("Severity:")) {
                currentIssue.severity = trimmed.substring(9).trim();
            } else if (trimmed.startsWith("Current Text:")) {
                currentIssue.currentText = trimmed.substring(13).trim();
            } else if (trimmed.startsWith("Should Be:")) {
                currentIssue.shouldBe = trimmed.substring(10).trim();
            }
        }

        // Don't forget the last issue
        if (currentIssue.file) {
            findings.issues.push(currentIssue);
            findings.summary.total++;
            findings.summary[currentIssue.severity?.toLowerCase()] = 
                (findings.summary[currentIssue.severity?.toLowerCase()] || 0) + 1;
        }

        return findings;
    }

    /**
     * Parse consensus results
     */
    parseConsensus(result) {
        return {
            raw: result,
            timestamp: new Date().toISOString(),
            issues: this.extractIssues(result),
            recommendations: this.extractRecommendations(result),
            severity: this.determineSeverity(result)
        };
    }

    /**
     * Parse security findings
     */
    parseSecurityFindings(result) {
        const findings = {
            critical: [],
            high: [],
            medium: [],
            low: [],
            summary: ""
        };

        // Extract findings by severity
        const lines = result.split("\n");
        let currentSeverity = null;

        for (const line of lines) {
            if (line.includes("CRITICAL")) {currentSeverity = "critical";}
            else if (line.includes("HIGH")) {currentSeverity = "high";}
            else if (line.includes("MEDIUM")) {currentSeverity = "medium";}
            else if (line.includes("LOW")) {currentSeverity = "low";}
            else if (currentSeverity && line.trim()) {
                findings[currentSeverity].push(line.trim());
            }
        }

        findings.summary = `Found ${findings.critical.length} critical, ${findings.high.length} high, ${findings.medium.length} medium, ${findings.low.length} low issues`;
        return findings;
    }

    /**
     * Parse code review results
     */
    parseReview(result) {
        return {
            raw: result,
            quality: this.extractSection(result, "quality"),
            performance: this.extractSection(result, "performance"),
            security: this.extractSection(result, "security"),
            architecture: this.extractSection(result, "architecture"),
            testing: this.extractSection(result, "testing"),
            approved: !result.toLowerCase().includes("critical") && !result.toLowerCase().includes("block")
        };
    }

    /**
     * Parse second opinion
     */
    parseOpinion(result) {
        return {
            raw: result,
            agrees: !result.toLowerCase().includes("disagree") && !result.toLowerCase().includes("incorrect"),
            additionalFindings: this.extractSection(result, "additional"),
            priority: this.extractSection(result, "priority"),
            risk: this.extractSection(result, "risk")
        };
    }

    /**
     * Parse escalation decision
     */
    parseEscalation(result) {
        const escalate = result.toLowerCase().includes("escalate: true") || 
                        result.toLowerCase().includes("yes") ||
                        result.toLowerCase().includes("recommended");
        
        return {
            escalate,
            reason: this.extractSection(result, "reason") || "No escalation needed"
        };
    }

    /**
     * Helper: Extract issues from text
     */
    extractIssues(text) {
        const issues = [];
        const lines = text.split("\n");
        for (const line of lines) {
            if (line.includes("issue") || line.includes("problem") || line.includes("risk")) {
                issues.push(line.trim());
            }
        }
        return issues;
    }

    /**
     * Helper: Extract recommendations
     */
    extractRecommendations(text) {
        const recommendations = [];
        const lines = text.split("\n");
        for (const line of lines) {
            if (line.includes("recommend") || line.includes("suggest") || line.includes("should")) {
                recommendations.push(line.trim());
            }
        }
        return recommendations;
    }

    /**
     * Helper: Determine overall severity
     */
    determineSeverity(text) {
        const lower = text.toLowerCase();
        if (lower.includes("critical")) {return "CRITICAL";}
        if (lower.includes("high")) {return "HIGH";}
        if (lower.includes("medium")) {return "MEDIUM";}
        return "LOW";
    }

    /**
     * Helper: Extract section from text
     */
    extractSection(text, section) {
        const regex = new RegExp(`${section}[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)`, "is");
        const match = text.match(regex);
        return match ? match[1].trim() : "";
    }

    /**
     * Save log for audit trail
     */
    async saveLog(type, topic, content) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `GEMINI_${type.toUpperCase()}_${timestamp}.md`;
        const filepath = path.join(this.logDir, filename);

        const log = `# Gemini ${type} - ${topic}
Date: ${new Date().toISOString()}
Type: ${type}
Topic: ${topic}
Cost: $0 (FREE)

## Analysis

${content}

---
*Generated by Gemini Tools - "Zen Light" Validation System*`;

        await fs.writeFile(filepath, log);
        console.log(`📝 Log saved: ${filename}`);
    }

    /**
     * CLI Interface
     */
    static async cli() {
        const gemini = new GeminiTools();
        const [,, command, ...args] = process.argv;

        try {
            switch(command) {
                case "validate":
                    const securityResult = await gemini.validateSecurity(args);
                    console.log(JSON.stringify(securityResult, null, 2));
                    break;
                
                case "audit":
                    const scope = args[0] || "api";
                    console.log(`🔍 Auditing scope: ${scope}`);
                    const auditResult = await gemini.auditDocumentation(scope);
                    console.log(JSON.stringify(auditResult, null, 2));
                    break;
                
                case "consensus":
                    const topic = args[0] || "general validation";
                    const files = args.slice(1);
                    const consensus = await gemini.quickConsensus(topic, files);
                    console.log(JSON.stringify(consensus, null, 2));
                    break;
                
                case "review":
                    const changes = args[0] || "recent changes";
                    const reviewFiles = args.slice(1);
                    const review = await gemini.reviewCode(changes, reviewFiles);
                    console.log(JSON.stringify(review, null, 2));
                    break;
                
                case "escalate":
                    const findings = args.join(" ");
                    const escalation = await gemini.shouldEscalateToZen(findings);
                    console.log(JSON.stringify(escalation, null, 2));
                    break;
                
                default:
                    console.log(`
Gemini Tools - "Zen Light" Free Validation

Usage:
  gemini-tools validate [files...]      - Security validation
  gemini-tools audit [scope]           - Documentation accuracy audit
    - Scopes: api, database, ports, quick (default: api)
  gemini-tools consensus <topic> [files...] - Quick consensus
  gemini-tools review <changes> [files...] - Code review
  gemini-tools escalate <findings>     - Check if Zen needed

Cost: $0 (FREE via Gemini API)
Context: 1M+ tokens
Purpose: Daily validation without API costs
                    `);
            }
        } catch (error) {
            console.error("Error:", error.message);
            process.exit(1);
        }
    }
}

// Export for use by agents
module.exports = GeminiTools;

// Run CLI if called directly
if (require.main === module) {
    GeminiTools.cli();
}