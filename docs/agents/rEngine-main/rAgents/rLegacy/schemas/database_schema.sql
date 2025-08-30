-- StackTrackr Memory System SQLite Schema
-- Hybrid SQLite + JSON Export Architecture
-- Created: 2025-08-16 as part of database migration project

-- Enable WAL mode for concurrent reads during operations
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA foreign_keys = ON;

-- Core Memory Tables
-- ==================

-- Central memory entries table - all memory items regardless of type
CREATE TABLE memory_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memory_id TEXT UNIQUE NOT NULL,  -- UUID for each memory entry
    memory_type TEXT NOT NULL,       -- decisions, tasks, bugs, roadmap, patterns, etc.
    title TEXT NOT NULL,
    content TEXT NOT NULL,           -- JSON content of the memory item
    status TEXT NOT NULL DEFAULT 'active',
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL,        -- agent name that created this
    updated_by TEXT NOT NULL,        -- agent name that last updated
    version INTEGER DEFAULT 1,       -- version number for optimistic locking
    metadata TEXT DEFAULT '{}',      -- JSON metadata for extensibility
    tags TEXT DEFAULT '[]',          -- JSON array of tags
    UNIQUE(memory_id)
);

-- Decisions table - extends memory_entries for decision-specific fields
CREATE TABLE decisions (
    memory_id TEXT PRIMARY KEY,
    decision_type TEXT NOT NULL,     -- architecture, feature, process, etc.
    alternatives TEXT DEFAULT '[]', -- JSON array of alternatives considered
    rationale TEXT NOT NULL,
    impact_assessment TEXT,
    reviewers TEXT DEFAULT '[]',     -- JSON array of reviewing agents
    implementation_status TEXT DEFAULT 'pending',
    FOREIGN KEY (memory_id) REFERENCES memory_entries(memory_id) ON DELETE CASCADE
);

-- Tasks table - extends memory_entries for task-specific fields  
CREATE TABLE tasks (
    memory_id TEXT PRIMARY KEY,
    task_type TEXT NOT NULL,        -- feature, bugfix, research, etc.
    estimated_time TEXT,
    actual_time TEXT,
    assigned_to TEXT,               -- agent assigned to task
    dependencies TEXT DEFAULT '[]', -- JSON array of dependency task IDs
    blocks TEXT DEFAULT '[]',       -- JSON array of tasks this blocks
    files_affected TEXT DEFAULT '[]', -- JSON array of file paths
    completion_percentage INTEGER DEFAULT 0,
    deadline TIMESTAMP,
    FOREIGN KEY (memory_id) REFERENCES memory_entries(memory_id) ON DELETE CASCADE
);

-- Bugs table - extends memory_entries for bug-specific fields
CREATE TABLE bugs (
    memory_id TEXT PRIMARY KEY,
    bug_type TEXT NOT NULL,         -- crash, performance, ui, logic, etc.
    severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    reproduction_steps TEXT,
    error_logs TEXT,
    environment_info TEXT DEFAULT '{}', -- JSON object with env details
    fix_description TEXT,
    test_verification TEXT,
    root_cause TEXT,
    FOREIGN KEY (memory_id) REFERENCES memory_entries(memory_id) ON DELETE CASCADE
);

-- Roadmap table - extends memory_entries for roadmap-specific fields
CREATE TABLE roadmap (
    memory_id TEXT PRIMARY KEY,
    roadmap_type TEXT NOT NULL,     -- milestone, epic, feature, etc.
    target_version TEXT,
    estimated_effort TEXT,
    business_value TEXT,
    technical_complexity TEXT,
    prerequisites TEXT DEFAULT '[]', -- JSON array of prerequisite items
    deliverables TEXT DEFAULT '[]',  -- JSON array of deliverable items
    timeline TEXT,
    FOREIGN KEY (memory_id) REFERENCES memory_entries(memory_id) ON DELETE CASCADE
);

-- Patterns table - extends memory_entries for pattern-specific fields
CREATE TABLE patterns (
    memory_id TEXT PRIMARY KEY,
    pattern_type TEXT NOT NULL,     -- architectural, code, process, etc.
    problem_statement TEXT NOT NULL,
    solution_approach TEXT NOT NULL,
    benefits TEXT DEFAULT '[]',     -- JSON array of benefits
    trade_offs TEXT DEFAULT '[]',   -- JSON array of trade-offs
    examples TEXT DEFAULT '[]',     -- JSON array of usage examples
    related_patterns TEXT DEFAULT '[]', -- JSON array of related pattern IDs
    FOREIGN KEY (memory_id) REFERENCES memory_entries(memory_id) ON DELETE CASCADE
);

-- Lease Management for Checkout/Checkin System
-- ============================================

CREATE TABLE memory_leases (
    lease_id TEXT PRIMARY KEY,      -- UUID for the lease
    memory_id TEXT NOT NULL,        -- memory item being leased
    agent_name TEXT NOT NULL,       -- agent holding the lease
    operation TEXT NOT NULL CHECK(operation IN ('read', 'write')),
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'released')),
    renewal_count INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',     -- JSON metadata for lease details
    FOREIGN KEY (memory_id) REFERENCES memory_entries(memory_id) ON DELETE CASCADE
);

-- Activity Log for Audit Trail
-- ============================

CREATE TABLE activity_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    memory_id TEXT,                 -- NULL for system-wide operations
    agent_name TEXT NOT NULL,
    operation TEXT NOT NULL,        -- create, update, delete, checkout, checkin, etc.
    operation_details TEXT DEFAULT '{}', -- JSON details of the operation
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT,                -- for grouping related operations
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    FOREIGN KEY (memory_id) REFERENCES memory_entries(memory_id) ON DELETE SET NULL
);

-- Export History for JSON Bundle Generation
-- ========================================

CREATE TABLE export_history (
    export_id TEXT PRIMARY KEY,     -- UUID for the export
    export_type TEXT NOT NULL,      -- full, delta, memory, code, markdown
    agent_requestor TEXT NOT NULL,
    export_path TEXT NOT NULL,
    bundle_size INTEGER,            -- file size in bytes
    item_count INTEGER,             -- number of items exported
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    export_metadata TEXT DEFAULT '{}', -- JSON metadata about export contents
    checksum TEXT                   -- SHA256 of export for integrity
);

-- Performance Indexes
-- ===================

-- Core query patterns
CREATE INDEX idx_memory_entries_type ON memory_entries(memory_type);
CREATE INDEX idx_memory_entries_status ON memory_entries(status);
CREATE INDEX idx_memory_entries_priority ON memory_entries(priority);
CREATE INDEX idx_memory_entries_created_by ON memory_entries(created_by);
CREATE INDEX idx_memory_entries_updated_at ON memory_entries(updated_at);
CREATE INDEX idx_memory_entries_type_status ON memory_entries(memory_type, status);

-- Lease management queries
CREATE INDEX idx_memory_leases_memory_id ON memory_leases(memory_id);
CREATE INDEX idx_memory_leases_agent ON memory_leases(agent_name);
CREATE INDEX idx_memory_leases_status ON memory_leases(status);
CREATE INDEX idx_memory_leases_expires_at ON memory_leases(expires_at);

-- Activity log queries
CREATE INDEX idx_activity_log_memory_id ON activity_log(memory_id);
CREATE INDEX idx_activity_log_agent ON activity_log(agent_name);
CREATE INDEX idx_activity_log_operation ON activity_log(operation);
CREATE INDEX idx_activity_log_timestamp ON activity_log(timestamp);

-- Task-specific indexes
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_completion ON tasks(completion_percentage);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- Bug-specific indexes
CREATE INDEX idx_bugs_severity ON bugs(severity);
CREATE INDEX idx_bugs_bug_type ON bugs(bug_type);

-- Roadmap-specific indexes
CREATE INDEX idx_roadmap_target_version ON roadmap(target_version);
CREATE INDEX idx_roadmap_type ON roadmap(roadmap_type);

-- Database Schema Version Management
-- ==================================

CREATE TABLE schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    migration_script TEXT,
    checksum TEXT
);

INSERT INTO schema_version (version, migration_script) 
VALUES (1, 'initial_schema.sql');

-- Triggers for Automatic Timestamp Updates
-- ========================================

CREATE TRIGGER update_memory_entries_timestamp 
    AFTER UPDATE ON memory_entries
BEGIN
    UPDATE memory_entries 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE memory_id = NEW.memory_id;
END;

-- Triggers for Lease Cleanup
-- ==========================

CREATE TRIGGER cleanup_expired_leases
    AFTER INSERT ON memory_leases
BEGIN
    UPDATE memory_leases 
    SET status = 'expired' 
    WHERE expires_at < CURRENT_TIMESTAMP 
    AND status = 'active';
END;

-- Views for Common Query Patterns
-- ===============================

-- Active memory items by type
CREATE VIEW active_memory_by_type AS
SELECT 
    memory_type,
    COUNT(*) as count,
    MAX(updated_at) as last_updated
FROM memory_entries 
WHERE status = 'active'
GROUP BY memory_type;

-- Current active leases
CREATE VIEW current_leases AS
SELECT 
    l.lease_id,
    l.memory_id,
    m.title as memory_title,
    m.memory_type,
    l.agent_name,
    l.operation,
    l.acquired_at,
    l.expires_at,
    (l.expires_at > CURRENT_TIMESTAMP) as is_valid
FROM memory_leases l
JOIN memory_entries m ON l.memory_id = m.memory_id
WHERE l.status = 'active';

-- Recent activity summary
CREATE VIEW recent_activity AS
SELECT 
    a.agent_name,
    a.operation,
    m.memory_type,
    m.title as memory_title,
    a.timestamp
FROM activity_log a
LEFT JOIN memory_entries m ON a.memory_id = m.memory_id
WHERE a.timestamp > datetime('now', '-1 hour')
ORDER BY a.timestamp DESC;
