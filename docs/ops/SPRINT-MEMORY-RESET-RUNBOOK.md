# Memory MCP Clean Start + Re-Ingest Sprint (HexTrackr)

Status: Draft
Owner: HexTrackr Dev
Last updated: 2025-08-31

## Purpose

A foolproof, repeatable runbook to wipe legacy graph noise, rebuild Memory MCP from VS Code chat logs, and restore the 3‑phase scribe pipeline (capture → classify → rolling summary) with local embeddings via Ollama.

## Scope and Assumptions

- Ollama is installed and running (you manage models; no changes here).
- Neo4j runs via dev Docker Compose locally (future: self-contained container).
- Memory system lives outside this repo; `.rMemory/` here is a symlink to the real toolkit and remains git-ignored.
- This repo must stay clean (no memory tools under `scripts/`).

## Symlink Policy

- `.rMemory` is a symlink → external toolkit directory.
- Do not commit files inside `.rMemory` from this repo.
- Any shims in this repo must be minimal and explicitly approved.

## Target Schema (Neo4j + SQLite)

Nodes: Evidence, Note (Canonical), Todo, Plan, CodeSymbol, File, Protocol, Classification

Whitelisted relationships only:

- (Evidence)-[:SUMMARIZED_BY]->(Note)
- (Note)-[:CITES]->(Evidence)
- (Todo)-[:IMPLEMENTED_BY]->(CodeSymbol)
- (CodeSymbol)-[:DEFINED_IN]->(File)
- (Plan)-[:MATERIALIZED_AS]->(Todo)
- (Evidence)-[:MENTIONS]->(CodeSymbol)
- (Any)-[:FOLLOWS_PROTOCOL]->(Protocol)
- (Any)-[:CLASSIFIED_AS]->(Classification)

## Retention

- Neo4j: keep only last 24 hours of non-category entities.
- SQLite: full history for search; scribe dedups with simhash.

## Three-Phase Scribe (Ollama-backed)

1) Capture: watch VS Code chat, write Evidence into extended + MCP.
2) Classify: deterministic rules + LLM backstop (qwen2.5-coder:7b or llama3), write Classifications.
3) Rolling Summary: every ~15 min, write concise project/topic summaries and reconcile Evidence → Canonical Notes; generate semantic keywords.

Embeddings: generated locally with `nomic-embed-text` for both search and Memento fallback.

## Clean Start Checklist (run in order)

- [ ] 0. Prep: ensure Docker (Neo4j) is up; Ollama already running
- [ ] 1. Save context snapshot (optional)
- [ ] 2. Backup SQLite: `.rMemory/sqlite/*.db` → `.rMemory/sqlite/backups`
- [ ] 3. Purge SQLite (fresh re-extraction)
- [ ] 4. Purge Neo4j legacy content (or blank reset)
- [ ] 5. Re-ingest: run existing rMemory scribes in sequence
- [ ] 6. Verify counts and relationship inventory
- [ ] 7. Start real-time scribe for ongoing sessions
- [ ] 8. Record decisions in Memento; update this checklist

## Commands (macOS)

### 0) Confirm symlink

- `ls -l .rMemory`
- `readlink .rMemory`

### 1) Save context (temporary; safe to keep outside repo)

- `TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")`
- Save to `/tmp/hextrackr-memory-context-${TS}.json` with:
  - `{ "when":"<<TS>>", "projectRoot":"<abs-path>", "neo4j":{"bolt":"bolt://localhost:7687"}, "sqlite":{"mcp":".rMemory/sqlite/memory-mcp.db","extended":".rMemory/sqlite/extended-memory.db"}, "ollama":{"chat":"qwen2.5-coder:7b","embed":"nomic-embed-text"}, "retention":"Neo4j 24h" }`
- Replace `<<TS>>` with `${TS}`.

### 2) Backup SQLite

- `mkdir -p .rMemory/sqlite/backups`
- `for f in .rMemory/sqlite/memory-mcp.db .rMemory/sqlite/extended-memory.db; do [ -f "$f" ] && cp "$f" ".rMemory/sqlite/backups/$(basename "$f").bak.${TS}"; done`
- `ls -lah .rMemory/sqlite/backups | tail -n +1`

### 3) Purge SQLite (full rebuild from chat logs)

- `rm -f .rMemory/sqlite/memory-mcp.db`
- `rm -f .rMemory/sqlite/extended-memory.db`  (remove if you want VS Code logs re-extracted)

### 4) Purge Neo4j (Browser <http://localhost:7475/browser>)

Option A — Surgical purge (keeps compliant data, removes legacy):

- `MATCH (n)-[r:SUMMARIZES]->(e) MERGE (e)-[:SUMMARIZED_BY]->(n) MERGE (n)-[:CITES]->(e) DELETE r;`
- `MATCH (c:MemoryCategory) DETACH DELETE c;`
- `MATCH ()-[r]->() WHERE type(r) NOT IN ["CLASSIFIED_AS","SUMMARIZED_BY","CITES","IMPLEMENTED_BY","DEFINED_IN","MENTIONS","MATERIALIZED_AS","BLOCKED_BY","FOLLOWS_PROTOCOL"] DELETE r;`
- `MATCH (n) WHERE (exists(n.createdAt) AND datetime(n.createdAt) < datetime() - duration('P1D')) OR (exists(n.timestamp) AND n.timestamp < timestamp() - 24*60*60*1000) DETACH DELETE n;`

Option B — Blank reset (quickest):

- `MATCH (n) DETACH DELETE n;`

### 5) Re-ingest with existing rMemory scribes (no repo changes)

Environment:

- `export OLLAMA_HOST="http://localhost:11434"`
- `export OLLAMA_MODEL="qwen2.5-coder:7b"`    (or llama3)
- `export OLLAMA_EMBED_MODEL="nomic-embed-text"`

Run:

- `node .rMemory/scribes/chat-db-extractor.js`
- `node .rMemory/scribes/memory-scribe-summarizer.js`
- `node .rMemory/scribes/deep-chat-analysis.js`
- `node .rMemory/scribes/real-time-scribe.js`   (keep running)

### 6) Verification (quick)

SQLite MCP:

- `sqlite3 .rMemory/sqlite/memory-mcp.db "

  SELECT 'evidence',count(*) FROM evidence
  UNION ALL SELECT 'notes',count(*) FROM notes
  UNION ALL SELECT 'classifications',count(*) FROM classifications
  UNION ALL SELECT 'todos',count(*) FROM todos
  UNION ALL SELECT 'plans',count(*) FROM plans;"`

Rolling summaries:

- `ls -lah .rMemory/json | grep -i rolling-summary || true`

Neo4j inventory:

- `MATCH ()-[r]->() RETURN type(r) AS rel, count(*) AS c ORDER BY c DESC;`
- `MATCH ()-[r:RELATES_TO]->() RETURN count(r) AS legacy_relates_to;`   // expect 0
- `MATCH (c:MemoryCategory) RETURN count(c) AS categories;`             // expect 0

### 7) Git checkpoints (external rMemory repo)

- After each step you change code there, commit with message: `mcp: step <n>/8 — <short desc>`
- If Codacy MCP is enabled there, run `codacy_cli_analyze` on each edited file.

### 8) Embeddings fallback

- Local embeddings via `nomic-embed-text` are the source of truth for now.
- If Memento embedding retrieval is offline, search via SQLite FTS5 and local vectors.

## Rollback

- Restore backups from `.rMemory/sqlite/backups/`.
- For Neo4j, restore from dump or skip if using blank reset workflow.

## Known Pitfalls

- Do not create memory tools under this repo’s `scripts/`. Keep all tooling in the external rMemory path.
- Ensure 24h pruning runs after materialization to avoid reintroducing noise.
- If `RELATES_TO` reappears, re-run the purge (safe and idempotent).

## Appendix A — One-liner to purge and blank reset (Neo4j)

- `MATCH (n) DETACH DELETE n;`

## Appendix B — Relationship whitelist (for audits)

`["CLASSIFIED_AS","SUMMARIZED_BY","CITES","IMPLEMENTED_BY","DEFINED_IN","MENTIONS","MATERIALIZED_AS","BLOCKED_BY","FOLLOWS_PROTOCOL"]`

## Change Log

- 2025-08-31: Initial draft created.
