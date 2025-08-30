# rEngine Core: `sync_tasks.py` Documentation

## Purpose & Overview

The `sync_tasks.py` script is part of the `rAgentMemories` module within the rEngine Core platform. This script is responsible for synchronizing task data between the rEngine Core's internal memory and a Markdown-formatted roadmap file (`roadmap.md`). It fetches task data from the rEngine Core's memory, updates the roadmap file, and then synchronizes the tasks back to the memory.

This script serves as a utility to maintain a centralized and up-to-date view of the development roadmap, which can be useful for various stakeholders, such as project managers, developers, and stakeholders.

## Key Functions/Classes

The `sync_tasks.py` script contains the following key functions:

1. **`fetch_tasks_from_memory()`**: This function retrieves the task data from the rEngine Core's internal memory. Currently, it is mocked to read the task data from a JSON file (`memory_export.json`), but this would be replaced with actual API calls to the rEngine Core's memory management system.

1. **`update_roadmap(tasks)`**: This function takes the task data fetched from the memory and updates the `roadmap.md` file with the task descriptions.

1. **`sync_tasks_to_memory()`**: This function reads the task data from the `roadmap.md` file and updates the rEngine Core's internal memory. Similar to the `fetch_tasks_from_memory()` function, this is currently mocked to write the task data to a JSON file (`memory_export.json`).

1. **`main()`**: The `main()` function orchestrates the execution of the three main functions, fetching tasks from memory, updating the roadmap, and syncing the tasks back to memory.

## Dependencies

The `sync_tasks.py` script has the following dependencies:

1. **Python 3.x**: The script is written in Python and requires a Python 3.x environment to run.
2. **JSON**: The script uses the built-in `json` module to read and write JSON data.
3. **Datetime**: The script uses the `datetime` module to timestamp the roadmap file updates.
4. **File system**: The script relies on reading and writing files on the local file system, specifically the `roadmap.md` and `memory_export.json` files.

## Usage Examples

To use the `sync_tasks.py` script, follow these steps:

1. Ensure you have Python 3.x installed on your system.
2. Save the `sync_tasks.py` script in the appropriate location within the rEngine Core project structure.
3. Run the script using the following command:

   ```bash
   python sync_tasks.py
   ```

   This will execute the following steps:

   - Fetch tasks from the rEngine Core's internal memory (mocked to read from `memory_export.json`).
   - Update the `roadmap.md` file with the task descriptions.
   - Sync the tasks back to the rEngine Core's internal memory (mocked to write to `memory_export.json`).

1. Check the `roadmap.md` file to verify that the tasks have been updated correctly.

## Configuration

The `sync_tasks.py` script has the following configuration options:

1. **`ROADMAP_FILE`**: The path to the `roadmap.md` file, which is set to `"docs/roadmap.md"` by default.
2. **`MEMORY_EXPORT_FILE`**: The path to the `memory_export.json` file, which is set to `"memory_export.json"` by default.

These paths can be modified if the file locations are different in your rEngine Core project structure.

## Integration Points

The `sync_tasks.py` script is part of the `rAgentMemories` module within the rEngine Core platform. It interacts with the following rEngine Core components:

1. **rEngine Core Memory Management**: The script fetches and synchronizes task data with the rEngine Core's internal memory management system, which is currently mocked but would be replaced with actual API calls.
2. **Roadmap Documentation**: The script updates the `roadmap.md` file, which is a central documentation resource for the rEngine Core project.

## Troubleshooting

Here are some common issues and solutions related to the `sync_tasks.py` script:

1. **File Not Found Errors**:
   - Ensure that the `ROADMAP_FILE` and `MEMORY_EXPORT_FILE` paths are correct and that the files exist in the specified locations.
   - Check the file permissions and ensure the script has the necessary read/write access to the files.

1. **Incorrect Task Data**:
   - Verify that the task data being fetched from the rEngine Core's internal memory is in the expected format.
   - Ensure that the task data being written to the `roadmap.md` file and the `memory_export.json` file is correct.

1. **Synchronization Issues**:
   - Ensure that the script is being executed correctly and that there are no conflicts or race conditions when accessing the shared memory resources.
   - Check the rEngine Core's internal memory management system for any issues or inconsistencies that may be affecting the synchronization process.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the rEngine Core support team for further assistance.
