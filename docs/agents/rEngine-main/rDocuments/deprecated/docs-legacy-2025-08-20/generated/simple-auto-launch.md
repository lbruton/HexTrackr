# rEngine Core: `simple-auto-launch.sh` Documentation

## Purpose & Overview

The `simple-auto-launch.sh` script is part of the rEngine Core ecosystem and is responsible for automatically launching the "Enhanced Scribe Console" application. This console is a crucial component of the rEngine platform, providing real-time file monitoring, change tracking, and logging functionalities.

When the script is executed, it performs the following key tasks:

1. Checks for and kills any existing "Enhanced Scribe Console" or "Smart Scribe" processes to ensure a clean start.
2. Attempts to open a new Terminal window and launch the `enhanced-scribe-console.js` application within it.
3. If the Terminal window launch fails, it falls back to running the `enhanced-scribe-console.js` application in the background.
4. Displays information about the active Scribe Console features and its running status.

This script provides a seamless and automated way to start the Enhanced Scribe Console, which is essential for developers and users working with the rEngine Core platform.

## Key Functions/Classes

The `simple-auto-launch.sh` script does not contain any specific functions or classes. It is a Bash script that leverages various Bash commands and utilities to achieve its goal of launching the Enhanced Scribe Console.

The key components and their roles are:

1. **Bash Script**: The overall script that coordinates the launch process and handles different scenarios.
2. **Terminal Window Launch**: Attempts to open a new Terminal window and run the `enhanced-scribe-console.js` application within it.
3. **Background Mode**: Runs the `enhanced-scribe-console.js` application in the background if the Terminal window launch fails.
4. **Process Management**: Kills any existing "Enhanced Scribe Console" or "Smart Scribe" processes before launching the new one.
5. **Status Reporting**: Displays information about the active Scribe Console features and its running status.

## Dependencies

The `simple-auto-launch.sh` script has the following dependencies:

1. **Node.js**: The `enhanced-scribe-console.js` application requires a functioning Node.js environment to run.
2. **Terminal/Shell**: The script relies on a terminal or shell environment to execute commands and launch the Enhanced Scribe Console.
3. **AppleScript (macOS)**: On macOS systems, the script uses AppleScript to open a new Terminal window and launch the `enhanced-scribe-console.js` application.

## Usage Examples

To use the `simple-auto-launch.sh` script, follow these steps:

1. Ensure that you have Node.js installed on your system.
2. Save the `simple-auto-launch.sh` script to a directory of your choice.
3. Open a terminal or shell window and navigate to the directory containing the script.
4. Make the script executable by running the following command:

   ```bash
   chmod +x simple-auto-launch.sh
   ```

1. Run the script by executing the following command:

   ```bash
   ./simple-auto-launch.sh
   ```

   The script will then launch the Enhanced Scribe Console, either in a new Terminal window or in the background, depending on the system's capabilities.

## Configuration

The `simple-auto-launch.sh` script does not require any specific configuration. However, it assumes that the `enhanced-scribe-console.js` application is located in the `/Volumes/DATA/GitHub/rEngine/rEngine` directory. If the location of this file is different, you will need to update the script accordingly.

## Integration Points

The `simple-auto-launch.sh` script is a part of the rEngine Core ecosystem and is designed to work seamlessly with the following components:

1. **Enhanced Scribe Console**: The script is responsible for launching and managing the Enhanced Scribe Console application, which is a crucial component of the rEngine platform.
2. **rEngine Core Platform**: The Enhanced Scribe Console is an integral part of the rEngine Core platform and provides real-time file monitoring and logging capabilities.

## Troubleshooting

Here are some common issues and solutions related to the `simple-auto-launch.sh` script:

1. **Terminal window launch fails**:
   - Ensure that the Terminal application is installed and accessible on your system.
   - Check the script for any hard-coded paths or references to the `enhanced-scribe-console.js` application and update them if necessary.

1. **Background mode fails to start**:
   - Verify that the Node.js environment is properly installed and configured on your system.
   - Check the script for any hard-coded paths or references to the `enhanced-scribe-console.js` application and update them if necessary.

1. **Scribe Console is not running**:
   - Check the log file (`scribe-console.log`) for any error messages or clues about the issue.
   - Ensure that the `enhanced-scribe-console.js` application is available and functioning correctly.
   - Verify that the script is able to locate and launch the `enhanced-scribe-console.js` application.

If you encounter any other issues or have questions about the `simple-auto-launch.sh` script, please reach out to the rEngine Core support team for assistance.
