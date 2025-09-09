#!/bin/bash

# HexTrackr MCP Configuration Launcher
# This script launches Claude Code with different MCP configurations

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}        HexTrackr MCP Configuration Launcher${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to display configuration options
show_menu() {
    echo -e "${YELLOW}Select MCP Configuration:${NC}"
    echo ""
    echo "  1) Full Stack (All MCP servers + Hooks)"
    echo "     - memento, ref.tools, zen, codacy, playwright"
    echo "     - Full constitutional compliance hooks"
    echo ""
    echo "  2) Research Mode (Documentation + Memory)"
    echo "     - memento, ref.tools, sequential-thinking"
    echo "     - Lightweight hooks for research"
    echo ""
    echo "  3) Development Mode (Code + Testing)"
    echo "     - zen, codacy, playwright"
    echo "     - Development-focused hooks"
    echo ""
    echo "  4) Memory Mode (Memento only)"
    echo "     - Just memento for knowledge work"
    echo "     - Minimal hooks"
    echo ""
    echo "  5) Custom (Edit .mcp.json manually)"
    echo ""
    echo "  0) Exit"
    echo ""
}

# Function to launch with full stack
launch_full_stack() {
    echo -e "${GREEN}Launching with Full Stack configuration...${NC}"
    
    # Ensure all servers are in .mcp.json
    cat > /Volumes/DATA/GitHub/HexTrackr/.mcp.json << 'EOF'
{
  "mcpServers": {
    "memento": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@iachilles/memento"],
      "env": {}
    },
    "ref.tools": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@refstudio/mcp"],
      "env": {}
    },
    "zen": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@zen-dojo/mcp-server"],
      "env": {}
    },
    "codacy": {
      "type": "stdio",
      "command": "/opt/homebrew/bin/codacy-mcp-server",
      "args": [],
      "env": {}
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {}
    }
  }
}
EOF

    # Constitutional check
    echo -e "${YELLOW}Constitutional Reminder:${NC}"
    echo "  • Article I: Specification-Driven Development"
    echo "  • Article VI: Always save insights to Memento"
    echo ""
    
    # Launch Claude Code
    cd /Volumes/DATA/GitHub/HexTrackr
    claude code .
}

# Function to launch research mode
launch_research_mode() {
    echo -e "${GREEN}Launching Research Mode...${NC}"
    
    cat > /Volumes/DATA/GitHub/HexTrackr/.mcp.json << 'EOF'
{
  "mcpServers": {
    "memento": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@iachilles/memento"],
      "env": {}
    },
    "ref.tools": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@refstudio/mcp"],
      "env": {}
    },
    "sequential-thinking": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "sequential-thinking-mcp"],
      "env": {}
    }
  }
}
EOF

    echo -e "${YELLOW}Research Priority:${NC}"
    echo "  1. ref.tools for documentation"
    echo "  2. Memento semantic search"
    echo "  3. Sequential thinking for analysis"
    echo ""
    
    cd /Volumes/DATA/GitHub/HexTrackr
    claude code .
}

# Function to launch development mode
launch_dev_mode() {
    echo -e "${GREEN}Launching Development Mode...${NC}"
    
    cat > /Volumes/DATA/GitHub/HexTrackr/.mcp.json << 'EOF'
{
  "mcpServers": {
    "zen": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@zen-dojo/mcp-server"],
      "env": {}
    },
    "codacy": {
      "type": "stdio",
      "command": "/opt/homebrew/bin/codacy-mcp-server",
      "args": [],
      "env": {}
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {}
    }
  }
}
EOF

    echo -e "${YELLOW}Development Focus:${NC}"
    echo "  • Zen for code analysis"
    echo "  • Codacy for quality checks"
    echo "  • Playwright for testing"
    echo ""
    
    cd /Volumes/DATA/GitHub/HexTrackr
    claude code .
}

# Function to launch memory mode
launch_memory_mode() {
    echo -e "${GREEN}Launching Memory Mode...${NC}"
    
    cat > /Volumes/DATA/GitHub/HexTrackr/.mcp.json << 'EOF'
{
  "mcpServers": {
    "memento": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@iachilles/memento"],
      "env": {}
    }
  }
}
EOF

    echo -e "${YELLOW}Memory Operations:${NC}"
    echo "  • Save insights with semantic classification"
    echo "  • Search with mode: 'semantic'"
    echo "  • Use PROJECT:DOMAIN:TYPE naming"
    echo ""
    
    cd /Volumes/DATA/GitHub/HexTrackr
    claude code .
}

# Main script logic
while true; do
    show_menu
    read -p "Enter choice [0-5]: " choice
    
    case $choice in
        1)
            launch_full_stack
            break
            ;;
        2)
            launch_research_mode
            break
            ;;
        3)
            launch_dev_mode
            break
            ;;
        4)
            launch_memory_mode
            break
            ;;
        5)
            echo -e "${YELLOW}Opening .mcp.json for editing...${NC}"
            ${EDITOR:-nano} /Volumes/DATA/GitHub/HexTrackr/.mcp.json
            echo -e "${GREEN}Launching with custom configuration...${NC}"
            cd /Volumes/DATA/GitHub/HexTrackr
            claude code .
            break
            ;;
        0)
            echo -e "${GREEN}Exiting...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            echo ""
            ;;
    esac
done