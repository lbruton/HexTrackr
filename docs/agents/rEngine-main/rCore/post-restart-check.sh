#!/bin/bash

# Post-Restart System Status Check
# Quick verification that all systems are operational

echo "🔍 StackTrackr System Status Check"
echo "=================================="

# Check if we're in the right directory
if [[ ! -f "COPILOT_INSTRUCTIONS.md" ]]; then
    echo "❌ Not in StackTrackr root directory"
    echo "Run: cd /Volumes/DATA/GitHub/rEngine"
    exit 1
fi

echo "✅ Location: StackTrackr root"

# Check for key instruction files
echo ""
echo "📋 Instruction Files:"
if [[ -f "COPILOT_INSTRUCTIONS.md" ]]; then
    echo "✅ COPILOT_INSTRUCTIONS.md"
else
    echo "❌ Missing COPILOT_INSTRUCTIONS.md"
fi

if [[ -f "AGENT.md" ]]; then
    echo "✅ AGENT.md"
else
    echo "❌ Missing AGENT.md"
fi

if [[ -f "emergencycontext.md" ]]; then
    echo "✅ emergencycontext.md"
else
    echo "❌ Missing emergencycontext.md"
fi

# Check for conflicting files
echo ""
echo "🧹 Conflict Check:"
conflicting_files=$(ls COPILOT_INSTRUCTIONS_*.md 2>/dev/null || true)
if [[ -z "$conflicting_files" ]]; then
    echo "✅ No conflicting COPILOT instruction files"
else
    echo "⚠️  Found conflicting files: $conflicting_files"
fi

# Check rEngine directory
echo ""
echo "🔧 rEngine Components:"
cd rEngine 2>/dev/null || { echo "❌ rEngine directory not found"; exit 1; }

key_files=("split-scribe-console.js" "auto-launch-split-scribe.sh" "agent-menu.js" "agent-init.sh")
for file in "${key_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file"
    else
        echo "❌ Missing $file"
    fi
done

# Check if scribe console is running
echo ""
echo "📊 Process Status:"
scribe_pid=$(ps aux | grep "split-scribe-console.js" | grep -v grep | awk '{print $2}' | head -1)
if [[ -n "$scribe_pid" ]]; then
    echo "✅ Split scribe console running (PID: $scribe_pid)"
else
    echo "⚠️  Split scribe console not running"
fi

# Git status
echo ""
echo "📝 Git Status:"
cd /Volumes/DATA/GitHub/rEngine
git_status=$(git status --porcelain 2>/dev/null)
if [[ -z "$git_status" ]]; then
    echo "✅ Working directory clean"
else
    echo "⚠️  Uncommitted changes:"
    echo "$git_status"
fi

last_commit=$(git log -1 --oneline 2>/dev/null)
echo "📌 Last commit: $last_commit"

echo ""
echo "🎯 READY FOR INITIALIZATION"
echo "Run: cd rEngine && ./agent-init.sh"
