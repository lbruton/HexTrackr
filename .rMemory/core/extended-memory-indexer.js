#!/usr/bin/env node
/**
 * Extended Memory Neo4j Indexer
 * Takes extracted chat sessions and creates searchable extended-memory nodes in Neo4j
 * Implements multi-tier architecture: raw chat → summaries → relationships
 */

/* eslint-env node */
/* eslint no-undef: "off" */
/* eslint no-console: "off" */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const neo4j = require("neo4j-driver");

class ExtendedMemoryIndexer {
    constructor() {
        this.projectRoot = process.cwd();
        this.memoryDir = path.join(this.projectRoot, ".rMemory");
        this.extendedLogFile = path.join(this.memoryDir, "json", "extended-log.json");
        
        // Neo4j configuration
        this.driver = neo4j.driver(
            process.env.NEO4J_URI || "bolt://localhost:7687",
            neo4j.auth.basic(
                process.env.NEO4J_USERNAME || "neo4j",
                process.env.NEO4J_PASSWORD || "password"
            )
        );
        
        this.extendedMemoryData = null;
        this.indexedCount = 0;
    }

    async loadExtendedMemory() {
        console.log("📂 Loading extended memory data...");
        
        if (!fs.existsSync(this.extendedLogFile)) {
            throw new Error(`Extended memory file not found: ${this.extendedLogFile}`);
        }
        
        const rawData = fs.readFileSync(this.extendedLogFile, "utf8");
        this.extendedMemoryData = JSON.parse(rawData);
        
        console.log(`   ✅ Loaded ${this.extendedMemoryData.entries.length} extended memory entries`);
        console.log(`   📊 Total size: ${(rawData.length / 1024).toFixed(1)}KB`);
        
        return this.extendedMemoryData;
    }

    async setupDatabase() {
        console.log("🗄️  Setting up Neo4j extended memory schema...");
        
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            // Create constraints and indexes for extended memory
            const queries = [
                // Extended memory node constraint
                `CREATE CONSTRAINT extended_memory_id IF NOT EXISTS 
                 FOR (em:ExtendedMemory) REQUIRE em.id IS UNIQUE`,
                
                // Indexes for fast searching
                `CREATE INDEX extended_memory_timestamp IF NOT EXISTS 
                 FOR (em:ExtendedMemory) ON (em.timestamp)`,
                
                `CREATE INDEX extended_memory_project IF NOT EXISTS 
                 FOR (em:ExtendedMemory) ON (em.projectContext)`,
                
                `CREATE INDEX extended_memory_type IF NOT EXISTS 
                 FOR (em:ExtendedMemory) ON (em.messageType)`,
                
                `CREATE INDEX extended_memory_importance IF NOT EXISTS 
                 FOR (em:ExtendedMemory) ON (em.importance)`,
                
                // Full-text search index for content
                `CALL db.index.fulltext.createNodeIndex("extendedMemoryFullText", 
                 ["ExtendedMemory"], ["searchableText", "semanticKeywords"]) IF NOT EXISTS`,
                
                // Summary node constraint (for future summaries)
                `CREATE CONSTRAINT summary_id IF NOT EXISTS 
                 FOR (s:Summary) REQUIRE s.id IS UNIQUE`
            ];
            
            for (const query of queries) {
                try {
                    await session.run(query);
                    console.log(`   ✅ ${query.split("\n")[0].trim()}`);
                } catch (error) {
                    if (!error.message.includes("already exists") && !error.message.includes("equivalent")) {
                        console.warn(`   ⚠️  ${query.split("\n")[0].trim()}: ${error.message}`);
                    }
                }
            }
            
        } finally {
            await session.close();
        }
    }

    async indexExtendedMemoryEntry(entry) {
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            // Create extended memory node with all searchable properties
            const result = await session.run(`
                MERGE (em:ExtendedMemory {id: $id})
                SET em.timestamp = $timestamp,
                    em.source = $source,
                    em.projectContext = $projectContext,
                    em.messageType = $messageType,
                    em.importance = $importance,
                    em.semanticKeywords = $semanticKeywords,
                    em.searchableText = $searchableText,
                    em.timeOfDay = $timeOfDay,
                    em.dayOfWeek = $dayOfWeek,
                    em.rawData = $rawData,
                    em.metadata = $metadata,
                    em.indexedAt = datetime(),
                    em.version = "1.0"
                RETURN em.id as id
            `, {
                id: entry.id,
                timestamp: entry.timestamp,
                source: entry.source,
                projectContext: entry.projectContext,
                messageType: entry.messageType,
                importance: neo4j.int(entry.importance),
                semanticKeywords: entry.semanticKeywords,
                searchableText: entry.searchableText,
                timeOfDay: neo4j.int(entry.timeOfDay),
                dayOfWeek: neo4j.int(entry.dayOfWeek),
                rawData: JSON.stringify(entry.rawData),
                metadata: JSON.stringify(entry.metadata)
            });
            
            return result.records[0]?.get("id");
            
        } finally {
            await session.close();
        }
    }

    async createProjectRelationships() {
        console.log("🔗 Creating project relationships...");
        
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            // Link to existing entities in primary memory based on project context
            await session.run(`
                MATCH (em:ExtendedMemory)
                MATCH (entity:Entity)
                WHERE em.projectContext = entity.project OR 
                      ANY(keyword IN em.semanticKeywords WHERE keyword IN entity.tags)
                MERGE (em)-[:RELATES_TO]->(entity)
            `);
            
            // Group extended memories by project
            await session.run(`
                MATCH (em1:ExtendedMemory), (em2:ExtendedMemory)
                WHERE em1.projectContext = em2.projectContext 
                  AND em1.id < em2.id
                  AND datetime(em1.timestamp) > datetime() - duration("P7D")
                  AND datetime(em2.timestamp) > datetime() - duration("P7D")
                MERGE (em1)-[:SAME_PROJECT]->(em2)
            `);
            
            // Connect temporally adjacent memories
            await session.run(`
                MATCH (em1:ExtendedMemory), (em2:ExtendedMemory)
                WHERE datetime(em1.timestamp) < datetime(em2.timestamp)
                  AND duration.between(datetime(em1.timestamp), datetime(em2.timestamp)).minutes < 30
                  AND em1.projectContext = em2.projectContext
                MERGE (em1)-[:PRECEDED_BY]->(em2)
            `);
            
            console.log("   ✅ Project relationships created");
            
        } finally {
            await session.close();
        }
    }

    async generateSearchCapabilities() {
        console.log("🔍 Setting up search capabilities...");
        
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            // Create semantic search helper function
            await session.run(`
                // This will be used by memory scribes for intelligent searching
                CALL {
                    MATCH (em:ExtendedMemory)
                    WHERE em.importance >= 3 OR em.messageType IN ["bug_fix", "feature_development"]
                    RETURN count(em) as highImportanceCount
                }
                CALL {
                    MATCH (em:ExtendedMemory)
                    WHERE em.projectContext = "HexTrackr"
                    RETURN count(em) as hexTrackrCount  
                }
                CALL {
                    MATCH (em:ExtendedMemory)
                    WHERE datetime(em.timestamp) > datetime() - duration("P7D")
                    RETURN count(em) as recentCount
                }
                RETURN highImportanceCount, hexTrackrCount, recentCount
            `);
            
            console.log("   ✅ Search capabilities configured");
            
        } finally {
            await session.close();
        }
    }

    async generateIndexReport() {
        console.log("\n📊 Extended Memory Index Report");
        console.log("=" .repeat(50));
        
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            // Count by project
            const projectStats = await session.run(`
                MATCH (em:ExtendedMemory)
                RETURN em.projectContext as project, count(em) as count
                ORDER BY count DESC
            `);
            
            console.log("🎯 Project Distribution:");
            projectStats.records.forEach(record => {
                console.log(`   ${record.get("project")}: ${record.get("count").toNumber()}`);
            });
            
            // Count by message type
            const typeStats = await session.run(`
                MATCH (em:ExtendedMemory)
                RETURN em.messageType as type, count(em) as count
                ORDER BY count DESC
            `);
            
            console.log("\n📝 Message Types:");
            typeStats.records.forEach(record => {
                console.log(`   ${record.get("type")}: ${record.get("count").toNumber()}`);
            });
            
            // Count by importance
            const importanceStats = await session.run(`
                MATCH (em:ExtendedMemory)
                RETURN em.importance as importance, count(em) as count
                ORDER BY importance DESC
            `);
            
            console.log("\n⭐ Importance Levels:");
            importanceStats.records.forEach(record => {
                console.log(`   Level ${record.get("importance").toNumber()}: ${record.get("count").toNumber()}`);
            });
            
            // Total relationships
            const relationshipStats = await session.run(`
                MATCH (em:ExtendedMemory)-[r]-()
                RETURN type(r) as relType, count(r) as count
                ORDER BY count DESC
            `);
            
            console.log("\n🔗 Relationships:");
            relationshipStats.records.forEach(record => {
                console.log(`   ${record.get("relType")}: ${record.get("count").toNumber()}`);
            });
            
            // Total indexed
            const totalResult = await session.run(`
                MATCH (em:ExtendedMemory)
                RETURN count(em) as total
            `);
            
            const total = totalResult.records[0].get("total").toNumber();
            console.log(`\n📈 Total Extended Memory Nodes: ${total}`);
            
            return {
                totalNodes: total,
                projectStats: projectStats.records.map(r => ({
                    project: r.get("project"),
                    count: r.get("count").toNumber()
                })),
                typeStats: typeStats.records.map(r => ({
                    type: r.get("type"),
                    count: r.get("count").toNumber()
                }))
            };
            
        } finally {
            await session.close();
        }
    }

    async indexAll() {
        console.log("🚀 Starting Extended Memory Indexing...");
        
        try {
            // Load extended memory data
            await this.loadExtendedMemory();
            
            // Setup database schema
            await this.setupDatabase();
            
            // Index each entry
            console.log("💾 Indexing extended memory entries...");
            
            for (let i = 0; i < this.extendedMemoryData.entries.length; i++) {
                const entry = this.extendedMemoryData.entries[i];
                
                try {
                    await this.indexExtendedMemoryEntry(entry);
                    this.indexedCount++;
                    
                    if (this.indexedCount % 50 === 0) {
                        console.log(`   📊 Indexed ${this.indexedCount}/${this.extendedMemoryData.entries.length} entries`);
                    }
                    
                } catch (error) {
                    console.warn(`   ⚠️  Failed to index entry ${entry.id}: ${error.message}`);
                }
            }
            
            console.log(`   ✅ Indexed ${this.indexedCount} extended memory entries`);
            
            // Create relationships
            await this.createProjectRelationships();
            
            // Setup search capabilities
            await this.generateSearchCapabilities();
            
            // Generate report
            const report = await this.generateIndexReport();
            
            console.log("\n✅ Extended Memory Indexing Complete!");
            console.log("🎯 Next steps:");
            console.log("   1. Run memory scribes to create summaries");
            console.log("   2. Test semantic search queries");
            console.log("   3. Link with primary memory entities");
            
            return report;
            
        } catch (error) {
            console.error("❌ Extended memory indexing failed:", error);
            throw error;
        } finally {
            await this.driver.close();
        }
    }

    // Example search methods for memory scribes to use
    async searchByKeywords(keywords, limit = 10) {
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            const result = await session.run(`
                CALL db.index.fulltext.queryNodes("extendedMemoryFullText", $searchQuery)
                YIELD node, score
                WHERE node.importance >= 2
                RETURN node.id as id, node.searchableText as text, score
                ORDER BY score DESC, node.importance DESC
                LIMIT $limit
            `, {
                searchQuery: keywords.join(" OR "),
                limit: neo4j.int(limit)
            });
            
            return result.records.map(record => ({
                id: record.get("id"),
                text: record.get("text"),
                score: record.get("score")
            }));
            
        } finally {
            await session.close();
        }
    }

    async getProjectContext(projectName, days = 7) {
        const session = this.driver.session({ database: "neo4j" });
        
        try {
            const result = await session.run(`
                MATCH (em:ExtendedMemory)
                WHERE em.projectContext = $project
                  AND datetime(em.timestamp) > datetime() - duration({days: $days})
                RETURN em.id as id, em.messageType as type, em.importance as importance,
                       em.timestamp as timestamp, em.searchableText as text
                ORDER BY em.importance DESC, em.timestamp DESC
                LIMIT 20
            `, {
                project: projectName,
                days: neo4j.int(days)
            });
            
            return result.records.map(record => ({
                id: record.get("id"),
                type: record.get("type"),
                importance: record.get("importance").toNumber(),
                timestamp: record.get("timestamp"),
                text: record.get("text").substring(0, 200) + "..."
            }));
            
        } finally {
            await session.close();
        }
    }
}

// Example usage and test queries
async function testSearchCapabilities() {
    console.log("\n🧪 Testing Extended Memory Search Capabilities...");
    
    const indexer = new ExtendedMemoryIndexer();
    
    try {
        // Test keyword search
        console.log("\n1. Searching for 'memory scribe' keywords:");
        const memoryResults = await indexer.searchByKeywords(["memory", "scribe"]);
        memoryResults.forEach((result, i) => {
            console.log(`   ${i + 1}. ${result.text.substring(0, 100)}... (score: ${result.score.toFixed(2)})`);
        });
        
        // Test project context
        console.log("\n2. Getting HexTrackr project context (last 7 days):");
        const projectResults = await indexer.getProjectContext("HexTrackr");
        projectResults.forEach((result, i) => {
            console.log(`   ${i + 1}. [${result.type}] ${result.text}`);
        });
        
    } finally {
        await indexer.driver.close();
    }
}

// Run if called directly
if (require.main === module) {
    const indexer = new ExtendedMemoryIndexer();
    indexer.indexAll()
        .then(() => testSearchCapabilities())
        .catch(console.error);
}

module.exports = ExtendedMemoryIndexer;
