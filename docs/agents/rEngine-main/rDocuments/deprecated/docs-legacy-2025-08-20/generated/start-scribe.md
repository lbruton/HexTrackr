# StackTrackr Scribe Startup Script

## Purpose & Overview

The `start-scribe.sh` script is a crucial component in the rEngine Core ecosystem, responsible for launching the "Smart Scribe" system, a background process that monitors and logs AI-powered conversations within the StackTrackr application.

This script is designed to be run independently of the Visual Studio Code (VS Code) development environment, ensuring that the Scribe continues to operate even if the main StackTrackr application is closed or the development environment is terminated.

The Scribe plays a vital role in the rEngine Core platform by capturing and preserving the context and content of AI-driven interactions, which can be later analyzed and used to improve the performance and capabilities of the StackTrackr application.

## Key Functions/Classes

The `start-scribe.sh` script performs the following key functions:

1. **System Checks**: The script verifies the presence of the necessary directories and files, ensuring that the rEngine Core components are properly configured and accessible.
2. **Process Management**: The script checks for any existing Scribe processes and terminates them before starting a new instance. This ensures that only one Scribe process is running at a time.
3. **Startup Sequence**: The script launches the `smart-scribe.js` script within the rEngine directory, which is the main entry point for the Scribe system.
4. **Logging and Monitoring**: The script provides instructions for monitoring the Scribe's status, viewing the log file, and managing the Scribe process.

## Dependencies

The `start-scribe.sh` script relies on the following dependencies:

1. **Node.js**: The script requires a functional Node.js installation on the host system to execute the `smart-scribe.js` script.
2. **rEngine Core Components**: The script assumes the presence of the `rEngine` and `rMemory/rAgentMemories` directories, as well as the `smart-scribe.js` file within the `rEngine` directory.

## Usage Examples

To use the `start-scribe.sh` script, follow these steps:

1. Open a terminal or command prompt and navigate to the StackTrackr project directory.
2. Run the script using the following command:

   ```bash
   ./bin/start-scribe.sh
   ```

   This will start the Scribe system in the background, and the script will provide instructions for monitoring its status and managing the process.

## Configuration

The `start-scribe.sh` script does not require any specific configuration. However, it assumes that the necessary rEngine Core components are properly set up and accessible within the StackTrackr project directory.

## Integration Points

The `start-scribe.sh` script is a crucial integration point between the StackTrackr application and the rEngine Core platform. It ensures that the Scribe system is running and capturing the necessary data for improving the AI-powered features of StackTrackr.

The Scribe system is designed to work seamlessly with other rEngine Core components, such as the `rMemory` module, which stores the captured conversation data for further analysis and processing.

## Troubleshooting

If you encounter any issues while using the `start-scribe.sh` script, here are some common problems and their solutions:

### Error: Not in StackTrackr directory. Please check the path

Ensure that you are running the script from the correct directory, which should be the root of the StackTrackr project.

### Error: rEngine directory not found

Verify that the `rEngine` directory is present within the StackTrackr project directory.

### Error: rMemory/rAgentMemories directory not found

Ensure that the `rMemory/rAgentMemories` directory is present within the StackTrackr project directory.

### Error: smart-scribe.js not found in rEngine

Verify that the `smart-scribe.js` file is present within the `rEngine` directory.

### Error: Node.js not found

Ensure that you have a working Node.js installation on your system. You can check the version by running `node --version` in the terminal.

If you encounter any other issues, check the `scribe.log` file for more details, and consult the rEngine Core documentation or reach out to the development team for further assistance.
