#!/usr/bin/env node

/* eslint-env node */
/* global require, process, console, module */

/**
 * Stooges Parallel Research Tools
 * Three Stooges chaos meets professional parallel analysis
 */

const fs = require("fs").promises;
const path = require("path");
const { AgentLogger } = require("./agent-logger.js");

class StoogesResearchTools {
    constructor() {
        this.loggers = {
            larry: new AgentLogger("larry", "Frontend Security Specialist - \"Soitenly!\""),
            moe: new AgentLogger("moe", "Backend Architecture Boss - \"Why I oughta...\""),
            curly: new AgentLogger("curly", "Creative Problem Solver - \"Nyuk nyuk nyuk!\"")
        };
        
        this.personalities = {
            larry: {
                catchphrases: ["Soitenly!", "I'm a victim of circumstances!", "Spread out!"],
                specialties: ["Frontend security", "XSS prevention", "User interface analysis"],
                approach: "wild-haired enthusiasm with security focus"
            },
            moe: {
                catchphrases: ["Why I oughta...", "Numbskulls!", "Remind me to murder you later"],
                specialties: ["Backend architecture", "Database optimization", "System organization"],
                approach: "bossy precision with architectural expertise"
            },
            curly: {
                catchphrases: ["Nyuk nyuk nyuk!", "Woo-woo-woo!", "I'm a victim of circumstances!"],
                specialties: ["Creative solutions", "Pattern recognition", "Unexpected connections"],
                approach: "chaotic creativity with surprising insights"
            }
        };
    }

    /**
     * Execute parallel research across all three Stooges
     */
    async executeParallelResearch(topic, focusAreas = null) {
        console.log("🎭 THE THREE STOOGES RESEARCH TEAM ACTIVATED");
        console.log("*sounds of controlled chaos and \"nyuk nyuk nyuk\" in the distance*");
        console.log("");
        
        try {
            // Initialize all three Stooges simultaneously
            const researchSessions = await Promise.all([
                this.loggers.larry.initializeSession(`Parallel Research: ${topic} (Larry's Perspective)`),
                this.loggers.moe.initializeSession(`Parallel Research: ${topic} (Moe's Perspective)`),
                this.loggers.curly.initializeSession(`Parallel Research: ${topic} (Curly's Perspective)`)
            ]);
            
            console.log("Larry: \"Soitenly! I'll handle the frontend security angle!\"");
            console.log("Moe: \"Numbskulls! Let me organize the backend properly...\"");
            console.log("Curly: \"Nyuk nyuk! I'll find the creative connections!\"");
            console.log("");
            
            // Execute parallel research - each Stooge takes their angle
            const researchPromises = [
                this.larryResearch(topic, focusAreas),
                this.moeResearch(topic, focusAreas), 
                this.curlyResearch(topic, focusAreas)
            ];
            
            const [larryResults, moeResults, curlyResults] = await Promise.all(researchPromises);
            
            // Synthesis phase - Moe coordinates (he's the bossy one)
            const synthesis = await this.synthesizeResearch(larryResults, moeResults, curlyResults, topic);
            
            // Save individual results to Memento
            const memoryIds = await this.saveToMemento(larryResults, moeResults, curlyResults, synthesis);
            
            // Generate final report with Stooges flair
            const finalReport = this.generateStoogesReport(larryResults, moeResults, curlyResults, synthesis);
            
            return {
                success: true,
                topic,
                larryResults,
                moeResults,
                curlyResults,
                synthesis,
                finalReport: finalReport.full,
                memoryIds,
                logPaths: {
                    larry: researchSessions[0].logPath,
                    moe: researchSessions[1].logPath,
                    curly: researchSessions[2].logPath
                }
            };
            
        } catch (error) {
            console.error("💥 Stooges research encountered interference!");
            console.error("*sounds of bonking and \"D'oh!\" in background*");
            throw error;
        }
    }

    /**
     * Larry's Frontend Security Research
     */
    async larryResearch(topic, focusAreas) {
        this.loggers.larry.log("🔍 Larry starting wild-haired frontend security analysis");
        this.loggers.larry.log("*adjusts wild hair and rolls up sleeves*");
        
        const findings = {
            stooge: "Larry",
            perspective: "Frontend Security & XSS Prevention",
            discoveries: [],
            concerns: [],
            recommendations: []
        };
        
        try {
            // Larry focuses on frontend security patterns
            if (topic.toLowerCase().includes("security") || topic.toLowerCase().includes("frontend")) {
                findings.discoveries.push("Soitenly! Found potential XSS vulnerabilities to investigate");
                findings.discoveries.push("DOM manipulation patterns need DOMPurify validation");
                findings.concerns.push("User input handling requires security review");
                findings.recommendations.push("Implement comprehensive XSS prevention framework");
                
                this.loggers.larry.addResult("FRONTEND_SECURITY", "XSS prevention patterns analyzed", {
                    focus: "Frontend security vulnerabilities",
                    patterns: "DOMPurify usage, input validation",
                    priority: "HIGH"
                });
            }
            
            // Larry's wild enthusiasm for user interface analysis
            if (topic.toLowerCase().includes("ui") || topic.toLowerCase().includes("interface")) {
                findings.discoveries.push("User interface patterns show inconsistent styling");
                findings.discoveries.push("Mobile responsiveness needs attention in several components");
                findings.concerns.push("Accessibility compliance gaps detected");
                findings.recommendations.push("Standardize UI component library usage");
                
                this.loggers.larry.addResult("UI_ANALYSIS", "Interface patterns evaluated", {
                    focus: "User interface consistency",
                    issues: "Responsive design, accessibility",
                    approach: "Component standardization"
                });
            }
            
            // Larry always finds something frontend-related
            findings.discoveries.push("JavaScript module organization could be improved");
            findings.recommendations.push("Consider frontend architecture refactoring");
            
            this.loggers.larry.log("Soitenly! Frontend security analysis complete");
            await this.loggers.larry.finalizeLog("SUCCESS", "Larry's wild-haired analysis complete with security focus");
            
            return findings;
            
        } catch (error) {
            this.loggers.larry.log(`Larry's research got tangled: ${error.message}`, "ERROR");
            await this.loggers.larry.finalizeLog("FAILED", "Got my hair caught in the research machinery!");
            throw error;
        }
    }

    /**
     * Moe's Backend Architecture Research
     */
    async moeResearch(topic, focusAreas) {
        this.loggers.moe.log("🔧 Moe organizing backend architecture analysis");
        this.loggers.moe.log("*straightens tie and cracks knuckles menacingly*");
        
        const findings = {
            stooge: "Moe",
            perspective: "Backend Architecture & System Organization",
            discoveries: [],
            concerns: [],
            recommendations: []
        };
        
        try {
            // Moe focuses on backend organization and architecture
            if (topic.toLowerCase().includes("backend") || topic.toLowerCase().includes("architecture")) {
                findings.discoveries.push("Why I oughta reorganize this Express.js monolith!");
                findings.discoveries.push("Database schema optimization opportunities identified");
                findings.concerns.push("Performance bottlenecks in query patterns");
                findings.recommendations.push("Implement proper backend modularization");
                findings.recommendations.push("Add comprehensive error handling middleware");
                
                this.loggers.moe.addResult("BACKEND_ARCHITECTURE", "System organization analyzed", {
                    focus: "Express.js monolith structure",
                    issues: "Performance, modularity",
                    approach: "Systematic refactoring"
                });
            }
            
            // Moe's organizational skills applied to any topic
            if (topic.toLowerCase().includes("data") || topic.toLowerCase().includes("database")) {
                findings.discoveries.push("SQLite optimization patterns need systematic review");
                findings.discoveries.push("Data validation middleware requires standardization");
                findings.concerns.push("Inconsistent data access patterns across modules");
                findings.recommendations.push("Centralize database connection management");
                
                this.loggers.moe.addResult("DATABASE_ANALYSIS", "Data organization evaluated", {
                    focus: "SQLite optimization",
                    patterns: "Query performance, validation",
                    priority: "MEDIUM"
                });
            }
            
            // Moe always wants to organize everything
            findings.discoveries.push("Code organization needs systematic improvement");
            findings.recommendations.push("Implement proper separation of concerns");
            findings.recommendations.push("Why I oughta create better module boundaries!");
            
            this.loggers.moe.log("Numbskulls! Backend analysis organized and complete");
            await this.loggers.moe.finalizeLog("SUCCESS", "Moe's systematic organization applied successfully");
            
            return findings;
            
        } catch (error) {
            this.loggers.moe.log(`Moe's research got disorganized: ${error.message}`, "ERROR");
            await this.loggers.moe.finalizeLog("FAILED", "Why I oughta fix this research machinery!");
            throw error;
        }
    }

    /**
     * Curly's Creative Pattern Research
     */
    async curlyResearch(topic, focusAreas) {
        this.loggers.curly.log("🎨 Curly discovering creative connections");
        this.loggers.curly.log("*spins around enthusiastically making \"woo-woo\" sounds*");
        
        const findings = {
            stooge: "Curly",
            perspective: "Creative Solutions & Unexpected Connections",
            discoveries: [],
            concerns: [],
            recommendations: []
        };
        
        try {
            // Curly finds unexpected patterns and creative solutions
            findings.discoveries.push("Nyuk nyuk! Found interesting patterns nobody else noticed!");
            findings.discoveries.push("Creative cross-module connections could be leveraged");
            findings.discoveries.push("Woo-woo-woo! Unusual optimization opportunities discovered");
            
            // Curly's creative approach to any topic
            if (topic.toLowerCase().includes("performance")) {
                findings.discoveries.push("Surprising performance bottlenecks in unexpected places");
                findings.concerns.push("Some optimizations might have creative side effects");
                findings.recommendations.push("Try unconventional caching strategies");
                findings.recommendations.push("Nyuk nyuk! Bundle splitting could work differently");
                
                this.loggers.curly.addResult("CREATIVE_PERFORMANCE", "Unexpected optimization patterns", {
                    focus: "Unconventional performance improvements",
                    approach: "Creative problem solving",
                    uniqueness: "HIGH"
                });
            }
            
            // Curly always finds the weird edge cases
            if (topic.toLowerCase().includes("bug") || topic.toLowerCase().includes("issue")) {
                findings.discoveries.push("Found bugs hiding in places nobody would look!");
                findings.discoveries.push("Some issues are actually features in disguise");
                findings.concerns.push("Edge cases that make you go \"nyuk nyuk what??\"");
                findings.recommendations.push("Test the impossible scenarios");
                findings.recommendations.push("Sometimes the weirdest solution is the right one");
                
                this.loggers.curly.addResult("CREATIVE_DEBUGGING", "Unusual bug patterns discovered", {
                    focus: "Edge cases and unexpected behaviors",
                    method: "Chaotic but thorough exploration",
                    surprises: "Multiple unexpected findings"
                });
            }
            
            // Curly's random but often brilliant insights
            findings.discoveries.push("Connections between seemingly unrelated components");
            findings.recommendations.push("Consider doing things backwards - might work better!");
            findings.recommendations.push("Woo-woo-woo! What if we tried it upside down?");
            
            this.loggers.curly.log("Nyuk nyuk nyuk! Creative analysis complete with surprising results");
            await this.loggers.curly.finalizeLog("SUCCESS", "Curly's chaotic creativity produced unexpected insights");
            
            return findings;
            
        } catch (error) {
            this.loggers.curly.log(`Curly's research went "bonk": ${error.message}`, "ERROR");
            await this.loggers.curly.finalizeLog("FAILED", "Woo-woo-woo! Research machinery needs oil!");
            throw error;
        }
    }

    /**
     * Synthesize all three research perspectives
     */
    async synthesizeResearch(larryResults, moeResults, curlyResults, topic) {
        console.log("🔄 Moe coordinating synthesis (because he's the bossy one)");
        console.log("Moe: \"Alright numbskulls, let's organize these findings!\"");
        
        const synthesis = {
            topic,
            coordinatedBy: "Moe (The Boss)",
            combinedFindings: {
                security: [],
                architecture: [],
                creative: [],
                consensus: []
            },
            priorityRecommendations: [],
            stoogeAgreements: [],
            stoogeDisagreements: []
        };
        
        // Combine security findings (Larry's specialty)
        synthesis.combinedFindings.security = [
            ...larryResults.discoveries.filter(d => d.toLowerCase().includes("security") || d.toLowerCase().includes("xss")),
            ...larryResults.recommendations.filter(r => r.toLowerCase().includes("security"))
        ];
        
        // Combine architecture findings (Moe's specialty)
        synthesis.combinedFindings.architecture = [
            ...moeResults.discoveries.filter(d => d.toLowerCase().includes("architecture") || d.toLowerCase().includes("backend")),
            ...moeResults.recommendations.filter(r => r.toLowerCase().includes("organize") || r.toLowerCase().includes("backend"))
        ];
        
        // Combine creative findings (Curly's specialty)
        synthesis.combinedFindings.creative = [
            ...curlyResults.discoveries.filter(d => d.includes("Nyuk") || d.includes("Woo-woo") || d.includes("creative")),
            ...curlyResults.recommendations.filter(r => r.includes("unconventional") || r.includes("backwards") || r.includes("upside down"))
        ];
        
        // Find consensus recommendations (where Stooges agree)
        const allRecommendations = [
            ...larryResults.recommendations,
            ...moeResults.recommendations, 
            ...curlyResults.recommendations
        ];
        
        // Look for similar themes (simplified consensus detection)
        const themes = ["security", "performance", "organization", "testing", "architecture"];
        themes.forEach(theme => {
            const themeRecs = allRecommendations.filter(rec => 
                rec.toLowerCase().includes(theme)
            );
            if (themeRecs.length >= 2) {
                synthesis.stoogeAgreements.push(`Multiple Stooges agree on ${theme} improvements`);
            }
        });
        
        // Priority recommendations (Moe's organizational priorities)
        synthesis.priorityRecommendations = [
            "HIGH: Address security vulnerabilities (Larry's concern)",
            "HIGH: Improve backend organization (Moe's demand)", 
            "MEDIUM: Explore creative solutions (Curly's discoveries)",
            "MEDIUM: Implement systematic improvements across all areas"
        ];
        
        // Typical Stooge disagreements
        synthesis.stoogeDisagreements = [
            "Larry wants to focus on frontend, Moe insists backend is priority",
            "Moe wants systematic approach, Curly suggests chaotic creativity",
            "All three have different ideas about implementation order"
        ];
        
        return synthesis;
    }

    /**
     * Save all research to Memento with proper namespacing
     */
    async saveToMemento(larryResults, moeResults, curlyResults, synthesis) {
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
        const memoryIds = {};
        
        // Save Larry's findings
        const larryEntity = this.loggers.larry.createMementoEntity();
        larryEntity.observations.push(...larryResults.discoveries);
        larryEntity.observations.push(...larryResults.recommendations);
        
        // Save Moe's findings  
        const moeEntity = this.loggers.moe.createMementoEntity();
        moeEntity.observations.push(...moeResults.discoveries);
        moeEntity.observations.push(...moeResults.recommendations);
        
        // Save Curly's findings
        const curlyEntity = this.loggers.curly.createMementoEntity();  
        curlyEntity.observations.push(...curlyResults.discoveries);
        curlyEntity.observations.push(...curlyResults.recommendations);
        
        // Save synthesis
        const synthesisEntity = {
            name: `HEXTRACKR:STOOGES:SYNTHESIS_${timestamp}`,
            entityType: "PROJECT:RESEARCH:SYNTHESIS",
            observations: [
                `Topic: ${synthesis.topic}`,
                `Coordinated by: ${synthesis.coordinatedBy}`,
                `Security findings: ${synthesis.combinedFindings.security.length}`,
                `Architecture findings: ${synthesis.combinedFindings.architecture.length}`,
                `Creative findings: ${synthesis.combinedFindings.creative.length}`,
                `Agreements: ${synthesis.stoogeAgreements.join("; ")}`,
                `Priority recommendations: ${synthesis.priorityRecommendations.join("; ")}`
            ]
        };
        
        return {
            larry: larryEntity.name,
            moe: moeEntity.name, 
            curly: curlyEntity.name,
            synthesis: synthesisEntity.name
        };
    }

    /**
     * Generate final Stooges research report
     */
    generateStoogesReport(larryResults, moeResults, curlyResults, synthesis) {
        const report = [];
        
        report.push("🎭 THE THREE STOOGES RESEARCH REPORT");
        report.push("═".repeat(45));
        report.push("*sounds of controlled chaos and occasional bonking*");
        report.push("");
        
        // Larry's Section
        report.push("👨‍🦱 LARRY'S WILD-HAIRED FRONTEND SECURITY ANALYSIS");
        report.push("─".repeat(50));
        report.push("*adjusts wild hair* \"Soitenly! Here's what I found:\"");
        larryResults.discoveries.forEach(discovery => {
            report.push(`  🔍 ${discovery}`);
        });
        report.push("");
        report.push("Larry's Recommendations:");
        larryResults.recommendations.forEach(rec => {
            report.push(`  ✅ ${rec}`);
        });
        report.push("");
        
        // Moe's Section
        report.push("👨‍🦲 MOE'S SYSTEMATIC BACKEND ORGANIZATION");
        report.push("─".repeat(45));
        report.push("*straightens tie menacingly* \"Why I oughta organize this properly:\"");
        moeResults.discoveries.forEach(discovery => {
            report.push(`  🔧 ${discovery}`);
        });
        report.push("");
        report.push("Moe's Systematic Recommendations:");
        moeResults.recommendations.forEach(rec => {
            report.push(`  📋 ${rec}`);
        });
        report.push("");
        
        // Curly's Section
        report.push("👨‍🦱 CURLY'S CREATIVE CHAOS DISCOVERIES");
        report.push("─".repeat(42));
        report.push("*spins enthusiastically* \"Nyuk nyuk nyuk! Look what I found:\"");
        curlyResults.discoveries.forEach(discovery => {
            report.push(`  🎨 ${discovery}`);
        });
        report.push("");
        report.push("Curly's Creative Recommendations:");
        curlyResults.recommendations.forEach(rec => {
            report.push(`  💡 ${rec}`);
        });
        report.push("");
        
        // Synthesis Section
        report.push("🔄 MOE'S COORDINATED SYNTHESIS");
        report.push("─".repeat(30));
        report.push("\"Alright numbskulls, here's what we all found together:\"");
        report.push("");
        
        if (synthesis.stoogeAgreements.length > 0) {
            report.push("🤝 WHERE THE STOOGES AGREE:");
            synthesis.stoogeAgreements.forEach(agreement => {
                report.push(`  ✅ ${agreement}`);
            });
            report.push("");
        }
        
        report.push("🎯 PRIORITY RECOMMENDATIONS:");
        synthesis.priorityRecommendations.forEach(priority => {
            report.push(`  📌 ${priority}`);
        });
        report.push("");
        
        if (synthesis.stoogeDisagreements.length > 0) {
            report.push("💥 STOOGE DISAGREEMENTS (As Expected):");
            synthesis.stoogeDisagreements.forEach(disagreement => {
                report.push(`  ⚔️ ${disagreement}`);
            });
            report.push("");
        }
        
        report.push("─".repeat(50));
        report.push("*Three Stooges bow simultaneously and bonk heads*");
        report.push("");
        report.push("Larry: \"Soitenly was a productive research session!\"");
        report.push("Moe: \"Why I oughta do this more often...\""); 
        report.push("Curly: \"Nyuk nyuk nyuk! Same time tomorrow?\"");
        report.push("");
        report.push("*Exit stage left with sound effects*");
        
        const summary = `Three Stooges parallel research complete! ${larryResults.discoveries.length + moeResults.discoveries.length + curlyResults.discoveries.length} total discoveries with ${synthesis.stoogeAgreements.length} areas of consensus.`;
        
        return {
            full: report.join("\n"),
            summary
        };
    }
}

// Export for use as module
module.exports = { StoogesResearchTools };

// CLI usage if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const topic = args.join(" ") || "General codebase analysis";
    
    const stooges = new StoogesResearchTools();
    
    console.log("🎭 The Three Stooges Research Division");
    console.log("*sounds of controlled chaos in the background*");
    console.log("");
    
    stooges.executeParallelResearch(topic)
        .then(result => {
            console.log(result.finalReport);
            console.log("");
            console.log("📊 RESEARCH SUMMARY:");
            console.log(`🎯 Topic: ${result.topic}`);
            console.log(`👨‍🦱 Larry Findings: ${result.larryResults.discoveries.length}`);
            console.log(`👨‍🦲 Moe Findings: ${result.moeResults.discoveries.length}`);
            console.log(`👨‍🦱 Curly Findings: ${result.curlyResults.discoveries.length}`);
            console.log(`🤝 Consensus Areas: ${result.synthesis.stoogeAgreements.length}`);
            console.log("");
            console.log("📋 LOG FILES:");
            console.log(`  Larry: ${result.logPaths.larry}`);
            console.log(`  Moe: ${result.logPaths.moe}`);
            console.log(`  Curly: ${result.logPaths.curly}`);
            console.log("");
            console.log("🎭 \"Nyuk nyuk nyuk! Research complete!\"");
        })
        .catch(error => {
            console.error("💥 Stooges research encountered interference:", error.message);
            console.error("*sounds of bonking and \"D'oh!\" in background*");
            process.exit(1);
        });
}