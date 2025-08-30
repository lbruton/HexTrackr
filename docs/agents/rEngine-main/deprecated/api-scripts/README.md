# Deprecated API Scripts - August 19, 2025

**Replaced by:** `/Volumes/DATA/GitHub/rEngine/rEngine/document-scribe.js`

## Scripts Deprecated

All these scripts have been replaced by the unified Document Scribe system. The new system provides:

- ✅ **Unified API Communication** - Single interface for all providers
- ✅ **Rate Limiting** - Intelligent rate limiting per provider  
- ✅ **MCP Integration** - Uses rEngine MCP relay system
- ✅ **Idle Documentation** - Automatic documentation during idle time
- ✅ **Provider Fallback** - Intelligent fallback chains
- ✅ **Cost Optimization** - Prefers local Ollama models

## Migration

## Old Usage:

```bash
node rEngine/claude-html-generator.js
node rEngine/gemini-html-converter.js  
node rEngine/document-generator.js
node scripts/heygemini.js
```

## New Usage:

```bash

# Unified tool for all operations

node rEngine/document-scribe.js --html-sweep
node rEngine/document-scribe.js --provider gemini --prompt "text"
node rEngine/document-scribe.js --document-sweep
node rEngine/document-scribe.js --idle-crawl

# Or use the tools wrapper

tools/document-scribe --provider gemini --prompt "text"
```

## Deprecated Files

| Old Script | Function | Replacement |
|------------|----------|-------------|
| `claude-html-generator.js` | HTML generation with Claude | `document-scribe.js --html-sweep` |
| `gemini-html-converter.js` | HTML generation with Gemini | `document-scribe.js --html-sweep` |
| `documentation-html-generator.js` | HTML documentation | `document-scribe.js --html-sweep` |
| `document-generator.js` | Single file documentation | `document-scribe.js --document-sweep --file` |
| `document-sweep.js` | Full directory sweeps | `document-scribe.js --document-sweep` |
| `heygemini.js` | Direct Gemini API | `document-scribe.js --provider gemini` |
| `heyclaude` | Direct Claude API | `document-scribe.js --provider claude` |

**All deprecated scripts moved to:** `/deprecated/api-scripts/`
