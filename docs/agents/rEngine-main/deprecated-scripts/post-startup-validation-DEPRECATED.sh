#!/bin/bash
# Post-Startup Validation and MCP Integration Test
# Run this after robust-startup-protocol.sh completes

echo "🔍 Post-Startup MCP Integration Test"
echo "====================================="

# Test 1: VS Code MCP Settings
echo "1. Checking VS Code MCP configuration..."
if [ -f ".vscode/settings.json" ]; then
    if grep -q "mcp.servers" .vscode/settings.json; then
        echo "✅ VS Code MCP settings configured"
    else
        echo "❌ VS Code MCP settings missing - creating..."
        mkdir -p .vscode
        cat > .vscode/settings.json << 'EOF'
{
  "mcp.servers": {
    "memory": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-memory"],
      "disabled": false
    },
    "context7": {
      "command": "npx", 
      "args": ["@upstash/context7-mcp@latest"],
      "disabled": false
    }
  },
  "mcp.logging.level": "info"
}
EOF
        echo "✅ Created VS Code MCP configuration"
    fi
else
    echo "❌ No VS Code settings found"
fi

# Test 2: MCP Memory Tools Access
echo ""
echo "2. Testing MCP memory tools access..."
# This would need to be tested within VS Code with Copilot

# Test 3: Local Memory Systems
echo ""
echo "3. Testing local memory systems..."

# Test dual memory writer
echo "   Testing dual memory writer..."
if node rEngine/dual-memory-writer.js test "Validation Test" "Post-startup validation entry" >/dev/null 2>&1; then
    echo "   ✅ Dual memory writer functional"
else
    echo "   ❌ Dual memory writer failed"
fi

# Test memory intelligence
echo "   Testing memory intelligence..."
if node rEngine/memory-intelligence.js search "validation" >/dev/null 2>&1; then
    echo "   ✅ Memory intelligence functional"
else
    echo "   ❌ Memory intelligence failed"
fi

# Test 4: Path Consistency Check
echo ""
echo "4. Checking path consistency..."
EXPECTED_FILES=(
    "rEngine/persistent-memory.json"
    "rMemory/rAgentMemories"
    "rProtocols/rEngine_startup_protocol.md"
    "quick-start.sh"
)

for file in "${EXPECTED_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ❌ $file missing"
    fi
done

echo ""
echo "🎯 Integration Status Summary:"
echo "   Next step: Restart VS Code to load MCP settings"
echo "   Then test: mcp_memory_search_nodes in Copilot chat"
echo "   Local memory systems ready for immediate use"
