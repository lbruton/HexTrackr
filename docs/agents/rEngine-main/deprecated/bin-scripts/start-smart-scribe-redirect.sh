#!/bin/bash

# Enhanced Smart Scribe Startup with Process and Memory Monitoring
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SAFE_SCRIPT="$SCRIPT_DIR/start-smart-scribe-safe.sh"

# Use the enhanced startup script
exec "$SAFE_SCRIPT" "$@"
