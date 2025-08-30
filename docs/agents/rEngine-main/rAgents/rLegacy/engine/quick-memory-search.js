/**
 * Quick Memory Search Index - Proof of Concept
 * 
 * Provides fast in-memory search across StackTrackr agent memory
 * without requiring database migration or complex setup.
 * 
 * Usage:
 *   const searcher = new QuickMemorySearch();
 *   await searcher.initialize();
 *   const results = searcher.search("docker permission issues");
 */

import fs from 'fs/promises';
import path from 'path';

class QuickMemorySearch {
  constructor(agentsPath = './agents') {
    this.agentsPath = agentsPath;
    this.index = {
      entities: new Map(),        // entity_id → full entity data
      keywords: new Map(),        // keyword → [entity_ids]
      relationships: new Map(),   // entity_id → [related_entity_ids]
      types: new Map(),          // entity_type → [entity_ids]
      searchableText: new Map(),  // entity_id → concatenated searchable text
      metadata: {
        totalEntities: 0,
        lastUpdated: null,
        buildTime: 0
      }
    };
    this.ready = false;
  }

  /**
   * Initialize the search index from JSON files
   */
  async initialize() {
    const startTime = performance.now();
    
    try {
      console.log('🔍 Building memory search index...');
      
      // Load main memory file
      const memoryPath = path.join(this.agentsPath, 'memory.json');
      const memoryData = JSON.parse(await fs.readFile(memoryPath, 'utf8'));
      
      // Build entity index
      await this.buildEntityIndex(memoryData);
      
      // Build relationship index
      await this.buildRelationshipIndex(memoryData);
      
      // Load additional context files
      await this.loadAdditionalContext();
      
      const buildTime = performance.now() - startTime;
      this.index.metadata.buildTime = buildTime;
      this.index.metadata.lastUpdated = new Date().toISOString();
      this.ready = true;
      
      console.log(`✅ Search index built in ${buildTime.toFixed(2)}ms`);
      console.log(`📊 Indexed ${this.index.metadata.totalEntities} entities`);
      console.log(`🔑 Generated ${this.index.keywords.size} keyword mappings`);
      
    } catch (error) {
      console.error('❌ Failed to build search index:', error);
      throw error;
    }
  }

  /**
   * Build the main entity index from memory.json
   */
  async buildEntityIndex(memoryData) {
    let entityCount = 0;

    // Process all entity categories
    Object.entries(memoryData.entities || {}).forEach(([category, entities]) => {
      Object.entries(entities).forEach(([key, entity]) => {
        if (entity.entity_id) {
          // Store full entity data
          this.index.entities.set(entity.entity_id, {
            ...entity,
            category,
            searchKey: key
          });

          // Index by type
          const entityType = entity.type || 'unknown';
          if (!this.index.types.has(entityType)) {
            this.index.types.set(entityType, []);
          }
          this.index.types.get(entityType).push(entity.entity_id);

          // Build searchable text
          const searchableText = this.buildSearchableText(entity);
          this.index.searchableText.set(entity.entity_id, searchableText);

          // Extract and index keywords
          this.extractKeywords(entity.entity_id, searchableText);

          entityCount++;
        }
      });
    });

    this.index.metadata.totalEntities = entityCount;
  }

  /**
   * Build searchable text from entity data
   */
  buildSearchableText(entity) {
    const textFields = [
      entity.name,
      entity.description,
      entity.status,
      entity.architecture,
      entity.role,
      entity.focus,
      entity.recent_activity,
      ...(entity.key_technologies || []),
      ...(entity.specializations || []),
      ...(entity.achievements || []),
      ...(entity.critical_issues || []),
      ...(entity.strengths || []),
      ...(entity.capabilities || [])
    ].filter(Boolean);

    return textFields.join(' ').toLowerCase();
  }

  /**
   * Extract keywords and build reverse index
   */
  extractKeywords(entityId, searchableText) {
    // Split into words and filter out common words
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should']);
    
    const words = searchableText
      .replace(/[^\w\s]/g, ' ')  // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    words.forEach(word => {
      if (!this.index.keywords.has(word)) {
        this.index.keywords.set(word, []);
      }
      if (!this.index.keywords.get(word).includes(entityId)) {
        this.index.keywords.get(word).push(entityId);
      }
    });
  }

  /**
   * Build relationship index from memory data
   */
  async buildRelationshipIndex(memoryData) {
    const relationships = memoryData.relationships || {};
    
    // Process all relationship categories
    Object.values(relationships).forEach(relationshipGroup => {
      if (Array.isArray(relationshipGroup)) {
        relationshipGroup.forEach(rel => {
          this.addRelationship(rel.from, rel.to);
          // Add bidirectional if specified
          if (rel.bidirectional) {
            this.addRelationship(rel.to, rel.from);
          }
        });
      }
    });
  }

  /**
   * Add a relationship to the index
   */
  addRelationship(fromId, toId) {
    if (!this.index.relationships.has(fromId)) {
      this.index.relationships.set(fromId, []);
    }
    if (!this.index.relationships.get(fromId).includes(toId)) {
      this.index.relationships.get(fromId).push(toId);
    }
  }

  /**
   * Load additional context from other JSON files
   */
  async loadAdditionalContext() {
    const contextFiles = ['agents.json', 'tasks.json', 'decisions.json'];
    
    for (const filename of contextFiles) {
      try {
        const filePath = path.join(this.agentsPath, filename);
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
        
        // Extract searchable entities from additional files
        this.indexAdditionalData(filename, data);
        
      } catch (error) {
        console.warn(`⚠️  Could not load ${filename}:`, error.message);
      }
    }
  }

  /**
   * Index additional data from context files
   */
  indexAdditionalData(filename, data) {
    const virtualEntityId = `${filename}_context`;
    
    // Create searchable text from the file content
    const searchableText = JSON.stringify(data).toLowerCase();
    this.index.searchableText.set(virtualEntityId, searchableText);
    
    // Store as virtual entity
    this.index.entities.set(virtualEntityId, {
      entity_id: virtualEntityId,
      name: filename,
      type: 'context_file',
      description: `Additional context from ${filename}`,
      category: 'system',
      data
    });

    // Extract keywords
    this.extractKeywords(virtualEntityId, searchableText);
  }

  /**
   * Search the index with multiple strategies
   */
  search(query, options = {}) {
    if (!this.ready) {
      throw new Error('Search index not initialized. Call initialize() first.');
    }

    const {
      maxResults = 10,
      includeScore = true,
      entityTypes = null,
      minScore = 0.1
    } = options;

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    
    const scores = new Map();

    // Strategy 1: Exact keyword matches (highest score)
    queryWords.forEach(word => {
      if (this.index.keywords.has(word)) {
        this.index.keywords.get(word).forEach(entityId => {
          scores.set(entityId, (scores.get(entityId) || 0) + 3);
        });
      }
    });

    // Strategy 2: Partial keyword matches
    queryWords.forEach(queryWord => {
      this.index.keywords.forEach((entityIds, keyword) => {
        if (keyword.includes(queryWord) || queryWord.includes(keyword)) {
          entityIds.forEach(entityId => {
            scores.set(entityId, (scores.get(entityId) || 0) + 1);
          });
        }
      });
    });

    // Strategy 3: Full text search in searchable content
    this.index.searchableText.forEach((text, entityId) => {
      const queryMatches = queryWords.filter(word => text.includes(word)).length;
      if (queryMatches > 0) {
        const textScore = queryMatches / queryWords.length;
        scores.set(entityId, (scores.get(entityId) || 0) + textScore);
      }
    });

    // Filter by entity type if specified
    if (entityTypes) {
      const allowedTypes = Array.isArray(entityTypes) ? entityTypes : [entityTypes];
      scores.forEach((score, entityId) => {
        const entity = this.index.entities.get(entityId);
        if (entity && !allowedTypes.includes(entity.type)) {
          scores.delete(entityId);
        }
      });
    }

    // Convert to results array and sort by score
    const results = Array.from(scores.entries())
      .filter(([, score]) => score >= minScore)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxResults)
      .map(([entityId, score]) => {
        const entity = this.index.entities.get(entityId);
        const result = { entity };
        
        if (includeScore) {
          result.score = score;
          result.relevance = this.calculateRelevance(query, entity);
        }
        
        return result;
      });

    return {
      query,
      results,
      totalMatches: scores.size,
      searchTime: performance.now()
    };
  }

  /**
   * Calculate relevance explanation for a search result
   */
  calculateRelevance(query, entity) {
    const reasons = [];
    const queryLower = query.toLowerCase();
    
    if (entity.name && entity.name.toLowerCase().includes(queryLower)) {
      reasons.push('Name match');
    }
    
    if (entity.description && entity.description.toLowerCase().includes(queryLower)) {
      reasons.push('Description match');
    }
    
    if (entity.type && queryLower.includes(entity.type.toLowerCase())) {
      reasons.push('Type match');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Keyword match';
  }

  /**
   * Find related entities through relationship traversal
   */
  findRelated(entityId, maxDepth = 2, visited = new Set()) {
    if (visited.has(entityId) || maxDepth <= 0) {
      return [];
    }
    
    visited.add(entityId);
    const related = [];
    
    // Direct relationships
    if (this.index.relationships.has(entityId)) {
      this.index.relationships.get(entityId).forEach(relatedId => {
        if (this.index.entities.has(relatedId)) {
          related.push({
            entity: this.index.entities.get(relatedId),
            depth: 1,
            path: [entityId, relatedId]
          });
          
          // Recursive relationships (if depth allows)
          if (maxDepth > 1) {
            const deeper = this.findRelated(relatedId, maxDepth - 1, new Set(visited));
            related.push(...deeper.map(item => ({
              ...item,
              depth: item.depth + 1,
              path: [entityId, ...item.path]
            })));
          }
        }
      });
    }
    
    return related;
  }

  /**
   * Get search statistics
   */
  getStats() {
    return {
      entities: this.index.entities.size,
      keywords: this.index.keywords.size,
      relationships: this.index.relationships.size,
      types: this.index.types.size,
      buildTime: this.index.metadata.buildTime,
      lastUpdated: this.index.metadata.lastUpdated,
      ready: this.ready
    };
  }

  /**
   * Search by entity type
   */
  searchByType(entityType) {
    return this.index.types.get(entityType)?.map(id => this.index.entities.get(id)) || [];
  }

  /**
   * Get entity by ID
   */
  getEntity(entityId) {
    return this.index.entities.get(entityId);
  }

  /**
   * Suggest search terms based on indexed keywords
   */
  suggestTerms(partial, maxSuggestions = 10) {
    const partialLower = partial.toLowerCase();
    return Array.from(this.index.keywords.keys())
      .filter(keyword => keyword.startsWith(partialLower))
      .sort()
      .slice(0, maxSuggestions);
  }
}

export default QuickMemorySearch;

// Example usage and testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const searcher = new QuickMemorySearch();
  
  await searcher.initialize();
  
  console.log('\n🎯 Search Examples:');
  
  // Example searches
  const searches = [
    'docker permission issues',
    'GPT collaboration',
    'bug filter chip',
    'serverless architecture',
    'performance optimization'
  ];
  
  searches.forEach(query => {
    console.log(`\n🔍 Query: "${query}"`);
    const results = searcher.search(query, { maxResults: 3 });
    
    results.results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.entity.name} (score: ${result.score.toFixed(2)})`);
      console.log(`     Type: ${result.entity.type}`);
      console.log(`     Relevance: ${result.relevance}`);
    });
  });
  
  console.log('\n📊 Search Index Statistics:');
  console.log(searcher.getStats());
}
