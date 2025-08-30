#!/bin/bash

# ============================================================================
# 📁 rEngine Startup Script Organization Tool
# ============================================================================
# 
# This script consolidates all scattered startup/launch scripts into the 
# robust-startup-package folder and marks old versions as deprecated.
#
# ROADMAP COMPLIANCE: Prepares for multi-IDE expansion by centralizing
# all operating system level scripts in one organized location.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROBUST_DIR="${SCRIPT_DIR}/robust-startup-package"
DEPRECATED_DIR="${SCRIPT_DIR}/deprecated-scripts"

echo "🗂️  rEngine Script Organization Tool"
echo "======================================"
echo "📂 Robust Package: ${ROBUST_DIR}"
echo "🗑️  Deprecated: ${DEPRECATED_DIR}"
echo ""

# Create directories if they don't exist
mkdir -p "${DEPRECATED_DIR}"
mkdir -p "${ROBUST_DIR}"

# ============================================================================
# Active Scripts to Keep in Robust Package
# ============================================================================
ACTIVE_SCRIPTS=(
    "robust-startup-protocol.sh"
    "quick-start-enhanced.sh" 
    "emergency-recovery.sh"
    "setup-robust-system.sh"
    "monitor-protocol-state.sh"
    "validate-protocol-stack.sh"
    "cleanup-ollama-system-drive.sh"
    "test-ollama-config.sh"
    "manual-cleanup.sh"
)

echo "✅ Active scripts already in robust-startup-package:"
for script in "${ACTIVE_SCRIPTS[@]}"; do
    if [[ -f "${ROBUST_DIR}/${script}" ]]; then
        echo "   ✓ ${script}"
    else
        echo "   ❌ MISSING: ${script}"
    fi
done
echo ""

# ============================================================================
# Scripts to Move INTO Robust Package
# ============================================================================
echo "📥 Moving scripts INTO robust-startup-package..."

# Core startup scripts from root
if [[ -f "${SCRIPT_DIR}/robust-startup-protocol.sh" ]]; then
    echo "   Moving root robust-startup-protocol.sh → deprecated"
    mv "${SCRIPT_DIR}/robust-startup-protocol.sh" "${DEPRECATED_DIR}/robust-startup-protocol-OLD.sh"
fi

if [[ -f "${SCRIPT_DIR}/quick-start-enhanced.sh" ]]; then
    echo "   Moving root quick-start-enhanced.sh → deprecated"
    mv "${SCRIPT_DIR}/quick-start-enhanced.sh" "${DEPRECATED_DIR}/quick-start-enhanced-OLD.sh"
fi

# AppleScript launcher (should stay in robust package)
if [[ -f "${SCRIPT_DIR}/launch-smart-docs.applescript" ]]; then
    echo "   Moving launch-smart-docs.applescript → robust-startup-package"
    cp "${SCRIPT_DIR}/launch-smart-docs.applescript" "${ROBUST_DIR}/launch-smart-docs.applescript"
fi

# Memory sync automation
if [[ -f "${SCRIPT_DIR}/memory-sync-automation.sh" ]]; then
    echo "   Moving memory-sync-automation.sh → robust-startup-package"
    cp "${SCRIPT_DIR}/memory-sync-automation.sh" "${ROBUST_DIR}/memory-sync-automation.sh"
fi

# MCP manager scripts
if [[ -f "${SCRIPT_DIR}/integrated-mcp-manager.sh" ]]; then
    echo "   Moving integrated-mcp-manager.sh → robust-startup-package"
    cp "${SCRIPT_DIR}/integrated-mcp-manager.sh" "${ROBUST_DIR}/integrated-mcp-manager.sh"
fi

echo ""

# ============================================================================
# Scripts to Mark as DEPRECATED
# ============================================================================
echo "🗑️  Moving scripts to deprecated..."

# Find and deprecate scattered startup scripts
find "${SCRIPT_DIR}" -name "*start*.sh" -not -path "*/robust-startup-package/*" -not -path "*/deprecated-scripts/*" -not -path "*/backups/*" -not -path "*/rProjects/*" | while read -r script; do
    if [[ -f "$script" ]]; then
        basename_script=$(basename "$script")
        echo "   Deprecating: ${script}"
        cp "$script" "${DEPRECATED_DIR}/${basename_script%.sh}-DEPRECATED.sh"
    fi
done

# Find and deprecate scattered launch scripts  
find "${SCRIPT_DIR}" -name "*launch*.sh" -not -path "*/robust-startup-package/*" -not -path "*/deprecated-scripts/*" -not -path "*/backups/*" -not -path "*/rProjects/*" | while read -r script; do
    if [[ -f "$script" ]]; then
        basename_script=$(basename "$script")
        echo "   Deprecating: ${script}"
        cp "$script" "${DEPRECATED_DIR}/${basename_script%.sh}-DEPRECATED.sh"
    fi
done

# Mark old quick-start variants
if [[ -f "${SCRIPT_DIR}/quick-start.sh" ]]; then
    echo "   Deprecating: quick-start.sh"
    mv "${SCRIPT_DIR}/quick-start.sh" "${DEPRECATED_DIR}/quick-start-DEPRECATED.sh"
fi

echo ""

# ============================================================================
# Create Deprecation Notice Files
# ============================================================================
cat > "${DEPRECATED_DIR}/README.md" << 'EOF'
# ⚠️ DEPRECATED SCRIPTS

These scripts have been moved to the `robust-startup-package` folder for organization.

## 🚀 Use Instead:
- `../robust-startup-package/robust-startup-protocol.sh` - Main startup
- `../robust-startup-package/quick-start-enhanced.sh` - Quick launch  
- `../robust-startup-package/emergency-recovery.sh` - Recovery mode

## 📋 Organization Strategy:
All operating system level scripts are now centralized in `robust-startup-package/` 
to prepare for multi-IDE expansion (VS Code → Cursor → IntelliJ) as per roadmap.

## 🗑️ Safe to Delete:
These deprecated scripts can be safely deleted after confirming the new 
organized versions work correctly.
EOF

# ============================================================================
# Create Master Launcher in Robust Package
# ============================================================================
cat > "${ROBUST_DIR}/master-launcher.sh" << 'EOF'
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
echo "1) 🔧 Robust Startup Protocol (Full System)"  
echo "2) ⚡ Quick Start Enhanced (Fast Launch)"
echo "3) 🚨 Emergency Recovery"
echo "4) 📊 Monitor Protocol State"
echo "5) ✅ Validate Protocol Stack"
echo "6) 🧹 Cleanup Ollama System"
echo "7) 🔧 Setup Robust System"
echo ""
read -p "Select option (1-7): " choice

case $choice in
    1) "${SCRIPT_DIR}/robust-startup-protocol.sh" ;;
    2) "${SCRIPT_DIR}/quick-start-enhanced.sh" ;;
    3) "${SCRIPT_DIR}/emergency-recovery.sh" ;;
    4) "${SCRIPT_DIR}/monitor-protocol-state.sh" ;;
    5) "${SCRIPT_DIR}/validate-protocol-stack.sh" ;;
    6) "${SCRIPT_DIR}/cleanup-ollama-system-drive.sh" ;;
    7) "${SCRIPT_DIR}/setup-robust-system.sh" ;;
    *) echo "❌ Invalid choice" ;;
esac
EOF

chmod +x "${ROBUST_DIR}/master-launcher.sh"

# ============================================================================
# Summary
# ============================================================================
echo "======================================"
echo "✅ SCRIPT ORGANIZATION COMPLETE"
echo ""
echo "📂 Active Scripts Location:"
echo "   ${ROBUST_DIR}/"
echo ""
echo "🗑️  Deprecated Scripts:"
echo "   ${DEPRECATED_DIR}/"
echo ""
echo "🚀 New Master Launcher:"
echo "   ${ROBUST_DIR}/master-launcher.sh"
echo ""
echo "💡 Next Steps:"
echo "   1. Test: ${ROBUST_DIR}/master-launcher.sh"
echo "   2. Update any external references"
echo "   3. Delete deprecated folder when confirmed working"
echo "======================================"
