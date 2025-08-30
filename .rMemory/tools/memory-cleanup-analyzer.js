#!/usr/bin/env node
/**
 * Memory Database Cleanup Analyzer
 * Uses Claude Opus to analyze our relationship explosion and recommend cleanup
 * Identifies redundant entities, excessive relationships, and creates hierarchical structure
 */

/* eslint-env node */
/* eslint no-console: "off" */

require("dotenv").config();
const neo4j = require("neo4j-driver");
const Anthropic = require("@anthropic-ai/sdk");

class MemoryCleanupAnalyzer {
    constructor() {
        // Neo4j connection
        this.driver = neo4j.driver(
            process.env.NEO4J_URI || "bolt://localhost:7687",
            neo4j.auth.basic(
                process.env.NEO4J_USERNAME || "neo4j",
                process.env.NEO4J_PASSWORD || "password"
            )
        );
        
        // Claude Opus for intelligent analysis
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        
        this.analysisResults = {
            relationships: {},
            entities: {},
            redundancies: [],
            recommendations: []
        };
    }

    async analyzeRelationshipExplosion() {
        console.log("🔍 Analyzing relationship explosion...");
        
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            // Get relationship analysis
            const relationshipAnalysis = await session.run(`
                MATCH ()-[r]->() 
                RETURN type(r) as rel_type, 
                       count(r) as count,
                       count(r) * 1.0 / (SELECT count(*) FROM ()-[]->()) as percentage
                ORDER BY count DESC
            `);
            
            // Get entity distribution
            const entityAnalysis = await session.run(`
                MATCH (n) 
                RETURN labels(n)[0] as entity_type, 
                       count(n) as count,
                       collect(n.name)[0..5] as sample_names
                ORDER BY count DESC
            `);
            
            // Get sample problematic relationships for analysis
            const _sameProjectSample = await session.run(`
                MATCH (n1)-[r:SAME_PROJECT]->(n2)
                RETURN n1.id as from_id, n1.projectContext as from_project, 
                       n2.id as to_id, n2.projectContext as to_project
                LIMIT 10
            `);
            
            this.analysisResults.relationships = relationshipAnalysis.records.map(r => ({
                type: r.get("rel_type"),
                count: r.get("count").toNumber(),
                percentage: r.get("percentage")
            }));
            
            this.analysisResults.entities = entityAnalysis.records.map(r => ({
                type: r.get("entity_type"),
                count: r.get("count").toNumber(),
                samples: r.get("sample_names")
            }));
            
            console.log("   📊 Relationship distribution:");
            this.analysisResults.relationships.forEach(rel => {
                console.log(`      ${rel.type}: ${rel.count.toLocaleString()} (${(rel.percentage * 100).toFixed(1)}%)`);
            });
            
            return this.analysisResults;
            
        } finally {
            await session.close();
        }
    }

    async generateClaudeAnalysis() {
        console.log("🤖 Consulting Claude Opus for cleanup recommendations...");
        
        const prompt = `You are a database optimization expert analyzing a Neo4j memory system with severe relationship explosion.

CURRENT STATE:
- 195 entities total
- 98,196 relationships (500+ per entity average)
- Top relationship types:
${this.analysisResults.relationships.map(r => `  * ${r.type}: ${r.count.toLocaleString()} (${(r.percentage * 100).toFixed(1)}%)`).join("\n")}

ENTITY BREAKDOWN:
${this.analysisResults.entities.map(e => `- ${e.type}: ${e.count} entities`).join("\n")}

PROBLEMS IDENTIFIED:
1. SAME_PROJECT: ${this.analysisResults.relationships.find(r => r.type === "SAME_PROJECT")?.count || 0} relationships - appears to be all-to-all connection antipattern
2. PRECEDED_BY: ${this.analysisResults.relationships.find(r => r.type === "PRECEDED_BY")?.count || 0} relationships - likely temporal chain explosion
3. This is a development memory system tracking chat sessions, code changes, and project decisions

CONTEXT:
- ExtendedMemory = raw chat sessions (505 entries)
- Summary = AI-generated batch summaries (68 entries) 
- ProjectSummary = high-level project overviews (6 entries)
- Entity = canonical memory items (190+ entries)
- This system tracks HexTrackr project development over time

GOALS:
1. Reduce relationships by 90%+ while preserving semantic value
2. Create proper hierarchical structure following industry standards
3. Implement temporal ranking (newer data supersedes older)
4. Maintain ability to drill down to raw chat sessions when needed

Please provide:
1. ROOT CAUSE analysis of the relationship explosion
2. CLEANUP STRATEGY with specific relationship removal recommendations
3. HIERARCHICAL STRUCTURE design following graph database best practices
4. TEMPORAL RANKING approach for data freshness
5. SPECIFIC CYPHER QUERIES to implement the cleanup

Be decisive and aggressive - we can always regenerate data but need a clean, performant structure.`;

        try {
            const response = await this.anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 4000,
                temperature: 0.3,
                messages: [{ role: "user", content: prompt }]
            });

            const analysis = response.content[0].text;
            console.log("   ✅ Claude analysis complete");
            
            return analysis;
            
        } catch (error) {
            console.error("   ❌ Claude analysis failed:", error.message);
            return null;
        }
    }

    async generateCleanupPlan() {
        console.log("📋 Generating comprehensive cleanup plan...");
        
        // Analyze current state
        await this.analyzeRelationshipExplosion();
        
        // Get Claude's expert analysis
        const claudeAnalysis = await this.generateClaudeAnalysis();
        
        // Generate report
        const report = {
            timestamp: new Date().toISOString(),
            currentState: this.analysisResults,
            claudeAnalysis: claudeAnalysis,
            summary: {
                totalEntities: this.analysisResults.entities.reduce((sum, e) => sum + e.count, 0),
                totalRelationships: this.analysisResults.relationships.reduce((sum, r) => sum + r.count, 0),
                avgRelationshipsPerEntity: Math.round(
                    this.analysisResults.relationships.reduce((sum, r) => sum + r.count, 0) / 
                    this.analysisResults.entities.reduce((sum, e) => sum + e.count, 0)
                )
            }
        };
        
        // Save analysis report
        const fs = require("fs");
        const reportPath = ".rMemory/analysis/memory-cleanup-analysis-" + Date.now() + ".json";
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`📄 Analysis saved to: ${reportPath}`);
        console.log(`🎯 Current state: ${report.summary.totalEntities} entities, ${report.summary.totalRelationships.toLocaleString()} relationships`);
        console.log(`📊 Average: ${report.summary.avgRelationshipsPerEntity} relationships per entity (should be ~5-10)`);
        
        if (claudeAnalysis) {
            console.log("\n" + "=".repeat(60));
            console.log("🤖 CLAUDE OPUS ANALYSIS & RECOMMENDATIONS:");
            console.log("=".repeat(60));
            console.log(claudeAnalysis);
        }
        
        return report;
    }

    async close() {
        await this.driver.close();
    }
}

// Run analysis if called directly
if (require.main === module) {
    (async () => {
        const analyzer = new MemoryCleanupAnalyzer();
        
        try {
            await analyzer.generateCleanupPlan();
        } catch (error) {
            console.error("💥 Analysis failed:", error);
        } finally {
            await analyzer.close();
            process.exit(0);
        }
    })();
}

module.exports = { MemoryCleanupAnalyzer };
