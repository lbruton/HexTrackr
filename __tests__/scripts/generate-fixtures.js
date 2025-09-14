#!/usr/bin/env node

/**
 * Generate Test Fixtures Script
 * Creates CSV test data files for E2E testing
 */

const DataGenerator = require('../utils/data-generator');
const path = require('path');

async function main() {
  console.log('🔧 Generating test fixtures...\n');
  
  const generator = new DataGenerator();
  
  try {
    // Generate standard fixtures
    const files = await generator.generateStandardFixtures();
    
    console.log('\n✅ Standard fixtures generated successfully!');
    console.log('Files created:');
    Object.entries(files).forEach(([size, path]) => {
      console.log(`  - ${size}: ${path}`);
    });
    
    // Generate vendor-specific samples
    console.log('\n🔧 Generating vendor-specific samples...\n');
    
    const vendorDir = path.join(__dirname, '../fixtures/csv/vendors');
    const vendors = ['tenable', 'cisco', 'qualys'];
    
    for (const vendor of vendors) {
      const vendorPath = path.join(vendorDir, `sample-${vendor}.csv`);
      await generator.saveToFile(vendorPath, 50, vendor);
      console.log(`Generated ${vendor} sample: ${vendorPath}`);
    }
    
    console.log('\n✅ All fixtures generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating fixtures:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };