# Protocol: Absolute File Path Mandate

**Version: 1.0.0**
**Date: 2025-08-18**
## Status: Active

## 1. Overview

This protocol establishes a mandatory requirement for the use of absolute (full) file paths in all scripts, commands, and agent actions. The purpose is to eliminate ambiguity and prevent errors that arise from inconsistent working directories.

## 2. The Mandate

**All file and directory references MUST be absolute paths.**

- **Correct:** `/Volumes/DATA/GitHub/rEngine/scripts/my-script.js`
- **Incorrect:** `scripts/my-script.js`
- **Incorrect:** `../scripts/my-script.js`
- **Incorrect:** `~/StackTrackr/scripts/my-script.js`

This rule applies to:

- Executing scripts (e.g., `node`, `python`, `bash`).
- Reading or writing files.
- Listing directories.
- Specifying paths as arguments to commands.
- Any other file system operation.

## 3. Rationale

Using relative paths introduces a dependency on the current working directory (`cwd`) of the process executing the command. This can change unexpectedly, leading to:

- "File not found" errors.
- Scripts failing to locate their modules or resources.
- Data being written to the wrong location.
- Inconsistent behavior between different terminals or execution contexts.

By enforcing absolute paths, we ensure that all operations are explicit, predictable, and independent of the shell's current state.

## 4. Agent Responsibility

All agents are required to internalize this protocol. Before executing any command involving a file path, an agent must ensure the path is absolute. If a relative path is encountered or provided, it must be resolved to its absolute form before execution.
