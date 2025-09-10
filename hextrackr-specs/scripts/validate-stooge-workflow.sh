#!/bin/bash

# Stooge Workflow Validation Script
# Ensures stooges follow the context-first approach

set -euo pipefail

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🎭 Stooge Workflow Validator"
echo "============================="

# Check if we're in the right directory
if [[ ! -f "$PROJECT_ROOT/CLAUDE.md" ]]; then
    echo "❌ ERROR: Must run from HexTrackr root directory"
    exit 1
fi

echo "✅ Project root confirmed: $PROJECT_ROOT"

# Validate stooge agent configurations
echo ""
echo "📋 Validating Stooge Configurations:"

for stooge in larry moe curly; do
    agent_file="$PROJECT_ROOT/.claude/agents/$stooge.md"
    
    if [[ ! -f "$agent_file" ]]; then
        echo "❌ ERROR: Missing agent file: $agent_file"
        exit 1
    fi
    
    # Check for mandatory workflow sections
    if grep -q "MANDATORY WORKFLOW ORDER" "$agent_file" && \
       grep -q "PHASE 1" "$agent_file" && \
       grep -q "mcp__Ref__ref_search_documentation" "$agent_file"; then
        echo "✅ $stooge: Workflow order configured correctly"
    else
        echo "❌ ERROR: $stooge missing mandatory workflow sections"
        exit 1
    fi
done

# Validate project structure for context gathering
echo ""
echo "🔍 Validating Context Sources:"

required_files=(
    "CLAUDE.md"
    "hextrackr-specs/memory/constitution.md"
    ".active-spec"
)

for file in "${required_files[@]}"; do
    if [[ -f "$PROJECT_ROOT/$file" ]]; then
        echo "✅ $file exists"
    else
        echo "❌ WARNING: $file missing (required for context gathering)"
    fi
done

# Check active spec has tasks
if [[ -f "$PROJECT_ROOT/.active-spec" ]]; then
    active_spec=$(cat "$PROJECT_ROOT/.active-spec")
    tasks_file="$PROJECT_ROOT/hextrackr-specs/specs/$active_spec/tasks.md"
    
    if [[ -f "$tasks_file" ]]; then
        echo "✅ Active spec ($active_spec) has tasks.md"
    else
        echo "⚠️  WARNING: Active spec ($active_spec) missing tasks.md"
    fi
fi

echo ""
echo "🎯 Workflow Enforcement Rules:"
echo "1. ALWAYS start with Phase 1 (Context Gathering)"
echo "2. Read project files BEFORE implementation" 
echo "3. Create Playwright tests BEFORE changes"
echo "4. Use zen tools only when specifically requested"
echo "5. Validate all changes with tests"
echo ""
echo "✅ Stooge workflow validation complete!"
echo ""
echo "📝 Usage Example:"
echo "   stooges larry 'Fix CVE link issue in vulnerabilities table'"
echo "   (Larry will now follow context-first workflow automatically)"