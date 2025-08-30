# `restart-full-scribe-system.sh`

## Purpose & Overview

The `restart-full-scribe-system.sh` script is a critical component of the rEngine Core platform, responsible for managing the full "Scribe System" - a set of integrated processes that power the intelligent agent's memory, analysis, and monitoring capabilities.

This script ensures that the two main Scribe System components - the "Smart Scribe" (Ollama agent) and the "Split Console" (visual monitoring) - are properly initialized, restarted, and verified to be running. It acts as a central control point for maintaining the overall health and functionality of the Scribe System.

## Key Functions/Classes

1. **Smart Scribe (Ollama agent)**: The core component responsible for logging conversations, optimizing memory usage, and building knowledge graphs. This agent is started in the background by the script.

1. **Split Console (Visual monitoring)**: A separate process that provides real-time visual monitoring of the agent's memory operations and activity. The script launches this component using the `auto-launch-split-scribe.sh` script.

1. **Restart Process**: The main function of the script is to gracefully kill any existing Scribe System processes, start the Smart Scribe and Split Console components, and then verify that both are running correctly.

## Dependencies

- **Node.js**: The Smart Scribe component is a Node.js application, so the system must have Node.js installed.
- **StackTrackr rEngine**: This script is specific to the rEngine Core platform and relies on various rEngine components and directories.
- **`auto-launch-split-scribe.sh`**: The script launches the Split Console component using this auxiliary script.

## Usage Examples

To use the `restart-full-scribe-system.sh` script, simply execute it from the command line:

```bash
cd /Volumes/DATA/GitHub/rEngine/rEngine
./restart-full-scribe-system.sh
```

This will trigger the full restart of the Scribe System, including the Smart Scribe and Split Console components.

## Configuration

The script does not require any explicit configuration, as it relies on the underlying rEngine Core platform for the necessary environment variables and file paths. However, it's important to ensure that the correct directories and dependencies are set up correctly in the rEngine Core environment.

## Integration Points

The `restart-full-scribe-system.sh` script is a critical component of the rEngine Core platform, as it manages the core Scribe System that powers the intelligent agent's memory and analysis capabilities. It integrates with the following rEngine Core components:

1. **Smart Scribe (Ollama agent)**: The script starts and verifies the running status of the Smart Scribe component, which is responsible for logging conversations, optimizing memory, and building knowledge graphs.
2. **Split Console (Visual monitoring)**: The script launches the Split Console component, which provides real-time visual monitoring of the agent's memory operations and activity.
3. **rEngine Core Platform**: The script relies on the underlying rEngine Core platform for file paths, environment variables, and other dependencies.

## Troubleshooting

If the `restart-full-scribe-system.sh` script encounters any issues, here are some common problems and solutions:

1. **Smart Scribe Startup Failure**:
   - Check the `smart-scribe-startup.log` file for any error messages or clues about the failure.
   - Ensure that the correct Node.js version is installed and that the `node` command is available in the system's PATH.
   - Verify that the `/Volumes/DATA/GitHub/rEngine/rEngine` directory exists and is accessible.

1. **Split Console Startup Failure**:
   - Verify that the `auto-launch-split-scribe.sh` script is present and executable.
   - Check the system's process list to see if the `split-scribe-console.js` process is running.
   - Ensure that the rEngine Core platform is configured correctly and that all necessary dependencies are installed.

1. **Verification Failures**:
   - If the script fails to verify the running status of the Smart Scribe or Split Console components, check the corresponding process IDs and process lists.
   - Ensure that the necessary process IDs are being correctly captured and stored in the script's variables.

If you encounter any other issues or need further assistance, please consult the rEngine Core documentation or reach out to the rEngine support team.
