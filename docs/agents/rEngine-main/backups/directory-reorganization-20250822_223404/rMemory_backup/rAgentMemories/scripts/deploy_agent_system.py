#!/usr/bin/env python3

import os
import sys
import shutil
from pathlib import Path
import argparse
import json
from datetime import datetime
import git

class AgentSystemDeployer:
    def __init__(self, target_repo: str, target_path: str):
        self.target_repo = target_repo
        self.target_path = Path(target_path)
        self.source_path = Path(__file__).parent.parent
        self.template_path = self.source_path / "templates"

    def validate_target(self) -> None:
        """Validate the target repository."""
        if not self.target_path.exists():
            print(f"Creating target directory: {self.target_path}")
            self.target_path.mkdir(parents=True)
        
        git_dir = self.target_path / ".git"
        if not git_dir.exists():
            print("Initializing git repository...")
            git.Repo.init(self.target_path)

    def deploy_core_files(self) -> None:
        """Deploy core agent system files."""
        core_files = [
            "bootstrap_agent_system.py",
            "project_bootstrap.yml",
            "agent_readme.md"
        ]

        # Create agents directory structure
        agents_dir = self.target_path / "agents"
        for subdir in ["scripts", "docs", "memory", "templates"]:
            (agents_dir / subdir).mkdir(parents=True, exist_ok=True)

        # Copy template files
        for file in core_files:
            source = self.template_path / file
            if file == "bootstrap_agent_system.py":
                dest = agents_dir / "scripts" / file
            elif file == "project_bootstrap.yml":
                dest = agents_dir / "templates" / file
            elif file == "agent_readme.md":
                dest = agents_dir / "README.md"
            
            if source.exists():
                shutil.copy2(source, dest)
                print(f"Deployed {file} to {dest}")
            else:
                print(f"Warning: Source file {file} not found")

    def initialize_memory(self) -> None:
        """Initialize the memory system."""
        memory_template = {
            "metadata": {
                "version": "1.0.0",
                "created": datetime.now().isoformat(),
                "project": self.target_repo,
                "type": "project_memory_store"
            },
            "bootstrap_memories": {
                "project_info": {
                    "name": self.target_repo,
                    "initialized": datetime.now().isoformat(),
                    "source": "StackTrackr"
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

        memory_file = self.target_path / "agents" / "memory" / "memory.json"
        with open(memory_file, 'w') as f:
            json.dump(memory_template, f, indent=2)
        print(f"Initialized memory system for {self.target_repo}")

    def copy_docs(self) -> None:
        """Copy documentation files."""
        docs_source = self.source_path / "docs"
        docs_target = self.target_path / "docs"
        
        if docs_source.exists():
            shutil.copytree(docs_source, docs_target, dirs_exist_ok=True)
            print("Copied documentation files")

    def setup_git_ignore(self) -> None:
        """Set up .gitignore file."""
        gitignore_content = """
# Agent system
agents/memory/*.json
!agents/memory/memory.json
agents/**/*.pyc
agents/__pycache__/

# Environment
.env
.venv/
env/
venv/
ENV/

# IDEs and editors
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
"""
        gitignore_file = self.target_path / ".gitignore"
        with open(gitignore_file, 'w') as f:
            f.write(gitignore_content.strip())
        print("Created .gitignore file")

    def create_initial_commit(self) -> None:
        """Create initial commit with agent system files."""
        try:
            repo = git.Repo(self.target_path)
            repo.index.add("*")
            repo.index.commit("Initialize Agentic OS")
            print("Created initial commit")
        except Exception as e:
            print(f"Warning: Could not create initial commit: {e}")

def main():
    parser = argparse.ArgumentParser(description="Deploy Agentic OS to a new project")
    parser.add_argument("repo", help="Target repository name")
    parser.add_argument("--path", help="Target path (defaults to current directory)", default=".")
    args = parser.parse_args()

    deployer = AgentSystemDeployer(args.repo, args.path)
    
    try:
        print(f"Deploying Agentic OS to {args.repo}...")
        
        deployer.validate_target()
        deployer.deploy_core_files()
        deployer.initialize_memory()
        deployer.copy_docs()
        deployer.setup_git_ignore()
        deployer.create_initial_commit()
        
        print(f"\nSuccessfully deployed Agentic OS to {args.repo}")
        print("\nNext steps:")
        print("1. cd into your project directory")
        print("2. Run: python agents/scripts/bootstrap_agent_system.py")
        print("3. Check agents/README.md for further instructions")
        
    except Exception as e:
        print(f"Error during deployment: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
