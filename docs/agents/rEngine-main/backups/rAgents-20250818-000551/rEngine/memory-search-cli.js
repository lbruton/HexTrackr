#!/usr/bin/env node

/**
 * Memory Search CLI - Quick demonstration of search improvements
 * 
 * Usage:
 *   node memory-search-cli.js "your search query"
 *   node memory-search-cli.js --type bug
 *   node memory-search-cli.js --stats
 *   node memory-search-cli.js --suggest "dock"
 */

import QuickMemorySearch from './quick-memory-search.js';

const searcher = new QuickMemorySearch();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    return;
  }

  try {
    console.log('🔧 Initializing memory search index...');
    await searcher.initialize();
    console.log('');

    if (args.includes('--stats')) {
      showStats();
    } else if (args.includes('--types')) {
      showEntityTypes();
    } else if (args.includes('--suggest')) {
      const termIndex = args.indexOf('--suggest');
      const partial = args[termIndex + 1] || '';
      showSuggestions(partial);
    } else if (args.includes('--type')) {
      const typeIndex = args.indexOf('--type');
      const entityType = args[typeIndex + 1];
      searchByType(entityType);
    } else if (args.includes('--related')) {
      const relatedIndex = args.indexOf('--related');
      const entityId = args[relatedIndex + 1];
      showRelated(entityId);
    } else {
      // Regular search
      const query = args.join(' ');
      performSearch(query);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🔍 Memory Search CLI - StackTrackr Agent Memory Search

Usage:
  node memory-search-cli.js "search query"     # Search for entities
  node memory-search-cli.js --type TYPE        # Show entities of specific type
  node memory-search-cli.js --stats            # Show search index statistics
  node memory-search-cli.js --types            # List all entity types
  node memory-search-cli.js --suggest "part"   # Get search term suggestions
  node memory-search-cli.js --related ID       # Show related entities

Examples:
  node memory-search-cli.js "docker permission"
  node memory-search-cli.js --type development_session
  node memory-search-cli.js --suggest "dock"
  node memory-search-cli.js --related stacktrackr_app
`);
}

function showStats() {
  const stats = searcher.getStats();
  
  console.log('📊 Memory Search Index Statistics:');
  console.log('=====================================');
  console.log(`Total Entities:      ${stats.entities}`);
  console.log(`Keywords Indexed:    ${stats.keywords}`);
  console.log(`Relationships:       ${stats.relationships}`);
  console.log(`Entity Types:        ${stats.types}`);
  console.log(`Build Time:          ${stats.buildTime.toFixed(2)}ms`);
  console.log(`Last Updated:        ${stats.lastUpdated}`);
  console.log(`Status:              ${stats.ready ? '✅ Ready' : '❌ Not Ready'}`);
}

function showEntityTypes() {
  const stats = searcher.getStats();
  
  console.log('📋 Available Entity Types:');
  console.log('===========================');
  
  searcher.index.types.forEach((entityIds, type) => {
    console.log(`${type.padEnd(25)} (${entityIds.length} entities)`);
  });
}

function showSuggestions(partial) {
  const suggestions = searcher.suggestTerms(partial, 15);
  
  console.log(`💡 Search Term Suggestions for "${partial}":`);
  console.log('===========================================');
  
  if (suggestions.length === 0) {
    console.log('No suggestions found.');
  } else {
    suggestions.forEach((term, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${term}`);
    });
  }
}

function searchByType(entityType) {
  const entities = searcher.searchByType(entityType);
  
  console.log(`🔍 Entities of type "${entityType}":`);
  console.log('=====================================');
  
  if (entities.length === 0) {
    console.log('No entities found for this type.');
    console.log('\nAvailable types:');
    searcher.index.types.forEach((_, type) => {
      console.log(`  - ${type}`);
    });
  } else {
    entities.forEach((entity, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${entity.name}`);
      console.log(`    ID: ${entity.entity_id}`);
      console.log(`    Status: ${entity.status || 'N/A'}`);
      if (entity.description) {
        const shortDesc = entity.description.length > 80 
          ? entity.description.substring(0, 80) + '...'
          : entity.description;
        console.log(`    Description: ${shortDesc}`);
      }
      console.log('');
    });
  }
}

function showRelated(entityId) {
  const entity = searcher.getEntity(entityId);
  
  if (!entity) {
    console.log(`❌ Entity "${entityId}" not found.`);
    return;
  }
  
  const related = searcher.findRelated(entityId, 2);
  
  console.log(`🔗 Related Entities for "${entity.name}":`);
  console.log('==========================================');
  
  if (related.length === 0) {
    console.log('No related entities found.');
  } else {
    related.forEach((item, index) => {
      const indent = '  '.repeat(item.depth);
      console.log(`${(index + 1).toString().padStart(2)}. ${indent}${item.entity.name} (depth: ${item.depth})`);
      console.log(`    ${indent}Type: ${item.entity.type}`);
      console.log(`    ${indent}Path: ${item.path.join(' → ')}`);
      console.log('');
    });
  }
}

function performSearch(query) {
  console.log(`🔍 Searching for: "${query}"`);
  console.log('='.repeat(50));
  
  const startTime = performance.now();
  const results = searcher.search(query, { maxResults: 10 });
  const searchTime = performance.now() - startTime;
  
  console.log(`Found ${results.totalMatches} matches in ${searchTime.toFixed(2)}ms\n`);
  
  if (results.results.length === 0) {
    console.log('No results found. Try:');
    console.log('- Different search terms');
    console.log('- Using --suggest to find available keywords');
    console.log('- Using --types to see available entity types');
  } else {
    results.results.forEach((result, index) => {
      const entity = result.entity;
      console.log(`${(index + 1).toString().padStart(2)}. ${entity.name} (Score: ${result.score.toFixed(2)})`);
      console.log(`    Type: ${entity.type}`);
      console.log(`    Category: ${entity.category || 'N/A'}`);
      console.log(`    Relevance: ${result.relevance}`);
      
      if (entity.description) {
        const shortDesc = entity.description.length > 100 
          ? entity.description.substring(0, 100) + '...'
          : entity.description;
        console.log(`    Description: ${shortDesc}`);
      }
      
      if (entity.status) {
        console.log(`    Status: ${entity.status}`);
      }
      
      console.log('');
    });
    
    // Show related entities for top result
    if (results.results.length > 0) {
      const topEntity = results.results[0].entity;
      const related = searcher.findRelated(topEntity.entity_id, 1);
      
      if (related.length > 0) {
        console.log(`🔗 Related to "${topEntity.name}":`);
        related.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.entity.name} (${item.entity.type})`);
        });
        console.log('');
      }
    }
  }
}

// Run the CLI
main().catch(console.error);
