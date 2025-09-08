// Global setup for Playwright tests
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function globalSetup() {
  console.log('🚀 Starting global setup for HexTrackr Playwright tests...');
  
  try {
    // Ensure Docker containers are running
    console.log('📦 Checking Docker container status...');
    const { stdout } = await execAsync('docker-compose ps --services --filter "status=running"');
    
    if (!stdout.trim()) {
      console.log('🔄 Starting Docker containers...');
      await execAsync('docker-compose up -d', { timeout: 60000 });
      
      // Wait for services to be ready
      console.log('⏳ Waiting for services to start...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log('✅ Docker containers already running');
    }
    
    // Optional: Run database initialization if needed
    console.log('🗄️ Ensuring database is initialized...');
    try {
      await execAsync('npm run init-db', { timeout: 10000 });
      console.log('✅ Database initialization complete');
    } catch (error) {
      console.log('ℹ️  Database already initialized or initialization not needed');
    }
    
    console.log('✅ Global setup complete - ready for testing');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error.message);
    throw error;
  }
}

module.exports = globalSetup;