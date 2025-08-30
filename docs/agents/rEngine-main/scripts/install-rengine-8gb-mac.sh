#!/bin/bash
# install-rengine-8gb-mac.sh
# Optimized rEngine installation for 8GB MacBooks (M1/M2/M3)

set -e

echo "🚀 rEngine 8GB MacBook Installation"
echo "======================================"
echo "Optimized for: MacBook Air/Pro with 8GB RAM"
echo "Includes: Ollama + Phi-3 + Qwen Coder 3B + API fallback"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RENGINE_DIR="$HOME/rEngine"
OLLAMA_DATA_DIR="$HOME/.ollama"
API_KEYS_FILE="$HOME/.rengine/api-keys.txt"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check system requirements
check_system() {
    print_info "Checking system requirements..."
    
    # Check macOS version
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "This script is designed for macOS only"
        exit 1
    fi
    
    # Check if it's Apple Silicon
    ARCH=$(uname -m)
    if [[ "$ARCH" != "arm64" ]]; then
        print_warning "This script is optimized for Apple Silicon (M1/M2/M3)"
        print_info "Intel Macs may work but performance will be slower"
    fi
    
    # Check available memory
    TOTAL_MEM=$(sysctl -n hw.memsize)
    MEM_GB=$((TOTAL_MEM / 1024 / 1024 / 1024))
    
    print_info "Detected ${MEM_GB}GB RAM"
    
    if [[ $MEM_GB -lt 8 ]]; then
        print_error "This installation requires at least 8GB RAM"
        exit 1
    elif [[ $MEM_GB -eq 8 ]]; then
        print_warning "8GB RAM detected - using ultra-lightweight configuration"
        USE_LIGHTWEIGHT=true
    else
        print_status "Sufficient RAM detected for standard configuration"
        USE_LIGHTWEIGHT=false
    fi
    
    # Check available disk space
    AVAILABLE_SPACE=$(df -g . | tail -1 | awk '{print $4}')
    if [[ $AVAILABLE_SPACE -lt 10 ]]; then
        print_error "At least 10GB free disk space required"
        exit 1
    fi
    
    print_status "System requirements check passed"
}

# Install Homebrew if not present
install_homebrew() {
    if ! command -v brew &> /dev/null; then
        print_info "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        print_status "Homebrew installed"
    else
        print_status "Homebrew already installed"
    fi
}

# Install required dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Essential tools
    brew install --quiet curl jq git node || true
    
    # Docker Desktop (optional but recommended)
    if ! command -v docker &> /dev/null; then
        print_info "Docker not found. Installing Docker Desktop..."
        brew install --cask docker
        print_warning "Please start Docker Desktop manually and complete setup"
    else
        print_status "Docker already installed"
    fi
    
    print_status "Dependencies installed"
}

# Install Ollama
install_ollama() {
    print_info "Installing Ollama..."
    
    if ! command -v ollama &> /dev/null; then
        # Download and install Ollama
        curl -fsSL https://ollama.ai/install.sh | sh
        print_status "Ollama installed"
    else
        print_status "Ollama already installed"
    fi
    
    # Configure Ollama for 8GB Mac
    print_info "Configuring Ollama for 8GB system..."
    
    # Create Ollama configuration
    mkdir -p ~/.config/ollama
    cat > ~/.config/ollama/config.json << 'EOF'
{
  "max_loaded_models": 1,
  "num_parallel": 1,
  "flash_attention": true,
  "context_length": 2048
}
EOF
    
    # Add environment variables to shell profile
    SHELL_CONFIG=""
    if [[ "$SHELL" == *"zsh"* ]]; then
        SHELL_CONFIG="$HOME/.zshrc"
    elif [[ "$SHELL" == *"bash"* ]]; then
        SHELL_CONFIG="$HOME/.bashrc"
    fi
    
    if [[ -n "$SHELL_CONFIG" ]]; then
        # Remove existing Ollama config
        sed -i '' '/# rEngine Ollama Config/,/# End rEngine Ollama Config/d' "$SHELL_CONFIG" 2>/dev/null || true
        
        # Add optimized configuration
        cat >> "$SHELL_CONFIG" << 'EOF'

# rEngine Ollama Config - 8GB Optimization
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_CONTEXT_LENGTH=2048
export OLLAMA_HOST="127.0.0.1:11434"

# Memory optimization
export OLLAMA_GPU_OVERHEAD=0
export OLLAMA_KEEP_ALIVE=5m

# Aliases for easy management
alias ollama-status='ollama list && echo "Memory: $(ps aux | grep ollama | awk "{sum+=\$6} END {print sum/1024 \"MB\"}")"'
alias ollama-restart='pkill ollama && ollama serve &'

# End rEngine Ollama Config
EOF
        
        print_status "Shell configuration updated"
    fi
}

# Download optimized models for 8GB Mac
download_models() {
    print_info "Starting Ollama service..."
    
    # Start Ollama if not running
    if ! pgrep -f "ollama serve" > /dev/null; then
        ollama serve &
        sleep 5
    fi
    
    print_info "Downloading optimized models for 8GB Mac..."
    
    if [[ "$USE_LIGHTWEIGHT" == "true" ]]; then
        print_info "Using ultra-lightweight configuration for 8GB RAM"
        
        # Primary model: Phi-3 Mini (2.3GB)
        print_info "Downloading Phi-3 Mini (2.3GB) - Primary model..."
        ollama pull phi3:mini
        
        # Backup model: TinyLlama (637MB)
        print_info "Downloading TinyLlama (637MB) - Backup model..."
        ollama pull tinyllama
        
        # Coding model: Qwen Coder 1.5B (0.9GB)
        print_info "Downloading Qwen2.5-Coder 1.5B (0.9GB) - Coding specialist..."
        ollama pull qwen2.5-coder:1.5b
        
    else
        # Standard configuration for 16GB+ RAM
        print_info "Using standard configuration for 16GB+ RAM"
        
        # Primary model: Phi-3 3.8B (2.8GB)
        print_info "Downloading Phi-3 3.8B (2.8GB) - Primary model..."
        ollama pull phi3:3.8b
        
        # Coding model: Qwen Coder 7B (5.2GB)
        print_info "Downloading Qwen2.5-Coder 7B (5.2GB) - Coding specialist..."
        ollama pull qwen2.5-coder:7b
        
        # Backup model: TinyLlama (637MB)
        print_info "Downloading TinyLlama (637MB) - Fast backup..."
        ollama pull tinyllama
    fi
    
    print_status "Models downloaded successfully"
}

# Setup API key management
setup_api_keys() {
    print_info "Setting up API key management..."
    
    mkdir -p "$(dirname "$API_KEYS_FILE")"
    
    if [[ ! -f "$API_KEYS_FILE" ]]; then
        cat > "$API_KEYS_FILE" << 'EOF'
# rEngine API Keys Configuration
# These keys are loaded at session start and never stored in memory
# Uncomment and add your API keys as needed

# OpenAI (GPT-4, GPT-3.5)
# OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic Claude
# CLAUDE_API_KEY=claude-your-key-here

# Google Gemini
# GEMINI_API_KEY=AIza-your-gemini-key-here

# Groq (Fast inference)
# GROQ_API_KEY=gsk-your-groq-key-here

# Usage Notes:
# - These are fallback options when local models are insufficient
# - Keys are never stored in rEngine memory or logs
# - Remove this file to disable cloud API access
# - Restart rEngine after adding/changing keys
EOF
        
        chmod 600 "$API_KEYS_FILE"
        print_status "API keys template created at $API_KEYS_FILE"
        print_warning "Edit this file to add your API keys (optional)"
    else
        print_status "API keys file already exists"
    fi
}

# Clone rEngine repository
setup_rengine() {
    print_info "Setting up rEngine..."
    
    if [[ ! -d "$RENGINE_DIR" ]]; then
        print_info "Cloning rEngine repository..."
        git clone https://github.com/lbruton/rEngine.git "$RENGINE_DIR"
        cd "$RENGINE_DIR"
    else
        print_status "rEngine directory already exists"
        cd "$RENGINE_DIR"
        git pull origin main || true
    fi
    
    # Install Node.js dependencies
    if [[ -f "package.json" ]]; then
        print_info "Installing Node.js dependencies..."
        npm install --silent
    fi
    
    # Create user workspace directory
    mkdir -p user-workspaces/default-user/{projects,brainstorm,notes,templates,archive}
    
    # Create 8GB optimized configuration
    cat > config/8gb-config.json << 'EOF'
{
  "system": {
    "memory_limit": "6GB",
    "max_concurrent_models": 1,
    "preferred_models": {
      "primary": "phi3:mini",
      "coding": "qwen2.5-coder:1.5b",
      "backup": "tinyllama"
    }
  },
  "api_fallback": {
    "enabled": true,
    "priority": ["groq", "openai", "claude", "gemini"],
    "rate_limits": {
      "requests_per_minute": 10,
      "tokens_per_hour": 50000
    }
  },
  "workspace": {
    "auto_save": true,
    "privacy_mode": true,
    "api_key_detection": true
  }
}
EOF
    
    print_status "rEngine setup completed"
}

# Create startup script
create_startup_script() {
    print_info "Creating startup script..."
    
    cat > "$RENGINE_DIR/start-8gb-mac.sh" << 'EOF'
#!/bin/bash
# rEngine startup script for 8GB Mac

echo "🚀 Starting rEngine for 8GB Mac..."

# Load API keys if they exist
if [[ -f "$HOME/.rengine/api-keys.txt" ]]; then
    source "$HOME/.rengine/api-keys.txt"
    echo "✅ API keys loaded"
fi

# Start Ollama if not running
if ! pgrep -f "ollama serve" > /dev/null; then
    echo "🧠 Starting Ollama..."
    ollama serve &
    sleep 3
fi

# Load primary model
echo "🤖 Loading primary model..."
ollama run phi3:mini "rEngine starting up..." > /dev/null 2>&1 &

# Start health dashboard
echo "🏥 Starting health dashboard..."
node health-api.cjs &

# Wait for services
sleep 5

echo "✅ rEngine ready!"
echo "📊 Dashboard: http://localhost:4039/dashboard"
echo "🧠 Primary model: Phi-3 Mini"
echo "💾 Memory optimized for 8GB systems"
echo ""
echo "💡 Usage tips:"
echo "   - Use Phi-3 Mini for general tasks"
echo "   - Switch to Qwen Coder for programming"
echo "   - TinyLlama for quick responses"
echo "   - API fallback available if configured"
EOF
    
    chmod +x "$RENGINE_DIR/start-8gb-mac.sh"
    print_status "Startup script created"
}

# Test installation
test_installation() {
    print_info "Testing installation..."
    
    # Test Ollama
    if ollama list > /dev/null 2>&1; then
        print_status "Ollama is working"
    else
        print_error "Ollama test failed"
        return 1
    fi
    
    # Test primary model
    if ollama run phi3:mini "Hello" --timeout 30 > /dev/null 2>&1; then
        print_status "Primary model (Phi-3 Mini) is working"
    else
        print_warning "Primary model test failed - may need manual setup"
    fi
    
    # Test rEngine directory
    if [[ -d "$RENGINE_DIR" && -f "$RENGINE_DIR/health-api.cjs" ]]; then
        print_status "rEngine files are in place"
    else
        print_error "rEngine installation incomplete"
        return 1
    fi
    
    print_status "Installation test completed"
}

# Main installation flow
main() {
    echo "Starting rEngine installation for 8GB Mac..."
    echo ""
    
    check_system
    install_homebrew
    install_dependencies
    install_ollama
    download_models
    setup_api_keys
    setup_rengine
    create_startup_script
    test_installation
    
    echo ""
    echo "🎉 Installation completed successfully!"
    echo ""
    echo "📚 Next steps:"
    echo "1. Restart your terminal to load new environment"
    echo "2. Edit API keys (optional): $API_KEYS_FILE"
    echo "3. Start rEngine: cd $RENGINE_DIR && ./start-8gb-mac.sh"
    echo "4. Open dashboard: http://localhost:4039/dashboard"
    echo ""
    echo "💡 Memory usage will be ~4-5GB total:"
    echo "   - Phi-3 Mini: 2.3GB"
    echo "   - macOS overhead: 1-2GB"
    echo "   - rEngine services: 1GB"
    echo ""
    echo "🎯 Perfect for development on the go!"
}

# Run installation
main "$@"
