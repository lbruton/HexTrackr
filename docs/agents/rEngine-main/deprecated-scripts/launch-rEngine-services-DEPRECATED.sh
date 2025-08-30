#!/bin/bash

# One-Click Startup Script for rEngine Platform  
# Launches all necessary components in separate terminal windows.

# Get the absolute path to the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting the entire rEngine development environment..."
echo "This will open multiple terminal windows."
echo ""
echo "📋 PROTOCOL REMINDER:"
echo "   • Check /rProtocols/ folder for operational procedures"
echo "   • GitHub Copilot: You are the HEAD ORCHESTRATOR for rEngine"
echo "   • Always check available MCP tools before starting tasks"
echo ""

# 1. Launch Docker Environment
echo "➡️ Launching Docker environment..."
"$SCRIPT_DIR/start-environment.sh"

# 2. Launch Core System
echo "➡️ Launching core system..."
"$SCRIPT_DIR/launch-system.sh"

echo "✅ rEngine services launched! Please check the new Terminal windows."

