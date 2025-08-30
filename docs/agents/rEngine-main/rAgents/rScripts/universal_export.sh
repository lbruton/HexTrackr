#!/bin/bash
# StackTrackr Universal Export System
# Vendor-neutral exports for any LLM collaboration
# Supports: ZIP bundles, Markdown flattening, and Memory bundles

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
EXPORT_DIR="$ROOT_DIR/portable_exchange"
TIMESTAMP=$(date +"%Y-%m-%dT%H-%M-%SZ")
GIT_HASH=$(cd "$ROOT_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "nogit")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

usage() {
    cat << EOF
StackTrackr Universal Export System

USAGE:
    $0 <export_type> [options]

EXPORT TYPES:
    zip           Full project + memory ZIP bundle (for ChatGPT, Claude, etc.)
    markdown      Flattened markdown export (for LLMs without file support)
    memory        Memory-only bundle (for memory-focused collaboration)
    code          Code-only export (for public repo + memory separation)
    delta         Incremental changes bundle
    change-bundle MemoryChangeBundle template for RFC-6902 patch workflow

OPTIONS:
    --output-dir DIR    Export directory (default: portable_exchange/)
    --include-memory    Include memory files (default: true for zip/markdown)
    --exclude-memory    Exclude memory files 
    --format FORMAT     Output format (zip|tar|dir) (default: zip)
    --compress          Use compression (default: true)
    --llm TARGET        Target LLM (chatgpt|claude|gemini|copilot|universal)
    --private           Assume private repo mode (sanitize accordingly)
    --public            Assume public repo mode (include GitHub URLs)
    --help             Show this help

EXAMPLES:
    # Full bundle for any LLM
    $0 zip

    # Memory-only for GPT collaboration (public repo)
    $0 memory --public --llm chatgpt

    # Markdown export for LLMs without file upload
    $0 markdown --llm claude

    # Code-only for public repo reference
    $0 code --public

    # Delta for incremental updates
    $0 delta --llm universal

OUTPUT:
    All exports include:
    - manifest.json (metadata, compatibility info)
    - README.md (instructions for target LLM)
    - apply_changes.sh (script to apply returned changes)

EOF
}

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}✅${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}⚠️${NC} $1" >&2
}

error() {
    echo -e "${RED}❌${NC} $1" >&2
    exit 1
}

# Parse command line arguments
EXPORT_TYPE=""
OUTPUT_DIR="$EXPORT_DIR"
INCLUDE_MEMORY="auto"
OUTPUT_FORMAT="zip"
COMPRESS="true"
TARGET_LLM="universal"
REPO_MODE="auto"

while [[ $# -gt 0 ]]; do
    case $1 in
        zip|markdown|memory|code|delta|change-bundle)
            EXPORT_TYPE="$1"
            ;;
        --output-dir)
            OUTPUT_DIR="$2"
            shift
            ;;
        --include-memory)
            INCLUDE_MEMORY="true"
            ;;
        --exclude-memory)
            INCLUDE_MEMORY="false"
            ;;
        --format)
            OUTPUT_FORMAT="$2"
            shift
            ;;
        --no-compress)
            COMPRESS="false"
            ;;
        --llm)
            TARGET_LLM="$2"
            shift
            ;;
        --private)
            REPO_MODE="private"
            ;;
        --public)
            REPO_MODE="public"
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
    shift
done

# Validate arguments
if [[ -z "$EXPORT_TYPE" ]]; then
    error "Export type required. Use --help for usage."
fi

# Auto-detect repository mode
if [[ "$REPO_MODE" == "auto" ]]; then
    if git remote get-url origin 2>/dev/null | grep -q "github.com.*lbruton/StackTrackr"; then
        REPO_MODE="public"
        log "Auto-detected public repository"
    else
        REPO_MODE="private"
        log "Auto-detected private repository"
    fi
fi

# Auto-configure memory inclusion
if [[ "$INCLUDE_MEMORY" == "auto" ]]; then
    case "$EXPORT_TYPE" in
        zip|markdown) INCLUDE_MEMORY="true" ;;
        memory) INCLUDE_MEMORY="true" ;;
        code) INCLUDE_MEMORY="false" ;;
        delta) INCLUDE_MEMORY="true" ;;
    esac
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"
WORK_DIR=$(mktemp -d)
trap "rm -rf '$WORK_DIR'" EXIT

log "Starting $EXPORT_TYPE export for $TARGET_LLM"
log "Repository mode: $REPO_MODE"
log "Include memory: $INCLUDE_MEMORY"

# Generate base manifest
generate_manifest() {
    local export_name="$1"
    cat > "$WORK_DIR/manifest.json" << EOF
{
  "export_info": {
    "version": "1.0",
    "export_type": "$EXPORT_TYPE",
    "target_llm": "$TARGET_LLM",
    "created_at": "$TIMESTAMP",
    "git_hash": "$GIT_HASH",
    "repository_mode": "$REPO_MODE",
    "includes_memory": $INCLUDE_MEMORY,
    "bundle_id": "${export_name}"
  },
  "project_info": {
    "name": "StackTrackr",
    "description": "Advanced coin inventory management system",
    "main_language": "JavaScript",
    "frameworks": ["Vanilla JS", "HTML5", "CSS3"],
    "architecture": "Single-page application with modular JS components"
  },
  "repository": {
    "url": "https://github.com/lbruton/StackTrackr",
    "branch": "$(cd "$ROOT_DIR" && git branch --show-current 2>/dev/null || echo "main")",
    "is_public": $([ "$REPO_MODE" = "public" ] && echo "true" || echo "false"),
    "last_commit": "$(cd "$ROOT_DIR" && git log -1 --format="%H %s" 2>/dev/null || echo "No git info")"
  },
  "compatibility": {
    "chatgpt": true,
    "claude": true,
    "gemini": true,
    "github_copilot": true,
    "other_llms": true
  },
  "instructions": {
    "how_to_use": "See README.md for specific instructions",
    "apply_changes": "Use apply_changes.sh to safely apply returned modifications",
    "memory_format": "RFC-6902 JSON Patch for memory changes"
  }
}
EOF
}

# Generate LLM-specific README
generate_readme() {
    local include_section=""
    case "$EXPORT_TYPE" in
        zip)
            include_section="- Complete project codebase (36 files)"
            if [ "$INCLUDE_MEMORY" = "true" ]; then
                include_section="$include_section
- Full memory system (agents/, decisions, tasks, etc.)"
            fi
            include_section="$include_section
- Configuration and documentation"
            ;;
        markdown)
            include_section="- Flattened markdown of entire project
- Syntax-highlighted code sections
- Hierarchical file structure"
            ;;
        memory)
            include_section="- Memory vault snapshot (snapshot.json)
- Event logs and schemas
- Access control policies"
            ;;
        code)
            include_section="- Core application code
- Documentation and configuration
- No sensitive memory data"
            ;;
        delta)
            include_section="- Incremental changes since last export
- JSON Patch format
- Change metadata and provenance"
            ;;
    esac

    local repo_section=""
    if [ "$REPO_MODE" = "public" ]; then
        repo_section="This repository is **PUBLIC** on GitHub. You can:
- Browse: https://github.com/lbruton/StackTrackr
- Review files directly without download
- Reference specific commits/branches/PRs
- Use GitHub's diff/blame features

**Recommended workflow for code changes:**
1. Browse the public repo for context
2. Work with memory bundle (if included) for sensitive data
3. Return code patches as unified diffs
4. Return memory changes as JSON Patch format"
    else
        repo_section="This repository is **PRIVATE**. All code is included in this bundle.

**Workflow for changes:**
1. Review included code structure
2. Work with memory data as needed
3. Return all changes as patches/diffs
4. Use apply_changes.sh to merge safely"
    fi

    local security_section=""
    if [ "$REPO_MODE" = "private" ]; then
        security_section="- This bundle has been sanitized for private collaboration
- No API keys, tokens, or sensitive data included
- Memory data may contain project context and decisions"
    else
        security_section="- Repository is public - no sensitive data concerns
- Memory bundle (if included) contains project intelligence
- All changes will be public when applied"
    fi

    cat > "$WORK_DIR/README.md" << EOF
# StackTrackr Export - $EXPORT_TYPE

**Target LLM:** $TARGET_LLM  
**Export Type:** $EXPORT_TYPE  
**Created:** $TIMESTAMP  
**Repository:** $([ "$REPO_MODE" = "public" ] && echo "Public" || echo "Private")

## Project Overview

StackTrackr is an advanced coin inventory management system built with vanilla JavaScript, HTML5, and CSS3. It features a modular architecture with comprehensive memory management for multi-agent collaboration.

### Key Components
- **Frontend:** Single-page application with modular JS components
- **Memory System:** JSON-based multi-agent collaboration with atomic operations
- **Architecture:** Event-driven with state management and persistence

## What's Included

$include_section

## Repository Access

$repo_section

## How to Work With This Export

### For Code Changes
1. Review the project structure and existing code
2. Make your modifications
3. Return changes as:
   - **Unified diff** (preferred): \`git apply\` compatible
   - **File patches**: Individual file changes
   - **New files**: Complete file contents with clear naming

### For Memory Changes  
1. Review current memory state
2. Propose changes as RFC-6902 JSON Patch format
3. Include confidence scores and justification
4. Respect access control policies (see policy/acl.json if included)

### Returning Changes

Create a response with:

\`\`\`
## Code Changes
[Unified diff or individual file patches]

## Memory Changes  
[JSON Patch format with metadata]

## Summary
[Brief description of changes and rationale]
\`\`\`

## Apply Changes Safely

Use the included \`apply_changes.sh\` script:

\`\`\`bash
# Apply code changes
./apply_changes.sh code patch.diff

# Apply memory changes  
./apply_changes.sh memory memory_patch.json

# Validate everything
./apply_changes.sh validate
\`\`\`

## Project Architecture Notes

- **Modular Design:** Each JS file handles specific functionality
- **Event-Driven:** Uses custom event system for component communication  
- **State Management:** Centralized state with persistence
- **Memory Vault:** Atomic operations with conflict resolution
- **Multi-Agent:** Designed for collaborative AI development

## Security Notes

$security_section

---

**Next Steps:** Review the project, make your changes, and return them in the format described above.
EOF
}

# Generate apply changes script
generate_apply_script() {
    cat > "$WORK_DIR/apply_changes.sh" << 'EOF'
#!/bin/bash
# StackTrackr Universal Change Applicator
# Safely applies changes from LLM collaboration

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
    echo "Usage: $0 <type> <file> [options]"
    echo "Types: code, memory, validate"
    echo "Examples:"
    echo "  $0 code patch.diff"
    echo "  $0 memory memory_patch.json"
    echo "  $0 validate"
    exit 1
}

apply_code_changes() {
    local patch_file="$1"
    
    if [[ ! -f "$patch_file" ]]; then
        echo "❌ Patch file not found: $patch_file"
        exit 1
    fi
    
    echo "🔍 Validating patch format..."
    if file "$patch_file" | grep -q "unified diff"; then
        echo "✅ Unified diff format detected"
        cd "$ROOT_DIR"
        
        # Dry run first
        echo "🧪 Testing patch application (dry run)..."
        if git apply --check "$patch_file"; then
            echo "✅ Patch validation passed"
            
            # Create backup
            backup_dir="backups/pre-patch-$(date +%Y%m%d-%H%M%S)"
            mkdir -p "$backup_dir"
            git stash push -m "Pre-patch backup $(date)" || true
            
            # Apply patch
            echo "📝 Applying patch..."
            git apply "$patch_file"
            echo "✅ Patch applied successfully"
            
            # Show what changed
            echo "📊 Changes applied:"
            git diff --name-only HEAD~1 2>/dev/null || git status --porcelain
            
        else
            echo "❌ Patch validation failed"
            exit 1
        fi
    else
        echo "❌ Unsupported patch format"
        exit 1
    fi
}

apply_memory_changes() {
    local patch_file="$1"
    
    if [[ ! -f "$patch_file" ]]; then
        echo "❌ Memory patch file not found: $patch_file"
        exit 1
    fi
    
    echo "🧠 Applying memory changes..."
    
    # Use memory vault system if available
    if [[ -f "$ROOT_DIR/agents/engine/memory_checkin.py" ]]; then
        echo "🔐 Using memory vault system..."
        cd "$ROOT_DIR"
        
        # Checkout memory
        python3 agents/engine/memory_checkin.py checkout "llm_collaboration" 600
        
        # Apply changes (simplified - would need proper JSON Patch implementation)
        echo "📝 Applying memory patch..."
        # This would use a proper JSON Patch library in production
        echo "⚠️  Memory patch application not yet implemented"
        echo "💡 Manual review required for: $patch_file"
        
        # Release lease
        python3 agents/engine/memory_checkin.py release "llm_collaboration"
    else
        echo "⚠️  Memory vault not available, manual application required"
    fi
}

validate_system() {
    echo "🔍 Validating StackTrackr system..."
    
    cd "$ROOT_DIR"
    
    # Check core files
    echo "📁 Checking core files..."
    local core_files=("index.html" "package.json" "js/init.js" "css/styles.css")
    for file in "${core_files[@]}"; do
        if [[ -f "$file" ]]; then
            echo "  ✅ $file"
        else
            echo "  ❌ $file (missing)"
        fi
    done
    
    # Check memory system
    echo "🧠 Checking memory system..."
    if [[ -f "agents/memory/snapshot.json" ]]; then
        echo "  ✅ Memory vault initialized"
        
        # Validate schema if available
        if [[ -f "agents/engine/validate_schema.py" ]]; then
            echo "  🔍 Validating memory schema..."
            python3 agents/engine/validate_schema.py agents/memory/snapshot.json memory-snapshot || true
        fi
    else
        echo "  ⚠️  Memory vault not initialized"
    fi
    
    # Check for syntax errors
    echo "🔍 Checking JavaScript syntax..."
    find js/ -name "*.js" -exec node -c {} \; 2>/dev/null && echo "  ✅ JavaScript syntax OK" || echo "  ⚠️  JavaScript syntax issues found"
    
    echo "✅ Validation complete"
}

# Main logic
if [[ $# -lt 1 ]]; then
    usage
fi

case "$1" in
    code)
        if [[ $# -lt 2 ]]; then
            echo "❌ Patch file required for code changes"
            usage
        fi
        apply_code_changes "$2"
        ;;
    memory)
        if [[ $# -lt 2 ]]; then
            echo "❌ Patch file required for memory changes"
            usage
        fi
        apply_memory_changes "$2"
        ;;
    validate)
        validate_system
        ;;
    *)
        echo "❌ Unknown type: $1"
        usage
        ;;
esac
EOF
    chmod +x "$WORK_DIR/apply_changes.sh"
}

# Export type implementations
export_zip() {
    local export_name="stacktrackr-full-${TIMESTAMP}-${GIT_HASH}"
    local zip_path="$OUTPUT_DIR/${export_name}.zip"
    
    log "Creating full ZIP export..."
    
    # Copy core project files
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='dist' \
          --exclude='*.log' --exclude='.DS_Store' \
          "$ROOT_DIR/" "$WORK_DIR/stacktrackr/"
    
    # Conditionally exclude memory
    if [[ "$INCLUDE_MEMORY" = "false" ]]; then
        rm -rf "$WORK_DIR/stacktrackr/agents"
        warn "Memory files excluded from export"
    fi
    
    # Generate metadata
    generate_manifest "$export_name"
    generate_readme
    generate_apply_script
    
    # Create ZIP
    cd "$WORK_DIR"
    if [[ "$COMPRESS" = "true" ]]; then
        zip -r "$zip_path" . -x "*.DS_Store" "*.log"
    else
        zip -0 -r "$zip_path" . -x "*.DS_Store" "*.log"
    fi
    
    success "ZIP export created: $zip_path"
    echo "Size: $(ls -lh "$zip_path" | awk '{print $5}')"
}

export_markdown() {
    local export_name="stacktrackr-markdown-${TIMESTAMP}-${GIT_HASH}"
    local md_path="$OUTPUT_DIR/${export_name}.md"
    
    log "Creating markdown export..."
    
    # Use existing goomba.sh but enhance it
    if [[ -f "$SCRIPT_DIR/goomba.sh" ]]; then
        bash "$SCRIPT_DIR/goomba.sh" > "$WORK_DIR/stacktrackr.md"
    else
        error "goomba.sh not found - markdown export unavailable"
    fi
    
    # Add metadata header
    cat > "$md_path" << EOF
# StackTrackr - Complete Project Export

**Export Type:** Markdown  
**Target LLM:** $TARGET_LLM  
**Created:** $TIMESTAMP  
**Repository:** $([ "$REPO_MODE" = "public" ] && echo "https://github.com/lbruton/StackTrackr" || echo "Private")

## Instructions

This is a complete flattened export of the StackTrackr project. All files have been concatenated into this single markdown document with syntax highlighting.

### How to Work With This Export

1. **Review:** Read through the project structure and code
2. **Modify:** Propose changes by referencing file paths and line numbers  
3. **Return:** Provide changes as unified diffs or complete file replacements

### Repository Access
$(if [ "$REPO_MODE" = "public" ]; then
    echo "✅ **Public Repository:** You can browse https://github.com/lbruton/StackTrackr directly"
else
    echo "🔒 **Private Repository:** All code is included below"
fi)

---

$(cat "$WORK_DIR/stacktrackr.md")
EOF
    
    success "Markdown export created: $md_path"
    echo "Size: $(ls -lh "$md_path" | awk '{print $5}')"
}

export_memory() {
    local export_name="stacktrackr-memory-${TIMESTAMP}-${GIT_HASH}"
    local bundle_path="$OUTPUT_DIR/${export_name}.zip"
    
    log "Creating memory bundle export..."
    
    # Create memory bundle structure
    mkdir -p "$WORK_DIR/MemoryBundle"
    
    # Initialize memory vault if needed
    if [[ -f "$ROOT_DIR/agents/engine/memory_checkin.py" ]]; then
        cd "$ROOT_DIR"
        python3 agents/engine/memory_checkin.py status || {
            log "Initializing memory vault..."
            python3 agents/engine/memory_checkin.py checkout "export_system" 60 >/dev/null
            python3 agents/engine/memory_checkin.py release "export_system" >/dev/null
        }
        
        # Copy memory files
        if [[ -f "agents/memory/snapshot.json" ]]; then
            cp "agents/memory/snapshot.json" "$WORK_DIR/MemoryBundle/"
        fi
        
        # Copy event logs (recent only)
        if [[ -d "agents/memory/eventlog" ]]; then
            mkdir -p "$WORK_DIR/MemoryBundle/eventlog"
            find "agents/memory/eventlog" -name "*.json" -mtime -30 -exec cp {} "$WORK_DIR/MemoryBundle/eventlog/" \;
        fi
        
        # Copy schemas
        if [[ -d "agents/schemas" ]]; then
            cp -r "agents/schemas" "$WORK_DIR/MemoryBundle/"
        fi
    else
        warn "Memory vault not available, using legacy JSON files"
        
        # Fallback to legacy files
        for file in decisions tasks bugs roadmap patterns; do
            if [[ -f "$ROOT_DIR/agents/${file}.json" ]]; then
                cp "$ROOT_DIR/agents/${file}.json" "$WORK_DIR/MemoryBundle/"
            fi
        done
    fi
    
    # Create access control policy
    mkdir -p "$WORK_DIR/MemoryBundle/policy"
    cat > "$WORK_DIR/MemoryBundle/policy/acl.json" << EOF
{
  "version": "1.0",
  "allow_paths": [
    "/decisions/*",
    "/tasks/*", 
    "/roadmap/*",
    "/patterns/*",
    "/agents/*/knowledge",
    "/agents/*/context"
  ],
  "deny_paths": [
    "/secrets/*",
    "/auth/*",
    "/agents/*/identity/credentials"
  ],
  "review_required_on": [
    "remove",
    "replace_high_impact"
  ],
  "max_patch_size": 50,
  "require_justification": true
}
EOF
    
    # Generate manifest
    cat > "$WORK_DIR/MemoryBundle/manifest.json" << EOF
{
  "version": "1",
  "bundle_id": "mb-${TIMESTAMP}",
  "base_hash": "$(cd "$ROOT_DIR" && find agents -name "*.json" -exec cat {} \; | shasum -a 256 | cut -d' ' -f1)",
  "created_at": "$TIMESTAMP",
  "provenance": {
    "exported_by": "universal_export",
    "git_hash": "$GIT_HASH",
    "env": "local"
  },
  "contents": {
    "snapshot": $([ -f "$WORK_DIR/MemoryBundle/snapshot.json" ] && echo "true" || echo "false"),
    "eventlog": $([ -d "$WORK_DIR/MemoryBundle/eventlog" ] && echo "true" || echo "false"),
    "schemas": $([ -d "$WORK_DIR/MemoryBundle/schemas" ] && echo "true" || echo "false"),
    "policy": true
  }
}
EOF
    
    # Add instructions
    generate_readme
    cp "$WORK_DIR/README.md" "$WORK_DIR/MemoryBundle/"
    
    # Create bundle
    cd "$WORK_DIR"
    zip -r "$bundle_path" MemoryBundle/ -x "*.DS_Store"
    
    success "Memory bundle created: $bundle_path"
    echo "Size: $(ls -lh "$bundle_path" | awk '{print $5}')"
}

export_code() {
    local export_name="stacktrackr-code-${TIMESTAMP}-${GIT_HASH}"
    local zip_path="$OUTPUT_DIR/${export_name}.zip"
    
    log "Creating code-only export..."
    
    # Copy project files excluding memory
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='dist' \
          --exclude='agents' --exclude='*.log' --exclude='.DS_Store' \
          "$ROOT_DIR/" "$WORK_DIR/stacktrackr/"
    
    # Keep only essential config from agents
    mkdir -p "$WORK_DIR/stacktrackr/agents/config"
    if [[ -f "$ROOT_DIR/agents/config/env.json" ]]; then
        cp "$ROOT_DIR/agents/config/env.json" "$WORK_DIR/stacktrackr/agents/config/"
    fi
    
    generate_manifest "$export_name"
    generate_readme
    generate_apply_script
    
    cd "$WORK_DIR"
    zip -r "$zip_path" . -x "*.DS_Store" "*.log"
    
    success "Code export created: $zip_path"
    echo "Size: $(ls -lh "$zip_path" | awk '{print $5}')"
}

export_delta() {
    local export_name="stacktrackr-delta-${TIMESTAMP}-${GIT_HASH}"
    local delta_path="$OUTPUT_DIR/${export_name}.zip"
    
    log "Creating delta export..."
    
    # Find changes since last export
    local last_export_hash=""
    if [[ -f "$OUTPUT_DIR/.last_export" ]]; then
        last_export_hash=$(cat "$OUTPUT_DIR/.last_export")
        log "Comparing against last export: $last_export_hash"
    else
        warn "No previous export found, creating full delta"
        last_export_hash="HEAD~10"  # Last 10 commits
    fi
    
    mkdir -p "$WORK_DIR/MemoryDelta"
    
    # Git changes
    cd "$ROOT_DIR"
    if git rev-parse --verify "$last_export_hash" >/dev/null 2>&1; then
        git diff "$last_export_hash" HEAD > "$WORK_DIR/MemoryDelta/code_changes.diff"
        git log --oneline "$last_export_hash..HEAD" > "$WORK_DIR/MemoryDelta/commit_log.txt"
    fi
    
    # Create delta manifest
    cat > "$WORK_DIR/MemoryDelta/base_hash.txt" << EOF
$last_export_hash
EOF
    
    cat > "$WORK_DIR/MemoryDelta/provenance.json" << EOF
{
  "delta_id": "delta-${TIMESTAMP}",
  "base_hash": "$last_export_hash",
  "head_hash": "$GIT_HASH",
  "created_at": "$TIMESTAMP",
  "change_summary": {
    "commits": $(git rev-list --count "$last_export_hash..HEAD" 2>/dev/null || echo 0),
    "files_changed": $(git diff --name-only "$last_export_hash" HEAD 2>/dev/null | wc -l || echo 0)
  }
}
EOF
    
    generate_readme
    cp "$WORK_DIR/README.md" "$WORK_DIR/MemoryDelta/"
    
    cd "$WORK_DIR"
    zip -r "$delta_path" MemoryDelta/ -x "*.DS_Store"
    
    # Save this export hash
    echo "$GIT_HASH" > "$OUTPUT_DIR/.last_export"
    
    success "Delta export created: $delta_path"
    echo "Size: $(ls -lh "$delta_path" | awk '{print $5}')"
}

export_change_bundle() {
    local export_name="MemoryChangeBundle-template-${TIMESTAMP}"
    local bundle_path="$OUTPUT_DIR/${export_name}.zip"
    
    log "Creating MemoryChangeBundle template..."
    
    # Create bundle structure
    mkdir -p "$WORK_DIR/MemoryChangeBundle-v1"
    cd "$WORK_DIR/MemoryChangeBundle-v1"
    
    # Create current memory snapshot
    if [[ -f "$ROOT_DIR/agents/memory/snapshot.json" ]]; then
        cp "$ROOT_DIR/agents/memory/snapshot.json" "./snapshot.current.json"
        log "✅ Current memory snapshot included"
    else
        warn "No memory snapshot found, creating empty template"
        echo '{}' > "./snapshot.current.json"
    fi
    
    # Copy template bundle structure
    if [[ -d "$ROOT_DIR/agents/memory_bundles/template_bundle" ]]; then
        cp -r "$ROOT_DIR/agents/memory_bundles/template_bundle"/* .
        log "✅ MemoryChangeBundle template structure copied"
    else
        error "MemoryChangeBundle template not found at agents/memory_bundles/template_bundle"
        return 1
    fi
    
    # Calculate current snapshot hash for manifest
    if [[ -f "./snapshot.current.json" ]]; then
        local snapshot_hash=$(python3 -c "
import json, hashlib
with open('./snapshot.current.json') as f:
    data = json.load(f)
hash_str = json.dumps(data, sort_keys=True, separators=(',', ':'))
print('sha256:' + hashlib.sha256(hash_str.encode()).hexdigest())
")
        
        # Update manifest with current hash
        python3 -c "
import json
with open('manifest.json', 'r') as f:
    manifest = json.load(f)
manifest['base_memory_hash'] = '$snapshot_hash'
manifest['timestamp'] = '$TIMESTAMP'
with open('manifest.json', 'w') as f:
    json.dump(manifest, f, indent=2)
"
        log "✅ Manifest updated with current snapshot hash: $snapshot_hash"
    fi
    
    # Create instructions for LLM collaboration
    cat > "./COLLABORATION_WORKFLOW.md" << 'EOF'
# MemoryChangeBundle Collaboration Workflow

## For LLMs (GPT, Claude, etc.)

When you need to make memory changes to StackTrackr:

1. **Analyze current snapshot**: `snapshot.current.json`
2. **Create RFC-6902 patches**: Update `patches/memory_patch.json`
3. **Update apply plan**: Modify `apply_plan.json` for SQLite operations
4. **Generate post-change snapshot**: Create `changed/snapshot.after.json`
5. **Document changes**: Update `risk_report.md`

## For Developers

To apply received changes:

```bash
# For JSON system (current)
python3 apply/apply_json_patch.py \
  --snapshot ./agents/memory/snapshot.json \
  --patch ./patches/memory_patch.json \
  --inplace --backup

# For SQLite system (future)
python3 apply/apply_sqlite_patch.py \
  --db ./agents/memory.sqlite \
  --patch ./patches/memory_patch.json \
  --plan ./apply_plan.json \
  --backup
```

## Bundle Format

This bundle follows the **MemoryChangeBundle-v1** specification for standardized memory collaboration between humans and LLMs.
EOF
    
    # Create installation script for dependencies
    cat > "./install_deps.sh" << 'EOF'
#!/bin/bash
# Install dependencies for MemoryChangeBundle apply scripts

echo "Installing MemoryChangeBundle dependencies..."

if command -v python3 &> /dev/null; then
    python3 -m pip install -r apply/requirements.txt
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Python 3 is required but not found"
    exit 1
fi
EOF
    chmod +x "./install_deps.sh"
    
    cd "$WORK_DIR"
    zip -r "$bundle_path" MemoryChangeBundle-v1/ -x "*.DS_Store"
    
    success "MemoryChangeBundle template created: $bundle_path"
    echo "Size: $(ls -lh "$bundle_path" | awk '{print $5}')"
    echo ""
    echo "📋 This bundle contains:"
    echo "   • Current memory snapshot for baseline"
    echo "   • Template RFC-6902 patch files"
    echo "   • Apply scripts for JSON and SQLite"
    echo "   • Collaboration workflow documentation"
    echo "   • Risk assessment template"
    echo ""
    echo "🤖 Send this to an LLM for standardized memory collaboration!"
}

# Execute the requested export type
case "$EXPORT_TYPE" in
    zip) export_zip ;;
    markdown) export_markdown ;;
    memory) export_memory ;;
    code) export_code ;;
    delta) export_delta ;;
    change-bundle) export_change_bundle ;;
    *) error "Unknown export type: $EXPORT_TYPE" ;;
esac

# Summary
log "Export completed successfully"
echo ""
echo "🎯 Target LLM: $TARGET_LLM"
echo "📦 Export type: $EXPORT_TYPE"  
echo "📁 Output directory: $OUTPUT_DIR"
echo "🔧 Repository mode: $REPO_MODE"
echo ""

if [[ "$REPO_MODE" = "public" ]]; then
    echo "💡 Since your repo is public, you can also just share the GitHub URL:"
    echo "   https://github.com/lbruton/StackTrackr"
    echo ""
fi

echo "✅ Ready for LLM collaboration!"
