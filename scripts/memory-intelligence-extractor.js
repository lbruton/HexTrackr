/**
 * Memory Intelligence Extractor
 * 
 * Analyzes PAM memories using Gemini 1.5 Pro to extract essential project DNA
 * for Memento knowledge graph construction. Focus on architecture, relationships,
 * and permanent knowledge rather than conversational context.
 * 
 * Usage: node scripts/memory-intelligence-extractor.js
 * @eslint-env node
 */

// Will be used for file operations once implemented
// const fs = require("fs").promises;
// const path = require("path");

// Gemini Analysis Prompts
const GEMINI_ANALYSIS_PROMPTS = {
  
  /**
   * Primary Project DNA Extraction Prompt
   * Focus: Architecture, relationships, critical decisions
   */
  projectDNA: `
You are analyzing development conversation memories to extract essential project knowledge for a knowledge graph.

Extract ONLY permanent, architectural knowledge - ignore conversational context.

For each memory batch, identify:

## 🏗️ CODE ARCHITECTURE
- File dependencies (server.js imports what, calls what functions)
- Function relationships (mapVulnerabilityRow calls processVulnerabilityRows)
- Data flow patterns (CSV → parsing → database → UI)
- Configuration dependencies (Docker, environment variables)

## 📋 CRITICAL DECISIONS  
- Technical choices with lasting impact (SQLite vs PostgreSQL)
- Architecture decisions (microservices, containerization)
- Security implementations (Codacy integration, input validation)
- Performance optimizations (database schema changes)

## 🔧 ESTABLISHED PATTERNS
- Development workflows (Codacy before/after edits)
- Error handling patterns (try/catch, validation)
- Testing approaches (Playwright automation)
- Deployment procedures (Docker compose, environment setup)

## 🚨 CRITICAL KNOWLEDGE
- Security vulnerabilities and fixes
- Breaking changes and migration paths
- Performance bottlenecks and solutions
- Compliance requirements (work standards, quality gates)

## 🔗 RELATIONSHIP MAPPING
For each identified entity, suggest semantic relationships:
- IMPLEMENTS (file implements functionality)
- DEPENDS_ON (service depends on database)
- CREATES (process creates output)
- MANAGES (system manages component)
- RESOLVES (fix resolves issue)
- DECISION (meeting led to choice)
- CAUSED_BY (problem caused by change)

OUTPUT FORMAT:
{
  "entities": [
    {
      "name": "Entity Name",
      "type": "file|function|decision|pattern|system",
      "description": "Brief description",
      "observations": ["Key facts about this entity"],
      "confidence": 0.0-1.0,
      "importance": 1-10
    }
  ],
  "relationships": [
    {
      "from": "Source Entity",
      "to": "Target Entity", 
      "type": "SEMANTIC_RELATIONSHIP_TYPE",
      "description": "Why this relationship exists",
      "strength": 0.0-1.0,
      "confidence": 0.0-1.0
    }
  ],
  "patterns": [
    {
      "name": "Pattern Name",
      "description": "Reusable pattern description",
      "applications": ["Where this pattern is used"],
      "importance": 1-10
    }
  ]
}

IGNORE:
- Temporary status updates
- Pure conversational exchanges  
- One-time debugging (unless reveals pattern)
- Personal preferences (unless project standard)

FOCUS ON PERMANENT KNOWLEDGE THAT FUTURE DEVELOPERS NEED TO UNDERSTAND THE SYSTEM.
`,

  /**
   * File System Architecture Analysis
   * Focus: Code dependencies and relationships
   */
  fileSystemDNA: `
Analyze development memories specifically for FILE SYSTEM ARCHITECTURE.

Extract:

## 📁 FILE RELATIONSHIPS
- Which files import/require other files
- Configuration file dependencies
- Static asset relationships
- Database schema connections

## 🔧 FUNCTION CALL GRAPHS
- Function definitions and their callers
- API endpoint implementations
- Data processing pipelines
- Event handlers and triggers

## 📊 DATA FLOW PATTERNS
- Input → Processing → Output chains
- Database read/write patterns
- API request/response flows
- File upload/download processes

OUTPUT: Focus on creating a complete dependency map of the codebase.
`,

  /**
   * Decision History Analysis
   * Focus: Critical architectural and technical decisions
   */
  decisionHistory: `
Analyze memories for CRITICAL DECISIONS that shaped the project.

Extract:

## 🎯 ARCHITECTURAL DECISIONS
- Technology stack choices (Node.js, SQLite, Docker)
- Framework selections (Express, Tabler, AG-Grid)
- Design pattern implementations (MVC, API structure)

## 🛡️ SECURITY DECISIONS
- Authentication/authorization approaches
- Input validation strategies
- Data protection implementations
- Compliance requirement implementations

## ⚡ PERFORMANCE DECISIONS
- Database optimization choices
- Caching strategies
- Loading pattern optimizations
- Scalability approaches

OUTPUT: Focus on WHY decisions were made and their lasting impact.
`,

  /**
   * Problem-Solution Pattern Analysis
   * Focus: Reusable solutions and debugging patterns
   */
  problemSolutionDNA: `
Analyze memories for PROBLEM-SOLUTION PATTERNS that can prevent future issues.

Extract:

## 🚨 CRITICAL ISSUES & FIXES
- Security vulnerabilities and remediation
- Performance bottlenecks and optimizations
- Integration challenges and solutions
- Data corruption/recovery procedures

## 🔄 RECURRING PATTERNS
- Common error types and fixes
- Debugging approaches that work
- Testing strategies that catch issues
- Prevention mechanisms

## 📋 ESTABLISHED WORKFLOWS
- Code review processes
- Quality assurance procedures
- Deployment verification steps
- Rollback procedures

OUTPUT: Focus on creating a knowledge base of "How to solve X when it happens again"
`
};

// Semantic Relationship Type Mappings
const RELATIONSHIP_MAPPINGS = {
  // Code Architecture
  "imports": "DEPENDS_ON",
  "calls": "INVOKES", 
  "extends": "INHERITS_FROM",
  "implements": "IMPLEMENTS",
  "configures": "CONFIGURES",
  
  // System Architecture  
  "uses service": "USES",
  "manages": "MANAGES",
  "creates": "CREATES",
  "processes": "PROCESSES",
  "stores data in": "STORES_IN",
  
  // Decision Relationships
  "decided to use": "DECISION_TO_USE",
  "replaced": "REPLACES",
  "solved by": "RESOLVED_BY",
  "caused by": "CAUSED_BY",
  "led to": "RESULTED_IN",
  
  // Temporal Relationships
  "built on": "BUILDS_ON",
  "evolved from": "EVOLVED_FROM",
  "version of": "VERSION_OF",
  "supersedes": "SUPERSEDES"
};

// Entity Type Classifications
const ENTITY_TYPES = {
  file: ["server.js", "package.json", ".js", ".html", ".css", ".md"],
  function: ["function", "method", "endpoint", "api", "route"],
  system: ["database", "docker", "service", "server", "container"],
  decision: ["decided", "chose", "selected", "implemented", "adopted"],
  pattern: ["workflow", "process", "procedure", "approach", "strategy"],
  security: ["vulnerability", "fix", "patch", "security", "validation"],
  performance: ["optimization", "bottleneck", "improvement", "scaling"]
};

/**
 * Memory Analysis Configuration
 */
const ANALYSIS_CONFIG = {
  // Batch size for Gemini processing (avoid context limits)
  batchSize: 10,
  
  // Minimum importance level for analysis
  minImportance: 6,
  
  // Memory types to analyze (focus on architectural content)
  targetMemoryTypes: [
    "architectural-decision",
    "technical-solution", 
    "security-issue",
    "performance-optimization",
    "development-pattern",
    "critical-issue",
    "breakthrough-success"
  ],
  
  // Confidence thresholds for Memento creation
  minConfidence: 0.7,
  minImportanceForMemento: 7,
  
  // Relationship strength calculations
  relationshipStrength: {
    direct_dependency: 0.9,
    architectural_decision: 0.8,
    problem_solution: 0.7,
    workflow_pattern: 0.6,
    contextual: 0.5
  }
};

/**
 * Main extraction workflow
 */
async function extractProjectDNA() {
  console.log("🧠 Memory Intelligence Extractor Starting...");
  
  // This will be implemented once PAM system is restored
  console.log("⏳ Waiting for PAM system restoration...");
  console.log("📋 Analysis prompts ready for Gemini 1.5 Pro");
  console.log("🎯 Target: Essential project DNA for Memento knowledge graph");
  
  // Placeholder for future implementation
  return {
    status: "ready",
    prompts: GEMINI_ANALYSIS_PROMPTS,
    config: ANALYSIS_CONFIG,
    relationshipMappings: RELATIONSHIP_MAPPINGS,
    entityTypes: ENTITY_TYPES
  };
}

/**
 * Utility: Format memories for Gemini analysis
 */
function formatMemoriesForAnalysis(memories, analysisType = "projectDNA") {
  const prompt = GEMINI_ANALYSIS_PROMPTS[analysisType];
  const memoryContent = memories.map(memory => 
    `MEMORY: ${memory.content}\nTYPE: ${memory.memory_type}\nIMPORTANCE: ${memory.importance_level}\n---`
  ).join("\n");
  
  return `${prompt}\n\nANALYZE THESE MEMORIES:\n${memoryContent}`;
}

/**
 * Utility: Convert Gemini output to Memento entities
 */
function convertToMementoFormat(geminiOutput) {
  // This will process Gemini's JSON response and format for Memento MCP
  return {
    entities: geminiOutput.entities.filter(e => e.confidence >= ANALYSIS_CONFIG.minConfidence),
    relationships: geminiOutput.relationships.filter(r => r.confidence >= ANALYSIS_CONFIG.minConfidence),
    patterns: geminiOutput.patterns.filter(p => p.importance >= ANALYSIS_CONFIG.minImportanceForMemento)
  };
}

// Export for use once PAM system is restored
module.exports = {
  extractProjectDNA,
  formatMemoriesForAnalysis,
  convertToMementoFormat,
  GEMINI_ANALYSIS_PROMPTS,
  ANALYSIS_CONFIG,
  RELATIONSHIP_MAPPINGS,
  ENTITY_TYPES
};

// CLI execution
if (require.main === module) {
  extractProjectDNA()
    .then(_result => {
      console.log("✅ Memory Intelligence Extractor Ready");
      console.log("📊 Configuration loaded and prompts prepared");
      console.log("🚀 Ready to process PAM memories once system is restored");
    })
    .catch(error => {
      console.error("❌ Error:", error.message);
      process.exit(1);
    });
}
