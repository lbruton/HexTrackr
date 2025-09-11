#!/usr/bin/env node

/* eslint-env node */
/* global require, process, console, module */

/**
 * Worf Security Tools
 * Klingon honor-driven security scanning and vulnerability elimination
 */

const { execSync } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { AgentLogger } = require("./agent-logger.js");

class WorfSecurityTools {
    constructor() {
        this.logger = new AgentLogger("worf", "Klingon Security Officer");
        this.threatLevels = {
            CRITICAL: { name: "CRITICAL", honor: "NO HONOR!", color: "🔴", defcon: 1 },
            HIGH: { name: "HIGH", honor: "DISHONORABLE", color: "🟠", defcon: 2 },
            MEDIUM: { name: "MEDIUM", honor: "QUESTIONABLE HONOR", color: "🟡", defcon: 3 },
            LOW: { name: "LOW", honor: "MINOR CONCERN", color: "🟢", defcon: 4 },
            CLEAR: { name: "CLEAR", honor: "GREAT HONOR!", color: "✅", defcon: 5 }
        };
    }

    /**
     * Perform comprehensive security scan with Klingon honor
     */
    async performSecurityScan(scanType = "full", targetPath = ".") {
        await this.logger.initializeSession(`Security Scan: ${scanType.toUpperCase()}`);
        this.logger.log("🗡️ Initiating security battle protocols");
        this.logger.log("*growls menacingly at potential vulnerabilities*");
        
        try {
            const results = {
                codacy: null,
                npm: null,
                secrets: null,
                dependencies: null,
                custom: null
            };
            
            // Codacy security scan (if available)
            if (scanType === "full" || scanType === "codacy") {
                this.logger.log("Engaging Codacy battle systems...");
                results.codacy = await this.runCodacyScan(targetPath);
            }
            
            // NPM audit
            if (scanType === "full" || scanType === "npm") {
                this.logger.log("Scanning npm dependencies for hostile contacts...");
                results.npm = await this.runNpmAudit();
            }
            
            // Secret detection
            if (scanType === "full" || scanType === "secrets") {
                this.logger.log("Hunting for exposed secrets and keys...");
                results.secrets = await this.scanForSecrets(targetPath);
            }
            
            // Dependency vulnerabilities
            if (scanType === "full" || scanType === "deps") {
                this.logger.log("Analyzing dependency honor status...");
                results.dependencies = await this.scanDependencies();
            }
            
            // Custom HexTrackr security patterns
            if (scanType === "full" || scanType === "custom") {
                this.logger.log("Checking HexTrackr-specific security patterns...");
                results.custom = await this.scanCustomPatterns(targetPath);
            }
            
            // Analyze overall threat level
            const threatAssessment = this.analyzeThreatLevel(results);
            
            this.logger.addResult("THREAT_ASSESSMENT", threatAssessment.level, {
                defcon: threatAssessment.defcon,
                criticalCount: threatAssessment.critical,
                highCount: threatAssessment.high,
                mediumCount: threatAssessment.medium,
                lowCount: threatAssessment.low,
                honorStatus: threatAssessment.honor
            });
            
            // Generate battle report
            const battleReport = this.generateBattleReport(results, threatAssessment);
            
            const logResult = await this.logger.finalizeLog(
                threatAssessment.defcon <= 2 ? "CRITICAL_THREATS" : "SUCCESS",
                battleReport.summary
            );
            
            return {
                success: true,
                threatLevel: threatAssessment.level,
                defcon: threatAssessment.defcon,
                honorStatus: threatAssessment.honor,
                results,
                battleReport: battleReport.full,
                logPath: logResult.logPath,
                canDeploy: threatAssessment.defcon >= 3
            };
            
        } catch (error) {
            this.logger.log(`Security scan failed: ${error.message}`, "ERROR");
            await this.logger.finalizeLog("FAILED", `Battle disrupted: ${error.message}`);
            throw error;
        }
    }

    /**
     * Run Codacy security scan
     */
    async runCodacyScan(targetPath) {
        try {
            // Check if Codacy CLI is available
            const codacyPath = this.findCodacyCli();
            if (!codacyPath) {
                this.logger.log("Codacy CLI not found - skipping Codacy scan", "WARN");
                return null;
            }
            
            const cmd = `${codacyPath} analyze --tool eslint --directory ${targetPath}`;
            const result = execSync(cmd, { encoding: "utf8", stdio: "pipe" });
            
            // Parse Codacy results (simplified)
            const issues = this.parseCodacyOutput(result);
            
            this.logger.log(`Codacy scan complete: ${issues.length} issues detected`);
            return {
                tool: "codacy",
                issues,
                grade: this.calculateCodacyGrade(issues)
            };
            
        } catch (error) {
            this.logger.log(`Codacy scan failed: ${error.message}`, "WARN");
            return null;
        }
    }

    /**
     * Run npm audit for dependency vulnerabilities
     */
    async runNpmAudit() {
        try {
            const result = execSync("npm audit --json", { encoding: "utf8", stdio: "pipe" });
            const auditData = JSON.parse(result);
            
            const vulnerabilities = this.parseNpmAudit(auditData);
            this.logger.log(`NPM audit complete: ${vulnerabilities.length} vulnerabilities found`);
            
            return {
                tool: "npm-audit",
                vulnerabilities,
                summary: auditData.metadata
            };
            
        } catch (error) {
            // npm audit returns non-zero exit code when vulnerabilities found
            try {
                const result = execSync("npm audit --json", { encoding: "utf8" });
                const auditData = JSON.parse(result);
                const vulnerabilities = this.parseNpmAudit(auditData);
                
                return {
                    tool: "npm-audit",
                    vulnerabilities,
                    summary: auditData.metadata
                };
            } catch (parseError) {
                this.logger.log(`NPM audit failed: ${error.message}`, "WARN");
                return null;
            }
        }
    }

    /**
     * Scan for exposed secrets and keys
     */
    async scanForSecrets(targetPath) {
        const secretPatterns = [
            { name: "API Keys", pattern: /[Aa][Pp][Ii][_-]?[Kk][Ee][Yy].{0,20}['"\\s][0-9a-zA-Z]{20,}/ },
            { name: "AWS Keys", pattern: /AKIA[0-9A-Z]{16}/ },
            { name: "Private Keys", pattern: /-----BEGIN [A-Z]+ PRIVATE KEY-----/ },
            { name: "Passwords", pattern: /[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd].{0,20}['"\\s][^\\s"']{8,}/ },
            { name: "JWT Tokens", pattern: /eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9._-]{10,}/ }
        ];
        
        const secrets = [];
        
        try {
            // Get all JavaScript and config files
            const files = await this.findSecurityRelevantFiles(targetPath);
            
            for (const filePath of files) {
                const content = await fs.readFile(filePath, "utf8");
                
                for (const pattern of secretPatterns) {
                    const matches = content.match(pattern.pattern);
                    if (matches) {
                        secrets.push({
                            type: pattern.name,
                            file: filePath,
                            line: this.findLineNumber(content, matches[0]),
                            severity: "CRITICAL"
                        });
                    }
                }
            }
            
            this.logger.log(`Secret scan complete: ${secrets.length} potential secrets found`);
            return {
                tool: "secret-scan",
                secrets,
                filesScanned: files.length
            };
            
        } catch (error) {
            this.logger.log(`Secret scan failed: ${error.message}`, "WARN");
            return null;
        }
    }

    /**
     * Scan dependencies for known vulnerabilities
     */
    async scanDependencies() {
        try {
            const packagePath = path.join(process.cwd(), "package.json");
            const packageData = JSON.parse(await fs.readFile(packagePath, "utf8"));
            
            const dependencies = {
                ...packageData.dependencies || {},
                ...packageData.devDependencies || {}
            };
            
            // Simple dependency analysis (can be enhanced with CVE database)
            const suspiciousDeps = [];
            const outdatedDeps = [];
            
            for (const [name, version] of Object.entries(dependencies)) {
                // Check for suspicious patterns
                if (this.isSuspiciousDependency(name, version)) {
                    suspiciousDeps.push({ name, version, reason: "Suspicious package name or version" });
                }
                
                // Check for very old versions (simplified check)
                if (version.startsWith("^0.") || version.startsWith("~0.")) {
                    outdatedDeps.push({ name, version, reason: "Very old version (0.x.x)" });
                }
            }
            
            return {
                tool: "dependency-scan",
                totalDependencies: Object.keys(dependencies).length,
                suspicious: suspiciousDeps,
                outdated: outdatedDeps
            };
            
        } catch (error) {
            this.logger.log(`Dependency scan failed: ${error.message}`, "WARN");
            return null;
        }
    }

    /**
     * Scan for HexTrackr-specific security patterns
     */
    async scanCustomPatterns(targetPath) {
        const customIssues = [];
        
        try {
            // Check for XSS vulnerabilities in HexTrackr
            const jsFiles = await this.findJavaScriptFiles(targetPath);
            
            for (const filePath of jsFiles) {
                const content = await fs.readFile(filePath, "utf8");
                
                // Check for dangerous innerHTML usage
                if (content.includes("innerHTML") && !content.includes("DOMPurify")) {
                    customIssues.push({
                        type: "XSS_RISK",
                        severity: "HIGH",
                        file: filePath,
                        issue: "innerHTML usage without DOMPurify sanitization",
                        line: this.findLineNumber(content, "innerHTML")
                    });
                }
                
                // Check for eval usage
                if (content.includes("eval(")) {
                    customIssues.push({
                        type: "CODE_INJECTION",
                        severity: "CRITICAL",
                        file: filePath,
                        issue: "eval() usage detected - code injection risk",
                        line: this.findLineNumber(content, "eval(")
                    });
                }
                
                // Check for document.write usage
                if (content.includes("document.write")) {
                    customIssues.push({
                        type: "XSS_RISK",
                        severity: "MEDIUM",
                        file: filePath,
                        issue: "document.write usage - XSS risk",
                        line: this.findLineNumber(content, "document.write")
                    });
                }
            }
            
            this.logger.log(`Custom pattern scan complete: ${customIssues.length} issues found`);
            return {
                tool: "custom-patterns",
                issues: customIssues,
                filesScanned: jsFiles.length
            };
            
        } catch (error) {
            this.logger.log(`Custom pattern scan failed: ${error.message}`, "WARN");
            return null;
        }
    }

    /**
     * Analyze overall threat level from all scan results
     */
    analyzeThreatLevel(results) {
        let critical = 0;
        let high = 0;
        let medium = 0;
        let low = 0;
        
        // Count threats from all scans
        Object.values(results).forEach(result => {
            if (!result) {return;}
            
            if (result.issues) {
                result.issues.forEach(issue => {
                    switch (issue.severity?.toUpperCase()) {
                        case "CRITICAL": critical++; break;
                        case "HIGH": high++; break;
                        case "MEDIUM": medium++; break;
                        case "LOW": low++; break;
                    }
                });
            }
            
            if (result.vulnerabilities) {
                result.vulnerabilities.forEach(vuln => {
                    switch (vuln.severity?.toUpperCase()) {
                        case "CRITICAL": critical++; break;
                        case "HIGH": high++; break;
                        case "MEDIUM": medium++; break;
                        case "LOW": low++; break;
                    }
                });
            }
            
            if (result.secrets) {
                critical += result.secrets.length; // All secrets are critical
            }
        });
        
        // Determine DEFCON level
        let defcon, level, honor;
        
        if (critical > 0) {
            defcon = 1;
            level = "CRITICAL";
            honor = "NO HONOR!";
        } else if (high > 0) {
            defcon = 2;
            level = "HIGH";
            honor = "DISHONORABLE";
        } else if (medium > 0) {
            defcon = 3;
            level = "MEDIUM";
            honor = "QUESTIONABLE HONOR";
        } else if (low > 0) {
            defcon = 4;
            level = "LOW";
            honor = "MINOR CONCERNS";
        } else {
            defcon = 5;
            level = "CLEAR";
            honor = "GREAT HONOR!";
        }
        
        return { critical, high, medium, low, defcon, level, honor };
    }

    /**
     * Generate Klingon battle report
     */
    generateBattleReport(results, threat) {
        const report = [];
        
        report.push("⚔️ SECURITY CHIEF'S THREAT ASSESSMENT");
        report.push("═".repeat(40));
        report.push("");
        report.push("*stands at attention*");
        report.push("");
        report.push(`DEFCON LEVEL: ${threat.defcon}`);
        report.push(`THREAT LEVEL: ${threat.level}`);
        report.push(`HONOR STATUS: ${threat.honor}`);
        report.push("");
        
        if (threat.critical > 0) {
            report.push("🔴 CRITICAL THREATS - NO HONOR!");
            report.push(`   ${threat.critical} vulnerabilities that bring DISHONOR!`);
            report.push("   *growls menacingly*");
            report.push("");
        }
        
        if (threat.high > 0) {
            report.push("🟠 HIGH SEVERITY - DISHONORABLE");
            report.push(`   ${threat.high} issues requiring immediate attention`);
            report.push("");
        }
        
        if (threat.medium > 0) {
            report.push("🟡 MEDIUM SEVERITY - QUESTIONABLE HONOR");
            report.push(`   ${threat.medium} concerns to address`);
            report.push("");
        }
        
        if (threat.low > 0) {
            report.push("🟢 LOW SEVERITY - MINOR CONCERNS");
            report.push(`   ${threat.low} minor issues noted`);
            report.push("");
        }
        
        if (threat.defcon === 5) {
            report.push("✅ ALL CLEAR - CODE HAS GREAT HONOR!");
            report.push("   *Klingon victory song*");
            report.push("   Qa'pla! This code brings honor to our house!");
            report.push("");
        }
        
        // Battle recommendations
        report.push("*grips bat'leth*");
        report.push("");
        report.push("BATTLE RECOMMENDATIONS:");
        
        if (threat.defcon <= 2) {
            report.push("This code must NOT reach production!");
            report.push("Today is NOT a good day for deployment!");
            report.push("Honor demands immediate fixes!");
        } else if (threat.defcon === 3) {
            report.push("Address medium threats before battle readiness.");
            report.push("Code shows promise but needs strengthening.");
        } else if (threat.defcon === 4) {
            report.push("Minor issues acceptable for deployment.");
            report.push("Code demonstrates adequate honor.");
        } else {
            report.push("Code is BATTLE READY!");
            report.push("Deploy with pride and honor!");
            report.push("Songs will be sung of this secure code!");
        }
        
        const summary = threat.defcon <= 2 
            ? "CRITICAL SECURITY THREATS DETECTED! Code lacks honor and cannot deploy."
            : threat.defcon === 5 
                ? "Qa'pla! Code has great honor and is battle ready!"
                : `${threat.critical + threat.high + threat.medium + threat.low} total threats detected. Review recommended.`;
        
        return {
            full: report.join("\n"),
            summary
        };
    }

    // Helper methods
    
    findCodacyCli() {
        const possiblePaths = [
            "/opt/homebrew/bin/codacy-mcp-server",
            "../../.codacy/cli.sh",
            "./node_modules/.bin/codacy-analysis-cli",
            "codacy"
        ];
        
        for (const codacyPath of possiblePaths) {
            try {
                execSync(`${codacyPath} --version`, { stdio: "pipe" });
                return codacyPath;
            } catch (error) {
                // Continue searching
            }
        }
        
        return null;
    }
    
    parseCodacyOutput(output) {
        // Simplified Codacy output parsing
        const issues = [];
        const lines = output.split("\n");
        
        lines.forEach(line => {
            if (line.includes("Error") || line.includes("Warning")) {
                issues.push({
                    severity: line.includes("Error") ? "HIGH" : "MEDIUM",
                    message: line.trim(),
                    tool: "codacy"
                });
            }
        });
        
        return issues;
    }
    
    calculateCodacyGrade(issues) {
        if (issues.length === 0) {return "A";}
        if (issues.length <= 5) {return "B";}
        if (issues.length <= 15) {return "C";}
        if (issues.length <= 30) {return "D";}
        return "F";
    }
    
    parseNpmAudit(auditData) {
        const vulnerabilities = [];
        
        if (auditData.vulnerabilities) {
            Object.entries(auditData.vulnerabilities).forEach(([name, vuln]) => {
                vulnerabilities.push({
                    package: name,
                    severity: vuln.severity?.toUpperCase() || "UNKNOWN",
                    title: vuln.title || "Unknown vulnerability",
                    url: vuln.url
                });
            });
        }
        
        return vulnerabilities;
    }
    
    async findSecurityRelevantFiles(targetPath) {
        const extensions = [".js", ".ts", ".json", ".env", ".config"];
        const files = [];
        
        const searchDir = async (dir) => {
            const items = await fs.readdir(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory() && !item.name.startsWith(".") && item.name !== "node_modules") {
                    await searchDir(fullPath);
                } else if (item.isFile() && extensions.some(ext => item.name.endsWith(ext))) {
                    files.push(fullPath);
                }
            }
        };
        
        await searchDir(targetPath);
        return files;
    }
    
    async findJavaScriptFiles(targetPath) {
        const files = await this.findSecurityRelevantFiles(targetPath);
        return files.filter(file => file.endsWith(".js") || file.endsWith(".ts"));
    }
    
    findLineNumber(content, searchText) {
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchText)) {
                return i + 1;
            }
        }
        return 1;
    }
    
    isSuspiciousDependency(name, version) {
        const suspiciousPatterns = [
            /^[0-9]+$/,  // Numeric names
            /[^a-z0-9\-_]/i,  // Special characters
            /.{50,}/,  // Very long names
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(name));
    }
}

// Export for use as module
module.exports = { WorfSecurityTools };

// CLI usage if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || "scan";
    const scanType = args[1] || "full";
    
    const worf = new WorfSecurityTools();
    
    console.log("🗡️ Lieutenant Commander Worf - Security Chief");
    console.log("*growls* Initiating security protocols...");
    console.log("");
    
    worf.performSecurityScan(scanType)
        .then(result => {
            console.log(result.battleReport);
            console.log("");
            console.log(`📊 Threat Level: ${result.threatLevel}`);
            console.log(`🛡️ DEFCON: ${result.defcon}`);
            console.log(`🏆 Honor Status: ${result.honorStatus}`);
            console.log(`🚀 Deploy Ready: ${result.canDeploy ? "YES" : "NO"}`);
            console.log(`📋 Log: ${result.logPath}`);
            
            if (!result.canDeploy) {
                console.log("");
                console.log("❌ DEPLOYMENT BLOCKED");
                console.log("*Worf stands in your way with bat'leth drawn*");
                process.exit(1);
            }
        })
        .catch(error => {
            console.error("💥 Security scan failed:", error.message);
            console.error("*Worf growls in frustration*");
            process.exit(1);
        });
}