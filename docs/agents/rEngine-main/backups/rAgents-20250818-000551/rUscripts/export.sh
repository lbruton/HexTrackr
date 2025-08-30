#!/bin/bash
# StackTrackr Quick Export
# One-command exports for any LLM

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Quick export shortcuts
case "${1:-help}" in
    # Vendor-specific quick exports
    chatgpt|gpt)
        echo "🤖 Creating ChatGPT-optimized export..."
        "$SCRIPT_DIR/universal_export.sh" zip --llm chatgpt --public
        ;;
    
    claude)
        echo "🧠 Creating Claude-optimized export..."
        "$SCRIPT_DIR/universal_export.sh" markdown --llm claude --public
        ;;
    
    gemini)
        echo "💎 Creating Gemini-optimized export..."
        "$SCRIPT_DIR/universal_export.sh" zip --llm gemini --public
        ;;
    
    copilot)
        echo "🚁 Creating GitHub Copilot export..."
        "$SCRIPT_DIR/universal_export.sh" memory --llm copilot --public
        ;;
    
    # Format-specific exports
    memory)
        echo "🧠 Creating memory-only bundle..."
        "$SCRIPT_DIR/universal_export.sh" memory --public
        ;;
    
    code)
        echo "💻 Creating code-only export..."
        "$SCRIPT_DIR/universal_export.sh" code --public
        ;;
    
    markdown|md)
        echo "📝 Creating markdown export..."
        "$SCRIPT_DIR/universal_export.sh" markdown --public
        ;;
    
    zip|full)
        echo "📦 Creating full ZIP export..."
        "$SCRIPT_DIR/universal_export.sh" zip --public
        ;;
    
    delta)
        echo "📊 Creating delta export..."
        "$SCRIPT_DIR/universal_export.sh" delta --public
        ;;
    
    # Memory collaboration formats
    changeb|change-bundle|mcb)
        echo "🔄 Creating MemoryChangeBundle for standardized LLM collaboration..."
        "$SCRIPT_DIR/universal_export.sh" change-bundle --public
        ;;
    
    # Private versions
    private-*)
        llm="${1#private-}"
        echo "🔒 Creating private export for $llm..."
        "$SCRIPT_DIR/universal_export.sh" zip --llm "$llm" --private
        ;;
    
    # Show help
    help|--help|-h)
        cat << 'EOF'
StackTrackr Quick Export

QUICK COMMANDS:
    chatgpt     ZIP bundle optimized for ChatGPT
    claude      Markdown export for Claude  
    gemini      ZIP bundle for Gemini
    copilot     Memory bundle for GitHub Copilot
    
    memory      Memory-only bundle
    changeb     MemoryChangeBundle (RFC-6902 patches)
    code        Code-only (no memory)
    markdown    Flattened markdown
    zip         Full ZIP bundle
    delta       Changes since last export
    
PRIVATE REPO:
    private-chatgpt   Private repo export for ChatGPT
    private-claude    Private repo export for Claude
    private-*         Private export for any LLM
    
EXAMPLES:
    export.sh chatgpt       # Quick ChatGPT export
    export.sh claude        # Quick Claude export  
    export.sh changeb       # MemoryChangeBundle for any LLM
    export.sh memory        # Memory bundle only
    export.sh private-gpt   # Private ChatGPT export

For advanced options, use:
    universal_export.sh --help

EOF
        ;;
    
    *)
        echo "❌ Unknown export type: $1"
        echo "Use 'export.sh help' for available options"
        exit 1
        ;;
esac
