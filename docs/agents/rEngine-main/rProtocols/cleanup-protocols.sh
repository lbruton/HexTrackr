#!/bin/bash

# rProtocols Cleanup Script
# Moves redundant protocols to deprecated folder since they're covered by numbered protocols

set -e

PROJECT_ROOT="/Volumes/DATA/GitHub/rEngine"
PROTOCOLS_DIR="$PROJECT_ROOT/rProtocols"
NUMBERED_DIR="$PROTOCOLS_DIR/numbered"
DEPRECATED_DIR="$PROTOCOLS_DIR/deprecated"

echo "🧹 rProtocols Cleanup Analysis"
echo "==============================="

# Create deprecated directory if it doesn't exist
mkdir -p "$DEPRECATED_DIR"

# List of files that are covered by numbered protocols
declare -a REDUNDANT_FILES=(
    "memory_management_protocol.md"           # Covered by 001-MEMORY-MGT-001
    "rEngine_startup_protocol.md"             # Covered by 002-RENGINE-START-001  
    "session_handoff_protocol.md"             # Covered by 004-SESSION-HANDOFF-001
    "token_limit_management_protocol.md"      # Covered by 019-TOKEN-MGT-001
    "enhanced_scribe_system_protocol.md"      # Legacy system
    "document_sweep_protocol.md"              # Automated, less critical
    "file_cleanup_protocol.md"                # One-time cleanup protocols
    "folder_organization_protocol.md"         # One-time cleanup protocols
    "root_directory_cleanup_protocol.md"      # One-time cleanup protocols
    "scribe_deprecation_summary.md"           # Historical document
    "handoff.md"                              # Duplicate of session handoff
    "launch-scribe-console.md"                # Legacy system reference
    "view_mcp_memory_log.md"                  # Debug procedure, not core protocol
)

# Files to keep (essential and not covered by numbered protocols)
declare -a KEEP_FILES=(
    "README.md"
    "UNIVERSAL_AGENT_SYSTEM_PROMPT.md"
    "documentation_structure_protocol.md"
    "git_commit_standards_protocol.md"
    "api_configuration_protocol.md"
    "rengine_protocol_stack_architecture.md"
    "protocols.json"
    "system_matrix.json" 
    "ai_tools_registry.json"
    "numbered/"
    "drafts/"
)

echo "📋 Analysis Results:"
echo ""

echo "✅ KEEP (Essential & Active):"
for file in "${KEEP_FILES[@]}"; do
    if [ -e "$PROTOCOLS_DIR/$file" ]; then
        echo "   📌 $file"
    fi
done

echo ""
echo "🗂️  MOVE TO DEPRECATED (Covered by numbered protocols):"
for file in "${REDUNDANT_FILES[@]}"; do
    if [ -e "$PROTOCOLS_DIR/$file" ]; then
        echo "   📦 $file → deprecated/"
    fi
done

echo ""
echo "🔍 NUMBERED PROTOCOLS (Master Reference):"
for file in "$NUMBERED_DIR"/*.md; do
    if [ -f "$file" ]; then
        basename "$file"
        # Extract title from first line
        head -n 1 "$file" | sed 's/^# /   📋 /'
    fi
done

echo ""
echo "💡 RECOMMENDATION:"
echo "   • Keep only essential protocols in main directory"
echo "   • Use numbered protocols as primary reference"
echo "   • Move redundant files to deprecated/"
echo "   • AI should reference numbered protocols first"

echo ""
read -p "Do you want to execute the cleanup? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Executing cleanup..."
    
    for file in "${REDUNDANT_FILES[@]}"; do
        if [ -e "$PROTOCOLS_DIR/$file" ]; then
            echo "   📦 Moving $file to deprecated/"
            mv "$PROTOCOLS_DIR/$file" "$DEPRECATED_DIR/"
        fi
    done
    
    echo ""
    echo "✅ Cleanup complete!"
    echo "📁 Main rProtocols/ now contains only essential protocols"
    echo "🔢 Numbered protocols in rProtocols/numbered/ are the primary reference"
    echo "📦 Redundant protocols moved to rProtocols/deprecated/"
else
    echo "❌ Cleanup cancelled"
fi
