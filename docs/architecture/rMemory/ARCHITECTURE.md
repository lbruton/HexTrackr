
# Memory MCP – Architecture Overview

This document summarizes the target architecture for the Memory MCP project.

## Key Concepts

- **Evidence**: Raw spans from chat logs or inputs.
- **Canonical Notes**: Summarized, reconciled notes with citations back to evidence.
- **Todos**: Actionable items linked to projects or plans.
- **Plans**: Sequential Thinking outputs, structured steps before expensive operations.
- **Code Symbols**: Functions, classes, variables, objects extracted from project code.
- **Protocols**: Ranked rules (backup-before-write, plan-before-expensive, etc.) applied dynamically.

## Data Stores

- **Neo4j**: Knowledge graph for relationships and entity navigation.
- **SQLite/Turso**: Fast full-text search index for evidence, notes, and code symbols.

## Pipelines

1. Ingest → Evidence nodes
2. Reconcile → Canonical Notes with citations
3. Planner → Generate Plans → Todos
4. Indexers → CodeSymbol extraction (JS/TS + Python)
5. Classification → Entities, Intents, Confidentiality
6. Protocol Enforcement → Backup, Plan-first, Summarize, Throttle
7. Retrieval → Memory & Code search tools

## Retrieval Methods (MCP)

- `memory.search`
- `memory.get_full`
- `code.search`
- `scribe.report`
