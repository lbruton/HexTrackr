#!/usr/bin/env node

/* eslint-env node */
/* global require, process, console, module */

/**
 * Specs Validation Tools
 * Constitutional compliance officer ensuring spec-kit protocol adherence
 */

const fs = require("fs").promises;
const path = require("path");
const { AgentLogger } = require("./agent-logger.js");

class SpecsValidationTools {
    constructor() {
        this.logger = new AgentLogger("specs", "Constitutional Compliance Officer");
        this.specsBasePath = path.join(process.cwd(), "hextrackr-specs", "specs");
        this.constitutionPath = path.join(process.cwd(), "hextrackr-specs", "memory", "constitution.md");
        
        // Constitutional requirements from spec-kit framework
        this.requiredFiles = [
            "spec.md",         // Phase 0: Requirements
            "research.md",     // Phase 0: Technical decisions
            "plan.md",         // Phase 1: Implementation plan
            "data-model.md",   // Phase 1: Entity definitions
            "contracts/",      // Phase 1: API specifications
            "quickstart.md",   // Phase 1: Manual validation
            "tasks.md"         // Phase 2: Implementation tasks
        ];
        
        this.taskPatterns = {
            valid: /^T\d{3}\s/,     // T001 format
            invalid: /^T\d+\.\d+/   // T1.1.1 format (old)
        };
    }

    /**
     * Perform comprehensive constitutional compliance audit
     */
    async performConstitutionalAudit(specId = null) {
        await this.logger.initializeSession("Constitutional Compliance Audit");
        this.logger.log("⚖️ Initiating constitutional compliance verification");
        this.logger.log("*adjusts constitutional documents with precision*");
        
        try {
            const auditResults = {
                specsAudited: 0,
                compliantSpecs: 0,
                violations: [],
                warnings: [],
                recommendations: []
            };
            
            let specsToAudit = [];
            
            if (specId) {
                // Audit single specification
                const specPath = path.join(this.specsBasePath, specId);
                const exists = await fs.access(specPath).then(() => true).catch(() => false);
                
                if (!exists) {
                    throw new Error(`Specification ${specId} not found in constitutional records`);
                }
                
                specsToAudit = [{ id: specId, path: specPath }];
            } else {
                // Audit all specifications
                const specDirs = await fs.readdir(this.specsBasePath, { withFileTypes: true });
                specsToAudit = specDirs
                    .filter(dir => dir.isDirectory())
                    .map(dir => ({ id: dir.name, path: path.join(this.specsBasePath, dir.name) }));
            }
            
            // Perform audit for each specification
            for (const spec of specsToAudit) {
                this.logger.log(`Auditing specification: ${spec.id}`);
                const specAudit = await this.auditSpecification(spec.id, spec.path);
                
                auditResults.specsAudited++;
                if (specAudit.compliant) {
                    auditResults.compliantSpecs++;
                }
                
                auditResults.violations.push(...specAudit.violations);
                auditResults.warnings.push(...specAudit.warnings);
                auditResults.recommendations.push(...specAudit.recommendations);
            }
            
            // Calculate compliance percentage
            const complianceRate = auditResults.specsAudited > 0 
                ? Math.round((auditResults.compliantSpecs / auditResults.specsAudited) * 100)
                : 0;
            
            // Determine overall constitutional status
            const constitutionalStatus = this.determineConstitutionalStatus(auditResults, complianceRate);
            
            this.logger.addResult("CONSTITUTIONAL_AUDIT", constitutionalStatus.status, {
                specsAudited: auditResults.specsAudited,
                compliantSpecs: auditResults.compliantSpecs,
                complianceRate: `${complianceRate}%`,
                totalViolations: auditResults.violations.length,
                totalWarnings: auditResults.warnings.length,
                status: constitutionalStatus.status
            });
            
            // Generate compliance report
            const complianceReport = this.generateComplianceReport(auditResults, constitutionalStatus, complianceRate);
            
            const logResult = await this.logger.finalizeLog(
                auditResults.violations.length > 0 ? "VIOLATIONS_FOUND" : "SUCCESS",
                constitutionalStatus.summary
            );
            
            return {
                success: true,
                auditResults,
                complianceRate,
                constitutionalStatus,
                complianceReport: complianceReport.full,
                logPath: logResult.logPath,
                canProceed: auditResults.violations.length === 0
            };
            
        } catch (error) {
            this.logger.log(`Constitutional audit failed: ${error.message}`, "ERROR");
            await this.logger.finalizeLog("FAILED", `Constitutional audit disrupted: ${error.message}`);
            throw error;
        }
    }

    /**
     * Enforce constitutional compliance by auto-fixing violations
     */
    async enforceConstitutionalCompliance(specId, fixViolations = false) {
        await this.logger.initializeSession(`Constitutional Enforcement: ${specId}`);
        this.logger.log("⚖️ Initiating constitutional enforcement protocols");
        this.logger.log("*reviews constitutional articles with authority*");
        
        try {
            const specPath = path.join(this.specsBasePath, specId);
            const specAudit = await this.auditSpecification(specId, specPath);
            
            if (specAudit.compliant) {
                this.logger.log(`Specification ${specId} already compliant - no enforcement needed`);
                return await this.logger.finalizeLog("SUCCESS", "Perfect constitutional compliance maintained");
            }
            
            const enforcementActions = [];
            
            if (fixViolations) {
                // Attempt to fix violations automatically
                for (const violation of specAudit.violations) {
                    if (violation.fixable) {
                        try {
                            await this.fixViolation(specPath, violation);
                            enforcementActions.push({
                                type: "FIXED",
                                violation: violation.type,
                                description: violation.description
                            });
                            this.logger.log(`Fixed violation: ${violation.type}`);
                        } catch (fixError) {
                            enforcementActions.push({
                                type: "FIX_FAILED",
                                violation: violation.type,
                                error: fixError.message
                            });
                            this.logger.log(`Fix failed for ${violation.type}: ${fixError.message}`, "WARN");
                        }
                    }
                }
            }
            
            // Re-audit after fixes
            const postFixAudit = await this.auditSpecification(specId, specPath);
            
            this.logger.addResult("ENFORCEMENT_COMPLETE", `${enforcementActions.length} actions taken`, {
                specId,
                actionsTaken: enforcementActions.length,
                fixedViolations: enforcementActions.filter(a => a.type === "FIXED").length,
                remainingViolations: postFixAudit.violations.length,
                nowCompliant: postFixAudit.compliant
            });
            
            const summary = `Constitutional enforcement complete. ${enforcementActions.length} actions taken. ` +
                           `Specification is now ${postFixAudit.compliant ? "COMPLIANT" : "NON-COMPLIANT"}.`;
                           
            const logResult = await this.logger.finalizeLog("SUCCESS", summary);
            
            return {
                success: true,
                specId,
                enforcementActions,
                preFixViolations: specAudit.violations.length,
                postFixViolations: postFixAudit.violations.length,
                nowCompliant: postFixAudit.compliant,
                logPath: logResult.logPath
            };
            
        } catch (error) {
            this.logger.log(`Constitutional enforcement failed: ${error.message}`, "ERROR");
            await this.logger.finalizeLog("FAILED", `Constitutional enforcement disrupted: ${error.message}`);
            throw error;
        }
    }

    /**
     * Validate task structure and numbering compliance
     */
    async validateTaskStructure(specId) {
        await this.logger.initializeSession(`Task Structure Validation: ${specId}`);
        this.logger.log("📋 Validating task structure constitutional compliance");
        
        try {
            const tasksPath = path.join(this.specsBasePath, specId, "tasks.md");
            const exists = await fs.access(tasksPath).then(() => true).catch(() => false);
            
            if (!exists) {
                throw new Error(`Tasks file not found for specification ${specId}`);
            }
            
            const tasksContent = await fs.readFile(tasksPath, "utf8");
            const taskValidation = this.analyzeTaskCompliance(tasksContent);
            
            this.logger.addResult("TASK_VALIDATION", taskValidation.status, {
                totalTasks: taskValidation.totalTasks,
                validTasks: taskValidation.validTasks,
                invalidTasks: taskValidation.invalidTasks,
                parallelTasks: taskValidation.parallelTasks,
                complianceRate: `${taskValidation.complianceRate}%`
            });
            
            const summary = `Task structure validation complete. ${taskValidation.complianceRate}% compliant.`;
            const logResult = await this.logger.finalizeLog(
                taskValidation.invalidTasks > 0 ? "NON_COMPLIANT" : "SUCCESS",
                summary
            );
            
            return {
                success: true,
                taskValidation,
                logPath: logResult.logPath
            };
            
        } catch (error) {
            this.logger.log(`Task validation failed: ${error.message}`, "ERROR");
            await this.logger.finalizeLog("FAILED", `Task validation disrupted: ${error.message}`);
            throw error;
        }
    }

    // Core audit methods
    
    async auditSpecification(specId, specPath) {
        const audit = {
            specId,
            compliant: true,
            violations: [],
            warnings: [],
            recommendations: []
        };
        
        // Article III: Spec-Kit Workflow Compliance
        await this.checkSpecKitCompliance(specPath, audit);
        
        // Article I: Task-First Implementation
        await this.checkTaskFirstCompliance(specPath, audit);
        
        // Article IV: Per-Spec Bug Management
        await this.checkBugManagementCompliance(specPath, audit);
        
        // Check for constitutional violations
        if (audit.violations.length > 0) {
            audit.compliant = false;
        }
        
        return audit;
    }
    
    async checkSpecKitCompliance(specPath, audit) {
        // Check for all 7 required documents
        for (const requiredFile of this.requiredFiles) {
            const filePath = path.join(specPath, requiredFile);
            const exists = await fs.access(filePath).then(() => true).catch(() => false);
            
            if (!exists) {
                audit.violations.push({
                    type: "MISSING_REQUIRED_FILE",
                    article: "Article III",
                    description: `Missing required file: ${requiredFile}`,
                    file: requiredFile,
                    fixable: requiredFile !== "contracts/", // Can create empty files except contracts dir
                    severity: "CRITICAL"
                });
            } else {
                // Check file has substantial content (not just "N/A")
                if (requiredFile.endsWith(".md")) {
                    const content = await fs.readFile(filePath, "utf8");
                    if (content.trim().length < 50 && !content.includes("N/A")) {
                        audit.warnings.push({
                            type: "MINIMAL_CONTENT",
                            description: `${requiredFile} has minimal content`,
                            file: requiredFile,
                            severity: "LOW"
                        });
                    }
                }
            }
        }
    }
    
    async checkTaskFirstCompliance(specPath, audit) {
        const tasksPath = path.join(specPath, "tasks.md");
        const exists = await fs.access(tasksPath).then(() => true).catch(() => false);
        
        if (exists) {
            const tasksContent = await fs.readFile(tasksPath, "utf8");
            const taskAnalysis = this.analyzeTaskCompliance(tasksContent);
            
            if (taskAnalysis.invalidTasks > 0) {
                audit.violations.push({
                    type: "INVALID_TASK_FORMAT",
                    article: "Article I",
                    description: `${taskAnalysis.invalidTasks} tasks use invalid numbering format (should be T001, not T1.1.1)`,
                    file: "tasks.md",
                    fixable: true,
                    severity: "HIGH"
                });
            }
            
            if (taskAnalysis.totalTasks === 0) {
                audit.violations.push({
                    type: "NO_IMPLEMENTATION_TASKS",
                    article: "Article I",
                    description: "No implementation tasks defined",
                    file: "tasks.md",
                    fixable: false,
                    severity: "CRITICAL"
                });
            }
        }
    }
    
    async checkBugManagementCompliance(specPath, audit) {
        const tasksPath = path.join(specPath, "tasks.md");
        const exists = await fs.access(tasksPath).then(() => true).catch(() => false);
        
        if (exists) {
            const tasksContent = await fs.readFile(tasksPath, "utf8");
            
            // Check for proper bug task format (B001, B002, etc.)
            const bugTasks = tasksContent.match(/^B\d{3}/gm);
            const invalidBugTasks = tasksContent.match(/^B\d+\.\d+/gm);
            
            if (invalidBugTasks && invalidBugTasks.length > 0) {
                audit.violations.push({
                    type: "INVALID_BUG_FORMAT",
                    article: "Article IV",
                    description: `${invalidBugTasks.length} bug tasks use invalid numbering format (should be B001, not B1.1)`,
                    file: "tasks.md",
                    fixable: true,
                    severity: "MEDIUM"
                });
            }
        }
    }
    
    analyzeTaskCompliance(tasksContent) {
        const lines = tasksContent.split("\n");
        let totalTasks = 0;
        let validTasks = 0;
        let invalidTasks = 0;
        let parallelTasks = 0;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            
            // Count valid task format (T001, B001, etc.)
            if (this.taskPatterns.valid.test(trimmed)) {
                totalTasks++;
                validTasks++;
                
                if (trimmed.includes("[P]")) {
                    parallelTasks++;
                }
            }
            
            // Count invalid task format (T1.1.1, etc.)
            if (this.taskPatterns.invalid.test(trimmed)) {
                totalTasks++;
                invalidTasks++;
            }
        });
        
        const complianceRate = totalTasks > 0 ? Math.round((validTasks / totalTasks) * 100) : 0;
        
        return {
            totalTasks,
            validTasks,
            invalidTasks,
            parallelTasks,
            complianceRate,
            status: invalidTasks === 0 ? "COMPLIANT" : "NON_COMPLIANT"
        };
    }
    
    determineConstitutionalStatus(auditResults, complianceRate) {
        if (auditResults.violations.length === 0) {
            return {
                status: "PERFECT_COMPLIANCE",
                summary: "Perfect constitutional compliance achieved across all specifications."
            };
        } else if (complianceRate >= 80) {
            return {
                status: "SUBSTANTIAL_COMPLIANCE",
                summary: `Substantial compliance achieved (${complianceRate}%). Minor violations require attention.`
            };
        } else if (complianceRate >= 60) {
            return {
                status: "PARTIAL_COMPLIANCE",
                summary: `Partial compliance (${complianceRate}%). Significant constitutional violations detected.`
            };
        } else {
            return {
                status: "CONSTITUTIONAL_CRISIS",
                summary: `Constitutional crisis detected (${complianceRate}% compliance). Immediate remediation required.`
            };
        }
    }
    
    generateComplianceReport(auditResults, constitutionalStatus, complianceRate) {
        const report = [];
        
        report.push("⚖️ CONSTITUTIONAL COMPLIANCE REPORT");
        report.push("═".repeat(45));
        report.push("");
        report.push("*adjusts constitutional documents*");
        report.push("");
        report.push(`COMPLIANCE STATUS: ${constitutionalStatus.status}`);
        report.push(`OVERALL COMPLIANCE: ${complianceRate}%`);
        report.push(`SPECIFICATIONS AUDITED: ${auditResults.specsAudited}`);
        report.push(`COMPLIANT SPECIFICATIONS: ${auditResults.compliantSpecs}`);
        report.push("");
        
        if (auditResults.violations.length > 0) {
            report.push("📜 CONSTITUTIONAL VIOLATIONS");
            report.push("─".repeat(30));
            
            const criticalViolations = auditResults.violations.filter(v => v.severity === "CRITICAL");
            const highViolations = auditResults.violations.filter(v => v.severity === "HIGH");
            const mediumViolations = auditResults.violations.filter(v => v.severity === "MEDIUM");
            
            if (criticalViolations.length > 0) {
                report.push(`🔴 CRITICAL: ${criticalViolations.length} violations`);
                report.push("   Constitutional framework integrity compromised");
            }
            
            if (highViolations.length > 0) {
                report.push(`🟠 HIGH: ${highViolations.length} violations`);
                report.push("   Spec-kit compliance failures detected");
            }
            
            if (mediumViolations.length > 0) {
                report.push(`🟡 MEDIUM: ${mediumViolations.length} violations`);
                report.push("   Process adherence issues identified");
            }
            
            report.push("");
        }
        
        if (auditResults.warnings.length > 0) {
            report.push(`⚠️ WARNINGS: ${auditResults.warnings.length} advisory notices`);
            report.push("");
        }
        
        // Constitutional recommendations
        report.push("📋 CONSTITUTIONAL RECOMMENDATIONS");
        report.push("─".repeat(35));
        
        if (auditResults.violations.length === 0) {
            report.push("✅ Perfect constitutional compliance maintained");
            report.push("   All specifications adhere to framework");
            report.push("   Continue current practices");
        } else {
            report.push("⚖️ Constitutional remediation required:");
            report.push("   1. Address all CRITICAL violations immediately");
            report.push("   2. Implement missing required documents");
            report.push("   3. Correct task numbering format (T001 not T1.1.1)");
            report.push("   4. Ensure all 7 spec-kit documents present");
            
            if (complianceRate < 60) {
                report.push("   5. Consider constitutional education session");
                report.push("   6. Implement compliance monitoring");
            }
        }
        
        const summary = complianceRate === 100 
            ? "Perfect constitutional compliance achieved. Framework integrity maintained."
            : auditResults.violations.length > 0
                ? `${auditResults.violations.length} constitutional violations require immediate attention.`
                : `${complianceRate}% compliance achieved. Minor improvements recommended.`;
        
        return {
            full: report.join("\n"),
            summary
        };
    }
    
    // Violation fixing methods
    
    async fixViolation(specPath, violation) {
        switch (violation.type) {
            case "MISSING_REQUIRED_FILE":
                await this.createMissingFile(specPath, violation.file);
                break;
                
            case "INVALID_TASK_FORMAT":
                await this.fixTaskNumbering(specPath);
                break;
                
            case "INVALID_BUG_FORMAT":
                await this.fixBugNumbering(specPath);
                break;
                
            default:
                throw new Error(`Cannot automatically fix violation type: ${violation.type}`);
        }
    }
    
    async createMissingFile(specPath, fileName) {
        const filePath = path.join(specPath, fileName);
        
        const templates = {
            "spec.md": "# Specification\n\n## Overview\n\nN/A\n\n## Requirements\n\nN/A\n",
            "research.md": "# Research\n\n## Technical Decisions\n\nN/A\n",
            "plan.md": "# Implementation Plan\n\n## Overview\n\nN/A\n",
            "data-model.md": "# Data Model\n\n## Entities\n\nN/A\n",
            "quickstart.md": "# Quickstart Guide\n\n## Manual Testing\n\nN/A\n",
            "tasks.md": "# Tasks\n\n## Implementation Tasks\n\nT001 [Define implementation approach]\n"
        };
        
        if (fileName === "contracts/") {
            await fs.mkdir(filePath, { recursive: true });
        } else {
            const template = templates[fileName] || `# ${fileName}\n\nN/A\n`;
            await fs.writeFile(filePath, template, "utf8");
        }
        
        this.logger.log(`Created missing file: ${fileName}`);
    }
    
    async fixTaskNumbering(specPath) {
        const tasksPath = path.join(specPath, "tasks.md");
        let content = await fs.readFile(tasksPath, "utf8");
        
        // Fix T1.1.1 format to T001 format
        content = content.replace(/^T(\d+)\.(\d+)\.(\d+)/gm, (match, major, minor, patch) => {
            const taskNumber = String(parseInt(major) * 100 + parseInt(minor) * 10 + parseInt(patch)).padStart(3, "0");
            return `T${taskNumber}`;
        });
        
        await fs.writeFile(tasksPath, content, "utf8");
        this.logger.log("Fixed task numbering format");
    }
    
    async fixBugNumbering(specPath) {
        const tasksPath = path.join(specPath, "tasks.md");
        let content = await fs.readFile(tasksPath, "utf8");
        
        // Fix B1.1 format to B001 format
        content = content.replace(/^B(\d+)\.(\d+)/gm, (match, major, minor) => {
            const bugNumber = String(parseInt(major) * 10 + parseInt(minor)).padStart(3, "0");
            return `B${bugNumber}`;
        });
        
        await fs.writeFile(tasksPath, content, "utf8");
        this.logger.log("Fixed bug numbering format");
    }
}

// Export for use as module
module.exports = { SpecsValidationTools };

// CLI usage if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || "audit";
    
    const specs = new SpecsValidationTools();
    
    console.log("⚖️ Specs - Constitutional Compliance Officer");
    console.log("*adjusts constitutional documents with precision*");
    console.log("");
    
    switch (command) {
        case "audit":
            const specId = args[1]; // Optional - audit specific spec or all
            specs.performConstitutionalAudit(specId)
                .then(result => {
                    console.log(result.complianceReport);
                    console.log("");
                    console.log(`📊 Compliance Rate: ${result.complianceRate}%`);
                    console.log(`⚖️ Status: ${result.constitutionalStatus.status}`);
                    console.log(`🚀 Can Proceed: ${result.canProceed ? "YES" : "NO"}`);
                    console.log(`📋 Log: ${result.logPath}`);
                    
                    if (!result.canProceed) {
                        console.log("");
                        console.log("❌ CONSTITUTIONAL VIOLATIONS DETECTED");
                        console.log("Implementation blocked until compliance achieved");
                        process.exit(1);
                    }
                })
                .catch(error => {
                    console.error("❌ Constitutional audit failed:", error.message);
                    process.exit(1);
                });
            break;
            
        case "enforce":
            const enforceSpecId = args[1];
            const autoFix = args.includes("--fix");
            
            if (!enforceSpecId) {
                console.log("Usage: node specs-validation-tools.js enforce <specId> [--fix]");
                process.exit(1);
            }
            
            specs.enforceConstitutionalCompliance(enforceSpecId, autoFix)
                .then(result => {
                    console.log("✅ Constitutional enforcement complete");
                    console.log(`📋 Spec: ${result.specId}`);
                    console.log(`🔧 Actions Taken: ${result.enforcementActions.length}`);
                    console.log(`⚖️ Now Compliant: ${result.nowCompliant ? "YES" : "NO"}`);
                    console.log(`📄 Log: ${result.logPath}`);
                })
                .catch(error => {
                    console.error("❌ Constitutional enforcement failed:", error.message);
                    process.exit(1);
                });
            break;
            
        case "tasks":
            const taskSpecId = args[1];
            
            if (!taskSpecId) {
                console.log("Usage: node specs-validation-tools.js tasks <specId>");
                process.exit(1);
            }
            
            specs.validateTaskStructure(taskSpecId)
                .then(result => {
                    console.log("✅ Task structure validation complete");
                    console.log(`📋 Total Tasks: ${result.taskValidation.totalTasks}`);
                    console.log(`✅ Valid Tasks: ${result.taskValidation.validTasks}`);
                    console.log(`❌ Invalid Tasks: ${result.taskValidation.invalidTasks}`);
                    console.log(`⚖️ Compliance: ${result.taskValidation.complianceRate}%`);
                    console.log(`📄 Log: ${result.logPath}`);
                })
                .catch(error => {
                    console.error("❌ Task validation failed:", error.message);
                    process.exit(1);
                });
            break;
            
        default:
            console.log("Specs Constitutional Validation Tools");
            console.log("Usage:");
            console.log("  node specs-validation-tools.js audit [specId]");
            console.log("  node specs-validation-tools.js enforce <specId> [--fix]");
            console.log("  node specs-validation-tools.js tasks <specId>");
            break;
    }
}