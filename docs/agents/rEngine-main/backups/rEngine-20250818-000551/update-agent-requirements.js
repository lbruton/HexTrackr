// Agent Memory Requirements Enforcer
// Updates all agent memory files with COPILOT_INSTRUCTIONS requirements

import fs from 'fs';
import path from 'path';

const AGENT_MEMORY_DIR = '/Volumes/DATA/GitHub/rEngine/rMemory/rAgentMemories';

// Core requirements from COPILOT_INSTRUCTIONS.md
const CRITICAL_REQUIREMENTS = {
  "mandatory_startup_protocols": {
    "gpt_agents": {
      "command": "node gpt-mandatory-startup.js",
      "location": "/Volumes/DATA/GitHub/rEngine/rEngine",
      "description": "MANDATORY for GPT agents - handles git backup, memory protocols, session logging, MCP integration",
      "failure_consequence": "BROKEN HANDOFFS & LOST WORK"
    },
    "all_agents": {
      "step_1": "Check COPILOT_INSTRUCTIONS.md",
      "step_2": "Check AGENT.md", 
      "step_3": "Follow rAgents/unified-workflow.md",
      "step_4": "Memory recall and status check"
    }
  },
  "memory_system_paths": {
    "tasks": "rMemory/rAgentMemories/tasks.json",
    "agents": "rMemory/rAgentMemories/agents.json", 
    "decisions": "rMemory/rAgentMemories/decisions.json",
    "functions": "rMemory/rAgentMemories/functions.json",
    "errors": "rMemory/rAgentMemories/errors.json",
    "memory": "rMemory/rAgentMemories/memory.json",
    "preferences": "rMemory/rAgentMemories/preferences.json",
    "styles": "rMemory/rAgentMemories/styles.json",
    "patterns": "rMemory/rAgentMemories/patterns.json"
  },
  "protocol_enforcement": {
    "before_work": [
      "Git checkpoint: git add -A && git commit -m 'Checkpoint before [task]'",
      "Protocol check: node rEngine/protocol-enforcer.js file_modification", 
      "Check tasks: Read rMemory/rAgentMemories/tasks.json",
      "Memory check: Review agent memory and shared context"
    ],
    "during_work": [
      "Follow rAgents/unified-workflow.md protocols",
      "Update memory files with discoveries", 
      "Sync to MCP using agent memory system",
      "Document changes in appropriate JSON files",
      "Never write outside StackTrackr directory"
    ],
    "after_completion": [
      "Final commit with complete description",
      "Update documentation (decisions, functions, memory)",
      "Update agent memory with lessons learned", 
      "Run protocol compliance check"
    ]
  },
  "mcp_integration": {
    "server_check": "ALWAYS verify Smart Scribe MCP server is running first",
    "critical_learning": "MCP server not running causes silent failures in memory sync",
    "startup_command": "./start-smart-scribe.sh",
    "health_check": "ps aux | grep smart-scribe"
  },
  "scribe_console": {
    "command": "node scribe-console.js",
    "location": "/Volumes/DATA/GitHub/rEngine/rEngine",
    "features": ["Status bar", "Pink verbose logs", "Memory statistics", "Auto-refresh"],
    "purpose": "Real-time monitoring of system health and activity"
  }
};

const AGENT_TYPES = [
  'github_copilot_memories.json',
  'claude-memory.json', 
  'gpt4_memories.json',
  'gpt4o_memories.json',
  'gemini_pro_memories.json'
];

async function updateAgentMemory(agentFile) {
  const filePath = path.join(AGENT_MEMORY_DIR, agentFile);
  
  try {
    let agentData = {};
    
    // Read existing file if it exists
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      agentData = JSON.parse(content);
    }
    
    // Ensure agent has critical requirements
    agentData.critical_requirements = CRITICAL_REQUIREMENTS;
    agentData.compliance_version = "COPILOT_INSTRUCTIONS_v1.0";
    agentData.last_requirements_update = new Date().toISOString();
    
    // Update metadata if exists
    if (agentData.metadata) {
      agentData.metadata.has_critical_requirements = true;
      agentData.metadata.copilot_instructions_compliant = true;
    }
    
    // Ensure correct memory paths (fix old agents/ paths)
    if (agentData.shared_memory_index) {
      Object.keys(agentData.shared_memory_index).forEach(key => {
        if (agentData.shared_memory_index[key].file && 
            agentData.shared_memory_index[key].file.startsWith('agents/')) {
          agentData.shared_memory_index[key].file = 
            agentData.shared_memory_index[key].file.replace('agents/', 'rMemory/rAgentMemories/');
          agentData.shared_memory_index[key].path_updated = new Date().toISOString();
        }
      });
    }
    
    // Write updated file
    fs.writeFileSync(filePath, JSON.stringify(agentData, null, 2));
    console.log(`✅ Updated ${agentFile} with critical requirements`);
    
  } catch (error) {
    console.log(`❌ Error updating ${agentFile}:`, error.message);
  }
}

// Update all agent memory files
console.log('🚀 Updating all agent memory files with COPILOT_INSTRUCTIONS requirements...');

for (const agentFile of AGENT_TYPES) {
  await updateAgentMemory(agentFile);
}

// Also update persistent memory with requirements
const persistentMemoryPath = '/Volumes/DATA/GitHub/rEngine/rEngine/persistent-memory.json';
try {
  const persistentData = JSON.parse(fs.readFileSync(persistentMemoryPath, 'utf8'));
  
  persistentData.agent_requirements = CRITICAL_REQUIREMENTS;
  persistentData.metadata.copilot_instructions_enforced = true;
  persistentData.metadata.requirements_last_updated = new Date().toISOString();
  
  fs.writeFileSync(persistentMemoryPath, JSON.stringify(persistentData, null, 2));
  console.log('✅ Updated persistent-memory.json with requirements');
} catch (error) {
  console.log('❌ Error updating persistent memory:', error.message);
}

console.log('🎯 All agent memories now contain COPILOT_INSTRUCTIONS requirements!');
