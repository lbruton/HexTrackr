# StackTrackr Universal Export System

## Overview

The Universal Export System provides **vendor-neutral** collaboration with any LLM through multiple export formats. This ensures you can work with ChatGPT, Claude, Gemini, GitHub Copilot, or any other LLM using the same consistent workflow.

## Quick Start

```bash

# One-command exports for any LLM

cd agents/scripts

./export.sh chatgpt    # ChatGPT-optimized ZIP bundle
./export.sh claude     # Claude-optimized markdown
./export.sh gemini     # Gemini-optimized ZIP bundle  
./export.sh copilot    # GitHub Copilot memory bundle
./export.sh memory     # Memory-only for any LLM
```

## Export Types

| Type | Format | Best For | Size | Memory Included |
|------|--------|----------|------|-----------------|
| **ZIP** | Compressed archive | ChatGPT, Gemini, file-capable LLMs | ~500KB | ✅ |
| **Markdown** | Single .md file | Claude, text-only LLMs | ~1.4MB | ✅ |
| **Memory** | JSON bundle | Memory-focused collaboration | ~50KB | ✅ |
| **Code** | ZIP without memory | Public repo + separate memory | ~400KB | ❌ |
| **Delta** | Incremental changes | Follow-up collaborations | ~10KB | ✅ |

## LLM Compatibility Matrix

| LLM | Recommended Format | Repository Access | Memory Handling | Patch Format |
|-----|-------------------|-------------------|-----------------|--------------|
| **ChatGPT/GPT-4** | ZIP bundle | Public: GitHub URL<br>Private: ZIP | Full bundle | Unified diff |
| **Claude** | Markdown | Public: GitHub URL<br>Private: Markdown | Inline in markdown | File patches |
| **Gemini** | ZIP bundle | Public: GitHub URL<br>Private: ZIP | Full bundle | Unified diff |
| **GitHub Copilot** | Memory bundle | Direct workspace access | Atomic operations | JSON Patch |
| **Other LLMs** | Universal ZIP | Depends on capabilities | Full bundle | Unified diff |

## Repository Modes

### Public Repository (Current)

```bash

# LLMs can browse GitHub directly

./export.sh chatgpt    # Creates bundle + includes GitHub URL
./export.sh claude     # Creates markdown + GitHub reference
```

## Advantages:

- LLMs can browse repo directly for context
- Smaller exports (just memory/changes)
- Real-time access to latest code

### Private Repository (Future)

```bash

# Everything bundled for privacy

./export.sh private-chatgpt    # Complete private bundle
./export.sh private-claude     # Private markdown export
```

## Advantages: (2)

- Full privacy control
- No external dependencies
- Controlled information sharing

## Advanced Usage

### Custom Exports

```bash

# Full control with universal_export.sh

./universal_export.sh zip --llm claude --private --exclude-memory
./universal_export.sh memory --llm universal --public --format tar
./universal_export.sh delta --llm chatgpt --include-memory
```

### Batch Exports

```bash

# Export for multiple LLMs at once

for llm in chatgpt claude gemini; do
    ./export.sh "$llm"
done
```

## Working with Exports

### 1. Send to LLM

Each export includes:

- **README.md** - Instructions for the specific LLM
- **manifest.json** - Metadata and compatibility info
- **apply_changes.sh** - Script to safely apply returned changes

### 2. LLM Returns Changes

Expected format from LLM:

```

## Code Changes

[Unified diff or file patches]

## Memory Changes

[JSON Patch format with metadata]

## Summary

[Description and rationale]
```

### 3. Apply Changes Safely

```bash

# Extract returned files to project root

./apply_changes.sh code patch.diff
./apply_changes.sh memory memory_patch.json
./apply_changes.sh validate
```

## Memory Vault Integration

The export system integrates with the Memory Vault for atomic operations:

```bash

# Memory exports use vault system

./export.sh memory

# Returned changes use JSON Patch format

{
  "op": "add",
  "path": "/decisions/use_universal_export",
  "value": {
    "title": "Adopt Universal Export System",
    "status": "approved",
    "rationale": "Vendor-neutral collaboration"
  }
}
```

## File Structure

```
agents/scripts/
├── export.sh              # Quick export commands
├── universal_export.sh     # Full-featured export system
├── package_for_gpt.sh      # Legacy ChatGPT export
├── goomba.sh              # Legacy markdown export
└── process_gpt_import.sh   # Legacy import processor

portable_exchange/
├── stacktrackr-zip-*.zip        # ZIP exports
├── stacktrackr-markdown-*.md    # Markdown exports
├── stacktrackr-memory-*.zip     # Memory bundles
└── .last_export                 # Delta tracking
```

## Security Features

### Automatic Sanitization

- Removes `.git`, `node_modules`, build artifacts
- Excludes log files and temporary data
- Respects `.gitignore` patterns

### Access Control (Memory Exports)

```json
{
  "allow_paths": ["/decisions/*", "/tasks/*"],
  "deny_paths": ["/secrets/*", "/auth/*"],
  "review_required_on": ["remove", "replace_high_impact"]
}
```

### Validation

- JSON schema validation for memory data
- Patch size limits and risk assessment
- Automatic backup before applying changes

## Migration Path

### Current (Public Repo)

1. Use GitHub URL for code context
2. Export memory bundles for sensitive collaboration
3. Apply patches with validation

### Future (Private Repo)

1. Complete bundles with all code
2. Enhanced sanitization and access control
3. Audit trails and provenance tracking

## Troubleshooting

### Common Issues

## Export fails with "git not found"

```bash

# Works without git, uses fallback

./export.sh chatgpt  # Will create "nogit" bundle
```

## Memory vault not initialized

```bash

# Auto-initializes on first export

./export.sh memory  # Creates vault structure
```

## Large export size

```bash

# Use code-only export for public repos

./export.sh code  # Excludes memory, ~400KB
```

### Validation (2)

```bash

# Test export system

./export.sh help
./universal_export.sh zip --help

# Validate generated exports

unzip -t portable_exchange/stacktrackr-*.zip
```

## Best Practices

1. **Choose the right format for your LLM**
   - File upload capable: ZIP format
   - Text-only: Markdown format
   - Memory-focused: Memory bundle

1. **Use public repo mode when possible**
   - Smaller exports
   - LLM can browse for additional context
   - Real-time access to latest changes

1. **Review changes before applying**
   - Always use `apply_changes.sh validate`
   - Check patch size and risk assessment
   - Review memory changes for accuracy

1. **Keep exports fresh**
   - Use delta exports for follow-ups
   - Track changes with `.last_export`
   - Regular memory vault maintenance

---

**Next:** Test the system with `./export.sh chatgpt` and collaborate with your preferred LLM!
