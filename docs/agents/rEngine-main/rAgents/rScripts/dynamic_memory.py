#!/usr/bin/env python3
"""
Dynamic Memory Type Creator
Automatically generates new memory JSON files and integrates them into the sync system
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

class DynamicMemoryCreator:
    def __init__(self, agents_path: str = "/Volumes/DATA/GitHub/rEngine/rAgents"):
        self.agents_path = Path(agents_path)
        self.sync_config_path = self.agents_path / "sync_config.json"
        self.templates_path = self.agents_path / "templates"
        
    def create_memory_type(self, 
                          memory_type: str,
                          purpose: str,
                          structure: Dict = None,
                          sync_priority: int = 5,
                          auto_sync: bool = True) -> bool:
        """
        Creates a new memory type JSON file and integrates it into the sync system
        
        Args:
            memory_type: Name of the new memory type (e.g., "patterns", "learnings")
            purpose: Description of what this memory type stores
            structure: Optional custom structure, uses template if not provided
            sync_priority: Priority level for syncing (1=highest, 5=lowest)
            auto_sync: Whether to auto-sync this memory type
        """
        
        filename = f"{memory_type}.json"
        file_path = self.agents_path / filename
        
        # Check if file already exists
        if file_path.exists():
            print(f"❌ Memory type '{memory_type}' already exists at {filename}")
            return False
            
        # Create the memory structure
        memory_structure = structure or self._create_default_structure(memory_type, purpose)
        
        # Write the new memory file
        try:
            with open(file_path, 'w') as f:
                json.dump(memory_structure, f, indent=2)
            print(f"✅ Created new memory type: {filename}")
        except Exception as e:
            print(f"❌ Failed to create {filename}: {e}")
            return False
            
        # Update sync configuration
        if auto_sync:
            self._add_to_sync_config(memory_type, purpose, sync_priority)
            
        # Update workflow documentation
        self._update_workflow_docs(memory_type, purpose)
        
        print(f"🎉 Memory type '{memory_type}' successfully integrated!")
        print(f"📁 File: {filename}")
        print(f"🔄 Sync: {'Enabled' if auto_sync else 'Manual'}")
        print(f"📋 Priority: {sync_priority}")
        
        return True
        
    def _create_default_structure(self, memory_type: str, purpose: str) -> Dict:
        """Creates a default structure for new memory types"""
        return {
            "metadata": {
                "version": "1.0",
                "created": datetime.now().isoformat()[:10],
                "purpose": purpose,
                "description": f"Dynamic memory system for {memory_type} management",
                "mcp_fallback": f"Complete {memory_type} information available when MCP is unavailable",
                "auto_generated": True,
                "memory_type": memory_type
            },
            f"{memory_type}_data": {
                "entries": {},
                "categories": [],
                "patterns": [],
                "relationships": {}
            },
            "learning_metrics": {
                "total_entries": 0,
                "last_updated": datetime.now().isoformat(),
                "effectiveness_score": 0.0,
                "usage_frequency": 0
            },
            "integration_points": {
                "related_memory_types": [],
                "cross_references": {},
                "auto_triggers": []
            }
        }
        
    def _add_to_sync_config(self, memory_type: str, purpose: str, sync_priority: int):
        """Adds the new memory type to sync configuration"""
        try:
            # Load existing config
            with open(self.sync_config_path, 'r') as f:
                config = json.load(f)
                
            filename = f"{memory_type}.json"
            
            # Add to file mappings
            config["file_mappings"][filename] = {
                "mcp_entity_prefix": memory_type.title(),
                "sync_priority": sync_priority,
                "bidirectional": True,
                "validation_schema": f"{memory_type}_schema.json",
                "auto_generated": True,
                "mapping_rules": {
                    f"{memory_type}_data": {
                        "target_entity": f"{memory_type.title()}Entry",
                        "id_mapping": "entry_id -> name",
                        "field_mappings": {
                            "type": "observations[0]",
                            "description": "observations[1]",
                            "status": "observations[2]",
                            "context": "observations[3]",
                            "effectiveness": "observations[4]"
                        }
                    }
                }
            }
            
            # Save updated config
            with open(self.sync_config_path, 'w') as f:
                json.dump(config, f, indent=2)
                
            print(f"✅ Added {filename} to sync configuration")
            
        except Exception as e:
            print(f"⚠️  Failed to update sync config: {e}")
            
    def _update_workflow_docs(self, memory_type: str, purpose: str):
        """Updates workflow documentation to include the new memory type"""
        try:
            # Update the shared memory index in AGENTS.md and COPILOT_INSTRUCTIONS.md
            agents_md_path = self.agents_path.parent / "AGENTS.md"
            copilot_md_path = self.agents_path.parent / "COPILOT_INSTRUCTIONS.md"
            
            new_entry = f'  "{memory_type}": "agents/{memory_type}.json",      // {purpose}'
            
            for doc_path in [agents_md_path, copilot_md_path]:
                if doc_path.exists():
                    with open(doc_path, 'r') as f:
                        content = f.read()
                    
                    # Find the JSON block and add the new entry
                    if '"styles": "agents/styles.json"' in content:
                        content = content.replace(
                            '"styles": "agents/styles.json"       // Visual style definitions',
                            f'"styles": "agents/styles.json",       // Visual style definitions\n{new_entry}'
                        )
                        
                        with open(doc_path, 'w') as f:
                            f.write(content)
                            
                        print(f"✅ Updated {doc_path.name}")
                        
        except Exception as e:
            print(f"⚠️  Failed to update workflow docs: {e}")
            
    def list_memory_types(self) -> List[Dict]:
        """Lists all existing memory types"""
        memory_types = []
        
        for file_path in self.agents_path.glob("*.json"):
            if file_path.name in ["sync_config.json", "sync_metadata.json"]:
                continue
                
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    
                metadata = data.get("metadata", {})
                memory_types.append({
                    "name": file_path.stem,
                    "file": file_path.name,
                    "purpose": metadata.get("purpose", "Unknown"),
                    "created": metadata.get("created", "Unknown"),
                    "auto_generated": metadata.get("auto_generated", False),
                    "size_kb": round(file_path.stat().st_size / 1024, 1)
                })
                
            except Exception:
                continue
                
        return sorted(memory_types, key=lambda x: x["name"])
        
    def create_project_brain_package(self, target_project_path: str) -> bool:
        """
        Creates a portable brain package that can be copied to new projects
        """
        target_path = Path(target_project_path)
        target_agents_path = target_path / "agents"
        
        try:
            # Create target directory
            target_agents_path.mkdir(parents=True, exist_ok=True)
            
            # Copy all JSON memory files
            json_files = list(self.agents_path.glob("*.json"))
            for json_file in json_files:
                target_file = target_agents_path / json_file.name
                
                # Load and adapt the file for new project
                with open(json_file, 'r') as f:
                    data = json.load(f)
                    
                # Reset project-specific data but keep structure and learnings
                adapted_data = self._adapt_for_new_project(data, json_file.stem)
                
                with open(target_file, 'w') as f:
                    json.dump(adapted_data, f, indent=2)
                    
            # Copy workflow files
            workflow_files = ["AGENTS.md", "COPILOT_INSTRUCTIONS.md"]
            for workflow_file in workflow_files:
                source_file = self.agents_path.parent / workflow_file
                target_file = target_path / workflow_file
                
                if source_file.exists():
                    with open(source_file, 'r') as f:
                        content = f.read()
                    
                    # Adapt paths for new project
                    adapted_content = content.replace(
                        "/Volumes/DATA/GitHub/rEngine",
                        str(target_path)
                    )
                    
                    with open(target_file, 'w') as f:
                        f.write(adapted_content)
                        
            # Copy scripts directory
            scripts_source = self.agents_path / "scripts"
            scripts_target = target_agents_path / "scripts"
            
            if scripts_source.exists():
                import shutil
                shutil.copytree(scripts_source, scripts_target, dirs_exist_ok=True)
                
            print(f"🧠 Brain package created at: {target_project_path}")
            print(f"📁 {len(json_files)} memory files copied")
            print(f"📋 Workflow files copied")
            print(f"🔧 Scripts copied")
            print(f"✨ Ready for new project initialization!")
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to create brain package: {e}")
            return False
            
    def _adapt_for_new_project(self, data: Dict, memory_type: str) -> Dict:
        """Adapts memory data for a new project"""
        # Keep the structure and learnings, but reset project-specific data
        if memory_type == "tasks":
            # Clear active projects but keep templates
            data["active_projects"] = {}
        elif memory_type == "memory":
            # Keep system components but clear project-specific entities
            if "entities" in data and "projects" in data["entities"]:
                # Keep framework projects, clear app-specific ones
                projects = data["entities"]["projects"]
                data["entities"]["projects"] = {
                    k: v for k, v in projects.items() 
                    if v.get("type") in ["development_platform", "framework"]
                }
        elif memory_type == "errors":
            # Keep error patterns and prevention strategies - these are valuable learnings
            pass
        elif memory_type in ["decisions", "functions"]:
            # Clear project-specific content but keep structure
            for key in data.keys():
                if isinstance(data[key], dict) and key != "metadata":
                    data[key] = {}
                    
        # Update metadata
        if "metadata" in data:
            data["metadata"]["adapted_for_new_project"] = True
            data["metadata"]["original_project"] = "StackTrackr"
            data["metadata"]["adaptation_date"] = datetime.now().isoformat()[:10]
            
        return data

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Dynamic Memory Type Creator")
    parser.add_argument("action", choices=["create", "list", "package"])
    parser.add_argument("--type", help="Memory type name")
    parser.add_argument("--purpose", help="Purpose description")
    parser.add_argument("--priority", type=int, default=5, help="Sync priority (1-5)")
    parser.add_argument("--target", help="Target project path for packaging")
    
    args = parser.parse_args()
    
    creator = DynamicMemoryCreator()
    
    if args.action == "create":
        if not args.type or not args.purpose:
            print("❌ --type and --purpose are required for create action")
            exit(1)
        creator.create_memory_type(args.type, args.purpose, sync_priority=args.priority)
        
    elif args.action == "list":
        memory_types = creator.list_memory_types()
        print("\n📋 Current Memory Types:")
        print("-" * 80)
        for mt in memory_types:
            auto_flag = "🤖" if mt["auto_generated"] else "👤"
            print(f"{auto_flag} {mt['name']:<15} | {mt['purpose']:<40} | {mt['size_kb']}KB")
            
    elif args.action == "package":
        if not args.target:
            print("❌ --target is required for package action")
            exit(1)
        creator.create_project_brain_package(args.target)
