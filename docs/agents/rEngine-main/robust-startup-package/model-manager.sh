#!/bin/bash

# ============================================================================
# 🤖 rEngine Model Management Utility
# ============================================================================
# Utility for managing and switching AI models in rEngine

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PINK='\033[95m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${PINK}🤖 rEngine Model Management${NC}"
echo -e "${CYAN}============================${NC}"

# Function to list available models
list_models() {
    echo -e "${YELLOW}📋 Available Ollama Models:${NC}"
    if command -v ollama >/dev/null 2>&1; then
        ollama list 2>/dev/null | tail -n +2 | while read line; do
            if [ -n "$line" ]; then
                model=$(echo "$line" | awk '{print $1}')
                size=$(echo "$line" | awk '{print $2}')
                echo -e "${GREEN}   • $model ${CYAN}($size)${NC}"
            fi
        done
    else
        echo -e "${RED}❌ Ollama not available${NC}"
    fi
}

# Function to show current model configuration
show_current_config() {
    echo -e "${YELLOW}⚙️  Current rEngine Configuration:${NC}"
    
    if [ -f "/Volumes/DATA/GitHub/rEngine/enhanced-scribe-console.js" ]; then
        local current_model=$(grep "MODEL_NAME:" /Volumes/DATA/GitHub/rEngine/enhanced-scribe-console.js | head -1 | sed "s/.*MODEL_NAME: '\\([^']*\\)'.*/\\1/")
        local temp=$(grep "TEMPERATURE:" /Volumes/DATA/GitHub/rEngine/enhanced-scribe-console.js | head -1 | sed "s/.*TEMPERATURE: \\([0-9.]*\\).*/\\1/")
        local tokens=$(grep "MAX_TOKENS:" /Volumes/DATA/GitHub/rEngine/enhanced-scribe-console.js | head -1 | sed "s/.*MAX_TOKENS: \\([0-9]*\\).*/\\1/")
        
        echo -e "${GREEN}   🎯 Active Model: $current_model${NC}"
        echo -e "${GREEN}   🌡️  Temperature: $temp${NC}"
        echo -e "${GREEN}   📊 Max Tokens: $tokens${NC}"
    else
        echo -e "${RED}❌ Enhanced Scribe Console configuration not found${NC}"
    fi
}

# Function to test model connectivity
test_model() {
    local model="$1"
    echo -e "${YELLOW}🧪 Testing model: $model${NC}"
    
    if ollama run "$model" "Hello, respond with just 'OK' if you're working." 2>/dev/null | grep -q "OK"; then
        echo -e "${GREEN}✅ Model $model is responsive${NC}"
    else
        echo -e "${RED}❌ Model $model is not responding${NC}"
    fi
}

# Function to show model recommendations
show_recommendations() {
    echo -e "${YELLOW}💡 Model Recommendations:${NC}"
    echo -e "${GREEN}   🏆 llama3.1:8b${NC} - ${CYAN}Benchmark winner, balanced performance${NC}"
    echo -e "${GREEN}   🚀 llama3.1:latest${NC} - ${CYAN}Latest version, good fallback${NC}"
    echo -e "${YELLOW}   🔧 qwen2.5-coder:7b${NC} - ${RED}Has JSON parsing issues${NC}"
    echo ""
    echo -e "${CYAN}To switch models, edit the MODEL_NAME in enhanced-scribe-console.js${NC}"
}

# Main execution
case "${1:-show}" in
    "list"|"ls")
        list_models
        ;;
    "current"|"show")
        show_current_config
        echo ""
        list_models
        ;;
    "test")
        if [ -n "$2" ]; then
            test_model "$2"
        else
            echo -e "${RED}Usage: $0 test <model-name>${NC}"
        fi
        ;;
    "recommend"|"rec")
        show_recommendations
        ;;
    "help"|"--help"|"-h")
        echo -e "${CYAN}Usage: $0 [command]${NC}"
        echo ""
        echo -e "${YELLOW}Commands:${NC}"
        echo -e "  ${GREEN}show|current${NC}  - Show current configuration and available models"
        echo -e "  ${GREEN}list|ls${NC}       - List all available Ollama models"
        echo -e "  ${GREEN}test <model>${NC}  - Test if a specific model is working"
        echo -e "  ${GREEN}recommend|rec${NC} - Show model recommendations"
        echo -e "  ${GREEN}help${NC}          - Show this help"
        ;;
    *)
        show_current_config
        echo ""
        list_models
        echo ""
        show_recommendations
        ;;
esac
