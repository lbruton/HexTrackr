#!/bin/bash

# ============================================================================
# 🚀 rEngine Master Launcher
# ============================================================================
# Single entry point for all rEngine startup operations
# Roadmap ready for multi-IDE expansion

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 rEngine Master Launcher"
echo "=========================="
echo "1) 🔧 Robust Startup Protocol (Full System + Cleanup)"  
echo "2) ⚡ Quick Start Enhanced (Fast Launch + Cleanup)"
echo "3) 🚨 Emergency Recovery"
echo "4) 📊 Monitor Protocol State"
echo "5) ✅ Validate Protocol Stack"
echo "6) 🧹 Cleanup Ollama System"
echo "7) 🔧 Setup Robust System"
echo "8) 🧹 Cleanup All Processes (Standalone)"
echo "9) 🤖 Model Manager (Check/Switch AI Models)"
echo ""
echo "💡 All startup options include automatic cleanup of existing processes"
echo ""
read -p "Select option (1-9): " choice

case $choice in
    1) "${SCRIPT_DIR}/robust-startup-protocol.sh" ;;
    2) "${SCRIPT_DIR}/quick-start-enhanced.sh" ;;
    3) "${SCRIPT_DIR}/emergency-recovery.sh" ;;
    4) "${SCRIPT_DIR}/monitor-protocol-state.sh" ;;
    5) "${SCRIPT_DIR}/validate-protocol-stack.sh" ;;
    6) "${SCRIPT_DIR}/cleanup-ollama-system-drive.sh" ;;
    7) "${SCRIPT_DIR}/setup-robust-system.sh" ;;
    8) "${SCRIPT_DIR}/cleanup-all-processes.sh" ;;
    9) "${SCRIPT_DIR}/model-manager.sh" ;;
    *) echo "❌ Invalid choice" ;;
esac
