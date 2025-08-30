# GPT Memory MCP Integration Sprint

**Date**: August 30, 2025  
**Goal**: Integrate GPT's Symbol Table breakthrough with Evidence → Canonical Notes → Todos pipeline  
**Duration**: 2 weeks  

## Sprint Overview

Transform our lightweight chat logging system into a comprehensive Memory MCP implementation using GPT's architectural insights. Focus on Evidence-based memory processing with deterministic classification and LLM backup.

## Phase 1: Foundation & Integration (Week 1)

### Day 1-2: Core Integration ✅

- [x] Create Symbol Table Processor with GPT Memory MCP schema
- [x] Integrate Evidence processing into real-time-scribe.js  
- [x] Implement deterministic classification rules
- [x] Setup Evidence → Canonical Notes pipeline
- [x] Add SQLite schema for Evidence, Notes, Todos, Plans, CodeSymbol

### Day 3-4: Database & Classification

- [ ] Complete SQLite + Neo4j hybrid implementation
- [ ] Add FTS5 full-text search for code symbols
- [ ] Implement LLM backup classification when confidence < 0.7
- [ ] Create simhash duplicate detection system
- [ ] Test Evidence buffer → Canonical Notes reconciliation

### Day 5-7: Code Symbol Indexing

- [ ] Implement CodeSymbol extraction for JS/TS/Python
- [ ] Add AST parsing for better symbol detection
- [ ] Create function signature indexing
- [ ] Implement cross-reference tracking
- [ ] Add JSDoc/docstring extraction

## Phase 2: Advanced Features (Week 2)

### Day 8-10: Protocol Implementation

- [ ] Implement backup-before-write protocol
- [ ] Add plan-before-expensive protocol
- [ ] Create summarize-on-commit protocol
- [ ] Implement limit-hourly-ingest protocol
- [ ] Add guard-dup-summaries protocol

### Day 11-12: Opus Integration & Optimization

- [ ] Enhance Opus deep analysis with new classification
- [ ] Create batch processing for Evidence → Notes
- [ ] Implement confidence scoring and freshness tracking
- [ ] Add automatic Todo extraction from ACTION intents
- [ ] Create Plan generation from DECISION patterns

### Day 13-14: Testing & Documentation

- [ ] Create comprehensive test suite
- [ ] Test with full VS Code chat history ingestion
- [ ] Performance optimization for large datasets
- [ ] Create project-onboarding.prompt.md template
- [ ] Update documentation and create ADR

## Technical Architecture

### Evidence → Canonical Notes → Todos Pipeline

```

1. Real-time Chat Capture

   ↓

1. Evidence Processing (deterministic + LLM backup)

   ↓

1. Evidence Buffer (15-min batches)

   ↓

1. Canonical Note Reconciliation

   ↓

1. Todo Extraction & Plan Generation

   ↓

1. Symbol Table Indexing

```

### Database Schema (SQLite + Neo4j)

## SQLite Tables

- `evidence` - Raw chat spans with quality scoring
- `notes` - Canonical summaries with citations
- `todos` - Actionable items with status tracking
- `plans` - Sequential thinking outputs
- `code_index` - Symbol table with FTS5 search
- `classifications` - Entity/Intent/Confidence results

## Neo4j Relationships

- (Evidence)-[:SUMMARIZED_BY]->(Note)
- (Note)-[:CITES]->(Evidence)
- (Todo)-[:IMPLEMENTED_BY]->(CodeSymbol)
- (Evidence)-[:MENTIONS]->(CodeSymbol)

## Current Progress Status

### ✅ Completed

1. **Symbol Table Processor**: Core class with GPT taxonomy
2. **Evidence Processing**: Chat-to-Evidence conversion
3. **Deterministic Classification**: Regex-based entity/intent detection
4. **SQLite Schema**: Complete database structure
5. **Real-time Integration**: Evidence buffer in chat scribe
6. **Canonical Notes**: Reconciliation framework

### 🔄 In Progress

1. **Database Integration**: Testing Evidence → Notes pipeline
2. **Classification Testing**: Validating deterministic rules
3. **Chat History Ingestion**: Bulk processing existing chats

### 📋 Pending

1. **LLM Backup Classification**: Ollama integration for low-confidence items
2. **Code Symbol Indexing**: JS/TS/Python AST parsing
3. **Protocol Implementation**: backup-before-write, plan-before-expensive
4. **Neo4j Integration**: Relationship mapping
5. **Full-text Search**: FTS5 optimization
6. **Performance Testing**: Large dataset validation

## Success Metrics

1. **Evidence Quality**: >80% successful classification
2. **Processing Speed**: <1s per chat message
3. **Memory Efficiency**: <100MB RAM for 10K evidence items
4. **Search Performance**: <500ms for complex queries
5. **Code Coverage**: >90% symbol detection accuracy

## Risk Mitigation

1. **Performance**: Batch processing + async operations
2. **Data Loss**: SQLite transactions + backup protocols
3. **Classification Accuracy**: Deterministic rules + LLM backup
4. **Memory Usage**: Evidence buffer limits + cleanup
5. **Integration Complexity**: Incremental deployment + rollback strategy

## Next Actions

1. **Immediate**: Test Symbol Table Processor with real chat data
2. **Week 1**: Complete database integration and classification testing
3. **Week 2**: Add advanced features and optimization
4. **Final**: Deploy to production with monitoring

## Dependencies

- **Ollama**: qwen2.5-coder:7b for classification backup
- **SQLite3**: Database with FTS5 support
- **Neo4j**: Knowledge graph relationships
- **Claude Opus**: Deep analysis and reconciliation
- **VS Code Chat History**: Source data for testing

---

**Sprint Lead**: GitHub Copilot  
**Stakeholder**: Lonnie Bruton  
**Review Schedule**: Daily standups, weekly retrospectives
