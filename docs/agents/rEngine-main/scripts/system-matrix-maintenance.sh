#!/bin/bash

# System Matrix Auto-Maintenance Script
# Purpose: Keep protocol registry and system matrix current automatically
# Integrate with startup and git hooks for seamless operation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

echo "🔄 System Matrix Auto-Maintenance"
echo "════════════════════════════════"
echo "Timestamp: $TIMESTAMP"

# Function to update protocol registry
update_protocol_registry() {
    echo "📋 Updating protocol registry..."
    cd "$PROJECT_DIR"
    
    if node rEngine/protocol-registry-manager.js; then
        echo "✅ Protocol registry updated successfully"
        return 0
    else
        echo "⚠️  Protocol registry update had issues"
        return 1
    fi
}

# Function to check if protocols have changed
check_protocol_changes() {
    local protocol_dir="$PROJECT_DIR/rProtocols"
    local last_update_file="$PROJECT_DIR/.protocol-registry-timestamp"
    
    # Get the newest modification time of any protocol file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        newest_protocol=$(find "$protocol_dir" -name "*.md" -exec stat -f "%m" {} \; | sort -nr | head -1)
    else
        # Linux
        newest_protocol=$(find "$protocol_dir" -name "*.md" -exec stat -c "%Y" {} \; | sort -nr | head -1)
    fi
    
    # Check last update timestamp
    if [ -f "$last_update_file" ]; then
        last_update=$(cat "$last_update_file")
    else
        last_update=0
    fi
    
    if [ "$newest_protocol" -gt "$last_update" ]; then
        echo "📝 Protocol changes detected, update needed"
        echo "$newest_protocol" > "$last_update_file"
        return 0
    else
        echo "✅ Protocol registry is current"
        return 1
    fi
}

# Function to validate system health
validate_system_health() {
    echo "🏥 Validating system health..."
    
    local issues=0
    
    # Check critical files exist
    local critical_files=(
        "rProtocols/system_matrix.json"
        "rProtocols/protocols.json"
        "rProtocols/ai_tools_registry.json"
        ".vscode/settings.json"
        "COPILOT_INSTRUCTIONS.md"
    )
    
    for file in "${critical_files[@]}"; do
        if [ ! -f "$PROJECT_DIR/$file" ]; then
            echo "❌ Missing critical file: $file"
            issues=$((issues + 1))
        fi
    done
    
    # Check VS Code settings for bootstrap instruction
    if grep -q "system_matrix.json" "$PROJECT_DIR/.vscode/settings.json" 2>/dev/null; then
        echo "✅ VS Code settings include system matrix reference"
    else
        echo "⚠️  VS Code settings may need system matrix reference"
        issues=$((issues + 1))
    fi
    
    # Check MCP server configuration
    if grep -q "rengine" "$PROJECT_DIR/.vscode/settings.json" 2>/dev/null; then
        echo "✅ MCP server configured in VS Code settings"
    else
        echo "❌ MCP server not configured in VS Code settings"
        issues=$((issues + 1))
    fi
    
    if [ $issues -eq 0 ]; then
        echo "✅ System health validation passed"
        return 0
    else
        echo "⚠️  System health validation found $issues issues"
        return 1
    fi
}

# Function to create git pre-commit hook
install_git_hook() {
    local git_hooks_dir="$PROJECT_DIR/.git/hooks"
    local pre_commit_hook="$git_hooks_dir/pre-commit"
    
    if [ -d "$git_hooks_dir" ]; then
        echo "🔗 Installing git pre-commit hook..."
        
        # Create or update pre-commit hook
        cat > "$pre_commit_hook" << 'EOF'
#!/bin/bash
# Auto-update system matrix before commits

PROJECT_DIR="$(git rev-parse --show-toplevel)"
cd "$PROJECT_DIR"

# Check if protocols have changed
if find rProtocols -name "*.md" -newer .protocol-registry-timestamp 2>/dev/null | grep -q .; then
    echo "📋 Protocols changed, updating system matrix..."
    
    if node rEngine/protocol-registry-manager.js >/dev/null 2>&1; then
        echo "✅ System matrix updated"
        git add rProtocols/system_matrix.json rProtocols/protocols.json rProtocols/ai_tools_registry.json
        touch .protocol-registry-timestamp
    else
        echo "⚠️  System matrix update failed, proceeding with commit"
    fi
fi
EOF
        
        chmod +x "$pre_commit_hook"
        echo "✅ Git pre-commit hook installed"
    else
        echo "⚠️  Not a git repository, skipping hook installation"
    fi
}

# Main execution
main() {
    local force_update=false
    
    # Check command line arguments
    if [[ "$1" == "--force" ]]; then
        force_update=true
        echo "🔄 Force update requested"
    fi
    
    # Update if protocols changed or force requested
    if $force_update || check_protocol_changes; then
        update_protocol_registry
    fi
    
    # Always validate system health
    validate_system_health
    
    # Install git hook if not present
    if [ ! -f "$PROJECT_DIR/.git/hooks/pre-commit" ]; then
        install_git_hook
    fi
    
    echo ""
    echo "✅ System matrix maintenance complete"
    echo ""
    echo "📋 Agent Quick Reference:"
    echo "   🎯 Universal Prompt: rProtocols/UNIVERSAL_AGENT_SYSTEM_PROMPT.md"
    echo "   📄 System Matrix: rProtocols/system_matrix.json"
    echo "   📋 Protocol Index: rProtocols/protocols.json"
    echo "   🔧 Tools Registry: rProtocols/ai_tools_registry.json"
    echo ""
    echo "🎯 Every agent now has instant access to complete system knowledge!"
}

# Run main function
main "$@"
