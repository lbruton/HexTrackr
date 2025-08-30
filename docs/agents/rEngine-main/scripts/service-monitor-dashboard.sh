#!/bin/bash

# StackTrackr Service Monitor Dashboard
# Real-time monitoring of all services

# Colors
PINK='\033[95m'
GREEN='\033[92m'
BLUE='\033[94m'
CYAN='\033[96m'
YELLOW='\033[93m'
RED='\033[91m'
RESET='\033[0m'

clear

echo -e "${PINK}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                📊 StackTrackr Service Dashboard 📊                ║
║                                                                  ║
║     Real-time monitoring of all StackTrackr services            ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${RESET}"

# Function to check service status
check_service() {
    local service_name="$1"
    local process_pattern="$2"
    
    if pgrep -f "$process_pattern" > /dev/null; then
        echo -e "${GREEN}🟢 $service_name: RUNNING${RESET}"
        local pid=$(pgrep -f "$process_pattern" | head -1)
        echo -e "${CYAN}   PID: $pid${RESET}"
    else
        echo -e "${RED}🔴 $service_name: STOPPED${RESET}"
    fi
}

# Function to show process details
show_process_details() {
    echo -e "\n${BLUE}📋 Process Details:${RESET}"
    ps aux | grep -E "(mcp|smart-scribe|docker)" | grep -v grep | while read line; do
        echo -e "${CYAN}   $line${RESET}"
    done
}

# Function to show docker status
show_docker_status() {
    echo -e "\n${BLUE}🐳 Docker Status:${RESET}"
    if command -v docker &> /dev/null; then
        if docker ps &> /dev/null; then
            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | while IFS= read -r line; do
                if [[ "$line" == *"NAMES"* ]]; then
                    echo -e "${YELLOW}   $line${RESET}"
                else
                    echo -e "${GREEN}   $line${RESET}"
                fi
            done
        else
            echo -e "${RED}   Docker not running${RESET}"
        fi
    else
        echo -e "${RED}   Docker not installed${RESET}"
    fi
}

# Main monitoring loop
while true; do
    clear
    
    echo -e "${PINK}📊 StackTrackr Service Dashboard - $(date '+%H:%M:%S')${RESET}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${RESET}"
    
    echo -e "\n${YELLOW}🔍 Core Services:${RESET}"
    check_service "Smart Scribe" "smart-scribe.js"
    check_service "MCP Memory Server" "mcp-server-memory"
    check_service "Split Scribe Console" "split-scribe-console.js"
    
    show_docker_status
    show_process_details
    
    echo -e "\n${CYAN}🔄 Auto-refresh in 10 seconds... (Ctrl+C to exit)${RESET}"
    sleep 10
done
