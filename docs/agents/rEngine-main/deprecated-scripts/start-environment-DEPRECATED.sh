#!/bin/bash
# This script launches the Docker development environment in a new, external Terminal window
# to prevent VS Code from capturing script prompts and ensure correct execution context.

# Get the absolute path to the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_DIR/docker"

# Use osascript to open a new Terminal window and execute the docker-dev.sh script
osascript -e "tell application \"Terminal\"
    activate
    do script \"cd '${DOCKER_DIR}' && ./docker-dev.sh start\"
end tell"

echo "🚀 Launching Docker environment in a new Terminal window."
