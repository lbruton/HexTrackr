# API Key Inventory - Mac Development Environment
Generated: 2025-09-28

## Current API Keys Found

### 1. OPENAI_API_KEY
- **Found in:**
  - `/Users/lbruton/.claude/config-dev.json` (EXPOSED IN PLAIN TEXT!)
  - `/Users/lbruton/.claude/config-minimal.json` (EXPOSED IN PLAIN TEXT!)
  - `/Volumes/DATA/GitHub/HexTrackr/.env`
- **Purpose:** Required for Memento and Claude-context MCP servers for embeddings
- **Status:** ✅ REQUIRED - Must be secured in Keychain
- **Action:** Consolidate to single secure location

### 2. OPENROUTER_API_KEY
- **Found in:**
  - Environment variable (currently active)
  - `/Users/lbruton/.claude/.env`
  - `/Volumes/DATA/GitHub/zen-mcp-server/.env`
- **Purpose:** Access to 400+ AI models via OpenRouter
- **Status:** ✅ REQUIRED for AI model routing
- **Action:** Move to Keychain

### 3. GEMINI_API_KEY
- **Found in:**
  - `/Volumes/DATA/GitHub/HexTrackr/.env`
  - `/Volumes/DATA/GitHub/zen-mcp-server/.env`
- **Purpose:** Direct access to Google Gemini models
- **Status:** ❌ NOT NEEDED for HexTrackr
- **Action:** Remove from HexTrackr, keep only in zen-mcp-server if needed

### 4. ANTHROPIC_API_KEY
- **Found in:**
  - `/Volumes/DATA/GitHub/HexTrackr/.env`
- **Purpose:** Claude API access
- **Status:** ❌ NOT NEEDED - Claude Code uses subscription, not API
- **Action:** Remove completely

### 5. ZILLIZ_API_TOKEN
- **Found in:**
  - `/Volumes/DATA/GitHub/HexTrackr/.env`
- **Purpose:** Vector database experiments
- **Status:** ❓ Needs verification
- **Action:** Audit usage, likely remove

### 6. BRAVE_API_KEY
- **Found in:**
  - `/Users/lbruton/.claude/.env`
- **Purpose:** Brave Search API for web searches
- **Status:** ✅ REQUIRED for brave-search MCP
- **Action:** Move to Keychain

### 7. CODACY_ACCOUNT_TOKEN
- **Found in:**
  - `/Users/lbruton/.claude/.env`
- **Purpose:** Codacy code quality checks
- **Status:** ✅ REQUIRED for code quality automation
- **Action:** Move to Keychain

### 8. REF_API_KEY
- **Found in:**
  - `/Users/lbruton/.claude/.env`
- **Purpose:** Unknown - needs investigation
- **Status:** ❓ Needs audit
- **Action:** Investigate purpose

### 9. CUSTOM_API_URL
- **Found in:**
  - Environment variable (currently active)
- **Purpose:** Custom API endpoint configuration
- **Status:** ❓ Needs audit
- **Action:** Investigate purpose

## Security Issues Found

1. **Plain Text Exposure:** OPENAI_API_KEY exposed in multiple JSON configs
2. **Duplication:** Same keys stored in multiple locations
3. **Unnecessary Keys:** ANTHROPIC_API_KEY and GEMINI_API_KEY in HexTrackr
4. **No Encryption:** All keys stored as plain text
5. **Multiple MCP Processes:** 23 active processes potentially accessing these keys

## Required Actions

### Immediate (Critical):
1. Remove OPENAI_API_KEY from JSON configs
2. Delete ANTHROPIC_API_KEY from all locations
3. Backup all files before modification

### Short-term (This Session):
1. Move all required keys to macOS Keychain
2. Create secure wrapper scripts
3. Update MCP configurations
4. Clean up unnecessary keys

### Long-term (Follow-up):
1. Implement key rotation strategy
2. Create monitoring for key usage
3. Document best practices for team