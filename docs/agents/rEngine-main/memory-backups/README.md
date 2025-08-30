# Memory Backups

This directory contains backup files for the persistent memory system.

## Files

- **`persistent-memory.json`** - Current persistent memory state
- **`persistent-memory.backup.json`** - Backup of memory state

## Purpose

These files serve as:

- Local backup of MCP Memory Server data
- Fallback storage for session continuity
- Historical preservation of agent memory state

## Usage

These files are automatically managed by the memory synchronization system and should not be manually edited unless recovering from a system failure.

## Related Systems

- MCP Memory Server (primary storage)
- Memory sync automation scripts in `rEngine/`
- Memory management protocols in `rProtocols/`
