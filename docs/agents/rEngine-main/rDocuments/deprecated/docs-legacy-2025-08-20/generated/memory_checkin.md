# rEngine Core: Memory Checkin/Checkout System

## Purpose & Overview

The `memory_checkin.py` file is a part of the `rLegacy` module in the `rAgents` component of the rEngine Core platform. It implements an atomic write, lease, and provenance tracking system for managing the memory of multi-agent systems.

This module serves as the underlying memory management system for the rEngine Core, providing a centralized and versioned storage for various data entities, such as decisions, tasks, bugs, roadmap, patterns, and agent-specific memories. It ensures data consistency, conflict resolution, and provenance tracking to support the collaborative and distributed nature of the rEngine Core platform.

## Key Functions/Classes

The `memory_checkin.py` file defines the following key functions:

1. **`ensure_dirs()`**: Ensures that all required directories for the memory vault are created.
2. **`sha256()`**: Computes the SHA256 hash of a JSON object with consistent ordering.
3. **`read_json()`**: Safely reads a JSON file, handling file not found and JSON decode errors.
4. **`write_atomic()`**: Writes a JSON object atomically using a temporary file and a rename operation.
5. **`now_iso()`**: Returns the current timestamp in ISO format.
6. **`is_lease_expired()`**: Checks if a given lease has expired.
7. **`initialize_snapshot()`**: Initializes the memory vault snapshot from existing legacy JSON files.
8. **`acquire_lease()`**: Acquires a lease for memory access, handling existing leases and creating a new one.
9. **`release_lease()`**: Releases a lease, cleaning up the associated checkout.
10. **`compute_simple_patch()`**: Computes a simple patch (a placeholder for a full JSON Patch implementation).
11. **`checkin()`**: Checks in changes to the memory vault, handling conflicts and creating an event log.
12. **`status()`**: Displays the current status of the memory vault.
13. **`main()`**: The main entry point for the script, handling various commands (checkout, checkin, release, status).

## Dependencies

The `memory_checkin.py` file depends on the following libraries and components:

1. **Standard Python Libraries**: `json`, `hashlib`, `os`, `sys`, `time`, `tempfile`, `shutil`, `datetime`, `pathlib`, `typing`.
2. **rEngine Core Configuration**: The script reads configuration settings from the `env.json` file located in the `config` directory.
3. **rEngine Core Directories**: The script relies on various directories within the rEngine Core file structure, such as `memory`, `eventlog`, `checkouts`, and `schemas`.

## Usage Examples

The `memory_checkin.py` script can be used with the following commands:

1. **Checkout Memory**:

   ```
   python memory_checkin.py checkout <agent_id> [ttl_sec]
   ```

   This command acquires a lease for the specified `agent_id`, optionally setting the time-to-live (TTL) for the lease in seconds.

1. **Checkin Memory**:

   ```
   python memory_checkin.py checkin <agent_id> <proposed.json> <source> [confidence] [justification]
   ```

   This command checks in the changes specified in the `proposed.json` file, associating it with the given `agent_id`, `source`, `confidence`, and `justification`.

1. **Release Lease**:

   ```
   python memory_checkin.py release <agent_id>
   ```

   This command releases the lease held by the specified `agent_id`.

1. **Check Status**:

   ```
   python memory_checkin.py status
   ```

   This command displays the current status of the memory vault, including the snapshot, active leases, and event log statistics.

## Configuration

The `memory_checkin.py` script relies on the following configuration settings:

1. **`ROOT`**: The root directory of the rEngine Core project.
2. **`MEMORY_DIR`**: The directory where the memory vault is stored.
3. **`SNAP`**: The path to the memory vault snapshot file.
4. **`LEASE`**: The path to the memory lease file.
5. **`EVENTS_DIR`**: The directory where the event log is stored.
6. **`CHECKOUTS_DIR`**: The directory where the agent checkouts are stored.
7. **`SCHEMAS_DIR`**: The directory where the schema files are stored.
8. **`CONFIG_FILE`**: The path to the rEngine Core environment configuration file.

These configuration settings are used throughout the script to manage the file structure and locations of the memory vault and related components.

## Integration Points

The `memory_checkin.py` script is a core component of the rEngine Core platform, providing the following integration points:

1. **Memory Management**: The script serves as the central memory management system for the rEngine Core, handling the storage, versioning, and access control of various data entities.
2. **Agent Interaction**: Agents in the rEngine Core interact with the memory vault by checking out, checking in, and releasing leases on the memory.
3. **Event Logging**: The script creates an event log for all memory updates, tracking the provenance and changes to the data.
4. **Conflict Resolution**: The script has the groundwork for handling conflicts when the memory snapshot has diverged, though the full 3-way merge implementation is not yet complete.
5. **Snapshot Initialization**: The script can initialize the memory vault snapshot from existing legacy JSON files, ensuring a smooth transition from previous versions of the rEngine Core.

## Troubleshooting

Here are some common issues and solutions related to the `memory_checkin.py` script:

1. **Lease Acquisition Failures**:
   - **Cause**: An existing lease is held by another agent, or the lease is corrupted.
   - **Solution**: Use the `status` command to check the current lease status and, if necessary, release the lease manually using the `release` command.

1. **Checkin Failures**:
   - **Cause**: The proposed changes conflict with the current memory snapshot, or the agent does not hold a valid lease.
   - **Solution**: Ensure that the agent has a valid lease by running the `checkout` command before attempting to `checkin`. If conflicts are detected, the script will print a message indicating that a 3-way merge is required (though the full implementation is not yet complete).

1. **Snapshot Initialization Failures**:
   - **Cause**: Issues with reading or parsing the legacy JSON files.
   - **Solution**: Manually inspect the legacy JSON files in the rEngine Core directory and ensure that they are valid. If necessary, correct any issues with the files and restart the rEngine Core service.

1. **Directory or File Access Errors**:
   - **Cause**: Insufficient permissions to access the required directories or files.
   - **Solution**: Ensure that the user running the rEngine Core service has the necessary permissions to read and write to the `memory`, `eventlog`, `checkouts`, `schemas`, and `config` directories.

By understanding these common issues and their solutions, you can more effectively troubleshoot and maintain the rEngine Core's memory management system.
