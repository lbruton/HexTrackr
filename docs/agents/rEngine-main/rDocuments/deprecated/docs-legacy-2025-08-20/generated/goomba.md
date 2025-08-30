# rScripts/goomba.sh - StackTrackr Project Markdown Exporter

## Purpose & Overview

The `goomba.sh` script is a utility tool designed to create a comprehensive Markdown export of the StackTrackr project for use with language models (LLMs) that do not support zip file inputs. It collects all relevant project files, including source code, configuration, documentation, and the project's memory system, and compiles them into a single, easy-to-navigate Markdown document.

The primary purpose of this script is to provide a convenient way to share the complete StackTrackr project context with LLMs, ensuring they have access to all the necessary information to understand the project's current state, active issues, roadmap, and development patterns.

## Key Functions

1. **`create_goomba_markdown()`**: This function is responsible for generating the comprehensive Markdown file. It performs the following tasks:
   - Creates a new Markdown file in the `portable_exchange` directory with a timestamp-based filename.
   - Adds a header with project information and context.
   - Includes the project's critical files (e.g., `index.html`, `package.json`, `README.md`).
   - Adds the project's memory system files (e.g., `memory.json`, `bugs.json`, `roadmap.json`).
   - Includes the JavaScript, CSS, and utility script files.
   - Adds any available documentation and key archive files.
   - Provides usage instructions and tips for the LLM.

1. **`create_memory_summary()`**: This function generates a separate Markdown file that provides a quick summary of the project's memory system, including active bugs and current roadmap milestones. This file is intended to give LLMs a concise overview of the project's context.

1. **Logging Functions**: The script includes several logging functions (`log()`, `success()`, `warn()`, `error()`) that provide colorized console output for different log levels, making it easier to monitor the script's execution.

1. **File Handling Functions**: The script includes utility functions like `sanitize_filename()` and `get_syntax_type()` to handle file paths and apply appropriate syntax highlighting for the Markdown code blocks.

## Dependencies

The `goomba.sh` script depends on the following:

- Bash shell
- Python 3 (for processing the JSON memory files)

## Usage Examples

To use the `goomba.sh` script, follow these steps:

1. Navigate to the StackTrackr project directory.
2. Run the script:

   ```bash
   ./rScripts/goomba.sh
   ```

   This will generate two Markdown files in the `portable_exchange` directory:

   - `StackTrackr_Goomba_<timestamp>.md`: The comprehensive Markdown export of the entire project.
   - `StackTrackr_Memory_Summary_<timestamp>.md`: A concise summary of the project's memory system.

1. Copy the contents of the generated Markdown files and provide them to the LLM for processing.

## Configuration

The `goomba.sh` script does not require any specific configuration. It assumes that it is run from the StackTrackr project directory and uses the `portable_exchange` directory to store the generated Markdown files.

## Integration Points

The `goomba.sh` script is a standalone utility tool within the rEngine Core ecosystem. It is designed to work with any LLM that can process Markdown format, making it a convenient way to share project context and information.

## Troubleshooting

If the script encounters any issues, it will display appropriate error messages. Here are some common problems and their solutions:

1. **Not in the StackTrackr project directory**:
   - Error message: "Not in StackTrackr project directory"
   - Solution: Ensure you are running the script from the StackTrackr project root directory.

1. **Missing or corrupted memory system files**:
   - Error message: "Error processing memory system files"
   - Solution: Verify that the required memory system files (e.g., `memory.json`, `bugs.json`, `roadmap.json`) are present and not corrupted.

1. **Insufficient permissions to write the output files**:
   - Error message: "Permission denied" when trying to create the Markdown files
   - Solution: Ensure the script has the necessary permissions to write files to the `portable_exchange` directory.

If you encounter any other issues, please check the script's console output for more information or seek assistance from the rEngine Core development team.
