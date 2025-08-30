#!/usr/bin/env python3
"""
Memory Vault Schema Validator
Validates memory snapshots and event logs against JSON schemas.
"""

import json
import sys
from pathlib import Path
import jsonschema
from jsonschema import validate, ValidationError, Draft7Validator

ROOT = Path(__file__).parent.parent
SCHEMAS_DIR = ROOT / "schemas"

def load_schema(schema_name: str):
    """Load a JSON schema by name."""
    schema_path = SCHEMAS_DIR / f"{schema_name}.json"
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema not found: {schema_path}")
    
    with open(schema_path, 'r') as f:
        return json.load(f)

def validate_file(file_path: str, schema_name: str, strict: bool = False):
    """Validate a JSON file against a schema."""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        schema = load_schema(schema_name)
        validator = Draft7Validator(schema)
        
        errors = list(validator.iter_errors(data))
        warnings = []
        
        # Collect validation results
        if errors:
            print(f"❌ Validation failed for {file_path}")
            for error in errors:
                print(f"  Error: {error.message}")
                print(f"    Path: {' -> '.join(str(p) for p in error.absolute_path)}")
            return False
        
        # Check for warnings (missing optional fields, etc.)
        # This is a simplified version - could be more sophisticated
        if schema_name == "memory-snapshot":
            metadata = data.get("metadata", {})
            if not metadata.get("last_agent"):
                warnings.append("Missing last_agent in metadata")
            if not metadata.get("last_event"):
                warnings.append("Missing last_event in metadata")
        
        if warnings:
            print(f"⚠️  Validation warnings for {file_path}")
            for warning in warnings:
                print(f"  Warning: {warning}")
            
            if strict:
                return False
        
        print(f"✅ Validation passed for {file_path}")
        return True
        
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error in {file_path}: {e}")
        return False
    except Exception as e:
        print(f"❌ Validation error: {e}")
        return False

def main():
    """Main entry point."""
    if len(sys.argv) < 3:
        print("Usage: validate_schema.py <file_path> <schema_name> [strict]")
        print("Schema names: memory-snapshot, event-log, lease")
        return 1
    
    file_path = sys.argv[1]
    schema_name = sys.argv[2]
    strict = len(sys.argv) > 3 and sys.argv[3].lower() in ('true', '1', 'strict')
    
    try:
        if validate_file(file_path, schema_name, strict):
            return 0
        else:
            return 1
    except Exception as e:
        print(f"❌ Validation failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
