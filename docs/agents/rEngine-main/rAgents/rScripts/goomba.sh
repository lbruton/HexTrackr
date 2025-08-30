#!/bin/bash

# StackTrackr Goomba - Flatten Everything to Markdown
# Inspired by the user's goomba script for LLMs that don't take zip files
# Creates a single comprehensive markdown file with all project content

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ⚠️ $1"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')]${NC} ❌ $1"; }

# Detect project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
EXCHANGE_DIR="$PROJECT_ROOT/portable_exchange"

log "🍄 StackTrackr Goomba - Flattening everything to markdown"

# Create exchange directory
mkdir -p "$EXCHANGE_DIR"

# Function to sanitize filename for markdown headers
sanitize_filename() {
    echo "$1" | sed 's|/|_|g' | sed 's|\.|_|g'
}

# Function to detect file type and apply syntax highlighting
get_syntax_type() {
    local file="$1"
    local ext="${file##*.}"
    
    case "$ext" in
        "js") echo "javascript" ;;
        "json") echo "json" ;;
        "css") echo "css" ;;
        "html") echo "html" ;;
        "md") echo "markdown" ;;
        "sh") echo "bash" ;;
        "py") echo "python" ;;
        "yml"|"yaml") echo "yaml" ;;
        *) echo "text" ;;
    esac
}

# Function to add file content to markdown
add_file_to_markdown() {
    local file="$1"
    local rel_path="${file#$PROJECT_ROOT/}"
    local syntax=$(get_syntax_type "$file")
    
    echo "" >> "$output_file"
    echo "## 📄 \`$rel_path\`" >> "$output_file"
    echo "" >> "$output_file"
    echo "\`\`\`$syntax" >> "$output_file"
    cat "$file" >> "$output_file"
    echo "" >> "$output_file"
    echo "\`\`\`" >> "$output_file"
    echo "" >> "$output_file"
    
    log "📄 Added: $rel_path"
}

# Function to create comprehensive markdown
create_goomba_markdown() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    output_file="$EXCHANGE_DIR/StackTrackr_Goomba_$timestamp.md"
    
    log "Creating comprehensive markdown file..."
    
    # Header
    cat > "$output_file" << EOF
# 🍄 StackTrackr Complete Project Export (Goomba Style)

**Generated**: $(date)  
**Project**: StackTrackr - Coin Collection Management Application  
**Export Type**: Complete Flattened Markdown for LLMs  

## 🧠 **Quick Context**
This is a complete export of the StackTrackr project flattened into a single markdown file. The project includes a sophisticated multi-agent memory system in the \`agents/\` directory that contains all previous decisions, bug tracking, roadmap planning, and collaboration patterns.

## 📋 **Key Memory Files to Check First**
- \`agents/memory.json\` - Core agent memories and decisions
- \`agents/bugs.json\` - Current bug tracking with priorities
- \`agents/roadmap.json\` - Feature planning and milestones  
- \`agents/tasks.json\` - Task tracking with dependencies
- \`agents/prompts.json\` - Reusable prompt library

## 🎯 **Current Focus Areas**
1. **Filter System Issues** - BUG-006 (filter chips styling/colors) 
2. **UI Polish** - Table styling consistency
3. **Performance** - Planning virtual scrolling for large datasets

---

# 📁 **Complete Project Files**

EOF
    
    # Add main project files first
    log "Adding main project files..."
    
    # Critical files first
    for critical_file in "index.html" "package.json" "README.md" "AGENTS.md"; do
        if [ -f "$PROJECT_ROOT/$critical_file" ]; then
            add_file_to_markdown "$PROJECT_ROOT/$critical_file"
        fi
    done
    
    # Memory system (most important!)
    log "Adding memory system files..."
    echo "---" >> "$output_file"
    echo "# 🧠 **MEMORY SYSTEM (CRITICAL CONTEXT)**" >> "$output_file"
    echo "---" >> "$output_file"
    
    for memory_file in "$PROJECT_ROOT/agents"/*.json; do
        if [ -f "$memory_file" ]; then
            add_file_to_markdown "$memory_file"
        fi
    done
    
    # JavaScript files
    log "Adding JavaScript files..."
    echo "---" >> "$output_file"
    echo "# ⚡ **JAVASCRIPT SOURCE CODE**" >> "$output_file"
    echo "---" >> "$output_file"
    
    for js_file in "$PROJECT_ROOT/js"/*.js; do
        if [ -f "$js_file" ]; then
            add_file_to_markdown "$js_file"
        fi
    done
    
    # CSS files
    log "Adding CSS files..."
    echo "---" >> "$output_file"
    echo "# 🎨 **STYLES**" >> "$output_file"
    echo "---" >> "$output_file"
    
    for css_file in "$PROJECT_ROOT/css"/*.css; do
        if [ -f "$css_file" ]; then
            add_file_to_markdown "$css_file"
        fi
    done
    
    # Scripts
    log "Adding utility scripts..."
    echo "---" >> "$output_file"
    echo "# 🔧 **UTILITY SCRIPTS**" >> "$output_file"
    echo "---" >> "$output_file"
    
    for script_file in "$PROJECT_ROOT/agents/scripts"/*.{sh,py}; do
        if [ -f "$script_file" ]; then
            add_file_to_markdown "$script_file"
        fi
    done
    
    # Documentation
    log "Adding documentation..."
    echo "---" >> "$output_file"
    echo "# 📚 **DOCUMENTATION**" >> "$output_file"
    echo "---" >> "$output_file"
    
    for doc_file in "$PROJECT_ROOT/docs"/*.md; do
        if [ -f "$doc_file" ]; then
            add_file_to_markdown "$doc_file"
        fi
    done
    
    # Key archive files
    log "Adding key archive files..."
    echo "---" >> "$output_file"
    echo "# 📦 **KEY ARCHIVE FILES**" >> "$output_file"
    echo "---" >> "$output_file"
    
    for archive_file in "$PROJECT_ROOT/archive"/*.md; do
        if [ -f "$archive_file" ]; then
            add_file_to_markdown "$archive_file"
        fi
    done
    
    # Footer with instructions
    cat >> "$output_file" << EOF

---

# 🚀 **USAGE INSTRUCTIONS FOR LLM**

## 🎯 **Getting Started**
1. **Read the Memory System First** - Check \`agents/memory.json\`, \`bugs.json\`, \`roadmap.json\` for full context
2. **Understand Current State** - Review active bugs and roadmap milestones  
3. **Check Patterns** - \`agents/patterns.json\` contains coding standards and preferences
4. **Review Decisions** - \`agents/decisions.json\` has previous technical choices

## 🧠 **Key Context**
- This is a **coin collection management app** with advanced filtering and catalog integration
- **Multi-agent memory system** preserves all context and decisions
- **Current focus**: Filter system bugs and UI consistency
- **Next milestone**: v3.05.0 with enhanced filtering

## 🔧 **Making Changes**
- Maintain consistency with existing patterns
- Update relevant memory files when making decisions  
- Test filter functionality carefully (it's the current focus area)
- Follow the established coding style in \`agents/patterns.json\`

## 💡 **Pro Tips**
- The memory system is **the key** - it contains all the intelligence
- Previous agents have established solid patterns - follow them
- Bug priorities are clearly defined in \`agents/bugs.json\`
- Roadmap planning is structured in \`agents/roadmap.json\`

**You have complete project intelligence. Let's build! 🎉**

---

*Generated by StackTrackr Goomba v1.0 - $(date)*
EOF
    
    local file_size=$(du -h "$output_file" | cut -f1)
    success "Goomba markdown created: $(basename "$output_file") ($file_size)"
    echo "$output_file"
}

# Function to create quick memory summary
create_memory_summary() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local summary_file="$EXCHANGE_DIR/StackTrackr_Memory_Summary_$timestamp.md"
    
    log "Creating memory summary for quick LLM context..."
    
    cat > "$summary_file" << EOF
# 🧠 StackTrackr Memory Summary

**Generated**: $(date)  
**Purpose**: Quick context for LLMs that need just the essentials

## 🎯 **Project Overview**
StackTrackr is a comprehensive coin collection management application with advanced filtering, catalog integration, and a sophisticated multi-agent memory system.

## 🐛 **Active Bugs**
EOF
    
    # Extract active bugs from bugs.json
    if [ -f "$PROJECT_ROOT/agents/bugs.json" ]; then
        python3 -c "
import json
try:
    with open('$PROJECT_ROOT/agents/bugs.json', 'r') as f:
        bugs = json.load(f)
    for bug_id, bug in bugs.get('active_bugs', {}).items():
        print(f'- **{bug_id}**: {bug.get(\"title\", \"\")} (Priority: {bug.get(\"priority\", \"unknown\")})')
except: pass
" >> "$summary_file"
    fi
    
    cat >> "$summary_file" << EOF

## 🗺️ **Current Roadmap**
EOF
    
    # Extract active milestones from roadmap.json
    if [ -f "$PROJECT_ROOT/agents/roadmap.json" ]; then
        python3 -c "
import json
try:
    with open('$PROJECT_ROOT/agents/roadmap.json', 'r') as f:
        roadmap = json.load(f)
    for milestone_id, milestone in roadmap.get('active_milestones', {}).items():
        print(f'- **{milestone_id}**: {milestone.get(\"title\", \"\")} (Due: {milestone.get(\"target_date\", \"TBD\")})')
except: pass
" >> "$summary_file"
    fi
    
    cat >> "$summary_file" << EOF

## 📋 **Quick Access Commands**
- \`npm run package-gpt\` - Create GPT export package
- \`npm run process-gpt\` - Process returned files
- Check \`agents/prompts.json\` for common task aliases

## 🚀 **For Full Context**
Use the complete Goomba markdown export for full project intelligence. This summary is just the highlights!
EOF
    
    success "Memory summary created: $(basename "$summary_file")"
}

# Main execution
main() {
    log "🍄 Starting Goomba markdown generation..."
    
    # Quick memory sync
    local current_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    for json_file in "$PROJECT_ROOT/agents"/{memory,bugs,roadmap,tasks}.json; do
        if [ -f "$json_file" ]; then
            python3 -c "
import json
try:
    with open('$json_file', 'r') as f:
        data = json.load(f)
    if 'metadata' in data:
        data['metadata']['last_updated'] = '$current_time'
        data['metadata']['goomba_export_prep'] = True
    with open('$json_file', 'w') as f:
        json.dump(data, f, indent=2)
except: pass
" 2>/dev/null || true
        fi
    done
    
    # Create comprehensive markdown
    local goomba_file=$(create_goomba_markdown)
    
    # Create memory summary
    create_memory_summary
    
    success "🎉 Goomba export completed!"
    echo
    log "📁 Files created in portable_exchange/:"
    ls -la "$EXCHANGE_DIR"/*.md | tail -2 | while read line; do
        echo "   📄 $(basename "$(echo "$line" | awk '{print $NF}')")"
    done
    echo
    log "💡 Usage:"
    echo "   🍄 Full Export: Copy entire markdown content to LLM"
    echo "   ⚡ Quick Summary: Use memory summary for fast context"
    echo "   🎯 Perfect for: Qwen, Claude, local models that prefer markdown"
}

# Check if we're in the right directory
if [ ! -d "$PROJECT_ROOT/agents" ]; then
    error "Not in StackTrackr project directory"
    exit 1
fi

# Run main function
main "$@"
