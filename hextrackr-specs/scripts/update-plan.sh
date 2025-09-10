#!/usr/bin/env bash
# Update existing implementation plan while preserving key sections
# Usage: ./update-plan.sh [spec-number|spec-name]

set -e

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Main execution
main() {
    local spec_arg="$1"
    
    if [[ -z "$spec_arg" ]]; then
        echo "Usage: $0 [spec-number|spec-name]"
        echo ""
        echo "Examples:"
        echo "  $0 023"
        echo "  $0 023-enhance-hextrackr-vulnerability"
        echo ""
        
        # Show available specs
        local repo_root=$(get_repo_root)
        list_specs "$repo_root"
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
    
    echo "🔄 Updating implementation plan: $SPEC_NAME"
    echo "📁 Location: $SPEC_DIR"
    echo ""
    
    # Check prerequisites
    if [[ ! -f "$FEATURE_SPEC" ]]; then
        echo "ERROR: spec.md not found - cannot update plan without specification"
        exit 1
    fi
    
    # Check if plan.md exists
    local plan_exists=false
    if [[ -f "$IMPL_PLAN" ]]; then
        plan_exists=true
        echo "📖 Extracting existing plan sections to preserve..."
    else
        echo "📝 Creating new implementation plan..."
    fi
    
    # Extract sections to preserve if plan exists
    local technical_context=""
    local constitution_check=""
    local project_structure=""
    local complexity_tracking=""
    local progress_tracking=""
    
    if [[ "$plan_exists" == true ]]; then
        technical_context=$(extract_markdown_section "$IMPL_PLAN" "Technical Context")
        constitution_check=$(extract_markdown_section "$IMPL_PLAN" "Constitution Check")
        project_structure=$(extract_markdown_section "$IMPL_PLAN" "Project Structure")
        complexity_tracking=$(extract_markdown_section "$IMPL_PLAN" "Complexity Tracking")
        progress_tracking=$(extract_markdown_section "$IMPL_PLAN" "Progress Tracking")
    fi
    
    # Load plan template
    local plan_template="$REPO_ROOT/hextrackr-specs/templates/plan-template.md"
    if [[ ! -f "$plan_template" ]]; then
        echo "ERROR: Plan template not found: $plan_template"
        exit 1
    fi
    
    # Extract feature information from spec
    echo "🔍 Analyzing updated specification..."
    
    local feature_title=$(grep "^# " "$FEATURE_SPEC" | head -1 | sed 's/^# //')
    local feature_description=$(grep "Input.*:" "$FEATURE_SPEC" | head -1 | sed 's/.*Input.*: *//')
    local current_branch=$(get_current_branch)
    
    # Generate updated plan content
    echo "🔧 Generating updated implementation plan..."
    
    # Create temporary file for new plan
    local temp_plan=$(mktemp)
    
    # Process template with preserved and updated content
    while IFS= read -r line; do
        case "$line" in
            *"[FEATURE_TITLE]"*)
                echo "$line" | sed "s/\[FEATURE_TITLE\]/$feature_title/"
                ;;
            *"[CURRENT_BRANCH]"*)
                echo "$line" | sed "s/\[CURRENT_BRANCH\]/$current_branch/"
                ;;
            *"[TODAY]"*)
                echo "$line" | sed "s/\[TODAY\]/$(date +%Y-%m-%d)/"
                ;;
            *"[FEATURE_DESCRIPTION]"*)
                echo "$line" | sed "s/\[FEATURE_DESCRIPTION\]/$feature_description/"
                ;;
            "## Technical Context"*)
                echo "$line"
                echo ""
                if [[ -n "$technical_context" ]]; then
                    echo "$technical_context"
                else
                    echo "*NEEDS CLARIFICATION: Define technical stack, dependencies, and constraints*"
                    echo ""
                fi
                # Skip template content for this section
                while IFS= read -r next_line && [[ ! "$next_line" =~ ^## ]]; do
                    continue
                done
                echo "$next_line"
                ;;
            "## Constitution Check"*)
                echo "$line"
                echo ""
                if [[ -n "$constitution_check" ]]; then
                    echo "$constitution_check"
                else
                    echo "*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*"
                    echo ""
                    echo "*NEEDS ANALYSIS: Review constitutional compliance*"
                    echo ""
                fi
                # Skip template content for this section
                while IFS= read -r next_line && [[ ! "$next_line" =~ ^## ]]; do
                    continue
                done
                echo "$next_line"
                ;;
            "## Project Structure"*)
                echo "$line"
                echo ""
                if [[ -n "$project_structure" ]]; then
                    echo "$project_structure"
                else
                    echo "*NEEDS CLARIFICATION: Define project structure and file organization*"
                    echo ""
                fi
                # Skip template content for this section
                while IFS= read -r next_line && [[ ! "$next_line" =~ ^## ]]; do
                    continue
                done
                echo "$next_line"
                ;;
            "## Complexity Tracking"*)
                echo "$line"
                echo ""
                if [[ -n "$complexity_tracking" ]]; then
                    echo "$complexity_tracking"
                else
                    echo "*Fill ONLY if Constitution Check has violations that must be justified*"
                    echo ""
                fi
                # Skip template content for this section
                while IFS= read -r next_line && [[ ! "$next_line" =~ ^## ]]; do
                    continue
                done
                echo "$next_line"
                ;;
            "## Progress Tracking"*)
                echo "$line"
                echo ""
                if [[ -n "$progress_tracking" ]]; then
                    echo "$progress_tracking"
                else
                    echo "*This checklist is updated during execution flow*"
                    echo ""
                    echo "**Phase Status**:"
                    echo ""
                    echo "- [ ] Phase 0: Research complete (/plan command)"
                    echo "- [ ] Phase 1: Design complete (/plan command)"
                    echo "- [ ] Phase 2: Task planning complete (/plan command - describe approach only)"
                    echo "- [ ] Phase 3: Tasks generated (/tasks command)"
                    echo "- [ ] Phase 4: Implementation complete"
                    echo "- [ ] Phase 5: Validation passed"
                    echo ""
                    echo "**Gate Status**:"
                    echo ""
                    echo "- [ ] Initial Constitution Check: NEEDS REVIEW"
                    echo "- [ ] Post-Design Constitution Check: PENDING"
                    echo "- [ ] All NEEDS CLARIFICATION resolved"
                    echo "- [ ] Complexity deviations documented (if applicable)"
                    echo ""
                fi
                ;;
            *)
                echo "$line"
                ;;
        esac
    done < "$plan_template" > "$temp_plan"
    
    # Create backup if plan exists
    if [[ "$plan_exists" == true ]]; then
        cp "$IMPL_PLAN" "${IMPL_PLAN}.backup.$(date +%s)"
    fi
    
    # Replace with updated version
    mv "$temp_plan" "$IMPL_PLAN"
    
    echo "✅ Implementation plan updated successfully"
    echo ""
    echo "📋 Summary of changes:"
    if [[ "$plan_exists" == true ]]; then
        echo "  • Preserved existing technical context and constitution check"
        echo "  • Preserved project structure and progress tracking"
        echo "  • Updated metadata and feature references"
        echo "  • Created backup: ${IMPL_PLAN}.backup.*"
    else
        echo "  • Created new implementation plan from template"
        echo "  • Included placeholders for required sections"
        echo "  • Ready for technical context definition"
    fi
    echo ""
    
    # Check for sections that need attention
    echo "🔍 Sections requiring attention:"
    if grep -q "NEEDS CLARIFICATION" "$IMPL_PLAN"; then
        echo "  ⚠️  NEEDS CLARIFICATION markers found - update required"
    fi
    if grep -q "NEEDS ANALYSIS" "$IMPL_PLAN"; then
        echo "  ⚠️  NEEDS ANALYSIS markers found - constitution review required"
    fi
    
    echo ""
    echo "🔧 Next steps:"
    echo "  1. Review plan.md and resolve any NEEDS CLARIFICATION markers"
    echo "  2. Complete constitution check if needed"
    echo "  3. Update technical context with current stack/constraints"
    echo "  4. Consider running /plan command to regenerate research and design docs"
    echo ""
    
    # Output JSON for potential automation
    echo "{"
    echo "  \"status\": \"success\","
    echo "  \"spec_name\": \"$SPEC_NAME\","
    echo "  \"spec_dir\": \"$SPEC_DIR\","
    echo "  \"updated_file\": \"$IMPL_PLAN\","
    echo "  \"backup_created\": $plan_exists,"
    echo "  \"needs_clarification\": $(grep -q "NEEDS CLARIFICATION" "$IMPL_PLAN" && echo "true" || echo "false")"
    echo "}"
}

# Execute main function with all arguments
main "$@"