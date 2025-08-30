#!/usr/bin/env python3

import os
import sys
import yaml
import json
import shutil
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import git
import requests

class AgentSystemBootstrapper:
    def __init__(self, project_name: str, project_path: str):
        self.project_name = project_name
        self.project_path = Path(project_path)
        self.template_path = Path(__file__).parent.parent / "templates"
        self.config = None

    def load_bootstrap_config(self) -> None:
        """Load and validate the bootstrap configuration."""
        config_path = self.template_path / "project_bootstrap.yml"
        with open(config_path) as f:
            template = f.read()
            # Replace template variables
            template = template.replace("{{ project_name }}", self.project_name)
            template = template.replace("{{ project_description }}", f"Agentic OS implementation for {self.project_name}")
            self.config = yaml.safe_load(template)

    def create_directory_structure(self) -> None:
        """Create the project directory structure."""
        for path in self.config["structure"]:
            full_path = self.project_path / path
            full_path.mkdir(parents=True, exist_ok=True)
            print(f"Created directory: {full_path}")

    def sync_core_memories(self) -> None:
        """Sync core memories from the source repository."""
        source_repo = self.config["agent_system"]["memory_sync"]["source_repo"]
        try:
            # Clone or pull the private repo (requires proper authentication)
            repo_path = self.project_path / ".core_memories_temp"
            if not repo_path.exists():
                git.Repo.clone_from(f"https://github.com/lbruton/{source_repo}.git", repo_path)
            
            # Copy memory files
            for path in self.config["agent_system"]["memory_sync"]["paths"]:
                source = repo_path / path
                dest = self.project_path / path
                if source.exists():
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(source, dest)
                    print(f"Synced memory file: {path}")
            
            # Cleanup
            shutil.rmtree(repo_path)
        except Exception as e:
            print(f"Error syncing core memories: {e}")
            sys.exit(1)

    def initialize_memory_system(self) -> None:
        """Initialize the memory system with project-specific settings."""
        memory_template = {
            "metadata": {
                "version": "1.0.0",
                "created": datetime.now().isoformat(),
                "project": self.project_name,
                "type": "project_memory_store"
            },
            "bootstrap_memories": {
                "project_info": {
                    "name": self.project_name,
                    "initialized": datetime.now().isoformat(),
                    "core_memories_source": self.config["agent_system"]["core_memories_source"]
                }
            },
            "shared_memories": {},
            "agent_memories": {},
            "system_state": {
                "last_sync": None,
                "health_check": {
                    "status": "initialized",
                    "last_check": datetime.now().isoformat()
                }
            }
        }

        memory_file = self.project_path / "agents" / "memory.json"
        with open(memory_file, 'w') as f:
            json.dump(memory_template, f, indent=2)
        print(f"Initialized memory system for {self.project_name}")

    def copy_agent_scripts(self) -> None:
        """Copy and configure agent scripts."""
        for file_info in self.config["files"]:
            source = self.template_path / file_info["template"]
            dest = self.project_path / file_info["path"]
            
            if source.exists():
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, dest)
                print(f"Copied {file_info['template']} to {file_info['path']}")
            else:
                print(f"Warning: Template file {file_info['template']} not found")

    def run_initialization_hooks(self, hook_type: str) -> None:
        """Run initialization hooks."""
        hooks = self.config["hooks"].get(hook_type, [])
        for hook in hooks:
            if hasattr(self, hook):
                getattr(self, hook)()
                print(f"Executed {hook_type} hook: {hook}")

    def validate_environment(self) -> None:
        """Validate the environment before initialization."""
        required_tools = ["git", "python3", "pip"]
        for tool in required_tools:
            if shutil.which(tool) is None:
                print(f"Error: Required tool '{tool}' not found")
                sys.exit(1)

    def check_dependencies(self) -> None:
        """Check Python dependencies."""
        required_packages = ["pyyaml", "gitpython", "requests"]
        import pkg_resources
        for package in required_packages:
            try:
                pkg_resources.require(package)
            except pkg_resources.DistributionNotFound:
                print(f"Installing required package: {package}")
                os.system(f"pip install {package}")

    def validate_setup(self) -> None:
        """Validate the setup after initialization."""
        required_files = [
            "agents/memory.json",
            "agents/scripts/initialize_memory.py",
            "agents/docs/memory-initialization.md"
        ]
        
        for file_path in required_files:
            full_path = self.project_path / file_path
            if not full_path.exists():
                print(f"Warning: Required file not found: {file_path}")

def main():
    if len(sys.argv) < 2:
        print("Usage: bootstrap_agent_system.py <project_name> [project_path]")
        sys.exit(1)

    project_name = sys.argv[1]
    project_path = sys.argv[2] if len(sys.argv) > 2 else os.getcwd()

    bootstrapper = AgentSystemBootstrapper(project_name, project_path)
    
    try:
        print(f"Bootstrapping Agentic OS for project: {project_name}")
        
        bootstrapper.run_initialization_hooks("pre_init")
        bootstrapper.load_bootstrap_config()
        bootstrapper.create_directory_structure()
        bootstrapper.sync_core_memories()
        bootstrapper.initialize_memory_system()
        bootstrapper.copy_agent_scripts()
        bootstrapper.run_initialization_hooks("post_init")
        
        print(f"\nSuccessfully initialized Agentic OS for {project_name}")
        print("Next steps:")
        print("1. Review the generated configuration in agents/memory.json")
        print("2. Run ./agents/scripts/initialize_memory.py to start the memory system")
        print("3. Check agents/docs/memory-initialization.md for usage instructions")
        
    except Exception as e:
        print(f"Error during initialization: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
