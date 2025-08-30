# MemoryChangeBundle Integration

This directory contains the standardized **MemoryChangeBundle** format for memory collaboration with external LLMs (especially GPT).

## Workflow

1. **Export memory snapshot** using our export system
2. **Send to LLM** for analysis/changes  
3. **Receive MemoryChangeBundle-v1.zip** with patches
4. **Apply changes** using included scripts

## Bundle Format (from GPT)

```text
MemoryChangeBundle-v1.zip
├── manifest.json              # Base hash, timestamp, scope
├── patches/memory_patch.json  # RFC-6902 JSON Patch operations
├── apply_plan.json           # SQLite update mapping (table/id/version)
├── changed/snapshot.after.json # Post-patch snapshot
├── diffs/patch.diff          # Code changes (if any)
├── apply/
│   ├── apply_json_patch.py   # Apply to JSON files
│   ├── apply_sqlite_patch.py # Apply to SQLite database
│   └── requirements.txt     # Dependencies (jsonpatch)
└── risk_report.md           # Change analysis and confidence
```

## Usage

### For JSON System (Current)

```bash
python apply/apply_json_patch.py \
  --snapshot ./agents/memory/snapshot.json \
  --patch ./patches/memory_patch.json \
  --inplace
```

### For SQLite System (Future)

```bash
python apply/apply_sqlite_patch.py \
  --db ./agents/memory.sqlite \
  --patch ./patches/memory_patch.json \
  --plan ./apply_plan.json
```

## Integration Points

- **Universal Export System**: Updated to generate memory snapshots in compatible format
- **Memory Vault**: Enhanced to accept MemoryChangeBundle patches
- **Database Migration**: SQLite system designed to work with apply_plan.json format

## GPT Skeleton Bundle

GPT has provided a complete skeleton bundle with:

- ✅ Ready-made apply scripts
- ✅ Template files for testing
- ✅ Documentation and examples
- ✅ RFC-6902 JSON Patch support
- ✅ SQLite integration ready

This gives us a **production-ready collaboration workflow** with external LLMs while maintaining full compatibility with our existing and future memory systems.
