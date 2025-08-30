# HexTrackr Memory System - Deprecated Components

This directory contains components that have been deprecated in favor of the streamlined memory system architecture.

## Deprecation Date

August 30, 2025

## Active System Components

Based on dependency analysis of `install-memory-system.sh`, only these components remain active:

### Essential Scripts (scripts/)

- `install-memory-system.sh` - Main system installer
- `memory-system.sh` - System controller (starts/stops/monitors)
- `desktop-launcher.sh` - Created by installer for GUI control

### Essential Core (core/)

- `semantic-orchestrator.js` - Main processing engine
- `embedding-indexer.js` - Embedding and search matrix generation

## Deprecated Components

### Scripts (deprecated/scripts/)

All other shell scripts, JavaScript test files, and AppleScript launchers that were not directly referenced by the installer dependency chain.

### Core (deprecated/core/)

All other JavaScript core components that are not referenced by the active system.

### Tools (deprecated/tools/)

Standalone testing and utility tools.

### Launchers (deprecated/launchers/)

Legacy launcher scripts and archaeology tools.

## Rationale

The deprecation follows the principle of keeping only components that are:

1. Directly referenced by `install-memory-system.sh`
2. Referenced by scripts that are referenced by the installer
3. Part of the active dependency chain

This streamlines the system to only essential, tested, and working components while preserving the deprecated components for reference.

## Recovery

If any deprecated component is needed, it can be moved back to its original location. The file structure preserves the original organization.
