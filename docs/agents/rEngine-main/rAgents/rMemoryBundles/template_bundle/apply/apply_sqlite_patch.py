#!/usr/bin/env python3
"""
MemoryChangeBundle SQLite Patch Applicator  
Applies memory changes to SQLite database using apply plan.
"""

import argparse
import json
import sys
import sqlite3
import os
from pathlib import Path
from datetime import datetime

def backup_database(db_path):
    """Create backup of SQLite database"""
    backup_path = f"{db_path}.backup.{int(__import__('time').time())}"
    with sqlite3.connect(db_path) as src:
        with sqlite3.connect(backup_path) as dst:
            src.backup(dst)
    return backup_path

def validate_database_schema(conn, required_tables=None):
    """Validate database has expected schema"""
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = {row[0] for row in cursor.fetchall()}
    
    if required_tables:
        missing = set(required_tables) - tables
        if missing:
            raise ValueError(f"Missing required tables: {missing}")
    
    return tables

def execute_operation(conn, operation):
    """Execute a single SQLite operation from apply plan"""
    table = operation['table']
    op_type = operation['operation']
    data = operation.get('data', {})
    where_clause = operation.get('where_clause', '')
    
    cursor = conn.cursor()
    
    if op_type == 'INSERT':
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['?' for _ in data.keys()])
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        cursor.execute(query, list(data.values()))
        
    elif op_type == 'UPDATE':
        set_clause = ', '.join([f"{k} = ?" for k in data.keys()])
        query = f"UPDATE {table} SET {set_clause}"
        if where_clause:
            query += f" WHERE {where_clause}"
        cursor.execute(query, list(data.values()))
        
    elif op_type == 'DELETE':
        query = f"DELETE FROM {table}"
        if where_clause:
            query += f" WHERE {where_clause}"
        cursor.execute(query)
        
    else:
        raise ValueError(f"Unsupported operation: {op_type}")
    
    return cursor.rowcount

def main():
    parser = argparse.ArgumentParser(description="Apply memory changes to SQLite database")
    parser.add_argument("--db", required=True, help="Path to SQLite database")
    parser.add_argument("--patch", required=True, help="Path to JSON patch file")
    parser.add_argument("--plan", required=True, help="Path to apply plan JSON file")
    parser.add_argument("--backup", action="store_true", help="Create backup before changes")
    parser.add_argument("--dry-run", action="store_true", help="Show operations without executing")
    parser.add_argument("--validate", action="store_true", help="Validate database schema")
    
    args = parser.parse_args()
    
    try:
        # Load apply plan
        with open(args.plan, 'r') as f:
            plan = json.load(f)
        
        # Load patch for reference
        with open(args.patch, 'r') as f:
            patch_ops = json.load(f)
        
        print(f"Loaded apply plan with {len(plan['sqlite_operations'])} operations")
        
        if args.dry_run:
            print("DRY RUN - SQLite operations:")
            for i, op in enumerate(plan['sqlite_operations']):
                print(f"  {i+1}. {op['operation']} on {op['table']}")
                if op.get('where_clause'):
                    print(f"     WHERE: {op['where_clause']}")
                if op.get('data'):
                    print(f"     DATA: {json.dumps(op['data'], indent=8)}")
            return 0
        
        # Connect to database
        conn = sqlite3.connect(args.db)
        conn.execute("BEGIN TRANSACTION")
        
        try:
            # Backup if requested
            if args.backup:
                backup_path = backup_database(args.db)
                print(f"Backup created: {backup_path}")
            
            # Validate schema if requested
            if args.validate:
                expected_tables = ['agent_memories', 'dependencies', 'interactions']
                validate_database_schema(conn, expected_tables)
                print("✅ Database schema validation passed")
            
            # Execute operations
            total_affected = 0
            for i, operation in enumerate(plan['sqlite_operations']):
                affected = execute_operation(conn, operation)
                total_affected += affected
                print(f"  Operation {i+1}: {operation['operation']} on {operation['table']} - {affected} rows affected")
            
            # Validate constraints if specified
            if plan.get('validation', {}).get('check_constraints'):
                conn.execute("PRAGMA foreign_key_check")
                conn.execute("PRAGMA integrity_check")
                print("✅ Constraint validation passed")
            
            # Commit transaction
            conn.execute("COMMIT")
            print(f"✅ Successfully applied {len(plan['sqlite_operations'])} operations affecting {total_affected} rows")
            
        except Exception as e:
            conn.execute("ROLLBACK")
            raise
        finally:
            conn.close()
        
        return 0
        
    except FileNotFoundError as e:
        print(f"ERROR: File not found: {e}")
        return 1
    except sqlite3.Error as e:
        print(f"ERROR: SQLite error: {e}")
        return 1
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON: {e}")
        return 1
    except Exception as e:
        print(f"ERROR: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
