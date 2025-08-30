#!/bin/bash

# StackTrackr Project Archive for Claude Workspace
# Creates a comprehensive but manageable archive of key project files

ARCHIVE_DIR="claude-workspace-upload"
PROJECT_ROOT="/Volumes/DATA/GitHub/rEngine"

echo "🚀 Creating StackTrackr workspace archive..."

# Clean up any existing archive
rm -rf "$ARCHIVE_DIR"
mkdir -p "$ARCHIVE_DIR"

cd "$PROJECT_ROOT"

# Core configuration files
echo "📁 Copying configuration files..."
cp package.json "$ARCHIVE_DIR/" 2>/dev/null
cp docker-compose.yml "$ARCHIVE_DIR/" 2>/dev/null
cp Dockerfile "$ARCHIVE_DIR/" 2>/dev/null
cp *.md "$ARCHIVE_DIR/" 2>/dev/null

# Key documentation (organized, non-generated)
echo "📚 Copying key documentation..."
mkdir -p "$ARCHIVE_DIR/docs"
cp docs/*.md "$ARCHIVE_DIR/docs/" 2>/dev/null

# Core engine files
echo "⚙️ Copying rEngine core..."
mkdir -p "$ARCHIVE_DIR/rEngine"
cp rEngine/*.js "$ARCHIVE_DIR/rEngine/" 2>/dev/null
cp rEngine/*.json "$ARCHIVE_DIR/rEngine/" 2>/dev/null
cp rEngine/*.sh "$ARCHIVE_DIR/rEngine/" 2>/dev/null
cp rEngine/*.md "$ARCHIVE_DIR/rEngine/" 2>/dev/null

# MCP server files
echo "🔗 Copying MCP servers..."
mkdir -p "$ARCHIVE_DIR/rEngineMCP"
cp -r rEngineMCP/src "$ARCHIVE_DIR/rEngineMCP/" 2>/dev/null
cp rEngineMCP/*.json "$ARCHIVE_DIR/rEngineMCP/" 2>/dev/null
cp rEngineMCP/*.md "$ARCHIVE_DIR/rEngineMCP/" 2>/dev/null

# Agent system
echo "🤖 Copying agent system..."
mkdir -p "$ARCHIVE_DIR/rAgents"
cp -r rAgents/* "$ARCHIVE_DIR/rAgents/" 2>/dev/null

# Scripts and utilities
echo "🛠️ Copying scripts..."
mkdir -p "$ARCHIVE_DIR/scripts"
cp scripts/*.js "$ARCHIVE_DIR/scripts/" 2>/dev/null
cp scripts/*.sh "$ARCHIVE_DIR/scripts/" 2>/dev/null

# Memory system essentials
echo "🧠 Copying memory essentials..."
mkdir -p "$ARCHIVE_DIR/rMemory"
cp rMemory/*.md "$ARCHIVE_DIR/rMemory/" 2>/dev/null
cp rMemory/*.js "$ARCHIVE_DIR/rMemory/" 2>/dev/null

# Create project overview
echo "📋 Creating project overview..."
cat > "$ARCHIVE_DIR/PROJECT_OVERVIEW.md" << 'EOF'
# StackTrackr Project Overview

## Architecture
- **rEngine**: Core processing engine with MCP server integration
- **rAgents**: Multi-agent system for task automation
- **rMemory**: Persistent memory and knowledge management
- **rEngineMCP**: Model Context Protocol server implementation
- **docs/**: Organized documentation system

## Key Components
- Document generation and management system
- Rate-limited AI provider integration (Gemini, Claude, Groq)
- Memory synchronization and backup protocols
- Agent coordination and task distribution
- Docker containerization support

## Current Focus
- Documentation organization and generation
- System optimization for AI documentation workflows
- Memory system integrity and synchronization
- Agent accountability and workflow management

## Technologies
- Node.js/JavaScript (ES modules)
- Docker containerization
- MCP (Model Context Protocol)
- Multiple AI provider integrations
- Bash scripting for automation
EOF

# Create file manifest
echo "📋 Creating file manifest..."
find "$ARCHIVE_DIR" -type f > "$ARCHIVE_DIR/FILE_MANIFEST.txt"

# Calculate size
ARCHIVE_SIZE=$(du -sh "$ARCHIVE_DIR" | cut -f1)
FILE_COUNT=$(find "$ARCHIVE_DIR" -type f | wc -l)

echo ""
echo "✅ Archive created successfully!"
echo "📁 Location: $ARCHIVE_DIR"
echo "📊 Size: $ARCHIVE_SIZE"
echo "📄 Files: $FILE_COUNT"
echo ""
echo "🔍 Key files included:"
echo "  - Configuration: package.json, docker-compose.yml"
echo "  - Documentation: docs/*.md, PROJECT_OVERVIEW.md"
echo "  - Core Engine: rEngine/* (JS, JSON, shell scripts)"
echo "  - MCP Server: rEngineMCP/src/*"
echo "  - Agents: rAgents/*"
echo "  - Scripts: scripts/*"
echo "  - Memory: rMemory essentials"
echo ""
echo "📤 Ready for Claude workspace upload!"
echo "💡 Upload the entire '$ARCHIVE_DIR' folder to your Claude workspace"
echo "   for persistent project context and efficient documentation generation."
