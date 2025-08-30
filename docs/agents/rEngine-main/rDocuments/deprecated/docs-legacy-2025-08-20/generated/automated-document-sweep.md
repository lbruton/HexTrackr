# Automated Document Sweep Script for rEngine Core

## Purpose & Overview

The `automated-document-sweep.sh` script is a crucial component of the rEngine Core platform, responsible for automating the generation of technical documentation. This script runs the AI-powered `document-sweep.js` script, which analyzes the codebase and generates comprehensive documentation files in Markdown format. The primary purpose of this script is to ensure that the documentation is kept up-to-date and readily available for developers working with the rEngine Core ecosystem.

## Key Functions/Classes

1. **`check_prerequisites()`**: This function verifies that the necessary dependencies, such as Node.js and the `document-sweep.js` script, are present and accessible.
2. **`run_document_sweep()`**: This function executes the `document-sweep.js` script, capturing the output and logging the results. It also checks for the presence of newly generated documentation files.
3. **`cleanup_old_logs()`**: This function removes old log files, keeping only the most recent ones to maintain a clean and organized log directory.
4. **`generate_summary()`**: This function generates a summary of the document sweep execution, including the total number of documentation files, the total size of the generated documentation, and the timestamp of the last run.
5. **`main()`**: This is the main entry point of the script, which orchestrates the execution of the previous functions.

## Dependencies

The `automated-document-sweep.sh` script has the following dependencies:

1. **Node.js**: The script requires Node.js to be installed and available in the system's `PATH`.
2. **`document-sweep.js`**: This script is the core of the documentation generation process and must be present in the expected location (`$PROJECT_ROOT/rEngine/document-sweep.js`).

## Usage Examples

To run the automated document sweep, you can execute the `automated-document-sweep.sh` script from the command line:

```bash
./scripts/automated-document-sweep.sh
```

This will trigger the document sweep process, generate the necessary documentation, and produce a log file in the `logs` directory.

## Configuration

The script uses the following configuration variables:

| Variable | Description |
| --- | --- |
| `SCRIPT_DIR` | The directory containing the script. |
| `PROJECT_ROOT` | The root directory of the rEngine Core project. |
| `LOG_DIR` | The directory where the log files will be stored. |
| `DOCUMENT_SWEEP_SCRIPT` | The path to the `document-sweep.js` script. |
| `TIMESTAMP` | The timestamp used for the log file name. |
| `LOG_FILE` | The full path to the log file. |

These variables are used throughout the script to manage the execution environment and paths.

## Integration Points

The `automated-document-sweep.sh` script is a key component of the rEngine Core platform, as it ensures that the documentation is automatically generated and kept up-to-date. It integrates with the following rEngine Core components:

1. **`document-sweep.js`**: This script is responsible for the actual generation of the documentation and is executed by the `automated-document-sweep.sh` script.
2. **`docs/generated`**: The generated documentation files are stored in this directory, which is part of the rEngine Core project structure.
3. **Logging**: The script generates log files in the `logs` directory, which can be used for troubleshooting and monitoring the document sweep process.

## Troubleshooting

Here are some common issues and solutions related to the `automated-document-sweep.sh` script:

1. **Node.js not found**: If the script fails with the error "Node.js is not installed or not in PATH", ensure that Node.js is installed and available in the system's `PATH`.
2. **`document-sweep.js` not found**: If the script fails with the error "Document sweep script not found", verify that the `document-sweep.js` script is present in the expected location (`$PROJECT_ROOT/rEngine/document-sweep.js`).
3. **Not in the correct project directory**: If the script fails with the error "Not in StackTrackr project directory", ensure that you are running the script from the root directory of the rEngine Core project.
4. **Document sweep timed out**: If the script reports a timeout, it means the document sweep process took longer than the allowed 30 minutes. This may indicate a larger codebase or a problem with the `document-sweep.js` script. Consider increasing the timeout or investigating the underlying issue.
5. **Document sweep failed**: If the script reports a failure, check the log file for more information about the error and use it to troubleshoot the issue.

Remember, the `automated-document-sweep.sh` script is a critical component of the rEngine Core platform, so any issues should be addressed promptly to ensure the documentation remains up-to-date and accessible to developers.
