#!/usr/bin/env python3

import os
import sys
import json
import shutil
from datetime import datetime
from pathlib import Path
import subprocess
import time

class MemoryVaultSync:
    def __init__(self):
        self.source_path = Path('/Volumes/DATA/GitHub/rEngine/rAgents')
        self.vault_repo = 'memory-vault'
        self.vault_path = Path('/Volumes/DATA/GitHub/memory-vault/rAgentShared')
        self.last_sync_file = self.source_path / '.last_sync'

    def ensure_vault_directory(self):
        """Ensure the vault directory exists"""
        self.vault_path.mkdir(parents=True, exist_ok=True)

    def get_last_sync_time(self):
        """Get the last sync timestamp"""
        if self.last_sync_file.exists():
            return float(self.last_sync_file.read_text().strip())
        return 0

    def update_last_sync_time(self):
        """Update the last sync timestamp"""
        self.last_sync_file.write_text(str(time.time()))

    def has_changes(self, file_path):
        """Check if file has changed since last sync"""
        last_sync = self.get_last_sync_time()
        return os.path.getmtime(file_path) > last_sync

    def sync_memory_files(self):
        """Sync memory files to vault"""
        changes = False
        
        # Auto-discover all JSON memory files (excluding config files)
        memory_files = ['agents.json', 'claude_opus_memories.json', 'claude_sonnet_memories.json', 'communications.json', 'decisions.json', 'dependencies.json', 'errors.json', 'extendedcontext.json', 'functions.json', 'gemini_pro_memories.json', 'github_copilot_memories.json', 'gpt4_memories.json', 'gpt4o_memories.json', 'handoff.json', 'interactions.json', 'memory.json', 'patterns.json', 'performance.json', 'preferences.json', 'recentissues.json', 'structure.json', 'styles.json', 'tasks.json', 'tools.json', 'variables.json']
        for file_path in self.source_path.glob('*.json'):
            filename = file_path.name
            # Exclude sync configuration and metadata files
            if filename not in ['sync_config.json', 'sync_metadata.json']:
                memory_files.append(filename)
        
        print(f"Discovered {len(memory_files)} memory files to sync")
        
        for filename in memory_files:
            file = self.source_path / filename
            print(f"Checking file {file}...")
            if file.exists():
                print(f"File exists, checking for changes...")
                if self.has_changes(file):
                    print(f"Changes detected, syncing {file.name}...")
                    dest = self.vault_path / file.name
                    shutil.copy2(file, dest)
                    print(f"Copied to {dest}")
                    changes = True
                else:
                    print(f"No changes detected for {file.name}")
            else:
                print(f"Memory file not found: {filename}")

        return changes

    def commit_and_push(self):
        """Commit and push changes to vault repo"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        os.chdir(self.vault_path.parent)

        try:
            subprocess.run(['git', 'add', '.'], check=True)
            subprocess.run(['git', 'commit', '-m', f'Memory sync: {timestamp}'], check=True)
            subprocess.run(['git', 'push', 'origin', 'main'], check=True)
            print("Changes pushed to memory vault")
            return True
        except subprocess.CalledProcessError as e:
            print(f"Git operation failed: {e}")
            return False

    def sync(self):
        """Main sync process"""
        print("Starting memory vault sync...")
        self.ensure_vault_directory()

        if self.sync_memory_files():
            if self.commit_and_push():
                self.update_last_sync_time()
                print("Sync completed successfully")
            else:
                print("Failed to push changes")
        else:
            print("No changes to sync")

def main():
    syncer = MemoryVaultSync()
    syncer.sync()

if __name__ == "__main__":
    main()
