
# Memory MCP – Schema (Neo4j + SQLite)

## Neo4j Node Types

- **Evidence**
- **Note (Canonical)**
- **Todo**
- **Plan**
- **CodeSymbol**
- **File**
- **Protocol**

## Relationships

- (Evidence)-[:SUMMARIZED_BY]->(Note)
- (Note)-[:CITES]->(Evidence)
- (Todo)-[:IMPLEMENTED_BY]->(CodeSymbol)
- (CodeSymbol)-[:DEFINED_IN]->(File)
- (Evidence)-[:MENTIONS]->(CodeSymbol)
- (Plan)-[:MATERIALIZED_AS]->(Todo)
- (Todo)-[:BLOCKED_BY]->(Todo)
- (Any)-[:FOLLOWS_PROTOCOL]->(Protocol)

## SQLite Tables

- `evidence(id, topic_key, source, span_ref, text, created_at, quality, simhash)`
- `notes(id, topic_key, title, body, updated_at, freshness, confidence)`
- `todos(id, topic_key, text, status, priority, due, source_ids, created_at, updated_at)`
- `plans(id, topic_key, title, steps_json, created_at, updated_at)`
- `code_index(id, project, file, line_start, line_end, kind, name, signature, refs, doc)`
- `code_index_fts(name, signature, doc)` (FTS5 virtual table)
