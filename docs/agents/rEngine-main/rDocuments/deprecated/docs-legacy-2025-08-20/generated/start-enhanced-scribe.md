# Enhanced Scribe Console Launcher

## Purpose & Overview

The `start-enhanced-scribe.sh` script is a part of the rEngine Core platform, and it is responsible for launching the Enhanced Scribe Console, which is a dedicated terminal-based interface for the Scribe component of the rEngine Core system. The script provides two modes of operation: an interactive mode that opens the Scribe console in a new terminal tab/window, and a background mode that runs the Scribe console in the background, allowing for automated monitoring and logging.

## Key Functions/Classes

1. **`check_vscode_terminal()`**: This function checks if the current environment is a Visual Studio Code (VS Code) environment. It returns 0 if the environment is VS Code, and 1 otherwise.

1. **`start_dedicated_terminal()`**: This function starts the Enhanced Scribe Console in a dedicated terminal. If the environment is a VS Code environment, it starts the console in the current integrated terminal. Otherwise, it opens a new tab in the macOS Terminal application and runs the Scribe console there.

1. **`start_background_mode()`**: This function starts the Enhanced Scribe Console in background mode, which runs the Scribe console in the background and logs its output to a file named `scribe-console.log`.

## Dependencies

The `start-enhanced-scribe.sh` script depends on the following:

1. **Node.js**: The Scribe console is a Node.js application, so the system must have Node.js installed.
2. **macOS Terminal**: If the environment is not a VS Code environment, the script uses the macOS Terminal application to open a new tab and run the Scribe console.

## Usage Examples

1. **Interactive Mode**:

   ```bash
   ./start-enhanced-scribe.sh
   ```

   This will start the Enhanced Scribe Console in a dedicated terminal window or tab.

1. **Background Mode**:

   ```bash
   ./start-enhanced-scribe.sh background
   ```

   This will start the Enhanced Scribe Console in the background, and the console's logs will be written to the `scribe-console.log` file.

1. **Help**:

   ```bash
   ./start-enhanced-scribe.sh help
   ```

   This will display the usage information for the script.

## Configuration

The `start-enhanced-scribe.sh` script does not require any specific configuration. However, it does assume that the Scribe console application (`enhanced-scribe-console.js`) is located in the `/Volumes/DATA/GitHub/rEngine/rEngine` directory.

## Integration Points

The Enhanced Scribe Console is a component of the rEngine Core platform, and it is intended to be used in conjunction with other rEngine Core components, such as the Scribe component itself. The Scribe component is responsible for processing and analyzing data, and the Enhanced Scribe Console provides a user-friendly interface for interacting with the Scribe component.

## Troubleshooting

1. **Scribe console not starting**: Ensure that the `enhanced-scribe-console.js` file is present in the `/Volumes/DATA/GitHub/rEngine/rEngine` directory and that the Node.js runtime is installed on the system.

1. **Logs not being generated**: In background mode, the logs are written to the `scribe-console.log` file in the `/Volumes/DATA/GitHub/rEngine/rEngine` directory. Ensure that the directory and file permissions are correct.

1. **VS Code integration not working**: Ensure that the script is being run from within a VS Code environment. The `check_vscode_terminal()` function checks for the presence of the `TERM_PROGRAM` environment variable, which is set by VS Code.

If you encounter any other issues, please refer to the rEngine Core documentation or reach out to the rEngine Core support team for further assistance.
