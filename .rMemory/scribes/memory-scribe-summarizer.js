#!/usr/bin/env node
/**
 * Memory Scribe Summarizer
 * Uses Ollama to create intelligent summaries from extended memory
 * Implements the multi-tier architecture: Extended → Summaries → Primary Memory
 */

/* eslint-env node */
/* eslint no-undef: "off" */
/* eslint no-console: "off" */

require("dotenv").config();
const path = require("path");
const neo4j = require("neo4j-driver");

class MemoryScribeSummarizer {
    constructor() {
        this.projectRoot = process.cwd();
        this.memoryDir = path.join(this.projectRoot, ".rMemory");
        
        // Neo4j configuration
        this.driver = neo4j.driver(
            process.env.NEO4J_URI || "bolt://localhost:7687",
            neo4j.auth.basic(
                process.env.NEO4J_USERNAME || "neo4j",
                process.env.NEO4J_PASSWORD || "password"
            )
        );
        
        // Ollama configuration
        this.ollamaModel = "qwen2.5-coder:7b";
        this.ollamaUrl = "http://localhost:11434/api/generate";
        
        this.processedSummaries = 0;
    }

    async queryOllama(prompt) {
        try {
            const response = await fetch(this.ollamaUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: this.ollamaModel,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.3, // Low temperature for consistent summaries
                        top_p: 0.8,
                        max_tokens: 500
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`);
            }

            const data = await response.json();
            return data.response.trim();
        } catch (error) {
            console.warn(`   ⚠️  Ollama query failed: ${error.message}`);
            return null;
        }
    }

    async getExtendedMemoryBatches(batchSize = 10) {
        console.log("📂 Loading extended memory for summarization...");
        
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            // Get high-importance and recent entries first
            const result = await session.run(`
                MATCH (em:ExtendedMemory)
                WHERE em.importance >= 2 OR 
                      em.messageType IN ["bug_fix", "feature_development", "analysis"] OR
                      datetime(em.timestamp) > datetime() - duration("P7D")
                RETURN em.id as id, em.searchableText as text, em.projectContext as project,
                       em.messageType as type, em.importance as importance, em.timestamp as timestamp,
                       em.semanticKeywords as keywords
                ORDER BY em.importance DESC, em.timestamp DESC
            `);
            
            console.log(`   ✅ Found ${result.records.length} high-value entries for summarization`);
            
            // Group into batches
            const entries = result.records.map(record => ({
                id: record.get("id"),
                text: record.get("text"),
                project: record.get("project"),
                type: record.get("type"),
                importance: this.safeToNumber(record.get("importance")),
                timestamp: record.get("timestamp"),
                keywords: record.get("keywords")
            }));
            
            const batches = [];
            for (let i = 0; i < entries.length; i += batchSize) {
                batches.push(entries.slice(i, i + batchSize));
            }
            
            console.log(`   📊 Created ${batches.length} batches of ${batchSize} entries each`);
            return batches;
            
        } finally {
            await session.close();
        }
    }

    async summarizeBatch(batch, batchIndex) {
        console.log(`🧠 Summarizing batch ${batchIndex + 1}...`);
        
        // Create summarization prompt
        const batchText = batch.map(entry => {
            return `[${entry.type}|${entry.importance}] ${entry.text.substring(0, 300)}`;
        }).join("\n\n");
        
        const prompt = `You are a technical memory scribe for a software development project. 

TASK: Create a concise technical summary of these chat session excerpts.

CHAT EXCERPTS:
${batchText}

INSTRUCTIONS:
1. Identify the main technical topics, decisions, and issues
2. Extract key code insights, bugs found, and features developed  
3. Note any architectural decisions or important discoveries
4. Keep it technical and actionable for developers
5. Format as bullet points for easy scanning
6. Max 200 words

SUMMARY:`;

        const summary = await this.queryOllama(prompt);
        
        if (!summary) {
            console.warn(`   ⚠️  Failed to summarize batch ${batchIndex + 1}`);
            return null;
        }
        
        // Create summary metadata
        const summaryData = {
            id: `summary-batch-${batchIndex + 1}-${Date.now()}`,
            type: "batch_summary",
            batchIndex: batchIndex,
            entryCount: batch.length,
            summary: summary,
            projects: [...new Set(batch.map(e => e.project))],
            messageTypes: [...new Set(batch.map(e => e.type))],
            importanceRange: {
                min: Math.min(...batch.map(e => e.importance)),
                max: Math.max(...batch.map(e => e.importance))
            },
            timeRange: {
                earliest: batch.reduce((min, e) => e.timestamp < min ? e.timestamp : min, batch[0].timestamp),
                latest: batch.reduce((max, e) => e.timestamp > max ? e.timestamp : max, batch[0].timestamp)
            },
            sourceEntries: batch.map(e => e.id),
            createdAt: new Date().toISOString()
        };
        
        console.log(`   ✅ Generated ${summary.length} character summary for ${batch.length} entries`);
        return summaryData;
    }

    async storeSummaryInPrimaryMemory(summaryData) {
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            // Create summary node in primary memory
            await session.run(`
                CREATE (s:Summary {
                    id: $id,
                    type: $type,
                    summary: $summary,
                    entryCount: $entryCount,
                    projects: $projects,
                    messageTypes: $messageTypes,
                    importanceMin: $importanceMin,
                    importanceMax: $importanceMax,
                    timeRangeEarliest: $timeRangeEarliest,
                    timeRangeLatest: $timeRangeLatest,
                    createdAt: $createdAt,
                    batchIndex: $batchIndex
                })
            `, {
                id: summaryData.id,
                type: summaryData.type,
                summary: summaryData.summary,
                entryCount: neo4j.int(summaryData.entryCount),
                projects: summaryData.projects,
                messageTypes: summaryData.messageTypes,
                importanceMin: neo4j.int(summaryData.importanceRange.min),
                importanceMax: neo4j.int(summaryData.importanceRange.max),
                timeRangeEarliest: summaryData.timeRange.earliest,
                timeRangeLatest: summaryData.timeRange.latest,
                createdAt: summaryData.createdAt,
                batchIndex: neo4j.int(summaryData.batchIndex)
            });
            
            // Link summary to source extended memory entries
            await session.run(`
                MATCH (s:Summary {id: $summaryId})
                MATCH (em:ExtendedMemory)
                WHERE em.id IN $sourceEntries
                MERGE (s)-[:SUMMARIZES]->(em)
            `, {
                summaryId: summaryData.id,
                sourceEntries: summaryData.sourceEntries
            });
            
            console.log(`   💾 Stored summary ${summaryData.id} with ${summaryData.sourceEntries.length} source links`);
            
        } finally {
            await session.close();
        }
    }

    async createProjectSummaries() {
        console.log("🎯 Creating project-level summaries...");
        
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            // Get all summaries by project
            const result = await session.run(`
                MATCH (s:Summary)
                WHERE s.type = "batch_summary"
                RETURN s.projects as projects, collect(s.summary) as summaries,
                       count(s) as summaryCount, sum(s.entryCount) as totalEntries
            `);
            
            for (const record of result.records) {
                const projects = record.get("projects");
                const summaries = record.get("summaries");
                const summaryCount = this.safeToNumber(record.get("summaryCount"));
                const totalEntries = this.safeToNumber(record.get("totalEntries"));
                
                for (const project of projects) {
                    // Create project-level summary
                    const projectSummariesText = summaries.join("\n\n");
                    
                    const prompt = `You are creating a high-level project summary for: ${project}

BATCH SUMMARIES:
${projectSummariesText}

TASK: Create a comprehensive project summary that:
1. Identifies the main themes and development focus areas
2. Lists key technical decisions and architectural insights  
3. Highlights important bugs fixed and features developed
4. Notes any patterns or recurring issues
5. Provides actionable insights for future development

Keep it strategic and useful for project planning. Max 300 words.

PROJECT SUMMARY:`;

                    const projectSummary = await this.queryOllama(prompt);
                    
                    if (projectSummary) {
                        const projectSummaryData = {
                            id: `project-summary-${project.toLowerCase()}-${Date.now()}`,
                            type: "project_summary",
                            project: project,
                            summary: projectSummary,
                            batchSummaryCount: summaryCount,
                            totalEntries: totalEntries,
                            createdAt: new Date().toISOString()
                        };
                        
                        // Store project summary
                        await session.run(`
                            CREATE (ps:ProjectSummary {
                                id: $id,
                                type: $type,
                                project: $project,
                                summary: $summary,
                                batchSummaryCount: $batchSummaryCount,
                                totalEntries: $totalEntries,
                                createdAt: $createdAt
                            })
                        `, {
                            id: projectSummaryData.id,
                            type: projectSummaryData.type,
                            project: projectSummaryData.project,
                            summary: projectSummaryData.summary,
                            batchSummaryCount: neo4j.int(projectSummaryData.batchSummaryCount),
                            totalEntries: neo4j.int(projectSummaryData.totalEntries),
                            createdAt: projectSummaryData.createdAt
                        });
                        
                        console.log(`   ✅ Created project summary for ${project} (${totalEntries} entries)`);
                    }
                }
            }
            
        } finally {
            await session.close();
        }
    }

    /**
     * Safely convert Neo4j result to number
     * @param {any} value - Neo4j query result value
     * @returns {number} - JavaScript number
     */
    safeToNumber(value) {
        if (value === null || value === undefined) {
            return 0;
        }
        if (typeof value === "number") {
            return value;
        }
        if (value && typeof value.toNumber === "function") {
            return value.toNumber();
        }
        return Number(value) || 0;
    }

    async checkRecentSummaries() {
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            const result = await session.run(`
                MATCH (s:Summary)
                WHERE datetime(s.createdAt) > datetime() - duration("PT1H")
                RETURN count(s) as recentCount
            `);
            
            return this.safeToNumber(result.records[0]?.get("recentCount"));
        } catch (error) {
            console.warn("   ⚠️  Could not check recent summaries:", error.message);
            return 0;
        } finally {
            await session.close();
        }
    }

    async generateMemoryReport() {
        console.log("\n📊 Memory Architecture Report");
        console.log("=" .repeat(50));
        
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            // Extended memory stats
            const extendedStats = await session.run(`
                MATCH (em:ExtendedMemory)
                RETURN count(em) as totalExtended,
                       avg(em.importance) as avgImportance,
                       collect(DISTINCT em.projectContext) as projects
            `);
            
            // Summary stats
            const summaryStats = await session.run(`
                MATCH (s:Summary)
                RETURN count(s) as totalSummaries,
                       sum(s.entryCount) as summarizedEntries
            `);
            
            // Project summary stats
            const projectStats = await session.run(`
                MATCH (ps:ProjectSummary)
                RETURN count(ps) as totalProjectSummaries,
                       collect(ps.project) as projects
            `);
            
            // Primary memory stats (existing entities)
            const primaryStats = await session.run(`
                MATCH (e:Entity)
                RETURN count(e) as totalEntities,
                       collect(DISTINCT e.type) as entityTypes
            `);
            
            const extendedRecord = extendedStats.records[0];
            const summaryRecord = summaryStats.records[0];
            const projectRecord = projectStats.records[0];
            const primaryRecord = primaryStats.records[0];
            
            console.log("🗄️  Multi-Tier Memory Architecture:");
            console.log(`   Extended Memory: ${this.safeToNumber(extendedRecord.get("totalExtended"))} raw chat sessions`);
            console.log(`   Batch Summaries: ${this.safeToNumber(summaryRecord.get("totalSummaries"))} summaries covering ${this.safeToNumber(summaryRecord.get("summarizedEntries"))} entries`);
            console.log(`   Project Summaries: ${this.safeToNumber(projectRecord.get("totalProjectSummaries"))} project overviews`);
            console.log(`   Primary Memory: ${this.safeToNumber(primaryRecord.get("totalEntities"))} canonical entities`);
            
            console.log(`\n🎯 Projects: ${extendedRecord.get("projects").join(", ")}`);
            console.log(`📊 Average Importance: ${this.safeToNumber(extendedRecord.get("avgImportance")).toFixed(2)}/5`);
            
            return {
                extendedMemory: this.safeToNumber(extendedRecord.get("totalExtended")),
                batchSummaries: this.safeToNumber(summaryRecord.get("totalSummaries")),
                projectSummaries: this.safeToNumber(projectRecord.get("totalProjectSummaries")),
                primaryMemory: this.safeToNumber(primaryRecord.get("totalEntities"))
            };
            
        } finally {
            await session.close();
        }
    }

    async processAll() {
        console.log("🚀 Starting Memory Scribe Summarization...");
        
        try {
            // Check for recent summaries to prevent duplicate processing
            const recentSummaries = await this.checkRecentSummaries();
            if (recentSummaries > 0) {
                console.log(`⚠️  Found ${recentSummaries} summaries created in the last hour.`);
                console.log("🛑 Skipping to prevent duplicates. Use --force to override.");
                return;
            }
            
            // Get extended memory in batches
            const batches = await this.getExtendedMemoryBatches(8); // Smaller batches for better summaries
            
            if (batches.length === 0) {
                console.log("⚠️  No extended memory entries found for summarization");
                return;
            }
            
            // Process each batch
            console.log(`📝 Processing ${batches.length} batches...`);
            
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                
                // Create batch summary
                const summaryData = await this.summarizeBatch(batch, i);
                
                if (summaryData) {
                    // Store in primary memory
                    await this.storeSummaryInPrimaryMemory(summaryData);
                    this.processedSummaries++;
                }
                
                // Small delay to avoid overwhelming Ollama
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if ((i + 1) % 5 === 0) {
                    console.log(`   📊 Processed ${i + 1}/${batches.length} batches`);
                }
            }
            
            console.log(`   ✅ Created ${this.processedSummaries} batch summaries`);
            
            // Create project-level summaries
            await this.createProjectSummaries();
            
            // Generate final report
            const report = await this.generateMemoryReport();
            
            console.log("\n✅ Memory Scribe Summarization Complete!");
            console.log("🎯 Your multi-tier memory architecture is now operational:");
            console.log("   📚 Extended Memory → searchable raw chat history");
            console.log("   📋 Batch Summaries → AI-generated technical insights");
            console.log("   🎯 Project Summaries → high-level strategic overviews");
            console.log("   🧠 Primary Memory → canonical entities and relationships");
            
            return report;
            
        } catch (error) {
            console.error("❌ Memory scribe summarization failed:", error);
            throw error;
        } finally {
            await this.driver.close();
        }
    }
}

// Run if called directly
if (require.main === module) {
    const scribe = new MemoryScribeSummarizer();
    scribe.processAll().catch(console.error);
}

module.exports = MemoryScribeSummarizer;
