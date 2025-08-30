# HexTrackr Memory System Architecture

## Overview

The HexTrackr Memory System is a centralized Evidence → Canonical Notes → Todos pipeline built on Memory Context Protocol (MCP) architecture. This system captures, classifies, and transforms development insights into actionable items across all your projects.

## Core Architecture

### Evidence → Canonical Notes → Todos Pipeline

1. **Evidence Capture**: Real-time scribes monitor VS Code chats and capture development insights
2. **Classification**: Symbol Table Processor categorizes evidence using deterministic rules + LLM backup
3. **Canonical Notes**: Evidence is processed into structured, searchable notes
4. **Todo Generation**: Actionable items are extracted and prioritized

### Technology Stack

- **Storage**: SQLite + Neo4j hybrid architecture
  - SQLite: Primary storage for evidence, notes, todos, plans
  - Neo4j: Relationship mapping and graph queries
- **Classification**: Symbol Table Processor with 15 entity types
- **LLM Integration**: qwen2.5-coder:7b via Ollama for backup classification
- **Real-time Processing**: Evidence capture from VS Code chat sessions

## Symbol Table Classification System

### Entity Types (15)

- **Code Entities**: FILE, CLASS, FUNCTION, METHOD, VAR
- **Project Entities**: TICKET, COMMIT, API, ENV
- **Knowledge Entities**: DOC, NOTE, EVIDENCE, TODO, PLAN, PROTOCOL

### Intent Types (5)

- DECISION, ACTION, QUESTION, STATUS, CONTEXT

### Confidentiality Levels (3)

- PUBLIC, INTERNAL, CONFIDENTIAL

## Component Status

### ✅ Operational Components

- **Real-time Scribe**: Captures evidence from VS Code chats
- **Symbol Table Processor**: Classifies evidence with 15 entity types
- **SQLite Backend**: Stores evidence, notes, todos, plans
- **Docker Services**: Neo4j graph database
- **Python GUI**: System monitoring and control

### ❌ Legacy Components (Deprecated)

- Memory Organizer (replaced by Symbol Table Processor)
- Old rMemory startup scripts
- Pre-symbol-table archive scripts

## Database Schema

### Evidence Table

```sql
CREATE TABLE evidence (
    id TEXT PRIMARY KEY,
    topic_key TEXT,
    source TEXT,
    span_ref TEXT,
    text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    quality REAL,
    simhash TEXT
);
```

### Notes Table

```sql
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    topic_key TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confidence REAL
);
```

### Todos Table

```sql
CREATE TABLE todos (
    id TEXT PRIMARY KEY,
    content TEXT,
    project TEXT,
    priority INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME,
    status TEXT DEFAULT 'open'
);
```

## Protocols and Rules

### Classification Protocols

- **Deterministic Rules**: Regex patterns for high-confidence classification
- **LLM Backup**: qwen2.5-coder:7b for complex cases (confidence threshold: 0.7)
- **Quality Scoring**: Evidence quality assessment for filtering

### Operating Protocols

- **backup-before-write**: Automatic git commits before file modifications
- **plan-before-expensive**: Planning phase for resource-intensive operations  
- **summarize-on-commit**: Context summarization on significant changes

## System Integration

### VS Code Integration

- Chat session monitoring via Real-time Scribe
- Evidence buffer processing every 15 minutes
- Symbol Table classification of captured content

### Cross-Project Memory

- Centralized at `/Volumes/DATA/GitHub/.rMemory/`
- Serves multiple projects from single location
- Consistent classification and storage across projects

## Performance Metrics

- **Evidence Processing**: Real-time capture with 15-minute reconciliation
- **Classification Accuracy**: Deterministic rules + LLM backup
- **Storage Efficiency**: SQLite for speed, Neo4j for relationships
- **Query Performance**: FTS5 full-text search on code index

## Maintenance and Monitoring

### System Health Monitoring

- Python GUI provides real-time status
- Component health checks (Scribe, Symbol Table, Docker)
- Evidence processing pipeline monitoring

### Data Lifecycle

- Evidence retention and archival policies
- Canonical note generation from evidence
- Todo prioritization and completion tracking

## Getting Started

1. **Start Development Environment**:

   ```bash
   cd /Volumes/DATA/GitHub/HexTrackr
   ./scripts/start-dev-env.sh
   ```

1. **Monitor System Status**:

   ```bash
   python3 .rMemory/gui/rmemory-control-center.py
   ```

1. **Check Evidence Pipeline**:
   - Evidence is automatically captured from VS Code chats
   - View evidence in GUI or query SQLite directly
   - Notes and todos are generated from evidence

## Current Status

**System Operational Level**: 95% ✅

- Real-time Scribe: ✅ Running
- Symbol Table Processor: ✅ Operational  
- Docker Services: ✅ Running
- Evidence Pipeline: ✅ Functional
- Database: ✅ Clean and ready

**Next Steps for 100% Operational**:

- Memory Organizer activation (notes generation)
- Todo pipeline completion
- Full Evidence → Notes → Todos flow validation

---

*This memory system represents your sophisticated approach to development knowledge management, transforming scattered insights into structured, actionable intelligence.*
