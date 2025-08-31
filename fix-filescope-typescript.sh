#!/bin/bash
# Simple fix for FileScopeMCP TypeScript issue

cd /Volumes/DATA/GitHub/MCPServers/FileScopeMCP

# Create a backup
cp src/mcp-server.ts src/mcp-server.ts.backup

# Use a simple python script to fix the specific line
python3 << 'EOF'
with open('src/mcp-server.ts', 'r') as f:
    lines = f.readlines()

# Fix line 978 (index 977)
if len(lines) > 977:
    lines[977] = "  const escapedMermaidCode = mermaidCode.replace(/\`/g, '\\\\`').replace(/\\$/g, '\\\\$');\n"

with open('src/mcp-server.ts', 'w') as f:
    f.writelines(lines)
EOF

echo "TypeScript file fixed!"
