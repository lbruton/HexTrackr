-- VS Code Real-time Monitoring Database
-- High-frequency capture of chat sessions, debug logs, file changes

-- Chat session events from VS Code
CREATE TABLE chat_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    speaker TEXT, -- 'user' or 'assistant'
    content TEXT,
    event_type TEXT, -- 'message', 'command', 'file_reference'
    file_path TEXT,
    line_number INTEGER,
    confidence REAL DEFAULT 0.5,
    processed BOOLEAN DEFAULT 0
);

-- File change monitoring
CREATE TABLE file_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    change_type TEXT, -- 'created', 'modified', 'deleted', 'renamed'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    size_bytes INTEGER,
    git_hash TEXT,
    processed BOOLEAN DEFAULT 0
);

-- Code symbol tracking (real-time updates)
CREATE TABLE symbol_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    symbol_name TEXT NOT NULL,
    symbol_type TEXT, -- 'function', 'class', 'variable', 'constant'
    line_start INTEGER,
    line_end INTEGER,
    signature TEXT,
    doc_comment TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    change_type TEXT, -- 'added', 'modified', 'deleted'
    processed BOOLEAN DEFAULT 0
);

-- Keywords and intent detection
CREATE TABLE intent_detection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER, -- References chat_events.id
    source_type TEXT, -- 'chat', 'comment', 'commit_message'
    detected_intent TEXT, -- 'todo', 'bug', 'feature', 'refactor', 'question'
    confidence REAL,
    keywords TEXT, -- JSON array of matched keywords
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT 0
);

-- Session boundaries and context
CREATE TABLE session_boundaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_start DATETIME,
    session_end DATETIME,
    files_touched TEXT, -- JSON array of file paths
    git_commits TEXT, -- JSON array of commit hashes
    chat_sessions TEXT, -- JSON array of chat session IDs
    processed BOOLEAN DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_chat_events_session ON chat_events(session_id);
CREATE INDEX idx_chat_events_timestamp ON chat_events(timestamp);
CREATE INDEX idx_chat_events_processed ON chat_events(processed);

CREATE INDEX idx_file_changes_path ON file_changes(file_path);
CREATE INDEX idx_file_changes_timestamp ON file_changes(timestamp);
CREATE INDEX idx_file_changes_processed ON file_changes(processed);

CREATE INDEX idx_symbol_changes_file ON symbol_changes(file_path);
CREATE INDEX idx_symbol_changes_name ON symbol_changes(symbol_name);
CREATE INDEX idx_symbol_changes_processed ON symbol_changes(processed);

CREATE INDEX idx_intent_detection_intent ON intent_detection(detected_intent);
CREATE INDEX idx_intent_detection_processed ON intent_detection(processed);
