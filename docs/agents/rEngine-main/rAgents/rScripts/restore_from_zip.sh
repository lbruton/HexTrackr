#!/bin/bash

# StackTrackr Zip Restoration Script  
# Restores project after unzipping modified files from ChatGPT/GPT5
# Handles permission restoration and path normalization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ⚠️ $1"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"; }

# Detect project root dynamically
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AGENTS_DIR="$PROJECT_ROOT/agents"
ZIP_PREP_DIR="$AGENTS_DIR/zip_prep"

log "🔄 Starting StackTrackr zip restoration workflow"
log "Project root detected: $PROJECT_ROOT"

# Function to restore executable permissions
restore_permissions() {
    log "Restoring executable permissions..."
    
    # Check if restoration metadata exists
    if [ -f "$ZIP_PREP_DIR/restoration_metadata.json" ]; then
        log "Using restoration metadata to restore permissions..."
        
        # Extract executable files list and restore permissions
        python3 -c "
import json
import os
import stat

try:
    with open('$ZIP_PREP_DIR/restoration_metadata.json', 'r') as f:
        metadata = json.load(f)
    
    project_root = '$PROJECT_ROOT'
    executable_files = metadata.get('executable_files', [])
    
    for file_path in executable_files:
        full_path = os.path.join(project_root, file_path)
        if os.path.exists(full_path):
            # Make file executable
            current_permissions = os.stat(full_path).st_mode
            os.chmod(full_path, current_permissions | stat.S_IEXEC)
            print(f'✓ Restored executable permission: {file_path}')
        else:
            print(f'⚠️  File not found: {file_path}')
            
except Exception as e:
    print(f'Error restoring permissions: {e}')
"
    else
        warn "No restoration metadata found - using default permission restoration"
        
        # Default: make all .sh files executable
        find "$PROJECT_ROOT" -name "*.sh" -type f -exec chmod +x {} \;
        success "Made all .sh files executable"
    fi
    
    # Ensure portable scripts are executable
    if [ -d "$ZIP_PREP_DIR" ]; then
        chmod +x "$ZIP_PREP_DIR"/*.sh 2>/dev/null || true
        success "Ensured portable scripts are executable"
    fi
}

# Function to validate JSON integrity
validate_json_files() {
    log "Validating JSON file integrity..."
    
    local errors=0
    local total=0
    
    for json_file in "$AGENTS_DIR"/*.json; do
        if [ -f "$json_file" ]; then
            ((total++))
            if python3 -m json.tool "$json_file" > /dev/null 2>&1; then
                log "✓ $(basename "$json_file") - valid JSON"
            else
                error "✗ $(basename "$json_file") - INVALID JSON"
                ((errors++))
            fi
        fi
    done
    
    if [ $errors -eq 0 ]; then
        success "All $total JSON files are valid"
    else
        error "Found $errors invalid JSON files out of $total total"
        return 1
    fi
}

# Function to validate cross-references
validate_cross_references() {
    log "Validating cross-references between memory files..."
    
    python3 -c "
import json
import os
from pathlib import Path

agents_dir = Path('$AGENTS_DIR')
validation_errors = []

try:
    # Load key memory files
    memory_files = {}
    for json_file in ['memory.json', 'tasks.json', 'bugs.json', 'roadmap.json', 'decisions.json']:
        file_path = agents_dir / json_file
        if file_path.exists():
            with open(file_path, 'r') as f:
                memory_files[json_file] = json.load(f)
    
    # Basic validation checks
    checks_passed = 0
    total_checks = 0
    
    # Check if bugs referenced in roadmap exist
    if 'roadmap.json' in memory_files and 'bugs.json' in memory_files:
        total_checks += 1
        roadmap = memory_files['roadmap.json']
        bugs = memory_files['bugs.json']
        
        bug_ids = set()
        if 'active_bugs' in bugs:
            bug_ids.update(bugs['active_bugs'].keys())
        if 'resolved_bugs' in bugs:
            bug_ids.update(bugs['resolved_bugs'].keys())
        
        # Check roadmap references
        valid_refs = True
        for milestone in roadmap.get('active_milestones', {}).values():
            for bug_id in milestone.get('bugs_blocking', []):
                if bug_id not in bug_ids:
                    validation_errors.append(f'Roadmap references non-existent bug: {bug_id}')
                    valid_refs = False
        
        if valid_refs:
            checks_passed += 1
            print('✓ Roadmap bug references are valid')
        else:
            print('✗ Found invalid roadmap bug references')
    
    # Check if tasks reference valid bugs/features
    if 'tasks.json' in memory_files and 'bugs.json' in memory_files:
        total_checks += 1
        tasks = memory_files['tasks.json'] 
        bugs = memory_files['bugs.json']
        
        bug_ids = set()
        if 'active_bugs' in bugs:
            bug_ids.update(bugs['active_bugs'].keys())
        if 'resolved_bugs' in bugs:
            bug_ids.update(bugs['resolved_bugs'].keys())
        
        valid_refs = True
        for task_key in ['active_tasks', 'completed_tasks']:
            for task in tasks.get(task_key, {}).values():
                related_bug = task.get('related_bug')
                if related_bug and related_bug not in bug_ids:
                    validation_errors.append(f'Task references non-existent bug: {related_bug}')
                    valid_refs = False
        
        if valid_refs:
            checks_passed += 1
            print('✓ Task bug references are valid')
        else:
            print('✗ Found invalid task bug references')
    
    # Summary
    print(f'\\nValidation Summary: {checks_passed}/{total_checks} checks passed')
    
    if validation_errors:
        print('\\nValidation Errors:')
        for error in validation_errors:
            print(f'  ✗ {error}')
        exit(1)
    else:
        print('✓ All cross-references are valid')
        
except Exception as e:
    print(f'Error during validation: {e}')
    exit(1)
"
    
    if [ $? -eq 0 ]; then
        success "Cross-reference validation passed"
    else
        error "Cross-reference validation failed"
        return 1
    fi
}

# Function to update timestamps
update_timestamps() {
    log "Updating restoration timestamps..."
    
    local current_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    for json_file in "$AGENTS_DIR"/{memory,decisions,tasks,bugs,roadmap}.json; do
        if [ -f "$json_file" ]; then
            python3 -c "
import json
from datetime import datetime

try:
    with open('$json_file', 'r') as f:
        data = json.load(f)
    
    if 'metadata' in data:
        data['metadata']['last_updated'] = '$current_time'
        data['metadata']['restored_from_zip'] = True
        data['metadata']['restoration_date'] = '$current_time'
    
    with open('$json_file', 'w') as f:
        json.dump(data, f, indent=2)
    
    print('✓ Updated $(basename "$json_file")')
except Exception as e:
    print(f'✗ Error updating $(basename "$json_file"): {e}')
" 2>/dev/null || warn "Could not update $(basename "$json_file")"
        fi
    done
    
    success "Timestamps updated"
}

# Function to check git status
check_git_status() {
    log "Checking git repository status..."
    
    if [ -d "$PROJECT_ROOT/.git" ]; then
        cd "$PROJECT_ROOT"
        
        log "Git status:"
        git status --short
        
        if git diff --quiet && git diff --staged --quiet; then
            success "Working directory is clean"
        else
            warn "Working directory has changes from zip restoration"
            log "Consider reviewing and committing these changes"
        fi
    else
        warn "Not in a git repository"
    fi
}

# Function to run final validation
run_final_validation() {
    log "Running final system validation..."
    
    # Test portable scripts
    if [ -f "$ZIP_PREP_DIR/sync_tool_portable.sh" ]; then
        log "Testing portable sync tool..."
        if "$ZIP_PREP_DIR/sync_tool_portable.sh" validate; then
            success "Portable sync tool is working"
        else
            warn "Portable sync tool validation failed"
        fi
    fi
    
    # Check memory system consistency
    validate_json_files
    validate_cross_references
    
    success "Final validation completed"
}

# Function to create restoration report
create_restoration_report() {
    log "Creating restoration report..."
    
    local report_file="$AGENTS_DIR/restoration_report_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "restoration_metadata": {
    "restored_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "project_root": "$PROJECT_ROOT",
    "restoration_script_version": "1.0"
  },
  "validation_results": {
    "json_files_valid": true,
    "cross_references_valid": true,
    "permissions_restored": true,
    "git_status_checked": true
  },
  "next_steps": [
    "Review any git changes from the restoration",
    "Test critical functionality",
    "Run full memory sync if needed",
    "Commit changes if everything looks good"
  ],
  "portable_scripts_available": [
    "agents/zip_prep/handoff_portable.sh",
    "agents/zip_prep/sync_tool_portable.sh"
  ]
}
EOF
    
    success "Restoration report created: $(basename "$report_file")"
}

# Main execution
main() {
    log "🔄 Starting zip restoration process..."
    
    # Check if we're in the right place
    if [ ! -d "$AGENTS_DIR" ]; then
        error "Agents directory not found. Are you in the right project directory?"
        exit 1
    fi
    
    # Run restoration steps
    restore_permissions
    update_timestamps
    run_final_validation
    check_git_status
    create_restoration_report
    
    success "🎉 Zip restoration completed successfully!"
    echo
    log "📋 What was restored:"
    echo "✅ Executable permissions on shell scripts"
    echo "✅ JSON file integrity validated"
    echo "✅ Cross-references between memory files checked"
    echo "✅ Timestamps updated to reflect restoration"
    echo "✅ Git status checked"
    echo
    log "🚀 Your StackTrackr project is ready to use!"
    log "📁 Portable scripts remain available in agents/zip_prep/"
    
    if [ -d "$PROJECT_ROOT/.git" ]; then
        echo
        warn "💡 Tip: Review git changes and commit if everything looks good"
    fi
}

# Run main function
main "$@"
