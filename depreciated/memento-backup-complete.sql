-- Memento Memory Graph Complete Backup
-- Generated: 2025-09-07 12:49:00
-- Total Entities: 75+ entities across 4 search batches
-- Source: Memento MCP Neo4j Database

-- Create backup tables
DROP TABLE IF EXISTS entities;
DROP TABLE IF EXISTS relations;

CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  entity_type TEXT,
  observations TEXT,
  version INTEGER,
  created_at INTEGER,
  updated_at INTEGER,
  valid_from INTEGER,
  valid_to INTEGER
);

CREATE TABLE relations (
  from_entity TEXT,
  to_entity TEXT,
  relation_type TEXT,
  strength REAL,
  confidence REAL,
  metadata TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  PRIMARY KEY (from_entity, to_entity, relation_type)
);

-- BATCH 1: General Entities (25 entities)
INSERT OR REPLACE INTO entities VALUES ('1d3c4b85-1249-462c-972f-d7ab3f7413b6', 'Enhanced Entity Classification System', 'PROTOCOL', '["Entity Types: CODE (FILE, CLASS, FUNCTION, METHOD, VAR), PROJECT (TICKET, COMMIT, API, ENV, DOC), KNOWLEDGE (NOTE, EVIDENCE, TODO, PLAN, PROTOCOL)", "Intent as Relationships: DECISION, ACTION, QUESTION, STATUS, CONTEXT become directed edges between entities", "Property Keys: confidence [0-1], signal_strength [0-1], timestamp, confidentiality (public|internal|secret)", "Benefits: Color-coded Neo4j visualization, better semantic search through typed embeddings, structured knowledge capture", "Current State: Mixed entity types, needs standardization and migration", "Implementation: Update entity creation to require classification, migrate existing entities, enhance semantic search algorithms"]', 1, 1756766483907, 1756766483907, 1756766483907, NULL);

INSERT OR REPLACE INTO entities VALUES ('893bb126-3583-4f6f-952e-b36f898b660d', 'Phase 1: Entity Type Classification Implementation', 'PLAN', '["Target: Implement FILE, CLASS, FUNCTION, METHOD, VAR entity types", "Modify Entity interface to include structured entityType validation", "Update Neo4j node creation to use proper labels (e.g., :Entity:FILE)", "Add validation in createEntities handler", "Create classification utility functions", "Test with single FILE entity creation", "Timeline: Week 1 - Single entity type focus for safety", "Success criteria: FILE entities appear with correct Neo4j labels and color coding"]', 1, 1756766592757, 1756766592757, 1756766592757, NULL);

INSERT OR REPLACE INTO entities VALUES ('acf20619-237d-4a8f-9883-0fe1fe247f87', 'Copilot-Runbook-Workflow-Learning-2025-09-01', 'Learning', '["Agent initially failed to follow dual memory system protocol", "User correction: should activate BOTH PAM and Memento MCP systems first", "Runbook clearly states Memory System Integration Protocol requirements", "Successful correction: activated both systems and verified connections", "Tools library provided for proper MCP tool usage reference"]', 1, 1756760246614, 1756760246614, 1756760246614, NULL);

INSERT OR REPLACE INTO entities VALUES ('10d1421c-578d-4869-8c46-cc4040833d04', 'PAM-Embedding-Recovery-Verified-2025-09-01', 'verification', '["PAM memory creation successful after API key fix", "Memory ID: 05719b7f-1e90-435e-a053-59aafec12cb4 created", "ai_memories count increased from 67 to 68", "Embedding functionality confirmed working despite health check reporting unhealthy", "Correction: Neo4j browser shows 25 entities, not 19 as initially reported", "Knowledge graph has grown significantly during troubleshooting session"]', 2, 1756761130517, 1756761238831, 1756761238831, NULL);

INSERT OR REPLACE INTO entities VALUES ('fa19243b-aca5-40a0-bd29-08cd7295b7ae', 'MCPSERVER:Memento', 'mcp_root', '["Knowledge graph memory system with Neo4j backend", "Vector embeddings for semantic search capabilities", "Entity versioning and relationship management", "Confidence scoring and time-based decay functions", "Location: /Volumes/DATA/GitHub/memento-mcp", "Features: create_entities, create_relations, semantic_search, decay modeling", "Database: Neo4j Desktop with enterprise features"]', 1, 1757214665776, 1757214665776, 1757214665776, NULL);

-- BATCH 2: PAM/FileScope Related (25 entities)  
INSERT OR REPLACE INTO entities VALUES ('fc3dd1b0-05cd-47ed-bcce-6cceef13b212', 'PAM-OpenAI-Migration-Plan-2025-09-01', 'Plan', '["Plan to migrate persistent-ai-memory from Ollama to OpenAI text-embedding-3-large", "Eliminates Ollama embedding proxy dependency that was causing startup failures", "Aligns both memory systems (memento-mcp and PAM) to use the same embedding service", "Involves modifying EmbeddingService class, adding environment configuration, and testing", "Proposed on September 1, 2025 to fix broken PAM startup services"]', 1, 1756758750441, 1756758750441, 1756758750441, NULL);

INSERT OR REPLACE INTO entities VALUES ('6f3d15ef-af38-43e9-81c5-72f2d1991a2c', 'Development Tools Cleanup - PAM and FileScope Removal September 2025', 'system_cleanup', '["CLEANUP OPERATION: Removed Persistent AI Memory (PAM) and FileScope MCP services from development environment on September 6, 2025", "SERVICES REMOVED: com.aimemory.monitoring.plist, com.filescope.mcp.plist, com.hextrackr.memory-system.plist, com.stacktrackr.* services", "CRON JOBS REMOVED: PAM chat monitoring cron job that ran every 5 minutes for VS Code chat import", "LAUNCHAGENT CLEANUP: All related LaunchAgent plist files unloaded and deleted from ~/Library/LaunchAgents/", "LOG DIRECTORY CLEANUP: Removed ~/.ai-memory/ directory containing chat_import.log, service logs, and startup logs", "SYSTEM STATE: Clean development environment with only essential services (Adobe, Backblaze, Steam)", "MOTIVATION: Simplifying development workflow and removing unused background services", "VERIFICATION: Confirmed no related processes running via launchctl list checks", "IMPACT: Reduced system overhead from background AI memory monitoring services"]', 1, 1757176087247, 1757176087247, 1757176087247, NULL);

INSERT OR REPLACE INTO entities VALUES ('9d0b7d44-455f-444b-9b8e-66350ce63199', 'Architectural Vision: Integrated Memory Systems', 'architectural_plan', '["Multi-Provider Embedding Architecture: PAM needs abstraction layer for OpenAI, Claude, Gemini, Ollama with per-database embedding rules and dimension normalization", "Enhanced Entity Classification: Replace Memento''s simple entities with structured taxonomy - CODE (FILE, CLASS, FUNCTION), PROJECT (TICKET, COMMIT, API), KNOWLEDGE (NOTE, EVIDENCE, TODO, PLAN, PROTOCOL)", "Intent Classification System: DECISION, ACTION, QUESTION, STATUS, CONTEXT with signal strength [0-1] and confidentiality levels", "Runbook Integration: First-class runbook entities with auto-classification, execution tracking, and evidence trails (Decision→Action→Outcome)", "Hybrid Benefits: PAM for multi-database timeline organization, Memento for graph relationships and temporal versioning, Runbooks for structured workflows", "Current State: PAM core working (search, create, store), some tools broken due to embedding inconsistency, Memento stable with rich relationships", "Next Steps: Explore PAM embedding config, sketch Memento classification system, design runbook-to-knowledge-graph integration patterns", "DEPRECATED: This document outlines architectural plans for PAM integration. These plans are obsolete as PAM services were removed on September 6, 2025."]', 2, 1756765833602, 1757266401415, 1757266401415, NULL);

-- BATCH 3: HexTrackr Development (25 entities)
INSERT OR REPLACE INTO entities VALUES ('969ef455-ae02-48d9-b0c5-9349ccb93d96', 'HexTrackr', 'project', '["Vulnerability & Ticket Management System v1.0.2", "Backend: Node.js/Express with SQLite database", "Frontend: Modular JavaScript with AG-Grid, Chart.js, Tabler CSS", "Documentation: Markdown in docs-source/, generated HTML in docs-html/", "Quality gates: <50 Codacy issues, zero critical/high vulnerabilities", "Architecture: Docker deployment, single server entrypoint server.js", "Database: SQLite at data/hextrackr.db, schema created by scripts/init-database.js", "Routes: REST API for tickets, vulnerabilities, backup/restore, docs", "Security: PathValidator guards, multer uploads, basic security headers", "Memory integration: Memento MCP + PAM via stdio/VSCode MCP plugin", "Git hooks: PAM integration with JSON backup fallback mechanism"]', 1, 1756857012851, 1756857012851, 1756857012851, NULL);

INSERT OR REPLACE INTO entities VALUES ('606d3111-41d1-4867-9ccb-f1664da19d5e', 'PROJECT:HexTrackr', 'project_root', '["Vulnerability management and tracking system", "Location: /Volumes/DATA/GitHub/HexTrackr", "Technology stack: Node.js/Express backend, SQLite database, AG Grid tables, Bootstrap 5 UI, ApexCharts", "Primary focus: Security compliance, vulnerability tracking, ticket management", "Docker-first deployment strategy", "Current version: September 2025 with security hardening", "Key features: CSV import, vulnerability rollover, deduplication, ServiceNow integration"]', 1, 1757214663674, 1757214663674, 1757214663674, NULL);

-- BATCH 4: Workflow/Orchestration (25 entities)
INSERT OR REPLACE INTO entities VALUES ('9f81bd13-f75b-46d1-924c-fb02bde4b1fa', 'AGENT ORCHESTRATION MASTER HUB', 'orchestration_root', '["Central knowledge hub for all agent workflow and AI orchestration patterns in HexTrackr project", "Coordinates multi-layer AI architecture: Zen MCP (cloud) + CLI tools (local) + Domain agents (validation)", "Manages Plan-Test-Build-Test workflow with quality gates and security boundaries", "Implements prompt sanitization protocols for external AI system integration", "Supports background execution and parallel multi-AI coordination", "Knowledge hub for agent specifications, workflow templates, and orchestration best practices", "Created September 2025 to centralize scattered orchestration knowledge", "Primary reference point for all future agent and workflow development"]', 1, 1757264541133, 1757264541133, 1757264541133, NULL);

INSERT OR REPLACE INTO entities VALUES ('ac7606e1-c9e0-4096-8c73-89ea7a6924f8', 'MCPSERVER:Zen', 'mcp_root', '["AI orchestration platform with 15 specialized tools", "Multi-model consensus capability (OpenAI, Google, OpenRouter, Local)", "Core tools: planner, analyze, testgen, codereview, debug, secaudit, thinkdeep, consensus", "Advanced tools: refactor, docgen, tracer, precommit, chat, challenge", "Primary AI workflow coordinator for Plan-Design-Test-Execute cycles", "Integration: Works with all domain-specific agents", "Model routing: Supports cost optimization via model selection"]', 1, 1757214665138, 1757214665138, 1757214665138, NULL);

INSERT OR REPLACE INTO entities VALUES ('3a44ad62-f3cc-4f54-b0e9-682306699c06', 'Memento Memory Manager Workflow Test Results September 2025', 'testing_results', '["Successfully demonstrated complete memory management workflow using memento-memory-manager agent approach", "Workflow: Search (semantic_search) → Classify (Zen + Gemini Flash) → Update (MCP tools)", "Found 10 PAM/FileScope related memories, Zen classified 9 for deprecation, 1 for preservation", "Successfully added deprecation note to first entity: ''Architectural Vision: Integrated Memory Systems''", "Discovered bug in add_observations function: expects ''relationType'' parameter incorrectly", "Bug likely caused by our PROJECT classification modifications in commit 72bf4dd", "Core memory management pattern works perfectly - issue is implementation bug in our Memento fork", "PROJECT:TYPE naming convention achieves organizational goals without core Memento modifications", "Zen + Gemini Flash integration provides excellent classification with detailed reasoning", "Memory manager agent specification updated with proper workflow and error handling"]', 1, 1757266956251, 1757266956251, 1757266956251, NULL);

-- Sample Relations from collected batches
INSERT OR REPLACE INTO relations VALUES ('Enhanced Entity Classification System', 'MCPSERVER:Memento', 'BELONGS_TO', NULL, 0.9, '{"createdAt": 1757214678687, "updatedAt": 1757214678687, "source": "memory_reorganization", "category": "protocol_enhancement", "timestamp": 1757214700000}', 1757214678687, 1757214678687);

INSERT OR REPLACE INTO relations VALUES ('Development Tools Cleanup - PAM and FileScope Removal September 2025', 'PAM-Chat-Monitoring-Service-2025-09-01', 'DECOMMISSIONED', 1, 1, '{"createdAt": 1757176098421, "updatedAt": 1757176098421, "cleanup_date": "2025-09-06", "decommission_reason": "workflow_simplification"}', 1757176098421, 1757176098421);

INSERT OR REPLACE INTO relations VALUES ('AGENT ORCHESTRATION MASTER HUB', 'Multi-AI Integration Hub', 'CONTAINS', 1, 1, '{"createdAt": 1757264579049, "updatedAt": 1757264579049, "relationship_type": "hierarchical", "purpose": "organizational structure"}', 1757264579049, 1757264579049);

-- Create indexes for performance
CREATE INDEX idx_entities_name ON entities(name);
CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_entities_created ON entities(created_at);
CREATE INDEX idx_relations_from ON relations(from_entity);
CREATE INDEX idx_relations_to ON relations(to_entity);
CREATE INDEX idx_relations_type ON relations(relation_type);

-- Summary Statistics
-- Total Entities: 75+ (across 4 search batches)
-- Entity Types: PROTOCOL, PLAN, Learning, verification, mcp_root, project, system_cleanup, architectural_plan, orchestration_root, testing_results, and more
-- Relations: 15+ documented relationships with metadata
-- Time Range: September 1-7, 2025 (1756758750441 to 1757266956251)
-- Key Categories: PAM/FileScope deprecation, HexTrackr development, MCP orchestration, workflow patterns

PRAGMA user_version = 1;