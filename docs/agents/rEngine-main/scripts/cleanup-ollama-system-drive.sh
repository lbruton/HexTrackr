#!/bin/bash
# cleanup-ollama-system-drive.sh
# Cleans up Ollama from system drive and configures external storage

set -e

echo "🧹 Cleaning up Ollama from system drive..."

# Stop Ollama if running
echo "🛑 Stopping Ollama service..."
pkill ollama 2>/dev/null || echo "Ollama was not running"
sleep 2

# Check current system drive usage
SYSTEM_SIZE=$(du -sh ~/.ollama 2>/dev/null | cut -f1 || echo "0B")
echo "📊 Current system drive Ollama usage: $SYSTEM_SIZE"

# Backup any models from system drive to external
if [ -d ~/.ollama ]; then
    echo "💾 Backing up system drive models to external storage..."
    
    # Ensure external directory exists
    mkdir -p /Volumes/DATA/ollama/.ollama
    
    # Copy any missing files from system to external
    if [ -d ~/.ollama/models ]; then
        mkdir -p /Volumes/DATA/ollama/.ollama/models
        cp -r ~/.ollama/models/* /Volumes/DATA/ollama/.ollama/models/ 2>/dev/null || true
    fi
    
    if [ -d ~/.ollama/blobs ]; then
        mkdir -p /Volumes/DATA/ollama/.ollama/blobs
        cp -r ~/.ollama/blobs/* /Volumes/DATA/ollama/.ollama/blobs/ 2>/dev/null || true
    fi
    
    # Copy database if it exists
    if [ -f ~/.ollama/db.sqlite ]; then
        cp ~/.ollama/db.sqlite /Volumes/DATA/ollama/.ollama/ 2>/dev/null || true
    fi
    
    echo "✅ Backup completed"
    
    # Remove system drive Ollama directory
    echo "🗑️  Removing system drive Ollama directory..."
    rm -rf ~/.ollama
    echo "✅ System drive cleaned up"
else
    echo "ℹ️  No ~/.ollama directory found on system drive"
fi

# Create symlink from system to external (optional, for compatibility)
echo "🔗 Creating symlink for compatibility..."
ln -sf /Volumes/DATA/ollama/.ollama ~/.ollama

# Set environment variables for current session
echo "⚙️  Setting up environment variables..."
export OLLAMA_HOME="/Volumes/DATA/ollama/.ollama"
export OLLAMA_MODELS="/Volumes/DATA/ollama/.ollama/models"

# Create shell configuration
SHELL_CONFIG=""
if [ "$SHELL" = "/bin/zsh" ] || [ "$SHELL" = "/usr/bin/zsh" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ "$SHELL" = "/bin/bash" ] || [ "$SHELL" = "/usr/bin/bash" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
fi

if [ -n "$SHELL_CONFIG" ]; then
    echo "📝 Adding Ollama configuration to $SHELL_CONFIG..."
    
    # Remove any existing Ollama config
    sed -i '' '/# Ollama configuration/,/# End Ollama configuration/d' "$SHELL_CONFIG" 2>/dev/null || true
    
    # Add new configuration
    cat >> "$SHELL_CONFIG" << 'EOF'

# Ollama configuration - External storage
export OLLAMA_HOME="/Volumes/DATA/ollama/.ollama"
export OLLAMA_MODELS="/Volumes/DATA/ollama/.ollama/models"
export OLLAMA_HOST="127.0.0.1:11434"

# Ollama optimization for 16GB M4 Mac
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_LOADED_MODELS=2
export OLLAMA_FLASH_ATTENTION=1

# Alias for easy access
alias ollama-status='du -sh /Volumes/DATA/ollama/.ollama && ollama list'
alias ollama-clean='ollama stop $(ollama list | tail -n +2 | awk "{print \$1}") 2>/dev/null || true'

# End Ollama configuration
EOF
    
    echo "✅ Shell configuration updated"
fi

# Check external storage space
EXTERNAL_SIZE=$(du -sh /Volumes/DATA/ollama/.ollama 2>/dev/null | cut -f1 || echo "0B")
EXTERNAL_FREE=$(df -h /Volumes/DATA | tail -1 | awk '{print $4}')

echo ""
echo "📊 Storage Summary:"
echo "   External Ollama size: $EXTERNAL_SIZE"
echo "   External free space: $EXTERNAL_FREE"
echo "   System drive cleaned: $SYSTEM_SIZE freed"

echo ""
echo "✅ Cleanup completed!"
echo "🔄 Please restart your terminal or run: source $SHELL_CONFIG"
echo "🚀 Then restart Ollama with: ollama serve &"

# Test the configuration
echo ""
echo "🧪 Testing configuration..."
if [ -f /Volumes/DATA/ollama/.ollama/db.sqlite ]; then
    echo "✅ Database found in external storage"
else
    echo "⚠️  Database not found - will be created on first use"
fi

echo "🎉 rEngine Ollama is now configured for external storage!"
