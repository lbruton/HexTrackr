# 🚀 StackTrackr → ChatGPT/GPT5 Workflow Instructions

## 📦 **What to Include in Zip**

✅ All source code files (js/, css/, etc.)
✅ Complete rAgents/ directory (all JSON memory files)
✅ Documentation files (README.md, docs/, etc.)
✅ Configuration files (package.json, index.html)
✅ rAgents/zip_prep/ directory (portable scripts)

## 🚫 **What to Exclude from Zip**

❌ node_modules/ (if it exists)
❌ .git/ directory (optional - can include for context)
❌ rAgents/backups/ with old data
❌ Large log files
❌ OS temporary files (.DS_Store, etc.)

## 🎯 **For ChatGPT/GPT5**

This project includes a complete memory system in the rAgents/ directory.
All previous decisions, patterns, and context are stored in JSON files.
Use the portable scripts in rAgents/zip_prep/ for any operations.

## 🔄 **After Getting Modified Zip Back**

1. Unzip to desired location
2. Run: `./rAgents/zip_prep/restore_from_zip.sh`
3. Validate changes with: `./rAgents/zip_prep/sync_tool_portable.sh validate`

## 💡 **Memory System Files**

- `rAgents/memory.json` - Core agent memories
- `rAgents/decisions.json` - Previous decisions and rationale
- `rAgents/tasks.json` - Task tracking and dependencies
- `rAgents/bugs.json` - Bug tracking with priorities
- `rAgents/roadmap.json` - Feature planning and milestones
- `rAgents/prompts.json` - Reusable prompt library

The portable memory system ensures seamless collaboration! 🎉
