#!/usr/bin/env bash
# Launch Memory Bridge in a new Terminal.app window for transparency logs
# macOS only

PROJECT_DIR="/Volumes/DATA/GitHub/rEngine"
BRIDGE_PATH="$PROJECT_DIR/rEngine/memory-bridge.cjs"

if [ ! -f "$BRIDGE_PATH" ]; then
  echo "Memory Bridge not found at $BRIDGE_PATH"
  exit 1
fi

osascript <<EOF
-- Open a new Terminal window and run Memory Bridge with colored banner
set projectDir to "$PROJECT_DIR"
set bridgeCmd to "cd '" & projectDir & "' && echo -e '\n\033[95m🧠 Memory Bridge Transparent Logs\033[0m' && echo -e '\033[94mWatching recall + memory writes with full transparency\033[0m\n' && node rEngine/memory-bridge.cjs"

tell application "Terminal"
  activate
  do script bridgeCmd
  delay 0.2
  set custom title of front window to "Memory Bridge Logs"
end tell
EOF
