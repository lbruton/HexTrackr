# rAgents v2.0.0 - Complete Ecosystem Rebrand

## Purpose & Overview

This file, `REBRAND-v2.0.0.md`, documents the comprehensive rebranding and restructuring of the `rAgents` ecosystem within the rEngine Core platform. The rebrand aims to establish a consistent, professional naming convention and logical organization across all components of the agentic system.

## Key Functions/Classes

The key changes introduced in this v2.0.0 rebrand include:

1. **Main Directory Restructure**:
   - `agents/` directory renamed to `rAgents/`

1. **Subdirectory Renaming**:
   - All subdirectories prefixed with `r-` for consistent branding (e.g., `docs/` → `rDocs/`, `engine/` → `rEngine/`)

1. **Updated File References**:
   - `package.json` script paths updated to use new `r-` prefixed directories
   - Memory search engine and rPrompts library references updated to use new paths
   - Documentation files (e.g., README, handoff guide) updated with new file locations

1. **Verification Tests**:
   - Comprehensive testing to ensure all NPM commands, memory search, agent coordination, and other functionality remains operational after the rebrand.

1. **Benefits of r-Ecosystem Branding**:
   - Improved organizational clarity, developer experience, and scalable system architecture.

1. **Migration Impact**:
   - Identified breaking changes and preserved functionality to ensure a smooth transition to the new v2.0.0 ecosystem.

## Dependencies

The rAgents v2.0.0 ecosystem relies on the following key dependencies:

- **rEngine Core**: The primary platform that provides the underlying infrastructure and capabilities for the agentic system.
- **NPM Scripts**: Various NPM scripts defined in the `package.json` file to facilitate common tasks and workflows.
- **Memory Search Engine**: The memory search and indexing system that powers the agentic system's knowledge management.
- **rPrompts Library**: A collection of pre-defined agent prompts and task assignments.

## Usage Examples

To interact with the rAgents v2.0.0 ecosystem, you can use the following NPM scripts defined in the `package.json` file:

```json
{
  "search": "cd .. && node rAgents/rEngine/memory-search-cli.js",
  "memory:stats": "cd .. && node rAgents/rEngine/memory-search-cli.js --stats",
  "sync": "node rScripts/sync.js",
  "backup": "node rScripts/backup.js",
  "pm:guide": "cat rDocs/PROJECT-MANAGER-HANDOFF.md",
  "pm:templates": "cat rTemplates/task-delegation.md",
  "prompts": "ls -la rDocs/rPrompts/",
  "prompts:list": "cat rDocs/rPrompts/README.md"
}
```

These scripts provide access to various features and functionality within the rAgents ecosystem, such as memory search, data synchronization, backup management, project management documentation, and the rPrompts library.

## Configuration

The rAgents v2.0.0 ecosystem does not require any specific environment variables or configuration files. However, it does rely on the overall rEngine Core platform configuration, which may include settings related to API keys, database connections, and other system-wide parameters.

## Integration Points

The rAgents v2.0.0 ecosystem is a core component of the rEngine Core platform, providing the agentic system and related functionality. It integrates with various other rEngine Core subsystems, including:

- **rEngine**: Provides the underlying infrastructure and capabilities for the agentic system.
- **rDocs**: Houses the documentation and reference materials for the rAgents ecosystem.
- **rScripts**: Contains utility scripts for synchronization, backups, and other administrative tasks.
- **rTemplates**: Provides pre-defined templates for project management and task delegation.
- **rPrompts**: Offers a library of ready-to-use agent prompts and task assignments.

## Troubleshooting

If you encounter any issues or problems with the rAgents v2.0.0 ecosystem, here are some common troubleshooting steps:

1. **Verify NPM Scripts**: Ensure that the NPM scripts defined in the `package.json` file are working as expected. Try running each script individually to identify any issues.

1. **Check Memory Search Engine**: Validate that the memory search engine is functioning correctly by running the `npm run memory:stats` command and verifying the output.

1. **Inspect rPrompts Library**: Ensure that the rPrompts library is accessible and the prompt files are correctly located in the `rDocs/rPrompts/` directory.

1. **Review Documentation Updates**: Verify that the documentation, including the README, handoff guide, and other reference materials, have been updated to reflect the new file paths and structure.

1. **Engage with rEngine Core Support**: If you are unable to resolve the issue, reach out to the rEngine Core support team for further assistance and guidance.

Remember to always refer to the latest rEngine Core documentation and release notes for the most up-to-date information and troubleshooting guidance.
