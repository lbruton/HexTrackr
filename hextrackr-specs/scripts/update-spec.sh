#!/usr/bin/env bash
# Update existing specification while preserving unchanged sections
# Usage: ./update-spec.sh [spec-number|spec-name] "Updated feature description"

set -e

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Main execution
main() {
    local spec_arg="$1"
    local new_description="$2"
    
    if [[ -z "$spec_arg" ]]; then
        echo "Usage: $0 [spec-number|spec-name] \"Updated feature description\""
        echo ""
        echo "Examples:"
        echo "  $0 023 \"Enhanced vulnerability table with additional filters\""
        echo "  $0 023-enhance-hextrackr-vulnerability \"Enhanced vulnerability table with additional filters\""
        echo ""
        
        # Show available specs
        local repo_root=$(get_repo_root)
        list_specs "$repo_root"
        exit 1
    fi
    
    if [[ -z "$new_description" ]]; then
        echo "ERROR: Feature description required"
        echo "Usage: $0 [spec-number|spec-name] \"Updated feature description\""
        exit 1
    fi
    
    # Get spec paths
    eval $(get_spec_paths "$spec_arg")
    
    # Validate spec exists
    if [[ ! -d "$SPEC_DIR" ]]; then
        echo "ERROR: Spec not found: $spec_arg"
        echo "Available specs:"
        list_specs "$REPO_ROOT"
        exit 1
    fi
    
    echo "🔄 Updating specification: $SPEC_NAME"
    echo "📁 Location: $SPEC_DIR"
    echo "📝 New description: $new_description"
    echo ""
    
    # Check if spec.md exists
    if [[ ! -f "$FEATURE_SPEC" ]]; then
        echo "ERROR: spec.md not found in $SPEC_DIR"
        echo "Cannot update non-existent specification"
        exit 1
    fi
    
    # Simple approach: Just update the Input description line while preserving everything else
    echo "🔧 Updating feature description..."
    
    # Create temporary file for updated spec
    local temp_spec=$(mktemp)
    
    # Process the existing file and update only the Input line
    while IFS= read -r line; do
        if [[ "$line" =~ ^\*\*Input\*\*:.*User\ description: ]]; then
            echo "**Input**: User description: \"$new_description\""
        else
            echo "$line"
        fi
    done < "$FEATURE_SPEC" > "$temp_spec"
    
    # Create backup of original
    cp "$FEATURE_SPEC" "${FEATURE_SPEC}.backup.$(date +%s)"
    
    # Replace original with updated version
    mv "$temp_spec" "$FEATURE_SPEC"
    
    echo "✅ Specification updated successfully"
    echo ""
    echo "📋 Summary of changes:"
    echo "  • Updated feature description: $new_description"
    echo "  • Preserved existing user scenarios and requirements"
    echo "  • Maintained execution status and review checklist"
    echo "  • Created backup: ${FEATURE_SPEC}.backup.*"
    echo ""
    echo "🔍 Next steps:"
    echo "  1. Review updated spec.md for accuracy"
    echo "  2. Update related documents if needed (research.md, plan.md, etc.)"
    echo "  3. Use /update-plan command to update implementation plan"
    echo ""
    
    # Output JSON for potential automation
    echo "{"
    echo "  \"status\": \"success\","
    echo "  \"spec_name\": \"$SPEC_NAME\","
    echo "  \"spec_dir\": \"$SPEC_DIR\","
    echo "  \"updated_file\": \"$FEATURE_SPEC\","
    echo "  \"backup_created\": true,"
    echo "  \"description\": \"$new_description\""
    echo "}"
}

# Execute main function with all arguments
main "$@"