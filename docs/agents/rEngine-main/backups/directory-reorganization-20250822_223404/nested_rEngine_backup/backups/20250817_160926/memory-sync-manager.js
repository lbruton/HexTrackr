#!/usr/bin/env node

/**
 * Memory Sync Manager for rEngine MCP
 * Manages bidirectional sync between persistent JSON and MCP Memory
 * Ensures memory resilience against MCP crashes
 */

import fs from 'fs-extra';
import path from 'path';

class MemorySyncManager {
  constructor() {
    this.baseDir = '/Volumes/DATA/GitHub/rEngine';
    this.persistentFile = path.join(process.cwd(), 'persistent-memory.json');
    this.backupFile = path.join(process.cwd(), 'persistent-memory.backup.json');
    this.isReadOnlyToMCP = true; // rEngine reads from MCP, writes to JSON
  }

  /**
   * Load memory from persistent JSON file
   */
  async loadPersistentMemory() {
    try {
      if (await fs.pathExists(this.persistentFile)) {
        const data = await fs.readJson(this.persistentFile);
        console.log('✅ Loaded persistent memory from JSON');
        return data;
      } else {
        console.log('⚠️  No persistent memory file found, creating new one');
        return this.createEmptyMemory();
      }
    } catch (error) {
      console.error('❌ Error loading persistent memory:', error);
      return this.createEmptyMemory();
    }
  }

  /**
   * Save memory to persistent JSON file with backup
   */
  async savePersistentMemory(memoryData) {
    try {
      // Create backup first
      if (await fs.pathExists(this.persistentFile)) {
        await fs.copy(this.persistentFile, this.backupFile);
      }

      // Update metadata
      memoryData.metadata.lastSync = new Date().toISOString();
      
      // Save to primary file
      await fs.writeJson(this.persistentFile, memoryData, { spaces: 2 });
      console.log('✅ Saved persistent memory to JSON');
      return true;
    } catch (error) {
      console.error('❌ Error saving persistent memory:', error);
      return false;
    }
  }

  /**
   * Create empty memory structure
   */
  createEmptyMemory() {
    return {
      metadata: {
        version: "1.0.0",
        created: new Date().toISOString(),
        lastSync: null,
        purpose: "Persistent memory store for rEngine MCP server",
        syncToMCP: true
      },
      entities: {},
      relations: {},
      conversations: {},
      system_state: {
        health_check: {
          last_check: null,
          status: "initialized", 
          issues: []
        },
        sync_status: {
          last_mcp_sync: null,
          sync_failures: 0,
          auto_sync_enabled: true
        }
      },
      project_context: {
        stacktrackr: {
          type: "precious_metals_inventory",
          status: "active",
          last_interaction: null
        },
        rengine: {
          type: "mcp_server_platform",
          status: "active", 
          last_interaction: null
        }
      }
    };
  }

  /**
   * Add entity to persistent memory (primary write operation)
   */
  async addEntity(entityName, entityData) {
    const memory = await this.loadPersistentMemory();
    
    memory.entities[entityName] = {
      ...entityData,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    await this.savePersistentMemory(memory);
    
    // Attempt to sync to MCP (best effort, non-blocking)
    await this.syncToMCP(memory);
    
    return memory.entities[entityName];
  }

  /**
   * Add conversation to persistent memory
   */
  async addConversation(conversationId, conversationData) {
    const memory = await this.loadPersistentMemory();
    
    memory.conversations[conversationId] = {
      ...conversationData,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    await this.savePersistentMemory(memory);
    await this.syncToMCP(memory);
    
    return memory.conversations[conversationId];
  }

  /**
   * Sync to MCP Memory (best effort, non-critical)
   */
  async syncToMCP(memoryData) {
    try {
      // This would use MCP client to push data to MCP Memory
      // For now, just log the attempt
      console.log('🔄 Attempting sync to MCP Memory...');
      
      memoryData.system_state.sync_status.last_mcp_sync = new Date().toISOString();
      memoryData.system_state.sync_status.sync_failures = 0;
      
      console.log('✅ MCP sync completed (simulated)');
      return true;
    } catch (error) {
      console.error('⚠️  MCP sync failed (non-critical):', error);
      memoryData.system_state.sync_status.sync_failures += 1;
      return false;
    }
  }

  /**
   * Pre-commit sync for Git integration
   * Ensures memory is current before version control
   */
  async preCommitSync() {
    console.log('🚀 Pre-commit MCP memory sync initiated...');
    
    try {
      const memory = await this.loadPersistentMemory();
      
      // Update memory state to indicate pre-commit sync
      memory.system_state.git_integration = {
        last_pre_commit_sync: new Date().toISOString(),
        sync_with_commits: true,
        auto_sync_enabled: true
      };
      
      // Save updated memory
      await this.savePersistentMemory(memory);
      
      // Attempt MCP sync
      const syncSuccess = await this.syncToMCP(memory);
      
      if (syncSuccess) {
        console.log('✅ Pre-commit MCP sync completed successfully');
        return true;
      } else {
        console.log('⚠️  Pre-commit MCP sync failed (non-blocking)');
        return true; // Don't block commits on MCP sync failure
      }
    } catch (error) {
      console.error('❌ Pre-commit sync error:', error);
      return true; // Don't block commits on errors
    }
  }

  /**
   * Health check for memory system
   */
  async healthCheck() {
    const memory = await this.loadPersistentMemory();
    
    const health = {
      persistentFile: await fs.pathExists(this.persistentFile),
      backupFile: await fs.pathExists(this.backupFile),
      entityCount: Object.keys(memory.entities || {}).length,
      conversationCount: Object.keys(memory.conversations || {}).length,
      lastSync: memory.metadata.lastSync,
      syncFailures: memory.system_state.sync_status.sync_failures
    };

    memory.system_state.health_check = {
      last_check: new Date().toISOString(),
      status: health.persistentFile ? "healthy" : "degraded",
      issues: health.persistentFile ? [] : ["persistent_file_missing"]
    };

    await this.savePersistentMemory(memory);
    return health;
  }

  /**
   * Merge Smart Scribe knowledge into persistent memory
   */
  async mergeSmartScribeData() {
    try {
      const scribeExportPath = path.join(this.baseDir, 'rEngine', 'scribe-mcp-export.json');
      
      if (!fs.existsSync(scribeExportPath)) {
        console.log('ℹ️  No Smart Scribe export found, skipping merge');
        return false;
      }

      const scribeData = await fs.readJson(scribeExportPath);
      console.log(`🤖 Merging Smart Scribe data: ${scribeData.entities.length} entities`);

      const persistentData = await this.loadPersistentMemory();
      let mergedCount = 0;

      // Merge entities from Smart Scribe
      for (const entity of scribeData.entities) {
        const entityKey = `scribe_${entity.name}_${Date.now()}`;
        
        persistentData.entities[entityKey] = {
          name: entity.name,
          entityType: entity.entityType,
          observations: entity.observations,
          source: 'smart-scribe',
          created: new Date().toISOString(),
          merged_at: new Date().toISOString()
        };
        mergedCount++;
      }

      // Update metadata
      persistentData.metadata.lastScribeMerge = new Date().toISOString();
      persistentData.metadata.scribeMergeCount = (persistentData.metadata.scribeMergeCount || 0) + 1;
      persistentData.metadata.lastSync = new Date().toISOString();

      // Save merged data
      await this.savePersistentMemory(persistentData);

      // Archive the processed export
      const archivePath = path.join(this.baseDir, 'rEngine', `scribe-export-processed-${Date.now()}.json`);
      await fs.move(scribeExportPath, archivePath);

      console.log(`✅ Smart Scribe merge complete: ${mergedCount} entities processed`);
      return true;

    } catch (error) {
      console.error('❌ Smart Scribe merge failed:', error);
      return false;
    }
  }

  /**
   * Pre-commit sync that includes Smart Scribe data
   */
  async preCommitSync() {
    try {
      console.log('🔄 Pre-commit sync starting...');
      
      // First, merge any Smart Scribe data
      await this.mergeSmartScribeData();
      
      // Then perform normal health check and sync
      const health = await this.healthCheck();
      
      if (!health.persistentFile) {
        console.error('❌ Persistent memory file missing');
        return false;
      }
      
      console.log('✅ Pre-commit sync completed');
      return true;
      
    } catch (error) {
      console.error('❌ Pre-commit sync failed:', error);
      return false;
    }
  }
}

// Export for use in other modules
export default MemorySyncManager;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new MemorySyncManager();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'health':
      const health = await manager.healthCheck();
      console.log('🏥 Memory System Health:', JSON.stringify(health, null, 2));
      break;
      
    case 'backup':
      const memory = await manager.loadPersistentMemory();
      await manager.savePersistentMemory(memory);
      console.log('💾 Memory backed up successfully');
      break;
      
    case 'pre-commit':
      const success = await manager.preCommitSync();
      process.exit(success ? 0 : 1);
      break;
      
    case 'merge-scribe':
      const merged = await manager.mergeSmartScribeData();
      console.log(merged ? '✅ Smart Scribe data merged' : '⚠️  No data to merge');
      break;
      
    default:
      console.log('Usage: node memory-sync-manager.js [health|backup|pre-commit|merge-scribe]');
  }
}
