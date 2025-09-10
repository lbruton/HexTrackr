#!/usr/bin/env bash
# Common functions and variables for spec-aware scripts
# Supports working with any spec from any branch

# Get repository root
get_repo_root() {
    git rev-parse --show-toplevel
}

# Get current branch
get_current_branch() {
    git rev-parse --abbrev-ref HEAD
}

# Get the currently active spec from .active-spec file
get_active_spec() {
    local repo_root="$1"
    if [[ -f "$repo_root/.active-spec" ]]; then
        cat "$repo_root/.active-spec"
    else
        echo ""
    fi
}

# Set the active spec
set_active_spec() {
    local repo_root="$1"
    local spec_name="$2"
    echo "$spec_name" > "$repo_root/.active-spec"
}

# Validate spec name format (e.g., 023-feature-name)
validate_spec_name() {
    local spec="$1"
    if [[ ! "$spec" =~ ^[0-9]{3}- ]]; then
        echo "ERROR: Invalid spec name format: $spec"
        echo "Spec names should be like: 023-feature-name"
        return 1
    fi
    return 0
}

# Extract spec number from spec name (e.g., "023" from "023-feature-name")
get_spec_number() {
    local spec="$1"
    echo "$spec" | grep -o '^[0-9]\{3\}'
}

# Find spec by number (returns full spec name)
find_spec_by_number() {
    local repo_root="$1"
    local spec_num="$2"
    local specs_dir="$repo_root/hextrackr-specs/specs"
    
    # Pad number to 3 digits if needed (10# forces base 10 to avoid octal interpretation)
    spec_num=$(printf "%03d" $((10#$spec_num)))
    
    # Find directory starting with this number
    for dir in "$specs_dir"/"$spec_num"-*; do
        if [[ -d "$dir" ]]; then
            basename "$dir"
            return 0
        fi
    done
    
    echo ""
    return 1
}

# Get spec directory path
get_spec_dir() {
    local repo_root="$1"
    local spec_name="$2"
    echo "$repo_root/hextrackr-specs/specs/$spec_name"
}

# Get all standard paths for a spec
# Usage: eval $(get_spec_paths "spec-name")
# Sets: REPO_ROOT, CURRENT_BRANCH, SPEC_NAME, SPEC_DIR, FEATURE_SPEC, IMPL_PLAN, TASKS, etc.
get_spec_paths() {
    local spec_name="$1"
    local repo_root=$(get_repo_root)
    local current_branch=$(get_current_branch)
    
    # If no spec provided, try to get active spec
    if [[ -z "$spec_name" ]]; then
        spec_name=$(get_active_spec "$repo_root")
        if [[ -z "$spec_name" ]]; then
            echo "ERROR: No spec specified and no active spec found" >&2
            echo "Usage: Provide spec name or number as argument" >&2
            return 1
        fi
    fi
    
    # If spec_name is just a number, find the full spec name
    if [[ "$spec_name" =~ ^[0-9]+$ ]]; then
        spec_name=$(find_spec_by_number "$repo_root" "$spec_name")
        if [[ -z "$spec_name" ]]; then
            echo "ERROR: Spec number $1 not found" >&2
            return 1
        fi
    fi
    
    local spec_dir=$(get_spec_dir "$repo_root" "$spec_name")
    
    echo "REPO_ROOT='$repo_root'"
    echo "CURRENT_BRANCH='$current_branch'"
    echo "SPEC_NAME='$spec_name'"
    echo "SPEC_NUM='$(get_spec_number "$spec_name")'"
    echo "SPEC_DIR='$spec_dir'"
    echo "FEATURE_SPEC='$spec_dir/spec.md'"
    echo "IMPL_PLAN='$spec_dir/plan.md'"
    echo "TASKS='$spec_dir/tasks.md'"
    echo "RESEARCH='$spec_dir/research.md'"
    echo "DATA_MODEL='$spec_dir/data-model.md'"
    echo "QUICKSTART='$spec_dir/quickstart.md'"
    echo "CONTRACTS_DIR='$spec_dir/contracts'"
}

# List all available specs
list_specs() {
    local repo_root="$1"
    local specs_dir="$repo_root/hextrackr-specs/specs"
    
    echo "Available specs:"
    for dir in "$specs_dir"/*; do
        if [[ -d "$dir" ]]; then
            local spec_name=$(basename "$dir")
            local active=""
            if [[ "$(get_active_spec "$repo_root")" == "$spec_name" ]]; then
                active=" [ACTIVE]"
            fi
            echo "  $spec_name$active"
        fi
    done
}

# Check if a spec exists
spec_exists() {
    local repo_root="$1"
    local spec_name="$2"
    local spec_dir=$(get_spec_dir "$repo_root" "$spec_name")
    [[ -d "$spec_dir" ]]
}

# Check if a file exists and report
check_file() {
    local file="$1"
    local description="$2"
    if [[ -f "$file" ]]; then
        echo "  ✓ $description"
        return 0
    else
        echo "  ✗ $description"
        return 1
    fi
}

# Check if a directory exists and has files
check_dir() {
    local dir="$1"
    local description="$2"
    if [[ -d "$dir" ]] && [[ -n "$(ls -A "$dir" 2>/dev/null)" ]]; then
        echo "  ✓ $description"
        return 0
    else
        echo "  ✗ $description"
        return 1
    fi
}

# Check all required spec-kit documents
check_spec_documents() {
    local spec_dir="$1"
    local all_present=true
    
    echo "Checking spec-kit documents:"
    
    # Phase 0 (Research)
    check_file "$spec_dir/spec.md" "spec.md (specification)" || all_present=false
    check_file "$spec_dir/research.md" "research.md (technical research)" || all_present=false
    
    # Phase 1 (Planning)
    check_file "$spec_dir/plan.md" "plan.md (implementation plan)" || all_present=false
    check_file "$spec_dir/data-model.md" "data-model.md (data model)" || all_present=false
    check_dir "$spec_dir/contracts" "contracts/ (API specifications)" || all_present=false
    check_file "$spec_dir/quickstart.md" "quickstart.md (testing guide)" || all_present=false
    
    # Phase 2 (Tasks)
    check_file "$spec_dir/tasks.md" "tasks.md (task breakdown)" || all_present=false
    
    if $all_present; then
        echo "✅ All spec-kit documents present"
        return 0
    else
        echo "⚠️  Some documents missing (create even if minimal)"
        return 1
    fi
}

# Helper functions for file updates

# Update a specific section in a markdown file while preserving other sections
# Usage: update_markdown_section file_path section_header new_content
update_markdown_section() {
    local file_path="$1"
    local section_header="$2"
    local new_content="$3"
    local temp_file=$(mktemp)
    
    if [[ ! -f "$file_path" ]]; then
        echo "ERROR: File does not exist: $file_path" >&2
        return 1
    fi
    
    # Create backup
    cp "$file_path" "${file_path}.backup.$(date +%s)"
    
    # Process the file
    local in_section=false
    local section_found=false
    
    while IFS= read -r line; do
        # Check if this is the start of our target section
        if [[ "$line" =~ ^#+[[:space:]]*"$section_header"[[:space:]]*$ ]]; then
            echo "$line" >> "$temp_file"
            echo "" >> "$temp_file"
            echo "$new_content" >> "$temp_file"
            echo "" >> "$temp_file"
            in_section=true
            section_found=true
        # Check if this is the start of another section at same or higher level
        elif [[ "$line" =~ ^#+ ]] && [[ "$in_section" == true ]]; then
            echo "$line" >> "$temp_file"
            in_section=false
        # Copy line if not in target section
        elif [[ "$in_section" == false ]]; then
            echo "$line" >> "$temp_file"
        fi
    done < "$file_path"
    
    # If section wasn't found, append it
    if [[ "$section_found" == false ]]; then
        echo "" >> "$temp_file"
        echo "## $section_header" >> "$temp_file"
        echo "" >> "$temp_file"
        echo "$new_content" >> "$temp_file"
    fi
    
    # Replace original file
    mv "$temp_file" "$file_path"
    echo "Updated section '$section_header' in $file_path"
}

# Extract a specific section from a markdown file
# Usage: extract_markdown_section file_path section_header
extract_markdown_section() {
    local file_path="$1"
    local section_header="$2"
    
    if [[ ! -f "$file_path" ]]; then
        echo ""
        return 1
    fi
    
    local in_section=false
    local content=""
    
    while IFS= read -r line; do
        # Check if this is the start of our target section
        if [[ "$line" =~ ^#+[[:space:]]*"$section_header"[[:space:]]*$ ]]; then
            in_section=true
            continue
        # Check if this is the start of another section at same or higher level
        elif [[ "$line" =~ ^#+ ]] && [[ "$in_section" == true ]]; then
            break
        # Collect content if in target section
        elif [[ "$in_section" == true ]]; then
            content+="$line"$'\n'
        fi
    done < "$file_path"
    
    echo "$content"
}

# Check if a section exists in markdown file
# Usage: has_markdown_section file_path section_header
has_markdown_section() {
    local file_path="$1"
    local section_header="$2"
    
    if [[ ! -f "$file_path" ]]; then
        return 1
    fi
    
    grep -q "^#+[[:space:]]*$section_header[[:space:]]*$" "$file_path"
}