# rEngine Core: MCP Memory Backup Automation

## Purpose & Overview

The `backup_mcp_memory.sh` script is an automation tool responsible for creating periodic backups of the Memory Control Plane (MCP) memory within the rEngine Core platform. The MCP is the central memory and knowledge management system that powers the rEngine's intelligent agents and workflows. This script ensures that critical MCP data, including the task roadmap, documented bugs, and workflow protocols, are regularly saved to local JSON files for fallback and recovery purposes.

## Key Functions/Classes

The main components and their roles in this script are:

1. **Backup Directory Management**: The script creates and manages the `backups/mcp_memory` directory to store the generated backup files.
2. **Timestamp Generation**: The script generates a timestamp (`TIMESTAMP` variable) to uniquely identify each backup set.
3. **Backup File Generation**: The script ensures that the following backup files are generated:
   - `mcp_memory_backup.json`: A complete snapshot of the MCP memory graph.
   - `roadmap_backup.json`: A backup of all available task roadmap categories.
   - `bugs_backup.json`: A backup of all documented bugs in the MCP.
   - `workflows_backup.json`: A backup of all workflow protocols registered in the MCP.
1. **Backup Status Reporting**: The script prints the current contents of the backup directory to provide visibility into the available backups.
2. **Usage Instructions**: The script provides step-by-step instructions for agents to access the backup data in the event of MCP memory unavailability.

## Dependencies

This script is a standalone automation tool and does not directly depend on any other rEngine Core components. However, it assumes the existence of the following elements:

1. **MCP Memory Management Tools**: The script mentions that "in a real implementation, this would call the MCP tools" to interact with the MCP memory. The actual implementation of these tools is not provided in the given file.
2. **Python Backup Access Script**: The script references a `scripts/mcp_backup_system.py` file, which is likely a Python script that provides programmatic access to the backup data.

## Usage Examples

To use the `backup_mcp_memory.sh` script, follow these steps:

1. Ensure the script has execute permissions:

   ```bash
   chmod +x backup_mcp_memory.sh
   ```

1. Run the script:

   ```bash
   ./backup_mcp_memory.sh
   ```

The script will output the following information:

```
🔄 MCP Memory Backup System
==========================
📁 Backup directory: backups/mcp_memory
⏰ Timestamp: 20230501_123456
✅ Current backups available:

   - mcp_memory_backup.json (complete memory graph)
   - roadmap_backup.json (all roadmap categories)
   - bugs_backup.json (documented bugs)
   - workflows_backup.json (workflow protocols)

📋 Backup Status:
total 16
-rw-r--r-- 1 user group 1234 May  1 12:34 bugs_backup.json
-rw-r--r-- 1 user group 1234 May  1 12:34 mcp_memory_backup.json
-rw-r--r-- 1 user group 1234 May  1 12:34 roadmap_backup.json
-rw-r--r-- 1 user group 1234 May  1 12:34 workflows_backup.json

🎯 Usage Instructions for Agents:
If MCP memory is unavailable, agents should:

1. Read /backups/mcp_memory/roadmap_backup.json for available tasks
2. Read /backups/mcp_memory/bugs_backup.json for documented issues
3. Read /local_memory.json for recent changes and history
4. Use scripts/mcp_backup_system.py for programmatic access

✅ Backup system ready for fallback operations
```

## Configuration

The `backup_mcp_memory.sh` script does not require any specific configuration. However, the following environment variable is used:

- `BACKUP_DIR`: The directory where the backup files will be stored. In this case, it is set to `backups/mcp_memory`.

## Integration Points

The `backup_mcp_memory.sh` script is a standalone automation tool within the rEngine Core platform. It is responsible for managing the backup process of the MCP memory, which is a critical component of the rEngine's intelligent agent and workflow system. While the script does not directly integrate with other rEngine Core components, it is designed to be used in conjunction with the following elements:

1. **MCP Memory Management Tools**: The script mentions that it would call these tools in a real implementation to interact with the MCP memory.
2. **Python Backup Access Script**: The script references a `scripts/mcp_backup_system.py` file, which likely provides programmatic access to the backup data for agents and other rEngine Core components.

## Troubleshooting

Here are some common issues and solutions related to the `backup_mcp_memory.sh` script:

1. **Backup Directory Not Found**: If the `backups/mcp_memory` directory does not exist, the script will attempt to create it. However, if the directory creation fails, the script will not be able to generate the backups. Ensure that the user running the script has the necessary permissions to create directories in the specified location.

1. **Backup File Generation Failure**: If the script encounters any issues while generating the backup files (e.g., `mcp_memory_backup.json`, `roadmap_backup.json`, etc.), it may not be able to complete the backup process successfully. Check the output of the script for any error messages or unexpected behavior, and ensure that the MCP memory management tools are functioning correctly.

1. **Backup Data Accessibility**: If agents are unable to access the backup data as instructed in the script, ensure that the necessary permissions are set on the backup directory and files, and that the `scripts/mcp_backup_system.py` script is available and functioning correctly.

In the event of any issues, it is recommended to review the script's output, check the backup directory contents, and consult the rEngine Core documentation or support team for further assistance.
