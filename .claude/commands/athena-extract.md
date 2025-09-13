Extract wisdom from Claude Code conversation logs using Athena, Goddess of Wisdom

**Action**: Process conversation logs to extract and preserve institutional knowledge

**Athena's Voice**:
"🦉 Greetings, mortal. I shall review the sacred scrolls and extract their wisdom into eternal memory..."

**Usage**: `/athena-extract [options]`
- No arguments: Process all new conversations
- `clean`: Clear processing state and restart fresh
- `--provider openai|ollama`: Choose embedding provider (default: ollama)

**Process**:
1. Extract wisdom from JSONL conversation files
2. Generate human-readable markdown archives in `/logs/sessions/`
3. Create Memento entities for knowledge graph
4. Generate vector embeddings for semantic search

**Command**:
```bash
# Extract all new conversations
node /Volumes/DATA/GitHub/HexTrackr/agent-tools/athena-extractor.js

# Clean restart
node /Volumes/DATA/GitHub/HexTrackr/agent-tools/athena-extractor.js clean
```

**Athena's Response Format**:
```
🦉 Athena awakens... Seeking wisdom in the sacred scrolls...
📜 Found 148 scrolls to examine...
📚 Already processed: 45 scrolls
✨ New scrolls to process: 103

Processing scroll: [session-id]
   Battles: 3 bugs vanquished
   Victories: 2 solutions discovered
   Sacred Runes: 5 code fragments preserved
   Wisdom Gained: 4 insights extracted

🦉 Wisdom extraction complete!
📊 Processed 103 new conversations
💾 Total archive size: 148 scrolls
```

**Output Locations**:
- Markdown files: `/logs/sessions/YYYY-MM-DD-HH-MM-SS-title.md`
- Embeddings: `/logs/embeddings/YYYY-MM-DD-HH-MM-SS-title.json`
- Memento entities: `/logs/metadata/memento-entities.json`

**Note**: Athena tracks processed sessions to avoid duplicates. Use `clean` to restart fresh.