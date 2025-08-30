# rEngine Core: MCP-JSON Synchronization System

## Purpose & Overview

The `sync-system-readme.md` file provides detailed documentation for the MCP-JSON Synchronization System, a critical component of the rEngine Core platform. This system ensures a perfect 1:1 mapping and synchronization between JSON files (the "operational truth") and the MCP (Memory and Context Provider) memory, offering both operational reliability and intelligent context management.

The synchronization system acts as a bridge between the JSON files, which represent the various entities and data used by the rEngine Core agents, and the MCP memory, which provides the contextual intelligence and enhanced querying capabilities. By maintaining this tight integration, the system ensures data consistency, facilitates seamless agent operations, and enables the leveraging of the MCP's advanced features.

## Key Functions/Classes

The MCP-JSON Synchronization System consists of the following main components:

1. **Sync Tool Scripts**: The `sync_tool.sh` script provides a command-line interface for performing various synchronization tasks, such as syncing JSON to MCP, syncing MCP to JSON, validating JSON files, and creating backups.

1. **Sync Configuration**: The `sync_config.json` file defines the mappings between JSON files and MCP entities, relationship mappings, validation rules, and conflict resolution strategies.

1. **Sync Workflow**: The synchronization process follows a well-defined workflow, as illustrated in the provided Mermaid diagram, which covers agent changes, JSON file updates, bidirectional synchronization, and various integrity checks.

1. **Monitoring and Logging**: The system tracks sync success/failure rates, entity counts and changes, validation errors, conflict occurrences, and performance metrics. Detailed logs and metadata are maintained to aid in troubleshooting and debugging.

1. **Conflict Resolution**: When conflicts are detected during the synchronization process, the system creates a conflict report, performs automatic backups, and requires manual review and resolution using the provided tools.

1. **Advanced Features**: The synchronization system offers additional features, such as auto-sync, scheduled sync, and custom validation rules, to enhance the overall functionality and flexibility.

## Dependencies

The MCP-JSON Synchronization System relies on the following dependencies:

1. **JSON Files**: The system synchronizes data between the various JSON files (e.g., `tasks.json`, `memory.json`, `agents.json`) and the MCP memory.

1. **MCP (Memory and Context Provider)**: The synchronization system requires the availability of the MCP to enable the bidirectional sync and leverage its contextual intelligence capabilities.

1. **Sync Configuration**: The `sync_config.json` file, which defines the mappings, validation rules, and conflict resolution strategies, is a crucial dependency for the system.

## Usage Examples

### Synchronizing JSON to MCP

```bash
./agents/scripts/sync_tool.sh sync json_to_mcp
```

### Synchronizing MCP to JSON

```bash
./agents/scripts/sync_tool.sh sync mcp_to_json
```

### Validating JSON Files

```bash
./agents/scripts/sync_tool.sh validate
```

### Creating a Backup

```bash
./agents/scripts/sync_tool.sh backup
```

### Enabling Auto-Sync

```bash
./agents/scripts/sync_tool.sh auto
```

### Scheduling Sync (cron example)

```bash

# Every 5 minutes

*/5 * * * * /path/to/sync_tool.sh auto
```

## Configuration

The synchronization system is configured using the `sync_config.json` file, which defines the following:

- **Field mappings**: Mappings between JSON and MCP entity fields
- **Relationship mappings**: Mappings for cross-references between entities
- **Validation rules**: Rules for data integrity checks
- **Conflict resolution**: Strategies for handling conflicts during synchronization

## Integration Points

The MCP-JSON Synchronization System is a crucial component within the rEngine Core platform, as it ensures the seamless integration and data consistency between the JSON files (which represent the "operational truth") and the MCP memory (which provides the contextual intelligence).

The synchronization system is closely integrated with the following rEngine Core components:

1. **Agents**: Agents interact with the synchronization system during their lifecycle, performing tasks such as checking sync status, verifying data consistency, and ensuring all changes are propagated.

1. **MCP (Memory and Context Provider)**: The synchronization system relies on the availability of the MCP to enable the bidirectional sync and leverage its advanced querying capabilities.

1. **JSON Files**: The system synchronizes data between the various JSON files and the MCP memory, maintaining the 1:1 mapping and data integrity.

## Troubleshooting

### MCP Unavailable

- When the MCP is unavailable, the system automatically falls back to JSON-only mode, allowing all operations to continue normally.
- Once the MCP becomes available, the sync resumes automatically.

### Sync Failures

- Check the `agents/sync.log` file for any error messages or issues.
- Verify the syntax and integrity of the JSON files.
- Ensure the MCP connectivity is functioning correctly.
- Review the conflict reports and follow the manual resolution process.

### Performance Issues

- Monitor the sync duration metrics to identify any performance bottlenecks.
- Implement incremental sync strategies for large datasets to improve efficiency.
- Use asynchronous operations for handling large-scale updates.

## Future Enhancements

The rEngine Core team is continuously working on enhancing the MCP-JSON Synchronization System. Some of the planned future improvements include:

- Real-time sync triggers to enable instant synchronization upon changes
- Advanced conflict resolution using AI-powered decision-making
- Further performance optimization for large-scale datasets
- Enhanced monitoring dashboard for comprehensive system visibility
- Multi-project sync coordination to manage synchronization across multiple projects

By continuously improving the synchronization system, the rEngine Core platform aims to provide even greater reliability, scalability, and intelligence to the agent-based development ecosystem.
