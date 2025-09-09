# Memory Search Command

Search the Memento knowledge graph for relevant patterns, solutions, and past decisions.

## Usage
Type `/memory-search [your query]` to find relevant information from project memory.

## Search Strategy
```javascript
// ALWAYS use semantic mode for best results
await mcp__memento__search_nodes({
  mode: "semantic",  // Required by Constitution Article VI
  query: "[your search query]",
  topK: 8,  // Get top 8 results
  threshold: 0.35  // Similarity threshold
});
```

## Search Examples

### Finding Patterns
```javascript
/memory-search vulnerability import optimization
/memory-search docker configuration issues
/memory-search authentication patterns
```

### Finding Solutions
```javascript
/memory-search fixed bug csv upload
/memory-search solved performance problem
/memory-search working pagination implementation
```

### Finding Decisions
```javascript
/memory-search architecture decision database
/memory-search why we chose SQLite
/memory-search rejected approaches
```

## Entity Naming Convention
When searching, remember our classification system:
- `PROJECT:DOMAIN:TYPE[:STATUS][:ID]`
- Examples:
  - `HEXTRACKR:FEATURE:VulnerabilityImport`
  - `HEXTRACKR:BUG:CSVParsing:FIXED`
  - `HEXTRACKR:PATTERN:BatchProcessing`

## Constitutional Compliance
- **Article VI**: Knowledge Management - Uses semantic search
- **Information Research Priority**: Check memory before external sources
- **Tool Discovery Protocol**: Memento is second in priority after ref.tools

## Pro Tips
1. Use specific technical terms for better results
2. Search for both problems AND solutions
3. Check for deprecated patterns with `:DEPRECATED` status
4. Look for `:FIXED` bugs to avoid repeating issues