#!/usr/bin/env python3
"""
JSON-First Backup System for StackTrackr Agentic Operating System
Backs up and syncs all JSON files and critical project data
"""

import json
import os
import shutil
from datetime import datetime
from pathlib import Path

# Configuration
AGENTS_DIR = "agents"
BACKUP_DIR = "backups/agents_json"
CORE_JSON_FILES = [
    "agents/agents.json",
    "agents/decisions.json", 
    "agents/errors.json",
    "agents/functions.json",
    "agents/memory.json",
    "agents/performance.json",
    "agents/preferences.json",
    "agents/recentissues.json",
    "agents/structure.json",
    "agents/styles.json",
    "agents/tasks.json",
    "agents/variables.json"
]

CRITICAL_FILES = [
    "agents/unified-workflow.md",
    "agents/notes/naming-guidelines.md",
    "agents/notes/consolidated-development-guide.md",
    "docs/roadmap.md",
    "docs/changelog.md"
]

def ensure_backup_dir():
    """Create backup directory structure"""
    Path(BACKUP_DIR).mkdir(parents=True, exist_ok=True)
    Path(f"{BACKUP_DIR}/json").mkdir(parents=True, exist_ok=True)
    Path(f"{BACKUP_DIR}/docs").mkdir(parents=True, exist_ok=True)
    Path(f"{BACKUP_DIR}/workflow").mkdir(parents=True, exist_ok=True)

def backup_json_files():
    """Backup all core JSON files with timestamp"""
    ensure_backup_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    backup_manifest = {
        "backup_timestamp": datetime.now().isoformat(),
        "backup_version": "2.0_json_first",
        "files_backed_up": [],
        "backup_location": BACKUP_DIR
    }
    
    # Backup JSON files
    for json_file in CORE_JSON_FILES:
        if os.path.exists(json_file):
            filename = os.path.basename(json_file)
            backup_path = f"{BACKUP_DIR}/json/{filename}.{timestamp}.bak"
            shutil.copy2(json_file, backup_path)
            
            # Also create latest backup
            latest_path = f"{BACKUP_DIR}/json/{filename}.latest.bak"
            shutil.copy2(json_file, latest_path)
            
            backup_manifest["files_backed_up"].append({
                "source": json_file,
                "backup": backup_path,
                "latest": latest_path,
                "size": os.path.getsize(json_file)
            })
    
    # Backup critical documentation
    for doc_file in CRITICAL_FILES:
        if os.path.exists(doc_file):
            filename = os.path.basename(doc_file)
            backup_path = f"{BACKUP_DIR}/docs/{filename}.{timestamp}.bak"
            shutil.copy2(doc_file, backup_path)
            
            backup_manifest["files_backed_up"].append({
                "source": doc_file,
                "backup": backup_path,
                "type": "documentation"
            })
    
    # Save backup manifest
    manifest_path = f"{BACKUP_DIR}/backup_manifest_{timestamp}.json"
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(backup_manifest, f, indent=2, ensure_ascii=False)
    
    return backup_manifest

def restore_from_backup(timestamp=None):
    """
    Restore JSON files from backup
    
    Args:
        timestamp: Specific backup timestamp, or None for latest
    """
    ensure_backup_dir()
    
    if timestamp is None:
        # Restore from latest backups
        for json_file in CORE_JSON_FILES:
            filename = os.path.basename(json_file)
            latest_backup = f"{BACKUP_DIR}/json/{filename}.latest.bak"
            
            if os.path.exists(latest_backup):
                shutil.copy2(latest_backup, json_file)
                print(f"Restored {json_file} from latest backup")
            else:
                print(f"Warning: No backup found for {json_file}")
    else:
        # Restore from specific timestamp
        for json_file in CORE_JSON_FILES:
            filename = os.path.basename(json_file)
            timestamped_backup = f"{BACKUP_DIR}/json/{filename}.{timestamp}.bak"
            
            if os.path.exists(timestamped_backup):
                shutil.copy2(timestamped_backup, json_file)
                print(f"Restored {json_file} from {timestamp} backup")
            else:
                print(f"Warning: No {timestamp} backup found for {json_file}")

def load_json_memory_fallback():
    """
    Load complete project context from JSON files when MCP unavailable
    
    Returns:
        dict: Complete project memory loaded from JSON files
    """
    memory_data = {
        "timestamp": datetime.now().isoformat(),
        "source": "JSON_backup_files",
        "agents": {},
        "tasks": {},
        "memory": {},
        "functions": {},
        "issues": {},
        "performance": {},
        "decisions": {},
        "errors": {},
        "preferences": {},
        "structure": {},
        "styles": {},
        "variables": {}
    }
    
    # Load each JSON file
    json_file_mapping = {
        "agents/agents.json": "agents",
        "agents/tasks.json": "tasks", 
        "agents/memory.json": "memory",
        "agents/functions.json": "functions",
        "agents/recentissues.json": "issues",
        "agents/performance.json": "performance",
        "agents/decisions.json": "decisions",
        "agents/errors.json": "errors",
        "agents/preferences.json": "preferences",
        "agents/structure.json": "structure",
        "agents/styles.json": "styles",
        "agents/variables.json": "variables"
    }
    
    for file_path, data_key in json_file_mapping.items():
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    memory_data[data_key] = json.load(f)
            else:
                print(f"Warning: {file_path} not found")
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
    
    return memory_data

def get_available_tasks_from_json():
    """
    Extract available tasks from tasks.json for agent queries
    """
    try:
        if os.path.exists("agents/tasks.json"):
            with open("agents/tasks.json", 'r', encoding='utf-8') as f:
                tasks_data = json.load(f)
            
            available_work = {
                "active_projects": tasks_data.get("active_projects", {}),
                "task_templates": tasks_data.get("task_templates", {}),
                "summary": {
                    "total_projects": len(tasks_data.get("active_projects", {})),
                    "pending_phases": 0,
                    "in_progress_phases": 0,
                    "completed_phases": 0
                }
            }
            
            # Count phases by status
            for project in tasks_data.get("active_projects", {}).values():
                for phase in project.get("phases", {}).values():
                    status = phase.get("status", "unknown")
                    if status == "pending":
                        available_work["summary"]["pending_phases"] += 1
                    elif status == "in_progress":
                        available_work["summary"]["in_progress_phases"] += 1
                    elif status == "completed":
                        available_work["summary"]["completed_phases"] += 1
            
            return available_work
        else:
            print("Warning: agents/tasks.json not found")
            return {}
            
    except Exception as e:
        print(f"Error loading tasks from JSON: {e}")
        return {}

def search_json_memory(query):
    """
    Search across all JSON files for relevant information
    
    Args:
        query (str): Search query
        
    Returns:
        list: Matching information across all JSON files
    """
    results = []
    query_lower = query.lower()
    
    try:
        memory_data = load_json_memory_fallback()
        
        # Search across all loaded data
        for data_type, data_content in memory_data.items():
            if data_type in ["timestamp", "source"]:
                continue
                
            if isinstance(data_content, dict):
                # Search in dictionary content
                for key, value in data_content.items():
                    if query_lower in str(key).lower() or query_lower in str(value).lower():
                        results.append({
                            "type": data_type,
                            "location": key,
                            "content": value,
                            "relevance": "key_or_value_match"
                        })
        
        return results
        
    except Exception as e:
        print(f"Error searching JSON memory: {e}")
        return []

def create_emergency_recovery_package():
    """
    Create a complete recovery package with all critical files
    """
    ensure_backup_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    recovery_dir = f"{BACKUP_DIR}/emergency_recovery_{timestamp}"
    
    Path(recovery_dir).mkdir(parents=True, exist_ok=True)
    
    # Backup all JSON files
    json_backup_dir = f"{recovery_dir}/json_files"
    Path(json_backup_dir).mkdir(exist_ok=True)
    
    for json_file in CORE_JSON_FILES:
        if os.path.exists(json_file):
            filename = os.path.basename(json_file)
            shutil.copy2(json_file, f"{json_backup_dir}/{filename}")
    
    # Backup critical documentation
    docs_backup_dir = f"{recovery_dir}/documentation"
    Path(docs_backup_dir).mkdir(exist_ok=True)
    
    for doc_file in CRITICAL_FILES:
        if os.path.exists(doc_file):
            filename = os.path.basename(doc_file)
            shutil.copy2(doc_file, f"{docs_backup_dir}/{filename}")
    
    # Create recovery instructions
    recovery_instructions = f"""# Emergency Recovery Instructions
Created: {datetime.now().isoformat()}

## Recovery Steps

1. **Restore JSON Files**:
   Copy all files from json_files/ back to agents/ directory

2. **Restore Documentation**:
   Copy files from documentation/ to their original locations

3. **Verify System**:
   - Check that all agents can read JSON files
   - Verify unified-workflow.md is accessible
   - Test agent initialization protocols

## File Locations
"""
    
    for json_file in CORE_JSON_FILES:
        if os.path.exists(json_file):
            recovery_instructions += f"- {os.path.basename(json_file)} → {json_file}\n"
    
    with open(f"{recovery_dir}/RECOVERY_INSTRUCTIONS.md", 'w') as f:
        f.write(recovery_instructions)
    
    print(f"Emergency recovery package created: {recovery_dir}")
    return recovery_dir

if __name__ == "__main__":
    print("StackTrackr JSON-First Backup System")
    print("=====================================")
    
    # Create backup
    print("Creating backup...")
    manifest = backup_json_files()
    print(f"Backup completed: {len(manifest['files_backed_up'])} files backed up")
    
    # Test loading memory
    print("\nTesting JSON memory loading...")
    memory = load_json_memory_fallback()
    print(f"Loaded memory from {len(memory)} JSON file categories")
    
    # Test task loading
    print("\nTesting task loading...")
    tasks = get_available_tasks_from_json()
    if tasks:
        summary = tasks.get("summary", {})
        print(f"Found {summary.get('total_projects', 0)} active projects")
        print(f"Pending phases: {summary.get('pending_phases', 0)}")
        print(f"In progress: {summary.get('in_progress_phases', 0)}")
    
    print("\nBackup system ready for JSON-first operation!")