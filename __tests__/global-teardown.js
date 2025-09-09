// Global teardown for Playwright tests
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function globalTeardown() {
  console.log('🧹 Starting global teardown for HexTrackr Playwright tests...');
  
  try {
    // In CI environments, we might want to stop containers to free resources
    if (process.env.CI) {
      console.log('🐳 Stopping Docker containers in CI environment...');
      await execAsync('docker-compose down', { timeout: 30000 });
      console.log('✅ Docker containers stopped');
    } else {
      console.log('💡 Leaving Docker containers running for development');
      console.log('   Run "docker-compose down" manually if you want to stop them');
    }
    
    // Clean up any temporary test files if needed
    console.log('🗂️  Cleaning up temporary test artifacts...');
    
    console.log('✅ Global teardown complete');
    
  } catch (error) {
    console.error('⚠️  Global teardown warning:', error.message);
    // Don't throw - teardown issues shouldn't fail the test suite
  }
}

module.exports = globalTeardown;