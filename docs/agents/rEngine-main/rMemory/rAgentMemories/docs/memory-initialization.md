# Memory Initialization Tool

This tool ensures proper memory bootstrapping and sharing across all agents in the StackTrackr system.

## Overview

The memory initialization tool is responsible for:

1. Bootstrapping memory.json with essential system knowledge
2. Enforcing memory sharing protocols
3. Validating memory consistency
4. Handling agent memory synchronization

## Usage

```bash

# Basic initialization

python agents/scripts/initialize_memory.py

# Force initialization even with validation issues

python agents/scripts/initialize_memory.py --force
```

## Features

### Memory Structure

The tool manages the following memory components:

- **Bootstrap Memories**: Essential system knowledge
  - System architecture
  - Agent protocols
  - Shared context
  
- **Agent-Specific Memories**: Individual agent knowledge stores
  - Development and code context (GitHub Copilot)
  - Advanced reasoning and analysis (GPT-4)
  - Extended project context
  
- **Shared Memories**: Cross-agent shared knowledge
  - Source tracking
  - Timestamp management
  - Conflict resolution

### Memory Validation

The tool performs the following validations:

1. Required sections presence check
2. Metadata validation
   - Version check
   - Creation timestamp check
1. Memory structure integrity
2. Agent memory consistency

### Backup and Safety

- Automatic backup creation before saves
- Rollback on save failures
- File corruption detection
- Missing file handling

## Memory Schema

```json
{
  "metadata": {
    "version": "1.0.0",
    "created": "ISO-8601-timestamp",
    "purpose": "Structured MCP memory system",
    "type": "central_memory_store"
  },
  "bootstrap_memories": {
    "system_architecture": { ... },
    "agent_protocols": { ... },
    "shared_context": { ... }
  },
  "shared_memories": {
    "memory_key": [
      {
        "content": "memory_value",
        "source": "agent_file.json",
        "timestamp": "ISO-8601-timestamp"
      }
    ]
  },
  "agent_memories": {},
  "system_state": {
    "last_sync": "ISO-8601-timestamp",
    "health_check": {
      "last_check": "ISO-8601-timestamp",
      "status": "initialized",
      "issues": []
    }
  }
}
```

## Best Practices

1. Run the initialization tool:
   - After system updates
   - Before starting new development sessions
   - When memory inconsistencies are detected

1. Monitor the output for:
   - Validation issues
   - Missing agent memory files
   - Sync completion status

1. Use the `--force` flag with caution:
   - Only when validation issues are understood
   - After backing up existing memories
   - When recovering from system issues

## Troubleshooting

Common issues and solutions:

1. **Missing Agent Memory Files**
   - Ensure all required agent memory files exist in the agents/ directory
   - Check file permissions
   - Verify file names match the configuration

1. **Validation Issues**
   - Review the specific validation errors
   - Check memory file structure
   - Ensure required sections are present

1. **Sync Failures**
   - Check file system permissions
   - Verify memory file is not corrupted
   - Ensure sufficient disk space

## Integration

The memory initialization tool is designed to work with:

- GitHub Copilot agent
- GPT-4 agent
- Extended context management
- Cross-app coordination system

## Security Considerations

1. Memory files contain sensitive project information
2. Use appropriate file permissions
3. Regular backups are recommended
4. Monitor for unauthorized modifications
