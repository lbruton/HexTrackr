# Mac Development Environment Security Setup Guide

## Overview

This guide documents the secure API key management system implemented for the HexTrackr development environment on macOS.

## What Changed

### Before (Insecure)
- **23 API keys** scattered across multiple files
- Keys stored in **plain text** in JSON configs
- **Duplicate keys** in multiple locations
- Unnecessary keys increasing attack surface
- 23+ MCP processes running simultaneously

### After (Secure)
- All sensitive keys stored in **macOS Keychain** (encrypted)
- Zero plain text API keys in files
- Single source of truth for each key
- Removed unnecessary keys (ANTHROPIC, GEMINI)
- Management scripts for easy administration

## Directory Structure

```text
/Volumes/DATA/GitHub/HexTrackr/
├── scripts/
│   ├── secure-keys.sh      # Store keys in Keychain
│   ├── get-secret.sh        # Retrieve keys from Keychain
│   └── mcp-manager.sh       # Manage MCP servers
├── .env                     # Non-sensitive config only
├── API_KEY_INVENTORY.md    # Documentation of all keys
└── SECURE_SETUP_GUIDE.md   # This file

/Users/lbruton/
├── .claude/
│   ├── config-secure.json  # Secure MCP config (uses Keychain)
│   └── .env                 # Template only (no actual keys)
└── SecurityBackup-20250928/ # Backup of original files
```

## Keys Stored in Keychain

| Key Name | Purpose | Required |
|----------|---------|----------|
| OPENAI_API_KEY | Memento & Claude-context embeddings | ✅ Yes |
| OPENROUTER_API_KEY | AI model routing | ✅ Yes |
| BRAVE_API_KEY | Web search functionality | ✅ Yes |
| CODACY_ACCOUNT_TOKEN | Code quality checks | ✅ Yes |

## How to Use

### 1. Check What Keys Are Stored

```bash
# List all HexTrackr keys in Keychain
security dump-keychain | grep -A2 "HexTrackr"

# Check specific key exists
security find-generic-password -s HexTrackr -a OPENAI_API_KEY
```

### 2. Add or Update a Key

```bash
# Add/update a key in Keychain
security add-generic-password -s HexTrackr -a KEY_NAME -w 'your-key-value' -U
```

### 3. Retrieve a Key

```bash
# Using the wrapper script
./scripts/get-secret.sh OPENAI_API_KEY

# Direct from Keychain
security find-generic-password -s HexTrackr -a OPENAI_API_KEY -w
```

### 4. Manage MCP Servers

```bash
# Check status
./scripts/mcp-manager.sh status

# Stop all MCP servers
./scripts/mcp-manager.sh stop

# Switch to secure configuration
./scripts/mcp-manager.sh secure

# Count active processes
./scripts/mcp-manager.sh count
```

## Environment Variables

The `.env` file now contains **only non-sensitive configuration**:

```env
NODE_ENV=development
PORT=8080
DATABASE_PATH=./app/public/data/hextrackr.db
DOCKER_PORT=8989
```

## MCP Configuration

The secure MCP configuration (`~/.claude/config-secure.json`) dynamically retrieves keys from Keychain at runtime:

```json
{
  "memento": {
    "command": "bash",
    "args": ["-c", "OPENAI_API_KEY=$(security find-generic-password -s HexTrackr -a OPENAI_API_KEY -w) npx -y @gannonh/memento-mcp"]
  }
}
```

## Security Best Practices

1. **Never commit API keys** to version control
2. **Rotate keys regularly** (quarterly recommended)
3. **Use different keys** for development vs production
4. **Limit key permissions** to minimum required
5. **Monitor key usage** through provider dashboards
6. **Document key purposes** to identify unnecessary keys

## Troubleshooting

### Key Not Found Error
```bash
# Verify key is in Keychain
security find-generic-password -s HexTrackr -a KEY_NAME

# If missing, add it
security add-generic-password -s HexTrackr -a KEY_NAME -w 'value' -U
```

### MCP Server Won't Start
1. Check key exists in Keychain
2. Verify Claude config uses secure version
3. Restart Claude Desktop application
4. Check logs: `tail -f ~/.claude/logs/*.log`

### Too Many MCP Processes
```bash
# Stop all and restart
./scripts/mcp-manager.sh stop
# Then restart Claude Desktop
```

## Backup Recovery

If you need to recover original files:
```bash
# Backups are stored with timestamp
ls ~/SecurityBackup-20250928/

# Restore a specific file (example)
cp ~/SecurityBackup-20250928/hextrackr-env.backup /Volumes/DATA/GitHub/HexTrackr/.env.old
```

## Next Steps

1. **Implement key rotation schedule** (every 90 days)
2. **Set up monitoring** for key usage anomalies
3. **Create production key management** strategy
4. **Document emergency key recovery** process
5. **Train team** on secure key practices

## Related Documentation

- `API_KEY_INVENTORY.md` - Complete inventory of all keys
- `HEX-82` - Linear issue tracking this security improvement
- `HEXP-4` - Production environment security (reference)

## Support

For questions about this setup:
1. Check Linear issue HEX-82 for context
2. Review the API_KEY_INVENTORY.md for key details
3. Use mcp-manager.sh for diagnostics

---

*Security setup completed: 2025-09-28*
*Next review date: 2026-01-28 (quarterly)*