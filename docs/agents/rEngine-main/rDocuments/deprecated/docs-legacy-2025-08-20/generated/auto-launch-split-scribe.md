# rEngine Core: Auto-Launch Split Scribe Console

## Purpose & Overview

The `auto-launch-split-scribe.sh` script is a crucial component within the rEngine Core ecosystem. It provides an automated way to launch the "Split Scribe Console" - a powerful development tool that enhances the debugging and monitoring experience for rEngine-based applications.

The Split Scribe Console opens an external terminal window with a split display, presenting the last 5 changes on the left side and the full verbose log on the right side. This setup enables real-time file monitoring and interactive commands, allowing developers to efficiently track and analyze the behavior of their rEngine applications.

## Key Functions/Classes

The script performs the following key functions:

1. **Cleanup**: It first kills any existing "enhanced-scribe-console.js" and "split-scribe-console.js" processes to ensure a clean environment.
2. **Terminal Launch**: The script then launches an external Terminal window and positions it on the left side of the screen. It also sets the window title to "StackTrackr Scribe Console".
3. **Console Startup**: Inside the Terminal window, the script executes the "split-scribe-console.js" script, which starts the Split Scribe Console.
4. **Fallback**: If the AppleScript-based terminal launch fails, the script falls back to a simpler method of opening a new Terminal tab and running the "split-scribe-console.js" script.

## Dependencies

The `auto-launch-split-scribe.sh` script depends on the following components:

1. **Node.js**: The script assumes that Node.js is installed on the system, as it executes the "split-scribe-console.js" script, which is a Node.js application.
2. **split-scribe-console.js**: This is the main script that powers the Split Scribe Console functionality. It must be present in the `/Volumes/DATA/GitHub/rEngine/rEngine` directory.

## Usage Examples

To use the `auto-launch-split-scribe.sh` script, follow these steps:

1. Ensure that you have the necessary dependencies (Node.js and the "split-scribe-console.js" script) installed and configured correctly.
2. Navigate to the `/Volumes/DATA/GitHub/rEngine/rEngine` directory in your terminal.
3. Run the script using the following command:

   ```bash
   ./auto-launch-split-scribe.sh
   ```

   This will automatically launch the Split Scribe Console in an external Terminal window.

## Configuration

The `auto-launch-split-scribe.sh` script does not require any specific configuration. However, the script assumes that the "split-scribe-console.js" script is located in the `/Volumes/DATA/GitHub/rEngine/rEngine` directory.

## Integration Points

The `auto-launch-split-scribe.sh` script is an integral part of the rEngine Core ecosystem. It provides a seamless way to access the Split Scribe Console, which is a crucial tool for developers working with rEngine-based applications. The console's real-time monitoring and interactive capabilities make it a valuable asset for debugging, troubleshooting, and understanding the behavior of rEngine applications.

## Troubleshooting

1. **Terminal Launch Failure**: If the AppleScript-based terminal launch fails, the script will attempt a fallback method by opening a new Terminal tab and running the "split-scribe-console.js" script. If this also fails, the script will provide instructions for manually running the "split-scribe-console.js" script.

1. **Missing Dependencies**: Ensure that you have Node.js installed and that the "split-scribe-console.js" script is present in the `/Volumes/DATA/GitHub/rEngine/rEngine` directory. If these dependencies are not met, the script will not be able to launch the Split Scribe Console successfully.

1. **Existing Scribe Processes**: The script attempts to clean up any existing "enhanced-scribe-console.js" and "split-scribe-console.js" processes before launching the new console. If the cleanup process fails, you may need to manually terminate any running scribe processes before running the script.

If you encounter any other issues or have questions, please refer to the rEngine Core documentation or reach out to the rEngine Core support team for assistance.
