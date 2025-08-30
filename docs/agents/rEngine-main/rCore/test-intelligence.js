#!/usr/bin/env node

/**
 * Test script for rEngineMCP Advanced Intelligence System
 * Tests agent database loading and intelligent search capabilities
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple test class to mimic rEngineMCP intelligence methods
class IntelligenceTest {
  constructor() {
    this.functionMatrix = null;
    this.errorPatterns = null;
    this.projectMemory = null;
    this.currentTasks = null;
    this.agentDatabase = null;
  }

  async loadJSON(filePath) {
    try {
      if (await fs.pathExists(filePath)) {
        return await fs.readJson(filePath);
      }
      return null;
    } catch (error) {
      console.error(`Failed to load ${filePath}:`, error.message);
      return null;
    }
  }

  async loadAgentIntelligence() {
    console.log('🧠 Testing rEngineMCP Agent Intelligence System...\n');
    
    // Fix: Use rMemory/rAgentMemories directory (avoid confusion with rAgents)
    const agentsPath = path.join(__dirname, '..', 'rMemory', 'rAgentMemories');
    console.log(`📁 Agent memories path: ${agentsPath}\n`);
    
    try {
      // Load core agent databases
      console.log('📊 Loading agent databases...');
      this.functionMatrix = await this.loadJSON(path.join(agentsPath, 'functions.json'));
      this.errorPatterns = await this.loadJSON(path.join(agentsPath, 'errors.json'));
      this.projectMemory = await this.loadJSON(path.join(agentsPath, 'memory.json'));
      this.currentTasks = await this.loadJSON(path.join(agentsPath, 'tasks.json'));
      this.agentDatabase = await this.loadJSON(path.join(agentsPath, 'github_copilot_memories.json'));
      
      console.log('\n✅ INTELLIGENCE LOADING RESULTS:');
      console.log(`📋 Functions: ${this.functionMatrix ? '✅ Loaded' : '❌ Not Found'}`);
      if (this.functionMatrix) {
        const categories = Object.keys(this.functionMatrix.function_categories || {});
        console.log(`   - Categories: ${categories.length} (${categories.join(', ')})`);
      }
      
      console.log(`🐛 Errors: ${this.errorPatterns ? '✅ Loaded' : '❌ Not Found'}`);
      if (this.errorPatterns) {
        const bugs = Object.keys(this.errorPatterns.bugs || {});
        console.log(`   - Known Issues: ${bugs.length}`);
      }
      
      console.log(`🧠 Memory: ${this.projectMemory ? '✅ Loaded' : '❌ Not Found'}`);
      if (this.projectMemory) {
        const entities = Object.keys(this.projectMemory.entities || {});
        console.log(`   - Entities: ${entities.length} (${entities.join(', ')})`);
      }
      
      console.log(`📝 Tasks: ${this.currentTasks ? '✅ Loaded' : '❌ Not Found'}`);
      if (this.currentTasks) {
        const projects = Object.keys(this.currentTasks.active_projects || {});
        console.log(`   - Active Projects: ${projects.length} (${projects.join(', ')})`);
      }
      
      console.log(`🤖 Agent DB: ${this.agentDatabase ? '✅ Loaded' : '❌ Not Found'}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Agent intelligence loading failed:', error.message);
      return false;
    }
  }

  searchFunctionDatabase(query) {
    if (!this.functionMatrix) return [];
    
    const results = [];
    const searchTerms = query.toLowerCase().split(/\s+/);
    
    // Search through all function categories
    Object.entries(this.functionMatrix.function_categories || {}).forEach(([category, data]) => {
      data.functions?.forEach(func => {
        const searchText = `${func.name} ${func.description} ${func.file} ${category}`.toLowerCase();
        
        if (searchTerms.some(term => searchText.includes(term))) {
          results.push({
            name: func.name,
            file: func.file,
            category: category,
            description: func.description,
            signature: func.signature,
            line: func.line_number || 'unknown'
          });
        }
      });
    });
    
    return results.slice(0, 5); // Top 5 results
  }

  async testIntelligentSearch() {
    console.log('\n🔍 TESTING INTELLIGENT SEARCH...\n');
    
    const testQueries = [
      'search function',
      'filter data',
      'API integration',
      'chart display',
      'error handling'
    ];
    
    for (const query of testQueries) {
      console.log(`🔎 Query: "${query}"`);
      const results = this.searchFunctionDatabase(query);
      
      if (results.length > 0) {
        console.log(`   ✅ Found ${results.length} relevant functions:`);
        results.forEach(r => {
          console.log(`      • ${r.name}() in ${r.file} - ${r.description}`);
        });
      } else {
        console.log('   ❌ No results found');
      }
      console.log('');
    }
  }
}

// Run the test
async function runTest() {
  const test = new IntelligenceTest();
  
  const loaded = await test.loadAgentIntelligence();
  
  if (loaded) {
    await test.testIntelligentSearch();
    console.log('🎉 rEngineMCP Intelligence System Test Complete!\n');
  } else {
    console.log('💥 Intelligence system not ready - check agent database files\n');
  }
}

runTest().catch(console.error);
