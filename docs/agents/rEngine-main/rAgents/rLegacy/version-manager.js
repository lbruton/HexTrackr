#!/usr/bin/env node

/**
 * rAgents Version Manager
 * 
 * Manages versioning for the agentic layer separately from StackTrackr app
 * Tracks agent capabilities, memory system improvements, and plugin features
 */

import fs from 'fs/promises';
import path from 'path';

class RAgentsVersionManager {
  constructor() {
    this.agentsPath = process.cwd();
    this.packagePath = path.join(this.agentsPath, 'package.json');
    this.versionHistoryPath = path.join(this.agentsPath, 'version-history.json');
    this.changelogPath = path.join(this.agentsPath, 'CHANGELOG.md');
  }

  async getCurrentVersion() {
    try {
      const packageData = JSON.parse(await fs.readFile(this.packagePath, 'utf8'));
      return packageData.version;
    } catch (error) {
      console.error('Could not read package.json:', error);
      return '0.0.0';
    }
  }

  async getVersionHistory() {
    try {
      const historyData = await fs.readFile(this.versionHistoryPath, 'utf8');
      return JSON.parse(historyData);
    } catch (error) {
      // Initialize empty history if file doesn't exist
      return {
        releases: [],
        current_capabilities: {},
        migration_log: []
      };
    }
  }

  async saveVersionHistory(history) {
    await fs.writeFile(this.versionHistoryPath, JSON.stringify(history, null, 2));
  }

  async bumpVersion(type = 'patch', description = '') {
    const currentVersion = await this.getCurrentVersion();
    const newVersion = this.incrementVersion(currentVersion, type);
    
    // Update package.json
    const packageData = JSON.parse(await fs.readFile(this.packagePath, 'utf8'));
    packageData.version = newVersion;
    await fs.writeFile(this.packagePath, JSON.stringify(packageData, null, 2));

    // Record in version history
    await this.recordRelease(newVersion, type, description);

    console.log(`🚀 rAgents version bumped: ${currentVersion} → ${newVersion}`);
    return newVersion;
  }

  incrementVersion(version, type) {
    const [major, minor, patch] = version.split('.').map(Number);
    
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  async recordRelease(version, type, description) {
    const history = await this.getVersionHistory();
    const capabilities = await this.detectCurrentCapabilities();
    
    const release = {
      version,
      type,
      date: new Date().toISOString(),
      description: description || this.generateAutoDescription(type),
      capabilities: capabilities,
      metrics: await this.gatherMetrics(),
      changes: await this.detectChanges(history.releases[0]?.capabilities || {})
    };

    history.releases.unshift(release);
    history.current_capabilities = capabilities;
    
    await this.saveVersionHistory(history);
    await this.updateChangelog(release);
  }

  async detectCurrentCapabilities() {
    const capabilities = {
      memory_system: {},
      search_engine: {},
      agent_coordination: {},
      workflow_automation: {},
      export_collaboration: {},
      development_tools: {}
    };

    try {
      // Detect memory system capabilities
      const memoryStats = await this.getMemoryStats();
      capabilities.memory_system = {
        total_entities: memoryStats.entities,
        memory_files: memoryStats.files,
        backup_system: await this.hasBackupSystem(),
        mcp_integration: await this.hasMCPIntegration(),
        structured_format: true
      };

      // Detect search engine capabilities
      const searchEngineExists = await this.fileExists('engine/quick-memory-search.js');
      capabilities.search_engine = {
        in_memory_index: searchEngineExists,
        cli_interface: await this.fileExists('engine/memory-search-cli.js'),
        keyword_indexing: searchEngineExists,
        relationship_traversal: searchEngineExists,
        performance_optimized: searchEngineExists
      };

      // Detect agent coordination
      capabilities.agent_coordination = {
        agent_profiles: await this.hasAgentProfiles(),
        capabilities_matrix: await this.hasCapabilitiesMatrix(),
        task_assignment: await this.hasTaskAssignment(),
        workflow_protocols: await this.fileExists('unified-workflow.md')
      };

      // Detect workflow automation
      capabilities.workflow_automation = {
        backup_scripts: await this.hasBackupScripts(),
        sync_automation: await this.fileExists('scripts/sync.js'),
        export_workflows: await this.hasExportWorkflows(),
        task_tracking: await this.fileExists('tasks.json')
      };

      // Detect export collaboration
      capabilities.export_collaboration = {
        chatgpt_export: await this.hasChatGPTExport(),
        memory_change_bundles: await this.hasMemoryChangeBundles(),
        cross_platform_sharing: await this.hasExportWorkflows(),
        return_processing: await this.hasReturnProcessing()
      };

      // Detect development tools
      capabilities.development_tools = {
        serverless_plugin: await this.hasServerlessPlugin(),
        docker_integration: await this.hasDockerIntegration(),
        testing_framework: await this.hasTestingFramework(),
        debug_utilities: await this.fileExists('debug/')
      };

    } catch (error) {
      console.warn('Error detecting capabilities:', error);
    }

    return capabilities;
  }

  async gatherMetrics() {
    try {
      const memoryStats = await this.getMemoryStats();
      const fileStats = await this.getFileStats();
      
      return {
        memory_entities: memoryStats.entities,
        memory_files: memoryStats.files,
        total_files: fileStats.totalFiles,
        json_files: fileStats.jsonFiles,
        javascript_files: fileStats.jsFiles,
        markdown_files: fileStats.mdFiles,
        last_activity: new Date().toISOString()
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async getMemoryStats() {
    try {
      const memoryData = JSON.parse(await fs.readFile('memory.json', 'utf8'));
      let entityCount = 0;
      
      Object.values(memoryData.entities || {}).forEach(category => {
        entityCount += Object.keys(category).length;
      });

      const files = await fs.readdir('.');
      const jsonFiles = files.filter(f => f.endsWith('.json')).length;

      return { entities: entityCount, files: jsonFiles };
    } catch (error) {
      return { entities: 0, files: 0 };
    }
  }

  async getFileStats() {
    const files = await fs.readdir('.', { recursive: true });
    
    return {
      totalFiles: files.length,
      jsonFiles: files.filter(f => f.endsWith('.json')).length,
      jsFiles: files.filter(f => f.endsWith('.js')).length,
      mdFiles: files.filter(f => f.endsWith('.md')).length
    };
  }

  async detectChanges(previousCapabilities) {
    const currentCapabilities = await this.detectCurrentCapabilities();
    const changes = [];

    // Compare capabilities
    Object.keys(currentCapabilities).forEach(category => {
      const current = currentCapabilities[category];
      const previous = previousCapabilities[category] || {};

      Object.keys(current).forEach(capability => {
        if (current[capability] && !previous[capability]) {
          changes.push(`+ Added ${category}.${capability}`);
        } else if (!current[capability] && previous[capability]) {
          changes.push(`- Removed ${category}.${capability}`);
        }
      });
    });

    return changes;
  }

  generateAutoDescription(type) {
    const descriptions = {
      major: 'Major architecture changes and new core capabilities',
      minor: 'New features and significant improvements',
      patch: 'Bug fixes, optimizations, and minor improvements'
    };
    
    return descriptions[type] || 'Updates and improvements';
  }

  async updateChangelog(release) {
    let changelog = '';
    
    try {
      changelog = await fs.readFile(this.changelogPath, 'utf8');
    } catch (error) {
      changelog = '# rAgents Changelog\n\nAll notable changes to the rAgents agentic system will be documented in this file.\n\n';
    }

    const date = new Date(release.date).toISOString().split('T')[0];
    const entry = `## [${release.version}] - ${date}\n\n`;
    
    let changeDetails = `### ${release.type.charAt(0).toUpperCase() + release.type.slice(1)} Release\n\n`;
    changeDetails += `${release.description}\n\n`;
    
    if (release.changes.length > 0) {
      changeDetails += '### Changes\n\n';
      release.changes.forEach(change => {
        changeDetails += `- ${change}\n`;
      });
      changeDetails += '\n';
    }

    changeDetails += '### Capabilities\n\n';
    Object.entries(release.capabilities).forEach(([category, caps]) => {
      const enabledCaps = Object.entries(caps).filter(([, enabled]) => enabled);
      if (enabledCaps.length > 0) {
        changeDetails += `- **${category.replace(/_/g, ' ')}**: ${enabledCaps.map(([cap]) => cap.replace(/_/g, ' ')).join(', ')}\n`;
      }
    });
    
    changeDetails += '\n';

    // Insert new entry after the header
    const lines = changelog.split('\n');
    const insertIndex = lines.findIndex(line => line.startsWith('##')) || lines.length;
    lines.splice(insertIndex, 0, entry + changeDetails);
    
    await fs.writeFile(this.changelogPath, lines.join('\n'));
  }

  // Helper methods for capability detection
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async hasBackupSystem() {
    return await this.fileExists('backups/') && (await fs.readdir('backups/')).length > 0;
  }

  async hasMCPIntegration() {
    return await this.fileExists('mcp_available.flag');
  }

  async hasAgentProfiles() {
    try {
      const agentsData = JSON.parse(await fs.readFile('agents.json', 'utf8'));
      return !!(agentsData.agent_profiles && Object.keys(agentsData.agent_profiles).length > 0);
    } catch {
      return false;
    }
  }

  async hasCapabilitiesMatrix() {
    try {
      const agentsData = JSON.parse(await fs.readFile('agents.json', 'utf8'));
      return !!(agentsData.capabilities_matrix);
    } catch {
      return false;
    }
  }

  async hasTaskAssignment() {
    return await this.fileExists('tasks.json');
  }

  async hasBackupScripts() {
    return await this.fileExists('scripts/') || (await fs.readdir('.', { recursive: true })).some(f => f.includes('backup'));
  }

  async hasExportWorkflows() {
    return await this.fileExists('scripts/package_for_gpt.sh') || await this.fileExists('scripts/goomba.sh');
  }

  async hasChatGPTExport() {
    try {
      const files = await fs.readdir('.', { recursive: true });
      return files.some(f => f.includes('chatgpt') || f.includes('gpt'));
    } catch {
      return false;
    }
  }

  async hasMemoryChangeBundles() {
    return await this.fileExists('memory/bundles/') || await this.fileExists('zip_workflow.json');
  }

  async hasReturnProcessing() {
    return await this.fileExists('scripts/process_gpt_import.sh');
  }

  async hasServerlessPlugin() {
    return await this.fileExists('lab/serverless-plugin/');
  }

  async hasDockerIntegration() {
    try {
      const files = await fs.readdir('.', { recursive: true });
      return files.some(f => f.includes('docker') || f.includes('Docker'));
    } catch {
      return false;
    }
  }

  async hasTestingFramework() {
    return await this.fileExists('test/') || await this.fileExists('engine/memory-search-cli.js');
  }

  async showStatus() {
    const version = await this.getCurrentVersion();
    const capabilities = await this.detectCurrentCapabilities();
    const metrics = await this.gatherMetrics();

    console.log(`\n🤖 rAgents Status Report`);
    console.log(`========================`);
    console.log(`Version: ${version}`);
    console.log(`Date: ${new Date().toISOString().split('T')[0]}`);
    console.log(`\n📊 Metrics:`);
    console.log(`  Memory Entities: ${metrics.memory_entities}`);
    console.log(`  Memory Files: ${metrics.memory_files}`);
    console.log(`  Total Files: ${metrics.total_files}`);
    
    console.log(`\n🎯 Active Capabilities:`);
    Object.entries(capabilities).forEach(([category, caps]) => {
      const enabledCaps = Object.entries(caps).filter(([, enabled]) => enabled);
      if (enabledCaps.length > 0) {
        console.log(`  ${category.replace(/_/g, ' ')}: ${enabledCaps.length}/${Object.keys(caps).length} features`);
      }
    });
    
    console.log('');
  }
}

// CLI Interface
async function main() {
  const versionManager = new RAgentsVersionManager();
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--status')) {
    await versionManager.showStatus();
    return;
  }

  const command = args[0];
  
  switch (command) {
    case 'bump':
      const type = args[1] || 'patch';
      const description = args.slice(2).join(' ');
      await versionManager.bumpVersion(type, description);
      break;
      
    case 'show':
      const version = await versionManager.getCurrentVersion();
      console.log(version);
      break;
      
    case 'history':
      const history = await versionManager.getVersionHistory();
      console.log('\n📚 Version History:');
      history.releases.slice(0, 5).forEach(release => {
        console.log(`  ${release.version} (${release.date.split('T')[0]}) - ${release.description}`);
      });
      break;
      
    case 'capabilities':
      const capabilities = await versionManager.detectCurrentCapabilities();
      console.log('\n🎯 Current Capabilities:');
      console.log(JSON.stringify(capabilities, null, 2));
      break;
      
    default:
      console.log(`
🤖 rAgents Version Manager

Usage:
  node version-manager.js [command]

Commands:
  (none)           Show status report
  bump [type]      Bump version (patch/minor/major)
  show             Show current version
  history          Show version history
  capabilities     Show current capabilities
  --status         Show detailed status

Examples:
  node version-manager.js bump patch "Added search optimization"
  node version-manager.js bump minor "New serverless plugin"
  node version-manager.js bump major "Complete architecture overhaul"
`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default RAgentsVersionManager;
