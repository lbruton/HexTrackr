# rEngine Core: `sync_tool_portable.sh` Documentation

## Purpose & Overview

The `sync_tool_portable.sh` script is a part of the `rAgents/rZipPrep` module within the rEngine Core ecosystem. This script serves as a portable sync tool, designed to dynamically detect project paths and validate the integrity of memory files (JSON files) within the `agents` directory.

The primary purpose of this script is to ensure the consistency and validity of the JSON files used by the rEngine Core platform. It provides a convenient way to check the JSON file integrity, even after the project has been zipped and unzipped, without the need for hard-coded paths.

## Key Functions/Classes

The script defines the following key functions:

1. `log()`: Outputs a log message with a timestamp and the `BLUE` color.
2. `success()`: Outputs a success message with a timestamp and the `GREEN` color.
3. `warn()`: Outputs a warning message with a timestamp and the `YELLOW` color.
4. `error()`: Outputs an error message with a timestamp and the `RED` color.
5. `validate_memory_files()`: Iterates through the JSON files in the `agents` directory and validates their JSON syntax using the Python `json.tool` module.

The script also detects the project root directory dynamically, ensuring that it can be used regardless of the current working directory.

## Dependencies

The `sync_tool_portable.sh` script has the following dependencies:

- Bash shell
- Python 3 (for JSON validation)

## Usage Examples

To use the `sync_tool_portable.sh` script, follow these steps:

1. Navigate to the `rAgents/rZipPrep` directory within the rEngine Core project.
2. Run the script with the `validate` argument:

   ```bash
   ./sync_tool_portable.sh validate
   ```

   This will validate the integrity of all JSON files in the `agents` directory and output the results.

## Configuration

The script does not require any specific configuration. It dynamically detects the project root directory based on the location of the script file.

## Integration Points

The `sync_tool_portable.sh` script is primarily used within the rEngine Core platform to ensure the consistency and validity of the memory files (JSON files) used by the various rAgents. It can be integrated into automated build or deployment processes to ensure the integrity of the project's data files.

## Troubleshooting

### Invalid JSON files

If the script encounters any invalid JSON files, it will output an error message with the name of the affected file. To resolve this issue, you can check the corresponding JSON file and fix any syntax errors.

### Path detection issues

If the script is unable to detect the project root directory correctly, ensure that the script is located within the `rAgents/rZipPrep` directory relative to the project root. If the issue persists, you may need to investigate the script's path detection logic.
