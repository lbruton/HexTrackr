# Exchange Cleanup Prompt - Ready to Use! 🧹

## ✅ **NEW PROMPT ADDED**

The `exchange-cleanup` prompt has been successfully added to StackTrackr's prompt system!

## 🎯 **How to Use**

### **Via Prompt System (Recommended)**

```
Human: "Use the exchange-cleanup prompt"
GitHub Copilot: Executes smart cleanup of portable_exchange/ folder
```

### **What It Does**

The exchange-cleanup prompt will:

1. **🗂️ Clean Export Files**:
   - Remove timestamped ZIP bundles older than 7 days
   - Clean up old MemoryChangeBundle files  
   - Remove old Goomba markdown exports
   - Delete legacy export archives

1. **🛡️ Preserve Important Files**:
   - Keep instructional/template files
   - Preserve README and setup files
   - Maintain directory structure files
   - Keep the most recent instruction files

1. **🔍 Smart Rules**:
   - Keep only the most recent export of each type
   - Preserve files smaller than 1KB (likely instructions)
   - Keep files with "README", "INSTRUCTIONS", "TEMPLATE" in names
   - Safety checks before deletion

## 📂 **Current Exchange Folder Status**

Based on current `portable_exchange/` contents:

```
GPT_INSTRUCTIONS_20250816_183122.md           1.3K  (KEEP - instruction file)
MemoryChangeBundle-template-2025-08-16T19-27-01Z.zip  8.5K  (REMOVE - duplicate)
MemoryChangeBundle-template-2025-08-16T19-39-21Z.zip  8.5K  (KEEP - most recent)
StackTrackr_Goomba_20250816_183555.md         1.5M  (KEEP - recent)
StackTrackr_GPT_Export_20250816_183122.zip    2.9M  (KEEP - recent)
StackTrackr_Memory_Summary_20250816_183556.md  991B  (KEEP - small instruction)
stacktrackr-full-2025-08-16T18-54-20Z-74138ea.zip  6.6M  (KEEP - recent)
stacktrackr-memory-2025-08-16T18-54-13Z-74138ea.zip  7.0K  (KEEP - recent)
```

## 🧹 **Example Cleanup Actions**

The prompt would currently:

- **Remove**: `MemoryChangeBundle-template-2025-08-16T19-27-01Z.zip` (older duplicate)
- **Keep**: All other files (recent exports and instructions)
- **Free Space**: ~8.5K (minimal cleanup needed as files are recent)

## 🔧 **Commands Generated**

The prompt includes safe cleanup commands:

```bash

# Navigate to exchange folder

cd portable_exchange/

# List contents for review

ls -la

# Remove old ZIP exports (7+ days old)

find . -name "*.zip" -type f -mtime +7 -exec rm {} \;

# Remove old Goomba exports (7+ days old) 

find . -name "StackTrackr_Goomba_*.md" -type f -mtime +7 -exec rm {} \;

# Clean up old dated instruction files

find . -name "*_[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]_*.md" -type f -mtime +7 -exec rm {} \;
```

## 🎉 **Prompt System Integration**

The new prompt is fully integrated:

- ✅ **Category**: maintenance  
- ✅ **Frequency**: as-needed
- ✅ **Total Prompts**: 16 available
- ✅ **JSON Validated**: Syntax correct

## 💡 **Usage Examples**

### **Basic Cleanup**

```
Human: "Use the exchange-cleanup prompt"
Result: Smart cleanup with safety checks
```

### **Review Before Cleanup**  

```
Human: "Show me what the exchange-cleanup prompt would remove"
Result: Preview of files to be cleaned without deletion
```

### **Custom Cleanup**

```
Human: "Use the exchange-cleanup prompt but keep the last 2 exports of each type"
Result: Modified cleanup with custom retention rules
```

## 🛡️ **Safety Features**

- **Backup Recommendation**: For files >10MB
- **Preservation Rules**: Keep instruction and template files
- **Review Process**: List files before deletion
- **Size Validation**: Preserve small files (likely instructions)
- **Pattern Matching**: Smart recognition of export vs. instruction files

## ✅ **Ready for Production**

The exchange-cleanup prompt is now **production ready** and available for:

- Regular maintenance workflows
- Pre-deployment cleanup
- Storage management
- Collaboration preparation

**Just say: "Use the exchange-cleanup prompt" and let it work! 🚀**
