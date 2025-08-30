# MemoryChangeBundle x Prompt System Integration

## 🎯 **YES! Fully Integrated with Prompt System**

The MemoryChangeBundle format is now **completely integrated** with StackTrackr's prompt system, enabling seamless import/export via prompts for any LLM collaboration.

## 🎪 **How It Works**

### **1. Via Prompts (Recommended)**

```
Human: "Use the memory-changeb prompt"
LLM: Creates MemoryChangeBundle using ./agents/scripts/universal_export.sh change-bundle
```

### **2. Via Quick Commands**

```bash

# Any of these work:

./agents/scripts/export.sh changeb
./agents/scripts/export.sh change-bundle  
./agents/scripts/export.sh mcb
```

### **3. Via Universal Export**

```bash
./agents/scripts/universal_export.sh change-bundle
```

## 📋 **Available Prompt Aliases**

### **New MemoryChangeBundle Prompts**

- 🆕 **`memory-changeb`** - Export MemoryChangeBundle for standardized LLM memory collaboration
- 🆕 **`export-universal`** - Universal export system for any LLM collaboration workflow

### **Existing Export Prompts**

- **`package-gpt`** - Quick GPT export packaging  
- **`goomba`** - Flatten entire project to markdown
- **`zip-workflow`** - Prepare project for ChatGPT/GPT5 zip collaboration

## 🚀 **Workflow Examples**

### **Memory Collaboration**

```
Human: "Use the memory-changeb prompt to create a bundle for GPT"
GitHub Copilot: 

1. Runs: ./agents/scripts/universal_export.sh change-bundle
2. Creates: MemoryChangeBundle-template-[timestamp].zip
3. Provides: RFC-6902 patch workflow instructions

```

### **Universal Export**

```
Human: "Use the export-universal prompt for Claude collaboration"  
GitHub Copilot:

1. Shows all export types available
2. Recommends: ./agents/scripts/universal_export.sh markdown --llm claude
3. Creates: Optimized export for Claude

```

### **Quick Export**

```
Human: "Quick export for ChatGPT"
GitHub Copilot: ./agents/scripts/export.sh chatgpt
```

## 🧠 **Memory System Integration**

### **Current Memory Formats Supported**

- ✅ **JSON Files** - Current agents/*.json system with apply_json_patch.py
- ✅ **MemoryChangeBundle** - RFC-6902 standardized patches
- ✅ **SQLite Ready** - Future database migration with apply_sqlite_patch.py

### **Prompt-Triggered Workflows**

- ✅ **Export Generation** - Any LLM can trigger exports via prompts
- ✅ **Format Selection** - Prompts guide LLM to optimal export type
- ✅ **Collaboration Setup** - Built-in instructions for receiving LLM
- ✅ **Apply Scripts** - Production-ready patch application

## 🎉 **Production Ready Features**

### **For Human Users**

```bash

# Quick MemoryChangeBundle export

export.sh changeb

# Review available prompts

python3 -c "
import json
with open('agents/prompts.json') as f:
    prompts = json.load(f)
for alias in prompts['prompt_aliases']:
    print(f'• {alias}')
"
```

### **For LLM Collaboration**

```

# In conversation with any LLM:

"Use the memory-changeb prompt to create a standardized memory collaboration bundle"

# Result: Complete MemoryChangeBundle with:

✅ Current memory snapshot
✅ RFC-6902 patch templates  
✅ Apply scripts for JSON/SQLite
✅ Workflow documentation
✅ Risk assessment framework
```

### **For Import/Apply (Future)**

```bash

# When receiving MemoryChangeBundle back from LLM:

python3 apply/apply_json_patch.py --snapshot memory.json --patch changes.json --inplace --backup
```

## 🌍 **Universal LLM Support**

The prompt system now supports **any LLM** with standardized workflows:

| LLM | Export Command | Prompt Trigger |
|-----|----------------|----------------|
| **ChatGPT** | `export.sh chatgpt` | "Use the package-gpt prompt" |
| **Claude** | `export.sh claude` | "Use the export-universal prompt for Claude" |
| **Gemini** | `export.sh gemini` | "Use the export-universal prompt for Gemini" |
| **Local Models** | `export.sh markdown` | "Use the goomba prompt" |
| **MemoryChangeBundle** | `export.sh changeb` | "Use the memory-changeb prompt" |
| **Any LLM** | `universal_export.sh [type]` | "Use the export-universal prompt" |

## ✅ **Integration Complete**

The MemoryChangeBundle format is now **fully integrated** with:

- 🎯 **Prompt System** - 15 available prompts including memory collaboration
- 🚀 **Export Scripts** - Quick commands for any export type
- 🧠 **Memory Vault** - Atomic operations with checkout/checkin protocol
- 📦 **Universal Exports** - Vendor-neutral support for all LLMs
- 🔄 **RFC-6902 Patches** - Industry standard memory change format
- 🗄️ **Database Ready** - SQLite migration compatibility built-in

**Status**: Production ready for import/export via prompts with any LLM! 🎉
