#!/usr/bin/env node

/**
 * Cisco CSV Generator Usage Example
 * Demonstrates how to use the CiscoGenerator for E2E testing
 */

const CiscoGenerator = require('./cisco');
const fs = require('fs').promises;
const path = require('path');

async function generateExamples() {
  console.log('🔧 Generating Cisco CSV examples...\n');
  
  const generator = new CiscoGenerator();
  const outputDir = path.join(__dirname, '../../fixtures/csv/cisco-samples');
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  // Generate different scenario examples
  const scenarios = [
    { name: 'critical_infrastructure', count: 25, description: 'Critical infrastructure with high-severity vulnerabilities' },
    { name: 'enterprise_mixed', count: 50, description: 'Mixed enterprise environment' },
    { name: 'development_environment', count: 30, description: 'Development environment with lower-risk vulnerabilities' }
  ];
  
  for (const scenario of scenarios) {
    const fileName = `cisco-${scenario.name}-${scenario.count}.csv`;
    const filePath = path.join(outputDir, fileName);
    
    console.log(`📝 Generating ${scenario.description}...`);
    const csv = generator.generateScenario(scenario.name, scenario.count);
    await fs.writeFile(filePath, csv, 'utf8');
    
    console.log(`   ✅ Created: ${fileName} (${scenario.count} records)`);
  }
  
  // Generate a comprehensive sample for testing
  console.log('\n📝 Generating comprehensive test sample...');
  const testSample = generator.generateSample(100);
  const testPath = path.join(outputDir, 'cisco-test-sample-100.csv');
  await fs.writeFile(testPath, testSample, 'utf8');
  console.log('   ✅ Created: cisco-test-sample-100.csv (100 records)');
  
  console.log('\n✅ All Cisco CSV examples generated successfully!');
  console.log(`📁 Output directory: ${outputDir}`);
}

// Usage demonstration
async function demonstrateUsage() {
  console.log('\n=== Cisco Generator Usage Examples ===\n');
  
  const generator = new CiscoGenerator();
  
  // Example 1: Basic sample generation
  console.log('1. Basic Sample Generation:');
  console.log('   const generator = new CiscoGenerator();');
  console.log('   const csv = generator.generateSample(10);');
  
  // Example 2: Scenario-based generation  
  console.log('\n2. Scenario-based Generation:');
  console.log('   const criticalCsv = generator.generateScenario("critical_infrastructure", 100);');
  
  // Example 3: File output
  console.log('\n3. Save to File:');
  console.log('   await generator.saveCiscoCSVToFile("./cisco-test.csv", 1000);');
  
  // Show sample output
  console.log('\n4. Sample Output (5 records):');
  const sample = generator.generateSample(5);
  const lines = sample.split('\n');
  lines.forEach((line, index) => {
    if (index === 0) {
      console.log(`   Headers: ${line}`);
    } else if (index <= 3) {
      console.log(`   Record ${index}: ${line.substring(0, 80)}...`);
    }
  });
}

// Run examples if executed directly
if (require.main === module) {
  (async () => {
    await generateExamples();
    await demonstrateUsage();
  })().catch(console.error);
}

module.exports = {
  generateExamples,
  demonstrateUsage
};