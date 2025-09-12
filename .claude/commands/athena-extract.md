Extract wisdom from Claude Code conversation logs using Athena, Goddess of Wisdom

**Action**: Launch Athena to parse conversation logs and extract institutional knowledge into Memento

**Athena's Voice**: 
"🦉 Greetings, mortal. I shall review the sacred scrolls and extract their wisdom into eternal memory..."

**Process**:
1. Scan ~/.claude/projects/-Volumes-DATA-GitHub-HexTrackr/ for new JSONL files
2. Parse each conversation to identify:
   - Bug fixes ("battles won")
   - Architectural decisions ("strategic choices")
   - Code solutions ("sacred runes")
   - Discoveries and insights ("wisdom gained")
3. Create Memento entities with Athena's schema
4. Track processed files to avoid duplicates

**Usage**: `/athena-extract [options]`
- No arguments: Process all new conversations
- `--all`: Reprocess all conversations (ignore tracking)
- `--session [id]`: Extract specific session

**Implementation**:
```javascript
// Launch Athena for wisdom extraction
const { exec } = require('child_process');
exec('node /Volumes/DATA/GitHub/HexTrackr/scripts/athena-memory-extractor.js extract', 
  (error, stdout, stderr) => {
    console.log(stdout);
    if (error) console.error(`🦉 Error: ${error}`);
});
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

**Memento Integration**: Each extraction creates entities like:
```javascript
{
  name: "ATHENA:WISDOM:SESSION:[ID]",
  entityType: "KNOWLEDGE:EXTRACTED:CONVERSATION",
  observations: [
    "TIMESTAMP: [ISO]",
    "🦉 EXTRACTED_BY: Athena, Goddess of Wisdom",
    "SESSION_ID: [UUID]",
    "MORTAL_BRANCH: copilot",
    "BATTLES_FACED: Auth token expiration; CORS configuration",
    "VICTORIES_WON: JWT refresh mechanism; Proper headers",
    "SACRED_RUNES: 5 code fragments preserved",
    "WISDOM_GAINED: Token lifecycle management is critical"
  ]
}
```

**Note**: First extraction may take time with 148 conversations. Athena will remember what she's processed.