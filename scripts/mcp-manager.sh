#!/bin/bash

# MCP Server Manager Script
# Manages MCP server lifecycle for Claude

set -e

_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_CONFIG_DIR="$HOME/.claude"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

show_help() {
    echo "MCP Server Manager"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status     Show status of all MCP servers"
    echo "  stop       Stop all MCP servers"
    echo "  restart    Restart all MCP servers"
    echo "  secure     Switch to secure configuration (Keychain-based)"
    echo "  count      Count active MCP processes"
    echo "  help       Show this help message"
}

count_mcp_processes() {
    local count=$(ps aux | grep -E "mcp|claude-context|memento|brave-search" | grep -v grep | wc -l)
    echo "$count"
}

show_status() {
    echo -e "${GREEN}=== MCP Server Status ===${NC}"
    echo ""

    local count=$(count_mcp_processes)
    echo -e "Active MCP processes: ${YELLOW}$count${NC}"
    echo ""

    echo "Running processes:"
    ps aux | grep -E "mcp|claude-context|memento|brave-search" | grep -v grep | awk '{print $2, $11, $12}' | head -10

    echo ""
    echo "Current Claude config:"
    if [ -L "$CLAUDE_CONFIG_DIR/config.json" ]; then
        ls -la "$CLAUDE_CONFIG_DIR/config.json"
    elif [ -f "$CLAUDE_CONFIG_DIR/config.json" ]; then
        echo "Using: config.json (checking for API keys...)"
        if grep -q "sk-" "$CLAUDE_CONFIG_DIR/config.json" 2>/dev/null; then
            echo -e "${RED}⚠️  WARNING: Plain text API keys found in config!${NC}"
        else
            echo -e "${GREEN}✅ No plain text keys detected${NC}"
        fi
    fi
}

stop_mcp_servers() {
    echo -e "${YELLOW}Stopping all MCP servers...${NC}"

    # Kill MCP processes
    pkill -f "mcp" 2>/dev/null || true
    pkill -f "memento" 2>/dev/null || true
    pkill -f "claude-context" 2>/dev/null || true
    pkill -f "brave-search" 2>/dev/null || true

    sleep 2

    local count=$(count_mcp_processes)
    if [ "$count" -eq 0 ]; then
        echo -e "${GREEN}✅ All MCP servers stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  $count processes still running${NC}"
    fi
}

switch_to_secure() {
    echo -e "${GREEN}Switching to secure configuration...${NC}"

    # Check if secure config exists
    if [ ! -f "$CLAUDE_CONFIG_DIR/config-secure.json" ]; then
        echo -e "${RED}Error: config-secure.json not found${NC}"
        echo "Please run the security setup first"
        exit 1
    fi

    # Backup current config
    if [ -f "$CLAUDE_CONFIG_DIR/config.json" ]; then
        cp "$CLAUDE_CONFIG_DIR/config.json" "$CLAUDE_CONFIG_DIR/config.backup.$(date +%Y%m%d_%H%M%S).json"
        echo "Backed up current config"
    fi

    # Switch to secure config
    cp "$CLAUDE_CONFIG_DIR/config-secure.json" "$CLAUDE_CONFIG_DIR/config.json"
    echo -e "${GREEN}✅ Switched to secure configuration${NC}"

    # Verify keys are in Keychain
    echo ""
    echo "Verifying Keychain keys:"
    for key in OPENAI_API_KEY BRAVE_API_KEY CODACY_ACCOUNT_TOKEN OPENROUTER_API_KEY; do
        if security find-generic-password -s "HexTrackr" -a "$key" 2>/dev/null >/dev/null; then
            echo -e "  ${GREEN}✅${NC} $key"
        else
            echo -e "  ${RED}❌${NC} $key (missing)"
        fi
    done

    echo ""
    echo -e "${YELLOW}Note: Restart Claude Desktop to use the new configuration${NC}"
}

restart_mcp_servers() {
    stop_mcp_servers
    echo ""
    echo -e "${YELLOW}Note: MCP servers will restart automatically when Claude Desktop is used${NC}"
}

# Main script
case "${1:-help}" in
    status)
        show_status
        ;;
    stop)
        stop_mcp_servers
        ;;
    restart)
        restart_mcp_servers
        ;;
    secure)
        switch_to_secure
        ;;
    count)
        count=$(count_mcp_processes)
        echo "Active MCP processes: $count"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac