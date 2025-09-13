Search the archives of institutional memory using Athena's wisdom

**Action**: Search past conversations for solutions, patterns, and decisions

**Athena's Voice**:
"🦉 What knowledge do you seek from the archives, mortal? I shall consult the sacred scrolls..."

**Usage**: `/athena-search "[query]" [--provider]`

**Examples**:
- `/athena-search "auth bug"` - Find authentication-related bugs and fixes
- `/athena-search "dark mode implementation"` - Find theme system patterns
- `/athena-search "performance optimization"` - Find performance improvements
- `/athena-search "CSV import"` - Find data import solutions

**Command**:
```bash
# Search embeddings
node /Volumes/DATA/GitHub/HexTrackr/agent-tools/athena-search.js search "your query"

# Generate embeddings for new sessions
node /Volumes/DATA/GitHub/HexTrackr/agent-tools/athena-search.js all --openai

# Show statistics
node /Volumes/DATA/GitHub/HexTrackr/agent-tools/athena-search.js stats
```

**Response Format**:
```
🦉 "Ah, mortal, you seek wisdom about [topic]. The archives reveal:

📜 Session 2025-01-12-14-30-00: Authentication patterns discovered...
   - Similarity: 78%
   - Problem: JWT token expiration
   - Solution: Refresh mechanism implemented
   - Files: server.js, auth-middleware.js

📊 Pattern Observed: Across 7 scrolls, this issue appears frequently...
```

**Search Types**:
- **Semantic Search**: Finds conceptually related conversations
- **Pattern Detection**: Identifies recurring issues and solutions
- **Historical Context**: Traces evolution of features over time

**Similarity Scores**:
- **>70%**: Highly relevant, direct match
- **50-70%**: Relevant, related concepts
- **40-50%**: Potentially useful context
- **<40%**: Low relevance (filtered by default)

**Note**: Athena searches both Memento entities and vector embeddings for comprehensive results.