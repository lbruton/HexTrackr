# Protocol: Documentation Structure & Organization

**Version:** 1.0  
**Date:** August 19, 2025  
**Status:** ACTIVE  
**Priority:** HIGH  

## Overview

This protocol establishes the definitive structure for documentation organization within the StackTrackr/rEngine ecosystem. It defines directory purposes, file naming conventions, and indexing requirements to ensure consistent documentation management across all AI agents and human contributors.

## Directory Structure

### **rEngine Platform Architecture**

- **Scope:** Everything above `/rProjects/` directory constitutes the rEngine platform
- **Components:** Core system, agents, memory, protocols, documentation, and platform services
- **Purpose:** Provides the foundational AI orchestration infrastructure

### **Project Organization**

- **`/rProjects/`** - Project Container Directory
  - **Purpose:** Houses individual project subfolders
  - **Structure:** Each project gets its own subdirectory within `/rProjects/`
  - **Isolation:** Projects are separated but leverage shared rEngine infrastructure
  - **Access Pattern:** Project-specific documentation and resources contained within each subfolder

### `/rDocuments/html/` - Dashboard & Interactive Documentation

- **Purpose:** HTML files for web-based dashboards and interactive documentation
- **Primary Files:**
  - `developmentstatus.html` - Main development dashboard
  - `documentation.html` - Documentation navigation hub
  - `*.html` - Other dashboard and interface files
- **Index File:** `documents.json` (until SQLite migration)
- **Access Pattern:** Direct web browser access, linked from main dashboard

### `/docs/` - Technical Documentation Repository  

- **Purpose:** Comprehensive technical documentation in Markdown format
- **Structure:**
  - `MASTER_ROADMAP.md` - Strategic project roadmap
  - `PROJECT_STRUCTURE.md` - Codebase organization
  - `generated/` - AI-generated documentation (from document sweeps)
  - `*.md` - Manual technical documentation
- **Index File:** `index.json` (for AI agent navigation)
- **Access Pattern:** Direct file reading, MCP memory system integration

### `/rProtocols/` - Operational Procedures

- **Purpose:** Standard operating procedures for AI agents and humans
- **Files:** `*_protocol.md` naming convention
- **Index File:** `README.md` (current implementation)
- **Access Pattern:** Reference during agent initialization and operations

### `/rPrompts/` - AI Agent Prompt Library

- **Purpose:** Transparency repository for all AI prompts used by rEngine agents
- **Files:** `*.prompt.md` naming convention
- **Index File:** `README.md` (explains prompt usage and standards)
- **Access Pattern:** Public reference for customers, developers, and auditing
- **Transparency:** Full visibility into AI agent instructions and decision-making

## Index System Requirements

### For AI Agents (Pre-SQLite)

Until PROJECT-003 SQLite migration is complete, the following JSON index files are required:

#### `/rDocuments/html/documents.json`

```json
{
  "version": "1.0",
  "last_updated": "2025-08-19T00:00:00Z",
  "purpose": "HTML dashboard and interactive documentation index",
  "files": {
    "developmentstatus.html": {
      "title": "rEngine Platform Development Status",
      "description": "Main development dashboard showing platform services and current status",
      "type": "dashboard",
      "last_modified": "2025-08-19",
      "dependencies": ["documentation.html"]
    }
  }
}
```

#### `/docs/index.json`

```json
{
  "version": "1.0",
  "last_updated": "2025-08-19T00:00:00Z",
  "purpose": "Technical documentation navigation index",
  "categories": {
    "strategic": ["MASTER_ROADMAP.md"],
    "architecture": ["PROJECT_STRUCTURE.md"],
    "generated": ["generated/*.md"],
    "protocols": ["../rProtocols/*.md"]
  }
}
```

## Agent Memory Integration

### Current Implementation (JSON-Based)

- AI agents MUST read index files before accessing documentation
- Index files serve as navigation aids until SQLite migration
- Memory system should cache index contents for session persistence

### Post-SQLite Implementation (Database-Based)

- Documentation metadata stored in SQLite with FTS5 indexing
- Real-time documentation discovery and categorization
- Semantic search across all documentation types

## Protocol Compliance

### For AI Agents

1. **MUST** check index files before documentation operations
2. **MUST** update index files when creating new documentation
3. **MUST** follow directory structure for new file placement
4. **SHOULD** reference this protocol during startup (quick-start.sh)

### For Human Contributors

1. **MUST** place files in correct directories based on purpose
2. **SHOULD** update index files when adding new documentation
3. **MUST** follow naming conventions for protocol files

## Integration with Prime Directives

This protocol is referenced in `quick-start.sh` as part of the agent initialization sequence:

```bash

# Documentation Structure Protocol Check

echo "📋 Documentation Protocol: rDocuments/html/ (dashboards), docs/ (technical), rProtocols/ (procedures)"
echo "📋 Index System: documents.json (rDocuments/html/), index.json (docs) until SQLite migration"
```

## Future Roadmap

- **Aug 25-27, 2025:** SQLite migration replaces JSON index system
- **Sep 2025:** Enhanced semantic search and categorization
- **Q4 2025:** Cross-project documentation standardization (rEngine Platform Release)

## Related Protocols

- [`document_sweep_protocol.md`](document_sweep_protocol.md) - Automated documentation generation
- [`memory_management_protocol.md`](memory_management_protocol.md) - Memory system integration
- [`patch_note_protocol.md`](patch_note_protocol.md) - Version documentation

---

**Compliance Note:** This protocol is mandatory for all AI agents. Non-compliance may result in documentation fragmentation and reduced system effectiveness.
