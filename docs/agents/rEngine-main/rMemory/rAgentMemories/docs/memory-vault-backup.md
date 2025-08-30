# Memory Vault Backup System

## Overview

The Memory Vault Backup System provides automated, versioned backup of all agent memory files to a separate repository. This system ensures memory persistence and recovery capabilities in case of system crashes or data loss.

## Components

### 1. Sync Script

Location: `/agents/scripts/sync_memory_vault.py`

The sync script handles:

- Automated memory file detection
- Change tracking
- File synchronization
- Git operations for version control
- Timestamped commits

### 2. Memory Files Tracked

The following memory files are automatically backed up:

- `memory.json` - Core system memory
- `github_copilot_memories.json` - GitHub Copilot agent memories
- `gpt4o_memories.json` - GPT-4 agent memories
- `extendedcontext.json` - Extended context storage
- `claude_opus_memories.json` - Claude Opus agent memories
- `claude_sonnet_memories.json` - Claude Sonnet agent memories
- `gemini_pro_memories.json` - Gemini Pro agent memories
- `gpt4_memories.json` - GPT-4 base agent memories

### 3. Backup Repository

- Repository: `memory-vault`
- Structure: All memory files are stored in the `rAgentShared` directory
- Commit Frequency: Every 15 minutes (when changes detected)
- Access: Private repository for security

## Features

### Automatic Synchronization

- Runs every 15 minutes via cron job
- Only syncs files that have changed
- Creates timestamped commits for each sync
- Maintains detailed sync logs

### Version Control

- Complete history of memory changes
- Git-based versioning
- Commit messages include timestamps
- Track memory evolution over time

### Crash Recovery

1. All memories backed up to separate repository
2. Easy restoration process
3. Version history available for point-in-time recovery
4. Isolated from main project for added safety

### Monitoring

- Sync status logged to `/tmp/memoryvaultsync.log`
- Errors logged to `/tmp/memoryvaultsync.err`
- Git commit history shows sync timeline
- Verbose output for debugging

## Setup

### Initial Configuration

```bash

# 1. Clone the memory-vault repository

git clone https://github.com/lbruton/memory-vault.git

# 2. Make sync script executable

chmod +x /agents/scripts/sync_memory_vault.py

# 3. Set up cron job (runs every 15 minutes)

(crontab -l 2>/dev/null; echo "*/15 * * * * /path/to/agents/scripts/sync_memory_vault.py") | crontab -
```

### Recovery Process

In case of data loss or system crash:

1. Clone the memory-vault repository
2. Copy files from `rAgentShared` directory
3. Place them in the appropriate location in your project
4. Restart the agent system

## Security Considerations

- Private repository access only
- Separate from main project repository
- No sensitive configuration data included
- Regular backup validation

## Maintenance

- Monitor sync logs regularly
- Check Git history for successful syncs
- Verify backup integrity periodically
- Update memory file list as needed

## Best Practices

1. Never delete the `.last_sync` file
2. Keep memory-vault repository private
3. Monitor sync logs for errors
4. Maintain regular backup validation
5. Test recovery process periodically
