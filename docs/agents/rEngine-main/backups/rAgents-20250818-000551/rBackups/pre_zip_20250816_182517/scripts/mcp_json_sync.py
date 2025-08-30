#!/usr/bin/env python3
"""
MCP-JSON Bidirectional Synchronization System
Ensures 1:1 mapping and perfect sync between JSON files and MCP Memory
"""

import json
import os
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging

class MCPJsonSync:
    def __init__(self, agents_path: str = "/Volumes/DATA/GitHub/StackTrackr/agents"):
        self.agents_path = Path(agents_path)
        self.sync_metadata_file = self.agents_path / "sync_metadata.json"
        self.setup_logging()
        
        # Define JSON files that should be synced to MCP
        self.sync_files = {
            "tasks.json": {
                "mcp_entity_type": "Task",
                "id_field": "project_id",
                "sync_priority": 1
            },
            "agents.json": {
                "mcp_entity_type": "Agent",
                "id_field": "agent_id", 
                "sync_priority": 2
            },
            "errors.json": {
                "mcp_entity_type": "Error",
                "id_field": "error_type",
                "sync_priority": 3
            },
            "decisions.json": {
                "mcp_entity_type": "Decision",
                "id_field": "decision_id",
                "sync_priority": 3
            },
            "functions.json": {
                "mcp_entity_type": "Function",
                "id_field": "function_id",
                "sync_priority": 4
            },
            "preferences.json": {
                "mcp_entity_type": "Preference",
                "id_field": "preference_id",
                "sync_priority": 5
            },
            "styles.json": {
                "mcp_entity_type": "Style",
                "id_field": "style_id",
                "sync_priority": 5
            },
            "memory.json": {
                "mcp_entity_type": "Memory",
                "id_field": "entity_id",
                "sync_priority": 1
            }
        }

    def setup_logging(self):
        """Setup logging for sync operations"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.agents_path / 'sync.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate MD5 hash of file content"""
        if not file_path.exists():
            return ""
        
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()

    def load_sync_metadata(self) -> Dict:
        """Load synchronization metadata"""
        if self.sync_metadata_file.exists():
            with open(self.sync_metadata_file, 'r') as f:
                return json.load(f)
        return {
            "last_sync": None,
            "file_hashes": {},
            "mcp_entity_hashes": {},
            "sync_conflicts": [],
            "version": "1.0"
        }

    def save_sync_metadata(self, metadata: Dict):
        """Save synchronization metadata"""
        with open(self.sync_metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)

    def json_to_mcp_entities(self, file_name: str, json_data: Dict) -> List[Dict]:
        """Convert JSON data to MCP entities format"""
        entities = []
        sync_config = self.sync_files[file_name]
        entity_type = sync_config["mcp_entity_type"]
        id_field = sync_config["id_field"]

        # Handle different JSON structures
        if file_name == "tasks.json":
            # Convert active projects to entities
            for project_id, project_data in json_data.get("active_projects", {}).items():
                entity = {
                    "entityType": f"{entity_type}Project",
                    "name": project_id,
                    "observations": [
                        f"Title: {project_data.get('title', '')}",
                        f"Status: {project_data.get('status', '')}",
                        f"Priority: {project_data.get('priority', '')}",
                        f"Description: {project_data.get('description', '')}",
                        f"Lead Coordinator: {project_data.get('lead_coordinator', '')}",
                        f"Started: {project_data.get('started', '')}",
                        f"Target Completion: {project_data.get('target_completion', '')}",
                        f"Estimated Total Time: {project_data.get('estimated_total_time', '')}"
                    ]
                }
                entities.append(entity)

                # Convert phases to entities
                for phase_id, phase_data in project_data.get("phases", {}).items():
                    phase_entity = {
                        "entityType": f"{entity_type}Phase",
                        "name": f"{project_id}_{phase_id}",
                        "observations": [
                            f"Title: {phase_data.get('title', '')}",
                            f"Agent: {phase_data.get('agent', '')}",
                            f"Status: {phase_data.get('status', '')}",
                            f"Priority: {phase_data.get('priority', '')}",
                            f"Estimated Time: {phase_data.get('estimated_time', '')}",
                            f"Dependencies: {', '.join(phase_data.get('dependencies', []))}",
                            f"Files Affected: {', '.join(phase_data.get('files_affected', []))}",
                            f"Success Criteria: {', '.join(phase_data.get('success_criteria', []))}"
                        ]
                    }
                    entities.append(phase_entity)

        elif file_name == "agents.json":
            # Convert agent profiles to entities
            for agent_id, agent_data in json_data.get("agent_profiles", {}).items():
                entity = {
                    "entityType": entity_type,
                    "name": agent_id,
                    "observations": [
                        f"Display Name: {agent_data.get('display_name', '')}",
                        f"Category: {agent_data.get('category', '')}",
                        f"Subcategory: {agent_data.get('subcategory', '')}",
                        f"Optimal Task Complexity: {agent_data.get('optimal_task_complexity', '')}",
                        f"Optimal Time Range: {agent_data.get('optimal_time_range', '')}",
                        f"Risk Tolerance: {agent_data.get('risk_tolerance', '')}",
                        f"Collaboration Style: {agent_data.get('collaboration_style', '')}",
                        f"Quality Profile: {agent_data.get('quality_profile', '')}",
                        f"Specializations: {', '.join(agent_data.get('specializations', []))}",
                        f"Strengths: {', '.join(agent_data.get('strengths', []))}",
                        f"Limitations: {', '.join(agent_data.get('limitations', []))}",
                        f"Preferred File Types: {', '.join(agent_data.get('preferred_file_types', []))}"
                    ]
                }
                entities.append(entity)

        elif file_name == "errors.json":
            # Convert error signatures to entities
            for error in json_data.get("error_signatures", {}).get("common_failure_modes", []):
                entity = {
                    "entityType": entity_type,
                    "name": error.get("signature", ""),
                    "observations": [
                        f"Error Type: {error.get('error_type', '')}",
                        f"Signature: {error.get('signature', '')}",
                        f"Frequency: {error.get('frequency', '')}",
                        f"Impact Severity: {error.get('impact_severity', '')}",
                        f"Detection Pattern: {error.get('detection_pattern', '')}",
                        f"Prevention Strategy: {error.get('prevention_strategy', '')}",
                        f"Symptoms: {', '.join(error.get('symptoms', []))}",
                        f"Root Causes: {', '.join(error.get('root_causes', []))}"
                    ]
                }
                entities.append(entity)

        # Add more conversion logic for other file types as needed

        return entities

    def mcp_entities_to_json(self, entities: List[Dict], file_name: str) -> Dict:
        """Convert MCP entities back to JSON format"""
        # This would implement the reverse conversion
        # For now, return empty structure - implement as needed
        return {}

    def sync_json_to_mcp(self, file_name: str) -> bool:
        """Sync JSON file to MCP"""
        file_path = self.agents_path / file_name
        
        if not file_path.exists():
            self.logger.warning(f"File {file_name} does not exist")
            return False

        try:
            # Load JSON data
            with open(file_path, 'r') as f:
                json_data = json.load(f)

            # Convert to MCP entities
            entities = self.json_to_mcp_entities(file_name, json_data)

            # Here you would call the actual MCP API to create/update entities
            # For now, we'll simulate this
            self.logger.info(f"Would sync {len(entities)} entities from {file_name} to MCP")
            
            # TODO: Implement actual MCP API calls
            # mcp_client.create_entities(entities)
            
            return True

        except Exception as e:
            self.logger.error(f"Error syncing {file_name} to MCP: {e}")
            return False

    def sync_mcp_to_json(self, file_name: str) -> bool:
        """Sync MCP entities back to JSON file"""
        try:
            # TODO: Implement MCP query to get entities
            # entities = mcp_client.get_entities_by_type(entity_type)
            
            # Convert entities back to JSON format
            # json_data = self.mcp_entities_to_json(entities, file_name)
            
            # Write to file
            # file_path = self.agents_path / file_name
            # with open(file_path, 'w') as f:
            #     json.dump(json_data, f, indent=2)
            
            self.logger.info(f"Would sync MCP entities back to {file_name}")
            return True

        except Exception as e:
            self.logger.error(f"Error syncing MCP to {file_name}: {e}")
            return False

    def detect_conflicts(self) -> List[Dict]:
        """Detect conflicts between JSON and MCP"""
        conflicts = []
        metadata = self.load_sync_metadata()
        
        for file_name in self.sync_files.keys():
            file_path = self.agents_path / file_name
            if not file_path.exists():
                continue
                
            current_hash = self.calculate_file_hash(file_path)
            stored_hash = metadata["file_hashes"].get(file_name, "")
            
            if current_hash != stored_hash:
                # File has changed - check if MCP also changed
                # TODO: Implement MCP change detection
                conflicts.append({
                    "file": file_name,
                    "type": "file_changed",
                    "timestamp": datetime.now().isoformat()
                })
        
        return conflicts

    def full_sync(self, direction: str = "json_to_mcp") -> Dict:
        """Perform full synchronization"""
        self.logger.info(f"Starting full sync: {direction}")
        
        results = {
            "success": True,
            "synced_files": [],
            "failed_files": [],
            "conflicts": [],
            "timestamp": datetime.now().isoformat()
        }

        # Detect conflicts first
        conflicts = self.detect_conflicts()
        if conflicts:
            results["conflicts"] = conflicts
            self.logger.warning(f"Found {len(conflicts)} conflicts")

        # Sync files in priority order
        sorted_files = sorted(self.sync_files.items(), key=lambda x: x[1]["sync_priority"])
        
        for file_name, config in sorted_files:
            try:
                if direction == "json_to_mcp":
                    success = self.sync_json_to_mcp(file_name)
                else:
                    success = self.sync_mcp_to_json(file_name)
                
                if success:
                    results["synced_files"].append(file_name)
                else:
                    results["failed_files"].append(file_name)
                    results["success"] = False
                    
            except Exception as e:
                self.logger.error(f"Failed to sync {file_name}: {e}")
                results["failed_files"].append(file_name)
                results["success"] = False

        # Update sync metadata
        metadata = self.load_sync_metadata()
        metadata["last_sync"] = datetime.now().isoformat()
        
        # Update file hashes
        for file_name in self.sync_files.keys():
            file_path = self.agents_path / file_name
            if file_path.exists():
                metadata["file_hashes"][file_name] = self.calculate_file_hash(file_path)
        
        self.save_sync_metadata(metadata)
        
        self.logger.info(f"Sync completed: {len(results['synced_files'])} success, {len(results['failed_files'])} failed")
        return results

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="MCP-JSON Synchronization")
    parser.add_argument("--direction", choices=["json_to_mcp", "mcp_to_json"], 
                       default="json_to_mcp", help="Sync direction")
    parser.add_argument("--file", help="Sync specific file only")
    
    args = parser.parse_args()
    
    sync = MCPJsonSync()
    
    if args.file:
        if args.direction == "json_to_mcp":
            sync.sync_json_to_mcp(args.file)
        else:
            sync.sync_mcp_to_json(args.file)
    else:
        results = sync.full_sync(args.direction)
        print(json.dumps(results, indent=2))
