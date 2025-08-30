#!/usr/bin/env python3
"""
MemoryChangeBundle JSON Patch Applicator
Applies RFC-6902 JSON patches to memory snapshot files.
"""

import argparse
import json
import sys
import os
import hashlib
from pathlib import Path

try:
    import jsonpatch
except ImportError:
    print("ERROR: jsonpatch library required. Install with: pip install jsonpatch")
    sys.exit(1)

def calculate_hash(data):
    """Calculate SHA-256 hash of JSON data"""
    json_str = json.dumps(data, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(json_str.encode()).hexdigest()

def backup_file(filepath):
    """Create backup of original file"""
    backup_path = f"{filepath}.backup.{int(__import__('time').time())}"
    with open(filepath, 'r') as src, open(backup_path, 'w') as dst:
        dst.write(src.read())
    return backup_path

def validate_snapshot(snapshot, schema_path=None):
    """Basic validation of memory snapshot structure"""
    required_fields = ['github_copilot_memories', 'dependencies', 'interactions']
    for field in required_fields:
        if field not in snapshot:
            raise ValueError(f"Missing required field: {field}")
    return True

def main():
    parser = argparse.ArgumentParser(description="Apply JSON patches to memory snapshots")
    parser.add_argument("--snapshot", required=True, help="Path to memory snapshot JSON file")
    parser.add_argument("--patch", required=True, help="Path to JSON patch file")
    parser.add_argument("--inplace", action="store_true", help="Modify file in place")
    parser.add_argument("--output", help="Output file path (default: stdout)")
    parser.add_argument("--backup", action="store_true", help="Create backup before modifying")
    parser.add_argument("--validate", action="store_true", help="Validate result after patching")
    parser.add_argument("--dry-run", action="store_true", help="Show changes without applying")
    
    args = parser.parse_args()
    
    try:
        # Load snapshot
        with open(args.snapshot, 'r') as f:
            snapshot = json.load(f)
        
        # Load patch
        with open(args.patch, 'r') as f:
            patch_ops = json.load(f)
        
        # Calculate original hash
        original_hash = calculate_hash(snapshot)
        print(f"Original snapshot hash: sha256:{original_hash}")
        
        # Create patch object
        patch = jsonpatch.JsonPatch(patch_ops)
        
        if args.dry_run:
            print("DRY RUN - Patch operations:")
            for i, op in enumerate(patch_ops):
                print(f"  {i+1}. {op['op'].upper()} {op['path']}")
                if 'value' in op:
                    print(f"     Value: {json.dumps(op['value'], indent=6)}")
            return 0
        
        # Apply patch
        result = patch.apply(snapshot)
        
        # Validate result
        if args.validate:
            validate_snapshot(result)
            print("✅ Snapshot validation passed")
        
        # Calculate new hash
        new_hash = calculate_hash(result)
        print(f"New snapshot hash: sha256:{new_hash}")
        
        # Output result
        result_json = json.dumps(result, indent=2)
        
        if args.inplace:
            if args.backup:
                backup_path = backup_file(args.snapshot)
                print(f"Backup created: {backup_path}")
            
            with open(args.snapshot, 'w') as f:
                f.write(result_json)
            print(f"✅ Patch applied to {args.snapshot}")
            
        elif args.output:
            with open(args.output, 'w') as f:
                f.write(result_json)
            print(f"✅ Patched snapshot written to {args.output}")
            
        else:
            print(result_json)
        
        return 0
        
    except FileNotFoundError as e:
        print(f"ERROR: File not found: {e}")
        return 1
    except jsonpatch.JsonPatchException as e:
        print(f"ERROR: Patch application failed: {e}")
        return 1
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON: {e}")
        return 1
    except Exception as e:
        print(f"ERROR: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
