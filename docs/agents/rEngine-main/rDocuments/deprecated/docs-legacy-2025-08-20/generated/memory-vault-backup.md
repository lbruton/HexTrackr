# rEngine Core: Memory Vault Backup System

## Purpose & Overview

The Memory Vault Backup System is a critical component of the rEngine Core platform, responsible for the automated, versioned backup of all agent memory files. This system ensures memory persistence and recovery capabilities in case of system crashes or data loss, providing a robust solution for maintaining the integrity and availability of the rEngine Core's knowledge base.

## Key Functions/Components

### 1. Sync Script (`/agents/scripts/sync_memory_vault.py`)

The sync script is the backbone of the Memory Vault Backup System, handling the following key functions:

- Automated detection of memory files to be backed up
- Tracking of changes to the memory files
- Synchronization of the memory files to the backup repository
- Git-based version control operations, including timestamped commits

### 2. Memory Files Tracked

The Memory Vault Backup System automatically backs up the following memory files:

| File | Description |
| --- | --- |
| `memory.json` | Core system memory |
| `github_copilot_memories.json` | GitHub Copilot agent memories |
| `gpt4o_memories.json` | GPT-4 agent memories |
| `extendedcontext.json` | Extended context storage |
| `claude_opus_memories.json` | Claude Opus agent memories |
| `claude_sonnet_memories.json` | Claude Sonnet agent memories |
| `gemini_pro_memories.json` | Gemini Pro agent memories |
| `gpt4_memories.json` | GPT-4 base agent memories |

### 3. Backup Repository

The memory files are backed up to a private Git repository named `memory-vault`, with the following configuration:

- Repository: `https://github.com/lbruton/memory-vault.git`
- Structure: All memory files are stored in the `rAgentShared` directory
- Commit Frequency: Every 15 minutes (when changes are detected)
- Access: Private repository for security

## Usage Examples

### Initial Configuration

1. Clone the `memory-vault` repository:

```bash
git clone https://github.com/lbruton/memory-vault.git
```

1. Make the sync script executable:

```bash
chmod +x /agents/scripts/sync_memory_vault.py
```

1. Set up a cron job to run the sync script every 15 minutes:

```bash
(crontab -l 2>/dev/null; echo "*/15 * * * * /path/to/agents/scripts/sync_memory_vault.py") | crontab -
```

### Recovery Process

In case of data loss or system crash, follow these steps to restore the memory files:

1. Clone the `memory-vault` repository:

```bash
git clone https://github.com/lbruton/memory-vault.git
```

1. Copy the files from the `rAgentShared` directory in the `memory-vault` repository.
2. Place the copied files in the appropriate location in your rEngine Core project.
3. Restart the agent system.

## Configuration

The Memory Vault Backup System does not require any specific configuration, as it is designed to work seamlessly with the rEngine Core platform. However, you may need to update the file list or the backup repository location if the system's structure changes.

## Integration Points

The Memory Vault Backup System is tightly integrated with the rEngine Core platform, as it is responsible for preserving the memory and knowledge base of the various agents and components. It ensures the persistence and recoverability of the rEngine Core's intelligence, enabling seamless operation and continued learning.

## Troubleshooting

### Common Issues and Solutions

1. **Sync script not running**: Verify that the cron job is configured correctly and the sync script is executable.
2. **Sync errors**: Check the sync logs (`/tmp/memoryvaultsync.log` and `/tmp/memoryvaultsync.err`) for any error messages and take appropriate action.
3. **Backup repository access issues**: Ensure that the backup repository is properly configured and that you have the necessary permissions to access it.

### Backup Validation

To ensure the integrity of the backup system, regularly perform the following validation steps:

1. Verify the sync logs for successful backups.
2. Check the Git commit history in the `memory-vault` repository to ensure that the backups are being committed regularly.
3. Periodically restore the backup files to a test environment and validate the recovered data.

## Best Practices

1. Never delete the `.last_sync` file, as it is used by the sync script to track the last successful sync.
2. Keep the `memory-vault` repository private to maintain the security of the backed-up data.
3. Monitor the sync logs regularly for any errors or issues.
4. Maintain regular backup validation to ensure the integrity of the backup system.
5. Test the recovery process periodically to ensure that the backed-up data can be successfully restored.

By following these best practices, you can ensure the reliability and effectiveness of the Memory Vault Backup System within the rEngine Core platform.
